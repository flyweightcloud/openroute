import { Context, HttpRequest } from "@azure/functions";
import { OpenRoute } from "../src/index";
import swaggerFile from "./swagger_example";

describe("Simple function", () => {
    test("Check basic json request", async () => {
        const app = new OpenRoute({
            openApiDef: {
                "2": swaggerFile,
            },
        });
        app.route({ get: "/foo" }, async (context: Context, req: HttpRequest): Promise<void> => {
            context.res = {
                // status: 200, /* Defaults to 200 */
            body: [
                    {id: "123", status: "closed"},
                ],
            };

        });
        const openApiDoc = JSON.parse(app.generateOpenApi("2", {url: "https://foo.com/api/BTC/somefunction"}));
        expect(openApiDoc.host).toEqual("foo.com");
        expect(openApiDoc.schemes[0]).toEqual("https");
        expect(openApiDoc.paths).toHaveProperty("/api/BTC/usd");
        expect(true).toEqual(true);
    });
});