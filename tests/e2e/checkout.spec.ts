import { expect, test, type Page } from "@playwright/test";
import { fixtureUsers } from "../../src/db/seed/fixture.ts";
import { loginAs, publishPaidImage } from "./helpers.ts";

// Single-image checkout (Story 1.9). Each test licenses an image it publishes itself, so the seeded access
// rows stay as the other tests expect them.

const TERMS = "I accept the licence terms for this image on behalf of my organisation";
const REASON = "Accept the licence terms to continue.";

function wallTile(page: Page, title: string) {
  return page.getByRole("list", { name: "Images" }).getByRole("link").filter({ hasText: title });
}

function licenceRows(page: Page, title: string) {
  return page.getByRole("table").getByRole("row").filter({ hasText: title });
}

test("a contact licenses a paid image once the terms are accepted; it becomes own and staff see the licence", async ({ browser, page }) => {
  const title = `Fjord ${crypto.randomUUID()}`;
  const imageId = await publishPaidImage(browser, "fail-checkout.png", title);
  await loginAs(page, fixtureUsers.jonas);
  await page.goto(`/find-images?image=${imageId}`);
  await page.getByRole("region", { name: title }).getByRole("link", { name: "License this image" }).click();

  await expect(page).toHaveURL(new RegExp(`/checkout\\?image=${imageId}$`));
  await expect(page.getByRole("heading", { level: 1, name: "Check out" })).toBeVisible();
  const line = page.getByRole("list", { name: "Image to license" }).getByRole("listitem");
  await expect(line).toHaveCount(1);
  for (const text of [title, "Standard commercial use", "90 USD"]) await expect(line).toContainText(text);
  await expect(page.getByRole("button", { name: "Read the licence terms" })).toBeVisible();

  // Check out stays disabled, with the reason next to it, until the terms box is ticked.
  const checkOut = page.getByRole("button", { name: "Check out" });
  await expect(checkOut).toBeDisabled();
  await expect(page.getByText(REASON, { exact: true })).toBeVisible();
  await page.getByLabel(TERMS).check();
  await expect(checkOut).toBeEnabled();
  await expect(page.getByText(REASON, { exact: true })).toHaveCount(0);
  await page.getByLabel(TERMS).uncheck();
  await expect(checkOut).toBeDisabled();
  await page.getByLabel(TERMS).check();

  // A double submit records one licence.
  await checkOut.dblclick();
  await expect(page).toHaveURL(/\/checkout\/confirmation\?licence=[0-9a-f-]{36}$/);
  const confirmation = page.url();
  await expect(page.getByRole("heading", { level: 1, name: "Licence recorded" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Image to license" })).toContainText(title);

  await page.getByRole("link", { name: "Back to Find images" }).click();
  await expect(page).toHaveURL(/\/find-images$/);
  const tile = wallTile(page, title);
  await expect(tile).toContainText("Yours to download");
  await expect(tile.locator(".own-tick")).toBeVisible();
  await tile.click();
  const panel = page.getByRole("region", { name: title });
  await expect(panel.getByRole("heading", { level: 2, name: title })).toBeVisible();
  await expect(panel.getByRole("link", { name: "License this image" })).toHaveCount(0);
  expect((await page.goto(`/checkout?image=${imageId}`))?.status()).toBe(404);

  // Another client's contact gets Not found for the confirmation.
  const emil = await browser.newPage();
  await loginAs(emil, fixtureUsers.emil);
  expect((await emil.goto(confirmation))?.status()).toBe(404);
  await emil.close();

  const ida = await browser.newPage();
  await loginAs(ida, fixtureUsers.ida);
  await ida.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Licences" }).click();
  await expect(ida.getByRole("heading", { level: 1, name: "Licences" })).toBeVisible();
  const row = licenceRows(ida, title);
  await expect(row).toHaveCount(1);
  for (const text of ["Fjordkaffe AS", "Jonas Fjell", "Standard commercial use", "90 USD"]) await expect(row).toContainText(text);
  await expect(row).toContainText(/\d{1,2} [A-Z][a-z]+ \d{4}, \d{2}:\d{2}/);
  await ida.close();
});

test("a changed price records nothing and shows the NFR-7 message; confirming records the licence at the new price", async ({ browser, page }) => {
  const title = `Quay ${crypto.randomUUID()}`;
  const imageId = await publishPaidImage(browser, "fail-checkout-price.png", title);
  await loginAs(page, fixtureUsers.jonas);
  await page.goto(`/checkout?image=${imageId}`);
  await page.getByLabel(TERMS).check();
  // The price the contact saw: as if the agency raised it from 80 USD while the page was open.
  await page.locator('input[name="seenPriceMinor"]').evaluate((input: HTMLInputElement) => {
    input.value = "8000";
  });
  await page.getByRole("button", { name: "Check out" }).click();

  await expect(page.getByRole("main").getByRole("alert")).toHaveText(`The price of ${title} has changed from 80 to 90 USD. Confirm to continue.`);
  await expect(page).toHaveURL(new RegExp(`/checkout\\?image=${imageId}$`));
  await expect(page.getByRole("button", { name: "Check out" })).toHaveCount(0);
  await page.getByRole("button", { name: "Confirm new price" }).click();
  await expect(page).toHaveURL(/\/checkout\/confirmation\?licence=/);
  await expect(page.getByRole("list", { name: "Image to license" })).toContainText("90 USD");
});

test("a line that is already held is removed with the NFR-7 message, and no second licence is recorded", async ({ browser, page }) => {
  const title = `Pier ${crypto.randomUUID()}`;
  const imageId = await publishPaidImage(browser, "fail-checkout-held.png", title);
  await loginAs(page, fixtureUsers.jonas);
  const second = await page.context().newPage();
  for (const tab of [page, second]) {
    await tab.goto(`/checkout?image=${imageId}`);
    await tab.getByLabel(TERMS).check();
  }
  await second.getByRole("button", { name: "Check out" }).click();
  await expect(second).toHaveURL(/\/checkout\/confirmation\?licence=/);

  await page.getByRole("button", { name: "Check out" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(`${title} was removed from your cart: it is no longer available.`);
  await expect(page.getByRole("button", { name: "Check out" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Back to Find images" })).toBeVisible();

  const ida = await browser.newPage();
  await loginAs(ida, fixtureUsers.ida);
  await ida.goto("/licences");
  await expect(licenceRows(ida, title)).toHaveCount(1);
  await ida.close();
});

test("checkout of an image the client may not buy is Not found, and Licences is staff only", async ({ page }) => {
  await loginAs(page, fixtureUsers.jonas);
  expect((await page.goto(`/checkout?image=${crypto.randomUUID()}`))?.status()).toBe(404);
  expect((await page.goto("/checkout"))?.status()).toBe(404);
  expect((await page.goto(`/checkout/confirmation?licence=${crypto.randomUUID()}`))?.status()).toBe(404);
  expect((await page.goto("/licences"))?.status()).toBe(403);
  await expect(page.getByRole("heading", { level: 1, name: "No access" })).toBeVisible();
});

test("staff see the seeded licences in Licences, newest first", async ({ page }) => {
  await loginAs(page, fixtureUsers.ida);
  await page.goto("/licences");
  const headers = page.getByRole("table").getByRole("columnheader");
  await expect(headers).toHaveText(["Client", "Contact", "Image", "Licence", "Price", "Date"]);
  for (const title of ["Coastline from a plane window", "Birch-lined path in the thaw", "King crab at the glass", "Seal swimming past the window", "Starfish and sea anemone"]) {
    await expect(licenceRows(page, title)).toContainText("Jonas Fjell");
  }
});
