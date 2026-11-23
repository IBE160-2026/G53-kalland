import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { and, eq, sql } from "drizzle-orm";
import type { Db, Tx } from "@/db/client";
import { images, users } from "@/db/schema";
import { createClient, createUser, listActiveClients } from "@/modules/accounts";
import { setPassword, type Actor } from "@/modules/auth";
import { archiveImage, completeUpload, createUploadRows, getLibraryImage, publishImage, saveAccess } from "@/modules/images";
import { ensureStandardLicenceType } from "@/modules/licences";
import { normaliseEmail } from "@/modules/shared/email";
import { log } from "@/modules/shared/log";
import {
  DEFAULT_SEED_IMAGE,
  DEMO_PASSWORD,
  fixtureClients,
  fixtureImages,
  fixtureUsers,
  SEED_IMAGES_DIR,
  type FixtureClientKey,
  type FixtureImage,
} from "./fixture";

// Any constant shared by every process that seeds; serialises concurrent starts.
const SEED_LOCK_ID = 53_000_102;

// Creates the fixture clients and users, through the accounts and auth modules (AD-3), when the users
// table is empty. Runs in one transaction under an advisory lock. Returns true if it seeded the users.
// The licence type is its own step, before the users check, so databases seeded earlier get it too.
export async function seedIfEmpty(db: Db): Promise<boolean> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${SEED_LOCK_ID})`);
    await ensureStandardLicenceType(tx);
    const [{ count }] = await tx.select({ count: sql<number>`count(*)::int` }).from(users);
    if (count > 0) return false;

    const clientIds = {} as Record<FixtureClientKey, string>;
    for (const [key, client] of Object.entries(fixtureClients) as [FixtureClientKey, (typeof fixtureClients)[FixtureClientKey]][]) {
      clientIds[key] = await createClient(tx, client);
    }
    for (const user of Object.values(fixtureUsers)) {
      const userId =
        user.role === "staff"
          ? await createUser(tx, user)
          : await createUser(tx, { ...user, clientId: clientIds[user.client] });
      await setPassword(tx, userId, DEMO_PASSWORD);
    }
    return true;
  });
}

// The seed image files, by name: every JPEG and PNG in SEED_IMAGES_DIR (SOURCES.md is left out).
async function seedImageFiles(): Promise<string[]> {
  const files = await readdir(SEED_IMAGES_DIR);
  return files.filter((file) => /\.(jpe?g|png)$/i.test(file)).sort();
}

// The state a seed file needs: its fixture row, or published, public and free.
function stateOf(file: string): Omit<FixtureImage, "file" | "row"> {
  return Object.values(fixtureImages).find((image) => image.file === file) ?? DEFAULT_SEED_IMAGE;
}

async function findIda(tx: Tx): Promise<Actor | null> {
  const [ida] = await tx
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, normaliseEmail(fixtureUsers.ida.email)), eq(users.role, "staff")));
  return ida ? { userId: ida.id, role: "staff" } : null;
}

// Copied from src/test/images.ts rather than importing test code into the app.
async function* chunksOf(bytes: Buffer, size = 64 * 1024): AsyncGenerator<Uint8Array> {
  for (let i = 0; i < bytes.length; i += size) yield bytes.subarray(i, i + size);
}

// Uploads, generates and sets one seed image as Ida, through the images module only (AD-3, AD-24):
// completes the upload (which runs the mock AI inline), then saves its access, publishes and archives it
// as its fixture row says.
async function seedOneImage(ida: Actor, imageId: string, file: string, clientIds: Map<FixtureClientKey, string>): Promise<void> {
  const bytes = await readFile(path.join(SEED_IMAGES_DIR, file));
  await completeUpload(ida, imageId, chunksOf(bytes), bytes.length);
  const state = stateOf(file);
  const image = await getLibraryImage(ida, imageId);
  if (!image) throw new Error(`Seed image ${file} disappeared after upload.`);
  const added = state.clients.map((key) => {
    const id = clientIds.get(key);
    if (!id) throw new Error(`Seed client ${key} is missing or inactive.`);
    return id;
  });
  await saveAccess(ida, imageId, {
    version: image.version,
    visibility: state.visibility,
    priceTier: state.priceTier,
    clients: { added, removed: [] },
  });
  if (state.status === "draft") return;
  await publishImage(ida, imageId);
  if (state.status === "archived") await archiveImage(ida, imageId);
}

// The sample library (Story 1.7), separate from the users seed because databases seeded earlier already
// have users. Under the seed lock, when the images table is empty, it creates one `uploading` row per
// seed file in one batch owned by Ida and commits them, so a concurrent start sees images and skips. Then
// it uploads each file in its own step: a failure is logged and the next file goes on. Returns how many
// files it planned and seeded, or null when it skipped.
export async function seedSampleLibrary(db: Db): Promise<{ planned: number; seeded: number } | null> {
  const planned = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(${SEED_LOCK_ID})`);
    const [{ count }] = await tx.select({ count: sql<number>`count(*)::int` }).from(images);
    if (count > 0) {
      log.info("Images exist; sample library skipped.");
      return null;
    }
    const ida = await findIda(tx);
    if (!ida) {
      log.warn("The seed user Ida is missing; sample library not seeded.");
      return null;
    }
    const files = await seedImageFiles();
    let batchId: string | undefined;
    const rows: { id: string; file: string }[] = [];
    for (const file of files) {
      const created = await createUploadRows(tx, ida, { batchId, filenames: [file] });
      batchId = created.batchId;
      rows.push({ id: created.images[0].id, file });
    }
    return { ida, rows };
  });
  if (!planned) return null;

  const clientIds = new Map<FixtureClientKey, string>();
  const active = await listActiveClients();
  for (const [key, client] of Object.entries(fixtureClients) as [FixtureClientKey, (typeof fixtureClients)[FixtureClientKey]][]) {
    const found = active.find((row) => row.name === client.name);
    if (found) clientIds.set(key, found.id);
  }

  let seeded = 0;
  for (const { id, file } of planned.rows) {
    try {
      await seedOneImage(planned.ida, id, file, clientIds);
      seeded += 1;
    } catch (error) {
      log.error({ err: error, file }, "Could not seed a sample image; going on with the next.");
    }
  }
  return { planned: planned.rows.length, seeded };
}

// Called from src/instrumentation.ts when SEED_ON_START=true. The users first, then the sample library.
export async function seedOnStart(db: Db): Promise<void> {
  const seeded = await seedIfEmpty(db);
  log.info(seeded ? "Seeded the demo users." : "Users exist; seed skipped.");
  const sampleImages = await seedSampleLibrary(db);
  if (!sampleImages) return;
  if (sampleImages.seeded < sampleImages.planned) {
    log.warn(`Seeded ${sampleImages.seeded} of ${sampleImages.planned} sample images; see the errors above.`);
  } else {
    log.info(`Seeded ${sampleImages.seeded} sample images.`);
  }
}
