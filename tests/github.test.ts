import process from "node:process"
import { expect, it } from "vitest"
import { getLatestRelease } from "../src/util/github"

const isCoverage = process.env.npm_lifecycle_script === "vitest run --coverage"

it.runIf(isCoverage)("getLatestRelease", async () => {
    const latestRelease = await getLatestRelease("WebAssembly", "binaryen")
    expect(latestRelease.tag_name).toMatchInlineSnapshot(`"version_118"`)
})
