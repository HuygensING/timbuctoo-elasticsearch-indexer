import * as edtf from "edtf";
import { parsePath } from "./propertyPath/index";

export class ElasticSearchDataFormatter {
  public formatData(data: { [key: string]: any }, config: { [key: string]: any }): {} {
    return this.format(data, this.formatConfig(config.indexConfig));
  }

  private format(data: { [key: string]: any }, config: FieldConfigs, path?: string) {
    const formattedData: any = {};
    for (const key of Object.getOwnPropertyNames(data)) {
      const newPath = path ? path + "." + key : "" + key;
      const property = data[key]
      if (property != null && property instanceof Object) {
        const propertyNames = Object.getOwnPropertyNames(property);
        if (propertyNames.length === 2 && propertyNames.indexOf("type") > -1 && propertyNames.indexOf("value") > -1) {
          const value = this.formatField(property, config, newPath);
          if (value) {
            formattedData[key] = this.formatField(property, config, newPath);
          }
        }
        else if (property instanceof Array) {
          const value = property.map(item => {
            if (Object.getOwnPropertyNames(item).indexOf("type") >= 0) {
              return this.formatField(item, config, newPath);
            }
            else {
              return this.format(item, config, newPath);
            }
          });
          if (value) {
            formattedData[key] = value;
          }
        }
        else {
          const value = this.format(property, config, newPath);
          if (value) {
            formattedData[key] = value;
          }
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
          fieldConfigs[this.formatPath(path)] = { isFacet: true, facetType: facet.type, isFullText: false };
        }
      }
    }

    const facetKeys = Object.getOwnPropertyNames(fieldConfigs);
    if (config.fullText) {
      for (const fullText of config.fullText) {
        for (const field of fullText.fields) {
          const path = this.formatPath(field.path);
          if (facetKeys.indexOf(path) > -1) {
            fieldConfigs[path].isFullText = true;
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
    return parsePath(path).map(x => x[1]).join(".");
  }

  private formatField(field: { type: string, value: string }, config: FieldConfigs, path: string): {} | undefined {
    let value: string | string[] | null;
    const fieldConfig = config[path + ".value"];
    switch (field.type) {
      case "http://timbuctoo.huygens.knaw.nl/datatypes/person-name":
        value = formatPersonName(field, fieldConfig, path);
        break;
      case "https://www.loc.gov/standards/datetime/pre-submission.html":
      case "http://timbuctoo.huygens.knaw.nl/datatypes/datable":
      case "http://schema.org/Date":
        value = formatDatable(field, fieldConfig, path);
        break;
      default:
        value = formatDefault(field, fieldConfig, path);
    }

    if (value) {
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
    return undefined;
  }
}

interface FieldConfigs {
  [key: string]: FieldConfig;
}

interface FieldConfig {
  isFacet: boolean,
  facetType?: string,
  isFullText: boolean
}

function formatDefault(field: { type: string, value: string }, config: FieldConfig | null, path: string): string | string[] | null {
  if (config && config.facetType && config.facetType === "DateRange") {
    console.error("'" + field.type + "' is not a valid DateRange");
    return null;
  }
  return field.value == null ? "¯\_(ツ)_/¯" : field.value;
}

function formatDatable(field: { type: string, value: string }, config: FieldConfig | null, path: string): string | string[] {
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

function formatPersonName(field: { type: string, value: string }, config: FieldConfig | null, path: string): string | string[] {
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