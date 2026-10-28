# CLAUDE.md

Solo project in IBE160 Programmering med KI (autumn 2026): CRM/DAM for a design agency. See the product brief and the teacher's feedback (English translation: `tilbakemelding-product-brief.en.md`) in `_bmad-output/planning-artifacts/briefs/brief-g53-kalland-2026-09-11/`.

The repo is graded against `docs/process/vurderingskriterier.en.md` (English translation of `vurderingskriterier.md`). **Process and AI governance counts 30 %**, so traceability from plan → prompt → commit → decision matters as much as the code.

## Language
- All docs, code, comments and commit messages are written in English. This includes `README.md`, `CLAUDE.md`, `docs/process/`, `.claude/commands/` and the BMad artifacts in `_bmad-output/` (`_bmad/config.toml`). (D-008)
- Originals of external Norwegian sources (the teacher's feedback, the grading guide summary) are kept unchanged. The English translation lives next to the original as `<name>.en.md`; refer to the English version.
- Historical prompt logs, session logs and transcripts are process evidence and are never translated or edited afterwards.
- The app's Norwegian UI strings and language packs are product content and stay Norwegian.

## Workflow
- Never commit directly to `main`. One branch per story/task: `story/<epic>.<story>-<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`. Process files go on `docs/process-<date>`, created only by `/commit-logs`. Exception (D-016): `/commit-logs` commits the process files on local `main` and pushes them only as `docs/process-<date>`, so they still reach `main` through a PR.
- Parallel sessions (D-016): each code session runs in its own git worktree, made with `.claude/scripts/start.sh <branch>` next to the main folder (`../g53-kalland-<slug>`). The main folder stays on `main` and only collects process files; the hooks and `/wrap-up` always write `docs/process/` there, never in a worktree.
- Merge via pull request. The PR description covers: what and why, a link to the story, how it was tested, and what was changed or rejected in AI suggestions.
- A PR that resolves an issue says `Closes #<n>` in its description, so the issue closes on merge. (D-012)
- Keep the repo tidy: a workflow (`.github/workflows/delete-merged-branch.yml`) deletes the remote branch on merge, and `fetch.prune` drops stale remote refs. After pulling `main`, delete local branches whose remote is gone: `git branch -vv | awk '/: gone]/{print $1}' | xargs -n1 git branch -d`. (D-012)
- Small, focused commits with descriptive messages in the form `type(scope): description [S-<epic>.<story>]`, e.g. `feat(upload): duplicate check with hash [S-2.3]`. Types: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`.
- Do not commit or push unless the user asks for it. `/wrap-up` counts as asking, after the user has confirmed its proposal (D-016).
- Exception (D-014): the teacher's `sesjonslogg` skill commits its own `.logs/` files as it is set up – on any branch, including local `main`, with the message `Logg: <title>`, without asking. It never pushes; log commits on local `main` reach GitHub with the next `/commit-logs` PR. The `process-separation` workflow ignores `.logs/`.

## Traceability and documentation
- Features must be traceable to a story in `_bmad-output/`. If the plan changes, update the BMad document **and** add an entry to `docs/process/decisions.md`.
- Choices of technology, architecture, scope or way of working → a new `D-xxx` in `docs/process/decisions.md`.
- Prompts are logged automatically to `docs/process/prompts/` (hook).
- The transcript of each session is saved as `docs/process/transcripts/<date>-<session-ID>.md` (user and Claude text only, redacted) by a SessionEnd hook when the session ends, so it covers the whole session. (D-016)
- Process files are committed separately from code (D-013). Code commits and code PRs never touch `docs/process/`; stage code by explicit path, never `git add -A` or `git add .`. The `process-separation` workflow fails a PR that mixes the two.
- Code PR descriptions link to the relevant session log(s) in `docs/process/sessions/` and reference decisions by ID (D-xxx). Each session log lists the code branch, commits and PR it worked on.
- Run `/grading-check` weekly and before the deadline.
- Reflection notes for the final reflection report live in `docs/reflections/notes.md`, one entry per session, added empty by `/wrap-up` and written by the user in their editor. The file is local only (gitignored). Never read, quote or log its content. The report template is `docs/reflections/reflection-report-template.en.md`.

## End-of-session routine
In Claude:
1. `/wrap-up <topic>` (D-016). On a code branch it shows one proposal (files, commit message, PR title and description) and waits for the user's ok; then it commits, pushes and opens the PR. It runs the teacher's `sesjonslogg` skill (see "Sesjonslogg" below), which commits `.logs/<user>/` as `Logg: <title>` (D-014), and pushes that commit to the PR. Last, it writes the session log and any decisions in the main folder's `docs/process/` and an empty reflection note. It never merges.
2. `/exit`. The SessionEnd hook writes the transcript.

In the terminal:
3. `.claude/scripts/finish.sh` (from the worktree, or with the PR number from anywhere): waits for the checks, merges the PR, removes the worktree, pulls `main` in the main folder and deletes local branches whose remote is gone.
4. Whenever the user chooses: `.claude/scripts/commit-logs.sh` (or `/commit-logs` in Claude). It needs the main folder on `main` with no changes outside `docs/process/`, and can run while other sessions are working. It scans the process files for secrets (stops on a hit), commits them on local `main`, pushes them as `docs/process-<date>` and merges that PR. `Logg:` commits made on local `main` are carried along. Running `/commit-logs` is permission for exactly that.

Sessions without code run in the main folder on `main`: `/wrap-up` skips the code step, and the `Logg:` commit stays on local `main` until the next `/commit-logs`.

- Running `/commit-logs` is never permission to commit code; `/wrap-up` commits code only after the user's ok.
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
