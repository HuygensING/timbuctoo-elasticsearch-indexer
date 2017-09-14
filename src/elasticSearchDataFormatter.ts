export class ElasticSearchDataFormatter {
  public formatData(data: { [key: string]: any }, config: { [key: string]: any }): {} {
    JSON.stringify(data);
    for (const key of Object.getOwnPropertyNames(data)) {
      const property = data[key]
      if (!key.startsWith("@") && property != null) {
        if (Object.getOwnPropertyNames(property).indexOf("type") >= 0) {
          this.formatField(property);
        }
        else if (property instanceof Array) {
          for (const item of property) {
            if (Object.getOwnPropertyNames(item).indexOf("type") >= 0) {
              this.formatField(item);
            }
            else {
              this.formatData(item, config);
            }
          }
        }
        else {
          this.formatData(property, config);
        }
      }
    }

    return data;
  }

  private formatField(field: { [key: string]: any }) {
    switch (field.type) {
      case "http://timbuctoo.huygens.knaw.nl/datatypes/person-name":
        formatPersonName(field)
        break
      default:
        formatDefault(field);
    }
  }
}

function formatDefault(field: { [key: string]: any }): void {
}

function formatPersonName(field: { [key: string]: any }): void {
  const value = field.value;
  console.log("personname: ", value);
  if (value != null) {
    const parsedValue = JSON.parse(value);
    if (Object.getOwnPropertyNames(parsedValue).indexOf("components") >= 0 && parsedValue.components instanceof Array) {
      field.value = removeTei(parsedValue.components);
    } else {
      field.value = "¯\_(ツ)_/¯"; // default value for unparsable person names
    }
  }
}

function removeTei(components: [{ type: string, value: string }]): string[] {

  return components.map(component => component.value);
}

function getProperty(data: { [key: string]: any }, propName: string): any {
  for (const key of Object.getOwnPropertyNames(data)) {
    if (key === propName) {
      return data[key];
    }

    if (data[key] instanceof Object) {
      const prop = getProperty(data[key], propName);
      if (prop !== null) {
        return prop;
      }
    }
  }
  return null;
}