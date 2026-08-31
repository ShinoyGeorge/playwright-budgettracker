import { UIContext } from "../../helpers/types";
import { Grid } from "./Grid";

export class RecurringBillsTable extends Grid {
    constructor(session: UIContext) {
        super(session, {
            containerSelector: '[data-testid="recurring-bills-table"]',
            controlFinders: [
                (cell) => cell.getByRole("button"),
            ],
        });
    }
}