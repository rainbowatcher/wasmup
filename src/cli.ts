import process from "node:process"
import cac from "cac"
import { runBuildCmd } from "./commands/build"
import { printSystemInfo } from "./commands/info"
import { installPreRequisites } from "./commands/install"
import { log } from "./util/log"
import { version } from "../package.json"

function initCliApp() {
    const app = cac("wasmup")
    app.command("install", "Install pre-requisites")
        .alias("i")
        .option("--dry", "Dry run")
        .action(installPreRequisites)

    app.command("build [...entry]", "Build wasm")
        .alias("b")
        .option("-c, --config", "Config to load")
        .option("-o, --output <output>", "Output path")
        .option("--entry.* <folder>", "Entry to build")
        .option("--clean", "Clean output directory")
        .option("--dry", "Enable dry run")
        .option("--dev", "Enable development build")
        .option("--profiling", "Enable profiling build")
        .option("--shims", "Generate shims")
        .option("--scope <scope>", "The npm scope to use in package.json")
        .option("--extensions <exts>", "File extensions should be included")
        .option("--ignore-output", "Add a .gitignore file in output directory")
        .example("wasmup build crates/core crates/worker --dev")
        .example("wasmup build --entry crates/core --no-shims")
        .example("wasmup build --entry crates/core --entry crates/worker --profiling")
        .action(runBuildCmd)

    app.command("info", "Show system info")
        .action(printSystemInfo)

    app.version(version)
    app.help()
    return app
}

function execute() {
    const app = initCliApp()
    try {
        const argv = app.parse(process.argv, { run: false })
        if (!app.matchedCommand && Object.keys(argv.args).length === 0 && Object.keys(argv.options).length === 1 && argv.options["--"].length === 0) {
            app.outputHelp()
        }
        app.runMatchedCommand()
    } catch (error: any) {
        log.error(error.message)
        process.exit(1)
    }
}

execute()
