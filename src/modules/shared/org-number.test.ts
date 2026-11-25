import { describe, expect, it } from "vitest";
import { isValidOrgNumber, normaliseOrgNumber } from "./org-number";

describe("normaliseOrgNumber", () => {
  it("removes spaces, including around and between the groups", () => {
    expect(normaliseOrgNumber(" 921 456\t786 ")).toBe("921456786");
  });

  it("leaves other characters for the check to refuse", () => {
    expect(normaliseOrgNumber("921-456-786")).toBe("921-456-786");
  });
});

describe("isValidOrgNumber", () => {
  it.each(["921456786", "974760673", "923609016", "889640782"])("accepts %s", (value) => {
    expect(isValidOrgNumber(value)).toBe(true);
  });

  it("accepts a number whose remainder is 0, with check digit 0", () => {
    // 3*1 + 2*0 + 7*0 + 6*0 + 5*0 + 4*0 + 3*0 + 2*4 = 11, remainder 0.
    expect(isValidOrgNumber("100000040")).toBe(true);
  });

  it.each([
    ["eight digits", "12345678"],
    ["ten digits", "9214567860"],
    ["a wrong check digit", "123456789"],
    ["letters", "92145678A"],
    ["spaces (not yet normalised)", "921 456 786"],
    ["an empty string", ""],
  ])("refuses %s", (_name, value) => {
    expect(isValidOrgNumber(value)).toBe(false);
  });

  it("refuses a number whose remainder is 1, which has no check digit", () => {
    // 3 * 4 (the seventh digit) = 12, remainder 1: no check digit 0-9 can make it valid.
    expect(isValidOrgNumber("000000400")).toBe(false);
    expect(isValidOrgNumber("000000401")).toBe(false);
  });
});
