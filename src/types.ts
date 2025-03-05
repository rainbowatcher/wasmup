type BuildContext = {
    entry: string
    opts: BuildOptions
    outputDir: string
}

type BuildOptions = {
    /**
     * Whether to clean output directory
     * @default false
     */
    clean: boolean

    /**
     * Config file to load
     * @default undefined
     */
    config?: string

    /**
     * Whether to build for development
     * @default false
     */
    dev: boolean

    /**
     * Whether to dry run
     * @default false
     */
    dry: boolean

    /**
     * Entry directories for wasm project to package
     */
    entry: string[]

    /**
     * File extensions should be included for The files field in package.json
     * @default ["js", "ts", "wasm"]
     */
    extensions: string[]

    /**
     * Whether to add a .gitignore file in output directory, to ignore wasmup output directory in git
     * @default false
     */
    ignoreOutput: boolean

    /**
     * The wasm build output path
     */
    output: string

    /**
     * Whether to build for release
     * @default false
     */
    release: boolean

    /**
     * The npm scope to use in package.json
     * @default undefined
     */
    scope?: string
}

type ConfigOptions = Partial<Omit<BuildOptions, "config">>
type CommandLineArgs = Partial<Omit<BuildOptions, "opts">>

type MaybeUndefined<T> = T | undefined


export type {
    BuildContext, BuildOptions, CommandLineArgs, ConfigOptions, MaybeUndefined,
}
