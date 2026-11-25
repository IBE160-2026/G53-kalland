---
title: 'Story 2.3: Contacts set their password from a setup link'
type: 'feature'
created: '2026-11-25'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'e46223111746746e210e494aace7cd7b0146bc82'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A contact added in 2.2 has no password and cannot log in. Staff have no way to give a contact (or anyone who forgot it) a way to set a password, since the app sends no email (FR-4, FR-5, UJ-4).

**Approach:** Add a `setup_links` table owned by auth and `auth.issueSetupLink(tx, userId)`, called by `createContact` in the same transaction. Staff see the link with Copy and can make a new link per contact. A public `/setup/<token>` page lets the holder set a password of at least 12 characters, which uses up the link, ends the user's other sessions and logs them in.

## Boundaries & Constraints

**Always:** The ACs in `epics.md` § Story 2.3 are the contract.
- Token: 256 random bits, base64url, only its SHA-256 stored; never logged, never in a log line or error. Link = `${APP_ORIGIN}/setup/<token>`. Valid 7 days from issue.
- Issuing a link cancels every earlier unused link of that user. A link is valid only if unused, not cancelled and not expired; use is a conditional update, so two parallel submits use it once.
- Using a link, in one transaction: mark used, `setPassword` (argon2id; deletes all the user's sessions), start a new session. Then the action ends any session the browser held, sets the cookie and redirects to `landingPathFor(actor)` (contact → `/overview`).
- Password 12–1024 characters; shorter → inline error "Use at least 12 characters." and the link stays valid.
- Opening or submitting a used, expired, cancelled or unknown link → `/login?reason=expired` showing exactly "Link expired. Contact the agency for a new one." A deactivated user or a contact of an inactive client → Login with the inactive message; the link stays unused.
- The set-password page is public, one centred form on canvas with no navigation (like Login), heading "Set your password", `referrer` policy `no-referrer`. GET never writes.
- "New setup link" is staff-only (`assertStaff`, contacts only — a staff id is `NotFound`), shown for every contact row; the link panel shows the URL in a read-only input, "Copy link", a `role="status"` "Copied" message after copying, and the hint: the app sends no email, works once, expires <date time Europe/Oslo>, making another link cancels this one.
- Decision (checkpoint): after Add contact the page does not redirect; it shows "Contact added" with the link panel and a "Back to <client>" link. The per-row "New setup link" opens the panel under its row on the client page.
- Next's dev request log must not print `/setup/` paths (`logging.incomingRequests.ignore` in `next.config.ts`).
- All strings in `messages/en.json`; guard first in every staff page and action.

**Never:** No email sending. No staff-user UI (2.6), login delay (2.7), "setup link not used" sidebar text, last-login display, or activity log. No confirm-password field. No edits to applied migrations (0000–0008), no new dependencies. Tokens never in query strings, cookies other than the session, or redirects.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Create contact | staff saves valid contact | user + one setup link in one transaction; link shown with Copy | duplicate email → no user, no link |
| Set password | valid link, 12+ chars | logged in, on `/overview`; old password and other sessions gone; link used | N/A |
| Too short | 11 chars | inline error; nothing changes | link still works afterwards |
| Reuse | used link opened or submitted | Login with expired message | N/A |
| Expired | link issued > 7 days ago (controlled clock) | expired message | N/A |
| Replaced | link A, then new link B | A → expired message; B works | N/A |
| Inactive | contact deactivated, valid link | Login with inactive message | link unused |
| Race | two submits of one link in parallel | one succeeds | other → expired |
| Contact actor | new-link action as a contact | 403 / `Forbidden` | no link made |

</frozen-after-approval>

## Code Map

- `src/db/schema/auth.ts` -- add `setupLinks`: `id` uuidv7, `userId` → users (restrict), `tokenHash` unique, `createdAt`, `expiresAt`, `usedAt`, `cancelledAt` (timestamptz); index on `userId`. Export via `src/db/schema` index. Migration `0009_setup-links.sql` via `drizzle-kit generate`.
- `src/modules/auth/tokens.ts` -- rename `newSessionToken` → `newToken` (one caller in `sessions.ts`) and reuse `hashToken`.
- `src/modules/auth/setup-links.ts` (new) -- `SETUP_LINK_TTL_MS`, `issueSetupLink(tx, userId, now?) → { url, expiresAt }` (savepoint via `tx.transaction`, like `setPassword`), `isSetupLinkValid(token, now?)`, `useSetupLink(token, password, now?) → { token, actor }`. Throw `Validation("setPassword.tooShort")`, `Validation("login.expired")`-style key for invalid links, `Forbidden("login.inactive")`. Reuse `setPassword`, `toActor`/`isActive`/`accountColumns` from `sessions.ts` (export them, don't copy).
- `src/modules/auth/index.ts` -- export the three functions.
- `src/modules/accounts/contacts.ts` -- `createContact` returns `{ contactId, link }` inside `tx.transaction`; new `newContactSetupLink(tx, actor, contactId)`. Update callers/tests of `createContact`.
- `src/app/(staff)/clients/contact-actions.ts` -- create action wraps in `getDb().transaction`; new `newSetupLinkAction`. `contact-form.tsx` shows the link panel after a create (no redirect); edit still redirects.
- `src/app/(staff)/clients/setup-link-panel.tsx` (new, client) -- input + Copy (`navigator.clipboard`) + status; `new-setup-link-form.tsx` (new) per row in `[id]/page.tsx`.
- `src/app/setup/[token]/page.tsx`, `actions.ts`, `set-password-form.tsx` (new) -- pattern from `src/app/login/*`.
- `src/app/login/page.tsx` -- `reason=expired` → `login.expired`.
- `next.config.ts` -- `logging: { incomingRequests: { ignore: [/\/setup\//] } }` (check the Next 16 option shape).
- `src/test/factories.ts` -- unchanged except where `createContact` return shape matters.
- `tests/e2e/clients.spec.ts` (`clients` project) -- UJ-4 test.
- Mockup: `ux-designs/.../mockups/more-screens.html` lines ~730–735 (styles), ~1011–1019 (panel), ~1489–1500 (copy script).

## Tasks & Acceptance

**Execution:**
- [x] `src/db/schema/auth.ts`, `src/db/migrations/0009_*` -- `setup_links` table -- data model.
- [x] `src/modules/auth/tokens.ts`, `setup-links.ts`, `sessions.ts`, `index.ts` -- issue/check/use -- auth owns tokens (AD-5).
- [x] `src/modules/auth/setup-links.test.ts` -- whole I/O matrix on a real DB with a controlled clock; token absent from DB (only hash) and from log output.
- [x] `src/modules/accounts/contacts.ts`, `index.ts`, `contacts.test.ts` -- link in the create transaction (duplicate email leaves no link row); `newContactSetupLink` (staff id `NotFound`, contact `Forbidden`).
- [x] `src/app/(staff)/clients/...` -- actions (+ `contact-actions.test.ts`), panel, per-row form, page.
- [x] `src/app/setup/[token]/*`, `src/app/login/page.tsx`, `next.config.ts`, `messages/en.json`, `globals.css` -- public page and strings.
- [x] `tests/e2e/clients.spec.ts` -- UJ-4: create client + two contacts, copy a link, contact sets password in a fresh context and lands on `/overview`, reopening the link shows the expired message, wrong password shows the incorrect message.
- [x] `README.md` -- story summary and test counts.

**Acceptance Criteria:**
- Given a copied link, when staff press Copy, then the clipboard holds the URL and "Copied" is announced.
- Given a contact logged in on two browsers, when a new link is used to set a password, then both old sessions are refused on their next request.

## Implementation Notes

- `useSetupLink` is named `redeemSetupLink`: ESLint's React hooks rule treats any `use*` function as a hook.
- `isSetupLinkValid` checks only the link, so an inactive user or client sees the form and gets the inactive message on submit; the link stays unused.
- `login`'s session start moved into a shared `startSession(tx, userId, now)`; `issueSetupLink` locks the user row so two parallel issues cannot both stay valid.
- Each contact row became the client component `new-setup-link-form.tsx` so its panel can open under the row.
- The e2e origin `http://app-test:3000` is not a secure context, so the Copy test stubs `navigator.clipboard.writeText` and checks it receives exactly the link URL.
- Found, not fixed (from 2.1): axe fails colour contrast on the selected client's sub-line in the sidebar (`a[aria-current="true"] > .client-list-text > small`); the new axe scan covers the panel only.
- Verified after review patches: lint, typecheck, 520 Vitest, 128 Playwright pass.

## Spec Change Log

## Review Triage Log

Pass 1 (Blind Hunter = BH, Edge Case Hunter = EC, Verification Gap = VG).

| # | Finding | Verdict | Evidence | Route |
|---|---------|---------|----------|-------|
| 1 | VG: no test issues two links at once; removing `.for("update")` breaks nothing | medium | every multi-link test issues sequentially; the redeem race has a test, the issue race does not | patch |
| 2 | VG: too-long password's inline mapping in the action is untested | low | only the 11-char case is asserted in `actions.test.ts`; dropping `PASSWORD_TOO_LONG` from the set passes all tests; fix is one assertion | patch |
| 3 | EC/BH: fallback copy ignores `execCommand`'s result and always shows "Copied" | low | `copy()` calls `setCopied(true)` unconditionally; fix is a direct correction | patch |
| 4 | BH: `NewSetupLinkForm` renders the whole contact row | low | it renders `<li className="contact-row">` with `who`/`actions` slots; the name hides that every row is a client component; rename is direct | patch |
| 5 | VG: nothing checks `next.config.ts` keeps `/setup/` out of the request log | low | real gap; checking needs reading server output in the e2e runner; dev-mode log only | defer |
| 6 | EC/BH: cookie work failing after `redeemSetupLink` commits leaves the password set and no session | low | needs a DB or cookie failure after commit; moving the calls only changes which error page shows | rejected |
| 7 | EC: second Copy is not re-announced | low | status text unchanged; cosmetic; fix adds a counter | rejected |
| 8 | EC: 12 spaces or 6 emoji pass the 12-character rule | low | the spec's rule is length only (NIST allows any characters); staff-facing users unlikely to do this; fix adds guards | rejected |
| 9 | EC: missing `APP_ORIGIN` cancels links and returns none | false | both callers run `issueSetupLink` inside `tx.transaction`, so the `requireEnv` throw rolls the cancel and insert back | rejected |
| 10 | BH: no confirm before a new link cancels the old one | low | by design: the panel hint says "Making another link cancels this one"; the mockup has no confirm | rejected |
| 11 | BH: an inactive contact sees the form and is refused only on submit | low | spec decision (Implementation Notes); rare; fix adds a status check on load | rejected |
| 12 | BH: 12/1024 hard-coded in `messages/en.json` and constants | low | duplicated source of truth, but a change needs both edits in one story; fix adds ICU params | rejected |
| 13 | BH: expiry time shows no time zone | low | Conventions: every time is shown in Europe/Oslo; the mockup shows none | rejected |
| 14 | BH: argon2 hash runs inside the open transaction | low | a racing submit waits ~one hash; harmless at this scale | rejected |
| 15 | BH: token may leak in other logs (production, proxy header, Docker) | maybe-false | `next start` logs no requests and the proxy header is only read for return-to on guarded pages; would only be `low` | rejected |
| 16 | BH: token stays in browser history for 7 days | low | inherent to a link-based flow (UX spec); fix redesigns the flow | rejected |
| 17 | BH: staff links can be issued and redeemed | false | intended: epic context says 2.6 reuses `issueSetupLink` for staff users | rejected |
| 18 | BH: no partial unique index for one open link per user | low | the row lock enforces it and #1 now tests it; index is extra hardening | rejected |
| 19 | BH: used/expired rows never purged | low | kept as a small audit trail; no user harm | rejected |
| 20 | BH: untested expired-on-page redirect, `REASONS` map, fallback copy, 1024 boundary, error alert | low | expiry is unit-tested in `isSetupLinkValid` and the page redirect e2e-tested with a used link (same branch); e2e asserts the expired message | rejected |
| 21 | BH: `tokenOf` test helper duplicated in three files; long line | low | test-only refactor; lint passes | rejected |
| 22 | BH: migration meta, sprint status, spec and D-xxx missing from the diff | false | excluded from the review diff on purpose; decisions are written by `/wrap-up` | rejected |

## Verification

**Commands:**
- `npm run lint && npm run typecheck` -- expected: no errors
- `npm test` -- expected: all pass, including setup-link, contacts and action tests
- `npm run test:e2e -- clients` -- expected: pass
