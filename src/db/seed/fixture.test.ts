import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { exiftool } from "exiftool-vendored";
import { afterAll, describe, expect, it } from "vitest";
import { fixtureClients, fixtureImages, SEED_IMAGE_COUNT, SEED_IMAGES_DIR } from "./fixture";

const seedFile = (file: string) => path.join(SEED_IMAGES_DIR, file);

afterAll(async () => {
  await exiftool.end();
});

describe("the sample library files (Story 1.7)", () => {
  it("names a file that exists for every fixture row, each file once", async () => {
    const files = await readdir(SEED_IMAGES_DIR);
    const named = Object.values(fixtureImages).map((image) => image.file);
    expect(new Set(named).size).toBe(named.length);
    for (const file of named) expect(files).toContain(file);
    for (const image of Object.values(fixtureImages)) {
      for (const client of image.clients) expect(Object.keys(fixtureClients)).toContain(client);
    }
  });

  it("holds 20–40 images, each at most 1600 px and under 500 KB, with no camera model", async () => {
    const files = (await readdir(SEED_IMAGES_DIR)).filter((file) => /\.(jpe?g|png)$/i.test(file));
    expect(files.length).toBeGreaterThanOrEqual(20);
    expect(files.length).toBeLessThanOrEqual(40);
    expect(files.length).toBe(SEED_IMAGE_COUNT);
    for (const file of files) {
      expect((await stat(seedFile(file))).size, file).toBeLessThan(500 * 1024);
      const tags = await exiftool.read(seedFile(file));
      expect(Math.max(tags.ImageWidth ?? 0, tags.ImageHeight ?? 0), file).toBeLessThanOrEqual(1600);
      expect(tags.Model, file).toBeUndefined();
      expect(tags.DateTimeOriginal, file).toBeUndefined();
    }
  });

  it("keeps GPS, City and Country only on the location files, and the EXIF thumbnail only on the thumbnail file", async () => {
    const files = (await readdir(SEED_IMAGES_DIR)).filter((file) => /\.(jpe?g|png)$/i.test(file));
    const location = [fixtureImages.gpsJpeg.file, fixtureImages.locationPng.file] as string[];
    for (const file of files) {
      const tags = await exiftool.read(seedFile(file));
      if (location.includes(file)) {
        expect(tags.GPSLatitude, file).toBeCloseTo(69.64, 1);
        expect(tags.GPSLongitude, file).toBeCloseTo(18.95, 1);
        expect(tags.City, file).toBe("Tromsø");
        expect(tags.Country, file).toBe("Norway");
      } else {
        expect(tags.GPSLatitude, file).toBeUndefined();
        expect(tags.City, file).toBeUndefined();
      }
      if (file === fixtureImages.thumbnailJpeg.file) expect(tags.ThumbnailLength, file).toBeGreaterThan(0);
      else expect(tags.ThumbnailLength, file).toBeUndefined();
    }
  });
});
