import { describe, expect, it } from "vitest";
import { assertSafeTestTarget, resetTestDatabase } from "./reset-test.ts";

describe("test database reset guard", () => {
  it("refuses when TEST_DATABASE_URL is not set", async () => {
    await expect(resetTestDatabase({ DATABASE_URL: "postgres://u:p@db:5432/crm_dam" })).rejects.toThrow(
      "TEST_DATABASE_URL is not set",
    );
  });

  it("refuses when the test database is the dev database, even with other credentials", async () => {
    const env = {
      DATABASE_URL: "postgres://u:p@db:5432/crm_dam",
      TEST_DATABASE_URL: "postgres://other:secret@db/crm_dam",
    };
    await expect(resetTestDatabase(env)).rejects.toThrow("same database as DATABASE_URL");
  });

  it("refuses a database whose name does not end in _test", async () => {
    const env = { TEST_DATABASE_URL: "postgres://u:p@db:5432/crm_dam" };
    await expect(resetTestDatabase(env)).rejects.toThrow("must name a database ending in _test");
  });

  it("accepts a separate test database", () => {
    const env = {
      DATABASE_URL: "postgres://u:p@db:5432/crm_dam",
      TEST_DATABASE_URL: "postgres://u:p@db:5432/crm_dam_test",
    };
    expect(assertSafeTestTarget(env)).toBe(env.TEST_DATABASE_URL);
  });
});
