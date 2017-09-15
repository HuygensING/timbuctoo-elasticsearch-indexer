export function buildQueryForCollection(collectionKey: string, searchConfig: { [key: string]: any }, cursor?: string): string {
  const facets = searchConfig[collectionKey].facets;
  if (cursor != null) {
    return "{ " + collectionKey + " (cursor: \"" + cursor + "\") {" + buildQuery(facets) + " nextCursor } }";
  }

  return "{ " + collectionKey + " { " + buildQuery(facets) + "nextCursor } }";
}

function buildQuery(searchConfig: { [key: string]: any }): string {
  const config = searchConfig;
  let facet = searchConfig
  const mappedQuery: MappedQuery = {};

  do {
    console.log("facet: ", JSON.stringify(facet))
    mapQuery(facet.path.split("."), mappedQuery);
    facet = facet.next;
  }
  while (facet.next);

  let query = buildQueryFromMap(mappedQuery);

  return query;
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

function buildQueryFromMap(mappedQuery: { [key: string]: any }): string {
  let query = "";

  for (const key in mappedQuery) {
    query += key;
    const val = mappedQuery[key];
    if (val instanceof Object) {
      query += " { " + buildQuery(val) + " } ";
    }
    else {
      query += " " + key + " ";
    }

  }
  return query
}

interface Facet {
  path: string,
  type: string,
  next: Facet
}

class MappedQuery {
  [key: string]: MappedQuery | string
}