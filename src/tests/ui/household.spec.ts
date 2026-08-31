import { test, expect } from "../../helpers/fixtures";
import { TestData } from "../../helpers/testUser";
import { RegisterPage } from "../../pages/RegisterPage";
import { LoginPage } from "../../pages/LoginPage";
import { AdminPage } from "../../pages/AdminPage";
import {UIContext} from "../../helpers/types";
import {GridRow} from "../../pages/components/GridRow";
import {closeDbConnection, deletePendingHouseholdRequest, deleteTestHousehold, deleteTestUser} from "../../helpers/db";

test.describe("Household Onboarding", () => {

    test.afterAll(async () => {
        await deleteTestUser(TestData.householdAUser1.email);
        await deleteTestHousehold("E2E Household A");
        await deletePendingHouseholdRequest(TestData.householdAUser1.email);
        await closeDbConnection();
    });

    // TRACKER-TC-8
    test("Confirmation shown on valid new-household registration", {
        tag: "@regression",
    }, async ({ uiContext }) => {
        const registrationSession: UIContext = await uiContext();
        const registerPage = new RegisterPage(registrationSession);

        await registerPage.registerHousehold(TestData.householdAUser1);

        await expect(registerPage.successAlert).toBeVisible();
        await expect(registrationSession.page).toHaveURL(/\/register/);
    });

    // TRACKER-TC-9
    test("New-household registration request is persisted as pending", {
        tag: "@regression",
    }, async ({ uiContext }) => {

        const adminSession: UIContext = await uiContext();
        const loginPage = new LoginPage(adminSession);
        await loginPage.login(TestData.admin);

        const adminPage = new AdminPage(adminSession);
        await expect(adminPage.heading).toBeVisible();

        const requestRows: GridRow[] = await adminPage.pendingRequestsTable.rows();
        const rowTexts: string[][] = await Promise.all(
            requestRows.map(row => Promise.all(row.column.map(column => column.getText()))),
        );

        const matchIndex = rowTexts.findIndex(texts => texts.includes(TestData.householdAUser1.email));
        expect(matchIndex, `No pending request row found for ${TestData.householdAUser1.email}`).toBeGreaterThan(-1);

        expect(rowTexts[matchIndex]).toContain(TestData.householdAUser1.householdName);

        const stillAwaitingAction = requestRows[matchIndex].column.some(column => column.controls.length > 0);
        expect(stillAwaitingAction, "Pending request row offers no approve/reject control").toBe(true);
    });

    // TRACKER-TC-11
    test("Registration rejected when email is already in use", {
        tag: "@regression",
    }, async ({ uiContext }) => {
        const registrationSession: UIContext = await uiContext();
        const registerPage = new RegisterPage(registrationSession);

        await registerPage.registerHousehold(TestData.householdAUser1);

        await expect(registerPage.errorAlert).toBeVisible();
        await expect(registrationSession.page).toHaveURL(/\/register/);
    });

});
