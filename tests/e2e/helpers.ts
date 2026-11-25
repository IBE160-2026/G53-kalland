import { expect, type Browser, type Locator, type Page } from "@playwright/test";
import { DEMO_PASSWORD, fixtureUsers, type FixtureUser } from "../../src/db/seed/fixture.ts";
import { makePng } from "./png.ts";

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

// Logs out through the account menu in the top bar (avatar and first name).
export async function logOutVia(page: Page, user: FixtureUser) {
  await page.getByRole("button", { name: firstName(user) }).click();
  await page.getByRole("button", { name: "Log out" }).click();
}

export function firstName(user: FixtureUser): string {
  return user.name.split(/\s+/)[0];
}

// Toggle group items are radios inside their labels; the label takes the click.
export async function chooseOption(panel: Locator, option: string) {
  await panel.locator("label", { hasText: new RegExp(`^${option}$`) }).click();
  await expect(panel.getByRole("radio", { name: option })).toBeChecked();
}

// As Ida, in a page of its own: uploads one PNG, makes it public and paid, publishes it (confirming the
// missing-metadata dialog when it shows) and returns the image id, read from the file row's thumbnail.
// A `fail-` file name keeps the embedded title, so a unique title finds the tile; otherwise the mock
// succeeds and the title is its placeholder.
export async function publishPaidImage(browser: Browser, filename: string, title?: string): Promise<string> {
  const page = await browser.newPage();
  await loginAs(page, fixtureUsers.ida);
  await page.goto("/upload");
  await page.getByRole("button", { name: "New batch" }).click();
  await page.getByLabel("Choose files").setInputFiles({ name: filename, mimeType: "image/png", buffer: makePng({ title }) });
  const row = page.getByRole("list", { name: "Files in this batch" }).getByRole("listitem").filter({ hasText: filename });
  await expect(row.getByText(/^(Ready|Failed)$/)).toBeVisible();
  const src = (await row.locator("img").getAttribute("src")) ?? "";
  const imageId = /\/api\/images\/([0-9a-f-]{36})\/thumbnail/.exec(src)?.[1];
  if (!imageId) throw new Error(`No image id in the thumbnail URL ${src}.`);

  await page.goto(`/library?image=${imageId}`);
  const panel = page.locator(".details-panel");
  await panel.getByRole("button", { name: "Edit" }).click();
  await chooseOption(panel, "Public");
  await chooseOption(panel, "Paid");
  await panel.getByRole("button", { name: "Save changes" }).click();
  await expect(panel.getByRole("status")).toHaveText("Changes saved");
  await panel.getByRole("button", { name: "Publish this image" }).click();
  const dialog = page.getByRole("dialog");
  const published = panel.getByText("Published", { exact: true });
  await expect(dialog.or(published)).toBeVisible();
  if (await dialog.isVisible()) await dialog.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(published).toBeVisible();
  await page.close();
  return imageId;
}
