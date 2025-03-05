import * as fsExtra from "@rainbowatcher/fs-extra"
import * as pathExtra from "@rainbowatcher/path-extra"
import * as unconfig from "unconfig"
import {
    describe, expect, it, vi,
} from "vitest"
import { loadWasmupConfig } from "./config"

vi.mock("@rainbowatcher/path-extra")
vi.mock("@rainbowatcher/fs-extra")
vi.mock("unconfig")

describe("loadWasmupConfig", () => {
    it("should load default config when no config path specified", async () => {
        // Arrange
        const mockConfig = {
            config: { outDir: "dist" },
            sources: ["wasmup.config.ts"],
        }
        vi.mocked(unconfig.loadConfig).mockResolvedValue(mockConfig)

        // Act
        const actualConfig = await loadWasmupConfig({})

        // Assert
        expect(actualConfig).toStrictEqual({ outDir: "dist" })
        expect(unconfig.loadConfig).toHaveBeenCalledWith({
            sources: [
                {
                    extensions: ["ts", "mts", "cts", "js", "mjs", "cjs", "json"],
                    files: "wasmup.config",
                },
                {
                    files: "package.json",
                    rewrite: expect.any(Function),
                },
            ],
        })
    })

    it("should load user specified config file", async () => {
        // Arrange
        const inputConfigPath = "./custom-config.ts"
        const mockAbsolutePath = "/abs/path/custom-config.ts"
        const mockConfig = {
            config: { outDir: "custom-dist" },
            sources: [mockAbsolutePath],
        }

        vi.mocked(pathExtra.toAbsolute).mockReturnValue(mockAbsolutePath)
        vi.mocked(fsExtra.isFileSync).mockReturnValue(true)
        vi.mocked(unconfig.loadConfig).mockResolvedValue(mockConfig)

        // Act
        const actualConfig = await loadWasmupConfig({ config: inputConfigPath })

        // Assert
        expect(actualConfig).toStrictEqual({
            config: inputConfigPath,
            outDir: "custom-dist",
        })
        expect(pathExtra.toAbsolute).toHaveBeenCalledWith(inputConfigPath)
        expect(fsExtra.isFileSync).toHaveBeenCalledWith(mockAbsolutePath)
        expect(unconfig.loadConfig).toHaveBeenCalledWith({
            sources: [{
                files: mockAbsolutePath,
            }],
        })
    })

    it("should throw error when specified config file does not exist", async () => {
        // Arrange
        const inputConfigPath = "./non-exist.ts"
        const mockAbsolutePath = "/abs/path/non-exist.ts"

        vi.mocked(pathExtra.toAbsolute).mockReturnValue(mockAbsolutePath)
        vi.mocked(fsExtra.isFileSync).mockReturnValue(false)

        // Act & Assert
        await expect(loadWasmupConfig({ config: inputConfigPath }))
            .rejects
            .toThrow(`${mockAbsolutePath} is not a valid file.`)
    })
})
