# 1.6 publish with visibility and price

## 2026-11-23 kl. 16:27 — marthekalland3

### Oppgave
Build Story 1.6 with `/bmad-build`: staff find drafts in the Library, set visibility (Internal / Restricted / Public), clients and price (Free / Paid), and publish them.

### Plan
- bmad-build: spec from epics.md § Story 1.6, epic 1 context and the architecture spine; implementation subagent; three review layers; full verification.
- Spec: [spec-1-6-staff-publish-an-image-with-its-visibility-and-price.md](../../_bmad-output/implementation-artifacts/spec-1-6-staff-publish-an-image-with-its-visibility-and-price.md)
- User decisions: unsaved-changes dialog deferred to Story 3.4; spec kept as one (~2,700 tokens); restricted list cleared when an image leaves Restricted (asked after review).

### Resultat
- Licence tables (`licence_types`, `licence_texts`) and the seeded "Standard commercial use" type at 90 USD; migration `0005_publish.sql`.
- Library wall (48 per page, newest first), Details panel with view / Edit / Save changes (optimistic `version`, client list as a diff), "Publish this image" with the missing-metadata dialog; `visibleToAllSince` and `image_clients.addedAt`.
- Review: 27 findings, 9 fixes, 1 deferred, the rest rejected (Review Triage Log in the spec). The client-list rule was fixed as a targeted patch instead of the workflow's revert-and-rebuild (spec change log).
- Tests: 253 Vitest and 68 Playwright pass; lint, typecheck and `db:generate` clean. The first run caught a millisecond-vs-microsecond bug in the new paging test (fixed) and hit the 1.5 sweep flake once (already open in issues.md).
- Commits `5985112` (code) and `1531ed9` (story docs); PR #59.

### Åpne punkter
- Check story 1.6 by hand as Ida: upload, Restricted + Paid, publish; tile shows client name and "90 USD".
- E2E test for retrying after a stale Save changes in the Library panel (deferred-work.md).
- Unsaved-changes dialog in the Library panel (deferred to Story 3.4).
