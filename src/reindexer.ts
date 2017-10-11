import fetch from "node-fetch";
import { getConfig } from "./configRetriever";
import { ElasticSearchUpdater } from "./elasticSearchUpdater";
import { buildQueryForCollection } from "./queryGenerator";

export class Reindexer {
  private dataEndpoint: string;
  private elasticSearchUpdater: ElasticSearchUpdater;
  constructor(esUri: string, dataEndpoint: string) {
    this.elasticSearchUpdater = new ElasticSearchUpdater(esUri);
    this.dataEndpoint = dataEndpoint;
  }
  public async reindex(request: Request): Promise<string> {
    let val = "";
    const searchConfig: any = await getConfig(this.dataEndpoint, request.dataSetId);

    await this.elasticSearchUpdater.remapIndex(request.dataSetId, searchConfig).then(async () => {
      for (const collectionKey of getCollections(searchConfig)) {
        await this.indexCollection(request.dataSetId, collectionKey, getCollectionIndexConfig(searchConfig, collectionKey)).then(resp => {
          val += "collection: " + collectionKey + " response: \"" + resp + "\" \n";
        });
      }
    });

    return await val;
  }

  private async indexCollection(dataSetId: string, collectionListId: string, searchConfig: { [key: string]: any }, cursor?: string): Promise<string> {
    const query = buildQueryForCollection(dataSetId, searchConfig, cursor);
    if (query !== "") {
      console.log("index collection: \"" + searchConfig.collectionId + "\" cursor: \"" + cursor + "\"");
      return await fetch(this.dataEndpoint, {
        headers: {
          Accept: "application/json",
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
              return await this.indexCollection(dataSetId, collectionListId, searchConfig, maybeCursor).then(() => "Success");
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

export interface Request {
  dataSetId: string;
}

export function isRequest(body: {}): body is Request {
  return body.hasOwnProperty("dataSetId");
}

function getCollections(searchConfig: any): string[] {
  return searchConfig.data.dataSetMetadata.collectionList.items.map((col: any) => col.collectionListId);
}

function getCollectionIndexConfig(indexConfig: any, collectionKey: string): any {
  for (const collection of indexConfig.data.dataSetMetadata.collectionList.items) {
    if (collection.collectionListId === collectionKey) {
      return collection;
    }
  }

  return null;
}
