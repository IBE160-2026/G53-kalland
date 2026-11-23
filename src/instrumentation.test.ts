import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, expect, it } from "vitest";
import { getDb } from "@/db/client";
import { images } from "@/db/schema";
import { fixtureUsers } from "@/db/seed/fixture";
import { createUploadRows, STALE_UPLOAD_MS } from "@/modules/images";
import { useTempFileStore } from "@/test/images";
import { loginAs } from "@/test/login-as";
import { register } from "./instrumentation";

let storeDir: string;
const saved = { runtime: process.env.NEXT_RUNTIME, seed: process.env.SEED_ON_START };

beforeAll(async () => {
  storeDir = await useTempFileStore();
  process.env.NEXT_RUNTIME = "nodejs";
  delete process.env.SEED_ON_START;
});
afterAll(async () => {
  for (const [name, value] of [["NEXT_RUNTIME", saved.runtime], ["SEED_ON_START", saved.seed]] as const) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  await rm(storeDir, { recursive: true, force: true });
});

it("at startup fails queued and lease-expired generating images as interrupted, leaving live leases (AD-12)", async () => {
  const db = getDb();
  const { actor } = await loginAs(fixtureUsers.ida);
  const { images: rows } = await createUploadRows(db, actor, { filenames: ["queued.jpg", "expired.jpg", "live.jpg"] });
  const [queued, expired, live] = rows.map((row) => row.id);
  await db.update(images).set({ processingState: "queued" }).where(eq(images.id, queued));
  await db
    .update(images)
    .set({ processingState: "generating", generationToken: crypto.randomUUID(), leaseUntil: sql`now() - interval '1 second'` })
    .where(eq(images.id, expired));
  await db
    .update(images)
    .set({ processingState: "generating", generationToken: crypto.randomUUID(), leaseUntil: sql`now() + interval '1 minute'` })
    .where(eq(images.id, live));

  await register();

  const stateOf = async (id: string) => (await db.select().from(images).where(eq(images.id, id)))[0];
  for (const id of [queued, expired]) {
    expect(await stateOf(id)).toMatchObject({ processingState: "failed", failureReason: "interrupted" });
  }
  expect(await stateOf(live)).toMatchObject({ processingState: "generating", failureReason: null });
});

it("at startup deletes stale uploading rows and empties tmp/ (AD-11)", async () => {
  const db = getDb();
  const { actor } = await loginAs(fixtureUsers.ida);
  const { images: rows } = await createUploadRows(db, actor, { filenames: ["stale.jpg"] });
  await db
    .update(images)
    .set({ updatedAt: sql`now() - make_interval(secs => ${(STALE_UPLOAD_MS + 60_000) / 1000})` })
    .where(eq(images.id, rows[0].id));
  await mkdir(path.join(storeDir, "tmp"), { recursive: true });
  await writeFile(path.join(storeDir, "tmp", "left-over"), "x");

  await register();

  expect(await db.select().from(images).where(eq(images.id, rows[0].id))).toEqual([]);
  expect(await readdir(path.join(storeDir, "tmp")).catch(() => [])).toEqual([]);
});
