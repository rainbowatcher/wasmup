/* eslint-disable unicorn/no-process-exit */
import { writeFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { isDirSync, isFileSync } from "@rainbowatcher/fs-extra"
import { toAbsolute } from "@rainbowatcher/path-extra"
import { execa } from "execa"
import c from "picocolors"
import { loadWasmupConfig } from "../config"
import { DEFAULT_BUILD_OPTIONS } from "../consts"
import { generatePkgJson, pkgJsonComparator } from "../gen/pkg_json"
import { generateShims } from "../gen/shims"
import { log } from "../prompts"
import { stableStringify } from "../util"
import { tryClearDir, tryRemoveFile } from "../util/fs"
import { merge } from "../util/merge"
import type { BuildContext, BuildOptions, CommandLineArgs } from "../types"


class BuildCommand {
    #cliArgs: CommandLineArgs
    #entries: string[]
    #opts!: BuildOptions

    constructor(entries: string[], args: CommandLineArgs) {
        log.debug("cli args: %o %o", entries, args)
        this.#entries = entries
        this.#cliArgs = args
    }

    async build({ entry, opts, outputDir }: BuildContext): Promise<void> {
        const extraBuildArgs = opts.release ? ["--release"] : []
        const buildCommand = [
            "build",
            "-t",
            "web",
            "--no-pack",
            "--out-name",
            "index",
            "-d",
            outputDir,
            entry,
            ...extraBuildArgs,
        ]

        log.debug("execute command: %s", `wasm-pack ${buildCommand.join(" ")}`)

        try {
            await execa("wasm-pack", buildCommand)
            log.success(c.green("CLI"), `build ${entry}`)
        } catch (error: any) {
            throw new Error(`Build failed: ${error.message}`)
        }
    }

    getOutputDir(entry: string): string {
        const { entry: entries, output } = this.#opts
        return entries.length > 1
            ? path.join(output, path.basename(entry))
            : output
    }

    private mergeBuildOptions(entries: string[], userConfig: Partial<BuildOptions>): BuildOptions {
        const cliOptions = {
            ...this.#cliArgs,
            entry: entries,
        }
        return merge(cliOptions, userConfig, DEFAULT_BUILD_OPTIONS) as BuildOptions
    }

    private normalizeFilePaths(buildOpts: BuildOptions): void {
        buildOpts.entry = buildOpts.entry?.map(entry => toAbsolute(entry))
        buildOpts.output = toAbsolute(buildOpts.output)
        if (buildOpts.config) {
            buildOpts.config = toAbsolute(buildOpts.config)
        }
    }

    async process(): Promise<void> {
        const tasks = this.#opts.entry.map(async (entry) => {
            const outputDir = this.getOutputDir(entry)
            const context: BuildContext = { entry, opts: this.#opts, outputDir }

            await this.build(context)
            await generateShims(outputDir, "non_web.js")
            if (this.#opts.ignoreOutput) {
                await tryRemoveFile(path.join(outputDir, ".gitignore"))
            }
            const pkgJson = await generatePkgJson(context)
            await writeFile(
                path.join(outputDir, "package.json"),
                `${stableStringify(pkgJson, { cmp: pkgJsonComparator, space: 4 })}\n`,
            )
            log.debug("package.json generated")
        })
        await Promise.all(tasks)
    }

    private resolveEntries(userConfig: Partial<BuildOptions>): string[] {
        if (typeof this.#cliArgs.entry === "string") {
            return [this.#cliArgs.entry]
        }
        if (Array.isArray(this.#cliArgs.entry)) {
            return this.#cliArgs.entry
        }
        if (userConfig?.entry) {
            return userConfig.entry
        }
        return this.#entries
    }

    async resolveOptions() {
        const userConfig = await loadWasmupConfig(this.#cliArgs)
        const entries = this.resolveEntries(userConfig)
        const buildOpts = this.mergeBuildOptions(entries, userConfig)
        this.normalizeFilePaths(buildOpts)
        log.debug("resolved options: %O", buildOpts)
        this.#opts = buildOpts
    }

    async run(): Promise<void> {
        try {
            await this.resolveOptions()
            this.validate()
            if (this.#opts.clean) {
                await tryClearDir(this.#opts.output)
            }
            await this.process()
            log.success(c.green("CLI"), "build success")
        } catch (error: any) {
            log.error(`build failed: ${error.message}`)
            process.exit(1)
        }
    }

    validate(): void {
        const { dev, entry: entries, release } = this.#opts

        if (entries?.length === 0) {
            throw new Error("no entry provided")
        }

        for (const entry of entries ?? []) {
            if (!isDirSync(entry)) {
                log.error(`${entry} is not a valid directory.`)
                process.exit(1)
            }

            if (!isFileSync(`${entry}/Cargo.toml`)) {
                log.error(`${entry}/Cargo.toml is not found.`)
                process.exit(1)
            }
        }

        if (dev && release) {
            throw new Error("Cannot specify both --dev and --release")
        }
    }

    get opts() {
        return this.#opts
    }
}

// Entry point
export async function runBuildCmd(entries: string[], opts: CommandLineArgs): Promise<void> {
    try {
        const bc = new BuildCommand(entries, opts)
        await bc.run()
    } catch (error: any) {
        log.error(`build failed: ${error.message}`)
        process.exit(1)
    }
}

export default BuildCommand
