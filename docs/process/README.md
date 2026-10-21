# Process documentation

Evidence of how the app was planned, built and quality-assured with AI. Everything here is written in English (D-008); prompt logs, session logs and transcripts written before D-008 stay in Norwegian as recorded.

| What | Where | How it is made |
|---|---|---|
| Grading criteria (summary) | [`vurderingskriterier.en.md`](vurderingskriterier.en.md) (Norwegian original: [`vurderingskriterier.md`](vurderingskriterier.md)) | Manually |
| Decision log | [`decisions.md`](decisions.md) | Manually and via `/wrap-up` |
| Prompt log per day | [`prompts/`](prompts/) | Automatically, hook `.claude/hooks/log-prompt.py` |
| Transcripts per session | [`transcripts/`](transcripts/) | `/wrap-up` via `.claude/hooks/transcript-to-md.py`; SessionEnd hook as a safety net if `/wrap-up` was not run |
| Session summaries | [`sessions/`](sessions/) | `/wrap-up` at the end of each working session |
| Self-assessments against the criteria | `grading-checks/` | `/grading-check` weekly and before the deadline |
| Planning documents (BMad) | [`../../_bmad-output/planning-artifacts/`](../../_bmad-output/planning-artifacts/) | BMad skills |

**How it fits together:** a prompt in `prompts/` → the whole conversation in `transcripts/` → summarized with an assessment of the AI suggestion in `sessions/`, which lists the code branch, commits and PR → the code PR links back to the session log and references the story ID and any D-xxx in `decisions.md`.

## Workflow

Process files are committed separately from code ([D-013](decisions.md#d-013-process-files-are-committed-separately-from-code)). They stay on `main`, but never in the same commit or PR as code.

1. **During a session**, work on a code branch as usual. The hook writes prompts to `prompts/`; these files stay uncommitted. Code commits never include `docs/process/`.
2. **At the end of each session:** `/wrap-up <topic>` writes the transcript, the session log and any new decisions. It commits nothing. Then `/exit`.
3. **Whenever you choose**, on `main` with no code work in progress (typically after the code PR is merged and `main` is pulled): `/commit-logs`. It scans for secrets, commits everything uncommitted in `docs/process/` on `docs/process-<date>`, and merges it through its own PR.
4. **Code PRs** link to their session log(s) here and reference decisions by ID.

The `process-separation` workflow (`.github/workflows/process-separation.yml`) fails any PR that changes both `docs/process/` and other files. On GitHub, process commits are the PRs from `docs/process-*` branches.
