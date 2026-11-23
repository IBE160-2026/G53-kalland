---
title: 'Story 1.2: Staff and contacts log in and out'
type: 'feature'
created: '2026-11-23'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '15cc9ab0280a738f19f2b2a391f06ce49cd96153'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-1-the-app-starts-from-one-command.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The app has no users, so nobody can log in, and no route can tell staff from contacts. Every later story needs the auth module, the guards, the seed users and a `loginAs` test helper.

**Approach:** Add `clients`, `users`, `credentials` and `sessions` (one migration). Accounts and auth expose module functions. A seed creates the story's users on an empty database. DB sessions sit behind `requireStaff()`/`requireContact()`. Add a Login page, two placeholder landing pages, a 403 page and logout. Shared typed errors and a pino logger come with it.

## Boundaries & Constraints

**Always:** Story ACs in `epics.md` § Story 1.2 are the contract. Auth alone touches cookies, sessions and hashes (AD-5); writes only through the owning module (AD-3), seed included. Module write functions take a `tx`; status changes also take an `Actor` and throw `Forbidden` for a contact. Every page, Server Action and Route Handler calls a guard first, except the public Login page, root redirect and `/api/health`. Emails are trimmed, lower-cased and unique on `lower(email)`. The NFR-7 strings live in `messages/en.json` and are tested word for word. New deps pinned exactly: `@node-rs/argon2` 2.2.2, `zod` 4.6.7, `pino` 10.4.0. Migration only via `drizzle-kit generate`.

**Never:** No Designsystemet, theme or shells (1.3): plain semantic HTML only. No setup links, set-password page or login delay (2.3, 2.7). No client/contact admin UI (2.1, 2.2). No `images.releaseLocksOf` (images module does not exist yet). Never log passwords, tokens or cookies. No `drizzle-kit push`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Staff login | seeded staff, right password | session row (hashed token), cookie `HttpOnly; SameSite=Lax` (+`Secure` when `APP_ORIGIN` is https), redirect to staff landing | N/A |
| Contact login | seeded contact | redirect to client landing | N/A |
| Bad credentials | unknown email, or wrong password | "Incorrect email or password. Contact the agency to set up a new password." | same text and argon2 work for both |
| Inactive at login | Gammel Kunde contact, right password | "Your account is not active. Contact the agency." | no session created |
| Deactivated mid-session | user or its client set inactive | next request: session deleted, Login shows the inactive message | N/A |
| Idle | `lastSeenAt` > 8 h ago | session deleted, Login with return-to | `lastSeenAt` written at most once per 60 s |
| Contact on staff route | contact session | 403 page, no data | N/A |
| No session | any guarded route | Login with `returnTo` = path + query | N/A |
| Bad return-to | `//evil.com`, `https://x`, `/\evil`, `/login` | ignored, role landing used | N/A |
| Seed on data | users table not empty | seed does nothing | N/A |

**Decisions (user, 2026-11-23):**
- Seed users: staff `ida@agency.example`, `per@agency.example`; Fjordkaffe AS `jonas@fjordkaffe.example`, `kari@fjordkaffe.example`; Nordlys Sykkel AS `emil@nordlys.example`; Gammel Kunde AS (inactive) `liv@gammelkunde.example`. All six share one demo password, `crm-dam-demo-2026`.
- URLs: Login is `/login`; staff land on `/library`, contacts on `/overview`; `/` redirects by role, or to Login. A staff user on a client route gets 403, the same as a contact on a staff route.
- Spec size: about 2,600 tokens, kept as one spec because login, guards and seed depend on each other.

</frozen-after-approval>

## Code Map

- `src/db/schema/accounts.ts` -- has `tenants`; add `clients` (id, tenantId, name, status) and `users` (id, tenantId, role `staff|contact`, clientId nullable + check role↔clientId, name, email, status, createdAt; unique index on `lower(email)`). Statuses: text + check `active|inactive`.
- `src/db/schema/auth.ts` (new) -- `credentials` (userId PK→users, passwordHash, lastLoginAt, previousLoginAt), `sessions` (id, tokenHash unique, userId, createdAt, lastSeenAt). Export from `schema/index.ts`.
- `src/db/client.ts` -- `getDb()`/`getPool()`; reuse. Files imported by `migrate.ts`/`reset-test.ts` (run by plain Node type stripping) must keep relative `.ts` imports. Module code is only loaded by Next/Vitest, so `@/` is fine there.
- `src/db/reset-test.ts`, `src/test/global-setup.ts` -- the global setup resets the test DB; extend it to seed through a Drizzle db on `TEST_DATABASE_URL`.
- `docker-compose.yml` -- `unit` runs with `DATABASE_URL`=dev DB. Module code under Vitest must hit the test DB: a Vitest `setupFiles` entry sets `DATABASE_URL` from `TEST_DATABASE_URL`. `app-test` already has `SEED_ON_START=true`.
- `Dockerfile` e2e stage -- copies only `tests/e2e`; also copy `src/db/seed/fixture.ts` so e2e imports the named users. `fixture.ts` stays pure data (no imports).
- `tests/e2e/smoke.spec.ts` -- the root page assertion changes: `/` now redirects.
- `messages/en.json`, `src/i18n/request.ts` -- add `login.*`, `errors.*`, `forbidden.*`, landing headings.
- No `node_modules` locally: run `npm install` on the host (Node 26.7) to add deps and run `drizzle-kit generate`; tests run in Docker.

## Tasks & Acceptance

**Execution:**
- [x] `package.json`, `package-lock.json` -- add the three deps; check the lockfile has the linux-x64/arm64 argon2 bindings -- AD-5, Logging
- [x] `src/db/schema/{accounts,auth,index}.ts` + generated `src/db/migrations/0002_*` -- the tables above
- [x] `src/modules/shared/errors.ts` -- `NotFound|Forbidden|Conflict|Validation|Locked` with `messageKey`; `toHttpStatus(e)` and `toFormState(e)`; unknown errors → logged + `errors.unexpected` -- Conventions
- [x] `src/modules/shared/log.ts` -- pino with redact paths for password, token, cookie, authorization, set-cookie -- Logging
- [x] `src/modules/accounts/index.ts` (+ internals) -- `createClient(tx, …)`, `createUser(tx, …)` (seed and future 2.x use), `setUserStatus(actor, …)`, `setClientStatus(actor, …)`
- [x] `src/modules/auth/index.ts` (+ internals) -- `setPassword(tx, userId, pw)`, `login(email, pw)`, `resolveSession(token, now)` (pure DB, controlled clock), `logout(token)`, `requireStaff()`, `requireContact()`, `currentActor()`, `safeReturnTo(raw)`, `Actor` type; cookie helpers; dummy-hash verify for unknown emails
- [x] `src/proxy.ts` -- forwards the request path + query as a header so guards can build `returnTo` (display only, not a guard)
- [x] `next.config.ts` -- `experimental.authInterrupts` for `forbidden()`; add argon2 to `serverExternalPackages` if Next does not already externalise it
- [x] `src/db/seed/{fixture.ts,seed.ts}`, `src/instrumentation.ts` -- named fixture users; `seedIfEmpty(db)` in one transaction under an advisory lock; called on app start when `SEED_ON_START=true` (Node runtime only)
- [x] `src/app/login/{page.tsx,login-form.tsx,actions.ts}`, `src/app/page.tsx`, `src/app/forbidden.tsx`, `src/app/(staff)/library/page.tsx`, `src/app/(client)/overview/page.tsx`, `src/app/_components/{logout-button.tsx,actions.ts}` -- per the matrix; landing pages show a heading, the user's name and Log out
- [x] `src/test/{setup-env.ts,login-as.ts}`, `vitest.config.ts`, `src/test/global-setup.ts` -- test DB for module code; Vitest `loginAs(fixtureUser)` → `{ actor, token }`
- [x] `tests/e2e/{helpers.ts,auth.spec.ts}`, `tests/e2e/smoke.spec.ts`, `Dockerfile` -- Playwright `loginAs(page, fixtureUser)` via the form
- [x] unit tests -- `auth.test.ts` (login matrix rows, timing-safe path, resolveSession idle/throttle with a fixed clock, S1/S2 with factory-created rows, logout), `accounts.test.ts` (contact Actor → `Forbidden`), `return-to.test.ts`, `errors.test.ts`, `log.test.ts` (redaction), `seed.test.ts` (counts, argon2id prefix, second run no-op)
- [x] `README.md` -- seeded users and demo password; test counts unchanged otherwise

**Acceptance Criteria:**
- Given `docker compose up --build` on an empty volume, when the app is healthy, then the seeded staff user logs in at `/login` in a browser, sees the staff landing page and logs out back to Login.
- Given the README test command, then all Vitest and Playwright tests pass, including e2e for both login messages, contact → 403 on the staff landing page, no-session redirect with `returnTo` round trip, and logout deleting the session.
- Given `npm run lint` and `npm run typecheck`, then both are clean.

## Implementation Notes

- argon2 (`@node-rs/argon2`), `pg` and `pino` are already in Next's built-in `serverExternalPackages` list, so `next.config.ts` only adds `experimental.authInterrupts`. The lockfile has the linux x64/arm64 (gnu and musl) argon2 bindings.
- Module API beyond the task list: `assertStaff`, `landingPathFor`, `LOGIN_PATH`, `setSessionCookie`, `endCurrentSession` (auth); `getUser` (accounts, read for the landing pages). `normaliseEmail` lives in `src/modules/shared/email.ts` so auth and accounts share it without an import cycle. `src/modules/shared/db-errors.ts` detects unique violations through Drizzle's wrapped cause. `src/test/factories.ts` creates fresh clients/contacts/staff for state-changing tests.
- Errors: `Validation` 422, `Forbidden` 403, `NotFound` 404, `Conflict` 409, `Locked` 423. `login` throws `Validation("login.incorrect")` or `Forbidden("login.inactive")`; the Login action maps them with `toFormState`. The inactive message is shown only after a correct password.
- `setPassword` also deletes the user's sessions in the same transaction (AD-5); the seed has none.
- Logout action has no role guard: it calls `auth.endCurrentSession()`, which deletes only the session of the caller's own cookie and clears it; a no-op without one. Recorded here as the one Server Action besides Login without `requireStaff`/`requireContact`.
- The proxy imports `REQUEST_PATH_HEADER` from `@/modules/auth/request-path` directly (not the index) to keep pg/argon2 out of the proxy bundle; matcher skips `_next/static`, `_next/image`, `favicon.ico`, `api/health`.
- The tenant row still comes from migration 0001 (story 1.1); the seed does not create it again.
- `NextIntlClientProvider` added to the root layout so the client Login form uses `useTranslations`. `home.running` removed from `messages/en.json` (root page now only redirects).
- e2e alerts are scoped to `main`: Next's route announcer is also `role="alert"`.
- Verified: README test command exit 0 (Vitest 68/68, Playwright 11/11); `npm run lint`, `npm run typecheck` clean on the host; `docker compose -p crm-dam-verify up --build --wait` on an empty volume: seed logged once, skipped after restart, `/` → 307 `/login`, `/library?x=1` → 307 `/login?returnTo=%2Flibrary%3Fx%3D1`, health 200. Browser login/logout verified through Playwright against the same image, not by hand.
- Matrix audit (step 3) added two tests: `cookies.test.ts` (Secure only when `APP_ORIGIN` is https, via the extracted `sessionCookieOptions`) and the e2e "Login explains a refusal by a guard for an inactive account" (`/login?reason=inactive`). The guard's own `inactive` -> redirect mapping is still covered only through `resolveSession` (no admin UI to deactivate mid-e2e). Re-run: README test command exit 0, Vitest 69/69, Playwright 12/12; lint and typecheck clean.

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Evidence | Route |
|---|-------|---------|---------|----------|-------|
| 1 | verification-gap, blind | Guard mapping (`inactive` → `?reason=inactive`, none → `returnTo`, wrong role → `forbidden()`), `currentActor`, `endCurrentSession` untested | medium | No test imports `guards.ts`; dropping the `inactive` branch passes every test. A unit test with mocked `next/headers`/`next/navigation` closes it without admin UI | patch |
| 2 | verification-gap | `login` for a user with no `credentials` row untested | low | Only seeded/factory users (always `setPassword`) log in in tests; narrowing the `??` fallback would throw from argon2 unnoticed | patch |
| 3 | edge-case (×2) | Root page `/`: deactivated user's session deleted silently, Login shows no inactive message | medium | `currentActor` maps `inactive` to null, `page.tsx` redirects to plain `/login`; matrix row "Deactivated mid-session" says Login shows the inactive message on the next request | patch |
| 4 | blind, edge-case (×2) | Lazy dummy hash: first unknown-email login per process does hash + verify | low | `getDummyHash` hashes on first call; matrix requires the same argon2 work for both | patch |
| 5 | edge-case (×2) | `setPassword` not atomic when given the plain db | low | Factories pass `getDb()`; upsert and session delete then run as two statements | patch |
| 6 | blind | `login` looks up `users.email` but the unique index is on `lower(email)` | low | Expression index unusable for `eq(users.email, …)`; direct correction to `lower(email) = $1` | patch |
| 7 | blind, edge-case | Logging in again leaves the earlier session row alive | low | `logIn` overwrites the cookie without ending the session it replaces; row stays valid until idle | patch |
| 8 | blind | `createTestStaff` unused | low | grep: only its definition; CLAUDE.md "no dead code" | patch |
| 9 | edge-case | `APP_ORIGIN` in upper case drops `Secure` | low | `startsWith("https://")` is case-sensitive; direct correction | patch |
| 10 | verification-gap, blind, edge-case | Over-long email/password gets `login.missing` | low | Real, but needs a >320/>1024-char input; fix adds a branch | reject |
| 11 | blind, edge-case | `returnTo` to the other role's route lands on 403 after login | low | Real but rare (shared cross-role link); fix adds role-prefix logic not in the matrix | reject |
| 12 | blind | No session purge, no absolute lifetime | low | AD-5 asks only for an 8 h idle limit; orphan rows are inert; a purge job is new machinery | reject |
| 13 | blind | Spec Verification command lacks `--profile test` | low | Fix edits this build's spec | reject |
| 14 | blind | Spec `in-review` vs sprint `in-progress`; AC "in a browser" not checked by hand | false | Sprint sync happens at the present step; manual browser check is for the human in step 5 | reject |
| 15 | blind | Secrets in error messages reach logs | maybe-false | pg errors do not carry the connection string; Drizzle query errors carry params, which here are hashes and emails, not passwords. Would only be low | reject |
| 16 | blind | Demo users seeded by default (`SEED_ON_START` default true) | low | Default set in story 1.1's compose/.env.example, not by this change; local course app with no prod deploy | defer |
| 17 | blind | Seed checks only `users`, not `clients` | low | Needs a DB with clients but no users, unreachable through the app | reject |
| 18 | blind | No D-xxx for argon2/zod/pino | false | decisions.md covers the auth module with argon2; process files stay out of this PR (D-013) | reject |
| 19 | edge-case | `setPassword` races login between verify and session insert | low | Needs a reset inside a ~50 ms window; fix needs row locking | reject |
| 20 | edge-case | Seed failure in `instrumentation.ts` stops the app booting | false | Loud failure on an unreachable DB is correct behaviour | reject |
| 21 | edge-case | Redaction misses capitalised or deeper keys | low | Node lower-cases header names; deeper keys only with unusual log shapes; fix adds machinery | reject |
| 22 | edge-case (×2) | `returnTo` `/%6Cogin` or `/login;x` slips through | low | Crafted link only; worst case a logged-in user sees Login again; fix adds decoding logic | reject |
| 23 | edge-case | `createUser` accepts empty name/email | low | No caller passes user input yet (seed only); 2.1/2.2 validate at the boundary | reject |
| 24 | edge-case | Proxy matcher prefix `api/health` lets a client header through on `/api/health*` | false | No guarded route under that prefix; the header only feeds `safeReturnTo`, which validates it | reject |

## Design Notes

**Guard shape.** `resolveSession` holds the logic and is tested with a clock. The guards only map its result: `none|expired` → `redirect('/login?returnTo=…')`; `inactive` → `redirect('/login?reason=inactive')`; wrong role → `forbidden()`. A Server Component cannot clear a cookie, so refusal deletes the session row. The stale cookie then matches nothing, and the next login overwrites it. The session bookkeeping writes (`lastSeenAt`, delete) are the accepted exception to "GET never writes" (AD-5 requires them).

**Seed vs migrate.** The seed runs in the app (`instrumentation.ts`), not in `migrate`. Module code then needs no Node type-stripping constraints, and `app-test` seeds itself after `test-reset`.

## Verification

**Commands:**
- `docker compose -p crm-dam-test down -v && docker compose -p crm-dam-test --profile test run --rm --build unit && docker compose -p crm-dam-test --profile test run --rm --build e2e` -- expected: all pass (use the README's exact command)
- `docker compose up --build -d` then log in as staff and as the Gammel Kunde contact in a browser -- expected: matrix behaviour
- `npm run lint && npm run typecheck` -- expected: clean
