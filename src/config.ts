import { isFileSync } from "@rainbowatcher/fs-extra"
import { toAbsolute } from "@rainbowatcher/path-extra"
import { loadConfig } from "unconfig"
import { log } from "./prompts"
import type { BuildOptions, CommandLineArgs } from "./types"

async function loadDefaultConfig(): Promise<Partial<BuildOptions>> {
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
    if (config) {
        log.debug("find config file: %s", sources)
    } else {
        log.debug("no config file found")
    }
    return config
}

async function loadUserSpecifiedConfigFile(configPath: string): Promise<Partial<BuildOptions>> {
    const absConfigPath = toAbsolute(configPath)
    if (!isFileSync(absConfigPath)) {
        throw new Error(`${absConfigPath} is not a valid file.`)
    }

    const { config, sources } = await loadConfig<Partial<BuildOptions>>({
        sources: [{
            files: absConfigPath,
        }],
    })

    log.debug("load specified config file: %s", sources)
    return { ...config, config: configPath }
}

export async function loadWasmupConfig(args: CommandLineArgs): Promise<Partial<BuildOptions>> {
    let userConfig: Partial<BuildOptions>
    if (args.config) {
        userConfig = await loadUserSpecifiedConfigFile(args.config)
    } else {
        userConfig = await loadDefaultConfig()
    }
    log.debug("user config: %O", userConfig)
    return userConfig
}
