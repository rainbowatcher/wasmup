import path from "node:path"
import { execaSync } from "execa"
import { chromium } from "playwright"
import {
    beforeAll, describe, expect, it,
    onTestFinished,
} from "vitest"
// @ts-expect-error type missing
import { startServer } from "../__util__/server.js"

const scriptPath = path.resolve(import.meta.dirname, "../__util__/index.js")
const $ = execaSync({ all: true, reject: false })

describe.skipIf(process.env.CI)("runtime", () => {
    beforeAll(() => {
        const { all } = $`tsx src/cli.ts build fixture/less --clean`
        console.log(all)
    })

    it("should run with node", () => {
        const { all, message } = $`node ${scriptPath}`
        expect(all, message).toBe("Hello, World!")
    })

    it("should run with deno", () => {
        const { all, message } = $`deno run -A ${scriptPath}`
        expect(all, message).toBe("Hello, World!")
    })

    it("should run with bun", () => {
        const { all, message } = $`bun run ${scriptPath}`
        expect(all, message).toBe("Hello, World!")
    })

    it("should run with browser", { timeout: 10_000 }, async () => {
        startServer()
        const browser = await chromium.launch()
        const page = await browser.newPage()
        await page.goto("http://localhost:3000")
        const text = await page.textContent("#root")
        expect(text).toBe("Hello, World!")

        onTestFinished(async () => {
            await browser.close()
        })
    })
})
