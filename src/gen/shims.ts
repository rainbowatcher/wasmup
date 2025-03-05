import { writeFile } from "node:fs/promises"
import path from "node:path"

const NON_WEB_PLATFORM_SCRIPT = `
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


/**
 * function that generate shims for different platforms
 */
export async function generateShims(outputDir: string, filename = "index.js") {
    const jsFile = path.join(outputDir, filename)
    await writeFile(jsFile, NON_WEB_PLATFORM_SCRIPT)
}
