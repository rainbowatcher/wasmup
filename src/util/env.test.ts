import fs from "node:fs/promises"
import { tmpdir } from "node:os"
import process from "node:process"
import { describe, expect, it } from "vitest"
import { commandExists } from "./env"


describe("commandExists", () => {
    it("should return true if the command exists and is executable", async () => {
        const command = process.platform === "win32" ? "dir.exe" : "ls"
        const result = await commandExists(command)
        expect(result).toBeTruthy()
    })

    it("should return false if the command does not exist", async () => {
        const command = "nonexistentcommand"
        const result = await commandExists(command)
        expect(result).toBeFalsy()
    })

    it("should return false if the command exists but is not executable", async () => {
        const tmpFile = `${tmpdir()}/testfile`
        await fs.writeFile(tmpFile, "")
        const command = tmpFile
        const result = await commandExists(command)
        await fs.unlink(tmpFile)
        expect(result).toBeFalsy()
    })
})
