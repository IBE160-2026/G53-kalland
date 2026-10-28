"""Tests for .claude/scripts/start.sh. Run: python3 -m unittest discover -s .claude/hooks/tests"""

import subprocess
import tempfile
import unittest
from pathlib import Path

START = Path(__file__).resolve().parents[2] / "scripts" / "start.sh"


def git(cwd, *args):
    return subprocess.run(
        ["git", "-c", "user.name=t", "-c", "user.email=t@t", *args], cwd=cwd, check=True, capture_output=True, text=True,
    ).stdout.strip()


class StartScriptTest(unittest.TestCase):
    def setUp(self):
        tmp = Path(tempfile.mkdtemp()).resolve()
        origin, self.main = tmp / "origin.git", tmp / "repo"
        git(tmp, "init", "-q", "--bare", "-b", "main", str(origin))
        git(tmp, "clone", "-q", str(origin), str(self.main))
        git(self.main, "commit", "-q", "--allow-empty", "-m", "init")
        git(self.main, "push", "-q", "origin", "main")
        self.worktree = tmp / "repo-1.2-upload"

    def start(self, *args):
        return subprocess.run(["bash", str(START), *args], cwd=self.main, capture_output=True, text=True)

    def test_creates_worktree_next_to_main_without_upstream(self):
        (self.main / ".env").write_text("KEY=local\n", encoding="utf-8")
        result = self.start("story/1.2-upload")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(git(self.worktree, "branch", "--show-current"), "story/1.2-upload")
        self.assertEqual(git(self.worktree, "rev-parse", "HEAD"), git(self.main, "rev-parse", "origin/main"))
        upstream = subprocess.run(["git", "rev-parse", "--abbrev-ref", "@{u}"], cwd=self.worktree, capture_output=True)
        self.assertNotEqual(upstream.returncode, 0)
        self.assertEqual((self.worktree / ".env").read_text(encoding="utf-8"), "KEY=local\n")
        self.assertIn(f'cd "{self.worktree}" && claude', result.stdout)

    def test_rejects_bad_branch_names(self):
        for branch in ("", "feature/x", "story/", "docs/process-2026-10-28", "story/1.2/upload"):
            self.assertNotEqual(self.start(branch).returncode, 0, branch)
        self.assertFalse(self.worktree.exists())

    def test_refuses_existing_branch(self):
        git(self.main, "branch", "story/1.2-upload")
        self.assertNotEqual(self.start("story/1.2-upload").returncode, 0)
        self.assertFalse(self.worktree.exists())


if __name__ == "__main__":
    unittest.main()
