"""Find the main checkout of the repo, so process files from every worktree land in one place (D-016)."""

import subprocess
from pathlib import Path


def main_checkout(cwd: Path) -> Path:
    """Return the main working tree that cwd belongs to, or cwd itself outside git."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--path-format=absolute", "--git-common-dir"],
            cwd=cwd, capture_output=True, text=True, timeout=2,
        )
        common_dir = Path(result.stdout.strip())
        if result.returncode == 0 and common_dir.name == ".git":
            return common_dir.parent
    except Exception:
        pass
    return cwd
