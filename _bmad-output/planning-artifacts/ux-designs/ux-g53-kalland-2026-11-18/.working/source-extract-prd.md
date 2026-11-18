# Source extract: PRD (2026-11-18) for UX

Sources: `prds/prd-g53-kalland-2026-11-18/prd.md` (PRD), `addendum.md` (Add.), `rollout-gate.md` (RG). Quotes or tight paraphrase only; IDs cited per item.

## 1. Product, audience, stakes

CRM-DAM: "A design agency loses time hunting through its own unstructured image bank, and its clients have to ask by email for images they already have rights to. CRM-DAM gives the agency one place to find its images and gives each client a gated portal to download what it owns and license more." (Vision). Core bet: "one simple access model, visibility × price plus a licence that lasts". AI metadata is "an expected baseline and not the differentiator"; the difference is "internal asset management, a gated client storefront and the client register on one backbone".

- **Two faces:** internal staff tool + client-facing, login-only portal ("gated storefront"). No public library (Target Users, Out of Scope).
- **Stakes:** v1 is a course deliverable on sample data only, "does not go live (D-009)" (Release Stages). Rollout gated by GDPR items (RG-3 data protection basis, DPIA, US transfers; RG-4 erasure; RG-5 people in images/consent incl. children), licence/rights review (RG-6), accessibility record (RG-9). Location privacy is a hard rule: clients never get location data (FR-36, NFR-9, D-011).
- **Spine (teacher's minimal flow):** "upload → AI metadata → visibility and price → the client finds, downloads or buys → the licence is logged" (Release Stages).

## 2. Roles and permissions

Glossary terms are to be used exactly (Glossary).

| Role | Who | Permissions (v1) |
|---|---|---|
| **Staff** | Agency user | "one role in v1, with full rights"; "All staff have the same rights in v1" (Target Users, Glossary). Sees drafts, all clients, staff notes, GPS/place names, transaction log, settings. |
| **Contact** | Person logging in for a **Client** (belongs to exactly one client) | Sees only what the access table allows (FR-22); My images / Find images, cart, checkout, licence history of whole client (FR-28, FR-31–33). Gets 403 + no data on staff pages (FR-6, S6). Never sees staff notes, account managers, visibility lists, other clients, GPS or place name record (FR-6, FR-30). |
| **Client** | Organisation (not a login) | "Access, licences and history belong to the client" (Glossary). Status active/inactive; never deleted (FR-1, S10). |
| **Examiner (v1 only)** | Grader | Runs everything from README without keys/accounts (Target Users, NFR-1). |

Named personas: **Ida** (designer at the agency, staff), **Jonas** (marketing contact at client **Fjordkaffe AS**). Seed clients: Fjordkaffe AS (2 contacts), Nordlys Sykkel AS (1 contact), Gammel Kunde AS (inactive) (Add. Seed data names). Two seeded staff users (Add. Seed data).
Not for: general public, other agencies, client admins managing own users (Target Users).

## 3. User journeys

**UJ-1 Ida finds images for a leaflet.** Images "spread across old projects and named only by the camera (`C0930_1467.jpg`)". Ida searches "drone, city, winter", narrows with filters, opens an image, checks metadata, downloads a staff copy. *Later: collections.*

**UJ-2 Ida uploads a client shoot.**
1. Starts a batch upload of 50–100 images.
2. For the whole batch chooses: visible only to that client, free, AI or manual metadata, whether AI may use place names, keywords added to every image.
3. Before AI runs: byte-identical file rejected; file sharing only a filename "shown beside it so Ida can keep both or discard it".
4. Upload + AI run in background; "images become editable as they finish".
5. Corrects AI. "Edits save automatically, and no one else can edit an image while she does." Batch stays draft, visible to all staff.
6. Publishes batch → appears in client's library. Upload/edit/publish logged with her name.
Edge: AI fails on 3 images → rest continue; retry or fill by hand. Closes laptop mid-edit → lock expires, colleague takes over.
Fallbacks if bonus not built: plain filename warning (FR-10b), no place names (FR-13), processing while upload page waits (FR-15), last save wins (FR-18), publish one by one (FR-19b), no action log (FR-42a).

**UJ-3 Jonas buys images for a campaign.**
1. Logs in with email + password.
2. Dashboard: Fjordkaffe's images, recent activity, licences, new images made available. Goes to **My images** or **Find images**.
3. Find images: everything visible to Fjordkaffe; own images "carry a green tick"; filters incl. "only my images", not by client.
4. Opens image. Own → downloads. Otherwise sees licence options, opens each to read licence text/terms, picks one, adds to cart.
5. Reviews/edits cart, accepts licence terms, checks out. "There is no payment and no invoice in v1".
6. From checkout page downloads everything just bought, or later in My images.
Edge: cart item unavailable or price changed → checkout tells him before anything recorded.
Fallbacks: no recent activity (FR-38b); downloads one by one (FR-37).

**UJ-4 Ida onboards Fjordkaffe.**
1. Ida creates client + two contacts.
2. Each contact gets a setup link; Ida copies and sends from her own email; "the app sends no email".
3. Jonas opens link, sets password, lands on dashboard.
Edge: expired link → login screen: "Link expired. Contact the agency for a new one." New link cancels old. Wrong password → "Incorrect email or password. Contact the agency to set up a new password."

## 4. Functional requirements by area (tag → implied UI)

### F1 Accounts and clients
- **FR-1 [spine] Client records:** name, optional org number (9 digits, mod-11), status active/inactive, billing email, account manager (staff user), staff notes. Never deleted. → Client list + client create/edit form; inline validation; activate/deactivate toggle.
- **FR-2 [spine] Contacts:** name, email (unique, is the login), optional phone; create/edit/deactivate/reactivate. → Contact form (under client), list with status.
- **FR-3 [bonus] Staff accounts:** same as contacts; last active staff can't be deactivated (S9). → Staff user list/form.
- **FR-4 [spine] Setup links:** single-use, 7-day expiry; staff copy it; new link cancels old; password ≥ 12 chars. → "Create/reset setup link" action with copy-to-clipboard; set-password page; expired-link state.
- **FR-5 [spine] Login/logout:** same message for wrong email/password; deactivated user/inactive client refused "and told why"; 8 h idle timeout; new password ends other sessions. → Login page, error states, logout.
- **FR-6 [spine] Roles:** contact on staff page → 403, no data. → 403 page.
- **FR-7 [bonus] Client card:** details, contacts, images visible to it, licence history (incl. revoked). Fallback: client edit page with contacts. → Client detail page.

### F2 Upload and metadata
- **FR-8 [spine] Upload:** one or batch; JPEG/PNG ≤ 50 MB; content-sniffed; rejection names file + reason; rejection doesn't stop batch. → Upload page (drop/select), per-file result list.
- **FR-9 [planned] Batch settings:** visibility + client list, free/paid, AI/manual, place names to AI, shared keywords. Defaults: internal-only, free, place names on. Later apply to whole draft batch "after confirming that this overwrites". → Batch settings form before upload; overwrite-confirm dialog.
- **FR-10a [spine] Identical files:** rejected with link to existing image (incl. archived / earlier in batch). → Per-file rejection row with link.
- **FR-10b [bonus] Matching filenames:** side-by-side comparison; keep both / discard; apply one answer to all open matches. Fallback: plain warning. → Side-by-side compare dialog/panel; "apply to all".
- **FR-11 [spine] Embedded metadata:** reads EXIF/IPTC/XMP incl. date taken, camera, GPS; embedded text fills agency fields; AI replaces; on AI failure embedded stays.
- **FR-12 [spine] AI metadata:** English title, description, alt text, keywords (categories: place, weather/season, emotion, colour/adjective, activity, object, perspective/composition). People rule (no sensitive attributes, no identification from appearance).
- **FR-13 [bonus] Place names:** derived offline from GPS; searchable, editable staff metadata; no match → empty, not an error.
- **FR-14 [planned] Output checks:** ≤ 15 generated keywords, no duplicates, lower case except proper nouns, alt text ≤ NFR-6 limit; stores provider/model/prompt version. → Provenance shown to staff (never contacts, FR-30).
- **FR-15 [bonus] Background processing:** per-image state *uploading, queued, generating, ready, failed, rejected*; change shows within 10 s without reload; leaving page while uploading warns first. → Live status list/grid with state badges; leave-page warning.
- **FR-16a [spine] AI failure:** image shows failed "with a plain reason"; staff fill fields; rest continues. → Failed state + message.
- **FR-16b [planned] Retry:** one failed draft or all failed drafts in batch; never overwrites staff edits. → Retry buttons (single, batch).
- **FR-17 [spine] Editing:** agency fields, place name, date taken, GPS editable; camera data read-only. Autosave; failed save shows error and keeps value; validation (alt text limit, impossible date, lat/long range). → Image editor with autosave indicator, inline errors.
- **FR-18 [bonus] Edit locks:** others see who holds lock; ends on leave/logout/15 min idle; expired-lock save refused, value kept. → Locked state banner.
- **FR-19a [spine] Draft and publish:** single publish; only when not uploading/queued/generating; missing-metadata warning lists images lacking title/description/alt/keywords ("harder to find and less accessible"), staff confirm or go back; restricted + empty list warns (S4); published can't return to draft. → Publish button; missing-metadata confirm dialog; empty-list warning.
- **FR-19b [bonus] Publish batch:** publishes qualifying, lists others with reason. → Batch publish result summary.
- **FR-20 [bonus] Discard drafts:** never-published drafts, after confirming. → Discard confirm dialog.

### F3 Access and licences
- **FR-21 [spine] Visibility and price:** public (all logged-in clients) / restricted (listed clients) / internal-only; free / paid; changeable after publish. → Visibility selector + client multi-select; price toggle.
- **FR-22 [spine] Access rule:** follows access table; anything not allowed returns "not found", never "forbidden"; search counts/thumbnails filtered. → 404 page for contacts.
- **FR-23 [spine] Licences:** one type "standard commercial use", USD price, licence text. Licence stores client, contact, image + title at time, type, text version, price ex VAT + currency, timestamp. First download of a free image records 0 USD licence; "The download action shows a link to the terms and states that downloading accepts them." Max one active licence per image; unlimited re-download. → Download button with terms note/link.
- **FR-24 [spine] Licences last** across visibility/price/archive changes and contact deactivation.
- **FR-25 [bonus] Revoke:** from image page or client card; one client or all holders; warning lists affected licences; reason required; revoked paid flagged for credit; client history shows "removed by the agency". → Revoke dialog with reason field.
- **FR-26 [spine] Archiving:** archive/restore; staff still find archived. → Archive/restore actions; status filter.

**Access table summary (FR-22):** A1 public free no-licence → sees, downloads client copy, first download = 0 USD licence, no tick until then. A2/A5 paid no-licence → preview without watermark, add to cart. A4 restricted-listed free → own image, tick, in My images. A3/A6/A8/A10/A12 active licence → own image. A7/A9/A11/A13 → not found. "An own image with an active licence is shown with a tick … It cannot be added to the cart." Edge rules S1–S15 (PRD table).

### F4 Search and browse
- **FR-27 [spine] Staff search:** keyword over title, description, keywords, place names; filters client, visibility, price, status (draft/published/archived), date taken. → Staff library/search page with filter panel.
- **FR-28 [spine] Client browsing:** **My images** (own) and **Find images** (all visible); green tick on own; filters price, date taken, "only my images"; no client filter; search excludes place name/staff notes. → Two client list pages.
- **FR-29 [spine] Search behaviour:** case-insensitive; all terms must match; newest first; paged; "an empty result says so and offers to clear the filters". → Pagination; empty state with clear-filters.
- **FR-30 [spine] Image page:** larger image + metadata. Contact sees agency fields, date taken, camera data; never staff notes, provider details, other clients, GPS, place name. Own/A1 → download; else preview + licence options, each opening licence text/terms. Empty fields hidden; no title → "Untitled image" (lists too). → Image detail page (staff variant + contact variant); licence terms dialog/panel.

### F5 Cart and checkout
- **FR-31 [planned] Cart:** per contact, persists across sessions; one line per image; free/own can't be added (no action shown; S7); empty state. Fallback: checkout on one image (FR-32). → Cart page; add-to-cart with licence-type choice.
- **FR-32 [spine] Checkout:** accept licence terms; records one licence per line; lists purchased images for download; re-check lines (removed with message; changed price must be confirmed); all-or-none; double submit safe; empty cart can't check out. → Checkout page with terms checkbox; change-notice state; confirmation/download page.
- **FR-33 [spine] Licence history:** all contacts of client see image, type, price, date, contact who acquired, licence text as accepted, revoked as "removed by the agency". → Licence history list + licence text view.

### F6 Downloads
- **FR-34 [spine]** every download carries current metadata; staff copy has all metadata incl. location. **FR-35 [spine]** client copy whitelist. **FR-36 [spine]** no location data in any client file/preview/page image. **FR-37 [bonus] ZIP** for several images / whole checkout; fallback one download per image. → Download buttons (staff copy vs client copy); "download all" on checkout.

### F7 Client dashboard
- **FR-38a [planned] Dashboard:** own images, licences, images made visible since last login or last 30 days (whichever longer), links to My images / Find images. Fallback: land on My images. → Contact landing page.
- **FR-38b [bonus] Activity list:** 10 most recent licences and downloads by any contact of the client, with contact, image, date. → Dashboard section.

### F8 Admin and settings
- **FR-39 [bonus] AI settings:** provider (mock/Claude), model, API key override (encrypted, masked). → Settings page.
- **FR-40 [bonus] Licence settings:** price (> 0 if paid), licence text (not empty); text change = new version. → Settings page.
- **FR-41 [spine] Transaction log:** all licences, filter by client, date range, paid only; includes revoked + credit flags. → Staff table page with filters.
- **FR-42a [bonus] Action log** (record only); **FR-42b [bonus]** view per user. → Action log page.

### F9 Stretch
- **FR-43 [stretch] New versions:** keeps identity; older versions listed on image page.

## 5. Scope ranking

- **Spine (~75 h, built first):** FR-1, 2, 4, 5, 6, 8, 10a, 11, 12, 16a, 17, 19a, 21–24, 26–30, 32–36, 41; NFR-1, 2a, 5a, 7, 8, 10. Thin first slice: "staff log in, upload one image and publish it; a contact finds it and checks out; the licence shows in the log" (Release Stages).
- **Planned (ranks 1–5):** FR-9 batch settings, FR-14 output checks, FR-16b retry, FR-38a dashboard, FR-31 cart.
- **Bonus (ranks 6–22, in order):** FR-25 revoke, FR-13 place names, FR-42a action log, FR-7 client card, FR-15 background, FR-3 staff accounts, FR-20 discard, FR-40 licence settings, FR-39 AI settings, FR-18 locks, FR-10b filenames, FR-37 ZIP, FR-19b batch publish, FR-42b log view, FR-38b activity, NFR-2b login delay, NFR-5b WCAG 2.2.
- **Stretch:** FR-43 versions.
- **Checkpoint 2026-11-30** draws the cut line. **Reduced spine** if it fails: FR-27 keyword search without filters; FR-29 without paging; FR-33 shown only as My images; FR-41 without filters; FR-11 date taken + GPS only; NFR-5a axe only. FR-22, FR-35, FR-36 never reduced.
- **Out of scope v1:** payment, invoices, Tripletex, one-click purchase, refunds, more licence types/currencies; email sending, 2FA, client-admin role, contacts in several clients, "view as client", self-service password reset; collections, private batches, public library, other file types, near-duplicates, map view / client map search; per-image/per-field AI choice, regenerating non-failed AI; **Norwegian UI**, backups, **branding**, permanent deletion except never-published drafts (Out of Scope).
- **Rollout gate (RG-1–RG-16, nothing built in v1):** hosting/HTTPS/2FA decision, backups, GDPR basis/DPA/DPIA/transfers, erasure, people-in-images consent (RG-5 implies future per-image person/consent fields), licence text review in Norwegian, billing/VAT, Norwegian UI + AI (RG-8), accessibility record + accepted exception (RG-9), scale 5k–50k + bulk import (RG-10), file types RAW/TIFF/PSD/HEIC (RG-11), email for links (RG-12), ops, baseline, EU scope, AI governance.

## 6. Explicit UX/UI statements

- **Platform/form factor:** web app (pages, routes, sessions); "Pages work from 360 px wide" (NFR-5a, AS-22). No native/mobile app mentioned. Runs in Docker containers (NFR-1).
- **UI language:** **English** in v1: "The UI and generated metadata are English. All UI strings are in a translation file … so a Norwegian pack can be added" (NFR-8). Norwegian UI is out of scope (Out of Scope) and a rollout item (RG-8). (Note: repo CLAUDE.md speaks of Norwegian UI strings; the PRD says English for v1.)
- **Tech stack / UI library:** not named. Add.: "One common stack and local file storage". Architecture decides.
- **Accessibility:** WCAG 2.1 A + AA, axe scan with no serious/critical violations on main pages, manual keyboard pass (NFR-5a). Alt attribute = alt text → title → "Untitled image"; known exception for images published without alt text (NFR-5a, RG-9). Bonus: WCAG 2.2 AA (NFR-5b). Alt text ≤ 250 chars, aim < 150 (NFR-6).
- **Dark mode, offline, notifications:** not mentioned. App sends no email (FR-4).
- **Performance:** search < 1 s at 500 images (NFR-4); AI median < 10 s/image, 30 s timeout, batch of 100 in 15 min (NFR-4); state changes visible within 10 s without reload (FR-15).
- **Loading/progress states:** uploading, queued, generating, ready, failed, rejected (FR-15).
- **Empty states:** "Every list shows an empty-state message instead of a blank area" (NFR-7); empty search offers clearing filters (FR-29); empty cart (FR-31).
- **Errors:** "plain English that says what happened and what to do next"; tested word for word (NFR-7). Repeated/double-submitted actions never crash or duplicate (NFR-7).
- **Fixed microcopy (NFR-7 table):**
  - Incorrect email or password. Contact the agency to set up a new password.
  - Link expired. Contact the agency for a new one.
  - Your account is not active. Contact the agency.
  - *file name* was not uploaded: it is not a JPEG or PNG image / it is larger than 50 MB / the file is damaged.
  - *file name* is already in the library. (with link)
  - Metadata could not be generated: *reason*. Fill in the fields yourself or try again.
  - *name* is editing this image. You can edit it when they finish, or after 15 minutes without activity.
  - Your change was not saved. Try again.
  - *title* was removed from your cart: it is no longer available.
  - The price of *title* has changed from *old* to *new* USD. Confirm to continue.
  - Other fixed labels: "Untitled image" (FR-30), "removed by the agency" (FR-25, FR-33, S12), "only my images" (FR-28), **My images** / **Find images** (FR-28).
- **Visual cues:** green tick on own images (UJ-3, FR-28, access table); previews "without a watermark" (A2, A5); preview ≤ 800 px long edge (Glossary, AS-2).
- **Security UX:** contacts get "not found" (never "forbidden") for hidden images (FR-22) but 403 for staff routes (FR-6); untrusted metadata escaped (NFR-2a); API key masked (FR-39).
- **Branding:** out of scope v1 (Out of Scope).

## 7. Data entities and on-screen fields

- **Client:** name, org number (opt.), status active/inactive, billing email, account manager, staff notes (FR-1).
- **Contact / staff user:** name, email (login), phone (opt.), active/inactive (FR-2, FR-3); role staff|contact (FR-6, NFR-9).
- **Setup link:** single-use, 7-day expiry (FR-4).
- **Image:** status draft/published/archived; visibility public/restricted/internal-only + client list; price free/paid; agency fields title, description, alt text, keywords; place name (place, municipality, county, country); date taken; GPS lat/long; camera data (read-only: make, model, lens, exposure); embedded copyright/creator/credit; AI provenance provider/model/prompt version (staff only); processing state; filename; batch (FR-11–FR-21, FR-35, Glossary).
- **Batch:** owner, shared settings (FR-9, NFR-9).
- **Licence type:** name "standard commercial use", price, currency USD, licence text with versions (FR-23, FR-40, NFR-9).
- **Licence:** client, contact, image, image title at time, type, text version, price ex VAT, currency, timestamp, active/revoked (+ who, when, why, credit flag) (FR-23, FR-25).
- **Cart line:** image, licence type, per contact (FR-31).
- **Action log entry:** user, time, action (FR-42a).
- **File kinds:** stored original (never served to client), client copy, staff copy, preview (Glossary).

## 8. Open questions / assumptions touching UX

- OQ-1/OQ-2: cut line and freeze date set at 2026-11-30 checkpoint — determines whether cart, dashboard, batch settings, background processing, locks, etc. exist; UX must design fallbacks (PRD ranked table).
- OQ-3: prompt v3 quality not piloted — affects how much staff correction UI matters.
- OQ-4: client map search (later): which images, how exact a position, place-name search.
- No UI stack, design system, branding or visual identity defined (Out of Scope: branding; Add.: "one common stack").
- Where the "Untitled image"/missing alt fallback sits is accepted as known exception (NFR-5a, RG-9).
- FR-9 apply-to-batch overwrite confirm; FR-10b apply-one-answer-to-all (AS-6).
- AS-9: browser uploads need page open; generation survives leaving.
- RG-5 (later) per-image person/consent fields; RG-8 Norwegian UI pack later — string externalisation from day one (NFR-8).
- Licence type choice UI exists although v1 has a single type (UJ-3 step 4, FR-23, FR-31) — how much to show for one option is not specified.
- Dashboard "new images" window rule (FR-38a) is exact; layout unspecified.

## 9. Implied surfaces

| Surface | Role | FR/NFR |
|---|---|---|
| Login page (+ error states) | all | FR-5, NFR-7, UJ-4 |
| Set-password page from setup link (+ expired state) | all | FR-4, UJ-4 |
| 403 page (staff route) / not-found page (hidden image) | contact | FR-6, FR-22 |
| Staff library / search with filters, paging, empty state | staff | FR-27, FR-29, FR-26 |
| Upload page (file pick/drop, per-file results, rejections, duplicate links) | staff | FR-8, FR-10a, FR-16a |
| Batch settings form (pre-upload) + apply-to-batch overwrite confirm | staff | FR-9 |
| Filename-match side-by-side dialog (+ apply to all) | staff | FR-10b |
| Batch processing status view (live states, retry, leave-page warning) | staff | FR-15, FR-16a, FR-16b |
| Batch view (draft images, batch publish, result summary) | staff | FR-19b, FR-9, FR-16b |
| Image editor (agency fields, place name, date, GPS, read-only camera, autosave, validation, lock banner) | staff | FR-17, FR-18, FR-13, FR-14 |
| Staff image page (visibility/price/client list, publish, archive/restore, revoke, staff-copy download, versions) | staff | FR-19a, FR-21, FR-25, FR-26, FR-34, FR-43 |
| Publish missing-metadata warning dialog; empty-restricted-list warning | staff | FR-19a, S4 |
| Discard draft confirm dialog | staff | FR-20 |
| Revoke dialog (affected licences, reason) | staff | FR-25 |
| Client list + client create/edit form | staff | FR-1 |
| Client card (details, contacts, visible images, licences) | staff | FR-7 |
| Contact create/edit (+ setup link copy) | staff | FR-2, FR-4 |
| Staff users list/form | staff | FR-3 |
| Transaction log (filters client, date range, paid only) | staff | FR-41 |
| Action log per user | staff | FR-42b |
| Settings: AI provider/model/key; licence price/text | staff | FR-39, FR-40 |
| Contact dashboard (own images, licences, new images, activity) | contact | FR-38a, FR-38b |
| My images | contact | FR-28, FR-33 (reduced) |
| Find images (search, filters, "only my images", green tick) | contact | FR-28, FR-29 |
| Contact image page (preview, metadata, download w/ terms note, licence options) | contact | FR-30, FR-23, FR-22 |
| Licence text/terms view (dialog or panel) | contact | FR-30, FR-23, FR-33 |
| Cart (lines, edit, empty state) | contact | FR-31 |
| Checkout (terms acceptance, change notices, confirm price) | contact | FR-32 |
| Checkout confirmation / download purchased (ZIP) | contact | FR-32, FR-37 |
| Licence history | contact | FR-33 |
| App shell/navigation per role, logout | all | FR-5, FR-6 |
