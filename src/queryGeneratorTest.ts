import { buildQueryForCollection } from "./queryGenerator"

function testBuildQueryForCollection() {
  const input =
    {
      "collectionListId": "clusius_PersonsList",
      "indexConfig": {
        "facet": [
          {
            "paths": [
              "tim_hasDeathPlace.tim_country.value",
              "tim_hasDeathPlace.tim_name.value"
            ],
            "type": "Hierarchical"
          },
          {
            "paths": [
              "tim_gender.value"
            ],
            "type": "MultiSelect"
          },
          {
            "paths": [
              "tim_birthDate.value"
            ],
            "type": "DateRange"
          },
          {
            "paths": [
              "tim_deathDate.value"
            ],
            "type": "DateRange"
          },
          {
            "paths": [
              "tim_names.items.value"
            ],
            "type": "MultiSelect"
          }
        ],
        "fullText": [
          {
            "fields": [
              {
                "path": "tim_names.items.value"
              }
            ]
          }
        ]
      }
    };


  const expectedQuery = "{ dataSets { DUMMY__clusius { clusius_PersonsList { items { uri tim_hasDeathPlace { tim_country { value } tim_name { value } } tim_gender { value } tim_birthDate { value } tim_deathDate { value } tim_names { items { value } } } nextCursor } } } }";

  const actual = buildQueryForCollection("DUMMY__clusius", "clusius_PersonsList", input);

  console.assert(actual === expectedQuery, "expected:\n" + expectedQuery + "\nbut was:\n" + actual);
  console.log("testBuildQueryForCollection succeeded");
}

testBuildQueryForCollection();