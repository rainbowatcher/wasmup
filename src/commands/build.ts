/* eslint-disable unicorn/no-process-exit */
import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import process from "node:process"
import defu from "defu"
import { execaSync } from "execa"
import { rimrafSync } from "rimraf"
import { parse } from "smol-toml"
import { loadConfig } from "unconfig"
import { DEFAULT_BUILD_OPTIONS } from "../consts"
import { createSpinner, log } from "../prompts"
import {
    isDirSync, isFileSync, pkgJsonComparator, stableStringify, toAbsolute,
} from "../util"
import type { BuildOptions, CommandLineArgs } from "../util"


const spinner = createSpinner()

export async function buildWasm(entry: string, opts: CommandLineArgs) {
    const _opts = await resolveOptions(entry, opts)
    cleanOutputDir(_opts)
    build(_opts)
    optimize(_opts)
    rewriteIndexJs(_opts)
    rewriteIndexDts(_opts)
    chores(_opts)
    gereratePackageJson(_opts)
    log.success("Build success")
}

export async function resolveOptions(entry: string, args: CommandLineArgs): Promise<BuildOptions> {
    log.debug("cli args:", entry, args)
    const absEntry = preCheck(entry)
    let resolvedOpts = { entry: absEntry, ...args }
    if (args.config) {
        const config = toAbsolute(args.config)
        let configObj = {}
        if (!isFileSync(config)) {
            log.error(`${config} is not a valid file.`)
            process.exit(1)
        }
        const configExt = args.config.split(".").pop() ?? ""
        if (configExt === "json") {
            const configStr = readFileSync(config, "utf8")
            configObj = JSON.parse(configStr)
        } else if (["cjs", "js", "mjs", "mts", "ts"].includes(configExt)) {
            const { default: co } = await import(config)
            configObj = co
        }
        resolvedOpts = defu(resolvedOpts, configObj)
        resolvedOpts.config = toAbsolute(resolvedOpts.config)
    } else {
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
        resolvedOpts = defu(resolvedOpts, configObj)
    }

    resolvedOpts = defu(resolvedOpts, DEFAULT_BUILD_OPTIONS)
    resolvedOpts.output = toAbsolute(resolvedOpts.output)
    log.debug("resolved config:", resolvedOpts)

    const { dev, release } = resolvedOpts
    if (dev && release) {
        log.error("Cannot specify both --dev and --release")
        process.exit(1)
    }

    return resolvedOpts as BuildOptions
}

export function rewriteIndexDts(opts: BuildOptions) {
    const { output } = opts
    spinner.start("Re-Writing index.d.js...")
    log.debug("begin re-write index.d.js:", `${output}/index.d.ts`)
    const indexDStr = readFileSync(`${output}/index.d.ts`, "utf8")
    const newIndexDStr = `/* eslint-disable unicorn/no-abusive-eslint-disable */\n${indexDStr}`
    writeFileSync(`${output}/index.d.ts`, newIndexDStr)
    spinner.stop()
    log.debug("index.d.js generated")
}

export function rewriteIndexJs(opts: BuildOptions) {
    const { output } = opts
    spinner.start("Re-Writing index.js...")
    const indexStr = readFileSync(`${output}/index.js`, "utf8")
    const fetchExpr = "input = fetch(input);"
    if (indexStr.includes(fetchExpr)) {
        const newIndexStr = `/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */\n${indexStr.replace(fetchExpr, `if (globalThis.process?.release?.name === "node") {
        const fs = (await import('fs')).default;
        input = fs.readFileSync(input);
        } else {
            input = fetch(input);
        }`)}`
        writeFileSync(`${output}/index.js`, newIndexStr)
    } else {
        spinner.stop("generated js file may incorrect", 1)
        process.exit(1)
    }
    spinner.stop()
}

export function cleanOutputDir(opts: BuildOptions) {
    const { clean, output } = opts
    if (clean) {
        spinner.start("Clean output directory...")
        log.debug("clean output directory:", output)
        const success = rimrafSync(output)
        spinner.stop(undefined, success ? 0 : 1)
    }
}

export function build(opts: BuildOptions) {
    const { entry, output, release } = opts
    spinner.start("Building wasm...")
    const extraBuildArgs = [release ? "--release" : ""].filter(Boolean)
    log.debug("execute command:", `wasm-pack build -t web --no-opt --no-pack --out-name index -d ${output} ${entry} ${extraBuildArgs.join(" ")}`)
    const { exitCode: buildExitCode } = execaSync`wasm-pack build -t web --no-opt --no-pack --out-name index -d ${output} ${entry} ${extraBuildArgs}`
    spinner.stop(undefined, buildExitCode)
}

export function optimize(opts: BuildOptions) {
    const { opt, output, release } = opts
    spinner.start("Optimizing wasm...")
    const extraOptArgs = [
        ...release ? ["--strip-dwarf", "--zero-filled-memory", "--strip-debug", "--flatten", "--vacuum", "--rse"] : [],
        "--optimize-level",
        `${opt.optLevel}`,
        "--shrink-level",
        `${opt.shrinkLevel}`,
    ].filter(Boolean)
    const sourceWasm = `${output}/index_bg.wasm`
    const targetWasm = `${output}/index.wasm`
    log.debug("execute command:", `wasm-opt ${sourceWasm} -o ${targetWasm} ${extraOptArgs.join(" ")}`)
    try {
        const { exitCode: optExitCode } = execaSync`wasm-opt ${sourceWasm} -o ${targetWasm} ${extraOptArgs}`
        spinner.stop(undefined, optExitCode)
    } catch (error: any) {
        spinner.stop(error.message, error.exitCode ?? 1)
    }
}

export function parseProjectFile(entry: string): Record<string, any> {
    const file = readFileSync(`${entry}/Cargo.toml`, "utf8")
    const projectConfig = parse(file)
    log.debug("project config:", projectConfig)
    return projectConfig
}

export function preCheck(entry: string) {
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

    return absEntry
}

export function chores(opts: BuildOptions) {
    spinner.start("Clearing build output...")
    const files = ["index_bg.wasm", "index_bg.wasm.d.ts", opts.ignoreOutput ? "" : ".gitignore"].filter(Boolean)
    for (const file of files) {
        const filePath = `${opts.output}/${file}`
        log.debug("remove:", filePath)
        rimrafSync(filePath)
    }
    spinner.stop()
}

export function gereratePackageJson(opts: BuildOptions) {
    const {
        package: {
            author,
            description,
            homepage: customHomepage,
            keywords,
            license,
            name,
            repository,
            version,
        },
    } = parseProjectFile(opts.entry)
    const { extensions, output } = opts

    spinner.start("Generating package.json...")
    const files = readdirSync(output).filter((f) => {
        const ext = f.split(".").pop()
        if (!ext) return false
        return extensions.includes(ext)
    })
    const bugs = typeof repository === "string" ? `${repository}/issues` : undefined
    const homepage = customHomepage ?? (typeof repository === "string" ? `${repository}#readme` : undefined)
    const packageJson = {
        author,
        bugs,
        description,
        files,
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
    writeFileSync(`${output}/package.json`, `${stableStringify(packageJson, { cmp: pkgJsonComparator, space: 4 })}\n`)
    spinner.stop()
    log.debug("package.json generated")
}
