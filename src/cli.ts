/* eslint-disable unicorn/no-process-exit */
import process from "node:process"
import cac from "cac"
import { version } from "../package.json"
import { buildWasm } from "./commands/build"
import { installPreRequisites } from "./commands/install"
import { log } from "./prompts"

function main() {
    const cli = cac("wasmup")
    cli.command("install", "Install pre-requisites")
        .option("--dry", "Dry run")
        .action(installPreRequisites)

    cli.command("build [entry]", "Build wasm")
        .option("--clean", "Clean output directory")
        .option("--dry", "Dry run")
        .option("--dev", "Build for development")
        .option("-e, --extensions <exts>", "File extensions should be included, separated by comma")
        .option("-o, --output <output>", "Output path")
        .option("--release", "Build for release")
        .option("--entry <entry>", "Entry directory")
        .action(buildWasm)

    cli.version(version)
    cli.help()
    cli.showHelpOnExit = true
    try {
        cli.parse(process.argv)
    } catch (error: any) {
        log.error(error.message)
        process.exit(1)
    }
}

main()
