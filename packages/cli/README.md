# `bigband-cli` - Backstage Plugins in any language using WebAssembly

Generate Backstage [Frontend plugins][backstage-docs-frontend-plugin] and [Backend plugins][backstage-docs-backend-plugin] with `bigband-cli`!

[backstage-docs-frontend-plugin]: https://backstage.io/docs/frontend-system/building-plugins/index/
[backstage-docs-backend-plugin]: https://backstage.io/docs/plugins/backend-plugin/

## How it works

This plugin works by taking in a [WebAssembly][wasm] binary file compiled from your favorite $LANGUAGE, and generating a JS-based Backstage plugin out of it, and installed into your Backstage installation.

[wasm]: https://webassembly.org

## Quickstart

First, install the `bigband-cli` CLI into your javascript project:

```console
npm install -D bigband-cli
```

> [!NOTE]
> Here we use a project-local, development-only installation -- you can also install `bigband` globally if you'd like.

Once the CLI is installed, you can point it at a WebAssembly binary and supply some options to build a Backstage plugin:

```console
bigband generate \
    --plugin-type frontend \
    --plugin-id your-plugin \
    --wasm-binary path/to/your/plugin.wasm \
    --output-dir output \
    --backstage-dir path/to/your/backstage/code
```

## Context

### What is WebAssembly?

[WebAssembly][wasm] is a new compilation target (think Java bytecode, Python bytecode, `x86_64` or `arm64` machine code) for programming languages. WebAssembly comes with many features:

- Isolated by default (at the most basic level, all your computation has access to is numbers and numeric operations)
- Runs everywhere (thanks to it's extremely reduced data set)
- Near-native execution speed (thanks to many compiler optimizations and painstaking design)

While WebAssembly was originally designed to run on the web, thanks to extensive work done by the [Bytecode Alliance][bca] WebAssembly has been generalized so that it can run on in web browsers *and* server or desktop contexts.

By using a a standards-compliant runtime like [`wasmtime`][wasmtime], you can:

1. Write code in your favorite $LANGUAGE
2. Compile that code to an alternate WebAssembly speicific compilation target (ex. `wasm32-wasi`, as opposed to `amd64`, `arm64`, Python bytecode, Java bytecode)
3. Run `wasmtime` from inside an existing program or separately to execute your WebAssembly

[wasmtime]: https://wasmtime.dev
[bca]: https://bytecodealliance.org

### How does WebAssembly integrate with Backstage?

Since Backstage plugins are normally written in Javascript, this CLI takes the approach of *tranpsiling* WebAssembly to Javascript, and bundling that generated Javascript into the form a Backstage plugin should take.

The form this requires is quite different for frontend and backend apps, but essentially:

- Frontend apps are required to produce the JS code that powers React components which will be served and used
- Backend apps are required to perform functionality for incoming requrests to registered endpoints

To effectively create a frontend or backend application, we use the [WebAssembly Interface Types (WIT)][wit] standard to make the requirements for these two types of plugins concrete. See the two related WIT files (which should be quite readable):

- [`wit/backstage-frontend-plugin.wit`](./wit/backstage-frontend-plugin.wit)
- [`wit/backstage-backend-plugin.wit`](./wit/backstage-backend-plugin.wit)

## Build from source

To build the code in this repository:

```console
npm run build
```

## Run from source

If you wanted to build the example backend of the examples from source, you could run the following command to use the local build:

```console
export WASM_BINARY_PATH=$(realpath ../../examples/rust/frontend-plugin/target/wasm32-wasi/debug/backstage_rust_frontend_plugin.wasm)
export BACKSTAGE_DIR=/path/to/your/backstage/dir
node dist/index.mjs generate \
    --plugin-type frontend \
    --plugin-id example-frontend \
    --wasm-binary $WASM_BINARY_PATH \
    --output-dir /tmp/output-frontend \
    --backstage-dir $BACKSTAGE_DIR
```

> [!WARNING]
> Note that the code above uses *debug* builds of the binaries -- you may want to use release builds for smaller and faster binaries

To run the *backend* example, you can run a similar command, pointing at a separately built binary:

```console
export WASM_BINARY_PATH=$(realpath ../../examples/rust/backend-plugin/target/wasm32-wasi/debug/backstage_rust_backend_plugin.wasm)
export BACKSTAGE_DIR=/path/to/your/backstage/dir
node dist/index.mjs generate \
    --plugin-type backend \
    --plugin-id example-backend \
    --wasm-binary $WASM_BINARY_PATH \
    --output-dir /tmp/output-backend \
    --backstage-dir $BACKSTAGE_DIR
```
