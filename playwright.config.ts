import "./src/helpers/env";
import { defineConfig } from "@playwright/test";

const isHeadless = process.env.HEADLESS === 'true';

export default defineConfig({
    timeout: 20_000,
    reporter: 'html',
    use: {
        baseURL: process.env.BASE_URL,
        screenshot: 'only-on-failure',
        trace: 'on',
    },
    projects: [
        {
            name: "regression",
            testDir: "./src/tests",
            grep: /@regression/,
            use: {
                headless: isHeadless,
            }
        },
    ]
});