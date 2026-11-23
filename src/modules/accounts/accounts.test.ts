import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { fixtureClients, fixtureUsers } from "@/db/seed/fixture";
import { Conflict, Forbidden, NotFound } from "@/modules/shared/errors";
import { createTestClient, createTestContact } from "@/test/factories";
import { loginAs } from "@/test/login-as";
import { createUser, getClient, getUser, setClientStatus, setUserStatus } from ".";

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
