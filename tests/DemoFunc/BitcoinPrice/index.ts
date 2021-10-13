import { Context, HttpRequest } from "@azure/functions";
import { get } from "@flyweight.cloud/request";
import { OpenRoute } from "../../../src/index";
import swaggerFile from "./openapitwo.js";


const app = new OpenRoute({
    openApiDef: {
        "2": swaggerFile,
    },
});


app.route({ get: "/usd"}, async (context: Context, req: HttpRequest): Promise<void> => {
    context.log("HTTP trigger function processed a request.");

    const btcPriceResp = await get("https://api.coindesk.com/v1/bpi/currentprice.json");

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: {
            "BTC-USD": btcPriceResp.json.bpi.USD.rate,
        },
        headers: {"Content-Type": "application/json"},
    };

});

app.route({get: "/gbp"}, async (context: Context, req: HttpRequest): Promise<void> => {
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