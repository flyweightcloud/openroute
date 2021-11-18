import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { OpenRoute } from ".";

export type OpenRouteFunction = (context: Context, req: HttpRequest, openRoute: OpenRoute) => Promise<any> | void;

export type HttpMethod = "get" | "post" | "put" | "delete" | "options" | "head" | "patch" | "options"

export type OpenRouteHandler = AzureFunction |OpenRouteFunction;

export interface RouteHandler {
    path: string
    method: HttpMethod
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    opts?: any
    handler: OpenRouteHandler
}

export type Route = {
  method: HttpMethod
  path: string
}
