import { inArray, like } from "drizzle-orm";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { getDb } from "@/db/client";
import { images } from "@/db/schema";
import { fixtureUsers } from "@/db/seed/fixture";
import { SESSION_COOKIE } from "@/modules/auth/cookies";
import { loginAs } from "@/test/login-as";
import { startUpload } from "./actions";

// The request the guard sees, as in images-routes.test.ts.
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

const db = getDb();

beforeAll(async () => {
  request.cookies.set(SESSION_COOKIE, (await loginAs(fixtureUsers.ida)).token);
});

function unique(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

async function rowsNamed(...names: string[]) {
  return db.select({ filename: images.filename }).from(images).where(inArray(images.filename, names));
}

describe("startUpload", () => {
  it("stores a file name with its control characters stripped", async () => {
    const name = unique("harbour");
    const result = await startUpload({ filenames: [`${name}\u0007\u0000.jpg`] });
    expect(result).toMatchObject({ ok: true, images: [{ filename: `${name}.jpg` }] });
    expect(await rowsNamed(`${name}.jpg`)).toHaveLength(1);
  });

  it.each([
    ["a name that is empty once stripped", () => ({ names: [""], input: { filenames: ["\u0007\u0000"] } })],
    ["a 256-character name", () => {
      const name = unique("long").padEnd(256, "x");
      return { names: [name], input: { filenames: [name] } };
    }],
    ["no names", () => ({ names: [], input: { filenames: [] } })],
    ["a non-UUID batch id", () => {
      const name = unique("batch");
      return { names: [name], input: { batchId: "not-a-uuid", filenames: [name] } };
    }],
  ])("refuses %s with errors.validation and creates no rows", async (_name, make) => {
    const { names, input } = make();
    expect(await startUpload(input)).toEqual({ ok: false, error: "errors.validation" });
    if (names.length > 0) expect(await rowsNamed(...names)).toEqual([]);
  });

  it("refuses 501 names with errors.validation and creates no rows", async () => {
    const prefix = unique("many");
    const filenames = Array.from({ length: 501 }, (_, i) => `${prefix}-${i}.jpg`);
    expect(await startUpload({ filenames })).toEqual({ ok: false, error: "errors.validation" });
    expect(await db.select().from(images).where(like(images.filename, `${prefix}-%`))).toEqual([]);
  });
});
