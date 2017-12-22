


import { pathsToGraphQlQuery, parsePath } from "./propertyPath/index";

export function buildQueryForCollection(dataSetId: string, collectionIndexConfig: any, cursor?: string): string {

  if (!collectionIndexConfig && !collectionIndexConfig["indexConfig"]) {
    console.log("unsupported search config: ", JSON.stringify(collectionIndexConfig));
    return "";
  }
  
  let query = ""; 
  try{
    query = buildQuery(collectionIndexConfig.indexConfig, dataSetId);
  } catch (ex) {
    console.error("Unsupported indexconfig: ", JSON.stringify(collectionIndexConfig["indexConfig"]));
    console.log(ex)
  }

  if (query == "") {
    return "";
  }

  if (cursor != null) {
    return "{ dataSets { " + dataSetId + " { " + collectionIndexConfig.collectionListId + " (cursor: \"" + cursor + "\") { items { uri " + query + " } nextCursor } } } }";
  }

  return "{ dataSets { " + dataSetId + " { " + collectionIndexConfig.collectionListId + " { items { uri " + query + " } nextCursor } } } }";
}

function buildQuery(collectionIndexConfig: { facet: [{ paths: string[] }], fullText: [{ fields: [{ path: string }] }] }, dataSetId: string): string {

  const facetPaths = collectionIndexConfig.facet.map(facet => facet.paths).reduce((prev, cur) => prev.concat(cur), []).map(parsePath);
  const fullTextPaths = collectionIndexConfig.fullText.map(ft => ft.fields.map(field => field.path)).reduce((prev, cur) => prev.concat(cur), []).map(parsePath);
  const paths = facetPaths.concat(fullTextPaths);

  return pathsToGraphQlQuery(paths, dataSetId, "");
}

