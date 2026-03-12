import { readFile } from "node:fs/promises"
import path from "node:path"
import { describe, expect, it } from "vitest"

const repoRoot = path.resolve(import.meta.dirname, "..")

describe("toolchain policy", () => {
    it("declares Node 20.19.0+ in package.json", async () => {
        const packageJson = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8"))

        expect(packageJson.engines).toStrictEqual({
            node: ">=20.19.0",
        })
    })

    it("does not run CI jobs on Node 18", async () => {
        const ciWorkflow = await readFile(path.join(repoRoot, ".github/workflows/ci.yml"), "utf8")

        expect(ciWorkflow).toContain("node-version: 20.19.0")
        expect(ciWorkflow).not.toContain("node-version: 18")
        expect(ciWorkflow).not.toContain("node_version: [18")
    })
})
