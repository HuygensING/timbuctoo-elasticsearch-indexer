import * as searchConfig from "../searchConfigExample.json";

export async function getConfig(): Promise<object> {
  return searchConfig;
}