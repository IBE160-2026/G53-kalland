# Session 2026-11-23: 1.2 staff and contacts log in and out

- **Story/task:** S-1.2 ([spec](https://github.com/IBE160-2026/G53-kalland/blob/main/_bmad-output/implementation-artifacts/spec-1-2-staff-and-contacts-log-in-and-out.md))
- **Prompts:** [prompts/2026-11-23.md](../prompts/2026-11-23.md) (12:04–12:26)
- **Transcript:** [transcripts/2026-11-23-fd79490f.md](../transcripts/2026-11-23-fd79490f.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/978-2026-11-23-12-29-24-1-2-staff-and-contacts-log-in-and-out.md](../../../.logs/marthekalland3/978-2026-11-23-12-29-24-1-2-staff-and-contacts-log-in-and-out.md)
- **Branch and PR:** `story/1.2-staff-and-contacts-log-in-and-out`, #53 (open)
- **Commits:**
  - `3ded88f` feat(auth): accounts and auth schema, migration and dependencies [S-1.2]
  - `23a177f` feat(auth): login, logout, role guards and demo seed [S-1.2]
  - `60e39d2` docs(story): README test data, story 1.2 spec, sprint status and deferred work [S-1.2]
  - `904eee1` Logg: 1-2-staff-and-contacts-log-in-and-out
  - `a6a4454` Logg: 1-2-staff-and-contacts-log-in-and-out
  - `4dfd312` chore(bmad): set core.communication_language for bmad-build [S-1.2] (added after `/wrap-up`: the uncommitted `_bmad/custom/config.toml` fix made during the build stopped `finish.sh`, and the user chose to commit it to this PR instead of discarding it)

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Implement the spec through a subagent, with the spec as the only source | Accepted | bmad-build workflow; the diff was then checked against every task and matrix row |
| Log out without a role guard (`endCurrentSession` acts only on the caller's own cookie) | Accepted, recorded as [D-054](../decisions.md#d-054-log-out-is-the-one-server-action-without-a-role-guard) | It works for both roles and does nothing without a session. This differs from the spec rule "every Server Action calls a guard first" |
| The seed does not create the tenant | Accepted | Migration 0001 (story 1.1) already inserts it |
| Two extra tests from the matrix audit (Secure cookie flag, `/login?reason=inactive`) | Accepted | Those matrix rows had no covering test |
| 9 review fixes: guard unit tests, `/` shows the inactive message, dummy hash computed at load, atomic `setPassword`, `lower(email)` lookup, end the old session on a new login, test for a user without a password, delete dead `createTestStaff`, case-insensitive https check | Accepted | Checked against the code. See the Review Triage Log in the spec |
| 14 other review findings (e.g. role-aware returnTo, session purge job, error text for over-long input) | Rejected | Not real, very unlikely, or adding complexity the spec does not ask for. Reasons are in the Review Triage Log |
| Demo users seeded by default (`SEED_ON_START` defaults to true, from story 1.1) | Deferred | Logged in `deferred-work.md`. Matters only if the app is ever deployed |
| Commit locally at the end of the build workflow | Rejected | CLAUDE.md: code is committed only through `/wrap-up`, after the user's ok |
| Record the logout exception as D-054 | Accepted after explanation | The user first answered "ok" without D-054, asked for an explanation, then chose to record it |

## Bugs found in AI-generated code
- **`/` hid the inactive message.** The root page deleted a deactivated user's session silently and showed plain Login, against the spec's "deactivated mid-session" row. Found by the edge-case review. Fixed: `currentActor` now redirects to `/login?reason=inactive`, covered by `guards.test.ts`.
- **Unequal password-hashing work on the first unknown-email login.** The dummy hash was built lazily, so the first unknown-email login after a start did a hash plus a verify. Found by the blind and edge-case reviews. Fixed: the hash is computed when the module loads.
- **`setPassword` was not atomic when given the plain db.** Its two statements ran separately. Found by the edge-case review. Fixed: they now run inside `tx.transaction`.
- **Login lookup could not use the `lower(email)` unique index.** Found by the blind review. Fixed: the query compares `lower(email)`.
- **A second login left the earlier session row valid.** Found by the blind and edge-case reviews. Fixed: Login ends the current session before setting the new cookie.
- **Dead code.** The unused helper `createTestStaff` was found by the blind review and deleted.
- **`Secure` dropped for an upper-case `APP_ORIGIN`.** Found by the edge-case review. Fixed: the https check now ignores letter case.
- **Test gaps** in the guard mapping (verification-gap and blind reviews) and the matrix audit. Closed with `guards.test.ts`, `cookies.test.ts`, a no-password login test and an e2e test for `/login?reason=inactive`.

## Decisions
- [D-054](../decisions.md#d-054-log-out-is-the-one-server-action-without-a-role-guard): Log out is the one Server Action without a role guard.
- Applied: AD-3, AD-5, AD-7, D-013, D-016.
