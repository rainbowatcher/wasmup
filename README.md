[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/rainbowatcher/wasmup/ci.yml)](https://github.com/rainbowatcher/wasmup/actions)
![GitHub License](https://img.shields.io/github/license/rainbowatcher/wasmup)
[![NPM Version](https://img.shields.io/npm/v/wasmup)](https://www.npmjs.com/package/wasmup)

# wasmup

Wasm build, made easy

> [!WARNING]
> It's in early development status, use in your own risk.

## features

- Build a set of code that can run seamlessly in Node.js, Deno, Bun, and browsers.
- No setup needed, just use directly.
- The generated package.json in pretty order.
- Add parameter validation to functions.

## Usage

```sh
pnpm install -D wasmup
```

```jsonc
{
    // ...
    "scripts": {
        "build": "wasmup build --clean ."
    }
}
```

### Runtime usage (Node.js / Bun / Deno / Web)

Use the same ESM API in all runtimes:

```ts
import init, { hello_world } from "your-wasm-package"

await init()
console.log(hello_world())
```

For sync initialization:

1. `initSync` is only supported in Node.js, Bun and Deno.
2. `initSync` is not supported in browsers.

For browser deployment:

1. Keep `index_bg.wasm` accessible by URL.
2. `index_bg.wasm` should be deployed next to the generated JS entry (or with an equivalent URL mapping).

### Configuration

The Wasmup configuration file may be named any of the following:

- `wasmup.config.js`
- `wasmup.config.cjs`
- `wasmup.config.mjs`
- `wasmup.config.ts`
- `wasmup.config.mts`
- `wasmup.config.cts`
- `wasmup.config.json`

It should be placed in the root directory of your project and export an configuration objects. Here’s an example:

```ts
import { defineConfig } from "wasmup"

export default defineConfig({
    clean: true,
    output: "packages/toml-edit-js",
    scope: "rainbowatcher",
})
```

### wasm-opt options

you can pass wasm-opt params by config in Cargo.toml, details ref to this link: [cargo-toml-configuration](https://rustwasm.github.io/docs/wasm-pack/cargo-toml-configuration.html)

```toml
[package.metadata.wasm-pack.profile.release]
wasm-opt = [
    # Optimize level 4
    "-O4",
    # Run passes to convergence, continuing while binary size decreases
    "--converge",
    "--strip-debug",
    "--strip-dwarf",
    # flattens out code, removing nesting
    "--flatten",
    # inline small functions
    "--inlining",
    # removes unreachable code
    "--dead-code-elimination",
    "--minify-imports-and-exports-and-modules",
    # Grand Unified Flow Analysis
    "--gufa",
]
```

## License

[MIT](./LICENSE) &copy; Made by ❤️
