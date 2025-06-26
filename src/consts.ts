import { unicode } from "./util"
import type { BuildOptions } from "./types"

const s = (c: string, fallback: string) => (unicode ? c : fallback)

export const SYMBOLS = {
    debug: s("⚙", "D"),
    error: s("✘", "x"),
    fatal: s("▲", "x"),
    info: s("ℹ", "i"),
    question: s("❔", "?"),
    step: s("◆", "*"),
    success: s("✔", "✓"),
    warn: s("⚠", "!"),
}

export const DEFAULT_BUILD_OPTIONS: Omit<BuildOptions, "config" | "entry"> = {
    clean: false,
    dev: false,
    dry: false,
    extensions: ["js", "ts", "wasm"],
    ignoreOutput: false,
    output: "wasm-dist",
    profiling: false,
    shims: true,
}

export const SHIMS = "shims"

export const NONE_TYPES = [
    "null",
    "undefined",
]

export const PRIMITIVE_TYPES = [
    "string",
    "number",
    "boolean",
    "symbol",
    "bigint",
    ...NONE_TYPES,
]
