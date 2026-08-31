import { Locator } from "@playwright/test";
import { TestUser } from "../helpers/testUser";
import {UIContext} from "../helpers/types";

export class LoginPage {
    readonly session: UIContext;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorAlert: Locator;
    readonly registerLink: Locator;

    constructor(session: UIContext) {
        this.session = session;
        this.emailInput = session.page.getByLabel("Email");
        this.passwordInput = session.page.getByLabel("Password");
        this.loginButton = session.page.getByRole("button", { name: "Log in" });
        this.errorAlert = session.page.getByRole("alert");
        this.registerLink = session.page.getByRole("link", { name: "Register" });
    }

    async goto() {
        await this.session.page.goto("/login");
    }

    async login(user: TestUser) {
        await this.goto();
        await this.emailInput.fill(user.email);
        await this.passwordInput.fill(user.password);
        await this.loginButton.click();
    }

    async attemptLogin(email: string, password: string) {
        await this.goto();
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}