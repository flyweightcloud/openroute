import { Context, HttpRequest } from "@azure/functions";
import {findRouteMatch, matchPathRequest} from "../src/matchers";
import { RouteHandler } from "../src/types";

describe("Matching a request path to a definition", () => {
    test("should match basic routes", () => {
        const match = matchPathRequest("/", "/")
        expect(match).not.toBeNull()
    })

    test("should match routes with bindingData", () => {
        let match = matchPathRequest("/foo/{id}", "/foo/123")
        expect(match.bindingData.id).toBe("123")

        match = matchPathRequest("/weather/{zipCode}", "/weather/30309")
        expect(match.bindingData.zipCode).toBe("30309")

        match = matchPathRequest("/foo/{id}/baz", "/foo/123/baz")
        expect(match.bindingData.id).toBe("123")

        match = matchPathRequest("/foo/{id}/baz/{query}", "/foo/123/baz/bar")
        expect(match.bindingData.id).toBe("123")
        expect(match.bindingData.query).toBe("bar")

        match = matchPathRequest("/foo/{id}/baz/{query}", "/foo/123/baz/foo%2Ffoo%2Fbaz%20%26%20bar")
        expect(match.bindingData.id).toBe("123")
        expect(match.bindingData.query).toBe("foo/foo/baz & bar")

        match = matchPathRequest("/foo/{id}/baz/{query}", "/foo/123/baz")
        expect(match).toBeNull()

        match = matchPathRequest("/foo/{id}", "/foo/123/baz")
        expect(match).toBeNull()

        match = matchPathRequest("/foo", "/bar")
        expect(match).toBeNull()
    })
})

describe("Matching a request path to a route", () => {
    const handler = (_context: Context, _req: HttpRequest) => { return null }
    test("should handle regular paths", () => {
        const routes: RouteHandler[] = [
            {path: "/foo", method: "get", handler},
            {path: "/post/something", method: "post", handler},
            {path: "/weather/{zipCode}", method: "get", handler},
            {path: "/org/{orgId}/user/{userId}", method: "get", handler},
        ]

        let match = findRouteMatch(routes, "/foo", "get")
        expect(match).not.toBeNull()

        match = findRouteMatch(routes, "/post/something", "post")
        expect(match).not.toBeNull()

        match = findRouteMatch(routes, "/post/something/else", "post")
        expect(match).toBeNull()

        match = findRouteMatch(routes, "/weather/30309", "get")
        expect(match).not.toBeNull()
        expect(match.pathMatch.bindingData.zipCode).toBe("30309")

    })
})
