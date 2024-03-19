export namespace BackstagePluginsBackstageBackendPlugin {
  export function getRoutes(): Route[];
}
export interface Route {
  method: string,
  path: string,
}
