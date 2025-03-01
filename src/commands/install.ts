/* eslint-disable unicorn/no-process-exit */
import process from "node:process"
import { execa } from "execa"
import c from "picocolors"
import {
    confirm, createSpinner, log, select,
} from "../prompts"
import { commandExists } from "../util"
import type { PackageManager } from "../prompts/types"

const WASM_PACK = "wasm-pack"

export async function installPreRequisites(args: any) {
    const { dry } = args

    if (process.env.CI) {
        log.info("CI detected, install pre-requisites through package manager")
        const { exitCode } = await execa("pnpm", ["install", "-g", WASM_PACK])
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
        ctx.installWasmPack && await install(pm, WASM_PACK)
    }
    spinner.stop(`All pre-requisites are installed${dryRun}`)
}

async function install(pm: string, name: string) {
    switch (pm) {
        case "bun": {
            await execa("bun", ["install", name, "-g"])
            break
        }
        case "cargo": {
            await execa("cargo", ["install", name, "--locked"])
            break
        }
        case "local": {
            console.log("not implement yet")
            break
        }
        case "npm": {
            await execa("npm", ["install", name, "-g"])
            break
        }
        case "pnpm": {
            await execa("pnpm", ["install", name, "-g"])
            break
        }
        case "yarn": {
            await execa("yarn", ["global", "add", name])
            break
        }
    }
}
