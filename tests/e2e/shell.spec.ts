import { expect, test, type Locator, type Page } from "@playwright/test";
import { fixtureUsers } from "../../src/db/seed/fixture.ts";
import { firstName, loginAs, logOutVia } from "./helpers.ts";

const STAFF_SEARCH = "Search title, description, keywords and places";
const FILTERS_TOGGLE = "Show or hide filters";

async function box(locator: Locator) {
  const result = await locator.boundingBox();
  if (!result) throw new Error("element has no box");
  return result;
}

function topBar(page: Page) {
  return page.getByRole("banner");
}

test.describe("staff shell", () => {
  test("the top bar shows toggle, wordmark, tabs, search and account, left to right", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs(page, fixtureUsers.ida);
    const bar = topBar(page);
    const toggle = bar.getByRole("button", { name: FILTERS_TOGGLE });
    const wordmark = bar.getByRole("link", { name: "CRM-DAM" });
    const nav = bar.getByRole("navigation", { name: "Main" });
    const search = bar.getByRole("searchbox", { name: STAFF_SEARCH });
    const account = bar.getByRole("button", { name: firstName(fixtureUsers.ida) });

    await expect(search).toHaveAttribute("placeholder", STAFF_SEARCH);
    await expect(nav.getByRole("link")).toHaveText(["Library", "Upload"]);
    await expect(nav.getByRole("link", { name: "Library" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Upload" })).not.toHaveAttribute("aria-current");

    const xs = [];
    for (const part of [toggle, wordmark, nav, search, account]) xs.push((await box(part)).x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
  });

  test("the current tab has the 2 px accent underline", async ({ page }) => {
    await loginAs(page, fixtureUsers.ida);
    const current = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Library" });
    await expect(current).toHaveCSS("border-bottom-width", "2px");
    await expect(current).toHaveCSS("border-bottom-color", "rgb(37, 40, 45)");
  });

  test("the header search submits a GET to the library", async ({ page }) => {
    await loginAs(page, fixtureUsers.ida);
    await page.getByRole("searchbox", { name: STAFF_SEARCH }).fill("boat");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/library\?q=boat$/);
  });

  test("above 900 px the sidebar is an open column that the toggle hides and shows", async ({ page }) => {
    await page.setViewportSize({ width: 1240, height: 900 });
    await loginAs(page, fixtureUsers.ida);
    const toggle = page.getByRole("button", { name: FILTERS_TOGGLE });
    const sidebar = page.getByRole("complementary", { name: "Filters" });

    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole("heading", { name: "Filters" })).toBeVisible();
    expect((await box(sidebar)).x).toBeLessThan((await box(page.getByRole("main"))).x);

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(sidebar).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(sidebar).toBeVisible();
  });
});

test.describe("client shell", () => {
  test("the top bar shows the client name over Image portal, tabs, search and account", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs(page, fixtureUsers.jonas);
    const bar = topBar(page);
    const name = bar.getByRole("link", { name: "Fjordkaffe AS Image portal" });
    await expect(name).toBeVisible();
    expect((await box(name.getByText("Fjordkaffe AS"))).y).toBeLessThan((await box(name.getByText("Image portal"))).y);

    const nav = bar.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link")).toHaveText(["Overview", "Find images"]);
    await expect(nav.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    await expect(bar.getByRole("searchbox", { name: "Search images" })).toHaveAttribute("placeholder", "Search images");
    await expect(bar.getByRole("button", { name: firstName(fixtureUsers.jonas) })).toBeVisible();
    // Overview has no Context sidebar, so no toggle.
    await expect(bar.getByRole("button", { name: FILTERS_TOGGLE })).toHaveCount(0);

    await expect(page.getByRole("main").getByText("The agency has not shared any images with you yet.")).toBeVisible();
    await expect(page.getByRole("main").getByRole("link")).toHaveCount(0);
  });

  test("the header search submits a GET to Find images", async ({ page }) => {
    await loginAs(page, fixtureUsers.jonas);
    await page.getByRole("searchbox", { name: "Search images" }).fill("boat");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/find-images\?q=boat$/);
    await expect(page.getByRole("link", { name: "Find images" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByText("There are no images to show yet.")).toBeVisible();
  });

  test("Log out in the account menu ends the session", async ({ page }) => {
    await loginAs(page, fixtureUsers.jonas);
    await logOutVia(page, fixtureUsers.jonas);
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/overview");
    await expect(page).toHaveURL(/\/login\?returnTo=%2Foverview$/);
  });
});

test.describe("sidebar drawer at 900 px and below", () => {
  test.use({ viewport: { width: 900, height: 800 } });

  async function openDrawer(page: Page) {
    const toggle = page.getByRole("button", { name: FILTERS_TOGGLE });
    const drawer = page.getByRole("complementary", { name: "Filters" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(drawer).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(drawer).toBeVisible();
    await expect(drawer).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");
    // The toggle, now a close button, is on top of the drawer and the scrim.
    const { x, y, width, height } = await box(toggle);
    const onTop = await page.evaluate(
      ([px, py]) => document.elementFromPoint(px, py)?.closest(".sidebar-toggle") !== null,
      [x + width / 2, y + height / 2],
    );
    expect(onTop).toBe(true);
    return { toggle, drawer };
  }

  async function expectClosed(page: Page, toggle: Locator, drawer: Locator) {
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(drawer).toBeHidden();
    await expect(toggle).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
  }

  test.beforeEach(async ({ page }) => {
    await loginAs(page, fixtureUsers.ida);
  });

  test("Escape closes it", async ({ page }) => {
    const { toggle, drawer } = await openDrawer(page);
    await page.keyboard.press("Escape");
    await expectClosed(page, toggle, drawer);
  });

  test("the × closes it", async ({ page }) => {
    const { toggle, drawer } = await openDrawer(page);
    await toggle.click();
    await expectClosed(page, toggle, drawer);
  });

  test("a scrim click closes it", async ({ page }) => {
    const { toggle, drawer } = await openDrawer(page);
    await page.mouse.click(860, 600);
    await expectClosed(page, toggle, drawer);
  });

  test("leaving for a page without a sidebar closes it and unlocks scrolling", async ({ page }) => {
    await openDrawer(page);
    // The scrim covers the tabs, so follow Upload with the keyboard.
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Upload" }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/upload$/);
    await expect(page.getByRole("button", { name: FILTERS_TOGGLE })).toHaveCount(0);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
  });

  test("widening past 900 px closes it, so it does not reopen on narrowing", async ({ page }) => {
    const { toggle, drawer } = await openDrawer(page);
    await page.setViewportSize({ width: 1240, height: 800 });
    await page.setViewportSize({ width: 900, height: 800 });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(drawer).toBeHidden();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
  });
});

test.describe("responsive shell", () => {
  for (const width of [1440, 1240, 900, 560, 360]) {
    for (const user of [fixtureUsers.ida, fixtureUsers.jonas]) {
      test(`${user.role} at ${width} px has no horizontal scroll`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await loginAs(page, user);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);

        const bar = topBar(page);
        const wordmarkBox = await box(bar.getByRole("link").first());
        const navBox = await box(bar.getByRole("navigation", { name: "Main" }));
        const searchBox = await box(bar.getByRole("search"));
        if (width <= 900) {
          // Nav and search wrap onto their own rows.
          expect(navBox.y).toBeGreaterThanOrEqual(wordmarkBox.y + wordmarkBox.height);
          expect(searchBox.y).toBeGreaterThanOrEqual(navBox.y + navBox.height);
        } else {
          expect(navBox.y).toBeLessThan(wordmarkBox.y + wordmarkBox.height);
        }

        const name = bar.getByRole("button", { name: firstName(user) }).getByText(firstName(user));
        if (width <= 560) expect((await box(name)).width).toBeLessThanOrEqual(1);
        else expect((await box(name)).width).toBeGreaterThan(1);
      });
    }
  }
});

test("the focus ring shows on keyboard focus only", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loginAs(page, fixtureUsers.ida);
  const toggle = page.getByRole("button", { name: FILTERS_TOGGLE });
  await toggle.click();
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveCSS("outline-style", "none");

  await page.keyboard.press("Tab");
  const wordmark = page.getByRole("link", { name: "CRM-DAM" });
  await expect(wordmark).toBeFocused();
  await expect(wordmark).toHaveCSS("outline", "rgb(37, 40, 45) solid 3px");
  await expect(wordmark).toHaveCSS("box-shadow", "rgb(255, 255, 255) 0px 0px 0px 3px");

  await page.keyboard.press("Shift+Tab");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveCSS("outline", "rgb(37, 40, 45) solid 3px");
});

test("the skip link moves focus to the main content", async ({ page }) => {
  await loginAs(page, fixtureUsers.ida);
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test.describe("Upload and Find images are guarded by role", () => {
  test("a contact on Upload gets 403", async ({ page }) => {
    await loginAs(page, fixtureUsers.jonas);
    const response = await page.goto("/upload");
    expect(response?.status()).toBe(403);
    await expect(page.getByRole("heading", { level: 1, name: "No access" })).toBeVisible();
  });

  test("a staff user on Find images gets 403", async ({ page }) => {
    await loginAs(page, fixtureUsers.ida);
    const response = await page.goto("/find-images");
    expect(response?.status()).toBe(403);
    await expect(page.getByRole("heading", { level: 1, name: "No access" })).toBeVisible();
  });
});
