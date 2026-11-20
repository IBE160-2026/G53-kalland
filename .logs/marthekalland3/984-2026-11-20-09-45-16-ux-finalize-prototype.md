# ux-finalize-prototype

## 2026-11-20 kl. 09:45 — marthekalland3

### Task
Finish the UX run `ux-g53-kalland-2026-11-18`: review the mock generator's assumptions, fix the Fjordkaffe/Bryggen mismatch and set both spines to final. Then, at the user's request, build a clickable prototype of every screen before architecture starts.

### Plan
- `bmad-help`: placed us between UX and architecture.
- `bmad-ux` in Update mode:
  - review the more-screens assumptions and the four open questions with the user;
  - accept the remaining `[ASSUMPTION]` defaults;
  - skip the reviewer gate;
  - polish with the `bmad-review` structure and prose lenses;
  - set the spines to final.
- Prototype:
  - one foundation subagent: shell, router, seed store, access helpers, auth screens;
  - four parallel screen subagents: Library, Upload, admin, client;
  - check in Chrome.
- Process: [UX memlog](../../_bmad-output/planning-artifacts/ux-designs/ux-g53-kalland-2026-11-18/.memlog.md).

### Result
- **Spines.** `DESIGN.md` and `EXPERIENCE.md` are `status: final` (updated 2026-11-20).
  - **Open questions:** resolved:
    - staff menu in the account menu
    - "New batch" at the top of the Batches list
    - the Generating dot pulses
    - licence terms in a dialog
    - no visible licence-text version
  - **Assumptions:** the 25 `[ASSUMPTION]` defaults are accepted.
  - **Review fixes:** 16 structure and 23 prose findings applied. A diff check showed no lost IDs, colours or UI strings.
- **Mocks.**
  - Bryggen is no longer licensed to Fjordkaffe in `key-screens.html`.
  - "text version 2" is removed, and the terms are labelled as sample text.
- **Prototype.** `mockups/prototype/` covers all 16 surfaces for both roles, with working key flows.
  - Manual run in Chrome: all routes, checkout with the changed price, Library edit with the lock and the Unsaved-changes dialog. No JS errors.
  - I fixed five foundation bugs the agents reported:
    - previous login kept
    - "client copy" wording removed for clients
    - staff setup links work
    - seed times never in the future
    - a later check found one claimed bug (an invalid org number) was wrong
- **Commits:** `e79d35f` (prototype), `69e14cb` (spines, mocks, memlog) on `docs/ux-finalize-prototype`, PR #42.
- **Closed from earlier sessions:** UX finalize, more-screens assumptions, the Bryggen mismatch.
- **User decisions after the prototype review:**
  - Dropped for v1: shared batch title, description and alt text, and a separate "Licensed images" concept.
  - Ten change requests saved in the memlog.

### Open items
- Prototype round 1: apply the user's ten change requests (memlog "PROTOTYPE FEEDBACK" entries, 2026-11-20) in a fresh `bmad-ux` session. They include:
  - the preview height bug in the client Details panel
  - no empty Details column before an image is selected
  - New batch spacing
  - "Edit batch settings" on its own line
  - to-do items jumping to their files
  - the Licences filter layout
  - an Overview Details panel and image links
- Review the prototype builders' own choices, logged as an unreviewed assumption in the memlog: Library filter defaults, removing uploads on leave, cart totals at the price when added, and others.
- A licence-type filter on staff Licences: add it only when a second licence type exists (FR-23).
