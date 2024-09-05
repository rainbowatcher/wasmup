import dedent from "dedent"
import { describe, expect, it } from "vitest"
import stableStringify, { pkgJsonComparator } from "../src/util/stringify"
import type { KVPair } from "../src/util/stringify"

describe.concurrent("stableStringify", () => {
    it("should stringify simple objects", () => {
        const obj = { a: 1, b: "two", c: true }
        expect(stableStringify(obj)).toStrictEqual(JSON.stringify(obj))
    })

    it("should stringify nested objects", () => {
        const obj = { a: { b: { c: 1 } } }
        expect(stableStringify(obj)).toStrictEqual(JSON.stringify(obj))
    })

    it("should stringify arrays", () => {
        const arr1 = { a: [1, 2, 3] }
        expect(stableStringify(arr1)).toStrictEqual(JSON.stringify(arr1))
        const arr2 = { a: ["index.js", "index.d.ts", "index.wasm"] }
        expect(stableStringify(arr2)).toStrictEqual(JSON.stringify(arr2))
        const arr3 = { a: [1, 2, undefined] }
        expect(stableStringify(arr3)).toStrictEqual(JSON.stringify(arr3))
    })

    it("should throw on circular structures", () => {
        const obj = { a: {} }
        // @ts-expect-error assign self
        obj.a.b = obj
        expect(() => stableStringify(obj)).toThrow("Converting circular structure to JSON")
    })

    it("should handle circular structures when cycles is true", () => {
        const obj = { a: {} }
        // @ts-expect-error assign self
        obj.a.b = obj
        expect(stableStringify(obj, { cycles: true })).toStrictEqual(JSON.stringify({ a: { b: "__cycle__" } }))
    })

    it("should handle custom toJSON methods", () => {
        const obj = { a: { toJSON() { return "custom" } } }
        expect(stableStringify(obj)).toBe('{"a":"custom"}')
    })

    it("should handle custom replacer functions", () => {
        const obj = { a: 1, b: 2, c: 3 }
        // eslint-disable-next-line ts/no-unsafe-return
        const replacer = (key: string, value: any) => (key === "a" ? undefined : value)
        expect(stableStringify(obj, { replacer })).toBe('{"b":2,"c":3}')
    })

    it("should handle custom compare functions", () => {
        const obj = { a: 1, b: 2, c: 3 }
        const cmp = (a: KVPair, b: KVPair) => b.value - a.value
        expect(stableStringify(obj, { cmp })).toBe('{"c":3,"b":2,"a":1}')
    })

    it("should handle indentation", () => {
        const obj = { a: { b: { c: 1 } } }
        expect(stableStringify(obj, { space: 2 })).toStrictEqual(JSON.stringify(obj, null, 2))
    })

    it.sequential("should sort by custom compare function", () => {
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
        expect(stableStringify(obj, { cmp: pkgJsonComparator, space: 4 })).toBe(dedent`
            {
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
            }
        `)
    })

    it.sequential("should sort by custom compare function 2", () => {
        const obj = {
            age: 1,
            husky: "n/a",
            name: "wasmup",
            os: "windows",
            sex: "male",
            type: "module",
            version: "0.1.0",
        }
        expect(stableStringify(obj, { cmp: pkgJsonComparator, space: 4 })).toBe(dedent`
            {
                "name": "wasmup",
                "type": "module",
                "version": "0.1.0",
                "husky": "n/a",
                "age": 1,
                "os": "windows",
                "sex": "male"
            }
        `)
    })

    it("should return null", () => {
        expect(stableStringify(null)).toBe("null")

        expect(stableStringify(undefined)).toBe("null")
    })
})
