import { readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"
import c from "picocolors"
import { PRIMITIVE_TYPES } from "../consts"
import { log } from "../prompts"
import type {
    BuildOptions, DtsExports, FuncDeclare, FuncParam,
} from "../types"

const PRE_IMPORT = `import original_init, { initSync as original_initSync } from "./index.js"`

const INIT_SYNC = `
const wasm_url = new URL("index_bg.wasm", import.meta.url);
let wasmCode;
let fs;
const isDeno = typeof globalThis.Deno !== "undefined";
const isNode = globalThis.process?.release?.name === "node";
switch (wasm_url.protocol) {
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
        throw new Error(\`Unsupported protocol: \${wasm_url.protocol}\`);
}

export function initSync(module_or_path) {
    if (module_or_path !== undefined 
        && module_or_path !== null 
        && typeof module_or_path === 'object'
        && Object.keys(module_or_path).length > 0
        ) return original_initSync(module_or_path);
    if (typeof wasmCode === "undefined") {
        if (isDeno) {
            wasmCode = Deno.readFileSync(wasm_url);
        } else if (isNode) {
            wasmCode = fs.readFileSync(wasm_url);
        } else {
            throw new Error("platform not support");
        }
    }
    original_initSync({ module: wasmCode });
}

function checkInit() {
    if (!wasmCode) {
        throw new Error("WASM module not initialized");
    }
}

export async function init() {
    wasmCode = await original_init();
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
                    name: paramName,
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
    const content = await readFile(dtsPath, "utf8")
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
    await rename(dtsPath, newDtsPath)
    log.success(c.green("SHIMS"), "generate shims")
    await writeFile(jsFile, shimsContent)
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
        bigint: "BigInt",
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
    const jsTypName = typeMap[type as keyof typeof typeMap]
    if (Object.keys(typeMap).includes(type)) {
        return `if (!(${name} instanceof ${jsTypName})) { throw new Error("Invalid parameter: ${name} must be a ${jsTypName}"); }`
    } else if (PRIMITIVE_TYPES.includes(type)) {
        return `if (typeof ${name} !== "${type}") { throw new Error("Invalid parameter: ${name} must be a ${type}"); }`
    }
    return `if (!(${name} instanceof ${type})) { throw new Error("Invalid parameter: ${name} must be a ${type}"); }`
}

function genWrapperFunc(name: string, params: string, paramVerifies: string): string {
    return `export function ${name}(${params}) { checkInit(); ${paramVerifies}; return original_${name}(${params}); }`
}
