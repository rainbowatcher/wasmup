import { readFile } from "node:fs/promises"
import { platform } from "node:os"
import { $, ExecaError } from "execa"
import { describe, expect, it } from "vitest"
import { version } from "../package.json"
import { toAbsolute } from "../src/util"

describe("CLI", () => {
    it("show help", async () => {
        const { stdout } = await $`tsx src/cli.ts -h`
        expect(stdout).toMatchInlineSnapshot(`
          "wasmup/${version}

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
          "wasmup/${version}

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

    it.concurrent("show version", async () => {
        const { stdout } = await $`tsx src/cli.ts -v`
        expect(stdout).toContain(`wasmup/${version}`)
    })

    it.concurrent("should throw missing args", async () => {
        await expect(async () => await $({ node: true })`tsx src/cli.ts build`).rejects.toThrowError(ExecaError)
    })

    it.runIf(platform() !== "win32")("should has scope", { timeout: 20_000 }, async () => {
        await $`tsx src/cli.ts build fixture/less --scope myscope`
        const pkgJson = await readFile(toAbsolute("wasm-dist/package.json"), "utf8")
        expect(JSON.parse(pkgJson).name).toContain("@myscope")
    })
})
