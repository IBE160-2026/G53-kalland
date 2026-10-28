# G53 — Marthe

Solo project in **IBE160 Programmering med KI** (Programming with AI) at Molde University College, autumn 2026 (15 ECTS).

The repo contains the application and documentation of how it was developed, tested and quality-assured with AI.

## Member

- Marthe Kalland (solo project)

## Tests

The application has not been built yet. The process logging tools (`.claude/hooks/`, `.claude/scripts/`) have tests that need Python 3.10 or newer and git 2.31 or newer:

```bash
python3 -m unittest discover -s .claude/hooks/tests
```

## Working sessions

Several Claude sessions can write code at once, each in its own git worktree ([D-016](docs/process/decisions.md#d-016-parallel-sessions-in-worktrees-and-a-one-command-session-end)). The main folder stays on `main` and collects the process files from every session. The scripts need the GitHub CLI (`gh`), logged in as `marthekalland3`.

```bash
.claude/scripts/start.sh story/1.2-upload   # new worktree ../g53-kalland-1.2-upload on a new branch from origin/main
cd ../g53-kalland-1.2-upload && claude      # work; end with /wrap-up <topic>, then /exit
.claude/scripts/finish.sh                   # wait for checks, merge the PR, remove the worktree, pull main
.claude/scripts/commit-logs.sh              # any time: commit docs/process/ through its own PR
```

`start.sh` copies `.env` from the main folder into the worktree. Dependencies (`node_modules`, `venv`) are installed per worktree.

## Process documentation

Process documentation lives in `docs/process/` on `main`, but is committed in its own `docs/process-*` pull requests, separate from code ([D-013](docs/process/decisions.md#d-013-process-files-are-committed-separately-from-code)).

- [Process documentation – overview](docs/process/README.md)
- [Grading criteria (summary, English)](docs/process/vurderingskriterier.en.md) · [Norwegian original](docs/process/vurderingskriterier.md)
- [Decision log](docs/process/decisions.md)
- [Planning documents (BMad)](_bmad-output/planning-artifacts/)
- Conventions for AI-assisted development: [CLAUDE.md](CLAUDE.md)
