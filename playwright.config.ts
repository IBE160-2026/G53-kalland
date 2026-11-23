import { defineConfig } from "@playwright/test";

// Runs in the e2e container against app-test (AD-7). APP_ORIGIN is app-test's address there.
export default defineConfig({
  testDir: "./tests/e2e",
  forbidOnly: true,
  reporter: "list",
  use: { baseURL: process.env.APP_ORIGIN ?? "http://localhost:3000" },
  // The empty-Library test needs a database without images, so it runs before every test that uploads.
  projects: [
    { name: "empty library", testMatch: /empty-library\.spec\.ts$/ },
    { name: "app", testIgnore: /empty-library\.spec\.ts$/, dependencies: ["empty library"] },
  ],
});
