---
description: End the session – commit, push and open the PR (after one confirmation), run sesjonslogg, and write the session log and decisions
argument-hint: "[short topic for the session]"
---

End this working session in one go (D-016). The session log is evidence for criterion 1 (process and AI governance) and 3 (quality assurance) in `docs/process/vurderingskriterier.en.md`, so it must be **concrete and tied to actual changes**, not generic. Keep it short: what the teacher's log and the transcript already hold is linked, not repeated.

Topic from the user: $ARGUMENTS

## 1. Facts (read-only)
- The prompt hook added `Session ID: <id>. Main checkout: <path>` to this prompt. Use them; do not guess the ID from files. All process files are written under `<main>/docs/process/`, also when this session runs in a worktree.
- `git branch --show-current`, `git status --short`, `git log --oneline origin/main..HEAD`, `gh pr list --head <branch> --state all --json number,url,state`.
- Prompt times: `grep -h "session \`<id>\`" <main>/docs/process/prompts/*.md` (first and last time).
- Do not read the prompt log, earlier session logs or `decisions.md` in full.

## 2. Code (only on a code branch with changes, unpushed commits or no PR)
1. Check push access: `gh api repos/IBE160-2026/G53-kalland --jq '.permissions.push'` must be `true`.
2. Show **one** short proposal and wait for the user's "ok" or corrections. This is the only confirmation in the command:
   - the files to commit, by explicit path (never `git add -A` or `git add .`, never anything under `docs/process/`);
   - the commit message(s): `type(scope): description [S-<epic>.<story>]`;
   - the PR title and description: what and why, link to the story, how it was tested, the AI-suggestion table (section 4), decisions by ID, `Closes #<n>` if an issue is resolved, and a link to the session log at `https://github.com/IBE160-2026/G53-kalland/blob/main/docs/process/sessions/<file>` (it works once `/commit-logs` has run).
3. After the ok: commit, `git push -u origin <branch>`, and `gh pr create` (or only push if the PR exists). Never merge.

Running `/wrap-up` is permission for exactly these steps after the ok, for the current branch only.

## 3. Teacher's log
Run the `sesjonslogg` skill as it is set up (it writes `.logs/<user>/` and commits `Logg: <title>`). On a code branch, `git push` afterwards so the commit joins the PR.

## 4. Session log
Write `<main>/docs/process/sessions/YYYY-MM-DD-<slug>.md` directly (slug from the topic, lowercase, hyphens; add `-2` etc. if the file exists). No draft in the chat: the user reviews the file afterwards. Reuse the table from the PR description.

```markdown
# Session YYYY-MM-DD: <topic>

- **Story/task:** <story ID, issue or "–">
- **Prompts:** [prompts/YYYY-MM-DD.md](../prompts/YYYY-MM-DD.md) (HH:MM–HH:MM)
- **Transcript:** [transcripts/YYYY-MM-DD-<id>.md](../transcripts/YYYY-MM-DD-<id>.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/<user>/<file>.md](../../../.logs/<user>/<file>.md)
- **Branch and PR:** `<branch>`, #<n> (<state>), or "no code"
- **Commits:** `hash` message, one per line, or "None"

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
(Accepted / Adjusted / Rejected. Include every adjustment or rejection by the user; do not fabricate one.)

## Bugs found in AI-generated code
(What, how it was found – test, review, manual run – and how it was fixed. "None" is a valid answer.)

## Decisions
(Links to D-xxx, or "None")
```

## 5. Decisions
For every real choice about technology, architecture, scope or way of working, append a `D-xxx` entry to `<main>/docs/process/decisions.md` following the template at the top of the file. Find the number right before writing: `grep '^## D-' <main>/docs/process/decisions.md | tail -1`, plus one (another session may have taken a number meanwhile). Update the status of an existing entry only if the session settled it.

## 6. Reflection note
Append an empty entry to `<main>/docs/reflections/notes.md` (local only, gitignored) with a shell heredoc (`cat >> …`), so earlier entries are never read; create the file with the heading `# Reflection notes` first if it does not exist. The section numbers refer to `docs/reflections/reflection-report-template.en.md`.

```markdown

## YYYY-MM-DD · session <id> · <topic>
Session log: [sessions/YYYY-MM-DD-<slug>.md](../process/sessions/YYYY-MM-DD-<slug>.md)

**What did I do, and how did I use AI?** (2.4)

**Problem or challenge, and how was it solved? What role did AI play?** (3.1, 3.3)

**Where did AI help, and where did it go wrong or have to be corrected?** (4.1, 4.2, 6.2)

**Did I understand what was made, or did I just accept it?** (4.2, 5.3)

**What did I learn?** (7.1)

**Other thoughts** (ethics, data sharing, what I would do differently) (5, 7.2)
```

## 7. Report
A few lines: the PR link, the files written in `docs/process/`, and next steps: write the reflection in `docs/reflections/notes.md` in the editor (not in the chat), `/exit` (the SessionEnd hook writes the transcript), then in the terminal `.claude/scripts/finish.sh` to merge, and `.claude/scripts/commit-logs.sh` whenever the user wants the process files committed.

## Rules
- Write only what actually happened. Do not invent rejections, bugs or rationales; ask the user if the rationale for a choice is unclear.
- Do not create transcripts or logs for earlier sessions after the fact.
- No secrets, tokens or content from `.env` in the log or the PR.
- Never read, quote or summarise `docs/reflections/notes.md`.
- English (see D-008).
