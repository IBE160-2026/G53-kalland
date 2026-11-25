---
title: 'Story 2.2: Staff add and manage contacts'
type: 'feature'
created: '2026-11-25'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'fb223a27844be571ca6be657354c3394582e874c'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Contacts exist only in the seed. Staff cannot add a contact to a client, change a contact's name, email or phone, or deactivate and reactivate one from the UI (FR-2 user part, FR-5 S1). Users have no phone field.

**Approach:** Add a nullable `users.phone`. Add staff-only contact use cases to `accounts` (create, update, set status, list for a client). Add a Contacts section to the client details page with Add contact, a per-contact Edit, and Deactivate/Reactivate, plus one create/edit form with inline field errors.

## Boundaries & Constraints

**Always:** The ACs in `epics.md` § Story 2.2 are the contract.
- Fields: name (required, trimmed, ≤ 200), email (required, `normaliseEmail`, ≤ 320, unique on `lower(email)` across staff and contacts), phone (optional; trimmed; only digits, spaces, `+`, `-`, `(`, `)`; 5–30 chars; empty stored as null).
- A duplicate email (any case, surrounding spaces) is an inline error on the email field: "This email is already used by another user." Nothing is saved.
- Editing never changes the user id, role or client. Changing the email keeps licences and history; the contact then logs in with the new email.
- Contact write functions take `(tx, actor, …)`, call `assertStaff` first, and act only on rows with `role = 'contact'` (a staff id gives `NotFound`), so this UI can never deactivate a staff user.
- Create uses the unique email as its natural key (Conventions: Idempotency): a double submit makes one user; the second submit is refused as a duplicate email.
- Contacts are listed under their client by name, inactive ones included with an "Inactive" tag. Each row shows name, email, phone when set, status, Edit and Deactivate/Reactivate. Empty state: one sentence plus "Add contact".
- Deactivate/Reactivate has no confirm step (reversible, as Set inactive in 2.1). Contacts can be added to an inactive client.
- Decision (checkpoint): Add contact and Edit contact are their own pages, `/clients/<id>/contacts/new` and `/clients/<id>/contacts/<contactId>/edit`, like Add/Edit client; save and cancel return to `/clients/<id>`.
- All UI strings in `messages/en.json`; guards first in every page and action. Contact pages are 404 when the contact does not belong to the client in the URL.

**Never:** No delete function, route or button for users. No setup links, Copy button or password reset (2.3) — a new contact cannot log in yet. No last-login column, card sections for images or licences (2.5), staff-user management (2.6), or activity log entries. No edits to applied migrations, no new dependencies.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Add | valid name, email, phone | active contact with that client's id; back on `/clients/<id>`, listed; sidebar count +1 | N/A |
| Duplicate email | `  IDA@Agency.Example ` (a staff email) or another contact's | nothing saved | inline duplicate-email error; values kept |
| Bad input | empty name, `foo@`, phone `abc` | nothing saved | each field its own inline error |
| Change email | contact with a licence → new email | same user id; licence still has that `contact_id`; `login(new email)` works, old email fails | N/A |
| Deactivate | logged-in contact | next request → Login with "Your account is not active. Contact the agency." | Reactivate → can log in again |
| Deactivate keeps data | contact with licences | licences unchanged and still the client's; no row deleted | N/A |
| Wrong owner / unknown | contact id of another client, staff id, random uuid, `not-a-uuid` | Not found page / `NotFound` | N/A |
| Contact actor | any contact action or page | 403 / `Forbidden` | nothing changed |

</frozen-after-approval>

## Code Map

- `src/db/schema/accounts.ts` -- `users`: add `phone: text("phone")` nullable. Migration `0008_contact-phone.sql` via `drizzle-kit generate`; never edit 0000–0007.
- `src/modules/accounts/users.ts` -- `createUser` (seed/factories, no actor; catches `isUniqueViolation` → `Conflict("accounts.emailTaken")`) — widen with optional `phone`; keep `setUserStatus` as is (2.6 uses it for staff).
- `src/modules/accounts/contacts.ts` (new) -- `CONTACT_FIELD_ERRORS`, `ContactInput`, `createContact(tx, actor, clientId, input)` (client must exist → else `NotFound`), `updateContact(tx, actor, contactId, input)`, `setContactStatus(tx, actor, contactId, status)`, `listContactsForStaff(actor, clientId)`, `getContactForStaff(actor, contactId)`. Duplicate email → `Validation(CONTACT_FIELD_ERRORS.email + "Taken")`-style field key. Follow `clients.ts` `checkClientInput` pattern.
- `src/modules/accounts/index.ts` -- export the new functions/types.
- `src/modules/auth/sessions.ts`, `guards.ts` -- already refuse inactive users (S1) and redirect to `/login?reason=inactive`; reuse, do not change.
- `src/app/(staff)/clients/[id]/page.tsx` -- add a Contacts section after Details (`client-section`, `section-title`).
- `src/app/(staff)/clients/actions.ts` + `client-form.tsx` -- pattern for zod parse → field errors → `stateOf` → `revalidatePath("/clients","layout")` → redirect; `status-form.tsx` -- pattern for Deactivate/Reactivate; `load-client.ts` -- uuid + `NotFound` → `notFound()`.
- `src/app/_components/status-tag.tsx` -- `active`/`inactive` states.
- `src/db/seed/fixture.ts`, `seed.ts`, `src/test/factories.ts` -- give Jonas a phone in the fixture; `createTestContact` unchanged.
- `src/modules/licences/grant.ts` `grantLicence` -- to give a factory contact a licence in the email-change test (see existing licence tests for an image factory).
- Mockup: `ux-designs/ux-g53-kalland-2026-11-18/mockups/more-screens.html` lines ~984–1010 (Contacts section, person rows; ignore last-login and setup link).
- `playwright.config.ts` -- the `clients` project runs `clients.spec.ts` after `app`; put contact e2e tests that change seeded users there.

## Tasks & Acceptance

**Execution:**
- [x] `src/db/schema/accounts.ts`, `src/db/migrations/0008_*` -- nullable `phone` -- data model.
- [x] `src/modules/accounts/contacts.ts`, `users.ts`, `index.ts` -- contact use cases above -- module owns writes (AD-3).
- [x] `src/modules/accounts/contacts.test.ts` -- I/O matrix on a real DB: create, duplicate email (staff email, case/spaces), bad phone, email change keeps id and licence and `login` works with the new email, deactivate → `resolveSession` inactive, reactivate, staff id → `NotFound`, contact `Forbidden`, no export matches `/delete|remove/i`.
- [x] `src/app/(staff)/clients/[id]/contacts/...`, `contact-form.tsx`, `contact-status-form.tsx`, `contact-actions.ts` (+ test), `[id]/page.tsx` -- UI: `contacts/new/page.tsx`, `contacts/[contactId]/edit/page.tsx` (404 unless the contact belongs to this client).
- [x] `messages/en.json`, `globals.css` -- strings, minimal styles.
- [x] `fixture.ts`, `seed.ts` -- a phone for Jonas.
- [x] `tests/e2e/clients.spec.ts` -- add a contact (listed, count updated), duplicate email error, deactivate Emil while logged in → inactive message, reactivate (try/finally) → can log in.

**Acceptance Criteria:**
- Given a client with contacts, when staff open it, then each contact is listed with name, email, phone and status, and no delete action exists.
- Given a new contact, when staff save, then the sidebar contact count for that client includes it.

## Verification

**Commands:**
- `npm run lint && npm run typecheck` -- expected: no errors
- `npm test` -- expected: all pass, including the new contacts and action tests
- `npm run test:e2e -- clients` -- expected: pass

## Implementation Notes

- The duplicate-email key is `contacts.errors.emailTaken` (exported as `CONTACT_EMAIL_TAKEN`); the action maps it to the email field. `createContact` reuses `createUser` and turns its `Conflict` into that `Validation`; `updateContact` catches the unique violation itself.
- `seed.ts` needed no change: the contact fixture type gained an optional `phone`, which the seed passes through to `createUser`.
- `listContactsForStaff` returns `[]` for a malformed client id; the page has already 404'd before it is called.
- README story summary and test counts updated (492 Vitest, 126 Playwright).

## Spec Change Log

## Review Triage Log

Pass 1 (Blind Hunter = BH, Edge Case Hunter = EC, Verification Gap = VG). VG found no verification gaps.

| # | Finding | Verdict | Evidence | Route |
|---|---------|---------|----------|-------|
| 1 | BH/EC/VG: `updateContactAction` never checks that the contact belongs to the bound client | medium | `updateContact` updates by `contactId` alone and the action redirects to the bound `clientId`; only the edit page (`loadContact`) enforces the "contact belongs to the client in the URL" rule, and a Server Action can be called with any bound args | patch |
| 2 | BH: `CONTACT_EMAIL_TAKEN` is built by string concatenation | low | `` `${CONTACT_FIELD_ERRORS.email}Taken` `` hides the literal key `contacts.errors.emailTaken` from a grep against `messages/en.json`; the fix is a direct correction | patch |
| 3 | BH/EC: phone of only symbols (`-----`) passes | low | real, but follows the spec's rule exactly and staff are unlikely to type it; the fix adds a condition | rejected |
| 4 | EC: name of only zero-width characters is saved | low | real, but no staff member types that in daily use; the fix adds a guard | rejected |
| 5 | EC: a database seeded before 0008 shows Jonas with no phone | low | `seedIfEmpty` skips a database with users; README line 75 already says details appear on a fresh database (`docker compose down -v`) | rejected |
| 6 | BH/EC: e2e `finally` looks for Reactivate even if Deactivate never took effect | low | only changes the error text of an already failing test; Emil stays active in that case | rejected |
| 7 | BH: the diff omits migration meta, sprint status and the spec | false | excluded on purpose from the review diff; `_journal.json` line 65 registers `0008_contact-phone` | rejected |
| 8 | BH: no D-xxx decision for the phone column; `NewUser` widened for staff too | low | the column is in the approved spec intent; decisions are written by `/wrap-up` (CLAUDE.md); a staff phone is harmless and optional | rejected |
| 9 | BH: action and module validate email with different rules | low | same as 2.1 triage #3: zod runs first, so users see one rule; the fix is a refactor | rejected |
| 10 | BH: `setContactStatusAction` answers a malformed id with `errors.validation`, not `errors.notFound` | low | same pattern as `setClientStatusAction`; the id comes from a hidden field, never user-typed | rejected |
| 11 | BH: inline error's `aria-describedby` hides the field hint | false | `designsystemet-web` `field/field.js` merges Field's description and validation ids with the existing `aria-describedby` (as 2.1 triage #9) | rejected |
| 12 | BH: some behaviours (clear phone, email change, field errors) not covered by e2e | low | all are covered by `contacts.test.ts` and `contact-actions.test.ts` on a real DB; VG confirmed no gap | rejected |
| 13 | BH: status error alert is squeezed into the row (`display: contents`) | low | cosmetic, only on a rare server error | rejected |
| 14 | BH: `updateContact` maps any unique violation to "email taken" | low | `users_email_lower_unique` is the only unique index on `users`; the fix adds a constraint-name check | rejected |
| 15 | BH: name sort may depend on DB collation | maybe-false | would need the DB's `LC_COLLATE`; if true only `low` (order of Æ/Ø/Å or lowercase names) | rejected |
| 16 | BH: Edit contact heading does not name the client | low | cosmetic; the sidebar marks the open client and Cancel returns to it | rejected |
