//
// NOTE: This file can be generated from any working WIT-derived WebAssembly binary,
// built with the wit-bindgen tooling (and with stubs for implementation).
//
// See package.json for jco build command
//
export namespace ComponentBackstageRustPluginBackstageFrontend {
  export function getNodeDeps(): NodeDependency[];
  export function getComponentFiles(): ComponentFile[];
}
export interface NodeDependency {
  name: string,
  version?: string,
  dev: boolean,
}
export interface ComponentFile {
  path: string,
  isRoot: boolean,
  componentName?: string,
  contents: string,
}
