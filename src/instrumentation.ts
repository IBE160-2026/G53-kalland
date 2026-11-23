// Runs once when the server starts. Seeds the demo data on an empty database when SEED_ON_START=true
// (development and tests only). Node runtime only: the seed needs pg and argon2.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.SEED_ON_START !== "true") return;
  const [{ getDb }, { seedOnStart }] = await Promise.all([import("./db/client"), import("./db/seed/seed")]);
  await seedOnStart(getDb());
}
