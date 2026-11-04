# Session 2026-11-04: legal-research

- **Story/task:** – (open item from D-023: check the rollout gate's legal points against primary sources)
- **Prompts:** [prompts/2026-11-04.md](../prompts/2026-11-04.md) (07:55–09:48)
- **Transcript:** [transcripts/2026-11-04-238941f7.md](../transcripts/2026-11-04-238941f7.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/990-2026-11-04-08-40-59-legal-research.md](../../../.logs/marthekalland3/990-2026-11-04-08-40-59-legal-research.md)
- **Branch and PR:** no code; session ran on `main`. The research folder went on `docs/legal-research`, #32 (open).
- **Commits:**
  - `f869a34` docs(research): legal aspects of AI on images, privacy and accessibility
  - `d66c68b` Logg: legal-research
  - `a2597df` Logg: legal-research
  - `d21dbac` Logg: legal-research
  - `da26b5c` Logg: legal-research
  - `a562c54` Logg: legal-research

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Domain research serving one decision: turn the PRD's unverified legal items into confirmed requirements, and split v1 from rollout | Accepted | The user approved it at the plan gate |
| `normal` validation as the default | Adjusted | The user raised it to `high` |
| The user checks the DPF participant list and the C-703/25 P case page in a browser, because the tools could not read them | Accepted | The user reported no results for Anthropic and that the appeal is still pending. The report marks both as the user's reports |
| Ask Uutilsynet in writing whether an invitation-only portal is covered | Rejected | The user wants to follow the accessibility guidelines either way (D-024) |
| Block publishing when alt text is missing, because FR-19's warning can fail WCAG 1.1.1 | Rejected | The user kept warn and publish. The PRD is to state this as a known exception (D-024) |
| Ask Anthropic about the DPA and retention, use a legal reviewer, and re-check pending legislation | Rejected for v1 | The user called these out of scope and may return to them later (D-024) |
| V-1 prompt rule, V-2 NFR-5 wording, rollout gate edits and new RG-15 and RG-16 | Not decided yet | Left for a `bmad-prd` session; the PRD was not changed |
| Publish the briefing as a private page | Not answered | Not published |

## Bugs found in AI-generated code
None in project code, because the session wrote none. Errors in the AI-written report and process:

- **Citation check:** a checker compared the report with its sources and found 23 mismatches (0 high, 10 medium, 13 low), none showing a claim false. All were applied or resolved, but the checker did not complete every comparison. Its "Not checked" list is in `digests/citation-check.md` in the run folder.
- **Structure lens:** the draft's new gate item reused RG-14, which already exists. The items were renumbered RG-15 and RG-16.
- **Wrong requirement ID:** the first draft cited FR-27 as the licence log. Corrected to FR-41.
- **Research firewall:** one red-team digest mentions the v1 target date, which was not in its brief. No finding rests on it, and it is logged in the memlog.
- **Wrong process claim:** Claude told the user the research folder would go through `/wrap-up` and `/commit-logs`. `commit-logs.sh` refuses changes outside `docs/process/`. This was found while running `/wrap-up`. The folder moved to its own branch and PR at the user's request, and the teacher's log was corrected.

## Decisions
- [D-024](../decisions.md): follow the accessibility target whatever the legal scope, and defer the remaining legal checks past v1
