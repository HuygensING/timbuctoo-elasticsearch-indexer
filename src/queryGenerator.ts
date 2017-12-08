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

  const facetPaths = [].concat.apply([], collectionIndexConfig.facet.map(facet => facet.paths));
  const fullTextPaths = [].concat.apply([], collectionIndexConfig.fullText.map(ft => ft.fields.map(field => field.path)));
  const paths = facetPaths.concat(fullTextPaths);
  const map = componentPathsToMap(paths, dataSetId);

  return mapToQuery(map, '');
}

export const ITEMS: string = 'items';
const VALUE: string = 'value';
function componentPathsToMap(paths: string[], dataSetId: string): { [key: string]: {} | boolean } {
  const result:any = {};
  for (const path of paths) {
      let cur = result;

      const segments = splitPath(path) as string[][];

      for (const [idx, [collection, segment]] of segments.entries()) {
          if (!segment) {
              continue;
          }

          const curSegment = idx + 1 === segments.length ? true : {};

          if (!collection || segment === ITEMS) {
              if (!cur.hasOwnProperty(segment)) {
                  cur[segment] = curSegment;
              }

              cur = cur[segment];
         } else {
              const collectionFragment = segment === VALUE ? `...on Value` : `...on ${dataSetId}_${collection}`;

              cur[collectionFragment] = {
                  ...cur[collectionFragment],
                  [segment]: curSegment
              };

              cur = cur[collectionFragment][segment];
          }
      }
  }
  return result;
}


const PATH_SPLIT = '.';
const PATH_SEGMENT_SPLIT = '||';
type ReferencePath = string[][];
const splitPath = (pathStr: string, onlyKey: boolean = false): (string | string[])[] => {
    return pathStr
        .split(PATH_SPLIT)
        .filter(segment => segment.indexOf(PATH_SEGMENT_SPLIT) > -1)
        .map(segment => (onlyKey ? segment.split(PATH_SEGMENT_SPLIT)[1] : segment.split(PATH_SEGMENT_SPLIT)));
};

const URI: string = 'uri';
function mapToQuery(map: any, prefix: string): string {
    const result: string[] = [];
    for (const key in map) {
        if (typeof map[key] === 'boolean') {
            if (key === URI) {
                result.push(key);
            } else {
                result.push(` ${VALUE} type `);
            }
        } else {
            const subQuery = mapToQuery(map[key], prefix + '  ');
            result.push(key + ' {' + subQuery + prefix + '} ');
        }
    }
    return result.map(line => prefix + line).join('');
}
