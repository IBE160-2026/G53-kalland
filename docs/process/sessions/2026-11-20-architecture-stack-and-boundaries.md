# Session 2026-11-20: architecture-stack-and-boundaries

- **Story/task:** – (planning step 3, architecture, in `project-plan.md`)
- **Prompts:** [prompts/2026-11-20.md](../prompts/2026-11-20.md) (11:09–14:10)
- **Transcript:** [transcripts/2026-11-20-23655b5c.md](../transcripts/2026-11-20-23655b5c.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/982-2026-11-20-14-14-04-architecture-stack-and-boundaries.md](../../../.logs/marthekalland3/982-2026-11-20-14-14-04-architecture-stack-and-boundaries.md)
- **Branch and PR:** `docs/architecture`, #45 (open)
- **Commits:**
  - `01a540d` docs(architecture): memlog for stack and module boundaries (paused run)
  - `801efbd` Logg: architecture-stack-and-boundaries

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Django + HTMX as the stack | Rejected: Next.js full-stack | The user preferred correct-by-construction Designsystemet markup, `exiftool-vendored` and the many Next.js libraries and examples, and accepted building auth and access rules with them |
| "The CSS-only prototype proves Designsystemet works without React" | Corrected by the user | Components also need correct HTML and ARIA; Claude then checked `@digdir/designsystemet-web` and revised the comparison |
| First stack comparison | Adjusted: the user asked for a high-effort reassessment | It surfaced what the first pass missed: the metadata research's finding that the library pulls toward Node, Django's missing production queue, and htmx 4 being brand new |
| Leave Vercel out of v1 (4.5 MB request limit, no long-running worker) | Not contested; hosting stays with RG-1 | v1 does not go live (D-009) |
| Own session module instead of Better Auth | Accepted | Few, exact login rules; a library would mostly be switched off. A later swap stays possible behind one auth module |
| Drizzle instead of Prisma | Accepted | Access rules and S5 read most clearly close to SQL |
| Modular monolith with five boundary rules | Accepted, after the user asked how it differs from vertical slices | Shared rules (access, licences, file pipeline) must exist once |

## Bugs found in AI-generated code
None. No code was written.

## Decisions
- [D-038](../decisions.md#d-038-nextjs-full-stack-typescript-with-designsystemet-react): Next.js full-stack TypeScript with Designsystemet React; [D-031](../decisions.md#d-031-designsystemet-as-the-ui-component-system) set to Accepted
- [D-039](../decisions.md#d-039-own-small-session-module-instead-of-an-auth-library): own small session module
- [D-040](../decisions.md#d-040-drizzle-as-the-database-layer): Drizzle
- [D-041](../decisions.md#d-041-a-modular-monolith-with-domain-modules-built-in-vertical-slices): modular monolith with domain modules, built in vertical slices
