import { describe, expect, it } from "vitest";
import { formatOsloDateTime } from "./time";

describe("formatOsloDateTime", () => {
  it.each([
    // Winter: UTC+1.
    ["2026-11-25T13:05:00Z", "25 November 2026, 14:05"],
    // Summer: UTC+2.
    ["2026-07-01T10:30:00Z", "1 July 2026, 12:30"],
    // Past midnight in Oslo while still the day before in UTC.
    ["2026-12-31T23:30:00Z", "1 January 2027, 00:30"],
  ])("shows %s as %s", (utc, expected) => {
    expect(formatOsloDateTime(new Date(utc))).toBe(expected);
  });
});
