import { AzureFunction, Context, HttpRequest, } from "@azure/functions";
import { handleError, NotFound, } from "./errors";
import { generateOpenApi, } from "./openapi";
import { Route, RouteOpts, } from "./route";

export * as Errors from "./errors";

interface OpenApiDefinition {
  "2"?: object
  "3"?: object
}

interface OpenRouteArgs {
  openApiDef?: OpenApiDefinition
  basePath?: string
  hostname?: string
  protocol?: string
  cors?: CorsOptions
}

export interface CorsOptions {
  allowHeaders?: string[]
  allowMethods?: string[]
  allowOrigin: string
}

export class OpenRoute {
    routes: Route[];
    openApiDef: OpenApiDefinition;
    basePath: string;
    hostname: string;
    protocol: string;
    cors: CorsOptions;

    constructor({ openApiDef, basePath, hostname, protocol, cors, }: OpenRouteArgs) {
        this.routes = [
            {
                method: "GET", path: "/openapi", opts: {}, handler: (context: Context, req: HttpRequest) => {
                    const version = req.query.version || "2";
                    context.res = {
                        headers: Object.assign(context.res.headers, { "Content-Type": "application/json", }),
                        body: this.generateOpenApi(version, req),
                    };
                },
            },
        ];
        this.openApiDef = openApiDef || null;
        this.basePath = basePath || null;
        this.hostname = hostname || null;
        this.protocol = protocol || null;
        this.cors = cors || null;
    }

    route(routeOpts: RouteOpts, handler: AzureFunction) {
        const method = ["get", "post", "delete", "put",].find((m) => routeOpts[m]);
        this.routes.push({ method, path: routeOpts[method], opts: {}, handler, });
    }

    matchRoute(path: string[], method: string): AzureFunction | null {
        const matchedRoute = this.routes.find((route) => {
            return (route.path === "/" + path.join("/")) &&
        (route.method.toUpperCase() === method);
        }) || null;

        if (matchedRoute) {
            return matchedRoute.handler;
        }

        if (this.cors && method === "OPTIONS") {
            const preflightRoute = this.routes.find((route) => {
                return (route.path === "/" + path.join("/"));
            }) || null;
      
            if (preflightRoute) {
                return (context: Context, _req:HttpRequest) => {
                    context.res = {
                        headers: this.defaultHeaders(),
                        status: 204,
                        body: "",
                        isRaw: true,
                    };
                };
            }
        }
        return null;
    }

    generateCorsHeaders(): { [key: string]: string } {
        const corsHeaders = {};
        if (this.cors) {
            if (this.cors.allowOrigin) corsHeaders["Access-Control-Allow-Origin"] = this.cors?.allowOrigin;
            if (this.cors.allowHeaders) corsHeaders["Access-Control-Allow-Headers"] = this.cors?.allowHeaders?.join(",");
            if (this.cors.allowMethods) corsHeaders["Access-Control-Allow-Methods"] = this.cors?.allowMethods?.join(",");
        }
        return corsHeaders;
    }

    defaultHeaders(): { [key: string]: string } {
        const headers = {};
        Object.assign(headers, this.generateCorsHeaders());
        return headers;
    }

    getHttpTrigger(): AzureFunction {
        return async (context: Context, req: HttpRequest) => {
            const url = new URL(req.url);
            const paths = url.pathname.substr(1).split("/");
            const handler = this.matchRoute(paths.slice(2), req.method);
            if (handler) {
                try {
                    await handler.call(this, context, req);
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
