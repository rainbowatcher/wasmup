import {
    beforeEach, describe, expect, it, vi,
} from "vitest"

const cliEntrypointLoaded = vi.hoisted(() => vi.fn())

vi.mock("../dist/cli.mjs", () => {
    cliEntrypointLoaded()
    return {}
})

describe("bin entry", () => {
    beforeEach(() => {
        vi.resetModules()
        cliEntrypointLoaded.mockClear()
    })

    it("should load built cli entry", async () => {
        // @ts-expect-error missing type
        await expect(import("../bin/wasmup.js")).resolves.toBeDefined()
        expect(cliEntrypointLoaded).toHaveBeenCalledTimes(1)
    })
})
