---
description: End the session – session log with a link to the transcript, decision log, secret scan, commit and push of process files
argument-hint: "[short topic for the session]"
---

End this working session. The session log is evidence for criterion 1 (process and AI governance) and 3 (quality assurance) in `docs/process/vurderingskriterier.en.md`, so it must be **concrete and tied to actual changes**, not generic. The user running `/wrap-up` is permission to commit and push the process files (step 6), but no other code.

Topic from the user: $ARGUMENTS

## Procedure

1. **Gather facts**
   - Read through the conversation in this session.
   - Find the previous session log in `docs/process/sessions/` (newest file) and run `git log --oneline --since="<date of previous session> 00:00"` on the current branch (without a time of day git reads the date as the current time of day on that date, and commits earlier the same day are dropped), as well as `git status --short` and `git branch --show-current`.
   - Read today's prompt log in `docs/process/prompts/YYYY-MM-DD.md`. The **session ID** is the 8 characters in `session \`xxxxxxxx\`` in the newest entry (the one that logged `/wrap-up`); entries written before D-008 use `økt \`xxxxxxxx\``. Find the times of the prompts with the same session ID.

2. **Create the transcript** for this session now, so it is included in the same commit:
   `python3 .claude/hooks/transcript-to-md.py --session <session-ID>`
   The script prints the file path (`docs/process/transcripts/<date>-<session-ID>.md`). Run it again if you have to change the draft, so the transcript includes it. The SessionEnd hook does not touch the file afterwards, so messages after this step are not included.

3. **Write a draft** of `docs/process/sessions/YYYY-MM-DD-<slug>.md` (slug from the topic, lowercase, hyphens; add `-2` etc. if the file exists) with this structure:

   ```markdown
   # Session YYYY-MM-DD: <topic>

   - **Branch:** `<branch>`
   - **Story/task:** <story ID or "–">
   - **Prompt log:** [prompts/YYYY-MM-DD.md](../prompts/YYYY-MM-DD.md) (HH:MM–HH:MM)
   - **Transcript:** [transcripts/<date>-<session-ID>.md](../transcripts/<date>-<session-ID>.md)

   ## Goal
   ## Key prompts
   (Short quote or paraphrase, with the time from the prompt log.)
   ## AI suggestions and our assessment
   | AI suggested | We did | Why |
   |---|---|---|
   (Accepted / Adjusted / Rejected. Include at least one example of an adjustment or rejection if one happened – do not fabricate one.)
   ## Bugs found in AI-generated code
   (What, how it was discovered – test, review, manual run – and how it was fixed. "None" is a valid answer.)
   ## Commits
   (`hash` message)
   ## Decisions
   (Links to D-xxx in decisions.md)
   ## Next steps
   ```

4. **Decisions:** For every real choice about technology, architecture, scope or way of working in the session, propose a new `D-xxx` entry in `docs/process/decisions.md` following the template there. Update the status of existing entries if the session settled an open decision.

5. **Show the draft** (session log + changes to decisions.md) to the user and **wait for approval**. Write the files once the draft is approved.

6. **Secret scan, commit and push**
   1. List the process files that are changed or new: `git status --porcelain --untracked-files=all -- docs/process` (skip deleted files).
   2. Run `python3 .claude/hooks/redact.py --scan <the files>`. If it exits with 1: **stop**. Show the hits (they are masked in the output), commit nothing, and let the user fix the files.
   3. Branch: if you are on a working branch, commit there. If you are on `main`, create `docs/wrap-up-<date>-<session-ID>` first (never commit to `main`).
   4. `git add docs/process` and commit **only** process files: `docs(process): session log <topic> [S-<epic>.<story>]` (leave out the story tag if the session does not belong to a story). Leave other uncommitted changes in place and mention them to the user.
   5. Check push access: `gh api repos/IBE160-2026/G53-kalland --jq '.permissions.push'`. If the answer is not `true`, stop and say so.
   6. `git push -u origin <branch>`. If the branch was created in step 3, open a PR against `main` with `gh pr create`, but do not merge it.
   7. Report the commit hash, branch and any PR link. Mention transcripts from earlier sessions that were committed now (written by the hook because `/wrap-up` was not run).

## Rules
- Write only what actually happened. Do not invent rejections, bugs or rationales; ask the user if the rationale for a choice is unclear.
- Do not create transcripts or logs for earlier sessions after the fact; logs must not be reconstructed.
- No secrets, tokens or content from `.env` in the log.
- English (see D-008).
