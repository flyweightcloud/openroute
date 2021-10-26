import { HttpRequest, } from "@azure/functions";
import { OpenRoute, } from ".";
import { NotFound, } from "./errors";

// Initial naive implementation of replacing HOSTNAME and BASE_PATH in a swagger doc
// The goal being to not have to worry about where this runs or under what path during
// development
function renderOpenApi(doc: object, {hostname, basePath, protocol,}:{hostname?: string, basePath?: string, protocol?: string}): string {
    let str = JSON.stringify(doc, null, 2);
    if (hostname) str = str.replace(/\$__HOSTNAME__/g, hostname);
    if (basePath) str = str.replace(/\$__BASE_PATH__/g, basePath);
    if (protocol) str = str.replace(/\$__PROTOCOL__/g, protocol);
    return str;
}

export const generateOpenApi = (version: string, openRouteApp: OpenRoute, request?: Pick<HttpRequest, "url">): string => {
    const { openApiDef, }= openRouteApp;
    let { hostname, basePath, protocol, } = openRouteApp;
    if (request) {
        const url = new URL(request.url);
        basePath = basePath ?? "/" + url.pathname.substr(1).split("/").slice(0, 2).join("/");
        hostname = hostname ?? url.hostname;
        protocol = protocol ?? url.protocol.slice(0,-1);
    }
    if (version === "2" && openApiDef["2"]) {
        return renderOpenApi(openApiDef["2"], { hostname, basePath, protocol, });
    } else if (version === "3" && openApiDef["3"]) {
        return renderOpenApi(openApiDef["3"], { hostname, basePath, protocol, });
    } else {
        throw new NotFound("Swagger File Not Found for this version");
    }
};
