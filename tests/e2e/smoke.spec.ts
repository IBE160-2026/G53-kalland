import { expect, test } from "@playwright/test";

test("the health endpoint reports ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
});

test("the start page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "CRM-DAM" })).toBeVisible();
  await expect(page.getByText("The app is running.")).toBeVisible();
});
