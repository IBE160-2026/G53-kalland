import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import {
  fixtureClients,
  fixtureImages,
  fixtureUsers,
  SEED_IMAGE_COUNT,
  type FixtureClientKey,
  type FixtureImage,
  type FixtureImageKey,
} from "../../src/db/seed/fixture.ts";
import { loginAs } from "./helpers.ts";

// The access table through the real routes (AD-7, Story 1.8). Runs in the "seeded library" project, while
// the test database holds only the sample library, so the counts are exact.

// The mock AI titles of the seed images (src/modules/ai/providers/mock-fixtures.ts), which the e2e
// container does not hold.
const TITLES = {
  a1: "Moon jellyfish close up",
  a2: "Low tide in a quiet bay",
  a4: "Venison dinner with red wine",
  a5: "Painting of a mountain farm",
  a7: "Snowy path on a grey day",
  a9: "Wrap film colour samples",
  a11: "First birthday by the window",
  a13: "Clearing an overgrown garden",
  s4: "Corner of a gilded frame",
  gpsJpeg: "Tromsø harbour reflections",
  locationPng: "Moon jellyfish in blue light",
} as const satisfies Partial<Record<FixtureImageKey, string>>;

const ROWS = ["a1", "a2", "a4", "a5", "a7", "a9", "a11", "a13", "s4"] as const;
const CONTACTS = [fixtureUsers.jonas, fixtureUsers.emil] as const;
// The embedded location of the two location files (GPS, City and Country), which no client response may hold.
const LOCATION_LEAKS = ["69.64", "18.95", "18.94", "Norway", "latitude", "longitude", "tromso-harbour-gps", "jellyfish-polaria-location"];

function visibleTo(image: FixtureImage, client: FixtureClientKey): boolean {
  return (
    image.status === "published" &&
    (image.visibility === "public" || (image.visibility === "restricted" && (image.clients as readonly string[]).includes(client)))
  );
}

// Seed files that no fixture row names are published, public and free, so every client sees them.
function expectedCount(client: FixtureClientKey): number {
  const rows = Object.values(fixtureImages) as FixtureImage[];
  return SEED_IMAGE_COUNT - rows.length + rows.filter((image) => visibleTo(image, client)).length;
}

const ids = new Map<string, string>();

// Reads the seed images' ids from Ida's Library, by title.
async function readIds(browser: Browser) {
  const page = await browser.newPage();
  await loginAs(page, fixtureUsers.ida);
  const tiles = await page
    .getByRole("list", { name: "Images" })
    .getByRole("link")
    .evaluateAll((links) =>
      links.map((link) => ({
        title: link.querySelector(".wall-tile-title")?.textContent ?? "",
        id: new URL((link as HTMLAnchorElement).href).searchParams.get("image") ?? "",
      })),
    );
  for (const [key, title] of Object.entries(TITLES)) {
    const tile = tiles.find((candidate) => candidate.title === title);
    if (!tile) throw new Error(`No Library tile is titled ${title}.`);
    ids.set(key, tile.id);
  }
  await page.close();
}

test.beforeAll(async ({ browser }) => {
  await readIds(browser);
});

const origin = () => process.env.APP_ORIGIN ?? "http://localhost:3000";

async function get(request: APIRequestContext, path: string) {
  return request.get(path, { headers: { Origin: origin() }, maxRedirects: 0 });
}

for (const user of CONTACTS) {
  test.describe(`as ${user.name} (${fixtureClients[user.client].name})`, () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, user);
    });

    for (const key of ROWS) {
      const image = fixtureImages[key];
      const visible = visibleTo(image, user.client);
      test(`${image.row} is ${visible ? "visible" : "404 and absent"}: image page, thumbnail, preview and list`, async ({ page }) => {
        const id = ids.get(key)!;
        const imagePage = await get(page.request, `/find-images?image=${id}`);
        expect(imagePage.status()).toBe(visible ? 200 : 404);
        if (!visible) expect(await imagePage.text()).toContain("Not found");

        for (const kind of ["thumbnail", "preview"]) {
          const file = await get(page.request, `/api/images/${id}/${kind}`);
          expect(file.status(), kind).toBe(visible ? 200 : 404);
          expect(file.headers()["cache-control"]).toBe("private, no-store");
          if (visible) expect(file.headers()["content-type"]).toBe("image/webp");
        }

        const wall = await (await get(page.request, "/find-images")).text();
        if (visible) {
          expect(wall).toContain(TITLES[key]);
        } else {
          expect(wall).not.toContain(TITLES[key]);
          expect(wall).not.toContain(id);
        }
      });
    }

    test("the count is exactly the images the client may see", async ({ page }) => {
      const wall = await (await get(page.request, "/find-images")).text();
      expect(wall).toContain(`${expectedCount(user.client)} images, newest first`);
      await page.goto("/find-images");
      await expect(page.getByRole("list", { name: "Images" }).getByRole("link")).toHaveCount(expectedCount(user.client));
    });

    test("no client response holds a location, another client's name or staff fields", async ({ page }) => {
      const others = Object.entries(fixtureClients)
        .filter(([key]) => key !== user.client)
        .map(([, client]) => client.name);
      const paths = ["/find-images", `/find-images?image=${ids.get("gpsJpeg")}`, `/find-images?image=${ids.get("locationPng")}`];
      for (const path of paths) {
        const response = await get(page.request, path);
        expect(response.status(), path).toBe(200);
        const html = await response.text();
        // UI strings are in every page (the messages file), so staff fields are checked by their data names.
        for (const leak of [...LOCATION_LEAKS, ...others, "priceTier", "clientNames", "filename", "processingState"]) {
          expect(html, `${path} holds ${leak}`).not.toContain(leak);
        }
      }
    });
  });
}
