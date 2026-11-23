# Session 2026-11-23: 1.1 app starts from one command

- **Story/task:** Story 1.1 (The app starts from one command), via `/bmad-build 1.1`
- **Prompts:** [prompts/2026-11-23.md](../prompts/2026-11-23.md) (10:34–11:13)
- **Transcript:** [transcripts/2026-11-23-3f1979e7.md](../transcripts/2026-11-23-3f1979e7.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/979-2026-11-23-11-14-10-1-1-app-starts-from-one-command.md](../../../.logs/marthekalland3/979-2026-11-23-11-14-10-1-1-app-starts-from-one-command.md)
- **Branch and PR:** `story/1.1-app-starts-from-one-command` (worktree `../g53-kalland-1.1-app-starts-from-one-command`), #51 (open)
- **Commits:**
  - `92e9cb5` chore(scaffold): Next.js 16 app with the pinned stack and the spine source tree [S-1.1]
  - `d784391` feat(db): tenants table, migrations, health endpoint and guarded test-DB reset [S-1.1]
  - `17c1dac` test(foundation): Vitest and Playwright setup with the foundation tests [S-1.1]
  - `87097d0` chore(docker): Compose runtime, test profile and CI workflow [S-1.1]
  - `0039564` docs(story): README v0, story 1.1 spec, epic 1 context and sprint status [S-1.1]
  - `e7ac2f3` Logg: 1.1-app-starts-from-one-command

The spec ([spec-1-1-the-app-starts-from-one-command.md](../../../_bmad-output/implementation-artifacts/spec-1-1-the-app-starts-from-one-command.md)) holds the plan, implementation notes and the full review triage log (20 findings with verdicts).

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Keep the ~1,800-token spec whole rather than split off CI | Accepted (user's choice) | Every part is an acceptance criterion of 1.1 |
| One test command via `compose up --exit-code-from e2e` | Rejected after a local run | Compose aborted when Vitest exited 0, then hung after Playwright passed. We used the spec's fallback: two `compose run` steps in a separate `crm-dam-test` project (D-053) |
| `agentRules: false` in `next.config.ts` | Accepted | `next dev` would otherwise write `AGENTS.md` into the root whenever it detects an agent; CLAUDE.md is the agent guide |
| Implement in the main session instead of the workflow's implementation subagent | Accepted (Claude's choice, not asked) | The context was already loaded; the three reviewers still ran as separate subagents |
| Three parallel review subagents (BMad build step 4) | Accepted (user's choice) | 20 findings: 13 patched, 7 rejected or false |
| Test-DB reset only on a database whose name ends in `_test` (review) | Accepted | The reset drops the schema, so it needs a positive check |
| Tests always use the mock provider, whatever a local `.env` says (review) | Accepted | A local `.env` could otherwise give the test containers a real API key |
| Add `closePool()` to fix pooled connections left open in the health route tests (review) | Rejected | Two short-lived pools; Vitest exits cleanly. Not worth adding new public surface |

The user made no corrections to Claude's suggestions in this session; the choices above marked "user's choice" were answers to Claude's questions.

## Bugs found in AI-generated code
- **The test containers could have used the real AI provider and API key.** `unit` and `app-test` took `AI_PROVIDER` and `ANTHROPIC_API_KEY` from the local `.env`. Found by the Blind Hunter and Edge Case Hunter reviewers. Fixed: the test profile forces the mock with an empty key.
- **`/api/health` could hang.** It had no query timeout, so a database that accepted the connection but stalled would never get a 503. Found by review. Fixed: `checkDatabase` gives up after 3 s.
- **`checkDatabase` could throw despite its "never throws" contract.** It called `getPool()` outside its `try`, so a missing `DATABASE_URL` threw. Found by review. Fixed, with a test.
- **An idle connection drop could crash the app.** The pg `Pool` had no `error` listener. Found by review. Fixed.
- **Playwright could run old tests.** The README test command ran `e2e` without `--build`, so changed tests were not picked up. Found by review. Fixed.
- **The "Migrate without config" behaviour had no test.** Found by the Verification Gap reviewer. Fixed: `src/db/client.test.ts`.
- **TypeScript errors in the first draft.** The first draft used `LayoutProps` without running `next typegen`, used `NodeJS.ProcessEnv` in the reset guard, and wrote group-prefixed ExifTool tag keys. Found by `tsc`. Fixed before the first Docker run.

## Decisions
- [D-053](../decisions.md#d-053-the-tests-run-as-their-own-compose-project-always-on-the-mock-with-a-guarded-test-database-reset): the tests run as their own Compose project, always on the mock, with a guarded test-database reset
