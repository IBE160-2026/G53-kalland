---
title: "Review: spine ↔ PRD reconciliation"
reviewed: ARCHITECTURE-SPINE.md (updated 2026-11-23)
against: prd.md (2026-11-18), addendum.md, rollout-gate.md
date: 2026-11-23
---

# Review: ARCHITECTURE-SPINE ↔ PRD reconciliation

## Verdict

The spine is sound on its core promises: the access rule (AD-6 reproduces the glossary's "own image" verbatim, and A1–A13 and S1–S8, S13–S15 all fall out of it), licence integrity (AD-16/17/18), the original's immutability and the fail-closed client copy. What did not land is mostly **data the later stories need that earlier stories must start recording**, plus **two places where the location promise (NFR-9 "decided in one place") has a side door**. Six high findings, ten medium, the rest low. None needs a new paradigm; all are AD wording or one-column additions.

Severity: **critical** = breaks a spine SC or the privacy/access promise as written; **high** = two stories will diverge, or a later story needs data an earlier one did not record, or a privacy side door; **medium** = a PRD rule the spine contradicts or leaves without an owner; **low** = tidy-up, story-level risk worth one line.

No critical findings.

## Findings

### High

**R-1. Location and staff fields can reach client pages: "decided in one place" has no enforcement point**
- **PRD ref:** FR-6 (staff notes, visibility lists, other clients never on contact pages), FR-30 (contact never sees GPS, place name, provider details), NFR-9 (location decided in one place in the access module), SC-6.
- **Issue:** AD-6 says `getClientImage` "returns the image with `own`/`canDownload`/`canBuy`". If that is the images row, every client page story decides for itself which fields to render, and the `clientMaySeeLocation()` seam is never consulted by anything. The spine names the function but not the caller, so the "one place" is nominal.
- **Fix (AD-6, append):** "Access functions return a `ClientImage` type defined in access: id, display title, agency fields, date taken, camera data, `own`, `canDownload`, `canBuy`. It never carries staff notes, account manager, visibility or client list, licence holders other than this client, AI provider/generation data, coordinates or place name. Location fields are added only when `clientMaySeeLocation(clientId, imageId)` is true (always false in v1), and that check lives only in the function that builds `ClientImage`. Code under `src/app/(client)/` imports image data only from `@/modules/access` (enforced by an ESLint `no-restricted-imports` rule)."

**R-2. Client search can match the place name, which leaks location through results**
- **PRD ref:** FR-28 (client search matches title, description, keywords; not the place name record or staff notes), SC-6 ("a contact's … search reveal no … place name"), NFR-9.
- **Issue:** The capability map puts staff search in images and client search in access, and AD-6 makes access own the visibility condition, but nothing fixes the *matched columns*. A shared search helper that includes the place name column (as staff search must, FR-27) would let a contact search "Bergen" and get images whose only link to Bergen is their GPS position. That is a location leak the axe/checklist tests do not catch.
- **Fix (AD-6, append):** "Client search matches only title, description and keywords. The place-name and coordinate columns are added to the client match set only when `clientMaySeeLocation()` is true. SC-6's test includes a search for a seeded place name that appears only in the place-name record and expects zero client results and one staff result."

**R-3. Edited date taken and GPS never reach the downloaded files**
- **PRD ref:** FR-17 (staff edit date taken and GPS; "edits … appear in the next file served"), FR-34 ("every downloaded copy carries the current metadata"; staff copy "with all metadata including location data"), FR-35 (date taken is on the client whitelist), glossary *Staff copy*.
- **Issue:** AD-14 builds the client copy by copying the FR-35 whitelist "from the original, then writes the current agency fields". Date taken is whitelisted but editable, so a corrected date would be replaced by the stale embedded one. For the staff copy, "original bytes plus current metadata including location" does not say whether edited coordinates and the place-name record are written into EXIF GPS / XMP / IPTC location fields. The edit story and the download story will each guess.
- **Fix (AD-14, replace the client-copy and staff-copy sentences):** "**Client copy:** original pixels untouched; ExifTool removes all metadata, copies back the FR-35 whitelist from the original, then writes the *current* agency fields and the *current* date taken from the image row. **Staff copy:** original bytes; ExifTool writes the current agency fields, date taken, coordinates (EXIF GPS and XMP) and the place-name record (IPTC/XMP City, ProvinceState, CountryName, Sublocation) from the image row. The image row is the source of truth for every editable field; the original's embedded values are read once at upload (AD-9) and never again for editable fields."

**R-4. Restoring an archived image has no defined target status; "never published" is not recorded**
- **PRD ref:** FR-26 (archive and restore), FR-20 (discard only a draft "that has never been published"), FR-20's fallback ("Archive instead"), FR-19a (published never returns to draft), A13.
- **Issue:** AD-8 has one `status` column (draft | published | archived). The FR-20 fallback means drafts get archived, so restore must know whether to go back to draft or published. If a restore story picks "published", an unreviewed draft becomes visible to clients without passing the publish checks (S4 warning, processing state). If it picks "draft", a published image silently drops out of clients' libraries and violates "never back to draft". FR-20 also needs "never published" for an image that was published and then archived, which `status` alone cannot answer.
- **Fix (AD-8, append):** "`images.publishedAt` (nullable timestamptz) is set by the first publish and never cleared. Archive keeps it. Restore returns an image to `published` if `publishedAt` is set, otherwise to `draft`. Discard (FR-20) requires `publishedAt is null`."

**R-5. Field and keyword provenance is not recorded, so retry and the keyword cap cannot be built later**
- **PRD ref:** FR-16b ("a retry never overwrites a field staff have edited"), FR-11 (AI replaces embedded text), FR-14 (15-keyword cap on generated keywords only; shared and hand-written keywords kept), SC-7, SC-13.
- **Issue:** The spine's image row "holds the current, staff-editable fields" and `metadata_generations` holds runs. Nothing records *which* fields staff edited or *which* keywords are shared, embedded, generated or hand-written. FR-17 (spine) is built before FR-16b (rank 3) and FR-14 (rank 2); if the editing story does not record provenance, the retry story cannot tell edited fields apart, and no migration can recover it for existing images. A batch "apply keywords" (FR-9) racing a generation save (generation ignores locks, AD-12) will also overwrite shared keywords unless keywords carry their source.
- **Fix (AD-10, append):** "Each agency field has a source (`embedded | ai | staff`) stored on the image (`fieldSources` jsonb or one column per field). Keywords are stored as rows or an array of `{value, source: embedded | shared | ai | staff}`. Every staff save sets source `staff`; `generateMetadata` replaces only fields and keywords whose source is not `staff`, and never touches `shared` keywords. The FR-14 cap applies to `ai` keywords only."

**R-6. The dashboard's "made visible since" needs timestamps nobody records**
- **PRD ref:** FR-38a (images made visible to the client since the contact's last login or in the last 30 days, with worked examples), SC-12.
- **Issue:** "Made visible to client X" happens on publish, on a visibility change to public, on adding X to a restricted list, and on restore. None of these events has a timestamp in the spine (`image_clients` has no `createdAt` named; no `visibleSince`). "Since the contact's last login" also needs the *previous* login time, because logging in overwrites the latest one. These are written by spine stories (publish, visibility, login) and read by a planned story (rank 4), so they must be fixed now or the history is lost.
- **Fix (new convention row or AD-6 append):** "Visibility events are timestamped: `images.visibleToAllSince` is set when an image becomes published-and-public (publish, visibility change to public, restore); `image_clients.addedAt` is set when a client is added to a restricted list. 'Made visible to client X at' = the later of `publishedAt`/restore time and either `visibleToAllSince` or X's `addedAt`, computed only in access. Auth keeps `users.lastLoginAt` and `users.previousLoginAt`, shifted on each successful login."

### Medium

**R-7. Place names are derived only on the AI path**
- **PRD ref:** FR-13 ("derives a place name … whether or not AI is used"), NFR-9 ("every image keeps its coordinates and place name whatever its batch setting").
- **Issue:** AD-10 puts the lookup inside `generateMetadata` ("places supplies the place name, ai generates"). An image uploaded with manual metadata, or with the place-name setting off, goes straight to `ready` (AD-9) and never gets a place name.
- **Fix (AD-9, completion step):** "…stores embedded metadata, derives the place name from GPS through places (FR-13, if built) for every image whatever its AI choice or place-name setting, makes thumbnail and preview…". AD-10: "`generateMetadata` reads the stored place name; it does not look one up."

**R-8. The "place names off" filter has no owner, and the AI input keeps an embedded ICC profile**
- **PRD ref:** FR-12 (with the setting off, the text contains no place name, no coordinates and no embedded location fields; the image sent has no embedded metadata), FR-9, SC-13 (recording mock).
- **Issue:** AD-20 passes "embedded metadata, place name" to ai, but no AD says who removes coordinates and the IPTC/XMP location fields from the embedded-metadata text when the batch setting is off. The ai module is "pure", so it must be the caller; the spine should say so. Separately, AD-14 makes the AI input with sharp keeping the ICC profile, which is embedded metadata; SC-13 asserts "no embedded metadata".
- **Fix:** AD-10: "`generateMetadata` builds the AI text input; when the batch's place-name setting is off it omits the place name and filters the embedded metadata through the same location checklist media uses (AD-15). The ai module never filters." AD-14: "The AI input is converted to sRGB and carries no metadata at all, including no ICC profile."

**R-9. Thumbnails and previews are served to clients without the location check**
- **PRD ref:** FR-36 ("client copies, including previews and images shown on a page, contain no location data … no embedded thumbnail"), glossary *Preview* (is a client copy), SC-6 ("every file served to a client … passes the location checklist").
- **Issue:** AD-15's read-back check covers on-demand client copies only. Thumbnails and previews are cached derivatives made once by sharp (AD-14) and are trusted to be clean by sharp's default behaviour, including for PNG text chunks. Nothing in the spine verifies them, and SC-6 says every file.
- **Fix (AD-15, append):** "Thumbnails and previews are checked against the same checklist once, when they are made at upload completion; a hit fails the upload completion for that image. SC-6's test fetches the thumbnail and preview of each location seed file through the client routes."

**R-10. The module graph forbids calls the PRD requires**
- **PRD ref:** FR-4 (creating a user gives a setup link), FR-42a (records download, setup link creation, settings changes), FR-39, FR-42b, SC-8.
- **Issue:** The diagram has no `downloads → activity`, `auth → activity` or `ai → activity` arrow, and states that `ai` calls no other module, so download events, setup-link creation and AI-settings changes cannot be logged in the same `tx` (AD-19). There is no `accounts → auth` (or `auth → accounts`) arrow, so "create contact and its setup link" cannot be one use case without a route calling two modules (AD-2 says one). There is also no route → ai (settings page, FR-39) or route → activity (log view, FR-42b).
- **Fix (diagram and rule):** add `DL --> ACT`, `AUTH --> ACT`, `ACC --> AUTH` (accounts orchestrates user creation and calls `auth.createSetupLink(tx, userId)`), `R --> AI` and `R --> ACT`. Move AI settings writes out of the "pure" ai core: "`ai` owns `ai_settings`; its settings functions may call activity; its generation functions call nothing."

**R-11. Startup sweep: who runs it, and inline mode leaves images stuck in `queued`**
- **PRD ref:** FR-15 ("after a server restart, every image ends as ready or failed"), FR-15's fallback (processed while the upload page waits), FR-19a (cannot publish while queued), FR-16b (retry on failed drafts only), SC-14.
- **Issue:** AD-9's sweep resets `generating` → `queued`. Without FR-15 there is no worker, so those images stay `queued` forever: unpublishable and not retryable. With FR-15, two processes start (app and worker); if the app's sweep runs while the worker is mid-generation it resets live jobs, and if the worker's sweep runs while a browser is uploading it deletes a live `uploading` row.
- **Fix (AD-9, replace the sweep sentence):** "On app start, `uploading` rows older than 1 hour are deleted. Generation uses a lease: claiming sets `generating` and `leaseUntil = now() + 2 × provider timeout`; any process may reclaim an expired lease. In inline mode (FR-15 not built), an expired `generating` or any `queued` image found at app start is set to `failed` with reason 'interrupted', so staff can fill in or retry it."

**R-12. Licence history contradicts "every client-facing list goes through access"**
- **PRD ref:** FR-33 (history shows revoked licences as removed by the agency), S12 (revoked licence, no other access: download not found, history shows "removed by the agency"), FR-23 (title at the time).
- **Issue:** AD-6 says every client-facing list uses the access condition. A history list routed through `listClientImages` drops revoked or no-longer-visible rows; one that ignores access may render a thumbnail or link for an image the client can no longer see, which S12 forbids. Two stories (FR-33, FR-25) will pick differently.
- **Fix (AD-6, append):** "Licence history is the one client list not filtered by visibility: licences reads `licences where clientId = X` and shows the stored title-at-time. A row links to the image, or shows its thumbnail, only when `getClientImage` returns non-null for it; otherwise it shows 'removed by the agency' (revoked) or the title as text."

**R-13. SC-1's mutation rules cannot run through the Playwright request API when the mutations are Server Actions**
- **PRD ref:** SC-1 ("through the same routes users hit"), S5, S7, S9, S10, S11.
- **Issue:** AD-7 makes the access matrix and S-rules "Playwright request API, no browser". AD-4 makes form mutations Server Actions, which have no stable URL (the `Next-Action` id changes per build). S7 (buy a free image), S9, S11 (revoke without reason) and the HTTP side of S5 therefore cannot be tested that way. Each story will improvise.
- **Fix (AD-7, replace the method sentence):** "Read rules (A1–A13, S1–S4, S6, S12, S15) are table-driven HTTP tests with the Playwright request API. Mutation rules (S5, S7, S9, S11, S13, S14) are tested at the module function the Server Action calls, with the same seeded fixture and a real database, plus one browser test per rule that submits the real form. S10 is a test that no delete function or route exists for clients."

**R-14. Session idle expiry and "new password ends other sessions" are not designed**
- **PRD ref:** FR-5 (session ends after 8 hours of inactivity; setting a new password ends the user's other sessions), FR-4.
- **Issue:** AD-5 fixes DB sessions but not idle expiry. Server Components cannot set cookies in Next.js, so a sliding cookie expiry fails on reads; the expiry must be server-side. "Ends other sessions" is a one-line rule that only auth can do and the setup-link story may miss.
- **Fix (AD-5, append):** "Sessions have `lastSeenAt`; `getSession()` rejects a session idle for more than 8 hours and updates `lastSeenAt` at most once a minute. The cookie has no idle Max-Age (server-side expiry only). Setting a password through a setup link deletes all of that user's other sessions in the same transaction."

**R-15. Search semantics for staff and clients can diverge; "newest" is undefined**
- **PRD ref:** FR-29 ("for staff and clients alike: ignores case; several terms must all match; newest first, in pages; empty result offers to clear filters"), SC-9, NFR-4.
- **Issue:** Staff search lives in images and client search in access (capability map), so FR-29 will be implemented twice. "Newest first" could be upload time, publish time or date taken, and the two implementations may pick differently. Pagination (offset or keyset) also affects counts.
- **Fix (new convention row "Search"):** "One term parser and matcher in images (`buildSearchCondition(terms, fields)`), used by staff search and by access with the client field set (R-2). Terms are split on whitespace, matched case-insensitively, all must match. Order is `createdAt desc, id desc` (upload time) for both. Paging is offset-based with page size 48 and a total count from the same condition."

**R-16. Client copies lose EXIF orientation, so portrait photos arrive rotated**
- **PRD ref:** FR-35 (whitelist "keeps only" …), glossary *Client copy* ("built from the stored original"), UJ-3.
- **Issue:** AD-14 strips all metadata and copies back the FR-35 whitelist with pixels untouched. Orientation is not on the whitelist, so a camera JPEG stored with an orientation tag is delivered sideways. Previews are fine (sharp can rotate pixels), so preview and download will disagree.
- **Fix:** AD-14: "The client copy also keeps EXIF `Orientation`; thumbnails, previews and the AI input are rotated into pixel orientation by sharp (`.rotate()`) before metadata is dropped." Record a D-entry and a one-line PRD correction to FR-35 adding orientation as a technical field (not location data).

### Low

**R-17. Idempotency has no mechanism for creates without a natural key** (NFR-7 "repeated or double-submitted actions never … create duplicates"). The convention relies on unique constraints, but a double-submitted "create client" or "create batch" has none. *Fix (Idempotency row):* "Create actions without a natural key carry a form nonce stored in a unique `requestId` column; a repeat returns the existing record."

**R-18. Email uniqueness and case** (FR-2 "email unique across all users and is the login"). *Fix (Validation row):* "Emails are trimmed and lower-cased at the zod boundary; `users.email` has a unique index on `lower(email)`."

**R-19. The action log has no append-only or shape rule** (FR-42a "no one can edit the log", FR-38b reads downloads from it, FR-20 deletes images it refers to). *Fix (Logging row or AD-19):* "activity exposes only `record(tx, entry)` and read functions; no update or delete. Entries hold `actorId`, `action` (enum), `subjectType`, `subjectId`, `clientId` (nullable), `at`, with no foreign key on `subjectId`, so discarding a draft never removes log rows."

**R-20. Data-model seams from NFR-9 and the addendum are missing**: the image's media-type field (NFR-9), the licence's origin `purchase | free_download | staff_grant` with a nullable contact (addendum, data model accommodations), and `tenantId` on licences, cart_items and action_log ("top-level tables", NFR-9). *Fix:* add to AD-17 "and `origin`; `contactId` is nullable", add `mediaType` to the images entity, and extend the Tenancy row.

**R-21. AI provider details** (FR-16a, FR-39, SC-13). Four error categories omit network/unavailable errors; FR-39 overrides mean the provider must be resolved per job from `ai_settings` (falling back to env), not at worker start; SC-13 needs a *recording* mock. *Fix (AD-20/21):* add category `unavailable`; "the provider, model and key are resolved for each generation"; "the mock records its last inputs for tests".

**R-22. Checkout's "records nothing" vs "removed with a message"** (FR-32: a line no longer visible, now free or already held is removed with a message; a changed price must be confirmed). AD-18 records nothing on any change, but the PRD removes lines and updates the confirmed price, which are cart writes. *Fix (AD-18):* "On a change, no licence is recorded; invalid lines are removed from the cart and changed prices are updated to the new price pending confirmation, in the same transaction, and the NFR-7 messages are returned."

**R-23. File responses can be cached past revocation or archiving** (FR-22, S3, S12). *Fix (AD-13, append):* "File Route Handlers send `Cache-Control: private, no-store` for client copies and `private, max-age=60` at most for thumbnails and previews."

**R-24. Shared display rules** (FR-30 "Untitled image … in lists as well", NFR-5a alt fallback chain, NFR-6 250-character limit used by FR-14, FR-17 and zod, NFR-7 "what to do next" also for the generic error). *Fix (convention rows):* one `displayTitle()`/`altText()` helper in images; one `ALT_TEXT_MAX = 250` constant; the generic error message says "Something went wrong. Try again, or contact the agency if it keeps happening."

**R-25. Addendum hand-offs to the architecture not taken up**: `.gitattributes` with `eol=lf` for shell scripts and the x86 CI build (addendum, Supported systems); the AI input size (AD-14 "≈ 1000 px" vs addendum "about 1568 px"; pick one and record it). Also: if the session cookie is `Secure`, e2e tests reach the app over `http://app:3000` and the cookie will not be sent; make `Secure` depend on an env flag (on in production, RG-1).

**R-26. S9 and S10 at the data level** (FR-3, FR-1, RG-4 "v1 never deletes"). *Fix:* "Deactivating staff locks the active staff rows (`select … for update`) before counting, so two concurrent deactivations cannot leave none. Foreign keys to clients, users, images and licences are `on delete restrict`; only FR-20 deletes an image, and only a never-published draft."

**R-27. Untrusted text written into files** (NFR-2a "never run or followed as instructions"). Agency fields are written by ExifTool. *Fix (AD-14):* "Values are passed through exiftool-vendored's write API, never assembled into command lines; control characters except newline in description are removed before writing."

## Coverage walk

Status: **AD-n** = covered; **Story** = correctly left to the story; **R-n** = see finding.

### Glossary

| Term | Status |
|---|---|
| Staff, Client, Contact, User | AD-3 (users with role, clientId, status), AD-5 |
| Image (identity across versions) | ERD `file_versions`, AD-13 |
| Stored original | AD-13, AD-14, AD-9 (NFR-10) |
| Client copy | AD-14, AD-15; R-3, R-16 |
| Staff copy | AD-14; R-3 |
| Preview | AD-14 (stricter: no metadata); R-9 |
| Agency fields | AD-14, AD-20; R-5 |
| Place name (separate stored record) | AD-3, Coordinates row, AD-22; R-7 |
| Location data | AD-15 checklist; R-1, R-2, R-8 |
| Batch | AD-3, ERD |
| Draft / published / archived | AD-8; R-4 |
| Licence (active until revoked) | AD-16, AD-17 |
| Own image | AD-6 (verbatim) |

### Functional requirements

| FR | Status |
|---|---|
| FR-1 Client records | AD-3; mod-11 Story; S10 R-26 |
| FR-2 Contacts | AD-3; R-18 |
| FR-3 Staff accounts | AD-3; S9 R-26 |
| FR-4 Setup links | AD-5; one-use, cancel earlier Story; creation path R-10 |
| FR-5 Login | AD-5; R-14 |
| FR-6 Roles | AD-5 (403); contact pages R-1 |
| FR-7 Client card | AD-6 (images visible), Story |
| FR-8 Upload | AD-9, AD-13; type sniffing and size Story |
| FR-9 Batch settings | AD-3 batches, AD-12; Story; keyword provenance R-5 |
| FR-10a Identical files | AD-9 (unique hash index) |
| FR-10b Matching filenames | Story |
| FR-11 Embedded metadata | AD-9, AD-14; provenance R-5 |
| FR-12 AI metadata | AD-10, AD-20; R-8 |
| FR-13 Place names | AD-22; R-7 |
| FR-14 Output checks | AD-20; cap on generated only R-5 |
| FR-15 Background processing | AD-10, AD-11; R-11 |
| FR-16a AI failure | AD-20; R-21 |
| FR-16b Retry | AD-8; R-5 |
| FR-17 Editing | AD-12 (save actions), AD-15 (no cache); R-3, R-24 |
| FR-18 Edit locks | AD-12 |
| FR-19a Draft and publish | AD-8; R-4 |
| FR-19b Publishing a batch | AD-8, Story |
| FR-20 Discarding drafts | AD-8; R-4, R-19 |
| FR-21 Visibility and price | AD-6; free/paid flag vs price on licence type: Story (one boolean on images; price only on licence types) |
| FR-22 Access rule | AD-6 (null → 404), AD-7; R-23 |
| FR-23 Licences | AD-16, AD-17, AD-18 |
| FR-24 Licences last | AD-16, AD-17 |
| FR-25 Revoke | AD-16, AD-19 |
| FR-26 Archiving | AD-6; restore R-4 |
| FR-27 Staff search | Deferred detail; R-15 |
| FR-28 Client browsing | AD-6; R-2 |
| FR-29 Search behaviour | R-15 |
| FR-30 Image page | AD-6 flags; R-1, R-24 |
| FR-31 Cart | AD-3 cart_items, AD-18 |
| FR-32 Checkout | AD-18, AD-19; R-22 |
| FR-33 Licence history | R-12 |
| FR-34 Current metadata | AD-14 (metadata contract); R-3 |
| FR-35 Client copies | AD-14; R-3, R-16 |
| FR-36 No location data | AD-15; R-9 |
| FR-37 ZIP | AD-15, AD-18; distinct names Story |
| FR-38a Dashboard | R-6 |
| FR-38b Activity list | R-19 |
| FR-39 AI settings | AD-3 ai_settings, APP_ENCRYPTION_KEY; R-10, R-21 |
| FR-40 Licence settings | AD-17 |
| FR-41 Transaction log | AD-16 (licences table is the log) |
| FR-42a Action log | AD-19; R-10, R-19 |
| FR-42b Action log view | R-10 (route arrow) |
| FR-43 New versions | Deferred, `file_versions` seam |

### Non-functional requirements

| NFR | Status |
|---|---|
| NFR-1 Runnable without keys | AD-21, AD-23; R-25 |
| NFR-2a Security | AD-4, AD-5, AD-6, AD-13, Escaping/Logging rows; R-27 |
| NFR-2b Login delay | AD-3 login_attempts, Story |
| NFR-3 Privacy | AD-23 |
| NFR-4 Scale | AD-10 (concurrency 2 meets 100 in 15 min at the pilot median), AD-20 (30 s timeout); search Deferred |
| NFR-5a Accessibility | AD-1, AD-7; R-24 |
| NFR-5b WCAG 2.2 | Story (bonus) |
| NFR-6 Metadata standard | AD-14; R-24 |
| NFR-7 Errors and repeats | Errors, Idempotency, Text rows; R-17, R-24 |
| NFR-8 Language | Text row, AD-20 output language |
| NFR-9 Data model | Money, Tenancy, Coordinates rows, AD-17, AD-20; R-1, R-20 |
| NFR-10 Integrity | AD-9, AD-15, AD-18 |

### Access table

| Row | Status |
|---|---|
| A1 | AD-6 (visible, `canDownload`, not own), AD-18 (first download grants) |
| A2, A5 | AD-6 (`canBuy`) |
| A3, A6, A8, A10, A12 | AD-6 (own via active licence) |
| A4 | AD-6 (own via published-free-restricted), AD-18 |
| A7, A9, A11, A13 | AD-6 (not visible → null → 404) |

All thirteen fall out of AD-6's condition as written. The test method for the rows is AD-7 (sound for reads).

### Edge rules

| Rule | Status |
|---|---|
| S1, S2 | AD-5 (per-call re-check) |
| S3 | AD-6 |
| S4 | AD-6 |
| S5 | AD-16 (partial unique index, on-conflict-do-nothing), AD-7 (parallel transactions); HTTP side R-13 |
| S6 | AD-5 |
| S7 | AD-6 `canBuy`, AD-18; test method R-13 |
| S8 | AD-5 |
| S9 | R-26, R-13 |
| S10 | R-26, R-13 |
| S11 | AD-16 (reason stored); test method R-13 |
| S12 | AD-6 (download 404); history R-12 |
| S13 | AD-16 (credit flag) |
| S14 | AD-16 (partial index allows a new licence; revoked row untouched) |
| S15 | AD-16, AD-17 |

### Success criteria

| SC | Status |
|---|---|
| SC-1 | AD-7; R-13 |
| SC-2 | AD-9; FR-10b Story |
| SC-3 | AD-21, AD-23 |
| SC-4 | AD-6, AD-18 |
| SC-5 | AD-16, AD-17 |
| SC-6 | AD-15; R-1, R-2, R-9 |
| SC-7 | AD-20, AD-21; R-5 |
| SC-8 | AD-19; R-10, R-19 |
| SC-9 | Seed fixtures, AD-21; R-15 |
| SC-10 | AD-12 |
| SC-11 | Errors and Idempotency rows, AD-8 |
| SC-12 | R-6, R-17 |
| SC-13 | AD-20; R-5, R-8, R-21 |
| SC-14 | AD-10, AD-11, MOCK_DELAY_MS; R-11 |
| SC-15 | AD-3 cart_items (per user) |
| SC-16 | AD-14 (metadata contract, D-028) |

### Rollout gate items that shape v1

| Item | Status |
|---|---|
| RG-1 (no seeded users, secrets outside code) | AD-23 (`SEED_ON_START`, env only); Secure cookie R-25 |
| RG-4 ("v1 never deletes") | Deferred; FK rule R-26 |
| RG-7 (currency, VAT) | Money row |
| RG-8 (Norwegian) | Text row, AD-20 output language |
| RG-12 (email) | Deferred |
| RG-2, RG-3, RG-5, RG-6, RG-9–RG-11, RG-13–RG-16 | Not v1 architecture; no conflict found |
