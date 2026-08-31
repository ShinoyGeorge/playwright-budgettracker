import {Locator} from "@playwright/test";
import {GridColumn} from "./GridColumn";
import {ControlFinder} from "../../types";

export class GridRow {
    readonly locator: Locator;
    readonly column: GridColumn[];

    private constructor(locator: Locator, column: GridColumn[]) {
        this.locator = locator;
        this.column = column;
    }

    static async create(locator: Locator, bodyCellSelector: string, controlFinders: ControlFinder[]): Promise<GridRow> {
        const cells = await locator.locator(bodyCellSelector).all();
        const column = await Promise.all(cells.map((cell) => GridColumn.create(cell, controlFinders)));
        return new GridRow(locator, column);
    }
}