import { buildQueryForCollection } from "./queryGenerator"

function testBuildQueryForCollection() {
  const input = {
    "data": {
      "dataSetMetadata": {
        "collectionList": {
          "items": [
            {
              "collectionListId": "clusius_PersonsList",
              "indexConfig": {
                "facet": [
                  {
                    "paths": [
                      "clusius_PersonsList.items.tim_hasDeathPlace.tim_country.value",
                      "clusius_PersonsList.items.tim_hasDeathPlace.tim_name.value"
                    ],
                    "type": "Hierarchical"
                  },
                  {
                    "paths": [
                      "clusius_PersonsList.items.tim_gender.value"
                    ],
                    "type": "MultiSelect"
                  },
                  {
                    "paths": [
                      "clusius_PersonsList.items.tim_birthDate.value"
                    ],
                    "type": "MultiSelect"
                  },
                  {
                    "paths": [
                      "clusius_PersonsList.items.tim_deathDate.value"
                    ],
                    "type": "MultiSelect"
                  },
                  {
                    "paths": [
                      "clusius_PersonsList.items.tim_names.items.value"
                    ],
                    "type": "MultiSelect"
                  }
                ],
                "fullText": [
                  {
                    "fields": [
                      {
                        "path": "clusius_PersonsList.items.tim_names.items.value"
                      }
                    ]
                  }
                ]
              }
            }
          ]
        }
      }
    }
  }

  const expectedQuery = "{ dataSets { DUMMY_clusius { clusius_PersonsList { items { tim_hasDeathPlace { tim_country { value } tim_name { value } } tim_gender { value } tim_birthDate { value } tim_deathDate { value } tim_names { items { value } } } nextCursor } } } }";

  const actual = buildQueryForCollection("DUMMY_clusius", "clusius_PersonsList", input);

  console.assert(actual === expectedQuery, "expected:\n" + expectedQuery + "\nbut was:\n" + actual);
  console.log("testBuildQueryForCollection succeeded");
}

testBuildQueryForCollection();