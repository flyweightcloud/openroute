# Flyweight OpenRoute

A lightweight framework for building Swagger/OpenAPI serverless functions

## Installation

`npm i --save @flyweight.cloud/openroute`

## Usage

The goal is for OpenRoute to require little to no modification of your Azure handlers


```
import { Context, HttpRequest } from "@azure/functions";
import { get } from "@flyweight.cloud/request";
import Swaggerist, { buildSchema, Responses, SwaggeristBaseDefinition, SwaggerOperationObject } from "@flyweight.cloud/swaggerist";
import { OpenRoute } from "@flyweight.cloud/openroute";

const swaggerDef: SwaggeristBaseDefinition = {
    info:   {
        title: "Bitcoin Price API",
        description: "The price of bitcoin in USD and GBP",
        version: "1.0.0",
    }
}

const app = new OpenRoute({
    swaggerist: Swaggerist.create(swaggerDef),
});


// Define our API using Swagger
const usdApiDef: SwaggerOperationObject = {
  operationId: "getUsdPrice",
  responses: {
    200: Responses.Success({...buildSchema({'BTC-USD': {type:'number'}}), description: "USD price"}),
  }
}

app.route({ get: "/usd", swagger: usdApiDef}, async (context: Context, req: HttpRequest): Promise<void> => {
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
```

You will also need to modify function.json to add a 'catch-all' route
`"route": "BitcoinPrice/{*route}"`

Check out DemoFunc to see the full featured function and it's settings.
