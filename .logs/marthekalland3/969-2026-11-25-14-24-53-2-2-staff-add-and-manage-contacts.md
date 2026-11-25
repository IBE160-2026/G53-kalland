# 2-2-staff-add-and-manage-contacts

## 2026-11-25 kl. 14:24 — marthekalland3

### Task
Build Story 2.2 (staff add and manage contacts) with `/bmad-build`: staff add contacts to a client, edit them, and deactivate or reactivate them, never delete.

### Plan
- Reuse the valid `epic-2-context.md` and the Story 2.1 spec for continuity; investigate the accounts module, client pages, sessions and seed.
- Spec: [spec-2-2-staff-add-and-manage-contacts.md](../../_bmad-output/implementation-artifacts/spec-2-2-staff-add-and-manage-contacts.md). Kept whole (~2,100 tokens); the user chose own pages for Add/Edit contact and approved it.
- Implementation by a subagent, three review layers (Blind Hunter, Edge Case Hunter, Verification Gap), triage, patches.

### Result
- Migration `0008_contact-phone.sql`: nullable `users.phone`. Seed gives Jonas a phone.
- `accounts/contacts.ts`: `createContact`, `updateContact`, `setContactStatus`, `listContactsForStaff`, `getContactForStaff`, all staff-only and acting on contacts only. A duplicate email is an inline error and also guards a double submit (D-071).
- UI: Contacts section on the client page, `contacts/new` and `contacts/[contactId]/edit` pages, Deactivate/Reactivate without confirm.
- Review: 16 findings, 2 fixed (edit action now checks the contact belongs to the client; literal message key), 14 rejected, 0 deferred. Logged in the spec's triage table.
- Tests: Vitest 492/492 and Playwright 126/126 in the Docker test stack; lint and typecheck clean.
- Commits `59d0634` (code) and `e01a992` (spec and sprint status); PR #69.

### Open items
- Check story 2.2 by hand with `docker compose up` on a fresh database: Ida adds a contact to Fjordkaffe, a duplicate email is refused, deactivating Emil refuses him.
