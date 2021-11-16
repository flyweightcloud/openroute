import { Context, HttpRequest } from "@azure/functions";
import { SwaggerOperationObject } from "@flyweight.cloud/swaggerist";
import { OpenRoute } from ".";

type RequireOnlyOne<T, Keys extends keyof T = keyof T> =
    Pick<T, Exclude<keyof T, Keys>>
    & {
        [K in Keys]-?:
            Required<Pick<T, K>>
            & Partial<Record<Exclude<Keys, K>, undefined>>
    }[Keys];

type AzureHandler = (context: Context, req: HttpRequest) => void;
type AzureHandlerAsync = (context: Context, req: HttpRequest) => Promise<void>;
type OpenRouteHandler = (context: Context, req: HttpRequest, openRoute: OpenRoute) => void;
type OpenRouteHandlerAsync = (context: Context, req: HttpRequest, openRoute: OpenRoute) => Promise<void>;

export interface Route {
    path: string
    method: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    opts: any
    handler: AzureHandler | OpenRouteHandler | AzureHandlerAsync | OpenRouteHandlerAsync
}

interface RouteOptsAll {
    get?: string
    post?: string
    delete?: string
    put?: string
    patch?: string
    swagger?: SwaggerOperationObject
}

export type RouteOpts = RequireOnlyOne<RouteOptsAll, "get" | "post" | "delete" | "put">;
