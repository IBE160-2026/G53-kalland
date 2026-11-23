import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, expect, it, vi } from "vitest";
import { requireEnv } from "./client.ts";

afterEach(() => vi.unstubAllEnvs());

it.each([undefined, ""])("requireEnv throws a plain message when DATABASE_URL is %j", (value) => {
  vi.stubEnv("DATABASE_URL", value);
  expect(() => requireEnv("DATABASE_URL")).toThrow("DATABASE_URL is not set.");
});

it("the migrate command exits non-zero with that message when DATABASE_URL is unset", async () => {
  const script = fileURLToPath(new URL("./migrate.ts", import.meta.url));
  const env = { ...process.env };
  delete env.DATABASE_URL;
  const run = promisify(execFile)(process.execPath, [script], { env });
  await expect(run).rejects.toMatchObject({ code: 1, stderr: expect.stringContaining("DATABASE_URL is not set.") });
});
