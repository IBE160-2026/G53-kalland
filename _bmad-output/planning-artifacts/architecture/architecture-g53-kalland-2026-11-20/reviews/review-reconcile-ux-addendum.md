---
review: reconcile spine against UX, PRD addendum, pilot and decisions
target: ARCHITECTURE-SPINE.md (updated 2026-11-23, AD-1..AD-23)
inputs:
  - ux-designs/ux-g53-kalland-2026-11-18/EXPERIENCE.md, DESIGN.md
  - prds/prd-g53-kalland-2026-11-18/addendum.md (and prd.md where the addendum points to an FR)
  - research/pilot-haiku-metadata-2026-10-28/results.md (+ run_pilot.py for the image size)
  - docs/process/decisions.md (D-011, D-017, D-021, D-027, D-028, D-031, D-033..D-041)
  - architecture-g53-kalland-2026-11-20/.memlog.md
date: 2026-11-23
---

# Reconcile review: spine vs UX, addendum and decisions

**Verdict:** The spine's core holds up: access, licences, file pipelines, provider port and runtime match their sources. But 27 requirements did not land or landed distorted. Six are high: field provenance for AI writes and retries, the action-log call directions, the place-name lookup tied to AI, the data FR-38a needs, D-034's licence source field, and location data in the AI input. None needs a new paradigm. Each fix is a sentence or a column in an existing AD.

Severity scale: **critical**: the spine as written makes a v1 requirement impossible or unsafe. **high**: a story built to the spine misses or breaks a spine/planned requirement, or needs a migration later that is cheap now. **medium**: an ambiguity that two stories would resolve differently, or a bonus-FR gap. **low**: wording, traceability, or something story-level that the spine could name in one line.

## Summary

| # | Finding | Severity |
|---|---|---|
| R-1 | No field provenance, so AS-7, FR-14 (generated-only keyword cap) and FR-16b (retry never overwrites staff edits) cannot be enforced | high |
| R-2 | Module arrows forbid the action-log writes FR-42a/AS-21 require (downloads, auth setup links, ai settings) | high |
| R-3 | Place-name lookup lives only in the AI generation path; FR-13 requires it whether or not AI is used | high |
| R-4 | FR-38a "made visible since last login / 30 days" has no data: no visible-since timestamps, no previous-login time | high |
| R-5 | D-034 consequence dropped: licence needs a source field and an optional contact | high |
| R-6 | AI input must drop all location fields when the batch place-name setting is off (FR-12); AD-20 says only "embedded metadata" | high |
| R-7 | Polling every 3 s keeps sessions alive forever, which defeats FR-5's 8 h idle expiry | high |
| R-8 | Client-facing reads return "the image"; RSC props can serialise staff-only fields (GPS, place, notes) into client HTML | high |
| R-9 | Two save models (D-033) not reflected: autosave vs explicit save shape the mutations, locks and errors | medium |
| R-10 | Memlog's "editable only after generation done or failed" (FR-15) dropped from AD-8/AD-12 | medium |
| R-11 | Lock lifecycle gaps: renewal, refused save from an expired lock, release on logout (auth → images arrow missing) | medium |
| R-12 | Startup sweep: an app restart resets `generating` while the worker still runs it; without a worker, `queued` rows never finish | medium |
| R-13 | AD-9 transaction scope: thumbnails made inside the DB transaction; duplicate path does not delete the stored file | medium |
| R-14 | AI input size ≈ 1000 px contradicts the addendum and pilot (≈ 1568 px) | medium |
| R-15 | UX groups generated keywords by category; the provider schema (pilot v2) has a flat string list | medium |
| R-16 | D-028 distorted to "whole word"; UTF-8 declaration (1:90) and app-side shortening missing | medium |
| R-17 | EXIF orientation is lost in derived files and dropped by the FR-35 whitelist | medium |
| R-18 | "Date taken" under the timestamptz/UTC convention shifts EXIF local time | medium |
| R-19 | Failed checkout does not say the cart is updated, so the client loops on the same error | medium |
| R-20 | Client search must exclude place name (AS-17); not in AD-6 | medium |
| R-21 | Library upload percentage (UX) vs "uploader only, Upload page" (AD-11); uploads die on tab switch unless lifted to the layout | medium |
| R-22 | FR-10b "needs a decision" is a stored, publish-blocking state with no home in AD-8 | medium |
| R-23 | FR-39 key handling (AES-GCM, masked, never returned) dropped from the spine; only the env var survives | medium |
| R-24 | Free-first-download order is flagged "to confirm with user" in memlog but stated as settled in AD-18 | medium |
| R-25 | Test DB and e2e lifecycle: the matrix mutates state (A1 → own) with no reset or reseed rule | medium |
| R-26 | Seed data needs that shape architecture: pipeline-built seeds, a source list, known credentials, S-rule fixtures, the NFR-4 generator | medium |
| R-27 | Smaller gaps: Google Fonts at runtime, pixel dimensions, captions preference, live-region spam, return-to-page redirect, new password ends other sessions, sources list | low |

---

## High

### R-1: Field provenance for AI writes and retries

- **Source:** addendum AS-7 (embedded text fills the fields, AI replaces it, failure leaves it); PRD FR-14 ("15-keyword limit applies to generated keywords only; shared and hand-written keywords are kept"); PRD FR-16b ("A retry never overwrites a field staff have edited"); FR-9 batch keywords; EXPERIENCE Upload "(n of 15)".
- **Missing:** AD-10 says "images saves" the generation result, and AD-20 runs the FR-14 checks. Nothing records where each field value came from, so the save cannot tell an embedded value (replace) from a staff-edited one (keep). The keyword list cannot separate generated from batch or staff keywords for the 15-cap and the "(n of 15)" counter. Every generation story would invent its own flagging.
- **Proposed fix (add to AD-10):** "Each agency field on the image carries its source (`embedded` | `ai` | `staff`). Keywords are stored per keyword with source `embedded`, `batch`, `ai` or `staff`. `images.saveGenerated()` overwrites only fields whose source is not `staff`, and replaces only `ai` keywords. Any staff save sets source `staff`. The FR-14 cap counts `ai` keywords only."

### R-2: Action-log writers vs allowed call directions

- **Source:** PRD FR-42a and addendum AS-21 (the log covers downloads, client and user changes, setup links and settings); FR-38b (recent downloads per client); spine diagram ("arrows are the only allowed call directions").
- **Contradiction:** only `images`, `licences` and `accounts` have an arrow to `activity`. `downloads` (download events, needed by FR-38b too), `auth` (setup link creation, password resets) and `ai` (FR-39 settings changes) cannot write the log. AD-2 forbids the route from calling a second module, so there is no legal place to write these entries. The spine also says `ai` "calls no other module", which rules out logging AI settings changes.
- **Also:** FR-38b needs the log queryable by client and image, not only by actor. The ERD shows only `USER ||--o{ ACTION_LOG`.
- **Proposed fix:** "Add arrows `DL → ACT`, `AUTH → ACT`, `AI → ACT` (activity stays a leaf). `action_log` rows carry `actorId`, `action`, `clientId?`, `imageId?`, `licenceId?`, `at`, `details` (jsonb), so FR-38b reads client activity by `clientId`. If FR-42a is cut, FR-38b's download rows still need this table, so the table and the download entry come with the first story that needs either."

### R-3: Place-name lookup only runs when AI is chosen

- **Source:** PRD FR-13 ("derives a place name … whether or not AI is used"; works with no key or network); NFR-9 (coordinates and place name kept whatever the batch setting); addendum AI provider section (the setting only controls what the provider receives).
- **Contradiction:** AD-10 places the lookup inside `generateMetadata` ("places supplies the place name"). AD-9 sends manual-metadata images straight to `ready`, so they never get a place name. The batch place-name setting would also be read as "do not look up" rather than "do not send to AI".
- **Proposed fix (AD-9 completion step):** "On upload completion, if the image has coordinates, `places.lookup()` sets the stored place name, whatever the AI choice or the batch place-name setting. `generateMetadata` reads the stored place name and passes it to the provider only when the batch setting is on."

### R-4: FR-38a has no data to compute "newly visible"

- **Source:** PRD FR-38a (images made visible since the contact's last login or in the last 30 days, whichever is longer, with worked examples); EXPERIENCE Overview; UJ-3/UJ-4 climax.
- **Missing:** "made visible to client X at time T" depends on publish time, a visibility change to public, and the client being added to a restricted list. None of these timestamps is in the spine. "Since last login" needs the *previous* login time, kept before the current login overwrites it. The data cannot be backfilled, so it must exist before the first image is published in any test.
- **Proposed fix (AD-3 and AD-6):** "`images.publishedAt`, `images.visibilityChangedAt`, `image_clients.addedAt`; `users.previousLoginAt` and `users.lastLoginAt` (auth sets them at login). `access.listNewlyVisible(clientId, since)` derives visible-since as the latest of those that made the image visible to the client. It is the only implementation of FR-38a's window."

### R-5: D-034's licence source and optional contact

- **Source:** D-034 Consequences ("The architecture step should give the licence record a source field and allow a licence without a contact"); addendum Data model accommodations (a licence records how it came about: purchase, free download or granted by staff, and may have no contact).
- **Missing:** AD-17 lists the stored facts (client, contact, image, title, type, text version, price, currency, timestamp) with no source, and implies a required contact. A later staff-granted licence would then need a migration, which the addendum explicitly wanted to avoid.
- **Proposed fix (AD-17):** "…and `source` (`purchase` | `free_download` | `staff_grant`; v1 writes the first two). `contactId` is nullable, and every v1 grant path sets it."

### R-6: Location data must not reach the AI when the setting is off

- **Source:** PRD FR-12 (with the place-name setting off, "the text contains no place name, no coordinates and no embedded location fields"; with it on, the model is still told never to turn coordinates into place names); addendum AI provider section; D-011.
- **Missing:** AD-20 lists "embedded metadata" as an input with no filtering rule. A coordinator that passes the extracted metadata as is would leak GPS, city and the location fields to the provider. That is a privacy rule (NFR-3, RG-3), and it belongs in one place.
- **Proposed fix (AD-20):** "The coordinator builds the provider text input with one function, `buildAiTextInput(image, batch)`. It never includes coordinates. It drops every field on the location checklist (the same list AD-15 checks), and when the batch place-name setting is off it also omits the place name. The function has a unit test per setting."

### R-7: Polling defeats idle session expiry

- **Source:** PRD FR-5 (a session ends after 8 hours of inactivity); EXPERIENCE "Session expired after 8 h idle"; spine AD-11 (poll about every 3 s) and AD-5.
- **Contradiction:** if every authenticated request slides the session expiry, an open Upload or Library tab polling every 3 s keeps the session alive indefinitely. The FR-5 test would pass only because nothing polls.
- **Proposed fix (AD-5 or AD-11):** "The state-polling Route Handler checks the session but does not extend it; only user-initiated requests (page loads, Server Actions, file requests) count as activity. `getSession({ touch: false })` is the polling variant."

### R-8: Client reads must return a client-safe projection

- **Source:** PRD FR-6 (staff notes, account managers, visibility lists and other clients' data never appear on contact pages), FR-30 and FR-36; EXPERIENCE Access and Price Display (never GPS, place name, photographer credit, staff notes, provider details or other clients); NFR-2a.
- **Missing:** AD-6 says `getClientImage` "returns the image". In the App Router, any object a Server Component passes to a Client Component is serialised into the page payload. A full image row then ships GPS and place name in the HTML, even if the UI never renders them. AD-14 and AD-15 guard the files, not the page payload.
- **Proposed fix (AD-6):** "Access functions return a `ClientImageView` built from an explicit column list (title, description, alt text, date taken, keywords, camera summary, pixel size, price, flags), never a table row. Client routes import only these types. One e2e check asserts that a client page's HTML holds no coordinates or place name for a seed image that has both."

---

## Medium

### R-9: Two save models (D-033) are not in the spine

- **Source:** D-033; EXPERIENCE Editing and Saving ("Two save models … Do not mix them"); addendum "Changes from the UX design"; PRD FR-17.
- **Missing:** the spine has one sentence for mutations ("form mutations via Server Actions"). The two models need different server contracts:
  - **Upload autosave:** per-field saves that may arrive in a burst. Next.js runs Server Actions from one client one at a time, so a debounced per-field action is fine, but a failed save must return the field and keep the client value ("Your change was not saved. Try again.").
  - **Library explicit save:** one action for the whole form, which returns per-field validation errors and the save status.
  - Both go through the same `images` validation (FR-17 limits) and the same lock check. Under D-033 the lock starts at Edit in the Library; on the autosave surface it starts on first edit.
- **Proposed fix (new line under AD-4 or AD-12):** "Two mutation shapes for image metadata (D-033): `images.updateDraftField(tx, imageId, field, value)` for Upload autosave (debounced client side, one field per call, returns the saved value or a `Validation`/`Locked`/failed-save error), and `images.saveImageEdits(tx, imageId, changes)` for Library Save changes (all-or-nothing, per-field errors). No autosave path exists for non-draft images."

### R-10: Edit gating during generation dropped

- **Source:** memlog edit-lock decision ("image editable only after generation done/failed"); PRD FR-15 ("An image is editable once it is uploaded and, if AI was chosen, has its metadata or has failed").
- **Distortion:** AD-12 keeps "Generation never takes or checks locks" but drops the reason it is safe: edits are refused while the image is `uploading`, `queued` or `generating`. Without that rule a staff autosave and a generation save race on the same fields.
- **Proposed fix (AD-8):** "Metadata edits are allowed only when `processingState` is `ready` or `failed`; a retry (FR-16b) moves the image back to `queued`, and edits are refused until it settles."

### R-11: Lock lifecycle details

- **Source:** PRD FR-18 ("ends when the user saves, cancels or discards, leaves the editor or logs out, or after 15 minutes without activity … A save from an expired lock is refused and keeps the unsaved value"); EXPERIENCE State Patterns (Locked); D-033.
- **Missing:**
  - How "activity" extends `lockedUntil`: in Library edit mode nothing is saved until Save changes, so idle time must be measured by a client renewal or a keystroke ping.
  - That a save checks the caller still holds an unexpired lock (refuse and keep the value).
  - Release on logout. Auth would have to call images, and there is no `AUTH → IMG` arrow.
  - Release on leaving the editor, which is best-effort (sendBeacon), with expiry as the backstop.
- **Proposed fix (AD-12):** "Edit mode renews the lock at most once a minute while the user types; `lockedUntil = now + 15 min` on each renewal or save. Every save action verifies `lockedBy = me and lockedUntil > now`, else it throws `Locked`. Logout clears the user's locks through `images.releaseLocksOf(tx, userId)` (add arrow `AUTH → IMG`, or have the logout route call images after auth). Leaving the editor sends a best-effort release; expiry covers a missed one."

### R-12: Startup sweep and no-worker fallback

- **Source:** addendum AS-9; PRD FR-15 ("After a server restart, every image ends as ready or failed"); addendum "Settled for the architecture" (synchronous fallback if FR-15 is cut).
- **Problems:**
  1. With FR-15, `app` and `worker` are separate Compose services. If the app restarts and sweeps `generating → queued` while the worker is still running that image, a second claim runs it twice.
  2. Without FR-15, nothing claims `queued` rows after a restart, so they never reach ready or failed.
- **Proposed fix (AD-9 and AD-10):** "The worker resets `generating → queued` at its own startup (it is the only process that sets `generating`). The app's startup sweep handles only `uploading` rows. Without FR-15, the app's sweep sets leftover `queued` and `generating` rows to `failed` with reason 'interrupted', so staff can retry (FR-16b)."

### R-13: Scope of the upload completion transaction

- **Source:** spine AD-9 and AD-14; PRD NFR-10 (no partial file); FR-10a.
- **Problem:** AD-9 puts "makes thumbnail and preview" inside the completion transaction. sharp work on a 50 MB file holds a DB transaction and the unique-index lock open for seconds. FileStore writes cannot roll back with the DB. On the duplicate path the streamed original is never deleted from the FileStore.
- **Proposed fix (AD-9):** "File work happens outside the DB transaction: stream original → derive thumbnail and preview → one short transaction (insert hash on `file_versions`; on unique conflict delete the row). After a duplicate or any failure, media deletes the original and derived files for that `fileVersionId`. The startup sweep also deletes FileStore keys with no `file_versions` row."

### R-14: AI input image size

- **Source:** addendum "Upload size" ("The AI provider receives a copy resized to about 1568 px"); pilot `run_pilot.py` (`images/1568/`), so the 5.9 s median and $0.0007 cost were measured at 1568 px.
- **Contradiction:** AD-14 says "the AI input (≈ 1000 px)", and so does the memlog. D-017 used about 1000 px only for a cost estimate.
- **Proposed fix:** "AI input: long edge 1568 px (the pilot's size, which matches Claude's recommended maximum), set as one constant in media." If 1000 px is intended, record it as a decision and note that the pilot figures no longer apply.

### R-15: Keyword categories

- **Source:** EXPERIENCE Keyword chip ("Upload groups generated keywords by category and shows '(n of 15)'"); PRD FR-12 (keywords cover place, weather/season, emotion, colour/adjective, activity, object and perspective/composition).
- **Missing:** the pilot's v2 output schema has `keywords: string[]` with no category. AD-20's output ("keywords") and the image's keyword storage carry no category, so the UX grouping cannot be built.
- **Proposed fix (AD-20):** "Prompt/schema v3 returns `keywords: { term, category }[]` with the FR-12 category enum; keywords are stored with category (null for embedded, batch or staff keywords)." Or drop the grouping in EXPERIENCE with a decision entry. Settle it before the AI story, since it changes the versioned schema.

### R-16: Metadata contract distorted or thinned

- **Source:** D-028 ("at the last whole word that fits, or at the last whole character if the first word alone is too long … declared as UTF-8"); addendum Metadata contract (record 1:90 `CodedCharacterSet`; "the app shortens the values itself … rather than relying on the metadata library's own truncation"; keyword over 64 bytes left out of IIM only; field mapping incl. `Iptc4xmpCore:AltTextAccessibility`); PRD SC-16 (40 × "æ").
- **Distortion:** AD-14 says "IIM shortened at a whole word per D-028", which drops the whole-character fallback, exactly the case SC-16 tests. It also omits the UTF-8 declaration and the rule that the app, not ExifTool, shortens.
- **Proposed fix (AD-14):** "Metadata is written per the addendum's metadata contract (field mapping included). IIM: the app shortens each value to its byte limit at the last whole word, else the last whole character (D-028), drops keywords over 64 bytes from IIM only, and writes `IPTC:CodedCharacterSet = UTF8`. XMP and EXIF get the full value. ExifTool's own IIM truncation is never relied on. PNG gets XMP (and EXIF where supported), no IIM."

### R-17: Image orientation

- **Source:** AD-14 (sharp keeps no metadata except ICC); PRD FR-35 whitelist (agency fields, copyright/creator/credit, date taken, camera, lens, exposure, colour profile).
- **Problem:** dropping the EXIF `Orientation` tag without rotating the pixels shows rotated camera files sideways in thumbnails, previews and the AI input. The client copy keeps the original pixels, so dropping Orientation there displays it rotated too. Orientation is not location data and is not on the checklist.
- **Proposed fix (AD-14):** "sharp auto-orients (`.rotate()`) before resizing derived files. The client-copy whitelist also keeps `Orientation`, as a rendering tag that is not one of the metadata kinds FR-35 removes." Note it in the PRD or addendum if a strict whitelist reading matters.

### R-18: Date taken vs the time convention

- **Source:** PRD FR-11 and FR-17 (date taken read and edited, written back to copies); spine Conventions ("Time: timestamptz stored UTC; displayed in Europe/Oslo").
- **Problem:** EXIF `DateTimeOriginal` is local time without a zone (`OffsetTimeOriginal` is optional). Storing it as UTC and showing it in Oslo time shifts photos taken elsewhere, and writes a changed value back into XMP/EXIF.
- **Proposed fix (Conventions):** "System timestamps: timestamptz UTC, shown in Europe/Oslo. Date taken: stored as `timestamp without time zone` plus an optional offset, shown and written back exactly as captured or edited."

### R-19: Failed checkout must update the cart

- **Source:** EXPERIENCE State Patterns (line no longer available, now free or already held → line removed with the NFR-7 message; price changed → the contact confirms); PRD FR-32 and NFR-7 messages.
- **Missing:** AD-18 says any change "records nothing and returns the NFR-7 messages" but not that the cart changes. Without updating the stored price and removing dead lines, the second attempt fails the same way.
- **Proposed fix (AD-18):** "When the re-check finds changes, checkout records no licence. In its own transaction it removes unavailable, now-free and already-held lines and stores the new price on changed lines, then returns the messages. The contact's next Check out (after confirming) runs the normal checkout."

### R-20: Client search fields

- **Source:** addendum AS-17 (client search does not match the place name in v1); EXPERIENCE header search (staff "Search title, description, keywords and places"; client "Search images"); FR-36 and NFR-9 (`clientMaySeeLocation` false).
- **Missing:** AD-6 owns client search but does not say which columns it matches. If client search matched place name, a hit would reveal an image's location.
- **Proposed fix (AD-6):** "Client search matches title, description, alt text and keywords only; place name is added only when `clientMaySeeLocation()` allows it. Staff search adds place name."

### R-21: Upload percentage and surviving navigation

- **Source:** EXPERIENCE State Patterns Library ("Uploading (skeleton + percentage)") and DESIGN.md Image tile ("Uploading: skeleton with a white percentage pill"); EXPERIENCE Upload ("Keep this page open … Leaving while files are uploading warns first"); AD-11 and memlog (percentage only to the uploader).
- **Contradiction:** the UX shows a percentage on Library tiles. The spine limits it to the uploader's browser and does not say where the upload queue lives. With client-side navigation, switching the main tab from Upload to Library unmounts the Upload page and aborts its fetches, unless the queue lives in the staff layout.
- **Proposed fix (AD-11):** "The upload queue lives in a client provider in the staff layout, so uploads survive tab switches and the uploader's Library tiles show their percentage; other staff see 'Uploading' with no percentage (update DESIGN.md/EXPERIENCE.md to say so). A full reload or tab close warns first (FR-15)."

### R-22: FR-10b undecided filename matches

- **Source:** PRD FR-10b; EXPERIENCE Context alert ("The file cannot be published until decided"; "Use the same answer for the other file name match").
- **Missing:** AD-8's publish rule checks only processing state. "Needs a decision" must be stored, since other staff see the batch, and must block publish and the batch publish (FR-19b lists it with a reason).
- **Proposed fix (AD-8):** "`images.nameMatchOf` (imageId, nullable) marks an undecided filename match; publish refuses while it is set. 'Keep both' clears it; 'Discard new file' discards the draft (FR-20 path). The batch-wide answer is one images action."

### R-23: FR-39 key storage rule dropped

- **Source:** memlog decision ("AES-GCM via node:crypto with APP_ENCRYPTION_KEY env; never logged or returned to browser; until built, env vars only"); D-017; PRD FR-39; pilot results (settings per provider, env defaults, settings page lists registered providers); EXPERIENCE Settings (key shown masked).
- **Missing:** the spine lists `APP_ENCRYPTION_KEY` and `ai_settings` but states no rule. A Settings story could round-trip the key to the browser to "mask" it client side.
- **Proposed fix (AD-20):** "FR-39: the key is stored AES-256-GCM-encrypted with `APP_ENCRYPTION_KEY` (node:crypto), decrypted only inside the ai module, and never logged or sent to the browser. The settings page receives only `hasKey` and the last 4 characters. Effective settings are the DB override, else the env defaults. The provider list on the page comes from the adapter registry."

### R-24: Unconfirmed amendment presented as settled

- **Source:** memlog line 83 ("AMENDS free first download order … build and location-check the client copy first, then grant licence, then stream. **To confirm with user**"); no later memlog entry confirms it.
- **Problem:** AD-18 states the amended order as settled. The change is sound (NFR-10: no partial licence), but the run's authority says it is unconfirmed. Process and AI governance is graded, and AI changes must be traceable.
- **Proposed fix:** confirm it with the user and add a memlog `(decision)` line saying the user confirmed it, or mark AD-18's free-download sentence "(pending user confirmation)". The same applies to the other Finalize-time amendments (mock `MOCK_FAIL`, file keys by `fileVersionId`, 30 s timeout), which need a memlog line showing they were accepted.

### R-25: Test database and e2e state

- **Source:** spine AD-7 and Deployment ("access matrix and axe scans run in `e2e` against the app on the test database"); PRD SC-1; access row A1 (a first download turns the image into own).
- **Missing:** the Compose diagram has one `app` service on the dev DB. Running "the app on the test database" needs either a second app service or a re-pointed app. The matrix tests change state: a free first download, checkout and revoke grant or revoke licences, so a second run or a different order gives different results. The test FileStore directory is not separated either.
- **Proposed fix (Deployment):** "An `app-test` Compose profile runs the same image with `DATABASE_URL` set to the test DB and its own `FILE_STORE_DIR`. Before each e2e run, the test DB is reset (migrate + seed) and the test file dir cleared. Tests that mutate access state use their own seed rows, not the matrix rows."

### R-26: Seed data shapes the architecture

- **Source:** addendum "Seed data and mock" and "Seed data names" (2 staff; Fjordkaffe AS with 2 contacts, Nordlys Sykkel AS with 1, Gammel Kunde AS inactive with 1; 20–40 committed, freely licensed images about 1600 px and under 500 KB with a source list; a JPEG with GPS and city, a JPEG with an embedded thumbnail, a PNG with location; oversized files generated at test time); PRD NFR-4 (500 images and 10 clients from a repeatable script, kept out of git); PRD FR-7 acceptance (Fjordkaffe's card shows exactly its access-table images and all licences, revoked included).
- **Missing from the spine:**
  - Seeding must run images through the media pipeline (file version, hash, derived files, embedded metadata), not insert rows, or the seed images have no thumbnails and their FR-36 test is hollow.
  - A committed source and licence list beside the images (NFR-3, D-020 pattern).
  - Seeded users need known credentials documented in the README (seeded with passwords, not only setup links).
  - Fixture coverage beyond the A-rows: S4 (restricted, empty list), a revoked licence (S12/S13), an archived own image, a `fail` image, a filename match.
  - The NFR-4 generator script and where its data goes.
- **Proposed fix (AD-23 or Structural Seed):** "`src/db/seed/` builds the seed through the images and media modules (same code as upload), from `seed/images/` with `SOURCES.md` (licence per file). Seed users have documented demo passwords. The fixture names one image per A-row and S-rule (listed in `seed/fixture.ts`) and is shared by AD-7 tests. `scripts/generate-scale-data.ts` makes the NFR-4 data set into a separate DB and is never committed."

---

## Low

### R-27: Smaller gaps

| Ref | Item | Proposed fix |
|---|---|---|
| DESIGN.md Typography ("Instrument Sans (Google Fonts)") vs AD-23 offline at runtime | Loading the font from Google at runtime breaks the offline rule and sends client IPs to Google | Conventions: "Fonts via `next/font` (self-hosted at build time); no runtime third-party requests." |
| DESIGN.md justified wall (width follows aspect ratio); EXPERIENCE Technical details (pixel size, orientation, format, size) | No stored pixel width/height, format or size, so the wall cannot lay out before images load | AD-9: "store `width`, `height` (after orientation), `mediaType`, `byteSize` on `file_versions`." |
| EXPERIENCE Captions switch ("remembered per user across visits and devices (stored with the user account)") | User preference not in the model | AD-3 accounts: "`users.preferences` (jsonb; v1: `showCaptions`)." |
| EXPERIENCE Accessibility Floor (processing updates use `role="status"`) with AD-11 polling 65 files | Announcing every tile change every 3 s floods screen readers | AD-11: "Polling updates tiles silently; one live region announces aggregated changes (for example '3 more ready') at most once per poll." |
| EXPERIENCE "after login, the user returns to the page" | Return URL can become an open redirect | AD-5: "return-to is a same-origin relative path, validated by auth." |
| PRD FR-5 / D-039 ("Setting a new password ends the user's other sessions"); FR-4 (a new link cancels older ones) | Not in AD-5's rule | Add both clauses to AD-5. |
| Spine frontmatter `sources` | Omits DESIGN.md and D-031, D-033–D-041, though AD-1 settles D-031 and D-033–D-035 shape the model | Add them. Then close EXPERIENCE Open Question 1 (D-031 settled by D-038) in the UX spine. |
| AD-13 file Route Handlers | No caching rule; a shared cache could serve one client's preview to another, and revoked access lingers in browser cache | "File responses send `Cache-Control: private, no-store` (originals, copies) or `private, max-age=300` (thumbnails)." |
| memlog GeoNames finding (Norway's post-2024 counties are in admin1) | Not carried into AD-22 | AD-22: "the build script uses current `admin1CodesASCII` (2024 county split)." |
| memlog assumption (exiftool-vendored on Linux needs Perl; verify in foundation story) | Not carried into the spine | Deployment: "Foundation story verifies ExifTool runs in the app image (Perl present)." |

---

## Checked and consistent

These matched their sources, so no change is proposed: access-module shape and own-definition amendment (AD-6 vs memlog and PRD A1–A13); access tests through real routes (AD-7); two state columns and named actions (AD-8, apart from R-10 and R-22); image table as queue, `SKIP LOCKED`, concurrency 2 (AD-10); polling at about 3 s within AS-23's 10 s (AD-11); FileStore keyed by `fileVersionId` (AD-13); fail-closed client copies, built on demand (AD-15); licence single writer, S5 partial unique index, revoke never deletes (AD-16); immutable licence text versions as D-035's "text as accepted" (AD-17); one transaction handle (AD-19); provider port, v1 providers, timeout, error categories, escaping (AD-20); mock default and `MOCK_FAIL` (AD-21, NFR-1); GeoNames extract (AD-22); Docker, offline runtime and seeding switch (AD-23, D-027); Designsystemet React settling D-031 (AD-1, D-038); auth seam (AD-5, D-039); Drizzle (D-040); modular monolith (D-041); money, tenancy and IDs (NFR-9).
