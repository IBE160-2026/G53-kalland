# Session 2026-11-23: architecture-spine

- **Story/task:** – (architecture step; resumes the run paused in [2026-11-20-architecture-stack-and-boundaries](2026-11-20-architecture-stack-and-boundaries.md))
- **Prompts:** [prompts/2026-11-23.md](../prompts/2026-11-23.md) (07:15–08:55)
- **Transcript:** [transcripts/2026-11-23-9b94ec4c.md](../transcripts/2026-11-23-9b94ec4c.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/982-2026-11-20-14-14-04-architecture-stack-and-boundaries.md](../../../.logs/marthekalland3/982-2026-11-20-14-14-04-architecture-stack-and-boundaries.md) (section 2026-11-23)
- **Branch and PR:** `docs/architecture-spine`, #47 (open)
- **Commits:**
  - `edec73f` docs(architecture): finalize architecture spine after reviewer gate
  - `4b030f6` docs(prd,ux): align FR-35, price field and keyword groups with the architecture
  - `9e63308` Logg: architecture-stack-and-boundaries

Result: [ARCHITECTURE-SPINE.md](../../../_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md), `status: final`, AD-1 to AD-24. The five reviewer reports are in `reviews/` next to it.

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| One SQL condition for "visible to client X", used by every client list, count and page | Accepted | Lists, counts and pages can't disagree |
| Keep SC-1 and test access through real routes at HTTP level | Accepted | Keeps the PRD promise; cheap with one shared fixture |
| "Uploading" as a browser-only state | Rejected by user | The UX shows other staff's uploads live, so the row is created at upload start |
| Upload percentage only for the uploader | Accepted | Avoids writing progress to the database |
| Image table as the job queue, no queue library | Accepted | One source of truth for processing state |
| Build client copies on demand, no cache | Accepted | User: "a second per download is fine" |
| AI run history in its own table | Accepted (user's choice between two options) | Keeps data for comparisons and AI-governance evidence |
| "Own image" = holds a licence | Adjusted (Claude corrected itself) | Missed PRD row A4 (restricted + free with no licence) |
| Record the licence before building the file for free downloads | Reversed, confirmed by user | NFR-10: a failed build must leave no licence |
| First spine draft | Adjusted after review | Reviewers found missing guards in Server Actions, lost updates on the restricted list, stuck queue items without FR-15, missing field sources and more |
| AI input 1000 px | Adjusted | Contradicted the addendum and pilot (1568 px) |
| Pins @anthropic-ai/sdk 1.11.0, vitest 5.1.1, Playwright 1.65.1 | Adjusted | Too new for the 2-week rule; now 1.7.0, 5.1.0 and 1.65.0 |
| Starter defaults assumed to fit | Adjusted | create-next-app 16.4.6 turns on Tailwind and Cache Components; the spine now gives explicit flags |
| Price per licence type, not per image | Accepted (user) | Matches PRD FR-23 and FR-40; the UX field becomes read-only |
| Keep EXIF Orientation on client copies | Accepted (user) | Portrait photos would otherwise arrive sideways; FR-35 updated |
| Keyword categories in the prompt v3 schema | Accepted (user) | The UX groups keywords by category |

## Bugs found in AI-generated code
None. No code was written this session. Errors in the AI-drafted spine were found by the five reviewer subagents and by checking against the PRD, and are listed in the table above. Two smaller slips were also caught:
- Claude's memlog recorded @anthropic-ai/sdk 1.11.0 as within the two-week rule; the version reviewer found it was published 2026-11-19.
- While appending this session's decisions, a shell heredoc dropped the session-log links from the Trace lines; caught by a grep and fixed before the files were written.

## Decisions
- [D-042](../decisions.md#d-042-one-access-condition-in-sql-and-access-tests-through-real-routes): one access condition in SQL, and access tests through real routes
- [D-043](../decisions.md#d-043-the-image-table-is-the-job-queue-for-ai-generation): the image table is the job queue
- [D-044](../decisions.md#d-044-local-file-storage-behind-one-interface-client-copies-built-on-demand-and-checked-for-location-data): local FileStore, on-demand client copies, fail-closed location check
- [D-045](../decisions.md#d-045-place-names-from-a-committed-geonames-extract): GeoNames place names
- [D-046](../decisions.md#d-046-client-copies-keep-the-exif-orientation-tag): client copies keep EXIF Orientation
- [D-047](../decisions.md#d-047-generated-keywords-carry-a-category-in-prompt-v3): keyword categories in prompt v3
- [D-048](../decisions.md#d-048-a-paid-images-price-comes-from-its-licence-type): price comes from the licence type
- [D-049](../decisions.md#d-049-the-architecture-spine-is-final-after-a-five-reviewer-gate): spine final after a five-reviewer gate
