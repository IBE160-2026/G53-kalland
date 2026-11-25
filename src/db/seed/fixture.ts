// The named seed users and clients (AD-7). Pure data, no imports: Playwright reads this file too.
// Demo data for development and tests only; the password is public on purpose (README).

export const DEMO_PASSWORD = "crm-dam-demo-2026";

// Each client has a valid (made-up) org number, a billing email and Ida as account manager (Story 2.1).
export const fixtureClients = {
  fjordkaffe: { name: "Fjordkaffe AS", status: "active", orgNumber: "921456786", billingEmail: "faktura@fjordkaffe.example", accountManager: "ida" },
  nordlys: { name: "Nordlys Sykkel AS", status: "active", orgNumber: "923609016", billingEmail: "faktura@nordlys.example", accountManager: "ida" },
  gammelKunde: { name: "Gammel Kunde AS", status: "inactive", orgNumber: "889640782", billingEmail: "faktura@gammelkunde.example", accountManager: "ida" },
} as const;

export type FixtureClientKey = keyof typeof fixtureClients;

export type FixtureUser =
  | { role: "staff"; name: string; email: string }
  | { role: "contact"; client: FixtureClientKey; name: string; email: string };

export const fixtureUsers = {
  ida: { role: "staff", name: "Ida Berg", email: "ida@agency.example" },
  per: { role: "staff", name: "Per Lund", email: "per@agency.example" },
  jonas: { role: "contact", client: "fjordkaffe", name: "Jonas Fjell", email: "jonas@fjordkaffe.example" },
  kari: { role: "contact", client: "fjordkaffe", name: "Kari Vik", email: "kari@fjordkaffe.example" },
  emil: { role: "contact", client: "nordlys", name: "Emil Strand", email: "emil@nordlys.example" },
  liv: { role: "contact", client: "gammelKunde", name: "Liv Moe", email: "liv@gammelkunde.example" },
} as const satisfies Record<string, FixtureUser>;

export type FixtureUserKey = keyof typeof fixtureUsers;

// The sample library (Story 1.7): seed images under SEED_IMAGES_DIR, uploaded as Ida when the images
// table is empty. Each entry below gives one file the state its access row needs, seen from Fjordkaffe
// (AD-7); every other seed file is published, public and free. The rows that need a licence (A3, A6, A8,
// A10, A12) are paid and licensed to Fjordkaffe: the seed grants each as Jonas, at the current price,
// after the images are seeded (Story 1.9). Nordlys may buy A3 and A8 and sees none of the other three.
export const SEED_IMAGES_DIR = "src/db/seed/images";
// How many image files SEED_IMAGES_DIR holds (checked by fixture.test.ts), for tests that cannot read it.
export const SEED_IMAGE_COUNT = 22;

export type FixtureImage = {
  file: string;
  row: string;
  status: "draft" | "published" | "archived";
  visibility: "internal" | "restricted" | "public";
  clients: FixtureClientKey[];
  priceTier: "free" | "paid";
  // The clients that hold a licence for the image, granted by the seed as their first contact.
  licensedTo?: FixtureClientKey[];
};

export const fixtureImages = {
  a1: { file: "jellyfish-tank.jpg", row: "A1", status: "published", visibility: "public", clients: [], priceTier: "free" },
  a2: { file: "low-tide-beach.jpg", row: "A2", status: "published", visibility: "public", clients: [], priceTier: "paid" },
  a3: { file: "aerial-coast-plane-window.jpg", row: "A3", status: "published", visibility: "public", clients: [], priceTier: "paid", licensedTo: ["fjordkaffe"] },
  a4: { file: "dinner-table-wine.jpg", row: "A4", status: "published", visibility: "restricted", clients: ["fjordkaffe"], priceTier: "free" },
  a5: { file: "mountain-farm-painting.jpg", row: "A5", status: "published", visibility: "restricted", clients: ["fjordkaffe"], priceTier: "paid" },
  a6: { file: "birch-path-thaw.jpg", row: "A6", status: "published", visibility: "restricted", clients: ["fjordkaffe"], priceTier: "paid", licensedTo: ["fjordkaffe"] },
  a7: { file: "snowy-path-overcast.jpg", row: "A7", status: "published", visibility: "restricted", clients: ["nordlys"], priceTier: "free" },
  a8: { file: "king-crab-claw.jpg", row: "A8", status: "published", visibility: "restricted", clients: ["nordlys"], priceTier: "paid", licensedTo: ["fjordkaffe"] },
  a9: { file: "wrap-film-samples.jpg", row: "A9", status: "published", visibility: "internal", clients: [], priceTier: "free" },
  a10: { file: "seal-pool-window.jpg", row: "A10", status: "published", visibility: "internal", clients: [], priceTier: "paid", licensedTo: ["fjordkaffe"] },
  a11: { file: "birthday-balloon-window.jpg", row: "A11", status: "archived", visibility: "public", clients: [], priceTier: "free" },
  a12: { file: "starfish-aquarium.jpg", row: "A12", status: "archived", visibility: "public", clients: [], priceTier: "paid", licensedTo: ["fjordkaffe"] },
  a13: { file: "garden-clearing-trimmer.jpg", row: "A13", status: "draft", visibility: "public", clients: [], priceTier: "free" },
  s4: { file: "gilded-frame-corner.jpg", row: "S4", status: "published", visibility: "restricted", clients: [], priceTier: "free" },
  gpsJpeg: { file: "tromso-harbour-gps.jpg", row: "JPEG with GPS, City and Country", status: "published", visibility: "public", clients: [], priceTier: "free" },
  thumbnailJpeg: { file: "tabby-cat-terrace-thumbnail.jpg", row: "JPEG with an embedded thumbnail", status: "published", visibility: "public", clients: [], priceTier: "free" },
  locationPng: { file: "jellyfish-polaria-location.png", row: "PNG with location data", status: "published", visibility: "public", clients: [], priceTier: "free" },
  fail: { file: "aquarium-jellyfish-fail.jpg", row: "Mock AI failure", status: "draft", visibility: "internal", clients: [], priceTier: "free" },
} as const satisfies Record<string, FixtureImage>;

export type FixtureImageKey = keyof typeof fixtureImages;

// Every seed file that no row above names gets this.
export const DEFAULT_SEED_IMAGE = { status: "published", visibility: "public", clients: [], priceTier: "free" } as const satisfies Omit<FixtureImage, "file" | "row">;
