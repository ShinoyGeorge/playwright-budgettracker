import {Locator} from "@playwright/test";
import {ControlFinder} from "../../types";

export class GridColumn {
  readonly cell: Locator;
  readonly controls: Locator[];

  private constructor(cell: Locator, controls: Locator[]) {
    this.cell = cell;
    this.controls = controls;
  }

  static async create(cell: Locator, finders: ControlFinder[]): Promise<GridColumn> {
    const controls: Locator[] = [];
    for (const find of finders) {
      const matches = await find(cell).all();
      controls.push(...matches);
    }
    return new GridColumn(cell, controls);
  }

  async getText(): Promise<string> {
    return (await this.cell.textContent())?.trim() ?? "";
  }
}