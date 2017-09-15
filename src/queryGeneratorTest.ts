import { buildQueryForCollection } from "./queryGenerator"

function testBuildQueryForCollection() {
  const input = {
    "clusius_PersonsList": {
      "facets": {
        "path": "clusius_PersonsList.items.tim_hasDeathPlace.tim_country.value",
        "type": "Select",
        "next": {
          "path": "clusius_PersonsList.items.tim_gender.value",
          "type": "Select",
          "next": {
            "path": "clusius_PersonsList.items.tim_birthDate.value",
            "type": "Select",
            "next": {
              "path": "clusius_PersonsList.items.tim_deathDate.value",
              "type": "Select",
              "next": {
                "path": "clusius_PersonsList.items.tim_hasDeathPlace.tim_name.value",
                "type": "Select",
                "next": {
                  "path": "clusius_PersonsList.items.tim_names.items.value",
                  "type": "Select"
                }
              }
            }
          }
        }
      }
    }
  };
  const expectedQuery = "{ clusius_PersonsList { items { tim_hasDeathPlace { tim_name { value } tim_country { value } } tim_names { items { value } } tim_gender { value } tim_birthDate { value } tim_deathDate { value } tim_names { items { value } } } nextCursor } }";
  
  const actual = buildQueryForCollection("clusius_PersonsList", input);

  console.assert(actual === expectedQuery, "expected:\n" + expectedQuery + "\nbut was:\n" + actual);
  console.log("testBuildQueryForCollection succeeded");
}

testBuildQueryForCollection();