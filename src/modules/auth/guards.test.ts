import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "@/db/client";
import { sessions } from "@/db/schema";
import { fixtureUsers } from "@/db/seed/fixture";
import { setClientStatus, setUserStatus } from "@/modules/accounts";
import { createTestContact, FACTORY_PASSWORD } from "@/test/factories";
import { loginAs } from "@/test/login-as";
import { SESSION_COOKIE } from "./cookies";
import { currentActor, endCurrentSession, requireContact, requireStaff, requireUser } from "./guards";
import { REQUEST_PATH_HEADER } from "./request-path";
import { IDLE_TIMEOUT_MS, login } from "./sessions";
import { hashToken } from "./tokens";

// The request a guard sees: a cookie jar and the request-path header that src/proxy.ts sets.
const request = vi.hoisted(() => ({ cookies: new Map<string, string>(), path: "/" }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (request.cookies.has(name) ? { name, value: request.cookies.get(name) } : undefined),
    set: (name: string, value: string) => void request.cookies.set(name, value),
    delete: (name: string) => void request.cookies.delete(name),
  }),
  headers: async () => new Headers({ [REQUEST_PATH_HEADER]: request.path }),
}));

// Sentinels: redirect() and forbidden() throw in Next, so the tests catch what they were called with.
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
  forbidden: () => {
    throw new Error("forbidden");
  },
}));

const db = getDb();

beforeEach(() => {
  request.cookies.clear();
  request.path = "/";
});

function holdCookie(token: string) {
  request.cookies.set(SESSION_COOKIE, token);
}

async function sessionExists(token: string): Promise<boolean> {
  return (await db.select().from(sessions).where(eq(sessions.tokenHash, hashToken(token)))).length > 0;
}

describe("requireStaff and requireContact", () => {
  it("return the Actor for the matching role", async () => {
    const staff = await loginAs(fixtureUsers.ida);
    holdCookie(staff.token);
    await expect(requireStaff()).resolves.toEqual(staff.actor);

    const contact = await loginAs(fixtureUsers.jonas);
    holdCookie(contact.token);
    await expect(requireContact()).resolves.toEqual(contact.actor);
  });

  it("call forbidden() for the other role", async () => {
    holdCookie((await loginAs(fixtureUsers.jonas)).token);
    await expect(requireStaff()).rejects.toThrow("forbidden");
    holdCookie((await loginAs(fixtureUsers.per)).token);
    await expect(requireContact()).rejects.toThrow("forbidden");
  });

  it("send a request without a session to Login with the encoded return-to", async () => {
    request.path = "/library?page=2";
    await expect(requireStaff()).rejects.toThrow("redirect:/login?returnTo=%2Flibrary%3Fpage%3D2");
  });

  it("send an expired session to Login with the return-to", async () => {
    const contact = await createTestContact();
    const { token } = await login(contact.email, FACTORY_PASSWORD, new Date(Date.now() - IDLE_TIMEOUT_MS - 60_000));
    holdCookie(token);
    request.path = "/overview";
    await expect(requireContact()).rejects.toThrow("redirect:/login?returnTo=%2Foverview");
    expect(await sessionExists(token)).toBe(false);
  });

  it("send a deactivated user to Login with the inactive message (S1)", async () => {
    const contact = await createTestContact();
    const { actor: staff } = await loginAs(fixtureUsers.per);
    const { token } = await login(contact.email, FACTORY_PASSWORD);
    await setUserStatus(db, staff, contact.userId, "inactive");
    holdCookie(token);
    await expect(requireContact()).rejects.toThrow("redirect:/login?reason=inactive");
  });

  it("send the contact of a deactivated client to Login with the inactive message (S2)", async () => {
    const contact = await createTestContact();
    const { actor: staff } = await loginAs(fixtureUsers.per);
    const { token } = await login(contact.email, FACTORY_PASSWORD);
    await setClientStatus(db, staff, contact.clientId, "inactive");
    holdCookie(token);
    await expect(requireContact()).rejects.toThrow("redirect:/login?reason=inactive");
  });
});

describe("requireUser", () => {
  it("returns the Actor for either role", async () => {
    const staff = await loginAs(fixtureUsers.ida);
    holdCookie(staff.token);
    await expect(requireUser()).resolves.toEqual(staff.actor);
    const contact = await loginAs(fixtureUsers.emil);
    holdCookie(contact.token);
    await expect(requireUser()).resolves.toEqual(contact.actor);
  });

  it("sends a request without a session to Login, and a deactivated user to Login with the inactive message", async () => {
    request.path = "/api/images/x/thumbnail";
    await expect(requireUser()).rejects.toThrow("redirect:/login?returnTo=%2Fapi%2Fimages%2Fx%2Fthumbnail");
    const contact = await createTestContact();
    const { actor: staff } = await loginAs(fixtureUsers.per);
    const { token } = await login(contact.email, FACTORY_PASSWORD);
    await setUserStatus(db, staff, contact.userId, "inactive");
    holdCookie(token);
    await expect(requireUser()).rejects.toThrow("redirect:/login?reason=inactive");
  });
});

describe("currentActor", () => {
  it("returns the Actor, or null without a session", async () => {
    await expect(currentActor()).resolves.toBeNull();
    const staff = await loginAs(fixtureUsers.ida);
    holdCookie(staff.token);
    await expect(currentActor()).resolves.toEqual(staff.actor);
  });

  it("sends a deactivated user to Login with the inactive message", async () => {
    const contact = await createTestContact();
    const { actor: staff } = await loginAs(fixtureUsers.per);
    const { token } = await login(contact.email, FACTORY_PASSWORD);
    await setUserStatus(db, staff, contact.userId, "inactive");
    holdCookie(token);
    await expect(currentActor()).rejects.toThrow("redirect:/login?reason=inactive");
  });
});

describe("endCurrentSession", () => {
  it("deletes the session row and clears the cookie", async () => {
    const { token } = await loginAs(fixtureUsers.kari);
    holdCookie(token);
    await endCurrentSession();
    expect(await sessionExists(token)).toBe(false);
    expect(request.cookies.has(SESSION_COOKIE)).toBe(false);
  });
});
