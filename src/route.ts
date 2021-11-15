import { AzureFunction } from "@azure/functions";
import { SwaggerOperationObject } from "../../swaggerist/lib";

type RequireOnlyOne<T, Keys extends keyof T = keyof T> =
    Pick<T, Exclude<keyof T, Keys>>
    & {
        [K in Keys]-?:
            Required<Pick<T, K>>
            & Partial<Record<Exclude<Keys, K>, undefined>>
    }[Keys];

export interface Route {
    path: string
    method: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    opts: any
    handler: AzureFunction
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
