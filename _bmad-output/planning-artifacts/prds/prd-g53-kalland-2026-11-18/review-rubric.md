# PRD Quality Review — PRD: CRM-DAM (2026-11-18)

Reviewed: `prd.md` (9,698 words), `addendum.md` (2,582), `rollout-gate.md` (1,095), against the bmad-prd quality rubric and the teacher's feedback of 2026-11-12 (`../prd-g53-kalland-2026-11-04/tilbakemelding-prd.en.md`). Reviewer: validator subagent, 2026-11-18.

## Overall verdict

The revision does what the teacher asked: there is now a minimum usable v1 (the spine), a ranked list with hours and a fallback per row, a separate Rollout Gate, UJ links on every FR, a login journey, and split IDs that each carry one tag; the access model and its tests remain the strongest part. What is at risk is the plan's edge cases: the spine (75 h of an 87 h build budget) has no descope order of its own, the journeys still narrate bonus features as the main path, and one of the new tests (SC-16) contradicts the rule it tests (FR-34). The PRD also grew by about 1,550 words, almost all in planning material and SC restatements, so the length goal needs deliberate cuts.

## Decision-readiness — adequate

The ranking is a real decision document. "Minimum usable v1 = the spine", the line "***Planned: about 10.5 h. Everything below is bonus.***" and the fallback column make cuts stated rather than implied, and the addendum's "How the ranking was set" records the four ordering questions and the user's override (moving the cut line above FR-25). The Trade-offs table names what is given up, and the Open Questions are genuinely open, each with an owner and a revisit point. The spine and planned rows add up (74.5 + 10.5 = 85 of 87 h), and the bonus rows total about 39 h, so the PRD honestly signals that most bonus work will not ship.

The weakness is in the checkpoint, the one mechanism that turns the ranking into action. Its "If it doesn't" branch says every cut-first FR takes its fallback and no planned or bonus FR is started, but the cut-first FRs are ranks 16–22, already far below the line, so that branch changes almost nothing. There is no order for cutting *inside* the spine, which has only about 1.5 h of slack plus the 13 h buffer. Separately, the checkpoint date assumes something the PRD never asks of the stories.

### Findings
- **[high]** No descope path inside the spine (§ Release Stages, "Checkpoint, 2026-11-30", "If it doesn't"; spine table) — Of the 27 spine FRs, only FR-32 ("Without the cart: checkout runs on one image") and FR-34 ("Fallback: XMP and EXIF only, no IIM") have a fallback. If the spine overruns by more than the buffer, the PRD does not say what goes next, and the "If it doesn't" branch only stops work that was never scheduled. This is the teacher's reflection question 2 ("If you had only half the hours…") left unanswered for the part that matters. *Fix:* add 3–5 ordered spine reductions with their cost to SCs, e.g. staff-search filters reduced to status and client (FR-27), licence history shown only in the transaction log (FR-33), FR-34's IIM fallback, and FR-26 restore deferred. Make the "If it doesn't" branch apply them.
- **[medium]** The checkpoint assumes a walking skeleton the PRD never requires (§ Release Stages, "Coding starts 2026-11-22. On the checkpoint date, check whether the spine runs end to end") — At about 4.5 h/day, 2026-11-22 to 11-30 is about 35–40 build hours against a 75 h spine. "Runs end to end (the SC-3 path, with checkout on one image)" is reachable only if the first stories build a thin vertical slice. "Built first, in the order the stories set" leaves that to chance. *Fix:* one sentence: "The first stories build the SC-3 path thinly end to end (one image, mock, single checkout); the rest of the spine deepens it."
- **[medium]** Decisions taken in this run have no D-entries yet (§ Release Stages v1 row: "The earlier target of 2026-12-05 (D-019) no longer applies"; addendum § Supported systems: "Docker is a technology choice and gets its own D-entry") — `docs/process/decisions.md` ends at D-025. The deadline change superseding D-019, Docker, IIM option B, and the ranking or cut line are all choices CLAUDE.md says need a D-xxx, and process counts 30 %. *Fix:* add the entries in `/wrap-up` and cite them in the PRD (v1 row, NFR-1, FR-34, Release Stages).
- **[medium]** The real Claude provider has no row in the budget (§ spine table: "Seed data, sample images and the mock provider"; NFR-4; Open Question 3; FR-39) — NFR-4 requires a manual timing run "with the Claude provider", and OQ3 checks prompt v3 "when the Claude provider is built". FR-39, which chooses between mock and Claude, is bonus rank 14. It is unclear whether the real provider is in the 17 h "Upload and metadata" row or not planned at all. For a course on programming with AI, this is the integration a grader will look for. *Fix:* name the Claude provider (env-var configured) in a spine row with its hours, or state that it is bonus and what NFR-4 and OQ3 do without it.

## Substance over theater — strong

No persona, vision or innovation theater. Two personas plus the examiner, each driving decisions: the examiner drives NFR-1 and the mock. The Vision names its bet ("one simple access model … without special cases") and admits AI metadata "is an expected baseline and not the differentiator". The NFRs have product-specific numbers (1 s at 500 images, 10 s median, 30 s timeout, 15 min per 100, 360 px, 12-character passwords, IIM byte limits). The new NFR-7 table gives messages word for word. The only furniture-like material is repetition, not invention.

### Findings
- **[low]** NFR-1 has become a setup manual (§ NFR-1, 299 words) — The supported-systems paragraph ("which means Docker Desktop on macOS or Windows (with WSL2) and Docker Engine on Linux…") and the seed-data inventory ("two staff users, three contacts in two clients, … about 1600 px and under about 500 KB") are build details, mostly repeated in the addendum. *Fix:* keep the testable core (20 minutes, no key, everything in containers, network only to build, mock fails on demand, samples cover A1–A13) and move the rest to the addendum.
- **[low]** Map search is explained six times (FR-28 "*Later: clients also search on a map*", FR-36 second bullet, NFR-9 last bullet, Trade-offs last row, Out of Scope "Library", Open Question 5) for a feature that is out of scope. *Fix:* keep NFR-9's bullet and OQ5; elsewhere cite NFR-9 or drop the line.

## Strategic coherence — strong

The thesis ("visibility × price plus a licence that lasts") drives the ranking: the access-matrix tests are in the spine (10.5 h), and the ranking questions put "what is graded hardest (access-rule tests, AI governance)" second. The spine is the teacher's minimal flow, and the cut line follows it, not ease of build. Counter-metrics now have IDs (SC-C1, SC-C2), and SC-C2 ("SC-1 and SC-3 passing matters more than a higher count of finished features") ties the metrics back to the thesis. The MVP kind is clear: a problem-solving MVP proven on sample data.

### Findings
- **[low]** The SCs still validate buildability, not the agency's benefit (§ Success Criteria intro; RG-14) — The teacher noted this, and it stands. It is acceptable for a sample-data v1, but the PRD never says so. *Fix:* add one sentence to the SC intro: "v1 proves the model works; the benefit to the agency is measured against RG-14's baseline after rollout."

## Done-ness clarity — adequate

Most FRs have testable consequences, and the 4.4 gaps are closed. FR-7 has a seed-data example, FR-15 has "within 10 seconds, without a reload", FR-31 has dedupe and two-contact isolation, FR-38a has a worked 40/35 and 5/20/35-day example, and NFR-7 has a message table. Every FR except FR-43 (stretch) appears in at least one SC. The problems are a contradiction in a new test and SCs written against the full scope rather than the planned one.

### Findings
- **[high]** SC-16 contradicts FR-34's truncation rule (§ FR-34: "shortened in IIM at a whole word, and never inside a character"; SC-16: "A title of 40 "æ" (80 bytes) is written … as 32 "æ" to IIM") — 40 "æ" is one word, so "at a whole word" yields an empty IIM title, while SC-16 expects a cut inside the word at a character boundary. The addendum's option B ("to the last whole word within the byte limit") has the same gap. This was the item the teacher asked to have settled (point 6), and as written the test and the rule cannot both pass. *Fix:* "at the last whole word that fits; if the first word alone is over the limit, at the last whole character". Keep SC-16 and add a multi-word case, e.g. "fjord " repeated past 64 bytes, cut after a space.
- **[medium]** SC-1 promises edge rules that depend on a bonus FR (§ SC-1: "every edge rule (S1–S15)"; rank 6 FR-25 fallback: "edge rules S11–S14 are not tested") — SC-1 is the criterion SC-C2 calls most important, and four of its fifteen edge rules sit below the cut line. The general "SCs … shrink to match" rule covers it technically, but the headline test of the thesis will report a planned shortfall. *Fix:* either move FR-25 (3 h) above the line in place of a weaker planned row, or write SC-1's v1 scope as "S1–S10 and S15; S11–S14 with FR-25".
- **[medium]** SC-3 is written against bonus scope (§ SC-3: "staff batch-upload … adds it to the cart and checks out"; tagged "F2–F5") — The cart is rank 5 (planned, not spine), batch publishing (FR-19b) is rank 18, and the checkpoint has to redefine SC-3 as "with checkout on one image". "F2–F5" also pulls in every bonus FR in those areas (FR-13, FR-15, FR-18, FR-20, FR-25). *Fix:* write SC-3 on the spine ("… checks out, through the cart if FR-31 is built …") and list the FRs it covers explicitly.
- **[low]** Some spine FRs have no positive check in any SC — FR-13's offline lookup (SC-6 only says the place name "stay[s] stored"), FR-26's restore, and FR-41's client and date filters (SC-5 checks only "paid licences only"). *Fix:* add a GPS sample with its expected place name to SC-9 or SC-13, and a restore and a filter check to SC-1 and SC-5.
- **[low]** Vague residue — FR-30 "shows the image larger" (than what? the 800 px preview?), FR-29 "in pages" (page size), NFR-5a "the main pages" (which pages get the axe scan), FR-17 "saved automatically" (on blur, or after a delay?), and FR-38a for a contact who has never logged in. *Fix:* one clause each. NFR-5a should list the pages.
- **[low]** FR-9's defaults leave out AI versus manual (§ FR-9: "New uploads default to internal-only and free, with place names on") — If FR-9 falls back to "Defaults for every upload", nothing says whether AI runs. *Fix:* add "AI on" (or off) to the defaults.

## Scope honesty — adequate

Out of Scope, the Rollout Gate, fallbacks per row and "When a row is not built, the SCs that test it shrink to match, and the README says so" are exemplary for a solo project. De-scoping is done in the open, and the user's override of the cut line is recorded. The problem is that the journeys have not been brought into line with the cut.

### Findings
- **[high]** The journeys narrate bonus features as the main path (§ UJ-2, UJ-3) — In UJ-2, step 2's place-name choice is FR-13 (rank 7) and step 3's side-by-side is FR-10b (rank 16). Step 4, "Uploading and AI generation run in the background", is FR-15 (rank 10). Step 5, "no one else can edit an image while she does", is FR-18 (rank 15). Step 6, "Ida publishes the batch", is FR-19b (rank 18), and its logging is FR-42a (rank 8). The edge case "her lock expires and a colleague can take over" is FR-18 again. In UJ-3, step 2's "recent activity" is FR-38b (rank 20), and step 6's "downloads everything he just bought" is FR-37 (rank 17). With 39 h of bonus against about 1.5 h of slack, a UX designer or story writer working from UJ-2 will design and build features the plan says will probably not ship. *Fix:* mark bonus steps inline ("*(bonus: FR-18, rank 15)*"), or rewrite UJ-2 on the planned scope and add one line, "If the bonus FRs ship: …".
- **[low]** This run's assumptions are not indexed (addendum § Details confirmed in review, "confirmed by the user on 2026-11-04") — The memlog lists new inferences the user accepted on 2026-11-18: the 10 s state update, cart dedupe, NFR-4's 30 s and 15 min, "20 min incl. first build", the x86 CI check, the NFR-7 wording, the RG owners, and reading "15/11" as 2026-12-15. None are in the AS list, which is what the teacher's 4.5 asked to make visible. *Fix:* add AS-23 onwards, dated 2026-11-18.

## Downstream usability — adequate

IDs are clean, the split IDs resolve everywhere, every FR names a UJ or says "Admin capability; no journey", and the glossary terms (own image, client copy, staff copy, agency fields, location data) are used exactly. The priority table matches the FR tags one for one. Two things will mislead the next workflows: the tag vocabulary and the architecture notes that rest on bonus FRs.

### Findings
- **[medium]** The tag `[v1]` no longer means a planning tier (§ Release Stages tag list; all `[v1]` FRs) — `[v1]` covers both planned ranks 1–5 (FR-9, FR-14, FR-16b, FR-38a, FR-31) and bonus ranks 6–15 (FR-25, FR-13, FR-42a, FR-7, FR-15, FR-3, FR-20, FR-40, FR-39, FR-18). `[cut-first]` FRs are simply lower-ranked bonus. The tiers that actually drive the work are spine, planned, bonus and stretch, and a story writer reading "FR-18 [v1] Edit locks" will take it as in scope. The split fixed compound tags (4.5) but moved the ambiguity to the tag's meaning. *Fix:* retag as `[spine]`, `[planned #n]`, `[bonus #n]` and `[stretch]`, folding cut-first into bonus. If the tags stay, put the rank inline in each FR heading.
- **[medium]** "Settled for the architecture" settles bonus FRs (addendum § Settled for the architecture: "Metadata is generated in the background after upload (FR-15)"; "Edit locks on images and batches (FR-18)") — Both are bonus (ranks 10 and 15), and FR-15's fallback ("processed one by one while the upload page waits") is itself an architecture choice. At the pilot's 5.9 s median, 100 images keep one request open for about 10 minutes. The architecture cannot tell which path to design for. *Fix:* state the design target, e.g. "a job table from the start; the worker is FR-15", or cap the batch size for the synchronous fallback, and add the request-time limit as a risk.
- **[low]** The glossary lacks terms used as nouns throughout — setup link, transaction log, action log, access module, spine and bonus. There is also drift: "client list" (FR-9, FR-19a), "restricted list" (FR-25), "visibility lists" (FR-6) and "a list" (Glossary: Own image). *Fix:* add the six terms and pick one name for the restricted-visibility list.
- **[low]** FR-38a needs a data fact NFR-9 does not list — "images made visible to it since the contact's last login" requires a per-client time at which each image became visible, including list changes, not only a publish date. *Fix:* add it to NFR-9 or the addendum's data model table.

## Shape fit — adequate

The shape suits a chain-top, two-sided product: the UJs earn their place, the capability spec is grouped sensibly, and the Rollout Gate now lives in its own file as the teacher suggested. But the PRD has absorbed project-plan content (hours per area, budget, checkpoint procedure, freeze rules) and repeats FR consequences in the SCs, and that is why it grew.

### Findings
- **[medium]** Length went up, not down (whole PRD: 9,698 words against 8,153 on 2026-11-04) — Moving the Rollout Gate saved about 720 words, but Release Stages grew by about 850 (257 → 1,106), the NFRs by about 390 and the SCs by about 350. The user's goal is about 8,100. *Fix:* see "Length" below. Roughly 1,000–1,300 words can go without losing a requirement.

## Mechanical notes

- **Split IDs:** every reference uses FR-10a/b, FR-16a/b, FR-19a/b, FR-38a/b, FR-42a/b, NFR-2a/b and NFR-5a/b correctly in `prd.md` and `rollout-gate.md` (RG-1 → NFR-2b, RG-9 → NFR-5a). Bare FR-10/16/19/38/42 and NFR-2/5 appear only in the addendum's change table and "Split IDs" mapping, which is intended.
- **Priority table ↔ tags:** an exact match. 27 spine FRs, 15 `[v1]` FRs (ranks 1–15), 7 cut-first items (ranks 16–22) and 1 stretch (rank 23). Hours: spine 74.5, planned 10.5, bonus 39.0. The fallbacks in the table match the inline fallbacks where both exist.
- **Inline fallbacks are inconsistent.** FR-10b, FR-16b, FR-18, FR-19b, FR-34, FR-37, FR-38b, FR-42b, NFR-2b and NFR-5b say "*Fallback:*". FR-32 and FR-39 say "*Without …:*". The other ranked FRs (FR-3, FR-7, FR-9, FR-13, FR-14, FR-15, FR-20, FR-25, FR-31, FR-38a, FR-40, FR-42a) have their fallback only in the table. Use one source (see Length).
- **SC coverage:** every FR except FR-43 appears in an SC parenthetical. NFR-2b, NFR-3, NFR-4, NFR-5b, NFR-6, NFR-8 and NFR-10 appear in none. NFR-4 and NFR-10 carry their own checks; NFR-8 (all strings in a translation file) has no check.
- **Stale assumption:** AS-1 still reads "the 2026-11-22 checkpoint, the end of week 47", but the checkpoint is now 2026-11-30 and 2026-11-22 is the coding start.
- **Nominal UJ link:** FR-7 says "Realizes UJ-4", but UJ-4 never shows the client card. Add "Ida checks Fjordkaffe's card" to UJ-4 step 1, or mark FR-7 as an admin capability.
- **List break:** a blank line between SC-12 and SC-13 (prd.md line 452) splits the SC list in two.
- **Anchors:** `addendum.md#hours-budget`, `addendum.md#details-confirmed-in-review`, `#rollout-gate` and `prd.md#f3-access-and-licences` all resolve.
- **Assumptions Index:** no inline `[ASSUMPTION]` tags. The index lives in the addendum (see the Scope honesty finding for the missing 2026-11-18 entries).

## Feedback follow-up (teacher, 2026-11-12)

| Point | Status | Note |
|---|---|---|
| 4.1 No order among [v1] FRs | **Addressed** | Spine = MVP, ranks 1–23 with hours and fallbacks, a cut line, the 2026-11-30 checkpoint. Gap: no descope order inside the spine (Decision-readiness, high). |
| 4.2 Rollout Gate dominates | **Addressed** | `rollout-gate.md`, with one line plus an owner per RG in the PRD; NFR-3 and NFR-9 named as the v1-relevant parts. |
| 4.3 FRs don't point to UJs; no login journey | **Addressed** | Every FR has "Realizes UJ-n" or "Admin capability; no journey". UJ-4 covers onboarding, the setup link, expiry and a wrong password. FR-3, FR-24–FR-26 and FR-41 still have no journey, which is acceptable. FR-7's UJ-4 link is nominal. |
| 4.4 Thin consequences | **Addressed** | FR-7, FR-15, FR-31, FR-38a, NFR-4 and the NFR-7 table are all testable now. Small residue listed under Done-ness (low). |
| 4.5 Compound tags; assumptions hidden | **Mostly addressed** | The a/b splits are clean, and Document Purpose links to AS-1–AS-22. But the tag `[v1]` now spans planned and bonus (Downstream, medium), this run's assumptions aren't indexed, and AS-1 is stale. |
| 5 Counter-metrics IDs | **Addressed** | SC-C1 and SC-C2, now headed "Counter-metrics". |
| 6 Ranking and hours | **Addressed** | ~130 h, with a budget split in the addendum. |
| 6 Supported systems | **Addressed** | NFR-1: Docker with Compose v2, developed on macOS, CI on x86 Linux. The addendum names the line-ending and architecture risks. A D-entry is still owed. |
| 6 IIM truncation | **Addressed, with a defect** | Option B chosen with rationale. FR-34 and SC-16 contradict each other for single-word values (Done-ness, high). |
| 6 Follow-up of brief: narrow v1 | **Addressed** | D-022's additions are now mostly bonus: locks rank 15, staff accounts rank 11, ZIP rank 17. Cart (rank 5) and dashboard (rank 4) are planned. |

## Length (target ≈ 8,100 words; now 9,698)

Moves and cuts that keep every requirement. The savings are rough word counts.

| # | Passage | Action | Saves |
|---|---|---|---|
| 1 | SC-11 (86), SC-12 (127) and SC-13 (107) restate FR consequences one by one | Keep the cross-FR scenarios. Replace the rest with "each consequence of FR-x has a test", or cut the restated clauses | ~180 |
| 2 | Release Stages: the hours sentence in the v1 row (54), the brief's stage-2 list (35), tag definitions that re-explain the table (103), the checkpoint bullets duplicated by Open Questions 1–2 (63) | Shorten the v1 row to the date. Move the stage-2 list to the addendum. Fold the tags into the table header if they are retagged. Keep the checkpoint and cut OQ1–2 to one line each | ~170 |
| 3 | NFR-1 (299): supported-systems prose and the seed-data inventory | Move to the addendum (§ Supported systems already has the reasoning); keep the testable core | ~150 |
| 4 | Inline fallbacks (79 words) duplicating the rank table; "Admin capability; no journey" ×9 plus the "Admin capabilities" paragraph (37) | One source for fallbacks (the table). Shorten the tag to "*Admin.*" and drop the paragraph or the tags | ~110 |
| 5 | Map search in six places | Keep NFR-9's bullet and OQ5 | ~90 |
| 6 | Trade-offs (293): rows restating FR-18 (bonus), missing metadata (also in FR-19a, NFR-5a and RG-9), and map search | Drop or shorten those three rows | ~90 |
| 7 | NFR-5a (167): the legal-minimum sentence and the known-exception paragraph | The legal framing is already in RG-9 / `rollout-gate.md`. Keep one sentence naming the exception and pointing to RG-9 | ~70 |
| 8 | Document Purpose para 2 (49) and the Rollout Gate section intro (53), both repeating `rollout-gate.md` | Trim to one sentence each | ~50 |
| 9 | UJ "*Later: …*" lines (≈42) duplicating Out of Scope | Drop | ~40 |
| 10 | NFR-4's pilot sentence; NFR-3's "because a no-training tier settles neither…" clause | Move to the addendum's AI provider section and RG-3/RG-6 | ~40 |
| | **Subtotal without losing requirements** | → about 8,700 words | **~990** |
| 11 | *Optional:* the detailed consequences of low-ranked bonus FRs: FR-15 (136), FR-18 (114), FR-25 (162, but S11–S14 depend on it), FR-43 (54) | Keep each FR's statement, tag, rank and fallback in the PRD. Move the bullet consequences to an addendum section "Bonus FR detail" that the stories pull from if the FR is reached | ~250–350 |

Items 1–10 bring the PRD to about 8,700 words. Reaching about 8,100 needs item 11, or deeper SC trimming, which trades away some of the standalone readability the SCs have now.
