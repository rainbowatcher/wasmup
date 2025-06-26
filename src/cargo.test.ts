import { readFile } from "node:fs/promises"
import dedent from "dedent"
import { findUp } from "find-up-simple"
import {
    describe, expect, it, vi,
} from "vitest"
import { parseProjectFile } from "./cargo"

vi.mock("node:fs/promises")
vi.mock("find-up-simple")

describe("parseProjectFile", () => {
    it("should parse normal project Cargo.toml correctly", async () => {
        const mockCargoToml = dedent`
            [package]
            name = "test-project"
            version = "0.1.0"
            edition = "2021"

            [dependencies]
            wasm-bindgen = "0.2"
        `
        vi.mocked(readFile).mockResolvedValueOnce(mockCargoToml)

        const result = await parseProjectFile("test-path")

        expect(result).toStrictEqual({
            dependencies: {
                "wasm-bindgen": "0.2",
            },
            package: {
                edition: "2021",
                name: "test-project",
                version: "0.1.0",
            },
        })
    })

    it("should parse workspace project Cargo.toml correctly", async () => {
        const mockProjectToml = dedent`
            [package]
            name = "sub-project"
            version.workspace = true
            edition.workspace = true

            [dependencies]
            wasm-bindgen.workspace = true
        `
        const mockWorkspaceToml = dedent`
            [workspace.package]
            version = "1.0.0"
            edition = "2021"

            [workspace.dependencies]
            wasm-bindgen = "0.2"
        `
        vi.mocked(readFile)
            .mockResolvedValueOnce(mockProjectToml)
            .mockResolvedValueOnce(mockWorkspaceToml)

        vi.mocked(findUp).mockResolvedValueOnce("/root/Cargo.toml")

        const result = await parseProjectFile("test-path")

        // only workspace package are resolved
        expect(result).toStrictEqual({
            dependencies: {
                "wasm-bindgen": { workspace: true },
            },
            package: {
                edition: "2021",
                name: "sub-project",
                version: "1.0.0",
            },
        })
    })

    it("should return original config when workspace config not found", async () => {
        const mockProjectToml = dedent`
            [package]
            name = "sub-project"
            version.workspace = true
            edition.workspace = true
        `
        vi.mocked(readFile).mockResolvedValueOnce(mockProjectToml)
        vi.mocked(findUp).mockResolvedValueOnce(undefined)

        const result = await parseProjectFile("test-path")

        expect(result).toStrictEqual({
            package: {
                edition: { workspace: true },
                name: "sub-project",
                version: { workspace: true },
            },
        })
    })

    it("should handle file read errors", async () => {
        vi.mocked(readFile).mockRejectedValueOnce(new Error("File not found"))

        await expect(parseProjectFile("test-path"))
            .rejects
            .toThrow("File not found")
    })
})
