---
review: adversary
target: ../ARCHITECTURE-SPINE.md (status draft, updated 2026-11-23)
against: prd-g53-kalland-2026-11-18/prd.md (FRs, A1–A13, S1–S15), EXPERIENCE.md where it shapes data
date: 2026-11-23
lens: two units one level down, each obeying every AD to the letter, that still build incompatibly
---

# Adversarial review — Architecture Spine, CRM-DAM v1

## Verdict

The spine settles the big shapes well: the table-ownership matrix, one access authority, the single grant path and the image-table queue. But it leaves **data shapes and mutation semantics** open in about a dozen places where two independently built stories will each pick a different, AD-compliant answer. The most likely clashes are in what an "edit" means (whole record or field patch, and who edited which field), where the price lives, the module call graph (the spine stories FR-2 and FR-4 already break it), and where auth guards sit in Next.js. Four of the holes below can leak access or overwrite data, not just cause rework. Close H1–H6 before the first story after the thin slice.

Ranking = how likely the pair is to happen in a solo, time-boxed build with AI sessions (spine and planned FRs first, bonus last), weighted by severity.

| # | Hole | Likelihood | Severity |
|---|---|---|---|
| H1 | Auth guard placement and actor identity (layout guard, clientId from input) | Very high | Critical (access leak) |
| H2 | Agency-field provenance: AI save, retry, apply-to-all, autosave, edit | Very high | High (silent overwrite of staff edits) |
| H3 | The module call graph forbids spine use cases (accounts→auth, X→activity, multi-module pages) | Certain | High (rework, or AD-2/AD-3 broken by necessity) |
| H4 | Where the price lives (per-image amount vs licence-type price) | High | High (wrong licence price, checkout re-check drift) |
| H5 | Batch settings: copied or inherited; is a batch mandatory | High | High (access read from two places) |
| H6 | Generation transaction and lease: row lock across a 30 s call, two startup sweeps, stuck `generating` | Medium-high | High (blocked saves, deleted in-flight uploads, double generation) |
| H7 | Restricted list: wholesale replace vs revoke's removal (lost update) | Medium | Critical (revoked client regains access) |
| H8 | Retry vs publish race: AI text lands on a published image | Medium-low | High (breaks FR-16b's core promise) |
| H9 | Two search implementations, undefined "newest", no "visible since" | Medium | Medium (SC-9 and FR-38a fail) |
| H10 | Checkout conflict semantics: on-conflict-do-nothing vs all-or-nothing | Medium | Medium |
| H11 | Derived files: thumbnails missing from the AD-7 matrix; cached previews vs AD-15 | Medium | Medium-high |
| H12 | Draft discard vs foreign keys from action_log and metadata_generations | Low-medium | Medium |
| H13 | Where tenantId comes from | Low-medium | Low |

---

## H1 — Auth guard placement and actor identity · very high · critical

**Unit A:** Story "Staff library shell" (FR-27). Puts `await requireStaff()` in `src/app/(staff)/layout.tsx`, so every staff page under it is guarded.
**Unit B:** Story "Publish single image" (FR-19a). Adds `src/app/(staff)/library/actions.ts` with a `publishImage(imageId)` Server Action. It sits under the guarded layout, so the session sees no need for its own check.
**Unit C (client side):** Story "Cart" (FR-31). The Server Action takes `{ clientId, imageId, licenceTypeId }` from a hidden form field and calls `licences.addToCart(tx, input)`.

**Both obey:** AD-5 "Other code calls only `getSession()`, `requireStaff()`, `requireContact()`", AD-2 "a route parses and validates input (zod), calls one module function", and AD-4 "form mutations via Server Actions (Next's Origin check is the CSRF guard)". None of them says *where* the guard must be called, or that identity comes only from the session.

**Incompatible outcome:** in the App Router, layouts do not re-run on client navigation and do not guard Server Actions or Route Handlers. A Server Action is a POST endpoint that anyone with a session cookie can call. A contact can call `publishImage`, which breaks S6. With Unit C, a contact of client A can put `clientId = B` in the form and act for client B. AD-7's matrix tests pages, preview and download, but not Server Actions, so neither hole is caught.

**Fix (tighten AD-5, add to AD-2):**
> Every page, Server Action and Route Handler calls `requireStaff()` or `requireContact()` itself, as its first statement. Layout checks are only for display and never count as a guard. A guard returns an `Actor` (`{ userId, role, clientId? }`). Every module write function takes the `Actor` and asserts the role it needs, so the check holds even if a route forgets it. A contact's `clientId` and `contactId` always come from the `Actor` and never from input; zod schemas for contact actions have no such fields. AD-7 adds one table-driven test that calls every Server Action and staff Route Handler as a contact and expects 403 (staff) or 404 (image-scoped).

---

## H2 — Agency-field provenance · very high · high

**Units:** (A) Story "AI metadata save" (FR-12, FR-14), (B) Story "Retry" (FR-16b), (C) Story "Batch settings, apply to whole draft batch" (FR-9), (D) Story "Draft autosave" (FR-17). Ranks 1–3 plus the spine, so all four get built.

**All obey:** AD-20 "The image row holds the current, staff-editable fields", AD-10 "`images.generateMetadata(imageId)` is the only generation path … images saves", and AD-8/AD-12 (images-module actions). No AD says how an image records *which* fields staff edited, or how keywords from different sources are kept apart.

**Incompatible outcome:**
- A stores `keywords text[]` as one merged list: shared keywords plus up to 15 generated ones.
- B needs FR-16b's "a retry never overwrites a field staff have edited" and FR-14's "the 15-keyword limit applies to generated keywords only; shared and hand-written keywords are kept". It cannot tell from A's merged array which keywords are generated, shared or hand-written, so it either replaces the whole array (staff keywords lost) or appends (duplicates, and the limit is broken).
- C's "apply keywords to the whole draft batch" overwrites `keywords` and wipes the generated keywords. Or it appends, and then a later retry cannot tell them apart.
- D sends the whole form on each autosave. If a retry or apply-to-all wrote fields in between, D's next autosave writes the stale values back.
- FR-11 ("AI replaces embedded fields; if it fails they stay") needs a fourth source, *embedded*, that A may overwrite but a staff edit must protect.

**Fix (new AD, "Agency fields carry their source"):**
> Each agency field (title, description, altText) stores a source, `embedded | ai | staff`, next to its value (e.g. `titleSource`). Keywords are rows in `image_keywords(imageId, keyword, source: embedded|ai|shared|staff)`, unique on `(imageId, lower(keyword))`, owned by images. Writes go through three images actions only. `saveAiResult` replaces only fields whose source is not `staff`, and only `ai`/`embedded` keyword rows, with FR-14's limit counted over `ai` rows. `applyBatchSettings` replaces only `shared` keyword rows (and visibility/price, see H5). `editFields` is a **patch** with only the changed fields; each one it writes gets source `staff`. Autosave and Save changes send patches, never the whole form.

---

## H3 — The module call graph forbids spine use cases · certain · high

**Pair 3a, Story "Create contact" (FR-2) vs Story "Setup links" (FR-4).** FR-4: "Creating a user … gives staff a single-use link". AD-3 has accounts own `users` and auth own `setup_links`. The diagram has no `ACC --> AUTH` arrow, and AD-2 says a route "calls one module function". The FR-2 session therefore creates the user in accounts, and the FR-4 session adds a second call from the route to `auth.createSetupLink`. That breaks AD-2, and it is not atomic (AD-19): a user can exist with no link. Another session might put the link write inside accounts, which breaks AD-3/AD-5 ("auth alone touches … setup links").

**Pair 3b, Story "Login" (FR-5) vs Story "Dashboard" (FR-38a).** FR-38a needs "since the contact's last login". The natural column, `users.lastLoginAt`, is owned by accounts, but login lives in auth, and auth has no arrow to accounts. The login session either writes `users` (breaks AD-3) or derives the time from `sessions`, which disappear on logout and expiry. The dashboard session then reads a column no one writes.

**Pair 3c, Story "Downloads" (FR-34) / "Setup links" (FR-4) / "AI settings" (FR-39) vs Story "Action log" (FR-42a).** FR-42a must record downloads, setup link creation and settings changes. The diagram has no `DL --> ACT` or `AUTH --> ACT`, and says "`ai` … call[s] no other module". AD-19 says "Action-log entries are written with the same `tx`". Those three writes cannot be logged without breaking an AD.

**Pair 3d, Story "Client card" (FR-7) vs AD-2.** The card needs `accounts.getClient`, `access.listClientImages` and `licences.listForClient`. AD-2's "calls one module function" pushes one session to build an aggregator in accounts, which needs arrows that do not exist. A second session just calls three functions from the page. Same for the dashboard (FR-38a) and the checkout result page.

**Fix:**
> (AD-2) A page or Server Component may call several module **read** functions. A mutation (Server Action or state-changing Route Handler) calls exactly **one** module write function, which owns the use case.
> (Diagram/AD-3) Add `ACC --> AUTH` (`auth.issueSetupLink(tx, userId)`, called by accounts when a user is created). Make `activity` a leaf that **any** module may call (`* --> ACT`). Put `lastLoginAt` in an auth-owned table (`login_events`, or a column on `credentials`), read by the dashboard.

---

## H4 — Where the price lives · high · high

**Unit A:** Story "Visibility and price editing" (FR-21). It follows EXPERIENCE.md ("Paid shows the amount field"; UJ-3 "90 USD") and adds `images.priceMinor` + `currency`.
**Unit B:** Story "Licence settings" (FR-40) and "Licences" (FR-23). PRD FR-23: "A paid image costs the price of the chosen licence type". Addendum: "an image is only free or paid". This session reads the amount from `licence_types`.

**Both obey:** the Money convention ("integer minor units + ISO 4217"), AD-17 ("each licence stores … price in minor units"), AD-18 ("the cart stores the price the client saw … same price"). None of these says *which record* the current price comes from.

**Incompatible outcome:** A's image page and cart show 90 USD. B's checkout re-check compares against the licence type's 50 USD, so every checkout fails with the NFR-7 price-change message. Or B grants at the licence-type price and the licence differs from what the cart showed. Access's `canBuy` and its price display read one source while checkout reads the other.

**Fix (tighten AD-17/AD-18):**
> An image stores only `priceTier: free | paid`. The amount is `licence_types.priceMinor` + `currency` (current) for a paid image, and 0 for a free one. `access.getClientImage` returns `price { minor, currency, licenceTypeId }` for buyable images, and that is the single source for display, cart and the checkout re-check. `cart_items` stores `licenceTypeId` and `seenPriceMinor`. If per-image amounts are wanted (UX), the PRD and UX must be reconciled first by a decision (D-xxx).

---

## H5 — Batch settings: copied or inherited · high · high

**Unit A:** Story "Batch settings" (FR-9). Stores visibility, client list, price, AI on/off, place names and shared keywords on `batches`. It reads them through a join at generation time, and the access condition joins the batch.
**Unit B:** Story "Edit single image" (FR-17/FR-21). Writes visibility and price on `images`, with the restricted list in `image_clients` (AD-3 lists `image_clients` under images).
**Unit C:** Story "Single-image upload" (FR-8). Creates an image with `batchId = null`, because the single upload has no batch.

**All obey:** AD-3 (images owns both `batches` and `images`), AD-6 ("Visible = published and (public, or restricted with the client on the list)"; it says nothing about which table) and AD-12 ("a batch lock blocks all its images").

**Incompatible outcome:** access reads visibility from two places, and a single-image edit is silently overridden by the batch, or the other way round. FR-9's "settings apply when each image is created … apply … to the whole draft batch, after confirming" means copy-on-create, but A's live inheritance means later batch edits change images *without* confirmation. C's null batch breaks AD-12's batch locks, the FR-19b batch publish and the place-name setting that generation needs.

**Fix (new AD, "Batch settings are copied, never inherited"):**
> Every image belongs to exactly one batch (`batchId NOT NULL`); a single upload is a batch of one, created by `images.createBatch(actor, settings)` before the first row. The batch row holds defaults only. They are copied onto the image (`visibility`, `priceTier`, `aiEnabled`, `placeNamesToAi`, shared keyword rows, `image_clients`) when the row is created. Access, generation and retry read only the image's own columns. `applyBatchSettings` is the only way batch values reach existing images, and it is an explicit images action.

---

## H6 — Generation transaction and lease · medium-high · high

**Pair 6a, Story "Worker" (FR-15) vs Story "Draft autosave" (FR-17) / "Publish" (FR-19a).** AD-10: the worker "claims the next `queued` image with `FOR UPDATE SKIP LOCKED`, sets `generating`, and runs it". AD-19: "module write functions take a `tx` … the module that starts the use case opens the transaction". The worker session does the obvious thing: one `tx` that claims, calls the provider (up to 30 s, AD-20) and saves. The row lock is held for the whole call. Every autosave, publish or apply-to-all on that image then blocks for up to 30 s, or times out.

**Pair 6b, Story "Upload" (AD-9 startup sweep in the app) vs Story "Worker" (same image, AD-1/AD-10).** AD-9: "On startup a sweep deletes leftover `uploading` rows and resets `generating` to `queued`." The app and the worker are both "the same codebase and image", and each runs the startup sweep. When the worker restarts, it deletes rows the *app* is uploading right now. When the app restarts (a deploy), it resets images the *worker* is generating, which leads to double generation, two `metadata_generations` rows, and the second result overwriting the first.

**Pair 6c, inline mode (no FR-15) vs Story "Retry" (FR-16b).** AD-10: "Without FR-15, the upload route calls it inline." If the browser drops the request mid-call, the image stays `generating` until the next restart. AD-8 then blocks both publish ("not … generating") and retry ("on drafts only", failed only), so the image is stuck. And if the inline call runs inside AD-9's completion transaction (AD-19 hands the `tx` on), that transaction lasts 30 s or more.

**Fix (tighten AD-10 and AD-9):**
> Generation never holds a database transaction or row lock across the provider call. Step 1, short tx: claim (`UPDATE … SET processingState='generating', generationStartedAt=now(), generationToken=uuid WHERE id = (SELECT … FOR UPDATE SKIP LOCKED) RETURNING`). Step 2, no tx: media, places, ai. Step 3, short tx: `saveAiResult` with `WHERE generationToken = $token AND status = 'draft'`; 0 rows means the result is discarded. A `generating` row older than 2 × provider timeout counts as failed (timeout category) and can be retried. Exactly one process runs the startup sweep: the worker with FR-15, the app without it. The sweep deletes only `uploading` rows whose `updatedAt` is older than N minutes, refreshed as the upload streams. Upload completion and generation are separate transactions.

---

## H7 — Restricted list: wholesale replace vs revoke · medium · critical

**Unit A:** Story "Visibility and price editing" (FR-21, Library Edit → Save changes). The form holds the client chips, and save replaces `image_clients` with the submitted list (delete + insert), as forms usually do.
**Unit B:** Story "Revoke" (FR-25). AD-16: "removes the client from the image's restricted list in the same transaction via images."

**Both obey:** AD-3 (images is the only writer of `image_clients`), AD-16, AD-19. AD-12's lock check is in "the images module's save actions", but FR-18 is bonus rank 15, likely cut ("Without FR-18 … the last save wins"). Even with FR-18, nothing says whether revoke's removal respects or bypasses a lock.

**Incompatible outcome:** staff 1 opens Edit on an image restricted to [Fjordkaffe, Nordlys]. Staff 2 revokes Fjordkaffe's licence, which removes Fjordkaffe from the list. Staff 1 saves an alt-text fix, and the form puts Fjordkaffe back. For a free restricted image this is A4, so Fjordkaffe *owns it again* without a licence. That is the access leak S12/S14 exist to prevent. SC-1 tests rows in isolation and will not catch it.

**Fix (new rule in AD-8 or AD-12):**
> Image and batch rows carry `version int`. Every staff save action takes the `version` the form loaded and updates `WHERE version = $v`, bumping it. A mismatch throws `Conflict` ("This image was changed by someone else. Reload to see the changes."). This holds whether or not FR-18 is built; FR-18's lock is a UX layer on top. Restricted-list changes from a form are sent as a diff (added/removed) against the loaded version. Revoke bumps `version` and is never blocked by an edit lock.

---

## H8 — Retry vs publish race · medium-low · high

**Unit A:** Story "Retry" (FR-16b). AD-8: "retry and discard on drafts only". It checks `status = 'draft' AND processingState = 'failed'`, then sets `queued`.
**Unit B:** Story "Publish batch" (FR-19b) / "Publish" (FR-19a). AD-8: "publish only when not uploading, queued or generating". A `failed` image may be published.

**Incompatible outcome:** both read a failed draft at the same moment (check then write, at READ COMMITTED). Retry sets it to `queued` and publish sets it to `published`. The worker generates and saves AI text onto a **published** image, which is exactly what FR-16b ("so AI text never changes an image staff have already published") forbids. Clients see the new text at once (FR-17).

**Fix (tighten AD-8):**
> Every state transition is one conditional `UPDATE … WHERE <precondition> RETURNING`; 0 rows throws `Conflict`. Never select and then update. Publish's condition includes `processingState NOT IN ('uploading','queued','generating')`, and retry's includes `status='draft'`. `saveAiResult` also requires `status='draft'` (see H6).

---

## H9 — Search in two modules, undefined ordering, no "visible since" · medium · medium

**Unit A:** Story "Staff search" (FR-27) in images. Uses `ILIKE '%term%'` on a concatenated text, ordered by `createdAt desc`, offset paging.
**Unit B:** Story "Client Find images" (FR-28) in access. Uses Postgres full-text (`to_tsvector('english', …)`) for NFR-4, ordered by `publishedAt desc`, keyset paging.

**Both obey:** the capability map ("images (staff), access (client)") and Deferred ("Search implementation detail … decides it when the search story is built"). That is two stories and two decisions.

**Incompatible outcome:** the same term gives different hits (stemming: "harbours" matches "harbour" for clients, not for staff). SC-9's fixed searches pass on one face and fail on the other. Page boundaries differ, and "newest" means three things. In the same area, FR-38a ("images made visible to it since …") needs a time an image became visible *to this client*. No column records that: `publishedAt` misses a later internal→public change or a client added to the list. The dashboard story will invent one; the visibility story will not write it.

**Fix:**
> Images exports one `textMatch(terms, { includePlaceNames })` SQL fragment and one ordering/paging helper (keyset on `(sortAt desc, id desc)`, `sortAt = publishedAt` for clients and `createdAt` for staff, written in the convention). Access composes it with its visibility condition. A `image_visibility_events(imageId, clientId null = public, at)` row, owned by images, is written by publish, visibility change and list add. FR-38a reads it through access.

---

## H10 — Checkout conflict semantics · medium · medium

**Unit A:** Story "Free first download" (FR-23). AD-16: "insert with on-conflict-do-nothing". It treats 0 rows as "already held, fine".
**Unit B:** Story "Checkout" (FR-32). AD-18: "one transaction: re-check every line … any change records nothing". It calls the same `grantLicence(tx, …)`.

**Incompatible outcome:** two contacts of one client check out the same image at the same moment. Both re-checks pass, both inserts run, and one is silently a no-op. B either treats the no-op as success (the second contact's checkout lists a licence "bought" by someone else, which is fine) or as an error that rolls back every line with no NFR-7 message. FR-32 says "already held is removed with a message" before anything is recorded. The return contract of `grantLicence` decides this, and no AD sets it.

**Fix (tighten AD-16/AD-18):**
> `grantLicence` returns `{ licence, created: boolean }`. Checkout first locks the contact's cart rows (`SELECT … FOR UPDATE`) and takes `pg_advisory_xact_lock(hash(clientId))`, so one client's checkouts and free first downloads run one at a time. A line with `created = false` after that counts as "already held": roll back and return FR-32's removed-line message. A double submit hits an empty cart and returns the "empty cart" state (Idempotency convention).

---

## H11 — Derived files: thumbnails untested, previews cached · medium · medium-high

**Unit A:** Story "Upload completion" (AD-9/AD-14). "Thumbnails and previews are made once at upload completion and shared by staff and clients". They are stored under `derived/<fileVersionId>/<kind>`.
**Unit B:** Story "Client preview route" (FR-30/FR-36). The glossary says "Preview: a client copy …", and AD-15 says "client … copies are built on demand into a temp file, never cached. Media reads every built client copy back against the location checklist."

**Incompatible outcome:** B rebuilds and checks the preview on every request, so A's stored preview is dead code. Or B serves A's stored file without the checklist read-back, which breaks AD-15's fail-closed promise for the most-served client file. Also, AD-6 lists "thumbnail" but AD-7's test list ("image page, preview, download, My images, Find images, counts") does not. A thumbnail Route Handler checked with `getSession()` only would let a contact fetch draft thumbnails by ID, and no test would catch it.

**Fix:**
> (AD-14/15) Derived thumbnails and previews are checked against the location checklist **once, when they are made**. A hit marks the image `failed` with no derived file. They are exempt from on-demand rebuilds. Client copies for *download* stay on-demand and uncached.
> (AD-7) Add "thumbnail" to the matrix routes, and run each A-row through every file route (thumbnail, preview, download, ZIP).

---

## H12 — Draft discard vs foreign keys · low-medium · medium

**Unit A:** Story "Action log" (FR-42a). `action_log.imageId` references `images.id` (the natural Drizzle relation).
**Unit B:** Story "Discard draft" (FR-20). Deletes the image so "its hash no longer blocks a re-upload".

**Incompatible outcome:** with `ON DELETE RESTRICT`, discard fails on every logged draft (upload is logged). With `CASCADE`, discard deletes audit entries ("No one can edit the log"). `metadata_generations` (owned by ai) has the same problem: images cannot delete ai's rows except through ai, and nothing says it must.

**Fix (Conventions):**
> `action_log` stores its subject as `(subjectType, subjectId)` with no foreign key, plus a snapshot label. Rows in other modules that hang off an image declare `ON DELETE CASCADE` only for derived data (`metadata_generations`, keyword rows, `image_clients`, `file_versions`). `images.discardDraft` deletes the FileStore objects through media after commit.

---

## H13 — Where tenantId comes from · low-medium · low

**Unit A:** Story "Seed" generates the tenant with `uuidv7()`.
**Unit B:** Story "Create client" reads `process.env.TENANT_ID`, or `select id from tenants limit 1`, or a hard-coded constant.

**Incompatible outcome:** foreign-key failures, or rows silently split across two tenants after a reseed. The convention says "the one seeded tenant; no scoping code", which leaves the source open.

**Fix (Conventions → Tenancy):**
> One constant `DEFAULT_TENANT_ID` (a fixed UUID in `src/db/tenant.ts`). The seed and migration insert the tenant with that ID, and every insert uses the constant. No env var, no lookup.

---

## Cross-cutting notes

- **Idempotency convention vs H8/H10:** "made harmless by unique constraints" covers duplicate rows but not lost updates or races between state transitions. The conditional-UPDATE and version rules (H7, H8) are the other half and belong next to it in Conventions.
- **AD-12 scope:** say whether non-edit writers (revoke, apply-to-all, retry) respect edit locks. Today only "generation never takes or checks locks" is stated.
- **AD-7 coverage:** H1 and H11 show the matrix needs two more axes: every Server Action and Route Handler as a contact, and every file route per A-row.
