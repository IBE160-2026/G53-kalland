# Addendum: CRM-DAM PRD (2026-11-18)

Depth that belongs downstream (architecture, UX) or supports the PRD without fitting in it. The [brief's addendum](../../briefs/brief-g53-kalland-2026-09-11/addendum.md) still holds for the access-model data shape, the client model and the Tripletex notes.

## What changed from the PRD of 2026-11-04

This run answers the [teacher's feedback](../prd-g53-kalland-2026-11-04/tilbakemelding-prd.en.md) of 2026-11-12. The changes from the 2026-10-28 PRD, and the old-to-new ID table for that run, are in the [2026-11-04 addendum](../prd-g53-kalland-2026-11-04/addendum.md).

| Feedback point | Change | Where |
|---|---|---|
| 4.1 No order among [v1] FRs | A minimum usable v1 and a ranked table with hours and fallbacks; about 130 hours to the deadline; the 2026-11-22 checkpoint is replaced | Release Stages, Open Question 1 |
| 4.2 The Rollout Gate dominates | The gate moves to [rollout-gate.md](rollout-gate.md); the PRD keeps one line per item with an owner | Rollout Gate |
| 4.3 FRs don't point to journeys; no login journey | Every FR says which UJ it realizes, or that it is an admin capability; new UJ-4, onboarding and first login | User Journeys, all FRs |
| 4.4 Thin consequences | Testable consequences for FR-7, FR-15, FR-31 and FR-38a; numbers for NFR-4; NFR-7's messages as a table | FR-7, FR-15, FR-31, FR-38a, NFR-4, NFR-7 |
| 4.5 Compound tags; assumptions hidden | FRs with two tags are split into a and b items; Document Purpose links to the assumptions below, now AS-1 to AS-30 | Release Stages, FR-10, FR-16, FR-19, FR-38, FR-42, NFR-2, NFR-5 |
| Rubric review: [v1] covered both planned and bonus FRs | Tags are now [spine], [planned], [bonus] and [stretch]; [v1] and [cut-first] are gone | Release Stages, all FRs |
| 5 Counter-metrics without IDs | SC-C1 and SC-C2 | Success Criteria |
| 6 Supported systems | The app and its tests run in Docker; NFR-1 states the supported systems | NFR-1, Metadata contract |
| 6 IIM truncation | Settled: shorten IIM at a whole word within the byte limit; XMP keeps the full value | FR-34, SC-16, Metadata contract |
| Own review: FRs with no test | New SC-13 to SC-16, so every FR is covered by at least one SC | Success Criteria |
| Rubric review of this draft | No cut order inside the spine: a thin first slice and a reduced spine. FR-34 contradicted SC-16 (whole word against one long word): fixed. Journeys described bonus FRs as the main path: a note under UJ-2 and UJ-3. SCs on bonus FRs apply only if built. Length cut from 9,698 to about 8,750 words by moving detail here and to the gate | Release Stages, FR-34, UJ-2, UJ-3, Success Criteria |

**Split IDs.** FR-10 → FR-10a (identical files) and FR-10b (matching filenames). FR-16 → FR-16a (AI failure) and FR-16b (retry). FR-19 → FR-19a (draft and publish) and FR-19b (publishing a batch). FR-38 → FR-38a (dashboard) and FR-38b (activity list). FR-42 → FR-42a (action log) and FR-42b (its per-user view). NFR-2 → NFR-2a (security) and NFR-2b (login delay). NFR-5 → NFR-5a (accessibility) and NFR-5b (WCAG 2.2). All other IDs are unchanged.

## Changes from the UX design (2026-11-18)

| Change | Why | Where |
|---|---|---|
| Library images are edited with Edit → Save changes, with a prompt on unsaved changes; upload drafts keep autosave | The user wants an extra step before changing an image that may be published, and no silent saves | FR-17, FR-18, [UX spines](../../ux-designs/ux-g53-kalland-2026-11-18/EXPERIENCE.md) |

## Changes from the architecture (2026-11-23)

| Change | Why | Where |
|---|---|---|
| Client copies also keep the EXIF orientation tag | Client copies keep the original pixels, so without the tag portrait camera photos arrive sideways. Orientation is not location data | FR-35, [architecture spine](../../architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md) AD-16 |

## Hours budget

Set on 2026-11-18. The user has about 130 hours left until the final deadline, 2026-12-15, for everything. The split below is the agent's estimate, accepted by the user. The per-FR estimates are in the PRD's priority table.

| Use | Hours | Basis |
|---|---|---|
| Rest of planning: this PRD, UX, architecture, epics, sprint planning, issues | ~13 | Project plan |
| Delivery: freeze, README test from a fresh clone, `/grading-check`, retrospective | ~7 | Project plan |
| Reflection report | ~10 | Agent's guess |
| Buffer for bugs and surprises (10 %) | ~13 | |
| **Build** | **~87** | Spine about 75 h, ranks 1–5 about 10.5 h |

**How the ranking was set.** The agent proposed an order by four questions, in this order: does the FR complete a journey the examiner walks; does it strengthen what is graded hardest (access-rule tests, AI governance); is it cheap; does it only matter in real use (several staff at once, real keys, real data). The user accepted the order, but moved the planned cut line up from after rank 6 to after rank 5, so FR-25 Revoke became a bonus. The 11-04 fallback for FR-18, "last save wins, with a warning that someone else is editing", was changed to "last save wins", because detecting another editor is half the lock feature.

## Details confirmed in review

These were inferred while drafting and confirmed by the user on 2026-11-04. The draft and the memlog call them A1–A22; they were renumbered because the access table also uses A1–A13.

- **AS-1** (Release Stages): the 2026-11-22 checkpoint, the end of week 47. Replaced on 2026-11-18 by the user's 2026-11-30 checkpoint.
- **AS-2** (Glossary): a preview is at most 800 px on its long edge.
- **AS-3** (FR-3): staff accounts are managed in the app the same way as contacts, since locks and the account-manager field need several staff.
- **AS-4** (FR-4, FR-5, NFR-2b): passwords of at least 12 characters, sessions ending after 8 hours idle, and a login delay after 10 failures in 15 minutes.
- **AS-5** (FR-9): new uploads default to internal-only (from the brainstorm) and free, with place names on.
- **AS-6** (FR-10b): one answer can be applied to all open filename matches in a batch.
- **AS-7** (FR-11): embedded text fills the fields, AI replaces it, and a failed AI call leaves it in place. This narrows "fields are left empty" to images with no embedded text.
- **AS-8** (FR-13, FR-14): editing coordinates does not change the place name, and the 15-keyword limit covers generated keywords only.
- **AS-9** (FR-15): generation survives leaving the page and restarts, while browser uploads need the page open.
- **AS-10** (FR-17): camera data is read-only; the old "every field" wording is narrowed.
- **AS-11** (FR-18): locks expire after 15 minutes without activity, and another user can then take over.
- **AS-12** (FR-19a): published images never return to draft. Corrected by the user: missing metadata warns and never blocks publishing. Added after that correction and also confirmed: an image cannot be published while it is uploading, queued or generating (FR-19a), and retry works on drafts only (FR-16b).
- **AS-13** (FR-20, FR-26): never-published drafts can be permanently discarded, and archived images can be restored.
- **AS-14** (FR-23): stored prices exclude VAT (from the brainstorm).
- **AS-15** (FR-23, FR-32): checkout requires accepting the licence terms, and a first free download accepts them by a stated action.
- **AS-16** (FR-25): revoking on a public image doesn't block that client; staff change the visibility or archive it.
- **AS-17** (FR-28): in v1, client search does not match the place name record. The user added that a later version adds map search (NFR-9).
- **AS-18** (FR-29): all search terms must match; results come newest first, in pages.
- **AS-19** (FR-31): each contact has their own cart, kept between sessions.
- **AS-20** (FR-35): embedded copyright, creator and credit stay on client copies, and serial numbers and owner names go.
- **AS-21** (FR-42a): the action log also covers downloads, client and user changes, setup links, and settings.
- **AS-22** (NFR-5a): 360 px as the narrowest supported width.

Confirmed by the user on 2026-11-18, in this run:

- **AS-23** (FR-15): a state change shows within 10 seconds without a reload.
- **AS-24** (FR-19a): the spine publishes single images; batch publishing is FR-19b.
- **AS-25** (FR-31): adding an image already in the cart keeps one line.
- **AS-26** (NFR-1): the 20 minutes include the first image build; CI builds and tests on x86 Linux.
- **AS-27** (NFR-4): a 30 s provider timeout, and 15 minutes for a batch of 100.
- **AS-28** (NFR-7): the message wording. The two UJ-4 messages are the user's, with "the agency" instead of "admin", and the wrong-password message names both email and password, so FR-5 still reveals no accounts.
- **AS-29** (PRD Rollout Gate): the owner of each RG item.
- **AS-30** (Release Stages): the reduced spine, used only if the checkpoint fails, and the thin first slice.

## Legal research (2026-11-04)

The [legal research report](../../research/domain-ai-images-privacy-accessibility-legal-2026-11-04/research.md) replaces the rollout research table that stood here. It holds the findings, sources, confidence levels and unresolved questions behind NFR-3, NFR-5a and the [Rollout Gate](rollout-gate.md). It is not legal advice.

### What it changed in the PRD

| Source | Change | Where |
|---|---|---|
| V-1 | Prompt rule against stating or inferring sensitive attributes or identity; prompt version becomes v3 | FR-12, FR-14, Open Question 3 |
| V-2, D-024 | WCAG 2.0 stated as the legal minimum and WCAG 2.1 as the own target; fallbacks stated as a known exception | NFR-5a, Trade-offs |
| Report, PRD edits | Real images also wait for the photographers' rights | NFR-3 |
| Report, rollout gate | Tightened items | RG-3, RG-4, RG-5, RG-6, RG-9 |
| Report, rollout gate | New items | RG-15, RG-16 |

### Where the update departs from the report

Each was the user's decision on 2026-11-04.

- **V-1, names.** The report says the model must not identify anyone. The PRD limits this to working out who someone is from their appearance. Names written in the image or given in the metadata stay usable, as in prompt v2, so staff can search on them.
- **RG-4, retention against anonymising.** The earlier text anonymised licence and accounting records at once, which can't be squared with keeping invoices in their original format. Required records now stay unchanged for their period and are anonymised afterwards.
- **RG-9, D-024.** The report's written question to Uutilsynet, and its follow-up decisions on FR-19a and "Untitled image", are dropped. FR-19a stays warn and publish. Management accepts the exception instead, so the legal cost is a stated choice at rollout.
- **Checks D-024 defers.** Anthropic's agreement and retention (RG-3), the legal reviewer's questions (RG-5, RG-6) and the re-check of pending law (RG-16) are out of scope for v1 and stay in the gate, where management can still accept skipping them.

## Rollout sizing (behind RG-10)

| Measure | 5,000 images | 50,000 images | Basis |
|---|---|---|---|
| Storage at the 50 MB limit | 250 GB | 2.5 TB | FR-8 |
| Storage at 15–40 MB per file | 75–200 GB | 0.75–2 TB | Upload size note below |
| AI cost | About $3.50 | About $35 | $0.0007 per image, pilot |
| AI time, one at a time | About 8 hours | About 82 hours | 5.9 s median, pilot |
| Batches of 100 | 50 | 500 | UJ-2 |

The last row is why RG-10 asks for a bulk import. Concurrent calls or the Batch API would shorten the AI time; the research lists a 50 % Batch discount, not tested in the pilot.

## Data model accommodations

| Later feature | v1 accommodation |
|---|---|
| More licence types, each with its own price (e.g. Standard commercial 5 USD, Extended commercial 8 USD) | Licence types are records with a price and a licence text, not a constant; an image is only free or paid |
| Licence types included for free for a given client | Room for a client–licence-type relation; not built in v1 |
| Display currencies chosen by the agency and each client | Every price and licence stores a currency code (USD in v1); licences store the price in the base currency |
| Private batches | Batches are records with an owner, even though all drafts are shared in v1 |
| Staff marking a client as owner of a public image (from the UX design) | A licence records how it came about (purchase, free download, or granted by staff) and may have no contact, so a staff-granted 0 USD licence can be added later without a migration; the access table already treats licence holders as owners |
| Everything else in the brief addendum's accommodation table, such as the asset table not being named "image" | Still holds |
| Client map search | Coordinates and place names stay on every image, and the client location rule sits in one place (NFR-9). A later version adds its own control for which images show on the map, so nothing becomes visible just because the map shipped. Client copies stay free of location data even then, as the user confirmed on 2026-11-04 (D-011). |

## AI provider (from the Haiku pilot)

- v1 real provider: Claude Haiku 5.5 at effort `medium`, structured JSON output. Piloted with prompt v2: median 5.9 s, about $0.0007 per image. See [pilot results](../../research/pilot-haiku-metadata-2026-10-28/results.md).
- v1 uses prompt v3: prompt v2 plus the people rule from FR-12. Prompt v3 has not been piloted (Open Question 3).
- The pilot validated Norwegian output; v1 generates English. Norwegian must be re-tested when the Norwegian pack arrives, since it matters most to the agency. The user's 1–3 scores in the pilot results are still blank (RG-8).
- The app owns the prompt and schema, post-processes every provider's output and passes a place name it derived itself. Stage 2: Gemini Flash and a local model through the same interface.
- When the batch setting is off, the provider receives no place name. It may still name a place it can see in the image, such as a sign or a landmark; the pilot shows it does this. Staff review covers that case.

## Metadata contract (from the metadata-library research)

Title → `dc:title` / IIM 2:05; description → `dc:description` / IIM 2:120 / EXIF `ImageDescription`; alt text → `Iptc4xmpCore:AltTextAccessibility`; keywords → `dc:subject` / IIM 2:25 with UTF-8. Client copies are rebuilt from a whitelist and checked with the location checklist in the [research](../../research/technical-metadata-libraries-2026-10-28/research.md), section C.

IIM limits are in bytes (title 64, description 2000, each keyword 64), and æøå count double. XMP always holds the full value. The research's version claims passed their re-check date on 2026-11-01, so re-run the install checks at the architecture step.

**How IIM values are shortened** (settled by the user on 2026-11-18, feedback point 6):

| Option | Verdict |
|---|---|
| A. XMP and EXIF only, no IIM | Fallback if time runs short. No truncation, but tools that read only IIM show nothing |
| **B. Write IIM, shortened safely** | **Chosen.** The app shortens title and description to the last whole word within the byte limit, never inside a character. A keyword over 64 bytes is left out of IIM only. IIM is declared UTF-8 (`CodedCharacterSet`, record 1:90), or readers fall back to cp1252. XMP and EXIF hold the full value. One small function, tested with æøå at the limit (SC-16) |
| C. Cap the agency fields at the IIM byte limits | Rejected. A limit counted in bytes confuses staff (32 or 64 characters, depending on the letters), and AI output would have to obey it |

The app shortens the values itself before writing, rather than relying on the metadata library's own truncation. A tool that reads IIM before XMP shows the shorter value; the full value is always in XMP.

**Supported systems** (the user, 2026-11-18). The app and its tests run in Docker, and the app is built on macOS. That answers the research's open Windows question at the system level: Windows runs the Linux containers through Docker Desktop and WSL2, so ExifTool is installed in the image and never on the host. It also removes the reason the research preferred `exiftool-vendored` (no hand install on the examiner's machine), so the architecture can choose the library on its merits. Two risks remain for the architecture: Windows line endings in shell scripts (`.gitattributes` with `eol=lf`), and differences between Apple Silicon and x86 images, which a CI build on x86 Linux catches. Docker is a technology choice and gets its own D-entry.

## Upload size

50 MB covers full-frame camera JPEGs at the highest quality (about 15–40 MB at 45–61 MP). Full-resolution PNGs above 50 MB are rejected in v1. The AI provider receives a copy resized to about 1568 px.

## Settled for the architecture

- **Metadata is generated in the background** after upload (FR-15). This closes the open question in the pilot results and D-021. If FR-15 (rank 10, bonus) is not built, metadata is generated one image at a time while the upload page waits.
- **Client copies are rebuilt from a whitelist** (FR-35): everything not listed, including all location fields and thumbnails, is left out. The same pipeline produces previews and the image-page view.
- **Edit locks on images and batches** (FR-18): editing an image locks that image and its batch's settings; editing a batch locks the batch and every image in it. One user at a time either way, with expiry. FR-18 is rank 15, a bonus; if it is not built, the last save wins.
- **One access module** decides everything a client may do (NFR-2a), as the brainstorm proposed: can see, can download, can buy.
- **Place names come from an offline lookup** (FR-13). The data set and how its licence is credited are architecture decisions.
- **One common stack and local file storage**, as the teacher's feedback advises. RG-1 revisits storage for rollout.

## Seed data and mock

Moved from NFR-1 on 2026-11-18. Two staff users, three contacts in two clients, and one inactive client with one contact. About 20–40 committed, freely licensed sample images with a source list, each about 1600 px and under about 500 KB, covering every access-table row and including a JPEG with GPS and city fields, a JPEG with an embedded thumbnail, and a PNG with location data. Oversized test files are generated when the tests run, not committed. For an image without fixture metadata, the mock returns fixed, clearly labelled placeholder metadata.

**Supported systems in detail:** Docker Desktop on macOS or Windows (with WSL2), or Docker Engine on Linux, with Compose v2. The README states the versions used. Running the app and its tests needs no network access (FR-13).

## Later features that don't block rollout

Moved from the PRD's Release Stages: the brief's other stage 2 features (near-duplicates, branding, map view, more AI providers, more licence types, a client-admin role and "view as client") and its later list stay planned.

## Seed data names

From the brainstorm: Fjordkaffe AS with two contacts, to show shared licences; Nordlys Sykkel AS with one contact; Gammel Kunde AS, inactive.
