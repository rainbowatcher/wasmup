import { unicode } from "./util"
import type { BuildOptions } from "./util/config"

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

export const S_STEP_ACTIVE = SYMBOLS.step
export const S_STEP_CANCEL = SYMBOLS.error
export const S_STEP_ERROR = SYMBOLS.fatal
export const S_STEP_SUBMIT = SYMBOLS.success

export const S_RADIO_ACTIVE = s("●", "-")
export const S_RADIO_INACTIVE = s("○", " ")


export const DEFAULT_BUILD_OPTIONS: Omit<BuildOptions, "config"> = {
    clean: false,
    dev: false,
    dry: false,
    entry: [],
    extensions: ["js", "ts", "wasm"],
    ignoreOutput: false,
    opt: {
        optLevel: "4",
        shrinkLevel: "4",
    },
    output: "wasm-dist",
    release: false,
}

export const NON_WEB_PLATFORM_SCRIPT = `

import { initSync } from "./index.js"

const wasm_url = new URL("index_bg.wasm", import.meta.url)
let wasmCode
switch (wasm_url.protocol) {
    case "file:": {
        if (globalThis.Deno) {
            wasmCode = await Deno.readFile(wasm_url)
        } else if (globalThis.process?.release?.name === "node") {
            const fs = await import("fs")
            wasmCode = await fs.promises.readFile(wasm_url)
        } else {
            throw new Error("platform not support")
        }
        break
    }
    case "https:":
    case "http:": {
        const response = await fetch(wasm_url)
        wasmCode = await response.arrayBuffer()
        break
    }
    default:
        throw new Error(\`Unsupported protocol: \${wasm_url.protocol}\`)
}


initSync({module: wasmCode})

export * from "./index.js"`
