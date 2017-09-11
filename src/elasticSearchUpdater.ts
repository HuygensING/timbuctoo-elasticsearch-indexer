import { Client } from "elasticsearch";
import {MappingCreator} from "./mappingCreator";

export class ElasticSearchUpdater {
  private mappingCreator: MappingCreator;
  private client: Client;
  
  public constructor(esUri: string) {
    this.client = new Client({
      host: esUri
    });
    this.mappingCreator = new MappingCreator();
  }

  public async updateElasticSearch(dataSetUri: string, collection: string, reindexingData: ReindexingData): Promise<void> {
    console.log("update elastic search", collection);

    return await this.indexExists(dataSetUri).then(async exists => {
      if (exists === false) {
        return await this.createIndex(dataSetUri);
      }
    }).then(() => {
      for (const dataItem of reindexingData.data) {
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

  public async indexExists(dataSetUri: string): Promise<boolean> {
    return this.client.indices.exists({ index: this.makeIndexNameFromDataSetUri(dataSetUri) });
  }

  public async createIndex(dataSetUri: string): Promise<any> {
    return this.client.indices.create({ index: this.makeIndexNameFromDataSetUri(dataSetUri) });
  }

  public async remapIndex(dataSetUri: string, config: { [key: string]: any }) {
    return await this.indexExists(dataSetUri).then(async exists => {
      if(exists) {
        return await this.client.indices.delete({
          index: this.makeIndexNameFromDataSetUri(dataSetUri)
        })
      }
    }).then(async () => {
      return await this.createIndex(dataSetUri);
    }).then(async () => {
      const indexName = this.makeIndexNameFromDataSetUri(dataSetUri);
      for (const type of Object.getOwnPropertyNames(config)) {
       await this.client.indices.putMapping({
          index: indexName,
          type: type,
          body: this.mappingCreator.createMapping(config[type].items)
        }).then(() => console.log(("create index")));

      }
    }).catch(reason => {
      console.log("mapping failed: ", reason);
    });
  }
}

interface ReindexingData {
  config: { [key: string]: any }
  data: [any]
}