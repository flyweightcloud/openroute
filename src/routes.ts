import { Context, HttpRequest } from "@azure/functions";
import { OpenRoute } from ".";

export const openApiRoute = (context: Context, req: HttpRequest, openRoute: OpenRoute) => {
  const version = req.query.version || "2";
  context.res = {
    headers: Object.assign(context.res.headers, { "Content-Type": "application/json" }),
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