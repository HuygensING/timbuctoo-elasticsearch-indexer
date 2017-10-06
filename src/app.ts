import * as Koa from "koa";
import { Reindexer, Request, isRequest } from "./reindexer";
import { getPossibleFacetTypes } from "./elasticSearchDataFormatter";

let timbuctooUrl=process.env["indexer_timbuctoo_graphql_endpoint"] || "http://localhost:8080/v5/graphql"
let elasticSearchUrl=process.env["indexer_elasticsearch_host"] || "http://elastic:changeme@localhost:9200/"
let port=process.env["indexer_port"] || 3000

const app = new Koa();
const dataFetcher = new Reindexer(elasticSearchUrl, timbuctooUrl);

app.use(async (ctx) => {
  if (ctx.method === "POST") {
    var body: Object = await getBody(ctx).then((val) => JSON.parse(val));
    if (isRequest(body)) {
      ctx.body = await dataFetcher.reindex(body);
    }
    else {
      ctx.body = { error: "Unsupported request" };
    }
  } else if (ctx.method === "GET") {
    ctx.body = getPossibleFacetTypes();
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

console.log(`Launched! listening on ${port}, getting from ${timbuctooUrl} and sending to ${elasticSearchUrl}`);

app.listen(port);
