# Input reconciliation: CRM-DAM PRD (2026-11-04)

Each input read in full against `prd.md` and `addendum.md`, after the user's review of the draft. The research reports were read through their findings and verdict sections. The author of the draft did this pass inline, so it is not an independent check.

Outcomes: **fixed** means changed in this run. **Noted** means a known, accepted difference, or something handed to a later step.

## Brief and brief addendum

| Gap | Outcome |
|---|---|
| The brief's stage 2 list has features the Rollout Gate does not cover (near-duplicates, branding, map view, more AI providers, more licence types, client-admin role, "view as client"), and its later list (video, visual search, more roles, further modules, SaaS) is not mentioned. A reader could take them as dropped. | Fixed: Release Stages says they stay planned and do not block rollout |
| The addendum's accommodation "asset table not named image" is not in NFR-9. | Fixed: the new addendum says the brief's table still holds |
| The two-year vision (brand portals, proposal generator, SaaS) is not in the PRD. | Noted: the brief still holds, and the PRD's Vision covers only this product's bet |

## Brainstorm intent

| Gap | Outcome |
|---|---|
| The licence row includes an image title snapshot; FR-23 dropped it. It matters more now that titles can change or be empty. | Fixed: FR-23 |
| A revoke records who and when; FR-25 did not say so. Revoke is available from the image page or the client card; FR-25 did not say so. | Fixed: FR-25 |
| The README lists the seed passwords; NFR-1 did not say so. | Fixed: NFR-1 |
| Seed names (Fjordkaffe AS, Nordlys Sykkel AS, Gammel Kunde AS) are not recorded. | Fixed: addendum |
| "Previews have all metadata stripped" differs from the PRD, where previews keep what FR-35 allows. The 2026-10-28 PRD already chose this. | Noted: PRD wins |
| Setup link: about 72 hours, against 7 days in the PRD. | Noted: addendum; D-023 records it |

## Teacher's feedback

| Gap | Outcome |
|---|---|
| "Narrow In" and "define a minimal version that can surely be finished". The spine and checkpoint answer this, but v1 grew again and the [v1] FRs have no order among themselves. | Open Question 1 now says so; see review finding H1 |
| "Stick to one common stack and local file storage." Not carried forward. | Fixed: addendum, for the architecture |
| "Sketch the upload flow and the client portal early." | Noted: belongs to `bmad-ux`, the next step |
| "AI-generated alt text is a good contribution to universal design." The user's decision lets images publish without it. | Noted: Trade-offs names the cost, and NFR-5 gives a fallback |

## Grading criteria

| Gap | Outcome |
|---|---|
| Criterion 7 warns about large binaries, while NFR-1 asked for committed sample images with no size bound. | Fixed: NFR-1 takes the project plan's limits |
| Criterion 3 asks for manual test plans where automated tests do not fit. NFR-4 and NFR-5 include manual checks with no written plan. | Noted: for the stories |
| Criterion 4 asks for a consistent visual style and evidence of design work, which the FR structure does not capture. | Noted: belongs to `bmad-ux` |

## PRD of 2026-10-28, with its addendum and memlog

No decision was lost. Every old FR maps to a new ID (addendum). Deliberate changes: the [spine] tag is narrower, and AI settings moved from [spine] to [v1] with a fallback. All memlog decisions on licence types, currency, versions, cart, ZIP, keyword categories and upload limit are present.

## Research and pilot

| Gap | Outcome |
|---|---|
| FR-12 lost the old PRD's statement that the provider receives the app's derived place name. | Fixed: FR-12 |
| The metadata research's biggest caveat, that Windows was not tested hands-on, was not carried forward. It matters for NFR-1's clean machine. | Fixed: addendum, for the architecture |
| Embedded alt text exists (`AltTextAccessibility`) and clients' tools read it, but FR-11 did not read it into the alt text field. | Fixed: FR-11 |
| The pilot's "Input to the architecture" (settings per provider, shared contract tests) is not repeated. | Noted: the addendum links to it |

## Project plan

| Gap | Outcome |
|---|---|
| Sample image limits (about 20–40 images, about 1600 px, under about 500 KB) were not in NFR-1. | Fixed: NFR-1 |
| "Available hours per week" is an open item that the hours question depends on. | Fixed: Open Question 1 |
| The plan is about a week behind its calendar, and its build epics predate D-022. Tools item 6 still mentions the CLI provider, which D-017 rejected. | Noted: update the plan at sprint planning |

## Decisions D-001 to D-022

| Gap | Outcome |
|---|---|
| D-022 says accessibility follows the public-sector rules; NFR-5 now makes it the project's own target. | D-023 must record this |
| D-011 and D-022 cover files. The new requirement for a later map search changes the wording about client pages, not files. | D-023 must record this |
