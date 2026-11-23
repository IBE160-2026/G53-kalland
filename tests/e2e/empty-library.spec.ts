import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { fixtureUsers } from "../../src/db/seed/fixture.ts";
import { loginAs } from "./helpers.ts";

// Runs in its own Playwright project before every other test (playwright.config.ts), while the freshly
// seeded test database still has no images.
test("an empty Library shows its empty state with one action, which leads to Upload", async ({ page }) => {
  await page.setViewportSize({ width: 1240, height: 900 });
  await loginAs(page, fixtureUsers.ida);
  const sidebar = page.getByRole("complementary", { name: "Filters" });
  await expect(sidebar.getByText("Filters appear when the library has images.")).toBeVisible();
  await expect(page.getByRole("main").getByText("The library has no images yet.")).toBeVisible();

  // The axe scan of the empty state, as in a11y.spec.ts.
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const blocking = results.violations
    .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
    .map((violation) => ({ id: violation.id, targets: violation.nodes.map((node) => node.target.join(" ")) }));
  expect(blocking).toEqual([]);

  await page.getByRole("main").getByRole("link", { name: "Upload images" }).click();
  await expect(page).toHaveURL(/\/upload$/);
  await expect(page.getByRole("heading", { level: 1, name: "Upload" })).toBeVisible();
  await expect(page.getByRole("button", { name: "New batch" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Upload", exact: true })).toHaveAttribute("aria-current", "page");
  // Upload has no Context sidebar, so no toggle.
  await expect(page.getByRole("button", { name: "Show or hide filters" })).toHaveCount(0);
});
