/* eslint-disable unicorn/no-process-exit */
import {
    readFile, readdir, unlink, writeFile,
} from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { execa } from "execa"
import c from "picocolors"
import { rimraf } from "rimraf"
import { parse } from "smol-toml"
import { loadConfig } from "unconfig"
import { DEFAULT_BUILD_OPTIONS } from "../consts"
import { log } from "../prompts"
import {
    isDirSync, isFileSync, pkgJsonComparator, stableStringify, toAbsolute,
} from "../util"
import type { BuildOptions, CommandLineArgs } from "../util"


export async function buildWasm(entries: string[], opts: CommandLineArgs): Promise<void> {
    try {
        const resolvedOpts = await resolveOptions(entries, opts)
        await cleanOutputDir(resolvedOpts)
        await Promise.all(resolvedOpts.entries.map(entry => processEntry(entry, resolvedOpts)))
        log.success(c.green("CLI"), "build success")
    } catch (error: any) {
        log.error(`Build failed: ${error.message}`)
        process.exit(1)
    }
}

async function processEntry(entry: string, opts: BuildOptions): Promise<void> {
    const outputDir = getOutputDir(entry, opts)
    await build(entry, outputDir, opts)
    await optimize(outputDir, opts)
    await rewriteIndexJs(outputDir)
    await rewriteIndexDts(outputDir)
    await chores(outputDir, opts)
    await generatePackageJson(entry, outputDir, opts)
}

function getOutputDir(entry: string, opts: BuildOptions): string {
    return opts.entries.length > 1
        ? path.join(opts.output, path.basename(entry))
        : opts.output
}

export async function resolveOptions(entries: string[], args: CommandLineArgs): Promise<BuildOptions> {
    log.debug("cli args:", entries, args)
    const absEntries = preCheck(entries)
    let resolvedOpts: Partial<BuildOptions> = { entries: absEntries, ...args }

    if (args.config) {
        resolvedOpts = await loadConfigFile(args.config, resolvedOpts)
    } else {
        resolvedOpts = await loadDefaultConfig(resolvedOpts)
    }

    resolvedOpts = { ...DEFAULT_BUILD_OPTIONS, ...resolvedOpts } satisfies BuildOptions
    resolvedOpts.output = toAbsolute(resolvedOpts.output)

    validateOptions(resolvedOpts)

    log.debug("resolved config:", resolvedOpts)
    return resolvedOpts as BuildOptions
}

async function loadConfigFile(configPath: string, currentOpts: Partial<BuildOptions>): Promise<Partial<BuildOptions>> {
    const config = toAbsolute(configPath)
    if (!isFileSync(config)) {
        throw new Error(`${config} is not a valid file.`)
    }

    const configExt = path.extname(configPath).slice(1)
    let configObj = {}

    if (configExt === "json") {
        const configStr = await readFile(config, "utf8")
        configObj = JSON.parse(configStr)
    } else if (["cjs", "js", "mjs", "mts", "ts"].includes(configExt)) {
        const { default: co } = await import(config)
        configObj = co
    }

    return { ...configObj, ...currentOpts, config: toAbsolute(currentOpts.config) }
}

async function loadDefaultConfig(currentOpts: Partial<BuildOptions>): Promise<Partial<BuildOptions>> {
    const { config: configObj, sources } = await loadConfig<Partial<BuildOptions>>({
        sources: [{
            extensions: ["ts", "mts", "cts", "js", "mjs", "cjs", "json"],
            files: "wasmup.config",
        }, {
            files: "package.json",
            rewrite(config: any) {
                // eslint-disable-next-line ts/no-unsafe-return
                return config.wasmup
            },
        }],
    })
    log.debug("find config file:", sources)
    return { ...configObj, ...currentOpts }
}

function validateOptions(opts: Partial<BuildOptions>): void {
    if (opts.dev && opts.release) {
        throw new Error("Cannot specify both --dev and --release")
    }
}

async function cleanOutputDir(opts: BuildOptions): Promise<void> {
    if (opts.clean) {
        log.debug("clean output directory:", opts.output)
        await rimraf(opts.output)
        log.success(c.green("CLI"), `clean ${opts.output} directory`)
    }
}

async function build(entry: string, outputDir: string, opts: BuildOptions): Promise<void> {
    log.debug("build entry:", entry)
    const extraBuildArgs = opts.release ? ["--release"] : []
    const buildCommand = [
        "build",
        "-t",
        "web",
        "--no-opt",
        "--no-pack",
        "--out-name",
        "index",
        "-d",
        outputDir,
        entry,
        ...extraBuildArgs,
    ]

    log.debug("execute command:", `wasm-pack ${buildCommand.join(" ")}`)

    try {
        await execa("wasm-pack", buildCommand)
        log.success(c.green("CLI"), `build entry ${entry}`)
    } catch (error: any) {
        throw new Error(`Build failed: ${error.message}`)
    }
}

async function optimize(outputDir: string, opts: BuildOptions): Promise<void> {
    const extraOptArgs = [
        ...(opts.release ? ["--strip-dwarf", "--zero-filled-memory", "--strip-debug", "--flatten", "--vacuum", "--rse"] : []),
        "--optimize-level",
        `${opts.opt.optLevel}`,
        "--shrink-level",
        `${opts.opt.shrinkLevel}`,
    ].filter(Boolean)

    const sourceWasm = path.join(outputDir, "index_bg.wasm")
    const targetWasm = path.join(outputDir, "index.wasm")

    log.debug("execute command:", `wasm-opt ${sourceWasm} -o ${targetWasm} ${extraOptArgs.join(" ")}`)

    try {
        await execa("wasm-opt", [sourceWasm, "-o", targetWasm, ...extraOptArgs])
        log.success(c.green("CLI"), `optimized wasm file ${targetWasm} optimized`)
    } catch (error: any) {
        throw new Error(`Optimization failed: ${error.message}`)
    }
}

async function rewriteIndexJs(outputDir: string): Promise<void> {
    const indexFile = path.join(outputDir, "index.js")
    let indexStr = await readFile(indexFile, "utf8")

    const fetchExpr = "input = fetch(input);"
    if (indexStr.includes(fetchExpr)) {
        indexStr = `/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */
${indexStr.replace(fetchExpr, `if (globalThis.process?.release?.name === "node") {
    const fs = (await import('fs')).default;
    input = fs.readFileSync(input);
} else {
    input = fetch(input);
}`)}`

        await writeFile(indexFile, indexStr)
        log.success(c.green("CLI"), `generated js file ${indexFile}`)
    } else {
        throw new Error("CLI: generated js file may be incorrect")
    }
}

async function rewriteIndexDts(outputDir: string): Promise<void> {
    const indexDtsFile = path.join(outputDir, "index.d.ts")
    log.debug("begin re-write index.d.ts:", indexDtsFile)

    let indexDtsStr = await readFile(indexDtsFile, "utf8")
    indexDtsStr = `/* eslint-disable unicorn/no-abusive-eslint-disable */\n${indexDtsStr}`

    await writeFile(indexDtsFile, indexDtsStr)
    log.success(c.blue("DTS"), `generated dts file ${indexDtsFile}`)
}


async function generatePackageJson(entry: string, outputDir: string, opts: BuildOptions): Promise<void> {
    const projectConfig = await parseProjectFile(entry)
    const {
        package: {
            authors,
            description,
            homepage: customHomepage,
            keywords,
            license,
            name: cargoPkgName,
            repository,
            version,
        },
    } = projectConfig

    const files = await readdir(outputDir)
    const validFiles = files.filter((f) => {
        const ext = path.extname(f).slice(1)
        return opts.extensions.includes(ext)
    })

    const bugs = typeof repository === "string" ? `${repository}/issues` : undefined
    const homepage = customHomepage ?? (typeof repository === "string" ? `${repository}#readme` : undefined)
    const author = authors?.length > 0 ? authors[0] : undefined
    const contributors = authors?.length > 1 ? authors.slice(1) : undefined
    const name = opts.scope ? `@${opts.scope}/${cargoPkgName}` : cargoPkgName

    const packageJson = {
        author,
        bugs,
        contributors,
        description,
        files: validFiles,
        homepage,
        keywords,
        license,
        main: "index.js",
        module: "index.js",
        name,
        repository,
        type: "module",
        types: "index.d.ts",
        version,
    }

    const packageJsonContent = `${stableStringify(packageJson, { cmp: pkgJsonComparator, space: 4 })}\n`
    await writeFile(path.join(outputDir, "package.json"), packageJsonContent)
    log.debug("package.json generated")
}


async function parseProjectFile(entry: string): Promise<Record<string, any>> {
    const filePath = path.join(entry, "Cargo.toml")
    const file = await readFile(filePath, "utf8")
    const projectConfig = parse(file)
    log.debug("project config:", projectConfig)
    return projectConfig
}

async function chores(outputDir: string, opts: BuildOptions): Promise<void> {
    const filesToRemove = [
        "index_bg.wasm",
        "index_bg.wasm.d.ts",
        opts.ignoreOutput ? "" : ".gitignore",
    ].filter(Boolean)

    await Promise.all(filesToRemove.map(async (file) => {
        const filePath = path.join(outputDir, file)
        log.debug("remove:", filePath)
        await unlink(filePath).catch(() => {
            // Ignore errors if file doesn't exist
        })
    }))
}

export function preCheck(entries: string[]) {
    const absEntries = []
    for (const entry of entries) {
        const absEntry = toAbsolute(entry)
        if (!isDirSync(absEntry)) {
            log.error(`${absEntry} is not a valid directory.`)
            process.exit(1)
        }

        const isProjectConfigExists = isFileSync(`${absEntry}/Cargo.toml`)
        if (!isProjectConfigExists) {
            log.error(`${absEntry}/Cargo.toml is not found.`)
            process.exit(1)
        }

        absEntries.push(absEntry)
    }

    return absEntries
}
