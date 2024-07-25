import { expect, it } from "vitest"
import { getLatestRelease } from "../src/util/github"

it.skip("getLatestRelease", async () => {
    const latestRelease = await getLatestRelease("WebAssembly", "binaryen")
    expect(latestRelease.tag_name).toMatchInlineSnapshot(`"version_118"`)
})
