export async function updateElasticSearch(reindexingData: ReindexingData) {
  console.log("value: ", JSON.stringify(reindexingData.data));
}

interface ReindexingData {
  config: { [key: string]: any }
  data: { [key: string]: any }
}