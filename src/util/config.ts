/* v8 ignore next 3 */
export function defineConfig(config: ConfigOptions) {
    return config
}

export type ConfigOptions = Partial<Omit<BuildOptions, "config">>
export type CommandLineArgs = Partial<Omit<BuildOptions, "entry" | "opt">>

export type BuildOptions = {
    /**
     * Whether to clean output directory
     */
    clean: boolean

    /**
     * Config file to load
     */
    config?: string
    dev: boolean
    dry: boolean

    /**
     * Entry directory for wasm project
     */
    entry: string

    /**
     * File extensions should be included for The files field in package.json
     * @default ["js", "ts", "wasm"]
     */
    extensions: string[]

    /**
     * Whether to add a .gitignore file in output directory, to ignore wasmup output directory in git
     */
    ignoreOutput: boolean
    opt: Optimization

    /**
     * The wasm build output path
     */
    output: string

    /**
     * Whether to build for release
     */
    release: boolean
}

export type Optimization = {
    optLevel: string
    shrinkLevel: string
}
