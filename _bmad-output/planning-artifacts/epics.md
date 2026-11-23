---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-epic-1
  - step-03-epic-2
  - step-03-epic-3
  - step-03-epic-4
  - step-03-epic-5
  - step-03-epic-6
  - step-03-epic-7
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-g53-kalland-2026-11-18/prd.md
  - _bmad-output/planning-artifacts/prds/prd-g53-kalland-2026-11-18/addendum.md
  - _bmad-output/planning-artifacts/prds/prd-g53-kalland-2026-11-18/rollout-gate.md
  - _bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-g53-kalland-2026-11-18/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-g53-kalland-2026-11-18/EXPERIENCE.md
---

# g53-kalland - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for g53-kalland (CRM-DAM v1), decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

Requirement IDs are the PRD's own (FR-10a, NFR-2a, …), not renumbered, so stories, commits and tests trace straight back to the PRD. Tags and hour estimates are the PRD's ([spine] / [planned] rank 1–5 / [bonus] rank 6–22 / [stretch]). Architecture rules are cited as AD-n; UX requirements as UX-DR-n.

## Requirements Inventory

### Functional Requirements

**F1. Accounts and clients**

- FR-1 [spine] Client records (UJ-4): staff create and edit clients — name, optional org number (9 digits, mod-11), status active/inactive, billing email, account manager (a staff user), staff notes. Can be set inactive and active again, never deleted (S10).
- FR-2 [spine] Contacts (UJ-4): staff create, edit, deactivate and reactivate contacts — name, email, optional phone. Email is unique across all users and is the login; changing it keeps the same user, licences and history.
- FR-3 [bonus, rank 11, 1.5 h] Staff accounts: staff create, edit, deactivate and reactivate staff users the same way. The last active staff user cannot be deactivated (S9).
- FR-4 [spine] Setup links (UJ-4): creating a user or resetting a password gives staff a single-use link that expires after 7 days; staff copy it, the app sends no email. A new link cancels earlier unused links. A used or expired link is refused with a message telling the user to ask the agency (S8). Passwords ≥ 12 characters.
- FR-5 [spine] Login (UJ-3, UJ-4): email + password, logout. Wrong email and wrong password give the same message. After a correct password, a deactivated user or a contact of an inactive client is refused and told why. Status is checked on every request (S1, S2). Setting a new password ends the user's other sessions. Session ends after 8 h of inactivity.
- FR-6 [spine] Roles (UJ-3, UJ-4): every user is staff or a contact. A contact requesting a staff page or staff data gets 403 and no data (S6). Staff notes, account managers, visibility lists and other clients' data never appear on contact pages.
- FR-7 [bonus, rank 9, 2 h] Client card (UJ-4): one staff page per client with details, contacts, images visible to it and its licence history (revoked included). Seed: Fjordkaffe's card shows its 2 contacts, exactly the images the access table lets it see, and all its licences. Contact opening the card's address gets 403 (S6). Fallback: client edit page with contacts; licences via the transaction log.

**F2. Upload and metadata**

- FR-8 [spine] Upload (UJ-2): one image or a batch; JPEG and PNG up to 50 MB per file. Content decides type, not extension. Corrupt, renamed non-image, unsupported or oversized files are rejected with a message naming the file and reason; a rejected file does not stop the batch.
- FR-9 [planned, rank 1, 2.5 h] Batch settings (UJ-2): before upload, staff set for the batch — visibility and client list, free/paid, AI or manual metadata, whether AI receives place names, keywords added to every image. Defaults: internal-only, free, place names on. Settings apply when each image is created; staff can later change single images, or apply visibility, price or keywords to the whole draft batch after confirming the overwrite. Fallback: defaults; staff change each image afterwards.
- FR-10a [spine] Identical files (UJ-2): a byte-identical file (library incl. archived, or earlier in the same batch) is rejected with a link to the existing image. Check runs before any AI call, per file.
- FR-10b [bonus, rank 16, 2 h] Matching filenames (UJ-2): a file whose name matches an existing image (case-insensitive) is shown side by side; staff keep both or discard the upload; one answer can be applied to all open matches in the batch. Per file, before any AI call. Fallback: a plain warning; the upload is kept.
- FR-11 [spine] Embedded metadata (UJ-2): on upload read EXIF, IPTC, XMP incl. date taken, camera data, GPS; stored original unchanged. Embedded title, description, alt text, keywords fill the agency fields; AI result replaces them if chosen; if AI fails they stay.
- FR-12 [spine] AI metadata (UJ-2): English title, description, alt text, keywords. Keywords cover place, weather/season, emotion, colour/adjective, activity, object, perspective/composition. Provider gets a resized copy with no embedded metadata; as text, the embedded metadata and FR-13 place name, told never to turn coordinates into place names. With place names off: no place name, no coordinates, no embedded location fields. Versioned prompt (v3): describe what is visible; never state or infer ethnicity, religion, health, sexual orientation, political opinion or union membership; never identify a person from appearance; a name only if written in the image or given in metadata.
- FR-13 [bonus, rank 7, 3 h] Place names (UJ-1, UJ-2): from GPS, derive a place name, stored as searchable, editable staff metadata, whether or not AI is used. Works offline (no key, no network). No match → empty, not an error. Editing coordinates does not change the place name. Fallback: none; GPS still stored.
- FR-14 [planned, rank 2, 1.5 h] Output checks (UJ-2): whatever the provider — ≤ 15 generated keywords, no duplicates, lower case except proper nouns, alt text within NFR-6's limit. Each record stores provider, model and prompt version. Shared and hand-written keywords are kept outside the 15. Fallback: provider schema only; staff review.
- FR-15 [bonus, rank 10, 4 h] Background processing (UJ-2): upload and generation run in the background; each image shows uploading / queued / generating / ready / failed / rejected, updating within 10 s without reload. Editable once uploaded and (if AI) has metadata or failed. Generation continues if staff leave; after a server restart every image ends ready or failed; leaving while files upload warns first. Fallback: processed while the upload page waits; SC-14 drops.
- FR-16a [spine] AI failure (UJ-2): upload still succeeds, image shows failed with a plain reason, staff can fill in fields, rest of the batch continues. Invalid/missing answer, timeout, missing or wrong key all count as failure.
- FR-16b [planned, rank 3, 1 h] Retry (UJ-2): retry one failed draft or all failed drafts in a batch; AI text never changes a published image; a retry never overwrites a staff-edited field. Fallback: staff fill in by hand.
- FR-17 [spine] Editing (UJ-2): staff edit agency fields, place name, date taken and GPS; camera data read-only. Upload-review drafts autosave. Published/library images: Edit → Save changes or Cancel; leaving with unsaved changes asks save / discard / keep editing. Failed save shows an error and keeps the value. Invalid values refused with a message (alt text over limit, impossible date, lat/long out of range). Edits to a published image take effect at once and appear in the next file served.
- FR-18 [bonus, rank 15, 4 h] Edit locks (UJ-2): one staff user at a time edits an image or its batch; others see who. Library lock starts on Edit; ends on save, cancel, discard, leaving the editor, logout, or 15 min idle; then another user can take over. A save from an expired lock is refused and keeps the value. Generation is not blocked by locks. Fallback: last save wins; SC-10 drops.
- FR-19a [spine] Draft and publish (UJ-2): image stays draft until published; all staff see drafts, clients never. Staff publish single images. Publishable once upload is complete and not queued/generating. Missing metadata never blocks: a warning lists each image lacking title, description, alt text or keywords and says it is harder to find and less accessible; staff confirm or go back. Publishing again changes nothing. Restricted with an empty list behaves as internal-only, with a warning (S4). Published never returns to draft.
- FR-19b [bonus, rank 18, 1.5 h] Publishing a batch (UJ-2): publish a whole batch in one action under FR-19a's rules; publishes those that qualify, lists the others with the reason; the missing-metadata warning lists every affected image at once. Fallback: publish one by one.
- FR-20 [bonus, rank 12, 1 h] Discarding drafts: permanently discard a never-published draft after confirming; its hash no longer blocks a re-upload. Fallback: archive instead.

**F3. Access and licences**

- FR-21 [spine] Visibility and price (UJ-2): every image is public to all logged-in clients, restricted to listed clients, or internal-only; and free or paid. Both changeable after publishing.
- FR-22 [spine] Access rule (UJ-3): what a client gets follows the access table (A1–A13 below). Anything a client may not see returns "not found", never "forbidden" — pages, previews, files, downloads. Search results, thumbnails and counts include only what the client may see.
- FR-23 [spine] Licences (UJ-3): one licence type in v1 (standard commercial use) with a USD price and a licence text set by staff. A licence stores client, contact, image and title at the time, licence type, text version, price ex VAT and currency at the time, timestamp. A client's first download of a free image records a 0 USD licence; the download action links to the terms and states that downloading accepts them. At most one active licence per client per image (S5). Re-downloading is unlimited.
- FR-24 [spine] Licences last: a licence survives later changes of visibility, price, archiving and contact deactivation (S3, S15).
- FR-25 [bonus, rank 6, 3 h] Revoke: staff revoke (never delete) from the image page or client card, for one client or all holders. Warning lists affected licences; reason required (S11). Marked revoked with who/when/why; revoked paid licence flagged for possible credit (S13); client history shows "removed by the agency" (S12). Also removes the client from the restricted list; a public image stays available under its normal row, and the warning says so. Sharing again follows normal rules; old licence stays revoked (S14). Fallback: no revoke; S11–S14 not tested.
- FR-26 [spine] Archiving: archive instead of delete, and restore. Archived = neither visible nor own for clients without an active licence; staff can still find it.

Access table (one client):

| Row | Status | Visibility for this client | Price | Active licence | Client gets |
|---|---|---|---|---|---|
| A1 | Published | Public | Free | No | Sees it; downloads a client copy; first download records a 0 USD licence. No tick until then. |
| A2 | Published | Public | Paid | No | Preview without watermark; can add to cart. |
| A3 | Published | Public | Any | Yes | Own image. |
| A4 | Published | Restricted, on the list | Free | No | Own image (tick, My images); first download records a 0 USD licence. Every listed client. |
| A5 | Published | Restricted, on the list | Paid | No | Preview without watermark; can add to cart. |
| A6 | Published | Restricted, on the list | Any | Yes | Own image. |
| A7 | Published | Restricted, not on the list | Any | No | Not found. |
| A8 | Published | Restricted, not on the list | Any | Yes | Own image. |
| A9 | Published | Internal-only | Any | No | Not found. |
| A10 | Published | Internal-only | Any | Yes | Own image. |
| A11 | Archived | Any | Any | No | Not found. |
| A12 | Archived | Any | Any | Yes | Own image. |
| A13 | Draft | Any | Any | No | Not found. |

Own image with an active licence: tick, client copy download, cannot be added to the cart. A revoked licence counts as no licence.

Edge rules (each an automated test): S1 contact deactivated → refused next request; S2 client inactive → all its contacts refused next request; S3 archived → licence holders keep it, gone for others; S4 restricted with empty list → internal-only; S5 simultaneous purchases / first downloads → one active licence; S6 contact on a staff route → 403, no data; S7 buying a free or own image → refused; S8 setup link reused or expired → refused; S9 last active staff deactivated → refused; S10 deleting a client → no such action; S11 revoke without reason → refused; S12 revoked, no other access → download not found, history "removed by the agency"; S13 revoked paid licence → stays in log, flagged for credit; S14 shared again after revoke → normal rules, not reactivated; S15 free image downloaded, then client unlisted or price changed → still accessible.

**F4. Search and browse**

- FR-27 [spine] Staff search (UJ-1): whole library by keyword over title, description, keywords and place names; filter by client, visibility, price, status (draft/published/archived) and date taken.
- FR-28 [spine] Client browsing (UJ-3): two entry points, My images (own) and Find images (all visible). Own images carry a green tick in Find images. Search and filter by price and date taken; "only my images"; no client filter. Client search matches title, description, alt text and keywords (aligned with AD-6 on 2026-11-23) — not place name or staff notes.
- FR-29 [spine] Search behaviour (UJ-1, UJ-3): case-insensitive; all terms must match; newest first; paged; an empty result says so and offers to clear filters.
- FR-30 [spine] Image page (UJ-1, UJ-3): larger image with metadata. A contact sees agency fields, date taken, camera data; never staff notes, provider details, other clients, GPS or place name. Own or A1 → download; otherwise preview and licence options, each opening its licence text and terms. Empty fields left out; no title → "Untitled image", in lists too.

**F5. Cart and checkout**

- FR-31 [planned, rank 5, 3 h] Cart (UJ-3): a contact adds a paid image with a licence type, views and edits the cart; per contact, kept between sessions. Adding again keeps one line. Two contacts of one client see only their own cart. Free or own images: no add action, and a direct request is refused (S7). Removing the last line shows the empty state. Fallback: checkout on one image (FR-32).
- FR-32 [spine] Checkout (UJ-3): no payment; contact must accept the licence terms; records one licence per line in the transaction log and lists the purchased images for download. Each line re-checked: no longer visible, now free or already held → removed with a message; changed price → must be confirmed; before anything is recorded. All lines or none. Double submit records nothing extra; an empty cart cannot be checked out.
- FR-33 [spine] Licence history (UJ-3): all contacts of a client see the client's licences — image, licence type, price, date, acquiring contact, licence text as accepted; revoked shown as "removed by the agency".

**F6. Downloads**

- FR-34 [spine] Current metadata (UJ-1, UJ-3): every downloaded copy carries current metadata — XMP always, IPTC-IIM and EXIF description where supported, UTF-8. Staff download a staff copy with all metadata incl. location. IIM byte limits (title 64, description 2000, keyword 64; æøå = 2 bytes): shorten at the last whole word that fits, else last whole character, always valid UTF-8; a keyword over the limit is left out of IIM; XMP and EXIF always hold the full value.
- FR-35 [spine] Client copies (UJ-3): rebuilt from a whitelist — agency fields; embedded copyright notice, creator, credit line; date taken; camera make/model, lens, exposure; colour profile; EXIF orientation. Maker notes, serial numbers and owner names left out.
- FR-36 [spine] No location data (UJ-3): client copies, previews and on-page images contain no coordinates, no structured location fields in EXIF/XMP/IPTC (city, sub-location, state, country, location shown/created), no place name record, no embedded thumbnail or preview. JPEG and PNG. Place names written in agency fields are content and stay.
- FR-37 [bonus, rank 17, 1.5 h] ZIP (UJ-3): download several images, incl. a whole checkout, as one ZIP of client copies; same-name files get distinct names. Fallback: one download per image.

**F7. Client dashboard**

- FR-38a [planned, rank 4, 2.5 h] Dashboard (UJ-3, UJ-4): after login a contact sees own images, licences, and images made visible since the contact's last login or in the last 30 days, whichever period is longer, with links to My images and Find images. (Last login 40 days ago → sees one made visible 35 days ago; last login 5 days ago → sees one from 20 days ago, not 35.) Nothing from another client. Fallback: land on My images.
- FR-38b [bonus, rank 20, 1 h] Activity list (UJ-3): 10 most recent licences and downloads by any of the client's contacts, newest first, with contact, image, date. Fallback: none.

**F8. Admin and settings**

- FR-39 [bonus, rank 14, 2 h] AI settings: staff choose provider (mock or Claude) and model, and can override the API key on a settings page; env vars give defaults; mock is default. Key stored encrypted, shown masked, never logged. Claude without a valid key → generation fails under FR-16a; the rest works. Fallback: env vars only.
- FR-40 [bonus, rank 13, 1.5 h] Licence settings: staff set the licence type's price and text. Paid price > 0; text not empty. Changing the text creates a new version; existing licences keep their version and price. Fallback: price and text from seed data.
- FR-41 [spine] Transaction log: staff see all licences, filter by client and date range, narrow to paid only; includes revoked licences and credit flags.
- FR-42a [bonus, rank 8, 2.5 h] Action log (UJ-2): record with user and time — upload, metadata edit, publish, draft discard, visibility/price change, archive/restore, revoke, download, client and user changes, setup link creation, settings changes. Nobody can edit it. Fallback: nothing recorded; SC-8 drops.
- FR-42b [bonus, rank 19, 1 h] Action log view: staff view the action log per user. Fallback: recorded, not shown.

**F9. Stretch**

- FR-43 [stretch, 5 h] New versions: upload a new version of an image keeping identity, licences and history; only the latest is shown and downloaded; older ones listed on the image page. Not built unless everything else is done (data-model seam only: `file_versions`).

### NonFunctional Requirements

- NFR-1 Runnable without keys: from a machine with Docker to the full flow by following the README in about 20 minutes, including the first image build; no API key, paid account or local model. Docker Compose v2 on any OS; developed on macOS; CI builds and tests on x86 Linux; only building images needs network. Seeded users and sample images cover every access-table row and the location test files, dev/test only; README lists seeded users and passwords. Mock returns fixture metadata per sample image (all seven keyword categories) and labelled placeholder metadata otherwise; fails on demand.
- NFR-2a Security: access enforced on the server for every page, file and download through one access module covered by access-matrix tests. Passwords hashed, unreadable. Stored originals never reachable by a public path; upload filenames never used as storage paths. CSRF protection on state changes. Embedded metadata and AI output are untrusted text: escaped wherever shown, never executed or followed. Secrets from env vars, documented in `.env.example`, never in code, logs or repo.
- NFR-2b [bonus, rank 21, 1 h] Login delay: after 10 failed logins for one account in 15 minutes, further attempts are delayed. Fallback: none (RG-1 requires it before rollout).
- NFR-3 Privacy: real images and client data never enter the repo; uploads stay out of git; v1 on sample data only.
- NFR-4 Scale: with 500 images and 10 clients (generated, out of git), search answers in < 1 s on a laptop, measured by a repeatable script. With Claude: median < 10 s per image, none longer than the 30 s timeout, a batch of 100 within 15 min; checked once by hand and recorded in the README.
- NFR-5a Accessibility: WCAG 2.1 A + AA on staff and client pages; works from 360 px wide. Automated axe scan with no serious or critical violations on the main pages, plus a manual keyboard pass. Alt attribute = alt text → title → "Untitled image"; no image presented as decorative. Known exception: images published without alt text (FR-19a).
- NFR-5b [bonus, rank 22, 1.5 h] WCAG 2.2 AA beyond NFR-5a. Fallback: WCAG 2.1 AA.
- NFR-6 Metadata standard: IPTC Photo Metadata 2025.1; alt text ≤ 250 characters (aim < 150); keywords UTF-8.
- NFR-7 Errors and repeated actions: every user-facing error in plain English says what happened and what to do next; every list has an empty state; repeated or double-submitted actions never crash or duplicate. Fixed messages, tested word for word:
  - Wrong email or password: "Incorrect email or password. Contact the agency to set up a new password."
  - Setup link expired or used: "Link expired. Contact the agency for a new one."
  - Deactivated user / contact of inactive client: "Your account is not active. Contact the agency."
  - File rejected: "*file name* was not uploaded: it is not a JPEG or PNG image / it is larger than 50 MB / the file is damaged."
  - Identical file: "*file name* is already in the library." (with a link to the existing image)
  - AI failure: "Metadata could not be generated: *reason*. Fill in the fields yourself or try again."
  - Locked: "*name* is editing this image. You can edit it when they finish, or after 15 minutes without activity."
  - Failed save: "Your change was not saved. Try again."
  - Cart line removed: "*title* was removed from your cart: it is no longer available."
  - Price changed: "The price of *title* has changed from *old* to *new* USD. Confirm to continue."
- NFR-8 Language: UI and generated metadata in English; all UI strings in a translation file; output language is a provider input.
- NFR-9 Data model for later stages: licence types are records with price, currency, text; every stored price has a currency code and excludes VAT; images and file versions are separate records with a media-type field; AI providers implement one interface with an app-owned, versioned prompt and schema; users have a role field; GPS stored as latitude/longitude; batches have an owner; top-level tables have a tenant ID (no scoping layer). Every image keeps coordinates and place name; whether a client may see location is decided in one place in the access module (always no in v1).
- NFR-10 Integrity: a stored original's hash never changes after upload (tested). A failure during checkout or file generation leaves no partial licence and no partial file served.

Success criteria SC-1 to SC-16 (PRD) are the acceptance tests stories trace to; SC-C1 and SC-C2 are counter-metrics, not targets.

### Additional Requirements

From the architecture spine (status final, 2026-11-23). Cited by AD ID in stories.

**Starter template and foundation (Epic 1, Story 1)**

- **Starter:** scaffold with `create-next-app@16.4.6 --ts --app --src-dir --eslint --no-tailwind --no-cache-components --no-agent-feedback` (AD-1). Next.js App Router, TypeScript 5.9.3, Designsystemet React 1.24.0 for all UI (no Tailwind/shadcn), Drizzle 0.45.4 / drizzle-kit 0.31.11 on PostgreSQL 18.7, Node 26 LTS. Pinned versions in the spine's Stack table.
- **Docker Compose runtime** (AD-24, Deployment): services `db` (postgres:18.7 with healthcheck, dev DB + test DB, volume at `/var/lib/postgresql`), `migrate` (one-shot: migrations + places loader), `app` (Next.js, full Debian `perl` + ExifTool, `/api/health`), `worker` (FR-15, same image), and a `test` profile with `app-test` and `e2e` (Playwright image v1.65.0-noble). `app`/`worker` wait for `migrate` (`service_completed_successfully`). `next.config` lists `exiftool-vendored` and `sharp` in `serverExternalPackages`. The foundation story verifies ExifTool writes UTF-8 IIM in the image.
- **CI:** GitHub Actions on x86 Linux runs the same Compose setup (build + tests).
- **Environment variables** (exactly these in `.env.example`): `DATABASE_URL`, `TEST_DATABASE_URL`, `APP_ORIGIN`, `FILE_STORE_DIR`, `AI_PROVIDER`, `ANTHROPIC_API_KEY`, `AI_MODEL`, `AI_EFFORT`, `MOCK_DELAY_MS`, `MOCK_FAIL`, `WORKER_CONCURRENCY`, `SEED_ON_START`, `APP_ENCRYPTION_KEY` (FR-39 only).
- **Migrations:** only `drizzle-kit generate` as committed SQL, forward-only; never `push`, never edit an applied migration; regenerate after rebasing on journal conflicts (AD-24).
- **Seed:** runs only on an empty database while `SEED_ON_START=true` (dev default); writes through module functions with the mock provider; images from `src/db/seed/images/` with a source and licence list (`SOURCES.md`); documented demo passwords. Seed users: 2 staff; Fjordkaffe AS (2 contacts), Nordlys Sykkel AS (1 contact), Gammel Kunde AS (inactive, 1 contact). About 20–40 freely licensed images (~1600 px, < 500 KB) covering every access-table row, incl. a JPEG with GPS and city fields, a JPEG with an embedded thumbnail and a PNG with location data; oversized test files generated at test time.
- **Repo hygiene:** `.gitattributes` forces `eol=lf` on scripts and Dockerfiles; fonts self-hosted via `next/font` (offline at runtime); uploaded files and generated data stay out of git.
- **Source tree:** `src/app/` routes only ((staff)/, (client)/, api/); `src/modules/{auth,accounts,images,access,licences,downloads,media,ai,ai/providers,places,activity}`; `src/db/{schema,migrations,seed,tenant.ts}`; `src/worker/`; `messages/en.json`; `tests/e2e/`; `data/places/`; `scripts/`.

**Structure and boundaries**

- AD-2 Routes are thin: guard (AD-5) → zod parse → pages may call several module read functions; a mutation calls exactly one module write function that owns the use case and its transaction. No business rule, DB or FileStore access in `src/app/`.
- AD-3 Module boundaries: public API is `index.ts`; table ownership — auth (credentials incl. `lastLoginAt`/`previousLoginAt`, sessions, setup_links, login_attempts), accounts (tenants, clients, users), images (batches, images, file_versions, image_keywords, image_clients, locks), licences (licence_types, licence_texts, licences, cart_items), ai (metadata_generations, ai_settings), places (places), activity (action_log, append-only). Any module may read any table; writes only through the owner. Allowed call directions per the spine's module diagram, no cycles.
- AD-20 Cross-module writes take a `tx` as first argument; the owning use case opens the transaction; `activity.record(tx, entry)` is append-only.

**Security and transport**

- AD-4: reads in Server Components; form mutations via Server Actions; file traffic and the polling endpoint via Route Handlers. GET never writes (a licence-granting download is a POST that responds with the file). Route Handlers reject state-changing requests whose `Origin` is missing or ≠ `APP_ORIGIN`. Session cookie `HttpOnly`, `SameSite=Lax`, `Secure` outside local dev. No `use cache` / `unstable_cache` / Cache Components on session- or access-dependent data. File responses `Cache-Control: private, no-store`.
- AD-5: DB sessions with a random token stored hashed; argon2id (`@node-rs/argon2`); setup links via `auth.issueSetupLink(tx, userId)`. Every page, Server Action and Route Handler calls `requireStaff()` / `requireContact()` first (layouts are display only); the guard returns an `Actor { userId, role, clientId? }` and re-checks active status (and client active) every call. Every module write function takes the `Actor` and asserts its role; a contact's `clientId`/`userId` come only from the `Actor`. Idle expiry 8 h via `lastSeenAt` (updated at most once a minute; polling does not refresh it). Setting a password ends other sessions in the same transaction. Logout releases edit locks. Return-to after login is a validated same-origin relative path.
- AD-6: one access module — one SQL condition "visible to client X" + computed flags used by every client list, count, search, page, thumbnail, preview and download. `ClientImage` from a fixed column list (never GPS, place name, staff notes, client lists, provider data); `getClientImage(actor, id)` → `ClientImage | null`, null → 404. Client price `{ licenceTypeId, priceMinor, currency }` or Free. Client search over title, description, alt text, keywords; place name only if `clientMaySeeLocation()` (false in v1). "Visible since" (FR-38a) = latest of `publishedAt`, `visibleToAllSince`, `image_clients.addedAt`. Licence history is the one client list not filtered by visibility.
- AD-7 Access tests through real routes: shared seed fixture `src/db/seed/fixture.ts` (one image per A-row and per S-rule, location test files, a `fail` image) and a `loginAs` helper, built in the first auth story. Read rules (A1–A13, S1–S4, S6, S12, S15) as table-driven Playwright request-API tests with an `Origin` header through page, thumbnail, preview, download, My images, Find images, counts and search. Mutation rules (S5, S7, S9, S11, S13, S14) at the module write function against a real DB plus one browser test per rule; S5 also as parallel transactions. Guard test: every staff Route Handler as a contact → 403; every module write function with a contact `Actor` → `Forbidden`. Each e2e run starts from a freshly migrated and seeded test DB and empty file dir; state-changing tests use fixture factories, never matrix rows.

**Images, upload and AI**

- AD-8: `status` (draft | published | archived) and `processingState` (uploading | queued | generating | ready | failed) as separate columns; `publishedAt` set once, never cleared; restore → published if `publishedAt` set, else draft; discard requires `publishedAt is null`; "Rejected" never stored. Every transition one conditional `UPDATE … WHERE … RETURNING`, 0 rows → `Conflict`. Publish requires `processingState in (ready, failed)` and `nameMatchOf is null`. Metadata edits only when ready or failed. Images and batches carry `version`; every staff save is `WHERE version = $v`; restricted-list changes sent as a diff.
- AD-9: every image belongs to exactly one batch (single upload = batch of one); batch holds defaults copied onto each image at creation; access, generation and retry read only the image's own columns; `images.applyBatchSettings` is the only path from batch to existing images.
- AD-10: title, description, alt text each store a source (`embedded | ai | staff`); keywords are rows `{ keyword, source: embedded | shared | ai | staff, category? }` unique on `(imageId, lower(keyword))`. `saveAiResult` replaces only non-staff fields and embedded/ai keyword rows, 15-limit over ai rows; `applyBatchSettings` replaces only shared rows; staff edits are patches written with source `staff`. Two save shapes: `images.updateDraftField` (Upload autosave, one field per call) and `images.saveImageEdits` (Library Save changes, all fields, per-field errors).
- AD-11 Upload: browser first asks for an image row (`uploading`); file streams to `tmp/<uuid>` with SHA-256 in-stream; media derives thumbnail and preview outside any transaction; one short transaction inserts `file_versions` (unique hash index → conflict deletes the image row and files: Rejected), moves files to final keys, stores embedded metadata, derives the place name for every image (if FR-13), sets `queued` or `ready`. Interrupted upload deletes row and files. Startup sweep deletes `uploading` rows untouched for an hour and clears `tmp/`.
- AD-12 Generation: `images.generateMetadata(imageId)` is the only path — Claim (short tx, `FOR UPDATE SKIP LOCKED`, `generationToken`, `leaseUntil = now + 2 × timeout`) → Generate (no tx; media makes AI input; text input omits place name and filters location when `placeNamesToAi` is off) → Save (`saveAiResult … WHERE generationToken = $token AND status = draft`). Without FR-15: called inline after upload; at app start queued/expired-lease images become failed ("interrupted"). With FR-15: worker claims queued and reclaims expired leases, `WORKER_CONCURRENCY` (default 2); no queue library.
- AD-13 Live state: upload queue in a client provider in the staff layout (survives navigation between staff pages); leaving the app while uploading warns. Upload % browser-local, uploader only. Pages poll one Route Handler about every 3 s; one live region announces aggregated changes at most once per poll.
- AD-14 Edit locks (FR-18): `lockedBy`/`lockedUntil` on images and batches; renewed at most once a minute and on save, to now + 15 min; every staff save checks the lock else `Locked`; image lock blocks its batch's settings, batch lock blocks its images; release on save/cancel/discard/leave/logout; generation, revoke and retry ignore locks. Without FR-18 the check is absent.
- AD-21 AI port: pure generation side (AI image, media type, metadata text, output language → title, description, altText, `keywords: { term, category }[]` + usage, or typed error). App owns versioned prompt and schema (v3); adapters in `src/modules/ai/providers/` registered in one list; FR-14 checks run on every provider's output. Every run recorded in `metadata_generations` (provider, model, prompt version, tokens, latency, result or error category, raw output). Provider/model/effort/key resolved per job (`ai_settings`, else env). Timeout 30 s, `maxRetries: 0`. Error categories `auth`, `rate_limit`, `timeout`, `unavailable`, `refused`, `invalid_output`, each with one NFR-7 reason. FR-39 key: AES-256-GCM with `APP_ENCRYPTION_KEY`, decrypted only inside ai, browser gets only `hasKey` + last 4 chars.
- AD-22 Mock default: `AI_PROVIDER=mock`; fixture metadata per seed image (seven categories), labelled placeholder otherwise; waits `MOCK_DELAY_MS`; records its input (SC-13); fails when `MOCK_FAIL=true` or the filename contains `fail`. Every adapter passes the same contract tests against recorded responses. Claude model `claude-haiku-5-5`, effort medium, `@anthropic-ai/sdk` 1.7.0.
- AD-23 Place names (FR-13): kept script builds a compressed GeoNames extract (Norwegian populated places with municipality and county, world cities > 15,000) committed in `data/places/` with download date; idempotent loader in `migrate`; nearest place within a radius via lat/lon index in SQL, else country only. CC BY 4.0 credit in README, beside the data file and on the staff help page.

**Files and metadata**

- AD-15: `FileStore` interface (put, get, move, delete as streams) used only by media; keys `tmp/<uuid>`, `originals/<fileVersionId>`, `derived/<fileVersionId>/<kind>`, never from upload filenames; v1 local disk on a Docker volume at `FILE_STORE_DIR`. Every file reaches a browser through a Route Handler that asks access (client) or the staff guard first; only the latest file version is shown or downloaded.
- AD-16: original never modified. Derived files with sharp (auto-orient first): thumbnail, preview (≤ 800 px), AI input (1568 px, sRGB). Thumbnails and previews keep only the ICC profile and no agency metadata; AI input keeps none; made once at upload, shared by staff and clients. Client copy: original pixels; ExifTool strips all, copies back the FR-35 whitelist + EXIF `Orientation`, writes current agency fields. Staff copy: original bytes + all current metadata incl. location. Image row is the source for every editable field. XMP always (full); IIM shortened by the app (D-028) with `IPTC:CodedCharacterSet = UTF8`, keywords over 64 bytes left out of IIM; PNG gets XMP, no IIM. Values via exiftool-vendored's write API (never a command line), control characters removed first. Untrusted text rendered only as escaped React text, never `dangerouslySetInnerHTML`.
- AD-17 Fail closed: media checks every client-receivable file against the research's location checklist; thumbnails/previews once when made (a hit fails that upload); client and staff copies built on demand into a temp file, never cached; each client copy checked before streaming; any hit or build error → error response, nothing streamed until complete and checked.

**Licences and checkout**

- AD-18: `licences.grantLicence(tx, actor, …)` is the only creator, returns `{ licence, created }`; S5 via partial unique index `(clientId, imageId) where revokedAt is null` + on-conflict-do-nothing. Licence stores client, contact (nullable), `source` (purchase | free_download | staff_grant), image, title at the time, licence type, `licence_texts` version id, price in minor units, currency, timestamp. Licence texts are immutable versions. Images store only `priceTier` (free | paid); a paid image's price is its licence type's current price. The licences table is the transaction log. Revoke sets `revokedAt`, `revokedBy`, reason, credit flag; never deletes; removes the client from the restricted list in the same transaction (bumping image `version`).
- AD-19: cart lines store `licenceTypeId`, seen price and currency. One client's checkouts and free first downloads serialise on `pg_advisory_xact_lock(clientId)`. Checkout is one transaction re-checking every line through access; if anything changed, no licence is recorded — in its own transaction the cart drops unavailable/now-free/already-held lines and stores new prices, then returns NFR-7 messages; otherwise every licence is granted and the cart emptied. The single-image fallback is the same code with one line. A free first download (POST) builds and checks the client copy, then grants, then streams; `downloads` orchestrates.

**Conventions**

- IDs: UUID v7 from Postgres `uuidv7()`; never sequential IDs in URLs.
- Tenancy: constant `DEFAULT_TENANT_ID` in `src/db/tenant.ts`; `tenantId` NOT NULL on users, clients, batches, images, licence_types, licences, cart_items, action_log.
- Money: integer minor units + ISO 4217 currency, ex VAT; never floats.
- Time: `timestamptz` UTC, shown in Europe/Oslo; date taken as `timestamp without time zone` + optional offset, shown as captured.
- Coordinates: `latitude`/`longitude` on the image; place name in separate columns (place, municipality, county, country).
- Naming: tables snake_case plural; TS camelCase; one `actions.ts` per route segment.
- Validation: zod at the route boundary; emails trimmed, lower-cased, unique on `lower(email)`; `ALT_TEXT_MAX = 250` one shared constant.
- Errors: modules throw `NotFound`, `Forbidden`, `Conflict`, `Validation`, `Locked` with a message key; one shared helper maps them to HTTP status / form state and NFR-7 text; unexpected errors logged and shown generically with a next step.
- Idempotency: unique constraints; creates without a natural key carry a form nonce with a unique index; races via conditional updates and `version`.
- Deletes: FKs `on delete restrict`, except derived rows that cascade from an image; only FR-20 deletes an image, then media deletes its files.
- Lists: `?page=` offset paging, 1-based, 48 per image grid, 50 per table; total count from the same condition; empty state always.
- Search: one `buildSearchCondition(terms, fields)` in images, used by staff search and by access with the client field set; whitespace split, case-insensitive, all must match; order `createdAt desc, id desc`. Matching technique (ILIKE vs full-text) decided in the first search story against NFR-4's 1 s.
- Display: one `displayTitle()` / `altFor()` helper in images used by every list and page.
- Logging: pino; never log passwords, tokens, setup links or API keys.
- Text: next-intl; every UI string and NFR-7 message in `messages/en.json`; no locale segment in URLs.
- NFR-4 data: `scripts/generate-scale-data.ts` builds 500 images / 10 clients into a separate database; never committed.

### UX Design Requirements

From the UX contract `DESIGN.md` (visual) + `EXPERIENCE.md` (behaviour), both final 2026-11-23. EXPERIENCE.md wins over mocks and the prototype.

**Theme and foundation**

- UX-DR-1 Graphite theme: generate the Designsystemet theme from `designsystemet.config.json` (accent `#25282D`, support brand1 `#5D6672`, neutral `#2B2D30`, border radius 3) and override status colours (success `#16803C`, danger `#CC1631`, warning `#EE6A0E`, info `#1E5FC2`). Map every product token in DESIGN.md's Colors table to its `--ds-*` variable, plus the product variable `--price`. Light only, no dark mode.
- UX-DR-2 Typography: Instrument Sans (400–700) self-hosted via `next/font`, fallback `system-ui, -apple-system, 'Segoe UI', sans-serif`, tabular numerals everywhere; the named type tokens (page-title 24/600, panel-title 18/600, wordmark 17/650, sidebar-heading, section-title, nav, body 16, body-sm 15, tile-title 15/600, label 14/500, meta 13, price 600, price-lg 20, stat-number 22). No serif/display faces, no all-caps labels.
- UX-DR-3 Spacing, shapes and elevation tokens: 4 px unit; topbar 64 px; page padding 28/36/56 (16 at ≤ 900 px); panel pad 24 (16 mobile); sidebar 264 px; Details panel 400 px; drawer 320 px (max 86 vw); radii none / tag 1.5 / image 2 / default 3 / full. Flat: shadows only on the drawer, popovers, dialogs, on-image tags and the tick ring.
- UX-DR-4 Contrast: every load-bearing pair in DESIGN.md's contrast table meets its target (text ≥ 4.5:1, UI boundaries ≥ 3:1); `hairline` decorative only.
- UX-DR-5 Microcopy and voice: all UI strings in `messages/en.json`; plain verbs on buttons ("Save changes", "Keep both", "Discard new file", "Try again", "Add to cart", "Download"); counts with nouns ("Publish 41 ready images", "Try the 3 failed again", "Unsaved changes (1 field)"); PRD glossary terms exactly (image, client, contact, licence, draft/published/archived, "Untitled image", "removed by the agency"); no jargon to clients ("client copy", "visibility", "restricted"). NFR-7 messages verbatim.

**Shell and navigation**

- UX-DR-6 Top bar: white, hairline bottom; left → right: sidebar toggle, wordmark (staff "CRM-DAM" with square mark; client: client name over "Image portal"), main nav tabs, header search (max 520 px; staff placeholder "Search title, description, keywords and places" → Library; client "Search images" → Find images), then right-aligned cart button (clients) and account (avatar + first name) menu with Log out (+ Settings and Action log for staff).
- UX-DR-7 Main nav: header-led tabs (staff: Library default, Upload, Clients, Licences; client: Overview default, My images, Find images, Licences); current tab `aria-current="page"` with 2 px accent underline. No Upload button in the top bar or Library header. Leaving the Library with unsaved edits opens the Unsaved-changes dialog first.
- UX-DR-8 Context sidebar and toggle: contextual only, never navigation (Library → Filters; Upload → To-do + batches "Your batches"/"Other staff"; Clients → client list; Find images / My images → Filters + own-image count note; hidden on Licences, Settings, Action log, Image page). Toggle has `aria-expanded`. At ≤ 900 px it becomes an overlay drawer (closed by default) with scrim; focus moves in on open; toggle becomes a close (×) button on top; Escape / scrim click close; focus returns to the toggle; page scroll locked while open.
- UX-DR-9 List row (facets, batches, to-do): label left, count right in meta; hover `surface-tinted`, current `selected-tint` + `aria-current`; processing facets carry an 8 px status dot, Failed a danger count badge; counts update live.
- UX-DR-10 System pages: Login and Set password as one centred form on canvas with no navigation; 403 page (contact on staff route); Not found page (anything a contact may not see); session expired → next action goes to Login, then back to the page.

**Wall and tile**

- UX-DR-11 Image wall: justified rows at 168 px row height (120 px at ≤ 560 px), row gap 28 px (16 without captions), column gap 16 px; toolbar with semibold count ("248 images, newest first"), removable active-filter chips, sort select (staff), captions switch; pagination below; newest first; Designsystemet skeleton tiles on cold load.
- UX-DR-12 Filter chips: Designsystemet checkbox chips for Status, Visibility, Price; toggling filters at once (no Apply); each active filter shown as a removable chip in the toolbar (e.g. "Taken from 1 Jan 2025").
- UX-DR-13 Image tile: a button with `aria-pressed` (and `aria-expanded` at ≤ 1240 px); image at its own aspect ratio, 2 px radius; status tags top-left; own tick top-right; caption: title (one line, ellipsis) + meta line (staff: visibility icon + label or client name, and price; client: price or "Yours to download"). Hover 1 px ring; selected 2 px canvas gap + 2 px accent ring. Uploading: skeleton + white % pill for the uploader only. Failed: one-line danger error under the title (captions on). Alt via the NFR-5a chain.
- UX-DR-14 Status tag: Designsystemet tag sm, always text-labelled — Neutral (Draft, Queued, Archived), Info (Uploading), Accent + spinner labelled "In progress" (Generating, slow-pulse dot), Success (Ready, Published), Danger (Failed), Warning (Needs a decision, Rejected, Needs alt text). Updates within 10 s without reload; stays visible with captions off; on-image shadow.
- UX-DR-15 Own-image tick: 26 px success circle, white check, 2 px white ring; inline 18 px variant before "Your image" / "Yours to download". Shown on A3, A4, A6, A8, A10, A12; never on A1 before first download; an own image never shows Add to cart.
- UX-DR-16 Price: "{n} USD" or "Free", ex VAT, `price` colour `#5D6672` semibold with tag icon, no wrap; `price-lg` in the licence option. Never a status colour, accent, tag, or sepia. Staff see price on every published image; clients on buyable images and "Free" on A1.
- UX-DR-17 Captions switch: "Show captions" (Designsystemet switch, `role="switch"`), on by default; off hides caption lines visually only (they remain the accessible name), tags/tick/ring stay, rows close up; no hover tooltip; remembered per user across visits and devices (stored with the user account).

**Details panel and editing**

- UX-DR-18 Details panel: white 400 px column, hairline left edge; header panel-title + file line, actions right; 236 px loupe on canvas (fixed height); status line (tags, counts, save status); sections under section-title; Designsystemet Details for secondary groups; sticky footer with the primary action. Three variants: Library (view → Edit → Save changes), Upload (editable at once, autosave), Client (read-only; licence, download / cart actions). Appears only while an image is selected (Library, Overview); otherwise main takes its width. "Open full image page" icon → staff Image page with the same sections and states.
- UX-DR-19 Inline details (≤ 1240 px): selected image takes a full row (up to min(60vh, 520px)), details open directly below it with "Close details" (focus back to the tile), other images continue below; never below all images. Upload: selected file row expands as an accordion with editable fields. Overview: panel under the page, scrolled to.
- UX-DR-20 Library edit model: view mode read-only; Edit → inputs, focus to Title; changed-field marker (3 px warning bar + "Changed" label) appears when a value differs and disappears if changed back; footer Save changes (primary) / Cancel (secondary) / save status ("No changes yet" → "Unsaved changes (n fields)"); Save changes → view mode, "Changes saved", focus to Edit; Cancel discards without asking. Covers title, description, alt text, keywords, place name, date taken, latitude/longitude, visibility, clients, price; camera data read-only. Validation errors under the field block Save. Failed save keeps edit mode and values with the NFR-7 message. No autosave in the Library.
- UX-DR-21 Unsaved-changes dialog: on selecting another image, closing inline details or switching tab with changes — "You have unsaved changes" / "Your edits to **{title}** are not saved yet. Save them before you go on, or discard them."; Save changes (saves, continues) / Discard (drops, continues) / Keep editing or Escape (stays, focus to the last edited field). Reload or tab close with unsaved edits uses the browser's leave-page prompt.
- UX-DR-22 Upload autosave: fields editable at once ("Check and correct — Changes save as you type"); status "Saved" after each save; failure shows "Your change was not saved. Try again." and keeps the value. Save status announced via `role="status"`.
- UX-DR-23 Access controls: toggle groups Visibility (Internal / Restricted / Public) and Price (Free / Paid), one-line hint under Visibility; client chips + "Add client" only when Restricted; inline warning under the chips when Restricted has no clients (behaves as internal-only, S4); Paid shows the current licence price read-only ("90 USD per licence, ex VAT") with a link to Settings, no per-image amount. View mode shows the same as a key-value list.
- UX-DR-24 Keyword chips: view = neutral tags; edit = removable chips ("Remove keyword {k}") + "Add keyword"; on Upload grouped by category (from AI output, prompt v3) with "(n of 15)" after the label; embedded, shared and hand-written keywords in their own group.
- UX-DR-25 Staff-only details: Place field with hint "Staff only. Clients never see the place."; "How the metadata was made" (provider, prompt version); "Who can see it" section; Staff copy download action.

**Upload surface**

- UX-DR-26 Batch start and settings: "New batch" at the top of the sidebar Batches list opens main with batch settings (FR-9 defaults: internal-only, free, place names on) and the drop zone; settings show as a summary under the batch title with "Edit batch settings" on its own line; applying settings to the draft batch goes through the Confirm dialog.
- UX-DR-27 Drop zone and drop bar: Designsystemet file upload "Drop JPEG or PNG files here, up to 50 MB each" + "Choose files"; once the batch has files it shrinks to a one-line bar ("Add more files", "or drop JPEG or PNG files anywhere on this page, up to 50 MB each"); the whole page then accepts drops and the bar lights up (surface-tinted + accent border) while dragging. Rejections appear as rows and never stop the batch. "Keep this page open until the last file has uploaded. Metadata keeps generating if you leave."
- UX-DR-28 File row: 52 px thumb, file name or title (semibold), meta sub-line, message line in danger/warning text, status tag and row action at the end; click selects (shows in the Details panel or expands inline), clicking the selected row again deselects; selected = `selected-row-tint` + 3 px accent inset bar; failed rows have inline "Try again"; rejected rows "Not added" with the NFR-7 message.
- UX-DR-29 File order and ready group: files that need you first (name matches, failed, missing alt text, not added, still processing); list head "65 files, files that need you first"; order holds while working and catches up only when idle (no file selected, focus outside list and panel) so rows never move under the cursor. Ready and published files fold into one group row ("81 ready to publish, 4 published") with Show / Hide (`aria-expanded`, focus stays on the row), opening on Show, when "ready to publish" is the current to-do item, when the selected file is inside, or when no other rows are left; Hide deselects a file inside.
- UX-DR-30 To-do list: items (failed, file name matches, need alt text, ready to publish, still processing, not added) with stat-number counts coloured by kind and a one-line instruction; choosing an item moves its files to the top, scrolls to the list and focuses the first; clicking the current item again restores the usual order ("Back to the usual order"; list head e.g. "65 files. At the top: 12 need alt text"); "Try the 3 failed again" retries all failed drafts (FR-16b).
- UX-DR-31 Batch list and progress: batch rows (name, muted "when, what is left", file count) in "Your batches" and "Other staff", all openable. Batch progress: legend of status dots with bold counts + 6 px segmented meter (`aria-hidden`) on a surface-tinted track; Ready and "need alt text" counted apart to match the to-do list.
- UX-DR-32 Context alert: warning alert at the top of the Details panel. File name match: two-up comparison ("New file" / "In the library", 104 px thumbs), Keep both / Discard new file, and "Use the same answer for the other file name match"; tag "Needs a decision"; publish disabled with "Decide on the file name match first. Then you can publish it." Identical file: NFR-7 message, "Open the existing image" link + card of the existing image (96 px thumb, title, status, visibility, price), "Remove from this list".
- UX-DR-33 Publish actions: "Publish this image" per file; batch header "Publish {n} ready images"; the missing-metadata Confirm dialog lists what lacks title/description/alt text/keywords; batch publish shows a result summary (published count, and any not published with the reason).

**Client surfaces**

- UX-DR-34 Client access display: tile caption and panel actions per access row — A1: "Free", no tick, Download with "Downloading accepts the licence terms. Read the terms", then the own-image layout after first download; A2/A5: price (or "In cart"), preview ≤ 800 px, Licence option, Add to cart (then "In cart" + link to cart), cart summary ("Cart: 2 images, 270 USD") + "Go to checkout"; own (A3/4/6/8/10/12): "Yours to download", tick, "Your image", Licence card, Download. Sections "About the image" (description, alt text, date taken, keywords) and "Technical details" (camera + lens, exposure, pixel size + orientation, download format and size); never GPS, place name, photographer credit, staff notes, provider details or other clients; empty fields left out.
- UX-DR-35 Licence option and terms dialog: card on canvas with hairline border — licence name semibold + price-lg on one line, one meta line of scope, "Read the licence terms" opening the licence text in a dialog; reachable from the image panel, cart, checkout and free-download note.
- UX-DR-36 Cart button: secondary button with cart icon, "Cart" and a count badge (label visually hidden at ≤ 560 px); opens the Cart.
- UX-DR-37 Cart, checkout and confirmation: cart lines editable (remove); empty cart shows empty state with a link to Find images and no Check out; terms checkbox — Check out disabled with the reason shown until ticked; removed / price-changed lines show the NFR-7 messages before anything is recorded; confirmation lists bought images with Download each (or one ZIP if FR-37); bought images then show the tick.
- UX-DR-38 Overview (client dashboard): own images strip, licences, newly visible images, recent activity (section hidden if FR-38b is cut); each section has its own one-line empty state; links to My images and Find images stay; selecting an image anywhere opens the client Details panel in place (never navigates); selecting again closes it; licence rows link to the image only while visible. Landing after login and after setting a password.
- UX-DR-39 My images / Find images: same layout; Find images has "Only my images" filter, Price and Date taken filters, own-image count note; no client filter. My images empty: says so and links to Find images.
- UX-DR-40 Client licence history: data table with "removed by the agency" for revoked rows; empty state links to Find images.

**Staff admin surfaces**

- UX-DR-41 Clients: sidebar client list (name, contacts and own images on the sub-line, licence count right); client card with contacts, visible images and licences; inline field errors (org number 9 digits mod-11, unique email); inactive clients shown as inactive, no delete; setup link shown with a Copy button and a short "Copied" status, new link cancels the old.
- UX-DR-42 Staff Licences (transaction log): data table, filters client / date range / paid only (no licence-type filter in v1); revoked rows show who, when, why and the credit flag; empty and filtered-empty states with "Clear filters".
- UX-DR-43 Settings: AI provider, model and key (masked) (FR-39); licence price and text with inline errors (price > 0, text not empty) and the note that a new text applies to new licences only; no version number shown anywhere; staff users (FR-3).
- UX-DR-44 Action log page: per-user view, data table, empty state.

**Shared components**

- UX-DR-45 Buttons and text actions: at most one primary per panel footer or page header; disabled only with a visible reason next to it; double submit never duplicates. Secondary: white fill, graphite border (Edit, Keep both, Try the 3 failed again, Cart). Text actions always underlined 1 px (2 px on hover, offset 0.2 em) for Cancel-level and navigation actions; not underlined: icon-only buttons, toggle options, pagination, search clear.
- UX-DR-46 Confirm dialog: for publish with missing metadata, apply batch settings, discard draft, revoke; states what happens and to which images or licences; primary first then "Go back"; Escape = Go back; destructive ones use the danger colour; revoke's confirm stays disabled until a reason is entered (S11). One dialog at a time, never stacked; dialogs trap focus and return it to the trigger.
- UX-DR-47 Pagination, data tables, empty states: Designsystemet pagination sm with "Showing 1–14 of 248", keeps filters and search; Designsystemet tables sortable by date where relevant, newest first, row opens its record, prices in price style; every list has an empty state — one muted sentence plus at most one action (e.g. Clear filters), no illustration; "No images match your search and filters." for the Library.
- UX-DR-48 Error alert: offline / server error on any list shows a Designsystemet alert at the top of main with what failed and "Try again".

**Responsive and accessibility**

- UX-DR-49 Breakpoints: > 1240 px three columns (sidebar open by default, main, fixed Details panel without close); ≤ 1240 px details inline (Library, Upload, Find images, My images; Overview panel under the page); ≤ 900 px sidebar drawer, nav and header search wrap onto their own full-width rows, main padding 16 px; ≤ 560 px compact wall, stacked file rows, one-column key-value lists, cart label and user name visually hidden, captions switch on its own line; 360 px floor with no horizontal scroll.
- UX-DR-50 Keyboard and focus: every action reachable by Tab in reading order; Click/Enter/Space act; Escape closes the topmost thing (dialog, then drawer); focus rules — drawer in/out, Edit → Title, Save/Cancel → Edit, Close details → tile, Keep editing → last edited field; visible focus ring on `:focus-visible` only (3 px, graphite outer, white inner) on every interactive element incl. tiles and file rows.
- UX-DR-51 Announcements and signals: save status, unsaved count and processing updates via polite `role="status"`, one aggregated live announcement per poll; colour never the only signal (tags have text, prices icon + weight, changed fields a "Changed" label, meter `aria-hidden` beside a text legend); every icon-only button has an accessible name ("Show or hide filters", "Open full image page", "More actions: archive, revoke licences", "Remove keyword {k}"); reduced motion stops spinners, skeletons and the Generating pulse.
- UX-DR-52 Interaction bans: no drag-and-drop except files onto the drop zone/page; no modal stacks; no autosave in the Library; no hover-only information or actions, no hover tooltips for hidden captions; no silent loss of edits; paged lists, not infinite scroll; select, don't navigate (the full image page is one click away).

### FR Coverage Map

Each FR maps to the epic that completes it. "First cut in Epic 1" means the thin slice builds a minimal version that the named epic completes.

| FR | Epic | Tag (rank) | Note |
|---|---|---|---|
| FR-1 Client records | 2 | spine | |
| FR-2 Contacts | 2 | spine | |
| FR-3 Staff accounts | 2 | bonus (11) | |
| FR-4 Setup links | 2 | spine | |
| FR-5 Login | 2 | spine | First cut in Epic 1 (seeded users log in and out) |
| FR-6 Roles | 2 | spine | First cut in Epic 1 (guards, `loginAs`); Epic 2 adds the guard test over every route |
| FR-7 Client card | 2 | bonus (9) | |
| FR-8 Upload | 3 | spine | First cut in Epic 1 (one image, type and size checks) |
| FR-9 Batch settings | 3 | planned (1) | |
| FR-10a Identical files | 3 | spine | |
| FR-10b Matching filenames | 3 | bonus (16) | |
| FR-11 Embedded metadata | 3 | spine | First cut in Epic 1 (read and store; fill agency fields) |
| FR-12 AI metadata | 3 | spine | First cut in Epic 1 (mock provider only); Epic 3 adds the Claude adapter and prompt v3 |
| FR-13 Place names | 3 | bonus (7) | |
| FR-14 Output checks | 3 | planned (2) | |
| FR-15 Background processing | 3 | bonus (10) | |
| FR-16a AI failure | 3 | spine | |
| FR-16b Retry | 3 | planned (3) | |
| FR-17 Editing | 3 | spine | |
| FR-18 Edit locks | 3 | bonus (15) | |
| FR-19a Draft and publish | 3 | spine | First cut in Epic 1 (publish one image) |
| FR-19b Publishing a batch | 3 | bonus (18) | |
| FR-20 Discarding drafts | 3 | bonus (12) | |
| FR-21 Visibility and price | 4 | spine | First cut in Epic 1 (set at publish) |
| FR-22 Access rule | 4 | spine | First cut in Epic 1 (the access condition and A1/A2/A13); Epic 4 completes A1–A13 and the read rules |
| FR-23 Licences | 5 | spine | First cut in Epic 1 (purchase licence from checkout) |
| FR-24 Licences last | 5 | spine | |
| FR-25 Revoke | 5 | bonus (6) | |
| FR-26 Archiving | 4 | spine | |
| FR-27 Staff search | 4 | spine | |
| FR-28 Client browsing | 4 | spine | First cut in Epic 1 (Find images, unfiltered) |
| FR-29 Search behaviour | 4 | spine | |
| FR-30 Image page | 4 | spine | |
| FR-31 Cart | 5 | planned (5) | |
| FR-32 Checkout | 5 | spine | First cut in Epic 1 (checkout on one image) |
| FR-33 Licence history | 5 | spine | |
| FR-34 Current metadata | 5 | spine | |
| FR-35 Client copies | 5 | spine | |
| FR-36 No location data | 5 | spine | |
| FR-37 ZIP | 5 | bonus (17) | |
| FR-38a Dashboard | 4 | planned (4) | |
| FR-38b Activity list | 6 | bonus (20) | Moved from Epic 4 during story writing: it lists downloads, which only the action log (FR-42a) records |
| FR-39 AI settings | 6 | bonus (14) | |
| FR-40 Licence settings | 6 | bonus (13) | |
| FR-41 Transaction log | 5 | spine | First cut in Epic 1 (list of licences) |
| FR-42a Action log | 6 | bonus (8) | |
| FR-42b Action log view | 6 | bonus (19) | |
| FR-43 New versions | — | stretch | Not scheduled; the `file_versions` seam is built in Epics 1 and 3 |

NFRs: NFR-1, NFR-2a, NFR-3, NFR-8, NFR-9, NFR-10 start in Epic 1 and hold for every story; NFR-6 and NFR-7 apply to every story that touches metadata or user-facing errors. NFR-2b → Epic 2 (bonus, 21). NFR-4, NFR-5a → Epic 7 (axe scans are added per page as pages are built; Epic 7 is the full pass). NFR-5b → Epic 7 (bonus, 22).

## Epic List

### Epic 1: The whole flow, thinly — one image from upload to licence
Staff log in, upload one image with mock AI metadata, set its visibility and price and publish it; a contact logs in, finds it and checks it out; the licence shows in the transaction log. Runs from `docker compose up` with seed data and no API key. This is the 2026-11-30 checkpoint test (SC-3 path in mock mode, checkout on one image).
**FRs covered (first cut):** FR-5, FR-6, FR-8, FR-11, FR-12, FR-19a, FR-21, FR-22, FR-23, FR-28, FR-32, FR-41. **Also:** starter template, Compose, CI, README v0, seed data and mock (AD-22, AD-24), seed fixture and `loginAs` (AD-7), Graphite theme and shell (UX-DR-1 to UX-DR-10); NFR-1, NFR-2a, NFR-8, NFR-10.

### Epic 2: Onboarding clients and contacts (UJ-4)
Staff create clients and contacts and hand out setup links; contacts set a password and log in; deactivation takes effect on the next request.
**FRs covered:** FR-1, FR-2, FR-4, FR-5, FR-6 (spine); FR-7 (bonus 9), FR-3 (bonus 11), NFR-2b (bonus 21).

### Epic 3: Uploading and describing a shoot (UJ-2)
Staff upload a batch; bad and identical files are rejected; AI metadata is generated through the mock or Claude; failures never block; staff review with autosave, edit library images with Edit → Save changes, and publish.
**FRs covered:** FR-8, FR-10a, FR-11, FR-12, FR-16a, FR-17, FR-19a (spine); FR-9 (planned 1), FR-14 (planned 2), FR-16b (planned 3); FR-13 (bonus 7), FR-15 (bonus 10), FR-20 (bonus 12), FR-18 (bonus 15), FR-10b (bonus 16), FR-19b (bonus 18).

### Epic 4: Finding images — staff library and client portal (UJ-1, UJ-3 steps 2–4)
Staff search and filter the whole library and archive or restore images; contacts browse My images and Find images and see exactly what the access table allows, proven by the access matrix through real routes (SC-1).
**FRs covered:** FR-21, FR-22, FR-26, FR-27, FR-28, FR-29, FR-30 (spine); FR-38a (planned 4).

### Epic 5: Licensing and downloads (UJ-3 steps 4–6)
Clients download client copies with no location data, take free images with a 0 USD licence, and buy through cart and checkout; staff download staff copies, read the transaction log and revoke licences.
**FRs covered:** FR-23, FR-24, FR-32, FR-33, FR-34, FR-35, FR-36, FR-41 (spine); FR-31 (planned 5); FR-25 (bonus 6), FR-37 (bonus 17).

### Epic 6: Administration — settings and the action log
Staff set the AI provider and key and the licence price and text, and can read who did what; contacts see their client's recent activity, which reads the action log. Bonus only; can be cut as one block.
**FRs covered:** FR-42a (bonus 8), FR-40 (bonus 13), FR-39 (bonus 14), FR-42b (bonus 19), FR-38b (bonus 20).

### Epic 7: Ready for the examiner
The examiner runs and checks everything from the README: the accessibility pass (axe scan + manual keyboard pass), the NFR-4 scale script and measurement, and a README run from a fresh clone.
**FRs covered:** NFR-5a, NFR-4, NFR-1 verification (spine); NFR-5b (bonus 22).

**Not scheduled:** FR-43 (stretch).

### Dependencies and build order

Epics depend only on earlier epics (1 → 2 → 3 → 4 → 5 → 6 → 7). The build order is not the epic order; it follows the PRD's tiers so the 2026-11-30 checkpoint can draw the cut line by rank:

1. Epic 1 (the thin slice) — the checkpoint question.
2. The spine stories of Epics 2–5 and 7.
3. Planned, by rank: FR-9 → FR-14 → FR-16b → FR-38a → FR-31.
4. Bonus, by rank: FR-25 → FR-13 → FR-42a → FR-7 → FR-15 → FR-3 → FR-20 → FR-40 → FR-39 → FR-18 → FR-10b → FR-37 → FR-19b → FR-42b → FR-38b → NFR-2b → NFR-5b.

Rows below the cut line take their PRD fallback at once; each cut is a D-entry and PRD changes go through `bmad-correct-course`.

### Hours and cut candidates (for the 2026-11-30 checkpoint)

Estimates from story writing (2026-11-23), including tests and the per-story routine. They are higher than the PRD's: the spine comes to about 99 h against the PRD's 75 h and the ~87 h build budget, mostly because Epic 1 and the UX surfaces were priced in more detail. Nothing is cut now. At the checkpoint, Epic 1's actual hours are compared with its ~45 h estimate to see which estimates hold, and the cut line is drawn by rank (PRD Release Stages).

| Tier | Stories | Est. h |
|---|---|---|
| Spine | Epic 1 (1.1–1.9) ~45; Epic 2 (2.1–2.4) ~8.5; Epic 3 (3.1–3.6) ~14; Epic 4 (4.1–4.7) ~13.5; Epic 5 (5.1–5.5) ~10.5; Epic 7 (7.1–7.3) ~7.5 | ~99 |
| Planned, ranks 1–5 | 3.7, 3.8, 3.9, 4.8, 5.6 | ~10.5 |
| Bonus, ranks 6–22 | 5.7, 3.10, 6.1, 2.5, 3.11, 2.6, 3.12, 6.2, 6.3, 3.13, 3.14, 5.8, 3.15, 6.4, 6.5, 2.7, 7.4 | ~34 |

**Spine cut candidates** (UX polish the PRD did not price; each has a stated fallback): 3.6 Files that need you come first (~2.5 h), 4.7 Image walls adapt to the screen and the viewer (~2 h), and the drawer and breakpoint work in 1.3 (~2 h). Cutting them saves about 6.5 h. Any cut is a D-entry, and PRD changes go through `bmad-correct-course`.

## Epic 1: The whole flow, thinly — one image from upload to licence

Staff log in, upload one image with mock AI metadata, set its visibility and price and publish it; a contact logs in, finds it and checks it out; the licence shows in the transaction log. Runs from `docker compose up` with seed data and no API key. This epic is the 2026-11-30 checkpoint test (SC-3 in mock mode, checkout on one image). Later epics complete each first cut.

### Story 1.1: The app starts from one command

As the examiner,
I want to start the app and its tests with Docker Compose and no API key,
So that I can run and check the project by following the README.

**Traces to:** NFR-1, NFR-2a (secrets), NFR-8, AD-1, AD-3 (source tree), AD-24, Stack · spine · ~6 h

**Acceptance Criteria:**

**Given** a fresh clone on a machine with Docker Compose v2
**When** I run the README's start command
**Then** `db` (with healthcheck), `migrate` (one-shot, completes) and `app` start in that order, and `GET /api/health` returns 200 once the database answers
**And** nothing needs network access except building the images, and no API key is set.

**Given** the repository
**When** I look at its structure
**Then** it is scaffolded with `create-next-app@16.4.6 --ts --app --src-dir --eslint --no-tailwind --no-cache-components --no-agent-feedback`, uses the pinned versions from the spine's Stack table, and has the spine's source tree (`src/app`, `src/modules/*`, `src/db/{schema,migrations,seed}`, `src/db/tenant.ts` with `DEFAULT_TENANT_ID`, `messages/en.json`)
**And** `.env.example` lists exactly the 13 environment variables of AD-24, `.env` and the local file-store directory are gitignored (NFR-3), and `.gitattributes` forces `eol=lf` on scripts and Dockerfiles.

**Given** the app image
**When** a test writes a title of 32 "æ" (64 bytes) to IPTC-IIM through exiftool-vendored and reads it back
**Then** the value comes back unchanged with `CodedCharacterSet = UTF8`, which proves Perl and ExifTool work in the image
**And** `exiftool-vendored` and `sharp` are listed in `serverExternalPackages`.

**Given** the `test` Compose profile
**When** I run the README's test command
**Then** Vitest runs against the test database and Playwright (Playwright image v1.65.0-noble) runs one smoke test against `app-test`, each run starting from a freshly migrated test database and an empty test file directory.

**Given** a push or pull request
**When** GitHub Actions runs on x86 Linux
**Then** it builds the images and runs the same Compose test command, and a failing test fails the check.

**Given** a schema change
**When** it is made
**Then** it is a committed SQL migration from `drizzle-kit generate`, applied by `migrate`; `drizzle-kit push` is not used.

**Given** the README
**When** I read it
**Then** it states what the app does and for whom, prerequisites with versions, the exact start and test commands, the environment variables, and links to `docs/process/`.

### Story 1.2: Staff and contacts log in and out

As a staff user or a contact,
I want to log in with my email and password and log out again,
So that only known users get in and each lands in their own part of the app.

**Traces to:** FR-5, FR-6 (first cut), NFR-2a, NFR-7, AD-3 (auth, accounts), AD-4, AD-5, AD-7 (fixture users, `loginAs`), Conventions (Errors, Validation, Logging, IDs, Tenancy), UX-DR-10 · spine · ~5 h

**Acceptance Criteria:**

**Given** an empty database and `SEED_ON_START=true`
**When** the app starts
**Then** the seed creates, through accounts and auth module functions, the tenant, 2 staff users, Fjordkaffe AS with 2 contacts, Nordlys Sykkel AS with 1 contact, and Gammel Kunde AS (inactive) with 1 contact, with argon2id password hashes
**And** the seed does nothing on a non-empty database, and the README lists the seeded users and their demo passwords.

**Given** a seeded staff user on the Login page
**When** they enter the right email and password
**Then** they land on the staff landing page, and the session is a random token in an `HttpOnly`, `SameSite=Lax` cookie (`Secure` outside local dev), stored hashed in `sessions`
**And** a seeded contact lands on the client landing page instead.

**Given** the Login page
**When** someone enters an unknown email, or a known email with a wrong password
**Then** both show exactly "Incorrect email or password. Contact the agency to set up a new password."

**Given** the contact of the inactive Gammel Kunde AS
**When** they enter the right password
**Then** they are refused with exactly "Your account is not active. Contact the agency."

**Given** a logged-in contact
**When** their user, or their client, is set inactive (through the accounts module in the test)
**Then** their next request is refused and they are logged out (S1, S2).

**Given** any page, Server Action or Route Handler
**When** it runs
**Then** its first statement is `requireStaff()` or `requireContact()`, which returns an `Actor { userId, role, clientId? }`
**And** a contact requesting a staff route gets the 403 page with no data (S6), and a request with no session goes to Login with a return-to that is accepted only as a same-origin relative path.

**Given** a session idle for more than 8 hours
**When** the user makes a request
**Then** they go to Login; `lastSeenAt` is updated at most once a minute (tested with a controlled clock).

**Given** a logged-in user
**When** they log out
**Then** the session is deleted server-side and the cookie cleared.

**Given** the test suite
**When** a test needs a user
**Then** it uses `loginAs(<fixture user>)` and the named users in `src/db/seed/fixture.ts`
**And** modules throw `NotFound`, `Forbidden`, `Conflict`, `Validation` or `Locked` with a message key, one helper maps them to HTTP status, form state and `messages/en.json` text, and pino never logs passwords, tokens or cookies.

### Story 1.3: Staff and client shells in the Graphite theme

As a staff user or a contact,
I want a clear top bar, navigation and layout that work on any screen,
So that I always know where I am and can move between sections.

**Traces to:** UX-DR-1 to UX-DR-9, UX-DR-45, UX-DR-47 (empty state), UX-DR-49, UX-DR-50, NFR-5a, NFR-8 · spine · ~4 h

**Acceptance Criteria:**

**Given** the app
**When** any page renders
**Then** it uses the Graphite theme generated from `designsystemet.config.json` with the status colour overrides and the token mapping in DESIGN.md (light only), and Instrument Sans self-hosted with `next/font` and tabular numerals.

**Given** a logged-in staff user
**When** a page loads
**Then** the top bar shows, left to right, the sidebar toggle, the "CRM-DAM" wordmark, main nav tabs for the surfaces built so far (Library, Upload), the header search field, and the account menu (avatar and first name) with Log out
**And** the current tab has `aria-current="page"` and the 2 px accent underline.

**Given** a logged-in contact
**When** a page loads
**Then** the top bar shows the client's name over "Image portal", the client tabs built so far (Find images), the header search field and the account menu with Log out.

**Given** the staff and client landing pages before any images exist
**When** they load
**Then** each shows its empty state (one muted sentence, at most one action), never a blank area.

**Given** a window 900 px wide or less
**When** the user opens the sidebar toggle
**Then** the Context sidebar opens as an overlay drawer over a scrim, focus moves into it, the toggle becomes a close (×) button on top, page scroll is locked, and Escape, the × or a scrim click close it and return focus to the toggle; `aria-expanded` matches the state.

**Given** widths of 1440, 1240, 900, 560 and 360 px
**When** the shell renders
**Then** it follows UX-DR-49 (nav and search wrap onto their own rows at ≤ 900 px; account name visually hidden at ≤ 560 px) with no horizontal scroll at 360 px.

**Given** keyboard use
**When** focus moves
**Then** every interactive element shows the 3 px graphite and white focus ring on `:focus-visible` only.

**Given** the e2e suite
**When** it runs
**Then** an axe scan of Login, the 403 page and both landing pages reports no serious or critical violations, and later pages are added to the same scan list.

### Story 1.4: Staff upload an image and the library stores it safely

As a staff user,
I want to upload JPEG or PNG files and see each one stored as a draft with its embedded metadata,
So that the library keeps every file unchanged and ready to describe.

**Traces to:** FR-8, FR-11 (first cuts), FR-19a (draft state), NFR-2a, NFR-6, NFR-7, NFR-9, NFR-10, AD-3 (images), AD-8, AD-9, AD-10, AD-11, AD-15, AD-16 (derived files), AD-17 (thumbnail/preview check), UX-DR-26, UX-DR-27, UX-DR-28 (first cut) · spine · ~6 h

**Acceptance Criteria:**

**Given** a staff user on Upload
**When** they choose "New batch" and drop or choose files
**Then** a batch owned by them is created (one file is a batch of one), each file appears as a file row at once, and each image row is created as `uploading` before its file is sent (AD-11)
**And** each image gets its own copy of the batch defaults (internal-only, free) (AD-9).

**Given** a file being uploaded
**When** it streams to the FileStore
**Then** it goes to `tmp/<uuid>` with its SHA-256 computed in-stream, under an app-generated key that never uses the upload filename, on the volume at `FILE_STORE_DIR`
**And** no URL serves stored originals directly.

**Given** a file whose content is not JPEG or PNG (whatever its extension), a damaged file, or a file over 50 MB
**When** it is uploaded
**Then** its row shows "Not added" with the Rejected tag and exactly the NFR-7 rejection message naming the file and reason, its row and files are deleted, and the other files in the batch continue (tested with generated oversized, renamed and corrupt files).

**Given** a byte-identical file is already stored
**When** the same bytes are uploaded
**Then** the unique hash index rejects it: the image row and its files are deleted and the row shows "*file name* is already in the library." (the link to the existing image and the same-batch case follow in Epic 3).

**Given** an accepted file
**When** its upload completes
**Then** media makes an auto-oriented thumbnail and a preview of at most 800 px that keep only the ICC profile, checks both against the location checklist (a hit fails the upload), and in one short transaction stores the `file_versions` row (hash, `mediaType`, `byteSize`, oriented width and height) and moves the files to their final keys
**And** the stored original's SHA-256 equals the uploaded file's and never changes (NFR-10 test).

**Given** an accepted file with embedded EXIF, IPTC or XMP
**When** it is stored
**Then** date taken, camera data and GPS (as latitude and longitude) are read into the image row, and embedded title, description, alt text and keywords fill the agency fields with source `embedded`
**And** the image is a draft with `processingState = ready`, shown in the file list with its thumbnail and title or "Untitled image", all text rendered escaped.

**Given** an upload that is interrupted
**When** the connection drops, or the app restarts
**Then** the row and its files are deleted, and the startup sweep removes `uploading` rows untouched for an hour and clears `tmp/`.

### Story 1.5: Uploaded images get AI metadata from the mock provider

As a staff user,
I want title, description, alt text and keywords generated for each uploaded image without an API key,
So that images are described without typing everything by hand.

**Traces to:** FR-12 (first cut: mock only), FR-16a (failed state), NFR-1, NFR-8, NFR-9, AD-3 (ai), AD-10, AD-12, AD-16 (AI input), AD-21, AD-22 · spine · ~5 h

**Acceptance Criteria:**

**Given** the ai module
**When** generation runs
**Then** it goes through one provider port whose input is the AI image, its media type, the metadata text and the output language (`en`), and whose output is title, description, alt text and `keywords: { term, category }[]` in FR-12's seven categories plus usage, or a typed error (`auth`, `rate_limit`, `timeout`, `unavailable`, `refused`, `invalid_output`)
**And** the app owns the versioned prompt and schema (v3), providers are registered in one list, and `AI_PROVIDER=mock` is the default.

**Given** an uploaded image (every upload uses AI until batch settings exist, FR-9 in Epic 3)
**When** its upload completes
**Then** it moves to `queued`, and `images.generateMetadata` runs inline in three steps — claim (short transaction, `generationToken`, lease), generate (no transaction), save (`saveAiResult … WHERE generationToken = $token AND status = draft`) — and the image ends `ready`.

**Given** the AI input
**When** media makes it
**Then** it is 1568 px on the long edge, sRGB, with no metadata at all, and the recording mock shows that the image it received carries no embedded metadata (SC-13, first part)
**And** the text input holds the stored embedded metadata and an instruction never to turn coordinates into place names.

**Given** the mock provider
**When** it receives a seed image with fixture metadata
**Then** it returns that fixture (covering all seven keyword categories) after `MOCK_DELAY_MS`; for any other image it returns clearly labelled placeholder metadata.

**Given** a generated result
**When** it is saved
**Then** it replaces only fields whose source is not `staff`, and only `embedded` and `ai` keyword rows, writing source `ai` and each keyword's category; embedded text stays when generation fails.

**Given** `MOCK_FAIL=true`, or a file whose name contains `fail`
**When** generation runs
**Then** the image ends `failed` with its error category, the upload itself still succeeds, and the other images continue.

**Given** any generation run
**When** it finishes or fails
**Then** a `metadata_generations` row records provider, model, prompt version, tokens, latency, result or error category, and raw output.

**Given** the app restarts
**When** images are `queued`, or `generating` with an expired lease
**Then** they become `failed` with the reason "interrupted".

### Story 1.6: Staff publish an image with its visibility and price

As a staff user,
I want to find my draft in the Library, choose who can see it and whether it is free or paid, and publish it,
So that the right clients can find it.

**Traces to:** FR-19a, FR-21 (first cuts), FR-23 (licence type), NFR-7, NFR-9, AD-6 ("visible since" columns), AD-8, AD-18 (licence types and texts, `priceTier`), Conventions (Money, Lists, Display), UX-DR-11, UX-DR-13, UX-DR-14, UX-DR-16, UX-DR-18 (Library variant), UX-DR-20 (first cut), UX-DR-23, UX-DR-46 · spine · ~5 h

**Acceptance Criteria:**

**Given** the seed
**When** it runs
**Then** it creates one licence type, "Standard commercial use", at 9000 minor units USD ex VAT, with licence text version 1, in tables owned by the licences module.

**Given** a staff user opens the Library
**When** images exist
**Then** the wall shows every image, drafts included, newest first, 48 per page with pagination, each tile showing status tags, title or "Untitled image", visibility (Public, the client name, or Internal only) and price ("90 USD" or "Free")
**And** selecting a tile opens the Details panel in view mode with the image, title, agency fields and "Who can see it".

**Given** an image in the Details panel
**When** the staff user chooses Edit
**Then** the access controls appear: Visibility (Internal / Restricted / Public), a client picker shown only for Restricted, Price (Free / Paid), and for Paid the read-only "90 USD per licence, ex VAT"
**And** Save changes saves them with the image's `version` (a stale version gives `Conflict` and the NFR-7 failed-save message), Cancel drops them; metadata fields join this edit mode with FR-17 in Epic 3.

**Given** Restricted with no clients chosen
**When** the form shows
**Then** an inline warning says the image behaves as internal-only (S4).

**Given** a draft whose `processingState` is `ready` or `failed`
**When** the staff user chooses "Publish this image"
**Then** one conditional update sets `status = published` and `publishedAt`, and the image can no longer return to draft
**And** publishing an image that is still `uploading`, `queued` or `generating` is refused with a reason, and publishing again changes nothing.

**Given** a draft lacking a title, description, alt text or keywords
**When** the staff user chooses Publish
**Then** a confirm dialog lists what is missing and says the image will be harder to find and less accessible; the primary action publishes, "Go back" (or Escape) cancels.

**Given** visibility changes
**When** they are saved
**Then** `visibleToAllSince` is set when an image becomes public and each `image_clients` row stores `addedAt`, so "visible since" (AD-6) can be computed later.

### Story 1.7: The examiner starts with a sample library

As the examiner,
I want the app to start with sample images that cover every access case,
So that I can try every flow without uploading anything myself.

**Traces to:** NFR-1, NFR-3, AD-7 (fixture), AD-22 (fixture metadata), AD-24 (seed), PRD addendum (seed data) · spine · ~4 h (sourcing the images is the user's part)

**Acceptance Criteria:**

**Given** `src/db/seed/images/`
**When** I look at it
**Then** it holds 20–40 freely licensed images (CC0 or public domain, or the user's own; not Unsplash or Pexels), each about 1600 px and under about 500 KB, with a `SOURCES.md` listing source, author and licence per file
**And** they include a JPEG with GPS and city fields, a JPEG with an embedded thumbnail, a PNG with location data, and one file whose name contains `fail`.

**Given** the mock provider
**When** it is asked about a seed image
**Then** it has fixture metadata for that image, and across the set every one of the seven keyword categories appears in at least one image.

**Given** an empty database with `SEED_ON_START=true`
**When** the seed runs
**Then** it uploads, generates and publishes the sample images through module functions (never raw SQL inserts), giving each the status, visibility, client list and price its fixture row needs.

**Given** `src/db/seed/fixture.ts`
**When** a test imports it
**Then** it names one image per access row that needs no licence — A1, A2, A4, A5, A7 (restricted to the other client), A9, A11, A13 — plus an S4 image (restricted, empty list), the location test files and the `fail` image; rows that need a licence are added in Story 1.9.

**Given** the README
**When** the examiner reads it
**Then** it lists the sample images' source and licence note and which seeded client sees what.

### Story 1.8: A contact finds the images their client may see

As a contact,
I want to browse Find images and open an image,
So that I can see what the agency has made available to my organisation.

**Traces to:** FR-22, FR-28, FR-30 (first cuts), NFR-2a, NFR-9, AD-4 (caching), AD-6, AD-7, AD-15, UX-DR-13, UX-DR-15, UX-DR-16, UX-DR-18 (client variant), UX-DR-34, UX-DR-35 · spine · ~5 h

**Acceptance Criteria:**

**Given** the access module
**When** any client-facing code needs image data
**Then** it uses the one "visible to client X" SQL condition with computed `own`, `canDownload` and `canBuy` flags, and gets a `ClientImage` built from the fixed column list (agency fields, date taken, camera data, dimensions, price, flags)
**And** `getClientImage(actor, imageId)` returns `null` for anything not visible, every route turns that into 404 (never 403), and `clientMaySeeLocation()` returns false.

**Given** a contact opens Find images
**When** images are visible to their client
**Then** the wall shows them newest first, 48 per page, with a count computed from the same condition, and each tile shows title or "Untitled image" and price ("90 USD") or "Free"
**And** with nothing visible, the empty state shows.

**Given** a thumbnail or preview request from a contact
**When** the Route Handler runs
**Then** it asks access first, serves the derived file with `Cache-Control: private, no-store`, and returns 404 for an image the client may not see.

**Given** a contact selects a visible image
**When** the client Details panel opens
**Then** it shows the preview, title, "About the image" (description, alt text, date taken, keywords) and "Technical details", with empty fields left out
**And** for a paid image the licence option ("Standard commercial use — 90 USD") with "Read the licence terms", which opens the licence text in a dialog.

**Given** any client page response
**When** it is checked in a test
**Then** it contains no GPS, place name, staff notes, provider details or client lists.

**Given** the fixture rows A1, A2, A4, A5, A7, A9, A11, A13 and S4
**When** the table-driven HTTP tests (Playwright request API with an `Origin` header) run as a Fjordkaffe contact and as a Nordlys contact
**Then** the image page, thumbnail, preview, Find images list and its count each return exactly what the access table says (visible, or 404 and absent from lists and counts).

### Story 1.9: A contact checks out a paid image and staff see the licence

As a contact,
I want to license a paid image by accepting the licence terms,
So that it becomes my client's own image, and the agency sees the licence in its log.

**Traces to:** FR-23, FR-32, FR-41 (first cuts), FR-24 (fixture), NFR-7, NFR-10, AD-6 (own), AD-18, AD-19, AD-20, SC-3, UX-DR-15, UX-DR-37 (first cut), UX-DR-42 (first cut), UX-DR-45 · spine · ~5 h

**Acceptance Criteria:**

**Given** a contact viewing a paid image they do not own (A2, A5)
**When** they choose to license it
**Then** a checkout page shows the one line with its price and licence type, a link to the licence terms and a terms checkbox, and Check out stays disabled with the reason shown next to it until the box is ticked.

**Given** the terms are accepted
**When** the contact checks out
**Then** one transaction, under `pg_advisory_xact_lock` on the client id, re-checks the line through access (still buyable, not already held, same price) and calls `licences.grantLicence` (source `purchase`), which stores client, contact, image, the image's title at the time, licence type, licence text version, price in minor units, currency and timestamp
**And** the confirmation page lists the licensed image.

**Given** the price changed since the contact saw it
**When** they check out
**Then** nothing is recorded and they see exactly "The price of *title* has changed from *old* to *new* USD. Confirm to continue."; confirming records the licence at the new price.

**Given** the image is no longer visible, now free or already held
**When** they check out
**Then** nothing is recorded and they see exactly "*title* was removed from your cart: it is no longer available."

**Given** a double submit, or two parallel checkouts of the same image for one client
**When** both reach the database
**Then** exactly one active licence exists (partial unique index on `(clientId, imageId) where revokedAt is null`, insert on conflict do nothing) (S5, first part)
**And** a direct request to license a free or own image is refused at the module write function (S7).

**Given** the checkout succeeded
**When** the contact returns to Find images
**Then** the image carries the own-image tick and "Yours to download", and offers no licence action.

**Given** a staff user opens the Licences tab
**When** licences exist
**Then** a table lists every licence newest first with client, contact, image title, licence type, price and date, and shows its empty state when there are none.

**Given** the fixture
**When** it is extended in this story
**Then** licence-holding images for rows A3, A6, A8, A10 and A12 are seeded through `grantLicence`, and the access tests from Story 1.8 cover them.

**Given** mock mode with the seed data and no API key
**When** the SC-3 e2e test runs
**Then** a staff user uploads an image, mock metadata is generated, they make it public and paid and publish it, a contact finds it and checks it out, and the licence appears in the staff Licences tab — the 2026-11-30 checkpoint test.

## Epic 2: Onboarding clients and contacts (UJ-4)

Staff create clients and contacts and hand out setup links; contacts set a password and log in; deactivation takes effect on the next request; no contact ever reaches staff data. Bonus stories add the client card, staff account management and the login delay.

### Story 2.1: Staff create and manage clients

As a staff user,
I want to create and edit client records and set them inactive or active,
So that the agency's client register lives next to its images.

**Traces to:** FR-1, FR-5 (S2 via the UI), FR-6, NFR-7, AD-3 (accounts), AD-5, Conventions (Validation, Idempotency, Deletes), UX-DR-8 (client list sidebar), UX-DR-41, UX-DR-47 · spine · ~2.5 h

**Acceptance Criteria:**

**Given** a staff user
**When** they open the Clients tab
**Then** the sidebar lists every client (name, contact count on the sub-line), newest first, with an empty state when there are none, and "Add client" opens a form.

**Given** the client form
**When** staff save a client with a name, an optional org number, a billing email, an account manager chosen from active staff users, and staff notes
**Then** the client is created as active; double-submitting the form creates one client (form nonce).

**Given** an org number
**When** it is not 9 digits or fails the mod-11 check
**Then** saving is refused with an inline field error, and a valid one (e.g. a seeded client's) is accepted.

**Given** an invalid billing email or an empty name
**When** staff save
**Then** each field shows its own inline error and nothing is saved.

**Given** an active client with logged-in contacts
**When** staff set the client inactive
**Then** the client shows as inactive, each of its contacts is refused on their next request with "Your account is not active. Contact the agency." (S2), and setting it active again lets them log in.

**Given** any client
**When** staff look for a way to delete it
**Then** none exists — no UI action, route or module function (S10).

### Story 2.2: Staff add and manage contacts

As a staff user,
I want to add contacts to a client, edit them, and deactivate or reactivate them,
So that the right people at each client can log in.

**Traces to:** FR-2, FR-5 (S1 via the UI), NFR-7, AD-3, AD-5, Conventions (Validation: emails), UX-DR-41, UX-DR-47 · spine · ~2 h

**Acceptance Criteria:**

**Given** a client
**When** staff add a contact with name, email and optional phone
**Then** the contact is created as an active user with role contact and that client's id, and is listed under the client.

**Given** an email that is already used by any user, staff or contact, in any letter case or with spaces around it
**When** staff save
**Then** saving is refused with an inline error, because emails are trimmed, lower-cased and unique on `lower(email)`.

**Given** a contact with licences
**When** staff change the contact's email
**Then** it is the same user afterwards: the user id, licences and history are unchanged, and the contact logs in with the new email.

**Given** a logged-in contact
**When** staff deactivate them
**Then** their next request is refused with "Your account is not active. Contact the agency." (S1), and reactivating lets them log in again.

**Given** contact management
**When** a contact is deactivated
**Then** their licences remain the client's (FR-24) and nothing is deleted.

### Story 2.3: Contacts set their password from a setup link

As a contact,
I want to open the link the agency sent me and set my own password,
So that I can log in to my client's portal without the agency knowing my password.

**Traces to:** FR-4, FR-5 (new password ends other sessions), NFR-2a, NFR-7, AD-5 (`auth.issueSetupLink`), UJ-4, SC-12 (UJ-4 part), UX-DR-10, UX-DR-41 · spine · ~2.5 h

**Acceptance Criteria:**

**Given** staff create a contact
**When** it is saved
**Then** a setup link is created in the same transaction through `auth.issueSetupLink(tx, userId)` and shown to staff with a Copy button and a short "Copied" status after copying; the app sends no email.

**Given** an existing user
**When** staff choose to create a new setup link (password reset)
**Then** a new single-use link valid for 7 days is shown and every earlier unused link for that user stops working.

**Given** a valid setup link
**When** the contact opens it and sets a password of at least 12 characters
**Then** the password is stored as an argon2id hash, the link is used up, all the user's other sessions end in the same transaction, and the contact is logged in and lands on the client landing page.

**Given** a password shorter than 12 characters
**When** the contact submits it
**Then** an inline error says so and the link stays valid.

**Given** a link that has been used, has expired, or was replaced by a newer one
**When** it is opened
**Then** it goes to Login with exactly "Link expired. Contact the agency for a new one." (S8)
**And** tokens are stored hashed and never logged.

**Given** the UJ-4 e2e test
**When** it runs
**Then** staff create Fjordkaffe-like client and two contacts, copy a link, the contact sets a password and lands in the portal, an expired link shows the expired message, and a wrong password shows the wrong-password message.

### Story 2.4: Contacts can never reach staff routes or data

As the agency,
I want every staff route and staff action to refuse contacts,
So that no client ever sees staff notes, account managers, client lists or another client's data.

**Traces to:** FR-6 (complete), NFR-2a, AD-5, AD-7 (guard test), SC-1 (S6) · spine · ~1.5 h

**Acceptance Criteria:**

**Given** the guard test
**When** it runs
**Then** it finds every staff Route Handler and staff page from the route tree (not a hand-kept list), calls each as a logged-in contact, and expects 403 with no data in the body (S6).

**Given** every exported module write function
**When** it is called with a contact `Actor` where a staff role is required
**Then** it throws `Forbidden`, and the test fails if a new write function is added without a role assertion.

**Given** a contact's request
**When** a module function needs the client or user id
**Then** it comes only from the `Actor`; a test that sends another client's id in the input gets that client's data nowhere.

**Given** the contact-facing pages built so far
**When** their HTML is checked
**Then** it contains no staff notes, account manager, visibility list or other client's name.

### Story 2.5: Staff see everything about a client on one card [bonus, rank 9]

As a staff user,
I want one page per client with its details, contacts, visible images and licences,
So that I can answer a client's question without searching several places.

**Traces to:** FR-7, FR-6 (S6), AD-6 (visible condition), SC-12 (client card part), UX-DR-41, UX-DR-47 · bonus (rank 9) · ~2 h · Fallback: the client edit page with contacts; licences through the transaction log

**Acceptance Criteria:**

**Given** a staff user selects a client in the Clients sidebar
**When** the client card opens
**Then** it shows the client's details including staff notes and account manager, its contacts with status and setup-link actions, the images visible to it, and its licence history with revoked licences marked.

**Given** the seed data
**When** staff open Fjordkaffe AS's card
**Then** it shows its 2 contacts, exactly the images the access table lets Fjordkaffe see (computed with the access module's condition, same as the client's own count), and all its licences.

**Given** a contact
**When** they request a client card's address
**Then** they get 403 and no data (S6).

### Story 2.6: Staff manage staff accounts [bonus, rank 11]

As a staff user,
I want to add, edit, deactivate and reactivate staff users,
So that new colleagues can work in the app and leavers lose access.

**Traces to:** FR-3, FR-4, FR-5, AD-5, SC-12, UX-DR-43 (staff users) · bonus (rank 11) · ~1.5 h · Fallback: only the two seeded staff users

**Acceptance Criteria:**

**Given** Settings → Staff users
**When** a staff user adds a colleague with name and email
**Then** the colleague is created as active staff and a setup link is shown, exactly as for contacts (Story 2.3).

**Given** an active staff user
**When** another staff user deactivates them
**Then** their next request is refused and their sessions end; reactivating lets them log in.

**Given** only one active staff user
**When** anyone tries to deactivate that user, including two staff deactivating each other at the same time
**Then** the action is refused with a plain message and at least one staff user stays active (S9, tested as parallel transactions).

### Story 2.7: Repeated failed logins are slowed down [bonus, rank 21]

As the agency,
I want repeated failed logins to one account to be delayed,
So that passwords cannot be guessed quickly.

**Traces to:** NFR-2b, FR-5, AD-3 (`login_attempts`), RG-1 · bonus (rank 21) · ~1 h · Fallback: no delay; RG-1 requires it before rollout

**Acceptance Criteria:**

**Given** 10 failed logins for one email within 15 minutes
**When** an 11th attempt is made, with any password
**Then** it is refused with a plain message to wait a few minutes and try again, until the 15-minute window has passed (tested with a controlled clock).

**Given** an email that belongs to no account
**When** it fails 10 times
**Then** it is delayed in exactly the same way, so the delay reveals nothing about which accounts exist.

**Given** a successful login
**When** it happens before the limit
**Then** the failure count for that email is cleared.

## Epic 3: Uploading and describing a shoot (UJ-2)

Staff upload a batch; bad and identical files are explained; AI metadata comes from the mock or Claude, and failures never block; staff review drafts with autosave, edit library images with Edit → Save changes, and publish. Planned and bonus stories add batch settings, output checks, retry, place names, background processing, discarding, edit locks, filename matches and batch publishing.

### Story 3.1: Staff follow a batch on the Upload page

As a staff user,
I want to see my batches, each file's state and what is left to do,
So that I know where a shoot stands and can publish files as they are ready.

**Traces to:** FR-8, FR-19a (publish from Upload), UJ-2, AD-8, AD-13 (upload queue), UX-DR-26, UX-DR-28, UX-DR-30 (counts), UX-DR-31, UX-DR-33, UX-DR-14 · spine · ~2.5 h

**Acceptance Criteria:**

**Given** a staff user on Upload
**When** batches exist
**Then** the sidebar lists "Your batches" and "Other staff" with name, a muted line (when, what is left) and file count, newest first; "New batch" sits at the top, and any batch can be opened (drafts are visible to all staff).

**Given** an open batch
**When** it loads
**Then** main shows the batch title, the drop bar, the batch progress (legend of status dots with counts and a 6 px meter marked `aria-hidden`) and the file list, each row with a 52 px thumbnail, file name or title, a meta line, a message line and a status tag (Uploading, Queued, Generating, Ready, Failed, Rejected, Needs alt text)
**And** the sidebar's "To do in this batch" shows counts for failed, need alt text, ready to publish, still processing and not added, matching the progress legend.

**Given** files are uploading
**When** the uploader looks at the page
**Then** each uploading row shows a percentage (browser-local, uploader only), "Keep this page open until the last file has uploaded." is shown, and leaving the app while files upload asks first
**And** the upload queue lives in a provider in the staff layout, so moving between staff pages does not stop it.

**Given** a ready or failed draft selected in the file list
**When** the staff user chooses "Publish this image"
**Then** it publishes under FR-19a's rules (Story 1.6), including the missing-metadata confirm dialog and S4's warning, and its row moves to Published.

**Given** a batch with no files
**When** it is shown
**Then** the full drop zone ("Drop JPEG or PNG files here, up to 50 MB each", "Choose files") replaces the drop bar.

### Story 3.2: Problem files are explained: identical files and AI failures

As a staff user,
I want to see why a file was not added or has no metadata, and what to do,
So that one bad file never holds up the rest of the batch.

**Traces to:** FR-10a (complete), FR-16a (complete), NFR-7, AD-11, AD-21 (error categories), SC-2 (identical part), SC-7 (first part), UX-DR-32 (identical file) · spine · ~1.5 h

**Acceptance Criteria:**

**Given** a file byte-identical to an image in the library, including an archived one
**When** it is uploaded
**Then** its row shows exactly "*file name* is already in the library." with "Open the existing image", the Details panel shows a context alert with a card of the existing image (thumbnail, title, status, visibility, price), and "Remove from this list" dismisses the row.

**Given** two byte-identical files in the same batch, including when both upload at the same time
**When** they finish
**Then** exactly one is stored and the other is rejected with the identical-file message, before any AI call for it.

**Given** generation fails for an image
**When** its row and panel show
**Then** the tag is Failed and the message is exactly "Metadata could not be generated: *reason*. Fill in the fields yourself or try again.", with one plain reason per error category (`auth`, `rate_limit`, `timeout`, `unavailable`, `refused`, `invalid_output`, `interrupted`)
**And** the fields can be filled in by hand, and the image can be published.

**Given** `MOCK_FAIL=true` for some images in a batch
**When** the batch runs
**Then** every upload succeeds and the other images get their metadata (SC-7, first part).

### Story 3.3: Staff review drafts with autosave

As a staff user,
I want to correct each draft's metadata right in the Upload page, saved as I type,
So that I can fix what the AI got wrong without extra clicks.

**Traces to:** FR-17 (upload part), NFR-6, NFR-7, AD-8 (edits only when ready or failed), AD-10 (`updateDraftField`, source `staff`), D-033, UX-DR-18 (Upload variant), UX-DR-19 (accordion), UX-DR-22, UX-DR-24 · spine · ~2.5 h

**Acceptance Criteria:**

**Given** a draft that is ready or failed, selected in the file list
**When** the Details panel opens (or the row expands as an accordion at ≤ 1240 px)
**Then** title, description, alt text, keywords, place name, date taken and latitude/longitude are editable at once under "Check and correct — Changes save as you type", and camera data is read-only.

**Given** a staff user changes a field
**When** it is saved
**Then** `images.updateDraftField` saves that one field as a patch with source `staff` and the status line shows "Saved" (announced via `role="status"`).

**Given** a save fails
**When** the error returns
**Then** the field keeps the typed value and shows exactly "Your change was not saved. Try again."

**Given** alt text over 250 characters, an impossible date, or a latitude or longitude out of range
**When** it is entered
**Then** an inline message explains the problem and the value is not saved.

**Given** keywords
**When** they are shown in the Upload panel
**Then** generated keywords are grouped by category, embedded, shared and hand-written keywords sit in their own group, each chip has "Remove keyword {k}", and "Add keyword" adds one with source `staff` (a duplicate in any letter case is not added twice).

**Given** an image that is uploading, queued or generating
**When** it is selected
**Then** its fields are read-only with a short reason until it is ready or failed.

**Given** a selected file
**When** the staff user chooses "Next image"
**Then** the next file in the list is selected; clicking the selected row again deselects it.

### Story 3.4: Staff edit any image in the Library

As a staff user,
I want to edit an image's metadata in the Library with an explicit Edit and Save changes,
So that I never change a published image by accident.

**Traces to:** FR-17 (library part, complete), NFR-6, NFR-7, AD-8 (`version`), AD-10 (`saveImageEdits`), D-033, UX-DR-20, UX-DR-21, UX-DR-23, UX-DR-24, UX-DR-25, UX-DR-50 · spine · ~2.5 h

**Acceptance Criteria:**

**Given** an image in the Library Details panel
**When** the staff user chooses Edit
**Then** every FR-17 field (title, description, alt text, keywords, place name, date taken, latitude, longitude) joins the access controls from Story 1.6 as inputs, focus moves to Title, and camera data stays read-only.

**Given** edit mode
**When** a field's value differs from the saved value
**Then** it shows the changed-field marker (3 px warning bar and "Changed"), which disappears if the value is changed back, and the footer shows "Unsaved changes (n fields)".

**Given** changes
**When** the staff user chooses Save changes
**Then** `images.saveImageEdits` saves all changed fields in one call as patches with source `staff` and the loaded `version`; the panel returns to view mode with "Changes saved" and focus on Edit
**And** validation errors show under their fields and block the save; a failed or conflicting save keeps edit mode and the values with "Your change was not saved. Try again."

**Given** edit mode with changes
**When** the staff user selects another image, closes inline details or switches tab
**Then** the Unsaved-changes dialog offers Save changes (save, then continue), Discard (drop, then continue) and Keep editing or Escape (stay, focus on the last edited field); reloading or closing the tab triggers the browser's leave-page prompt.

**Given** Cancel
**When** it is chosen
**Then** changes are dropped without asking and the panel returns to view mode with focus on Edit.

**Given** a published image
**When** its edits are saved
**Then** they show at once on staff and client pages, and are the values written into the next file served (Epic 5).

**Given** the staff Details panel in view mode
**When** an image has a place name or AI metadata
**Then** it shows the Place field with "Staff only. Clients never see the place." and "How the metadata was made" (provider and prompt version from the latest successful run).

### Story 3.5: Claude writes the metadata with prompt v3

As a staff user,
I want real AI metadata from Claude when the agency turns it on,
So that descriptions match what is in the photo, while the app still runs without a key.

**Traces to:** FR-12 (complete), FR-16a, NFR-1, NFR-4 (timeout), NFR-8, AD-21, AD-22 (contract tests), D-017, D-021, PRD Open Question 3 · spine · ~2.5 h

**Acceptance Criteria:**

**Given** `AI_PROVIDER=claude` and `ANTHROPIC_API_KEY` set
**When** an image is generated
**Then** the Claude adapter sends prompt v3 and the app's JSON schema to `claude-haiku-5-5` at effort medium with a 30 s timeout and `maxRetries: 0`, and maps the answer to the provider port's output.

**Given** prompt v3
**When** it is reviewed in the code
**Then** it tells the model to describe what is visible; never to state or infer ethnicity, religion, health, sexual orientation, political opinion or union membership; never to work out who a person is from their appearance; to use a person's name only if it is written in the image or given in the metadata; and never to turn coordinates into place names.

**Given** a missing or wrong key, a rate limit, a timeout, an unavailable service, a refusal or invalid output
**When** generation runs
**Then** the adapter returns the matching error category and the image fails under FR-16a; the rest of the app keeps working.

**Given** the mock and Claude adapters
**When** the contract tests run
**Then** both pass the same tests, Claude's against recorded responses with no network; the key is never logged.

**Given** the pilot images, including the ones with people
**When** Marthe runs prompt v3 against Claude once by hand
**Then** the results are recorded next to the pilot results, closing PRD Open Question 3, and any prompt change bumps the prompt version.

### Story 3.6: Files that need you come first

As a staff user,
I want the files that need me at the top of the list, and the ready ones folded away,
So that I can work through a 65-file batch without hunting.

**Traces to:** UJ-2, UX-DR-29, UX-DR-30, UX-DR-50, UX-DR-51 · spine (UX) · ~2.5 h · Cut candidate at the checkpoint; fallback: files in upload order with the to-do counts only

**Acceptance Criteria:**

**Given** a batch
**When** the file list renders
**Then** files that need the user come first — failed, missing alt text, not added, still processing (file name matches first once FR-10b exists) — and the list head says "{n} files, files that need you first".

**Given** files change state while the user works
**When** a file is selected or focus is in the file list or Details panel
**Then** the order does not change; it catches up only when the user is idle (no file selected, focus outside both), so rows never move under the cursor.

**Given** ready and published files
**When** the list renders
**Then** they fold into one group row ("{n} ready to publish, {m} published") with Show / Hide (`aria-expanded`, focus stays on the row); it opens on Show, when "ready to publish" is the current to-do item, when the selected file is inside it, or when no other rows are left, and Hide deselects a file inside it.

**Given** the to-do list
**When** the user chooses an item
**Then** its files move to the top, the page scrolls to the list, focus moves to the first of them, and the list head says e.g. "65 files. At the top: 12 need alt text" with "Back to the usual order"; choosing the current item again restores the usual order.

### Story 3.7: Staff set batch settings once for a whole shoot [planned, rank 1]

As a staff user,
I want to choose visibility, price, AI use, place names and shared keywords once for a batch,
So that 50–100 images get the right settings without editing each one.

**Traces to:** FR-9, FR-12 (place-name setting), AD-9, AD-10 (`applyBatchSettings`, `shared` rows), SC-13 (batch settings), UX-DR-26, UX-DR-46 · planned (rank 1) · ~2.5 h · Fallback: defaults; staff change each image afterwards

**Acceptance Criteria:**

**Given** "New batch"
**When** its settings form opens
**Then** it offers visibility (and clients for Restricted), free or paid, AI or manual metadata, whether the AI receives place names, and keywords for every image, defaulting to internal-only, free, AI on and place names on.

**Given** saved settings
**When** each image row is created
**Then** the settings are copied onto it (visibility, client list, price tier, `aiEnabled`, `placeNamesToAi`, shared keyword rows with source `shared`); access, generation and retry read only the image's own columns.

**Given** manual metadata
**When** an image's upload completes
**Then** it goes straight to `ready` without an AI call, keeping its embedded text.

**Given** place names off
**When** an image is generated
**Then** the text sent to the provider has no place name, no coordinates and no embedded location fields, filtered with media's location checklist (shown by the recording mock, SC-13).

**Given** the settings summary under the batch title
**When** staff choose "Edit batch settings" and change visibility, price or keywords
**Then** a confirm dialog says this overwrites the values on the batch's draft images, and confirming applies them through `images.applyBatchSettings`, replacing only the named settings and `shared` keyword rows; published images are not changed.

### Story 3.8: Generated metadata is checked before it is saved [planned, rank 2]

As a staff user,
I want generated metadata cleaned to the same rules whatever the provider,
So that keywords stay useful and alt text fits the standard.

**Traces to:** FR-14, NFR-6, AD-10, AD-21, SC-13 (output part) · planned (rank 2) · ~1.5 h · Fallback: the provider's schema only; staff review

**Acceptance Criteria:**

**Given** mock output with 20 keywords, duplicates in different letter cases and capitalised common words
**When** it is saved
**Then** at most 15 unique `ai` keywords are stored, lower-cased except proper nouns (one tested function decides proper nouns), and `shared`, `embedded` and `staff` keywords are kept outside the 15 (SC-13).

**Given** generated alt text over 250 characters
**When** it is saved
**Then** it is shortened at a word boundary to fit, or rejected as `invalid_output`, by one shared rule using `ALT_TEXT_MAX`.

**Given** any provider
**When** a result is saved
**Then** the same checks run on it, and the record keeps provider, model and prompt version.

### Story 3.9: Staff retry failed images [planned, rank 3]

As a staff user,
I want to retry generation for one failed image or all failed images in a batch,
So that a passing error does not leave me typing everything by hand.

**Traces to:** FR-16b, AD-8 (retry precondition), AD-10, AD-12, SC-7, UX-DR-28, UX-DR-30 · planned (rank 3) · ~1 h · Fallback: staff fill in the fields by hand

**Acceptance Criteria:**

**Given** a failed draft
**When** staff choose "Try again" on its row
**Then** it moves to `queued` and is generated again; the same action on a published or non-failed image is refused.

**Given** a batch with 3 failed drafts
**When** staff choose "Try the 3 failed again" in the to-do list
**Then** all three are retried and the others are untouched.

**Given** a failed image whose title staff have already edited
**When** the retry succeeds
**Then** the staff-edited title is kept and only fields with another source are replaced (SC-7).

### Story 3.10: Images with GPS get a place name [bonus, rank 7]

As a staff user,
I want each image with GPS coordinates to get a searchable place name offline,
So that I can find images by place even when the camera only stored coordinates.

**Traces to:** FR-13, FR-12 (place name to the AI), NFR-1, NFR-9, AD-3 (places), AD-11, AD-23, SC-6 (staff side) · bonus (rank 7) · ~3 h · Fallback: no place names; GPS is still stored

**Acceptance Criteria:**

**Given** the kept build script
**When** it is run
**Then** it builds a compressed GeoNames extract (Norwegian populated places with municipality and county, world cities over 15,000) committed in `data/places/` with its download date, and the `migrate` service loads it idempotently into `places`.

**Given** an image with GPS coordinates
**When** its upload completes
**Then** the nearest place within the radius fills place, municipality, county and country (or country only), whatever the image's AI choice; a position with no match leaves the place name empty without an error; no network or key is used.

**Given** place names on for the image
**When** it is generated
**Then** the place name is part of the text sent to the provider.

**Given** staff edit the coordinates
**When** they save
**Then** the place name does not change; staff can edit it separately.

**Given** a derived place name
**When** it is stored
**Then** it goes into the same place-name columns staff edit (Story 3.3), so staff search (Epic 4) and staff copies (Epic 5) use it with no extra work, and clients never see or search it (`clientMaySeeLocation()` stays false).

**Given** the README, the data folder and the staff help page
**When** they are read
**Then** each credits GeoNames under CC BY 4.0.

### Story 3.11: Upload and generation run in the background [bonus, rank 10]

As a staff user,
I want images to keep processing while I work elsewhere, with states updating by themselves,
So that a 100-image batch does not tie up my page.

**Traces to:** FR-15, AD-12 (worker, lease), AD-13 (polling, live region), AD-24 (worker service), SC-14, UX-DR-14, UX-DR-51 · bonus (rank 10) · ~4 h · Fallback: processed while the upload page waits; SC-14 drops

**Acceptance Criteria:**

**Given** the `worker` Compose service (same image, own command)
**When** images are `queued`
**Then** it claims them with `FOR UPDATE SKIP LOCKED`, `WORKER_CONCURRENCY` (default 2) at a time, and reclaims images whose lease has expired; the upload request no longer waits for generation.

**Given** a page showing processing states
**When** states change
**Then** it polls one Route Handler about every 3 s, tiles and rows update within 10 s without a reload, and one polite live region announces the changes at most once per poll; polling does not refresh the session's `lastSeenAt`.

**Given** a slow mock (`MOCK_DELAY_MS`)
**When** the staff user leaves the page mid-batch
**Then** generation continues and the states are current when they come back (SC-14).

**Given** the app and worker restart mid-batch
**When** they come back
**Then** every image ends as ready or failed; only the worker touches `queued` and `generating` images at startup (SC-14).

### Story 3.12: Staff discard a draft that was never published [bonus, rank 12]

As a staff user,
I want to permanently discard a draft that should never have been uploaded,
So that it leaves the library and can be uploaded again later.

**Traces to:** FR-20, AD-8 (`publishedAt is null`), Conventions (Deletes), SC-12 (re-upload), UX-DR-46 · bonus (rank 12) · ~1 h · Fallback: archive instead; the hash still blocks a re-upload

**Acceptance Criteria:**

**Given** a draft with no `publishedAt`
**When** staff choose Discard and confirm in the danger confirm dialog
**Then** the image, its file version, keywords, client list and generation records are deleted, and media deletes its files.

**Given** a discarded draft's file
**When** it is uploaded again
**Then** it is accepted as new (SC-12).

**Given** an image that has ever been published
**When** a discard is attempted, through the UI or the module function
**Then** it is refused.

### Story 3.13: Only one staff user edits an image at a time [bonus, rank 15]

As a staff user,
I want to see when a colleague is editing an image and be stopped from overwriting their work,
So that two of us never silently lose each other's edits.

**Traces to:** FR-18, NFR-7, AD-5 (logout releases locks), AD-14, SC-10, UX-DR-20 · bonus (rank 15) · ~4 h · Fallback: last save wins; SC-10 drops

**Acceptance Criteria:**

**Given** staff user A chooses Edit in the Library (or makes the first edit on Upload)
**When** staff user B opens the same image
**Then** B sees exactly "*A's name* is editing this image. You can edit it when they finish, or after 15 minutes without activity." and Edit is disabled.

**Given** A's lock
**When** A saves, cancels, discards, leaves the editor or logs out
**Then** the lock is released and B can edit.

**Given** A has been inactive for 15 minutes
**When** B chooses Edit
**Then** B takes over, and a later save from A is refused with `Locked` while A's typed values stay on screen.

**Given** an image lock
**When** someone edits that image's batch settings
**Then** they are blocked; a batch lock blocks all its images; two image locks in one batch do not conflict.

**Given** generation, retry or revoke
**When** they touch a locked image
**Then** they neither take nor respect the lock; the `version` check still protects staff edits.

**Given** both seeded staff users
**When** the SC-10 test runs
**Then** all of the above holds.

### Story 3.14: Staff decide on files with the same name [bonus, rank 16]

As a staff user,
I want a file whose name matches an existing image shown side by side with it,
So that I can tell a new shot from a re-upload of the same camera filename.

**Traces to:** FR-10b, AD-8 (`nameMatchOf`), SC-2 (filename part), UX-DR-29, UX-DR-32 · bonus (rank 16) · ~2 h · Fallback: a plain warning; the upload is kept

**Acceptance Criteria:**

**Given** a file whose name matches an existing image's, ignoring case, with different bytes
**When** it is uploaded
**Then** before any AI call its row is tagged "Needs a decision", and the context alert shows "New file" and "In the library" side by side with Keep both and Discard new file.

**Given** an undecided match
**When** staff try to publish it
**Then** publishing is disabled with "Decide on the file name match first. Then you can publish it."; other files in the batch continue meanwhile.

**Given** Keep both
**When** it is chosen
**Then** the match is cleared and the file goes on to generation; Discard new file removes the upload and its files.

**Given** several open matches in a batch
**When** staff tick "Use the same answer for the other file name match"
**Then** the answer applies to all open matches in the batch.

### Story 3.15: Staff publish a whole batch at once [bonus, rank 18]

As a staff user,
I want to publish every ready image in a batch in one action,
So that I do not click Publish 41 times.

**Traces to:** FR-19b, FR-19a, AD-8, SC-11 (batch part), UX-DR-33, UX-DR-46 · bonus (rank 18) · ~1.5 h · Fallback: publish one by one

**Acceptance Criteria:**

**Given** a batch with ready images
**When** staff choose "Publish {n} ready images"
**Then** if any lack title, description, alt text or keywords, one confirm dialog lists every affected image at once; confirming publishes all that qualify.

**Given** images still uploading, queued or generating, or with an undecided filename match
**When** the batch is published
**Then** the others are published and a result summary lists the published count and each skipped image with its reason (SC-11).

**Given** the batch is published twice
**When** the second action runs
**Then** nothing changes.

## Epic 4: Finding images — staff library and client portal (UJ-1, UJ-3 steps 2–4)

Staff search and filter the whole library, open any image's full page, and archive or restore images; contacts browse My images and Find images and see exactly what the access table allows, with the right actions per image, proven by the access matrix through real routes (SC-1). The planned story adds the client Overview.

### Story 4.1: Staff search and filter the library

As a staff user,
I want to search the whole library by keyword and narrow it with filters,
So that I find the right image among thousands named only by the camera.

**Traces to:** FR-27, FR-29, NFR-4, AD-6 (shared search), Conventions (Search, Lists), SC-9, UJ-1, UX-DR-6 (header search), UX-DR-11, UX-DR-12, UX-DR-47 · spine · ~3 h

**Acceptance Criteria:**

**Given** the staff header search ("Search title, description, keywords and places")
**When** a staff user searches "drone city winter"
**Then** the Library shows only images where every term matches title, description, keywords or place name, ignoring case, newest first (`createdAt desc, id desc`), 48 per page, with the count from the same condition ("{n} images, newest first").

**Given** the Library's Filters sidebar
**When** staff toggle Status (draft, published, archived), Processing, Visibility, Price, Client or Date taken
**Then** the wall filters at once without an Apply button, each active filter shows as a removable chip in the toolbar, removing a chip clears that filter, and pagination keeps search and filters.

**Given** a search or filter with no match
**When** the result is empty
**Then** the wall shows "No images match your search and filters." with "Clear filters".

**Given** `buildSearchCondition(terms, fields)` in the images module
**When** it is built
**Then** it is the only search code, used here with the staff field set and later by access with the client field set; the matching technique (ILIKE or Postgres full-text) is chosen in this story by running `scripts/generate-scale-data.ts` (500 images, 10 clients, separate database, never committed) and checking a search answers in under 1 s.

**Given** the seed images and their fixture metadata
**When** the SC-9 test runs
**Then** a fixed set of searches, at least one per keyword category (place, weather/season, emotion, colour/adjective, activity, object, perspective/composition), returns exactly the expected images.

### Story 4.2: Staff archive and restore images, and change access after publishing

As a staff user,
I want to archive an image instead of deleting it, restore it, and change who sees it or its price after publishing,
So that the library stays tidy without breaking any client's licence.

**Traces to:** FR-21 (complete), FR-24, FR-26, AD-8 (restore rule), SC-1 (S3), UX-DR-5 (cost of a choice), UX-DR-46 · spine · ~1.5 h

**Acceptance Criteria:**

**Given** a published or draft image
**When** staff choose "Archive" from the Details panel's more-actions menu
**Then** its status becomes archived in one conditional update; staff still find it with the Status filter.

**Given** an archived image
**When** staff choose "Restore"
**Then** it returns to published if it was ever published (`publishedAt` set), otherwise to draft.

**Given** an archived image
**When** a client without an active licence looks for it
**Then** it is gone from every list, count, page and file (A11), while a client holding a licence keeps it as an own image (A12, S3).

**Given** a published image with licences
**When** staff change its visibility or price in edit mode
**Then** the form says what the change does, e.g. "Changing the price does not affect the 3 licences already sold.", and existing licences are unchanged after saving.

### Story 4.3: Staff open an image's full page

As a staff user,
I want to open a larger view of an image with all its details and actions,
So that I can check it closely or share its address with a colleague.

**Traces to:** FR-30 (staff part), FR-17, UX-DR-18 ("Open full image page"), UX-DR-25 · spine · ~1 h

**Acceptance Criteria:**

**Given** an image in the Library Details panel
**When** staff choose the "Open full image page" icon
**Then** the staff image page opens at its own address (UUID, never a sequential id) with the image larger, the same sections as the Details panel (metadata, Who can see it, Camera details, Place, How the metadata was made) and the same view / edit / unsaved states.

**Given** an image with no title
**When** it appears on the page or in any list
**Then** it is labelled "Untitled image" through the shared `displayTitle()` helper, and empty fields are left out.

**Given** a contact
**When** they request a staff image page address
**Then** they get 403 and no data (S6).

### Story 4.4: Contacts browse My images and Find images

As a contact,
I want one place for my client's own images and one for everything I may see, with search and filters,
So that I can find images for a campaign without emailing the agency.

**Traces to:** FR-28 (complete), FR-29, AD-6 (client search fields, own flag), UJ-3, SC-4 (find part), UX-DR-6 (client search), UX-DR-8, UX-DR-12, UX-DR-15, UX-DR-39, UX-DR-47 · spine · ~2.5 h

**Acceptance Criteria:**

**Given** a contact
**When** they open My images
**Then** they see only their client's own images (A3, A4, A6, A8, A10, A12), newest first and paged, each with the own-image tick and "Yours to download"; with none, the page says so and links to Find images.

**Given** Find images
**When** a contact searches with the header search ("Search images")
**Then** every term must match title, description, alt text or keywords, ignoring case; the place name and staff notes are never searched.

**Given** the client Filters sidebar
**When** the contact uses Price, Date taken, or "Only my images" (Find images only)
**Then** the wall filters at once with removable chips; there is no client filter, and the sidebar notes how many own images the client has.

**Given** any client list
**When** it is built
**Then** its results, thumbnails and counts come from the access module only, so they never include an image the client may not see.

**Given** an empty result
**When** filters or search match nothing
**Then** the empty state offers "Clear filters".

### Story 4.5: Contacts see the right details and actions for each image

As a contact,
I want each image to show me plainly whether it is mine, free or for sale, and what I can do with it,
So that I never wonder why I can or cannot download something.

**Traces to:** FR-30 (client part, complete), FR-22, NFR-5a (alt chain), AD-6, UX-DR-15, UX-DR-16, UX-DR-34, UX-DR-35 · spine · ~1.5 h

**Acceptance Criteria:**

**Given** an image the client owns
**When** the contact selects it
**Then** the panel shows "Your image" with the tick, the licence card and the download area (the download itself arrives in Epic 5), and never Add to cart.

**Given** a public free image the client does not yet own (A1)
**When** the contact selects it
**Then** the tile and panel show "Free", no tick, and the note "Downloading accepts the licence terms. Read the terms".

**Given** a paid image the client does not own (A2, A5)
**When** the contact selects it
**Then** the panel shows the preview (at most 800 px), the licence option with its price and "Read the licence terms", and the licence action.

**Given** any image shown to a contact
**When** it renders
**Then** its alt attribute is its alt text, else its title, else "Untitled image" (`altFor()`), never empty; "About the image" and "Technical details" leave out empty fields; nothing shows GPS, place name, photographer credit, staff notes, provider details or other clients.

**Given** a client image page address
**When** the contact opens it directly
**Then** it shows the same details and actions as the panel, and returns Not found for an image the client may not see.

### Story 4.6: Every read rule of the access table is proven through real routes

As the agency,
I want automated tests that walk every access-table row through every client surface,
So that a change anywhere can never quietly show a client the wrong image.

**Traces to:** FR-22 (complete), FR-5, FR-6, NFR-2a, AD-7, SC-1 (read rules) · spine · ~2 h

**Acceptance Criteria:**

**Given** the shared fixture with one image per row A1–A13
**When** the table-driven HTTP tests run as contacts of Fjordkaffe and of Nordlys
**Then** each row returns exactly what the access table says through the image page, thumbnail, preview, My images, Find images, list counts and search — visible with the right flags, or 404 and absent everywhere.

**Given** edge rules S1, S2, S3, S4 and S6
**When** the read tests run
**Then** each is covered by at least one test through a real route.

**Given** client A and client B
**When** client A requests any image restricted only to client B, by page, file or search
**Then** client A gets Not found and the image appears in none of A's lists or counts (SC-1).

**Given** the e2e suite
**When** it runs
**Then** it starts from a freshly migrated and seeded test database, and state-changing tests create their own rows through fixture factories instead of touching the matrix rows.

### Story 4.7: Image walls adapt to the screen and the viewer

As a staff user or contact,
I want walls that work on narrow screens and captions I can hide,
So that I can browse comfortably on a laptop, a tablet or a phone.

**Traces to:** NFR-5a (360 px), UX-DR-11, UX-DR-13, UX-DR-17, UX-DR-19, UX-DR-49, UX-DR-50 · spine (UX) · ~2 h · Cut candidate at the checkpoint; fallback: captions always on, details panel stacked below the wall

**Acceptance Criteria:**

**Given** a wall (Library, Find images, My images) at 1240 px or less
**When** a tile is selected
**Then** the image takes a full row (up to min(60vh, 520px)), its details open directly below it with "Close details" (which returns focus to the tile), the other images continue below, and the tile carries `aria-pressed` and `aria-expanded`.

**Given** the wall toolbar
**When** a user turns off "Show captions"
**Then** caption lines are hidden visually only (they remain each tile's accessible name), tags, tick and selection ring stay, rows close up, and the choice is stored with the user account so it holds across visits and devices.

**Given** widths of 560 px and 360 px
**When** a wall renders
**Then** it uses the compact row height and gaps, the captions switch moves onto its own line, and there is no horizontal scroll.

### Story 4.8: Contacts land on their client's overview [planned, rank 4]

As a contact,
I want a start page that shows my client's images, licences and what is new,
So that I see at once what the agency has made available since I last looked.

**Traces to:** FR-38a, AD-3 (`lastLoginAt`, `previousLoginAt`), AD-6 ("visible since"), UJ-3, UJ-4, SC-12 (dashboard), UX-DR-38 · planned (rank 4) · ~2.5 h · Fallback: the contact lands on My images

**Acceptance Criteria:**

**Given** a contact logs in or sets a password
**When** they land
**Then** they land on Overview with their client's own images, its licences, and images made visible to the client since the contact's last login or in the last 30 days, whichever period is longer, plus links to My images and Find images.

**Given** "visible since" is the latest of `publishedAt`, `visibleToAllSince` and the client's `image_clients.addedAt`
**When** a contact last logged in 40 days ago
**Then** they see an image made visible 35 days ago; and a contact who last logged in 5 days ago sees one made visible 20 days ago but not one made visible 35 days ago (tested with a controlled clock).

**Given** the Overview
**When** the contact selects an image in any section
**Then** the client Details panel opens in place (below the page at narrow widths) without navigating; selecting it again closes it.

**Given** a new contact with nothing yet
**When** Overview loads
**Then** each section shows its own one-line empty state and the links stay.

**Given** any section
**When** it is built
**Then** it reads through the access module, so nothing belongs to another client.

## Epic 5: Licensing and downloads (UJ-3 steps 4–6)

Staff download staff copies with all current metadata; contacts download client copies that carry the current metadata and no location data, take free images with a 0 USD licence, and see their client's licence history; staff filter the transaction log. The planned story adds the cart; bonus stories add revoking and ZIP downloads.

### Story 5.1: Staff download a staff copy with the current metadata

As a staff user,
I want to download an image at full resolution with all its current metadata,
So that the file I use carries the corrected title, keywords and place, readable by any tool.

**Traces to:** FR-34, NFR-6, AD-4, AD-15, AD-16 (staff copy, metadata contract, D-028), SC-16, UJ-1 · spine · ~3 h

**Acceptance Criteria:**

**Given** an image in the staff Details panel or image page
**When** staff choose "Staff copy"
**Then** a Route Handler behind the staff guard builds, on demand into a temp file, the original bytes with all current metadata, including date taken, GPS and place name, and streams it with `Cache-Control: private, no-store`; nothing is cached and the stored original is unchanged.

**Given** any edited field (agency fields, date taken, GPS, place name)
**When** a copy is built
**Then** the value comes from the image row, never from the original's embedded metadata.

**Given** the metadata contract
**When** a JPEG copy is written
**Then** title goes to `dc:title` and IIM 2:05, description to `dc:description`, IIM 2:120 and EXIF `ImageDescription`, alt text to `Iptc4xmpCore:AltTextAccessibility`, keywords to `dc:subject` and IIM 2:25, all UTF-8 with `IPTC:CodedCharacterSet = UTF8`; a PNG gets XMP and no IIM.

**Given** a title of 40 "æ" (80 bytes) and a keyword of 70 bytes
**When** the copy is written
**Then** XMP holds the full title and keyword, IIM holds the title as 32 "æ" as valid UTF-8, and the keyword is absent from IIM only (SC-16); one tested function shortens IIM values at the last whole word that fits, else at the last whole character.

**Given** metadata containing control characters or text that looks like a command
**When** it is written
**Then** control characters are removed first and values go through exiftool-vendored's write API, never into a command line.

### Story 5.2: Contacts download client copies with no location data

As a contact,
I want to download my client's own images with their current metadata and nothing that reveals where they were taken,
So that I can use them at once without risking a private location leaking.

**Traces to:** FR-34 (client copy), FR-35, FR-36, NFR-2a, NFR-10, AD-4 (POST download), AD-6, AD-16 (client copy), AD-17, SC-4 (download part), SC-6 · spine · ~3 h

**Acceptance Criteria:**

**Given** an own image (A3, A4, A6, A8, A10, A12)
**When** the contact chooses Download
**Then** a POST Route Handler (checking `Origin`) asks access, and the `downloads` module builds the client copy into a temp file: original pixels untouched, all metadata removed, then only the FR-35 whitelist (copyright notice, creator, credit line, date taken, camera make and model, lens, exposure settings, colour profile) plus EXIF `Orientation` copied back, then the current agency fields written.

**Given** a built client copy
**When** media checks it against the location checklist from the metadata research (section C)
**Then** it streams only if the check passes and the copy is complete; a hit or any build error gives an error response with a plain message, and nothing partial is served (NFR-10).

**Given** the seed's JPEG with GPS and city fields, its JPEG with an embedded thumbnail and its PNG with location data
**When** each is downloaded by a contact, and its preview and thumbnail are fetched
**Then** none contains coordinates, structured location fields in EXIF, XMP or IPTC, a place name or an embedded thumbnail or preview, while maker notes, serial numbers and owner names are also gone (SC-6).

**Given** a portrait photo with an EXIF orientation tag
**When** it is downloaded as a client copy
**Then** it opens upright.

**Given** a place name written by staff into the description
**When** the copy is built
**Then** it stays, because agency fields are content.

**Given** an image the client may not download
**When** the download is requested directly
**Then** the response is 404.

### Story 5.3: A first download of a free image records a free licence

As a contact,
I want to download a free image straight away, knowing it becomes ours,
So that free images work like any other own image afterwards.

**Traces to:** FR-23 (free licence, complete), FR-24 (S15), NFR-7, AD-18 (`source = free_download`), AD-19 (advisory lock, build then grant then stream), SC-1 (S5, S15), UX-DR-34, UX-DR-35 · spine · ~2 h

**Acceptance Criteria:**

**Given** a free image the client may download but holds no licence for (A1, A4)
**When** the contact presses Download, below "Downloading accepts the licence terms. Read the terms"
**Then** under the client's advisory lock the client copy is built and checked, then `grantLicence` records a 0 USD licence (source `free_download`, current licence text version), then the file streams; A1 images show the tick from then on.

**Given** a licence already exists
**When** the contact downloads the image again
**Then** the download works with no new licence, as often as they like.

**Given** two contacts of one client download the same free image at the same moment
**When** both requests run
**Then** exactly one active licence exists (S5, tested as parallel requests).

**Given** a free image a client has downloaded
**When** staff later remove the client from the restricted list or make the image paid
**Then** the client still sees and downloads it as an own image (S15).

### Story 5.4: Contacts see their client's licence history

As a contact,
I want to see every licence my client holds, who got it and on what terms,
So that our team knows what we may use without asking the agency.

**Traces to:** FR-33, FR-24, AD-6 (history not filtered by visibility), AD-18, SC-5, UX-DR-40, UX-DR-47 · spine · ~1.5 h

**Acceptance Criteria:**

**Given** any contact of a client
**When** they open the Licences tab
**Then** a table lists all the client's licences, newest first, with the image title as stored at the time, licence type, price ("{n} USD" or "Free"), date, and the contact who acquired it; another contact of the same client sees the same list.

**Given** a licence row
**When** the contact opens its terms
**Then** the licence text is shown in the version that was accepted, even if staff have since changed the text.

**Given** a licence whose image the client can still see
**When** the row renders
**Then** it links to the image; otherwise the title shows as text.

**Given** an image's visibility, price or archive status changes, or the acquiring contact is deactivated
**When** the history is viewed
**Then** the licence is still there and unchanged (FR-24).

**Given** a client with no licences
**When** the tab opens
**Then** the empty state links to Find images.

### Story 5.5: Staff filter the transaction log

As a staff user,
I want to filter all licences by client, date range and paid only,
So that I can answer billing questions and see what each client has acquired.

**Traces to:** FR-41 (complete), SC-5, AD-18, UX-DR-42, UX-DR-47 · spine · ~1 h

**Acceptance Criteria:**

**Given** the staff Licences tab from Story 1.9
**When** staff filter by client, by a date range, or to paid licences only
**Then** the table shows only matching licences, 50 per page, with filters kept across pages and "Clear filters" on a filtered empty result.

**Given** each row
**When** it renders
**Then** it shows client, contact (or none), image title at the time, licence type, price ex VAT with currency, source and date; once revoking exists, revoked rows also show who, when, why and the credit flag.

**Given** the SC-5 test
**When** a licence is created by checkout and another by a free download
**Then** both carry every FR-23 fact, both appear in the client's history and in this log, and the paid-only filter shows only the first.

### Story 5.6: Contacts collect images in a cart and check out together [planned, rank 5]

As a contact,
I want to collect several paid images in a cart and license them in one checkout,
So that a campaign's images take one step, not one checkout each.

**Traces to:** FR-31, FR-32 (complete), NFR-7, AD-19, SC-3 (through the cart), SC-15, UX-DR-34 (cart actions), UX-DR-36, UX-DR-37 · planned (rank 5) · ~3 h · Fallback: checkout on one image (Story 1.9)

**Acceptance Criteria:**

**Given** a paid image the client does not own
**When** the contact chooses Add to cart
**Then** a cart line stores the licence type, the price seen and its currency; the cart button's count goes up, the tile shows "In cart", and the panel shows "In cart" with a link to the cart and the cart summary ("Cart: 2 images, 270 USD") with "Go to checkout".

**Given** an image already in the cart
**When** it is added again
**Then** the cart still has one line for it.

**Given** a free or own image
**When** the contact looks at it, or sends a direct add request
**Then** no add action is offered and the request is refused (S7).

**Given** a contact's cart
**When** they log out and back in
**Then** the cart is unchanged, and another contact of the same client sees only their own cart.

**Given** the cart page
**When** the contact removes the last line
**Then** the empty state shows with a link to Find images, and checkout is not available.

**Given** a cart with several lines and the terms accepted
**When** the contact checks out
**Then** one transaction re-checks every line; if all still hold, every licence is recorded and the cart emptied; if any line became unavailable, free, already held or changed price, nothing is recorded, the cart drops or updates those lines in its own transaction, and the exact NFR-7 messages are shown before the contact confirms.

**Given** a double submit
**When** both arrive
**Then** no extra licences are recorded (SC-15, S5).

**Given** a successful checkout
**When** the confirmation shows
**Then** it lists every licensed image with Download for each; the "license this image" path from Story 1.9 now goes through the cart.

### Story 5.7: Staff revoke a licence [bonus, rank 6]

As a staff user,
I want to revoke a licence with a reason, never deleting it,
So that the agency can withdraw an image while keeping a full record for billing.

**Traces to:** FR-25, FR-24, AD-8 (`version` bump), AD-18 (revoke), AD-20, SC-1 (S11–S14), UX-DR-42, UX-DR-46 · bonus (rank 6) · ~3 h · Fallback: no revoke; S11–S14 are not tested

**Acceptance Criteria:**

**Given** an image page (or a client card, if Story 2.5 is built)
**When** staff choose to revoke for one client or for all holders
**Then** a danger confirm dialog lists the affected licences, requires a reason (the confirm button stays disabled until one is entered, S11), and for a public image says the image stays available to the client under its normal access row.

**Given** a confirmed revoke
**When** it runs
**Then** in one transaction each licence gets `revokedAt`, `revokedBy` and the reason and is never deleted, a paid licence is flagged for a possible credit (S13), and the client is removed from the image's restricted list (bumping the image's `version`).

**Given** a client whose licence was revoked and who has no other access
**When** they request the image or its download
**Then** they get Not found, and their history shows the licence as "removed by the agency" (S12).

**Given** a revoked licence
**When** staff share the image with that client again
**Then** normal access rules apply and the old licence stays revoked; a new download or purchase creates a new licence (S14).

**Given** the transaction log
**When** staff view it
**Then** revoked licences show who, when, why and the credit flag.

### Story 5.8: Contacts download several images as one ZIP [bonus, rank 17]

As a contact,
I want to download a whole checkout or a selection as one ZIP,
So that I do not have to click Download for every image.

**Traces to:** FR-37, AD-17, AD-19, SC-12 (ZIP names), UX-DR-37 · bonus (rank 17) · ~1.5 h · Fallback: one download per image

**Acceptance Criteria:**

**Given** a checkout confirmation, or several own images selected
**When** the contact chooses "Download all as ZIP"
**Then** the ZIP holds a checked client copy of each image, built completely before anything streams; any failed copy fails the whole ZIP with a plain message.

**Given** two images with the same file name
**When** they are zipped
**Then** they get distinct names in the ZIP (SC-12).

**Given** a free image without a licence in the selection
**When** the ZIP is built
**Then** its 0 USD licence is recorded exactly as for a single first download.

## Epic 6: Administration — settings and the action log

Staff record and read who did what, set the licence price and text and the AI provider and key in the app; contacts see their client's recent activity. Bonus only, in rank order; the epic can be cut as one block, and each story has the PRD's fallback.

### Story 6.1: Every important action is recorded [bonus, rank 8]

As the agency,
I want each upload, edit, publish, access change, download and admin change recorded with who and when,
So that we can see what happened to an image or an account afterwards.

**Traces to:** FR-42a, AD-3 (activity), AD-20 (`activity.record(tx, entry)`, append-only), SC-8 (recording) · bonus (rank 8) · ~2.5 h · Fallback: nothing is recorded; SC-8 drops

**Acceptance Criteria:**

**Given** the activity module
**When** it is built
**Then** it exposes only `record(tx, entry)` and read functions; an entry holds the actor, an action from a fixed enum, `subjectType` and `subjectId`, optional `clientId` and `imageId` (no foreign keys), a snapshot label and a timestamp; no update or delete path exists.

**Given** each action in FR-42a that has been built — upload, metadata edit, publish, draft discard, visibility or price change, archive and restore, revoke, download, changes to clients and users, setup link creation, settings changes
**When** it succeeds
**Then** its module write function records it in the same transaction, so an action and its entry are written together or not at all.

**Given** an action that fails or is rolled back
**When** the transaction ends
**Then** no entry exists for it.

**Given** the SC-8 test
**When** it performs every listed action
**Then** each has exactly one entry with the right user and time.

### Story 6.2: Staff set the licence price and text [bonus, rank 13]

As a staff user,
I want to change the standard licence's price and text in Settings,
So that the agency can adjust its terms without a developer.

**Traces to:** FR-40, FR-23, FR-33, AD-18 (immutable text versions), SC-12 (licence change), UX-DR-43 · bonus (rank 13) · ~1.5 h · Fallback: price and licence text from the seed data

**Acceptance Criteria:**

**Given** Settings → Licence
**When** staff save a price of 0 or less, or an empty text
**Then** each field shows an inline error and nothing changes.

**Given** a valid new price
**When** it is saved
**Then** paid images show the new price at once, open cart lines are re-checked at checkout (price-change message), and existing licences keep their price.

**Given** a changed licence text
**When** it is saved
**Then** a new immutable text version is stored, the page says it applies to new licences only, existing licences keep the version they were granted with, and no version number is shown anywhere (SC-12).

### Story 6.3: Staff choose the AI provider and key in the app [bonus, rank 14]

As a staff user,
I want to switch between the mock and Claude and set the API key in Settings,
So that the agency can turn real AI on without editing server files.

**Traces to:** FR-39, NFR-2a, AD-21 (per-job settings, AES-256-GCM), SC-12 (masked key) · bonus (rank 14) · ~2 h · Fallback: environment variables only

**Acceptance Criteria:**

**Given** Settings → AI
**When** staff choose the provider (mock or Claude), the model, and optionally enter an API key
**Then** the settings are stored in `ai_settings`, the key encrypted with AES-256-GCM using `APP_ENCRYPTION_KEY`; environment variables stay the defaults and the mock stays the default provider.

**Given** a saved key
**When** the page shows it, and when logs are read
**Then** the browser receives only whether a key exists and its last 4 characters, and the key appears in no log line (SC-12).

**Given** the next generation job
**When** it starts
**Then** it resolves provider, model, effort and key from `ai_settings`, else from the environment.

**Given** Claude chosen with no valid key
**When** images are generated
**Then** they fail under FR-16a with the `auth` reason and the rest of the app keeps working.

### Story 6.4: Staff read the action log per user [bonus, rank 19]

As a staff user,
I want to read the action log for one user,
So that I can see what a colleague or a contact has done.

**Traces to:** FR-42b, SC-8 (reading), UX-DR-44, UX-DR-47 · bonus (rank 19) · ~1 h · Fallback: recorded, not shown

**Acceptance Criteria:**

**Given** the account menu → Action log
**When** staff choose a user
**Then** a table lists that user's entries newest first, 50 per page, with action, subject label and time in Europe/Oslo.

**Given** a user with no entries
**When** they are chosen
**Then** the empty state shows.

**Given** a contact
**When** they request the action log address
**Then** they get 403 and no data.

### Story 6.5: Contacts see their client's recent activity [bonus, rank 20]

As a contact,
I want to see the latest licences and downloads by anyone at my client,
So that our team does not license or fetch the same image twice.

**Traces to:** FR-38b, FR-38a, AD-20 (reads activity), SC-12 (activity list), UX-DR-38 · bonus (rank 20) · ~1 h · Needs Story 4.8 (if FR-38a is cut, this is cut too) · Fallback: no activity list; the Overview hides the section

**Acceptance Criteria:**

**Given** the client Overview (Story 4.8)
**When** it loads
**Then** a Recent activity section lists the 10 most recent licences and downloads by any of the client's contacts, newest first, each with the contact, the image title and the date.

**Given** another client's activity
**When** the list is built
**Then** none of it appears.

**Given** an image the client can no longer see
**When** its activity row renders
**Then** it shows the title as text without a link.

## Epic 7: Ready for the examiner

The examiner can run and check everything from the README: pages pass the accessibility checks, every error says what to do next, scale and AI timing are measured, and the README works from a fresh clone. NFR-5b is the bonus.

### Story 7.1: Accessibility pass and error messages

As a staff user or contact using a keyboard or a screen reader,
I want every main page to meet WCAG 2.1 AA and every error to tell me what to do,
So that I can use the whole app without a mouse and never hit a dead end.

**Traces to:** NFR-5a, NFR-7, SC-11, UX-DR-4, UX-DR-48, UX-DR-50, UX-DR-51, UX-DR-52 · spine · ~4.5 h

**Acceptance Criteria:**

**Given** the axe scan list started in Story 1.3
**When** the e2e suite runs
**Then** it scans every main page of both faces (Library, Upload, image page, Clients, Licences, Settings if built, Overview, My images, Find images, cart and checkout, Login, Set password, 403, Not found) in their main states and reports no serious or critical violations.

**Given** a manual keyboard pass
**When** Marthe walks UJ-1 to UJ-4 with keyboard only, at 1440 px and 360 px
**Then** every action is reachable in reading order, focus moves as UX-DR-50 says, nothing scrolls horizontally, and the result (date, pages, findings, fixes) is recorded in `docs/`.

**Given** an image published without alt text
**When** its page renders
**Then** it still has a non-empty alt attribute (title or "Untitled image"), and the README states the NFR-5a known exception (SC-11).

**Given** a list or page whose request fails (offline or server error)
**When** it renders
**Then** a Designsystemet alert at the top of main says what failed with "Try again", and an unexpected server error shows a generic message with a next step while the details go to the log.

**Given** the NFR-7 table
**When** the message test runs
**Then** each of the ten messages is checked word for word against `messages/en.json` and at least one real route that shows it, and the SC-11 edge cases (corrupt, renamed and oversized files, invalid values, double submits) give those messages or no effect, never a crash.

**Given** reduced motion set in the browser
**When** pages with spinners, skeletons or the Generating pulse render
**Then** they do not animate.

### Story 7.2: Scale and AI timing are measured and recorded

As the examiner,
I want measured numbers for search speed and AI time,
So that I can see NFR-4 checked, not assumed.

**Traces to:** NFR-4, AD-24 (`scripts/generate-scale-data.ts`) · spine · ~1.5 h

**Acceptance Criteria:**

**Given** the scale script from Story 4.1
**When** the README's measurement command runs
**Then** it builds 500 images and 10 clients in a separate database, runs a fixed set of staff and client searches several times, and prints the median and worst time; each is under 1 s on a developer laptop, and the numbers and machine are recorded in the README.

**Given** a Claude key (by hand, once)
**When** a batch is generated with the Claude provider
**Then** the median time per image, the slowest image (never over the 30 s timeout) and the time for the batch are recorded in the README next to the pilot's numbers.

### Story 7.3: The README works from a fresh clone

As the examiner,
I want to go from a clean machine with Docker to the whole flow by following the README,
So that I can grade the app without asking the author anything.

**Traces to:** NFR-1, SC-3, SC-4, CLAUDE.md (README rules) · spine · ~1.5 h

**Acceptance Criteria:**

**Given** a fresh clone on a machine with Docker and no API key
**When** Marthe follows the README word for word and times it
**Then** the app runs with seed data within about 20 minutes including the first image build, and SC-3 and SC-4 can be walked as written.

**Given** the README
**When** it is checked before the freeze
**Then** it states what the app does and for whom, prerequisites with versions, exact start and test commands, every environment variable, the seeded users and passwords, the sample images and their credits (and GeoNames if built), how to run the tests, a folder overview, a link to `docs/process/`, and which ranked FRs were cut and the SCs that shrank with them.

**Given** the README's test command
**When** it is run on the fresh clone
**Then** it passes.

### Story 7.4: Pages meet WCAG 2.2 AA [bonus, rank 22]

As a staff user or contact,
I want the app to meet the newer WCAG 2.2 AA criteria as well,
So that it is easier to use with a pointer, a keyboard and low vision.

**Traces to:** NFR-5b, UX-DR-50 · bonus (rank 22) · ~1.5 h · Fallback: WCAG 2.1 AA

**Acceptance Criteria:**

**Given** the axe scan
**When** it runs with the WCAG 2.2 rule set added
**Then** no serious or critical violations remain on the main pages.

**Given** WCAG 2.2's focus-not-obscured, target-size and dragging criteria
**When** they are checked by hand on the main pages
**Then** focused elements are never hidden by the sticky top bar or footers, targets are at least 24 × 24 px, and the drop zone also works with "Choose files", and the result is recorded with the 7.1 keyboard pass.

