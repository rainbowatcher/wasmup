import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { isExecutableSync } from "is-executable"
import { lookpath } from "lookpath"

/**
 * Checks if a command exists and is executable.
 *
 * @example
 * ```js
 * const commandExists = await commandExists("echo")
 * // commandExists === true
 * ```
 *
 * @param command - The command to check.
 * @return Whether the command exists and is executable.
 */
export async function commandExists(command: string): Promise<boolean> {
    const isWasmPackInstalled = await lookpath(command)
    if (!isWasmPackInstalled && /^win*/.test(process.platform) && !command.endsWith(".exe")) {
        console.warn(`The command ${command} in windows should end with ".exe".`)
    }
    return isWasmPackInstalled ? isExecutableSync(isWasmPackInstalled) : false
}

/**
 * Checks if a path is a directory.
 *
 * @example
 * ```js
 * const isDir = await isDirSync("./")
 * // isDir === true
 * ```
 *
 * @param path - The path to check.
 * @return Whether the path is a directory.
 */
export function isDirSync(dirPath: string): boolean {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()
}

/**
 * Converts a given path to an absolute path.
 *
 * @param inputPath - The path to convert.
 * @return The absolute path.
 */
export function toAbsolute(inputPath?: string) {
    if (inputPath === undefined) throw new Error("param inputPath is required")
    return /^(?:\/|[a-z]+:\/\/)/.test(inputPath) ? inputPath : path.normalize(path.resolve(process.cwd(), inputPath))
}

/**
 * Checks if a file exists.
 *
 * @example
 * ```js
 * const isFile = await isFileSync("./")
 * // isFile === true
 * ```
 *
 * @param absPath - The absolute path to check.
 * @return Whether the file exists.
 */
export function isFileSync(absPath: string): boolean {
    const absolutePath = toAbsolute(absPath)
    return fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()
}
