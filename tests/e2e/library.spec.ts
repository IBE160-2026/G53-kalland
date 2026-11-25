import { expect, test, type Page } from "@playwright/test";
import { fixtureUsers } from "../../src/db/seed/fixture.ts";
import { chooseOption as choose, loginAs } from "./helpers.ts";
import { makePng } from "./png.ts";

const S4_WARNING = "No clients are chosen, so this image behaves as internal only.";

// Uploads one PNG as Ida and opens the Library. A `fail-` name makes the mock fail, so the image keeps
// only its embedded title and lacks description, alt text and keywords. The title is unique per test,
// so the tile can be found among the other tests' uploads.
async function uploadAndOpenLibrary(page: Page, filename: string, title: string) {
  await loginAs(page, fixtureUsers.ida);
  await page.goto("/upload");
  await page.getByRole("button", { name: "New batch" }).click();
  await page.getByLabel("Choose files").setInputFiles({ name: filename, mimeType: "image/png", buffer: makePng({ title }) });
  const row = page.getByRole("list", { name: "Files in this batch" }).getByRole("listitem").filter({ hasText: filename });
  await expect(row.getByText("Failed", { exact: true })).toBeVisible();
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Library" }).click();
  const tile = page.getByRole("list", { name: "Images" }).getByRole("link").filter({ hasText: title });
  await expect(tile).toBeVisible();
  return tile;
}

test("Ida restricts a draft to Fjordkaffe at the paid price, then publishes it after the missing-metadata dialog", async ({ page }) => {
  const title = `Quay ${crypto.randomUUID()}`;
  const tile = await uploadAndOpenLibrary(page, "fail-quay.png", title);
  await expect(tile).toContainText("Draft");
  await expect(tile).toContainText("Internal only");
  await expect(tile).toContainText("Free");

  await tile.click();
  await expect(tile).toHaveAttribute("aria-current", "true");
  const panel = page.getByRole("region", { name: title });
  await expect(panel.getByRole("heading", { name: "Who can see it" })).toBeVisible();
  await expect(panel.getByText("fail-quay.png")).toBeVisible();

  await panel.getByRole("button", { name: "Edit" }).click();
  await expect(panel.getByRole("radio", { name: "Internal" })).toBeFocused();
  await expect(panel.getByText("No changes yet")).toBeVisible();
  await choose(panel, "Restricted");
  await expect(panel.getByText(S4_WARNING)).toBeVisible();
  await panel.getByLabel("Add client").selectOption({ label: "Fjordkaffe AS" });
  await expect(panel.getByRole("button", { name: "Remove Fjordkaffe AS" })).toBeVisible();
  await expect(panel.getByText(S4_WARNING)).toHaveCount(0);
  await choose(panel, "Paid");
  await expect(panel.getByText("90 USD per licence, ex VAT")).toBeVisible();
  await expect(panel.getByText("Unsaved changes (3 fields)")).toBeVisible();

  await panel.getByRole("button", { name: "Save changes" }).click();
  await expect(panel.getByRole("status")).toHaveText("Changes saved");
  await expect(panel.getByRole("button", { name: "Edit" })).toBeFocused();
  await expect(panel.getByText("90 USD per licence, ex VAT")).toBeVisible();
  await expect(tile).toContainText("Fjordkaffe AS");
  await expect(tile).toContainText("90 USD");

  const dialog = page.getByRole("dialog");
  await panel.getByRole("button", { name: "Publish this image" }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("This image is missing: description, alt text, keywords.");
  await expect(dialog).toContainText("harder to find and less accessible");
  await dialog.getByRole("button", { name: "Go back" }).click();
  await expect(dialog).toBeHidden();
  await expect(panel.getByRole("button", { name: "Publish this image" })).toBeFocused();

  await panel.getByRole("button", { name: "Publish this image" }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(panel.getByText("Draft", { exact: true })).toBeVisible();

  await panel.getByRole("button", { name: "Publish this image" }).click();
  await dialog.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(panel.getByText("Published", { exact: true })).toBeVisible();
  await expect(panel.getByRole("button", { name: "Publish this image" })).toHaveCount(0);
  await expect(tile).toContainText("Published");

  // The selection is in the URL, so it survives a reload.
  await page.reload();
  await expect(page.getByRole("region", { name: title }).getByText("Published", { exact: true })).toBeVisible();
});

test("Cancel drops the edits and returns to view mode", async ({ page }) => {
  const title = `Pier ${crypto.randomUUID()}`;
  const tile = await uploadAndOpenLibrary(page, "fail-pier.png", title);
  await tile.click();
  const panel = page.getByRole("region", { name: title });
  await panel.getByRole("button", { name: "Edit" }).click();
  await choose(panel, "Public");
  await expect(panel.getByText("Unsaved changes (1 field)")).toBeVisible();
  await panel.getByRole("button", { name: "Cancel" }).click();
  await expect(panel.getByRole("button", { name: "Edit" })).toBeFocused();
  await expect(panel.getByText("Internal only")).toBeVisible();
  await expect(tile).toContainText("Internal only");
});

test("Restricted with no clients saves, and behaves as internal only on the tile and in the panel (S4)", async ({ page }) => {
  const title = `Jetty ${crypto.randomUUID()}`;
  const tile = await uploadAndOpenLibrary(page, "fail-jetty.png", title);
  await tile.click();
  const panel = page.getByRole("region", { name: title });
  await panel.getByRole("button", { name: "Edit" }).click();
  await choose(panel, "Restricted");
  await expect(panel.getByText(S4_WARNING)).toBeVisible();
  await panel.getByRole("button", { name: "Save changes" }).click();
  await expect(panel.getByRole("status")).toHaveText("Changes saved");
  await expect(panel.getByText("Restricted", { exact: true })).toBeVisible();
  await expect(panel.getByText(S4_WARNING)).toBeVisible();
  await expect(tile).toContainText("Internal only");
});
