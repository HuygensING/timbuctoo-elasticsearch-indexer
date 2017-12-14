import * as Koa from "koa";
import { Reindexer, Request, isRequest } from "./reindexer";
import { getPossibleFacetTypes } from "./elasticSearchDataFormatter";

let timbuctooGraphQlUrl=process.env["indexer_timbuctoo_graphql_endpoint"] || "http://localhost:8080/v5/graphql"
let user=process.env["timbuctoo_user"] || "user"
let password=process.env["timbuctoo_password"] || "password"
let authHeader = "BASIC " + new Buffer(user+":"+password).toString("base64")
let timbuctooLoginUrl = process.env["indexer_timbuctoo_login_endpoint"] "http://localhost:8080/v2.1/authenticate"
let elasticSearchUrl=process.env["indexer_elasticsearch_host"] || "http://elastic:changeme@localhost:9200/"
let port=process.env["indexer_port"] || 3000

const app = new Koa();
const dataFetcher = new Reindexer(elasticSearchUrl, timbuctooGraphQlUrl, timbuctooLoginUrl, authHeader);

app.use(async (ctx) => {
  try {
    console.log(`Received ${ctx.method} request`)
    if (ctx.method === "POST") {
      console.log(`parsing data`)
      var body: Object = await getBody(ctx).then((val) => {
        try {
          return JSON.parse(val);
        } catch (error) {
          console.error(`"${val}" is not a valid json value: ${error}`);
        }
      });
      if (isRequest(body)) {
        console.log(`starting index-job`)
        ctx.body = await dataFetcher.reindex(body);
      }
      else {
        console.error("request is not valid");
        ctx.body = { error: "Unsupported request" };
      }
    } else if (ctx.method === "GET") {
      console.log(`returning info`)
      ctx.body = getPossibleFacetTypes();
    }
  } catch(error) {
    console.error("An error occurred: ", error);
  }
});

function getBody(ctx: Koa.Context): Promise<string> {
  return new Promise((resolve, reject) => {
    var data = "";
    ctx.req.on("data", function (chunk) {
      data += chunk;
    });
    ctx.req.on("end", function () {
      resolve(data);
    });
  });
}

console.log(`Launched! listening on ${port}, getting from ${timbuctooGraphQlUrl} and sending to ${elasticSearchUrl}`);

app.listen(port);
