# Session 2026-11-18: ux-design-round-3

- **Story/task:** – (planning phase, `bmad-ux` on PRD `prd-g53-kalland-2026-11-18`)
- **Prompts:** [prompts/2026-11-18.md](../prompts/2026-11-18.md) (15:18–20:36)
- **Transcript:** [transcripts/2026-11-18-d458307d-89e0-4697-af8a-ec2cf736109f.md](../transcripts/2026-11-18-d458307d-89e0-4697-af8a-ec2cf736109f.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/985-2026-11-18-20-38-16-ux-design-round-3.md](../../../.logs/marthekalland3/985-2026-11-18-20-38-16-ux-design-round-3.md)
- **Branch and PR:** `docs/ux-design-round-3`, #40 (open)
- **Commits:**
  - `a9881ea` docs(ux): round 3 and 4, Graphite theme, more screens and draft spines
  - `c627ed3` docs(prd): explicit Save changes for library edits (FR-17, FR-18)
  - `bc8f28c` Logg: ux-design-round-3

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Ask whether the Upload panel should follow the Library's Edit/Save model | Kept autosave for upload drafts | User choice: drafts are work in progress |
| Round 3: details drop below all images on narrower screens (inherited from 2A) | Rejected: inline under the selected image (full width); Upload uses an accordion row | User feedback |
| Apply the inline rule to the client panel too | Kept; the user did not object | Same pattern as the staff inspector (earlier decision) |
| Unsaved-changes handling: ask, block or discard | Accepted: a Save / Discard / Keep editing dialog | User choice |
| Colour pass: a mix of refinements and clearly different palettes | Accepted; Graphite chosen | User choice |
| Agreed the price needs its own shade in Graphite; four hues, Aubergine recommended | Rejected: user asked for greys, chose cool slate grey | Wanted a quiet price; the AI's caveat (a grey price reads like the meta text) was accepted |
| Flag that text actions have no cue in Graphite | Accepted: underline | User choice |
| Show captions switch | User's idea; the AI asked follow-ups (remember per user, no hover, clients too) | — |
| Clients on public images: option A (staff-granted licence) with a PRD change | Rejected: not in v1; only a data-model note added | Few real cases (D-034) |
| Client panel metadata: four options | Adjusted: three picked, no photographer credit | User choice |
| Update PRD FR-17 to match the explicit-save UX | Accepted | D-033 |
| Collections: no slot, keep a slot, or add to v1 | Out of v1, no slot; removed from the mock | User choice; PRD already said "Later" |
| Run the reviewers now | Adjusted: deferred to next session | User wrapping up; findings need the user present |

## Bugs found in AI-generated code
These are bugs in the HTML mocks and the comparison page, not app code.
- **Deep link to round 3:** the comparison page's hash link `#d(\w\w)` needed a two-character ID, so round "3" could not be linked. Found by reading the script before publishing; renamed to "R3".
- **Current palette contrast:** the warning orange `#E07B24` was 2.99:1 on white, under 3:1 for markers. The renderer's contrast script caught it, and it was nudged to `#DE7922`. This no longer matters, since Graphite was chosen.
- **Graphite selected title:** it looked disabled (mid-grey). Found in a screenshot and changed to ink.
- **Theme legend overflow:** the legend summary overflowed by 11 px at 360 px. Found by the scripted overflow check and fixed.
- **Collections leftover:** the round-4 mock still showed Collections after they were ruled out of v1. Found when triaging the spine's open questions; removed from `mockups/key-screens.html`.
- **Content mismatch, not fixed:** in `key-screens.html`, Fjordkaffe licenses "Drone view of Bryggen in winter" in the staff view, but has it in the cart in the client view. Found by the more-screens renderer; open item.

## Decisions
- [D-033](../decisions.md#d-033-library-edits-are-saved-explicitly-upload-drafts-autosave): Library edits are saved explicitly; upload drafts autosave (PRD FR-17, FR-18 updated).
- [D-034](../decisions.md#d-034-no-client-ownership-of-public-images-in-v1): no client ownership of public images in v1; the licence record keeps room for it.
- D-031 (Designsystemet vs shadcn/ui) is still open.
