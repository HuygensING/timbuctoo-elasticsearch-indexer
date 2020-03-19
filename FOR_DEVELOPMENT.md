# Timbuctoo Elastic Search Indexer

This file is in DEVELOPMENT. Don't use it yet.

A tool that automatically updates the ElasticSearch indices used by datasets in Timbuctoo. So for development, you need:

- Timbuctoo (RDF datastore)
- ElasticSearch (index used by Timbuctoo)
- ElasticSearch indexer, middleware between Timbuctoo and ElasticSearch, written in TypeScript on Node.js

Fortunately everything is contained in the docker-compose.yml


## Steps

- Build / Run the environment `docker-compose up -d`
- Upload test-data to Timbuctoo with 'fake' authorization


````
curl -v -F "file=@///Users/mvdpeet/dockerprojecten/timbuctoo-elasticsearch-indexer/test-databia_clusius.ttl;type=text/turtle" -F "encoding=UTF-8" -H "Authorization: fake" http://localhost:8080/v5/u33707283d426f900d4d33707283d426f900d4d0d/testclusius/upload/rdf?forceCreation=true
````

- Test graphql on `http://localhost:8080/static/graphiql?hsid=fake`

````json
query test {
  dataSets {
    u33707283d426f900d4d33707283d426f900d4d0d__testclusius {
      clusius_PlacesList {
        items {
          title {
            value
          }
        }
      }
    }
  }
}
````
 More example-queries for you to try, in `graphqlqueries.txt`





   


