import {Locator} from "@playwright/test";
import {UIContext} from "../helpers/types";
import {Grid} from "./components/Grid";

export class AdminPendingRequestsTable extends Grid {
    constructor(session: UIContext) {
        super(session, {
            containerSelector: '[data-testid="pending-requests-table"]',
            controlFinders: [(column) => column.getByRole("button")],
        });
    }
}

export class AdminPage {
    readonly session: UIContext;
    readonly heading: Locator;
    readonly pendingRequestsTable: AdminPendingRequestsTable;

    constructor(session: UIContext) {
        this.session = session;
        this.heading = session.page.getByRole("heading", { name: "Pending Household Requests" });
        this.pendingRequestsTable = new AdminPendingRequestsTable(session);
    }
}