#!/usr/bin/env python3
"""Convert a Claude Code transcript (JSONL) into readable markdown.

Keeps only user and Claude text: tool calls, tool results, thinking, metadata
and expanded command bodies (isMeta) are dropped. Secrets are masked. Output goes
to docs/process/transcripts/<date of first message>-<first 8 chars of session_id>.md.

Two modes:
- SessionEnd hook (safety net): reads the hook input (JSON with transcript_path
  and session_id) from stdin and writes only if /wrap-up has not already created
  the file. Always exits 0 so it never interferes with the session closing.
- Manual / from /wrap-up: `transcript-to-md.py --session <id prefix>` finds the
  transcript under ~/.claude/projects/, overwrites the file and prints its path.
"""

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from redact import redact  # noqa: E402

COMMAND_NAME = re.compile(r"<command-name>(.*?)</command-name>", re.S)
COMMAND_ARGS = re.compile(r"<command-args>(.*?)</command-args>", re.S)
SYSTEM_REMINDER = re.compile(r"<system-reminder>.*?</system-reminder>", re.S)
SPEAKERS = {"user": "Bruker", "assistant": "Claude"}


def message_text(record: dict) -> str:
    content = (record.get("message") or {}).get("content")
    if isinstance(content, str):
        parts = [content]
    elif isinstance(content, list):
        parts = [b.get("text", "") for b in content if isinstance(b, dict) and b.get("type") == "text"]
    else:
        parts = []
    text = SYSTEM_REMINDER.sub("", "\n\n".join(parts)).strip()
    command = COMMAND_NAME.search(text)
    if command:
        args = COMMAND_ARGS.search(text)
        text = f"{command.group(1).strip()} {args.group(1).strip() if args else ''}".strip()
    return text


def load_turns(transcript: Path) -> list[dict]:
    """Return [{speaker, time, text}], with consecutive blocks from one speaker merged."""
    turns: list[dict] = []
    for line in transcript.read_text(encoding="utf-8").splitlines():
        try:
            record = json.loads(line)
        except json.JSONDecodeError:
            continue
        speaker = SPEAKERS.get(record.get("type"))
        if not speaker or record.get("isMeta") or record.get("isSidechain"):
            continue
        text = message_text(record)
        if not text:
            continue
        if turns and turns[-1]["speaker"] == speaker:
            turns[-1]["text"] += "\n\n" + text
            continue
        turns.append({"speaker": speaker, "time": local_time(record.get("timestamp")), "text": text})
    return turns


def local_time(timestamp: str | None) -> datetime | None:
    try:
        return datetime.fromisoformat(timestamp.replace("Z", "+00:00")).astimezone()
    except (AttributeError, ValueError):
        return None


def fence_for(text: str) -> str:
    longest = max((len(run) for run in re.findall(r"`+", text)), default=0)
    return "`" * max(3, longest + 1)


def demote_headings(markdown: str) -> str:
    """Push headings in Claude's replies two levels down so they sit under the turn heading."""
    lines, in_fence = [], False
    for line in markdown.split("\n"):
        if line.lstrip().startswith(("```", "~~~")):
            in_fence = not in_fence
        elif not in_fence and (heading := re.match(r"(#{1,6}) ", line)):
            line = "#" * min(6, len(heading.group(1)) + 2) + line[len(heading.group(1)):]
        lines.append(line)
    return "\n".join(lines)


def render(turns: list[dict], session_id: str) -> str:
    started = turns[0]["time"]
    lines = [
        f"# Transkripsjon {started:%Y-%m-%d} · økt `{session_id[:8]}`",
        "",
        "Generert av `.claude/hooks/transcript-to-md.py` fra Claude Code-transkripsjonen. "
        "Bare tekst fra bruker og Claude; verktøykall og -resultater er utelatt. "
        "Hemmeligheter maskeres. Øktoppsummeringer ligger i `../sessions/`.",
        "",
    ]
    for turn in turns:
        clock = f" · {turn['time']:%H:%M:%S}" if turn["time"] else ""
        lines.append(f"## {turn['speaker']}{clock}\n")
        text = redact(turn["text"])
        if turn["speaker"] == "Bruker":
            # User text is shown verbatim; Claude's replies are already markdown.
            fence = fence_for(text)
            lines.append(f"{fence}text\n{text}\n{fence}\n")
        else:
            lines.append(f"{demote_headings(text)}\n")
    return "\n".join(lines)


def convert(transcript: Path, session_id: str, project_dir: Path, overwrite: bool = True) -> Path | None:
    turns = load_turns(transcript)
    if not any(t["speaker"] == "Bruker" for t in turns) or not turns[0]["time"]:
        return None
    out = project_dir / "docs" / "process" / "transcripts" / f"{turns[0]['time']:%Y-%m-%d}-{session_id[:8]}.md"
    if out.exists() and not overwrite:
        return None
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(render(turns, session_id), encoding="utf-8")
    return out


def find_transcript(prefix: str, project_dir: Path) -> Path:
    projects = Path.home() / ".claude" / "projects" / re.sub(r"[^A-Za-z0-9]", "-", str(project_dir))
    matches = sorted(projects.glob(f"{prefix}*.jsonl"))
    if len(matches) != 1:
        sys.exit(f"Fant {len(matches)} transkripsjoner for økt '{prefix}' i {projects}")
    return matches[0]


def main() -> None:
    project_dir = Path(os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()).resolve()
    if len(sys.argv) == 3 and sys.argv[1] == "--session":
        transcript = find_transcript(sys.argv[2], project_dir)
        out = convert(transcript, transcript.stem, project_dir)
        if not out:
            sys.exit(f"Ingen brukermeldinger i {transcript}")
        print(out.relative_to(project_dir))
        return

    try:
        data = json.load(sys.stdin)
        project_dir = Path(os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or project_dir)
        # Safety net only: a transcript written by /wrap-up is already committed, and
        # overwriting it would leave a dirty working tree for the next session.
        convert(Path(data["transcript_path"]), data["session_id"], project_dir, overwrite=False)
    except Exception:
        pass


if __name__ == "__main__":
    main()
