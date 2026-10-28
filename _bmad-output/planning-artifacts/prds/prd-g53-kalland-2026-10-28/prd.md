---
title: "PRD: CRM-DAM"
status: final
created: 2026-10-28
updated: 2026-10-28
---

# PRD: CRM-DAM

Builds on the [product brief](../../briefs/brief-g53-kalland-2026-09-11/brief.md) and its [addendum](../../briefs/brief-g53-kalland-2026-09-11/addendum.md). Where they differ, this PRD wins; the changes are recorded in D-022 in [`docs/process/decisions.md`](../../../../docs/process/decisions.md). Names in the journeys are fictional.

## Overview

CRM-DAM gives a design agency one place to find its own images, and gives its clients a gated portal to download the images they own and license more. v1 is the IBE160 course deliverable, due to run by 2026-12-05: the core flow complete and tested on sample data, single developer. Its spine is the teacher's minimal version: upload → AI metadata → visibility and price → the client finds, downloads or checks out → the licence is logged.

v1 is larger than that spine, because the app is not usable without cart and checkout, batch upload and the client's two views of its images; it is still narrower than the original brief.

## Glossary

- **Staff:** any agency user. All staff are admins in v1.
- **Client:** a client organisation. **Contact:** a person who logs in for a client; a contact belongs to one client.
- **Licence:** a client's recorded right to an image, of one licence type, at a price (0 USD for free images).
- **Own image:** an image a client may download without buying: it holds a licence to it, or the image is published, free, not archived and restricted to a list that includes the client.

## Success Criteria

Every criterion is checked by automated tests or by following the README, in mock mode with the seeded users and sample images.

- **SC-1 Access matrix.** Tests cover every row of the access table in F3, plus draft vs published and archived vs not. Client A never sees an image restricted to client B. A licence survives later changes of visibility and price and is removed only by revoke, which requires a reason. *(FR-15–FR-21)*
- **SC-2 Duplicates.** A byte-identical upload is rejected with a message pointing to the existing image. A different file with the same filename is shown side by side with the existing image, and staff keep both or discard the upload. *(FR-7)*
- **SC-3 End-to-end flow.** Following the README, without an API key: staff batch-upload, metadata is generated, staff set visibility and price and publish, a client finds an image, adds it to the cart and checks out, and the licence appears in the transaction log. *(F2–F5)*
- **SC-4 Self-serve.** A client logs in, finds an image by keyword, downloads an own image, and buys a paid one through cart and checkout, with no action from staff. *(FR-22–FR-28)*
- **SC-5 Transaction log.** Each licence records the client, the contact, the image, the licence type, the price and currency at the time it was granted (0 USD for free images) and a timestamp. It appears in the client's history and in the staff view, which can show paid licences only. *(FR-18, FR-35)*
- **SC-6 No location data out.** Every image file served to a client carries the current, edited metadata and no location data as defined in FR-30, checked with the checklist from the [metadata research](../../research/technical-metadata-libraries-2026-10-28/research.md). *(FR-29, FR-30)*
- **SC-7 AI failure doesn't block.** If the AI provider fails, the upload succeeds and the fields can be filled in by hand; in a batch, a failure on one image does not stop the others. *(FR-13)*
- **SC-8 Action log.** Every action listed in FR-36 is recorded with the acting user and the time. *(FR-36)*
- **SC-9 Search returns the expected sample images per keyword category.** A fixed set of searches, at least one per keyword category (place, weather/season, emotion, colour/adjective, activity, object, perspective/composition), runs against the sample images and their fixture metadata (NFR-1) and returns the expected images. *(FR-22)*

## User Journeys

### UJ-1: Ida finds images for a leaflet

Ida, a designer at the agency, is making a leaflet for a local client who has no images of their own. The agency has suitable images from the area, but they are spread across old projects and named only by the camera (`C0930_1467.jpg`). Ida searches the library for "drone, city, winter" and narrows the result with filters (client, visibility, price, status, date taken). She opens an image, checks its metadata and downloads it.

*Later: collections.*

### UJ-2: Ida uploads a client shoot

1. Ida has finished a shoot for a client and starts a batch upload of 50–100 images.
2. For the whole batch she chooses: visible only to that client, free, AI-generated or manual metadata, and keywords added to every image.
3. A byte-identical file is rejected. A file that only shares a filename with an existing image shows both side by side, and Ida keeps both or discards the upload. This is settled before the AI runs.
4. Uploading and AI generation run in the background. Finished images are added to the bottom of the list; an image is editable once it is uploaded and, if AI was chosen, has its text.
5. Ida corrects what the AI got wrong. Every edit is saved automatically, and no one else can edit an image while she does. The batch stays a draft, visible to all staff, until it is published; single images can be published on their own.
6. Ida publishes the batch. The images appear in the agency library and in the client's library (and for all logged-in clients if she had chosen public). Upload, edit and publish are logged with the user who did them.

*Later: AI or manual per image or per field; private batches.*

### UJ-3: Jonas buys images for a campaign

1. Jonas, the marketing contact at the client Fjordkaffe AS, needs images for a campaign. The agency has done a shoot for Fjordkaffe before. He logs in with email and password.
2. His dashboard shows Fjordkaffe's images, recent activity, licences, and new images the agency has made available. From it he goes to **My images** or **Find images**.
3. In Find images he searches everything visible to Fjordkaffe. Fjordkaffe's own images carry a green tick. He can filter, including "only my images", but not by client.
4. He opens an image. If it is Fjordkaffe's own, he downloads it. Otherwise he sees the licence options, opens each one to read its licence text and terms, picks one and adds the image to his cart.
5. He reviews and edits the cart, then checks out. There is no payment and no invoice in v1: checkout records each licence in the transaction log.
6. From the checkout page he downloads everything he just bought, or finds it later in My images.

*Later: one-click purchase, PDF invoices and Tripletex, refunds for wrong purchases.*

### Admin capabilities

Staff tasks with no journey of their own: managing clients and contacts with setup links (FR-1–FR-3), revoking licences and archiving images (FR-20, FR-21), and the settings, transaction log and action log (FR-33–FR-36). Agency theme and other settings are not in v1.

## Functional Requirements

Each FR is tagged **[spine]** (the teacher's minimal flow), **[v1]** or **[cut-first]**. If time runs short, cut-first FRs fall back as stated in the FR before anything else is dropped.

### F1. Accounts and clients

- **FR-1** [spine] Staff create clients (name, optional org number with validation, status, billing email, account manager, staff notes) and contacts (name, email), and can deactivate a contact. A contact belongs to one client.
- **FR-2** [spine] Creating a contact, or resetting its password, gives staff a single-use setup link that expires after 7 days. Staff copy it into their own email; v1 sends no email.
- **FR-3** [spine] Staff and contacts log in with email and password and can log out. A deactivated contact, or a contact of an inactive client, cannot log in and is told why.
- **FR-4** [spine] Every user has a role. v1 has two: staff and contact. Contacts never reach staff pages or data.

### F2. Upload and metadata

- **FR-5** [spine] Staff upload one image or a batch. v1 accepts JPEG and PNG up to 50 MB per file. A file that is not a valid JPEG or PNG, or is too large, is rejected with a message naming the file and the reason.
- **FR-6** [v1] Before uploading a batch, staff set for all its images: visibility and client list, free or paid, AI or manual metadata, and keywords added to every image.
- **FR-7** [spine; side-by-side is cut-first] A byte-identical file, in the library or earlier in the same batch, is rejected with a link to the existing image. A file whose name matches an existing image (ignoring case) is shown side by side with it, and staff keep both or discard the upload. Both checks happen before any AI call. *Fallback: a plain warning, and the upload is kept.*
- **FR-8** [spine] On upload the system reads the embedded metadata (EXIF, IPTC, XMP, including date taken, camera data and GPS) and keeps the original file unchanged.
- **FR-9** [spine] When AI is chosen, the system generates an English title, description, alt-text and keywords. Keywords cover place, weather/season, emotion, colour/adjective, activity, object, and perspective/composition. The embedded metadata, and the place name from FR-10, are given to the provider as text. The provider never turns coordinates into place names itself.
- **FR-10** [v1] When an image has GPS coordinates, the app derives a place name (place, municipality, county, country) and stores it as searchable, editable metadata, whether or not AI is used. The lookup works without an API key or network access, so the examiner's run and the tests include it.
- **FR-11** [v1] Generated metadata is checked by the app whatever the provider: at most 15 keywords, no duplicates, keywords lower-case except proper nouns, alt-text within the length limit (NFR-6). Each record stores which provider, model and prompt version produced it.
- **FR-12** [v1] Upload and generation run in the background. Staff can browse the batch meanwhile; finished images are added to the list as they complete. An image is editable once it is uploaded and, if AI was chosen, has its metadata.
- **FR-13** [spine] If generation fails for an image, the upload still succeeds, its fields are left empty for staff to fill in, and the rest of the batch continues.
- **FR-14** [spine] Staff edit every metadata field. Edits are saved automatically; a failed save shows an error and keeps the unsaved value. Only one staff user at a time edits an image or a batch. While a batch is being edited, no one else can edit it or any image in it; while an image is being edited, no one else can edit it or its batch. Others see who is editing and wait until that user finishes.
- **FR-15** [v1] A batch stays a draft until published. All staff can see drafts. Staff publish a whole batch or single images. Clients never see drafts.

### F3. Access and licences

- **FR-16** [spine] Every image has a visibility (public to all logged-in clients, restricted to listed clients, or internal-only) and a price setting (free or paid). Staff can change both after publishing.
- **FR-17** [spine] What a client gets follows the access table below. Anything a client may not see returns "not found", never "forbidden".
- **FR-18** [spine] v1 has one licence type, standard commercial use, with a price in USD and a licence text, both set by staff. A paid image costs the price of the chosen licence type. Each licence stores the licence type, text version, price and currency at the time it was granted. A client's first download of a free image records a licence at 0 USD.
- **FR-19** [spine] A licence survives later changes of visibility, price and archiving, and a contact being deactivated.
- **FR-20** [spine] Staff remove a licence only by revoking it: a warning lists the affected licences, a reason is required, the licence is marked revoked (never deleted), a revoked paid licence is flagged for a possible credit, and the client's history shows the image as removed by the agency. Revoking a licence to an image restricted to that client also removes the client from the image's list, so the image does not become own again.
- **FR-21** [spine] Staff archive an image instead of deleting it. An archived image is neither visible nor own for clients without a licence.

**Access table** (published, not archived images; for one client):

| Visibility for this client | Price | Licence held | Client gets |
|---|---|---|---|
| Public | Free | No | Sees it; downloads the original; first download records a 0 USD licence. No tick until then. |
| Restricted, client on the list | Free | No | Own image: in My images with a tick; downloads the original; first download records a 0 USD licence. Applies to every client on the list. |
| Public, or restricted with the client on the list | Paid | No | Sees a small preview without a watermark; can add it to the cart. |
| Restricted, client not on the list | Any | No | Not found. |
| Internal-only | Any | No | Not found. |
| Any, including archived | Any | Yes (not revoked) | Own image: sees it with a tick and downloads the original. Cannot add it to the cart. |

Drafts are not found for any client.

### F4. Search and browse

- **FR-22** [spine] Staff search the whole library by keyword, matching title, description, keywords and place names, and filter by client, visibility, price, status (draft / published) and date taken.
- **FR-23** [spine] Clients have two entry points: **My images** (own images) and **Find images** (every image the client can see). In Find images, own images carry a green tick, and clients can search, filter (not by client) and narrow to "only my images".
- **FR-24** [spine] The image page shows the image larger with its metadata. For a client it offers download if the image is own; otherwise it lists the licence options, each opening its licence text and terms.

### F5. Cart and checkout

- **FR-25** [v1] A client adds a paid image with a chosen licence type to the cart, and views and edits the cart. An own image cannot be added.
- **FR-26** [v1] Checkout needs no payment. It records one licence per cart line in the transaction log and lists the purchased images for download.

### F6. Downloads

- **FR-27** [spine] Every download is a copy of the original with the current, edited metadata written in: XMP always, IPTC-IIM and EXIF description where the format supports them, in UTF-8.
- **FR-28** [spine] Staff download the original with all metadata, including location data.
- **FR-29** [spine] Every image file served to a client (preview, image page, download) keeps the agency's metadata fields, the camera data, the date taken and the colour profile, and no other metadata.
- **FR-30** [spine] Image files served to a client contain no location data: no coordinates, no structured location fields in EXIF, XMP or IPTC (city, sub-location, state, country, location shown or created), no derived place name from FR-10, and no embedded thumbnail or preview. Place names that staff have kept in the title, description or keywords are deliberate content and stay.
- **FR-31** [cut-first] Clients download several images, including a whole checkout, as one ZIP. *Fallback: one download per image.*

### F7. Client dashboard

- **FR-32** [v1; activity feed is cut-first] After login a contact sees the client's dashboard: its own images, its licences, images made visible to it since the contact's last login or in the last 30 days, and the 10 most recent licences and downloads by any of its contacts, with links to My images and Find images. All contacts of a client see the same history. *Fallback: no activity list.*

### F8. Admin and settings

- **FR-33** [spine] Staff choose the AI provider (mock or Claude) and model and can override the API key on a settings page. The key is stored encrypted, shown masked and never logged. Environment variables give the defaults, and the mock is the default provider.
- **FR-34** [v1] Staff set the licence type's price and licence text on a settings page.
- **FR-35** [spine] Staff see the transaction log of all licences, filterable by client and narrowed to paid licences only.
- **FR-36** [v1; per-user view is cut-first] Upload, metadata edit, publish, visibility or price change, archive and revoke are recorded in an action log with the user and time. Staff view it per user. *Fallback: the log is recorded but not shown.*

### F9. Stretch: versions

- **FR-37** [stretch] Staff upload a new version of an existing image. It keeps the image's identity, licences and history. Search and browsing show only the latest version; older versions are listed on the image page. A licence covers the image, and clients always download the latest version.

## Non-Functional Requirements

- **NFR-1 Runnable without keys.** The app runs from the README on a clean machine with the mock provider, seeded users (one staff user, three contacts in two clients, one inactive client) and committed, freely licensed sample images. The mock returns fixture metadata per sample image that covers all seven keyword categories. No API key, paid account or local model is needed.
- **NFR-2 Security.** Access rules are enforced on the server for every page, file and download, and covered by the access-matrix tests. Passwords are stored hashed. Secrets come from environment variables, documented in `.env.example`, and never appear in code, logs or the repository.
- **NFR-3 Privacy.** The agency's real images and client data never enter the repository; uploaded files are kept out of git. Real images are only sent to paid AI tiers that do not train on the data.
- **NFR-4 Scale.** With about 500 images and 10 clients, a search answers in under 1 s, and AI metadata for one image takes under about 10 s.
- **NFR-5 Accessibility.** The app may be used by public-sector clients, so staff and client pages meet the stricter Norwegian public-sector rules (forskrift om universell utforming av IKT-løsninger): WCAG 2.1 level A and AA. Generated alt-text is used as the image's alt attribute. Checked with an automated axe scan showing no serious or critical violations on the main pages, plus a manual keyboard pass. [cut-first] Aim for WCAG 2.2 AA beyond that.
- **NFR-6 Metadata standard.** Fields follow IPTC Photo Metadata 2025.1: alt-text at most 250 characters (aim for under 150), keywords written as UTF-8.
- **NFR-7 Errors.** Every error a user can hit (invalid file, duplicate, AI failure, failed save, image locked by another user, expired setup link, no access) has a clear message in plain English.
- **NFR-8 Language.** The UI and generated metadata are English, with all UI strings in a translation file so a Norwegian pack can be added.
- **NFR-9 Data model for later stages.** Licence types are records with a price, a currency and a licence text; every stored price has a currency code; images and file versions are separate records; AI providers implement one interface; top-level tables have a tenant ID. The brief's addendum lists further accommodations (a media-type field, a role field, GPS as latitude and longitude).

## Out of Scope for v1

Payment and PDF invoices (and Tripletex), one-click purchase, refunds, collections, private batches, per-image or per-field AI choice, a public library without login, more licence types and currencies (the data model allows them), Norwegian UI, file types other than JPEG and PNG, near-duplicate detection, backups, agency and client branding, map view, email sending, a client-admin role, "view as client", and permanent file deletion. Versioning is a stretch goal (FR-37).

## Open Questions

- **Accessibility requirement:** confirm the current Norwegian requirement with Uutilsynet before release. Owner: Marthe; revisit before the stage-2 rollout.
