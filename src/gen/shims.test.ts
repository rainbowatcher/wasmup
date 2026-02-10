import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import {
    afterEach, describe, expect, it,
} from "vitest"
import { generateShims } from "./shims"
import type { BuildOptions } from "../types"

const dtsFixture = `
export function hello_world(): string;
export function option_u32(a?: number | null): number;
export function u64Sum(arr: BigUint64Array): bigint;
export function person(person: Person): any;
export class Person {
  constructor(name: string, age: bigint);
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
export function initSync(module: { module: SyncInitInput } | SyncInitInput): any;
export default function __wbg_init(module_or_path?: { module_or_path: any } | any): Promise<any>;
`

function makeBuildOptions(): BuildOptions {
    return {
        clean: false,
        dev: false,
        dry: false,
        entry: ["fixture/more"],
        extensions: ["js", "ts", "wasm"],
        ignoreOutput: false,
        output: "wasm-dist",
        profiling: false,
        shims: true,
    }
}

describe("generateShims", () => {
    const tempDirs: string[] = []

    afterEach(async () => {
        await Promise.all(tempDirs.map(dir => rm(dir, { force: true, recursive: true })))
        tempDirs.length = 0
    })

    it("should generate stable init state checks and return values", async () => {
        const tempDir = await mkdtemp(path.join(os.tmpdir(), "wasmup-shims-"))
        tempDirs.push(tempDir)
        await writeFile(path.join(tempDir, "index.d.ts"), dtsFixture)
        await writeFile(path.join(tempDir, "index.js"), "export default function __wbg_init(){}")

        await generateShims(tempDir, makeBuildOptions(), "shims.js")

        const generated = await readFile(path.join(tempDir, "shims.js"), "utf8")

        expect(generated).toContain("function isInitialized()")
        expect(generated).toContain("if (!isInitialized())")
        expect(generated).toContain(": originalInitSync(wrapped);")
        expect(generated).toContain("return wasm;")
        expect(generated).toContain("? await originalInit()")
    })

    it("should allow nullish values for optional union params", async () => {
        const tempDir = await mkdtemp(path.join(os.tmpdir(), "wasmup-shims-"))
        tempDirs.push(tempDir)
        await writeFile(path.join(tempDir, "index.d.ts"), dtsFixture)
        await writeFile(path.join(tempDir, "index.js"), "export default function __wbg_init(){}")

        await generateShims(tempDir, makeBuildOptions(), "shims.js")

        const generated = await readFile(path.join(tempDir, "shims.js"), "utf8")

        expect(generated).toContain("a != null && (typeof a !== \"number\")")
        expect(generated).toContain("arr instanceof BigUint64Array")
    })

    it("should use wasm URL for browser async init path", async () => {
        const tempDir = await mkdtemp(path.join(os.tmpdir(), "wasmup-shims-"))
        tempDirs.push(tempDir)
        await writeFile(path.join(tempDir, "index.d.ts"), dtsFixture)
        await writeFile(path.join(tempDir, "index.js"), "export default function __wbg_init(){}")

        await generateShims(tempDir, makeBuildOptions(), "shims.js")

        const generated = await readFile(path.join(tempDir, "shims.js"), "utf8")
        expect(generated).toContain("wasmBuffer = wasmUrl;")
    })

    it("should preserve object inputs in async init wrapper", async () => {
        const tempDir = await mkdtemp(path.join(os.tmpdir(), "wasmup-shims-"))
        tempDirs.push(tempDir)
        await writeFile(path.join(tempDir, "index.d.ts"), dtsFixture)
        await writeFile(path.join(tempDir, "index.js"), "export default function __wbg_init(){}")

        await generateShims(tempDir, makeBuildOptions(), "shims.js")

        const generated = await readFile(path.join(tempDir, "shims.js"), "utf8")
        const start = generated.indexOf("function wrapInitArg(module_or_path)")
        const end = generated.indexOf("function isInitialized()")
        const wrapInitArgBlock = generated.slice(start, end)
        expect(wrapInitArgBlock).toContain("Object.getPrototypeOf(module_or_path) === Object.prototype")
        expect(wrapInitArgBlock).toContain("Object.keys(module_or_path).length === 0")
    })

    it("should move index.d.ts to shims.d.ts and relax initSync signature", async () => {
        const tempDir = await mkdtemp(path.join(os.tmpdir(), "wasmup-shims-"))
        tempDirs.push(tempDir)
        await writeFile(path.join(tempDir, "index.d.ts"), dtsFixture)
        await writeFile(path.join(tempDir, "index.js"), "export default function __wbg_init(){}")

        await generateShims(tempDir, makeBuildOptions(), "shims.js")

        await expect(readFile(path.join(tempDir, "index.d.ts"), "utf8")).rejects.toThrow()
        const shimsDts = await readFile(path.join(tempDir, "shims.d.ts"), "utf8")
        expect(shimsDts).toContain("initSync(module?:")
    })
})
