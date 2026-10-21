# Session 2026-10-21: bmad-planning

- **Story/task:** – (planning ahead of the PRD)
- **Prompt log:** [prompts/2026-10-21.md](../prompts/2026-10-21.md) (13:54–14:10)
- **Transcript:** [transcripts/2026-10-21-9a4eba16.md](../transcripts/2026-10-21-9a4eba16.md)

## Code
- **Branch:** `docs/bmad-planning`
- **Commits:**
  - `9f08dea` docs(plan): add phase-by-phase project plan from brief to delivery
- **PR:** #12 (open)

## Goal
Plan the rest of the project phase by phase, following the BMad workflow from where the product brief leaves off, with rough time estimates, and list work that can be done before building (sample content, assets, accounts, tools). No code.

## Key prompts
- 13:54 – "git checkout main && git pull"
- 13:55 – "The goal of this session is to plan ahead for this bmad project. Make a new branch for this."
- 14:00 – "Do not write any code or project files - this session is for planning only. I would like a phase-by-phase plan following the BMAD workflow from where the brief leaves off, listing the steps and a time estimate for each. … I would like to looka at what I can do before we start building, such as gathering dummy content, assets, accounts, etc."
- 14:07 – "You can add it where it akes sense in the repo as an md file"
- 14:08 – "commit it and open a PR"

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Branch name `docs/bmad-planning` | Accepted (not discussed) | Matches the `docs/<slug>` convention in CLAUDE.md. |
| Next step after the brief: start the PRD with `bmad-prd` | Adjusted – the user asked for a full phase-by-phase plan first | The user wanted an overview to plan their time before starting the next BMad step. |
| Plan: PRD → UX → architecture → epics/stories → sprint planning → build → delivery, with estimates (planning ≈ 14–20 h, build ≈ 45–65 h, delivery ≈ 6–10 h) and a week-by-week calendar | Accepted | Based on the brief's v1 scope, the teacher's feedback and the grading criteria. |
| Use CC0/public-domain or own photos as sample images, not Unsplash/Pexels, since their licenses forbid selling photos unaltered or building a competing service | Accepted into the plan | The app is a stock storefront that sells images, so those licenses don't fit. |
| Test whether the Claude Code CLI can describe an image non-interactively before the architecture step | Accepted into the plan | It is the biggest technical unknown for the CLI provider. |
| First answered in the terminal only (no files written, as the user asked); offered a page | Adjusted – the user asked for an md file in the repo | The user wanted the plan kept in the repo. |
| Put the plan in `_bmad-output/planning-artifacts/project-plan.md` | Accepted | Planning documents belong in `_bmad-output/` (CLAUDE.md). |

No suggestion was rejected or corrected by the user this session.

## Bugs found in AI-generated code
None. No code was written.

## Decisions
No new decisions. The plan is a draft; its deadline (assumed mid-December) and weekly hours are open items in the plan.

## Next steps
- Confirm the exact deadline and hours per week; update the calendar in `project-plan.md`.
- Merge PR #12.
- Start the preparation work: sample images, dummy clients, questions for the agency, sketches, CLI image test.
- Next BMad step: the PRD (`bmad-prd`).
