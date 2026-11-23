---
title: 'Story 1.8: A contact finds the images their client may see'
type: 'feature'
created: '2026-11-23'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '5ad23cc6443b505a0e5c04614501d40d201035ce'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Contacts log in to a placeholder Find images page. Nothing decides what a client may see, and the thumbnail route is staff-only.

**Approach:** Fill the empty access module with one "visible to client X" SQL condition, computed `own`/`canDownload`/`canBuy` flags and a fixed-column `ClientImage`. Build the client Find images wall, the read-only client Details panel and guarded thumbnail/preview files on top of it. Prove it with table-driven HTTP tests over the fixture rows for both seeded clients.

## Boundaries & Constraints

**Always:** The ACs in `epics.md` § Story 1.8 are the contract.
- Visible = `published AND (public OR (restricted AND client listed))`.
- Own = `published AND free AND restricted AND client listed` (A4). The licence branch arrives with the `licences` table in 1.9, so write the condition so 1.9 only adds an `OR`.
- canDownload = own OR (published, public, free).
- canBuy = visible AND paid AND NOT own.
- Restricted with an empty list is never visible (S4).
- Every client list, count, page and file uses the same condition. Anything not visible gives 404, never 403, and is absent from lists and counts.
- `ClientImage` is built from an explicit column list. It never selects latitude/longitude, `*Source` columns, client lists or staff-only fields.
- `clientMaySeeLocation()` returns `false`.
- Files are sent with `Cache-Control: private, no-store`. GET never writes. No caching APIs are used.
- All strings go in `messages/en.json`. Untrusted text is rendered escaped.

**Never:** Search, filters or My images (4.4). Download, cart or Add to cart (1.9 / Epic 5). Licence rows A3/A6/A8/A10/A12 (1.9). Overview (4.8). No staff "full image page". No new dependencies or migrations.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Wall | contact, visible images | newest first (createdAt, id desc), 48 per page, count from the same condition; title or "Untitled image"; "90 USD" or "Free" | page past end → last page |
| Nothing visible | client with no visible images | empty state | N/A |
| Select visible | `/find-images?image=<id>` | wall plus Details panel | N/A |
| Select hidden / missing / bad uuid | A7 for Fjordkaffe, A9, A11, A13, S4, random id | 404 Not found page | `notFound()` |
| Thumbnail / preview, contact | `/api/images/<id>/thumbnail\|preview` | access check first, latest version's WebP, `private, no-store` | not visible → 404 |
| Thumbnail / preview, staff | same routes | any image; behaviour unchanged | missing → 404 |
| Paid image panel | A2, A5 | licence card "Standard commercial use — 90 USD"; "Read the licence terms" opens a dialog with the current licence text | N/A |
| Location / leaks | GPS seed images | no GPS, place name, provider data, staff fields or other client names in any client response | N/A |

**Decisions (user, 2026-11-23):**
- Own tiles (A4) get the green tick (UX-DR-15) and the caption "Yours to download" (UX-DR-13) now, even though the panel has no Download button until Epic 5.
- The spec is about 2,100 tokens and stays one spec, as in Story 1.7.

</frozen-after-approval>

## Code Map

- `src/modules/access/index.ts` (+ `visibility.ts`, `client-images.ts`) -- now empty.
  - `visibleTo(clientId)` and `ownedBy(clientId)`: SQL fragments using `exists` on `imageClients`.
  - `listClientImages(actor, page)`: `{items, total, page, pageCount}`, using `LIBRARY_PAGE_SIZE` and the clamping logic from `src/modules/images/library.ts:63`.
  - `getClientImage(actor, id)`: `ClientImage | null`.
  - `clientMaySeeLocation`.
  - Contact-only: a staff actor gets `Forbidden`.
  - `ClientImage`:
    - id; title via `displayTitle` (`images/display.ts`); description; altText; keywords; dateTaken; camera make/model/lens/exposure/fNumber/focalLength/iso.
    - width/height from the latest version (copy the `latestVersion` subquery idea).
    - price `{licenceTypeId, priceMinor, currency} | "free"` from `currentLicenceType` (`licences/types.ts:39`).
    - own, canDownload, canBuy.
    - fileVersionId, which file routes need.
- `src/modules/licences/types.ts` -- add `currentLicenceText(db, licenceTypeId)`: the latest `licenceTexts` version's body. Export it from `index.ts`.
- `src/modules/auth/guards.ts` -- add `requireUser()` (any active role, same redirects) for the file routes.
- `src/app/api/images/[id]/thumbnail/route.ts` + new `preview/route.ts`:
  - `requireUser()`.
  - Contact: `getClientImage`, null → `NotFound`, then `openDerivedFile(image.fileVersionId, kind)` (`media/files.ts:72`).
  - Staff: the existing `getThumbnail` path, generalised to a `kind` argument in `images/uploads.ts:197`.
  - Keep the uuid check, headers and `toErrorResponse`.
- `src/app/(staff)/library/image-wall.tsx` -- extract the tile frame, wall list and `LibraryPagination` into `src/app/_components/wall/`, with an `hrefFor(page, id?)` prop. The staff wall keeps its tags and meta, and its behaviour stays the same.
- `src/app/(client)/find-images/page.tsx` -- replace the placeholder.
  - `requireContact()`; zod `?page`/`?image` as in `(staff)/library/page.tsx:15`.
  - A bad or hidden `image` → `notFound()`.
  - Client tiles: when `own`, the 26 px tick at the top right and the caption "Yours to download"; otherwise the price.
  - Wall plus `client-details-panel.tsx`: preview, title, "About the image" and "Technical details" sections with empty fields left out, and a licence card when `canBuy`.
  - `licence-terms-dialog.tsx` is a client component using the Designsystemet `Dialog`.
- `src/app/not-found.tsx` -- new. Uses `errors.notFound`; none exists today.
- `messages/en.json` -- new `findImages.*` keys: panel sections, field labels, the licence card and the dialog.
- Reuse: `formatPrice`, `EmptyState`, `PageMain`, `ContextSidebar`; `src/test/factories.ts`, `src/test/library-images.ts` and `images-routes.test.ts` helpers; `fixtureImages` and contacts jonas (Fjordkaffe) and emil (Nordlys).
- Leave alone: staff `details-panel.tsx`, the upload `file/route.ts`, the schema.

## Tasks & Acceptance

**Execution:**
- [x] `src/modules/access/*` + `access.test.ts` -- condition, flags, list/get, `clientMaySeeLocation`. Table-test every A/S row available without licences, for a listed and an unlisted client. Assert that the `ClientImage` keys are exactly the fixed list.
- [x] `licences/types.ts` + test -- `currentLicenceText`.
- [x] `guards.ts`, thumbnail and preview routes, plus cases in `images-routes.test.ts` -- contact visible/hidden, staff, headers.
- [x] Wall extraction + Find images page + panel + dialog + `not-found.tsx` + `en.json`.
- [x] `tests/e2e/client-access.spec.ts` -- a table over A1, A2, A4, A5, A7, A9, A11, A13, S4 × jonas/emil, through the request API with `Origin`. Check the image page (`?image=`) for 200/404, thumbnail, preview, list presence (titles), and the count. Leak check: the wall and panel HTML for the GPS images contain no coordinates or place names and no other client's name.
- [x] `tests/e2e/find-images.spec.ts` -- the panel sections, the licence dialog opening with the text, and an axe scan. Update the `shell.spec.ts` contact checks that assumed the placeholder.

**Acceptance Criteria:**
- Given the README test command, then all Vitest and Playwright tests pass, and `npm run lint` and `npm run typecheck` are clean.
- Given a Fjordkaffe contact after a fresh `docker compose up`, then Find images shows every visible seed image and A7 is absent. For a Nordlys contact, A7 shows and A4/A5 are absent.

## Implementation Notes

- `ClientImage.price` is read by access itself (`currentPrice` in `client-images.ts`), not through `licences.currentLicenceType`, because licences will call access (AD-3). The query uses the same oldest-first order, and `access.test.ts` asserts that `price.licenceTypeId` equals `currentLicenceType().id`.
- File routes go through `src/app/api/images/derived-file.ts`. A contact goes `getClientImage` → `openDerivedFile` (media); staff go through `images.getDerivedFile` (renamed from `getThumbnail`, with a `kind` argument).
- The paging clamp is shared as `images.pageWindow()`, used by `listLibrary` and `listClientImages`.
- Wall strings moved from `library.*` to a shared `wall.*` namespace; the staff texts are unchanged.
- The axe scans for the panel, the licence dialog and the 404 page are in `tests/e2e/a11y.spec.ts` `SCAN_LIST`, following the repo convention, not in `find-images.spec.ts`.
- `client-access.spec.ts` runs in the "seeded library" Playwright project, so its counts are exact (16 for Fjordkaffe, 15 for Nordlys).
- The e2e leak check cannot search for UI words, because next-intl puts the whole messages file into each page. It checks data names instead (`priceTier`, `clientNames`, `filename`, `processingState`).
- `ClientImage` leaves out `dateTakenOffset`. Find images has no Context sidebar yet (filters come in 4.4).
- Verified on the orchestrator side: the README test command gives 346 Vitest and 97 Playwright tests passing; lint and typecheck are clean.
- The second AC (a manual `docker compose up`) was not checked by hand. `client-access.spec.ts` asserts the same visibility against a freshly seeded test DB.

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Evidence | Route |
|---|-------|---------|---------|----------|-------|
| 1 | blind | Each thumbnail and preview request builds a full `ClientImage` plus a price query just to read `fileVersionId` | low | Real, but small at 22–48 tiles. A lean access function adds public surface | reject |
| 2 | blind | The current licence type is defined twice; drift silently hides the licence option | false | `access.test.ts` "gives a paid image the current licence type's price" asserts that `price.licenceTypeId` equals `currentLicenceType().id`, so drift fails a test | reject |
| 3 | blind | One page load reads the licence type three times | low | Negligible round trips | reject |
| 4 | blind, edge-case | Count and rows are read in two queries, so a concurrent publish can split them | low | Transient and self-correcting on reload. Same pattern as `listLibrary`. The fix adds a transaction wrapper | reject |
| 5 | blind, verification-gap | `formatDateTaken` and `cameraName` are never exercised (seed images have no EXIF date or camera) | medium | Pre-verified: grep finds no test, and the e2e asserts both fields are absent. Real uploads have EXIF | patch |
| 6 | blind | No test for a visible image without a file (contact branch `!image?.fileVersionId`) | low | Direct test addition, no code change | patch |
| 7 | blind | The panel preview's alt is `altText ?? ""`, which marks the image as decorative | medium | NFR-5a: alt = alt text → title → "Untitled image", and no image may be decorative. `image.title` already carries the fallback | patch |
| 8 | blind | The licence scope sentence is a fixed UI string, not tied to the licence type | low | v1 has one licence type (FR-40 later) | reject |
| 9 | blind | `?q=` is silently ignored | low | The intent excludes search (4.4), and the placeholder also ignored `q` | reject |
| 10 | blind | The e2e helpers read only page 1 of the walls | low | 22 seed images against 48 per page | reject |
| 11 | blind | The access count test can still be flaky: the `other` read is not bracketed | medium | Other Vitest files publish public images concurrently on the shared DB. The loop only checks that the two `listed` reads match. Direct test fix | patch |
| 12 | blind | `ownedBy` and `visibleTo` are exported publicly with no outside caller | low | grep finds no caller outside access. Removing the exports is a direct deletion | patch |
| 13 | blind | The 404 page drops the shell and has no `<title>` | low | The ACs ask only for a Not found page. A group-level `not-found.tsx` adds a file | reject |
| 14 | verification-gap | Shared `WallPagination` is never rendered in any test (≤ 48 images in e2e) | medium | Pre-verified gap. It predates this change for the Library. The cheap fix is a static render test of `Wall` | defer |
| 15 | verification-gap | The page's `total === 0` empty branch never runs; the `EmptyState` test renders the component only | medium | Pre-verified: every test DB holds public images. Same class as 1.7 triage #12 | defer |
| 16 | edge-case | A selected visible image with `total` read as 0 gives the empty state | low | Needs the same read race as #4, at the moment the client's last visible image changes | reject |
| 17 | edge-case | The e2e leak check does not search for the city name | low | `ClientImage` has no place field, and its exact-keys unit test guards that. The city appears in the AI title, which is allowed | reject |
| 18 | edge-case | The axe scans are in `a11y.spec.ts`, not `find-images.spec.ts` | low | Repo convention; recorded in Implementation Notes | reject |

## Design Notes

The access module owns no tables. It reads `images`, `image_clients`, `file_versions` and `licence_types` so that one module holds the rule. `fileVersionId` stays on `ClientImage` so that file routes never query images themselves.

`?image=` mirrors the staff Library, which keeps the "panel never navigates away" UX. The "image page" in the ACs is therefore `/find-images?image=<id>`, which returns a 404 page for hidden ids.

## Verification

**Commands:**
- README test command -- expected: all pass
- `npm run lint && npm run typecheck` -- expected: clean
