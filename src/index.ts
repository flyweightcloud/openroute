import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as errors from "./errors";
import { Route, RouteOpts } from "./route";
import Swaggerist, { SwaggerObject, SwaggerPathItemObject } from "@flyweight.cloud/swaggerist"
import { buildSwaggerUiRoute } from "./swagger-ui";


export const Errors = errors;

interface OpenApiDefinition {
  "2"?: object
  "3"?: object
}

type SwaggerBuilder = Pick<Swaggerist, "generate" | "addPath" >

interface OpenRouteArgs {
  openApiDef?: OpenApiDefinition
  basePath?: string
  hostname?: string
  protocol?: string
  cors?: CorsOptions
  swaggerist?: SwaggerBuilder;
}

export interface CorsOptions {
  allowHeaders?: string[]
  allowMethods?: string[]
  allowOrigin: string
}

export class OpenRoute {
    routes: Route[];
    swaggerist: SwaggerBuilder;
    openApiDef: OpenApiDefinition;
    basePath: string;
    hostname: string;
    protocol: string;
    cors: CorsOptions;

    constructor({ openApiDef, basePath, hostname, protocol, cors, swaggerist}: OpenRouteArgs) {
        this.routes = [
            {
                method: "GET", path: "/openapi", opts: {}, handler: (context: Context, req: HttpRequest) => {
                    const version = req.query.version || "2";
                    context.res = {
                        headers: Object.assign(context.res.headers, { "Content-Type": "application/json" }),
                        body: this.generateOpenApi(version, req),
                    };
                },
            },
            {
                method: "GET", path: "/swagger-ui", opts: {}, handler: buildSwaggerUiRoute(this)
            },
        ];
        this.openApiDef = openApiDef || {};
        this.basePath = basePath || null;
        this.hostname = hostname || null;
        this.protocol = protocol || null;
        this.cors = cors || null;
        this.swaggerist = swaggerist || null;
    }

    route(routeOpts: RouteOpts, handler: AzureFunction) {
        const method = ["get", "post", "delete", "put"].find((m) => routeOpts[m]);
        this.routes.push({ method, path: routeOpts[method], opts: {}, handler });
        if (routeOpts.swagger) {
            this.swaggerist.addPath(`$$BASE_PATH$$${routeOpts[method]}`, {[method]: routeOpts.swagger} as SwaggerPathItemObject);
        }
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

    defaultHeaders(additionalHeaders:{[key: string]: string}={}): { [key: string]: string } {
        const headers = {
            "Content-Type": "application/json",
        };
        Object.assign(headers, this.generateCorsHeaders());
        Object.assign(headers, additionalHeaders); // Allow for easy overrides and additional headers
        return headers;
    }

    handleError(err: Error, context: Context) {
        const headers = this.defaultHeaders();
        let status = 500;

        if (err instanceof errors.HttpError) {
            status = err.status;
        }

        context.res = {
            headers,
            status,
            body: {
                error: {
                    name: err.name || err.constructor.name,
                    message: err.message,
                    status,
                },
            },
        }
    }

    getHttpTrigger(): AzureFunction {
        return async (context: Context, req: HttpRequest) => {
            const url = new URL(req.url);
            const paths = url.pathname.substr(1).split("/");
            const handler = this.matchRoute(paths.slice(2), req.method);
            if (handler) {
                try {
                    await handler(context, req, this);
                } catch (err) {
                    this.handleError(err, context);
                }
            } else {
                this.handleError(new errors.NotFound("Couldn't find a matching route"), context);
            }
        };
    }

    generateOpenApi(version: string, request: Pick<HttpRequest, "url">): SwaggerObject | object {
        if (version === "2" && this.openApiDef["2"]) {
            return this.openApiDef["2"];
        } else if (version === "3" && this.openApiDef["3"]) {
            return this.openApiDef["3"];
        }
        const url = new URL(request.url);
        const basePath = "/" + url.pathname.slice(1).split("/").slice(0, 2).join("/");
        return this.swaggerist.generate(version, { host: url.host, scheme: url.protocol.slice(0, -1), basePath });
    }

}
