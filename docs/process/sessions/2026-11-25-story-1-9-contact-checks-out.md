# Session 2026-11-25: Story 1.9 – a contact checks out a paid image and staff see the licence

- **Story/task:** S-1.9 (`1-9-a-contact-checks-out-a-paid-image-and-staff-see-the-licence`)
- **Prompts:** [prompts/2026-11-25.md](../prompts/2026-11-25.md) (12:45–13:15)
- **Transcript:** [transcripts/2026-11-25-f24f197b.md](../transcripts/2026-11-25-f24f197b.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/971-2026-11-25-13-16-52-1-9-contact-checks-out.md](../../../.logs/marthekalland3/971-2026-11-25-13-16-52-1-9-contact-checks-out.md)
- **Branch and PR:** `story/1.9-contact-checks-out`, #67 (open)
- **Commits:**
  - `1bde273` feat(licences): single-image checkout, licence grant and staff Licences tab [S-1.9]
  - `ce887a8` docs(story): story 1.9 spec, review triage and sprint status [S-1.9]
  - `17878a1` Logg: 1-9-contact-checks-out

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Keep the ~2,500-token spec as one spec instead of splitting off the Licences tab and SC-3 | Accepted | Every part is an AC of the same story, and SC-3 needs all of them |
| Seed licences as purchases by Jonas at 90 USD; no Download button on the confirmation; the "removed" message uses the title the form sent | Accepted (at spec approval) | Downloads belong to Epic 5; the title rule stops the message from revealing a hidden image's title |
| Submit the checkout form from `onSubmit` instead of the form `action` | Accepted | With `action`, React reset the form after a price change and unticked the terms box |
| 22 review findings | Adjusted: 6 fixed, 16 rejected | Rejected ones need revoke (5.7), editable licence texts (6.2) or paging, contradict the fixed NFR-7 texts, or cannot happen; each one is logged in the spec's triage table |
| The build workflow's final step makes a local commit | Rejected | CLAUDE.md: commit only when the user asks (`/wrap-up`) |

The user approved the spec and the wrap-up proposal as written; there were no corrections from the user in this session.

## Bugs found in AI-generated code
- **Seed licences on failed uploads** (edge-case and blind review). The seed granted licences to rows whose upload had failed and which were left `uploading`. The licence's `restrict` foreign key would then make `sweepStaleUploads` fail on every run. Fix: grant only for rows that seeded completely.
- **Missing seen price became 0** (edge-case review). With no `seenPriceMinor` in the form, the checkout action coerced it to 0 and showed a false "changed from 0" message. Fix: a strict digit-only parse that gives the validation error.
- **Long titles could never be licensed** (edge-case review). `seenTitle` was capped at 1000 characters, but image titles have no limit, so checkout of a longer title always failed. Fix: limit removed.
- **Untested server checks** (verification-gap review). The checkout action's server-side terms check and validation had no test; the e2e tests only covered the disabled button. Fix: new `src/app/(client)/checkout/actions.test.ts`.
- **Form reset unticked the terms box** (found by the implementation subagent in e2e). With the form `action` prop, React reset the form after a price change, so "Confirm new price" failed. Fix: submit from `onSubmit`.
- **Matrix gap** (my audit after implementation). The staff Licences empty state had no test. Fix: a static `EmptyState` render in `empty-state.test.ts`.

## Decisions
None
