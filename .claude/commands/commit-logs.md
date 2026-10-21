---
description: Commit and merge the uncommitted process files (prompts, sessions, transcripts, decisions) in their own PR, separate from code
argument-hint: ""
---

Commit everything uncommitted in `docs/process/` – possibly from several sessions – on its own branch, and merge it into `main` through a PR that contains only process files (D-013). The user running `/commit-logs` is permission to create the branch, commit, push, open the PR and merge it, for process files only. It is never permission to commit code.

## Procedure

1. **Preconditions** – stop and explain if any of these fail:
   - `git branch --show-current` is `main`. If not, tell the user to finish or park the code branch and `git checkout main` first. (Committing process files from a code branch leaves untracked copies that block switching back to `main`.)
   - `git status --porcelain --untracked-files=all` shows no changes outside `docs/process/`.
   - `git pull` succeeds.

2. **List the process files** that are changed or new: `git status --porcelain --untracked-files=all -- docs/process`. If there are none, say so and stop.

3. **Secret scan:** `python3 .claude/hooks/redact.py --scan <the files>` (skip deleted files). If it exits with 1: **stop**. Show the hits (they are masked in the output), commit nothing, and let the user fix the files.

4. **Topics:** take the topic from the `# Session YYYY-MM-DD: <topic>` heading of each new or changed session log. If no session log is included, use `prompt logs <dates>`.

5. **Push access:** `gh api repos/IBE160-2026/G53-kalland --jq '.permissions.push'`. If the answer is not `true`, stop and say so.

6. **Commit and push**
   1. `git switch -c docs/process-YYYY-MM-DD` (add `-2` etc. if the branch exists locally or on `origin`).
   2. `git add docs/process`
   3. `git commit -m "docs(process): <topics, comma-separated>"`
   4. `git push -u origin <branch>`

7. **PR and merge**
   1. `gh pr create --base main --title "docs(process): <topics>"`. The body lists the session logs, transcripts and prompt logs included (as links), any new or changed D-xxx, and states that the PR contains process files only.
   2. Wait for the `process-separation` check: `gh pr checks <n> --watch`. If it fails, stop and show the output.
   3. `gh pr merge <n> --merge`
   4. `git switch main && git pull`, then delete local branches whose remote is gone (command in `CLAUDE.md`).

8. **Report** the commit hash, the PR link, and the files included.

## Rules
- Only files under `docs/process/` are staged. Never `git add -A` or `git add .`.
- Do not edit process files here; fix problems by asking the user.
- English (see D-008).
