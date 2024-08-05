import { writeFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import {
    afterAll, describe, expect, it,
} from "vitest"
import { resolveOptions } from "../src/commands/build"
import { DEFAULT_BUILD_OPTIONS } from "../src/consts"
import type { CommandLineArgs, ConfigOptions } from "../src/util"

afterAll(async () => {
    await writeFile("fixture/configs/config.json", "{}")
})

describe.concurrent("arg parse", () => {
    it("should equal to default", async () => {
        const entries = ["fixture/less"]
        const cliArgs: CommandLineArgs = {}
        const resolvedOptions = await resolveOptions(entries, cliArgs)
        expect(resolvedOptions).toEqual({
            ...DEFAULT_BUILD_OPTIONS,
            entries: entries.map(entry => path.join(process.cwd(), entry)),
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
        })
    })

    it("config options should overwrite default option", async () => {
        const config = "fixture/configs/config.json"
        const entries = ["fixture/less"]
        await writeFile(config, JSON.stringify({
            clean: true,
        }))
        const cliArgs: CommandLineArgs = {
            config,
        }
        const result = await resolveOptions(entries, cliArgs)
        expect(result).toEqual({
            ...DEFAULT_BUILD_OPTIONS,
            clean: true,
            config: path.join(process.cwd(), config),
            entries: entries.map(entry => path.join(process.cwd(), entry)),
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
        })
    })

    it.sequential("should merge with config", async () => {
        const config = "fixture/configs/config.json"
        await writeFile(config, JSON.stringify({
            clean: true,
            opt: {
                optLevel: "2",
                shrinkLevel: "1",
            },
            release: false,
        } satisfies ConfigOptions))
        const entries = ["fixture/less"]
        const cliArgs: CommandLineArgs = {
            config,
        }
        const resolvedOptions = await resolveOptions(entries, cliArgs)
        expect(resolvedOptions).toEqual({
            ...DEFAULT_BUILD_OPTIONS,
            clean: true,
            config: path.join(process.cwd(), config),
            entries: entries.map(entry => path.join(process.cwd(), entry)),
            opt: {
                optLevel: "2",
                shrinkLevel: "1",
            },
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
        })
    })

    it.sequential("cli args priority should higher than config", async () => {
        const config = "fixture/configs/config.json"
        const entries = ["fixture/less"]
        await writeFile(config, JSON.stringify({
            clean: true,
            release: false,
        } satisfies ConfigOptions))
        const args: CommandLineArgs = {
            clean: false,
            config,
            release: true,
        }
        const result = await resolveOptions(entries, args)
        expect(result).toEqual({
            ...DEFAULT_BUILD_OPTIONS,
            clean: false,
            config: path.join(process.cwd(), config),
            entries: entries.map(entry => path.join(process.cwd(), entry)),
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
            release: true,
        })
    })

    it.sequential("array args should be overwrite", async () => {
        const config = "fixture/configs/config.json"
        const entries = ["fixture/less"]
        await writeFile(config, JSON.stringify({
            extensions: ["cjs", "mts", "wasm"],
        } satisfies ConfigOptions))
        const cliArgs: CommandLineArgs = {
            config,
        }
        const result = await resolveOptions(entries, cliArgs)
        expect(result).toEqual({
            ...DEFAULT_BUILD_OPTIONS,
            config: path.join(process.cwd(), config),
            entries: entries.map(entry => path.join(process.cwd(), entry)),
            extensions: ["cjs", "mts", "wasm"],
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
        })
    })

    it.sequential("cli without specify entires", async () => {
        const config = "fixture/configs/config.json"
        const entries: string[] = []
        await writeFile(config, JSON.stringify({
            entries: ["fixture/less"],
            extensions: ["cjs", "mts", "wasm"],
        } satisfies ConfigOptions))
        const cliArgs: CommandLineArgs = {
            config,
        }
        const result = await resolveOptions(entries, cliArgs)

        expect(result).toEqual({
            ...DEFAULT_BUILD_OPTIONS,
            config: path.join(process.cwd(), config),
            entries: ["fixture/less"].map(entry => path.join(process.cwd(), entry)),
            extensions: ["cjs", "mts", "wasm"],
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
        })
    })

    it("can load ts config", async () => {
        const config = "fixture/configs/config.ts"
        const entries = ["fixture/less"]
        const cliArgs: CommandLineArgs = {
            config,
        }
        await writeFile(config, `export default ${JSON.stringify({
            entries: ["fixture/less"],
            extensions: ["cjs", "mts", "wasm"],
        } satisfies ConfigOptions)}`)
        const result = await resolveOptions(entries, cliArgs)
        expect(result).toEqual({
            ...DEFAULT_BUILD_OPTIONS,
            config: path.join(process.cwd(), config),
            entries: entries.map(entry => path.join(process.cwd(), entry)),
            extensions: ["cjs", "mts", "wasm"],
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
        })
    })

    it("can load mjs config", async () => {
        const config = "fixture/configs/config.mjs"
        const entries = ["fixture/less"]
        const cliArgs: CommandLineArgs = {
            config,
        }
        await writeFile(config, `export default ${JSON.stringify({
            entries: ["fixture/less"],
            extensions: ["mjs", "wasm"],
        } satisfies ConfigOptions)}`)
        const result = await resolveOptions(entries, cliArgs)
        expect(result).toEqual({
            ...DEFAULT_BUILD_OPTIONS,
            config: path.join(process.cwd(), config),
            entries: entries.map(entry => path.join(process.cwd(), entry)),
            extensions: ["mjs", "wasm"],
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
        })
    })

    it("can load cjs config", async () => {
        const config = "fixture/configs/config.cjs"
        const entries = ["fixture/less"]
        const cliArgs: CommandLineArgs = {
            config,
        }
        await writeFile(config, `module.exports = ${JSON.stringify({
            entries: ["fixture/less"],
            extensions: ["cjs", "wasm"],
        } satisfies ConfigOptions)}`)
        const result = await resolveOptions(entries, cliArgs)
        expect(result).toEqual({
            ...DEFAULT_BUILD_OPTIONS,
            config: path.join(process.cwd(), config),
            entries: entries.map(entry => path.join(process.cwd(), entry)),
            extensions: ["cjs", "wasm"],
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
        })
    })
})
