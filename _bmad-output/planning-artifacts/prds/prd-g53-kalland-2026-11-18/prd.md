---
title: "PRD: CRM-DAM"
status: final
created: 2026-11-18
updated: 2026-11-23
---

# PRD: CRM-DAM

## Document Purpose

This PRD defines what CRM-DAM v1 must do, in what order it is built, and what can be cut. It feeds UX, architecture, and epics and stories. Stories trace to an FR and a journey (UJ), and tests trace to SC IDs.

It replaces the [PRD of 2026-11-04](../prd-g53-kalland-2026-11-04/prd.md), answers the [teacher's feedback](../prd-g53-kalland-2026-11-04/tilbakemelding-prd.en.md) on it, and builds on the [product brief](../../briefs/brief-g53-kalland-2026-09-11/brief.md); where they differ, this PRD wins. The [addendum](addendum.md) lists what changed, and the [assumptions](addendum.md#details-confirmed-in-review) the user confirmed. The [Rollout Gate](rollout-gate.md) has its own file. Names in the journeys are fictional.

## Vision

A design agency loses time hunting through its own unstructured image bank, and its clients have to ask by email for images they already have rights to. CRM-DAM gives the agency one place to find its images and gives each client a gated portal to download what it owns and license more.

The bet is that one simple access model, visibility × price plus a licence that lasts, can serve commissioned work and stock sales without special cases. AI metadata makes the library searchable, but it is an expected baseline and not the differentiator. The difference is having internal asset management, a gated client storefront and the client register on one backbone.

## Release Stages

| Stage | What it is | Data | Bar |
|---|---|---|---|
| **v1** | The IBE160 course deliverable, due 2026-12-15 (no longer D-019's 2026-12-05); solo build, about 130 hours left from 2026-11-18 for everything | Sample data only | The Success Criteria below |
| **Stage 2** | The work after the course that makes rollout safe | Sample or test data | The [Rollout Gate](#rollout-gate) |
| **Rollout** | The agency's real use | Real images and client data | Every gate item met and signed off |

v1 does not go live (D-009). No real image or client data enters the system until the Rollout Gate is met.

**Spine and tags.** The teacher's minimal flow is the spine: upload → AI metadata → visibility and price → the client finds, downloads or buys → the licence is logged. Each FR has one tag, and an FR that used to mix two is split into a and b items (FR-10a, FR-10b):

- **[spine]**: the flow, or needed for it. The spine is the minimum usable v1 and is built first.
- **[planned]**: ranks 1–5 below, built after the spine.
- **[bonus]**: ranks 6–22, built only if hours remain, in rank order; otherwise it takes its fallback from the table below.
- **[stretch]**: built only when everything else is done and tested.

**Build order.** Coding starts 2026-11-22. The first stories build a thin slice through the whole spine (staff log in, upload one image and publish it; a contact finds it and checks out; the licence shows in the log), and each area is filled out after. The checkpoint comes after only about 35–40 of the spine's 75 hours.

**Checkpoint, 2026-11-30.** Does the spine run end to end in mock mode (the SC-3 path, with checkout on one image)?

- **If it runs:** walk down the ranks against the hours left and draw the cut line. Rows below it take their fallback at once.
- **If it doesn't:** the spine itself is reduced as below, and no ranked FR is started until the spine runs.
- **Either way:** set the freeze date, after which only fixes, the README test and the reflection report are done. Each cut is recorded as a decision (D-xxx), and PRD changes go through `bmad-correct-course`.

**Reduced spine**, used only if the checkpoint fails: FR-27 keyword search without filters; FR-29 without paging; FR-33 shown only as My images; FR-41 without filters; FR-11 reads only date taken and GPS; NFR-5a checked by the axe scan alone. The access rules (FR-22), client copies (FR-35) and the location rule (FR-36) are never reduced.

### Minimum usable v1 and priority order

**Budget.** Of the about 130 hours, about 87 are for building; the rest go to planning, delivery, the reflection report and a 10 % buffer ([addendum](addendum.md#hours-budget)). Estimates are rough, include tests and the per-story routine, and are re-checked at the checkpoint.

**The spine (MVP)**, about 75 h:

| Area | FRs and NFRs | Est. h |
|---|---|---|
| Foundation: containers, database, CI, README v0 | NFR-1, NFR-2a, NFR-8, NFR-10 | 8 |
| Seed data, sample images and the mock provider | NFR-1 | 4 |
| Accounts and login | FR-1, FR-2, FR-4, FR-5, FR-6 | 9 |
| Upload and metadata, including the mock and Claude providers | FR-8, FR-10a, FR-11, FR-12, FR-16a, FR-17, FR-19a | 17 |
| Access and licences, with the access-matrix tests | FR-21, FR-22, FR-23, FR-24, FR-26 | 10.5 |
| Search and browse | FR-27, FR-28, FR-29, FR-30 | 8 |
| Checkout on one image, licence history | FR-32, FR-33 | 4 |
| Downloads | FR-34, FR-35, FR-36 | 8 |
| Transaction log | FR-41 | 1.5 |
| Accessibility pass and error messages | NFR-5a, NFR-7 | 4.5 |

**Ranked after the spine:**

| Rank | FR | Tag | Est. h | Fallback if not built |
|---|---|---|---|---|
| 1 | FR-9 Batch settings | planned | 2.5 | Defaults; staff change each image afterwards |
| 2 | FR-14 Output checks | planned | 1.5 | The provider's schema only; staff review |
| 3 | FR-16b Retry | planned | 1 | Staff fill in the fields by hand |
| 4 | FR-38a Dashboard | planned | 2.5 | The contact lands on My images |
| 5 | FR-31 Cart | planned | 3 | Checkout on one image (FR-32) |
| | ***Planned: about 10.5 h. Everything below is bonus.*** | | | |
| 6 | FR-25 Revoke | bonus | 3 | No revoke; edge rules S11–S14 are not tested |
| 7 | FR-13 Place names | bonus | 3 | No place names; GPS is still stored |
| 8 | FR-42a Action log | bonus | 2.5 | Nothing is recorded; SC-8 drops |
| 9 | FR-7 Client card | bonus | 2 | Client edit page with contacts; licences via the transaction log |
| 10 | FR-15 Background processing | bonus | 4 | Processed while the upload page waits; SC-14 drops |
| 11 | FR-3 Staff accounts | bonus | 1.5 | Only the two seeded staff users |
| 12 | FR-20 Discarding drafts | bonus | 1 | Archive instead; the hash still blocks a re-upload |
| 13 | FR-40 Licence settings | bonus | 1.5 | Price and licence text from the seed data |
| 14 | FR-39 AI settings | bonus | 2 | Environment variables only |
| 15 | FR-18 Edit locks | bonus | 4 | Last save wins; SC-10 drops |
| 16 | FR-10b Matching filenames | bonus | 2 | A plain warning; the upload is kept |
| 17 | FR-37 ZIP | bonus | 1.5 | One download per image |
| 18 | FR-19b Publishing a batch | bonus | 1.5 | Publish one by one |
| 19 | FR-42b Action log view | bonus | 1 | Recorded, not shown |
| 20 | FR-38b Activity list | bonus | 1 | No activity list |
| 21 | NFR-2b Login delay | bonus | 1 | No delay; RG-1 requires it before rollout |
| 22 | NFR-5b WCAG 2.2 | bonus | 1.5 | WCAG 2.1 AA |
| 23 | FR-43 New versions | stretch | 5 | Not built |

When a row is not built, the SCs that test it shrink to match, and the README says so.

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
3. Before the AI runs, a byte-identical file is rejected, and a file that only shares a filename with an existing image is shown beside it so Ida can keep both or discard it.
4. Uploading and AI generation run in the background, and images become editable as they finish.
5. Ida corrects what the AI got wrong. Edits save automatically, and no one else can edit an image while she does. The batch stays a draft, visible to all staff.
6. Ida publishes the batch, and the images appear in the client's library. Upload, edit and publish are logged with her name.

**Edge cases:** if the AI fails on three images, the rest continue, and Ida retries or fills in those three by hand. If she closes her laptop mid-edit, her lock expires and a colleague can take over.

*If the bonus FRs are not built:* filenames give a plain warning (FR-10b), there are no place names (FR-13), processing runs while the upload page waits (FR-15), the last save wins (FR-18), images are published one by one (FR-19b), and actions are not logged (FR-42a).

*Later: AI or manual per image or per field; private batches.*

### UJ-3: Jonas buys images for a campaign

1. Jonas, the marketing contact at the client Fjordkaffe AS, needs images for a campaign. The agency has done a shoot for Fjordkaffe before. He logs in with email and password.
2. His dashboard shows Fjordkaffe's images, recent activity, licences, and new images the agency has made available. From it he goes to **My images** or **Find images**.
3. In Find images he searches everything visible to Fjordkaffe. Fjordkaffe's own images carry a green tick. He can filter, including "only my images", but not by client.
4. He opens an image. If it is Fjordkaffe's own, he downloads it. Otherwise he sees the licence options, opens each one to read its licence text and terms, picks one and adds the image to his cart.
5. He reviews and edits the cart, accepts the licence terms and checks out. There is no payment and no invoice in v1: checkout records each licence in the transaction log.
6. From the checkout page he downloads everything he just bought, or finds it later in My images.

**Edge case:** if an image in his cart has become unavailable or changed price, checkout tells him what changed before anything is recorded.

*If the bonus FRs are not built:* the dashboard has no recent activity (FR-38b), and Jonas downloads his images one by one (FR-37).

*Later: searching on a map, one-click purchase, PDF invoices and Tripletex, refunds for wrong purchases.*

### UJ-4: Ida onboards Fjordkaffe

1. Fjordkaffe AS has become a client. Ida creates the client and two contacts, Jonas and a colleague.
2. Each new contact gets a setup link. Ida copies the links and sends them from her own email; the app sends no email.
3. Jonas opens his link, sets a password and lands on Fjordkaffe's dashboard (UJ-3 step 2 from then on).

**Edge cases:**
- Jonas opens the link after it has expired. The login screen tells him: "Link expired. Contact the agency for a new one." Ida creates a new link, which cancels the old one.
- Jonas types the wrong password. The login screen tells him: "Incorrect email or password. Contact the agency to set up a new password."

*Later: the app sends the links by email (RG-12); contacts reset their own password.*

## Functional Requirements

### F1. Accounts and clients

- **FR-1 [spine] Client records.** *Realizes UJ-4.* Staff create and edit clients: name, optional org number, status (active or inactive), billing email, account manager (a staff user) and staff notes.
  - An org number must have 9 digits and pass the mod-11 check.
  - A client can be set inactive and active again, but never deleted (S10).
- **FR-2 [spine] Contacts.** *Realizes UJ-4.* Staff create, edit, deactivate and reactivate contacts: name, email and optional phone.
  - An email is unique across all users and is the login. Changing it keeps the same user, licences and history.
- **FR-3 [bonus] Staff accounts.** *No journey.* Staff create, edit, deactivate and reactivate staff users the same way.
  - The last active staff user cannot be deactivated (S9).
- **FR-4 [spine] Setup links.** *Realizes UJ-4.* Creating a user, or resetting a password, gives staff a single-use link that expires after 7 days. Staff copy it into their own email; v1 sends no email.
  - A new link cancels earlier unused links for that user.
  - A used or expired link is refused, with a message telling the user to ask the agency (S8).
  - A password has at least 12 characters.
- **FR-5 [spine] Login.** *Realizes UJ-3, UJ-4.* Users log in with email and password and can log out.
  - A wrong email and a wrong password give the same message.
  - After a correct password, a deactivated user or a contact of an inactive client is refused and told why.
  - Status is checked on every request, so deactivation takes effect on the user's next request (S1, S2).
  - Setting a new password ends the user's other sessions.
  - A session ends after 8 hours of inactivity.
- **FR-6 [spine] Roles.** *Realizes UJ-3, UJ-4.* Every user is staff or a contact.
  - A contact requesting a staff page or staff data gets 403 and no data (S6).
  - Staff notes, account managers, visibility lists and other clients' data never appear on contact pages.
- **FR-7 [bonus] Client card.** *Realizes UJ-4.* Staff see one page per client with its details, contacts, the images visible to it, and its licence history.
  - In the seed data, Fjordkaffe's card shows its 2 contacts, exactly the images the access table lets it see, and all its licences, revoked ones included.
  - Staff notes and the account manager appear only here and on other staff pages. A contact who opens the card's address gets 403 and no data (S6).

### F2. Upload and metadata

- **FR-8 [spine] Upload.** *Realizes UJ-2.* Staff upload one image or a batch. v1 accepts JPEG and PNG up to 50 MB per file.
  - The file's content decides its type, not its extension. A corrupt file, a non-image renamed `.jpg`, an unsupported type or an oversized file is rejected with a message naming the file and the reason.
  - A rejected file does not stop the rest of a batch.
- **FR-9 [planned] Batch settings.** *Realizes UJ-2.* Before uploading a batch, staff set for all its images: visibility and client list, free or paid, AI or manual metadata, whether the AI receives place names, and keywords added to every image.
  - New uploads default to internal-only and free, with place names on.
  - Settings apply when each image is created. Staff can later change any single image, or apply visibility, price or keywords to the whole draft batch, after confirming that this overwrites the images' current values.
- **FR-10a [spine] Identical files.** *Realizes UJ-2.* A byte-identical file, in the library (including archived images) or earlier in the same batch, is rejected with a link to the existing image.
  - The check runs before any AI call, per file, so one file does not hold up the others.
- **FR-10b [bonus] Matching filenames.** *Realizes UJ-2.* A file whose name matches an existing image, ignoring case, is shown side by side with it, and staff keep both or discard the upload. Staff can apply one answer to all open filename matches in a batch.
  - The check runs before any AI call, per file, so one undecided file does not hold up the others.
- **FR-11 [spine] Embedded metadata.** *Realizes UJ-2.* On upload the system reads EXIF, IPTC and XMP, including date taken, camera data and GPS, and keeps the stored original unchanged.
  - Embedded title, description, alt text and keywords fill the matching agency fields. If AI is chosen, its result replaces them, and if it fails they stay.
- **FR-12 [spine] AI metadata.** *Realizes UJ-2.* When AI is chosen, the system generates an English title, description, alt text and keywords.
  - Keywords cover place, weather/season, emotion, colour/adjective, activity, object and perspective/composition.
  - The provider receives a resized copy of the image with no embedded metadata. As text, it receives the embedded metadata and the place name from FR-13, and it is told never to turn coordinates into place names.
  - With the batch's place-name setting off (FR-9), the text contains no place name, no coordinates and no embedded location fields.
  - The versioned prompt tells the model to describe what is visible, and not to state or infer ethnicity, religion, health, sexual orientation, political opinion or union membership. The model never works out who a person is from their appearance. It may use a person's name only if the name is written in the image or given in the metadata.
- **FR-13 [bonus] Place names.** *Realizes UJ-1, UJ-2.* When an image has GPS coordinates, the app derives a place name and stores it as searchable, editable staff metadata, whether or not AI is used.
  - The lookup works with no API key or network access, so the examiner's run and the tests include it.
  - A position with no match leaves the place name empty and is not an error. Editing coordinates does not change the place name.
- **FR-14 [planned] Output checks.** *Realizes UJ-2.* The app checks generated metadata whatever the provider: at most 15 keywords, no duplicates, lower case except proper nouns, and alt text within NFR-6's limit. Each record stores the provider, model and prompt version that produced it.
  - The 15-keyword limit applies to generated keywords only; shared and hand-written keywords are kept.
- **FR-15 [bonus] Background processing.** *Realizes UJ-2.* Upload and generation run in the background. Each image shows its state (uploading, queued, generating, ready, failed or rejected), and a change shows within 10 seconds without a reload.
  - An image is editable once it is uploaded and, if AI was chosen, has its metadata or has failed.
  - Generation continues if staff leave the page. After a server restart, every image ends as ready or failed. Leaving the page while files are still uploading warns first.
- **FR-16a [spine] AI failure.** *Realizes UJ-2.* If generation fails for an image, the upload still succeeds, the image shows as failed with a plain reason, staff can fill in its fields, and the rest of the batch continues.
  - An invalid or missing provider answer, a timeout and a missing or wrong key all count as failure.
- **FR-16b [planned] Retry.** *Realizes UJ-2.* Staff can retry one failed draft image or all failed draft images in a batch, so AI text never changes an image staff have already published.
  - A retry never overwrites a field staff have edited.
- **FR-17 [spine] Editing.** *Realizes UJ-2.* Staff edit the agency fields, place name, date taken and GPS position, and see camera data read-only.
  - Drafts in the upload review are saved automatically. A published or library image is edited explicitly: staff choose Edit, then Save changes or Cancel, and leaving with unsaved changes asks to save, discard or keep editing. A failed save shows an error and keeps the unsaved value.
  - Invalid values are refused with a message: alt text over the limit, an impossible date, or a latitude or longitude out of range.
  - Edits to a published image take effect at once and appear in the next file served.
- **FR-18 [bonus] Edit locks.** *Realizes UJ-2.* Only one staff user at a time edits an image or its batch, and others see who it is.
  - In the library a lock starts when the user chooses Edit. A lock ends when the user saves, cancels or discards, leaves the editor or logs out, or after 15 minutes without activity; then another user can take over. A save from an expired lock is refused and keeps the unsaved value.
  - Background generation is not blocked by a lock.
- **FR-19a [spine] Draft and publish.** *Realizes UJ-2.* An image stays a draft until published. All staff can see drafts, and clients never can. Staff publish single images.
  - An image can be published once its upload is complete and it is no longer queued or generating.
  - Missing metadata does not block publishing. A warning lists each image lacking a title, description, alt text or keywords, and says it will be harder to find and less accessible; staff confirm or go back.
  - Publishing again changes nothing.
  - Restricted with an empty client list behaves as internal-only, and staff are warned (S4).
  - A published image cannot return to draft; staff use internal-only or archive.
- **FR-19b [bonus] Publishing a batch.** *Realizes UJ-2.* Staff publish a whole batch in one action, under FR-19a's rules.
  - It publishes the images that qualify and lists the others with the reason. The missing-metadata warning lists every affected image in the batch at once.
- **FR-20 [bonus] Discarding drafts.** *No journey.* Staff can permanently discard a draft image that has never been published, after confirming. Its hash no longer blocks a re-upload.

### F3. Access and licences

- **FR-21 [spine] Visibility and price.** *Realizes UJ-2.* Every image is public to all logged-in clients, restricted to listed clients, or internal-only, and free or paid. Staff can change both after publishing.
- **FR-22 [spine] Access rule.** *Realizes UJ-3.* What a client gets follows the access table below.
  - Anything a client may not see returns "not found", never "forbidden". This covers pages, previews, files and downloads.
  - Search results, thumbnails and result counts include only what the client may see.
- **FR-23 [spine] Licences.** *Realizes UJ-3.* v1 has one licence type, standard commercial use, with a price in USD and a licence text, both set by staff. A paid image costs the price of the chosen licence type.
  - Each licence stores the client, the contact, the image and its title at the time, the licence type, the text version, the price excluding VAT and its currency at the time, and a timestamp.
  - A client's first download of a free image records a licence at 0 USD. The download action shows a link to the terms and states that downloading accepts them.
  - A client holds at most one active licence per image, so simultaneous purchases or first downloads give one licence (S5). Re-downloading is unlimited.
- **FR-24 [spine] Licences last.** *No journey.* A licence survives later changes of visibility, price and archiving, and a contact being deactivated (S3, S15).
- **FR-25 [bonus] Revoke.** *No journey.* Staff remove a licence only by revoking it, from the image page or the client card, for one client or for all holders of an image.
  - A warning lists the affected licences, and a reason is required (S11).
  - The licence is marked revoked with who, when and why, and never deleted. A revoked paid licence is flagged for a possible credit (S13), and the client's history shows the image as removed by the agency (S12).
  - Revoking also removes the client from the image's restricted list. A public image stays available under its normal access-table row, and the warning says so.
  - Sharing the image again follows the normal rules; the old licence stays revoked (S14).
- **FR-26 [spine] Archiving.** *No journey.* Staff archive an image instead of deleting it, and can restore it. An archived image is neither visible nor own for clients without an active licence, and staff can still find it.

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

- **FR-27 [spine] Staff search.** *Realizes UJ-1.* Staff search the whole library by keyword, matching title, description, keywords and place names, and filter by client, visibility, price, status (draft, published or archived) and date taken.
- **FR-28 [spine] Client browsing.** *Realizes UJ-3.* Clients have two entry points: **My images** (own images) and **Find images** (every image the client can see).
  - In Find images, own images carry a green tick. Clients can search and filter by price and date taken, and narrow to "only my images". There is no client filter.
  - In v1, client search matches title, description and keywords, and not the place name record or staff notes.
- **FR-29 [spine] Search behaviour.** *Realizes UJ-1, UJ-3.* For staff and clients alike: search ignores case; several terms must all match; results come newest first, in pages; and an empty result says so and offers to clear the filters.
- **FR-30 [spine] Image page.** *Realizes UJ-1, UJ-3.* The image page shows the image larger with its metadata.
  - A contact sees the agency fields, date taken and camera data, and never staff notes, provider details or other clients. In v1, a contact also never sees GPS or the place name record.
  - For an own image, or one covered by A1, the page offers download. Otherwise it shows the preview and lists the licence options, each opening its licence text and terms.
  - Empty fields are left out. An image with no title shows the label "Untitled image", in lists as well.

### F5. Cart and checkout

- **FR-31 [planned] Cart.** *Realizes UJ-3.* A contact adds a paid image with a chosen licence type to the cart, and views and edits the cart. Each contact has their own cart, kept between sessions.
  - Adding an image already in the cart keeps one line for it.
  - The cart survives logging out and in again. Two contacts of the same client each see only their own cart.
  - A free or own image cannot be added: the page offers no add action, and a direct request is refused (S7).
  - Removing the last line leaves an empty cart, which shows its empty state.
- **FR-32 [spine] Checkout.** *Realizes UJ-3.* Checkout needs no payment, but the contact must accept the licence terms. Checkout then records one licence per cart line in the transaction log and lists the purchased images for download.
  - Each line is checked again. A line no longer visible, now free or already held is removed with a message, and a changed price must be confirmed, before anything is recorded.
  - All lines are recorded together, or none are.
  - Submitting twice records no extra licences. An empty cart cannot be checked out.
- **FR-33 [spine] Licence history.** *Realizes UJ-3.* All contacts of a client see the client's licences: image, licence type, price, date, the contact who acquired it, the licence text as accepted, and revoked licences as removed by the agency.

### F6. Downloads

- **FR-34 [spine] Current metadata.** *Realizes UJ-1, UJ-3.* Every downloaded copy carries the current metadata: XMP always, with IPTC-IIM and EXIF description where the format supports them, in UTF-8. Staff download a staff copy, with all metadata including location data.
  - IIM limits are in bytes (title 64, description 2000, each keyword 64), and æ, ø and å take 2 bytes each. A value over the limit is shortened in IIM at the last whole word that fits, or at the last whole character if the first word alone is too long, so IIM always holds valid UTF-8. A keyword over the limit is left out of IIM. XMP and EXIF always hold the full value.
- **FR-35 [spine] Client copies.** *Realizes UJ-3.* A client copy is rebuilt from a whitelist and keeps only: the agency fields; any embedded copyright notice, creator and credit line; date taken; camera make and model, lens and exposure settings; the colour profile; and the EXIF orientation tag, a technical field that keeps portrait photos upright.
  - Maker notes, serial numbers and owner names are left out.
- **FR-36 [spine] No location data.** *Realizes UJ-3.* Client copies, including previews and images shown on a page, contain no location data: no coordinates, no structured location fields in EXIF, XMP or IPTC (city, sub-location, state, country, location shown or created), no place name record, and no embedded thumbnail or preview. This holds for JPEG and PNG.
  - Place names in the agency fields are content and stay. Staff control this through the batch setting (FR-9) and by editing.
- **FR-37 [bonus] ZIP.** *Realizes UJ-3.* Clients download several images, including a whole checkout, as one ZIP of client copies. Files with the same name get distinct names in the ZIP.

### F7. Client dashboard

- **FR-38a [planned] Dashboard.** *Realizes UJ-3, UJ-4.* After login a contact sees the client's dashboard: its own images, its licences, and images made visible to it since the contact's last login or in the last 30 days, whichever period is longer, with links to My images and Find images.
  - A contact who last logged in 40 days ago sees an image made visible 35 days ago. A contact who last logged in 5 days ago sees one made visible 20 days ago, and not one made visible 35 days ago.
  - Nothing on the dashboard belongs to another client.
- **FR-38b [bonus] Activity list.** *Realizes UJ-3.* The dashboard lists the 10 most recent licences and downloads by any of the client's contacts, newest first, each with the contact, the image and the date.

### F8. Admin and settings

- **FR-39 [bonus] AI settings.** *No journey.* Staff choose the AI provider (mock or Claude) and model, and can override the API key on a settings page. Environment variables give the defaults, and the mock is the default provider.
  - The key is stored encrypted, shown masked and never logged.
  - Choosing Claude with no valid key makes generation fail under FR-16a; the rest of the app keeps working.
- **FR-40 [bonus] Licence settings.** *No journey.* Staff set the licence type's price and licence text on a settings page.
  - A paid price must be above 0, and the text cannot be empty.
  - Changing the text creates a new version. Existing licences keep the version and price they were granted with.
- **FR-41 [spine] Transaction log.** *No journey.* Staff see all licences, filterable by client and date range and narrowed to paid licences only. It includes revoked licences and their credit flags.
- **FR-42a [bonus] Action log.** *Realizes UJ-2.* The app records each of these with the user and time: upload, metadata edit, publish, draft discard, visibility or price change, archive and restore, revoke, download, changes to clients and users, setup link creation, and settings changes. No one can edit the log.
- **FR-42b [bonus] Action log view.** *No journey.* Staff view the action log per user.

### F9. Stretch: versions

- **FR-43 [stretch] New versions.** *No journey.* Staff upload a new version of an image, which keeps its identity, licences and history. Only the latest version is shown and downloaded; older ones are listed on the image page.

## Non-Functional Requirements

- **NFR-1 Runnable without keys.** A person new to the project goes from a machine with Docker installed to the full flow by following the README in about 20 minutes, including the first image build, with no API key, paid account or local model.
  - It runs on any system with Docker Compose v2. It is developed on macOS, and CI builds and tests it on x86 Linux. Everything runs in containers, so the README's commands are the same on every system. Only building the images needs network access.
  - Seeded users and sample images cover every access-table row and the location test files, and exist only in development and test setups. The README lists the seeded users and passwords. The [addendum](addendum.md#seed-data-and-mock) lists the seed data.
  - The mock returns fixture metadata per sample image, covering all seven keyword categories, and labelled placeholder metadata for any other image. A setting makes it fail on demand.
- **NFR-2a Security.** Access rules are enforced on the server for every page, file and download, through one access module covered by the access-matrix tests.
  - Passwords are stored hashed, and no user can read them.
  - Stored originals are never reachable through a public path. Filenames from uploads are never used as storage paths.
  - State-changing requests are protected against cross-site request forgery.
  - Embedded metadata and AI output are treated as untrusted text: escaped wherever they are shown, and never run or followed as instructions by the app.
  - Secrets come from environment variables, documented in `.env.example`, and never appear in code, logs or the repository.
- **NFR-2b [bonus] Login delay.** After 10 failed logins for one account in 15 minutes, further attempts are delayed.
- **NFR-3 Privacy.** The agency's real images and client data never enter the repository, and uploaded files stay out of git. v1 runs on sample data only. Real images may go only to paid AI tiers that do not train on the data, and only after RG-3 and RG-6.
- **NFR-4 Scale.** With 500 images and 10 clients, in a generated data set kept out of git, a search answers in under 1 s on a developer laptop, measured by a repeatable script. With the Claude provider, AI metadata takes a median of under 10 s per image, no image takes longer than the provider timeout of 30 s, and a batch of 100 finishes within 15 minutes. Checked once by hand with a key and recorded in the README; the pilot measured a median of 5.9 s and a maximum of 8.9 s.
- **NFR-5a Accessibility.** Staff and client pages meet WCAG 2.1 level A and AA, the project's own target whatever the legal scope (RG-9). Pages work from 360 px wide. Checked with an automated axe scan showing no serious or critical violations on the main pages, plus a manual keyboard pass.
  - An image's alt text is used as its alt attribute; without alt text the page uses its title, or "Untitled image" if it has none, so no image is presented as decorative.
  - **Known exception.** FR-19a lets staff publish an image without alt text. The title and "Untitled image" fallbacks are not compliant alternative text, so such an image falls short of WCAG 1.1.1. The axe scan does not catch this.
- **NFR-5b [bonus] WCAG 2.2.** Aim for WCAG 2.2 AA beyond NFR-5a.
- **NFR-6 Metadata standard.** Fields follow IPTC Photo Metadata 2025.1: alt text at most 250 characters (aim for under 150), and keywords written as UTF-8.
- **NFR-7 Errors and repeated actions.** Every error a user can hit has a message in plain English that says what happened and what to do next. The messages below are tested word for word; the UI strings live in the translation file (NFR-8).
  - Every list shows an empty-state message instead of a blank area.
  - Repeated or double-submitted actions never crash the app or create duplicates.

| Situation | Message |
|---|---|
| Wrong email or password (FR-5) | Incorrect email or password. Contact the agency to set up a new password. |
| Setup link expired or used (FR-4, S8) | Link expired. Contact the agency for a new one. |
| Deactivated user, or contact of an inactive client (FR-5, S1, S2) | Your account is not active. Contact the agency. |
| File rejected (FR-8) | *file name* was not uploaded: it is not a JPEG or PNG image / it is larger than 50 MB / the file is damaged. |
| Identical file (FR-10a) | *file name* is already in the library. (with a link to the existing image) |
| AI failure (FR-16a) | Metadata could not be generated: *reason*. Fill in the fields yourself or try again. |
| Image or batch locked (FR-18) | *name* is editing this image. You can edit it when they finish, or after 15 minutes without activity. |
| Failed save (FR-17) | Your change was not saved. Try again. |
| Cart line removed at checkout (FR-32) | *title* was removed from your cart: it is no longer available. |
| Price changed at checkout (FR-32) | The price of *title* has changed from *old* to *new* USD. Confirm to continue. |
- **NFR-8 Language.** The UI and generated metadata are English. All UI strings are in a translation file, and the output language is a provider input, so a Norwegian pack can be added.
- **NFR-9 Data model for later stages.** These facts hold from v1:
  - Licence types are records with a price, a currency and a licence text.
  - Every stored price has a currency code and excludes VAT.
  - Images and file versions are separate records, and an image has a media-type field.
  - AI providers implement one interface, with a provider-neutral, versioned prompt and schema owned by the app.
  - Users have a role field. GPS is stored as latitude and longitude. Batches have an owner. Top-level tables have a tenant ID, with no tenant-scoping layer.
  - A later client map search stays possible. Every image keeps its coordinates and place name whatever its batch setting, visibility or price, and whether a client may see an image's location is decided in one place in the access module (NFR-2a). In v1 that answer is always no, and client copies stay free of location data even after a map arrives (FR-36).
- **NFR-10 Integrity.** A stored original's hash never changes after upload, which a test verifies. A failure during checkout or file generation leaves no partial licence and no partial file served.

## Success Criteria

Checked by automated tests or by following the README, in mock mode with the seed data. An SC that tests a bonus FR applies only if that FR is built.

- **SC-1 Access matrix.** Tests cover every row of the access table (A1–A13) and every edge rule (S1–S15; S11–S14 only if FR-25 is built), through the same routes users hit. Client A never sees an image restricted to client B. *(FR-5, FR-6, FR-21–FR-26, NFR-2a)*
- **SC-2 Duplicates.** A byte-identical upload is rejected with a link to the existing image. A different file with the same filename gets the side-by-side choice. *(FR-10a, FR-10b)*
- **SC-3 End-to-end flow.** Following the README, without an API key: staff batch-upload, metadata is generated, staff set visibility and price and publish, a client finds an image and checks it out (through the cart, or its fallback), and the licence appears in the transaction log. *(F2–F5, FR-41, NFR-1)*
- **SC-4 Self-serve.** A client logs in, finds an image by keyword, downloads an own image, and buys a paid one, with no action from staff. *(FR-28–FR-34)*
- **SC-5 Licence records.** Each licence records everything FR-23 lists. It appears in the client's history and in the transaction log, which can show paid licences only. *(FR-23, FR-33, FR-41)*
- **SC-6 No location data out.** Every file served to a client, in JPEG and PNG, passes the location checklist in the [metadata research](../../research/technical-metadata-libraries-2026-10-28/research.md), section C. A contact's pages and search reveal no GPS position or place name, while staff still see both. *(FR-13, FR-28, FR-30, FR-34–FR-36, NFR-9)*
- **SC-7 AI failure doesn't block.** With the mock set to fail, uploads succeed, the fields can be filled in by hand, and other images in a batch continue. Retrying leaves staff-edited fields alone. *(FR-16a, FR-16b)*
- **SC-8 Action log.** Every action listed in FR-42a is recorded with the user and time, and the log can be read per user *(FR-42a, FR-42b)*
- **SC-9 Search.** A fixed set of searches, at least one per keyword category, runs against the sample images and their fixture metadata and returns the expected images. *(FR-27, FR-29, NFR-1)*
- **SC-10 Concurrent staff.** With both seeded staff users: a second user cannot edit a locked image or batch, sees who holds the lock, and can take over after it expires. *(FR-18)*
- **SC-11 Bad input.** The edge files (corrupt, renamed, oversized), invalid values and double submissions give NFR-7's messages or no effect, never a crash. Publishing with missing metadata warns, then succeeds, and the page still has an alt attribute. A batch published while one image is generating publishes the rest. *(FR-8, FR-17, FR-19a, FR-19b, FR-30, FR-32, NFR-5a, NFR-7)*
- **SC-12 Administration and dashboard.** UJ-4 runs as written, including both edge cases. An invalid org number is refused. The client card, dashboard and activity list match FR-7, FR-38a and FR-38b. A licence change leaves existing licences unchanged, a saved API key is masked and never logged, a discarded draft can be uploaded again, and a ZIP gets distinct names. *(FR-1–FR-5, FR-7, FR-20, FR-37, FR-38a, FR-38b, FR-39, FR-40)*
- **SC-13 AI input and output.** A recording mock shows that the image sent has no embedded metadata, and that with place names off the text has no location data. Embedded text is replaced by AI text, or kept when the mock fails. Mock output with 20 keywords, duplicates and capitals is stored as at most 15 unique lower-case keywords plus the shared ones, with provider, model and prompt version. Batch settings reach every image. *(FR-9, FR-11, FR-12, FR-14)*
- **SC-14 Background processing.** With a slow mock, states update without a reload, leaving the page does not stop generation, and after a restart mid-batch every image ends as ready or failed. *(FR-15)*
- **SC-15 Cart.** A contact's cart keeps one line per image, survives logging out, is not shared with other contacts, and refuses free or own images (S7). *(FR-31)*
- **SC-16 Metadata in files.** A downloaded copy carries the current title, description, alt text and keywords in XMP, and in IIM and EXIF where the format supports them. A title of 40 "æ" (80 bytes) is written in full to XMP and as 32 "æ" to IIM, as valid UTF-8. A 70-byte keyword is in XMP and not in IIM. *(FR-34)*

**Counter-metrics (do not optimise).** These stop the wrong thing from looking like progress:

- **SC-C1 The share of AI metadata published unedited.** Staff correcting the AI is the design, so a push to raise this share would hide errors.
- **SC-C2 The number of tests or FRs finished.** SC-1 and SC-3 passing matters more than a higher count of finished features.

## Rollout Gate

Nothing here is built for v1. Each item must be met, or explicitly accepted by the agency's management, before real images or client data enter the system. The full items, with the legal detail and sources, are in [rollout-gate.md](rollout-gate.md). The parts that shape v1 are already in NFR-3 (privacy) and NFR-9 (data model).

| ID | Item | Owner |
|---|---|---|
| RG-1 | Hosting over HTTPS, first staff user, login delay | Marthe; the agency chooses the host |
| RG-2 | Backups with a tested restore | Marthe |
| RG-3 | Data protection basis, agreements and transfers | Agency management, with a legal reviewer |
| RG-4 | Erasure of images and personal data | Marthe builds it; the agency sets retention |
| RG-5 | People in images and consent | Agency, with a legal reviewer |
| RG-6 | Rights and licence terms | Agency, with a legal reviewer |
| RG-7 | Billing, currency and VAT | Marthe, with the agency's accounting |
| RG-8 | Norwegian UI and AI metadata | Marthe; the agency accepts the AI text |
| RG-9 | Accessibility record and the known exception | Marthe; management accepts the exception |
| RG-10 | Scale, storage and bulk import | Marthe |
| RG-11 | File types in real use | The agency confirms; Marthe builds |
| RG-12 | Email for setup links and resets | Marthe |
| RG-13 | Operations and breach response | A named role at the agency |
| RG-14 | Baseline measurements of the benefit | Agency |
| RG-15 | Market scope (EU clients) | Agency management |
| RG-16 | AI governance and pending law | A named owner at the agency |

## Trade-offs

| Chosen | What v1 gives up | Why |
|---|---|---|
| Cart and checkout (cart is rank 5) | The time a one-image "buy" button would save | Without it, a client licensing a set repeats the flow per image (D-022); checkout on one image is the fallback |
| One editor at a time, if FR-18 (bonus) is built | The simplicity of last-write-wins | Silent overwrites lose work on shared drafts |
| No payment or invoicing | Revenue handling inside the app | Licences are a log that billing reads later (RG-7) |
| Place names allowed in AI text by default | Absolute location privacy | Improves search; staff turn it off for sensitive shoots |
| Publishing with missing metadata, with a warning | A guarantee that every published image has alt text and can be found by search | Staff decide; the warning shows the cost, and pages fall back to a title or label. These images are NFR-5a's known exception, which management accepts in RG-9 |

## Out of Scope for v1

- **Buying:** payment, PDF invoices, Tripletex, one-click purchase, refunds, and more licence types and currencies (the data model allows them).
- **Accounts:** email sending, two-factor login, a client-admin role, contacts in several clients, "view as client", and self-service password change or reset (staff issue a setup link).
- **Library:** collections, private batches, a public library without login, file types other than JPEG and PNG, near-duplicate detection, and map view and client map search (NFR-9).
- **AI:** per-image or per-field AI choice, and regenerating AI metadata for an image that didn't fail.
- **Operations and look:** Norwegian UI, backups, branding, permanent deletion of anything except never-published drafts (RG-4), and everything in the Rollout Gate.

## Open Questions

1. **Where the cut line falls.** The ranking and the budget are set (Release Stages), but the estimates are rough. The line is drawn at the 2026-11-30 checkpoint. Owner: Marthe; revisit at the checkpoint.
2. **Freeze date.** After it, only fixes, the README test and the reflection report. Set at the 2026-11-30 checkpoint, from the hours left. Owner: Marthe; revisit at the checkpoint.
3. **AI quality with the final prompt.** Prompt v3 (English, plus FR-12's people rule) has not been piloted. It needs a short check, including the pilot's images of people, when the Claude provider is built. Owner: Marthe; revisit at that story.
4. **Client map search.** Which images appear on the map, how exact a position clients see, and whether clients also search by place name. D-011's reason for hiding location still applies, for example where a portrait was taken. Owner: Marthe; revisit when the map is planned.

