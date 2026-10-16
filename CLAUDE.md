# CLAUDE.md

Solo project in IBE160 Programmering med KI (autumn 2026): CRM/DAM for a design agency. See the product brief and the teacher's feedback (English translation: `tilbakemelding-product-brief.en.md`) in `_bmad-output/planning-artifacts/briefs/brief-g53-kalland-2026-09-11/`.

The repo is graded against `docs/process/vurderingskriterier.en.md` (English translation of `vurderingskriterier.md`). **Process and AI governance counts 30 %**, so traceability from plan → prompt → commit → decision matters as much as the code.

## Language
- All docs, code, comments and commit messages are written in English. This includes `README.md`, `CLAUDE.md`, `docs/process/`, `.claude/commands/` and the BMad artifacts in `_bmad-output/` (`_bmad/config.toml`). (D-008)
- Originals of external Norwegian sources (the teacher's feedback, the grading guide summary) are kept unchanged. The English translation lives next to the original as `<name>.en.md`; refer to the English version.
- Historical prompt logs, session logs and transcripts are process evidence and are never translated or edited afterwards.
- The app's Norwegian UI strings and language packs are product content and stay Norwegian.

## Workflow
- Never commit directly to `main`. One branch per story/task: `story/<epic>.<story>-<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`.
- Merge via pull request. The PR description covers: what and why, a link to the story, how it was tested, and what was changed or rejected in AI suggestions.
- A PR that resolves an issue says `Closes #<n>` in its description, so the issue closes on merge. (D-012)
- Keep the repo tidy: GitHub deletes the remote branch on merge, and `fetch.prune` drops stale remote refs. After pulling `main`, delete local branches whose remote is gone: `git branch -vv | awk '/: gone]/{print $1}' | xargs -n1 git branch -d`. (D-012)
- Small, focused commits with descriptive messages in the form `type(scope): description [S-<epic>.<story>]`, e.g. `feat(upload): duplicate check with hash [S-2.3]`. Types: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`.
- Do not commit or push unless the user asks for it.

## Traceability and documentation
- Features must be traceable to a story in `_bmad-output/`. If the plan changes, update the BMad document **and** add an entry to `docs/process/decisions.md`.
- Choices of technology, architecture, scope or way of working → a new `D-xxx` in `docs/process/decisions.md`.
- Prompts are logged automatically to `docs/process/prompts/` (hook). Commit the prompt log together with the work it belongs to.
- The transcript of each session is saved as `docs/process/transcripts/<date>-<session-ID>.md` (user and Claude text only, redacted). `/wrap-up` creates it; a SessionEnd hook creates it only if `/wrap-up` was not run.
- Run `/grading-check` weekly and before the deadline.

## End-of-session routine
1. Run `/wrap-up <topic>`. It writes the session log with a link to the transcript, updates `decisions.md`, scans the process files for secrets (stops on a hit), and commits and pushes **only** the process files. On `main` it creates a `docs/` branch and a PR instead. Running `/wrap-up` is permission for that commit and push.
2. End the session (`/exit`). Messages after `/wrap-up` are not included in the transcript; the commit shows the outcome. If you forget `/wrap-up`, the hook writes the transcript and the next `/wrap-up` commits it.
3. Do not create logs or transcripts for earlier sessions after the fact.
- When the user rejects or corrects a suggestion from you, it goes into the session log. Do not hide or embellish it.

## Code and quality
- Every feature ships with tests of meaningful logic (especially access rules: visibility × price). The test command in the README must always be correct.
- The external AI service (image metadata) must have a mock/test mode so the app can be run and tested without an API key.
- Validate input and handle errors with understandable messages.
- No dead code, commented-out leftovers or duplicated files from earlier attempts. Delete rather than comment out.
- Stay on task: do not rewrite files beyond what was asked.

## Security and tidiness
- Never secrets in code, prompts or logs. Configuration via environment variables; document all of them in `.env.example`.
- Do not commit `.env`, `node_modules`, `venv`, build folders or large binary files (see `.gitignore`).
- No loose files in the root folder. Documentation in `docs/`, planning in `_bmad-output/`.
- The grading guide (PDF) must not be versioned (D-004).

## README
Keep `README.md` up to date with: what the app does and for whom, prerequisites with versions, exact installation and startup commands, environment variables, test data, how to run the tests, a folder overview and a link to `docs/process/`.

## Push access
Pushing requires the GitHub account `marthekalland3`. Check `gh api repos/IBE160-2026/G53-kalland --jq '.permissions.push'` before pushing.
