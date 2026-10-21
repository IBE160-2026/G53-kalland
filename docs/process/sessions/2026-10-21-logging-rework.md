# Session 2026-10-21: logging-rework

- **Story/task:** – (process/chore)
- **Prompt log:** [prompts/2026-10-21.md](../prompts/2026-10-21.md) (12:50–13:34)
- **Transcript:** [transcripts/2026-10-21-22ede3bc.md](../transcripts/2026-10-21-22ede3bc.md)

## Code
- **Branch:** `chore/logging-rework`
- **Commits:**
  - `e80071d` chore(process): split /wrap-up into documentation only and new /commit-logs
  - `a6e00fd` chore(ci): fail PRs that mix process files and code
  - `8bce954` docs: describe separate commits for process files
- **PR:** #10 (open)

## Goal
Change how process documentation is committed, so prompt logs, session logs, transcripts and decisions are never committed together with code.

## Key prompts
- 12:52 – "The goal for this session is to edit how the logging works. Make branch for this."
- 12:52 – A pasted spec: move the process files to an orphan branch `process`, checked out as a worktree at `docs/process/`; make `/wrap-up` documentation-only; add `/commit-logs`; update hooks, CLAUDE.md and README. Step 0: "check grading impact first … If you see a real risk, say so and stop before planning anything else."
- 12:55 – "Plan the version that keeps process files on main"
- 13:11 – "Yes to all 3 questions. Continue. Also make a note of the new flow so it's easy for me to find later."
- 13:32 – "commit and push, then open the PR"

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Stop at Step 0: an orphan `process` branch is a grading risk (the examiner checks out the last commit on `main`, links between code and logs would cross branches, and the existing history would be lost) | Accepted – the user dropped the orphan-branch spec | The user's own Step 0 condition: stop on a real risk. Criterion 1 counts 30 %. |
| Keep `docs/process/` on `main`, committed only through separate `docs/process-<date>` PRs | Accepted | Keeps the logs in the examiner's checkout while the history shows the separation. |
| Keep the grading criteria files in `docs/process/` instead of moving them (as the original spec asked) | Accepted | The Norwegian original links to `decisions.md#d-004` and must not be edited (D-008). Without the orphan branch there is no reason to move them. |
| Run `/commit-logs` only on `main`, and let it merge its own PR | Accepted | Tested in a scratch repo: git refuses `git switch main` when untracked local copies of files merged to `main` exist, even when identical. An open process PR would also let new prompts be written into a file `main` doesn't track yet. |
| Let `/wrap-up` run read-only git (`git log`, `git branch`, `gh pr list`), although the spec said "never runs any git commands" | Accepted | Needed to list the code branch, commits and PR reliably. |
| Add a CI guard (`process-separation.yml`) that fails PRs mixing `docs/process/` and other files | Accepted | Enforces the rule in a way the examiner can see. It passed on PR #10. |
| Split the work into three commits instead of one | Accepted (not discussed) | Small, focused commits (CLAUDE.md). |

No suggestion was rejected or corrected by the user this session. The only change of direction came from the user's own spec (Step 0).

## Bugs found in AI-generated code
None. The git behaviour with untracked files was a design constraint found by testing before implementation, not a bug.

## Decisions
- [D-013](../decisions.md#d-013-process-files-are-committed-separately-from-code): process files are committed separately from code, on `main` (already written this session; no further changes).

## Next steps
- `/exit`, merge PR #10, then on `main`: `git pull` and the first `/commit-logs`. It includes the leftover 2026-10-16 prompt log, today's logs, `docs/process/README.md` and D-013.
- Next planned work: `bmad-prd` (D-009).
