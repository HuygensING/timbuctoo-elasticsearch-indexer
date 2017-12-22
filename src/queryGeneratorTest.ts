import { buildQueryForCollection } from "./queryGenerator"


function testBuildQueryForCollection() {
  const input =
  {
    "collectionListId": "clusius_PersonsList",
    "indexConfig": {
      "facet": [
        {
          "paths": [
            "[[\"clusius_Persons\", \"tim_hasDeathPlace\"], [\"clusius_Places\", \"tim_country\"], [\"Value\", \"value\"]]",
            "[[\"clusius_Persons\", \"tim_hasDeathPlace\"], [\"clusius_Places\", \"tim_name\"], [\"Value\", \"value\"]]"
          ],
          "type": "Hierarchical"
        },
        {
          "paths": [
            "[[\"clusius_Persons\", \"tim_gender\"], [\"Value\", \"value\"]]"
          ],
          "type": "MultiSelect"
        },
        {
          "paths": [
            "[[\"clusius_Persons\", \"tim_birthDate\"], [\"Value\", \"value\"]]"
          ],
          "type": "DateRange"
        },
        {
          "paths": [
            "[[\"clusius_Persons\", \"tim_deathDate\"], [\"Value\", \"value\"]]"
          ],
          "type": "DateRange"
        },
        {
          "paths": [
            "[[\"clusius_Persons\", \"tim_namesList\"], [\"items\", \"items\"], [\"Value\", \"value\"]]"
          ],
          "type": "MultiSelect"
        }
      ],
      "fullText": [ ]
    }
  };

  const expectedQuery = "{ dataSets { u33707283d426f900d4d33707283d426f900d4d0d__clusius { clusius_PersonsList { items { uri ... on u33707283d426f900d4d33707283d426f900d4d0d__clusius_clusius_Persons { tim_birthDate { ... on Value { value type } } tim_deathDate { ... on Value { value type } } tim_gender { ... on Value { value type } } tim_hasDeathPlace { ... on u33707283d426f900d4d33707283d426f900d4d0d__clusius_clusius_Places { tim_country { ... on Value { value type } } tim_name { ... on Value { value type } } } } tim_namesList { items { ... on Value { value type } } } } } nextCursor } } } }".replace(/\s+/g, ' ');

  const actual = buildQueryForCollection("u33707283d426f900d4d33707283d426f900d4d0d__clusius", input).replace(/\s+/g, ' ');
  
  console.log("testBuildQueryForCollection");
  console.assert(actual === expectedQuery, "expected:\n" + expectedQuery + "\nbut was:\n" + actual);
  console.log("testBuildQueryForCollection succeeded");
}

function testAddFullTextFieldsToQuery() {
  const input =
    {
      "collectionListId": "clusius_PersonsList",
      "indexConfig": {
        "facet": [
          {
            "paths": [
              "[[\"clusius_Persons\", \"tim_gender\"], [\"Value\", \"value\"]]"
            ],
            "type": "MultiSelect"
          },
          {
            "paths": [
              "[[\"clusius_Persons\", \"tim_birthDate\"], [\"Value\", \"value\"]]"
            ],
            "type": "DateRange"
          },
          {
            "paths": [
              "[[\"clusius_Persons\", \"tim_deathDate\"], [\"Value\", \"value\"]]"
            ],
            "type": "DateRange"
          },
        ],
        "fullText": [
          {
            "fields": [
              {
                "path": "[[\"clusius_Persons\", \"tim_namesList\"], [\"items\", \"items\"], [\"Value\", \"value\"]]"
              }
            ]
          }
        ]
      }
    };


  const expectedQuery = "{ dataSets { u33707283d426f900d4d33707283d426f900d4d0d__clusius { clusius_PersonsList { items { uri ... on u33707283d426f900d4d33707283d426f900d4d0d__clusius_clusius_Persons { tim_birthDate { ... on Value { value type } } tim_deathDate { ... on Value { value type } } tim_gender { ... on Value { value type } } tim_namesList { items { ... on Value { value type } } } } } nextCursor } } } }".replace(/\s+/g, ' ');

  const actual = buildQueryForCollection("u33707283d426f900d4d33707283d426f900d4d0d__clusius", input).replace(/\s+/g, ' ');
  
  console.log("testAddFullTextFieldsToQuery")
  console.assert(actual === expectedQuery, "expected:\n" + expectedQuery + "\nbut was:\n" + actual);
  console.log("testAddFullTextFieldsToQuery succeeded");
}

testBuildQueryForCollection();
testAddFullTextFieldsToQuery()