"""Tests for the process-logging hooks. Run: python3 -m unittest discover -s .claude/hooks/tests"""

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HOOKS = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HOOKS))

import redact  # noqa: E402

spec = importlib.util.spec_from_file_location("transcript_to_md", HOOKS / "transcript-to-md.py")
t2m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(t2m)

SESSION_ID = "abcd1234-0000-0000-0000-000000000000"
FAKE_KEY = "sk-ant-" + "X" * 24


def user(text, **extra):
    return {"type": "user", "timestamp": "2026-10-16T10:00:00Z", "message": {"role": "user", "content": text}, **extra}


def assistant(*blocks):
    return {"type": "assistant", "timestamp": "2026-10-16T10:00:05Z", "message": {"role": "assistant", "content": list(blocks)}}


def text(value):
    return {"type": "text", "text": value}


FIXTURE = [
    {"type": "attachment", "timestamp": "2026-10-16T09:59:00Z"},
    user(f"Fix the bug. My key is {FAKE_KEY} <system-reminder>hidden reminder</system-reminder>"),
    assistant({"type": "thinking", "thinking": "secret thoughts"}, text("Looking at it.")),
    assistant({"type": "tool_use", "id": "toolu_1", "name": "Bash", "input": {"command": "ls"}}),
    user([{"type": "tool_result", "tool_use_id": "toolu_1", "content": "tool output"}]),
    assistant(text("## Result\n\n```\n# not a heading\n```\nDone.")),
    user("<command-message>wrap-up</command-message>\n<command-name>/wrap-up</command-name>\n<command-args>tema</command-args>"),
    user([text("Expanded command body")], isMeta=True),
    user("Subagent prompt", isSidechain=True),
]


class TranscriptToMarkdownTest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.transcript = self.tmp / f"{SESSION_ID}.jsonl"
        self.transcript.write_text("\n".join(json.dumps(r) for r in FIXTURE) + "\nnot json\n", encoding="utf-8")

    def convert(self, **kwargs):
        return t2m.convert(self.transcript, SESSION_ID, self.tmp, **kwargs)

    def test_keeps_only_user_and_assistant_text(self):
        turns = t2m.load_turns(self.transcript)
        self.assertEqual([t["speaker"] for t in turns], ["Bruker", "Claude", "Bruker"])
        everything = "\n".join(t["text"] for t in turns)
        for dropped in ("secret thoughts", "toolu_1", "tool output", "hidden reminder", "Expanded command body", "Subagent prompt"):
            self.assertNotIn(dropped, everything)

    def test_merges_consecutive_assistant_blocks(self):
        claude = t2m.load_turns(self.transcript)[1]
        self.assertIn("Looking at it.", claude["text"])
        self.assertIn("Done.", claude["text"])

    def test_command_invocation_shown_as_command(self):
        self.assertEqual(t2m.load_turns(self.transcript)[2]["text"], "/wrap-up tema")

    def test_demotes_headings_outside_code_fences_only(self):
        demoted = t2m.demote_headings("# Top\n## Sub\n```\n# comment\n```\n###### Deep")
        self.assertEqual(demoted, "### Top\n#### Sub\n```\n# comment\n```\n###### Deep")

    def test_output_file_is_named_by_date_and_session_and_masked(self):
        out = self.convert()
        self.assertEqual(out.relative_to(self.tmp).as_posix(), "docs/process/transcripts/2026-10-16-abcd1234.md")
        content = out.read_text(encoding="utf-8")
        self.assertNotIn(FAKE_KEY, content)
        self.assertIn(redact.MASK, content)
        self.assertIn("#### Result", content)

    def test_nothing_written_without_user_messages(self):
        self.transcript.write_text(json.dumps(assistant(text("Hello"))), encoding="utf-8")
        self.assertIsNone(self.convert())
        self.assertFalse((self.tmp / "docs").exists())

    def test_overwrite_false_keeps_existing_transcript(self):
        out = self.convert()
        out.write_text("written by /wrap-up", encoding="utf-8")
        self.assertIsNone(self.convert(overwrite=False))
        self.assertEqual(out.read_text(encoding="utf-8"), "written by /wrap-up")
        self.convert()
        self.assertNotEqual(out.read_text(encoding="utf-8"), "written by /wrap-up")

    def run_hook(self, stdin):
        return subprocess.run(
            [sys.executable, str(HOOKS / "transcript-to-md.py")], input=stdin, text=True,
            capture_output=True, env={"CLAUDE_PROJECT_DIR": str(self.tmp), "HOME": str(self.tmp)},
        )

    def test_hook_mode_writes_transcript(self):
        payload = {"session_id": SESSION_ID, "transcript_path": str(self.transcript), "hook_event_name": "SessionEnd", "reason": "other"}
        self.assertEqual(self.run_hook(json.dumps(payload)).returncode, 0)
        self.assertTrue((self.tmp / "docs/process/transcripts/2026-10-16-abcd1234.md").exists())

    def test_hook_mode_never_fails_on_bad_input(self):
        for stdin in ("not json", "{}", json.dumps({"session_id": "x", "transcript_path": "/missing.jsonl"})):
            self.assertEqual(self.run_hook(stdin).returncode, 0)
        self.assertFalse((self.tmp / "docs").exists())


class RedactTest(unittest.TestCase):
    def test_masks_known_formats(self):
        for secret in (FAKE_KEY, "ghp_" + "a" * 30, "AKIA" + "A" * 16, "Bearer " + "b" * 20):
            self.assertNotIn(secret, redact.redact(f"value {secret} end"))
        self.assertEqual(redact.redact("API_KEY=hunter2"), f"API_KEY={redact.MASK}")

    def test_scan_flags_unmasked_and_passes_masked(self):
        tmp = Path(tempfile.mkdtemp())
        clean, leaky = tmp / "clean.md", tmp / "leaky.md"
        clean.write_text(f"token = {redact.MASK}\nnothing here\n", encoding="utf-8")
        leaky.write_text(f"ok\nkey {FAKE_KEY}\n", encoding="utf-8")
        self.assertEqual(redact.scan([str(clean)]), 0)
        self.assertEqual(redact.scan([str(clean), str(leaky)]), 1)


class LogPromptTest(unittest.TestCase):
    def test_prompt_is_logged_masked(self):
        tmp = Path(tempfile.mkdtemp())
        prompt = json.dumps({"prompt": f"use {FAKE_KEY}", "session_id": SESSION_ID})
        result = subprocess.run(
            [sys.executable, str(HOOKS / "log-prompt.py")], input=prompt, text=True,
            capture_output=True, env={"CLAUDE_PROJECT_DIR": str(tmp)},
        )
        self.assertEqual(result.returncode, 0)
        log = next((tmp / "docs/process/prompts").glob("*.md")).read_text(encoding="utf-8")
        self.assertIn("økt `abcd1234`", log)
        self.assertNotIn(FAKE_KEY, log)


if __name__ == "__main__":
    unittest.main()
