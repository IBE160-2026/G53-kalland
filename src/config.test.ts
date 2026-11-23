import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import nextConfig from "../next.config";

it(".env.example lists exactly the 13 environment variables of AD-24", () => {
  const names = readFileSync(new URL("../.env.example", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => line.split("=")[0]);
  expect(names.sort()).toEqual(
    [
      "DATABASE_URL",
      "TEST_DATABASE_URL",
      "APP_ORIGIN",
      "FILE_STORE_DIR",
      "AI_PROVIDER",
      "ANTHROPIC_API_KEY",
      "AI_MODEL",
      "AI_EFFORT",
      "MOCK_DELAY_MS",
      "MOCK_FAIL",
      "WORKER_CONCURRENCY",
      "SEED_ON_START",
      "APP_ENCRYPTION_KEY",
    ].sort(),
  );
});

it("next.config keeps exiftool-vendored and sharp out of the bundle", () => {
  expect(nextConfig.serverExternalPackages).toEqual(expect.arrayContaining(["exiftool-vendored", "sharp"]));
});
