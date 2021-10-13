import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { handleError, NotFound } from "./errors";
import { generateOpenApi } from "./openapi";
import { Route, RouteOpts } from "./route";

interface OpenApiDefinition {
    "2"?: object
    "3"?: object
}

interface OpenRouteArgs {
    openApiDef?: OpenApiDefinition
    basePath?: string
    hostname?: string
    protocol?: string
}

export class OpenRoute {
    routes: Route[];
    openApiDef: OpenApiDefinition;
    basePath: string;
    hostname: string;
    protocol: string;

    constructor({openApiDef, basePath, hostname, protocol}: OpenRouteArgs) {
        this.routes = [
            {method: "GET", path: "/openapi", opts: {}, handler: (context: Context, req: HttpRequest) => {
                const version = req.query.version || "2";
                const headers = { "Content-Type": "application/json" };
                context.res = {
                    headers,
                    body: this.generateOpenApi(version, req),
                };
            }},
        ];
        this.openApiDef = openApiDef || null;
        this.basePath = basePath || null;
        this.hostname = hostname || null;
        this.protocol = hostname || null;
    }

    route(routeOpts: RouteOpts, handler: AzureFunction) {
        const method = ["get", "post", "delete", "put"].find((m) => routeOpts.hasOwnProperty(m));
        this.routes.push({method, path: routeOpts[method], opts: {}, handler});
    }

    matchRoute(path: string[], method: string): Route | null {
        return this.routes.find((route) => {
            return (route.path === "/" + path.join("/")) &&
            (route.method.toLowerCase() === method.toLowerCase());
        }) || null;
    }

    getHttpTrigger(): AzureFunction {
        return async (context: Context, req: HttpRequest) => {
            const url = new URL(req.url);
            const paths = url.pathname.substr(1).split("/");
            const route = this.matchRoute(paths.slice(2), req.method);
            if (route) {
                try {
                    await route.handler.call(this, context, req);
                } catch (err) {
                    handleError(err, context);
                }
            } else {
                handleError(new NotFound("Couldn't find a matching route"), context);
            }
        };
    }

    generateOpenApi(version?: string, request?: Pick<HttpRequest, "url">): string {
        return generateOpenApi(version || "2", this, request);
    }

}
