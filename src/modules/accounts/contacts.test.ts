import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/db/client";
import { licences, setupLinks, users } from "@/db/schema";
import { fixtureUsers } from "@/db/seed/fixture";
import { isSetupLinkValid, login, resolveSession, SETUP_LINK_TTL_MS, type Actor } from "@/modules/auth";
import { currentLicenceType, grantLicence } from "@/modules/licences";
import { Forbidden, NotFound, Validation } from "@/modules/shared/errors";
import { createTestClient, createTestContact, FACTORY_PASSWORD } from "@/test/factories";
import { createLibraryImage } from "@/test/library-images";
import { loginAs } from "@/test/login-as";
import * as accounts from ".";
import {
  createContact,
  getContactForStaff,
  getUser,
  listContactsForStaff,
  newContactSetupLink,
  setClientStatus,
  setContactStatus,
  updateContact,
  type ContactInput,
} from ".";

// Story 2.2: staff add and manage contacts (FR-2, FR-5, S1).
const db = getDb();
const UNKNOWN = "019ab0c0-0000-7000-8000-00000000dead";
let staff: Actor;

beforeAll(async () => {
  staff = (await loginAs(fixtureUsers.ida)).actor;
});

function input(change: Partial<ContactInput> = {}): ContactInput {
  return { name: "Nora Dahl", email: `nora-${crypto.randomUUID()}@contact.example`, phone: "", ...change };
}

async function usersWithEmail(email: string) {
  return db.select({ id: users.id }).from(users).where(eq(users.email, email.trim().toLowerCase()));
}

// Setup links of a client's users. Other test files run at the same time, so never count all links.
async function linkCountOfClient(clientId: string): Promise<number> {
  const rows = await db.select({ id: setupLinks.id }).from(setupLinks).innerJoin(users, eq(users.id, setupLinks.userId)).where(eq(users.clientId, clientId));
  return rows.length;
}

// The token at the end of a setup link's URL.
function tokenOf(url: string): string {
  const match = /^http[^ ]*\/setup\/([A-Za-z0-9_-]{43})$/.exec(url);
  if (!match) throw new Error(`Not a setup link: ${url}`);
  return match[1];
}

describe("createContact", () => {
  it("creates an active contact of the client with the values normalised", async () => {
    const clientId = await createTestClient();
    const email = `  Nora.${crypto.randomUUID()}@Contact.EXAMPLE `;
    const { contactId: id } = await createContact(db, staff, clientId, input({ name: "  Nora Dahl ", email, phone: " +47 (912) 34-567 " }));
    expect(await getContactForStaff(staff, id)).toEqual({
      id,
      clientId,
      name: "Nora Dahl",
      email: email.trim().toLowerCase(),
      phone: "+47 (912) 34-567",
      status: "active",
    });
    expect((await getUser(id)).role).toBe("contact");
  });

  it("creates the contact's first setup link in the same transaction (FR-4)", async () => {
    const clientId = await createTestClient();
    const before = Date.now();
    const { contactId, link } = await createContact(db, staff, clientId, input());
    expect(link.url.startsWith(`${new URL(process.env.APP_ORIGIN!).origin}/setup/`)).toBe(true);
    expect(await isSetupLinkValid(tokenOf(link.url))).toBe(true);
    expect(link.expiresAt.getTime() - before).toBeGreaterThanOrEqual(SETUP_LINK_TTL_MS);
    const rows = await db.select().from(setupLinks).where(eq(setupLinks.userId, contactId));
    expect(rows).toHaveLength(1);
  });

  it("stores an empty phone as null", async () => {
    const clientId = await createTestClient();
    const { contactId: id } = await createContact(db, staff, clientId, input({ phone: "   " }));
    expect((await getContactForStaff(staff, id)).phone).toBeNull();
  });

  it("adds a contact to an inactive client", async () => {
    const clientId = await createTestClient();
    await setClientStatus(db, staff, clientId, "inactive");
    const { contactId: id } = await createContact(db, staff, clientId, input());
    expect((await getContactForStaff(staff, id)).clientId).toBe(clientId);
  });

  it.each([
    ["a staff user's email in another case with spaces", `  ${fixtureUsers.ida.email.toUpperCase()} `],
    ["another contact's email", fixtureUsers.jonas.email],
  ])("refuses %s as a duplicate and saves nothing", async (_name, email) => {
    const clientId = await createTestClient();
    await expect(createContact(db, staff, clientId, input({ email, name: "Duplicate" }))).rejects.toEqual(
      new Validation("contacts.errors.emailTaken"),
    );
    expect(await usersWithEmail(email)).toHaveLength(1);
    expect(await listContactsForStaff(staff, clientId)).toEqual([]);
  });

  it("makes no setup link for a duplicate email, and leaves the caller's transaction usable", async () => {
    const clientId = await createTestClient();
    await db.transaction(async (tx) => {
      await expect(createContact(tx, staff, clientId, input({ email: fixtureUsers.jonas.email }))).rejects.toEqual(
        new Validation("contacts.errors.emailTaken"),
      );
      await createContact(tx, staff, clientId, input());
    });
    expect(await linkCountOfClient(clientId)).toBe(1);
    expect(await listContactsForStaff(staff, clientId)).toHaveLength(1);
  });

  it("creates one user for a double submit; the second is refused as a duplicate", async () => {
    const clientId = await createTestClient();
    const values = input();
    await createContact(db, staff, clientId, values);
    await expect(createContact(db, staff, clientId, values)).rejects.toEqual(new Validation("contacts.errors.emailTaken"));
    expect(await usersWithEmail(values.email)).toHaveLength(1);
  });

  it.each([
    ["an empty name", { name: "  " }, "contacts.errors.name"],
    ["a name over 200 characters", { name: "x".repeat(201) }, "contacts.errors.name"],
    ["an invalid email", { email: "foo@" }, "contacts.errors.email"],
    ["a phone with letters", { phone: "abc12" }, "contacts.errors.phone"],
    ["a phone under 5 characters", { phone: "1234" }, "contacts.errors.phone"],
    ["a phone over 30 characters", { phone: "1".repeat(31) }, "contacts.errors.phone"],
  ])("refuses %s with its field key and saves nothing", async (_name, change, key) => {
    const clientId = await createTestClient();
    await expect(createContact(db, staff, clientId, input(change))).rejects.toEqual(new Validation(key));
    expect(await listContactsForStaff(staff, clientId)).toEqual([]);
  });

  it("throws NotFound for an unknown or malformed client id", async () => {
    await expect(createContact(db, staff, UNKNOWN, input())).rejects.toBeInstanceOf(NotFound);
    await expect(createContact(db, staff, "not-a-uuid", input())).rejects.toBeInstanceOf(NotFound);
  });
});

describe("updateContact", () => {
  it("changes the email and keeps the user id, client and licence; the new email logs in, the old one fails", async () => {
    const contact = await createTestContact();
    const contactActor: Actor = { userId: contact.userId, role: "contact", clientId: contact.clientId };
    const imageId = await createLibraryImage(staff, {
      status: "published",
      visibility: "public",
      priceTier: "paid",
      title: `Contact licence ${crypto.randomUUID()}`,
      publishedAt: new Date(),
    });
    const type = (await currentLicenceType(db))!;
    const { licence } = await grantLicence(db, contactActor, {
      imageId,
      source: "purchase",
      licenceTypeId: type.id,
      priceMinor: type.priceMinor,
      currency: type.currency,
    });

    const newEmail = `renamed-${crypto.randomUUID()}@contact.example`;
    await updateContact(db, staff, contact.userId, { name: "Factory Contact", email: ` ${newEmail.toUpperCase()} `, phone: "" });

    expect(await getContactForStaff(staff, contact.userId)).toMatchObject({
      id: contact.userId,
      clientId: contact.clientId,
      email: newEmail,
      status: "active",
    });
    const [row] = await db.select().from(licences).where(eq(licences.id, licence.id));
    expect(row).toMatchObject({ contactId: contact.userId, clientId: contact.clientId, revokedAt: null });
    expect((await login(newEmail, FACTORY_PASSWORD)).actor.userId).toBe(contact.userId);
    await expect(login(contact.email, FACTORY_PASSWORD)).rejects.toEqual(new Validation("login.incorrect"));
  });

  it("keeps its own email in another letter case", async () => {
    const contact = await createTestContact();
    await updateContact(db, staff, contact.userId, { name: "Renamed", email: contact.email.toUpperCase(), phone: "+47 22 33 44 55" });
    expect(await getContactForStaff(staff, contact.userId)).toMatchObject({ name: "Renamed", email: contact.email, phone: "+47 22 33 44 55" });
  });

  it("refuses another user's email and changes nothing", async () => {
    const contact = await createTestContact();
    await expect(
      updateContact(db, staff, contact.userId, { name: "Changed", email: ` ${fixtureUsers.per.email.toUpperCase()}`, phone: "" }),
    ).rejects.toEqual(new Validation("contacts.errors.emailTaken"));
    expect(await getContactForStaff(staff, contact.userId)).toMatchObject({ name: "Factory Contact", email: contact.email });
  });

  it("refuses invalid input and changes nothing", async () => {
    const contact = await createTestContact();
    await expect(updateContact(db, staff, contact.userId, input({ phone: "abc" }))).rejects.toEqual(
      new Validation("contacts.errors.phone"),
    );
    expect((await getContactForStaff(staff, contact.userId)).email).toBe(contact.email);
  });

  it("throws NotFound for a staff user's id, an unknown id and a malformed id", async () => {
    const ida = await getUser(staff.userId);
    for (const id of [staff.userId, UNKNOWN, "not-a-uuid"]) {
      await expect(updateContact(db, staff, id, input())).rejects.toBeInstanceOf(NotFound);
    }
    expect(await getUser(staff.userId)).toEqual(ida);
  });
});

describe("setContactStatus", () => {
  it("refuses a logged-in contact on the next request (S1), and reactivating lets them log in again", async () => {
    const contact = await createTestContact();
    const { token } = await login(contact.email, FACTORY_PASSWORD);
    expect((await resolveSession(token, new Date())).status).toBe("active");

    await setContactStatus(db, staff, contact.userId, "inactive");
    expect((await resolveSession(token, new Date())).status).toBe("inactive");
    await expect(login(contact.email, FACTORY_PASSWORD)).rejects.toEqual(new Forbidden("login.inactive"));

    await setContactStatus(db, staff, contact.userId, "active");
    const again = await login(contact.email, FACTORY_PASSWORD);
    expect((await resolveSession(again.token, new Date())).status).toBe("active");
  });

  it("keeps the contact and its licences: nothing is deleted (FR-24)", async () => {
    const contact = await createTestContact();
    const contactActor: Actor = { userId: contact.userId, role: "contact", clientId: contact.clientId };
    const imageId = await createLibraryImage(staff, { status: "published", visibility: "public", priceTier: "paid", publishedAt: new Date() });
    const type = (await currentLicenceType(db))!;
    const { licence } = await grantLicence(db, contactActor, {
      imageId,
      source: "purchase",
      licenceTypeId: type.id,
      priceMinor: type.priceMinor,
      currency: type.currency,
    });

    await setContactStatus(db, staff, contact.userId, "inactive");
    const [row] = await db.select().from(licences).where(eq(licences.id, licence.id));
    expect(row).toEqual(licence);
    expect(await listContactsForStaff(staff, contact.clientId)).toEqual([
      expect.objectContaining({ id: contact.userId, status: "inactive" }),
    ]);
  });

  it("throws NotFound for a staff user's id, so this UI can never deactivate staff", async () => {
    await expect(setContactStatus(db, staff, staff.userId, "inactive")).rejects.toBeInstanceOf(NotFound);
    await expect(setContactStatus(db, staff, UNKNOWN, "inactive")).rejects.toBeInstanceOf(NotFound);
    await expect(setContactStatus(db, staff, "not-a-uuid", "inactive")).rejects.toBeInstanceOf(NotFound);
    expect((await getUser(staff.userId)).status).toBe("active");
  });
});

describe("newContactSetupLink", () => {
  it("makes a new link that cancels the earlier unused one (FR-4)", async () => {
    const clientId = await createTestClient();
    const { contactId, link: first } = await createContact(db, staff, clientId, input());
    const second = await newContactSetupLink(db, staff, contactId);
    expect(second.url).not.toBe(first.url);
    expect(await isSetupLinkValid(tokenOf(first.url))).toBe(false);
    expect(await isSetupLinkValid(tokenOf(second.url))).toBe(true);
  });

  it("makes a link for an inactive contact too", async () => {
    const contact = await createTestContact();
    await setContactStatus(db, staff, contact.userId, "inactive");
    expect(await isSetupLinkValid(tokenOf((await newContactSetupLink(db, staff, contact.userId)).url))).toBe(true);
  });

  it("throws NotFound for a staff user's id, an unknown id and a malformed id, and makes no staff link", async () => {
    for (const id of [staff.userId, UNKNOWN, "not-a-uuid"]) {
      await expect(newContactSetupLink(db, staff, id)).rejects.toBeInstanceOf(NotFound);
    }
    expect(await db.select().from(setupLinks).where(eq(setupLinks.userId, staff.userId))).toEqual([]);
  });
});

describe("contact reads for staff", () => {
  it("list a client's contacts by name, inactive ones included, and no other client's", async () => {
    const clientId = await createTestClient();
    const other = await createTestContact();
    const { contactId: bravo } = await createContact(db, staff, clientId, input({ name: "Bravo Berg" }));
    const { contactId: alpha } = await createContact(db, staff, clientId, input({ name: "Alpha Aas", phone: "+47 912 34 567" }));
    await setContactStatus(db, staff, bravo, "inactive");

    const listed = await listContactsForStaff(staff, clientId);
    expect(listed.map((contact) => [contact.id, contact.status])).toEqual([
      [alpha, "active"],
      [bravo, "inactive"],
    ]);
    expect(listed[0].phone).toBe("+47 912 34 567");
    expect(listed.map((contact) => contact.id)).not.toContain(other.userId);
  });

  it("list nothing for an unknown or malformed client id", async () => {
    expect(await listContactsForStaff(staff, UNKNOWN)).toEqual([]);
    expect(await listContactsForStaff(staff, "not-a-uuid")).toEqual([]);
  });

  it("getContactForStaff throws NotFound for a staff user's id", async () => {
    await expect(getContactForStaff(staff, staff.userId)).rejects.toBeInstanceOf(NotFound);
  });

  it("show the seeded phone of Jonas", async () => {
    const { actor: jonas } = await loginAs(fixtureUsers.jonas);
    expect((await getContactForStaff(staff, jonas.userId)).phone).toBe(fixtureUsers.jonas.phone);
  });
});

describe("contact functions need a staff Actor", () => {
  it("throw Forbidden for a contact Actor and create or change nothing", async () => {
    const { actor: contact } = await loginAs(fixtureUsers.jonas);
    const target = await createTestContact();
    const values = input();
    await expect(createContact(db, contact, target.clientId, values)).rejects.toBeInstanceOf(Forbidden);
    await expect(updateContact(db, contact, target.userId, values)).rejects.toBeInstanceOf(Forbidden);
    await expect(setContactStatus(db, contact, target.userId, "inactive")).rejects.toBeInstanceOf(Forbidden);
    await expect(listContactsForStaff(contact, target.clientId)).rejects.toBeInstanceOf(Forbidden);
    await expect(getContactForStaff(contact, target.userId)).rejects.toBeInstanceOf(Forbidden);
    await expect(newContactSetupLink(db, contact, target.userId)).rejects.toBeInstanceOf(Forbidden);
    expect(await linkCountOfClient(target.clientId)).toBe(0);
    expect(await usersWithEmail(values.email)).toHaveLength(0);
    expect(await getUser(target.userId)).toMatchObject({ email: target.email, status: "active" });
  });
});

it("no accounts function deletes or removes a user (S10)", () => {
  expect(Object.keys(accounts).filter((name) => /delete|remove/i.test(name))).toEqual([]);
});
