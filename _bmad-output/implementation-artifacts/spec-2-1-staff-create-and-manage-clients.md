---
title: 'Story 2.1: Staff create and manage clients'
type: 'feature'
created: '2026-11-25'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '67473f8654778890a58a3d459cca33130bb942e4'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A client today is only a name and a status, with no staff screen for clients at all. Staff cannot register a client, edit its details or set it inactive from the UI (FR-1, FR-5 S2).

**Approach:** Extend `clients` with org number, billing email, account manager, staff notes, `created_at` and a form nonce. Add staff-only create, update and list functions to `accounts`. Add a Clients tab: client list in the context sidebar, a client details view with Edit and Set inactive/active, and one create/edit form with inline field errors.

## Boundaries & Constraints

**Always:** The ACs in `epics.md` § Story 2.1 are the contract.
- Fields: name (required, trimmed), org number (optional; spaces removed, then 9 digits passing mod-11), billing email (required, `normaliseEmail`), account manager (required, must be an active staff user, checked in the module), staff notes (optional, plain text).
- Write functions take `(tx, actor, …)`, call `assertStaff` first and throw `Validation` with a field-specific key for module-level checks. Reads that return staff notes or the account manager take an `Actor` and assert staff.
- Create carries a form nonce (a UUID rendered into the form). It is stored in a unique `clients.form_nonce`; a repeat insert with the same nonce returns the existing client's id and creates nothing.
- The sidebar lists every client, newest first (`created_at desc, id desc`), with the name, a contact-count sub-line and an "Inactive" tag on inactive clients. It shows a one-sentence empty state and an "Add client" text action.
- The seed fixture gives each client a valid org number, a billing email and Ida as account manager.
- All UI strings live in `messages/en.json`. The guards come first in every page and action.

**Never:** No delete function, route or button for clients (S10). No contacts UI (2.2), setup links (2.3), card sections for images or licences (2.5), search or status filter in the sidebar, or activity log entries. No edits to applied migrations, and no new dependencies.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Create | valid fields | active client, redirect to `/clients/<id>`, newest in sidebar | N/A |
| Double submit | same nonce twice | one client row | second call returns the same id |
| Bad org number | `12345678`, `123456789` (bad check digit), letters | nothing saved | inline "org number" error; `921 456 786` accepted |
| Bad email / empty name | `foo@`, `"  "` | nothing saved | each field shows its own inline error; other values kept in the form |
| Account manager not active staff | a contact's id or an inactive staff id | nothing saved | inline account-manager error |
| Set inactive | client with a logged-in contact | client tagged Inactive; contact's next request → Login with the inactive message | set active → contact can log in again |
| Unknown id | `/clients/<random uuid>` | Not found page | N/A |
| Contact | opens `/clients` or calls an action | 403, no data | `Forbidden` |

</frozen-after-approval>

## Code Map

- `src/db/schema/accounts.ts` -- `clients` table: add `orgNumber`, `billingEmail`, `accountManagerId` (→ `users.id`, restrict), `staffNotes` (not null, default `''`), `createdAt`, `formNonce` (unique). All nullable except notes/createdAt so existing rows migrate.
- `src/db/migrations/` -- generate `0007_client-details.sql` with `drizzle-kit generate`; never edit 0000–0006.
- `src/modules/accounts/clients.ts` -- has `createClient(tx, {name,status})` (seed/factories, no actor), `setClientStatus`, `getClient`, `listActiveClients`. Keep these signatures; widen `createClient` input with optional new fields.
- `src/modules/accounts/users.ts` -- pattern for `Conflict`/`isUniqueViolation`; add `listActiveStaff()` for the account-manager select.
- `src/modules/accounts/index.ts` -- public exports.
- `src/modules/auth/sessions.ts` -- already refuses contacts of inactive clients (S2); reuse, do not change.
- `src/modules/shared/errors.ts` -- `Validation`, `toFormState`. `src/modules/shared/email.ts` -- `normaliseEmail`.
- `src/app/_components/shell/nav.ts` + `messages/en.json` `nav` -- add the Clients tab between Upload and Licences.
- `src/app/_components/shell/sidebar.tsx` -- `ContextSidebar`; `shell.tsx` -- `PageMain`, `EmptyState`.
- `src/app/(staff)/library/actions.ts` -- Server Action pattern (guard → zod → module → `toFormState`); `src/app/login/login-form.tsx` -- `useActionState` + Designsystemet `Field`.
- `src/app/_components/status-tag.tsx` -- reuse for Active/Inactive if it fits.
- `src/db/seed/fixture.ts`, `seed.ts`, `src/test/factories.ts` -- fixture clients and `createTestClient`.
- Mockup: `ux-designs/ux-g53-kalland-2026-11-18/mockups/more-screens.html` § Staff Clients (Details: org number, billing email, account manager, status line, staff notes with "Staff only" hint).

## Tasks & Acceptance

**Execution:**
- [x] `src/db/schema/accounts.ts`, `src/db/migrations/0007_*` -- new columns + check `org_number ~ '^[0-9]{9}$'` -- data model.
- [x] `src/modules/shared/org-number.ts` (+ test) -- `normaliseOrgNumber` and `isValidOrgNumber` (weights 3,2,7,6,5,4,3,2; remainder 1 invalid) -- pure, unit-tested.
- [x] `src/modules/accounts/clients.ts`, `users.ts`, `index.ts` -- `createClientAsStaff(tx, actor, input, nonce)`, `updateClient(tx, actor, id, input)`, `listClientsForStaff(actor)` (with contact count), `getClientDetails(actor, id)` (with account manager name), `listActiveStaff()` -- use cases.
- [x] `src/modules/accounts/accounts.test.ts` -- I/O matrix: nonce, org number, account-manager check, contact `Forbidden`, ordering, S2 via `setClientStatus` + session check -- real DB.
- [x] `src/app/(staff)/clients/` -- `layout.tsx` (sidebar list), `page.tsx` (empty selection), `new/page.tsx`, `[id]/page.tsx` (details, Edit, status toggle), `[id]/edit/page.tsx`, `client-form.tsx`, `actions.ts` (+ `actions.test.ts`) -- UI.
- [x] `nav.ts`, `messages/en.json`, `globals.css` -- tab, strings, minimal styles.
- [x] `fixture.ts`, `seed.ts`, `factories.ts` -- seeded client details.
- [x] `tests/e2e/clients.spec.ts` -- create a client, an invalid org number error, set inactive → contact refused, set active.

**Acceptance Criteria:**
- Given no function, route or UI action deletes a client, when the accounts exports are listed in a test, then none matches `/delete|remove/i`.
- Given a staff user on any staff page, when they look at the main nav, then Clients appears and is marked current on `/clients/**`.

## Design Notes

The `accounts` module owns the use case; the action only parses and maps errors. Field errors come back as `{ fieldErrors: { name?, orgNumber?, billingEmail?, accountManagerId? }, values }` from the action. Zod and the module's `Validation` keys both map to a field. The sidebar list is a server-rendered list of links (`aria-current` on the open client), so a full reload keeps the selection.

## Verification

**Commands:**
- `npm run lint && npm run typecheck` -- expected: no errors
- `npm test` -- expected: all pass, including the new accounts, org-number and action tests
- `npm run test:e2e -- clients` -- expected: pass

## Implementation Notes

- The seed now creates the staff users before the clients (each client names Ida as account manager), then the contacts.
- Module `Validation` keys live in `CLIENT_FIELD_ERRORS` (accounts); the action maps zod issues and those keys to the same field errors. The form fields are controlled, so a refused save keeps every value.
- Extra files beyond the code map: `client-list.tsx` (sidebar links with `aria-current`, a client component for `usePathname`), `status-form.tsx` (Set inactive/active) and `load-client.ts` (uuid check + `NotFound` → Not found page, shared by the details and edit pages). `StatusTag` gained `active`/`inactive`.
- `playwright.config.ts`: `clients.spec.ts` runs as a third project after `app`, because it sets Nordlys Sykkel AS inactive for a moment and other specs log in as Emil.
- Verified: lint, typecheck, Vitest 451/451 and Playwright 121/121 in the Compose test stack.

## Spec Change Log

## Review Triage Log

Pass 1 (Blind Hunter = BH, Edge Case Hunter = EC, Verification Gap = VG).

| # | Finding | Verdict | Evidence | Route |
|---|---------|---------|----------|-------|
| 1 | BH/EC: staff notes > 5000 chars fail zod but map to no field, so the save is refused silently | medium | `parse` drops issues whose path is not in `CLIENT_FIELD_ERRORS` and returns `{ fieldErrors: {} }`; the form then shows nothing | patch |
| 2 | BH/EC: name > 200 / email > 320 show "Enter the client's name" / generic email text | low | real, but unlikely in daily use and the fix adds message keys | rejected |
| 3 | BH: action (zod) and module (regex) validate email/UUID with different rules | low | the form always runs zod first, so users see one rule; no caller named that diverges harmfully; fix is a refactor | rejected |
| 4 | BH/EC: Back after a create reuses the page's nonce, so a second client is silently dropped and the user lands on the first | maybe-false | depends on whether Next's back/forward router cache replays the `/clients/new` payload with the same nonce; settle with an e2e test (create, go back, create another) | defer (medium, unverified) |
| 5 | BH: `existing.id` can be undefined after `ON CONFLICT DO NOTHING` | false | under READ COMMITTED the insert waits for the conflicting tx; on rollback it inserts, on commit the following select sees the committed row | rejected |
| 6 | BH/EC: a client whose manager is null or deactivated cannot be saved until a new manager is chosen | low | as specified (manager must be active staff); the select falls back to the placeholder and the field error "Choose an account manager from the active staff users." says why | rejected |
| 7 | EC: a pre-2.1 client with no billing email cannot be saved until one is entered | low | as specified (billing email required); the inline email error explains it | rejected |
| 8 | BH: `ClientFormState.values` is returned and tested but never read by the form | low | `ClientForm` keeps its own controlled state; the returned values are dead data (CLAUDE.md: no dead code) | patch |
| 9 | BH: `aria-describedby` on the org number replaces the Field description link | false | `designsystemet-web` field.js merges the existing `aria-describedby` with its description and validation ids | rejected |
| 10 | BH: `createClient` is exported with no Actor and now takes unchecked details | low | pre-existing seed/factory function with no role check; Story 2.4's guard test is where exported writes get role assertions | defer |
| 11 | BH/EC: databases seeded before 0007 keep empty details for seeded clients, while the README says the seed sets them | low | `seedIfEmpty` skips a database that has users; the README does not say a fresh database is needed | patch |
| 12 | BH: the e2e `try/finally` starts after two assertions, so Nordlys can stay inactive | low | if the sidebar assertion fails, `finally` never runs and later specs log in as Emil | patch |
| 13 | BH/VG: the Edit page (prefill, bound action) is never rendered by a test | medium | e2e never opens `/clients/<id>/edit`; action tests build their own FormData | patch |
| 14 | BH/VG: malformed id `/clients/not-a-uuid` → Not found is untested | low | the only id test uses a valid random UUID; removing the guard would give a 500 unnoticed | patch |
| 15 | BH: no test for `setClientStatusAction` with an unknown id | low | `NotFound` path via `toFormState` is shared code tested elsewhere | rejected |
| 16 | BH: no test that a contact gets 403 on `/clients/new` and `/clients/<id>/edit` | low | the Clients layout guard covers them; Story 2.4's route-tree guard test covers every staff route | rejected |
| 17 | BH: sidebar has no licence count (epic UX) | false | the frozen intent lists the sub-line as name, contact count and Inactive tag | rejected |
| 18 | BH: Set inactive has no confirm step | false | chosen at the spec checkpoint: reversible, no confirm | rejected |
| 19 | BH: org-number grouping regex duplicated in page and test | low | test-only duplicate; no runtime divergence | rejected |
| 20 | BH: spec says in-review, sprint status says in-progress | false | expected mid-workflow; step 5 syncs the sprint status | rejected |
| 21 | BH/EC: manager can be deactivated between the check and the write | low | needs two staff acting within milliseconds; fix adds row locks | rejected |
| 22 | BH: no focus move to the first invalid field after a refused save | low | inline errors are announced next to each field; a focus manager is new behaviour | rejected |
| 23 | VG: the Add client default account manager is untested | low | a convenience the spec does not require | rejected |
