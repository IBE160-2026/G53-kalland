import { Writable } from "node:stream";
import { eq } from "drizzle-orm";
import { describe, expect, it, vi } from "vitest";
import { getDb } from "@/db/client";
import { credentials, sessions, setupLinks } from "@/db/schema";
import { fixtureUsers } from "@/db/seed/fixture";
import { setClientStatus, setContactStatus } from "@/modules/accounts";
import { Forbidden, NotFound, toFormState, Validation } from "@/modules/shared/errors";
import { createTestContact, FACTORY_PASSWORD } from "@/test/factories";
import { loginAs } from "@/test/login-as";
import messages from "../../../messages/en.json";
import { landingPathFor } from "./actor";
import { login, resolveSession } from "./sessions";
import { isSetupLinkValid, issueSetupLink, redeemSetupLink, SETUP_LINK_TTL_MS } from "./setup-links";
import { hashToken } from "./tokens";

// Every log line of the run, so the tests can check that no token or link ever reaches the log.
const logged = vi.hoisted(() => ({ lines: [] as string[] }));
vi.mock("@/modules/shared/log", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/shared/log")>();
  const stream = new Writable({
    write(chunk, _encoding, done) {
      logged.lines.push(chunk.toString());
      done();
    },
  });
  return { ...actual, log: actual.createLogger(stream) };
});

// Story 2.3: contacts set their password from a setup link (FR-4, FR-5, S8).
const db = getDb();
const t0 = new Date("2026-11-25T09:00:00Z");
const later = (ms: number) => new Date(t0.getTime() + ms);
const NEW_PASSWORD = "a brand new password";
const EXPIRED = new Validation("login.expired");

function tokenOf(url: string): string {
  const match = /\/setup\/([A-Za-z0-9_-]{43})$/.exec(url);
  if (!match) throw new Error(`Not a setup link: ${url}`);
  return match[1];
}

// A fresh contact with the factory password and one setup link issued at t0.
async function contactWithLink() {
  const contact = await createTestContact();
  const link = await issueSetupLink(db, contact.userId, t0);
  return { ...contact, link, token: tokenOf(link.url) };
}

async function linkRow(token: string) {
  const [row] = await db.select().from(setupLinks).where(eq(setupLinks.tokenHash, hashToken(token)));
  return row;
}

async function passwordHashOf(userId: string): Promise<string> {
  const [row] = await db.select({ hash: credentials.passwordHash }).from(credentials).where(eq(credentials.userId, userId));
  return row.hash;
}

describe("the expired message", () => {
  it("is word for word (S8)", () => {
    expect(messages.login.expired).toBe("Link expired. Contact the agency for a new one.");
    expect(messages.setPassword.tooShort).toBe("Use at least 12 characters.");
  });
});

describe("issueSetupLink", () => {
  it("gives an APP_ORIGIN link valid for 7 days and stores only the token's hash", async () => {
    const { userId, link, token } = await contactWithLink();
    expect(link.url).toBe(`${new URL(process.env.APP_ORIGIN!).origin}/setup/${token}`);
    expect(link.expiresAt).toEqual(later(SETUP_LINK_TTL_MS));

    const rows = await db.select().from(setupLinks).where(eq(setupLinks.userId, userId));
    expect(rows).toEqual([
      expect.objectContaining({ tokenHash: hashToken(token), createdAt: t0, expiresAt: later(SETUP_LINK_TTL_MS), usedAt: null, cancelledAt: null }),
    ]);
    expect(JSON.stringify(rows)).not.toContain(token);
  });

  it("leaves exactly one valid link when several are issued at once", async () => {
    const contact = await createTestContact();
    const links = await Promise.all(Array.from({ length: 8 }, () => issueSetupLink(db, contact.userId, t0)));
    const valid = await Promise.all(links.map((link) => isSetupLinkValid(tokenOf(link.url), later(1000))));
    expect(valid.filter(Boolean)).toHaveLength(1);
  });

  it("throws NotFound for an unknown user", async () => {
    await expect(issueSetupLink(db, "019ab0c0-0000-7000-8000-00000000dead", t0)).rejects.toBeInstanceOf(NotFound);
  });
});

describe("isSetupLinkValid", () => {
  it("is true until the link expires, 7 days after it was issued", async () => {
    const { token } = await contactWithLink();
    expect(await isSetupLinkValid(token, later(SETUP_LINK_TTL_MS - 1))).toBe(true);
    expect(await isSetupLinkValid(token, later(SETUP_LINK_TTL_MS))).toBe(false);
  });

  it("is false for an unknown token and changes nothing", async () => {
    expect(await isSetupLinkValid("not-a-token", t0)).toBe(false);
  });
});

describe("redeemSetupLink", () => {
  it("sets the password, uses up the link, ends every other session and logs the contact in (FR-4, FR-5)", async () => {
    const contact = await contactWithLink();
    const first = await login(contact.email, FACTORY_PASSWORD, t0);
    const second = await login(contact.email, FACTORY_PASSWORD, t0);

    const result = await redeemSetupLink(contact.token, NEW_PASSWORD, later(1000));
    expect(result.actor).toEqual({ userId: contact.userId, role: "contact", clientId: contact.clientId });
    expect(landingPathFor(result.actor)).toBe("/overview");

    expect(await resolveSession(first.token, later(2000))).toEqual({ status: "none" });
    expect(await resolveSession(second.token, later(2000))).toEqual({ status: "none" });
    expect((await resolveSession(result.token, later(2000))).status).toBe("active");
    expect(await db.select().from(sessions).where(eq(sessions.userId, contact.userId))).toHaveLength(1);

    expect(await passwordHashOf(contact.userId)).toMatch(/^\$argon2id\$/);
    await expect(login(contact.email, FACTORY_PASSWORD)).rejects.toEqual(new Validation("login.incorrect"));
    await expect(login(contact.email, NEW_PASSWORD)).resolves.toMatchObject({ actor: { userId: contact.userId } });
    expect((await linkRow(contact.token)).usedAt).toEqual(later(1000));
  });

  it("refuses a used link with the expired message", async () => {
    const { token } = await contactWithLink();
    await redeemSetupLink(token, NEW_PASSWORD, later(1000));
    expect(await isSetupLinkValid(token, later(2000))).toBe(false);
    await expect(redeemSetupLink(token, "another new password", later(2000))).rejects.toEqual(EXPIRED);
  });

  it("refuses an expired link and changes nothing", async () => {
    const contact = await contactWithLink();
    const hash = await passwordHashOf(contact.userId);
    await expect(redeemSetupLink(contact.token, NEW_PASSWORD, later(SETUP_LINK_TTL_MS))).rejects.toEqual(EXPIRED);
    expect(await passwordHashOf(contact.userId)).toBe(hash);
    expect((await linkRow(contact.token)).usedAt).toBeNull();
  });

  it("refuses an unknown link with the expired message", async () => {
    await expect(redeemSetupLink("not-a-token", NEW_PASSWORD, t0)).rejects.toEqual(EXPIRED);
  });

  it("refuses a link replaced by a newer one, and the newer one works", async () => {
    const contact = await contactWithLink();
    const newer = tokenOf((await issueSetupLink(db, contact.userId, later(1000))).url);
    expect((await linkRow(contact.token)).cancelledAt).toEqual(later(1000));
    expect(await isSetupLinkValid(contact.token, later(2000))).toBe(false);
    await expect(redeemSetupLink(contact.token, NEW_PASSWORD, later(2000))).rejects.toEqual(EXPIRED);
    await expect(redeemSetupLink(newer, NEW_PASSWORD, later(2000))).resolves.toMatchObject({ actor: { userId: contact.userId } });
  });

  it("refuses a password under 12 characters and keeps the link valid", async () => {
    const contact = await contactWithLink();
    const hash = await passwordHashOf(contact.userId);
    await expect(redeemSetupLink(contact.token, "x".repeat(11), later(1000))).rejects.toEqual(new Validation("setPassword.tooShort"));
    await expect(redeemSetupLink(contact.token, "x".repeat(1025), later(1000))).rejects.toEqual(new Validation("setPassword.tooLong"));
    expect(await passwordHashOf(contact.userId)).toBe(hash);
    expect(await isSetupLinkValid(contact.token, later(1000))).toBe(true);
    await expect(redeemSetupLink(contact.token, "x".repeat(12), later(2000))).resolves.toMatchObject({ actor: { userId: contact.userId } });
  });

  it("refuses a deactivated contact with the inactive message and leaves the link unused", async () => {
    const contact = await contactWithLink();
    const { actor: staff } = await loginAs(fixtureUsers.ida);
    await setContactStatus(db, staff, contact.userId, "inactive");
    const hash = await passwordHashOf(contact.userId);
    await expect(redeemSetupLink(contact.token, NEW_PASSWORD, later(1000))).rejects.toEqual(new Forbidden("login.inactive"));
    expect((await linkRow(contact.token)).usedAt).toBeNull();
    expect(await passwordHashOf(contact.userId)).toBe(hash);

    await setContactStatus(db, staff, contact.userId, "active");
    await expect(redeemSetupLink(contact.token, NEW_PASSWORD, later(2000))).resolves.toMatchObject({ actor: { userId: contact.userId } });
  });

  it("refuses a contact of an inactive client with the inactive message", async () => {
    const contact = await contactWithLink();
    const { actor: staff } = await loginAs(fixtureUsers.ida);
    await setClientStatus(db, staff, contact.clientId, "inactive");
    await expect(redeemSetupLink(contact.token, NEW_PASSWORD, later(1000))).rejects.toEqual(new Forbidden("login.inactive"));
    expect((await linkRow(contact.token)).usedAt).toBeNull();
  });

  it("uses a link once when two submits race; the other reads as expired", async () => {
    const contact = await contactWithLink();
    const results = await Promise.allSettled([
      redeemSetupLink(contact.token, "first parallel password", later(1000)),
      redeemSetupLink(contact.token, "second parallel password", later(1000)),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected").map((result) => result.reason)).toEqual([EXPIRED]);
    expect(await db.select().from(sessions).where(eq(sessions.userId, contact.userId))).toHaveLength(1);
  });
});

describe("tokens and links", () => {
  it("never reach the log, on success or on any refusal", async () => {
    logged.lines.length = 0;
    const contact = await contactWithLink();
    const outcomes = await Promise.allSettled([
      redeemSetupLink(contact.token, "short", later(1000)),
      redeemSetupLink(contact.token, NEW_PASSWORD, later(SETUP_LINK_TTL_MS)),
    ]);
    const used = await redeemSetupLink(contact.token, NEW_PASSWORD, later(1000));
    outcomes.push(...(await Promise.allSettled([redeemSetupLink(contact.token, NEW_PASSWORD, later(2000))])));
    // The refusals as a Server Action maps them: each becomes its message key, and nothing is logged.
    expect(outcomes.map((outcome) => (outcome.status === "rejected" ? toFormState(outcome.reason).error : "fulfilled"))).toEqual([
      "setPassword.tooShort",
      "login.expired",
      "login.expired",
    ]);

    const output = logged.lines.join("");
    for (const secret of [contact.token, used.token, NEW_PASSWORD]) expect(output).not.toContain(secret);
  });
});
