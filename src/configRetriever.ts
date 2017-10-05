import fetch from "node-fetch";

export async function getConfig(dataEndPoint: string, datasetId: string): Promise<object> {


  return await fetch(dataEndPoint, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({
      "query": "# {\n#     dataSets {\n#     DUMMY_clusius {\n#       clusius_PersonsList { \n#         items {\n#           uri\n#           tim_names {\n#             items {\n#              value  \n#             }\n#           } \n#           tim_gender { \n#             value \n#           } \n#           tim_birthDate { \n#             value \n#           } \n#           tim_deathDate { \n#             value \n#           } \n#           tim_hasDeathPlace { \n#             tim_name { \n#               value \n#             } \n#             tim_country { \n#               value \n#             } \n#           } \n#           tim_hasBirthPlace { \n#             tim_name { \n#               value \n#             } \n#             tim_country { \n#               value \n#             } \n#           } \n#           _inverse_tim_isScientistBioOf { \n#             tim_biography { \n#               value \n#             } \n#           } \n#           _inverse_tim_hasResident { \n#             items { \n#               tim_hasLocation { \n#                 tim_name { \n#                   value \n#                 } \n#                 tim_country { \n#                   value \n#                 } \n#               } \n#             } \n#           } \n#           _inverse_tim_isEducationOf { \n#             items { \n#               tim_description { \n#                 value \n#               } \n#             } \n#           }\n#           _inverse_tim_isOccupationOf { \n#             items { \n#               tim_description { \n#                 value \n#               } \n#             } \n#           } \n#         } \n#         nextCursor \n#       } \n#     }\n#   }\n# }\n\nquery($datasetId: ID){\n  dataSetMetadata(dataSetId: $datasetId) {\n    collectionList {\n      items {\n        collectionListId\n        indexConfig {\n          facet {\n            paths \n            type\n          }\n          fullText {\n            fields {\n              path\n            }\n          }\n        }\n      }\n    }\n  }\n}",
      "variables": {
        "datasetId": datasetId
      }
    })
  });
}