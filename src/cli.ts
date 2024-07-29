/* eslint-disable unicorn/no-process-exit */
import process from "node:process"
import cac from "cac"
import { version } from "../package.json"
import { buildWasm } from "./commands/build"
import { installPreRequisites } from "./commands/install"
import { log } from "./prompts"

function initCliApp() {
    const app = cac("wasmup")
    app.command("install", "Install pre-requisites")
        .option("--dry", "Dry run")
        .action(installPreRequisites)

    app.command("build [...entries]", "Build wasm")
        .option("--clean", "Clean output directory")
        .option("-c, --config", "Config to load")
        .option("--dev", "Build for development")
        .option("--dry", "Dry run")
        .option("--entry.* <folder>", "Entry to build")
        .option("--extensions <exts>", "File extensions should be included, separated by comma")
        .option("--ignore-output", "Add a .gitignore file in output directory")
        .option("-o, --output <output>", "Output path")
        .option("--release", "Build for release")
        .option("--scope <scope>", "The npm scope to use in package.json")
        .example("wasmup build crates/core crates/worker --dev")
        .example("wasmup build --entry crates/core --entry crates/worker --release")
        .action(buildWasm)

    app.version(version)
    app.help()
    return app
}

function execute() {
    const app = initCliApp()
    try {
        const argv = app.parse(process.argv, { run: false })
        if (Object.keys(argv.args).length === 0 && Object.keys(argv.options).length === 1 && argv.options["--"].length === 0) {
            app.outputHelp()
        }
        app.runMatchedCommand()
    } catch (error: any) {
        log.error(error.message)
        process.exit(1)
    }
}

execute()
