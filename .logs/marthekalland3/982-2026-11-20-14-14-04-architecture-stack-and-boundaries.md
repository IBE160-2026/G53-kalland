# Architecture: stack and boundaries

## 2026-11-20 kl. 14:14 — marthekalland3

### Task
Start the architecture step (`bmad-architecture`, coaching path) from the PRD and UX of 2026-11-18: choose the stack and fix the module boundaries the stories must share. The spine is mainly for Claude as builder.

### Plan
- Read the PRD, addendum, decisions and `technology.md` (the teacher's example stack); log settled decisions as constraints in a new memlog.
- Compare realistic stacks with current versions checked on the web and npm; let the user choose.
- Then go through the invariants one at a time: paradigm, auth seam, access module, lifecycle, files, licences.
- Run memlog: [`.memlog.md`](../../_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/.memlog.md)

### Result
- Stack: Next.js 16 full-stack TypeScript with Designsystemet React (D-038, settles D-031). Claude recommended Django + HTMX; the user chose Next.js for correct-by-construction Designsystemet markup, `exiftool-vendored` and the many libraries and examples. The user corrected Claude's claim that the CSS-only prototype proves Designsystemet works without React.
- Auth: own small DB-session module with argon2, not Better Auth (D-039). Database layer: Drizzle on PostgreSQL (D-040).
- Paradigm: modular monolith with domain modules, stories delivered as vertical slices, five boundary rules (D-041).
- Vercel left out of v1 (4.5 MB request limit, no worker); hosting stays with RG-1.
- Commit `01a540d` (memlog), PR #45. The spine is not distilled yet; the run is paused.

### Open items
- Resume the architecture run from its memlog: answer the access-module questions (one SQL condition vs if/else; representative route tests vs full matrix), then image lifecycle and worker, storage and derived files, licences, AI port, errors/i18n, conventions, Docker/env; then distill and finalize the spine.

## 2026-11-23 kl. 08:56 — marthekalland3

### Task
Resume the paused architecture run and finish the spine: the remaining invariants one topic at a time, then distill, review and finalize.

### Plan
- Worked in a worktree on `docs/architecture-spine`; resumed from the memlog.
- Coaching topics in order: access module shape and tests, image lifecycle and queue, upload flow and locks, storage and file pipelines, licences and checkout, AI provider, conventions, place names, Docker/env/CI.
- Distill the spine, run the reviewer gate (five parallel reviewer subagents), fix findings, put open choices to the user, set `status: final`.
- Spine: [`ARCHITECTURE-SPINE.md`](../../_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md); reviews in the `reviews/` folder next to it.

### Result
- Spine final with AD-1 to AD-24: access as one SQL condition with a client-safe `ClientImage` view; SC-1 kept (access tests through real routes); image table as the job queue with a lease; per-field sources for metadata; optimistic concurrency with `version`; local FileStore; on-demand client copies with a fail-closed location check; one licence grant path; GeoNames place names; Docker Compose envelope.
- The user corrected Claude: "uploading" cannot be a browser-only state, because the UX shows other staff's uploads live.
- The reviewers found real holes in the first draft (guards in Server Actions, a lost update on the restricted list, images stuck without FR-15, AI input 1000 px vs 1568 px, three pins too new, starter defaults); all were fixed.
- The user decided: price lives on the licence type; build the client copy before recording a free-download licence; keep EXIF Orientation; keyword categories in prompt v3.
- PRD FR-35, the addendum, EXPERIENCE.md and DESIGN.md were updated to match.
- Commits `edec73f` (spine) and `4b030f6` (PRD/UX), PR #47. Decisions D-042 to D-049.

### Open items
- Foundation story: verify ExifTool in the app image (full `perl` package, `serverExternalPackages`, UTF-8 IIM writing).
- Prompt v3 adds keyword categories and the people rule; pilot it before relying on it (PRD Open Question 3).
- The PRD says PRD changes go through `bmad-correct-course`; FR-35 was edited directly with an addendum entry. Decide whether to run `bmad-correct-course` for it.
- UX mockups and the prototype still show a per-image price field and a percentage for all staff; the spec wins, update them only if they are used again.
