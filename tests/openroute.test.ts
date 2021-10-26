import { Context, HttpRequest, } from "@azure/functions";
import { runStubFunctionFromBindings, createHttpTrigger, } from "stub-azure-function-context";

import { OpenRoute, } from "../src/index";
import swaggerFile from "./swagger_example";

describe("Simple function", () => {
    test("should return valid swagger if setup", async () => {
        const app = new OpenRoute({
            openApiDef: {
                "2": swaggerFile,
            },
        });

        app.route({ get: "/foo", }, async (context: Context, _req: HttpRequest): Promise<void> => {
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: [
                    { id: "123", status: "closed", },
                ],
            };

        });
        const openApiDoc = JSON.parse(app.generateOpenApi("2", { url: "https://foo.com/api/BTC/somefunction", }));
        expect(openApiDoc.host).toEqual("foo.com");
        expect(openApiDoc.schemes[0]).toEqual("https");
        expect(openApiDoc.paths).toHaveProperty("/api/BTC/usd");
    });

    test("should route correctly", async () => {
        const app = new OpenRoute({
            cors: {
                allowOrigin: "*",
                allowHeaders: ["*",],
                allowMethods: ["*",],
            },
        });
        app.route({ get: "/foo", }, async (context: Context, _req: HttpRequest): Promise<void> => {
            context.res = {
                headers: app.defaultHeaders(),
                body: [
                    { id: "123", status: "closed", },
                ],
            };
        });
        const optionRes = await runStubFunctionFromBindings(app.getHttpTrigger(), [
            { type: "httpTrigger", name: "req", direction: "in", data: createHttpTrigger("OPTIONS", "http://example.com/api/fn/foo"), },
            { type: "http", name: "res", direction: "out", },
        ], null,  Date.now());
        expect(optionRes.res.isRaw).toEqual(true);
        expect(optionRes.res.status).toEqual(204);
        expect(optionRes.res.headers).toEqual({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
        });
        const getRes = await runStubFunctionFromBindings(app.getHttpTrigger(), [
            { type: "httpTrigger", name: "req", direction: "in", data: createHttpTrigger("GET", "http://example.com/api/fn/foo"), },
            { type: "http", name: "res", direction: "out", },
        ], null, Date.now());
        expect(getRes.res.body[0].id).toEqual("123");
        expect(getRes.res.headers).toEqual({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
        });
    });
});