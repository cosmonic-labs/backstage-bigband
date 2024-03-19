export namespace BackstagePluginsFrontend {
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
