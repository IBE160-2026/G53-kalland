import { describe, expect, it } from "vitest";
import { cameraName, formatDateTaken } from "./format";

describe("formatDateTaken", () => {
  it.each([
    ["2024-06-01", "1 June 2024"],
    ["2024-06-01 14:05:00", "1 June 2024, 14:05"],
  ])("gives %j as %j", (value, expected) => {
    expect(formatDateTaken(value)).toBe(expected);
  });
});

describe("cameraName", () => {
  it.each([
    ["Canon", "Canon EOS R5", "Canon EOS R5"],
    ["FUJIFILM", "X100V", "FUJIFILM X100V"],
    ["Canon", null, "Canon"],
    [null, "X100V", "X100V"],
    [null, null, null],
  ])("gives %j and %j as %j", (make, model, expected) => {
    expect(cameraName(make, model)).toBe(expected);
  });
});
