export class MappingCreator {
  public createMapping(typeConfig: { [key: string]: any }): {} {
    var mapping: any = {};

    for (const facet of typeConfig.facet) {
      for (const path of facet.paths)
        mapping[path] = {
          "type": this.getFacetType(facet.type),
        };
    }

    return { "properties": mapping };
  }
  private getFacetType(type: string): string {
    return "keyword";
  }
}
