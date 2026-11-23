# Session 2026-11-23: 1.7 sample library

- **Story/task:** Story 1.7, The examiner starts with a sample library ([spec](../../../_bmad-output/implementation-artifacts/spec-1-7-the-examiner-starts-with-a-sample-library.md))
- **Prompts:** [prompts/2026-11-23.md](../prompts/2026-11-23.md) (19:32–20:02)
- **Transcript:** [transcripts/2026-11-23-331aa613.md](../transcripts/2026-11-23-331aa613.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/973-2026-11-23-20-03-40-1-7-sample-library.md](../../../.logs/marthekalland3/973-2026-11-23-20-03-40-1-7-sample-library.md)
- **Branch and PR:** `story/1.7-sample-library`, #62 (open)
- **Commits:**
  - `1c572e4` feat(seed): sample library of 22 photos seeded through module functions [S-1.7]
  - `b6e240c` docs(story): story 1.7 spec, sprint status and deferred work [S-1.7]

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Commit all 23 of the user's phone photos, resized to 1600 px, with camera metadata stripped except on the location test files | Adjusted | The user kept the photos with children (faces not shown), the painting, the 3M samples and the Snapchat photo, then dropped `book-plane-window.jpg` after review because its cover shows a swastika (22 images) |
| Licence wording: CC0 or "all rights reserved, sample data only" | Accepted (b) | The user chose "© all rights reserved, used only as sample data in this repo" |
| A11 (archived): add a minimal `archiveImage` now, or defer A11 to 4.2 | Accepted (add now) | The story's acceptance criteria name A11; the function is one conditional update that 4.2 reuses |
| Delete the empty-Library e2e test and replace it with a component render test | Accepted with a known gap | The e2e database is now always seeded; the gap (page branch, sidebar text, axe scan) is logged in `deferred-work.md` |
| SOURCES.md said the painting is "owned by the photographer" | Rejected | Nobody had stated it; removed in review |
| A check that nothing is seeded while `SEED_ON_START` is unset, run on the shared test database | Rejected | It could not fail; moved to the seed test's empty database |
| Mock keywords "indoors", "daylight", "evening" and "interior" | Rejected | Wrong category; replaced with seasons and places |
| CSS fix for a 4 px overflow from Story 1.6, outside this story's scope | Accepted | The seeded tiles exposed it in the existing no-horizontal-scroll test |

## Bugs found in AI-generated code
- **Story 1.6 tile overflow:** a visually hidden separator in `.wall-tile-meta` escaped the tile's clipping and widened the page by 4 px. Found by the existing `shell.spec` no-horizontal-scroll test once the library had seeded tiles. Fixed with `position: relative`.
- **A test that could not fail:** the first version of the "nothing is seeded without `SEED_ON_START`" check ran on the shared test database, where the images table is never empty, so it would pass even without the switch. Found by the verification-gap review. Moved to the seed test's own empty database.
- **Wrong log and order:** the seed read the image folder before checking whether images exist, so a missing folder would break every start. It also logged a partial seed as a full success, and a missing Ida as "Images exist". Found by the edge-case and blind reviews; all three fixed.
- **Partial library after an interrupted first start:** a later start skips seeding, so the library stays incomplete. Found by review. Documented in the README (`docker compose down -v`) rather than changing the agreed "seed on an empty images table" rule.
- **Invented fact:** `SOURCES.md` said the painting was owned by the photographer, which nobody had said. Found by the blind review and removed.

## Decisions
- [D-065](../decisions.md#d-065-the-sample-library-uses-the-developers-own-photos): The sample library uses the developer's own photos
- [D-066](../decisions.md#d-066-the-image-seed-has-its-own-gate-and-archiveimage-comes-before-story-42): The image seed has its own gate, and `archiveImage` comes before Story 4.2
