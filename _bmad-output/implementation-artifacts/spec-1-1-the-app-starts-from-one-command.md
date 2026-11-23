---
title: 'Story 1.1: The app starts from one command'
type: 'feature'
created: '2026-11-23'
status: 'done'
baseline_commit: '1329445c08f0f046493462cc8b219e24077c9eb8'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/epics.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** There is no application yet. The examiner must be able to start the app and run its tests from the README with Docker Compose and no API key, and every later story needs a foundation (scaffold, Compose, migrations, test harness, CI) to build on.

**Approach:** Scaffold Next.js with the spine's exact `create-next-app` flags. Add a Dockerfile and a Compose file with `db` → `migrate` → `app` plus a `test` profile (Vitest + Playwright against a fresh test DB). Add the first Drizzle migration, `/api/health`, a CI workflow and README v0.

## Boundaries & Constraints

**Always:** Pin exact versions from the spine's Stack table (`save-exact`); install only packages this story uses, so later stories add theirs. Compose works without a `.env` file (defaults via `${VAR:-default}`, `AI_PROVIDER=mock`). Only image builds need network. Schema changes only via `drizzle-kit generate`. The test-DB reset refuses to run unless its target is `TEST_DATABASE_URL` and differs from `DATABASE_URL`. UI text comes from `messages/en.json`. No DB access in `src/app/` (AD-2).

**Never:** No `worker` service (FR-15, bonus, later). No auth, seed users, Designsystemet theme or shells (stories 1.2, 1.3, 1.7). No `drizzle-kit push`. No starter demo leftovers (example SVGs, demo CSS, boilerplate copy). Do not touch `docs/process/`, `CLAUDE.md` or `.claude/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Health OK | DB reachable | `GET /api/health` → 200 `{"status":"ok"}` | N/A |
| Health DB down | DB unreachable | 503 `{"status":"unavailable"}`, no stack trace or connection string in the body | caught; no throw |
| Reset guard | reset target equals `DATABASE_URL`, or `TEST_DATABASE_URL` unset | refuses with a plain message, exits non-zero, DB untouched | explicit check before any SQL |
| Migrate without config | `DATABASE_URL` unset | `migrate` exits non-zero with "DATABASE_URL is not set…" | explicit check |
| IIM UTF-8 | 32 × "æ" (64 bytes) as IPTC title | reads back unchanged, `CodedCharacterSet` = UTF8 | N/A |

</frozen-after-approval>

## Code Map

- Repo today: no app code. Keep `README.md` (extend it), `.gitignore` (merge Next.js entries, add `/storage/`), `.github/workflows/process-separation.yml` and `delete-merged-branch.yml` (unchanged), `.claude/hooks/tests` (Python, untouched; README keeps its command).
- `.env` in the worktree holds a real `ANTHROPIC_API_KEY` — never print, copy or commit it.
- Toolchain: Node 26.7 locally, Docker 29 with Compose v2, `create-next-app@16.4.6` exists on npm.

## Tasks & Acceptance

**Execution:**
- [x] scaffold -- run `npx create-next-app@16.4.6 <tmp> --ts --app --src-dir --eslint --no-tailwind --no-cache-components --no-agent-feedback --use-npm`, copy into the repo without overwriting README/CLAUDE.md, remove demo content, pin exact versions (TypeScript 5.9.3, react 19.3.1, next 16.4.6) -- AD-1
- [x] `next.config.ts` -- `serverExternalPackages: ['exiftool-vendored','sharp']`, `output: 'standalone'` only if the Dockerfile uses it, next-intl plugin -- AC 3
- [x] `src/db/{client.ts,schema/accounts.ts,tenant.ts,migrate.ts,reset-test.ts}`, `drizzle.config.ts`, `src/db/migrations/` -- pg pool + drizzle; `tenants` table (uuid v7 default `uuidv7()`, name, `created_at timestamptz`); `DEFAULT_TENANT_ID` constant; a custom migration inserting that tenant; migrate runner; guarded test-DB reset (drop + recreate `public`, migrate, empty the test file dir) -- AD-24, conventions
- [x] `src/db/health.ts` + `src/app/api/health/route.ts` -- `checkDatabase()` runs `select 1`; route returns 200/503 per the matrix, `dynamic = 'force-dynamic'`
- [x] `src/modules/<each>/index.ts`, `src/db/seed/.gitkeep`, `src/worker/.gitkeep`, `tests/e2e/`, `data/places/.gitkeep`, `scripts/.gitkeep` -- spine source tree; each module `index.ts` has a one-line comment naming the tables it owns (AD-3) and `export {}`
- [x] `messages/en.json`, `src/i18n/request.ts`, `src/app/{layout,page}.tsx` -- next-intl without locale routing; root page shows the app name and "The app is running." from messages
- [x] `Dockerfile`, `.dockerignore` -- `node:26-bookworm-slim` (newest 26.x tag) + Debian `perl`; full deps (tests run in this image); `next build`; non-root user
- [x] `docker-compose.yml`, `docker/db/init-test-db.sql` -- `db` (postgres:18.7, healthcheck, volume at `/var/lib/postgresql`, init script creates the test DB), `migrate` (one-shot), `app` (port 3000, depends on `migrate` completed, healthcheck on `/api/health`, files volume at `FILE_STORE_DIR`); profile `test`: `unit` (Vitest), `app-test` (reset test DB + start on test DB/dir), `e2e` (`mcr.microsoft.com/playwright:v1.65.0-noble`)
- [x] `vitest.config.ts`, `src/test/global-setup.ts`, `playwright.config.ts` -- Vitest globalSetup resets the test DB; Playwright `baseURL` = app-test
- [x] tests: `src/db/health.test.ts` (ok + unreachable DB), `src/db/migrate.test.ts` (default tenant row exists), `src/db/reset-test.test.ts` (guard refuses), `src/modules/media/exiftool.test.ts` (IIM round-trip), `src/config.test.ts` (`.env.example` has exactly the 13 vars; `next.config` externals), `tests/e2e/smoke.spec.ts` (health 200, root page text) -- matrix + ACs
- [x] `.env.example` -- exactly the 13 variables, with comments and safe defaults
- [x] `.gitattributes` -- `eol=lf` on `*.sh`, `Dockerfile*`, `*.py`, `.claude/scripts/*`, `docker/**`
- [x] `.github/workflows/ci.yml` -- on `pull_request` and push to `main`, `paths-ignore` `docs/process/**` and `.logs/**`; build images and run the README test command; non-zero on any test failure
- [x] `README.md` -- what/for whom, prerequisites with versions, start and test commands, env vars, folder overview, process links (keep the existing sections)

**Acceptance Criteria:**
- Given a fresh clone with Docker Compose v2 and no `.env`, when I run `docker compose up --build`, then `db` (healthy) → `migrate` (exits 0) → `app` start in order and `GET http://localhost:3000/api/health` returns 200.
- Given the `test` profile, when I run the README test command, then Vitest runs against the freshly reset test DB and Playwright runs the smoke test against `app-test`, both outputs are visible, and the command exits non-zero if either fails.
- Given the repo, then it has the spine source tree, pinned versions, `.env.example` with exactly the 13 vars, `.env` and `/storage/` gitignored, and `.gitattributes` with `eol=lf` on scripts and Dockerfiles.
- Given a push to `main` or a PR, when CI runs on `ubuntu-latest`, then it builds the images and runs the same test command; a failing test fails the check.

## Design Notes

**One test command.** Preferred: `docker compose --profile test up --build --abort-on-container-failure --exit-code-from e2e` style, with `app-test` depending on `unit` completing successfully and `e2e` on `app-test` healthy, so the output of every service shows. If Compose's flags do not allow that (one-shot exits aborting the run), fall back to `docker compose --profile test run --rm --build unit && docker compose --profile test run --rm e2e`. Verify locally and record the result in Implementation Notes.

**First migration.** `tenants` gives the migration pipeline a real table and backs `DEFAULT_TENANT_ID`; `users`, `clients` etc. come with their stories.

## Verification

**Commands:**
- `docker compose up --build -d && curl -fsS localhost:3000/api/health` -- expected: `{"status":"ok"}`
- README test command -- expected: Vitest and Playwright pass, exit 0
- `npm run lint && npx tsc --noEmit` -- expected: clean
- `git check-ignore .env storage/x` -- expected: both ignored

## Implementation Notes

- Implemented directly in this session (no implementation subagent), in the worktree `g53-kalland-1.1-app-starts-from-one-command`.
- Scaffold command run as specified, plus `--use-npm --no-react-compiler --import-alias "@/*" --yes --disable-git`, into a scratch folder and copied in. Dropped: `AGENTS.md`, `public/*.svg`, `favicon.ico`, `globals.css`, `page.module.css`, Geist fonts, scaffold README/.gitignore (Next.js entries merged into ours).
- `next.config.ts` sets `agentRules: false`: Next 16's `next dev` otherwise writes `AGENTS.md` into the root whenever it detects a coding agent. CLAUDE.md is the agent guide here.
- No `output: 'standalone'`; the image keeps full `node_modules` because Vitest and migrate run in it.
- `"type": "module"` in package.json; `src/db/migrate.ts` and `reset-test.ts` run with Node 26's built-in type stripping (`node src/db/migrate.ts`), so files they import use relative `.ts` imports (`allowImportingTsExtensions`).
- Test file dir: tmpfs at `FILE_STORE_DIR` in `unit` and `app-test` (empty on every container start) instead of emptying a directory, so the reset can never delete dev files. The reset itself only touches the DB.
- `test-reset` is its own one-shot service (env `DATABASE_URL`=dev, `TEST_DATABASE_URL`=test) because the guard refuses when both point at one DB, which is exactly `app-test`'s env.
- One test command: the preferred `up --exit-code-from e2e` was tried and fails. Compose aborted when `unit` exited 0, then hung after `e2e` passed. Fallback used: `down -v && run --rm --build unit && run --rm e2e` under project `-p crm-dam-test` (own DB volume, never touches the dev stack). Verified: both outputs visible, exit 0 on pass, `compose run` propagates a non-zero exit.
- db healthcheck runs `psql` over TCP against `crm_dam_test`, so it passes only after the init script has created the test DB.
- Verified: `docker compose up --build` → db healthy → migrate exit 0 → app healthy, `/api/health` 200 `{"status":"ok"}`, root page renders; with `db` stopped, `/api/health` → 503 `{"status":"unavailable"}`. Vitest 12/12, Playwright 2/2. `npm run typecheck` and `npm run lint` clean. `.env`, `storage/` ignored. Python hook tests still pass.
- CI was not run yet (needs a push).

## Spec Change Log

## Review Triage Log

Pass 1 (Blind Hunter, Edge Case Hunter, Verification Gap). All patches applied by the main session; re-verified in Docker (Vitest 17/17, lint + typecheck in the image, Playwright 2/2, dev stack healthy).

| # | Finding | Verdict | Evidence / route |
|---|---------|---------|------------------|
| 1 | "Migrate without config" matrix row untested (VG, BH) | medium | No test reached `requireEnv`/the entry point. patch: `src/db/client.test.ts` (unset and "" → message; `node migrate.ts` without DATABASE_URL → exit 1 + message) |
| 2 | Test containers inherit `AI_PROVIDER`/real `ANTHROPIC_API_KEY` from a local `.env` (BH, ECH) | medium | `*app-env` interpolates `.env`; worktree `.env` has a key. patch: `&test-env` forces mock, empty key, `MOCK_DELAY_MS=0` |
| 3 | `run e2e` in README lacks `--build`, so stale e2e specs run locally (ECH) | medium | First `--build` only builds `crm-dam-app`. patch: `--build` on the e2e run |
| 4 | Pool has no `error` listener; idle-connection loss crashes the app (ECH) | medium | pg Pool emits unhandled `error`. patch: listener logs the message |
| 5 | Reset guard: no positive check; host aliases or unset DATABASE_URL pass (BH, ECH) | medium | `drop schema` on a mis-set URL. patch: target DB name must end in `_test` (+ test). Host-identity query rejected as more complexity than the suffix rule needs |
| 6 | Health query has no timeout; a stalled DB hangs `/api/health` (BH, ECH) | low | Only connect timeout was set. patch: 3 s race in `checkDatabase` |
| 7 | `checkDatabase` "never throws" false when DATABASE_URL unset (BH) | low | Default param evaluated outside `try`. patch: `getPool()` inside `try`, route's extra catch removed, test added |
| 8 | CI runs no lint/typecheck (BH) | low | Spec Verification lists them. patch: CI step in the app image |
| 9 | Reset client has no connection timeout (ECH) | low | patch: `connectionTimeoutMillis: 5000` |
| 10 | Tenant test cleanup not in `finally` (ECH) | low | patch: try/finally |
| 11 | Module stub comment grammar ("is orchestrates") (VG, BH) | low | patch: access/downloads/media comments rewritten |
| 12 | `.gitattributes` lacks `docker/**` (ECH) | low | Spec task named it. patch: added |
| 13 | `.env.example`/README imply `.env` changes the three Compose-fixed vars; host runs unclear (BH, ECH) | low | patch: wording says they are fixed by Compose and host runs are unsupported in v1 |
| 14 | Lockfile and migration `meta/` missing from review diff (BH) | false | Excluded on purpose as generated files; they exist in the worktree and must be staged with the code |
| 15 | Spec deviations not in Spec Change Log / no D-entry (BH) | rejected | Fix edits this build's spec; deviations are in Implementation Notes (no bad_spec loopback occurred). D-entries are a /wrap-up concern |
| 16 | Spec `in-review` vs sprint `in-progress` (BH) | false | Sprint sync to review/done happens in step 5 |
| 17 | Leaked pools in health route tests (BH, ECH) | low, rejected | Two short-lived pools in one file; Vitest exits cleanly. Fix needs new public surface (`closePool`) |
| 18 | Unparseable URL gives raw TypeError (ECH) | low, rejected | Compose-fixed URLs; dev-only path; extra branching |
| 19 | Old db volume without `crm_dam_test` never gets healthy (ECH) | low, rejected | No volume predates this story; `down -v` documented |
| 20 | `paths-ignore` blocks a required check forever (ECH) | false | `main` has no branch protection (API 404); `gh pr checks --watch` waits only for existing checks |
