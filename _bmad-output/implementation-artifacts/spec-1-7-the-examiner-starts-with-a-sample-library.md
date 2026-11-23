---
title: 'Story 1.7: The examiner starts with a sample library'
type: 'feature'
created: '2026-11-23'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '0d22ad6bdd55ea3f71e0d96b9ac0881c23b2b686'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A fresh install has users but no images, so the examiner must upload and publish images before any flow or access rule can be tried, and the mock provider only returns placeholder metadata.

**Approach:** Commit about 23 of the user's own photos, prepared to about 1600 px and under 500 KB, with `SOURCES.md`. Add filename-keyed mock fixture metadata covering all seven keyword categories. Name the access-row images in `fixture.ts`. On an empty images table with `SEED_ON_START=true`, upload, generate and publish them through module functions as Ida.

## Boundaries & Constraints

**Always:** The ACs in `epics.md` § Story 1.7 are the contract. The seed calls only module functions (`createUploadRows`, `completeUpload`, `saveAccess`, `publishImage`); no raw SQL writes. The image seed runs when the `images` table is empty, independent of the users check, in its own advisory-locked step after the users seed. Each fixture row gets exactly the status, visibility, client list and price tier its access row needs, with Fjordkaffe as the viewing client. A7 is restricted to Nordlys, and S4 is restricted with an empty list. `fixture.ts` stays import-free (Playwright reads it). Committed images keep no camera metadata (model, timestamps, serials) except the location test files, which keep only the GPS, City and Country fields, and the thumbnail file, which keeps its EXIF thumbnail. The original photos never enter git. All fixture metadata is English, and every one of the seven `KEYWORD_CATEGORIES` appears at least once.

**Never:** Rows that need a licence (A3, A6, A8, A10, A12, S12–S15; Story 1.9). No contact-facing reads (1.8). No places loader, city extraction or embedded-thumbnail reading (Epic 3). No new dependencies, and no Unsplash or Pexels images.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First start | empty DB, `SEED_ON_START=true` | users, then every seed image uploaded and generated; fixture rows set as named; the rest public, free and published | N/A |
| Restart | images exist | image seed skipped | N/A |
| Users exist, no images | dev DB seeded before 1.7 | images seeded as Ida | N/A |
| `fail` file | `…-fail.jpg` | `processingState = failed`, draft unless a fixture row publishes it | logged, seed continues |
| Seed disabled | `SEED_ON_START` ≠ `true` | nothing seeded | N/A |
| Concurrent starts | two processes | one seeds, the other sees images and skips | advisory lock |
| Archive | published image | `archived`, `version` bumped | other states → `Conflict`; missing → `NotFound`; contact → `Forbidden` |

**Decisions (user, 2026-11-23):**
- A11 is seeded through a new minimal `archiveImage(actor, id)` module function (published → archived, conditional update), with no UI. Story 4.2 adds the UI on top of it.
- All 23 photos are kept, including the 4 that show children without clear faces, the signed painting and the 3M samples. `Snapchat-144364356.jpg` is the user's own.
- Licence text in `SOURCES.md` and the README: "Photos by Marthe Kalland, © all rights reserved, used only as sample data in this repo."
- Spec size about 1,900 tokens, kept as one spec.
- (Review, 2026-11-23) `book-plane-window.jpg` is dropped, because its book cover shows a swastika: the library has 22 images, and S4 moves to `gilded-frame-corner.jpg`.
- (Review, 2026-11-23) The Library page's empty branch, its sidebar text and its empty-state axe scan stay untested for now. Only `EmptyState` gets a static render test. The gap is logged in `deferred-work.md`.

</frozen-after-approval>

## Code Map

- `src/db/seed/images/` -- rename to descriptive kebab names (e.g. `jellyfish-tank.jpg`, `tromso-harbour-gps.jpg`, `aquarium-jellyfish-fail.jpg`). Resize with `sips -Z 1600` and recompress to under 500 KB. Strip metadata with `exiftool -all=`, then restore the allowed fields with `-tagsFromFile` from the original. Rebuild the EXIF thumbnail on one JPEG. Add `SOURCES.md`, with a table of file, author, licence and notes, and the prep commands. The PNG `IMG_20260720_122021652.png` keeps GPS.
- `src/modules/ai/providers/mock-fixtures.ts` -- fill `MOCK_FIXTURES: Record<string, AiOutput>` per seed filename (title, description, altText, 5–10 keywords with categories), written from what each photo shows. The `fail` file still fails, because the filename check comes first in `mock.ts`.
- `src/db/seed/fixture.ts` -- add `fixtureImages`: key → `{ file, row, status, visibility, clients: FixtureClientKey[], priceTier }` for A1, A2, A4, A5, A7, A9, A11, A13, S4, `gpsJpeg`, `thumbnailJpeg`, `locationPng`, `fail`. Add `SEED_IMAGES_DIR = "src/db/seed/images"`.
- `src/db/seed/seed.ts` -- add `seedSampleLibrary(db)`: lock, count images, return if > 0, resolve Ida and the client ids by name, then for each file: `createUploadRows(tx, ida, { filenames:[f] })`, `completeUpload(ida, id, chunks, size)`, then `saveAccess`, `publishImage` and, for A11, `archiveImage` per the fixture row (default public, free, published). Each file runs in its own step, so one failure is logged and the loop moves on. `seedOnStart` calls it after `seedIfEmpty`.
- `src/modules/images/publish.ts` -- add `archiveImage(actor, id)` beside `publishImage`: assert staff; `UPDATE … SET status='archived', version=version+1 WHERE id AND status='published' RETURNING`; 0 rows → read the row: missing → `NotFound`, otherwise `Conflict`. Export it from `index.ts`; add tests in `publish.test.ts`.
- `src/test/global-setup.ts` -- unchanged: users only, because no file store exists there.
- `src/db/seed/seed.test.ts` -- with `useTempFileStore()`, test `seedSampleLibrary` on a cleaned images state, or check that it runs once.
- `tests/e2e/empty-library.spec.ts` + `playwright.config.ts` -- the e2e DB now has images. Delete this project and keep the empty-state assertion as a Vitest render of the empty wall, if the component allows it. `shell.spec.ts` contact checks stay: the client pages are placeholders until 1.8.
- `README.md` -- lines 38, 60, 62–75: what the sample images are, their source and licence, which client sees what (table by row), and that the first start takes about 30 s (`MOCK_DELAY_MS` × images).
- Reuse: `chunksOf` pattern (`src/test/images.ts`, copied into seed rather than importing test code), `KEYWORD_CATEGORIES` (`src/modules/ai/port.ts`), `listActiveClients`.

## Tasks & Acceptance

**Execution:**
- [x] Prepare images + `SOURCES.md` -- per Code Map; check each file with `exiftool` for size, dimensions and remaining tags
- [x] `archiveImage` + tests -- the Archive matrix row
- [x] `mock-fixtures.ts` + test -- one entry per seed file; all seven categories covered; altText ≤ 125 chars
- [x] `fixture.ts` -- `fixtureImages`; test that every listed file exists and that GPS, thumbnail and PNG-location files carry those tags
- [x] `seed.ts` + `seed.test.ts` -- every matrix row
- [x] e2e adjustments per Code Map; `tests/e2e/seed.spec.ts` -- the Library shows the seeded count; the A7 tile shows "Nordlys Sykkel AS"
- [x] `README.md`

**Acceptance Criteria:**
- Given the README test command, then all Vitest and Playwright tests pass; `npm run lint` and `npm run typecheck` are clean.
- Given `docker compose up` on an empty volume, then Ida's Library shows every seed image with AI titles, and the fail image is marked failed.
- Given `du -sh src/db/seed/images`, then the total is under about 12 MB and no file exceeds about 500 KB.

## Implementation Notes

- Images: renamed to kebab names, resized with `sips` (the PNG requantised with `pngquant`), stripped with `exiftool -all=` keeping only the ICC profile; every file is under 480 KB and the folder is 8.3 MB. The PNG keeps only XMP GPS, City and Country (its CountryCode and "Polaria" Location were dropped). The originals were moved to `../g53-kalland-seed-originals/`, outside the repo.
- Seed tests live in `src/db/seed/sample-library.test.ts`, not `seed.test.ts`: the shared test DB is never empty, so that file creates, migrates and drops its own database `crm_dam_seed_test`.
- `seedSampleLibrary` commits one `uploading` row per file, in one batch, under the advisory lock, then completes each file outside the lock in its own try/catch, so a concurrent start sees images and skips.
- The empty Library is now checked by `src/app/_components/shell/empty-state.test.ts` (static render of `EmptyState`). The page's `total === 0` branch, the sidebar text and the empty-state axe scan are no longer tested.
- Outside the spec: `src/app/globals.css` `.wall-tile-meta { position: relative }` fixes a Story 1.6 bug, a visually hidden separator that escaped the tile's clipping and widened the page by 4 px, which made `shell.spec` "no horizontal scroll at 560 px" fail once the library had tiles.
- `tests/e2e/seed.spec.ts` hard-codes A7's title, because the e2e container does not hold `mock-fixtures.ts`.
- Verified on the orchestrator side: README test command 308 Vitest and 68 Playwright tests pass; lint and typecheck clean.

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Evidence | Route |
|---|-------|---------|---------|----------|-------|
| 1 | edge-case | `readdir` of the seed dir runs before the images-count check, so a missing dir throws on every start | low | `seedSampleLibrary` calls `seedImageFiles()` first; moving it after the count check is a direct reordering | patch |
| 2 | edge-case | `SEED_IMAGES_DIR` is relative to cwd | low | App (`/app`) and tests run from the repo root; unlikely, and fixing it adds path logic | reject |
| 3 | edge-case, blind | An interrupted first start leaves a partial library that later starts never complete | medium | Rows are committed as `uploading` first; a restart sees count > 0 and skips. Resuming would change the frozen "seed when images table empty" rule; the smallest fix is a README recovery note | patch |
| 4 | edge-case, blind | A partial seed (some files failed) is logged as success at info | low | `seedOnStart` always logs "Seeded N sample images."; direct fix: warn when fewer than planned | patch |
| 5 | edge-case | A missing Ida is logged as "Images exist; sample library skipped." | low | Both skips return `null`; direct fix in the log line | patch |
| 6 | edge-case | Empty seed dir logs "Seeded 0" every start | low | The dir is committed with 23 files; unlikely | reject |
| 7 | edge-case | Seed accepts a deactivated Ida | low | Seed data only; nothing deactivates users before the seed | reject |
| 8 | edge-case | With a non-mock provider or `MOCK_FAIL=true`, seed images publish as Failed silently | low | Only the mock exists until 3.5; per-file errors are logged by generation | reject |
| 9 | edge-case | A large `MOCK_DELAY_MS` can exceed the app healthcheck budget | low | Default 1.5 s × 23 ≈ 35 s against 120 s; a deliberate config change | reject |
| 10 | edge-case, blind, verification-gap | The "seeds nothing without SEED_ON_START" check cannot fail, and checks only 13 files | medium | Pre-verified: the shared images table is never empty, so `seedSampleLibrary` skips with or without the gate; fix: move the check to the dedicated empty DB | patch |
| 11 | edge-case | Seed tests are not in `seed.test.ts` as the Code Map says | false | Deviation recorded in Implementation Notes with its reason; every matrix row is covered and ran | reject |
| 12 | verification-gap, blind | The Library page's empty branch, sidebar text and empty-state axe scan lost coverage when `empty-library.spec.ts` was deleted | medium | Pre-verified: `empty-state.test.ts` builds its own element tree; no e2e run has an empty Library. The smallest real fix (an empty-DB app instance or a page-render harness) is not trivial; the user accepted the gap | defer |
| 13 | verification-gap | The per-file catch branch and the missing-Ida branch are untested | low | Only reachable with broken seed data; filed as defer | reject |
| 14 | verification-gap | `a11y.spec.ts:50` comment points at the deleted spec | low | Direct comment fix | patch |
| 15 | blind | `sample-library.test.ts` may seed the shared DB via a cached pool | false | Vitest isolates each file; if it had hit the shared DB, both seeds would return `null` and the race assertion would fail | reject |
| 16 | blind | SOURCES.md and the README leave out third-party rights (painting, book cover, 3M, children) | low | The user decided to keep these photos (frozen Decisions). But SOURCES.md says the painting is "owned by the photographer", which nobody stated: remove that claim | patch |
| 17 | blind | Spec and sprint-status missing from the diff | false | The review diff excluded `_bmad-output` on purpose; both are committed with the story | reject |
| 18 | blind | Dockerfile e2e comment and README `SEED_ON_START` row are stale | low | Direct text fixes | patch |
| 19 | blind | `chunksOf` copied instead of shared; `createUploadRows` called per file | low | The Code Map chose the copy so the app does not import test code; the per-file call is behaviour-neutral | reject |
| 20 | blind | A11 version asserted with `>= 4` | low | The path is deterministic; direct fix to an exact value | patch |
| 21 | blind | `seed.spec.ts` hard-codes the A7 title | low | The e2e container does not hold `mock-fixtures.ts` (Implementation Notes) | reject |
| 22 | blind | Comment "7–9 keywords" vs test allowing 5–10 | false | The comment describes the data, the test the schema rule; both hold | reject |
| 23 | blind | `weather_season` holds "indoors", "daylight", "evening"; `place` holds "interior" | low | `prompt.ts` defines the categories; these terms do not fit them, and examiners see these keywords first. Direct data fix | patch |
| 24 | blind | README "Own image" unexplained | low | PRD term; direct wording fix | patch |
| 25 | blind | 8.3 MB of binaries needs a D-entry | false | The story AC requires committing the images; the D-entry belongs to `/wrap-up` | reject |

## Design Notes

Image seeding is separate from user seeding because existing dev DBs already have users. Ordering inside one advisory lock id keeps concurrent starts safe. The seed awaits generation, so the first dev start is slow by `MOCK_DELAY_MS` per image; tests use 0.

## Verification

**Commands:**
- `exiftool -q -T -FileName -ImageSize -FileSize -Model -GPSPosition -City -ThumbnailLength src/db/seed/images` -- expected: ≤ 1600 px, < 500 KB, Model empty, GPS only on the location files
- README test command -- expected: all pass
