import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { getDb } from "@/db/client";
import { clients, users } from "@/db/schema";
import { fixtureClients, fixtureUsers } from "@/db/seed/fixture";
import { login, resolveSession, type Actor } from "@/modules/auth";
import { Conflict, Forbidden, NotFound, Validation } from "@/modules/shared/errors";
import { createTestClient, createTestContact, createTestStaff, FACTORY_PASSWORD } from "@/test/factories";
import { loginAs } from "@/test/login-as";
import * as accounts from ".";
import {
  createClientAsStaff,
  createUser,
  getClient,
  getClientDetails,
  getUser,
  listActiveClients,
  listActiveStaff,
  listClientsForStaff,
  setClientStatus,
  setUserStatus,
  updateClient,
  type ClientInput,
} from ".";

const db = getDb();

describe("status changes need a staff Actor", () => {
  it("throw Forbidden for a contact Actor and change nothing", async () => {
    const { actor: contact } = await loginAs(fixtureUsers.jonas);
    const target = await createTestContact();
    await expect(setUserStatus(db, contact, target.userId, "inactive")).rejects.toBeInstanceOf(Forbidden);
    await expect(setClientStatus(db, contact, target.clientId, "inactive")).rejects.toBeInstanceOf(Forbidden);
    expect((await getUser(target.userId)).status).toBe("active");
  });

  it("succeed for a staff Actor", async () => {
    const { actor: staff } = await loginAs(fixtureUsers.ida);
    const target = await createTestContact();
    await setUserStatus(db, staff, target.userId, "inactive");
    expect((await getUser(target.userId)).status).toBe("inactive");
  });

  it("throw NotFound for an unknown id", async () => {
    const { actor: staff } = await loginAs(fixtureUsers.ida);
    const unknown = "019ab0c0-0000-7000-8000-00000000dead";
    await expect(setUserStatus(db, staff, unknown, "inactive")).rejects.toBeInstanceOf(NotFound);
    await expect(setClientStatus(db, staff, unknown, "inactive")).rejects.toBeInstanceOf(NotFound);
  });
});

describe("createUser", () => {
  it("stores the email trimmed and lower-cased", async () => {
    const clientId = await createTestClient();
    const email = `  Mixed.Case-${crypto.randomUUID()}@Factory.Example `;
    const userId = await createUser(db, { role: "contact", clientId, name: "Case Test", email });
    const [row] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
    expect(row.email).toBe(email.trim().toLowerCase());
  });

  it("throws Conflict for an email that exists in another letter case", async () => {
    const email = fixtureUsers.ida.email.toUpperCase();
    await expect(createUser(db, { role: "staff", name: "Duplicate", email })).rejects.toEqual(
      new Conflict("accounts.emailTaken"),
    );
  });
});

describe("getClient", () => {
  it("returns the contact's own client for the client shell", async () => {
    const { actor } = await loginAs(fixtureUsers.jonas);
    if (actor.role !== "contact") throw new Error("Jonas is a contact");
    expect(await getClient(actor.clientId)).toEqual({
      id: actor.clientId,
      name: fixtureClients.fjordkaffe.name,
      status: "active",
    });
  });

  it("throws NotFound for an unknown id", async () => {
    await expect(getClient("019ab0c0-0000-7000-8000-00000000dead")).rejects.toBeInstanceOf(NotFound);
  });
});

describe("listActiveClients", () => {
  it("lists active clients by name and leaves inactive ones out", async () => {
    const { actor: staff } = await loginAs(fixtureUsers.ida);
    const suffix = crypto.randomUUID();
    const bravo = await createTestClient(`Bravo ${suffix}`);
    const alpha = await createTestClient(`Alpha ${suffix}`);
    const inactive = await createTestClient(`Inactive ${suffix}`);
    await setClientStatus(db, staff, inactive, "inactive");

    const listed = await listActiveClients();
    const ids = listed.map((client) => client.id);
    expect(listed).toContainEqual({ id: alpha, name: `Alpha ${suffix}` });
    expect(ids.indexOf(alpha)).toBeLessThan(ids.indexOf(bravo));
    expect(ids).not.toContain(inactive);
    expect(listed.map((client) => client.name)).not.toContain(fixtureClients.gammelKunde.name);
  });
});

// Story 2.1: staff create and manage clients.
async function staffActor(): Promise<Actor> {
  return (await loginAs(fixtureUsers.ida)).actor;
}

async function validInput(change: Partial<ClientInput> = {}): Promise<ClientInput> {
  const ida = await getUserByEmail(fixtureUsers.ida.email);
  return {
    name: `Client ${crypto.randomUUID()}`,
    orgNumber: "921 456 786",
    billingEmail: "  Faktura@Example.COM ",
    accountManagerId: ida,
    staffNotes: "Prefers photos with people in them.",
    ...change,
  };
}

async function getUserByEmail(email: string): Promise<string> {
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  return row.id;
}

async function clientsNamed(name: string) {
  return db.select().from(clients).where(eq(clients.name, name));
}

describe("createClientAsStaff", () => {
  it("creates an active client with the details normalised", async () => {
    const staff = await staffActor();
    const input = await validInput();
    const id = await createClientAsStaff(db, staff, input, crypto.randomUUID());
    expect(await getClientDetails(staff, id)).toMatchObject({
      id,
      name: input.name,
      status: "active",
      orgNumber: "921456786",
      billingEmail: "faktura@example.com",
      accountManagerId: input.accountManagerId,
      accountManagerName: fixtureUsers.ida.name,
      staffNotes: "Prefers photos with people in them.",
    });
  });

  it("stores no org number when it is left empty", async () => {
    const staff = await staffActor();
    const id = await createClientAsStaff(db, staff, await validInput({ orgNumber: "  " }), crypto.randomUUID());
    expect((await getClientDetails(staff, id)).orgNumber).toBeNull();
  });

  it("creates one client for the same nonce and returns its id twice", async () => {
    const staff = await staffActor();
    const input = await validInput();
    const nonce = crypto.randomUUID();
    const first = await createClientAsStaff(db, staff, input, nonce);
    const second = await createClientAsStaff(db, staff, input, nonce);
    expect(second).toBe(first);
    expect(await clientsNamed(input.name)).toHaveLength(1);
  });

  it("creates one client for two parallel submits with the same nonce", async () => {
    const staff = await staffActor();
    const input = await validInput();
    const nonce = crypto.randomUUID();
    const [a, b] = await Promise.all([
      db.transaction((tx) => createClientAsStaff(tx, staff, input, nonce)),
      db.transaction((tx) => createClientAsStaff(tx, staff, input, nonce)),
    ]);
    expect(a).toBe(b);
    expect(await clientsNamed(input.name)).toHaveLength(1);
  });

  it.each([
    ["eight digits", "12345678"],
    ["a wrong check digit", "123456789"],
    ["letters", "92145678A"],
  ])("refuses an org number with %s and saves nothing", async (_name, orgNumber) => {
    const staff = await staffActor();
    const input = await validInput({ orgNumber });
    await expect(createClientAsStaff(db, staff, input, crypto.randomUUID())).rejects.toEqual(
      new Validation("clients.errors.orgNumber"),
    );
    expect(await clientsNamed(input.name)).toHaveLength(0);
  });

  it("accepts a seeded client's org number written with spaces", async () => {
    const staff = await staffActor();
    const orgNumber = fixtureClients.fjordkaffe.orgNumber.replace(/^(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3");
    const id = await createClientAsStaff(db, staff, await validInput({ orgNumber }), crypto.randomUUID());
    expect((await getClientDetails(staff, id)).orgNumber).toBe(fixtureClients.fjordkaffe.orgNumber);
  });

  it.each([
    ["an empty name", { name: "   " }, "clients.errors.name"],
    ["an invalid billing email", { billingEmail: "foo@" }, "clients.errors.billingEmail"],
    ["an account manager id that is not a UUID", { accountManagerId: "nope" }, "clients.errors.accountManager"],
  ])("refuses %s with its field key", async (_name, change, key) => {
    const staff = await staffActor();
    await expect(createClientAsStaff(db, staff, await validInput(change), crypto.randomUUID())).rejects.toEqual(
      new Validation(key),
    );
  });

  it("refuses a contact as account manager", async () => {
    const staff = await staffActor();
    const contact = await createTestContact();
    const input = await validInput({ accountManagerId: contact.userId });
    await expect(createClientAsStaff(db, staff, input, crypto.randomUUID())).rejects.toEqual(
      new Validation("clients.errors.accountManager"),
    );
    expect(await clientsNamed(input.name)).toHaveLength(0);
  });

  it("refuses an inactive staff user as account manager", async () => {
    const staff = await staffActor();
    const inactive = await createTestStaff();
    await setUserStatus(db, staff, inactive, "inactive");
    const input = await validInput({ accountManagerId: inactive });
    await expect(createClientAsStaff(db, staff, input, crypto.randomUUID())).rejects.toEqual(
      new Validation("clients.errors.accountManager"),
    );
    expect(await clientsNamed(input.name)).toHaveLength(0);
  });
});

describe("updateClient", () => {
  it("replaces the details and keeps the status", async () => {
    const staff = await staffActor();
    const id = await createTestClient();
    await setClientStatus(db, staff, id, "inactive");
    const per = await getUserByEmail(fixtureUsers.per.email);
    const input = await validInput({ orgNumber: "", accountManagerId: per, staffNotes: "" });
    await updateClient(db, staff, id, input);
    expect(await getClientDetails(staff, id)).toMatchObject({
      name: input.name,
      status: "inactive",
      orgNumber: null,
      accountManagerName: fixtureUsers.per.name,
      staffNotes: "",
    });
  });

  it("refuses invalid input and changes nothing", async () => {
    const staff = await staffActor();
    const id = await createTestClient("Unchanged Client AS");
    await expect(updateClient(db, staff, id, await validInput({ orgNumber: "123456789" }))).rejects.toBeInstanceOf(Validation);
    expect((await getClientDetails(staff, id)).name).toBe("Unchanged Client AS");
  });

  it("throws NotFound for an unknown id", async () => {
    const staff = await staffActor();
    await expect(updateClient(db, staff, "019ab0c0-0000-7000-8000-00000000dead", await validInput())).rejects.toBeInstanceOf(NotFound);
  });
});

describe("client reads for staff", () => {
  it("list every client newest first, inactive ones included, with the contact count", async () => {
    const staff = await staffActor();
    const older = await createTestClient(`Older ${crypto.randomUUID()}`);
    const newer = await createTestClient(`Newer ${crypto.randomUUID()}`);
    await createTestContact(newer);
    await createTestContact(newer);
    await setClientStatus(db, staff, older, "inactive");

    const listed = await listClientsForStaff(staff);
    const ids = listed.map((client) => client.id);
    expect(ids.indexOf(newer)).toBeLessThan(ids.indexOf(older));
    expect(listed.find((client) => client.id === newer)).toMatchObject({ status: "active", contactCount: 2 });
    expect(listed.find((client) => client.id === older)).toMatchObject({ status: "inactive", contactCount: 0 });
    expect(listed.map((client) => client.name)).toContain(fixtureClients.gammelKunde.name);
  });

  it("show a seeded client's details, with Ida as account manager", async () => {
    const staff = await staffActor();
    const { actor: jonas } = await loginAs(fixtureUsers.jonas);
    if (jonas.role !== "contact") throw new Error("Jonas is a contact");
    expect(await getClientDetails(staff, jonas.clientId)).toMatchObject({
      name: fixtureClients.fjordkaffe.name,
      orgNumber: fixtureClients.fjordkaffe.orgNumber,
      billingEmail: fixtureClients.fjordkaffe.billingEmail,
      accountManagerName: fixtureUsers.ida.name,
    });
  });

  it("getClientDetails throws NotFound for an unknown id", async () => {
    await expect(getClientDetails(await staffActor(), "019ab0c0-0000-7000-8000-00000000dead")).rejects.toBeInstanceOf(NotFound);
  });

  it("listActiveStaff lists active staff users only", async () => {
    const staff = await staffActor();
    const inactive = await createTestStaff(`Inactive ${crypto.randomUUID()}`);
    await setUserStatus(db, staff, inactive, "inactive");
    const listed = await listActiveStaff();
    const names = listed.map((user) => user.name);
    expect(names).toEqual(expect.arrayContaining([fixtureUsers.ida.name, fixtureUsers.per.name]));
    expect(listed.map((user) => user.id)).not.toContain(inactive);
    expect(names).not.toContain(fixtureUsers.jonas.name);
  });
});

describe("client functions need a staff Actor", () => {
  it("throw Forbidden for a contact Actor and create or change nothing", async () => {
    const { actor: contact } = await loginAs(fixtureUsers.jonas);
    const input = await validInput();
    const target = await createTestClient("Untouched Client AS");
    await expect(createClientAsStaff(db, contact, input, crypto.randomUUID())).rejects.toBeInstanceOf(Forbidden);
    await expect(updateClient(db, contact, target, input)).rejects.toBeInstanceOf(Forbidden);
    await expect(listClientsForStaff(contact)).rejects.toBeInstanceOf(Forbidden);
    await expect(getClientDetails(contact, target)).rejects.toBeInstanceOf(Forbidden);
    expect(await clientsNamed(input.name)).toHaveLength(0);
    expect((await getClient(target)).name).toBe("Untouched Client AS");
  });
});

describe("setting a client inactive (S2)", () => {
  it("refuses its logged-in contact on the next request, and setting it active lets them log in again", async () => {
    const staff = await staffActor();
    const contact = await createTestContact();
    const { token } = await login(contact.email, FACTORY_PASSWORD);
    expect((await resolveSession(token, new Date())).status).toBe("active");

    await setClientStatus(db, staff, contact.clientId, "inactive");
    expect((await resolveSession(token, new Date())).status).toBe("inactive");
    await expect(login(contact.email, FACTORY_PASSWORD)).rejects.toEqual(new Forbidden("login.inactive"));

    await setClientStatus(db, staff, contact.clientId, "active");
    const again = await login(contact.email, FACTORY_PASSWORD);
    expect((await resolveSession(again.token, new Date())).status).toBe("active");
  });
});

it("no accounts function deletes or removes anything (S10)", () => {
  expect(Object.keys(accounts).filter((name) => /delete|remove/i.test(name))).toEqual([]);
});
