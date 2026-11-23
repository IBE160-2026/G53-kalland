---
title: 'Story 1.6: Staff publish an image with its visibility and price'
type: 'feature'
created: '2026-11-23'
status: 'done'
route: 'dispatch'
review_loop_iteration: 1
baseline_commit: 'ba342fe88c99c2211bd564082c40afae695afba4'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Uploaded images end as drafts that nobody can find or publish: the Library is an empty placeholder, there is no way to set visibility, clients or price, and no licence type exists to price a paid image.

**Approach:** Seed one licence type with a text version (new licences tables). Build the Library wall (all images, newest first, paged) and a Details panel with view mode, Edit → Save changes for the access controls (optimistic `version`, restricted list as a diff), and "Publish this image" with a missing-metadata confirm dialog. Record `visibleToAllSince` and `image_clients.addedAt`.

## Boundaries & Constraints

**Always:** The story ACs in `epics.md` § Story 1.6 are the contract. Every transition and save is one conditional `UPDATE … WHERE … RETURNING`; 0 rows → `Conflict` (AD-8), never select-then-update. Publish requires `status = draft AND processingState in (ready, failed)`; it sets `publishedAt` and never returns to draft; publishing a published image is a no-op (no error, nothing changes). Publishing while `uploading|queued|generating` is refused with a `Validation` carrying a reason key. Save changes sends the loaded `version` and bumps it; a mismatch → `Conflict` → "Your change was not saved. Try again." (NFR-7, word for word), edit mode and values kept. Restricted list sent as `{ added, removed }`; only active clients may be added. `visibleToAllSince` is set to `now()` when visibility changes to `public` from anything else, and cleared when it leaves `public`. `image_clients` rows carry `addedAt`. Price is integer minor units + `USD`, ex VAT, formatted "90 USD" / "Free"; the paid price always comes from the current licence type (images store only `priceTier`). Writes: images writes `images`/`image_clients`; licences writes `licence_types`/`licence_texts`; seed goes through module functions. Every page/action calls `requireStaff()` first; module write functions take the `Actor` and assert staff. All strings in `messages/en.json`. `displayTitle()` gives "Untitled image". Migration via `drizzle-kit generate`.

**Never:** No metadata field editing (FR-17, Epic 3), no locks (FR-18), no search/filters/sort/captions switch (4.1), no archive (4.2), no image page (4.3), no batch publish (3.15), no client-facing reads or `access` module code (1.8), no `licences`/`cart_items` tables (1.9), no Settings page or price editing (6.2), no live tag updates (3.1). No new dependencies.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Publish ready draft | draft, `ready`, all metadata | `published`, `publishedAt` set; panel shows Published | N/A |
| Missing metadata | draft lacking alt text + keywords | dialog lists "alt text, keywords", says harder to find and less accessible; Publish publishes, Go back / Escape cancels | — |
| Publish failed draft | draft, `failed` | publishes (after dialog if fields missing) | — |
| Not finished | `queued` / `generating` / `uploading` | nothing changes | reason message; button disabled with the reason in the panel |
| Publish twice | already `published` | no change, `publishedAt` unchanged | no error |
| Stale save | `version` 3 sent, row at 4 | nothing written | "Your change was not saved. Try again.", edit mode kept |
| Become public | internal → public | `visibleToAllSince = now()` | — |
| Restricted, none | Restricted, empty list | inline warning (S4); saves | — |
| Inactive client | `added` holds an inactive or unknown client id | nothing written | `Validation` |

**Decisions (user, 2026-11-23):**
- The unsaved-changes dialog (UX-DR-20) is deferred to Story 3.4, when metadata fields join edit mode. Until then, selecting another tile or page while editing drops the edits without asking.
- Spec size: about 2,700 tokens, kept as one spec, because the seed, wall, panel, save and publish all build the one Library screen.
- (Review, 2026-11-23) Saving with visibility Public or Internal deletes the image's restricted list. Switching back to Restricted starts empty, and each re-added client gets a fresh `addedAt`, as `visibleToAllSince` is reset when an image leaves Public.

</frozen-after-approval>

## Code Map

- `src/db/schema/images.ts` -- add `images.visibleToAllSince` timestamptz null; index `images_created_at_idx` on `(created_at desc, id desc)`; new `imageClients` table (`imageId` → images cascade, `clientId` → clients restrict, `addedAt` timestamptz default now, PK `(imageId, clientId)`, index on `client_id`).
- `src/db/schema/licences.ts` (new) + `schema/index.ts` -- `licenceTypes` (uuidv7 id, `tenantId`, `name`, `priceMinor` int check ≥ 0, `currency` char(3), `createdAt`); `licenceTexts` (id, `licenceTypeId` → restrict, `version` int, `body` text, `createdAt`, unique `(licenceTypeId, version)`). Migration `0005_publish.sql` via `npm run db:generate -- --name publish`.
- `src/modules/licences/` -- `types.ts`: `ensureStandardLicenceType(tx)` (idempotent: inserts "Standard commercial use", 9000, USD, text v1 if none exists), `currentLicenceType(db)` → `{ id, name, priceMinor, currency }`; `money.ts`: `formatPrice(minor, currency)` → "90 USD" (integer math, cents shown only when non-zero: "90.50 USD"). Export via `index.ts` (replace `export {}`).
- `src/modules/accounts/clients.ts` -- add `listActiveClients()` → `{ id, name }[]` by name.
- `src/modules/images/library.ts` (new) -- `listLibrary(actor, page)` → `{ items, total, page, pageCount }`, 48 per page, order `createdAt desc, id desc`, each item `{ id, title, status, processingState, visibility, priceTier, clientNames[], width, height, version }`; `getLibraryImage(actor, id)` → details incl. description, altText, keywords, `clients: {id,name}[]`, `missingFields` (title, description, altText, keywords); `displayTitle(title)` in `display.ts`.
- `src/modules/images/publish.ts` (new) -- `publishImage(actor, id)`; `saveAccess(actor, id, { version, visibility, priceTier, clients: { added, removed } })` in one transaction (conditional version update, insert added `onConflictDoNothing`, delete removed). Reasons: `errors.publishNotReady`.
- `src/db/seed/seed.ts` -- call `ensureStandardLicenceType(tx)` in its own step that runs even when users already exist (idempotent), so existing dev DBs get it.
- `src/app/(staff)/library/page.tsx` -- server: `searchParams` `page` (int ≥ 1, default 1) and `image` (uuid) via zod; renders wall + panel; out-of-range page → last page. `library/actions.ts` -- `publishImageAction`, `saveAccessAction` (guard → zod → one module call → `toFormState`), `revalidatePath("/library")`.
- `src/app/(staff)/library/{image-wall,details-panel,access-controls,publish-dialog}.tsx` -- tiles are `<Link href="?image=…&page=…" aria-current>` buttons-styled with the 480 px `/api/images/[id]/thumbnail`; justified rows via `flex-grow: width/height` at 168 px row height. Designsystemet `Tag`, `Pagination`, `ToggleGroup`, `Chip.Removable`, `Select`, `Alert`, `Dialog`, `Button`. Reuse `TAG_COLOR` from `upload/file-row.tsx` (move to a shared `_components/status-tag.tsx`).
- `messages/en.json` -- `library.*` (count "{n} images, newest first", tile labels, panel sections, access labels, hint, S4 warning, price line "{price} per licence, ex VAT", publish dialog), `errors.publishNotReady`, `errors.saveFailed` ("Your change was not saved. Try again.").
- Reuse, don't change: `toFormState` (`src/modules/shared/errors.ts`), `loginAs` (`src/test/login-as.ts`, `tests/e2e/helpers.ts`), factories (`src/test/factories.ts`), `makeJpeg`/`useTempFileStore` (`src/test/images.ts`).

## Tasks & Acceptance

**Execution:**
- [x] schema + migration per Code Map -- AD-6, AD-8, AD-18
- [x] `src/modules/licences/*` + `licences.test.ts` -- idempotent seed of the type and text v1; `formatPrice` (9000 → "90 USD", 0 → "0 USD", 9050 → "90.50 USD")
- [x] `accounts.listActiveClients` + test
- [x] `src/modules/images/{library,publish,display}.ts` + tests -- every matrix row; paging (49 images → 2 pages, newest first); contact `Actor` → `Forbidden` on every function; `publishImage` parallel calls publish once
- [x] `src/db/seed/seed.ts` + `seed.test.ts` -- licence type present after seed, once
- [x] Library page, components, actions + `actions.test.ts` -- stale version maps to `errors.saveFailed`
- [x] `messages/en.json`
- [x] `tests/e2e/library.spec.ts` -- upload a file as Ida, open it in the Library, Edit → Restricted with Fjordkaffe + Paid → Save changes → tile shows "Fjordkaffe · 90 USD"; Publish with the missing-metadata dialog (Go back, then confirm) → Published; S4 warning shows with no clients
- [x] `README.md` -- test counts; Library in the feature list

**Acceptance Criteria:**
- Given the README test command, then all Vitest and Playwright tests pass, including the axe check on `/library` with the panel open.
- Given `npm run lint` and `npm run typecheck`, then both are clean.
- Given a selected tile, when Edit → Save changes succeeds, then the panel returns to view mode, shows "Changes saved" and focus is on Edit; Cancel returns to view mode without saving.

## Implementation Notes

- `tests/e2e/shell.spec.ts`: the Library empty-state test moved to `tests/e2e/empty-library.spec.ts`, which `playwright.config.ts` runs as its own project before all others (`dependencies`). Once the wall is real, uploads from parallel spec files would otherwise make it flaky. The sidebar note "Filters appear when the library has images." now shows only while the Library is empty, so the shell's sidebar test no longer checks it.
- `publishImage` returns `true` when this call published and `false` for the no-op; after 0 rows it reads the row only to choose the outcome (published → no-op, draft → `Validation(errors.publishNotReady)`, archived → `Conflict`, missing → `NotFound`). The publish update also bumps `version`, so an access form loaded before the publish fails with the NFR-7 message instead of overwriting.
- `saveAccess` throws `Conflict("errors.saveFailed")` on a stale version and a plain `Validation` for an inactive or unknown added client. On a failed save the panel keeps edit mode and values and refreshes the page data, so Save changes can succeed when tried again.
- `currentLicenceType` returns `null` before the seed has run (`SEED_ON_START=false`); the UI then shows "Paid" without an amount.
- `displayTitle` reads "Untitled image" from `messages/en.json` (`library.untitled`), so the string stays in the messages file.
- Correlated subqueries in `library.ts` use table aliases: Drizzle leaves columns unqualified in a single-table select, which made `image_id = id` bind to the inner table.
- The module tests cover the "not finished" refusal for `uploading` and `generating` (live lease); `queued` is left out because `failInterruptedGenerations`, run by other test files in parallel, turns every queued image into failed.
- Tile and panel tags: the status tag always, plus the processing tag unless `ready`. Restricted without clients shows "Internal only" on the tile (S4).

- Review fixes (loop 1): `saveAccess` deletes the restricted list when visibility is not Restricted; the S4 note shows in view mode; axe scans added for the empty Library, edit mode and the publish dialog; dead exports removed.
- Full run after the fixes: the paging test compared `createdAt` in milliseconds while Postgres sorts by microseconds and failed on a tie; it now compares microseconds. The same run hit Story 1.5's known sweep race once (logged in `deferred-work.md`). Re-run: 253 Vitest and 68 Playwright tests pass; lint, typecheck and `db:generate` clean.

## Spec Change Log

- **Review loop 1 (2026-11-23).** Trigger: review finding 4 (edge-case + blind), the restricted list is kept, hidden, when visibility leaves Restricted and resurfaces later with its old `addedAt`. The spec did not settle it (intent gap); the user decided "clear when leaving Restricted", recorded in the frozen Decisions. Known-bad state avoided: stale clients and wrong "visible since" for them. Deviation from the workflow: the code was not reverted and re-derived; the one-rule change was sent to the implementer as a targeted fix with the patch findings, because the rest of the implementation passed review. KEEP: everything else in the implementation.

## Review Triage Log

| # | Layer | Finding | Verdict | Evidence | Route |
|---|-------|---------|---------|----------|-------|
| 1 | blind, edge-case | Retry after a stale save overwrites the other person's visibility/price; `edit.initial` stays stale | low | Retry after the NFR-7 "Try again" message is last-save-wins, the PRD addendum's chosen FR-18 fallback; the client list is safe (diff). Only the change count uses the stale baseline | reject |
| 2 | edge-case | `saveAccess` can change an archived image | false | No archive exists yet (4.2); FR-21 lets staff change access after publishing; AD-8 sets no archived precondition for access | reject |
| 3 | edge-case | Client deactivated between the active check and the insert | low | Needs a deactivation in the same milliseconds; fix adds row locking | reject |
| 4 | edge-case, blind | Restricted list kept when leaving Restricted; resurfaces with old `addedAt` | medium | `saveAccess` never deletes rows when visibility ≠ restricted; panel keeps the chips. Intent gap, answered by the user | intent_gap → targeted fix |
| 5 | edge-case, blind | Unknown image id → `Conflict("errors.saveFailed")`, not `NotFound` | low | Only a tampered form or a deleted image can send it; nothing deletes images until 3.12; fix adds a branch | reject |
| 6 | edge-case | `formatPrice` assumes 2-decimal currencies | low | v1 has USD only (FR-23); fix adds Intl logic | reject |
| 7 | edge-case | width/height 0 breaks tile flex | false | `fileVersions` sizes come from sharp on a decoded image; never 0 | reject |
| 8 | edge-case | Count and page queries not in one snapshot | low | Cosmetic for one render; fix adds a transaction | reject |
| 9 | blind | Tile says "Internal only" for Restricted with no clients; panel view says "Restricted", "None" | low | Pre-verified in `details-panel.tsx` view `dl`; UX-DR-23 view mode should show the same as edit; direct fix: show the S4 note in view mode | patch |
| 10 | blind | "Visible since" can predate publishing | false | AD-6 defines it as the latest of `publishedAt`, `visibleToAllSince` and `addedAt`, so `publishedAt` bounds it | reject |
| 11 | blind | No contact-cookie test of the actions; `listActiveClients` takes no Actor | low | Actions call `requireStaff()` first; module write functions have contact `Forbidden` tests (AD-7); `listActiveClients` is a read used only by a guarded page | reject |
| 12 | blind | `queued` publish refusal untested | low | Same `where` clause as the tested states; a queued row is swept by parallel test files (Implementation Notes) | reject |
| 13 | blind | `displayTitle` returns a UI string from a module, bypassing next-intl | low | Architecture Conventions (Display) put `displayTitle()` with "Untitled image" in images; Norwegian pack is post-v1 | reject |
| 14 | blind | Dead exports: `rawTitle` (test-only), `TAG_COLOR` export, `STANDARD_LICENCE_TYPE` export | low | Pre-verified by grep: no outside users; CLAUDE.md "no dead code"; direct deletion. (`LibraryItem.version` is used by the panel: false part) | patch |
| 15 | blind | Playwright `empty library` dependency brittle against a non-empty dev DB | low | AD-7: every e2e run starts from a fresh DB; README command does `down -v` | reject |
| 16 | blind | Publish button stays disabled until reload while generating | false | Generation is inline in the upload PUT; live state is 3.1 (Never list) | reject |
| 17 | blind | Two correlated subqueries per row for size | low | 48 rows; NFR-4 measured in 7.2 | reject |
| 18 | blind | Loupe uses the 480 px thumbnail | false | 480 px covers a 236 px loupe at 2× | reject |
| 19 | blind | Paid saveable with no licence type | low | Seed always creates it, on every start | reject |
| 20 | blind | No unique constraint on `licence_types` | low | One writer under an advisory lock; fix adds a constraint | reject |
| 21 | blind | Diff leaves out migration meta and `_bmad-output`; seed behaviour change needs a D-entry | false | The review diff excluded them on purpose; the D-entry belongs to `/wrap-up` | reject |
| 22 | blind | a11y entry with `path: "/upload"` and h1 "Library" reads like a mistake | low | Direct fix: one comment | patch |
| 23 | verification-gap | Empty-Library axe scan no longer reliable | medium | Pre-verified by the layer; patch: axe scan in `empty-library.spec.ts` | patch |
| 24 | verification-gap | Edit mode and publish dialog never axe-scanned | medium | Pre-verified; patch: two scan-list entries | patch |
| 25 | verification-gap | Tile for Restricted with no clients never checked | medium | Pre-verified; patch: e2e assertion | patch |
| 26 | verification-gap | Panel refresh after a stale save not covered in e2e | low | Filed disposition defer (needs a two-page setup) | defer |
| 27 | verification-gap (other) | Upload row uses its own title fallback | maybe-false | Only differs for a whitespace-only stored title; would be low | reject |

## Design Notes

**Selection in the URL.** `?image=<id>&page=<n>` keeps the panel server-rendered (AD-4 reads in Server Components), survives reload, and makes tile selection a link. The panel is a client component only for edit state.

**Publish refusal.** The panel disables "Publish this image" with the reason ("This image is still being processed. Publish it when it is ready.") for unfinished images; the module still refuses, so a stale page gets the same message.

**Missing fields** are computed in the module (`missingFields`), so the dialog and later batch publish (3.15) share one rule.

## Verification

**Commands:**
- `npm run db:generate` -- expected: "No schema changes" after the migration is committed
- README test command -- expected: all pass
- `npm run lint && npm run typecheck` -- expected: clean

**Manual checks:**
- Browser as Ida: upload, find the draft in the Library, set Restricted + Paid, publish; tile shows client name and "90 USD".
