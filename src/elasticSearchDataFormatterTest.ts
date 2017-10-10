import { ElasticSearchDataFormatter } from "./elasticSearchDataFormatter";

const formatter = new ElasticSearchDataFormatter();

function testFormatData() {
  const actual = JSON.stringify(formatter.formatData(
    {
      "@id": "http://timbuctoo.huygens.knaw.nl/datasets/clusius/Persons_PE00002125",
      "@type": "http://timbuctoo.huygens.knaw.nl/datasets/clusius/Persons",
      "tim_names": {
        "items": [
          {
            "type": "http://timbuctoo.huygens.knaw.nl/datatypes/person-name",
            "value": "{\"components\":[{\"type\":\"FORENAME\",\"value\":\"Mathias \"},{\"type\":\"SURNAME\",\"value\":\"Obel \"},{\"type\":\"NAME_LINK\", \"value\":\"de l'\"}]}"
          },
          {
            "type": "http://timbuctoo.huygens.knaw.nl/datatypes/person-name",
            "value": "{\"components\":[{\"type\":\"FORENAME\",\"value\":\"Matthias\"},{\"type\":\"SURNAME\",\"value\":\"Lobelius\"}]}"
          }
        ]
      },
      "tim_deathDate": {
        "type": "http://timbuctoo.huygens.knaw.nl/datatypes/datable",
        "value": "1616"
      },
      "tim_hasDeathPlace": {
        "@id": "http://timbuctoo.huygens.knaw.nl/datasets/clusius/Place_PL00000041",
        "@type": "http://timbuctoo.huygens.knaw.nl/datasets/clusius/Places",
        "tim_name": {
          "type": "http://www.w3.org/2001/XMLSchema#string",
          "value": "London"
        },
        "tim_country": {
          "type": "http://www.w3.org/2001/XMLSchema#string",
          "value": "United Kingdom"
        }
      }
    },
    {}
  ), undefined, 2);
}

function testFormatPersonName() {
  const input =
    {
      "tim_names": {
        "items": [
          {
            "type": "http://timbuctoo.huygens.knaw.nl/datatypes/person-name",
            "value": "{\"components\":[{\"type\":\"FORENAME\",\"value\":\"Mathias \"},{\"type\":\"SURNAME\",\"value\":\"Obel \"},{\"type\":\"NAME_LINK\", \"value\":\"de l'\"}]}"
          },
          {
            "type": "http://timbuctoo.huygens.knaw.nl/datatypes/person-name",
            "value": "{\"components\":[{\"type\":\"FORENAME\",\"value\":\"Matthias\"},{\"type\":\"SURNAME\",\"value\":\"Lobelius\"}]}"
          }
        ]
      },
    };

  const expected = JSON.stringify(
    {
      "tim_names": {
        "items": [
          {
            "value": {
              "raw": [
                "Mathias ",
                "Obel ",
                "de l'"
              ]
            }
          },
          {
            "value": {
              "raw": [
                "Matthias",
                "Lobelius"
              ]
            }
          }
        ]
      },
    });

  const actual = JSON.stringify(formatter.formatData(input,
    {
      "collectionListId": "clusius_PersonsList",
      "indexConfig": {
        "facet": [
          {
            "paths": [
              "tim_names.items.value"
            ],
            "type": "MultiSelect"
          }
        ]
      }
    }
  ));

  console.log("test format person name");
  console.assert(actual === expected, "expected:\n" + expected + "\nbut was:\n" + actual);
  console.log("test format person name succeeded");

}

function testPersonNameNullValue() {
  const input = {
    "uri": "http://timbuctoo.huygens.knaw.nl/datasets/clusius/Biography_SB00002019",
    "tim_isScientistBioOf": {
      "tim_names": {
        "items": [
          {
            "type": "http://timbuctoo.huygens.knaw.nl/datatypes/person-name",
            "value": null
          }
        ]
      }
    }
  };

  const expected = JSON.stringify({
    "uri": "http://timbuctoo.huygens.knaw.nl/datasets/clusius/Biography_SB00002019",
    "tim_isScientistBioOf": {
      "tim_names": {
        "items": [
          {
            "value": {
              "raw": "¯\_(ツ)_/¯"
            }
          }
        ]
      }
    }
  });

  const actual = JSON.stringify(formatter.formatData(input, {
    "collectionListId": "clusius_PersonsList",
    "indexConfig": {
      "facet": [
        {
          "paths": [
            "tim_names.items.value"
          ],
          "type": "MultiSelect"
        }
      ]
    }
  }));

  console.log("test format with null person name");
  console.assert(actual === expected, "expected:\n" + expected + "\nbut was:\n" + actual);
  console.log("test format with null person name succeeded");

}

function testFormatDatable() {
  const input = {
    "@id": "http://timbuctoo.huygens.knaw.nl/datasets/clusius/Persons_PE00002125",
    "@type": "http://timbuctoo.huygens.knaw.nl/datasets/clusius/Persons",
    "tim_deathDate": {
      "type": "http://timbuctoo.huygens.knaw.nl/datatypes/datable",
      "value": "[1616]"
    }
  };

  const expected = JSON.stringify({
    "@id": "http://timbuctoo.huygens.knaw.nl/datasets/clusius/Persons_PE00002125",
    "@type": "http://timbuctoo.huygens.knaw.nl/datasets/clusius/Persons",
    "tim_deathDate": {
      "value": {
        "raw": ["1616-01-01T00:00:00.000Z", "1616-12-31T23:59:59.999Z"]
      }
    }
  });

  const actual = JSON.stringify(formatter.formatData(input, {
    "collectionListId": "clusius_PersonsList",
    "indexConfig": {
      "facet": [
        {
          "paths": [
            "tim_deathDate.value"
          ],
          "type": "DateRange"
        }
      ]
    }
  }));

  console.log("test format datable");
  console.assert(actual === expected, "expected:\n" + expected + "\nbut was:\n" + actual);
  console.log("test format datable succeeded");
}

function testFormatInvalidDatable() {
  const input = {
    "@id": "http://timbuctoo.huygens.knaw.nl/datasets/clusius/Persons_PE00002125",
    "@type": "http://timbuctoo.huygens.knaw.nl/datasets/clusius/Persons",
    "tim_deathDate": {
      "type": "http://timbuctoo.huygens.knaw.nl/datatypes/datable",
      "value": "[1616..]"
    }
  };

  const expected = JSON.stringify({
    "@id": "http://timbuctoo.huygens.knaw.nl/datasets/clusius/Persons_PE00002125",
    "@type": "http://timbuctoo.huygens.knaw.nl/datasets/clusius/Persons",
    "tim_deathDate": {
      "value": {
        "raw": ["4242-12-31T23:59:59.999Z"]
      }
    }
  });

  const actual = JSON.stringify(formatter.formatData(input, {
    "collectionListId": "clusius_PersonsList",
    "indexConfig": {
      "facet": [
        {
          "paths": [
            "tim_deathDate.value"
          ],
          "type": "DateRange"
        }
      ]
    }
  }));

  console.log("test format invalid datable");
  console.assert(actual === expected, "expected:\n" + expected + "\nbut was:\n" + actual);
  console.log("test format invalid datable succeeded");
}

// testFormatData();
testFormatPersonName();
testPersonNameNullValue();
testFormatDatable();
testFormatInvalidDatable();
// TODO add test for full text configurations
