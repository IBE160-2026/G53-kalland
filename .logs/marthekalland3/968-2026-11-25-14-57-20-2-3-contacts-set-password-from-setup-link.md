# 2-3-contacts-set-password-from-setup-link

## 2026-11-25 kl. 14:57 — marthekalland3

### Task
Build Story 2.3 with `/bmad-build`: contacts set their own password from a single-use setup link that staff copy and send themselves (the app sends no email).

### Plan
- Spec: [spec-2-3-contacts-set-their-password-from-a-setup-link.md](../../_bmad-output/implementation-artifacts/spec-2-3-contacts-set-their-password-from-a-setup-link.md). The user chose at the checkpoint to show the link on the Add contact page (no redirect) and to keep the ~2,100-token spec whole.
- `setup_links` table owned by auth; `issueSetupLink` called from `createContact` in the same transaction; per-row "New setup link"; public `/setup/<token>` page; expired/used/replaced links go to Login with the S8 message.
- Implementation subagent, then three review subagents (Blind Hunter, Edge Case Hunter, Verification Gap) and triage.

### Result
- Commits `9b2301e` (code) and `605bfba` (spec, triage, sprint status) on `story/2.3-contacts-set-password-from-setup-link`; PR #70 open.
- Migration `0009_setup-links`. Tokens stored only as SHA-256; a conditional update makes a link single-use; a user-row lock keeps one open link per user; setting a password ends all other sessions.
- Review: 22 findings — 4 fixed (parallel-issue test, too-long inline test, "Copied" only on a real copy, row component renamed `ContactRow`), 1 deferred, 17 rejected; all in the spec's triage log.
- Verified: lint, typecheck, Vitest 520/520, Playwright 128/128 (incl. UJ-4).

### Open items
- Check story 2.3 by hand with `docker compose up`: add a contact, copy the link, set a password in a private window, reopen the link → expired message.
- Test that Next's request log never prints `/setup/<token>` (deferred-work.md).
- Colour contrast fails (axe) on the selected client's sub-line in the Clients sidebar (from story 2.1).
