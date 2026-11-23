import { afterAll, expect, it } from "vitest";
import { DEFAULT_TENANT_ID } from "./tenant.ts";
import { testPool } from "../test/test-db.ts";

const pool = testPool();
afterAll(() => pool.end());

it("the migrations create the default tenant", async () => {
  const { rows } = await pool.query("select id from tenants");
  expect(rows).toEqual([{ id: DEFAULT_TENANT_ID }]);
});

it("new rows get a UUID v7 id from the database", async () => {
  const { rows } = await pool.query("insert into tenants (name) values ('Second') returning id");
  try {
    expect(rows[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  } finally {
    await pool.query("delete from tenants where id = $1", [rows[0].id]);
  }
});
