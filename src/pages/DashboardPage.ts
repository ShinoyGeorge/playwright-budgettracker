import { Locator } from "@playwright/test";
import { UIContext } from "../helpers/types";
import { AccountsTable } from "./components/AccountsTable";
import { TransactionsTable } from "./components/TransactionsTable";
import { RecurringBillsTable } from "./components/RecurringBillsTable";
import { BudgetsTable } from "./components/BudgetsTable";

export class DashboardPage {
    readonly session: UIContext;
    readonly logoutButton: Locator;
    readonly addAccountButton: Locator;
    readonly transferButton: Locator;
    readonly monthPicker: Locator;
    readonly addRecurringBillButton: Locator;
    readonly setBudgetButton: Locator;
    readonly addTransactionButton: Locator;
    readonly clearFiltersButton: Locator;

    readonly accountsTable: AccountsTable;
    readonly transactionsTable: TransactionsTable;
    readonly recurringBillsTable: RecurringBillsTable;
    readonly budgetsTable: BudgetsTable;

    constructor(session: UIContext) {
        this.session = session;
        this.logoutButton = session.page.getByRole("button", { name: "Logout" });
        this.addAccountButton = session.page.getByRole("button", { name: "+ Add account" });
        this.transferButton = session.page.getByRole("button", { name: "⇄ Transfer" });
        this.monthPicker = session.page.getByLabel("Month");
        this.addRecurringBillButton = session.page.getByRole("button", { name: "+ Add recurring bill" });
        this.setBudgetButton = session.page.getByRole("button", { name: "+ Set Budget" });
        this.addTransactionButton = session.page.getByRole("button", { name: "+ Add transaction" });
        this.clearFiltersButton = session.page.getByRole("button", { name: "Clear filters" });

        this.accountsTable = new AccountsTable(session);
        this.transactionsTable = new TransactionsTable(session);
        this.recurringBillsTable = new RecurringBillsTable(session);
        this.budgetsTable = new BudgetsTable(session);
    }

    async logout() {
        await this.logoutButton.click();
        await this.session.page.waitForURL("/login");
    }
}