import { HttpRequest } from "@azure/functions";

export const urlFromRequest = (req: Pick<HttpRequest, "url" | "headers">): URL => {
    const forwardedHeaders = ["x-forwarded-host", "x-forwarded-proto", "x-forwarded-port"]
    const headers = req.headers
    if (forwardedHeaders.every((item => Object.prototype.hasOwnProperty.call(headers, item)))) {
        const url = new URL(req.url) // Used to get the pathname
        url.protocol = headers["x-forwarded-proto"] + ":"
        url.host = headers["x-forwarded-host"]
        url.port = headers["x-forwarded-port"]
        return url
    } else {
        return new URL(req.url)
    }

}