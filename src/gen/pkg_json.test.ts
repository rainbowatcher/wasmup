import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import {
    afterEach, describe, expect, it,
} from "vitest"
import { generatePkgJson } from "./pkg_json"
import type { BuildContext, BuildOptions } from "../types"

function makeBuildOptions(output: string): BuildOptions {
    return {
        clean: false,
        dev: false,
        dry: false,
        entry: [],
        extensions: ["js", "ts", "wasm"],
        ignoreOutput: false,
        output,
        profiling: false,
        shims: true,
    }
}

describe("generatePkgJson", () => {
    const tempDirs: string[] = []

    afterEach(async () => {
        await Promise.all(tempDirs.map(dir => rm(dir, { force: true, recursive: true })))
        tempDirs.length = 0
    })

    it("should expose wasm subpath export for npm consumers", async () => {
        const root = await mkdtemp(path.join(os.tmpdir(), "wasmup-pkg-"))
        tempDirs.push(root)

        const entry = path.join(root, "crate")
        const outputDir = path.join(root, "dist")
        await mkdir(path.join(entry, "src"), { recursive: true })
        await mkdir(outputDir, { recursive: true })
        await writeFile(path.join(entry, "Cargo.toml"), `
[package]
name = "demo-crate"
version = "0.1.0"
description = "demo"
license = "MIT"
`)
        await writeFile(path.join(outputDir, "index.js"), "export {}")
        await writeFile(path.join(outputDir, "index_bg.wasm"), "")
        await writeFile(path.join(outputDir, "shims.js"), "export {}")
        await writeFile(path.join(outputDir, "shims.d.ts"), "export {}")

        const opts = makeBuildOptions(outputDir)
        const context: BuildContext = { entry, opts, outputDir }
        const pkg = await generatePkgJson(context)

        expect(pkg.exports).toStrictEqual({
            ".": "./shims.js",
            "./index": "./index.js",
            "./index_bg.wasm": "./index_bg.wasm",
        })
        expect(pkg.files).toContain("index_bg.wasm")
    })
})
