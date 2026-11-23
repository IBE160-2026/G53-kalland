// Runs in every Vitest worker before the tests: module code (getDb) must use the test database.
const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) throw new Error("TEST_DATABASE_URL is not set. Run the tests with the README's test command.");
process.env.DATABASE_URL = testUrl;
