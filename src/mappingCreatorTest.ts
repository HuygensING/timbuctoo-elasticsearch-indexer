import { MappingCreator } from "./mappingCreator";

const mappingCreator = new MappingCreator();

function testCreateMapping() {
  const personDesc: {} =  {
    "collectionListId": "clusius_PersonsList",
    "indexConfig": {
      "facet": [
        {
          "paths": [
            "[[\"clusius_Persons\", \"tim_namesList\"], [\"ITEMS\", \"items\"], [\"VALUE\", \"value\"]]"
          ],
          "type": "MultiSelect"
        },
        {
          "paths": [
            "[[\"clusius_Persons\", \"tim_hasDeathPlace\"], [\"clusius_Places\", \"tim_country\"], [\"VALUE\", \"value\"]]",
            "[[\"clusius_Persons\", \"tim_hasDeathPlace\"], [\"clusius_Places\", \"tim_name\"], [\"VALUE\", \"value\"]]"
          ],
          "type": "Hierarchical"
        },
        {
          "paths": [
            "[[\"clusius_Persons\", \"tim_birthDate\"], [\"VALUE\", \"value\"]]"
          ],
          "type": "DateRange"
        }
      ],
      "fullText": [
        {
          "fields": [
            {
              "path": "[[\"clusius_Persons\", \"tim_namesList\"], [\"ITEMS\", \"items\"], [\"VALUE\", \"value\"]]"
            }
          ]
        }
      ]
    }
  };

  const expected: {} = {
    "properties": {
      "tim_namesList.items.value.raw": {
        "type": "keyword"
      },
      "tim_hasDeathPlace.tim_country.value.raw": {
        "type": "keyword"
      },
      "tim_hasDeathPlace.tim_name.value.raw": {
        "type": "keyword"
      },
      "tim_birthDate.value.raw": {
        "type": "date"
      },
      "tim_namesList.items.value.fulltext": {
        "type": "text"
      },
    }
  };


  const actual = mappingCreator.createMapping(personDesc);

  console.log("test createMapping");
  console.assert(JSON.stringify(expected) === JSON.stringify(actual),
    "expected:\n" + JSON.stringify(expected) + "\nbut was:\n" + JSON.stringify(actual)
  );
  console.log("test createMapping succeeded");
}

function testCreateMappingWithoutFullText() {
  const personDesc: {} =  {
    "collectionListId": "clusius_PersonsList",
    "indexConfig": {
      "facet": [
        {
          "paths": [
            "[[\"clusius_Persons\", \"tim_namesList\"], [\"ITEMS\", \"items\"], [\"VALUE\", \"value\"]]"
          ],
          "type": "MultiSelect"
        },
        {
          "paths": [
            "[[\"clusius_Persons\", \"tim_hasDeathPlace\"], [\"clusius_Places\", \"tim_country\"], [\"VALUE\", \"value\"]]",
            "[[\"clusius_Persons\", \"tim_hasDeathPlace\"], [\"clusius_Places\", \"tim_name\"], [\"VALUE\", \"value\"]]"
          ],
          "type": "Hierarchical"
        },
        {
          "paths": [
            "[[\"clusius_Persons\", \"tim_birthDate\"], [\"VALUE\", \"value\"]]"
          ],
          "type": "DateRange"
        }
      ],
      "fullText": []
    }
  };

  const expected: {} = {
    "properties": {
      "tim_namesList.items.value.raw": {
        "type": "keyword"
      },
      "tim_hasDeathPlace.tim_country.value.raw": {
        "type": "keyword"
      },
      "tim_hasDeathPlace.tim_name.value.raw": {
        "type": "keyword"
      },
      "tim_birthDate.value.raw": {
        "type": "date"
      }
    }
  };


  const actual = mappingCreator.createMapping(personDesc);

  console.log("test createMapping without full text");
  console.assert(JSON.stringify(expected) === JSON.stringify(actual),
    "expected:\n" + JSON.stringify(expected) + "\nbut was:\n" + JSON.stringify(actual)
  );
  console.log("test createMapping without full text succeeded");
}

testCreateMapping();
testCreateMappingWithoutFullText();