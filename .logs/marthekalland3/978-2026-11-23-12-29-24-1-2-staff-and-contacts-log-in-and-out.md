# 1.2 staff and contacts log in and out

## 2026-11-23 kl. 12:29 — marthekalland3

### Task
Build story 1.2 from its ready-for-dev spec with `/bmad-build`: staff and contacts log in and out, role guards, demo seed users and a `loginAs` test helper for every later story.

### Plan
- Spec: [spec-1-2-staff-and-contacts-log-in-and-out.md](../../_bmad-output/implementation-artifacts/spec-1-2-staff-and-contacts-log-in-and-out.md) (status `done`; Review Triage Log inside).
- Work in the story worktree; implementation by a subagent with the spec as the only source.
- Check the diff against every task and matrix row, run three reviewers (blind, edge-case, verification-gap), triage, send fixes back to the implementer, verify again.

### Result
- Commits on `story/1.2-staff-and-contacts-log-in-and-out`: `3ded88f` schema, migration 0002 and deps (`@node-rs/argon2`, `zod`, `pino`); `23a177f` accounts and auth modules, guards, Login/landing/403 pages, logout, seed, tests; `60e39d2` README test data, spec, sprint status (1.2 → `review`), deferred work. PR #53.
- Matrix audit added two tests (Secure cookie flag, `/login?reason=inactive`).
- Review: 24 findings; 9 fixed (guard unit tests, `/` shows the inactive message, eager dummy hash, atomic `setPassword`, `lower(email)` lookup, end the old session on a new login, no-password login test, dead `createTestStaff` removed, case-insensitive https check), 14 rejected, 1 deferred.
- Verified: README test command exit 0 (Vitest 79/79, Playwright 12/12); lint and typecheck clean.
- The workflow's own local commit was skipped; code was committed through `/wrap-up` after the user's ok (CLAUDE.md).

### Open items
- Log in by hand in a browser as `ida@agency.example` after `docker compose up --build` (spec AC 1; so far only Playwright did it).
- Demo users are seeded whenever `SEED_ON_START` is unset (defaults to `true`); add a production guard if the app is ever deployed (`deferred-work.md`).
- Log out has no role guard, unlike the spec rule "every Server Action calls a guard first". Resolved in the same session: recorded as D-054.
- `_bmad/custom/config.toml` in the worktree has an uncommitted `[core] communication_language` entry from before the session; commit it on a `chore/` branch.
