import fetch from "node-fetch";
import * as searchConfig from "../searchConfigExample.json";

export class Reindexer {
  public async fetchData(request: Request): Promise<string> {
    console.log("query: ", JSON.stringify({"query": queryBuilder(searchConfig) }));

    const val = await fetch(request.dataEndPoint, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({"query": queryBuilder(searchConfig) })
    });

    const json = await val.json()

    return json;
  }
}

export interface Request {
  dataSetUri: string;
  dataEndPoint: string;
}

export function isRequest(body: {}): body is Request {
  return body.hasOwnProperty("dataSetUri") && body.hasOwnProperty("dataEndPoint");
}

function queryBuilder(searchConfig: { [key: string]: any }): string {
  const config = searchConfig;

  let query: string = "{ ";

  for (const key in config) {
    if(key !== "facetType") {
      query += key;
      const val = config[key];
      if (val instanceof Object) {
        query += queryBuilder(val);
      }
    }
  }

  query += " }";

  return query === "{  }" ? " ": query;
}