# Session 2026-11-25: Story 2.1 staff create and manage clients

- **Story/task:** S-2.1 (Staff create and manage clients)
- **Prompts:** [prompts/2026-11-25.md](../prompts/2026-11-25.md) (13:27–13:53)
- **Transcript:** [transcripts/2026-11-25-75314094.md](../transcripts/2026-11-25-75314094.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/970-2026-11-25-13-54-55-2-1-staff-create-and-manage-clients.md](../../../.logs/marthekalland3/970-2026-11-25-13-54-55-2-1-staff-create-and-manage-clients.md)
- **Branch and PR:** `story/2.1-staff-create-and-manage-clients`, #68 (open)
- **Commits:**
  - `a3e8006` feat(clients): staff create, edit and set clients inactive [S-2.1]
  - `cd610a5` docs(story): story 2.1 spec, epic 2 context, review triage and sprint status [S-2.1]
  - `ccd19d2` Logg: 2-1-staff-create-and-manage-clients

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Keep the ~1,700-token spec whole instead of splitting it | Accepted | One goal across data, module and UI |
| Billing email and account manager required, org number and notes optional. Inactive clients shown in the sidebar with a tag and no filter. No confirm step for Set inactive | Accepted (at spec approval) | Follows FR-1's wording ("optional org number"). Setting a client inactive can be undone |
| Run `clients.spec.ts` last, as a third Playwright project | Accepted | It sets the seeded Nordlys Sykkel AS inactive for a moment, while other specs log in as its contact Emil (D-070) |
| 23 review findings | Adjusted: 6 fixed, 2 deferred, 15 rejected | Fixed: a note over 5,000 characters was refused with no message, unused returned values, the README note on existing databases, a try/finally that could leave Nordlys inactive, and missing e2e tests for Edit and a malformed id. Each finding is logged in the spec's triage table |
| The build workflow's final step makes a local commit | Rejected | CLAUDE.md: commit only when the user asks (`/wrap-up`) |

The user did not reject or correct any suggestion in this session. They answered the two checkpoint questions with the recommended options and approved the wrap-up proposal as written.

## Bugs found in AI-generated code
- **Silent refusal on long staff notes.** Notes over 5,000 characters failed zod, but notes have no inline error, so the action returned an empty error state and the form showed nothing. Found by two review layers (Blind Hunter, Edge Case Hunter). Fixed: the action returns the general validation error when no field matches, with a new action test.
- **Unused data.** The actions returned the entered values on every refused save, and tests asserted on them, but the form never read them. Found in review. Deleted.
- **E2e test could leave a seeded client inactive.** The `try/finally` that sets Nordlys active again started after two assertions. Found in review. Moved to start right after the click.
- **Test gaps.** No test opened the Edit page or a malformed client id. Found by the Verification Gap layer. Added two e2e tests.

## Decisions
- [D-070](../decisions.md): Clients e2e runs last as its own Playwright project.
