import { Context, HttpRequest } from "@azure/functions";
import { OpenRoute } from ".";
import { HttpError } from "./errors";

export const openApiRoute = (context: Context, req: HttpRequest, openRoute: OpenRoute) => {
    if (!openRoute.swaggerBuilder) {
        throw new HttpError("SwaggerBuilder not defined, unable to provide swagger definition", 500);
    }
    const version = req.query.version || "2";
    context.res = {
        headers: openRoute.defaultHeaders(),
        status: 200,
        body: openRoute.generateOpenApi(version, req),
    };
}

export const preflightRoute = (context: Context, _req: HttpRequest, openRoute: OpenRoute) => {
    context.res = {
        headers: openRoute.defaultHeaders(),
        status: 204,
        body: "",
        isRaw: true,
    };
};