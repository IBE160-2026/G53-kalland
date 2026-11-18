# prd-feedback-revision

## 2026-11-18 kl. 09:45 — marthekalland3

### Task
Revise the PRD based on the teacher's feedback of 2026-11-12 (`tilbakemelding-prd.en.md`, points 4.1–4.5, 5 and 6). Marthe wanted the FRs linked to journeys, a login journey, an MVP and a ranked priority list that fits about 130 hours, testable consequences where they were thin, SC IDs, a guided walk-through of 4.5, NFR-1 reviewed for Docker, and the IIM truncation settled.

### Plan
- `bmad-prd` in Create mode: a new dated run (`prd-g53-kalland-2026-11-18`), with the 11-04 PRD and addendum as the base.
- Work on branch `docs/prd-2026-11-18` in the worktree `../g53-kalland-prd-2026-11-18` (D-016).
- Claude drafted the mechanical changes. Marthe decided 4.5 (option A + 1), IIM (option B), UJ-4, the hours, the checkpoint, the MVP and the ranking.
- Light finish: memlog audit, input check, one rubric review by a subagent, and polish for length.
- Decisions and memory are in the run's `.memlog.md`.

### Result
- New run folder `_bmad-output/planning-artifacts/prds/prd-g53-kalland-2026-11-18/`: `prd.md` (final, 8,748 words), `addendum.md`, `rollout-gate.md`, `review-rubric.md` and `.memlog.md`.
- Spine = minimum usable v1 (about 75 h). Ranks 1–5 are planned (FR-9, FR-14, FR-16b, FR-38a, FR-31; about 10.5 h), and ranks 6–22 are bonus with a fallback each. The tags are now [spine], [planned], [bonus] and [stretch].
- Hours: about 130 h to the final deadline of 2026-12-15, about 87 h of it for building. The 2026-12-05 target is gone. Coding starts 2026-11-22, and the checkpoint is 2026-11-30, with a reduced spine if it fails.
- New UJ-4 (onboarding and first login). Every FR names its journey. FRs with two tags are split into a/b IDs. New SC-13 to SC-16 and SC-C1/SC-C2. NFR-1 is rewritten for Docker. FR-34 shortens IIM values safely (option B).
- The rubric review found 3 high findings, all fixed. One was Claude's own error: FR-34's "whole word" rule contradicted SC-16's test.
- Commit `7654134`, PR #37 (open). Session log and D-026 to D-030 are in the main folder's `docs/process/`.
- Closed in `issues.md`: ranking the [v1] FRs, revising the PRD after the feedback, and the Windows test of `exiftool-vendored` (no longer relevant now the app runs in Docker).

### Open items
- At the 2026-11-30 checkpoint: draw the cut line from the ranked table and set the freeze date.
- Epics and stories: make the first stories a thin end-to-end slice through the spine, as the PRD's Release Stages require.
