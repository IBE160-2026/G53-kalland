# Session 2026-10-16: repo-cleanup

- **Branch:** `chore/repo-cleanup`
- **Story/task:** – (process/chore, issue #4)
- **Prompt log:** [prompts/2026-10-16.md](../prompts/2026-10-16.md) (12:09–12:17)
- **Transcript:** [transcripts/2026-10-16-0deb3fe5.md](../transcripts/2026-10-16-0deb3fe5.md)

## Goal
Clean up the repo: close the issue that was still open, delete merged branches, commit uncommitted changes, and make the clean-up happen automatically from now on.

## Key prompts
- 12:09 – "We need to clean up the repo. We have an issue still open. It needs to be closed and merged branches should be deleted. Uncommited changes should be comitted. [...] Ideally, keeping the repo clean, should be kept up automatically."
- (shell, between 12:09 and 12:13) The user ran `gh api -X PATCH ... delete_branch_on_merge=true` themselves after Claude's suggestion; it returned HTTP 404.
- 12:13 – "yes, push and open the PR" (the push was rejected because the token lacked the `workflow` scope)
- 12:16 – "done, push and open the PR" (after refreshing the gh login with the `workflow` scope)

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Close issue #4 with a comment pointing to PR #5 | Accepted | #5 did the work but never referenced #4, so the issue stayed open. |
| Delete the merged branch `docs/product-brief-feedback` locally and on GitHub; move the pending prompt log to a new branch off `main` | Accepted | The branch was merged in #8; committing to it would have stranded the work. |
| Enable the repo setting "Automatically delete head branches" | Rejected by circumstances: Claude's attempt was blocked by the permission classifier, and the user's own run returned HTTP 404 | The student account has push access but not admin, and the settings belong to the organization. |
| Replace the setting with a GitHub Actions workflow that deletes the head branch on merge | Accepted | Needs only push access. Not yet verified whether Actions are enabled for the org. |
| `Closes #<n>` in PRs, local `fetch.prune`, a one-liner in CLAUDE.md for deleting gone local branches | Accepted | Prevents the issue #4 situation and leftover branches. |
| Push the workflow file | Adjusted: the push was rejected (`workflow` scope missing); the user refreshed the gh login, then the push succeeded | GitHub requires the extra scope for files in `.github/workflows/`. |

## Bugs found in AI-generated code
None found. The workflow is untested until PR #9 merges.

## Commits
- `b8f1b7c` chore(process): automatic issue and branch hygiene [#4]
- `e0fd817` chore(ci): delete merged branches with a workflow [#4]

## Decisions
- [D-012: Automatic repo hygiene for issues and branches](../decisions.md)

## Next steps
- Merge PR #9 and check that `chore/repo-cleanup` is deleted automatically. If it is not, Actions are probably off for the org; ask the teacher or merge with `gh pr merge --delete-branch`.
- Locally: switch to `main`, pull, and delete the gone local branch with the CLAUDE.md one-liner.
