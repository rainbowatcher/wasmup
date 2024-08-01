/* eslint-disable unicorn/no-process-exit */
import { spawn } from "node:child_process"
import process from "node:process"
import c from "picocolors"
import {
    confirm, createSpinner, log, select,
} from "../prompts"
import { commandExists } from "../util/fs"
import { getLatestRelease } from "../util/github"
import type { PackageManager } from "../prompts/types"

const WASM_PACK = "wasm-pack"
const WASM_OPT = "wasm-opt"

export async function installPreRequisites(args: any) {
    const { dry } = args

    if (process.env.CI) {
        log.info("CI detected, install pre-requisites through package manager")
        log.info(process.env.CI)
        const { exitCode } = spawn("pnpm", ["install", "-g", "wasm-pack", "wasm-opt"])
        log.info("Install pre-requisites done")
        process.exit(exitCode)
    }

    const spinner = createSpinner()
    const dryRun = dry ? ` ${c.bgBlue(" DRY RUN ")}` : ""
    log.info(`Start Install pre-requisites${dryRun}`)
    spinner.start("Checking pre-requisites...")
    const isCargoExists = await commandExists("cargo")
    if (!isCargoExists) {
        spinner.stop("Command cargo is not found", 1)
    }
    const isWasmPackExists = await commandExists(WASM_PACK)
    const isWasmOptExists = await commandExists(WASM_OPT)
    const ctx = {
        installWasmOpt: false,
        installWasmPack: false,
    }

    if (!isWasmPackExists) {
        spinner.stop()
        const installWasmPack = await confirm("Command wasm-pack is not found, install it?")
        if (!installWasmPack) {
            log.info("Please install wasm-pack manually")
            process.exit(0)
        }
        ctx.installWasmPack = true
    }

    if (!isWasmOptExists) {
        spinner.stop()
        const installWasmOpt = await confirm("Command wasm-opt is not found, install it?")
        if (!installWasmOpt) {
            log.info("Please install wasm-opt manually")
            process.exit(0)
        }
        ctx.installWasmOpt = true
    }

    log.info(c.dim("cargo is recommended, because nodejs or bun may fail due to proxy issue by fetch"))

    const pm = await select<"local" | PackageManager>({
        message: "Select a package manager to install wasm-pack",
        options: [
            { hint: "cargo install, recommended", label: "Cargo", value: "cargo" },
            { hint: "npm i -g", label: "Npm", value: "npm" },
            { hint: "pnpm i -g", label: "Pnpm", value: "pnpm" },
            { hint: "yarn global add", label: "Yarn", value: "yarn" },
            { hint: "bun i -g", label: "Bun", value: "bun" },
            { hint: "project directory", label: "Local", value: "local" },
        ],
    })

    spinner.start("Installing wasm-pack...")
    if (!dry) {
        ctx.installWasmPack && install(pm, WASM_PACK)
        ctx.installWasmOpt && install(pm, WASM_OPT)
    }
    spinner.stop(`All pre-requisites are installed${dryRun}`)
}

function install(pm: string, name: string) {
    let ps
    switch (pm) {
        case "cargo": {
            ps = spawn("cargo", ["install", name, "--locked"])
            break
        }
        case "npm": {
            ps = spawn("npm", ["install", name, "-g"])
            break
        }
        case "pnpm": {
            ps = spawn("pnpm", ["install", name, "-g"])
            break
        }
        case "yarn": {
            ps = spawn("yarn", ["global", "add", name])
            break
        }
        case "bun": {
            ps = spawn("bun", ["install", name, "-g"])
            break
        }
        case "local": {
            console.log("not implement yet")
            break
        }
    }

    ps?.on("message", console.log)
    ps?.on("error", console.log)
}

export async function getBinaryenDownloadUrl() {
    const arch = process.arch === "x64" ? "x86_64" : (process.arch === "arm64" ? "arm64" : "not supported")
    const os = process.platform === "win32" ? "windows" : (process.platform === "darwin" ? "macos" : "linux")
    if (arch === "not supported") {
        throw new Error("Unsupported platform")
    }
    const json = await getLatestRelease("WebAssembly", "binaryen")
    const { assets, tag_name: binaryenVersion } = json
    const assetName = `binaryen-${binaryenVersion}-${arch}-${os}.tar.gz`
    const url = (assets as any[]).find(asset => asset.name === assetName).browser_download_url

    return url as string
}
