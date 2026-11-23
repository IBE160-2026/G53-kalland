import { beforeAll, describe, expect, it, vi } from "vitest";
import { fixtureUsers } from "@/db/seed/fixture";
import type { Actor } from "@/modules/auth";
import { SESSION_COOKIE } from "@/modules/auth/cookies";
import { createLibraryImage, imageRow } from "@/test/library-images";
import { loginAs } from "@/test/login-as";
import { publishImageAction, saveAccessAction } from "./actions";

// The request the guard sees, as in upload/actions.test.ts.
const request = vi.hoisted(() => ({ cookies: new Map<string, string>() }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (request.cookies.has(name) ? { name, value: request.cookies.get(name) } : undefined),
  }),
  headers: async () => new Headers(),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
  forbidden: () => {
    throw new Error("forbidden");
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

let ida: Actor;

beforeAll(async () => {
  const session = await loginAs(fixtureUsers.ida);
  ida = session.actor;
  request.cookies.set(SESSION_COOKIE, session.token);
});

const noClients = { added: [], removed: [] };

describe("saveAccessAction", () => {
  it("saves and returns no error", async () => {
    const imageId = await createLibraryImage(ida);
    expect(await saveAccessAction({ imageId, version: 1, visibility: "public", priceTier: "paid", clients: noClients })).toEqual({});
    expect(await imageRow(imageId)).toMatchObject({ visibility: "public", priceTier: "paid", version: 2 });
  });

  it("maps a stale version to the failed-save message", async () => {
    const imageId = await createLibraryImage(ida);
    await saveAccessAction({ imageId, version: 1, visibility: "public", priceTier: "free", clients: noClients });
    expect(await saveAccessAction({ imageId, version: 1, visibility: "internal", priceTier: "paid", clients: noClients })).toEqual({
      error: "errors.saveFailed",
    });
    expect(await imageRow(imageId)).toMatchObject({ visibility: "public", priceTier: "free", version: 2 });
  });

  it.each([
    ["a non-UUID image id", { imageId: "nope" }],
    ["an unknown visibility", { visibility: "secret" }],
    ["a version below 1", { version: 0 }],
    ["a non-UUID client id", { clients: { added: ["nope"], removed: [] } }],
  ])("refuses %s with errors.validation", async (_name, change) => {
    const imageId = await createLibraryImage(ida);
    const input = { imageId, version: 1, visibility: "internal", priceTier: "free", clients: noClients, ...change };
    expect(await saveAccessAction(input as Parameters<typeof saveAccessAction>[0])).toEqual({ error: "errors.validation" });
    expect((await imageRow(imageId)).version).toBe(1);
  });
});

describe("publishImageAction", () => {
  it("publishes a ready draft", async () => {
    const imageId = await createLibraryImage(ida);
    expect(await publishImageAction({ imageId })).toEqual({});
    expect((await imageRow(imageId)).status).toBe("published");
  });

  it("refuses an image that is still uploading with the reason", async () => {
    const imageId = await createLibraryImage(ida, { processingState: "uploading" });
    expect(await publishImageAction({ imageId })).toEqual({ error: "errors.publishNotReady" });
  });

  it("refuses a non-UUID id with errors.validation", async () => {
    expect(await publishImageAction({ imageId: "nope" })).toEqual({ error: "errors.validation" });
  });
});
