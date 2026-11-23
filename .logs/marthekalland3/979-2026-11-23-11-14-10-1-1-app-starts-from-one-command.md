# 1.1 app starts from one command

## 2026-11-23 kl. 11:14 — marthekalland3

### Task
Build Story 1.1 with `/bmad-build 1.1`: the app and its tests start from Docker Compose with no API key, so the examiner can run and check the project from the README.

### Plan
- Spec: [spec-1-1-the-app-starts-from-one-command.md](../../_bmad-output/implementation-artifacts/spec-1-1-the-app-starts-from-one-command.md), with the epic context in [epic-1-context.md](../../_bmad-output/implementation-artifacts/epic-1-context.md). The user approved it whole (~1,800 tokens; CI not split off).
- Worked in the existing worktree `../g53-kalland-1.1-app-starts-from-one-command`. Implemented in the main session; reviewed by three parallel review subagents (user's choice).

### Result
- **Built:** Next.js 16.4.6 scaffold (spine flags, pinned versions, spine source tree), Dockerfile (Node 26.13.1 + Perl), Compose `db` → `migrate` → `app` plus a `test` profile (`unit`, `test-reset`, `app-test`, `e2e`), first migration (`tenants` + `DEFAULT_TENANT_ID`), `/api/health`, CI workflow, `.env.example` (13 vars), `.gitattributes`, README v0.
- **Test command:** `compose up --exit-code-from e2e` aborted on Vitest's exit 0 and then hung, so the spec's fallback is used: two `compose run` steps in project `crm-dam-test`.
- **Review:** 20 findings; 13 patched (forced mock in tests, `_test` guard on the reset, pool error listener, health timeout, lint/typecheck in CI, tests for a missing DATABASE_URL), 7 rejected or false. Details are in the spec's triage log.
- **Verified locally in Docker:** Vitest 17/17, Playwright 2/2, lint and typecheck clean; the dev stack is healthy, and `/api/health` returns 503 when the DB is down.
- **Commits:** `92e9cb5`, `d784391`, `17c1dac`, `87097d0`, `0039564` on `story/1.1-app-starts-from-one-command`, PR #51.

### Open items
- Check that CI goes green on PR #51 (its first run; only tested locally so far).
