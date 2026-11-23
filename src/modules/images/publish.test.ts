import { and, eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/db/client";
import { imageClients, images } from "@/db/schema";
import { fixtureUsers } from "@/db/seed/fixture";
import { setClientStatus } from "@/modules/accounts";
import type { Actor } from "@/modules/auth";
import { Conflict, Forbidden, NotFound, Validation } from "@/modules/shared/errors";
import { createTestClient } from "@/test/factories";
import { createLibraryImage, imageRow } from "@/test/library-images";
import { loginAs } from "@/test/login-as";
import { archiveImage, getLibraryImage, publishImage, saveAccess, type AccessInput } from ".";

const db = getDb();
let ida: Actor;
let jonas: Actor;

beforeAll(async () => {
  ida = (await loginAs(fixtureUsers.ida)).actor;
  jonas = (await loginAs(fixtureUsers.jonas)).actor;
});

function access(version: number, changes: Partial<AccessInput> = {}): AccessInput {
  return { version, visibility: "internal", priceTier: "free", clients: { added: [], removed: [] }, ...changes };
}

async function listed(imageId: string) {
  return db.select().from(imageClients).where(eq(imageClients.imageId, imageId));
}

async function errorOf(promise: Promise<unknown>): Promise<unknown> {
  return promise.then(
    () => null,
    (error: unknown) => error,
  );
}

describe("publishImage", () => {
  it("publishes a ready draft with every field: status published, publishedAt set, version bumped", async () => {
    const id = await createLibraryImage(ida);
    expect((await getLibraryImage(ida, id))?.missingFields).toEqual([]);
    expect(await publishImage(ida, id)).toBe(true);
    const row = await imageRow(id);
    expect(row).toMatchObject({ status: "published", version: 2 });
    expect(row.publishedAt).toBeInstanceOf(Date);
  });

  it("publishes a draft that lacks alt text and keywords, which the dialog lists", async () => {
    const id = await createLibraryImage(ida, { altText: null, keywords: [] });
    expect((await getLibraryImage(ida, id))?.missingFields).toEqual(["altText", "keywords"]);
    expect(await publishImage(ida, id)).toBe(true);
    expect((await imageRow(id)).status).toBe("published");
  });

  it("publishes a draft whose generation failed", async () => {
    const id = await createLibraryImage(ida, { processingState: "failed", description: null });
    expect(await publishImage(ida, id)).toBe(true);
    expect((await imageRow(id)).status).toBe("published");
  });

  // `queued` takes the same path; it is left out because failInterruptedGenerations, run by other test
  // files in parallel, turns every queued image into failed.
  it.each([
    ["uploading", {}],
    ["generating", { generationToken: crypto.randomUUID(), leaseUntil: new Date(Date.now() + 3_600_000) }],
  ] as const)("refuses a draft that is still %s with a reason, and changes nothing", async (state, lease) => {
    const id = await createLibraryImage(ida, { processingState: state });
    if (Object.keys(lease).length > 0) await db.update(images).set(lease).where(eq(images.id, id));
    const error = await errorOf(publishImage(ida, id));
    expect(error).toBeInstanceOf(Validation);
    expect((error as Validation).messageKey).toBe("errors.publishNotReady");
    expect(await imageRow(id)).toMatchObject({ status: "draft", publishedAt: null, version: 1 });
  });

  it("changes nothing when the image is already published", async () => {
    const id = await createLibraryImage(ida);
    await publishImage(ida, id);
    const before = await imageRow(id);
    expect(await publishImage(ida, id)).toBe(false);
    const after = await imageRow(id);
    expect(after.publishedAt).toEqual(before.publishedAt);
    expect(after.version).toBe(before.version);
  });

  it("publishes once when called in parallel", async () => {
    const id = await createLibraryImage(ida);
    const results = await Promise.all(Array.from({ length: 5 }, () => publishImage(ida, id)));
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(await imageRow(id)).toMatchObject({ status: "published", version: 2 });
  });

  it("refuses an archived image with Conflict and an unknown one with NotFound", async () => {
    const id = await createLibraryImage(ida, { status: "archived" });
    await expect(publishImage(ida, id)).rejects.toBeInstanceOf(Conflict);
    expect((await imageRow(id)).status).toBe("archived");
    await expect(publishImage(ida, "019ab0c0-0000-7000-8000-00000000dead")).rejects.toBeInstanceOf(NotFound);
  });
});

describe("archiveImage", () => {
  it("archives a published image and bumps the version", async () => {
    const id = await createLibraryImage(ida);
    await publishImage(ida, id);
    await archiveImage(ida, id);
    expect(await imageRow(id)).toMatchObject({ status: "archived", version: 3 });
  });

  it.each(["draft", "archived"] as const)("refuses a %s image with Conflict and changes nothing", async (status) => {
    const id = await createLibraryImage(ida, { status });
    await expect(archiveImage(ida, id)).rejects.toBeInstanceOf(Conflict);
    expect(await imageRow(id)).toMatchObject({ status, version: 1 });
  });

  it("refuses an unknown image with NotFound", async () => {
    await expect(archiveImage(ida, "019ab0c0-0000-7000-8000-00000000dead")).rejects.toBeInstanceOf(NotFound);
  });

  it("archives once when called in parallel", async () => {
    const id = await createLibraryImage(ida);
    await publishImage(ida, id);
    const results = await Promise.allSettled(Array.from({ length: 5 }, () => archiveImage(ida, id)));
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(await imageRow(id)).toMatchObject({ status: "archived", version: 3 });
  });
});

describe("saveAccess", () => {
  it("saves visibility, price and the added clients with addedAt, and bumps the version", async () => {
    const id = await createLibraryImage(ida);
    const clientId = await createTestClient();
    const result = await saveAccess(ida, id, access(1, { visibility: "restricted", priceTier: "paid", clients: { added: [clientId], removed: [] } }));
    expect(result).toEqual({ version: 2 });
    expect(await imageRow(id)).toMatchObject({ visibility: "restricted", priceTier: "paid", version: 2, visibleToAllSince: null });
    const rows = await listed(id);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ clientId });
    expect(rows[0].addedAt).toBeInstanceOf(Date);
  });

  it("writes nothing for a stale version and gives the failed-save message", async () => {
    const id = await createLibraryImage(ida);
    const clientId = await createTestClient();
    await saveAccess(ida, id, access(1, { priceTier: "paid" }));
    const error = await errorOf(saveAccess(ida, id, access(1, { visibility: "restricted", clients: { added: [clientId], removed: [] } })));
    expect(error).toBeInstanceOf(Conflict);
    expect((error as Conflict).messageKey).toBe("errors.saveFailed");
    expect(await imageRow(id)).toMatchObject({ visibility: "internal", priceTier: "paid", version: 2 });
    expect(await listed(id)).toEqual([]);
  });

  it("sets visibleToAllSince when the image becomes public, keeps it while public, and clears it after", async () => {
    const id = await createLibraryImage(ida);
    await saveAccess(ida, id, access(1, { visibility: "public" }));
    const since = (await imageRow(id)).visibleToAllSince;
    expect(since).toBeInstanceOf(Date);
    expect(Math.abs(since!.getTime() - Date.now())).toBeLessThan(60_000);

    await saveAccess(ida, id, access(2, { visibility: "public", priceTier: "paid" }));
    expect((await imageRow(id)).visibleToAllSince).toEqual(since);

    await saveAccess(ida, id, access(3, { visibility: "internal" }));
    expect((await imageRow(id)).visibleToAllSince).toBeNull();
  });

  it("saves Restricted with no clients", async () => {
    const id = await createLibraryImage(ida);
    await saveAccess(ida, id, access(1, { visibility: "restricted" }));
    expect(await imageRow(id)).toMatchObject({ visibility: "restricted", version: 2 });
    expect(await listed(id)).toEqual([]);
  });

  it("applies the list as a diff: a removal elsewhere is not undone by another save", async () => {
    const id = await createLibraryImage(ida);
    const [a, b] = [await createTestClient(), await createTestClient()];
    await saveAccess(ida, id, access(1, { visibility: "restricted", clients: { added: [a, b], removed: [] } }));
    await saveAccess(ida, id, access(2, { visibility: "restricted", clients: { added: [], removed: [a] } }));
    // The next form adds nothing and removes nothing; b stays, a stays removed.
    await saveAccess(ida, id, access(3, { visibility: "restricted", priceTier: "paid" }));
    expect((await listed(id)).map((row) => row.clientId)).toEqual([b]);
    const [{ addedAt }] = await db.select({ addedAt: imageClients.addedAt }).from(imageClients).where(and(eq(imageClients.imageId, id), eq(imageClients.clientId, b)));
    // Adding a client that is already listed keeps its first addedAt.
    await saveAccess(ida, id, access(4, { visibility: "restricted", clients: { added: [b], removed: [] } }));
    const [again] = await listed(id);
    expect(again.addedAt).toEqual(addedAt);
  });

  it("deletes the list when the image leaves Restricted, so re-adding a client gives a fresh addedAt", async () => {
    const id = await createLibraryImage(ida);
    const clientId = await createTestClient();
    await saveAccess(ida, id, access(1, { visibility: "restricted", clients: { added: [clientId], removed: [] } }));
    const [first] = await listed(id);
    await saveAccess(ida, id, access(2, { visibility: "public", clients: { added: [clientId], removed: [] } }));
    expect(await listed(id)).toEqual([]);
    await saveAccess(ida, id, access(3, { visibility: "restricted", clients: { added: [clientId], removed: [] } }));
    const [again] = await listed(id);
    expect(again.clientId).toBe(clientId);
    expect(again.addedAt.getTime()).toBeGreaterThan(first.addedAt.getTime());
  });

  it.each([
    ["an inactive client", async () => {
      const id = await createTestClient();
      await setClientStatus(db, ida, id, "inactive");
      return id;
    }],
    ["an unknown client", async () => "019ab0c0-0000-7000-8000-00000000dead"],
  ])("refuses to add %s with Validation and writes nothing", async (_name, makeClient) => {
    const id = await createLibraryImage(ida);
    const clientId = await makeClient();
    await expect(
      saveAccess(ida, id, access(1, { visibility: "restricted", clients: { added: [clientId], removed: [] } })),
    ).rejects.toBeInstanceOf(Validation);
    expect(await imageRow(id)).toMatchObject({ visibility: "internal", version: 1 });
    expect(await listed(id)).toEqual([]);
  });
});

describe("the publish and access writes need a staff Actor", () => {
  it("throw Forbidden for a contact and change nothing", async () => {
    const id = await createLibraryImage(ida);
    await expect(publishImage(jonas, id)).rejects.toBeInstanceOf(Forbidden);
    await expect(saveAccess(jonas, id, access(1, { visibility: "public" }))).rejects.toBeInstanceOf(Forbidden);
    expect(await imageRow(id)).toMatchObject({ status: "draft", visibility: "internal", version: 1 });
    await publishImage(ida, id);
    await expect(archiveImage(jonas, id)).rejects.toBeInstanceOf(Forbidden);
    expect((await imageRow(id)).status).toBe("published");
  });
});

