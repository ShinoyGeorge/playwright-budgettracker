import { UIContext } from "../../helpers/types";
import { Grid } from "./Grid";


export class AccountsTable extends Grid {
    constructor(session: UIContext) {
        super(session, {
            containerSelector: '[data-testid="accounts-table"]',
            controlFinders: [
                (cell) => cell.getByRole("link"),
                (cell) => cell.getByRole("button"),
            ],
        });
    }
}