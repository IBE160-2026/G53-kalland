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
