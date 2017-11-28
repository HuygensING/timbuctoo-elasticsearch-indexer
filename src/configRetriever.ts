import fetch from "node-fetch";

export async function getConfig(dataEndPoint: string, datasetId: string): Promise<object> {


  return await fetch(dataEndPoint, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({
      "query": "query($datasetId: ID!){\n  dataSetMetadata(dataSetId: $datasetId) {\n    collectionList {\n      items {\n        collectionId\n        collectionListId\n        indexConfig {\n          facet {\n            paths \n            type\n          }\n          fullText {\n            fields {\n              path\n            }\n          }\n        }\n      }\n    }\n  }\n}",
      "variables": {
        "datasetId": datasetId
      }
    })
  }).then(resp => resp.json());
}