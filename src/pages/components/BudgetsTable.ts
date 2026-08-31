import { UIContext } from "../../helpers/types";
import { Grid } from "./Grid";

export class BudgetsTable extends Grid {
    constructor(session: UIContext) {
        super(session, {
            containerSelector: '[data-testid="budgets-table"]',
            controlFinders: [
                (cell) => cell.getByRole("button"),
            ],
        });
    }
}