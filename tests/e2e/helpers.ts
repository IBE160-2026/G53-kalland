import { expect, type Page } from "@playwright/test";
import { DEMO_PASSWORD, type FixtureUser } from "../../src/db/seed/fixture.ts";

export async function fillLogin(page: Page, email: string, password: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

// Logs a fixture user in through the real Login form (AD-7).
export async function loginAs(page: Page, user: FixtureUser) {
  await page.goto("/login");
  await fillLogin(page, user.email, DEMO_PASSWORD);
  await expect(page).toHaveURL(user.role === "staff" ? /\/library$/ : /\/overview$/);
}
