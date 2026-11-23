import { rm } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { exiftool } from "exiftool-vendored";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "@/db/client";
import { imageClients, images } from "@/db/schema";
import { fixtureUsers, type FixtureUser } from "@/db/seed/fixture";
import { PLACEHOLDER_OUTPUT } from "@/modules/ai/providers/mock";
import { createUploadRows } from "@/modules/images";
import { SESSION_COOKIE } from "@/modules/auth/cookies";
import { makeJpeg, useTempFileStore } from "@/test/images";
import { loginAs } from "@/test/login-as";
import { PUT } from "./[id]/file/route";
import { GET as getPreview } from "./[id]/preview/route";
import { GET as getThumbnail } from "./[id]/thumbnail/route";

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

async function newRow(filename = "harbour.jpg"): Promise<string> {
  const { actor } = await loginAs(fixtureUsers.ida);
  const { images } = await createUploadRows(getDb(), actor, { filenames: [filename] });
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

  it("stores the file, generates its metadata and answers ready with the AI title and thumbnail URL", async () => {
    const imageId = await newRow();
    await as(fixtureUsers.ida);
    const response = await PUT(...put(imageId, new Uint8Array(await makeJpeg())));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({
      status: "ready",
      title: PLACEHOLDER_OUTPUT.title,
      thumbnailUrl: `/api/images/${imageId}/thumbnail`,
    });
  });

  it("answers failed with 200 when generation fails, since the file was stored", async () => {
    const imageId = await newRow("fail-boat.jpg");
    await as(fixtureUsers.ida);
    const response = await PUT(...put(imageId, new Uint8Array(await makeJpeg())));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "failed", title: null, thumbnailUrl: `/api/images/${imageId}/thumbnail` });
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

type FileRoute = (request: Request, context: { params: Promise<{ id: string }> }) => Promise<Response>;

const FILE_ROUTES: [string, FileRoute][] = [
  ["thumbnail", getThumbnail as FileRoute],
  ["preview", getPreview as FileRoute],
];

function get(route: FileRoute, imageId: string, kind: string) {
  return route(new Request(`${APP_ORIGIN}/api/images/${imageId}/${kind}`), context(imageId));
}

// An uploaded image (a real file) in the given access state, restricted to the clients of `listedFor`.
async function uploadedImage(state: Partial<typeof images.$inferInsert> = {}, listedFor: FixtureUser[] = []): Promise<string> {
  const imageId = await newRow();
  await as(fixtureUsers.ida);
  await PUT(...put(imageId, new Uint8Array(await makeJpeg())));
  if (Object.keys(state).length > 0) await getDb().update(images).set(state).where(eq(images.id, imageId));
  for (const contact of listedFor) {
    const { actor } = await loginAs(contact);
    await getDb().insert(imageClients).values({ imageId, clientId: actor.clientId! });
  }
  return imageId;
}

describe.each(FILE_ROUTES)("GET /api/images/[id]/%s", (kind, route) => {
  it("streams the WebP to staff, privately and never cached", async () => {
    const imageId = await uploadedImage();
    await as(fixtureUsers.per);
    const response = await get(route, imageId, kind);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(Buffer.from(await response.arrayBuffer()).subarray(8, 12).toString()).toBe("WEBP");
  });

  it("answers staff 404 for an image without a file and for an id that is not a UUID", async () => {
    const imageId = await newRow();
    await as(fixtureUsers.ida);
    expect((await get(route, imageId, kind)).status).toBe(404);
    expect((await get(route, "not-a-uuid", kind)).status).toBe(404);
  });

  it("streams the WebP to a contact whose client may see the image, privately and never cached", async () => {
    const imageId = await uploadedImage({ status: "published", visibility: "restricted", publishedAt: new Date() }, [fixtureUsers.jonas]);
    await as(fixtureUsers.jonas);
    const response = await get(route, imageId, kind);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(Buffer.from(await response.arrayBuffer()).subarray(8, 12).toString()).toBe("WEBP");
  });

  it("answers a contact 404, never 403, for an image their client may not see", async () => {
    const restricted = await uploadedImage({ status: "published", visibility: "restricted", publishedAt: new Date() }, [fixtureUsers.emil]);
    const draft = await uploadedImage({ status: "draft", visibility: "public" });
    // Visible (published, public) but without a file.
    const noFile = await newRow();
    await getDb().update(images).set({ status: "published", visibility: "public", publishedAt: new Date() }).where(eq(images.id, noFile));
    await as(fixtureUsers.jonas);
    for (const imageId of [restricted, draft, noFile, crypto.randomUUID(), "not-a-uuid"]) {
      const response = await get(route, imageId, kind);
      expect(response.status).toBe(404);
      expect(response.headers.get("cache-control")).toBe("private, no-store");
      expect(await response.json()).toEqual({ error: "errors.notFound" });
    }
  });

  it("sends a request without a session to Login", async () => {
    const imageId = await uploadedImage({ status: "published", visibility: "public", publishedAt: new Date() });
    request.cookies.clear();
    await expect(get(route, imageId, kind)).rejects.toThrow(/^redirect:\/login/);
  });
});
