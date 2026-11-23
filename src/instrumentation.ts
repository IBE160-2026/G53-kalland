// Runs once when the server starts (Node runtime only: it needs pg, argon2 and the file store).
// Always: the upload sweep (AD-11) deletes `uploading` rows untouched for an hour and empties tmp/;
// then every `queued` image and every `generating` image with an expired lease fails as "interrupted" (AD-12).
// Then it seeds the demo data on an empty database when SEED_ON_START=true (development and tests only).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const [{ getDb }, { failInterruptedGenerations, sweepStaleUploads }, { clearTempFiles }, { log }] = await Promise.all([
    import("./db/client"),
    import("./modules/images"),
    import("./modules/media"),
    import("./modules/shared/log"),
  ]);
  const swept = await sweepStaleUploads(new Date());
  await clearTempFiles();
  log.info({ swept }, "Upload sweep done.");
  const interrupted = await failInterruptedGenerations(new Date());
  log.info({ interrupted }, "Interrupted generations marked failed.");
  if (process.env.SEED_ON_START !== "true") return;
  const { seedOnStart } = await import("./db/seed/seed");
  await seedOnStart(getDb());
}
