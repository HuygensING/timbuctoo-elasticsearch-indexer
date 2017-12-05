import * as edtf from "edtf";

export class ElasticSearchDataFormatter {
  public formatData(data: { [key: string]: any }, config: { [key: string]: any }): {} {
    return this.format(data, this.formatConfig(config.indexConfig));
  }

  private format(data: { [key: string]: any }, config: { [key: string]: { isFacet: boolean, isFullText: boolean } }, path?: string) {
    const formattedData: any = {};
    for (const key of Object.getOwnPropertyNames(data)) {
      const newPath = path ? path + "." + key : "" + key;
      const property = data[key]
      if (property != null && property instanceof Object) {
        const propertyNames = Object.getOwnPropertyNames(property);
        if (propertyNames.length === 2 && propertyNames.indexOf("type") > -1 && propertyNames.indexOf("value") > -1) {
          formattedData[key] = this.formatField(property, config, newPath);
        }
        else if (property instanceof Array) {
          formattedData[key] = property.map(item => {
            if (Object.getOwnPropertyNames(item).indexOf("type") >= 0) {
              return this.formatField(item, config, newPath);
            }
            else {
              return this.format(item, config, newPath);
            }
          });
        }
        else {
          formattedData[key] = this.format(property, config, newPath);
        }
      }
      else { // metadata fields have no type, so cannot be formatted
        formattedData[key] = property;
      }
    }
    return formattedData;
  }

  private formatConfig(config: { [key: string]: any }): FieldConfigs {
    const fieldConfigs: FieldConfigs = {};
    if (config.facet) {
      for (const facet of config.facet) {
        for (const path of facet.paths) {
          fieldConfigs[this.formatPath(path)] = { isFacet: true, isFullText: false };
        }
      }
    }

    const facetKeys = Object.getOwnPropertyNames(fieldConfigs);
    if (config.fullText) {
      for (const fullText of config.fullText) {
        for (const field of fullText.fields) {
          const path = this.formatPath(field.path);
          if (facetKeys.indexOf(path) > -1) {
            fieldConfigs[path] = { isFacet: true, isFullText: true };
          }
          else {
            fieldConfigs[path] = { isFacet: false, isFullText: true };
          }
        }
      }
    }


    return fieldConfigs;
  }

  private formatPath(path: string): string {
    return path.replace(/[a-zA-Z_]+\|\|/g, "");
  }

  private formatField(field: { type: string, value: string }, config: FieldConfigs, path: string): {} {
    let value: string | string[];
    switch (field.type) {
      case "http://timbuctoo.huygens.knaw.nl/datatypes/person-name":
        value = formatPersonName(field, config, path);
        break;
      case "http://timbuctoo.huygens.knaw.nl/datatypes/datable":
        value = formatDatable(field, config, path);
        break;
      default:
        value = formatDefault(field, config, path);
    }
    const fieldConfig = config[path + ".value"];
    if (fieldConfig) {
      if (fieldConfig.isFacet && fieldConfig.isFullText) {
        return { "value": { "raw": value, "fulltext": value } };
      } else if (fieldConfig.isFacet) {
        return { "value": { "raw": value } };
      } else if (fieldConfig.isFullText) {
        return { "value": { "fulltext": value } };
      }
    }

    return { "value": value };
  }
}

interface FieldConfigs {
  [key: string]: {
    isFacet: boolean, isFullText: boolean
  }
}

function formatDefault(field: { type: string, value: string }, config: { [key: string]: any }, path: string): string | string[] {
  const val: string = field.value == null ? "¯\_(ツ)_/¯" : field.value;

  return val;
}

function formatDatable(field: { type: string, value: string }, config: { [key: string]: any }, path: string): string | string[] {
  try {
    const edtfDate = edtf(field.value);
    const start = new Date(edtfDate.min).toISOString();
    const end = new Date(edtfDate.max).toISOString();
    return new Array<string>(start, end);
  } catch (e) {
    console.log("value not supported: ", field.value);

    return ["4242-12-31T23:59:59.999Z"]; // default value for unparsable edtf
  }
}

function formatPersonName(field: { type: string, value: string }, config: { [key: string]: any }, path: string): string | string[] {
  const value = field.value;
  if (value != null) {
    const parsedValue = JSON.parse(value);
    if (Object.getOwnPropertyNames(parsedValue).indexOf("components") >= 0 && parsedValue.components instanceof Array) {
      return parsedValue.components.map((component: { type: string, value: string }) => component.value);
    }
  }
  return "¯\_(ツ)_/¯"; // default value for unparsable person names
}

export function getPossibleFacetTypes(): { [key: string]: { possibleFacetTypes: [string], fullTextPossible: boolean } } {
  return {
    "http://timbuctoo.huygens.knaw.nl/datatypes/person-name": {
      "possibleFacetTypes": ["MultiSelect"],
      "fullTextPossible": true
    },
    "http://timbuctoo.huygens.knaw.nl/datatypes/datable": {
      "possibleFacetTypes": ["DateRange"],
      "fullTextPossible": true
    },
    "*": {
      "possibleFacetTypes": ["MultiSelect", "Hierarchical"],
      "fullTextPossible": true
    }
  }
}