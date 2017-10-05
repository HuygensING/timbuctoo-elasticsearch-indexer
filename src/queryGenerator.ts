export function buildQueryForCollection(dataSetId: string, collectionKey: string, indexConfig: { [key: string]: any }, cursor?: string): string {
  const collectionIndexConfig = getCollectionIndexConfig(indexConfig, collectionKey);
  
  if (!collectionIndexConfig && !collectionIndexConfig.indexConfig) {
    console.log("unsupported search config: ", JSON.stringify(indexConfig));
    return "";
  }

  const query = buildQuery(collectionIndexConfig.indexConfig, collectionKey);

  if (cursor != null) {
    return "{ dataSets { " + dataSetId + " { " + collectionKey + " (cursor: \"" + cursor + "\") { items {" + query + " } nextCursor } } } }";
  }

  return "{ dataSets { " + dataSetId + " { " + collectionKey + " { items { " + query + " } nextCursor } } } }";
}

function buildQuery(collectionIndexConfig: { facet: [{ paths: string[] }], fullText: { fields: [{ path: string }] } }, collection: string): string {
    const mappedQuery: MappedQuery = {};

  for (const facet of collectionIndexConfig.facet) {
    for (const path of facet.paths) {
      mapQuery(path.split("."), mappedQuery);
    }
  }

  return buildQueryFromMap(mappedQuery);
}

function mapQuery(splittedPath: string[], mappedQuery: MappedQuery) {
  if (splittedPath.length <= 0) {
    return;
  }
  const path = splittedPath.shift();

  if (path) {
    if (splittedPath.length > 1) {
      if (Object.getOwnPropertyNames(mappedQuery).indexOf(path) == -1) {
        mappedQuery[path] = {};
      }
      const child = mappedQuery[path];
      if (!(child instanceof String)) {
        mapQuery(splittedPath, child);
      }
    } else if (Object.getOwnPropertyNames(mappedQuery).indexOf(path) == -1) {
      const value = splittedPath.shift();
      if (value) {
        mappedQuery[path] = value;
      }
    }
  }
}

function buildQueryFromMap(mappedQuery: { [key: string]: any }): string {
  let query = "";

  const keys = Object.keys(mappedQuery);

  for (const key in mappedQuery) {
    query += key;
    const val = mappedQuery[key];
    if (val instanceof Object) {
      query += " { " + buildQueryFromMap(val).trim() + " } ";
    }
    else {
      query += " { " + val + " } ";
    }

  }
  return query.trim();
}

function getCollectionIndexConfig(indexConfig: any, collectionKey: string): any {
  for (const collection of indexConfig.data.dataSetMetadata.collectionList.items) {
    if (collection.collectionListId === collectionKey) {
      return collection;
    }
  }

  return null;
}

class MappedQuery {
  [key: string]: MappedQuery | string
}