import { writeFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import {
    afterAll, describe, expect, it,
} from "vitest"
import { resolveOptions } from "../src/commands/build"
import { DEFAULT_BUILD_OPTIONS } from "../src/consts"
import type { CommandLineArgs, ConfigOptions } from "../src/util"


describe.concurrent("arg parse", () => {
    const JSON_CONFIG = path.join("fixture", "configs", "config.json")
    const MJS_CONFIG = path.join("fixture", "configs", "config.mjs")
    const CJS_CONFIG = path.join("fixture", "configs", "config.cjs")
    const TS_CONFIG = path.join("fixture", "configs", "config.ts")
    const entries = [path.join("fixture", "less")]

    afterAll(async () => {
        await writeFile(JSON_CONFIG, "{}")
    })

    it("should equal to default", async () => {
        const cliArgs: CommandLineArgs = {}
        const resolvedOptions = await resolveOptions(entries, cliArgs)
        expect(resolvedOptions).toStrictEqual({
            ...DEFAULT_BUILD_OPTIONS,
            entry: entries.map(entry => path.join(process.cwd(), entry)),
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
        })
    })

    describe.sequential("json config", () => {
        it("config options should overwrite default option", async () => {
            await writeFile(JSON_CONFIG, JSON.stringify({
                clean: true,
            }))
            const cliArgs: CommandLineArgs = {
                config: JSON_CONFIG,
            }
            const result = await resolveOptions(entries, cliArgs)
            expect(result).toStrictEqual({
                ...DEFAULT_BUILD_OPTIONS,
                clean: true,
                config: path.join(process.cwd(), JSON_CONFIG),
                entry: entries.map(entry => path.join(process.cwd(), entry)),
                output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
            })
        })

        it("should merge with config", async () => {
            await writeFile(JSON_CONFIG, JSON.stringify({
                clean: true,
                opt: {
                    optLevel: "2",
                    shrinkLevel: "1",
                },
                release: false,
            } satisfies ConfigOptions))
            const cliArgs: CommandLineArgs = {
                config: JSON_CONFIG,
            }
            const resolvedOptions = await resolveOptions(entries, cliArgs)
            expect(resolvedOptions).toStrictEqual({
                ...DEFAULT_BUILD_OPTIONS,
                clean: true,
                config: path.join(process.cwd(), JSON_CONFIG),
                entry: entries.map(entry => path.join(process.cwd(), entry)),
                opt: {
                    optLevel: "2",
                    shrinkLevel: "1",
                },
                output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
            })
        })

        it("cli args priority should higher than config", async () => {
            await writeFile(JSON_CONFIG, JSON.stringify({
                clean: true,
                release: false,
            } satisfies ConfigOptions))
            const args: CommandLineArgs = {
                clean: false,
                config: JSON_CONFIG,
                release: true,
            }
            const result = await resolveOptions(entries, args)
            expect(result).toStrictEqual({
                ...DEFAULT_BUILD_OPTIONS,
                clean: false,
                config: path.join(process.cwd(), JSON_CONFIG),
                entry: entries.map(entry => path.join(process.cwd(), entry)),
                output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
                release: true,
            })
        })

        it("array args should be overwrite", async () => {
            await writeFile(JSON_CONFIG, JSON.stringify({
                extensions: ["cjs", "mts", "wasm"],
            } satisfies ConfigOptions))
            const cliArgs: CommandLineArgs = {
                config: JSON_CONFIG,
            }
            const result = await resolveOptions(entries, cliArgs)
            expect(result).toStrictEqual({
                ...DEFAULT_BUILD_OPTIONS,
                config: path.join(process.cwd(), JSON_CONFIG),
                entry: entries.map(entry => path.join(process.cwd(), entry)),
                extensions: ["cjs", "mts", "wasm"],
                output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
            })
        })

        it("when entires specified in config not cli", async () => {
            const emptyEntries: string[] = []
            await writeFile(JSON_CONFIG, JSON.stringify({
                entry: entries,
                extensions: ["cjs", "mts", "wasm"],
            } satisfies ConfigOptions))
            const cliArgs: CommandLineArgs = {
                config: JSON_CONFIG,
            }
            const result = await resolveOptions(emptyEntries, cliArgs)

            expect(result).toStrictEqual({
                ...DEFAULT_BUILD_OPTIONS,
                config: path.join(process.cwd(), JSON_CONFIG),
                entry: entries.map(entry => path.join(process.cwd(), entry)),
                extensions: ["cjs", "mts", "wasm"],
                output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
            })
        })
    })

    it("can load ts config", async () => {
        const cliArgs: CommandLineArgs = {
            config: TS_CONFIG,
        }
        await writeFile(TS_CONFIG, `export default ${JSON.stringify({
            entry: entries,
            extensions: ["cjs", "mts", "wasm"],
        } satisfies ConfigOptions)}`)
        const result = await resolveOptions(entries, cliArgs)
        expect(result).toStrictEqual({
            ...DEFAULT_BUILD_OPTIONS,
            config: path.join(process.cwd(), TS_CONFIG),
            entry: entries.map(entry => path.join(process.cwd(), entry)),
            extensions: ["cjs", "mts", "wasm"],
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
        })
    })

    it("can load mjs config", async () => {
        const cliArgs: CommandLineArgs = {
            config: MJS_CONFIG,
        }
        await writeFile(MJS_CONFIG, `export default ${JSON.stringify({
            entry: entries,
            extensions: ["mjs", "wasm"],
        } satisfies ConfigOptions)}`)
        const result = await resolveOptions(entries, cliArgs)
        expect(result).toStrictEqual({
            ...DEFAULT_BUILD_OPTIONS,
            config: path.join(process.cwd(), MJS_CONFIG),
            entry: entries.map(entry => path.join(process.cwd(), entry)),
            extensions: ["mjs", "wasm"],
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
        })
    })

    it("can load cjs config", async () => {
        const cliArgs: CommandLineArgs = {
            config: CJS_CONFIG,
        }
        await writeFile(CJS_CONFIG, `module.exports = ${JSON.stringify({
            entry: entries,
            extensions: ["cjs", "wasm"],
        } satisfies ConfigOptions)}`)
        const result = await resolveOptions(entries, cliArgs)
        expect(result).toStrictEqual({
            ...DEFAULT_BUILD_OPTIONS,
            config: path.join(process.cwd(), CJS_CONFIG),
            entry: entries.map(entry => path.join(process.cwd(), entry)),
            extensions: ["cjs", "wasm"],
            output: path.join(process.cwd(), DEFAULT_BUILD_OPTIONS.output),
        })
    })
})
