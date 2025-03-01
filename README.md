[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/rainbowatcher/wasmup/ci.yml)](https://github.com/rainbowatcher/wasmup/actions)
![GitHub License](https://img.shields.io/github/license/rainbowatcher/wasmup)
[![NPM Version](https://img.shields.io/npm/v/wasmup)](https://www.npmjs.com/package/wasmup)

# wasmup

Wasm build, made easy

> [!WARN]
> It's in early development status, use in your own risk.

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
