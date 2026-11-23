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

// Every page goes on this list as it is built (NFR-5a). `as` logs in first; the 403 page is a
// contact on a staff route. `h1` confirms which page was scanned; `setup` brings the page to the state scanned.
const SCAN_LIST: { name: string; path: string; h1: string; as?: FixtureUser; setup?: (page: Page) => Promise<void> }[] = [
  { name: "Login", path: "/login", h1: "Log in" },
  { name: "403", path: "/library", h1: "No access", as: fixtureUsers.jonas },
  { name: "Library", path: "/library", h1: "Library", as: fixtureUsers.ida },
  { name: "Upload", path: "/upload", h1: "Upload", as: fixtureUsers.ida },
  { name: "Upload with a file row", path: "/upload", h1: "Upload", as: fixtureUsers.ida, setup: uploadOneFile },
  { name: "Overview", path: "/overview", h1: "Overview", as: fixtureUsers.jonas },
  { name: "Find images", path: "/find-images", h1: "Find images", as: fixtureUsers.jonas },
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
