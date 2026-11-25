# 2-1-staff-create-and-manage-clients

## 2026-11-25 kl. 13:54 — marthekalland3

### Task
Build Story 2.1 (staff create and manage clients) with `/bmad-build`: a Clients tab where staff add, edit and set clients inactive or active, never delete.

### Plan
- Compile `epic-2-context.md`, investigate the accounts module, guards, sidebar and seed.
- Spec: [spec-2-1-staff-create-and-manage-clients.md](../../_bmad-output/implementation-artifacts/spec-2-1-staff-create-and-manage-clients.md). Kept whole (~1,700 tokens) and approved by the user.
- Implementation by a subagent, three review layers (Blind Hunter, Edge Case Hunter, Verification Gap), triage, patches.

### Result
- Migration `0007_client-details.sql`: org number, billing email, account manager, staff notes, `created_at` and a unique form nonce on `clients`.
- `accounts`: `createClientAsStaff`, `updateClient`, `listClientsForStaff`, `getClientDetails`, `listActiveStaff`. `shared/org-number.ts` has the mod-11 check.
- UI under `src/app/(staff)/clients/`: sidebar list, details page, Add/Edit form with inline errors, Set inactive/active. Clients tab in the nav. Seed clients get org number, billing email and Ida as account manager.
- Review: 23 findings, 6 fixed, 2 deferred (deferred-work.md), 15 rejected. Logged in the spec's triage table.
- Tests: Vitest 452/452 and Playwright 122/122 in the Docker test stack; lint and typecheck clean.
- Commits `a3e8006` (code) and `cd610a5` (spec and sprint status); PR #68.

### Open items
- Check story 2.1 by hand with `docker compose up` on a fresh database: Ida adds a client, an invalid org number is refused, setting Nordlys inactive refuses Emil.
- Test whether Back after Add client reuses the form nonce and drops a second client (deferred-work.md, unverified).
- Story 2.4: exempt or move `accounts.createClient` (no Actor, unchecked details) for the guard test (deferred-work.md).
