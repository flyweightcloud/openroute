# Flyweight OpenRoute

A lightweight framework for building Swagger/OpenAPI serverless functions for consumption
by Microsoft Power Platform and beyond.

## Installation

`npm i --save @flyweight.cloud/openroute`

## Usage

The goal is for OpenRoute to require little to no modification of your Azure handlers


```typescript
import { Context, HttpRequest } from "@azure/functions"
import { get } from "@flyweight.cloud/request";
import Swaggerist, { schemaBuilder, Responses, queryParamBuilder, pathParamBuilder } from "@flyweight.cloud/swaggerist";
import { OpenRoute } from "@flyweight.cloud/openroute"
import { HttpError } from "@flyweight.cloud/openroute/lib/errors";

const API_KEY = process.env.OPENWEATHER_API_KEY;

const exampleWeatherApiResponse = {
  "coord": {
    "lon": -122.08,
    "lat": 37.39
  },
  "weather": [
    {
      "id": 800,
      "main": "Clear",
      "description": "clear sky",
      "icon": "01d"
    }
  ],
  "base": "stations"
};

const swaggerBuilder = Swaggerist.create({
  info: {
    title: "Weather API",
    description: "Flyweights demo weather API",
    version: "1.0.0",
  }
})

const app = new OpenRoute({
  swaggerBuilder,
  cors: {
    allowOrigin: "*",
    allowHeaders: ["*"],
    allowMethods: ["*"],
  }
});

const getCurrentWeatherPathRoute = swaggerBuilder.get("/current/{zipCode}", {
  operationId: "getCurrentWeatherByZip",
  parameters: [...pathParamBuilder({zipCode: "12345"})],
  responses: {
    200: Responses.Success(schemaBuilder(exampleWeatherApiResponse)),
  }
})

app.route(getCurrentWeatherPathRoute, async (context: Context, req: HttpRequest, openRoute: OpenRoute): Promise<void> => {
    context.log("HTTP trigger function processed a request.");

    const zipCode = context.bindingData.zipCode
    let url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode}&appid=${API_KEY}`
    const weather = await get(url)

    context.res = {
        body: weather.body,
        headers: openRoute.defaultHeaders(),
    };

});

export default app.getHttpTrigger();
```

You will also need to modify function.json to add a 'catch-all' route
`"route": "weather/{*route}"`

Check out [DemoFunc](https://github.com/flyweightcloud/openroute-azure-demo) to see the full featured function and it's settings.
