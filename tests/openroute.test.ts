import { Context, HttpRequest, } from "@azure/functions";
import { runStubFunctionFromBindings, createHttpTrigger, } from "stub-azure-function-context";

import { OpenRoute, Errors, } from "../src/index";
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

    test("should route errors correctly", async () => {
        const app = new OpenRoute({
            cors: {
                allowOrigin: "*",
                allowHeaders: ["*",],
                allowMethods: ["*",],
            },
        });
        app.route({ get: "/error", }, async (_context: Context, _req: HttpRequest): Promise<void> => {
            throw new Error("plain error");
        });
        app.route({ get: "/http_error", }, async (_context: Context, _req: HttpRequest): Promise<void> => {
            throw new Errors.HttpError("http error", 405);
        });
        const plainError = await runStubFunctionFromBindings(app.getHttpTrigger(), [
            { type: "httpTrigger", name: "req", direction: "in", data: createHttpTrigger("GET", "http://example.com/api/fn/error"), },
            { type: "http", name: "res", direction: "out", },
        ], null,  Date.now());
        expect(plainError.res.status).toEqual(500);
        expect(plainError.res.headers).toEqual({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
        });
        expect(plainError.res.body.error.status).toEqual(500);
        expect(plainError.res.body.error.message).toEqual("plain error");
        expect(plainError.res.body.error.name).toEqual("Error");

        const httpError = await runStubFunctionFromBindings(app.getHttpTrigger(), [
            { type: "httpTrigger", name: "req", direction: "in", data: createHttpTrigger("GET", "http://example.com/api/fn/http_error"), },
            { type: "http", name: "res", direction: "out", },
        ], null,  Date.now());

        expect(httpError.res.headers).toEqual({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
        });

        expect(httpError.res.status).toEqual(405);
        expect(httpError.res.body.error.message).toEqual("http error");
        expect(httpError.res.body.error.name).toEqual("HttpError");


    });
});