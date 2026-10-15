#!/usr/bin/env python3
"""UserPromptSubmit-hook: logger hver prompt til docs/process/prompts/YYYY-MM-DD.md.

Loggen committes som spor av KI-bruk (kriterium 1 i sensorveiledningen), så
ting som ser ut som hemmeligheter maskeres før de skrives. Hooken skal aldri
blokkere en prompt: alle feil svelges og scriptet avslutter alltid med 0.
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

SECRET_PATTERNS = [
    re.compile(r"sk-(?:ant-)?[A-Za-z0-9_-]{16,}"),
    re.compile(r"(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}"),
    re.compile(r"github_pat_[A-Za-z0-9_]{20,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"(?i)bearer\s+[A-Za-z0-9._~+/-]{16,}=*"),
    re.compile(
        r"(?i)\b([A-Z0-9_]*(?:api[_-]?key|secret|password|passord|token)[A-Z0-9_]*)"
        r"(\s*[=:]\s*)(\"[^\"]+\"|'[^']+'|\S+)"
    ),
]


def redact(text: str) -> str:
    for pattern in SECRET_PATTERNS:
        if pattern.groups == 3:
            text = pattern.sub(lambda m: f"{m.group(1)}{m.group(2)}[MASKERT]", text)
        else:
            text = pattern.sub("[MASKERT]", text)
    return text


def current_branch(cwd: Path) -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=cwd, capture_output=True, text=True, timeout=2,
        )
        return result.stdout.strip() or "ukjent"
    except Exception:
        return "ukjent"


def fence_for(text: str) -> str:
    # Fence lengre enn lengste backtick-rekke i prompten, så markdown ikke brytes.
    longest = max((len(run) for run in re.findall(r"`+", text)), default=0)
    return "`" * max(3, longest + 1)


def main() -> None:
    data = json.load(sys.stdin)
    prompt = (data.get("prompt") or "").strip()
    if not prompt:
        return

    project_dir = Path(os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or ".")
    now = datetime.now()
    log_file = project_dir / "docs" / "process" / "prompts" / f"{now:%Y-%m-%d}.md"
    log_file.parent.mkdir(parents=True, exist_ok=True)

    text = redact(prompt)
    fence = fence_for(text)
    session = (data.get("session_id") or "ukjent")[:8]
    entry = (
        f"### {now:%H:%M:%S} · økt `{session}` · branch `{current_branch(project_dir)}`\n\n"
        f"{fence}text\n{text}\n{fence}\n\n"
    )

    is_new = not log_file.exists()
    with log_file.open("a", encoding="utf-8") as f:
        if is_new:
            f.write(
                f"# Prompt-logg {now:%Y-%m-%d}\n\n"
                "Automatisk logget av `.claude/hooks/log-prompt.py`. "
                "Hemmeligheter maskeres. Øktoppsummeringer ligger i `../sessions/`.\n\n"
            )
        f.write(entry)


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass
    sys.exit(0)
