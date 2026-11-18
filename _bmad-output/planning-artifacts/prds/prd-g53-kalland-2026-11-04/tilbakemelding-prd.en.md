# Feedback on the PRD

> English translation of [`tilbakemelding-prd.md`](tilbakemelding-prd.md). The Norwegian original from the course teacher is authoritative and is kept unchanged (D-008). Passages the original quotes in English from the PRD are kept verbatim.

| | |
|---|---|
| **Group** | G53 – G53-kalland |
| **PRD assessed** | `_bmad-output/planning-artifacts/prds/prd-g53-kalland-2026-11-04/prd.md` (status: final, last changed 2026-11-04, commit 4184767), read together with `addendum.md` |
| **Date** | 2026-11-12 |
| **Type** | Formative feedback, not a grade |

## 1. Overall impression

This is an unusually strong PRD: a clear thesis, testable FRs, an access table and edge rules that can become tests directly, and honest handling of AI, cost and privacy. The biggest risk is the scope. With 43 FRs, a 16-point Rollout Gate and a solo builder before 2026-12-05, it is not settled which [v1] requirements go first.

## 2. What works well

- **The access model has been turned into tests.** The access table (A1–A13) and the edge rules (S1–S15) cover every combination of visibility, price and licence, and SC-1 ties them to "the same routes users hit". This is a direct basis for stories and the test plan.
- **AI control and runnability are well thought through.** FR-12 and FR-14 govern the prompt, sensitive attributes and output checks. FR-16 defines errors and retry, and NFR-1 provides a mock mode with "a setting makes it fail on demand". The brief's two biggest gaps (a key for the examiner, and cost) are closed.
- **Scope is honest and cuttable.** "Spine and cut line" with a fallback per FR and the 2026-11-22 checkpoint shows what happens if time runs short. The Trade-offs table, e.g. publishing without alt text as "NFR-5's known exception", shows what you have given up.

## 3. Overview by dimension

| Dimension | Assessment | Short rationale |
|---|---|---|
| Decision clarity | strong | Choices are stated as choices, with their price: the Trade-offs table and the addendum's list of user decisions. |
| Substance | strong | No padding. The NFRs have numbers (500 images, under 1 s, 800 px, 12 characters), and three people carry the UJs. |
| Strategic coherence | good | The thesis "visibility × price plus a licence that lasts" is clear and drives SC-1, but the SCs measure testability, not value for the agency (deferred to RG-14). |
| Testability | strong | Most FRs have concrete consequences. A few are thin (see 4.4). |
| Scope and boundaries | good | Non-goals, Out of Scope and fallbacks exist. But the [v1] list is too large and has no order. |
| Usability for the next phase | good | IDs and glossary are clean. The FRs do not refer to the UJs, and the document is long (about 8,100 words). |
| Fit of form | good | The UJs suit a two-sided portal. The Rollout Gate, on the other hand, is almost a document of its own. |

## 4. Most important improvements

### 4.1 The [v1] requirements have no priority order
- **Severity:** high
- **Where:** Open question 1: "The [v1] FRs have no order among themselves."; Release Stages
- **Problem and why it matters:** The 2026-11-22 checkpoint says that [v1] FRs are built only after the spine runs, but not which come first. The epics and sprint plan need this order. Several [v1] requirements are expensive for one person: FR-18 (locks with expiry and takeover, three levels), FR-15 (background jobs that survive a restart) and FR-31 (cart).
- **Suggestion:** Add a small table in Release Stages: *FR | tag | order | fallback if cut*. Example: "FR-18 Edit locks | v1 | 9 of 14 | fallback: last save wins, with a warning that someone else is editing". Define a "minimum usable v1" (e.g. FR-1 to FR-6, FR-8 to FR-12, FR-16, FR-17, FR-19, FR-21 to FR-23, FR-27 to FR-30, FR-32, FR-33, FR-41). Everything else gets a rank and a fallback.

### 4.2 The Rollout Gate dominates the document
- **Severity:** medium
- **Where:** "Rollout Gate": "Nothing here is built by 2026-12-05." (RG-1 to RG-16)
- **Problem and why it matters:** The section makes up about a quarter of the PRD and goes deep into law (transfer basis, DPIA, current lawsuits). It is valuable, but nothing UX, architecture or stories should build on in v1. It makes it harder to see the one thing that has to be finished this year.
- **Suggestion:** Move the details to the addendum or a separate `rollout-gate.md`. Let the PRD keep a short list (one line per RG with title and owner) and the NFRs that actually affect v1 (NFR-3, NFR-9). Link to the rest.

### 4.3 The FRs do not point to the UJs, and login has no journey
- **Severity:** medium
- **Where:** §User Journeys and all FRs (no "Realizes UJ-x"); UJ-3 step 1: "He logs in with email and password."
- **Problem and why it matters:** Stories must be traceable to both an FR and a journey. The admin tasks (FR-1 to FR-7, FR-25) and the setup link (FR-4) have no journey, even though Jonas cannot log in without it.
- **Suggestion:** Add "Realizes UJ-n" where it fits. Write a short UJ-4: "Ida onboards Fjordkaffe: creates the client and two contacts, copies the setup links, Jonas sets a password. Edge case: the link has expired (S8)."

### 4.4 Some FRs and NFRs have no testable consequences
- **Severity:** medium
- **Where:** FR-7 Client card, FR-15 ("Staff can browse the batch meanwhile"), FR-31 Cart, FR-38 Dashboard; NFR-7 "a clear message in plain English"; NFR-4 "about 10 s"
- **Problem and why it matters:** The rest of the PRD is testable, so these stand out and will be the ones interpreted differently in stories.
- **Suggestion, FR-7:** "The client card for Fjordkaffe shows 2 contacts, the images visible to the client and the licence history. Notes and the account manager are shown to staff only. A contact who opens the page gets 403 (S6)." For NFR-7: pick 3–4 errors and write the actual message text in a table, so the test can check it.

### 4.5 Assumptions and the cut line are scattered
- **Severity:** low
- **Where:** Tags such as "[spine; side-by-side is cut-first]"; the assumptions AS-1 to AS-22 are only in the addendum
- **Problem and why it matters:** Compound tags make for unclear stories (what is spine, what is cut-first?). The reader of the PRD cannot see what is an assumption.
- **Suggestion:** Split such FRs into a/b items (FR-10a, FR-10b) or use the table from 4.1. Add a short "Assumptions" link to the addendum in the document's purpose section.

## 5. Mechanical findings

- IDs are continuous and unique: FR-1 to FR-43, NFR-1 to NFR-10, SC-1 to SC-12, UJ-1 to UJ-3, RG-1 to RG-16, A1–A13, S1–S15. The cross-references I checked resolve.
- The glossary is used consistently (Own image, Client copy, Staff copy, Agency fields). No synonyms found.
- No inline `[ASSUMPTION]` tags or index in the PRD itself; the assumptions are confirmed and collected in the addendum.
- Under "Success Criteria" the list of counter-metrics is called "Counter-measures", not counter-metrics, and it has two items. Fine, but give them IDs (SC-C1, SC-C2) so they can be referenced.
- No sensitive information found.

## 6. Before you move on

**Must be settled before UX, architecture and epics:**
- Ranking of the [v1] FRs and the hours you actually have (open question 1, point 4.1).
- Supported operating systems and testing on Windows (addendum, Metadata contract), since NFR-1 requires "a clean machine".
- How IIM values are truncated (byte limits, æøå), which the addendum itself calls an architecture decision.

**Can wait:** open questions 2, 4 and 5, the prompt v3 check (question 3, when the Claude provider is built) and all RG items.

**Follow-up of the brief:** *partial*. Mock mode, sample images, checkable success criteria (access, duplicate, log) and deferred versioning have been followed up. The recommendation to narrow v1 has only been partly followed: the core flow is clear, but D-022 added a cart, staff accounts, locks, ZIP and a dashboard.

## 7. Reflection questions

1. The Rollout Gate refers to lawsuits and vendor terms. How did you check that the AI did not build on wrong or outdated information, and what did you change after the check?
2. If you had only half the hours, which ten FRs would you cut, and which requirement in the PRD supports the choice?

_Assessed against the quality rubric in bmad-prd. This is guidance, not a final grade._
