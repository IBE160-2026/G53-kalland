---
title: 'Story 1.4: Staff upload an image and the library stores it safely'
type: 'feature'
created: '2026-11-23'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '42ce4108945036a64012e07e20378d26d1e1efb6'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Upload is a placeholder. Staff cannot add images, and Stories 1.5–1.9 need stored drafts with files, derived thumbnails/previews and embedded metadata.

**Approach:** Add the images schema (batches, images, file_versions, image_keywords), a local-disk `FileStore` and media functions (sniff, hash, derive, location check, read metadata), and an Upload page that creates rows first and then streams each file to a guarded Route Handler. The handler stores a `ready` draft or deletes the row and returns a reason. A startup sweep removes stale `uploading` rows and `tmp/`.

## Boundaries & Constraints

**Always:** The story ACs in `epics.md` § Story 1.4 are the contract. AD-11 order: row `uploading` → stream to `tmp/<uuid>` with in-stream SHA-256 → derive outside any transaction → one short transaction inserts `file_versions` and moves files to `originals/<fileVersionId>` and `derived/<fileVersionId>/{thumbnail,preview}`. Keys never come from the filename. Content decides the type (magic bytes), never the extension or `Content-Type`. 50 MB per file, enforced on `Content-Length` and on bytes counted. The original is never rewritten. Derived files keep only the ICC profile and are auto-oriented; any AD-17 checklist hit fails the upload. Route Handlers call `requireStaff()` first and reject state changes whose `Origin` ≠ `APP_ORIGIN`. File responses send `Cache-Control: private, no-store`. Each image copies the batch defaults (`visibility = internal`, `priceTier = free`). Embedded text is untrusted: strip control characters, render escaped, and never use `dangerouslySetInnerHTML`. Fixed NFR-7 strings are tested word for word. Every UI string goes in `messages/en.json`. No new dependencies. The migration is generated with `drizzle-kit generate`.

**Never:** No AI, `queued` state or AI input file (1.5). No publish, visibility or price editing (1.6). No batch settings form, shared keywords, `aiEnabled` or place names (3.7, 3.10). No sidebar batch list, % progress, upload queue provider or leave warning (3.1). No "Open the existing image" link or context alert (3.2). No editing, autosave or discard (3.3, 3.4, 3.12). No worker (3.11). No preview route, no Library wall, no `image_clients`/`locks` tables. No file uploads through Server Actions.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy path | Ida: New batch, drops `harbour.jpg` (EXIF date, camera, GPS; XMP title, keywords) | rows appear at once with tag Uploading; then thumb, title from XMP, file name sub-line, tag Ready; DB: draft, `ready`, internal, free, fields source `embedded`, lat/long set | N/A |
| No title | PNG without metadata | title "Untitled image" | N/A |
| Renamed | `notes.txt` saved as `x.jpg` | "Not added" + Rejected tag + "x.jpg was not uploaded: it is not a JPEG or PNG image." | row and tmp deleted; other files continue |
| Damaged | JPEG header, garbage body | "… was not uploaded: the file is damaged." | as above |
| Too large | 51 MB | "… was not uploaded: it is larger than 50 MB." | rejected on `Content-Length` before reading, else when the count passes the limit |
| Duplicate | same bytes as a stored image | "harbour.jpg is already in the library." | unique hash index conflict → row + files deleted |
| Location hit | derived file contains a checklist tag | "… was not uploaded: its preview could not be made safely. Try again." | row + files deleted, logged |
| Interrupted | request aborted mid-stream | client row shows "… was not uploaded: the connection was lost. Add the file again." | server deletes row + tmp file |
| Stale | `uploading` row untouched > 1 h, app restarts | sweep deletes the row; `tmp/` emptied | N/A |
| Wrong role / origin | contact, or Origin ≠ APP_ORIGIN | 403 | no DB or file change |

**Decisions (user, 2026-11-23):**
- After the first file is added, the page URL becomes `/upload?batch=<id>` (replace, no navigation), and the server renders that batch's stored rows on reload. Rejected rows are not stored, so they do not survive a reload. A batch id that is not the staff user's own, or that does not exist, shows a fresh page.
- The copy for the location-check hit and the interrupted upload is kept as written in the matrix.
- Spec size: about 2,800 tokens, kept as one spec, because schema, media, route and page depend on each other.

</frozen-after-approval>

## Code Map

- `src/db/schema/images.ts` (new) + `schema/index.ts` -- `batches` (tenant, `ownerId`→users, default `visibility`/`priceTier`, `version`, timestamps); `images` (tenant, `batchId` NOT NULL, `uploadedBy`, `filename`, `status` draft|published|archived default draft, `processingState` uploading|queued|generating|ready|failed, `visibility` internal|restricted|public, `priceTier` free|paid, title/description/altText + `*Source` embedded|ai|staff, `dateTaken` timestamp without tz + `dateTakenOffset` text, cameraMake/Model, lens, exposureTime text, fNumber/focalLength real, iso int, latitude/longitude double, `publishedAt`, `version`, `createdAt`/`updatedAt`); `file_versions` (`imageId` cascade, `hash` text NOT NULL unique, `mediaType`, `byteSize` bigint, `width`, `height`); `image_keywords` (`imageId` cascade, `keyword`, `source`, `category` null, unique `(image_id, lower(keyword))`). Follow `accounts.ts`: uuidv7, check constraints, `<table>_<col>_idx`.
- `src/db/migrations/0003_images.sql` -- `npm run db:generate -- --name images`.
- `src/modules/media/` -- `file-store.ts` (`FileStore` with `put(key, stream)`, `get`, `move`, `delete`, `clearPrefix`; `LocalFileStore(root)`; `getFileStore()` from `FILE_STORE_DIR` via `requireEnv`); `sniff.ts` (JPEG `FF D8 FF`, PNG 8-byte signature); `receive.ts` (stream body → `tmp/<uuid>`, SHA-256 + byte count in-stream, sniff the first chunk, `TooLarge`/`NotImage` errors); `derive.ts` (sharp `autoOrient()` + `keepIccProfile()`, thumbnail WebP ≤ 480 px long edge, preview WebP ≤ 800 px; oriented width/height; decode failure → `Damaged`); `location-check.ts` (exiftool read of derived file; fails on any tag matching gps/location/city/sub-location/state/country or ThumbnailImage/PreviewImage, per research § C); `embedded.ts` (exiftool `read` → mapping below). Export through `index.ts`. Reuse the `exiftool` singleton from `exiftool-vendored`, as `exiftool.test.ts` does.
- Embedded mapping (XMP first, then IIM, then EXIF): title `XMP-dc:Title` → `ObjectName`; description `XMP-dc:Description` → `Caption-Abstract` → `ImageDescription`; alt text `AltTextAccessibility` (cut to 250); keywords `XMP-dc:Subject` → `Keywords`, deduped case-insensitively; date `DateTimeOriginal` → `CreateDate` (+ `OffsetTimeOriginal`); camera `Make`, `Model`, `LensModel`, `ExposureTime`, `FNumber`, `ISO`, `FocalLength`; GPS from signed `GPSLatitude`/`GPSLongitude`.
- `src/modules/images/` -- `uploads.ts`: `createUploadRows(tx, actor, {batchId?, filenames})` (creates the batch when absent, owner = actor; rows `uploading` with the copied defaults); `completeUpload(actor, imageId, body, contentLength)` (owner check, media receive/derive/check/read; then one transaction: insert `file_versions`, set fields and keywords, `processingState = ready` conditional on `uploading`; `isUniqueViolation` → `Duplicate`; any failure → delete row + files); `deleteUpload`; `sweepStaleUploads(now)`; `getThumbnail(actor, imageId)`; `listBatchUploads(actor, batchId)` (own batch only; rows in upload order with title, filename, processingState). Typed errors carry an NFR-7 reason key.
- `src/modules/auth/origin.ts` (new, exported) -- `assertSameOrigin(request)` throws `Forbidden` when `Origin` is missing or ≠ `APP_ORIGIN`.
- `src/app/api/images/[id]/file/route.ts` -- `PUT`: guard, origin, `completeUpload(…, request.body, …)`; returns JSON `{status:"ready", title, thumbnailUrl}` or `{status:"rejected", reason}` (4xx). `src/app/api/images/[id]/thumbnail/route.ts` -- `GET`: staff only, streams WebP, `private, no-store`.
- `src/proxy.ts` -- exclude `api/images/[^/]+/file` from the matcher; a proxy caps bodies at 10 MB (review-verify-current F11).
- `src/app/(staff)/upload/` -- `page.tsx` (guard; reads `?batch` (uuid via zod) and passes `listBatchUploads` rows to `UploadWorkspace`), `actions.ts` (`createUploadRows` Server Action, zod: 1–500 names, each 1–255 chars, control characters stripped), `upload-workspace.tsx` (client: "New batch" button → drop zone "Drop JPEG or PNG files here, up to 50 MB each" + "Choose files"; once files are added, the bar "Add more files" / "or drop JPEG or PNG files anywhere on this page, up to 50 MB each"; "Keep this page open until the last file has uploaded."; uploads one file at a time with `fetch` PUT), `file-row.tsx` (UX-DR-28: 52 px thumb, title semibold, file-name sub-line, message line, DS Tag Uploading/Ready/Rejected).
- `src/instrumentation.ts` -- always run `sweepStaleUploads` + `clearPrefix("tmp/")` in the node runtime, then seed only if `SEED_ON_START=true`.
- `src/app/(staff)/library/page.tsx` -- do not change.

## Tasks & Acceptance

**Execution:**
- [x] schema + migration per the Code Map -- AD-3/8/9/10/11
- [x] `src/modules/media/*` + tests (`media.test.ts`: sniff; receive with hash and limit via a generated 51 MB stream; derive with orientation-6 JPEG and an ICC-only check; location check against sharp output and a planted GPS file; embedded mapping with exiftool-written fixtures, including control characters) -- AD-15/16/17, FR-11
- [x] `src/modules/images/*` + tests (`uploads.test.ts`: defaults copied; duplicate → row and files gone; NFR-10 stored hash = input; abort mid-stream cleans up; sweep is 1 h-bounded; owner/role checks)
- [x] `src/modules/auth/origin.ts` + test
- [x] route handlers + route tests (mocked cookies as in `guards.test.ts`): contact 403, foreign Origin 403, happy PUT, thumbnail headers
- [x] `src/proxy.ts`, `src/instrumentation.ts`
- [x] Upload page, components, `messages/en.json` (`upload.*`, NFR-7 strings with `{name}`)
- [x] `tests/e2e/upload.spec.ts` (PNGs generated in-test with `node:zlib`: happy, Untitled image, renamed, corrupt, duplicate, other files continue); add `/upload` with a file row to `a11y.spec.ts`
- [x] `README.md` -- test counts; `FILE_STORE_DIR` note

**Acceptance Criteria:**
- Given the README test command, then all Vitest and Playwright tests pass.
- Given `npm run lint` and `npm run typecheck`, then both are clean.
- Given `docker compose up --build`, when Ida uploads a real camera JPEG, then the row shows its thumbnail upright and the stored original's SHA-256 equals the file's.

## Implementation Notes

- **Media API.** Besides the Code Map files, `media/files.ts` holds what `images` calls, so only media reaches the FileStore: `stageDerivedFiles` (derive into `tmp/<uuid>-thumbnail|-preview`, then the location check on both, logging hits), `readStagedMetadata`, `storeStagedFiles` (the moves, run inside the transaction), `discardUploadFiles`, `openDerivedFile`, `clearTempFiles`. `FileStore` has `localPath(key)` for sharp and ExifTool, which read files only.
- **Shared helpers.** `shared/text.ts` (`stripControlCharacters`, `ALT_TEXT_MAX = 250`) is used by media and the Server Action; `shared/errors.ts` gains `toErrorResponse` for Route Handler error JSON.
- **Too large on the client.** The page checks `file.size` first: a file over 50 MB is shown as Rejected with the tooLarge message and gets no server row. A browser that keeps sending after an early 413 can report a reset connection instead of the answer. The server still enforces both `Content-Length` and the byte count (tested in `uploads.test.ts` and `media.test.ts`).
- **Row text.** Ready: title (or "Untitled image") over the file name. Uploading: file name. Rejected: file name, "Not added", then the NFR-7 message.
- **Insecure context.** Row keys come from a counter, not `crypto.randomUUID()`, which is missing over plain http on a non-localhost host (the e2e app at `http://app-test:3000`).
- **tsconfig.** `dom.asynciterable` added to `lib`, so `request.body` types as an `AsyncIterable` for `receiveUpload`.
- **Not done:** the manual browser check with a real camera JPEG via `docker compose up --build` (orientation and hash are covered by `media.test.ts` and the NFR-10 test in `uploads.test.ts`).

- **Double add on drop (found by the user in the manual check, 2026-11-23).** The review patch for triage #24 added `onDrop` on the drop zone, but Designsystemet's native file input covers the zone, so a real drop also fired `onChange`: each dropped file was sent twice and the second copy was refused as a duplicate (only one copy stored). The scripted drop test passed because a script cannot trigger the input's native drop. Fix: the zone handler is removed; the e2e test now checks that the input covers the zone and that the zone adds nothing on its own; the page-wide drop test asserts exactly one row.
- **Manual check done (user, 2026-11-23).** `docker compose up --build`, Ida, a real camera JPEG: the thumbnail is upright, and after the drop fix a dropped photo gives exactly one row.

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Evidence | Route |
|---|-------|---------|---------|----------|-------|
| 1 | edge-case | `additions` chain stays rejected if `add()` throws | low | Only throwing paths are a short `result.images` (unreachable, see #2) or `replaceState` throwing; fix adds a catch branch | reject |
| 2 | edge-case | Server returns fewer rows than files → `result.images[i]` TypeError | false | `createUploadRows` inserts every filename in one `insert … returning`; counts always match | reject |
| 3 | edge-case, blind | One bad name or > 500 files fails the whole drop with `errors.validation` | medium | A shoot of 600 files is plausible; every row shows the generic message. Control-character-only names are not (OS file names) | patch (chunk ≤ 500 on the client) |
| 4 | edge-case, blind, verification-gap | Reloaded `?batch` shows stored `uploading` rows as Uploading forever | medium | `fromStored` maps them to "uploading", but no file is being sent after a reload; matrix row "Interrupted" gives the honest state | patch (show as connectionLost) |
| 5 | edge-case, blind | `queued`/`generating`/`failed` shown as Ready | false | No code in 1.4 writes those states; 1.5 adds them | reject |
| 6 | edge-case, blind | Session expiry mid-batch gives a generic error | low | Real but rare; fix adds a new message and response branch | reject |
| 7 | edge-case, blind | Sweep failure at startup stops the server | low | DB/volume down at start fails loudly, as the seed already did; compose starts app after migrate; fix adds a guard | reject |
| 8 | edge-case | Two concurrent PUTs for one image id | low | Our client never sends two; only a staff user's own crafted requests; fix adds row claiming | reject |
| 9 | edge-case | Crash between file moves and commit leaves orphans | low | Process crash only; a failed commit already discards final keys; fix adds an orphan sweep | reject |
| 10 | edge-case | Crafted ISO > 2^31 → integer error, upload fails generically | low | Crafted files only; fix adds range guards | reject |
| 11 | edge-case | `put()` on an existing key deletes it | low | Keys are fresh UUIDs; no caller reaches it; fix adds an error-code branch | reject |
| 12 | verification-gap | `register()` sweep wiring untested | medium | Pre-verified: no test calls `register()` | patch |
| 13 | verification-gap, blind | PUT to an already-ready row (409) and route-level Content-Length > 50 MB (413) untested | medium | Pre-verified: no `Conflict`/`409` hits; `contentLengthOf` only reached with small bodies | patch |
| 14 | verification-gap | `startUpload` zod validation untested | medium | Pre-verified: `startUpload` only in actions.ts and the workspace | patch |
| 15 | verification-gap | Multi-line description kept, titles flattened: untested | low | Pre-verified; a test case is a direct addition | patch |
| 16 | verification-gap | `?batch=not-a-uuid` / other staff's batch at the page untested | medium | Pre-verified; the user decision is unverified at the page | patch |
| 17 | verification-gap | `toErrorResponse` unknown-error branch untested | low | Three lines, logged 500; unlikely to regress | reject |
| 18 | blind | Tasks ticked, but the manual camera-JPEG AC is not done; spec vs sprint status differ | low | Manual check goes to the user at the present step; sprint sync happens there; fix is a spec edit | reject |
| 19 | blind | Sweep runs only at startup; empty batches never deleted | low | AD-11 defines a startup sweep; empty batches have no UI and no harm yet | reject |
| 20 | blind | Duplicate found only after derive and checks | low | Performance only; the unique index is the AD-11 guarantee; fix adds a pre-query | reject |
| 21 | blind | Embedded text and keyword count unbounded | low | Crafted XMP only; fix adds caps and constants | reject |
| 22 | blind | "Try again" after a location hit; substring match may catch harmless tags | maybe-false | Wording is a frozen user decision; tests show sharp output with a P3 ICC profile yields no hit; settling needs other ICC profiles | reject |
| 23 | blind | Row status changes not announced to screen readers | medium | No live region; rejection messages appear silently (NFR-5a) | patch |
| 24 | blind | Drag and drop untested; Safari dragleave flicker; drop outside zone before first file opens it | medium | Pre-verified by grep: every e2e uses `setInputFiles`; the AC says "drop or choose". Flicker and pre-batch drop are cosmetic (low) | patch (tests only) |
| 25 | blind | Proxy exclusion also skips future `/api/images/<id>/file…` paths | low | Direct correction: anchor with `$` | patch |
| 26 | blind | 50 MB limit written in three places | low | Fixed NFR-7 text must say 50 MB; client cannot import the Node module; fix is a refactor | reject |
| 27 | blind | No D-xxx entries for upload choices | low | Process files stay out of the code PR (D-013); recorded at `/wrap-up` | reject |

## Design Notes

**Two-request flow.** The Server Action makes all rows at once (so each file shows a row immediately and exists as `uploading` before its bytes arrive). The Route Handler then takes the raw body (`application/octet-stream`, not multipart) as a stream, so a 50 MB file is never buffered and an abort surfaces as a stream error that triggers cleanup. Rejection reasons travel as codes (`notImage`, `tooLarge`, `damaged`, `duplicate`, `unsafePreview`); the client formats them from `messages/en.json`.

**Sequential uploads.** One file at a time keeps the first cut simple and deterministic; the parallel queue is AD-13 / Story 3.1.

## Verification

**Commands:**
- `npm run db:generate` -- expected: "No schema changes" after the migration is committed
- README test command -- expected: all pass
- `npm run lint && npm run typecheck` -- expected: clean

**Manual checks:**
- Browser at 1440 px and 360 px as Ida: upload a real phone JPEG, a PNG, a renamed file and the same JPEG again.
