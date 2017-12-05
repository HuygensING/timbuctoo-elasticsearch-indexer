import { buildQueryForCollection } from "./queryGenerator"

function testBuildQueryForCollection() {
  const input =
  {
    "collectionListId": "clusius_PersonsList",
    "indexConfig": {
      "facet": [
        {
          "paths": [
            "clusius_Persons||tim_hasDeathPlace.clusius_Places||tim_country.VALUE||value",
            "clusius_Persons||tim_hasDeathPlace.clusius_Places||tim_name.VALUE||value"
          ],
          "type": "Hierarchical"
        },
        {
          "paths": [
            "clusius_Persons||tim_gender.VALUE||value"
          ],
          "type": "MultiSelect"
        },
        {
          "paths": [
            "clusius_Persons||tim_birthDate.VALUE||value"
          ],
          "type": "DateRange"
        },
        {
          "paths": [
            "clusius_Persons||tim_deathDate.VALUE||value"
          ],
          "type": "DateRange"
        },
        {
          "paths": [
            "clusius_Persons||tim_namesList.ITEMS||items.VALUE||value"
          ],
          "type": "MultiSelect"
        }
      ],
      "fullText": [ ]
    }
  };


  const expectedQuery = "{ dataSets { u33707283d426f900d4d33707283d426f900d4d0d__clusius { clusius_PersonsList { items { uri ...on u33707283d426f900d4d33707283d426f900d4d0d__clusius_clusius_Persons {  tim_hasDeathPlace {    ...on u33707283d426f900d4d33707283d426f900d4d0d__clusius_clusius_Places {      tim_name { value type }     }   }   tim_gender { value type }   tim_birthDate { value type }   tim_deathDate { value type }   tim_namesList {    items { value type }   } }  } nextCursor } } } }";

  const actual = buildQueryForCollection("u33707283d426f900d4d33707283d426f900d4d0d__clusius", input);
  
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
              "clusius_Persons||tim_gender.VALUE||value"
            ],
            "type": "MultiSelect"
          },
          {
            "paths": [
              "clusius_Persons||tim_birthDate.VALUE||value"
            ],
            "type": "DateRange"
          },
          {
            "paths": [
              "clusius_Persons||tim_deathDate.VALUE||value"
            ],
            "type": "DateRange"
          },
        ],
        "fullText": [
          {
            "fields": [
              {
                "path": "clusius_Persons||tim_namesList.ITEMS||items.VALUE||value"
              }
            ]
          }
        ]
      }
    };


  const expectedQuery = "{ dataSets { u33707283d426f900d4d33707283d426f900d4d0d__clusius { clusius_PersonsList { items { uri ...on u33707283d426f900d4d33707283d426f900d4d0d__clusius_clusius_Persons {  tim_gender { value type }   tim_birthDate { value type }   tim_deathDate { value type }   tim_namesList {    items { value type }   } }  } nextCursor } } } }";  

  const actual = buildQueryForCollection("u33707283d426f900d4d33707283d426f900d4d0d__clusius", input);
  
  console.log("testAddFullTextFieldsToQuery")
  console.assert(actual === expectedQuery, "expected:\n" + expectedQuery + "\nbut was:\n" + actual);
  console.log("testAddFullTextFieldsToQuery succeeded");
}

testBuildQueryForCollection();
testAddFullTextFieldsToQuery()