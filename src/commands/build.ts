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
import { isDirSync, isFileSync, toAbsolute } from "../util"
import type { BuildConfig as BuildOptions } from "../util"


const spinner = createSpinner()

export async function buildWasm(entry: string, opts: BuildOptions) {
    preCheck(entry)
    const _opts = await handleOptions(entry, opts)
    // process.exit(0)
    cleanOutputDir(_opts)
    build(_opts)
    optimize(_opts)
    rewriteIndexJs(_opts)
    rewriteIndexDts(_opts)
    chores(_opts)
    gereratePackageJson(_opts)
    log.success("Build success")
}

async function handleOptions(entry: string, args: BuildOptions) {
    log.debug("cli args:", args)
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
    log.debug(`Find config: ${sources.join(" ")}`)
    log.debug("config:", config)

    const resolvedConfig = defu(args, config, DEFAULT_BUILD_OPTIONS)
    resolvedConfig.output = toAbsolute(resolvedConfig.output)
    if (!resolvedConfig.entry) {
        resolvedConfig.entry = toAbsolute(entry)
    }
    log.debug(resolvedConfig)

    const { dev, release } = resolvedConfig
    if (dev && release) {
        log.error("Cannot specify both --dev and --release")
        process.exit(1)
    }

    return resolvedConfig
}

function rewriteIndexDts(opts: BuildOptions) {
    const { output } = opts
    spinner.start("Re-Writing index.d.js...")
    log.debug("index.d.js:", `${output}/index.d.ts`)
    const indexDStr = readFileSync(`${output}/index.d.ts`, "utf8")
    const newIndexDStr = `/* eslint-disable unicorn/no-abusive-eslint-disable */\n${indexDStr}`
    writeFileSync(`${output}/index.d.ts`, newIndexDStr)
    spinner.stop()
    log.debug("index.d.js generated")
}

function rewriteIndexJs(opts: BuildOptions) {
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

function cleanOutputDir(opts: BuildOptions) {
    const { clean, output } = opts
    if (clean) {
        spinner.start("Clean output directory...")
        log.debug("Clean output directory:", output)
        const success = rimrafSync(output)
        spinner.stop(undefined, success ? 0 : 1)
    }
}

function build(opts: BuildOptions) {
    const { entry, output, release } = opts
    spinner.start("Building wasm...")
    const extraBuildArgs = [release ? "--release" : ""].filter(Boolean)
    log.debug("execute command:", `wasm-pack build -t web --no-opt --no-pack --out-name index -d ${output} ${entry} ${extraBuildArgs.join(" ")}`)
    const { exitCode: buildExitCode } = execaSync`wasm-pack build -t web --no-opt --no-pack --out-name index -d ${output} ${entry} ${extraBuildArgs}`
    spinner.stop(undefined, buildExitCode)
}

function optimize(opts: BuildOptions) {
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

function parseProjectFile(entry: string): Record<string, any> {
    const file = readFileSync(`${entry}/Cargo.toml`, "utf8")
    const projectConfig = parse(file)
    log.debug("project config:", projectConfig)
    return projectConfig
}

function preCheck(entry: string) {
    const absPath = toAbsolute(entry)
    if (!isDirSync(absPath)) {
        log.error(`${absPath} is not a valid directory.`)
        process.exit(1)
    }

    const isProjectConfigExists = isFileSync(`${absPath}/Cargo.toml`)
    if (!isProjectConfigExists) {
        log.error(`${absPath}/Cargo.toml is not found.`)
        process.exit(1)
    }
}

function chores(opts: BuildOptions) {
    spinner.start("Clearing build output...")
    const files = ["index_bg.wasm", "index_bg.wasm.d.ts", ".gitignore"]
    for (const file of files) {
        const filePath = `${opts.output}/${file}`
        log.debug("remove:", filePath)
        rimrafSync(filePath)
    }
    spinner.stop()
}

function gereratePackageJson(opts: BuildOptions) {
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
        const ext = f.split(".").at(-1)
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
    writeFileSync(`${output}/package.json`, `${JSON.stringify(packageJson, null, 2)}\n`)
    spinner.stop()
    log.debug("package.json generated")
}
