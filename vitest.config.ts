import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        projects: [{
            test: {
                include: ["tests/e2e/**/*.test.ts"],
                name: "e2e",
            },
        }, {
            test: {
                include: ["src/**/*.test.ts"],
                name: "unit",
            },
        }],
    },
})
