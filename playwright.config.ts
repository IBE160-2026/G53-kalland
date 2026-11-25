import { defineConfig } from "@playwright/test";

// Runs in the e2e container against app-test (AD-7). APP_ORIGIN is app-test's address there.
export default defineConfig({
  testDir: "./tests/e2e",
  forbidOnly: true,
  reporter: "list",
  use: { baseURL: process.env.APP_ORIGIN ?? "http://localhost:3000" },
  // The seeded-library and client access tests count the sample library exactly, so they run before
  // every test that uploads or publishes. The Clients tests set a seeded client and contact inactive for a moment,
  // so they run last, when no other test logs in as its contact.
  projects: [
    { name: "seeded library", testMatch: /(seed|client-access)\.spec\.ts$/ },
    { name: "app", testIgnore: /(seed|client-access|clients)\.spec\.ts$/, dependencies: ["seeded library"] },
    { name: "clients", testMatch: /clients\.spec\.ts$/, dependencies: ["app"] },
  ],
});
