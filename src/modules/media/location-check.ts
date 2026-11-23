import { exiftool } from "exiftool-vendored";

// Where location hides (metadata research § C): GPS tags, IPTC/XMP location text and structures, and
// embedded thumbnail or preview images that may carry the uncropped original. Matched on "Group:Tag".
const LOCATION_TAG = /gps|location|city|province|state|country|thumbnailimage|previewimage/i;

// Every tag of a file that matches the location checklist (AD-17). Empty means the file is clean.
export async function findLocationTags(file: string): Promise<string[]> {
  const tags = await exiftool.readRaw(file, { readArgs: ["-a", "-G1", "-u"] });
  return Object.keys(tags).filter((key) => key.includes(":") && LOCATION_TAG.test(key));
}
