import { readFile } from "node:fs/promises"
import process from "node:process"
import { $, ExecaError } from "execa"
import { describe, expect, it } from "vitest"
import { version } from "../package.json"
import { toAbsolute } from "../src/util"

const RUNNER = "tsx"
const SCRIPT = "src/cli.ts"
const HELP_OUTPUT = `\
wasmup/${version}

Usage:
  $ wasmup <command> [options]

Commands:
  install             Install pre-requisites
  build [...entries]  Build wasm

For more info, run any command with the \`--help\` flag:
  $ wasmup install --help
  $ wasmup build --help

Options:
  -v, --version  Display version number 
  -h, --help     Display this message `

describe.concurrent("Cli", () => {
    it("show help", async () => {
        const { stdout } = await $`${RUNNER} ${SCRIPT} -h`
        expect(stdout).toEqual(HELP_OUTPUT)
    })

    it("show help when no command passed", async () => {
        const { stdout } = await $`${RUNNER} ${SCRIPT}`
        expect(stdout).toEqual(HELP_OUTPUT)
    })

    it("show version", async () => {
        const { stdout } = await $`${RUNNER} ${SCRIPT} -v`
        expect(stdout).toContain(`wasmup/${version}`)
    })

    it("should throw missing args", async () => {
        await expect(async () => await $({ node: true })`${RUNNER} ${SCRIPT} build`).rejects.toThrowError(ExecaError)
    })

    // this test need compile rust project, it cost too much time in CI, only run it locally
    it.skipIf(process.env.CI)("should has scope", { timeout: 20_000 }, async () => {
        await $`${RUNNER} ${SCRIPT} build fixture/less --scope myscope`
        const pkgJson = await readFile(toAbsolute("wasm-dist/package.json"), "utf8")
        expect(JSON.parse(pkgJson).name).toContain("@myscope")
    })
})
