import { expect, it } from "vitest";
import { safeReturnTo } from "./return-to";

it.each([
  ["/library", "/library"],
  ["/library?page=2&q=coffee", "/library?page=2&q=coffee"],
  ["/overview#top", "/overview#top"],
])("accepts the same-origin path %j", (raw, expected) => {
  expect(safeReturnTo(raw)).toBe(expected);
});

it.each([
  "//evil.com",
  "//evil.com/library",
  "https://x",
  "http://localhost:3000/library",
  "/\\evil.com",
  "\\\\evil.com",
  "/login",
  "/login?returnTo=/library",
  "/login/",
  "library",
  "javascript:alert(1)",
  "/\tevil",
  " /library",
  "",
  undefined,
  ["/library"],
  `/${"a".repeat(2000)}`,
])("ignores %j", (raw) => {
  expect(safeReturnTo(raw)).toBeNull();
});
