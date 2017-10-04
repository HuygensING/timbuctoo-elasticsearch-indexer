import * as Koa from "koa";
import { Reindexer, Request, isRequest } from "./reindexer";
import { getPossibleFacetTypes } from "./elasticSearchDataFormatter";

const app = new Koa();
const dataFetcher = new Reindexer("http://elastic:changeme@localhost:9200/", "http://localhost:8080/v5/graphql");

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



app.listen(3000);