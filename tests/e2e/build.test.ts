import { readFileSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import { toAbsolute } from "@rainbowatcher/path-extra"
import { execaSync } from "execa"
import {
    beforeAll, describe, expect, it,
} from "vitest"

const RUNNER = "tsx"
const SCRIPT = path.join(process.cwd(), "src/cli.ts")
const execa = execaSync({ all: true, reject: false })

// this test need compile rust project, it cost too much time in CI, only run it locally
describe.skipIf(process.env.CI)("build command", () => {
    describe("less project", { sequential: true }, () => {
        const entry = "fixture/less"
        it("should support entry as option", { timeout: 50_000 }, () => {
            const { all, failed } = execa({ cwd: entry })`${RUNNER} ${SCRIPT} build .`
            expect(failed, all).toBeFalsy()
        })

        it("should support entry as command arg", { timeout: 50_000 }, () => {
            const { all, failed } = execa({ cwd: entry })`${RUNNER} ${SCRIPT} build --entry .`
            expect(failed, all).toBeFalsy()
        })

        it("should has scope", { timeout: 50_000 }, () => {
            execa({ cwd: entry })`${RUNNER} ${SCRIPT} build . --scope myscope`
            const pkgJson = readFileSync(toAbsolute("wasm-dist/package.json", toAbsolute(entry)), "utf8")
            expect(JSON.parse(pkgJson).name).toContain("@myscope")
        })

        describe.skipIf(process.env.CI)("runtime", async () => {
            const expected = "Hello, World!"
            // @ts-expect-error type missing
            const server = await import("../__util__/server.js")
            const playwright = await import("playwright")
            const indexScript = path.resolve(import.meta.dirname, "../__util__/index.js")
            const indexNodeScript = path.resolve(import.meta.dirname, "../__util__/index_node.js")
            const indexSyncScript = path.resolve(import.meta.dirname, "../__util__/index_sync.js")
            const shimsScript = path.resolve(import.meta.dirname, "../__util__/shims.js")
            const shimsSyncScript = path.resolve(import.meta.dirname, "../__util__/shims_sync.js")
            beforeAll(() => {
                execa({ cwd: entry })`tsx src/cli.ts build . --clean --shims`
            })

            it("index.js should can not run with node", () => {
                const { all } = execa`node ${indexNodeScript}`
                expect(all, all).toBe(expected)
            })

            it("index.js should run with deno", () => {
                const { all, message } = execa`deno run -A ${indexScript}`
                expect(all, message).toBe(expected)
            })

            it("index.js should run with bun", () => {
                const { all, message } = execa`bun run ${indexScript}`
                expect(all, message).toBe(expected)
            })

            it("index_sync.js should run with node", () => {
                const { all } = execa`node ${indexSyncScript}`
                expect(all, all).toBe(expected)
            })

            it("index_sync.js should run with deno", () => {
                const { all } = execa`deno run -A ${indexSyncScript}`
                expect(all, all).toBe(expected)
            })

            it("index_sync.js should run with bun", () => {
                const { all } = execa`bun ${indexSyncScript}`
                expect(all, all).toBe(expected)
            })

            it("shims.js should run with node", () => {
                const { all, message } = execa`node ${shimsScript}`
                expect(all, message).toBe(expected)
            })

            it("shims.js should run with deno", () => {
                const { all, message } = execa`deno run -A ${shimsScript}`
                expect(all, message).toBe(expected)
            })

            it("shims.js should run with bun", () => {
                const { all, message } = execa`bun run ${shimsScript}`
                expect(all, message).toBe(expected)
            })

            it("shims_sync.js should run with node", () => {
                const { all } = execa`node ${shimsSyncScript}`
                expect(all, all).toBe(expected)
            })

            it("shims_sync.js should run with deno", () => {
                const { all } = execa`deno run -A ${shimsSyncScript}`
                expect(all, all).toBe(expected)
            })

            it("shims_sync.js should run with bun", () => {
                const { all } = execa`bun ${shimsSyncScript}`
                expect(all, all).toBe(expected)
            })

            it("should run with browser", { timeout: 20_000 }, async () => {
                server.startServer()
                const browser = await playwright.chromium.launch()
                const page = await browser.newPage()
                await page.goto("http://localhost:3000")
                const text = await page.textContent("#root")
                expect(text).toBe(expected)
                await browser.close()
            })

            it("should index_sync run with browser", { timeout: 20_000 }, async () => {
                server.startSyncServer()
                const browser = await playwright.chromium.launch()
                const page = await browser.newPage()
                await page.goto("http://localhost:3001")
                const text = await page.textContent("#root")
                expect(text).toBe(expected)
                await browser.close()
            })
        })
    })

    describe("more project", { sequential: true }, () => {
        it("should generate shims with wrapper functions and type validations", () => {
            const entry = "fixture/more"
            const shimsPath = path.join(process.cwd(), entry, "wasm-dist/shims.js")

            // Build the project
            execa(RUNNER, [SCRIPT, "build", ".", "--shims"], { cwd: entry })

            // Read the generated shims file
            const shimsContent = readFileSync(shimsPath, "utf8")

            // Assert that the shims file contains the correct content
            expect(shimsContent).toContain("export function u64(a)")
            expect(shimsContent).toContain('if (typeof a !== "number")')
        })
    })
})
