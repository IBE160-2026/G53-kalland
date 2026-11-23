# Session 2026-11-23: 1.8 contact finds images

- **Story/task:** Story 1.8 – A contact finds the images their client may see
- **Prompts:** [prompts/2026-11-23.md](../prompts/2026-11-23.md) (20:13–20:45)
- **Transcript:** [transcripts/2026-11-23-948d55d4.md](../transcripts/2026-11-23-948d55d4.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/972-2026-11-23-20-47-02-1-8-contact-finds-images.md](../../../.logs/marthekalland3/972-2026-11-23-20-47-02-1-8-contact-finds-images.md)
- **Branch and PR:** `story/1.8-contact-finds-images`, #64 (open)
- **Commits:**
  - `5b2dec4` feat(access): contacts find the images their client may see [S-1.8]
  - `896a047` docs(story): story 1.8 spec, sprint status and deferred work [S-1.8]

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Own tiles (A4) show the tick and "Yours to download" now, though download comes in Epic 5 | Accepted (user's choice) | Matches UX-DR-13/15 (D-069) |
| Keep the roughly 2,100-token spec as one spec | Accepted (user's choice) | One user goal, as in 1.7 |
| Use `?image=` as the client image page, not a separate route | Accepted | Mirrors the staff Library; the panel never navigates away (D-068) |
| Axe scans in `a11y.spec.ts`, not `find-images.spec.ts` as the spec said | Accepted | Repo convention (`SCAN_LIST`) |
| Review: give the preview the title as alt text when there is no alt text, test the formatters, bracket the count test, test a visible image without a file, stop exporting the SQL fragments | Patched | Real defects or gaps (NFR-5a, flaky test) |
| Review: lean file-access query, a transaction around count and rows, a group-level 404, notice that search is ignored, and others | Rejected | Low impact, or excluded by intent; reasons in the spec's triage log |
| The build workflow's own step: make a local commit | Not done | `CLAUDE.md`: commit only after the user asks |

The user approved the spec without changes and confirmed the `/wrap-up` proposal with "ok". The user rejected or corrected no suggestion in this session.

## Bugs found in AI-generated code
- **Decorative preview:** the client panel preview used `alt={altText ?? ""}`, which makes it decorative when there is no alt text and breaks NFR-5a (alt text → title → "Untitled image"). Found in code review (blind layer). Fixed by falling back to `image.title`.
- **Flaky count test:** the access count test could fail when other Vitest files published images at the same time, because only one of the two clients' reads was bracketed. Found in code review. Fixed by reading other, listed, other, listed and accepting only a stable attempt.
- **Untested formatters:** `formatDateTaken` and `cameraName` were never run by any test, because the seed images have no EXIF date or camera data. Found by the verification-gap layer. Moved to `format.ts`, with tests for each branch.
- **Stale README:** the README test count (346/33) went out of date after the review patches. Found when rerunning the suite (353/34), and corrected.

## Decisions
- [D-068](../decisions.md): The client image page is the Find images wall with `?image=`, and access reads what it needs itself
- [D-069](../decisions.md): Own tiles show "Yours to download" before download exists
