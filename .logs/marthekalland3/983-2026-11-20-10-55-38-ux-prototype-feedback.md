# ux-prototype-feedback

## 2026-11-20 kl. 10:55 — marthekalland3

### Task
Continue bmad-ux: apply the user's round-1 feedback on the clickable prototype. Then, at the user's request, check how Upload looks with 100-photo batches before finalizing the UX.

### Plan
- Update mode on `_bmad-output/planning-artifacts/ux-designs/ux-g53-kalland-2026-11-18/`, in the worktree `docs/ux-prototype-feedback` (D-016).
- The user decided the open questions: move to-do rows to the top, hide the licence-type filter, accept all 9 prototype builder choices.
- Fix the 8 remaining feedback items. Two were dropped earlier, D-036.
- Check in headless Chrome (puppeteer-core in the scratchpad, served on port 8799).
- Add a 10/100-file sample switch to the prototype pill, run a 100-file batch, show the user the findings and let them pick the fixes.
- Finalize: the user skipped the reviewer gate; ran the bmad-review structure and prose lenses on the spine diff, and the user approved all 10 findings.

### Result
- **Prototype feedback** (`mockups/prototype/`):
  - The Library Details panel is hidden until an image is selected.
  - Upload: space below New batch; Edit batch settings on its own line; a to-do click moves its rows to the top, scrolls there and focuses the first one.
  - Licences: the Paid only switch is no longer stretched.
  - Client preview: the loupe no longer shrinks (`flex-shrink: 0`).
  - Client Overview: has its own Details panel (`#/overview/:imageId`), and licence rows link to their image.
- **Large batch:**
  - New 100-file sample switch in the prototype pill.
  - The file order re-sorts when idle; clicking the selected row again deselects it at every width.
  - Ready and published files fold into one group row: the 100-file page went from 8,467 px to 2,230 px.
  - A compact "Add more files" bar takes drops anywhere on the page.
  - The legend counts "need alt text" apart from "ready".
- **Spines:** DESIGN.md and EXPERIENCE.md are updated and still `status: final`. The memlog has all the decisions and the "spines finalized" entry, plus one correction: the finalize entry wrongly said no open items were left.
- **Verified:** all 8 items plus the large-batch run (about 55 s of simulated processing) in headless Chrome, with no JS errors. Two of my first fixes failed the measurement and were redone: the switch shrank to 4 px, and the ready group could not be closed.
- **Commits:** `5e29fe7` (prototype) and `0ab956d` (spines). PR #43 is open.
- **Closed:** two open items from [ux-finalize-prototype](984-2026-11-20-09-45-16-ux-finalize-prototype.md), the prototype round-1 changes and the review of the builders' choices.

### Open items
- The licence-type filter stays open as an earlier item, now recorded as D-037.
- The Library Status filter still starts with nothing ticked. After a big batch the Library opens on mostly drafts. The user chose to keep it; it can be revisited when the stories are built.
