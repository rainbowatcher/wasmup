import { writeFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { describe, expect, it } from "vitest"
import { resolveOptions } from "../src/commands/build"
import { DEFAULT_BUILD_OPTIONS } from "../src/consts"
import type { CommandLineArgs } from "../src/util"

describe.concurrent("build", () => {
    it("should equal to default", async () => {
        const entry = "fixture/less"
        const cliArgs: CommandLineArgs = {}
        const resolvedOptions = await resolveOptions(entry, cliArgs)
        expect(resolvedOptions).toEqual({
            ...DEFAULT_BUILD_OPTIONS,
            entry: path.join(process.cwd(), entry),
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
        })
    })

    it("config options should overwrite default option", async () => {
        const config = "fixture/configs/config.json"
        const entry = "fixture/less"
        await writeFile(config, JSON.stringify({
            clean: true,
        }))
        const cliArgs: CommandLineArgs = {
            config,
        }
        const result = await resolveOptions(entry, cliArgs)
        expect(result).toEqual({
            ...DEFAULT_BUILD_OPTIONS,
            clean: true,
            config: path.join(process.cwd(), config),
            entry: path.join(process.cwd(), entry),
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
        })
    })

    it("cli args priority should higher than config", async () => {
        const config = "fixture/configs/config.json"
        const entry = "fixture/less"
        await writeFile(config, JSON.stringify({
            clean: true,
            release: false,
        }))
        const args: CommandLineArgs = {
            clean: false,
            config,
            release: true,
        }
        const result = await resolveOptions(entry, args)
        expect(result).toEqual({
            ...DEFAULT_BUILD_OPTIONS,
            clean: false,
            config: path.join(process.cwd(), config),
            entry: path.join(process.cwd(), entry),
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
            release: true,
        })
    })
})
