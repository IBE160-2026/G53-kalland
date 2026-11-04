# Addendum: CRM-DAM PRD (2026-11-04)

Depth that belongs downstream (architecture, UX) or supports the PRD without fitting in it. The [brief's addendum](../../briefs/brief-g53-kalland-2026-09-11/addendum.md) still holds for the access-model data shape, the client model and the Tripletex notes.

## What changed from the PRD of 2026-10-28

The product decisions carry over. This run re-checked them against every input, at higher rigor, and with the agency's rollout counted in the stakes.

**Decisions made by the user in this run:**

| Change | Where |
|---|---|
| The rollout is planned as a separate gate after v1; v1 stays on sample data (D-009 holds) | Release Stages, Rollout Gate |
| A batch setting decides whether the AI receives the place name, on by default | FR-9, FR-12 |
| The real library is expected to hold 5,000–50,000 images | RG-10 |
| Missing alt text or other metadata warns but never blocks publishing, correcting the draft's rule that a title and alt text were required | FR-19, FR-30, NFR-5, SC-11 |
| Clients search text and keywords only in v1, and a later version adds map search, so location data must stay available | FR-28, NFR-9, SC-6, Open Question 5 |

**Gaps closed, with the source that exposed each:**

| Gap in the old PRD | Source | New |
|---|---|---|
| No way to create staff accounts; one seeded staff user can't exercise the lock | Audit; FR-14 and NFR-1 of the old PRD | FR-3, NFR-1, SC-10 |
| Locks had no expiry, so a closed laptop blocked everyone | Audit | FR-18 |
| Several edge tests dropped, though D-018 says the PRD adopts them | D-018, brainstorm | Edge rules table, SC-1 |
| Client card dropped | Brainstorm | FR-7 |
| Last staff user could be deactivated; empty restricted list and upload default undefined | Brainstorm S4, S9 | FR-3, FR-9, FR-19 |
| "Original" meant both the stored file and the client's file, inviting a location leak | Audit | Glossary, FR-34–FR-36, access table |
| Location rule covered files only, not client pages or search | Audit against D-011 | FR-28, FR-30, SC-6 |
| PNG location removal not called out, though ExifTool warns it is incomplete | Metadata research, section C | FR-36, NFR-1, SC-6 |
| Which EXIF to keep was left open; copyright notices would have been lost | Metadata research, insights | FR-35 |
| Image page "larger" conflicted with a small paid preview | Audit | Glossary, FR-30 |
| Cart behaviour undefined when price or visibility changes, or on repeat submission | Audit; grading criterion 2 | FR-31, FR-32 |
| No client licence history FR, though SC-5 needed one | Audit | FR-33 |
| No publish rules, and no fallback for an image with no alt text | Audit; NFR-5 | FR-19, FR-30, NFR-5 |
| No precedence between embedded and AI text | Audit; brief | FR-11 |
| No retry after AI failure, and no failure mode or non-sample behaviour in the mock | Audit; examiner flow | FR-16, NFR-1, SC-7 |
| The [spine] tag was overloaded (locks and settings counted) and had no trigger for cutting | Teacher's feedback | Release Stages, re-tagged FRs |
| Accessibility rested on an unverified legal claim | Uutilsynet | NFR-5, RG-9 |
| ZIP name collisions, since FR-10 allows repeated filenames | Audit | FR-37 |

**One older difference made explicit:** the brainstorm had setup links expiring after about 72 hours, and the PRD session chose 7 days. It stays 7 days, and D-023 should record it, since D-022 did not.

## Old to new requirement IDs

| Old | New | | Old | New | | Old | New |
|---|---|---|---|---|---|---|---|
| FR-1 | FR-1, FR-2 | | FR-14 | FR-17, FR-18 | | FR-27 | FR-34 |
| FR-2 | FR-4 | | FR-15 | FR-19 | | FR-28 | FR-34 |
| FR-3 | FR-5 | | FR-16 | FR-21 | | FR-29 | FR-35 |
| FR-4 | FR-6 | | FR-17 | FR-22 | | FR-30 | FR-36 |
| FR-5 | FR-8 | | FR-18 | FR-23 | | FR-31 | FR-37 |
| FR-6 | FR-9 | | FR-19 | FR-24 | | FR-32 | FR-38 |
| FR-7 | FR-10 | | FR-20 | FR-25 | | FR-33 | FR-39 |
| FR-8 | FR-11 | | FR-21 | FR-26 | | FR-34 | FR-40 |
| FR-9 | FR-12 | | FR-22 | FR-27 | | FR-35 | FR-41 |
| FR-10 | FR-13 | | FR-23 | FR-28 | | FR-36 | FR-42 |
| FR-11 | FR-14 | | FR-24 | FR-30 | | FR-37 | FR-43 |
| FR-12 | FR-15 | | FR-25 | FR-31 | | | |
| FR-13 | FR-16 | | FR-26 | FR-32 | | | |

New with no old equivalent: FR-3, FR-7, FR-20, FR-29, FR-33.

## Details confirmed in review

These were inferred while drafting and confirmed by the user on 2026-11-04. The draft and the memlog call them A1–A22; they were renumbered because the access table also uses A1–A13.

- **AS-1** (Release Stages): the 2026-11-22 checkpoint, the end of week 47.
- **AS-2** (Glossary): a preview is at most 800 px on its long edge.
- **AS-3** (FR-3): staff accounts are managed in the app the same way as contacts, since locks and the account-manager field need several staff.
- **AS-4** (FR-4, FR-5, NFR-2): passwords of at least 12 characters, sessions ending after 8 hours idle, and a login delay after 10 failures in 15 minutes.
- **AS-5** (FR-9): new uploads default to internal-only (from the brainstorm) and free, with place names on.
- **AS-6** (FR-10): one answer can be applied to all open filename matches in a batch.
- **AS-7** (FR-11): embedded text fills the fields, AI replaces it, and a failed AI call leaves it in place. This narrows "fields are left empty" to images with no embedded text.
- **AS-8** (FR-13, FR-14): editing coordinates does not change the place name, and the 15-keyword limit covers generated keywords only.
- **AS-9** (FR-15): generation survives leaving the page and restarts, while browser uploads need the page open.
- **AS-10** (FR-17): camera data is read-only; the old "every field" wording is narrowed.
- **AS-11** (FR-18): locks expire after 15 minutes without activity, and another user can then take over.
- **AS-12** (FR-19): published images never return to draft. Corrected by the user: missing metadata warns and never blocks publishing. Added after that correction and also confirmed: an image cannot be published while it is uploading, queued or generating (FR-19), and retry works on drafts only (FR-16).
- **AS-13** (FR-20, FR-26): never-published drafts can be permanently discarded, and archived images can be restored.
- **AS-14** (FR-23): stored prices exclude VAT (from the brainstorm).
- **AS-15** (FR-23, FR-32): checkout requires accepting the licence terms, and a first free download accepts them by a stated action.
- **AS-16** (FR-25): revoking on a public image doesn't block that client; staff change the visibility or archive it.
- **AS-17** (FR-28): in v1, client search does not match the place name record. The user added that a later version adds map search (NFR-9).
- **AS-18** (FR-29): all search terms must match; results come newest first, in pages.
- **AS-19** (FR-31): each contact has their own cart, kept between sessions.
- **AS-20** (FR-35): embedded copyright, creator and credit stay on client copies, and serial numbers and owner names go.
- **AS-21** (FR-42): the action log also covers downloads, client and user changes, setup links, and settings.
- **AS-22** (NFR-5): 360 px as the narrowest supported width.

## Legal research (2026-11-04)

The [legal research report](../../research/domain-ai-images-privacy-accessibility-legal-2026-11-04/research.md) replaces the rollout research table that stood here. It holds the findings, sources, confidence levels and unresolved questions behind NFR-3, NFR-5 and the Rollout Gate. It is not legal advice.

### What it changed in the PRD

| Source | Change | Where |
|---|---|---|
| V-1 | Prompt rule against stating or inferring sensitive attributes or identity; prompt version becomes v3 | FR-12, FR-14, Open Question 3 |
| V-2, D-024 | WCAG 2.0 stated as the legal minimum and WCAG 2.1 as the own target; fallbacks stated as a known exception | NFR-5, Trade-offs |
| Report, PRD edits | Real images also wait for the photographers' rights | NFR-3 |
| Report, rollout gate | Tightened items | RG-3, RG-4, RG-5, RG-6, RG-9 |
| Report, rollout gate | New items | RG-15, RG-16 |

### Where the update departs from the report

Each was the user's decision on 2026-11-04.

- **V-1, names.** The report says the model must not identify anyone. The PRD limits this to working out who someone is from their appearance. Names written in the image or given in the metadata stay usable, as in prompt v2, so staff can search on them.
- **RG-4, retention against anonymising.** The earlier text anonymised licence and accounting records at once, which can't be squared with keeping invoices in their original format. Required records now stay unchanged for their period and are anonymised afterwards.
- **RG-9, D-024.** The report's written question to Uutilsynet, and its follow-up decisions on FR-19 and "Untitled image", are dropped. FR-19 stays warn and publish. Management accepts the exception instead, so the legal cost is a stated choice at rollout.
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

IIM limits are in bytes (title 64, description 2000, each keyword 64), and æøå count double. XMP always holds the full value. How to shorten IIM values is an architecture decision. The research's version claims passed their re-check date on 2026-11-01, so re-run the install checks at the architecture step. Windows was not tested hands-on, and NFR-1's clean machine may run it, so the architecture should test it or state the supported systems in the README.

## Upload size

50 MB covers full-frame camera JPEGs at the highest quality (about 15–40 MB at 45–61 MP). Full-resolution PNGs above 50 MB are rejected in v1. The AI provider receives a copy resized to about 1568 px.

## Settled for the architecture

- **Metadata is generated in the background** after upload (FR-15). This closes the open question in the pilot results and D-021.
- **Client copies are rebuilt from a whitelist** (FR-35): everything not listed, including all location fields and thumbnails, is left out. The same pipeline produces previews and the image-page view.
- **Edit locks on images and batches** (FR-18): editing an image locks that image and its batch's settings; editing a batch locks the batch and every image in it. One user at a time either way, with expiry.
- **One access module** decides everything a client may do (NFR-2), as the brainstorm proposed: can see, can download, can buy.
- **Place names come from an offline lookup** (FR-13). The data set and how its licence is credited are architecture decisions.
- **One common stack and local file storage**, as the teacher's feedback advises. RG-1 revisits storage for rollout.

## Seed data names

From the brainstorm: Fjordkaffe AS with two contacts, to show shared licences; Nordlys Sykkel AS with one contact; Gammel Kunde AS, inactive.
