import {
    mkdtempSync, rmSync, symlinkSync, unlinkSync, writeFileSync,
} from "node:fs"
import fs from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import process from "node:process"
import {
    describe, expect, it,
    onTestFailed,
    onTestFinished,
} from "vitest"
import {
    commandExists, isDirSync, isFileSync, toAbsolute,
} from "../src/util"


describe("commandExists", () => {
    it("should return true if the command exists and is executable", async () => {
        const command = "echo"
        const result = await commandExists(command)
        expect(result).toBe(true)
    })

    it("should return false if the command does not exist", async () => {
        const command = "nonexistentcommand"
        const result = await commandExists(command)
        expect(result).toBe(false)
    })

    it("should return false if the command exists but is not executable", async () => {
        const tmpFile = `${tmpdir()}/testfile`
        await fs.writeFile(tmpFile, "")
        const command = tmpFile
        const result = await commandExists(command)
        await fs.unlink(tmpFile)
        expect(result).toBe(false)
    })
})

describe("isDirSync", () => {
    it("should return true for an existing directory", () => {
        const tempDir = mkdtempSync("test-")
        expect(isDirSync(tempDir)).toBe(true)
        rmSync(tempDir, { recursive: true })
    })

    it("relative path and absolute path", () => {
        expect(isDirSync("./fixture/hello_world")).toBe(true)
        expect(isDirSync("fixture/hello_world")).toBe(true)
        expect(isDirSync(`${process.cwd()}/fixture/hello_world`)).toBe(true)
        expect(isDirSync("/fixture/hello_world")).toBe(false)
        expect(isDirSync("/home/fixture/hello_world")).toBe(false)
    })

    it("should return false for a non-existent path", () => {
        expect(isDirSync("non-existent-path")).toBe(false)
    })

    it("should return false for a file", () => {
        const tempFile = `${import.meta.dirname}/temp.txt`
        writeFileSync(tempFile, "")
        expect(isDirSync(tempFile)).toBe(false)
        unlinkSync(tempFile)
    })
})


describe("isFileSync", () => {
    const tempDir = tmpdir()

    it("should return true if file exists", () => {
        const tempFile = path.resolve(tempDir, "test.txt")
        writeFileSync(tempFile, "")
        expect(isFileSync(tempFile)).toBe(true)
        rmSync(tempFile, { force: true })
    })

    it("should return false if file does not exist", () => {
        expect(isFileSync("test.txt")).toBe(false)
    })

    it("should return false if path is a directory", () => {
        expect(isFileSync(tempDir)).toBe(false)
    })

    it("should return false if path is a symbolic link", () => {
        const tempFile = path.resolve(tempDir, "test.txt")
        const tempLink = path.resolve(tempDir, "test.link")
        const finalExec = () => {
            rmSync(tempLink, { force: true })
            rmSync(tempFile, { force: true })
        }
        onTestFinished(finalExec)
        onTestFailed(finalExec)
        writeFileSync(tempFile, "")
        symlinkSync(tempFile, tempLink)
        expect(isFileSync(tempLink)).toBe(true)
    })

    it("should return false if path is relative", () => {
        const filePath = "fixture/hello_world/Cargo.toml"
        expect(isFileSync(filePath)).toBe(true)
    })

    it("should return false if path is a url", () => {
        const filePath = `file://${process.cwd()}/fixture/hello_world/Cargo.toml`
        expect(isFileSync(filePath)).toBe(false)
    })
})


describe("toAbsolute", () => {
    it("should return an absolute path", () => {
        expect(toAbsolute("./fixture/hello_world/Cargo.toml")).toBe(`${process.cwd()}/fixture/hello_world/Cargo.toml`)
        expect(toAbsolute("fixture/hello_world/Cargo.toml")).toBe(`${process.cwd()}/fixture/hello_world/Cargo.toml`)
        expect(toAbsolute("fixture/hello_world")).toBe(`${process.cwd()}/fixture/hello_world`)
        expect(toAbsolute("../fixture/hello_world")).toBe(path.resolve(process.cwd(), "../fixture/hello_world"))
    })

})
