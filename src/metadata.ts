export interface CollectionConfig {
  collectionId: string,
  collectionListId: string,
  indexConfig: {
    facet: [
      {
        paths: [string],
        type: string
      }
    ],
    fullText: FullTextField[]
  }
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
    items: [
      CollectionConfig
    ]
  }
}

export interface DataSetMetaDataGraphQlResponse {
  data: { 
    dataSetMetadata: DataSetMetaData 
  }
}