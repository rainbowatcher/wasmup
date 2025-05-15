import { readFileSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import { toAbsolute } from "@rainbowatcher/path-extra"
import { execaSync } from "execa"
import {
    beforeAll, describe, expect, it, onTestFinished,
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
            // @ts-expect-error type missing
            const server = await import("../__util__/server.js")
            const playwright = await import("playwright")
            const scriptPath = path.resolve(import.meta.dirname, "../__util__/index.js")
            beforeAll(() => {
                execa({ cwd: entry })`tsx src/cli.ts build . --clean --shims`
            })

            it("should run with node", () => {
                const { all, message } = execa`node ${scriptPath}`
                expect(all, message).toBe("Hello, World!")
            })

            it("should run with deno", () => {
                const { all, message } = execa`deno run -A ${scriptPath}`
                expect(all, message).toBe("Hello, World!")
            })

            it("should run with bun", () => {
                const { all, message } = execa`bun run ${scriptPath}`
                expect(all, message).toBe("Hello, World!")
            })

            it("should run with browser", { timeout: 20_000 }, async () => {
                server.startServer()
                const browser = await playwright.chromium.launch()
                const page = await browser.newPage()
                await page.goto("http://localhost:3000")
                const text = await page.textContent("#root")
                expect(text).toBe("Hello, World!")

                onTestFinished(async () => {
                    await browser.close()
                })
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
