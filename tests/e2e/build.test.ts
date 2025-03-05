import { readFile } from "node:fs/promises"
import process from "node:process"
import { toAbsolute } from "@rainbowatcher/path-extra"
import { execaSync } from "execa"
import { describe, expect, it } from "vitest"

const RUNNER = "tsx"
const SCRIPT = "src/cli.ts"
const execa = execaSync({ all: true, reject: false })

// this test need compile rust project, it cost too much time in CI, only run it locally
describe.skipIf(process.env.CI)("build command", () => {
    it("should support entry as option", { timeout: 50_000 }, () => {
        const { failed, stdout } = execa`${RUNNER} ${SCRIPT} build fixture/less`
        expect(failed, stdout).toBeFalsy()
    })

    it("should support entry as command arg", { timeout: 50_000 }, () => {
        const { failed, stdout } = execa`${RUNNER} ${SCRIPT} build --entry fixture/less`
        expect(failed, stdout).toBeFalsy()
    })

    it("should has scope", { timeout: 50_000 }, async () => {
        execa`${RUNNER} ${SCRIPT} build fixture/less --scope myscope`
        const pkgJson = await readFile(toAbsolute("wasm-dist/package.json"), "utf8")
        expect(JSON.parse(pkgJson).name).toContain("@myscope")
    })
})
