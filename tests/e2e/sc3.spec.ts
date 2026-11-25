import { expect, test } from "@playwright/test";
import { fixtureUsers } from "../../src/db/seed/fixture.ts";
import { loginAs, publishPaidImage } from "./helpers.ts";

// The mock provider's labelled placeholder metadata (src/modules/ai/providers/mock.ts).
const PLACEHOLDER_TITLE = "Placeholder title from the mock AI";
const PLACEHOLDER_DESCRIPTION = "Placeholder description from the mock AI provider.";

// SC-3, the Epic 1 checkpoint (2026-11-30): in mock mode, with the seed data and no API key, staff upload
// an image that gets mock metadata, make it public and paid and publish it; a contact finds it and checks
// it out; the licence appears in the staff Licences tab.
test("SC-3: upload, mock metadata, publish public and paid, a contact checks it out, staff see the licence", async ({ browser, page }) => {
  // Ida: upload (the mock succeeds), public, paid, publish.
  const imageId = await publishPaidImage(browser, `sc3-${crypto.randomUUID()}.png`);

  // Jonas: finds the tile by its image id (the placeholder title is not unique), sees the mock metadata.
  await loginAs(page, fixtureUsers.jonas);
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Find images" }).click();
  const tile = page.getByRole("list", { name: "Images" }).locator(`a[href*="image=${imageId}"]`);
  await expect(tile).toContainText("90 USD");
  await tile.click();
  const panel = page.getByRole("region", { name: PLACEHOLDER_TITLE });
  await expect(panel).toContainText(PLACEHOLDER_DESCRIPTION);
  await panel.getByRole("link", { name: "License this image" }).click();

  // Checks it out.
  await page.getByLabel("I accept the licence terms for this image on behalf of my organisation").check();
  await page.getByRole("button", { name: "Check out" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Licence recorded" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Image to license" })).toContainText(PLACEHOLDER_TITLE);
  await page.getByRole("link", { name: "Back to Find images" }).click();
  await expect(page.getByRole("list", { name: "Images" }).locator(`a[href*="image=${imageId}"]`)).toContainText("Yours to download");

  // Ida: the licence is in Licences.
  const ida = await browser.newPage();
  await loginAs(ida, fixtureUsers.ida);
  await ida.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Licences" }).click();
  const row = ida.getByRole("table").getByRole("row").filter({ hasText: PLACEHOLDER_TITLE }).filter({ hasText: "Jonas Fjell" });
  await expect(row).toHaveCount(1);
  for (const text of ["Fjordkaffe AS", "Standard commercial use", "90 USD"]) await expect(row).toContainText(text);
  await ida.close();
});
