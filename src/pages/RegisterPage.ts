import { Locator } from "@playwright/test";
import { UIContext } from "../helpers/types";
import { TestUser } from "../helpers/testUser";

export class RegisterPage {
  readonly session: UIContext;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly householdNameInput: Locator;
  readonly newHouseholdToggle: Locator;
  readonly joinHouseholdToggle: Locator;
  readonly registerButton: Locator;
  readonly successAlert: Locator;
  readonly errorAlert: Locator;
  readonly loginLink: Locator;

  constructor(session: UIContext) {
    this.session = session;
    this.nameInput = session.page.getByLabel("Your name");
    this.emailInput = session.page.getByLabel("Email");
    this.passwordInput = session.page.getByLabel("Password");
    this.householdNameInput = session.page.getByLabel("Household name");
    this.newHouseholdToggle = session.page.getByLabel("New household");
    this.joinHouseholdToggle = session.page.getByLabel("Existing household");
    this.registerButton = session.page.getByRole("button", { name: "Register" });
    this.successAlert = session.page.getByTestId("register-success");
    this.errorAlert = session.page.getByTestId("register-error");
    this.loginLink = session.page.getByRole("link", { name: "Log in" });
  }

  async navigate() {
    await this.session.page.goto("/register");
  }

  async registerHousehold(user: TestUser, isNewHouseHold: boolean = true) {
    await this.navigate();
    await this.nameInput.fill(user.name ?? "");
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    if (isNewHouseHold) {
      await this.newHouseholdToggle.check();
    } else {
      await this.joinHouseholdToggle.check();
    }
    await this.householdNameInput.fill(user.householdName ?? "");
    await this.registerButton.click();
  }
}