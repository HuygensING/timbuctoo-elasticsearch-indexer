import { MappingCreator } from "./mappingCreator";

const mappingCreator = new MappingCreator();

function testCreateMapping() {
  const personDesc: {} = {
    "collectionId": "clusius_Residence", "collectionListId": "clusius_ResidenceList", "indexConfig": {
      "facet": [
        {
          "paths": [
            "tim_names.items.value"
          ],
          "type": "MultiSelect"
        },
        {
          "paths": [
            "tim_hasDeathPlace.tim_country.value",
            "tim_hasDeathPlace.tim_name.value"
          ],
          "type": "Hierarchical"
        },
        {
          "paths": [
            "tim_birthDate.value"
          ],
          "type": "DateRange"
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

  const expected: {} = {
    "properties": {
      "tim_names.items.value.raw": {
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
      "tim_names.items.value.fulltext": {
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

testCreateMapping();