import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { fixtureUsers, type FixtureUser } from "../../src/db/seed/fixture.ts";
import { loginAs } from "./helpers.ts";
import { makePng } from "./png.ts";

// Starts a batch and uploads one PNG, so the scan covers the bar and a file row.
async function uploadOneFile(page: Page) {
  await page.getByRole("button", { name: "New batch" }).click();
  await page.getByLabel("Choose files").setInputFiles({ name: "scan.png", mimeType: "image/png", buffer: makePng() });
  await expect(page.getByText("Ready", { exact: true })).toBeVisible();
}

// Uploads one PNG with a unique title, opens the Library and selects that tile, so the scan covers the
// wall and the Details panel. The `fail-` name makes the mock fail, so the embedded title is kept (the
// tile can be found by it) and the other metadata is missing.
async function openDetailsPanel(page: Page, filename = "fail-scan.png") {
  const title = `Scan ${crypto.randomUUID()}`;
  await page.getByRole("button", { name: "New batch" }).click();
  await page.getByLabel("Choose files").setInputFiles({ name: filename, mimeType: "image/png", buffer: makePng({ title }) });
  await expect(page.getByText("Failed", { exact: true })).toBeVisible();
  await page.goto("/library");
  await page.getByRole("list", { name: "Images" }).getByRole("link").filter({ hasText: title }).click();
  await expect(page.getByRole("heading", { name: "Who can see it" })).toBeVisible();
}

// Edit mode with Restricted and no clients: the toggle groups, the client picker and the S4 alert.
async function openEditMode(page: Page) {
  await openDetailsPanel(page, "fail-scan-edit.png");
  await page.getByRole("button", { name: "Edit" }).click();
  await page.locator("label", { hasText: /^Restricted$/ }).click();
  await expect(page.getByText("No clients are chosen, so this image behaves as internal only.", { exact: false })).toBeVisible();
}

// The missing-metadata confirm dialog.
async function openPublishDialog(page: Page) {
  await openDetailsPanel(page, "fail-scan-dialog.png");
  await page.getByRole("button", { name: "Publish this image" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // The dialog fades in; axe measures contrast at the colours of the moment, so wait for the end.
  await dialog.evaluate((element) => Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished)));
}

// Find images with the client Details panel of a paid image (A5) and its licence terms dialog open.
async function openLicenceTerms(page: Page) {
  await page.getByRole("list", { name: "Images" }).getByRole("link").filter({ hasText: "Painting of a mountain farm" }).click();
  await page.getByRole("button", { name: "Read the licence terms" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.evaluate((element) => Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished)));
}

async function openClientPanel(page: Page) {
  await page.getByRole("list", { name: "Images" }).getByRole("link").filter({ hasText: "Painting of a mountain farm" }).click();
  await expect(page.getByRole("heading", { name: "About the image" })).toBeVisible();
}

// Every page goes on this list as it is built (NFR-5a). `as` logs in first; the 403 page is a
// contact on a staff route. `h1` confirms which page was scanned; `setup` brings the page to the state scanned.
const SCAN_LIST: { name: string; path: string; h1: string; as?: FixtureUser; setup?: (page: Page) => Promise<void> }[] = [
  { name: "Login", path: "/login", h1: "Log in" },
  { name: "403", path: "/library", h1: "No access", as: fixtureUsers.jonas },
  // The empty Library is checked in src/app/_components/shell/empty-state.test.ts (no axe scan); here the wall holds the sample library and other tests' uploads.
  { name: "Library wall", path: "/library", h1: "Library", as: fixtureUsers.ida },
  // These start on Upload: setup uploads a file first, then opens the Library.
  { name: "Library with the Details panel", path: "/upload", h1: "Library", as: fixtureUsers.ida, setup: (page) => openDetailsPanel(page) },
  { name: "Library Details panel in edit mode", path: "/upload", h1: "Library", as: fixtureUsers.ida, setup: openEditMode },
  { name: "Library publish dialog", path: "/upload", h1: "Library", as: fixtureUsers.ida, setup: openPublishDialog },
  { name: "Upload", path: "/upload", h1: "Upload", as: fixtureUsers.ida },
  { name: "Upload with a file row", path: "/upload", h1: "Upload", as: fixtureUsers.ida, setup: uploadOneFile },
  { name: "Overview", path: "/overview", h1: "Overview", as: fixtureUsers.jonas },
  { name: "Find images", path: "/find-images", h1: "Find images", as: fixtureUsers.jonas },
  { name: "Find images with the Details panel", path: "/find-images", h1: "Find images", as: fixtureUsers.jonas, setup: openClientPanel },
  { name: "Find images licence terms dialog", path: "/find-images", h1: "Find images", as: fixtureUsers.jonas, setup: openLicenceTerms },
  { name: "404", path: "/find-images?image=00000000-0000-7000-8000-000000000000", h1: "Not found", as: fixtureUsers.jonas },
];

for (const entry of SCAN_LIST) {
  test(`${entry.name} has no serious or critical axe violations`, async ({ page }) => {
    if (entry.as) await loginAs(page, entry.as);
    await page.goto(entry.path);
    await entry.setup?.(page);
    await expect(page.getByRole("heading", { level: 1, name: entry.h1 })).toBeAttached();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const blocking = results.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => ({ id: violation.id, targets: violation.nodes.map((node) => node.target.join(" ")) }));
    expect(blocking).toEqual([]);
  });
}
