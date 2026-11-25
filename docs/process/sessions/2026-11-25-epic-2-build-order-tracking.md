# Session 2026-11-25: epic-2-build-order-tracking

- **Story/task:** – (coordinated the worktrees for S-2.1, S-2.2 and S-2.3)
- **Prompts:** [prompts/2026-11-25.md](../prompts/2026-11-25.md) (13:22–15:02)
- **Transcript:** [transcripts/2026-11-25-8c6b5b87.md](../transcripts/2026-11-25-8c6b5b87.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/967-2026-11-25-15-03-07-epic-2-build-order-tracking.md](../../../.logs/marthekalland3/967-2026-11-25-15-03-07-epic-2-build-order-tracking.md)
- **Branch and PR:** `main`, no code. The stories were built in separate worktree sessions: #68 (2.1), #69 (2.2) and #70 (2.3), all merged.
- **Commits:** None (only the teacher's log commit `Logg: epic-2-build-order-tracking`)

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| With no active spec, start with story 2.1 as the next story | Adjusted: the user asked to check the planned order first | The build order in `epics.md` ("Dependencies and build order") is set by the PRD tiers, not the epic numbers. It confirmed 2.1: spine stories of Epics 2–5 and 7 come after Epic 1. |
| Before each next story, check that the previous PR was merged and its worktree removed (`gh pr list`, `git worktree list`) | Accepted | So a new worktree never branched from a `main` that was missing the previous story |
| Give the `start.sh` / `claude` / `/bmad-build` commands for 2.1, 2.2 and 2.3 one at a time | Accepted | Follows D-016: one worktree per code session, while the main folder stays on `main` |

## Bugs found in AI-generated code
None. This session wrote no code.

## Decisions
None.
