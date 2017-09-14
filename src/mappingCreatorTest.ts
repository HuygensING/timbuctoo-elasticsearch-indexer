import { MappingCreator } from "./mappingCreator";

const mappingCreator = new MappingCreator();

function testKeyGeneration() {
  const personDesc: {} = {
    "tim_names": {
      "items": {
        "facetType": "Select"
      }
    },
    "tim_hasDeathPlace": {
      "tim_name": {
        "facetType": "Select"
      }
    }
  };

  const expected: {} = {
    "properties": {
      "tim_names.items": {
        "type": "text"
      },
      "tim_hasDeathPlace.tim_name": {
        "type": "text"
      }
    }
  };


  const actual = mappingCreator.createMapping(personDesc);

  console.assert(JSON.stringify(expected) === JSON.stringify(actual),
    "expected:\n" + JSON.stringify(expected) + "\nbut was:\n" + JSON.stringify(actual)
  );
}

testKeyGeneration();