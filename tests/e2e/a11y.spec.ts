import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { fixtureUsers, type FixtureUser } from "../../src/db/seed/fixture.ts";
import { loginAs } from "./helpers.ts";

// Every page goes on this list as it is built (NFR-5a). `as` logs in first; the 403 page is a
// contact on a staff route. `h1` confirms which page was scanned.
const SCAN_LIST: { name: string; path: string; h1: string; as?: FixtureUser }[] = [
  { name: "Login", path: "/login", h1: "Log in" },
  { name: "403", path: "/library", h1: "No access", as: fixtureUsers.jonas },
  { name: "Library", path: "/library", h1: "Library", as: fixtureUsers.ida },
  { name: "Upload", path: "/upload", h1: "Upload", as: fixtureUsers.ida },
  { name: "Overview", path: "/overview", h1: "Overview", as: fixtureUsers.jonas },
  { name: "Find images", path: "/find-images", h1: "Find images", as: fixtureUsers.jonas },
];

for (const entry of SCAN_LIST) {
  test(`${entry.name} has no serious or critical axe violations`, async ({ page }) => {
    if (entry.as) await loginAs(page, entry.as);
    await page.goto(entry.path);
    await expect(page.getByRole("heading", { level: 1, name: entry.h1 })).toBeAttached();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const blocking = results.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => ({ id: violation.id, targets: violation.nodes.map((node) => node.target.join(" ")) }));
    expect(blocking).toEqual([]);
  });
}
