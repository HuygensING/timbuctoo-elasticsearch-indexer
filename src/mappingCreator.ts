export class MappingCreator {
  public createMapping(typeConfig: { [key: string]: any }): {} {
    var mapping: any = {};

    for (const facet of typeConfig.facet) {
      for (const path of facet.paths)
        mapping[path + ".raw"] = {
          "type": this.getFacetType(facet.type),
        };
    }

    for (const fullText of typeConfig.fullText) {
      for (const field of fullText.fields) {
        mapping[field.path + ".fulltext"] = { "type": "text" };
      }
    }

    return { "properties": mapping };
  }
  private getFacetType(type: string): string {
    if (type === "DateRange") {
      return "date";
    }
    return "keyword";
  }
}
