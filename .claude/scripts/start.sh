#!/usr/bin/env bash
# Start a code session in its own worktree, so several sessions can write code at once (D-016).
# Usage: .claude/scripts/start.sh <branch>   e.g. start.sh story/1.2-upload
set -euo pipefail

branch="${1:-}"
case "$branch" in
  docs/process-*) echo "docs/process-* branches are made by /commit-logs only." >&2; exit 1 ;;
  story/*/* | fix/*/* | chore/*/* | docs/*/*) echo "Use one slash only: <type>/<slug>." >&2; exit 1 ;;
  story/?* | fix/?* | chore/?* | docs/?*) ;;
  *) echo "Usage: start.sh <story|fix|chore|docs>/<slug>, e.g. start.sh story/1.2-upload" >&2; exit 1 ;;
esac

main_dir="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"
dir="$(dirname "$main_dir")/$(basename "$main_dir")-${branch#*/}"

if git -C "$main_dir" show-ref --verify --quiet "refs/heads/$branch"; then
  echo "The branch $branch already exists locally." >&2
  exit 1
fi
if [ -e "$dir" ]; then
  echo "$dir already exists." >&2
  exit 1
fi

git -C "$main_dir" fetch --quiet origin main
# --no-track: the branch gets its own upstream on the first push, never origin/main.
git -C "$main_dir" worktree add --quiet --no-track -b "$branch" "$dir" origin/main

if [ -f "$main_dir/.env" ]; then
  cp "$main_dir/.env" "$dir/.env"
  echo "Copied .env into the worktree."
fi

echo "Worktree ready on $branch. Start the session with:"
echo "  cd \"$dir\" && claude"
