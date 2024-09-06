import fg from "fast-glob"
import { describe, expect, it } from "vitest"

describe.skipIf(process.env.CI)("node", () => {
    it("should run with node", async () => {
        expect.hasAssertions()
        const globs = fg.sync("wasm-dist/**/index.js")
        const promises = globs.map(async (indexPath) => {
            expect(indexPath).toBeTruthy()
            const module = await import(indexPath ?? "")
            await module.default({})
            expect(module.hello_world()).toBe("Hello, World!")
        })
        await Promise.all(promises)
    })
})
