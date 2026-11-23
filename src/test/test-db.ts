import pg from "pg";

// A pool on the test database, for tests that query it directly.
export function testPool(): pg.Pool {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL is not set. Run the tests with the README's test command.");
  return new pg.Pool({ connectionString: url, max: 2 });
}
