import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { getDb } from "@/db/client";
import { licences } from "@/db/schema";
import { fixtureUsers } from "@/db/seed/fixture";
import { login, type Actor } from "@/modules/auth";
import { SESSION_COOKIE } from "@/modules/auth/cookies";
import { currentLicenceType } from "@/modules/licences";
import { createTestContact, FACTORY_PASSWORD } from "@/test/factories";
import { createLibraryImage } from "@/test/library-images";
import { loginAs } from "@/test/login-as";
import { checkOutAction } from "./actions";

// The request the guard sees, as in library/actions.test.ts.
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
let ida: Actor;
let contact: Actor & { clientId: string };
let licenceTypeId: string;

beforeAll(async () => {
  ida = (await loginAs(fixtureUsers.ida)).actor;
  const { email } = await createTestContact();
  const session = await login(email, FACTORY_PASSWORD);
  contact = session.actor as Actor & { clientId: string };
  request.cookies.set(SESSION_COOKIE, session.token);
  licenceTypeId = (await currentLicenceType(db))!.id;
});

async function paidImage(): Promise<string> {
  return createLibraryImage(ida, { status: "published", visibility: "public", priceTier: "paid", title: "Checkout action", publishedAt: new Date() });
}

function form(fields: Record<string, string | undefined>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) if (value !== undefined) data.set(name, value);
  return data;
}

function valid(imageId: string, change: Record<string, string | undefined> = {}) {
  return form({ imageId, licenceTypeId, seenPriceMinor: "9000", seenTitle: "Checkout action", terms: "accepted", ...change });
}

async function licenceCount(imageId: string): Promise<number> {
  return (await db.select({ id: licences.id }).from(licences).where(eq(licences.imageId, imageId))).length;
}

describe("checkOutAction", () => {
  it("refuses a submit without the accepted terms and records nothing", async () => {
    const imageId = await paidImage();
    expect(await checkOutAction({}, valid(imageId, { terms: undefined }))).toEqual({ error: "checkout.termsRequired" });
    expect(await licenceCount(imageId)).toBe(0);
  });

  it.each([
    ["a non-UUID image id", { imageId: "nope" }],
    ["a negative seen price", { seenPriceMinor: "-1" }],
    ["a missing seen price", { seenPriceMinor: undefined }],
    ["a malformed seen price", { seenPriceMinor: "90.5" }],
  ])("refuses %s with errors.validation and records nothing", async (_name, change) => {
    const imageId = await paidImage();
    expect(await checkOutAction({}, valid(imageId, change))).toEqual({ error: "errors.validation" });
    expect(await licenceCount(imageId)).toBe(0);
  });

  it("records the licence and redirects to its confirmation", async () => {
    const imageId = await paidImage();
    await expect(checkOutAction({}, valid(imageId))).rejects.toThrow(/^redirect:\/checkout\/confirmation\?licence=[0-9a-f-]{36}$/);
    const [row] = await db.select().from(licences).where(eq(licences.imageId, imageId));
    expect(row).toMatchObject({ clientId: contact.clientId, contactId: contact.userId, priceMinor: 9000 });
  });

  it("returns the price change with the old and new amounts, and records nothing", async () => {
    const imageId = await paidImage();
    expect(await checkOutAction({}, valid(imageId, { seenPriceMinor: "8000" }))).toEqual({
      priceChanged: { title: "Checkout action", licenceTypeId, newMinor: 9000, oldPrice: "80", newPrice: "90", newPriceLabel: "90 USD" },
    });
    expect(await licenceCount(imageId)).toBe(0);
  });
});
