import { RouteHandler } from "./types"

const pathParamRegex = /\{(.*?)\}/g

type PathMatch = {
  path: string
  testPath: string
  bindingData: { [key: string]: string }
}

const trimSurrounding = (key: string) => key.slice(1, -1)
// Match /foo/bar/baz to /foo/bar/baz
// Match /foo/{id} to /foo/123

export const matchPathRequest = (path: string, testPath: string): PathMatch | null => {
  const result = {
    path: path,
    testPath: testPath,
    bindingData: {}
  }

  const pathParts = path.split("/").filter((p) => p !== '')
  const testPathParts = testPath.split("/").filter((p) => p !== '')

  if (testPathParts.length !== pathParts.length) { return null }

  for (let i = 0; i < pathParts.length; i++) {
    const pathPart = pathParts[i]
    const testPathPart = testPathParts[i]

    if (pathPart.startsWith("{") && pathPart.endsWith("}")) {
      const key = trimSurrounding(pathPart)
      result.bindingData[key] = testPathPart
    } else if (pathPart !== testPathPart) {
      return null
    }
  }

  return result
}

export type RouteMatch = {
  route: RouteHandler
  pathMatch: PathMatch
}

export const findRouteMatch = (routes: RouteHandler[], path: string, method?: string): RouteMatch | null =>{

  for (const route of routes) {
    const pathMatch = matchPathRequest(route.path, path)

    // Limit to a specific matching method
    if (method) {
      if (pathMatch && route.method === method.toLowerCase()) {
        return {
          route,
          pathMatch
        }
      }
      continue
    }

    // If no method is specified, match all methods
    if (pathMatch) {
      return {
        route,
        pathMatch
      }
    }
  }
  return null
}