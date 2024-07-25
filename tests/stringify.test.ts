import { describe, expect, it } from "vitest"
import stableStringify from "../src/util/stringify"
import type { KVPair } from "../src/util/stringify"

describe("stableStringify", () => {
    it("should stringify simple objects", () => {
        const obj = { a: 1, b: "two", c: true }
        expect(stableStringify(obj)).toEqual(JSON.stringify(obj))
    })

    it("should stringify nested objects", () => {
        const obj = { a: { b: { c: 1 } } }
        expect(stableStringify(obj)).toEqual(JSON.stringify(obj))
    })

    it("should stringify arrays", () => {
        const arr2 = { a: ["index.js", "index.d.ts", "index.wasm"] }
        expect(stableStringify(arr2)).toEqual(JSON.stringify(arr2))
        const arr1 = { a: [1, 2, 3] }
        expect(stableStringify(arr1)).toEqual(JSON.stringify(arr1))
    })

    it("should handle circular structures", () => {
        const obj = { a: {} }
        // @ts-expect-error assign self
        obj.a.b = obj
        expect(() => stableStringify(obj)).toThrow("Converting circular structure to JSON")
    })

    it("should handle custom toJSON methods", () => {
        const obj = { a: { toJSON() { return "custom" } } }
        expect(stableStringify(obj)).toEqual('{"a":"custom"}')
    })

    it("should handle custom replacer functions", () => {
        const obj = { a: 1, b: 2, c: 3 }
        // eslint-disable-next-line ts/no-unsafe-return
        const replacer = (key: string, value: any) => (key === "a" ? undefined : value)
        expect(stableStringify(obj, { replacer })).toEqual('{"b":2,"c":3}')
    })

    it("should handle custom compare functions", () => {
        const obj = { a: 1, b: 2, c: 3 }
        const cmp = (a: KVPair, b: KVPair) => b.value - a.value
        expect(stableStringify(obj, { cmp })).toEqual('{"c":3,"b":2,"a":1}')
    })

    it("should handle indentation", () => {
        const obj = { a: { b: { c: 1 } } }
        expect(stableStringify(obj, { space: 2 })).toEqual(JSON.stringify(obj, null, 2))
    })

    it("test", () => {
        const obj = {
            author: "rainbowatcher <rainbow-w@qq.com>",
            bugs: "https://github.com/rainbowatcher/wasmup/issues",
            description: "a simple wasm project",
            files: [
                "index.d.ts",
                "index.js",
                "index.wasm",
            ],
            homepage: "https://github.com/rainbowatcher/wasmup/#readme",
            keywords: [
                "webassembly",
                "wasm",
                "web",
            ],
            license: "MIT",
            main: "index.js",
            module: "index.js",
            name: "wasmup",
            repository: "https://github.com/rainbowatcher/wasmup",
            type: "module",
            types: "index.d.ts",
            version: "0.1.0",
        }
        const order = [
            "publisher",
            "name",
            "displayName",
            "type",
            "version",
            "private",
            "packageManager",
            "description",
            "author",
            "license",
            "funding",
            "homepage",
            "repository",
            "bugs",
            "keywords",
            "categories",
            "sideEffects",
            "exports",
            "main",
            "module",
            "unpkg",
            "jsdelivr",
            "types",
            "typesVersions",
            "bin",
            "icon",
            "files",
            "engines",
            "activationEvents",
            "contributes",
            "scripts",
            "peerDependencies",
            "peerDependenciesMeta",
            "dependencies",
            "optionalDependencies",
            "devDependencies",
            "pnpm",
            "overrides",
            "resolutions",
            "husky",
            "simple-git-hooks",
            "lint-staged",
            "eslintConfig",
        ]
        const cmp = (a: KVPair, b: KVPair): number => order.indexOf(a.key) - order.indexOf(b.key)
        expect(stableStringify(obj, { cmp, space: 4 })).toMatchInlineSnapshot(`
          "{
              "name": "wasmup",
              "type": "module",
              "version": "0.1.0",
              "description": "a simple wasm project",
              "author": "rainbowatcher <rainbow-w@qq.com>",
              "license": "MIT",
              "homepage": "https://github.com/rainbowatcher/wasmup/#readme",
              "repository": "https://github.com/rainbowatcher/wasmup",
              "bugs": "https://github.com/rainbowatcher/wasmup/issues",
              "keywords": [
                  "webassembly",
                  "wasm",
                  "web"
              ],
              "main": "index.js",
              "module": "index.js",
              "types": "index.d.ts",
              "files": [
                  "index.d.ts",
                  "index.js",
                  "index.wasm"
              ]
          }"
        `)
    })
})
