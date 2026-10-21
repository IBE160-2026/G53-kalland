---
title: "Project Plan: CRM-DAM"
status: draft
created: 2026-10-21
updated: 2026-10-21
---

# Project Plan: CRM-DAM

Phase-by-phase plan from the finished [product brief](briefs/brief-g53-kalland-2026-09-11/brief.md) to the v1 delivery, following the BMad workflow. Estimates are rough focused hours, including the end-of-session routine.

**Assumptions:** deadline mid-December 2026 (exact date to be confirmed), solo build, about 7–8 weeks from 2026-10-21.

## Phase 1 – Planning (≈ 1.5 weeks, 14–20 h)

| # | Step (BMad skill) | Output | Estimate |
|---|---|---|---|
| 1 | PRD (`bmad-prd`) | Functional and non-functional requirements, access rules, open questions resolved | 4–5 h (2 sessions) |
| 2 | UX (`bmad-ux`) | `DESIGN.md` and `EXPERIENCE.md`: flows, empty states, error messages, accessibility | 3–4 h |
| 3 | Architecture (`bmad-architecture`) | Stack, data model (image identity vs. file versions, `tenant_id`), AI provider interface, folder structure | 3–4 h |
| 4 | Epics and stories (`bmad-create-epics-and-stories`) | Stories with testable acceptance criteria | 2–3 h |
| 5 | Sprint planning (`bmad-sprint-planning`) | Readiness check and sprint status file | 1 h |
| 6 | Stories → GitHub issues and milestones | Issues that PRs close with `Closes #n` | 1 h |

## Phase 2 – Build (≈ 4–5 weeks, 45–65 h)

| Epic (likely split) | Estimate |
|---|---|
| Skeleton: project setup, linter, test runner, database, login, seeded users, README v0 | 6–10 h |
| Upload: metadata extraction, mock and Claude CLI providers, hash duplicate check, editing | 12–16 h |
| Access model and client portal: visibility × price, search, previews, access-matrix tests | 10–14 h |
| Purchases and downloads: purchase log, metadata written on export, GPS stripped | 8–12 h |
| Polish: accessibility, responsive layout, error and empty states, README, clean-machine test | 6–8 h |
| Stretch: versioning (only once everything above is done) | 4–6 h |

Per story: branch → `bmad-build` → code review with PR comments → PR with `Closes #n` → `/wrap-up`. Plan changes go through `bmad-correct-course`, so the PRD stays in step with the code.

## Phase 3 – Delivery (≈ 1 week, 6–10 h)

- Code freeze, README tested from a fresh clone, `/grading-check`.
- Retrospective (`bmad-retrospective`).
- Start the part 2 reflection report (30 % of the final grade).

## Calendar

| Week | Focus |
|---|---|
| 43 | PRD and preparation work |
| 44 | UX, sketches, architecture |
| 45 | Epics and stories, sprint planning, start the skeleton |
| 46–49 | Build |
| 50 | Polish, freeze, delivery |

The schedule is tight. Keeping planning to about 1.5 weeks and doing the preparation work in parallel protects the build time.

## Preparation work before building

### 1. Sample images (3–5 h)

- Check licenses. The Unsplash and Pexels licenses forbid selling photos unaltered and building a competing service, which is what a stock storefront does. Use CC0 or public-domain images (Wikimedia Commons, Openverse filtered to CC0) or, better, your own photos.
- Your own phone photos keep EXIF and GPS data, which the metadata and "no GPS on download" tests need. Stock sites often strip EXIF.
- Commit a small set: about 20–40 images, resized to about 1600 px and under about 500 KB each. The ~500-image scale test can be generated later and kept out of git.
- Collect edge cases on purpose: a byte-identical duplicate pair, two different files with the same filename, an image with existing IPTC keywords, a corrupt file, a non-image renamed to `.jpg`, a very large file, possibly HEIC.
- Keep a list of each image's source, license and author for the README.

### 2. Dummy content (2–3 h)

- About 10 fictional client companies with fake contact details. Never real agency clients.
- A table of which images are restricted to which clients, and at which prices, covering every visibility × price combination, including client A vs. client B.
- Credentials for the seeded users: one admin and two clients.
- This becomes seed data once the build starts.

### 3. Questions for the agency (1–2 h)

Answering these before the PRD session speeds it up. Refer to people by role, not name.

- If staff change an image's visibility after a client bought it, does the client keep access? (Open question in the brief.)
- One login per client company, or several users?
- Currency, typical price levels, price set per image?
- Which file types and maximum sizes does the agency actually use (RAW, TIFF, PSD, HEIC)?
- Which words do staff actually search with?
- Can a purchased image be deleted?

### 4. Sketches and wireframes (2–4 h)

The teacher's feedback asks for the upload flow and client portal to be sketched early. Paper (photographed), Excalidraw or Figma all work. Cover: upload → review and edit AI metadata, the duplicate warning, the client dashboard with search, a paid preview and buying, and purchase history for the client and the admin. These are evidence for grading criterion 4 and input to `bmad-ux`.

### 5. Manual test plan draft (1–2 h)

Write the access matrix (visibility × price × client on list or not × bought or not) as test cases with expected results. It becomes the basis for the automated tests and is evidence for grading criterion 3.

### 6. Tools and accounts (1–2 h)

- Check whether the Claude Code CLI can describe an image non-interactively (`claude -p` on a single image). Save the prompt and output as research. This is the biggest technical unknown and shapes the CLI provider in the architecture.
- Install `exiftool` to inspect the metadata of the sample images.
- Note the installed Node or Python versions as input to the stack decision.
- Arrange a clean machine for the final README test: a friend's laptop, a new macOS user account or a VM.
- An Excalidraw or Figma account for sketches.

### 7. Ongoing habits

- A weekly `/grading-check` in the calendar.
- A short reflection journal: what the AI got wrong and what was corrected. Raw material for part 2 and for grading criterion 1.

## Open items

- Exact deadline date.
- Available hours per week.
