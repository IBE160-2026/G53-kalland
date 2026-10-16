# Session 2026-10-16: Product brief feedback

- **Branch:** `docs/product-brief-feedback`
- **Story/task:** – (issue #7)
- **Prompt log:** [prompts/2026-10-16.md](../prompts/2026-10-16.md) (10:08–11:22)
- **Transcript:** [transcripts/2026-10-16-6a02e2ae.md](../transcripts/2026-10-16-6a02e2ae.md)

## Goal
Revise the product brief and addendum according to the teacher's feedback (`tilbakemelding-product-brief.en.md`) and settle the open decision D-006 (v1 scope) before the PRD.

## Key prompts
- 10:08 – Proposed `gh issue create` + `git switch -c docs/product-brief-feedback` and using the BMad analyst; asked for an opinion.
- 10:14 – "Coaching path, I agree with a smaller v1"
- 10:16 – "v1 is the course deliverable. Backup can be included later. But we need to plan for features in v2 now, so that implementation does not cause big rewrites"
- 10:23 – English as base UI language with a Norwegian pack on top; accommodate versioning in the data model, build the feature if time allows.
- 10:32 – Proposed three AI provider families (cloud: Gemini Flash, CLI: Claude, local: Gemma 4 12B via Ollama as fallback); all embedded metadata extracted and editable.
- 10:40 – CLI because the agency already has Claude Code and Codex; keep GPS for a later map; metadata corrections must reach the file itself.
- 10:45 – "Write on export, strip GPS for clients, Claude CLI first"
- 10:49 – Own draft of four success criteria; tenant branding to stage 2; filename matching as warning only.
- 10:51 – "List fits, small previews without watermark"
- 11:19 – "Accept all, keep the stage lists"

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Use `bmad-product-brief` (update mode) instead of the analyst persona, and `gh issue develop` to link branch and issue | Accepted | The brief skill is built for revising an existing brief; linking gives traceability. |
| Pushed back on "I agree": the brief's "not a classroom demo" framing conflicted with a smaller v1, and backup mattered if real data was used | Accepted – v1 reframed as the course deliverable on sample data; backup moved to stage 2 | No real agency data in v1. |
| Rule for v2 planning: a deferred feature gets a v1 accommodation only if it is a field or relation – then widened by the AI itself to include conventions that are free at the start (i18n, provider interface) | Accepted after the user was unsure and asked for the AI's view | Answers "avoid rewrites" without building speculative features. |
| Narrow the user's six AI integrations with fallback to one provider interface + mock + one real provider in v1; pointed out that Ollama cannot replace the mock for the examiner | Adjusted – the user picked the Claude CLI as the one provider, the rest moved to stage 2 | Scope; mock required for the examiner and tests. |
| Questioned the CLI provider as fragile (CLI installed and logged in on the server) | Rejected – the user kept the CLI | The agency already pays for Claude Code and Codex, so it is the cheapest option for them. |
| Writing metadata edits into the stored file would break hash-based duplicate detection; proposed write on export instead | Accepted | Keeps the hash stable and versions clean (D-011). |
| Drop filename matching or keep it only as a warning | Adjusted – kept as warning only | |
| Sharpened the user's four success criteria and added three from the session's decisions | Accepted | The user's "viewed only by those with access" and "fetching images independently" were not checkable as written. |
| Small preview without watermark for paid images | Accepted | Simplest choice that closes the gap in the access matrix. |
| Polish review: optional move of the stage lists to the addendum to reach the 1–2 page target | Rejected (the AI also recommended keeping them) | The teacher praised the clear In/Out split; the brief stays at ~1,590 words. |

## Bugs found in AI-generated code
- No code in this session.
- Content error caught on self-review: the AI added the CLI cost advantage under "What Makes This Different", which the brief warns against (no fabricated moats). Removed before showing the draft.
- Gap found while drafting the access matrix: what happens to a bought image if staff later restrict it. Logged as an open question for the PRD in the addendum.

## Commits
- `c45bbe0` docs(brief): revise product brief after teacher feedback [#7]

## Decisions
- [D-009: V1 scope after feedback on the product brief](../decisions.md#d-009-v1-scope-after-feedback-on-the-product-brief) (supersedes D-006)
- [D-010: AI providers for image metadata](../decisions.md#d-010-ai-providers-for-image-metadata)
- [D-011: Metadata is written into files on export, and GPS is stripped for clients](../decisions.md#d-011-metadata-is-written-into-files-on-export-and-gps-is-stripped-for-clients)

## Next steps
- Open a PR for `docs/product-brief-feedback` with `Closes #7`, then merge.
- Run `bmad-prd` in a fresh session on its own branch; settle the open question on access to bought images that are later restricted.
- Add seeded test users and freely licensed sample images early.
- Optional after the PRD: `bmad-ux` with sketches of the upload flow and client portal.
