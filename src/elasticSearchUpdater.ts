import { Client } from "elasticsearch";

export class ElasticSearchUpdater {
  private client: Client;
  public constructor(esUri: string) {
    this.client = new Client({
      host: esUri
    });
  }

  public async updateElasticSearch(dataSetUri: string, collection: string, reindexingData: ReindexingData): Promise<void> {
    console.log("update elastic search", collection);

    return await this.indexExists(dataSetUri).then(async exists => {
      if (exists === false) {
        return await this.createIndex(dataSetUri);
      }
    }).then(() => {
      for (const dataItem of reindexingData.data.data[collection]) {
        const keys = Object.keys(dataItem);
        if (keys.indexOf("nextCursor") < 0 && keys.indexOf("prevCursor") < 0) {
          this.client.index({
            index: this.makeIndexNameFromDataSetUri(dataSetUri),
            type: collection,
            body: dataItem
          });
        }
      }
    });
  }

  private makeIndexNameFromDataSetUri(dataSetUri: string): string {
    return dataSetUri.replace("_", "__").replace(/\W/g, "_");
  }

  public async clearCollection(dataSetUri: string, collection: string): Promise<void> {
    await this.indexExists(dataSetUri).then (exists => {
      if(exists === true) {
        this.client.deleteByQuery({
          index: this.makeIndexNameFromDataSetUri(dataSetUri),
          type: collection
        }).catch(onrejected => {
          console.log("clear failed: ", onrejected)
        });
      }
    });
  }

  public async indexExists(dataSetUri: string): Promise<boolean> {
    return this.client.indices.exists({ index: this.makeIndexNameFromDataSetUri(dataSetUri) });
  }

  public async createIndex(dataSetUri: string): Promise<any> {
    return this.client.indices.create({ index: this.makeIndexNameFromDataSetUri(dataSetUri) });
  }

  public mapIndex(dataSetUri: string, config: { [key: string]: any }) {
    
  }

}


interface ReindexingData {
  config: { [key: string]: any }
  data: { [key: string]: any }
}