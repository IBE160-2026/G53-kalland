import { afterEach, beforeEach, expect, it } from "vitest";
import { Forbidden } from "@/modules/shared/errors";
import { assertSameOrigin } from "./origin";

let saved: string | undefined;
beforeEach(() => {
  saved = process.env.APP_ORIGIN;
  process.env.APP_ORIGIN = "http://localhost:3000";
});
afterEach(() => {
  process.env.APP_ORIGIN = saved;
});

function put(headers: Record<string, string>): Request {
  return new Request("http://localhost:3000/api/images/x/file", { method: "PUT", headers });
}

it("accepts a request from APP_ORIGIN", () => {
  expect(() => assertSameOrigin(put({ origin: "http://localhost:3000" }))).not.toThrow();
});

it.each([
  ["a foreign origin", { origin: "http://evil.example" }],
  ["another port", { origin: "http://localhost:3001" }],
  ["the string null", { origin: "null" }],
  ["no Origin header", {}],
])("refuses %s with Forbidden", (_name, headers) => {
  expect(() => assertSameOrigin(put(headers))).toThrow(Forbidden);
});
