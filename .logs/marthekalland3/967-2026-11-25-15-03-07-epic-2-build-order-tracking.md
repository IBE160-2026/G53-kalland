# Epic 2 build-order tracking

## 2026-11-25 kl. 15:03 — marthekalland3

### Oppgave
A coordinating session in the main folder on `main`. It started as `/bmad-build` with no story given. The user asked which story comes next according to the plan, then kept this session open to hand out the next worktree commands while stories 2.1–2.3 were built in their own worktrees (D-016).

### Plan
- `/bmad-build` found no active specs, so it halted and asked which story to build. No spec was written in this session.
- Found the build order in `_bmad-output/planning-artifacts/epics.md` ("Dependencies and build order"): Epic 1 first, then the spine stories of Epics 2–5 and 7, then the planned stories by rank, then the bonus stories by rank.
- Read `.claude/scripts/start.sh` and gave the `start.sh` / `cd … && claude` / `/bmad-build <story>` commands for each story.
- Before giving each next story's commands, checked on GitHub that the previous PR was merged and its worktree removed.

### Resultat
- No code and no commits from this session. The stories were built in separate sessions:
  - 2.1: PR #68, merged
  - 2.2: PR #69, merged
  - 2.3: PR #70, merged
- Worktree commands given: `story/2.1-staff-create-and-manage-clients`, `story/2.2-staff-add-and-manage-contacts` and `story/2.3-contacts-set-password-from-setup-link`.
- After 2.3, `main` was on `eafe860` with no worktrees open.

### Åpne punkter
- Next is story 2.4 "Contacts can never reach staff routes or data", the last story in the Epic 2 spine. After it come 3.1–3.6.
