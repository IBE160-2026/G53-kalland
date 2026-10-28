#!/usr/bin/env python3
"""UserPromptSubmit hook: logs every prompt to docs/process/prompts/YYYY-MM-DD.md.

The log is always written in the main checkout, also when the session runs in a
worktree (D-016). On `/wrap-up` the hook prints the session ID and the main checkout,
which Claude Code adds to the conversation, so parallel sessions never mix them up.

The log is committed as evidence of AI use (criterion 1 in the grading guide), so
anything that looks like a secret is masked before it is written. The hook must never
block a prompt: all errors are swallowed and the script always exits with 0.
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from main_checkout import main_checkout  # noqa: E402
from redact import redact  # noqa: E402


def current_branch(cwd: Path) -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=cwd, capture_output=True, text=True, timeout=2,
        )
        return result.stdout.strip() or "unknown"
    except Exception:
        return "unknown"


def fence_for(text: str) -> str:
    # Fence longer than the longest backtick run in the prompt, so the markdown does not break.
    longest = max((len(run) for run in re.findall(r"`+", text)), default=0)
    return "`" * max(3, longest + 1)


def main() -> None:
    data = json.load(sys.stdin)
    prompt = (data.get("prompt") or "").strip()
    if not prompt:
        return

    project_dir = Path(os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or ".")
    main_dir = main_checkout(project_dir)
    now = datetime.now()
    log_file = main_dir / "docs" / "process" / "prompts" / f"{now:%Y-%m-%d}.md"
    log_file.parent.mkdir(parents=True, exist_ok=True)

    text = redact(prompt)
    fence = fence_for(text)
    session = (data.get("session_id") or "unknown")[:8]
    entry = (
        f"### {now:%H:%M:%S} · session `{session}` · branch `{current_branch(project_dir)}`\n\n"
        f"{fence}text\n{text}\n{fence}\n\n"
    )

    is_new = not log_file.exists()
    with log_file.open("a", encoding="utf-8") as f:
        if is_new:
            f.write(
                f"# Prompt log {now:%Y-%m-%d}\n\n"
                "Logged automatically by `.claude/hooks/log-prompt.py`. "
                "Secrets are masked. Session summaries are in `../sessions/`.\n\n"
            )
        f.write(entry)

    if prompt.startswith("/wrap-up"):
        print(f"Session ID: {session}. Main checkout: {main_dir}")


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass
    sys.exit(0)
