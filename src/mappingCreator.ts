export class MappingCreator {
  public createMapping(typeConfig: { [key: string]: any }): {} {
    var mapping = {};

    for (const key of Object.getOwnPropertyNames(typeConfig)) {
      this.addKey(typeConfig, new PropertyKey(key), mapping);
    }

    return { "properties": mapping };
  }

  private addKey(config: { [key: string]: any }, parent: PropertyKey, mapping: { [key: string]: any }) {
    const prop = config[parent.getName()];
    if (prop instanceof Object) {
      for (const key of Object.getOwnPropertyNames(prop)) {
        if (key === "facetType") {
          mapping[parent.getFullName()] = {
            "type": "text",
            "fielddata": true // You only want this on facets not on full text fields
          }; // TODO support multiple types
        } else {
          this.addKey(prop, new PropertyKey(key, parent), mapping);
        }
      }
    }
  }
}

class PropertyKey {
  private name: string;
  private parent?: PropertyKey;

  constructor(name: string, parent?: PropertyKey) {
    this.name = name;
    this.parent = parent;
  }

  public getFullName(): string {
    return this.parent ? this.parent.getFullName() + "." + this.name : this.name;
  }

  public getName(): string {
    return this.name;
  }
}
