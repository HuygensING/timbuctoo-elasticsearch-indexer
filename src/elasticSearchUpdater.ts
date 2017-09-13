import { Client } from "elasticsearch";
import { MappingCreator } from "./mappingCreator";
import { ElasticSearchDataFormatter } from "./elasticSearchDataFormatter"

export class ElasticSearchUpdater {
  private elasticSearchDataFormatter: ElasticSearchDataFormatter;
  private mappingCreator: MappingCreator;
  private client: Client;

  public constructor(esUri: string) {
    this.client = new Client({
      host: esUri
    });
    this.mappingCreator = new MappingCreator();
    this.elasticSearchDataFormatter = new ElasticSearchDataFormatter();
  }

  public async updateElasticSearch(dataSetUri: string, collection: string, reindexingData: ReindexingData): Promise<void> {
    console.log("update elastic search", collection);

    return await this.indexExists(dataSetUri).then(async exists => {
      if (exists === false) {
        return await this.createIndex(dataSetUri);
      }
    }).then(() => {
      for (const dataItem of reindexingData.data) {
        this.client.index({
          index: this.makeIndexNameFromDataSetUri(dataSetUri),
          type: collection,
          body: this.elasticSearchDataFormatter.formatData(dataItem, reindexingData.config)
        });
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
      if (exists) {
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
        });

      }
    }).then(() => {
       console.log( "create index: " + dataSetUri);
    }).catch(reason => {
      console.log("mapping failed: ", reason);
    });
  }
}

export interface ReindexingData {
  config: { [key: string]: any }
  data: [any]
}