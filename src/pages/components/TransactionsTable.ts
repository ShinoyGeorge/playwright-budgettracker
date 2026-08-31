import { UIContext } from "../../helpers/types";
import { Grid } from "./Grid";

export class TransactionsTable extends Grid {
    constructor(session: UIContext) {
        super(session, {
            containerSelector: '[data-testid="transactions-table"]',
            controlFinders: [
                (cell) => cell.getByRole("button"),
            ],
        });
    }
}