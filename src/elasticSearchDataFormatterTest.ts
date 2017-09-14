import {ElasticSearchDataFormatter} from "./elasticSearchDataFormatter";

const formatter = new ElasticSearchDataFormatter();

console.log(JSON.stringify(formatter.formatData(
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
), undefined, 2));


