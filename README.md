# Backstage extended with WebAssembly: 🥁 🎸 🎤 `bigband`

This repository contains examples and code to display a new pattern in developing backstage plugins -- integration with [WebAssembly][wasm].

This experimental new technique relies on new standards and advanced features of WebAssembly, to take a WebAssembly binary built for `$LANGUAGE`, and converts that binary into the Javascript necessary

[wasm]: https://webassembly.org

## How it works

Assuming your favorite language (referred to as `$LANGUAGE`) has support for WebAssembly along with [WASI][wasi] preview1 (for example, in Rust this means the `wasm32-wasi` compilation target), you can build a WebAssembly binary that fulfills the WIT contract for the kind of plugin you care about. 

### 1. Build a program that compiles to WebAssembly 

For example, here's the WIT contract for a Backstage frontend plugin:

```wit
package backstage:plugins;

interface backstage-frontend-plugin {
  /// A representation of a node dependency (one that might be installed via `npm install`/`yarn add`)
  record node-dependency {
    /// Name of the dependency (ex. 'react')
    name: string,
    /// Version of the dependency
    version: option<string>,
    /// Whether this is a development-only dependency
    dev: bool,
  }

  // Get node dependencies that need to be installed
  get-node-deps: func() -> result<list<node-dependency>, string>;

  /// Files that make up React components to be used in in the frontend plugin
  record component-file {
    /// Path to the component file from the (root: `<project>/src/components`)
    /// ex. MyComponent/
    path: string,

    /// Whether this component is the root component for the plugin
    is-root: bool,

    /// Name of the component (used if this file represents a React component)
    /// This should be specified if is_root is specified
    component-class-name: option<string>,

    /// Contents of the
    contents: string,
  }

  /// Get the files that make up the frontend of the component
  get-component-files: func() -> result<list<component-file>, string>;
}

world plugin {
    export backstage-frontend-plugin;
}
```

As frontend plugins are essentially chunks of the Backstage frontend application, they primarily are concerned with packaging React components and related dependencies, so they can be installed/available when  Backstage runs. Backend plugins are a little different (you can read [that WIT definition as well](./packages/cli/wit/backstage-backend-plugin.wit)).

For an example of how to build this, see the [Examples](#examples) section below.

> [!NOTE]
> *How* you build your WebAssembly binary is inherently `$LANGUAGE`-specific!
>
> For example, in Rust the primary way to build general WebAssembly binaries is with [`cargo component`][cargo-component], but your 
> language likely has different toolchain/requirements/setup.

[cargo-component]: https://crates.io/crates/cargo-component

### 2. Generate a Backstage plugin from your binary

Once you have a binary that fulfills the above contract, you can run it like so:

```
bigband generate \
    --plugin-type frontend \
    --plugin-id your-plugin \
    --wasm-binary path/to/your/plugin.wasm \
    --output-dir /tmp/output \
    --backstage-dir path/to/your/local/backstage/repository
```

Running the above command will take your WASM plugin built in `$LANGUAGE`, execute it to reveal important information/configuration, then generate a Backstage plugin. After generating the Backstage plugin it will actually modify your backstage repository in order to install that plugin.

To read the code for the CLI yourself, check out [`packages/cli`](./packages/cli).

### 3. Start Backstage

Assuming the installation command has executed successfully, you can run `yarn dev` from your local Backstage repository and view your new plugin.

For example, if your frontend plugin ID was `new-plugin`, you can visit `localhost:3000/new-plugin` to view the generated frontend.

## Examples

To see how frontend and backend modules are implemented, jump to the relevant code for each:

| Language  | Plugin Type | Start here                                                                  |
|-----------|-------------|-----------------------------------------------------------------------------|
| Rust (🦀) | Frontend    | [`./examples/rust/frontend-plugin/src/lib.rs`][example-rust-frontend-librs] |
| Rust (🦀) | Backend     | [`./examples/rust/backend-plugin/src/lib.rs`][example-rust-backend-librs]   |
    
[example-rust-frontend-librs]: ./examples/rust/frontend-plugin/src/lib.rs
[example-rust-backend-librs]: ./examples/rust/backend-plugin/src/lib.rs

## Thanks

This project (`bigband`) works thanks to the help of pioneering projects and communities in the WebAssembly space:

- [Bytecode Alliance][bca]
- [`jco`][jco]
- [`wasmtime`][wasmtime]

[bca]: https://bytecodealliance.org/
[jco]: https://bytecodealliance.github.io/jco
[wasmtime]: https://wasmtime.dev

