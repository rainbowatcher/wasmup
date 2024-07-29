import { writeFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import {
    afterAll, describe, expect, it,
} from "vitest"
import { resolveOptions } from "../src/commands/build"
import { DEFAULT_BUILD_OPTIONS } from "../src/consts"
import type { CommandLineArgs } from "../src/util"

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

    it.sequential("cli args priority should higher than config", async () => {
        const config = "fixture/configs/config.json"
        const entries = ["fixture/less"]
        await writeFile(config, JSON.stringify({
            clean: true,
            release: false,
        }))
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
        } satisfies CommandLineArgs))
        const args: CommandLineArgs = {
            config,
        }
        const result = await resolveOptions(entries, args)
        expect(result).toEqual({
            ...DEFAULT_BUILD_OPTIONS,
            config: path.join(process.cwd(), config),
            entries: entries.map(entry => path.join(process.cwd(), entry)),
            extensions: ["cjs", "mts", "wasm"],
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
        })
    })
})
