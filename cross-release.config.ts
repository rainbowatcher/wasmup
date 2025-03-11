import process from "node:process"
import { defineConfig } from "cross-release-cli"

export default defineConfig({
    cwd: process.cwd(),
    push: {
        followTags: true,
    },
})
