import { HttpRequest } from "@azure/functions";

export const urlFromRequest = (req: Pick<HttpRequest, "url" | "headers">): URL => {
    const forwardedHeaders = ["x-forwarded-host", "x-forwarded-proto", "x-forwarded-port"]
    const headers = req.headers
    if (forwardedHeaders.every((item => Object.prototype.hasOwnProperty.call(headers, item)))) {
        return new URL(`${headers["x-forwarded-proto"]}://${headers["x-forwarded-host"]}:${headers["x-forwarded-port"]}`)
    } else {
        return new URL(req.url)
    }

}