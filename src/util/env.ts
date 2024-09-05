import process from "node:process"
import { isExecutableSync } from "is-executable"
import isUnicodeSupported from "is-unicode-supported"
import { lookpath } from "lookpath"

export const unicode = isUnicodeSupported()

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
