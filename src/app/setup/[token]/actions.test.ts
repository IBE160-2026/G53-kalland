import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "@/db/client";
import { fixtureUsers } from "@/db/seed/fixture";
import { setContactStatus } from "@/modules/accounts";
import { issueSetupLink, isSetupLinkValid, login, resolveSession } from "@/modules/auth";
import { SESSION_COOKIE } from "@/modules/auth/cookies";
import { createTestContact, FACTORY_PASSWORD } from "@/test/factories";
import { loginAs } from "@/test/login-as";
import { setPasswordFromLink } from "./actions";

// The browser's cookies as the action sees and changes them.
const request = vi.hoisted(() => ({ cookies: new Map<string, string>() }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (request.cookies.has(name) ? { name, value: request.cookies.get(name) } : undefined),
    set: (name: string, value: string) => request.cookies.set(name, value),
    delete: (name: string) => request.cookies.delete(name),
  }),
  headers: async () => new Headers(),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));

const db = getDb();
const NEW_PASSWORD = "a brand new password";

beforeEach(() => {
  request.cookies.clear();
});

function form(password: string): FormData {
  const data = new FormData();
  data.set("password", password);
  return data;
}

async function contactWithLink() {
  const contact = await createTestContact();
  const { url } = await issueSetupLink(db, contact.userId);
  return { ...contact, token: url.slice(url.lastIndexOf("/") + 1) };
}

describe("setPasswordFromLink", () => {
  it("logs the contact in on /overview and ends the session the browser held before", async () => {
    const contact = await contactWithLink();
    const earlier = await loginAs(fixtureUsers.ida);
    request.cookies.set(SESSION_COOKIE, earlier.token);

    await expect(setPasswordFromLink(contact.token, {}, form(NEW_PASSWORD))).rejects.toThrow("redirect:/overview");
    const cookie = request.cookies.get(SESSION_COOKIE);
    expect(cookie).not.toBe(earlier.token);
    expect(await resolveSession(cookie, new Date())).toMatchObject({ status: "active", actor: { userId: contact.userId } });
    expect(await resolveSession(earlier.token, new Date())).toEqual({ status: "none" });
  });

  it("shows a too short or too long password inline and keeps the link valid", async () => {
    const contact = await contactWithLink();
    expect(await setPasswordFromLink(contact.token, {}, form("x".repeat(11)))).toEqual({ fieldError: "setPassword.tooShort" });
    expect(await setPasswordFromLink(contact.token, {}, form("x".repeat(1025)))).toEqual({ fieldError: "setPassword.tooLong" });
    expect(await isSetupLinkValid(contact.token)).toBe(true);
    expect(request.cookies.has(SESSION_COOKIE)).toBe(false);
  });

  it("sends a used or unknown link to Login with the expired message", async () => {
    const contact = await contactWithLink();
    await expect(setPasswordFromLink(contact.token, {}, form(NEW_PASSWORD))).rejects.toThrow("redirect:/overview");
    await expect(setPasswordFromLink(contact.token, {}, form("another new password"))).rejects.toThrow("redirect:/login?reason=expired");
    await expect(setPasswordFromLink("not-a-token", {}, form(NEW_PASSWORD))).rejects.toThrow("redirect:/login?reason=expired");
  });

  it("sends a deactivated contact to Login with the inactive message and leaves the link unused", async () => {
    const contact = await contactWithLink();
    const { actor: staff } = await loginAs(fixtureUsers.ida);
    await setContactStatus(db, staff, contact.userId, "inactive");
    await expect(setPasswordFromLink(contact.token, {}, form(NEW_PASSWORD))).rejects.toThrow("redirect:/login?reason=inactive");
    expect(await isSetupLinkValid(contact.token)).toBe(true);
    await setContactStatus(db, staff, contact.userId, "active");
    await expect(login(contact.email, FACTORY_PASSWORD)).resolves.toMatchObject({ actor: { userId: contact.userId } });
  });
});
