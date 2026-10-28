#!/usr/bin/env bash
# Commit the uncommitted process files in docs/process/ and merge them through their own PR (D-013, D-016).
# Runs in the main folder on main and never switches branch, so sessions in other worktrees
# can keep writing prompt logs meanwhile. The commit is made on local main and reaches
# GitHub only through the PR from docs/process-<date>.
# Usage: .claude/scripts/commit-logs.sh   (from the main folder or any worktree)
set -euo pipefail

cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"

if [ "$(git branch --show-current)" != "main" ]; then
  echo "The main folder ($PWD) is not on main. Finish or park that branch first." >&2
  exit 1
fi
if [ -n "$(git status --porcelain --untracked-files=all -- . ':!docs/process')" ]; then
  echo "There are changes outside docs/process/ in $PWD:" >&2
  git status --short --untracked-files=all -- . ':!docs/process' >&2
  exit 1
fi
if [ "$(gh api repos/IBE160-2026/G53-kalland --jq '.permissions.push')" != "true" ]; then
  echo "The active gh account cannot push. Switch with: gh auth switch --user marthekalland3" >&2
  exit 1
fi

# --rebase: local main may hold unpushed Logg: commits (D-014); --autostash: the process files are dirty.
git pull --quiet --rebase --autostash --prune

changed="$(git status --porcelain --untracked-files=all -- docs/process)"
ahead="$(git log --oneline origin/main..HEAD)"
if [ -z "$changed" ] && [ -z "$ahead" ]; then
  echo "No process files to commit."
  exit 0
fi

# Secret scan of every new or changed file that still exists.
files=()
while IFS= read -r file; do
  if [ -f "$file" ]; then files+=("$file"); fi
done < <(git ls-files --modified --others --exclude-standard -- docs/process)
if [ ${#files[@]} -gt 0 ] && ! python3 .claude/hooks/redact.py --scan "${files[@]}"; then
  echo "Possible secrets found (masked above). Nothing was committed. Fix the files and run again." >&2
  exit 1
fi

sessions=()
for file in ${files[@]+"${files[@]}"}; do
  if [[ "$file" == docs/process/sessions/* ]]; then sessions+=("$file"); fi
done
topics=""
if [ ${#sessions[@]} -gt 0 ]; then
  topics="$(sed -n 's/^# Session [0-9-]*: //p' "${sessions[@]}" | paste -sd ',' - | sed 's/,/, /g')"
fi
[ -n "$topics" ] || topics="process logs"

branch="docs/process-$(date +%F)"
n=1
while git show-ref --quiet "refs/heads/$branch" || git ls-remote --exit-code --heads origin "$branch" >/dev/null; do
  n=$((n + 1))
  branch="docs/process-$(date +%F)-$n"
done

if [ -n "$changed" ]; then
  git add -- docs/process
  decisions="$(git diff --cached -- docs/process/decisions.md | sed -n 's/^+## \(D-[0-9]*: .*\)/- \1/p')"
  git commit --quiet -m "docs(process): $topics"
fi

body="$(
  echo "Process files only (D-013). Made by \`.claude/scripts/commit-logs.sh\`."
  echo
  echo "## Commits"
  git log --format='- %h %s' origin/main..HEAD
  echo
  echo "## Files"
  git diff --name-only origin/main..HEAD | sed 's/^/- /'
  if [ -n "${decisions:-}" ]; then
    echo
    echo "## New decisions"
    echo "$decisions"
  fi
)"

git push --quiet origin "HEAD:refs/heads/$branch"
url="$(gh pr create --base main --head "$branch" --title "docs(process): $topics" --body "$body")"
echo "Opened $url"

# Give GitHub a moment to register the checks before watching them.
for _ in 1 2 3 4 5 6 7 8 9 10 11 12; do
  [ "$(gh pr checks "$url" --json name --jq length 2>/dev/null || echo 0)" != "0" ] && break
  sleep 5
done
gh pr checks "$url" --watch
gh pr merge "$url" --merge
git pull --quiet --rebase --autostash --prune
git branch -vv | awk '/: gone]/{print $1}' | while read -r gone; do
  git branch -d "$gone" || true
done

echo "Merged $url ($(git rev-parse --short HEAD) on main)."
