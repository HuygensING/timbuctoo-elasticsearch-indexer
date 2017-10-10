import * as edtf from "edtf";

export class ElasticSearchDataFormatter {
  public formatData(data: { [key: string]: any }, config: { [key: string]: any }): {} {
    for (const key of Object.getOwnPropertyNames(data)) {
      const property = data[key]
      if (property != null && property instanceof Object) {
        const propertyNames = Object.getOwnPropertyNames(property);
        if (propertyNames.length === 2 && propertyNames.indexOf("type") > -1 && propertyNames.indexOf("value") > -1) {
          data[key] = this.formatField(property);
        }
        else if (property instanceof Array) {

          data[key] = property.map(item => {
            if (Object.getOwnPropertyNames(item).indexOf("type") >= 0) {
              return this.formatField(item);
            }
            else {
              return this.formatData(item, config);
            }
          });
        }
        else {
          data[key] = this.formatData(property, config);
        }
      }
    }
    return data;
  }

  private formatField(field: { type: string, value: string }): {} {
    switch (field.type) {
      case "http://timbuctoo.huygens.knaw.nl/datatypes/person-name":
        return formatPersonName(field);
      case "http://timbuctoo.huygens.knaw.nl/datatypes/datable":
        return formatDatable(field);
      default:
        return formatDefault(field);
    }
  }
}

function formatDefault(field: { type: string, value: string }): {} {
  const val: string = field.value == null ? "¯\_(ツ)_/¯" : field.value;

  return { "value": { "raw": val } };
}

function formatDatable(field: { type: string, value: string }): {} {
  try {
    const edtfDate = edtf(field.value);
    const start = new Date(edtfDate.min).toISOString();
    const end = new Date(edtfDate.max).toISOString();
    return { "value": { "raw": new Array<string>(start, end) } };
  } catch (e) {
    console.log("value not supported: ", field.value);

    return { "value": { "raw": ["4242-12-31T23:59:59.999Z"] } }; // default value for unparsable edtf
  }
}

function formatPersonName(field: { type: string, value: string }): {} {
  const value = field.value;
  if (value != null) {
    const parsedValue = JSON.parse(value);
    if (Object.getOwnPropertyNames(parsedValue).indexOf("components") >= 0 && parsedValue.components instanceof Array) {
      return { "value": { "raw": parsedValue.components.map((component: { type: string, value: string }) => component.value) } };
    }
  }
  return { "value": { "raw": "¯\_(ツ)_/¯" } }; // default value for unparsable person names
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