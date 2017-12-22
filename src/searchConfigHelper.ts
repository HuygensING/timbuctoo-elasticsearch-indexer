import { DataSetMetaData, CollectionConfig, DataSetMetaDataGraphQlResponse } from "./metadata";

export function getCollectionListIds(searchConfig: DataSetMetaDataGraphQlResponse): string[] {
  return searchConfig.data.dataSetMetadata.collectionList.items.map((col: any) => col.collectionListId);
}

export function getCollectionIndexConfig(indexConfig: DataSetMetaDataGraphQlResponse, collectionListId: string): CollectionConfig | null {
  for (const collection of indexConfig.data.dataSetMetadata.collectionList.items) {
    if (collection.collectionListId === collectionListId) {
      return collection;
    }
  }

  return null;
}