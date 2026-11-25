import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { fixtureUsers, type FixtureUser } from "@/db/seed/fixture";
import { getContactForStaff, getUser, listContactsForStaff } from "@/modules/accounts";
import type { Actor } from "@/modules/auth";
import { SESSION_COOKIE } from "@/modules/auth/cookies";
import { createTestClient, createTestContact } from "@/test/factories";
import { loginAs } from "@/test/login-as";
import { createContactAction, setContactStatusAction, updateContactAction } from "./contact-actions";

// The request the guard sees, as in actions.test.ts.
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

const db = getDb();
let ida: Actor;

async function signIn(user: FixtureUser): Promise<Actor> {
  const session = await loginAs(user);
  request.cookies.set(SESSION_COOKIE, session.token);
  return session.actor;
}

beforeEach(async () => {
  ida = await signIn(fixtureUsers.ida);
});

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

function validFields(change: Record<string, string> = {}): Record<string, string> {
  return { name: "Nora Dahl", email: `nora-${crypto.randomUUID()}@contact.example`, phone: "+47 912 34 567", ...change };
}

async function usersWithEmail(email: string) {
  return db.select({ id: users.id }).from(users).where(eq(users.email, email.trim().toLowerCase()));
}

// The URL of the redirect a successful save throws (mocked above).
async function redirectOf(promise: Promise<unknown>): Promise<string> {
  const error = await promise.then(
    () => null,
    (thrown: unknown) => thrown,
  );
  const match = error instanceof Error ? /^redirect:(.*)$/.exec(error.message) : null;
  if (!match) throw new Error(`Expected a redirect, got ${String(error)}`);
  return match[1];
}

describe("createContactAction", () => {
  it("creates the contact and redirects to its client", async () => {
    const clientId = await createTestClient();
    const fields = validFields();
    expect(await redirectOf(createContactAction(clientId, {}, form(fields)))).toBe(`/clients/${clientId}`);
    expect(await listContactsForStaff(ida, clientId)).toEqual([
      expect.objectContaining({ name: "Nora Dahl", email: fields.email, phone: "+47 912 34 567", status: "active" }),
    ]);
  });

  it("gives each invalid field its own error and saves nothing", async () => {
    const clientId = await createTestClient();
    const state = await createContactAction(clientId, {}, form({ name: "  ", email: "foo@", phone: "abc" }));
    expect(state.fieldErrors).toEqual({
      name: "contacts.errors.name",
      email: "contacts.errors.email",
      phone: "contacts.errors.phone",
    });
    expect(await listContactsForStaff(ida, clientId)).toEqual([]);
  });

  it("shows a staff user's email, in another case with spaces, as a duplicate on the email field", async () => {
    const clientId = await createTestClient();
    const state = await createContactAction(clientId, {}, form(validFields({ email: `  ${fixtureUsers.ida.email.toUpperCase()} ` })));
    expect(state).toEqual({ fieldErrors: { email: "contacts.errors.emailTaken" } });
    expect(await listContactsForStaff(ida, clientId)).toEqual([]);
  });

  it("creates one contact when the same form is submitted twice", async () => {
    const clientId = await createTestClient();
    const fields = validFields();
    await redirectOf(createContactAction(clientId, {}, form(fields)));
    expect(await createContactAction(clientId, {}, form(fields))).toEqual({ fieldErrors: { email: "contacts.errors.emailTaken" } });
    expect(await usersWithEmail(fields.email)).toHaveLength(1);
  });

  it("answers an unknown or malformed client with the not-found message", async () => {
    expect((await createContactAction("019ab0c0-0000-7000-8000-00000000dead", {}, form(validFields()))).error).toBe("errors.notFound");
    expect((await createContactAction("not-a-uuid", {}, form(validFields()))).error).toBe("errors.notFound");
  });

  it("is forbidden for a contact, who creates nothing", async () => {
    const clientId = await createTestClient();
    await signIn(fixtureUsers.jonas);
    const fields = validFields();
    await expect(createContactAction(clientId, {}, form(fields))).rejects.toThrow("forbidden");
    expect(await usersWithEmail(fields.email)).toHaveLength(0);
  });
});

describe("updateContactAction", () => {
  it("saves the new values and redirects to the client", async () => {
    const contact = await createTestContact();
    const fields = validFields({ phone: "" });
    expect(await redirectOf(updateContactAction(contact.clientId, contact.userId, {}, form(fields)))).toBe(`/clients/${contact.clientId}`);
    expect(await getContactForStaff(ida, contact.userId)).toMatchObject({ id: contact.userId, email: fields.email, phone: null });
  });

  it("refuses another contact's email and changes nothing", async () => {
    const contact = await createTestContact();
    const state = await updateContactAction(contact.clientId, contact.userId, {}, form(validFields({ email: fixtureUsers.jonas.email })));
    expect(state).toEqual({ fieldErrors: { email: "contacts.errors.emailTaken" } });
    expect((await getContactForStaff(ida, contact.userId)).email).toBe(contact.email);
  });

  it("refuses a contact of another client with the not-found message and changes nothing", async () => {
    const contact = await createTestContact();
    const otherClientId = await createTestClient();
    expect(await updateContactAction(otherClientId, contact.userId, {}, form(validFields()))).toEqual({ error: "errors.notFound" });
    expect(await getContactForStaff(ida, contact.userId)).toMatchObject({ name: "Factory Contact", email: contact.email });
  });

  it("answers a staff user's id with the not-found message", async () => {
    const clientId = await createTestClient();
    expect((await updateContactAction(clientId, ida.userId, {}, form(validFields()))).error).toBe("errors.notFound");
  });
});

describe("setContactStatusAction", () => {
  it("deactivates a contact and reactivates it", async () => {
    const contact = await createTestContact();
    expect(await setContactStatusAction({}, form({ contactId: contact.userId, status: "inactive" }))).toEqual({});
    expect((await getUser(contact.userId)).status).toBe("inactive");
    expect(await setContactStatusAction({}, form({ contactId: contact.userId, status: "active" }))).toEqual({});
    expect((await getUser(contact.userId)).status).toBe("active");
  });

  it("refuses an unknown status, and a staff user's id is not found", async () => {
    const contact = await createTestContact();
    expect(await setContactStatusAction({}, form({ contactId: contact.userId, status: "deleted" }))).toEqual({ error: "errors.validation" });
    expect(await setContactStatusAction({}, form({ contactId: ida.userId, status: "inactive" }))).toEqual({ error: "errors.notFound" });
    expect((await getUser(ida.userId)).status).toBe("active");
  });

  it("is forbidden for a contact", async () => {
    const contact = await createTestContact();
    await signIn(fixtureUsers.jonas);
    await expect(setContactStatusAction({}, form({ contactId: contact.userId, status: "inactive" }))).rejects.toThrow("forbidden");
    expect((await getUser(contact.userId)).status).toBe("active");
  });
});
