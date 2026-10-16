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

**How it fits together:** a prompt in `prompts/` → the whole conversation in `transcripts/` → summarized with an assessment of the AI suggestion in `sessions/` → a commit/PR that references the story ID → any choices in `decisions.md`.
