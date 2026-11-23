import { exiftool } from "exiftool-vendored";
import { ALT_TEXT_MAX, stripControlCharacters } from "@/modules/shared/text";

export type EmbeddedMetadata = {
  title: string | null;
  description: string | null;
  altText: string | null;
  keywords: string[];
  // Local time as captured ("YYYY-MM-DD HH:MM:SS"), plus the offset when the camera recorded one.
  dateTaken: string | null;
  dateTakenOffset: string | null;
  cameraMake: string | null;
  cameraModel: string | null;
  lens: string | null;
  exposureTime: string | null;
  fNumber: number | null;
  focalLength: number | null;
  iso: number | null;
  latitude: number | null;
  longitude: number | null;
};

// Only these tags are read. `#` gives the number instead of ExifTool's printed form; the Composite
// GPS tags are then signed (south and west negative).
const READ_ARGS = [
  "-XMP-dc:Title",
  "-IPTC:ObjectName",
  "-XMP-dc:Description",
  "-IPTC:Caption-Abstract",
  "-EXIF:ImageDescription",
  "-XMP-iptcCore:AltTextAccessibility",
  "-XMP-dc:Subject",
  "-IPTC:Keywords",
  "-EXIF:DateTimeOriginal",
  "-EXIF:CreateDate",
  "-EXIF:OffsetTimeOriginal",
  "-EXIF:Make",
  "-EXIF:Model",
  "-EXIF:LensModel",
  "-EXIF:ExposureTime",
  "-EXIF:FNumber#",
  "-EXIF:ISO#",
  "-EXIF:FocalLength#",
  "-Composite:GPSLatitude#",
  "-Composite:GPSLongitude#",
];

type Raw = Record<string, unknown>;

function text(value: unknown, multiline = false): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  return stripControlCharacters(String(value), { multiline }) || null;
}

function firstText(raw: Raw, tags: string[], multiline = false): string | null {
  for (const tag of tags) {
    const value = text(raw[tag], multiline);
    if (value) return value;
  }
  return null;
}

function list(value: unknown): string[] {
  const items = Array.isArray(value) ? value : value === undefined ? [] : [value];
  return items.map((item) => text(item)).filter((item): item is string => item !== null);
}

function dedupeCaseInsensitive(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function number(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
}

const EXIF_DATE = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/;

// "2024:06:01 12:34:56" → "2024-06-01 12:34:56"; an impossible date (such as all zeros) → null.
function exifDate(value: unknown): string | null {
  const match = typeof value === "string" ? EXIF_DATE.exec(value) : null;
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match.map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d, h, mi, s));
  const valid =
    y > 0 &&
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === mo - 1 &&
    date.getUTCDate() === d &&
    date.getUTCHours() === h &&
    date.getUTCMinutes() === mi &&
    date.getUTCSeconds() === s;
  return valid ? `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}` : null;
}

function offset(value: unknown): string | null {
  return typeof value === "string" && /^[+-]\d{2}:\d{2}$/.test(value) ? value : null;
}

function coordinates(raw: Raw): { latitude: number | null; longitude: number | null } {
  const latitude = number(raw.GPSLatitude);
  const longitude = number(raw.GPSLongitude);
  const valid = latitude !== null && longitude !== null && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
  return valid ? { latitude, longitude } : { latitude: null, longitude: null };
}

// Reads an original's embedded EXIF, IPTC-IIM and XMP into the image fields (FR-11): XMP first, then
// IIM, then EXIF. Every text is untrusted: control characters are removed, and it is rendered escaped.
export async function readEmbeddedMetadata(file: string): Promise<EmbeddedMetadata> {
  const raw: Raw = await exiftool.readRaw(file, { readArgs: READ_ARGS });
  const altText = text(raw.AltTextAccessibility);
  const xmpKeywords = list(raw.Subject);
  const iso = number(raw.ISO);
  const original = exifDate(raw.DateTimeOriginal);
  return {
    title: firstText(raw, ["Title", "ObjectName"]),
    description: firstText(raw, ["Description", "Caption-Abstract", "ImageDescription"], true),
    altText: altText ? Array.from(altText).slice(0, ALT_TEXT_MAX).join("").trim() : null,
    keywords: dedupeCaseInsensitive(xmpKeywords.length > 0 ? xmpKeywords : list(raw.Keywords)),
    dateTaken: original ?? exifDate(raw.CreateDate),
    // OffsetTimeOriginal belongs to DateTimeOriginal only.
    dateTakenOffset: original ? offset(raw.OffsetTimeOriginal) : null,
    cameraMake: text(raw.Make),
    cameraModel: text(raw.Model),
    lens: text(raw.LensModel),
    exposureTime: text(raw.ExposureTime),
    fNumber: number(raw.FNumber),
    focalLength: number(raw.FocalLength),
    iso: iso === null ? null : Math.round(iso),
    ...coordinates(raw),
  };
}
