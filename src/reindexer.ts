import fetch from "node-fetch";
import * as searchConfig from "../searchConfigExample.json";
import {updateElasticSearch} from "./elasticSearchUpdater";

export class Reindexer {
  public async reindex(request: Request): Promise<string> {
    let val = "";

    for (const collectionKey in searchConfig) {
      val += await this.handleCollection(collectionKey, searchConfig, request.dataEndPoint);
    }

    return await val;
  }
  private async handleCollection(collectionKey: string, searchConfig: { [key: string]: any }, dataEndPoint: string, cursor?: string): Promise<String> {

    await fetch(dataEndPoint, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({ "query": buildQueryForCollection(collectionKey, searchConfig, cursor) })
    }).then(async resp => {
      console.log("response", resp.status);
      if(resp.status === 200) {
        const data = await resp.json();
        
        updateElasticSearch({config: searchConfig, data: data}).then(() => {
          const maybeCursor = data["data"][collectionKey][0];
          if(maybeCursor.hasOwnProperty("nextCursor")) {
            this.handleCollection(collectionKey, searchConfig, dataEndPoint, maybeCursor["nextCursor"]);
          }
        });
      }
    });
  
    return "Succeeded";
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