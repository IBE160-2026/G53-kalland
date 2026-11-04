# Session 2026-11-04: prd-high-effort

- **Story/task:** –
- **Prompts:** [prompts/2026-11-04.md](../prompts/2026-11-04.md) (05:10–07:48)
- **Transcript:** [transcripts/2026-11-04-c54ea65f.md](../transcripts/2026-11-04-c54ea65f.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/991-2026-11-04-07-40-23-prd-high-effort.md](../../../.logs/marthekalland3/991-2026-11-04-07-40-23-prd-high-effort.md)
- **Branch and PR:** `docs/prd-v2`, #31 (open)
- **Commits:**
  - `67de10a` docs(prd): redo the PRD at high effort with a rollout gate
  - `4bfc9e0` Logg: prd-high-effort
  - `e07e3a3` Logg: prd-high-effort
  - `0ad6e8a` Logg: prd-high-effort

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Publishing requires a title and alt text | Rejected | The user's call: an image can be published without them, though it is not recommended. FR-19 now warns and never blocks |
| Clients never get location data in search or on pages | Adjusted | Holds for v1 only. The user wants map search in later versions, so NFR-9 keeps the data |
| Calibrate the stakes to the course first | Adjusted | The user chose to count the real rollout too, which led to the Rollout Gate |
| Rollout gate after v1, and a per-batch place-name setting | Accepted | The user chose both |
| No publishing while generating, and retry on drafts only | Accepted | Consequences of the publish correction; AI text never changes a published image |
| Client copies stay free of location data even with a later map | Accepted | The map shows a position in the app, so files need none (D-011) |
| The remaining 21 inferred details (AS-1 to AS-22, except AS-12) | Accepted | Reviewed by the user as a list; see the addendum |

## Bugs found in AI-generated code
None in code; this session changed no code. Errors in the AI-written PRD draft, found by the AI's own review against the inputs and fixed before finalizing:

- FR-12 could send GPS to the AI provider with the place-name setting off, because it did not say the resized copy carries no embedded metadata.
- FR-11 did not read embedded alt text into the alt text field.
- Ten FRs had no success criterion. SC-12 now covers them.
- The ID "A1" meant both an access-table row and an assumption. Assumptions are now AS-1 to AS-22.

These checks were done by the draft's author in the same session, so they are not independent. Medium and low findings were applied without walking each with the user; `review-rubric.md` lists them.

## Decisions
[D-023](../decisions.md): a new PRD run with a rollout gate after v1.
