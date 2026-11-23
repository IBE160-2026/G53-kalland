import { defineConfig } from "@playwright/test";

// Runs in the e2e container against app-test (AD-7). APP_ORIGIN is app-test's address there.
export default defineConfig({
  testDir: "./tests/e2e",
  forbidOnly: true,
  reporter: "list",
  use: { baseURL: process.env.APP_ORIGIN ?? "http://localhost:3000" },
  // The seeded-library test counts the sample library exactly, so it runs before every test that uploads.
  projects: [
    { name: "seeded library", testMatch: /seed\.spec\.ts$/ },
    { name: "app", testIgnore: /seed\.spec\.ts$/, dependencies: ["seeded library"] },
  ],
});
