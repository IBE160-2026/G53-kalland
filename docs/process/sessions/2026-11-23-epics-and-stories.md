# Session 2026-11-23: epics-and-stories

- **Story/task:** – (planning: `bmad-help`, then `bmad-create-epics-and-stories`)
- **Prompts:** [prompts/2026-11-23.md](../prompts/2026-11-23.md) (09:01–10:06)
- **Transcript:** [transcripts/2026-11-23-14010a70.md](../transcripts/2026-11-23-14010a70.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/981-2026-11-23-10-08-35-epics-and-stories.md](../../../.logs/marthekalland3/981-2026-11-23-10-08-35-epics-and-stories.md)
- **Branch and PR:** `docs/epics-and-stories` (worktree `../g53-kalland-epics-and-stories`), #49 (open)
- **Commits:**
  - `2d7c332` docs(prd): client search also matches alt text, aligned with AD-6
  - `4854c8d` docs(epics): epics and stories for v1 (7 epics, 56 stories)
  - `14954af` Logg: epics-and-stories

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Inputs: final PRD + addendum + rollout gate, architecture spine, UX spine pair; leave out technology.md, project-plan.md, older PRDs, research | Accepted | Superseded or draft documents would add conflicts |
| Write epics.md in a new docs worktree, not the main folder | Accepted | D-016: the main folder only collects process files |
| FR-28 says title, description, keywords; AD-6 adds alt text – follow AD-6 | Accepted ("Follow AD-6") | Alt text is shown to clients already, so searching it leaks nothing (D-051) |
| Epic 1 as a cross-cutting thin slice; later epics by area; spine → planned → bonus inside each epic; a bonus-only admin epic | Accepted | Matches the PRD's build order and checkpoint (D-050) |
| Keep Epic 1 at ~45 h although the PRD says 35–40 h before the checkpoint | Accepted | A failed checkpoint already has the PRD's reduced spine |
| Move FR-38b (activity list) from Epic 4 to Epic 6 | Accepted | It lists downloads, which only the action log (FR-42a, Epic 6) records; avoids a forward epic dependency (D-050) |
| Spine estimate ~99 h vs PRD 75 h: cut nothing now, record the gap and three UX cut candidates for the checkpoint | Accepted | Epic 1's real hours on 11-30 show which estimates hold (D-052) |

The user accepted every suggestion in this session; none was adjusted or rejected.

## Bugs found in AI-generated code
None in code (no code this session). The skill's final validation found four faults in the AI-written stories, all fixed before the commit: Story 3.10 depended on staff search from a later epic, Story 6.1 required logging actions that might not be built, Story 6.5 did not state that it needs Story 4.8, and NFR-3 (uploaded files out of git) was not in any acceptance criterion. Earlier, two story texts referred to Epic 3 story numbers before they existed (1.5, 1.6); found on re-reading and reworded to FR IDs.

## Decisions
[D-050](../decisions.md#d-050-epics-start-with-a-thin-slice-stories-run-spine--planned--bonus-inside-each-epic), [D-051](../decisions.md#d-051-client-search-also-matches-alt-text), [D-052](../decisions.md#d-052-story-estimates-exceed-the-prds-spine-budget-nothing-is-cut-before-the-checkpoint)
