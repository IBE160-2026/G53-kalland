import { afterEach, describe, expect, it, vi } from "vitest";
import messages from "../../../messages/en.json";
import { Conflict, Forbidden, Locked, NotFound, toFormState, toHttpStatus, UNEXPECTED_KEY, Validation } from "./errors";
import { log } from "./log";

function lookup(key: string): unknown {
  return key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], messages);
}

afterEach(() => vi.restoreAllMocks());

describe("module errors", () => {
  it.each([
    [new NotFound(), 404],
    [new Forbidden(), 403],
    [new Conflict(), 409],
    [new Validation(), 422],
    [new Locked(), 423],
  ])("%o maps to HTTP %i and to its message key", (error, status) => {
    expect(toHttpStatus(error)).toBe(status);
    expect(toFormState(error)).toEqual({ error: error.messageKey });
  });

  it("every default message key and the generic message exist in messages/en.json", () => {
    const keys = [new NotFound(), new Forbidden(), new Conflict(), new Validation(), new Locked()].map((e) => e.messageKey);
    for (const key of [...keys, UNEXPECTED_KEY, "login.incorrect", "login.inactive", "accounts.emailTaken"]) {
      expect(lookup(key), key).toEqual(expect.any(String));
    }
  });

  it("keeps a specific message key", () => {
    expect(toFormState(new Validation("login.incorrect"))).toEqual({ error: "login.incorrect" });
  });
});

describe("unexpected errors", () => {
  it("map to 500 and the generic message, and are logged without their text reaching the form", () => {
    const logged = vi.spyOn(log, "error").mockImplementation(() => undefined);
    const error = new Error("connection to postgres://secret failed");
    expect(toHttpStatus(error)).toBe(500);
    expect(toFormState(error)).toEqual({ error: "errors.unexpected" });
    expect(logged).toHaveBeenCalledWith({ err: error }, expect.any(String));
  });
});
