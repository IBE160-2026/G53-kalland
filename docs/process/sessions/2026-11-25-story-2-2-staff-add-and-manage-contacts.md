# Session 2026-11-25: 2.2-staff-add-and-manage-contacts

- **Story/task:** Story 2.2 (staff add and manage contacts)
- **Prompts:** [prompts/2026-11-25.md](../prompts/2026-11-25.md) (14:02–14:20)
- **Transcript:** [transcripts/2026-11-25-3523d329.md](../transcripts/2026-11-25-3523d329.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/969-2026-11-25-14-24-53-2-2-staff-add-and-manage-contacts.md](../../../.logs/marthekalland3/969-2026-11-25-14-24-53-2-2-staff-add-and-manage-contacts.md)
- **Branch and PR:** `story/2.2-staff-add-and-manage-contacts`, #69 (open)
- **Commits:**
  - `59d0634` feat(contacts): staff add, edit, deactivate and reactivate contacts [S-2.2]
  - `e01a992` docs(story): story 2.2 spec, review triage and sprint status [S-2.2]

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Keep the ~2,100-token spec whole instead of splitting it | Accepted | One story; the only split would separate code from screen |
| Add/Edit contact as their own pages instead of an inline form | Accepted (chosen at spec approval) | Consistent with Add/Edit client, survives a page reload, easier to test |
| Optional phone (5–30 characters, digits and `+ - ( )`), the unique email as the guard against a double submit, no confirm step on Deactivate, contacts allowed on an inactive client | Accepted (at spec approval) | Follows the conventions (natural key) and 2.1's choice not to confirm actions that can be undone |
| 16 review findings | Adjusted: 2 fixed, 14 rejected, 0 deferred | Fixed: the edit action did not check that the contact belongs to the client in the URL, and one message key was built by string concatenation. Each finding is logged in the spec's triage table |
| The build workflow's final step makes a local commit | Rejected | CLAUDE.md: commit only when the user asks (`/wrap-up`) |

## Bugs found in AI-generated code
- `updateContactAction` saved by contact id alone and never checked that the contact belonged to the client in the URL, so a crafted request could edit another client's contact and redirect to the wrong client. Noticed by Claude when reading the diff, then flagged by all three review layers. Fixed by loading the contact first and returning Not found on a mismatch, with a new action test.
- `CONTACT_EMAIL_TAKEN` was built by string concatenation, so the key could not be found by searching `messages/en.json`. Found by the Blind Hunter review; replaced with the literal key.

## Decisions
- [D-071](../decisions.md): contacts: phone on `users`, unique email as the double-submit guard
