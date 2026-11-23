import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import pg from "pg";
import { checkDatabase } from "./health.ts";
import { testPool } from "../test/test-db.ts";

const unreachableUrl = "postgres://nobody:nothing@127.0.0.1:1/none";

describe("checkDatabase", () => {
  const pool = testPool();
  afterAll(() => pool.end());

  it("is true when the database answers", async () => {
    expect(await checkDatabase(pool)).toBe(true);
  });

  it("is false, without throwing, when the database is unreachable", async () => {
    const down = new pg.Pool({ connectionString: unreachableUrl, connectionTimeoutMillis: 2000 });
    await expect(checkDatabase(down)).resolves.toBe(false);
    await down.end();
  });
});

describe("GET /api/health", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function callHealth(databaseUrl: string) {
    vi.stubEnv("DATABASE_URL", databaseUrl);
    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    return { status: response.status, text: await response.text() };
  }

  it("returns 200 and status ok when the database answers", async () => {
    const { status, text } = await callHealth(process.env.TEST_DATABASE_URL!);
    expect(status).toBe(200);
    expect(JSON.parse(text)).toEqual({ status: "ok" });
  });

  it("returns 503 without internals when the database is unreachable", async () => {
    const { status, text } = await callHealth(unreachableUrl);
    expect(status).toBe(503);
    expect(JSON.parse(text)).toEqual({ status: "unavailable" });
    expect(text).not.toContain("postgres://");
  });
});

describe("checkDatabase without configuration", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is false, without throwing, when DATABASE_URL is unset", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.resetModules();
    const { checkDatabase: fresh } = await import("./health.ts");
    await expect(fresh()).resolves.toBe(false);
  });
});
