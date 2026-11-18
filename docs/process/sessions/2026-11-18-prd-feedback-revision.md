# Session 2026-11-18: prd-feedback-revision

- **Story/task:** – (PRD revision after the teacher's feedback of 2026-11-12)
- **Prompts:** [prompts/2026-11-18.md](../prompts/2026-11-18.md) (08:28–09:44)
- **Transcript:** [transcripts/2026-11-18-5ca86c04.md](../transcripts/2026-11-18-5ca86c04.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/987-2026-11-18-09-45-36-prd-feedback-revision.md](../../../.logs/marthekalland3/987-2026-11-18-09-45-36-prd-feedback-revision.md)
- **Branch and PR:** `docs/prd-2026-11-18`, #37 (open)
- **Commits:**
  - `7654134` docs(prd): revise PRD after the teacher's feedback, with ranked scope and rollout gate split out
  - `466ca9d` Logg: prd-feedback-revision

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| A new dated PRD run, or editing the 11-04 PRD in place | User chose a new run | 11-04 stays as a snapshot, like 10-28 |
| Rollout Gate in its own `rollout-gate.md`, not in the addendum | Accepted | The gate is a sign-off checklist for a different audience, and the addendum supports PRD decisions |
| 4.5: split into a/b IDs (A) plus an assumptions link (1) | Accepted | One tier per ID fits the ranking table and the stories |
| IIM option B (shorten safely; XMP keeps the full value) | Accepted | Keeps FR-34's promise for about 1 h; XMP-only is the fallback |
| Read "15/11" as 2026-12-15 | Accepted | Confirmed by the user |
| The user's UJ-4 text "Incorrect password, contact admin…" breaks FR-5's rule against revealing accounts; suggested "Incorrect email or password. Contact the agency…" | Accepted | Keeps the security rule and the user's intent |
| The spine publishes single images; batch publishing as FR-19b | Accepted; the user added that batch publishing may be cut | It became a bonus feature at rank 18 |
| Hours split (about 87 h build) and per-FR estimates | Accepted | |
| Ranking, with the cut line after rank 6 | **Adjusted:** the user moved the line to after rank 5 | FR-25 Revoke became a bonus |
| A freeze date of about 2026-12-08 | **Adjusted:** freeze yes, but the date is set at the checkpoint | The user wants to see the hours left first |
| Teacher's example MVP (pointed out where it differs from the spine) | User chose the spine as the MVP | |
| Light finish (one review, polish for length) | Accepted | Saves hours |
| Review fixes: thin first slice, reduced spine, bonus notes in UJ-2 and UJ-3, new tags | Accepted | |
| Length target of about 8,700 or below 8,100 words | User chose about 8,700 | |

## Bugs found in AI-generated code
No code was changed. One defect was found in AI-written requirements. Claude's first wording of FR-34 shortened IIM values "at a whole word", while Claude's own SC-16 expected a single 40-letter "æ" word to be cut to 32 letters, so both could not pass. The rubric review subagent found it, and FR-34 now cuts at the last whole character when the first word alone is too long. The same review found that UJ-2 and UJ-3 described bonus features as the main path, and that the spine had no cut order of its own. Both were fixed (Release Stages, notes under the journeys).

## Decisions
- [D-026](../decisions.md#d-026-final-deadline-2026-12-15-with-about-130-hours-for-everything): final deadline 2026-12-15 and about 130 hours; supersedes [D-019](../decisions.md#d-019-v1-runs-by-2026-12-05)
- [D-027](../decisions.md#d-027-the-app-and-its-tests-run-in-docker): the app and its tests run in Docker
- [D-028](../decisions.md#d-028-iim-values-are-shortened-safely-and-xmp-keeps-the-full-value): IIM values shortened safely
- [D-029](../decisions.md#d-029-the-spine-is-the-mvp-the-rest-is-ranked-and-a-checkpoint-draws-the-cut-line): spine as MVP, ranked bonus FRs, checkpoint 2026-11-30
- [D-030](../decisions.md#d-030-the-rollout-gate-moves-to-its-own-file): the Rollout Gate in its own file
