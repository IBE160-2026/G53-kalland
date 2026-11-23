import { expect, it } from "vitest";
import { sessionCookieOptions } from "./cookies";

it("is HttpOnly and SameSite=Lax, and Secure only when the app origin is https", () => {
  expect(sessionCookieOptions("http://localhost:3000")).toEqual({ httpOnly: true, sameSite: "lax", secure: false, path: "/" });
  expect(sessionCookieOptions("https://crm-dam.example")).toEqual({ httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  expect(sessionCookieOptions("HTTPS://CRM-DAM.EXAMPLE")).toMatchObject({ secure: true });
  expect(sessionCookieOptions("")).toMatchObject({ secure: false });
});
