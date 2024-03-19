# Backstage Frontend Rust Plugin powered by 🎸 `bigband`

This folder contains the code to build a functional frontend plugin for Backstage, which can be transpiled with `bigband`.

To build the Rust code:

```console
cargo component build
```

The WebAssembly binary produced (i.e. in `target/wasm32-wasi/...`) should be fed to `bigband` in an invocation similar to the following:

```console
bigband generate \
    --plugin-type frontend \
    --plugin-id your-plugin \
    --wasm-binary path/to/your/plugin.wasm \
    --output-dir /tmp/output \
    --backstage-dir path/to/your/local/backstage/repository
```
