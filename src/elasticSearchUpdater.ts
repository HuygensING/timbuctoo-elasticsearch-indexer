import { Client } from "elasticsearch";
import { MappingCreator } from "./mappingCreator";
import { ElasticSearchDataFormatter } from "./elasticSearchDataFormatter";
import { getCollectionListIds, getCollectionIndexConfig } from "./searchConfigHelper";

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

  public async updateElasticSearch(dataSetId: string, collection: string, reindexingData: ReindexingData): Promise<void> {
    console.log("update elastic search", collection);

    return await this.indexExists(dataSetId).then(async exists => {
      if (exists === false) {
        return await this.createIndex(dataSetId);
      }
    }).then(() => {
      for (const dataItem of reindexingData.data) {
        this.client.index({
          index: this.formatIndexName(dataSetId),
          type: collection,
          body: this.elasticSearchDataFormatter.formatData(dataItem, reindexingData.config)
        });
      }
    });
  }

  private formatIndexName(dataSetId: string): string {
    return dataSetId.toLowerCase(); // elastic search only allows lowercase index names
  }

  public async indexExists(dataSetId: string): Promise<boolean> {
    return this.client.indices.exists({ index: this.formatIndexName(dataSetId) });
  }

  public async createIndex(dataSetId: string): Promise<any> {
    return this.client.indices.create({ index: this.formatIndexName(dataSetId) });
  }

  public async remapIndex(dataSetId: string, config: { [key: string]: any }) {
    return await this.indexExists(dataSetId).then(async exists => {
      if (exists) {
        return await this.client.indices.delete({
          index: this.formatIndexName(dataSetId)
        })
      }
    }).then(async () => {
      return await this.createIndex(dataSetId);
    }).then(async () => {
      const indexName = this.formatIndexName(dataSetId);
      for (const type of getCollectionListIds(config)) {
        await this.client.indices.putMapping({
          index: indexName,
          type: type,
          body: this.mappingCreator.createMapping(getCollectionIndexConfig(config, type))
        });

      }
    }).then(() => {
      console.log("create index: " + dataSetId);
    }).catch(reason => {
      console.log("mapping failed: ", reason);
    });
  }
}

export interface ReindexingData {
  config: { [key: string]: any }
  data: [any]
}