import { APIRequestContext, Page, BrowserContext } from "@playwright/test";

export interface ApiContext {
    apiRequestContext: APIRequestContext;
}

export interface UIContext {
    page: Page;
    browserContext: BrowserContext;
}

export interface Fixtures {
    apiContext: () => Promise<ApiContext>;
    uiContext: () => Promise<UIContext>;
}