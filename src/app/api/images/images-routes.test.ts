import { rm } from "node:fs/promises";
import { exiftool } from "exiftool-vendored";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "@/db/client";
import { fixtureUsers, type FixtureUser } from "@/db/seed/fixture";
import { createUploadRows } from "@/modules/images";
import { SESSION_COOKIE } from "@/modules/auth/cookies";
import { makeJpeg, useTempFileStore } from "@/test/images";
import { loginAs } from "@/test/login-as";
import { PUT } from "./[id]/file/route";
import { GET } from "./[id]/thumbnail/route";

// The request a guard sees, as in guards.test.ts: a cookie jar; forbidden() and redirect() throw.
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

const APP_ORIGIN = "http://localhost:3000";
let storeDir: string;
let savedOrigin: string | undefined;

beforeAll(async () => {
  storeDir = await useTempFileStore();
  savedOrigin = process.env.APP_ORIGIN;
  process.env.APP_ORIGIN = APP_ORIGIN;
});
beforeEach(() => request.cookies.clear());
afterAll(async () => {
  process.env.APP_ORIGIN = savedOrigin;
  await exiftool.end();
  await rm(storeDir, { recursive: true, force: true });
});

async function as(user: FixtureUser) {
  const { actor, token } = await loginAs(user);
  request.cookies.set(SESSION_COOKIE, token);
  return actor;
}

async function newRow(): Promise<string> {
  const { actor } = await loginAs(fixtureUsers.ida);
  const { images } = await createUploadRows(getDb(), actor, { filenames: ["harbour.jpg"] });
  return images[0].id;
}

function put(
  imageId: string,
  body: BodyInit,
  origin: string | null = APP_ORIGIN,
  extraHeaders: Record<string, string> = {},
): [Request, { params: Promise<{ id: string }> }] {
  const headers = new Headers({ "content-type": "application/octet-stream", ...extraHeaders });
  if (origin) headers.set("origin", origin);
  return [
    new Request(`${APP_ORIGIN}/api/images/${imageId}/file`, { method: "PUT", body, headers }),
    { params: Promise.resolve({ id: imageId }) },
  ];
}

function context(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("PUT /api/images/[id]/file", () => {
  it("is forbidden to a contact", async () => {
    const imageId = await newRow();
    await as(fixtureUsers.jonas);
    await expect(PUT(...put(imageId, new Uint8Array(await makeJpeg())))).rejects.toThrow("forbidden");
  });

  it("answers 403 to a foreign Origin, and to a missing one, without changing anything", async () => {
    const imageId = await newRow();
    await as(fixtureUsers.ida);
    for (const origin of ["http://evil.example", null]) {
      const response = await PUT(...put(imageId, new Uint8Array(await makeJpeg()), origin));
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ error: "errors.forbidden" });
    }
    // The row is still waiting for its file.
    expect((await PUT(...put(imageId, new Uint8Array(await makeJpeg())))).status).toBe(200);
  });

  it("stores the file and answers with the title and thumbnail URL", async () => {
    const imageId = await newRow();
    await as(fixtureUsers.ida);
    const response = await PUT(...put(imageId, new Uint8Array(await makeJpeg())));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ status: "ready", title: null, thumbnailUrl: `/api/images/${imageId}/thumbnail` });
  });

  it("answers a rejected file with its reason", async () => {
    const imageId = await newRow();
    await as(fixtureUsers.ida);
    const response = await PUT(...put(imageId, "notes.txt saved as x.jpg"));
    expect(response.status).toBe(415);
    expect(await response.json()).toEqual({ status: "rejected", reason: "notImage" });
  });

  it("answers 409 to a second upload for an image that is already ready", async () => {
    const imageId = await newRow();
    await as(fixtureUsers.ida);
    expect((await PUT(...put(imageId, new Uint8Array(await makeJpeg())))).status).toBe(200);
    const response = await PUT(...put(imageId, new Uint8Array(await makeJpeg())));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "errors.conflict" });
  });

  it("answers 413 tooLarge to a Content-Length over 50 MB", async () => {
    const imageId = await newRow();
    await as(fixtureUsers.ida);
    const bytes = new Uint8Array(await makeJpeg());
    const [req, ctx] = put(imageId, bytes, APP_ORIGIN, { "content-length": String(51 * 1024 * 1024) });
    expect(req.headers.get("content-length")).toBe(String(51 * 1024 * 1024));
    const response = await PUT(req, ctx);
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ status: "rejected", reason: "tooLarge" });
  });

  it("answers 404 for an id that is not a UUID", async () => {
    await as(fixtureUsers.ida);
    const response = await PUT(...put("not-a-uuid", new Uint8Array(await makeJpeg())));
    expect(response.status).toBe(404);
  });
});

describe("GET /api/images/[id]/thumbnail", () => {
  it("streams the WebP privately and never cached", async () => {
    const imageId = await newRow();
    await as(fixtureUsers.ida);
    await PUT(...put(imageId, new Uint8Array(await makeJpeg())));

    await as(fixtureUsers.per);
    const response = await GET(new Request(`${APP_ORIGIN}/api/images/${imageId}/thumbnail`), context(imageId));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(Buffer.from(await response.arrayBuffer()).subarray(8, 12).toString()).toBe("WEBP");
  });

  it("is forbidden to a contact, and 404 for an image without a file", async () => {
    const imageId = await newRow();
    await as(fixtureUsers.ida);
    expect((await GET(new Request(`${APP_ORIGIN}/api/images/${imageId}/thumbnail`), context(imageId))).status).toBe(404);
    await as(fixtureUsers.jonas);
    await expect(GET(new Request(`${APP_ORIGIN}/api/images/${imageId}/thumbnail`), context(imageId))).rejects.toThrow("forbidden");
  });
});
