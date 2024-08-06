/* eslint-disable unicorn/no-process-exit */
import {
    readdir, readFile, unlink, writeFile,
} from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import dedent from "dedent"
import { createDefu } from "defu"
import { execa } from "execa"
import { findUp } from "find-up"
import c from "picocolors"
import { rimraf } from "rimraf"
import { parse, TomlDate } from "smol-toml"
import { loadConfig } from "unconfig"
import { DEFAULT_BUILD_OPTIONS } from "../consts"
import { log } from "../prompts"
import {
    isDirSync, isFileSync, pkgJsonComparator, stableStringify, toAbsolute,
} from "../util"
import type { TomlPrimitive } from "smol-toml"
import type { BuildOptions, CommandLineArgs } from "../util"


const defu = createDefu((obj, key, value) => {
    if (Array.isArray(obj[key]) && Array.isArray(value)) {
        return [...new Set([...obj[key], ...value])]
    }
})

export async function buildWasm(entries: string[], opts: CommandLineArgs): Promise<void> {
    try {
        const resolvedOpts = await resolveOptions(entries, opts)
        await cleanOutputDir(resolvedOpts)
        await Promise.all(resolvedOpts.entry.map(entry => processEntry(entry, resolvedOpts)))
        log.success(c.green("CLI"), "build success")
    } catch (error: any) {
        log.error(`build failed: ${error.message}`)
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
    return opts.entry.length > 1
        ? path.join(opts.output, path.basename(entry))
        : opts.output
}

export async function resolveOptions(entry: string[], args: CommandLineArgs): Promise<BuildOptions> {
    log.debug("cli args:", entry, args)
    let resolvedOpts: Partial<BuildOptions> = {
        ...args,
        entry: typeof args.entry === "string" ? [args.entry] : args.entry ?? entry,
    }

    if (args.config) {
        resolvedOpts = await loadUserSpecifiedConfigFile(args.config, resolvedOpts)
    } else {
        resolvedOpts = await loadDefaultConfig(resolvedOpts)
    }

    resolvedOpts = { ...DEFAULT_BUILD_OPTIONS, ...resolvedOpts } satisfies BuildOptions
    resolvedOpts.entry = resolvedOpts.entry?.map(entry => toAbsolute(entry))

    if (resolvedOpts.entry?.length === 0) {
        throw new Error("no entry provided")
    }
    resolvedOpts.output = toAbsolute(resolvedOpts.output)
    validateOptions(resolvedOpts)

    log.debug("resolved config:", resolvedOpts)
    return resolvedOpts as BuildOptions
}

export async function loadUserSpecifiedConfigFile(configPath: string, currentOpts: Partial<BuildOptions>): Promise<Partial<BuildOptions>> {
    const absConfigPath = toAbsolute(configPath)
    if (!isFileSync(absConfigPath)) {
        throw new Error(`${absConfigPath} is not a valid file.`)
    }

    const { config, sources } = await loadConfig<Partial<BuildOptions>>({
        sources: [{
            files: absConfigPath,
        }],
    })

    log.debug("load specified config file:", sources)
    return defu({ config: toAbsolute(currentOpts.config) }, currentOpts, config)
}

async function loadDefaultConfig(currentOpts: Partial<BuildOptions>): Promise<Partial<BuildOptions>> {
    const { config, sources } = await loadConfig<Partial<BuildOptions>>({
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
    return defu(currentOpts, config)
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
        log.success(c.green("CLI"), `clean ${opts.output}`)
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
        log.success(c.green("CLI"), `build ${entry}`)
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
        log.success(c.green("CLI"), `optimize ${targetWasm}`)
    } catch (error: any) {
        throw new Error(`Optimization failed: ${error.message}`)
    }
}

function addTopLineComment(indexStr: string) {
    const disableComment = dedent`
        /* eslint-disable unicorn/no-abusive-eslint-disable */
        /* eslint-disable */
    `
    return `${disableComment}\n${indexStr}`
}

function replaceFetch(indexStr: string, fetchExpr: string) {
    const nodeShims = `if (globalThis.process?.release?.name === "node") {
            const fs = (await import('fs')).default;
            input = fs.readFileSync(input);
        } else {
            input = fetch(input);
        }`
    return indexStr.replace(fetchExpr, nodeShims)
}

async function rewriteIndexJs(outputDir: string): Promise<void> {
    const indexFile = path.join(outputDir, "index.js")
    let indexStr = await readFile(indexFile, "utf8")

    const fetchExpr = "input = fetch(input);"
    indexStr = addTopLineComment(indexStr)
    indexStr = indexStr.replace("index_bg.wasm", "index.wasm")
    if (indexStr.includes(fetchExpr)) {
        indexStr = replaceFetch(indexStr, fetchExpr)
        await writeFile(indexFile, indexStr)
        log.success(c.green("CLI"), `generate ${indexFile}`)
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
    log.success(c.blue("DTS"), `generate ${indexDtsFile}`)
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
    const cargoPath = path.join(entry, "Cargo.toml")
    const file = await readFile(cargoPath, "utf8")
    let parentCargoFile: Record<string, TomlPrimitive> = {}
    if (file.includes("workspace")) {
        const parentFilePath = await findUp("Cargo.toml", { cwd: path.dirname(toAbsolute(entry)), type: "file" })
        if (parentFilePath && isFileSync(parentFilePath)) {
            log.debug("find parent Cargo.toml:", parentFilePath)
            parentCargoFile = parse(await readFile(parentFilePath, "utf8"))
        }
    }
    const projectConfig = parse(file)
    const resolved = resolveCargoWorkspace(parentCargoFile, projectConfig)
    log.debug("resolved project config:", resolved)
    return resolved
}

function resolveCargoWorkspace(parent: Record<string, any>, project: Record<string, any>): Record<string, any> {
    const workspacePkg = parent?.workspace?.package
    const _project = project
    for (const [key, value] of Object.entries(project)) {
        if (typeof value === "object" && !(value instanceof TomlDate) && !Array.isArray(value)) {
            if (value.workspace === true && workspacePkg) {
                _project[key] = workspacePkg[key]
            } else {
                resolveCargoWorkspace(parent, value)
            }
        }
    }
    return _project
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

export function checkOptions(opts: Partial<BuildOptions>) {
    const { entry: entries } = opts
    for (const entry of entries ?? []) {
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
    }
}
