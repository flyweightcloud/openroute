import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as errors from "./errors";
import { findRouteMatch } from "./matchers";
import { RouteHandler, Route, OpenRouteHandler } from "./types";
import { buildSwaggerUiRoute } from "./swagger-ui";
import { openApiRoute, preflightRoute } from "./routes";
import { urlFromRequest } from "./utils";


export const Errors = errors;

interface OpenApiDefinition {
  "2"?: object
  "3"?: object
}

type SwaggerBuilder = {
  generate(version: string, options:{[key:string]: string}): object
}

interface OpenRouteArgs {
  openApiDef?: OpenApiDefinition
  basePath?: string
  host?: string
  protocol?: string
  cors?: CorsOptions
  swaggerBuilder?: SwaggerBuilder;
}

export interface CorsOptions {
  allowHeaders?: string[]
  allowMethods?: string[]
  allowOrigin: string
}

export class OpenRoute {
    routes: RouteHandler[];
    swaggerBuilder: SwaggerBuilder;
    openApiDef: OpenApiDefinition;
    basePath: string;
    host: string;
    protocol: string;
    cors: CorsOptions;

    constructor({ openApiDef, basePath, host, cors, swaggerBuilder}: OpenRouteArgs) {
        this.routes = [
            { method: "get", path: "/openapi", opts: {}, handler: openApiRoute },
            { method: "get", path: "/swagger-ui", opts: {}, handler: buildSwaggerUiRoute },
        ];
        this.basePath = basePath || null;
        this.host = host || null;
        this.cors = cors || null;
        this.openApiDef = openApiDef || {};
        this.swaggerBuilder = swaggerBuilder || null;
    }

    route(route: Route, handler: AzureFunction) {
        const {method, path} = route;
        this.routes.push({ method, path, opts: {}, handler });
    }

    get(path: string, handler: AzureFunction) {
        this.routes.push({ method: "get", path, opts: {}, handler });
    }

    post(path: string, handler: AzureFunction) {
        this.routes.push({ method: "post", path, opts: {}, handler });
    }

    put(path: string, handler: AzureFunction) {
        this.routes.push({ method: "put", path, opts: {}, handler });
    }

    delete(path: string, handler: AzureFunction) {
        this.routes.push({ method: "delete", path, opts: {}, handler });
    }

    patch(path: string, handler: AzureFunction) {
        this.routes.push({ method: "patch", path, opts: {}, handler });
    }

    getRelativePath(path): string {
        if (this.basePath) {
            return path.replace(this.basePath, "/")
        }

        const parts = path.split("/").filter((p) => p !== "")
        return "/" + parts.slice(2).join("/")
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
            const path = this.getRelativePath(url.pathname);
            const routeMatch = findRouteMatch(this.routes, path, req.method);
            const pathMatch = findRouteMatch(this.routes, path);


            let handler: OpenRouteHandler;
            if (routeMatch && routeMatch.route.method === req.method.toLowerCase()) {
                Object.assign(context.bindingData, routeMatch.pathMatch.bindingData)
                handler = routeMatch.route.handler;
            } else if (pathMatch && req.method.toLowerCase() === "options") {
                handler = preflightRoute;
            }

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

    generateOpenApi(version: string, request: Pick<HttpRequest, "url" | "headers">): object {
        if (version === "2" && this.openApiDef["2"]) {
            return this.openApiDef["2"];
        } else if (version === "3" && this.openApiDef["3"]) {
            return this.openApiDef["3"];
        }
        const url = urlFromRequest(request)
        const basePath = this.basePath || "/" + url.pathname.slice(1).split("/").slice(0, 2).join("/");
        const host = this.host || url.host
        return this.swaggerBuilder.generate(version, { host, scheme: url.protocol.slice(0, -1), basePath });
    }

}
