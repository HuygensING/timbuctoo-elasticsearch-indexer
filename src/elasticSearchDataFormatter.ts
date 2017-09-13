export class ElasticSearchDataFormatter {
  public formatData(data: { [key: string]: any }, config: { [key: string]: any }): {} {
    for (const key of Object.getOwnPropertyNames(data)) {
      if (!key.startsWith("@") && data[key] != null) {
        const type = getProperty(data[key], "type");
        if (type != null) {
          switch (type) {
            default:
              formatDefault(data, key);
          }
        }
      }
    }

    return data;
  }
}

function formatDefault(data: { [key: string]: any }, fieldName: string): void {
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