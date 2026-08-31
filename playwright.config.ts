import "./src/helpers/env";
import { defineConfig } from "@playwright/test";

export default defineConfig({
    timeout: 120_000,
    use: {
        baseURL: process.env.BASE_URL,
    },
    projects: [
        {
            name: "regression",
            testDir: "./src/tests",
            grep: /@regression/,
            use: {
                headless: false,
            }
        },
    ]
});