import { readdir, rm } from "node:fs/promises";
import { eq, sql } from "drizzle-orm";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getDb, getPool, type Db } from "@/db/client";
import { runMigrations } from "@/db/migrate";
import { clients, imageClients, images, licences, users } from "@/db/schema";
import { MOCK_FIXTURES } from "@/modules/ai/providers/mock-fixtures";
import { register } from "@/instrumentation";
import { useTempFileStore } from "@/test/images";
import { DEFAULT_SEED_IMAGE, fixtureClients, fixtureImages, fixtureUsers, SEED_IMAGES_DIR, type FixtureImage } from "./fixture";
import { seedIfEmpty, seedSampleLibrary } from "./seed";

// The sample library seeds only into an empty images table, which the shared test database never is
// while other test files run. So this file seeds a database of its own, made and migrated here, as a
// fresh install with users already seeded (the "users exist, no images" case).
const SEED_DB = "crm_dam_seed_test";
const adminUrl = process.env.TEST_DATABASE_URL!;
const seedUrl = Object.assign(new URL(adminUrl), { pathname: `/${SEED_DB}` }).toString();

async function admin(query: string): Promise<void> {
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  try {
    await client.query(query);
  } finally {
    await client.end();
  }
}

let db: Db;
let storeDir: string;
let results: Awaited<ReturnType<typeof seedSampleLibrary>>[];
let disabledCounts: { users: number; images: number };
let files: string[];

beforeAll(async () => {
  storeDir = await useTempFileStore();
  await admin(`drop database if exists ${SEED_DB} with (force)`);
  await admin(`create database ${SEED_DB}`);
  await runMigrations(seedUrl);
  process.env.DATABASE_URL = seedUrl;
  db = getDb();
  // A start with SEED_ON_START unset seeds nothing, not even on this empty database.
  const saved = { runtime: process.env.NEXT_RUNTIME, seed: process.env.SEED_ON_START };
  process.env.NEXT_RUNTIME = "nodejs";
  delete process.env.SEED_ON_START;
  try {
    await register();
  } finally {
    for (const [name, value] of [["NEXT_RUNTIME", saved.runtime], ["SEED_ON_START", saved.seed]] as const) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
  const countOf = async (table: typeof users | typeof images) => (await db.select({ n: sql<number>`count(*)::int` }).from(table))[0].n;
  disabledCounts = { users: await countOf(users), images: await countOf(images) };
  await seedIfEmpty(db);
  files = (await readdir(SEED_IMAGES_DIR)).filter((file) => /\.(jpe?g|png)$/i.test(file));
  // Two starts at once: the advisory lock lets one seed, and the other sees images and skips.
  results = await Promise.all([seedSampleLibrary(db), seedSampleLibrary(db)]);
}, 180_000);

afterAll(async () => {
  await getPool().end();
  await admin(`drop database if exists ${SEED_DB} with (force)`);
  await rm(storeDir, { recursive: true, force: true });
});

async function imageByFile(file: string) {
  const [row] = await db.select().from(images).where(eq(images.filename, file));
  const listed = await db
    .select({ name: clients.name })
    .from(imageClients)
    .innerJoin(clients, eq(clients.id, imageClients.clientId))
    .where(eq(imageClients.imageId, row.id));
  return { ...row, clientNames: listed.map((c) => c.name).sort() };
}

describe("seedSampleLibrary", () => {
  it("seeds nothing on start while SEED_ON_START is not true", () => {
    expect(disabledCounts).toEqual({ users: 0, images: 0 });
  });

  it("seeds every file once when two starts race, and the other start skips", () => {
    expect(results.filter((r) => r === null)).toHaveLength(1);
    expect(results.find((r) => r !== null)).toEqual({ planned: files.length, seeded: files.length });
  });

  it("uploads every seed file once, as Ida, in one batch", async () => {
    const rows = await db
      .select({ filename: images.filename, batchId: images.batchId, uploader: users.email })
      .from(images)
      .innerJoin(users, eq(users.id, images.uploadedBy));
    expect(rows.map((r) => r.filename).sort()).toEqual([...files].sort());
    expect(new Set(rows.map((r) => r.uploader))).toEqual(new Set([fixtureUsers.ida.email]));
    expect(new Set(rows.map((r) => r.batchId)).size).toBe(1);
  });

  it("generates the mock fixture metadata for every file except the fail file, which is a failed draft", async () => {
    for (const file of files) {
      const row = await imageByFile(file);
      if (file === fixtureImages.fail.file) {
        expect(row).toMatchObject({ processingState: "failed", status: "draft" });
      } else {
        expect(row, file).toMatchObject({ processingState: "ready", title: MOCK_FIXTURES[file].title, altText: MOCK_FIXTURES[file].altText });
      }
    }
  });

  it.each(Object.entries(fixtureImages))("gives %s the status, visibility, client list and price of its row", async (_, fixture) => {
    const row = await imageByFile(fixture.file);
    expect(row).toMatchObject({ status: fixture.status, visibility: fixture.visibility, priceTier: fixture.priceTier });
    expect(row.clientNames).toEqual(fixture.clients.map((key) => fixtureClients[key].name).sort());
    expect(row.publishedAt === null).toBe(fixture.status === "draft");
  });

  it("restricts A7 to Nordlys only and leaves S4 restricted with an empty list", async () => {
    expect((await imageByFile(fixtureImages.a7.file)).clientNames).toEqual(["Nordlys Sykkel AS"]);
    expect(await imageByFile(fixtureImages.s4.file)).toMatchObject({ visibility: "restricted", clientNames: [] });
  });

  it("archives A11 through archiveImage, bumping its version past publish", async () => {
    const row = await imageByFile(fixtureImages.a11.file);
    expect(row.status).toBe("archived");
    // 1 at upload, then saveAccess, publishImage and archiveImage each bump it once.
    expect(row.version).toBe(4);
  });

  it("publishes every other file as public and free", async () => {
    const named = new Set<string>(Object.values(fixtureImages).map((image) => image.file));
    const others = files.filter((file) => !named.has(file));
    expect(others.length).toBeGreaterThan(0);
    for (const file of others) {
      const row = await imageByFile(file);
      expect(row, file).toMatchObject({
        status: DEFAULT_SEED_IMAGE.status,
        visibility: DEFAULT_SEED_IMAGE.visibility,
        priceTier: DEFAULT_SEED_IMAGE.priceTier,
        clientNames: [],
      });
    }
  });

  it("grants the fixture licences (A3, A6, A8, A10, A12) to Fjordkaffe as purchases by Jonas, at the current price", async () => {
    const rows = await db
      .select({
        filename: images.filename,
        client: clients.name,
        contact: users.email,
        source: licences.source,
        imageTitle: licences.imageTitle,
        priceMinor: licences.priceMinor,
        currency: licences.currency,
        revokedAt: licences.revokedAt,
      })
      .from(licences)
      .innerJoin(images, eq(images.id, licences.imageId))
      .innerJoin(clients, eq(clients.id, licences.clientId))
      .innerJoin(users, eq(users.id, licences.contactId));
    const licensed = (Object.values(fixtureImages) as FixtureImage[]).filter((image) => image.licensedTo);
    expect(rows.map((row) => row.filename).sort()).toEqual(licensed.map((image) => image.file).sort());
    for (const row of rows) {
      expect(row, row.filename).toEqual({
        filename: row.filename,
        client: fixtureClients.fjordkaffe.name,
        contact: fixtureUsers.jonas.email,
        source: "purchase",
        imageTitle: MOCK_FIXTURES[row.filename].title,
        priceMinor: 9000,
        currency: "USD",
        revokedAt: null,
      });
    }
  });

  it("skips on a restart, when images exist", async () => {
    const count = async () => (await db.select({ n: sql<number>`count(*)::int` }).from(images))[0].n;
    const before = await count();
    expect(await seedSampleLibrary(db)).toBeNull();
    expect(await count()).toBe(before);
  });
});
