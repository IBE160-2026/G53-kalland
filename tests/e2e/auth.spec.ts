import { expect, test } from "@playwright/test";
import { DEMO_PASSWORD, fixtureUsers } from "../../src/db/seed/fixture.ts";
import { fillLogin, firstName, loginAs, logOutVia } from "./helpers.ts";

const INCORRECT = "Incorrect email or password. Contact the agency to set up a new password.";
const INACTIVE = "Your account is not active. Contact the agency.";

test("a staff user logs in to the staff landing page and logs out again", async ({ page, context }) => {
  await loginAs(page, fixtureUsers.ida);
  await expect(page.getByRole("heading", { level: 1, name: "Library" })).toBeVisible();
  await expect(page.getByRole("button", { name: firstName(fixtureUsers.ida) })).toBeVisible();

  const [cookie] = await context.cookies();
  expect(cookie).toMatchObject({ httpOnly: true, sameSite: "Lax", secure: false });

  await logOutVia(page, fixtureUsers.ida);
  await expect(page).toHaveURL(/\/login$/);
  expect(await context.cookies()).toEqual([]);

  // The old token no longer works: the session was deleted server-side, not only the cookie.
  await context.addCookies([cookie]);
  await page.goto("/library");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Flibrary$/);
});

test("a contact lands on the client landing page", async ({ page }) => {
  await loginAs(page, fixtureUsers.emil);
  await expect(page.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();
  await expect(page.getByRole("button", { name: firstName(fixtureUsers.emil) })).toBeVisible();
});

test("an unknown email and a wrong password get the same message", async ({ page }) => {
  await page.goto("/login");
  await fillLogin(page, "nobody@agency.example", DEMO_PASSWORD);
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(INCORRECT);

  await fillLogin(page, fixtureUsers.per.email, "wrong password");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(INCORRECT);
  await expect(page).toHaveURL(/\/login$/);
});

test("the contact of an inactive client is refused", async ({ page }) => {
  await page.goto("/login");
  await fillLogin(page, fixtureUsers.liv.email, DEMO_PASSWORD);
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(INACTIVE);
  await expect(page).toHaveURL(/\/login$/);
});

test("Login explains a refusal by a guard for an inactive account", async ({ page }) => {
  // Where a guard sends a user whose account or client was set inactive mid-session.
  await page.goto("/login?reason=inactive");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(INACTIVE);
});

test("a contact on the staff landing page gets 403 and no data", async ({ page }) => {
  await loginAs(page, fixtureUsers.jonas);
  const response = await page.goto("/library");
  expect(response?.status()).toBe(403);
  await expect(page.getByRole("heading", { level: 1, name: "No access" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Library" })).toHaveCount(0);
});

test("a staff user on the client landing page gets 403", async ({ page }) => {
  await loginAs(page, fixtureUsers.per);
  const response = await page.goto("/overview");
  expect(response?.status()).toBe(403);
});

test("without a session, a page sends you to Login and back after logging in", async ({ page }) => {
  await page.goto("/library?page=2");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Flibrary%3Fpage%3D2$/);
  await fillLogin(page, fixtureUsers.ida.email, DEMO_PASSWORD);
  await expect(page).toHaveURL(/\/library\?page=2$/);
});

test("a return-to off the site is ignored", async ({ page }) => {
  await page.goto("/login?returnTo=%2F%2Fevil.example");
  await fillLogin(page, fixtureUsers.ida.email, DEMO_PASSWORD);
  await expect(page).toHaveURL(/\/library$/);
});

test("the root page sends a logged-in user to their landing page", async ({ page }) => {
  await loginAs(page, fixtureUsers.kari);
  await page.goto("/");
  await expect(page).toHaveURL(/\/overview$/);
});
