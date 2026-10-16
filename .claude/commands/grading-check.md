---
description: Self-assessment of the repo against the seven criteria in the grading guide (part 1)
argument-hint: "[--no-save]"
---

Assess the repo the way the examiner will, against the criteria in `docs/process/vurderingskriterier.en.md` (English translation of `vurderingskriterier.md`; the Norwegian original is authoritative if they differ). Read that file first. This is a **read-only check**: do not change code or documents, except for saving the report at the end.

Arguments: $ARGUMENTS

## 1. Gather evidence

Run and note the result (adapt the commands if something does not exist yet):

**History and workflow (criterion 1)**
- `git log --format='%h %ad %an %s' --date=short` – distribution over time, message quality, story references.
- Commits per week: `git log --format='%ad' --date=format:'%G-W%V' | sort | uniq -c`.
- Large commits: `git log --shortstat --format='%h %s'` – flag commits with a very large number of changed lines.
- `git branch -a`, and `gh pr list --state all --limit 50` and `gh issue list --state all --limit 50` if `gh` is available.
- BMad documents in `_bmad-output/`: have they changed since they were created? (`git log --follow --format='%h %ad' --date=short -- <file>`)
- Prompt logs in `docs/process/prompts/`, session logs in `docs/process/sessions/`, `docs/process/decisions.md`: do they exist, are they up to date, and do they refer to concrete commits?

**Functionality (2)** – compare the core flows in the brief/PRD with what exists in the code and README. Are deviations justified in `decisions.md`?

**Testing (3)** – find test files and the test command; run the tests if the README describes how. Is there evidence of review of AI code (PR comments, session logs with "Bugs found in AI-generated code")?

**Design (4)** – are there UX documents, sketches or screenshots? Spot-check accessibility in components (labels, alt text).

**Code (5)** – does the folder structure match the architecture document? Is there linter/formatter config? Search for commented-out code and `TODO`/`FIXME`.

**README (6)** – check that the README has: description, prerequisites with versions, installation, startup, environment variables + `.env.example`, test command, folder overview, link to `docs/process/`. Check that the commands in the README exist (e.g. scripts in `package.json`).

**Tidiness (7)**
- `git ls-files | grep -Ei '(^|/)\.env($|\.)|node_modules/|(^|/)venv/|\.venv/|(^|/)(dist|build|\.next)/'` (except `.env.example`).
- Search for secrets in tracked files: `git grep -nIE '(sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY)'`.
- Loose files in the root folder: `git ls-files | grep -v /`.
- Large binary files: files over 1 MB among `git ls-files`.

## 2. Assess

For each criterion: give an **estimated letter grade**, 1–3 lines of rationale with concrete evidence (file path, commit hash, command output) and what it takes to reach the next level. Use the descriptors for A–B / C / D–E / F in the summary. Be strict: if something does not exist yet, assess it as it is now, and say that this is expected at this stage.

Calculate the weighted score (A=5 … F=0; weights 0.30 / 0.20 / 0.15 / 0.10 / 0.10 / 0.10 / 0.05) and the part grade (A ≥ 4.5 · B ≥ 3.5 · C ≥ 2.5 · D ≥ 1.5 · E ≥ 0.5).

List every **warning sign** that applies.

## 3. Report

Show the report in the terminal:

```markdown
# Self-assessment YYYY-MM-DD (commit `<hash>`, branch `<branch>`)

| # | Criterion | Weight | Estimate | Evidence | To reach the next level |
|---|---|---|---|---|---|
...
**Weighted score:** x.xx → <grade>

## Warning signs
## Three most important actions now
```

Unless the argument `--no-save` is given: save the report as `docs/process/grading-checks/YYYY-MM-DD.md` (add `-2` etc. if the file exists), and briefly compare it with the previous report in the folder if there is one.
