import { eq } from "drizzle-orm";
import { describe, expect, it, vi } from "vitest";
import { getDb } from "@/db/client";
import { credentials, sessions, users } from "@/db/schema";
import { DEMO_PASSWORD, fixtureUsers } from "@/db/seed/fixture";
import { createUser, setClientStatus, setUserStatus } from "@/modules/accounts";
import { Forbidden, Validation } from "@/modules/shared/errors";
import { createTestClient, createTestContact, FACTORY_PASSWORD } from "@/test/factories";
import { loginAs } from "@/test/login-as";
import messages from "../../../messages/en.json";
import { landingPathFor } from "./actor";
import { getDummyHash, verifyPassword } from "./password";
import { IDLE_TIMEOUT_MS, LAST_SEEN_THROTTLE_MS, login, logout, resolveSession, setPassword } from "./sessions";
import { hashToken } from "./tokens";

// Pass-through spy, so the tests can see which hash each login attempt verified against.
vi.mock("./password", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./password")>();
  return { ...actual, verifyPassword: vi.fn(actual.verifyPassword) };
});

const db = getDb();
const t0 = new Date("2026-11-23T08:00:00Z");
const later = (ms: number) => new Date(t0.getTime() + ms);

async function userIdOf(email: string): Promise<string> {
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  return row.id;
}

async function sessionRow(token: string) {
  const [row] = await db.select().from(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  return row;
}

async function sessionCount(userId: string): Promise<number> {
  return (await db.select().from(sessions).where(eq(sessions.userId, userId))).length;
}

describe("NFR-7 login messages", () => {
  it("are word for word", () => {
    expect(messages.login.incorrect).toBe("Incorrect email or password. Contact the agency to set up a new password.");
    expect(messages.login.inactive).toBe("Your account is not active. Contact the agency.");
  });
});

describe("login", () => {
  it("logs a staff user in and stores only the token's hash", async () => {
    const { token, actor } = await login(fixtureUsers.ida.email, DEMO_PASSWORD);
    expect(actor).toEqual({ userId: await userIdOf(fixtureUsers.ida.email), role: "staff" });
    expect(landingPathFor(actor)).toBe("/library");
    const row = await sessionRow(token);
    expect(row.tokenHash).toBe(hashToken(token));
    expect(row.tokenHash).not.toContain(token);
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("logs a contact in with their client", async () => {
    const { actor } = await login(`  ${fixtureUsers.jonas.email.toUpperCase()} `, DEMO_PASSWORD);
    expect(actor.role).toBe("contact");
    expect(actor.clientId).toEqual(expect.any(String));
    expect(landingPathFor(actor)).toBe("/overview");
  });

  it("records the previous login time", async () => {
    const contact = await createTestContact();
    await login(contact.email, FACTORY_PASSWORD, t0);
    await login(contact.email, FACTORY_PASSWORD, later(1000));
    const [row] = await db.select().from(credentials).where(eq(credentials.userId, contact.userId));
    expect(row.lastLoginAt).toEqual(later(1000));
    expect(row.previousLoginAt).toEqual(t0);
  });

  it("refuses an unknown email and a wrong password with the same error and the same argon2 work", async () => {
    const verify = vi.mocked(verifyPassword);
    verify.mockClear();
    const unknown = login("nobody@agency.example", DEMO_PASSWORD);
    await expect(unknown).rejects.toEqual(new Validation("login.incorrect"));
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenLastCalledWith(await getDummyHash(), DEMO_PASSWORD);

    verify.mockClear();
    const wrong = login(fixtureUsers.ida.email, "wrong password");
    await expect(wrong).rejects.toEqual(new Validation("login.incorrect"));
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify.mock.calls[0][0]).toMatch(/^\$argon2id\$/);
  });

  it("refuses a user without a password with the same error and the dummy-hash work", async () => {
    const clientId = await createTestClient();
    const email = `no-password-${crypto.randomUUID()}@factory.example`;
    await createUser(db, { role: "contact", clientId, name: "No Password", email });
    const verify = vi.mocked(verifyPassword);
    verify.mockClear();
    await expect(login(email, DEMO_PASSWORD)).rejects.toEqual(new Validation("login.incorrect"));
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify).toHaveBeenLastCalledWith(await getDummyHash(), DEMO_PASSWORD);
  });

  it("refuses the contact of an inactive client with the inactive message and creates no session", async () => {
    const userId = await userIdOf(fixtureUsers.liv.email);
    const before = await sessionCount(userId);
    await expect(login(fixtureUsers.liv.email, DEMO_PASSWORD)).rejects.toEqual(new Forbidden("login.inactive"));
    expect(await sessionCount(userId)).toBe(before);
  });

  it("does not reveal that an account is inactive to a wrong password", async () => {
    await expect(login(fixtureUsers.liv.email, "wrong password")).rejects.toEqual(new Validation("login.incorrect"));
  });
});

describe("resolveSession", () => {
  it("returns none without a token or for an unknown token", async () => {
    expect(await resolveSession(undefined, t0)).toEqual({ status: "none" });
    expect(await resolveSession("not-a-session", t0)).toEqual({ status: "none" });
  });

  it("writes lastSeenAt at most once per minute", async () => {
    const contact = await createTestContact();
    const { token } = await login(contact.email, FACTORY_PASSWORD, t0);

    const first = await resolveSession(token, later(LAST_SEEN_THROTTLE_MS - 1));
    expect(first.status).toBe("active");
    expect((await sessionRow(token)).lastSeenAt).toEqual(t0);

    await resolveSession(token, later(LAST_SEEN_THROTTLE_MS));
    expect((await sessionRow(token)).lastSeenAt).toEqual(later(LAST_SEEN_THROTTLE_MS));
  });

  it("keeps a session idle for exactly 8 hours and expires one idle for longer", async () => {
    const contact = await createTestContact();
    const { token } = await login(contact.email, FACTORY_PASSWORD, t0);
    expect((await resolveSession(token, later(IDLE_TIMEOUT_MS))).status).toBe("active");

    const seen = later(IDLE_TIMEOUT_MS);
    const expired = await resolveSession(token, new Date(seen.getTime() + IDLE_TIMEOUT_MS + 1));
    expect(expired).toEqual({ status: "expired" });
    expect(await sessionRow(token)).toBeUndefined();
  });

  it("refuses and deletes the session when the user is set inactive (S1)", async () => {
    const contact = await createTestContact();
    const { actor: staff } = await loginAs(fixtureUsers.per);
    const { token } = await login(contact.email, FACTORY_PASSWORD, t0);

    await setUserStatus(db, staff, contact.userId, "inactive");
    expect(await resolveSession(token, later(1000))).toEqual({ status: "inactive" });
    expect(await sessionRow(token)).toBeUndefined();
    await expect(login(contact.email, FACTORY_PASSWORD)).rejects.toEqual(new Forbidden("login.inactive"));
  });

  it("refuses and deletes the session when the contact's client is set inactive (S2)", async () => {
    const contact = await createTestContact();
    const { actor: staff } = await loginAs(fixtureUsers.per);
    const { token } = await login(contact.email, FACTORY_PASSWORD, t0);

    await setClientStatus(db, staff, contact.clientId, "inactive");
    expect(await resolveSession(token, later(1000))).toEqual({ status: "inactive" });
    expect(await sessionRow(token)).toBeUndefined();
  });
});

describe("logout", () => {
  it("deletes the session server-side", async () => {
    const { token } = await loginAs(fixtureUsers.kari);
    await logout(token);
    expect(await sessionRow(token)).toBeUndefined();
    expect(await resolveSession(token, new Date())).toEqual({ status: "none" });
  });

  it("is a no-op without a token", async () => {
    await expect(logout(undefined)).resolves.toBeUndefined();
  });
});

describe("setPassword", () => {
  it("stores an argon2id hash and ends the user's sessions", async () => {
    const contact = await createTestContact();
    const { token } = await login(contact.email, FACTORY_PASSWORD);
    await setPassword(db, contact.userId, "a new password");
    expect(await sessionRow(token)).toBeUndefined();
    const [row] = await db.select().from(credentials).where(eq(credentials.userId, contact.userId));
    expect(row.passwordHash).toMatch(/^\$argon2id\$/);
    await expect(login(contact.email, "a new password")).resolves.toMatchObject({ actor: { userId: contact.userId } });
  });
});
