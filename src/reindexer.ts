import fetch from "node-fetch";
import * as searchConfig from "../searchConfigExample.json";
import { ElasticSearchUpdater } from "./elasticSearchUpdater";

export class Reindexer {
  private elasticSearchUpdater: ElasticSearchUpdater;
  constructor(esUri: string) {
    this.elasticSearchUpdater = new ElasticSearchUpdater(esUri);
  }
  public async reindex(request: Request): Promise<string> {
    let val = "";

    await this.elasticSearchUpdater.remapIndex(request.dataSetUri, searchConfig).then(async () => {
      for (const collectionKey in searchConfig) {
        await this.indexCollection(request.dataSetUri, collectionKey, searchConfig, request.dataEndPoint).then(resp => {
          val += "collection: " + collectionKey + " response: \"" + resp + "\" \n";
        });
      }
    });

    return await val;
  }

  private async indexCollection(dataSetUri: string, collectionKey: string, searchConfig: { [key: string]: any }, dataEndPoint: string, cursor?: string): Promise<string> {
    console.log("index collection: ", collectionKey);
    return await fetch(dataEndPoint, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({ "query": buildQueryForCollection(collectionKey, searchConfig, cursor) })
    }).then(async resp => {
      if (resp.status === 200) {
        const data = await resp.json();
        await this.elasticSearchUpdater.updateElasticSearch(dataSetUri, collectionKey, { config: searchConfig, data: data.data[collectionKey].items }).then(async () => {
          const maybeCursor = data["data"][collectionKey].nextCursor;
          if (maybeCursor) {
            return await this.indexCollection(dataSetUri, collectionKey, searchConfig, dataEndPoint, maybeCursor["nextCursor"]).then(() => "Success");
          }
          return "Success"
        });
        return "Success"
      } else {
        console.log("request failed: ", resp.statusText);
        return "data retrieval failed"
      }
    }).then(message => { return message }).catch(reason => {
      console.log("error indexing collection: " + collectionKey + "\nreason: " + reason);
      return "error indexing collection: " + collectionKey;
    });
  }
}

function buildQueryForCollection(collectionKey: string, searchConfig: { [key: string]: any }, cursor?: string): string {
  searchConfig[collectionKey]["nextCursor"] = { "facetType": null };
  if (cursor != null) {
    return "{ " + collectionKey + " (cursor: \"" + cursor + "\")" + buildQuery(searchConfig[collectionKey]) + " }";
  }

  return "{ " + collectionKey + " " + buildQuery(searchConfig[collectionKey]) + " }";
}

function buildQuery(searchConfig: { [key: string]: any }): string {
  const config = searchConfig;

  let query: string = "{ ";

  for (const key in config) {
    if (key !== "facetType") {
      query += key;
      const val = config[key];
      if (val instanceof Object) {
        query += buildQuery(val);
      }
    }
  }

  query += " }";

  return query === "{  }" ? " " : query;
}

export interface Request {
  dataSetUri: string;
  dataEndPoint: string;
}

export function isRequest(body: {}): body is Request {
  return body.hasOwnProperty("dataSetUri") && body.hasOwnProperty("dataEndPoint");
}