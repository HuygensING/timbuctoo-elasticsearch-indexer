import fetch from "node-fetch";

export async function getConfig(dataEndPoint: string, datasetId: string, authToken: string): Promise<any> {
  console.log("authToken: ", authToken);

  return await fetch(dataEndPoint, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Authorization": authToken
    },
    method: "POST",
    body: JSON.stringify({
      "query": "query($datasetId: ID!){  dataSetMetadata(dataSetId: $datasetId) {    collectionList {      items {        collectionId        collectionListId        indexConfig {          facet {            paths             type          }          fullText {            fields {              path            }          }        }      }    }  }}",
      "variables": {
        "datasetId": datasetId
      }
    })
  }).then(resp => resp.json());
}