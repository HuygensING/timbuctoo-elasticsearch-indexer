import { pathToEsValueString, pathToEsFullTextString } from "./propertyPath/index";

export class MappingCreator {
  public createMapping(typeConfig: { [key: string]: any }): {} {
    var mapping: any = {};

    for (const facet of typeConfig.indexConfig.facet) {
      for (const path of facet.paths)
        mapping[pathToEsValueString(path)] = {
          "type": this.getFacetType(facet.type),
        };
    }

    for (const fullText of typeConfig.indexConfig.fullText) {
      for (const field of fullText.fields) {
        mapping[pathToEsFullTextString(field.path)] = { "type": "text" };
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
