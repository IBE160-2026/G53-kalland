#!/usr/bin/env bash
# Merge the PR of a code branch, remove its worktree and update main (D-016).
# Usage: .claude/scripts/finish.sh [PR number]   (without a number: the PR of the current branch)
set -euo pipefail

main_dir="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"

if [ "$(gh api repos/IBE160-2026/G53-kalland --jq '.permissions.push')" != "true" ]; then
  echo "The active gh account cannot push. Switch with: gh auth switch --user marthekalland3" >&2
  exit 1
fi

pr="${1:-$(gh pr view --json number --jq .number)}"
branch="$(gh pr view "$pr" --json headRefName --jq .headRefName)"
state="$(gh pr view "$pr" --json state --jq .state)"
if [ "$state" != "OPEN" ]; then
  echo "PR #$pr is $state, not open." >&2
  exit 1
fi

# The folder where the branch is checked out: a worktree, or the main folder itself.
worktree="$(git -C "$main_dir" worktree list --porcelain | awk -v ref="branch refs/heads/$branch" '
  /^worktree / { path = substr($0, 10) }
  $0 == ref { print path }')"

# Check before merging, so nothing local is lost afterwards.
if [ -n "$worktree" ]; then
  # docs/process/ is skipped: in the main folder it always holds uncommitted process files.
  if [ -n "$(git -C "$worktree" status --porcelain -- . ':!docs/process')" ]; then
    echo "$worktree has uncommitted changes. Commit or discard them first." >&2
    exit 1
  fi
  if [ "$(git -C "$worktree" rev-parse HEAD)" != "$(git ls-remote origin "refs/heads/$branch" | cut -f1)" ]; then
    echo "$branch is not pushed as it is locally. Push it first." >&2
    exit 1
  fi
fi

echo "Waiting for the checks on PR #$pr ..."
gh pr checks "$pr" --watch
gh pr merge "$pr" --merge

if [ "$worktree" = "$main_dir" ]; then
  git -C "$main_dir" switch --quiet main
elif [ -n "$worktree" ]; then
  git -C "$main_dir" worktree remove "$worktree"
  echo "Removed the worktree $worktree."
fi

if [ "$(git -C "$main_dir" branch --show-current)" = "main" ]; then
  # --rebase: local main may hold unpushed Logg: commits (D-014); --autostash: the process files are dirty.
  git -C "$main_dir" pull --quiet --rebase --autostash --prune
else
  git -C "$main_dir" fetch --quiet --prune
  echo "The main folder is not on main, so main was not pulled there."
fi
git -C "$main_dir" branch -vv | awk '/: gone]/{print $1}' | while read -r gone; do
  git -C "$main_dir" branch -d "$gone" || true
done

echo "PR #$pr merged and main updated."
if [ -n "$worktree" ] && [ "$worktree" != "$main_dir" ]; then
  echo "Leave the removed folder with: cd \"$main_dir\""
fi
