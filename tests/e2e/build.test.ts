import { readFileSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import { toAbsolute } from "@rainbowatcher/path-extra"
import { execaSync } from "execa"
import { describe, expect, it } from "vitest"

const RUNNER = "tsx"
const SCRIPT = "src/cli.ts"
const execa = execaSync({ all: true, reject: false })

// this test need compile rust project, it cost too much time in CI, only run it locally
describe.skipIf(process.env.CI)("build command", { sequential: true }, () => {
    it("should support entry as option", { timeout: 50_000 }, () => {
        const { failed, stdout } = execa`${RUNNER} ${SCRIPT} build fixture/less`
        expect(failed, stdout).toBeFalsy()
    })

    it("should support entry as command arg", { timeout: 50_000 }, () => {
        const { failed, stdout } = execa`${RUNNER} ${SCRIPT} build --entry fixture/less`
        expect(failed, stdout).toBeFalsy()
    })

    it("should has scope", { timeout: 50_000 }, () => {
        execa`${RUNNER} ${SCRIPT} build fixture/less --scope myscope`
        const pkgJson = readFileSync(toAbsolute("wasm-dist/package.json"), "utf8")
        expect(JSON.parse(pkgJson).name).toContain("@myscope")
    })

    it("should generate shims with wrapper functions and type validations", () => {
        const shimsPath = path.join(process.cwd(), "wasm-dist/shims.js")

        // Build the project
        execa(RUNNER, [SCRIPT, "build", "fixture/more", "--shims"])

        // Read the generated shims file
        const shimsContent = readFileSync(shimsPath, "utf8")

        // Assert that the shims file contains the correct content
        expect(shimsContent).toContain("export function u64(a)")
        expect(shimsContent).toContain('if (typeof a !== "number")')
    })
})
