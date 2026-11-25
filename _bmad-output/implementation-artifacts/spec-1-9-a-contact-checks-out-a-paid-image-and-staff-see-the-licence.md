---
title: 'Story 1.9: A contact checks out a paid image and staff see the licence'
type: 'feature'
created: '2026-11-25'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '530961e767a4ea28f9139c0a2a0f9cfe7e958237'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A contact can see a paid image but cannot license it. No `licences` table exists, so "own" covers only A4, and staff have no transaction log. The Epic 1 checkpoint (SC-3) cannot pass.

**Approach:** Add the `licences` table and `licences.grantLicence` as the only grant path. Add a single-image checkout (the fallback for the Epic 5 cart) that re-checks the line through access under a per-client advisory lock. Add the licence branch to access's "own" condition. Add a staff Licences tab. Seed licence rows A3/A6/A8/A10/A12. Prove it with an SC-3 e2e test.

## Boundaries & Constraints

**Always:** The ACs in `epics.md` § Story 1.9 are the contract.
- `grantLicence(tx, actor, …)` is the only licence insert. It stores client, contact, source, image, the image's raw title at the time, licence type, licence text id, price minor, currency and timestamp. It inserts with `on conflict do nothing` against the partial unique index `(client_id, image_id) where revoked_at is null`, and returns `{ licence, created }`.
- Checkout runs as one transaction: `pg_advisory_xact_lock` on the client id, then access re-checks the line in the same `tx` (visible, `canBuy`, same licence type and price), then `grantLicence` (source `purchase`). If anything fails the re-check, nothing is written.
- Own = the existing A4 branch OR the client holds an unrevoked licence (any status, so A12 stays own).
- The NFR-7 texts are exact and live in `en.json`: "*title* was removed from your cart: it is no longer available." and "The price of *title* has changed from *old* to *new* USD. Confirm to continue." *old* and *new* are major units without currency.
- Check out stays disabled, with "Accept the licence terms to continue." shown next to it, until the terms box is ticked. A double submit records one licence.
- `clientId` and `contactId` come only from the `Actor`. Every new page and action calls its guard first. Staff-only pages give a contact 403.

**Never:** A cart, cart_items, Add to cart or a cart button (5.6). Downloads or Download buttons (Epic 5). Licence filters or paging (5.x). Revoke columns other than `revoked_at` (5.7). The client Licences tab (FR-33). Activity log entries (6.1). New dependencies. Editing applied migrations.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Start checkout | `canBuy` image (A2, A5), "License this image" in the panel | `/checkout?image=<id>`: one line (title, licence type, price), "Read the licence terms", terms checkbox, Check out | not visible / not buyable → 404 |
| Success | terms ticked, price unchanged | licence recorded → `/checkout/confirmation?licence=<id>` lists the image with a link back to Find images | N/A |
| Price changed | seen price ≠ current | nothing recorded; NFR-7 price message and "Confirm new price", which resubmits with the new price | N/A |
| Gone / free / held | hidden, now free, or already own | nothing recorded; NFR-7 removed message using the title the form submitted; Check out not offered | N/A |
| S7 direct call | free or own image id sent straight to the action | refused at `licences.checkOut`; no row | removed message |
| S5 | two parallel checkouts, same client and image | exactly one active licence | second gets "removed" (already held) |
| Staff Licences | `/licences` | table newest first: client, contact, image title (fallback "Untitled image"), licence type, price ("90 USD"), date (Europe/Oslo) | none → empty state |
| Confirmation for another client's licence | `?licence=` that is not the contact's client | 404 | `notFound()` |

**Decisions (agent, 2026-11-25; the user can override at the checkpoint):**
- Seed licences: A3 public, A6 restricted to Fjordkaffe, A8 restricted to Nordlys, A10 internal, A12 archived public. All five are paid. Each is purchased by Jonas (Fjordkaffe) at the current price, via `grantLicence` after the images are seeded. For Nordlys, A3 and A8 are buyable and the other three are absent.
- The confirmation page has no Download button yet (Epic 5). It links back to Find images.
- The title in the "removed" message comes from the submitted form, so the message never reveals the title of an image the client cannot see.

</frozen-after-approval>

## Code Map

- `src/db/schema/licences.ts` -- add `licences` (snake_case): id, tenant_id, client_id → clients, contact_id → users (nullable), image_id → images, image_title text null, licence_type_id, licence_text_id → licence_texts, source text + check (`purchase|free_download|staff_grant`), price_minor int ≥ 0, currency char(3), created_at, revoked_at null. Add the partial unique index. Then `npm run db:generate` → `0006_*.sql`.
- `src/modules/licences/`:
  - `grant.ts` `grantLicence`.
  - `checkout.ts` `checkOut(actor, { imageId, licenceTypeId, seenPriceMinor, seenTitle })` returns `{ ok, licenceId } | { removed, title } | { priceChanged, title, oldMinor, newMinor, currency }`. It opens the tx itself (AD-20) and uses a lock key derived from the client id (e.g. `hashtextextended(client_id::text, 0)`).
  - `log.ts` `listLicences(staffActor)` and `getClientLicence(contactActor, id)`.
  - `types.ts`: `currentLicenceText` must also return the text id.
  - Export all of these from `index.ts`.
- `src/modules/access/visibility.ts` `ownedBy` -- add the `or` term: an `exists` on `licences` with the client and `revoked_at is null`. `getClientImage(actor, id, db = getDb())` -- add the optional `tx` so checkout re-checks inside its transaction. Access reads `licences` (read-only).
- `src/db/seed/fixture.ts` -- add a3/a6/a8/a10/a12 on five unnamed seed files (e.g. aerial-coast-plane-window, birch-path-thaw, king-crab-claw, seal-pool-window, starfish-aquarium), each with `licensedTo: ["fjordkaffe"]`. Update the comment.
- `src/db/seed/seed.ts` `seedSampleLibrary` -- after the loop, grant the fixture licences as Jonas through `grantLicence`.
- `src/app/(client)/find-images/client-details-panel.tsx` -- add a "License this image" link to `/checkout?image=<id>` in the licence card.
- `src/app/(client)/checkout/page.tsx`, `checkout-form.tsx` (client, `useActionState`), `actions.ts` (`requireContact`, zod, `checkOut`, `redirect` on ok), and `confirmation/page.tsx`. Reuse `LicenceTermsDialog` and `formatPrice`.
- `src/app/(staff)/licences/page.tsx` -- `requireStaff`, a Designsystemet `Table`, `EmptyState`. Add `licences` to the `nav.ts` staff tabs and to the `labelKey` union.
- `src/modules/shared/` -- add an Oslo date formatter (`Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Oslo" })`). None exists yet.
- `messages/en.json` -- add `checkout.*`, `licences.*` and `nav.licences`.
- Tests to reuse: `src/test/factories.ts`, `library-images.ts`, `login-as.ts`; `tests/e2e/helpers.ts`; `library.spec.ts` (the upload → save access → publish steps); `client-access.spec.ts` (its counts become Fjordkaffe 16, Nordlys 12); `a11y.spec.ts` `SCAN_LIST`.
- Leave alone: applied migrations, the staff details panel, the upload flow.

## Tasks & Acceptance

**Execution:**
- [x] `src/db/schema/licences.ts` + generated migration -- the table and the index.
- [x] `src/modules/licences/*` + `licences.test.ts` -- grant facts; checkout success, price changed, removed (hidden / free / held); S7 at `checkOut`; S5 as two parallel `checkOut` calls giving one row; `listLicences` order; `getClientLicence` scoped to the client.
- [x] `src/modules/access/*` + `access.test.ts` -- the licence own branch: A3/A6/A8/A10/A12 own for the holder, revoked not own, flags (`canBuy` false, `canDownload` true).
- [x] Fixture + seed + `seed.test.ts`/`sample-library.test.ts`/`fixture.test.ts` -- the five rows and their licences.
- [x] Client panel link, checkout pages and action, confirmation page, staff Licences page, nav, `en.json`.
- [x] `tests/e2e/client-access.spec.ts` -- extend the table with A3/A6/A8/A10/A12 for jonas and emil, and update the counts.
- [x] `tests/e2e/checkout.spec.ts` -- terms gating with its reason, checkout of A2 by a non-holder (use a factory image so the seed stays intact), own tick and "Yours to download" afterwards, the staff Licences row, and the NFR-7 messages word for word. Add the checkout, confirmation and Licences pages to `SCAN_LIST`.
- [x] `tests/e2e/sc3.spec.ts` -- Ida uploads a PNG (mock succeeds), makes it public and paid, and publishes it. Jonas finds the tile by the image id in its `?image=` link (the mock title is not unique), checks it out, and Ida sees it in Licences.

**Acceptance Criteria:**
- Given the README test command, then all Vitest and Playwright tests pass, and lint and typecheck are clean.
- Given a fresh `docker compose up`, when Ida opens Licences, then the five seeded licences are listed.

## Implementation Notes

- The checkout form submits from `onSubmit` (not the form `action` prop): with `action`, React resets the form after a price-change result, unticking the terms box. Checkout therefore needs JavaScript.
- `currentLicenceText` now returns `{ id, body }`; `formatAmount` (major units, no currency) was split out of `formatPrice` for the NFR-7 price message.
- `grantLicence` accepts only a contact for now; `staff_grant` exists in the schema check but has no caller. All `licences` foreign keys are `restrict`, so a licensed image can no longer be deleted (only the unfinished-upload cleanup deletes images today).
- Seeded licences use the five unnamed files listed in `fixture.ts`; counts are Fjordkaffe 16, Nordlys 12.
- The e2e price-change test edits the hidden `seenPriceMinor` field instead of changing the shared licence price, so parallel tests are unaffected.
- The a11y confirmation scan waits for the page title, which arrives just after the action's redirect.
- Shared e2e helpers `publishPaidImage` and `chooseOption` live in `tests/e2e/helpers.ts`; `library.spec.ts` now imports `chooseOption`.
- The confirmation page also shows the licence date. The terms label is "I accept the licence terms for this image on behalf of my organisation" (mockup wording).
- Matrix audit: the staff Licences empty state is covered by a static `EmptyState` render in `empty-state.test.ts` (the shared test databases always hold the seeded licences), following the 1.8 convention.
- Verified after the review patches: Vitest 401/401 (36 files), Playwright 116/116, lint and typecheck clean. The second AC (a manual `docker compose up`) was not checked by hand; `sample-library.test.ts` asserts the five seeded licences.

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Evidence | Route |
|---|-------|---------|---------|----------|-------|
| 1 | edge-case, blind | Seed grants licences on rows whose upload failed (left `uploading`) | medium | `grantFixtureLicences` iterates `planned.rows`; `sweepStaleUploads` deletes `uploading` rows, and the `restrict` FK then fails the whole sweep on every run | patch |
| 2 | edge-case | Licensed image delete fails the stale-upload sweep | medium | Same root cause as #1: only a failed seed leaves a licensed image in `uploading` (checkout needs a published image) | patch (with #1) |
| 3 | verification-gap, blind | `checkOutAction` untested: server terms check and zod validation can regress silently | medium | Pre-verified: no test imports the action; e2e always submits with the box ticked | patch |
| 4 | edge-case | Missing `seenPriceMinor` coerces to 0 and gives a false "changed from 0" message | low | `z.coerce.number()` on `null` is 0. Only a crafted POST reaches it, but the fix is a direct schema correction | patch |
| 5 | edge-case | `seenTitle.max(1000)` blocks licensing images with longer titles | low | `images.title` has no length limit. Direct correction | patch |
| 6 | blind | No test proves the copied facts (title) stay fixed after a grant | medium | AD-18's core rule; grep finds no such test. Test-only addition | patch |
| 7 | edge-case, blind | `grantLicence` can return `undefined` when the conflicting licence is revoked between the insert and the select | low | Revoke does not exist until 5.7; the fix adds a guard | reject |
| 8 | edge-case | A licence type with no text gives a checkout with no terms | low | The seed always creates text v1; the fix adds a branch | reject |
| 9 | edge-case, blind | After a priceChanged with a new licence type id, the form keeps the old type name and terms | low | v1 has one licence type and no way to change it (6.2); the fix adds fields | reject |
| 10 | blind | The licence records the current text version, not the one the contact saw | low | Texts cannot change in v1 (6.2 adds that); the fix adds an input field. Revisit in 6.2 | reject |
| 11 | edge-case | Double submit before `pending` re-renders could show a false "removed" | maybe-false | The e2e `dblclick` test reaches the confirmation; would need a slower network to settle. At most low | reject |
| 12 | edge-case | After priceChanged, a following error reverts the hidden price | low | Needs a server error right after a price change; the fix adds state | reject |
| 13 | edge-case, blind | Revoked licences look active in the staff list and on the confirmation page | low | No revoke path exists until 5.7, which owns revoked rows (UX-DR-42) | reject |
| 14 | edge-case, blind | `listLicences` has no limit; Licences rows have no link to the image | low | The AC asks for every licence; paging and filters are Story 5.x | reject |
| 15 | edge-case, blind | `grantLicence` cannot create staff grants and accepts non-purchase sources from a contact | low | No caller passes another source; staff grants are out of scope | reject |
| 16 | edge-case | The seed could grant to the wrong client if a fixture email belongs to another client | false | Fixture data and the seed create the users together; `findFirstContact` returns the contact's own `clientId` | reject |
| 17 | blind | The price-changed message hard-codes USD | false | NFR-7 fixes the text word for word with "USD", and v1 has one currency | reject |
| 18 | blind | "removed from your cart" mentions a cart that does not exist | false | The AC requires the exact NFR-7 text | reject |
| 19 | blind | SC-3 fails on a retry because it finds two placeholder rows | low | `playwright.config.ts` sets no retries, and every e2e run starts from a fresh database | reject |
| 20 | blind | The diff leaves out migration meta, sprint status and the spec | false | Left out of the review diff on purpose; the files exist in the worktree | reject |
| 21 | blind | README folder overview and seeded demo notes | low | The README already documents the seeded licences and which images are buyable; the folder overview is folder-level | reject |
| 22 | edge-case | Spec lists `seed.test.ts`, which is unchanged | low | Coverage lives in `sample-library.test.ts` and `fixture.test.ts`; the fix would edit the spec | reject |

## Design Notes

`checkOut` owns the use case, so it opens the transaction and passes `tx` to access and `grantLicence` (AD-20). The price check compares the licence type id and `priceMinor` from `ClientImage.price` with the submitted values. A visible own image gives `canBuy = false`, which maps to "removed", so "already held" and S7 share one path. A conflict on insert (a race past the lock) returns `created: false`, which checkout also maps to "removed".

## Verification

**Commands:**
- README test command -- expected: all pass
- `npm run lint && npm run typecheck` -- expected: clean
