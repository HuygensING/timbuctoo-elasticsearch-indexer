import { Entity, FormatterConfig } from './schema';
import { valueToString } from './getValue';
import { ITEMS } from './global';

export interface TypedUri {
    uri: string;
    type: string;
}
export type uriOrString = string | TypedUri;
export type pathResult = uriOrString[] | uriOrString | null;

/** prop == null means that the path is being constructed */
export type ReferencePath = Array<[string, string | null]>;

const ES_PATH_SPLIT = '.';

const DEFAULT_FORMATTERS: FormatterConfig = [
    {
        type: 'http://timbuctoo.huygens.knaw.nl/static/v5/datatype/person-name',
        name: 'PERSON_NAMES'
    }
];

/** Create path that only holds values for elasticsearch querying */
export function pathToEsValueString(path: string) {
    return `${parsePath(path)
        .map(x => x[1])
        .join(ES_PATH_SPLIT)}.raw`;
}


/** Create path that only holds values for elasticsearch querying */
export function pathToEsFullTextString(path: string) {
  return `${parsePath(path)
      .map(x => x[1])
      .join(ES_PATH_SPLIT)}.fulltext`;
}

/** Create a graphql query that retrieves all the values of the paths */
export function pathsToGraphQlQuery(paths: ReferencePath[], dataSetId: string, indent: string): string {
    // paths.map(serializePath).forEach(x => console.log(x));
    const map = componentPathsToMap(paths);
    const qry = mapToQuery(map, dataSetId, indent);
    // console.log(qry);
    return qry.substr(indent.length); // skip first indent so you can paste the query easily in a literal
}

/** Turn path array into a string representation */
export function serializePath(pathArray: ReferencePath): string {
    return JSON.stringify(pathArray);
}

/** Turn string representation into a path array */
export function parsePath(pathStr: string): ReferencePath {
    try {
        return JSON.parse(pathStr);
    } catch (e) {
        console.error('Error when parsing path', pathStr);
        throw e;
    }
}

/** Turn string representation into a path array */
export function parseSummaryProperty(collectionId: string, propNameOrPath: string): ReferencePath {
    return JSON.parse(propNameOrPath);
}

/** Grab path values from a javascript object */
export function walkPath(pathStr: string | undefined | null, formatters: FormatterConfig, entity: Entity): pathResult {
    if (!pathStr) {
        return null;
    }
    const splittedPath = parsePath(pathStr);
    const validationResult = validatePath(splittedPath);
    if (validationResult != null) {
        console.warn('Path is ' + validationResult + '!', pathStr);
        return null;
    }
    const result = walkPathStep(splittedPath, formatters, entity);
    return result;
}

/** Check if path is finished (all valid for a given graphql schema */
export function validatePath(path: ReferencePath): 'UNFINISHED' | 'INVALID' | undefined {
    if (path.some(x => x[1] === null)) {
        return 'UNFINISHED';
    } else {
        return undefined;
    }
}

function walkPathStep(path: ReferencePath, formatters: FormatterConfig, entity: any): pathResult {
    const propName = path[0][1];
    if (path.length === 1 && propName === 'value') {
        // getting the value
        return valueToString(entity, formatters.concat(DEFAULT_FORMATTERS));
    } else if (path.length === 1 && propName === 'uri') {
        // getting the uri (unnamespaced uri is special)
        return {
            uri: entity.uri,
            type: entity.__typename
        };
    } else {
        const sub = entity[propName!];
        if (sub === null) {
            return null;
        } else if (sub === undefined) {
            console.error(
                path,
                'was used in walkPath, but apparently not used to generate the graphql query (the prop was not present instead of null)'
            );
            return null;
        } else if (Array.isArray(sub)) {
            let retVal: uriOrString[] = [];
            for (const item of sub) {
                const subResult = walkPathStep(path.slice(1), formatters, item);
                if (subResult) {
                    if (Array.isArray(subResult)) {
                        retVal = retVal.concat(subResult);
                    } else {
                        retVal.push(subResult);
                    }
                }
            }
            return retVal;
        } else {
            if (path.length > 1) {
                return walkPathStep(path.slice(1), formatters, sub);
            } else {
                return sub;
            }
        }
    }
}

// // intermediate object
type PropContainer = { [key: string]: PropContainer | boolean };
// {
//   "Location::label": { "Value::value": true }
//   "Place::founding_date": { "Value::value": true }
//   "Place::_inverse_birthplace": {
//     "Person::name": { "Value::value": true }
//     "Person::age": { "Value::value": true }
//   }
// }

function componentPathsToMap(paths: ReferencePath[]): PropContainer {
    const result: PropContainer = {};
    for (const path of paths) {
        pathToMap(path, result);
    }
    return result;
}

function pathToMap(path: ReferencePath, cur: PropContainer) {
    const validationResult = validatePath(path);
    if (validationResult != null) {
        console.warn('Path is ' + validationResult + '!', path);
        return;
    }
    for (const [idx, [collection, segment]] of path.entries()) {
        const key = collection + '::' + segment;
        if (idx === path.length - 1) {
            if (typeof cur[key] === 'object') {
                // one path specified this as a scalar, another as an object. That's not valid graphql!
                // ignore it here
                throw new Error('A valid path should not be invalid ' + path);
            } else {
                cur[key] = true;
            }
        } else {
            if (!cur.hasOwnProperty(key)) {
                cur[key] = {};
            }
            const sub = cur[key];
            if (typeof sub === 'boolean') {
                // one path specified this as a scalar, another as an object. That's not valid graphql! ignore it here
                throw new Error('A valid path should not be invalid ' + path);
            } else {
                cur = sub;
            }
        }
    }
}

// // resulting graphql query
// ... on Location {
//   frob { ... on Value { value } }
// }
// ... on Place {
//   foo { ... on Value { value } }
//   bar {
//     ... on Person {
//       name { ... on Value { value } }
//       age { ... on Value { value } }
//     }
//   }
// }

function mapToQuery(map: PropContainer, dataSetId: string, prefix: string): string {
    const intermediate: { [key: string]: string[] } = {};
    for (const key of Object.keys(map).sort()) {
        const [typeName, propName] = key.split('::');
        if (!intermediate[typeName]) {
            intermediate[typeName] = [];
        }
        const sub = map[key];
        if (typeof sub === 'boolean') {
            if (typeName === 'Value' && propName === 'value') {
                // always request the value type as well
                intermediate[typeName].push('value type');
            } else {
                intermediate[typeName].push(propName);
            }
        } else {
            intermediate[typeName].push(propName + ' {');
            intermediate[typeName].push(mapToQuery(sub, dataSetId, prefix + '  '));
            intermediate[typeName].push('}');
        }
    }
    let result: string[] = [];
    for (const typeName of Object.keys(intermediate)) {
        if (typeName === ITEMS) {
            result = result.concat(intermediate[typeName]);
        } else {
            if (typeName === 'Value' || typeName === 'Entity') {
                result.push('... on ' + typeName + ' {');
            } else {
                result.push('... on ' + dataSetId + '_' + typeName + ' {');
            }
            result = result.concat(intermediate[typeName].map(x => '  ' + prefix + x));
            result.push(prefix + '}');
        }
    }

    return result.map(line => prefix + line).join('\n');
}
