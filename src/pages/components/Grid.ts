import {Locator, Page} from "@playwright/test";
import {ControlFinder} from "../../types";
import {GridRow} from "./GridRow";
import {UIContext} from "../../helpers/types";

export class Grid {
    readonly page: Page;
    readonly container: Locator;
    private readonly bodyRowSelector: string;
    private readonly bodyCellSelector: string;
    private readonly controlFinders: ControlFinder[];

    constructor(session: UIContext, config: { containerSelector: string; bodyRowSelector?: string; bodyCellSelector?: string; controlFinders?: ControlFinder[] }) {
        this.page = session.page;
        this.container = session.page.locator(config.containerSelector);
        this.bodyRowSelector = config.bodyRowSelector ?? "tbody tr";
        this.bodyCellSelector = config.bodyCellSelector ?? "td";
        this.controlFinders = config.controlFinders ?? [];
    }

    async rows(): Promise<GridRow[]> {
        const locators = await this.container.locator(this.bodyRowSelector).all();
        return Promise.all(locators.map((locator) => GridRow.create(locator, this.bodyCellSelector, this.controlFinders)));
    }
}