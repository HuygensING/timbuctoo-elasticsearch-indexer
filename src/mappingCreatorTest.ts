import { MappingCreator } from "./mappingCreator";

const mappingCreator = new MappingCreator();

function testKeyGeneration() {
  const personDesc: {} = {
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
  };

  const expected: {} = {
    "properties": {
      "tim_names.items.value": {
        "type": "text"
      },
      "tim_hasDeathPlace.tim_country.value": {
        "type": "text"
      },
      "tim_hasDeathPlace.tim_name.value": {
        "type": "text"
      }      
    }
  };


  const actual = mappingCreator.createMapping(personDesc);

  console.assert(JSON.stringify(expected) === JSON.stringify(actual),
    "expected:\n" + JSON.stringify(expected) + "\nbut was:\n" + JSON.stringify(actual)
  );
  console.log("success");
}

testKeyGeneration();