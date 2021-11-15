import { Context, HttpRequest } from "@azure/functions";
import { get } from "@flyweight.cloud/request";
import Swaggerist, { buildSchema, Responses, SwaggeristBaseDefinition, SwaggerOperationObject } from "@flyweight.cloud/swaggerist";
import { OpenRoute } from "../../../src/index";

const swaggerDef: SwaggeristBaseDefinition = {
    info:   {
        title: "Test Swagger API",
        description: "Test Swagger API",
        version: "1.0.0",
    }
}

const app = new OpenRoute({
    swaggerist: Swaggerist.create(swaggerDef),
    cors: {
        allowOrigin: "*",
        allowHeaders: ["*"],
        allowMethods: ["*"],
    },
});


const usdApiDef: SwaggerOperationObject = {
  operationId: "getUsdPrice",
  responses: {
    200: Responses.Success({...buildSchema({'BTC-USD': {type:'number'}}), description: "USD price"}),
  }
}

app.route({ get: "/usd", swagger: usdApiDef}, async (context: Context, req: HttpRequest): Promise<void> => {
    context.log("HTTP trigger function processed a request.");

    const btcPriceResp = await get("https://api.coindesk.com/v1/bpi/currentprice.json");

    context.res.body = {
      "BTC-USD": btcPriceResp.json.bpi.USD.rate,
    };

});

const gbpApiDef: SwaggerOperationObject = {
  operationId: "getGbpPrice",
  responses: {
    200: Responses.Success({...buildSchema({'BTC-GBP': {type:'number'}}), description: "GBP price"}),
  }
}

app.route({get: "/gbp", swagger: gbpApiDef}, async (context: Context, req: HttpRequest): Promise<void> => {
    context.log("HTTP trigger function processed a request.");

    const btcPriceResp = await get("https://api.coindesk.com/v1/bpi/currentprice.json");

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: {
            "BTC-GBP": btcPriceResp.json.bpi.GBP.rate,
        },
        headers: {"Content-Type": "application/json"},
    };

});

export default app.getHttpTrigger();
