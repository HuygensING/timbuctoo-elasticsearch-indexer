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

    for (const collectionKey in searchConfig) {
      val += await this.handleCollection(request.dataSetUri, collectionKey, searchConfig, request.dataEndPoint);
    }

    return await val;
  }
  private async handleCollection(dataSetUri: string, collectionKey: string, searchConfig: { [key: string]: any }, dataEndPoint: string, cursor?: string): Promise<string> {
    await this.elasticSearchUpdater.clearCollection(dataSetUri, collectionKey).then(async () => {
      this.indexCollection(dataSetUri, collectionKey, searchConfig, dataEndPoint);
    })
  
    return "Succeeded\n";
  }

  private async indexCollection(dataSetUri: string, collectionKey: string, searchConfig: { [key: string]: any }, dataEndPoint: string, cursor?: string): Promise<void> {
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
        this.elasticSearchUpdater.updateElasticSearch(dataSetUri, collectionKey, { config: searchConfig, data: data }).then(() => {
          const maybeCursor = data["data"][collectionKey][0];
            if (maybeCursor.hasOwnProperty("nextCursor")) {
              this.indexCollection(dataSetUri, collectionKey, searchConfig, dataEndPoint, maybeCursor["nextCursor"]);
            }
        });
      } else {
        console.log("request failed: ", resp.statusText);
      }
    });
  }
}

function buildQueryForCollection(collectionKey: string, searchConfig: { [key: string]: any }, cursor?: string): string {
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