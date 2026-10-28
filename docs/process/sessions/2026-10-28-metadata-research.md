# Session 2026-10-28: metadata-research

- **Story/task:** – (last open research item before the PRD, from pre-prd-research)
- **Prompts:** [prompts/2026-10-28.md](../prompts/2026-10-28.md) (12:47–13:16)
- **Transcript:** [transcripts/2026-10-28-44ede696.md](../transcripts/2026-10-28-44ede696.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/994-2026-10-28-13-20-51-metadata-research.md](../../../.logs/marthekalland3/994-2026-10-28-13-20-51-metadata-research.md)
- **Branch and PR:** `docs/metadata-research`, #24 (open)
- **Commits:**
  - `6bf8251` docs(research): metadata libraries for read, write-on-export and location stripping
  - `c91e427` Logg: metadata-research

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Run the research here rather than drafting a prompt for an external tool | Accepted | The user chose the recommended option |
| Compare both Node and Python, since the stack is open | Accepted | The user chose the recommended option |
| Select shape: pick the library and answer exiftool yes/no | Accepted | The user chose the recommended option |
| Hard gates, weights (install 30, write/strip 25, formats 15, maintenance 15, docs 10, perf 5), 3 researchers | Accepted unchanged | Approved at the plan gate |
| Gave the report path inside the worktree | Adjusted | The user couldn't find the report (it was in the worktree, uncommitted, while the user looked in the main folder). Claude gave the absolute path and, at the user's request, a private artifact page |
| ExifTool via `exiftool-vendored`; python-exiv2 as runner-up | Accepted as research result | "Looks good". The final library choice follows the stack decision in architecture |
| Optional finishing steps (semantic citation check, review pass, HTML briefing) | Not run | Offered; the user went on to wrap up |
| Record the recommendation as D-019 now | Rejected | The user chose to leave it until the stack is chosen in architecture |

## Bugs found in AI-generated code
- **A research subagent's claim was wrong.** Digest B said pyexiv2's wheels need no system library. A local install on macOS showed `import pyexiv2` failing on a missing Homebrew `libintl`, and `otool -L` showed the wheel links Homebrew gettext, brotli and inih by absolute path. The report states the corrected finding and scores pyexiv2 down. Both claims are in the memlog.
- **Claude's own test script for python-exiv2 crashed.** It raised a `TypeError` in `findKey` because it passed a string instead of a key object. Found by running it, fixed by passing `ExifKey`/`XmpKey`/`IptcKey`, then re-run successfully. The script was scratch work and was not committed.
- **Mechanical citation check:** the first run found one orphaned source ([12]). It was fixed by citing it in the matrix, and the second run was clean.

## Decisions
None. The library choice is to be recorded with the stack decision in architecture.
