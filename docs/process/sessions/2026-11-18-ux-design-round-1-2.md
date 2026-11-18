# Session 2026-11-18: ux-design-round-1-2

- **Story/task:** – (UX phase, `bmad-ux` Create; PRD `prd-g53-kalland-2026-11-18`)
- **Prompts:** [prompts/2026-11-18.md](../prompts/2026-11-18.md) (09:48–15:11)
- **Transcript:** [transcripts/2026-11-18-dc11bbb7.md](../transcripts/2026-11-18-dc11bbb7.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/986-2026-11-18-15-13-37-ux-design-round-1-2.md](../../../.logs/marthekalland3/986-2026-11-18-15-13-37-ux-design-round-1-2.md)
- **Branch and PR:** `docs/ux-design-round-1-2`, #38 (open)
- **Commits:**
  - `6f47061` docs(ux): start UX spec with two rounds of design directions on Designsystemet
  - `b3bfdbd` chore(skills): add Anthropic's frontend-design skill as a project skill
  - `7aa8f4c` docs(claude): UI is English in v1, Norwegian pack later (PRD NFR-8)
  - `c06384b` Logg: ux-design-round-1-2

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Use the PRD, the teacher's PRD feedback and the domain research as UX sources | Adjusted: latest PRD only | The PRD already includes the feedback |
| Log accessibility as deferred (following the user's first answer), then flag that the PRD requires WCAG 2.1 AA | Adjusted: keep the PRD's WCAG 2.1 AA | User decision |
| Flag that CLAUDE.md says the UI is Norwegian while PRD NFR-8 says English | Accepted: CLAUDE.md updated | The PRD is the source of truth |
| Answer "other design skills" by listing this skill's built-in tools | Rejected: the user had to ask again; then Anthropic's skills repo was researched | The user meant adding new skills |
| Install the whole `example-skills` plugin (12 skills) | Adjusted by AI and explained: only `frontend-design` vendored | Avoid a shadcn-based builder and a duplicate skill-creator |
| Render brief with prices in NOK | Rejected: USD | PRD FR-23; caught by a renderer agent |
| 10 directions | 02 chosen as the base, with parts from 01, 03, 07 and 10; 05 rejected | The user's feedback for each direction |
| Round 2: three navigation variants, a shape toggle and three price treatments | Accepted: header-led, crisp, plain price | User choice |
| Autosave in the inspector (02's "Saved 10:42") | Rejected: Edit button, unsaved-changes state, Save changes | User: no automatic saving of library edits |
| A large Upload button on the Library page | Rejected | Upload has its own tab in the header |
| Re-tune Designsystemet's warning colour from brown-amber to orange | Kept for now, not yet reviewed by the user | Follows the user's "no yellow-brown" |

## Bugs found in AI-generated code
- **NOK prices in all mocks.** Claude's render brief said NOK, but the PRD says USD (FR-23). A renderer subagent noticed the mismatch. The brief and the mocks were corrected, and the running agents were told.
- **Direction 10 showed selected images as black boxes.** The CSS styled `.loop path`, which cannot reach inside an SVG `<use>`, so the path fell back to a black fill. Found in headless Chrome screenshots, fixed by moving fill and stroke to the `<svg>` element and the symbol.
- **Direction 02's date filter was broken.** The two date inputs were squeezed into two columns in the narrow sidebar. Found by the user and fixed in round 2 (each input gets its own row).
- **Round 2C's filter-bar chips showed broken checkboxes.** Found and fixed by the renderer from its own screenshots.
- **Open: the sidebar toggle hides under the open sidebar on tablet and phone (round 2).** Found by the user, to be fixed in round 3.
- **False alarm, not a bug:** the first 360 px screenshots looked cut off. Headless Chrome cannot go narrower than about 485 px; measuring inside a 360 px iframe showed no overflow on any screen.

## Decisions
- [D-031](../decisions.md): Designsystemet as the UI component system (Open, to be settled against `technology.md` in architecture)
- [D-032](../decisions.md): Anthropic's frontend-design skill as a project skill
