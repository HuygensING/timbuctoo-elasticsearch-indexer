export function buildQueryForCollection(collectionKey: string, searchConfig: { [key: string]: any }, cursor?: string): string {
  const facets = searchConfig[collectionKey].facets;

  const query = buildQuery(facets, collectionKey);

  if (cursor != null) {
    return "{ " + collectionKey + " (cursor: \"" + cursor + "\") {" + query + " nextCursor } }";
  }

  return "{ " + collectionKey + " { " + query + "nextCursor } }";
}

function buildQuery(searchConfig: { [key: string]: any }, collection: string): string {
  const config = searchConfig;
  let facet: { [key: string]: any } | undefined = searchConfig;
  const mappedQuery: MappedQuery = {};

  while (facet) {
    mapQuery(facet.path.split("."), mappedQuery);
    facet = facet.next;
  }

  return buildQueryFromMap(mappedQuery, collection);
}

function mapQuery(splittedPath: [string], mappedQuery: MappedQuery) {
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

function buildQueryFromMap(mappedQuery: { [key: string]: any }, collection: string): string {
  let query = "";
  
  const keys = Object.keys(mappedQuery);

  if(keys.length == 1 && keys.indexOf(collection) > -1) {
    return buildQueryFromMap(mappedQuery[collection], collection);
  }

  for (const key in mappedQuery) {
    query += key;
    const val = mappedQuery[key];
    if (val instanceof Object) {
      query += " { " + buildQueryFromMap(val, collection).trim() + " } ";
    }
    else {
      query += " { " + val + " } ";
    }

  }
  return query
}

class MappedQuery {
  [key: string]: MappedQuery | string
}