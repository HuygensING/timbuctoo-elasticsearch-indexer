import fetch from "node-fetch";
import { getConfig } from "./configRetriever";
import { ElasticSearchUpdater } from "./elasticSearchUpdater";
import { buildQueryForCollection } from "./queryGenerator";
import { getCollectionIndexConfig, getCollectionListIds } from "./searchConfigHelper";
import { DataSetMetaDataGraphQlResponse, CollectionConfig } from "./metadata";

export class Reindexer {
  private loginUri: string;
  private dataEndpoint: string;
  private elasticSearchUpdater: ElasticSearchUpdater;
  private authHeader: string;
  constructor(esUri: string, dataEndpoint: string, loginUri: string, authHeader: string) {
    this.elasticSearchUpdater = new ElasticSearchUpdater(esUri);
    this.dataEndpoint = dataEndpoint;
    this.authHeader = authHeader;
    this.loginUri = loginUri;
  }
  public async reindex(request: Request): Promise<string> {
    const authToken = await fetch(this.loginUri, {
      headers: {
        "Authorization": this.authHeader
      }, 
      method: "POST"
    }).then(response => {
      if(response.status == 204) {
        return response.headers.get("X_AUTH_TOKEN");
      }
      console.log("Status: " + response.status + " " + response.statusText);
      return null;
    });

    if(authToken == null) {
      return "Could not login into Timbuctoo."
    }

    let datasets = [];
    if (request.dataSetId) {
      console.log('reindex data set: ' + request.dataSetId);
      datasets.push(request.dataSetId);
    }
    else {
      console.log('reindex all data sets');
      datasets = await this.getDatasets(authToken);
    }

    let val = '';
    for (const dataSetId of datasets) {
      console.log(`Starting reindex of dataset ${dataSetId}`);
      val += `dataset: ${dataSetId} \n`;
      val += await this.reindexDataset(dataSetId, authToken);
      val += '\n';
    }

    return val;
  }

  private async reindexDataset(dataSetId: string, authToken: string): Promise<string> {
    let val = '';

    const searchConfig: DataSetMetaDataGraphQlResponse = await getConfig(this.dataEndpoint, dataSetId, authToken);

    await this.elasticSearchUpdater.remapIndex(dataSetId, searchConfig).then(async () => {
      for (const collectionListId of getCollectionListIds(searchConfig)) {
        await this.indexCollection(dataSetId, collectionListId, getCollectionIndexConfig(searchConfig, collectionListId), authToken).then(resp => {
          val += 'collection: ' + collectionListId + ' response: "' + resp + '" \n';
        });
      }
    });

    return val;
  }

  private async getDatasets(authToken: string): Promise<string[]> {
    const response = await fetch(this.dataEndpoint, {
      headers: {
        Accept: 'application/json',
        Authorization: authToken,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: '{ "query": "{ dataSetMetadataList(promotedOnly: false, publishedOnly: false) { dataSetId } }" }'
    });

    if (response.status === 200) {
      const responseData = await response.json() as DataSetMetadataListResponse;
      return responseData.data.dataSetMetadataList.map(datasetMetadata => datasetMetadata.dataSetId);
    }
    else {
      console.log('request failed: ', response.statusText);
      return [];
    }
  }

  private async indexCollection(dataSetId: string, collectionListId: string, searchConfig: CollectionConfig | null, authToken: string, cursor?: string): Promise<string> {
    if(searchConfig === null) {
      return "";
    }
    const query = buildQueryForCollection(dataSetId, searchConfig, cursor);
    if (query !== "") {
      console.log("index collection: \"" + searchConfig.collectionId + "\" cursor: \"" + cursor + "\"");
      return await fetch(this.dataEndpoint, {
        headers: {
          Accept: "application/json",
          Authorization: authToken,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ "query": query })
      }).then(async resp => {
        if (resp.status === 200) {
          const data = await resp.json();

          if (!this.isExpectedData(data, dataSetId, collectionListId)) {
            console.log("Retrieved data: '" + JSON.stringify(data, null, ' ') + "' is not supported");
            return "Timbuctoo returned unsupported data";
          }

          const dataToIndex = data.data.dataSets[dataSetId][collectionListId].items;
          await this.elasticSearchUpdater.updateElasticSearch(dataSetId, searchConfig.collectionListId, { config: searchConfig, data: dataToIndex }).then(async () => {
            const maybeCursor = data.data.dataSets[dataSetId][collectionListId].nextCursor;

            if (maybeCursor) {
              return await this.indexCollection(dataSetId, collectionListId, searchConfig, authToken, maybeCursor).then(() => "Success");
            }

            return "Success";
          });

          return "Success";
        } else {
          console.log("request failed: ", resp.statusText);
          return "data retrieval failed for query: " + query;
        }
      }).then(message => { return message }).catch(reason => {
        console.log("error indexing collection: " + collectionListId + "\nreason: " + reason);
        return "error indexing collection: " + collectionListId;
      });
    }
    else {
      return "ignored";
    }
  }
  private isExpectedData(data: any, dataSetId: string, collectionListId: string): boolean {
    return data.data && data.data.dataSets && data.data.dataSets[dataSetId] && data.data.dataSets[dataSetId][collectionListId] && data.data.dataSets[dataSetId][collectionListId].items;
  }
}

export interface DataSetMetadataListResponse {
  data: {
    dataSetMetadataList: { dataSetId: string }[];
  }
}

export interface Request {
  dataSetId?: string;
}

export function isRequest(body: {}): body is Request {
  return body.hasOwnProperty("dataSetId");
}
