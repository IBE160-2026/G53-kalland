# Session 2026-11-20: ux-prototype-feedback

- **Story/task:** – (planning: finish UX before architecture)
- **Prompts:** [prompts/2026-11-20.md](../prompts/2026-11-20.md) (09:48–10:51)
- **Transcript:** [transcripts/2026-11-20-6b1c6506.md](../transcripts/2026-11-20-6b1c6506.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/983-2026-11-20-10-55-38-ux-prototype-feedback.md](../../../.logs/marthekalland3/983-2026-11-20-10-55-38-ux-prototype-feedback.md)
- **Branch and PR:** `docs/ux-prototype-feedback`, #43 (open)
- **Commits:**
  - `5e29fe7` docs(ux): apply prototype feedback and large-batch upload behaviour
  - `0ab956d` docs(ux): update and finalize DESIGN.md and EXPERIENCE.md after prototype review
  - `Logg: ux-prototype-feedback` (teacher's log)

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Fix the 8 prototype feedback items as listed in the UX log | Accepted | The user's own feedback from the last session |
| To-do click: move the files to the top (the user's idea) or filter the list | Accepted: move to the top | User choice |
| Licence-type filter: hide it or show it disabled | Accepted: hide it (D-037) | User choice; v1 has one licence type (FR-23) |
| Accept or change the prototype builders' 9 unreviewed choices | Accepted all 9 | User choice |
| Switch width fix: `width: auto` on the switch | Adjusted: kept the stretch rule off the switch instead | Measuring showed `width: auto` shrank the switch to 4 px |
| Overview at ≤ 1240 px: panel under the page, scrolled into view | Accepted | Not raised by the user; mentioned in the summary as my own choice |
| Large batches: re-sort when idle, fold ready rows, compact drop bar, split legend | Accepted | User picked each from AI-drafted options after the 100-file run |
| Ready group stays open while the selected file is inside it | Adjusted: Hide deselects that file, and clicking the selected row deselects it at every width | The browser test showed the group could not be closed and the order never caught up |
| Library opens on drafts after a big batch (Status filter starts unticked) | Logged, not changed | The user chose to finalize as is |
| Reviewer gate | Skipped | User choice |
| 10 structure and prose fixes on the spine changes | Accepted all | User choice |

The user's request to check 100-photo batches before finalizing was their own idea, not an AI suggestion. It found the problems behind the four large-batch changes.

## Bugs found in AI-generated code
- **Thin client previews** (user's report from the last session):
  - **What:** the 236 px preview box shrank in a long Details panel.
  - **Found:** by measuring it in headless Chrome. It was 178 px tall, and less in longer panels.
  - **Fixed:** with `flex-shrink: 0` on `.loupe` in `app.css`.
- **Long Paid only switch:**
  - **What:** the filter-field rule `width: 100%` also hit the switch input.
  - **Fixed:** my first fix (`width: auto`) shrank the switch to 4 px, which the measurement caught. The final fix keeps the rule off the switch with `:not(.adm-switch)`.
- **"Files that need you first" was false after processing** (found by the 100-file run):
  - **What:** the order was fixed when the files were added. Failed files and file name matches ended up in the middle of the list.
  - **Fixed:** the order now re-sorts when you're idle.
- **Focus timing:** the shell's route focus ran after my scroll and focus code.
  - **Effect:** the to-do jump and the Overview scroll did nothing.
  - **Found:** by test assertions.
  - **Fixed:** the code now waits one animation frame.
- **Ready group could not be closed:**
  - **What:** the group stayed open while the selected file was inside it, and on wide screens there was no way to deselect.
  - **Found:** by the browser test.
  - **Fixed:** Hide now deselects that file, and clicking the selected row again deselects it.
- **My own test errors (not app bugs):**
  - I served the wrong folder, so the theme CSS returned 404.
  - A test selector grabbed the `ov-lic-h` heading instead of a licence link.
  - Both were fixed in the test scripts.
- **Process slip:** my first finalize memlog entry said no open items were left. EXPERIENCE.md still has two open questions that belong elsewhere: D-031 is decided in architecture, and RG-6 covers the licence text. A correction entry was added; the memlog is append-only.

## Decisions
- [D-037](../decisions.md): no licence-type filter on staff Licences while v1 has one licence type
- Referenced: D-016 (worktree), D-031 (still open, for architecture), D-036
