# Flyweight OpenRoute

Zero runtime dependency for building Swagger/OpenAPI serverless functions

## Installation

`npm i --save @flyweight.cloud/openroute`

## Usage

The goal is for OpenRoute to require little to no modification of your Azure handlers

```typescript
import { Context, HttpRequest } from "@azure/functions";
import { OpenRoute } from "@flyweight.cloud/openroute";


const app = new OpenRoute({
    cors: {
        allowOrigin: "*",
        allowHeaders: ["*",],
        allowMethods: ["*",],
    },
});

app.route({ get: "/customers", }, async (context: Context, _req: HttpRequest): Promise<void> => {
    context.res = {
        headers: app.defaultHeaders(),
        body: [
            { id: "123", status: "closed", },
        ],
    };
});

app.route({ get: "/anotherRoute", }, async (context: Context, _req: HttpRequest): Promise<void> => {
    context.res = {
        headers: app.defaultHeaders(),
        body: { status: "OK" }
    };
});

export default app.getHttpTrigger();
```

You will also need to modify function.json to add a 'catch-all' route
`"route": "BitcoinPrice/{*route}"`

Check out DemoFunc to see the full featured function and it's settings.
