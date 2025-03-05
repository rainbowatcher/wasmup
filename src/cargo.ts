import { readFile } from "node:fs/promises"
import path from "node:path"
import { toAbsolute } from "@rainbowatcher/path-extra"
import { findUp } from "find-up"
import { parse, TomlDate } from "smol-toml"
import { log } from "./prompts"
import type { TomlPrimitive } from "smol-toml"

type WorkspaceConfig = {
    workspace?: {
        dependencies?: Record<string, TomlPrimitive>
        package?: Record<string, TomlPrimitive>
    }
}

type CargoConfig = Record<string, TomlPrimitive>


/**
 * Parse project's Cargo.toml file
 * @param entry - Project entry path
 * @returns Parsed configuration object
 */
export async function parseProjectFile(entry: string): Promise<Record<string, any>> {
    const cargoFilePath = path.join(entry, "Cargo.toml")
    const cargoFile = await readFile(cargoFilePath, "utf8")

    let rootCargoFile: Record<string, TomlPrimitive> | undefined
    if (cargoFile.includes("workspace")) {
        rootCargoFile = await findRootCargoFile(entry)
    }

    const projectConfig = parse(cargoFile)
    const resolved = tryResolveWorkspaceVars(rootCargoFile, projectConfig)
    log.debug("resolved project config: %O", resolved)
    return resolved
}

async function findRootCargoFile(entry: string): Promise<Record<string, TomlPrimitive> | undefined> {
    const currentPath = path.dirname(toAbsolute(entry))
    return findRootCargoFileRecursive(currentPath)
}

async function findRootCargoFileRecursive(currentPath: string): Promise<Record<string, TomlPrimitive> | undefined> {
    const parentFilePath = await findUp("Cargo.toml", { cwd: currentPath })
    if (!parentFilePath) return

    log.debug("find parent Cargo.toml: %s", parentFilePath)
    const cargoFile = parse(await readFile(parentFilePath, "utf8"))

    if (cargoFile["workspace"]) return cargoFile

    return findRootCargoFileRecursive(path.dirname(parentFilePath))
}

/**
 * Resolve workspace properties from parent cargo.toml
 * @param parent - parent cargo.toml content
 * @param project - current project cargo.toml content
 * @returns resolved project config
 */
function tryResolveWorkspaceVars(
    parent?: CargoConfig & WorkspaceConfig,
    project: CargoConfig = {},
): CargoConfig {
    const workspacePkg = parent?.workspace?.package
    if (!workspacePkg) return project

    const pkg = project.package as Record<string, TomlPrimitive>
    if (!pkg) return project

    const resolvedPkg = Object.fromEntries(Object.entries(pkg).map(([key, value]) => {
        if (isResolvableObject(value)) {
            return [key, workspacePkg[key]]
        }
        return [key, value]
    }))

    return { ...project, package: resolvedPkg }
}


/**
 * Check if a value is a resolvable object that can contain workspace properties
 * @param value - The value to check
 * @returns True if the value is a resolvable object, false otherwise
 */
function isResolvableObject(value: TomlPrimitive): boolean {
    return value !== null
        && typeof value === "object"
        && !(value instanceof TomlDate)
        && !Array.isArray(value)
}
