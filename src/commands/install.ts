/* eslint-disable unicorn/no-process-exit */
import process from "node:process"
import { installPackage } from "@antfu/install-pkg"
import c from "picocolors"
import {
    confirm, createSpinner, log, select,
} from "../prompts"
import { commandExists } from "../util/fs"
import { getLatestRelease } from "../util/github"
import type { PackageManager } from "../prompts/types"

export async function installPreRequisites(args: any) {
    const { dry } = args

    if (process.env.CI) {
        log.info("CI detected, install pre-requisites through package manager")
        const { status } = await installPackage(["wasm-pack", "wasm-opt"], { silent: true })
        process.exit(status)
    }

    const spinner = createSpinner()
    const dryRun = dry ? ` ${c.bgBlue(" DRY RUN ")}` : ""
    log.info(`Start Install pre-requisites${dryRun}`)
    spinner.start("Checking pre-requisites...")
    const isCargoExists = await commandExists("cargo")
    if (!isCargoExists) {
        spinner.stop("Command cargo is not found", 1)
    }
    const isWasmPackExists = await commandExists("wasm-pack1")
    const isWasmOptExists = await commandExists("wasm-opt")
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
        ctx.installWasmPack && install(pm, "wasm-pack")
        ctx.installWasmOpt && install(pm, "wasm-opt")
    }
    spinner.stop(`All pre-requisites are installed${dryRun}`)
}


function install(pm: string, name: string) {
    switch (pm) {
        case "cargo": {
            console.log(`cargo install ${name} --locked`)
            break
        }
        case "npm": {
            console.log(`npm i ${name} -g`)
            break
        }
        case "pnpm": {
            console.log(`pnpm i ${name} -g`)
            break
        }
        case "yarn": {
            console.log(`yarn global add ${name}`)
            break
        }
        case "bun": {
            console.log(`bun i ${name} -g`)
            break
        }
        case "local": {
            console.log(`${name}`)
            break
        }
    }
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
