import process from "node:process"
import { describe, expect, it } from "vitest"
import { getLatestRelease } from "../src/util/github"

const isCoverage = process.env.npm_lifecycle_script === "vitest run --coverage"

describe("github", () => {
    it.runIf(isCoverage)("getLatestRelease", async () => {
        const latestRelease = await getLatestRelease("WebAssembly", "binaryen")
        expect(latestRelease.tag_name).toMatchInlineSnapshot(`"version_118"`)
    })
})
