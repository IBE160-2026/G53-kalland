import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "@/db/client";
import { clients } from "@/db/schema";
import { fixtureUsers, type FixtureUser } from "@/db/seed/fixture";
import { getClientDetails } from "@/modules/accounts";
import type { Actor } from "@/modules/auth";
import { SESSION_COOKIE } from "@/modules/auth/cookies";
import { createTestClient, createTestContact } from "@/test/factories";
import { loginAs } from "@/test/login-as";
import { createClientAction, setClientStatusAction, updateClientAction } from "./actions";

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
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const db = getDb();
let ida: Actor;
let idaId: string;

async function signIn(user: FixtureUser): Promise<Actor> {
  const session = await loginAs(user);
  request.cookies.set(SESSION_COOKIE, session.token);
  return session.actor;
}

beforeEach(async () => {
  ida = await signIn(fixtureUsers.ida);
  idaId = ida.userId;
});

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

function validFields(change: Record<string, string> = {}): Record<string, string> {
  return {
    nonce: crypto.randomUUID(),
    name: `Action Client ${crypto.randomUUID()}`,
    orgNumber: "921 456 786",
    billingEmail: "faktura@example.com",
    accountManagerId: idaId,
    staffNotes: "",
    ...change,
  };
}

async function clientsNamed(name: string) {
  return db.select({ id: clients.id }).from(clients).where(eq(clients.name, name));
}

// The redirect a successful save throws (mocked above), with the client id it leads to.
async function redirectOf(promise: Promise<unknown>): Promise<string> {
  const error = await promise.then(
    () => null,
    (thrown: unknown) => thrown,
  );
  const match = error instanceof Error ? /^redirect:\/clients\/([0-9a-f-]{36})$/.exec(error.message) : null;
  if (!match) throw new Error(`Expected a redirect to a client, got ${String(error)}`);
  return match[1];
}

describe("createClientAction", () => {
  it("creates the client and redirects to it", async () => {
    const fields = validFields();
    const id = await redirectOf(createClientAction({}, form(fields)));
    expect(await getClientDetails(ida, id)).toMatchObject({ name: fields.name, status: "active", orgNumber: "921456786" });
  });

  it("creates one client when the same form is submitted twice", async () => {
    const fields = validFields();
    const first = await redirectOf(createClientAction({}, form(fields)));
    const second = await redirectOf(createClientAction({}, form(fields)));
    expect(second).toBe(first);
    expect(await clientsNamed(fields.name)).toHaveLength(1);
  });

  it("gives each invalid field its own error and saves nothing", async () => {
    const fields = validFields({ name: "  ", orgNumber: "12345678", billingEmail: "foo@" });
    const state = await createClientAction({}, form(fields));
    expect(state.fieldErrors).toEqual({
      name: "clients.errors.name",
      orgNumber: "clients.errors.orgNumber",
      billingEmail: "clients.errors.billingEmail",
    });
  });

  it("refuses an org number with a wrong check digit", async () => {
    const fields = validFields({ orgNumber: "123456789" });
    expect((await createClientAction({}, form(fields))).fieldErrors).toEqual({ orgNumber: "clients.errors.orgNumber" });
    expect(await clientsNamed(fields.name)).toHaveLength(0);
  });

  it("maps the module's account-manager check to the field", async () => {
    const contact = await createTestContact();
    const fields = validFields({ accountManagerId: contact.userId });
    expect(await createClientAction({}, form(fields))).toEqual({
      fieldErrors: { accountManagerId: "clients.errors.accountManager" },
    });
    expect(await clientsNamed(fields.name)).toHaveLength(0);
  });

  it("refuses staff notes over 5000 characters with a form error and saves nothing", async () => {
    const fields = validFields({ staffNotes: "x".repeat(5001) });
    expect(await createClientAction({}, form(fields))).toEqual({ error: "errors.validation" });
    expect(await clientsNamed(fields.name)).toHaveLength(0);
  });

  it("refuses a form without a valid nonce", async () => {
    const fields = validFields({ nonce: "nope" });
    expect((await createClientAction({}, form(fields))).error).toBe("errors.validation");
    expect(await clientsNamed(fields.name)).toHaveLength(0);
  });

  it("is forbidden for a contact, who creates nothing", async () => {
    await signIn(fixtureUsers.jonas);
    const fields = validFields();
    await expect(createClientAction({}, form(fields))).rejects.toThrow("forbidden");
    expect(await clientsNamed(fields.name)).toHaveLength(0);
  });
});

describe("updateClientAction", () => {
  it("saves the new details and redirects to the client", async () => {
    const id = await createTestClient();
    const fields = validFields({ staffNotes: "Launch on 1 Dec." });
    expect(await redirectOf(updateClientAction(id, {}, form(fields)))).toBe(id);
    expect(await getClientDetails(ida, id)).toMatchObject({ name: fields.name, staffNotes: "Launch on 1 Dec." });
  });

  it("refuses invalid fields and changes nothing", async () => {
    const id = await createTestClient("Kept Name AS");
    const state = await updateClientAction(id, {}, form(validFields({ billingEmail: "foo@" })));
    expect(state.fieldErrors).toEqual({ billingEmail: "clients.errors.billingEmail" });
    expect((await getClientDetails(ida, id)).name).toBe("Kept Name AS");
  });

  it("answers an unknown client with the not-found message", async () => {
    const state = await updateClientAction("019ab0c0-0000-7000-8000-00000000dead", {}, form(validFields()));
    expect(state.error).toBe("errors.notFound");
  });
});

describe("setClientStatusAction", () => {
  it("sets a client inactive and active again", async () => {
    const id = await createTestClient();
    expect(await setClientStatusAction({}, form({ clientId: id, status: "inactive" }))).toEqual({});
    expect((await getClientDetails(ida, id)).status).toBe("inactive");
    expect(await setClientStatusAction({}, form({ clientId: id, status: "active" }))).toEqual({});
    expect((await getClientDetails(ida, id)).status).toBe("active");
  });

  it("refuses an unknown status with errors.validation", async () => {
    const id = await createTestClient();
    expect(await setClientStatusAction({}, form({ clientId: id, status: "deleted" }))).toEqual({ error: "errors.validation" });
  });

  it("is forbidden for a contact", async () => {
    const id = await createTestClient();
    await signIn(fixtureUsers.jonas);
    await expect(setClientStatusAction({}, form({ clientId: id, status: "inactive" }))).rejects.toThrow("forbidden");
    const [row] = await db.select({ status: clients.status }).from(clients).where(eq(clients.id, id));
    expect(row.status).toBe("active");
  });
});

