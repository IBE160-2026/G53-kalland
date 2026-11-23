import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { exiftool } from "exiftool-vendored";
import sharp from "sharp";
import { afterAll, beforeAll, expect, it } from "vitest";

// Proves Perl and ExifTool work in the app image and write UTF-8 IIM (AD-16, AD-24).
let dir: string;
beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "exiftool-"));
});
afterAll(async () => {
  await exiftool.end();
  await rm(dir, { recursive: true, force: true });
});

it("writes a 64-byte UTF-8 title to IPTC-IIM and reads it back unchanged", async () => {
  const file = path.join(dir, "title.jpg");
  await sharp({ create: { width: 8, height: 8, channels: 3, background: "#808080" } }).jpeg().toFile(file);
  const title = "æ".repeat(32);
  expect(Buffer.byteLength(title, "utf8")).toBe(64);

  await exiftool.write(file, { CodedCharacterSet: "UTF8", ObjectName: title }, {
    writeArgs: ["-overwrite_original"],
  });

  const tags = await exiftool.readRaw(file, { readArgs: ["-IPTC:ObjectName", "-IPTC:CodedCharacterSet"] });
  expect(tags.ObjectName).toBe(title);
  expect(tags.CodedCharacterSet).toBe("UTF8");
});
