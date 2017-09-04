import fetch from "node-fetch";

export class Reindexer {
  public async fetchData(request: Request) : Promise<string> {
    console.log("request: ", request.dataEndPoint);

    const val = await fetch("http://localhost:8080/v5/DUMMY/clusius/graphql", {
      headers: {
        Accept: "application/json"
      },
      method: "POST",
      body: `{
        clusius_PersonsList {
          uri
          tim_names {
            value
          }
        }
      }`
    });

    const json = await val.json()

    return JSON.stringify(json);
  }
}

export interface Request {
  dataSetUri: string;
  dataEndPoint: string;
}

export function isRequest(body: {}): body is Request {
  return body.hasOwnProperty("dataSetUri") && body.hasOwnProperty("dataEndPoint");
}