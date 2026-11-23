# Session 2026-11-23: story 1.4 upload

- **Story/task:** Story 1.4 – Staff upload an image and the library stores it safely ([spec](../../../_bmad-output/implementation-artifacts/spec-1-4-staff-upload-an-image-and-the-library-stores-it-safely.md))
- **Prompts:** [prompts/2026-11-23.md](../prompts/2026-11-23.md) (13:25–15:13)
- **Transcript:** [transcripts/2026-11-23-c81bd9e7.md](../transcripts/2026-11-23-c81bd9e7.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/976-2026-11-23-15-14-26-1-4-staff-upload-an-image.md](../../../.logs/marthekalland3/976-2026-11-23-15-14-26-1-4-staff-upload-an-image.md)
- **Branch and PR:** `story/1.4-staff-upload-an-image-and-the-library-stores-it-safely`, #56 (open)
- **Commits:**
  - `d549178` feat(upload): store uploaded JPEG and PNG files as drafts with derived files and embedded metadata [S-1.4]
  - `c4a2d0b` docs(story): story 1.4 spec, epic 1 context, README and sprint status [S-1.4]
  - `c480e23` Logg: 1.4 staff upload an image

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Keep the Upload page browser-only; a reload empties it | Rejected; the user chose `?batch=<id>` in the URL with stored rows rendered on reload | Losing the list on reload looks like lost uploads |
| Agent wording for the two messages NFR-7 lacks (location-check hit, lost connection) | Accepted | User kept the wording |
| One ~2,800-token spec instead of a split | Accepted | Schema, media, route and page depend on each other |
| WebP thumbnail ≤ 480 px and preview ≤ 800 px; XMP → IIM → EXIF read order; one file at a time | Accepted | Not set by the PRD; recorded as D-057 and D-059 |
| First implementation | Adjusted: 5 missing matrix tests, then 10 review fixes (groups of 500 files, reload shows interrupted rows as lost, live region for status, anchored proxy exclusion, 6 test gaps) | Matrix audit and three-layer review; 17 findings rejected with reasons in the spec's triage log |
| Drop handler on the drop zone (from a review fix) | Removed | The user's manual run showed each dropped file sent twice; the native input already takes drops |

The user answered "go ahead" to the three open questions; Claude took that as accepting its recommendations and as approval of the spec, and said so before implementing.

## Bugs found in AI-generated code
- **Missing tests for the spec's matrix** (found by Claude's matrix audit of the implementer's diff): the Uploading tag, the too-large and lost-connection messages in the UI, `tmp/` cleanup and the > 10 MB proxy case had no test. Five tests added; no code bug behind them.
- **Review findings** (three reviewer subagents): more than 500 files failed the whole addition with a generic error; a reload showed interrupted rows as "Uploading" forever; status changes were not announced to screen readers; the proxy exclusion matched a path prefix. Fixed, with tests; see the spec's Review Triage Log.
- **Double upload on drag and drop** (found by the user in the manual `docker compose up --build` run): a dropped photo was sent twice, and the second copy was refused as "already in the library" (the database held one image). Cause: the review fix for drag-and-drop tests added an `onDrop` handler on the drop zone, but Designsystemet's native file input covers the zone and already takes the drop. The scripted e2e drop passed because a script cannot trigger the input's native drop. Fixed by removing the handler; the e2e test now checks that the input covers the zone and that the zone adds nothing on its own. Re-tested by the user.

## Decisions
- [D-057](../decisions.md): upload transport (Server Action rows, raw-body PUT, one at a time, outside the proxy)
- [D-058](../decisions.md): the batch id in the Upload page URL (user's choice)
- [D-059](../decisions.md): WebP derived files and the embedded-metadata read order
