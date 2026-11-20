# Session 2026-11-20: ux-finalize-prototype

- **Story/task:** – (planning: finish UX before architecture)
- **Prompts:** [prompts/2026-11-20.md](../prompts/2026-11-20.md) (07:35–09:44)
- **Transcript:** [transcripts/2026-11-20-783169db.md](../transcripts/2026-11-20-783169db.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/984-2026-11-20-09-45-16-ux-finalize-prototype.md](../../../.logs/marthekalland3/984-2026-11-20-09-45-16-ux-finalize-prototype.md)
- **Branch and PR:** `docs/ux-finalize-prototype`, #42 (open)
- **Commits:**
  - `e79d35f` docs(ux): clickable prototype of all screens
  - `69e14cb` docs(ux): finalize DESIGN.md and EXPERIENCE.md, fix round-4 mocks
  - `0b874e0` Logg: ux-finalize-prototype

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Renderer assumptions in the more-screens mock (account manager, single-name contacts, changed-price confirm, no order number) match the PRD, so keep them | Accepted | Checked against FR-1, FR-2, UJ-3 and FR-32 |
| Number after each client in the Clients sidebar | Accepted: licence count | User choice of three options |
| Show a licence text version | Rejected: no visible version, snapshot per licence (D-035) | User choice |
| Keep the placeholder licence text, labelled as a sample | Accepted (D-035) | The real text comes from the legal reviewer (RG-6) |
| Open questions 1–4: account menu, New batch in the sidebar, pulsing Generating dot, terms dialog | Accepted | User picked the recommended options |
| Accept all 25 remaining `[ASSUMPTION]` defaults | Accepted | Small defaults, easy to change later |
| Skip the reviewer gate (rubric and accessibility lenses) | Accepted | They ran at the round-3 finalize |
| 16 structure and 23 prose fixes from `bmad-review` | Accepted all. The editing agent kept a few items where cutting would have lost content | Polish only. A diff check found no lost IDs, colours or UI strings |
| Prototype as one clickable app, with key flows working | Accepted | User choice of two options for each question |
| Prototype builders' own choices (Library filter defaults, removing uploads on leave, cart totals at the price when added, and others) | Logged as unreviewed in the memlog | Not yet reviewed by the user |
| The prototype as built | Adjusted: the user asked for 10 changes after clicking through it, saved for the next session | User's manual review |
| Shared batch title, description and alt text; a "Licensed images" concept | Rejected for v1 (D-036) | User's choice, to protect the remaining hours |
| A licence-type filter on staff Licences | Deferred | v1 has one licence type (FR-23) |

## Bugs found in AI-generated code
- **Bugs in the subagent-built prototype:**
  - **What:**
    - The Overview could never show the previous login, because `App.login` overwrote it.
    - A download status message said "client copy" to clients, which the Voice rules ban.
    - Staff setup links always went to "Link expired".
    - Seeded "today" times could lie in the future.
  - **Found:** by the screen agents' review of the foundation and their jsdom smoke tests.
  - **Fixed:** by me in `app.js`, `screens/auth.js` and `screens/client.js`.
- **A false report:** the admin agent reported an invalid seeded org number. I checked it against the mod-11 algorithm and it was valid, so nothing was changed.
- **Manual run in Chrome:** no JS errors. The user's review found a preview height bug in the client Details panel; it is still open.
- **Process slip:**
  - **What:** my first try to log memlog entries failed, because zsh does not split `$M` into words.
  - **Found:** from the exit code.
  - **Fixed:** I re-ran the commands with a shell function.
- **Wrong port:** I first opened port 8765, which another of the user's local apps was using. I left that app alone and served the prototype on port 8799 instead.

## Decisions
- [D-035](../decisions.md): licence text has no visible version, and the accepted text is stored with each licence
- [D-036](../decisions.md): shared batch metadata and a "Licensed images" concept are out of v1
- Referenced: D-031 (still open, for architecture), D-033
