# CLAUDE.md

Solo project in IBE160 Programmering med KI (autumn 2026): CRM/DAM for a design agency. See the product brief and the teacher's feedback (English translation: `tilbakemelding-product-brief.en.md`) in `_bmad-output/planning-artifacts/briefs/brief-g53-kalland-2026-09-11/`.

The repo is graded against `docs/process/vurderingskriterier.en.md` (English translation of `vurderingskriterier.md`). **Process and AI governance counts 30 %**, so traceability from plan → prompt → commit → decision matters as much as the code.

## Language
- All docs, code, comments and commit messages are written in English. This includes `README.md`, `CLAUDE.md`, `docs/process/`, `.claude/commands/` and the BMad artifacts in `_bmad-output/` (`_bmad/config.toml`). (D-008)
- Originals of external Norwegian sources (the teacher's feedback, the grading guide summary) are kept unchanged. The English translation lives next to the original as `<name>.en.md`; refer to the English version.
- Historical prompt logs, session logs and transcripts are process evidence and are never translated or edited afterwards.
- The app's Norwegian UI strings and language packs are product content and stay Norwegian.

## Workflow
- Never commit directly to `main`. One branch per story/task: `story/<epic>.<story>-<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`. Process files go on `docs/process-<date>`, created only by `/commit-logs`.
- Merge via pull request. The PR description covers: what and why, a link to the story, how it was tested, and what was changed or rejected in AI suggestions.
- A PR that resolves an issue says `Closes #<n>` in its description, so the issue closes on merge. (D-012)
- Keep the repo tidy: a workflow (`.github/workflows/delete-merged-branch.yml`) deletes the remote branch on merge, and `fetch.prune` drops stale remote refs. After pulling `main`, delete local branches whose remote is gone: `git branch -vv | awk '/: gone]/{print $1}' | xargs -n1 git branch -d`. (D-012)
- Small, focused commits with descriptive messages in the form `type(scope): description [S-<epic>.<story>]`, e.g. `feat(upload): duplicate check with hash [S-2.3]`. Types: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`.
- Do not commit or push unless the user asks for it.

## Traceability and documentation
- Features must be traceable to a story in `_bmad-output/`. If the plan changes, update the BMad document **and** add an entry to `docs/process/decisions.md`.
- Choices of technology, architecture, scope or way of working → a new `D-xxx` in `docs/process/decisions.md`.
- Prompts are logged automatically to `docs/process/prompts/` (hook).
- The transcript of each session is saved as `docs/process/transcripts/<date>-<session-ID>.md` (user and Claude text only, redacted). `/wrap-up` creates it; a SessionEnd hook creates it only if `/wrap-up` was not run.
- Process files are committed separately from code (D-013). Code commits and code PRs never touch `docs/process/`; stage code by explicit path, never `git add -A` or `git add .`. The `process-separation` workflow fails a PR that mixes the two.
- Code PR descriptions link to the relevant session log(s) in `docs/process/sessions/` and reference decisions by ID (D-xxx). Each session log lists the code branch, commits and PR it worked on.
- Run `/grading-check` weekly and before the deadline.

## End-of-session routine
1. Run `/wrap-up <topic>`. It writes the transcript, the session log (with a link to the transcript and the code branch, commits and PR) and updates `decisions.md`, all in `docs/process/`. It runs no git commands that change anything.
2. End the session (`/exit`). Messages after `/wrap-up` are not included in the transcript. If you forget `/wrap-up`, the SessionEnd hook writes the transcript.
3. Whenever the user chooses, on `main` with no code changes in progress: run `/commit-logs`. It scans the process files for secrets (stops on a hit), commits everything uncommitted in `docs/process/` (possibly several sessions) on `docs/process-<date>`, pushes, and merges it through its own PR. Running `/commit-logs` is permission for exactly that.
- Running `/wrap-up` or `/commit-logs` is never permission to commit code.
- Do not create logs or transcripts for earlier sessions after the fact.
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

## Sesjonslogg

Når en oppgave eller økt avsluttes, før sluttoppsummeringen, bruk `sesjonslogg`-skillen: dokumenter Oppgave + Plan + Resultat + åpne punkter i `.logs/<bruker>/`, og før åpne punkter i `.logs/<bruker>/issues.md`. Skillen committer loggfila lokalt; push gjør du selv. Gruppens egne regler for commit og språk gjelder foran dette.
