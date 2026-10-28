---
description: End the session – transcript, session log with a link to the transcript, and decision log (documentation only, no commits)
argument-hint: "[short topic for the session]"
---

End this working session. The session log is evidence for criterion 1 (process and AI governance) and 3 (quality assurance) in `docs/process/vurderingskriterier.en.md`, so it must be **concrete and tied to actual changes**, not generic.

This command only writes documentation in `docs/process/`, plus an empty entry in the local reflection notes (`docs/reflections/notes.md`). It never stages, commits, pushes, switches branches or opens PRs; process files are committed later with `/commit-logs` (D-013). Running `/wrap-up` is not permission to commit anything.

Topic from the user: $ARGUMENTS

## Procedure

1. **Gather facts** (read-only commands only)
   - Read through the conversation in this session.
   - Find the previous session log in `docs/process/sessions/` (newest file) and run `git log --oneline --since="<date of previous session> 00:00"` on the current branch (without a time of day git reads the date as the current time of day on that date, and commits earlier the same day are dropped), as well as `git status --short` and `git branch --show-current`.
   - Find the PR for the code branch, if there is one: `gh pr list --head <branch> --state all --json number,url,state`.
   - Read today's prompt log in `docs/process/prompts/YYYY-MM-DD.md`. The **session ID** is the 8 characters in `session \`xxxxxxxx\`` in the newest entry (the one that logged `/wrap-up`); entries written before D-008 use `økt \`xxxxxxxx\``. Find the times of the prompts with the same session ID.

2. **Create the transcript** for this session:
   `python3 .claude/hooks/transcript-to-md.py --session <session-ID>`
   The script prints the file path (`docs/process/transcripts/<date>-<session-ID>.md`). Run it again after the draft is approved, so the transcript includes the discussion of the draft. The SessionEnd hook does not touch the file afterwards, so messages after this step are not included.

3. **Write a draft** of `docs/process/sessions/YYYY-MM-DD-<slug>.md` (slug from the topic, lowercase, hyphens; add `-2` etc. if the file exists) with this structure:

   ```markdown
   # Session YYYY-MM-DD: <topic>

   - **Story/task:** <story ID, issue or "–">
   - **Prompt log:** [prompts/YYYY-MM-DD.md](../prompts/YYYY-MM-DD.md) (HH:MM–HH:MM)
   - **Transcript:** [transcripts/<date>-<session-ID>.md](../transcripts/<date>-<session-ID>.md)

   ## Code
   - **Branch:** `<code branch>`
   - **Commits:** (`hash` message, one per line; "None" if the session made no commits)
   - **PR:** #<n> (<state>) or "Not opened yet"

   ## Goal
   ## Key prompts
   (Short quote or paraphrase, with the time from the prompt log.)
   ## AI suggestions and our assessment
   | AI suggested | We did | Why |
   |---|---|---|
   (Accepted / Adjusted / Rejected. Include at least one example of an adjustment or rejection if one happened – do not fabricate one.)
   ## Bugs found in AI-generated code
   (What, how it was discovered – test, review, manual run – and how it was fixed. "None" is a valid answer.)
   ## Decisions
   (Links to D-xxx in decisions.md)
   ## Next steps
   ```

4. **Decisions:** For every real choice about technology, architecture, scope or way of working in the session, propose a new `D-xxx` entry in `docs/process/decisions.md` following the template there. Update the status of existing entries if the session settled an open decision.

5. **Show the draft** (session log + changes to decisions.md) to the user and **wait for approval**. Write the files once the draft is approved, then rerun the transcript script (step 2).

6. **Reflection note.** After the final transcript run, append an empty entry for this session to `docs/reflections/notes.md` (local only, gitignored). Append with a shell heredoc (`cat >> docs/reflections/notes.md`) so earlier entries are never read; create the file with the heading `# Reflection notes` first if it does not exist. The section numbers refer to `docs/reflections/reflection-report-template.en.md`.

   ```markdown

   ## YYYY-MM-DD · session <session-ID> · <topic>
   Session log: [sessions/YYYY-MM-DD-<slug>.md](../process/sessions/YYYY-MM-DD-<slug>.md)

   **What did I do, and how did I use AI?** (2.4)

   **Problem or challenge, and how was it solved? What role did AI play?** (3.1, 3.3)

   **Where did AI help, and where did it go wrong or have to be corrected?** (4.1, 4.2, 6.2)

   **Did I understand what was made, or did I just accept it?** (4.2, 5.3)

   **What did I learn?** (7.1)

   **Other thoughts** (ethics, data sharing, what I would do differently) (5, 7.2)
   ```

   Then ask the user to open `docs/reflections/notes.md` in their editor and write the reflection in their own words there, not in the chat (the chat is logged to prompts and transcripts).

7. **Report** every file created or changed in `docs/process/` (path and one line on what changed), and remind the user to `/exit` and to run `/commit-logs` on `main` when they want the process files committed.

## Rules
- Write only what actually happened. Do not invent rejections, bugs or rationales; ask the user if the rationale for a choice is unclear.
- Do not create transcripts or logs for earlier sessions after the fact; logs must not be reconstructed.
- No secrets, tokens or content from `.env` in the log.
- Never read, quote or summarise `docs/reflections/notes.md`, and never mention its content in the session log, transcript or decisions.
- English (see D-008).
