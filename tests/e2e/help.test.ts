import { $, ExecaError } from "execa"
import { describe, expect, it } from "vitest"
import { version } from "../../package.json" with { type: "json" }

const RUNNER = "tsx"
const SCRIPT = "src/cli.ts"
const HELP_OUTPUT = `\
wasmup/${version}

Usage:
  $ wasmup <command> [options]
`

describe.concurrent("cli stdout", () => {
    it("show help", async () => {
        const { stdout } = await $`${RUNNER} ${SCRIPT} -h`
        expect(stdout).toContain(HELP_OUTPUT)
    })

    it("show help when no command passed", async () => {
        const { stdout } = await $`${RUNNER} ${SCRIPT}`
        expect(stdout).toContain(HELP_OUTPUT)
    })

    it("show version", async () => {
        const { stdout } = await $`${RUNNER} ${SCRIPT} -v`
        expect(stdout).toContain(`wasmup/${version}`)
    })

    it("should throw missing args", async () => {
        await expect(async () => await $({ node: true })`${RUNNER} ${SCRIPT} build`).rejects.toThrow(ExecaError)
    })
})
