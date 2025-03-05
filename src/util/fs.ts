import { rm } from "node:fs/promises"

/**
 * Try to remove a file
 *
 * @summary
 * if file not exists, return immediately
 * if file exists, remove it
 */
export async function tryRemoveFile(filePath: string): Promise<boolean> {
    try {
        await rm(filePath)
        return true
    } catch {
        return false
    }
}

/**
 * Try to remove files in a directory
 *
 * @summary
 * if directory not exists, return immediately
 * if directory exists, remove it
 */
export async function tryClearDir(dirPath: string): Promise<boolean> {
    try {
        await rm(dirPath, { force: true, recursive: true })
        return true
    } catch {
        return false
    }
}
