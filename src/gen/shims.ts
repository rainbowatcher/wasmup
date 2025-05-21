import fs from "node:fs/promises"
import path from "node:path"
import c from "picocolors"
import { NONE_TYPES, PRIMITIVE_TYPES } from "../consts"
import { log } from "../prompts"
import type {
    BuildOptions, DtsExports, FuncDeclare, FuncParam,
} from "../types"

const PRE_IMPORT = `import originalInit, { initSync as originalInitSync } from "./index.js"`

const INIT_SYNC = `
const wasmUrl = new URL("index_bg.wasm", import.meta.url);
let wasmBuffer, wasm, fs;
const isDeno = !!globalThis.Deno;
const isNode = globalThis.process?.release?.name === "node";
const isBrowser = !!globalThis.window;
switch (wasmUrl.protocol) {
    case "file:": {
        if (isNode) {
            fs = await import("node:fs");
        }
        break
    }
    case "https:":
    case "http:": {
        throw new Error("HTTP/HTTPS protocol is not supported in sync mode");
    }
    default:
        throw new Error(\`Unsupported protocol: \${wasmUrl.protocol}\`);
}

function __initWasmCodeSync() {
    if (isNode) { // bun should same as node
        wasmBuffer = fs.readFileSync(wasmUrl);
    } else if (isDeno) {
        wasmBuffer = Deno.readFileSync(wasmUrl);
    } else {
        throw new Error("synchronous init not support for current platform");
    }
}

async function __initWasmCodeAsync() {
    if (isNode) { // bun should same as node
        wasmBuffer = await fs.promises.readFile(wasmUrl);
    } else if (isDeno) {
        wasmBuffer = await Deno.readFile(wasmUrl);
    } else if (isBrowser) {
        wasmBuffer = await fetch(wasmUrl);
    } else {
        throw new Error("asynchronous init not support for current platform");
    }
}

export function initSync(module_or_path) {
    if (wasm) return wasm;
    if (wasmBuffer === undefined) {
        if (module_or_path !== undefined 
            && module_or_path !== null 
            && typeof module_or_path === 'object'
            && Object.keys(module_or_path).length > 0
            ) {
            wasm = originalInitSync(module_or_path);
            return
        }
        __initWasmCodeSync()
    }
    originalInitSync({ module: wasmBuffer });
}

export async function init() {
    if (wasm) return wasm;
    if (wasmBuffer === undefined) {
        await __initWasmCodeAsync()
    }

    wasm = await originalInit({ module_or_path: wasmBuffer })
}

function checkInit() {
    if (wasmBuffer === undefined) {
        throw new Error("WASM module not initialized");
    }
}

export default init;
`

/**
 * parse wasm-pack generated .d.ts file content, extract all exported functions and parameters
 * note: because WebAssembly can only export primitive types, it is safe to use regex parsing
 *
 * @param content - content of .d.ts file
 * @returns array of all exported functions and their parameters
 */
export function parseExportFunctions(content: string): FuncDeclare[] {
    const exports: FuncDeclare[] = []

    // use regex to match all exported function declarations
    const functionRegex = /export function (\w+)\s*\(([^)]*)\)\s*:\s*([^;]+)/g
    let match

    while ((match = functionRegex.exec(content)) !== null) {
        const [, name, params, returnType] = match

        // skip wasm-pack generated init function
        if (name.startsWith("init") || name.startsWith("__")) {
            continue
        }

        const parsedParams = params.split(",")
            .map(param => param.trim())
            .filter(Boolean)
            .map((param) => {
                const [paramName, paramType] = param.split(":").map(p => p.trim())
                return {
                    name: paramName.endsWith("?") ? paramName.slice(0, -1) : paramName,
                    type: paramType ?? "any",
                }
            })

        exports.push({
            name,
            params: parsedParams,
            returnType: returnType.trim(),
        })
    }

    return exports
}

export function parseExportClasses(content: string): string[] {
    const classes: string[] = []

    const classRegex = /export class (\w+)/g
    let classMatch

    while ((classMatch = classRegex.exec(content)) !== null) {
        const [, className] = classMatch

        classes.push(className)
    }

    return classes
}

/**
 * Read and parse wasm-pack generated .d.ts file
 * @param dtsPath - path to .d.ts file
 * @returns parsed exports from the file
 */
export async function parseDts(dtsPath: string): Promise<DtsExports> {
    const content = await fs.readFile(dtsPath, "utf8")
    return {
        classes: parseExportClasses(content),
        functions: parseExportFunctions(content),
    }
}

/**
 * function that generate shims for different platforms
 */
export async function generateShims(outputDir: string, opts: BuildOptions, filename = "index.js") {
    const jsFile = path.join(outputDir, filename)

    if (!opts.shims) {
        return
    }

    const dtsPath = path.join(outputDir, `index.d.ts`)
    const newDtsPath = path.join(outputDir, `shims.d.ts`)
    const { classes, functions } = await parseDts(dtsPath)

    const shimsContent = generateShimsContent(functions, classes)
    let dtsContent = await fs.readFile(dtsPath, "utf8")
    dtsContent = dtsContent.replace("initSync(module", "initSync(module?")
    await fs.writeFile(newDtsPath, dtsContent)
    await fs.rm(dtsPath)
    await fs.writeFile(jsFile, shimsContent)
    log.success(c.green("SHIMS"), "generate shims")
}

function generateShimsContent(functions: FuncDeclare[], classes: string[]): string {
    const funcsWithParams = functions.filter(f => f.params.some(p => p.type !== "any"))
    const funcsWithoutParams = functions.filter(f => f.params.every(p => p.type === "any"))
    const directExportItems = getDirectExports(funcsWithoutParams, classes)
    const directExports = `export { ${directExportItems} } from "./index.js"`
    const renameImports = getRenameImports(funcsWithParams)
    const classImports = classes?.length > 0 ? `, ${classes.join(", ")}` : ""
    const imports = `import { ${renameImports}${classImports} } from "./index.js"`
    const functionWrappers = getFunctionWrappers(funcsWithParams)

    return [
        PRE_IMPORT,
        imports,
        directExports,
        INIT_SYNC,
        functionWrappers,
    ].join("\n")
}

function getDirectExports(functions: FuncDeclare[], classes: string[]): string {
    const functionNames = functions.map(f => f.name)
    const classNames = classes.map(c => c)
    return [...functionNames, ...classNames].join(", ")
}

function getRenameImports(exportedFunctions: FuncDeclare[]): string {
    return exportedFunctions
        .map(exp => `${exp.name} as original_${exp.name}`)
        .join(", ")
}

function getFunctionWrappers(exportedFunctions: FuncDeclare[]): string {
    return exportedFunctions
        .map((exp) => {
            const params = exp.params.map(param => `${param.name}`).join(", ")
            const paramVerifies = exp.params
                .filter(p => p.type !== "any")
                .map(p => genValidationFunc(p))
                .join("\n")
            return genWrapperFunc(exp.name, params, paramVerifies)
        })
        .join("\n")
}

function genValidationFunc(param: FuncParam): string {
    const { name, type } = param
    const typeMap = {
        // bigint: "BigInt",
        BigInt64Array: "BigInt64Array",
        BigUint64Array: "BigUint64Array",
        Float32Array: "Float32Array",
        Float64Array: "Float64Array",
        Int16Array: "Int16Array",
        Int32Array: "Int32Array",
        Int8Array: "Int8Array",
        Uint16Array: "Uint16Array",
        Uint32Array: "Uint32Array",
        Uint8Array: "Uint8Array",
    }
    const assertions: string[] = []
    const jsTypeName = typeMap[type as keyof typeof typeMap] ?? type

    const getAssert = (ty: string, expect: string) => {
        if (PRIMITIVE_TYPES.includes(ty)) {
            return `typeof ${name} !== "${expect}"`
        } else if (Object.keys(typeMap).includes(ty)) {
            return `!(${name} instanceof ${expect})`
        }
        return ""
    }

    if (PRIMITIVE_TYPES.includes(type)) {
        assertions.push(getAssert(type, jsTypeName))
    } else if (Object.keys(typeMap).includes(type)) {
        assertions.push(getAssert(type, jsTypeName))
    } else if (type.includes("|")) { // is union type
        const unions = type.split("|").map(t => t.trim())
            .filter(t => !NONE_TYPES.includes(t))
        if (unions.length > 1) {
            for (const ty of unions) {
                assertions.push(getAssert(ty, ty))
            }
        } else if (unions.length > 0) {
            assertions.push(getAssert(unions[0], unions[0]))
        }
    }

    return assertions.some(Boolean) ? `if (${assertions.join(" && ")}) { throw new Error("Invalid parameter: ${name} must be a ${jsTypeName}"); }` : ""
}

function genWrapperFunc(name: string, params: string, paramVerifies: string): string {
    return `export function ${name}(${params}) { checkInit(); ${paramVerifies}; return original_${name}(${params}); }`
}
