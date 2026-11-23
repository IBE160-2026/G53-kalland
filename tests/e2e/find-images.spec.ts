import { expect, test, type Page } from "@playwright/test";
import { fixtureUsers } from "../../src/db/seed/fixture.ts";
import { loginAs } from "./helpers.ts";

// Titles from the mock AI fixtures of the seed images A1, A2, A4 and A5, seen from Fjordkaffe.
const A1 = "Moon jellyfish close up";
const A2 = "Low tide in a quiet bay";
const A4 = "Venison dinner with red wine";
const A5 = "Painting of a mountain farm";

function tile(page: Page, title: string) {
  return page.getByRole("list", { name: "Images" }).getByRole("link").filter({ has: page.getByText(title, { exact: true }) });
}

test.beforeEach(async ({ page }) => {
  await loginAs(page, fixtureUsers.jonas);
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Find images" }).click();
  await expect(page).toHaveURL(/\/find-images$/);
});

test("tiles show the price, Free, or the tick and Yours to download for an own image", async ({ page }) => {
  await expect(page.getByText(/^\d+ images, newest first$/)).toBeVisible();
  await expect(tile(page, A1)).toContainText("Free");
  await expect(tile(page, A2)).toContainText("90 USD");
  await expect(tile(page, A5)).toContainText("90 USD");
  await expect(tile(page, A4)).toContainText("Yours to download");
  await expect(tile(page, A4).locator(".own-tick")).toBeVisible();
  await expect(tile(page, A1).locator(".own-tick")).toHaveCount(0);
});

test("a paid image's panel shows the sections and the licence option, whose terms open in a dialog", async ({ page }) => {
  await tile(page, A5).click();
  await expect(page).toHaveURL(/\?image=[0-9a-f-]+&page=1$/);
  await expect(tile(page, A5)).toHaveAttribute("aria-current", "true");
  const panel = page.getByRole("region", { name: A5 });
  await expect(panel.getByRole("heading", { level: 2, name: A5 })).toBeVisible();
  await expect(panel.getByRole("img")).toHaveAttribute("src", /\/preview$/);

  await expect(panel.getByRole("heading", { name: "About the image" })).toBeVisible();
  for (const label of ["Description", "Alt text", "Keywords"]) await expect(panel.getByRole("term").filter({ hasText: label })).toBeVisible();
  // The seed files carry no date taken or camera data, so those fields are left out.
  await expect(panel.getByRole("term").filter({ hasText: "Date taken" })).toHaveCount(0);
  await expect(panel.getByRole("term").filter({ hasText: "Camera" })).toHaveCount(0);
  await expect(panel.getByRole("heading", { name: "Technical details" })).toBeVisible();
  await expect(panel.getByRole("definition").filter({ hasText: / × \d+ px, (landscape|portrait|square)$/ })).toBeVisible();

  const licence = panel.getByRole("region", { name: "Licence" });
  await expect(licence).toContainText("Standard commercial use — 90 USD");
  const readTerms = licence.getByRole("button", { name: "Read the licence terms" });
  await readTerms.click();
  const dialog = page.getByRole("dialog", { name: "Licence terms: Standard commercial use" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("The client may use the image in its own marketing");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(readTerms).toBeFocused();
});

test("an own or free image's panel has no licence option", async ({ page }) => {
  for (const title of [A4, A1]) {
    await tile(page, title).click();
    const panel = page.getByRole("region", { name: title });
    await expect(panel.getByRole("heading", { name: "About the image" })).toBeVisible();
    await expect(panel.getByRole("region", { name: "Licence" })).toHaveCount(0);
  }
});

test("an image the client may not see, or no image at all, gives the Not found page", async ({ page }) => {
  const response = await page.goto(`/find-images?image=${crypto.randomUUID()}`);
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Not found" })).toBeVisible();
  await expect(page.getByText("We could not find what you asked for.")).toBeVisible();
  expect((await page.goto("/find-images?image=not-a-uuid"))?.status()).toBe(404);
});
