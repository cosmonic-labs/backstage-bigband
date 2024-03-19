export namespace BackstagePluginsBackstageFrontendPlugin {
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
  componentClassName?: string,
  contents: string,
}
