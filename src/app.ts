import * as Koa from "koa";
import {Reindexer, Request, isRequest} from "./datafetcher";

const app = new Koa();
const dataFetcher = new Reindexer;

app.use(async (ctx) => {
  if(ctx.method === "POST") {
    var body:Object = await getBody(ctx).then((val) => JSON.parse(val));
    console.log(body);
    if (isRequest(body)) {
      ctx.body = await dataFetcher.fetchData(body);
    }
    else {
      ctx.body = { error : "Unsupported request" };
    }
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