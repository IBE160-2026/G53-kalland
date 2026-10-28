---
description: Commit and merge the uncommitted process files (prompts, sessions, transcripts, decisions) in their own PR, separate from code
argument-hint: ""
---

Run `.claude/scripts/commit-logs.sh` (D-013, D-016). The user running `/commit-logs` is permission for what the script does: commit `docs/process/` on local `main` in the main folder, push it as `docs/process-<date>`, open the PR, wait for the checks and merge it. It is never permission to commit code.

The script stops on its own if the main folder is not on `main`, has changes outside `docs/process/`, the `gh` account cannot push, or the secret scan finds something. Do not work around a stop and do not edit process files: report the output (secret hits are masked) and let the user decide.

Finally report the PR link and the commit from the script's output.
