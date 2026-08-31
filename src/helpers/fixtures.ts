import { test as base, APIRequestContext, request, BrowserContext } from "@playwright/test";
import { ApiContext, UIContext, Fixtures } from "./types";

export const test = base.extend<Fixtures>({
    apiContext: async ({}, use) => {
        const apiRequestContexts: APIRequestContext[] = [];

        async function getFor(): Promise<ApiContext> {
            const apiRequestContext = await request.newContext({ baseURL: "http://localhost:3000/api" });
            apiRequestContexts.push(apiRequestContext);
            return { apiRequestContext };
        }

        await use(getFor);

        for (const context of apiRequestContexts) {
            await context.dispose();
        }
    },

    uiContext: async ({ browser }, use) => {
        const browserContexts: BrowserContext[] = [];

        async function getSession(): Promise<UIContext> {
            const browserContext = await browser.newContext();
            browserContexts.push(browserContext);
            const page = await browserContext.newPage();
            return { page, browserContext };
        }

        await use(getSession);

        for (const context of browserContexts) {
            await context.close();
        }
    },
});

export { expect } from "@playwright/test";