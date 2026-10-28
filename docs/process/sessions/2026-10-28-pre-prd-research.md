# Session 2026-10-28: pre-PRD research and client-model brainstorm

- **Story/task:** – (pre-PRD planning; feeds `bmad-prd`)
- **Prompts:** [prompts/2026-10-28.md](../prompts/2026-10-28.md) (10:54–12:36)
- **Transcript:** [transcripts/2026-10-28-e8441b23.md](../transcripts/2026-10-28-e8441b23.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/995-2026-10-28-12-37-44-pre-prd-research.md](../../../.logs/marthekalland3/995-2026-10-28-12-37-44-pre-prd-research.md)
- **Branch and PR:** `docs/pre-prd-research`, #22 (open)
- **Commits:**
  - `69d6285` docs(research): Claude Code CLI vs Claude API as metadata provider
  - `bd5f1ca` docs(brainstorm): client model, licences and access edge cases
  - `1bf38d9` docs(brief): client model, licences, revoke and Claude API provider
  - `c5946b5` Logg: pre-prd-research

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Research and brainstorm topics to cover before the PRD, CLI research first | Accepted | The user chose the suggested route |
| Claude Code CLI not usable as backend provider; Claude API with Haiku-class model instead | Accepted, extended | The user added an admin settings page for the AI provider and key, so keys can be swapped (also by the examiner). Claude kept `.env` as the default, with the settings page as an override |
| Creative Partner mode for the brainstorm | Rejected | The user chose "Ideate for me" |
| Free→paid: downloads made while free do not grant access | Rejected | The user ruled that earlier purchases *and* downloads are kept. This led to free downloads creating a 0 kr licence |
| Optional licence text field | Adjusted | The user reframed purchases as licences, with one type (standard commercial use) and a standard text in v1 |
| "View as client" as a stretch goal | Adjusted | Moved out of v1 to later features. The user first needed it explained |
| Setup link vs temporary password for first login | Accepted, setup link | The user first needed the question clarified |
| Licences survive unsharing | Accepted, extended | The user required a way to remove access anyway. Claude proposed a revoke workflow with a warning, a reason and "remove anyway"; permanent file deletion is left out of v1 |

The session started in the main folder on `main`. The user noticed that no worktree had been set up, and the research folder was moved into `docs/pre-prd-research` before the brainstorm.

Claude departed from the skills' methods in several ways:
- It ran the research inline without subagents, as agreed at the plan gate.
- It did the semantic citation check itself instead of using a fresh-context subagent.
- It wrote the brainstorm keepsake page itself instead of delegating it to a subagent.
- It did not render the HTML research briefing or run the `bmad-review` polish.

Two of Claude's questions (credentials, and "unsharing") were unclear the first time and had to be rephrased.

## Bugs found in AI-generated code
None (documents only, no code).

## Decisions
- [D-017](../decisions.md#d-017-claude-api-not-the-claude-code-cli-as-the-real-metadata-provider): Claude API, not the Claude Code CLI, as the real metadata provider
- [D-018](../decisions.md#d-018-client-organisations-licences-that-survive-changes-and-a-revoke-action): client organisations, licences that survive changes, and a revoke action
