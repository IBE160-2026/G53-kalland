# Session 2026-11-25: Story 2.3 – contacts set their password from a setup link

- **Story/task:** Story 2.3 (FR-4, FR-5, UJ-4)
- **Prompts:** [prompts/2026-11-25.md](../prompts/2026-11-25.md) (14:29–14:55)
- **Transcript:** [transcripts/2026-11-25-ce1c7626.md](../transcripts/2026-11-25-ce1c7626.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/968-2026-11-25-14-57-20-2-3-contacts-set-password-from-setup-link.md](../../../.logs/marthekalland3/968-2026-11-25-14-57-20-2-3-contacts-set-password-from-setup-link.md)
- **Branch and PR:** `story/2.3-contacts-set-password-from-setup-link`, #70 (open)
- **Commits:**
  - `9b2301e` feat(auth): setup links let contacts set their password [S-2.3]
  - `605bfba` docs(story): story 2.3 spec, review triage and sprint status [S-2.3]
  - `98e86ce` Logg: 2-3-contacts-set-password-from-setup-link

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Show the link on the Add contact page (no redirect) instead of under the new row on the client page (mockup) | Accepted (chosen at spec approval) | The token stays in the action response; no cookie needed to carry it across a redirect |
| Keep the ~2,100-token spec whole | Accepted | One story; splitting would leave the password-reset AC unmet |
| No confirm-password field; "New setup link" on every row; an inactive contact is refused on submit and the link stays unused | Accepted | Left to the AI in the spec; recorded there |
| `useSetupLink` as in the spec | Adjusted: named `redeemSetupLink` | ESLint's hooks rule treats any `use*` function as a React hook |
| 22 review findings | Adjusted: 4 fixed, 1 deferred, 17 rejected | Fixed: a test for issuing links in parallel (the old tests would pass without the row lock), a test for the too-long inline error, "Copied" shown when the fallback copy failed, and a misnamed row component. Deferred: a check of Next's request log. Each finding is logged in the spec's triage table |
| The build workflow's final step makes a local commit | Rejected | CLAUDE.md: commit only when the user asks (`/wrap-up`) |

## Bugs found in AI-generated code
- **"Copied" without a copy:** `setup-link-panel.tsx` showed "Copied" even when the fallback `execCommand("copy")` failed. Found by the Edge Case Hunter and Blind Hunter reviews; fixed so the status shows only after a successful copy.
- **Untested row lock:** the lock that keeps one open link per user could be removed without any test failing. Found by the Verification Gap review. The fix adds a test that issues 8 links at once; it was shown to fail with the lock removed (2 parallel calls were not enough to trigger the race).
- **Found, not fixed (from 2.1):** the implementer's axe scan of the whole client page fails colour contrast on the selected client's sub-line in the Clients sidebar; the new scan covers only the link panel.

## Decisions
- [D-072](../decisions.md#d-072-setup-links-hashed-single-use-tokens-in-the-path-shown-on-the-add-contact-page): setup links as hashed single-use tokens in the path, shown on the Add contact page.
