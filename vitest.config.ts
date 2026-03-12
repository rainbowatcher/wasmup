import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    include: ["tests/e2e/**/*.test.ts"],
                    name: "e2e",
                },
            },
            {
                test: {
                    exclude: ["tests/e2e/**/*.test.ts"],
                    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
                    name: "unit",
                },
            },
        ],
    },
})
