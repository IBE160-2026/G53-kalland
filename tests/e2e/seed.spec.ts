import { expect, test } from "@playwright/test";
import { fixtureClients, fixtureUsers, SEED_IMAGE_COUNT } from "../../src/db/seed/fixture.ts";
import { loginAs } from "./helpers.ts";

// The A7 image's title from the mock fixtures (src/modules/ai/providers/mock-fixtures.ts), which the e2e
// container does not hold.
const A7_TITLE = "Snowy path on a grey day";

// Runs in its own Playwright project before every other test (playwright.config.ts), while the test
// database holds only the sample library that app-test seeded at start (Story 1.7).
test("Ida's Library shows the seeded sample library, with A7 restricted to Nordlys", async ({ page }) => {
  await loginAs(page, fixtureUsers.ida);
  await expect(page.getByText(`${SEED_IMAGE_COUNT} images, newest first`)).toBeVisible();
  const tiles = page.getByRole("list", { name: "Images" }).getByRole("link");
  await expect(tiles).toHaveCount(SEED_IMAGE_COUNT);

  const a7 = tiles.filter({ hasText: A7_TITLE });
  await expect(a7).toContainText(fixtureClients.nordlys.name);
  await expect(a7).toContainText("Published");
  await expect(tiles.filter({ hasText: "Failed" })).toHaveCount(1);
});
