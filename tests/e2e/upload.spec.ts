import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test, type Page, type Route } from "@playwright/test";
import { fixtureUsers } from "../../src/db/seed/fixture.ts";
import { loginAs, logOutVia } from "./helpers.ts";
import { makeDamagedPng, makePng } from "./png.ts";

// The mock provider's labelled placeholder title (src/modules/ai/providers/mock.ts).
const PLACEHOLDER_TITLE = "Placeholder title from the mock AI";

type UploadFile = { name: string; mimeType: string; buffer: Buffer };

function png(name: string, buffer = makePng()): UploadFile {
  return { name, mimeType: "image/png", buffer };
}

function fileRow(page: Page, name: string) {
  return page.getByRole("list", { name: "Files in this batch" }).getByRole("listitem").filter({ hasText: name });
}

// Files as payloads, or as paths (Playwright refuses payloads over 50 MB; one call cannot mix the two).
async function startBatch(page: Page, files: UploadFile[] | string[]) {
  await loginAs(page, fixtureUsers.ida);
  await page.goto("/upload");
  await page.getByRole("button", { name: "New batch" }).click();
  await expect(page.getByText("Drop JPEG or PNG files here, up to 50 MB each")).toBeVisible();
  await page.getByLabel("Choose files").setInputFiles(files);
}

test("a new batch stores a PNG, replaces its embedded title with the mock AI title, and keeps it on reload", async ({ page }) => {
  await startBatch(page, [png("harbour.png", makePng({ title: "Harbour at dawn" }))]);

  const row = fileRow(page, "harbour.png");
  await expect(row.getByText("Ready", { exact: true })).toBeVisible();
  await expect(row.getByText(PLACEHOLDER_TITLE, { exact: true })).toBeVisible();
  const thumb = row.locator("img");
  await expect.poll(() => thumb.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBe(32);

  await expect(page).toHaveURL(/\/upload\?batch=[0-9a-f-]{36}$/);
  await expect(page.getByLabel("Add more files")).toBeAttached();
  await expect(page.getByText("or drop JPEG or PNG files anywhere on this page, up to 50 MB each")).toBeVisible();

  await page.reload();
  await expect(fileRow(page, "harbour.png").getByText(PLACEHOLDER_TITLE, { exact: true })).toBeVisible();
  await expect(fileRow(page, "harbour.png").getByText("Ready", { exact: true })).toBeVisible();
});

test("a failed generation shows Failed with the embedded title, escaped, and the next file ends Ready", async ({ page }) => {
  const title = "Harbour <b>at dawn</b>";
  await startBatch(page, [png("fail-harbour.png", makePng({ title })), png("next.png")]);

  const failed = fileRow(page, "fail-harbour.png");
  await expect(failed.getByText("Failed", { exact: true })).toBeVisible();
  await expect(failed.getByText(title, { exact: true })).toBeVisible();
  await expect(failed.locator("b")).toHaveCount(0);
  await expect(fileRow(page, "next.png").getByText("Ready", { exact: true })).toBeVisible();

  await page.reload();
  await expect(fileRow(page, "fail-harbour.png").getByText("Failed", { exact: true })).toBeVisible();
  await expect(fileRow(page, "fail-harbour.png").getByText(title, { exact: true })).toBeVisible();
});

test("a failed PNG without metadata is an Untitled image with its file name below", async ({ page }) => {
  await startBatch(page, [png("fail-plain.png")]);
  const row = fileRow(page, "fail-plain.png");
  await expect(row.getByText("Failed", { exact: true })).toBeVisible();
  await expect(row.getByText("Untitled image", { exact: true })).toBeVisible();
  await expect(row.getByText("fail-plain.png", { exact: true })).toBeVisible();
});

test("a text file renamed to .jpg is not added", async ({ page }) => {
  await startBatch(page, [{ name: "x.jpg", mimeType: "image/jpeg", buffer: Buffer.from("notes.txt, not an image\n") }]);
  const row = fileRow(page, "x.jpg");
  await expect(row.getByText("Rejected", { exact: true })).toBeVisible();
  await expect(row.getByText("Not added", { exact: true })).toBeVisible();
  await expect(row.getByText("x.jpg was not uploaded: it is not a JPEG or PNG image.", { exact: true })).toBeVisible();
});

test("a damaged PNG is not added", async ({ page }) => {
  await startBatch(page, [png("broken.png", makeDamagedPng())]);
  const row = fileRow(page, "broken.png");
  await expect(row.getByText("Rejected", { exact: true })).toBeVisible();
  await expect(row.getByText("broken.png was not uploaded: the file is damaged.", { exact: true })).toBeVisible();
});

test("the same bytes again are already in the library", async ({ page }) => {
  const bytes = makePng();
  await startBatch(page, [png("first.png", bytes)]);
  await expect(fileRow(page, "first.png").getByText("Ready", { exact: true })).toBeVisible();

  await page.getByLabel("Add more files").setInputFiles([png("again.png", bytes)]);
  const row = fileRow(page, "again.png");
  await expect(row.getByText("Rejected", { exact: true })).toBeVisible();
  await expect(row.getByText("again.png is already in the library.", { exact: true })).toBeVisible();
});

test("rejected files never stop the other files in the batch", async ({ page }) => {
  await startBatch(page, [
    { name: "notes.jpg", mimeType: "image/jpeg", buffer: Buffer.from("not an image") },
    png("corrupt.png", makeDamagedPng()),
    png("good.png"),
  ]);
  const rows = page.getByRole("list", { name: "Files in this batch" }).getByRole("listitem");
  await expect(rows).toHaveCount(3);
  await expect(fileRow(page, "good.png").getByText("Ready", { exact: true })).toBeVisible();
  await expect(fileRow(page, "notes.jpg").getByText("Rejected", { exact: true })).toBeVisible();
  await expect(fileRow(page, "corrupt.png").getByText("Rejected", { exact: true })).toBeVisible();
});

test("the upload route refuses a foreign Origin", async ({ page }) => {
  await loginAs(page, fixtureUsers.ida);
  const response = await page.request.put("/api/images/019ab0c0-0000-7000-8000-00000000dead/file", {
    data: makePng(),
    headers: { origin: "http://evil.example", "content-type": "application/octet-stream" },
  });
  expect(response.status()).toBe(403);
});

test("each file shows a row with the Uploading tag at once, before its upload completes", async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/api/images/*/file", async (route: Route) => {
    await held;
    await route.continue();
  });
  await startBatch(page, [png("held.png")]);
  const row = fileRow(page, "held.png");
  await expect(row.getByText("Uploading", { exact: true })).toBeVisible();
  await expect(page.getByText("Keep this page open until the last file has uploaded.", { exact: true })).toBeVisible();
  release();
  await expect(row.getByText("Ready", { exact: true })).toBeVisible();
  await expect(page.getByText("Keep this page open until the last file has uploaded.")).toHaveCount(0);
});

test("a file over 50 MB is not added, and the other files still upload", async ({ page }) => {
  const dir = await mkdtemp(path.join(tmpdir(), "big-"));
  const big = path.join(dir, "big.png");
  const small = path.join(dir, "small.png");
  try {
    await writeFile(big, Buffer.concat([makePng().subarray(0, 8), Buffer.alloc(51 * 1024 * 1024)]));
    await writeFile(small, makePng());
    await startBatch(page, [big, small]);
    const row = fileRow(page, "big.png");
    await expect(row.getByText("Rejected", { exact: true })).toBeVisible();
    await expect(row.getByText("Not added", { exact: true })).toBeVisible();
    await expect(row.getByText("big.png was not uploaded: it is larger than 50 MB.", { exact: true })).toBeVisible();
    await expect(fileRow(page, "small.png").getByText("Ready", { exact: true })).toBeVisible();
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("an upload whose connection drops says so, and the other files still upload", async ({ page }) => {
  let first = true;
  await page.route("**/api/images/*/file", async (route: Route) => {
    if (first) {
      first = false;
      await route.abort();
    } else {
      await route.continue();
    }
  });
  await startBatch(page, [png("dropped.png"), png("fine.png")]);
  const row = fileRow(page, "dropped.png");
  await expect(row.getByText("Rejected", { exact: true })).toBeVisible();
  await expect(
    row.getByText("dropped.png was not uploaded: the connection was lost. Add the file again.", { exact: true }),
  ).toBeVisible();
  await expect(fileRow(page, "fine.png").getByText("Ready", { exact: true })).toBeVisible();
});

test("a PNG over 10 MB uploads, so the proxy body cap does not apply to the upload route", async ({ page }) => {
  const bytes = makePng({ width: 2000, height: 2000 });
  expect(bytes.length).toBeGreaterThan(10 * 1024 * 1024);
  await startBatch(page, [png("large.png", bytes)]);
  await expect(fileRow(page, "large.png").getByText("Ready", { exact: true })).toBeVisible({ timeout: 30_000 });
});

test("after a reload, a row whose upload never finished says the connection was lost", async ({ page }) => {
  await page.route("**/api/images/*/file", () => {
    // Held: never answered, as when the tab is closed mid-upload.
  });
  await startBatch(page, [png("unfinished.png")]);
  await expect(fileRow(page, "unfinished.png").getByText("Uploading", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/upload\?batch=[0-9a-f-]{36}$/);
  await page.unrouteAll({ behavior: "ignoreErrors" });

  await page.reload();
  const row = fileRow(page, "unfinished.png");
  await expect(row.getByText("Rejected", { exact: true })).toBeVisible();
  await expect(
    row.getByText("unfinished.png was not uploaded: the connection was lost. Add the file again.", { exact: true }),
  ).toBeVisible();
});

test("a batch id that is not a UUID, does not exist or is another user's gives a fresh page", async ({ page }) => {
  await loginAs(page, fixtureUsers.per);
  await page.goto("/upload");
  await page.getByRole("button", { name: "New batch" }).click();
  await page.getByLabel("Choose files").setInputFiles([png("pers.png")]);
  await expect(fileRow(page, "pers.png").getByText("Ready", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/upload\?batch=[0-9a-f-]{36}$/);
  const persBatch = page.url();
  await logOutVia(page, fixtureUsers.per);

  await loginAs(page, fixtureUsers.ida);
  for (const url of ["/upload?batch=not-a-uuid", "/upload?batch=019ab0c0-0000-7000-8000-00000000dead", persBatch]) {
    const response = await page.goto(url);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("button", { name: "New batch" })).toBeVisible();
    await expect(page.getByText("pers.png")).toHaveCount(0);
  }
});

// Dispatches a drop of one generated PNG on the element, as a file dragged from the desktop would.
async function dropPng(page: Page, selector: string, name: string) {
  const bytes = [...makePng()];
  const dataTransfer = await page.evaluateHandle(
    ({ bytes, name }) => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([new Uint8Array(bytes)], name, { type: "image/png" }));
      return transfer;
    },
    { bytes, name },
  );
  await page.locator(selector).first().dispatchEvent("dragover", { dataTransfer });
  await page.locator(selector).first().dispatchEvent("drop", { dataTransfer });
}

// A real drop on the drop zone lands on the native file input, which covers the zone and fires
// `change` (covered by every setInputFiles test). A script cannot trigger that native handling, so this
// checks the two halves: the input covers the zone, and the zone adds nothing on its own (a drop
// handler there once added every dropped file twice).
test("the drop zone leaves dropped files to its file input, so each is added once", async ({ page }) => {
  await loginAs(page, fixtureUsers.ida);
  await page.goto("/upload");
  await page.getByRole("button", { name: "New batch" }).click();

  // The input fills the zone inside its 2 px dashed border.
  const zone = (await page.locator(".drop-zone").boundingBox())!;
  const input = (await page.locator(".drop-zone input[type=file]").boundingBox())!;
  expect(input.width).toBeGreaterThanOrEqual(zone.width - 4);
  expect(input.height).toBeGreaterThanOrEqual(zone.height - 4);

  await dropPng(page, ".drop-zone input[type=file]", "dropped-on-zone.png");
  await dropPng(page, ".drop-zone", "dropped-on-zone.png");
  await expect(page.getByText("dropped-on-zone.png")).toHaveCount(0);
});

test("once the batch has rows, a file dropped anywhere on the page is uploaded once", async ({ page }) => {
  await startBatch(page, [png("first.png")]);
  await expect(fileRow(page, "first.png").getByText("Ready", { exact: true })).toBeVisible();

  await dropPng(page, "h1", "dropped-on-page.png");
  await expect(fileRow(page, "dropped-on-page.png").getByText("Ready", { exact: true })).toBeVisible();
  await expect(fileRow(page, "dropped-on-page.png")).toHaveCount(1);
});
