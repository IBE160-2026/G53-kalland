# Process documentation

Evidence of how the app was planned, built and quality-assured with AI. Everything here is written in English (D-008); prompt logs, session logs and transcripts written before D-008 stay in Norwegian as recorded.

| What | Where | How it is made |
|---|---|---|
| Grading criteria (summary) | [`vurderingskriterier.en.md`](vurderingskriterier.en.md) (Norwegian original: [`vurderingskriterier.md`](vurderingskriterier.md)) | Manually |
| Decision log | [`decisions.md`](decisions.md) | Manually and via `/wrap-up` |
| Prompt log per day | [`prompts/`](prompts/) | Automatically, hook `.claude/hooks/log-prompt.py` |
| Transcripts per session | [`transcripts/`](transcripts/) | Automatically when the session ends, SessionEnd hook `.claude/hooks/transcript-to-md.py` |
| Session summaries | [`sessions/`](sessions/) | `/wrap-up` at the end of each working session; task, plan and result are in the teacher's log in [`../../.logs/`](../../.logs/), which each summary links to |
| Self-assessments against the criteria | `grading-checks/` | `/grading-check` weekly and before the deadline |
| Planning documents (BMad) | [`../../_bmad-output/planning-artifacts/`](../../_bmad-output/planning-artifacts/) | BMad skills |

**How it fits together:** a prompt in `prompts/` → the whole conversation in `transcripts/` → summarized with an assessment of the AI suggestion in `sessions/`, which lists the code branch, commits and PR → the code PR links back to the session log and references the story ID and any D-xxx in `decisions.md`.

## Workflow

Process files are committed separately from code ([D-013](decisions.md#d-013-process-files-are-committed-separately-from-code)). Several sessions can run at once, each code session in its own worktree ([D-016](decisions.md#d-016-parallel-sessions-in-worktrees-and-a-one-command-session-end)).

1. **Start a code session** with `.claude/scripts/start.sh <branch>`, which makes a worktree next to the main folder. The main folder stays on `main`. The hooks write every session's prompts and transcript into the main folder's `docs/process/`, so a worktree never holds process files.
2. **End the session** with `/wrap-up <topic>`. After one confirmation it commits the code, pushes and opens the PR, runs the teacher's `sesjonslogg`, and writes the session log and any decisions here. Then `/exit`; the transcript is written as the session ends.
3. **Merge** with `.claude/scripts/finish.sh`. It also removes the worktree and pulls `main`.
4. **Whenever you choose:** `.claude/scripts/commit-logs.sh` (or `/commit-logs`). It scans for secrets, commits everything uncommitted in `docs/process/` on local `main`, pushes it as `docs/process-<date>` and merges that PR. Other sessions can keep working meanwhile.
5. **Code PRs** link to their session log(s) here and reference decisions by ID.

The `process-separation` workflow (`.github/workflows/process-separation.yml`) fails any PR that changes both `docs/process/` and other files. On GitHub, process commits are the PRs from `docs/process-*` branches.
