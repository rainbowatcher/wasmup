/* eslint-disable unicorn/no-process-exit */
import process from "node:process"
import select from "@inquirer/select"
import { execa } from "execa"
import yoctoSpinner from "yocto-spinner"
import c from "yoctocolors"
import { commandExists } from "../util"
import { log } from "../util/log"
import type { PackageManager } from "../types"

const WASM_PACK = "wasm-pack"

export async function installPreRequisites(args: any) {
    const { dry } = args

    if (process.env.CI) {
        log.info("CI detected, install pre-requisites through package manager")
        const { exitCode } = await execa("pnpm", ["install", "-g", WASM_PACK])
        log.info("Install pre-requisites done")
        process.exit(exitCode)
    }

    const dryRun = dry ? ` ${c.bgBlue(" DRY RUN ")}` : ""
    log.info(`Start Install pre-requisites${dryRun}`)
    if (await commandExists(WASM_PACK)) {
        log.info(`${WASM_PACK} is already installed`)
        process.exit(0)
    }

    log.info(c.dim("cargo is recommended"))

    const pm = await select<"local" | PackageManager>({
        choices: [
            { description: "cargo install, recommended", name: "Cargo", value: "cargo" },
            { description: "npm i -g", name: "Npm", value: "npm" },
            { description: "pnpm i -g", name: "Pnpm", value: "pnpm" },
            { description: "yarn global add", name: "Yarn", value: "yarn" },
            { description: "bun i -g", name: "Bun", value: "bun" },
            { description: "project directory", name: "Local", value: "local" },
        ],
        message: "Select a package manager to install wasm-pack",
    })

    const spinner = yoctoSpinner({ text: `Installing ${WASM_PACK}` }).start()
    const code = await install(pm, WASM_PACK, dry)
    if (code === 0) {
        spinner.success("Success!")
    } else {
        spinner.error("Failed!")
    }

    process.exit(code)
}

async function install(pm: string, name: string, dry: boolean): Promise<number> {
    let command = ""
    switch (pm) {
        case "bun": {
            command = `bun install ${name} -g`
            break
        }
        case "local": {
            console.log("not implement yet")
            break
        }
        case "npm": {
            command = `npm install ${name} -g`
            break
        }
        case "pnpm": {
            command = `pnpm install ${name} -g`
            break
        }
        case "yarn": {
            command = `yarn global add ${name}`
            break
        }
        default: {
            command = `cargo install ${name} --locked`
        }
    }
    log.info(`executing ${command}`)
    if (!dry) {
        const { exitCode } = await execa`${command}`
        return exitCode ?? 0
    }
    return 0
}
