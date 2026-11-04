---
title: "PRD: CRM-DAM"
status: final
created: 2026-11-04
updated: 2026-11-04
---

# PRD: CRM-DAM

## Document Purpose

This PRD defines what CRM-DAM v1 must do and what must be true before the agency uses it with real data. It feeds UX, architecture, and epics and stories. Stories trace to FR IDs, and tests trace to SC IDs.

It replaces the [PRD of 2026-10-28](../prd-g53-kalland-2026-10-28/prd.md) and, like that PRD, builds on the [product brief](../../briefs/brief-g53-kalland-2026-09-11/brief.md) and its [addendum](../../briefs/brief-g53-kalland-2026-09-11/addendum.md). Where they differ, this PRD wins. The product decisions are unchanged unless the [addendum](addendum.md) lists a change. The addendum also lists the details inferred while drafting and how the user settled them. Names in the journeys are fictional.

## Vision

A design agency loses time hunting through its own unstructured image bank, and its clients have to ask by email for images they already have rights to. CRM-DAM gives the agency one place to find its images and gives each client a gated portal to download what it owns and license more.

The bet is that one simple access model, visibility × price plus a licence that lasts, can serve commissioned work and stock sales without special cases. AI metadata makes the library searchable, but it is an expected baseline and not the differentiator. The difference is having internal asset management, a gated client storefront and the client register on one backbone.

## Release Stages

| Stage | What it is | Data | Bar |
|---|---|---|---|
| **v1** | The IBE160 course deliverable, running by 2026-12-05 (D-019); solo build | Sample data only | The Success Criteria below |
| **Stage 2** | The work after the course that makes rollout safe | Sample or test data | The Rollout Gate below |
| **Rollout** | The agency's real use | Real images and client data | Every gate item met and signed off |

v1 does not go live (D-009). No real image or client data enters the system until the Rollout Gate is met.

The brief's other stage 2 features (near-duplicates, branding, map view, more AI providers, more licence types, a client-admin role and "view as client") and its later list stay planned, but they do not block rollout.

**Spine and cut line.** The teacher's minimal flow is the spine: upload → AI metadata → visibility and price → the client finds, downloads or buys → the licence is logged. Each FR is tagged:

- **[spine]**: part of that flow, or required for it to work.
- **[v1]**: needed for the app to be usable (D-022), built after the spine runs.
- **[cut-first]**: has a stated fallback, used before anything else is dropped.
- **[stretch]**: built only when everything else is done and tested.

**Checkpoint, 2026-11-22.** If the spine does not run end to end in mock mode by this date, all cut-first FRs take their fallback at once, and [v1] FRs are built only once the spine runs.

## Target Users

- **Agency staff (primary):** need to find and reuse images fast, and control what each client sees and buys. All staff have the same rights in v1.
- **Client contacts (secondary):** need self-serve access to images their organisation has rights to, and a simple way to license more.
- **Examiner (v1 only):** must be able to run and test everything from the README without keys or accounts.

**Not for, in this PRD:** the general public (no login, no library), other agencies (no multi-tenancy), and client admins who manage their own users.

## Glossary

Use these terms exactly.

- **Staff:** an agency user. Staff have one role in v1, with full rights.
- **Client:** a client organisation. Access, licences and history belong to the client.
- **Contact:** a person who logs in for a client. A contact belongs to one client.
- **User:** a staff user or a contact.
- **Image:** the identity of one asset, with its metadata, visibility, price and licences. It keeps its identity across file versions.
- **Stored original:** the uploaded file, kept byte-identical and never served to a client.
- **Client copy:** a file built for a client from the stored original and the current metadata, containing only what FR-35 allows. Every image file a client receives is a client copy or a preview.
- **Staff copy:** a full-resolution copy of the stored original with the current metadata and all location data.
- **Preview:** a client copy resized to at most 800 px on its long edge.
- **Agency fields:** title, description, alt text and keywords.
- **Place name:** the place, municipality, county and country derived from an image's GPS position (FR-13). A stored record, separate from the agency fields.
- **Location data:** an image's coordinates, its place name, and any structured location fields embedded in its file (FR-36). Words about a place in the agency fields are not location data.
- **Batch:** a group of images uploaded together, with shared settings.
- **Draft / published / archived:** an image's status. Drafts are visible only to staff. Archived images remain for licence holders.
- **Licence:** a client's recorded right to an image, of one licence type, at a price (0 USD for free images). It is **active** until revoked.
- **Own image:** an image a client may download without buying: it holds an active licence, or the image is published, free, not archived and restricted to a list that includes the client.

## User Journeys

### UJ-1: Ida finds images for a leaflet

Ida, a designer at the agency, is making a leaflet for a local client who has no images of their own. The agency has suitable images from the area, but they are spread across old projects and named only by the camera (`C0930_1467.jpg`). Ida searches the library for "drone, city, winter" and narrows the result with filters. She opens an image, checks its metadata and downloads a staff copy.

*Later: collections.*

### UJ-2: Ida uploads a client shoot

1. Ida has finished a shoot for a client and starts a batch upload of 50–100 images.
2. For the whole batch she chooses: visible only to that client, free, AI-generated or manual metadata, whether the AI may use place names, and keywords added to every image.
3. A byte-identical file is rejected. A file that only shares a filename with an existing image shows both side by side, and Ida keeps both or discards the upload. This is settled before the AI runs.
4. Uploading and AI generation run in the background. Finished images are added to the bottom of the list; an image is editable once it is uploaded and, if AI was chosen, has its text.
5. Ida corrects what the AI got wrong. Every edit is saved automatically, and no one else can edit an image while she does. The batch stays a draft, visible to all staff, until it is published; single images can be published on their own.
6. Ida publishes the batch. The images appear in the agency library and in the client's library (and for all logged-in clients if she had chosen public). Upload, edit and publish are logged with the user who did them.

**Edge cases:** if the AI fails on three images, the rest continue, and Ida retries or fills in those three by hand. If she closes her laptop mid-edit, her lock expires and a colleague can take over.

*Later: AI or manual per image or per field; private batches.*

### UJ-3: Jonas buys images for a campaign

1. Jonas, the marketing contact at the client Fjordkaffe AS, needs images for a campaign. The agency has done a shoot for Fjordkaffe before. He logs in with email and password.
2. His dashboard shows Fjordkaffe's images, recent activity, licences, and new images the agency has made available. From it he goes to **My images** or **Find images**.
3. In Find images he searches everything visible to Fjordkaffe. Fjordkaffe's own images carry a green tick. He can filter, including "only my images", but not by client.
4. He opens an image. If it is Fjordkaffe's own, he downloads it. Otherwise he sees the licence options, opens each one to read its licence text and terms, picks one and adds the image to his cart.
5. He reviews and edits the cart, accepts the licence terms and checks out. There is no payment and no invoice in v1: checkout records each licence in the transaction log.
6. From the checkout page he downloads everything he just bought, or finds it later in My images.

**Edge case:** if an image in his cart has become unavailable or changed price, checkout tells him what changed before anything is recorded.

*Later: searching on a map, one-click purchase, PDF invoices and Tripletex, refunds for wrong purchases.*

### Admin capabilities

Staff tasks with no journey of their own: managing clients, contacts and staff with setup links (FR-1–FR-4, FR-7), revoking licences and archiving images (FR-25, FR-26), and the settings, transaction log and action log (FR-39–FR-42). Agency theme and other settings are not in v1.

## Functional Requirements

### F1. Accounts and clients

- **FR-1 [spine] Client records.** Staff create and edit clients: name, optional org number, status (active or inactive), billing email, account manager (a staff user) and staff notes.
  - An org number must have 9 digits and pass the mod-11 check.
  - A client can be set inactive and active again, but never deleted (S10).
- **FR-2 [spine] Contacts.** Staff create, edit, deactivate and reactivate contacts: name, email and optional phone.
  - An email is unique across all users and is the login. Changing it keeps the same user, licences and history.
- **FR-3 [v1] Staff accounts.** Staff create, edit, deactivate and reactivate staff users the same way.
  - The last active staff user cannot be deactivated (S9).
- **FR-4 [spine] Setup links.** Creating a user, or resetting a password, gives staff a single-use link that expires after 7 days. Staff copy it into their own email; v1 sends no email.
  - A new link cancels earlier unused links for that user.
  - A used or expired link is refused, with a message telling the user to ask the agency (S8).
  - A password has at least 12 characters.
- **FR-5 [spine] Login.** Users log in with email and password and can log out.
  - A wrong email and a wrong password give the same message.
  - After a correct password, a deactivated user or a contact of an inactive client is refused and told why.
  - Status is checked on every request, so deactivation takes effect on the user's next request (S1, S2).
  - Setting a new password ends the user's other sessions.
  - A session ends after 8 hours of inactivity.
- **FR-6 [spine] Roles.** Every user has a role: staff or contact in v1.
  - A contact requesting a staff page or staff data gets 403 and no data (S6).
  - Staff notes, account managers, visibility lists and other clients' data never appear on contact pages.
- **FR-7 [v1] Client card.** Staff see one page per client with its details, contacts, the images visible to it, and its licence history.

### F2. Upload and metadata

- **FR-8 [spine] Upload.** Staff upload one image or a batch. v1 accepts JPEG and PNG up to 50 MB per file.
  - The file's content decides its type, not its extension. A corrupt file, a non-image renamed `.jpg`, an unsupported type or an oversized file is rejected with a message naming the file and the reason.
  - A rejected file does not stop the rest of a batch.
- **FR-9 [v1] Batch settings.** Before uploading a batch, staff set for all its images: visibility and client list, free or paid, AI or manual metadata, whether the AI receives place names, and keywords added to every image.
  - New uploads default to internal-only and free, with place names on.
  - Settings apply when each image is created. Staff can later change any single image, or apply visibility, price or keywords to the whole draft batch, after confirming that this overwrites the images' current values.
- **FR-10 [spine; side-by-side is cut-first] Duplicates.** Both checks run before any AI call, per file, so one undecided file does not hold up the others.
  - A byte-identical file, in the library (including archived images) or earlier in the same batch, is rejected with a link to the existing image.
  - A file whose name matches an existing image, ignoring case, is shown side by side with it, and staff keep both or discard the upload. Staff can apply one answer to all open filename matches in a batch. *Fallback: a plain warning, and the upload is kept.*
- **FR-11 [spine] Embedded metadata.** On upload the system reads EXIF, IPTC and XMP, including date taken, camera data and GPS, and keeps the stored original unchanged.
  - Embedded title, description, alt text and keywords fill the matching agency fields. If AI is chosen, its result replaces them, and if it fails they stay.
- **FR-12 [spine] AI metadata.** When AI is chosen, the system generates an English title, description, alt text and keywords.
  - Keywords cover place, weather/season, emotion, colour/adjective, activity, object and perspective/composition.
  - The provider receives a resized copy of the image with no embedded metadata. As text, it receives the embedded metadata and the place name from FR-13, and it is told never to turn coordinates into place names.
  - With the batch's place-name setting off (FR-9), the text contains no place name, no coordinates and no embedded location fields.
- **FR-13 [v1] Place names.** When an image has GPS coordinates, the app derives a place name and stores it as searchable, editable staff metadata, whether or not AI is used.
  - The lookup works with no API key or network access, so the examiner's run and the tests include it.
  - A position with no match leaves the place name empty and is not an error. Editing coordinates does not change the place name.
- **FR-14 [v1] Output checks.** The app checks generated metadata whatever the provider: at most 15 keywords, no duplicates, lower case except proper nouns, and alt text within NFR-6's limit. Each record stores the provider, model and prompt version that produced it.
  - The 15-keyword limit applies to generated keywords only; shared and hand-written keywords are kept.
- **FR-15 [v1] Background processing.** Upload and generation run in the background, and each image shows its state: uploading, queued, generating, ready, failed or rejected. Staff can browse the batch meanwhile, and finished images join the list as they complete.
  - An image is editable once it is uploaded and, if AI was chosen, has its metadata or has failed.
  - Generation continues if staff leave the page and resumes after a server restart.
  - Files still uploading need the page open; leaving it warns first.
- **FR-16 [spine; retry is v1] AI failure.** If generation fails for an image, the upload still succeeds, the image shows as failed with a plain reason, staff can fill in its fields, and the rest of the batch continues.
  - An invalid or missing provider answer, a timeout and a missing or wrong key all count as failure.
  - Staff can retry one failed draft image or all failed draft images in a batch, so AI text never changes an image staff have already published. A retry never overwrites a field staff have edited. *Without retry: fill in by hand.*
- **FR-17 [spine] Editing.** Staff edit the agency fields, place name, date taken and GPS position, and see camera data read-only.
  - Edits are saved automatically. A failed save shows an error and keeps the unsaved value.
  - Invalid values are refused with a message: alt text over the limit, an impossible date, or a latitude or longitude out of range.
  - Edits to a published image take effect at once and appear in the next file served.
- **FR-18 [v1] Edit locks.** Only one staff user at a time edits an image or a batch. While a batch is being edited, no one else can edit it or any image in it; while an image is being edited, no one else can edit it or its batch. Others see who is editing.
  - A lock ends when the user leaves the editor or logs out, or after 15 minutes without activity. Another staff user can then take over.
  - A save from an expired lock is refused, with a message that keeps the unsaved value.
  - Background generation is not blocked by a lock.
- **FR-19 [spine; batches and single publishing are v1] Draft and publish.** An image stays a draft until published. All staff can see drafts, and clients never can. Staff publish a whole batch or single images.
  - An image can be published once its upload is complete and it is no longer queued or generating.
  - Missing metadata does not block publishing, but publishing without it is not recommended. A warning lists each image that lacks a title, description, alt text or keywords, and says it will be harder to find and less accessible. Staff confirm or go back.
  - Publishing a batch publishes the images that qualify and lists the others with the reason. Publishing again changes nothing.
  - Restricted with an empty client list behaves as internal-only, and staff are warned (S4).
  - A published image cannot return to draft; staff use internal-only or archive.
- **FR-20 [v1] Discarding drafts.** Staff can permanently discard a draft image that has never been published, after confirming. Its hash no longer blocks a re-upload.

### F3. Access and licences

- **FR-21 [spine] Visibility and price.** Every image has a visibility (public to all logged-in clients, restricted to listed clients, or internal-only) and a price setting (free or paid). Staff can change both after publishing.
- **FR-22 [spine] Access rule.** What a client gets follows the access table below.
  - Anything a client may not see returns "not found", never "forbidden". This covers pages, previews, files and downloads.
  - Search results, thumbnails and result counts include only what the client may see.
- **FR-23 [spine] Licences.** v1 has one licence type, standard commercial use, with a price in USD and a licence text, both set by staff. A paid image costs the price of the chosen licence type.
  - Each licence stores the client, the contact, the image and its title at the time, the licence type, the text version, the price excluding VAT and its currency at the time, and a timestamp.
  - A client's first download of a free image records a licence at 0 USD. The download action shows a link to the terms and states that downloading accepts them.
  - A client holds at most one active licence per image, so simultaneous purchases or first downloads give one licence (S5). Re-downloading is unlimited.
- **FR-24 [spine] Licences last.** A licence survives later changes of visibility, price and archiving, and a contact being deactivated (S3, S15).
- **FR-25 [v1] Revoke.** Staff remove a licence only by revoking it, from the image page or the client card, for one client or for all holders of an image.
  - A warning lists the affected licences, a reason is required (S11), and staff confirm with "Remove anyway".
  - The licence is marked revoked, with who did it, when and why, and never deleted. A revoked paid licence stays in the log, flagged for a possible credit (S13). The client's history shows the image as removed by the agency (S12).
  - Revoking also removes that client from the image's restricted list, so the image does not become own again.
  - A public image stays available to the client under its normal row in the access table, and the warning says so; staff change the visibility or archive it to stop that.
  - Sharing the image again later follows the normal rules. The old licence is not reactivated (S14).
- **FR-26 [spine] Archiving.** Staff archive an image instead of deleting it, and can restore it. An archived image is neither visible nor own for clients without an active licence, and staff can still find it.

**Access table** (for one client):

| Row | Status | Visibility for this client | Price | Active licence | Client gets |
|---|---|---|---|---|---|
| A1 | Published | Public | Free | No | Sees it; downloads a client copy; first download records a 0 USD licence. No tick until then. |
| A2 | Published | Public | Paid | No | Sees a preview without a watermark; can add it to the cart. |
| A3 | Published | Public | Any | Yes | Own image. |
| A4 | Published | Restricted, client on the list | Free | No | Own image, in My images with a tick; downloads a client copy; first download records a 0 USD licence. Applies to every client on the list. |
| A5 | Published | Restricted, client on the list | Paid | No | Sees a preview without a watermark; can add it to the cart. |
| A6 | Published | Restricted, client on the list | Any | Yes | Own image. |
| A7 | Published | Restricted, client not on the list | Any | No | Not found. |
| A8 | Published | Restricted, client not on the list | Any | Yes | Own image. |
| A9 | Published | Internal-only | Any | No | Not found. |
| A10 | Published | Internal-only | Any | Yes | Own image. |
| A11 | Archived | Any | Any | No | Not found. |
| A12 | Archived | Any | Any | Yes | Own image. |
| A13 | Draft | Any | Any | No | Not found. |

An own image with an active licence is shown with a tick, and the client downloads a client copy. It cannot be added to the cart. A revoked licence counts as no licence in this table.

**Edge rules** (from D-018; each is an automated test):

| ID | Case | Expected |
|---|---|---|
| S1 | Contact deactivated | Refused on the next request |
| S2 | Client set inactive | All its contacts refused on the next request |
| S3 | Image archived | Licence holders keep it; gone for everyone else |
| S4 | Restricted with an empty list | Behaves as internal-only |
| S5 | Simultaneous purchases or first downloads | One active licence |
| S6 | Contact requests a staff route | 403, no data |
| S7 | Buying a free or own image | Refused |
| S8 | Setup link reused or expired | Refused |
| S9 | Last active staff user deactivated | Refused |
| S10 | Deleting a client | No such action exists |
| S11 | Revoke without a reason | Refused |
| S12 | Revoked licence, no other access | Download returns not found; history shows "removed by the agency" |
| S13 | Revoked paid licence | Stays in the log, flagged for credit |
| S14 | Shared again after a revoke | Normal rules; licence not reactivated |
| S15 | Free image downloaded, then client unlisted or price changed | Still accessible |

### F4. Search and browse

- **FR-27 [spine] Staff search.** Staff search the whole library by keyword, matching title, description, keywords and place names, and filter by client, visibility, price, status (draft, published or archived) and date taken.
- **FR-28 [spine] Client browsing.** Clients have two entry points: **My images** (own images) and **Find images** (every image the client can see).
  - In Find images, own images carry a green tick. Clients can search and filter by price and date taken, and narrow to "only my images". There is no client filter.
  - In v1, client search matches title, description and keywords, and not the place name record or staff notes. *Later: clients also search on a map (NFR-9).*
- **FR-29 [spine] Search behaviour.** For staff and clients alike: search ignores case; several terms must all match; results come newest first, in pages; and an empty result says so and offers to clear the filters.
- **FR-30 [spine] Image page.** The image page shows the image larger with its metadata.
  - A contact sees the agency fields, date taken and camera data, and never staff notes, provider details or other clients. In v1, a contact also never sees GPS or the place name record.
  - For an own image, or one covered by A1, the page offers download. Otherwise it shows the preview and lists the licence options, each opening its licence text and terms.
  - Empty fields are left out. An image with no title shows the label "Untitled image", in lists as well.

### F5. Cart and checkout

- **FR-31 [v1] Cart.** A contact adds a paid image with a chosen licence type to the cart, and views and edits the cart. Each contact has their own cart, kept between sessions.
  - An own image cannot be added.
- **FR-32 [spine] Checkout.** Checkout needs no payment, but the contact must accept the licence terms. Checkout then records one licence per cart line in the transaction log and lists the purchased images for download. *Without the cart: checkout runs on one image.*
  - Each line is checked again at checkout. A line that is no longer visible, is now free, or is already held by the client is removed, with a message. A changed price is shown and must be confirmed. Nothing is recorded until the contact has seen these changes.
  - All lines are recorded together, or none are.
  - Submitting twice records no extra licences. An empty cart cannot be checked out.
- **FR-33 [spine] Licence history.** All contacts of a client see the client's licences: image, licence type, price, date, the contact who acquired it, the licence text as accepted, and revoked licences as removed by the agency.

### F6. Downloads

- **FR-34 [spine] Current metadata.** Every downloaded copy carries the current metadata: XMP always, with IPTC-IIM and EXIF description where the format supports them, in UTF-8. Staff download a staff copy, with all metadata including location data.
- **FR-35 [spine] Client copies.** A client copy is rebuilt from a whitelist and keeps only: the agency fields; any embedded copyright notice, creator and credit line; date taken; camera make and model, lens and exposure settings; and the colour profile.
  - Maker notes, serial numbers and owner names are left out.
- **FR-36 [spine] No location data.** Client copies, including previews and images shown on a page, contain no location data: no coordinates, no structured location fields in EXIF, XMP or IPTC (city, sub-location, state, country, location shown or created), no place name record, and no embedded thumbnail or preview. This holds for JPEG and PNG.
  - Place names in the agency fields are content and stay. Staff control this through the batch setting (FR-9) and by editing.
  - This rule stays when a later map search arrives (NFR-9): the map shows a position in the app, and client copies still contain no location data.
- **FR-37 [cut-first] ZIP.** Clients download several images, including a whole checkout, as one ZIP of client copies. Files with the same name get distinct names in the ZIP. *Fallback: one download per image.*

### F7. Client dashboard

- **FR-38 [v1; activity list is cut-first] Dashboard.** After login a contact sees the client's dashboard: its own images, its licences, images made visible to it since the contact's last login or in the last 30 days, whichever period is longer, and the 10 most recent licences and downloads by any of its contacts, with links to My images and Find images. *Fallback: no activity list.*

### F8. Admin and settings

- **FR-39 [v1] AI settings.** Staff choose the AI provider (mock or Claude) and model, and can override the API key on a settings page. Environment variables give the defaults, and the mock is the default provider. *Without the page: environment variables only.*
  - The key is stored encrypted, shown masked and never logged.
  - Choosing Claude with no valid key makes generation fail under FR-16; the rest of the app keeps working.
- **FR-40 [v1] Licence settings.** Staff set the licence type's price and licence text on a settings page.
  - A paid price must be above 0, and the text cannot be empty.
  - Changing the text creates a new version. Existing licences keep the version and price they were granted with.
- **FR-41 [spine] Transaction log.** Staff see all licences, filterable by client and date range and narrowed to paid licences only. It includes revoked licences and their credit flags.
- **FR-42 [v1; per-user view is cut-first] Action log.** The app records each of these with the user and time: upload, metadata edit, publish, draft discard, visibility or price change, archive and restore, revoke, download, changes to clients and users, setup link creation, and settings changes. Staff can view it per user, and no one can edit it. *Fallback: recorded but not shown.*

### F9. Stretch: versions

- **FR-43 [stretch] New versions.** Staff upload a new version of an existing image. It keeps the image's identity, licences and history. Search and browsing show only the latest version; older versions are listed on the image page. A licence covers the image, and clients always download the latest version.

## Non-Functional Requirements

- **NFR-1 Runnable without keys.** A person new to the project goes from a clean machine to the full flow by following the README in about 20 minutes, with no API key, paid account or local model.
  - Seed data: two staff users, three contacts in two clients, one inactive client with one contact, and about 20–40 committed, freely licensed sample images with a source list, each about 1600 px and under about 500 KB. The README lists the seeded users and passwords.
  - Oversized files for the tests are generated when the tests run, not committed.
  - Sample images cover every access-table row and include a JPEG with GPS and city fields, a JPEG with an embedded thumbnail, and a PNG with location data.
  - The mock returns fixture metadata per sample image, covering all seven keyword categories. For any other image it returns fixed, clearly labelled placeholder metadata. A setting makes it fail on demand, so the failure paths can be shown and tested.
  - Seeded users exist only in development and test setups.
- **NFR-2 Security.** Access rules are enforced on the server for every page, file and download, through one access module covered by the access-matrix tests.
  - Passwords are stored hashed, and no user can read them.
  - Stored originals are never reachable through a public path. Filenames from uploads are never used as storage paths.
  - State-changing requests are protected against cross-site request forgery.
  - Embedded metadata and AI output are treated as untrusted text: escaped wherever they are shown, and never run or followed as instructions by the app.
  - After 10 failed logins for one account in 15 minutes, further attempts are delayed. [cut-first] *Fallback: no delay; listed for the Rollout Gate.*
  - Secrets come from environment variables, documented in `.env.example`, and never appear in code, logs or the repository.
- **NFR-3 Privacy.** The agency's real images and client data never enter the repository, and uploaded files stay out of git. v1 runs on sample data only. Real images may be sent only to paid AI tiers that do not train on the data, and only after RG-3.
- **NFR-4 Scale.** With 500 images and 10 clients, in a generated data set kept out of git, a search answers in under 1 s on a developer laptop, measured by a repeatable script. With the Claude provider, AI metadata takes under about 10 s per image, and a batch of 100 finishes in about 10 minutes; this is checked once by hand with a key, since the tests do not use one. The pilot measured a median of 5.9 s and a maximum of 8.9 s.
- **NFR-5 Accessibility.** Staff and client pages meet WCAG 2.1 level A and AA as the project's own target. An image's alt text is used as its alt attribute; without alt text the page uses its title, or "Untitled image" if it has none, so no image is presented as decorative. Pages work from 360 px wide. Checked with an automated axe scan showing no serious or critical violations on the main pages, plus a manual keyboard pass. [cut-first] Aim for WCAG 2.2 AA beyond that. What the law requires of this product is an open question (RG-9).
- **NFR-6 Metadata standard.** Fields follow IPTC Photo Metadata 2025.1: alt text at most 250 characters (aim for under 150), and keywords written as UTF-8.
- **NFR-7 Errors and repeated actions.** Every error a user can hit (invalid file, duplicate, AI failure, failed save, image locked by another user, expired setup link, no access, changed cart) has a clear message in plain English. Every list has an empty state. Repeated or double-submitted actions never crash the app or create duplicates.
- **NFR-8 Language.** The UI and generated metadata are English. All UI strings are in a translation file, and the output language is a provider input, so a Norwegian pack can be added.
- **NFR-9 Data model for later stages.** These facts hold from v1:
  - Licence types are records with a price, a currency and a licence text.
  - Every stored price has a currency code and excludes VAT.
  - Images and file versions are separate records, and an image has a media-type field.
  - AI providers implement one interface, with a provider-neutral, versioned prompt and schema owned by the app.
  - Users have a role field. GPS is stored as latitude and longitude. Batches have an owner. Top-level tables have a tenant ID, with no tenant-scoping layer.
  - A later client map search stays possible. Every image keeps its coordinates and place name whatever its batch setting, visibility or price, and whether a client may see an image's location is decided in one place in the access module (NFR-2). In v1 that answer is always no.
- **NFR-10 Integrity.** A stored original's hash never changes after upload, which a test verifies. A failure during checkout or file generation leaves no partial licence and no partial file served.

## Success Criteria

Each criterion is checked by automated tests or by following the README, in mock mode with the seeded users and sample images.

- **SC-1 Access matrix.** Tests cover every row of the access table (A1–A13) and every edge rule (S1–S15), through the same routes users hit. Client A never sees an image restricted to client B. *(FR-5, FR-6, FR-21–FR-26, NFR-2)*
- **SC-2 Duplicates.** A byte-identical upload is rejected with a link to the existing image. A different file with the same filename gets the side-by-side choice, or its fallback. *(FR-10)*
- **SC-3 End-to-end flow.** Following the README, without an API key: staff batch-upload, metadata is generated, staff set visibility and price and publish, a client finds an image, adds it to the cart and checks out, and the licence appears in the transaction log. *(F2–F5, FR-41, NFR-1)*
- **SC-4 Self-serve.** A client logs in, finds an image by keyword, downloads an own image, and buys a paid one, with no action from staff. *(FR-28–FR-34)*
- **SC-5 Licence records.** Each licence records everything FR-23 lists. It appears in the client's history and in the transaction log, which can show paid licences only. *(FR-23, FR-33, FR-41)*
- **SC-6 No location data out.** Every file served to a client, in JPEG and PNG, carries the current metadata and passes the location checklist from the [metadata research](../../research/technical-metadata-libraries-2026-10-28/research.md), section C. A contact's pages and search reveal no GPS position or place name record. The image's coordinates and place name stay stored and visible to staff. *(FR-13, FR-28, FR-30, FR-34–FR-36, NFR-9)*
- **SC-7 AI failure doesn't block.** With the mock set to fail, uploads succeed, the fields can be filled in by hand, and other images in a batch continue. Retrying leaves staff-edited fields alone. *(FR-16)*
- **SC-8 Action log.** Every action listed in FR-42 is recorded with the user and time. *(FR-42)*
- **SC-9 Search.** A fixed set of searches, at least one per keyword category, runs against the sample images and their fixture metadata and returns the expected images. *(FR-27, FR-29, NFR-1)*
- **SC-10 Concurrent staff.** With both seeded staff users: a second user cannot edit a locked image or batch, sees who holds the lock, and can take over after it expires. *(FR-18)*
- **SC-11 Bad input.** The edge files (corrupt, renamed, oversized), invalid field values and double submissions each give the stated message or no effect, and never a crash. Publishing an image with missing metadata shows the warning and then succeeds, and its pages still give it an alt attribute. *(FR-8, FR-17, FR-19, FR-30, FR-32, NFR-5, NFR-7)*
- **SC-12 Administration and dashboard.** Staff create a client and a contact, and the contact sets a password through the setup link and logs in. An invalid org number is refused. The client card and the contact's dashboard show the expected images and licences. Changing the licence price or text leaves existing licences unchanged. A saved API key shows masked and appears in no log. Discarding a draft lets the same file be uploaded again. A ZIP of images with the same filename gets distinct names, or its fallback applies. *(FR-1–FR-4, FR-7, FR-20, FR-37–FR-40)*

**Counter-measures (do not optimise).** These stop the wrong thing from looking like progress:

- **The share of AI metadata published unedited.** Staff correcting the AI is the design, so a push to raise this share would hide errors.
- **The number of tests or FRs finished.** SC-1 and SC-3 passing matters more than a higher count of finished features.

## Rollout Gate

Nothing here is built by 2026-12-05. Each item must be met, or explicitly accepted by the agency's management, before real images or client data enter the system. The legal items need checking by someone competent; this PRD is not legal advice, and the [addendum](addendum.md) records what was and wasn't verified.

- **RG-1 Hosting.** The app runs on managed hosting over HTTPS, with no seeded users, a stated way to create the first staff user, and secrets outside the code. The agency chooses where it is hosted, with EU/EEA as the default. Staff login gets a decision on two-factor authentication, and the login delay from NFR-2 is in place.
- **RG-2 Backups.** Database and files are backed up on a schedule agreed with the agency, and a restore has been tested.
- **RG-3 Data protection basis.** The agency has recorded its legal basis and processing activities, given contacts a privacy notice, and signed data processing agreements with the hosting and AI providers. Anthropic's current terms are checked against the 30-day API retention stated in its privacy article.
- **RG-4 Erasure.** Staff can permanently delete an image with its files, and remove a person's data on request, while licence and accounting records stay valid with the person's details anonymised. This resolves the conflict between v1's "never delete" rule and data protection rights.
- **RG-5 People in images.** Staff can record whether an image shows identifiable people and whether consent covers commercial licensing. An image with identifiable people and no such consent cannot be licensed to clients who did not commission it. Images of children have their own consent check.
- **RG-6 Rights and licence terms.** The licence text is reviewed and available in Norwegian. The agency confirms it may license each image set it loads, including commissioned work and photographers' rights.
- **RG-7 Billing.** A way to bill recorded licences exists (Tripletex or an export), with currency and VAT settled. v1's USD price is a placeholder until then.
- **RG-8 Norwegian.** The Norwegian UI pack is in place, and Norwegian AI metadata is re-tested and accepted by the agency, including the unfilled scores in the pilot results.
- **RG-9 Accessibility.** Uutilsynet's current requirement, and whether it covers a gated B2B portal, is confirmed, and the app meets what applies.
- **RG-10 Scale and migration.** The real library is expected to hold 5,000–50,000 images.
  - Search is re-tested at 50,000 images against a target agreed with the agency.
  - Storage is planned for up to about 2.5 TB at the 50 MB limit.
  - A bulk import exists, since the 50–100 image upload flow doesn't suit this volume. It handles the existing library's duplicates and repeated camera filenames without a manual decision per file.
- **RG-11 File types.** The file types staff really use (for example RAW, TIFF, PSD and HEIC) are confirmed with the agency and either supported or handled by a stated routine.
- **RG-12 Email and accounts.** Setup links and resets are sent by email.
- **RG-13 Operations.** A named role owns updates, monitoring, support and the response to a data breach, including the 72-hour notification duty.
- **RG-14 Baseline.** The time staff take to find an image, and the number of image requests clients send by email, are measured before rollout, so the benefit can be shown afterwards. Targets are agreed with the agency.

## Trade-offs

| Chosen | What v1 gives up | Why |
|---|---|---|
| Cart and checkout | The time a one-image "buy" button would save | Without it, a client licensing a set repeats the flow per image (D-022); checkout on one image is the fallback |
| One editor at a time | The simplicity of last-write-wins | Shared drafts are edited by several staff, and silent overwrites lose work; adds lock expiry and takeover |
| No payment or invoicing | Revenue handling inside the app | Licences are a log that billing reads later (RG-7) |
| USD, one licence type | Realistic Norwegian pricing | Keeps v1 small; the data model allows more |
| Setup links by hand | Convenience | v1 sends no email, so nothing depends on a mail service |
| No permanent deletion, except unpublished drafts | Data protection erasure in v1 | No real personal data enters v1; RG-4 closes this before rollout |
| Place names allowed in AI text by default | Absolute location privacy | Improves search; staff turn it off for sensitive shoots |
| Publishing with missing metadata, with a warning | A guarantee that every published image has alt text and can be found by search | Staff decide; the warning shows the cost, and pages fall back to a title or label |
| Text and keyword search only for clients in v1 | Finding images by place on a map | Keeps v1 small and its location rule simple; NFR-9 keeps the data for a later map |

## Out of Scope for v1

- **Buying:** payment, PDF invoices, Tripletex, one-click purchase, refunds, and more licence types and currencies (the data model allows them).
- **Accounts:** email sending, two-factor login, a client-admin role, contacts in several clients, "view as client", and self-service password change or reset (staff issue a setup link).
- **Library:** collections, private batches, a public library without login, file types other than JPEG and PNG, near-duplicate detection, and map view and client map search (planned for a later version, NFR-9).
- **AI:** per-image or per-field AI choice, and regenerating AI metadata for an image that didn't fail.
- **Operations and look:** Norwegian UI, backups, agency and client branding, permanent deletion of anything except never-published drafts, and everything in the Rollout Gate.

Versioning is a stretch goal (FR-43).

## Open Questions

1. **Hours.** The project plan's 45–65 h build estimate predates the features D-022 added to v1, and available hours per week are not known. The [v1] FRs have no order among themselves. Epics and stories should re-estimate v1 against the time left and rank them, so the checkpoint has a clear order to cut from. Owner: Marthe; revisit at sprint planning.
2. **Official deadline.** Not set; v1 targets 2026-12-05 regardless. Owner: Marthe; revisit when the course publishes it.
3. **English AI quality.** The pilot validated Norwegian output, while v1 generates English. Prompt v2 needs a short English check when the Claude provider is built. Owner: Marthe; revisit at that story.
4. **Rollout questions for the agency.** Exact library size, file types in use, which images show people, hosting preference and which Claude plan it has. Owner: Marthe; revisit before stage 2 planning.
5. **Client map search.** Which images appear on the map, how exact a position clients see, and whether clients also search by place name. D-011's reason for hiding location still applies, for example where a portrait was taken. Owner: Marthe; revisit when the map is planned.

