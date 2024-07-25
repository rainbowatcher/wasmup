export function defineConfig(config: Partial<BuildOptions>) {
    return config
}

export type BuildOptions = {
    clean: boolean
    dev: boolean
    dry: boolean
    entry: string
    extensions: string[]
    opt: Optimization
    output: string
    release: boolean
}

export type Optimization = {
    optLevel: string
    shrinkLevel: string
}
