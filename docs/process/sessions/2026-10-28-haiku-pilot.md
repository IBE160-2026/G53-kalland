# Session 2026-10-28: Haiku pilot preparation and v1 target date

- **Story/task:** – (pre-architecture preparation; research recommendation 3 in D-017)
- **Prompts:** [prompts/2026-10-28.md](../prompts/2026-10-28.md) (12:43–13:19)
- **Transcript:** [transcripts/2026-10-28-7ea60584.md](../transcripts/2026-10-28-7ea60584.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/994-2026-10-28-13-24-47-haiku-pilot.md](../../../.logs/marthekalland3/994-2026-10-28-13-24-47-haiku-pilot.md)
- **Branch and PR:** `docs/haiku-pilot`, #25 (open)
- **Commits:**
  - `f5f7bfa` docs(plan): target v1 by 2026-12-05
  - `09eee99` docs(research): Haiku 5.5 pilot plan and CC0 image set
  - `b203f7a` Logg: haiku-pilot

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Parallel work while the metadata research runs: prepare the Haiku pilot and fix the project plan date in a second worktree | Accepted | The user chose this; both feed the PRD and architecture |
| Image set from Wikimedia Commons with CC0/PD in structured data, skipping files labelled "(Unsplash)" | Accepted | The user wanted free-use images; the project plan warns against Unsplash |
| Keep the COOP packaging photo (#14) as the Norwegian-text image | Rejected | The user chose to swap it to avoid a brand; replaced with the Narvik guidepost (Norwegian text, GPS) |
| Keep the images local and commit only `sources.md` | Accepted | Recommended option; keeps the repo light until the architecture decides where sample data lives |
| Fix the stale "Claude CLI providers" line in the project plan | Not discussed | Done by Claude while updating the date; follows D-017 |
| Run `/wrap-up` now but not `finish.sh`, so the worktree stays for the next session | Accepted | The user wants to continue in the same worktree; asked to be reminded that `finish.sh` deletes the gitignored images |

The session started in the main folder. It made the worktree `docs/metadata-research` for the user's other terminal (left empty), then `docs/haiku-pilot`, and moved into it before the image search. It left the worktree (kept on disk) during `/wrap-up`, because the worktree isolation blocked writing the process files in the main folder.

## Bugs found in AI-generated code
No product code. Three bugs in Claude's throwaway search and download scripts (scratchpad, not committed), all found from the output and fixed in the session:
- The Commons search with `(… OR …)` around `haswbstatement` returned nothing; changed to the `P275=…|P6216=…` syntax.
- The download script took the file extension from the URL, which included a query string; the files were renamed with the right extension.
- The User-Agent header contained the user's email address, so it was sent to Wikimedia with the first two searches. Claude noticed it afterwards and changed it to the repo URL.

## Decisions
- [D-019](../decisions.md#d-019-v1-runs-by-2026-12-05): v1 runs by 2026-12-05
- [D-020](../decisions.md#d-020-pilot-images-from-wikimedia-commons-cc0-or-public-domain-kept-local): pilot images from Wikimedia Commons, CC0 or public domain, kept local
