import { $, ExecaError } from "execa"
import { describe, expect, it } from "vitest"
import { version } from "../package.json"

describe("CLI", () => {
    it("show help", async () => {
        const { stdout } = await $`tsx src/cli.ts -h`
        expect(stdout).toMatchInlineSnapshot(`
          "wasmup/0.1.2

          Usage:
            $ wasmup <command> [options]

          Commands:
            install        Install pre-requisites
            build <entry>  Build wasm

          For more info, run any command with the \`--help\` flag:
            $ wasmup install --help
            $ wasmup build --help

          Options:
            -v, --version  Display version number 
            -h, --help     Display this message "
        `)
    })

    it("show help when no command passed", async () => {
        const { stdout } = await $`tsx src/cli.ts`
        expect(stdout).toMatchInlineSnapshot(`
          "wasmup/0.1.2

          Usage:
            $ wasmup <command> [options]

          Commands:
            install        Install pre-requisites
            build <entry>  Build wasm

          For more info, run any command with the \`--help\` flag:
            $ wasmup install --help
            $ wasmup build --help

          Options:
            -v, --version  Display version number 
            -h, --help     Display this message "
        `)
    })

    it("show version", async () => {
        const { stdout } = await $`tsx src/cli.ts -v`
        expect(stdout).toContain(`wasmup/${version}`)
    })

    it("should throw missing args", async () => {
        const fn = async () => await $({ node: true })`tsx src/cli.ts build`
        await expect(fn).rejects.toThrowError(ExecaError)
    })
})
