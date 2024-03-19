mod bindings;

use crate::bindings::exports::component::backstage_rust_plugin::backstage_frontend_plugin::{
    ComponentFile, Guest, NodeDependency,
};

/// The implementations of the contract will
/// hang off of the struct below
struct Component;

impl Guest for Component {
    fn get_node_deps() -> Result<Vec<NodeDependency>, String> {
        return Ok(vec![
            NodeDependency {
                name: "react".into(),
                version: None,
                dev: false,
            },
            NodeDependency {
                name: "@material-ui/core".into(),
                version: None,
                dev: false,
            },
            NodeDependency {
                name: "@backstage/core-components".into(),
                version: None,
                dev: false,
            },
        ]);
    }

    fn get_component_files() -> Result<Vec<ComponentFile>, String> {
        // NOTE: these paths are available *under* `src/components` in the produced plugin
        return Ok(vec![
            ComponentFile {
                path: "ExampleComponent/ExampleComponent.tsx".into(),
                is_root: true,
                component_class_name: Some("ExampleComponent".into()),
                contents: String::from(include_str!(
                    "../public/components/ExampleComponent/ExampleComponent.tsx"
                )),
            },
            ComponentFile {
                path: "ExampleComponent/index.ts".into(),
                is_root: false,
                component_class_name: None,
                contents: String::from(include_str!(
                    "../public/components/ExampleComponent/index.ts"
                )),
            },
            ComponentFile {
                path: "ExampleFetchComponent/ExampleFetchComponent.tsx".into(),
                is_root: false,
                component_class_name: Some("ExampleFetchComponent".into()),
                contents: String::from(include_str!(
                    "../public/components/ExampleFetchComponent/ExampleFetchComponent.tsx"
                )),
            },
            ComponentFile {
                path: "ExampleFetchComponent/index.ts".into(),
                is_root: false,
                component_class_name: None,
                contents: String::from(include_str!(
                    "../public/components/ExampleFetchComponent/index.ts"
                )),
            },
        ]);
    }
}

bindings::export!(Component with_types_in bindings);
