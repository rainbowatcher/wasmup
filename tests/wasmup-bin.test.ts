import path from "node:path"
import process from "node:process"
import { execa } from "execa"
import { describe, expect, it } from "vitest"
import { version } from "../package.json" with { type: "json" }

describe("bin entry", () => {
    it("should execute built cli entry", async () => {
        const binPath = path.join(process.cwd(), "bin/wasmup.js")
        const { exitCode, stdout } = await execa(process.execPath, [binPath, "-v"])

        expect(exitCode).toBe(0)
        expect(stdout).toContain(`wasmup/${version}`)
    })
})
