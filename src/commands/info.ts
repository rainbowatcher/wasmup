import os from "node:os"
import process from "node:process"
import { execaSync } from "execa"
import { commandExists } from "../util"
import type { CommandLineArgs } from "../util"

const execa = execaSync({ all: true, reject: false })

const WASM_PACK = "wasm-pack"

export async function printSystemInfo(_opts: CommandLineArgs) {
    console.log("arch: %s", process.arch)
    console.log("os: %s", process.platform)
    console.log("node: %s", process.versions.node)
    console.log("cpus: %O", os.cpus().length)
    console.log("mem: %s", `${os.totalmem() / 1024 / 1024 / 1024}G`)
    const wasmPackExists = await commandExists(WASM_PACK)
    let wasmPackVersion = ""
    if (wasmPackExists) {
        wasmPackVersion = execa(WASM_PACK, ["--version"]).all.replace("wasm-pack ", "")
    }
    console.log("wasm-pack: %s", wasmPackVersion)
}
