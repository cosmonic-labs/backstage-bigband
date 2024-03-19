export namespace BackstagePluginsBackend {
  export function getRoutes(): RouteDefinition[];
}
/**
 * # Variants
 * 
 * ## `"get"`
 * 
 * ## `"post"`
 * 
 * ## `"delete"`
 * 
 * ## `"patch"`
 * 
 * ## `"put"`
 */
export type HttpMethod = 'get' | 'post' | 'delete' | 'patch' | 'put';
export interface RouteDefinition {
  path: string,
  method: HttpMethod,
}
