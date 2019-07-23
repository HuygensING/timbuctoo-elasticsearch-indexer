export interface CollectionConfig {
  collectionId: string,
  collectionListId: string,
  indexConfig: IndexConfig
}

interface IndexConfig {
  facet: Facet[]
  fullText: FullTextField[]
}

interface Facet {
  paths: string[],
  type: string
}

interface FullTextField {
  fields: [
    {
      path: string
    }
  ]
}

export interface DataSetMetaData {
  collectionList: {
    items: CollectionConfig[]
  }
}

export interface DataSetMetaDataGraphQlResponse {
  data: { 
    dataSetMetadata: DataSetMetaData 
  }
}