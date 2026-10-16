"""Shared secret masking for the prompt log, transcripts and /wrap-up.

Also runs as a secret scan: `python3 redact.py --scan FILE...` prints every hit
(masked) and exits 1 if anything was found, otherwise 0.
"""

import re
import sys
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

MASK = "[MASKERT]"


def redact(text: str) -> str:
    for pattern in SECRET_PATTERNS:
        if pattern.groups == 3:
            text = pattern.sub(lambda m: f"{m.group(1)}{m.group(2)}{MASK}", text)
        else:
            text = pattern.sub(MASK, text)
    return text


def scan(paths: list[str]) -> int:
    """Report lines that still contain unmasked secrets. Already-masked values pass."""
    hits = 0
    for path in paths:
        try:
            lines = Path(path).read_text(encoding="utf-8").splitlines()
        except OSError as e:
            print(f"{path}: kunne ikke leses ({e})")
            hits += 1
            continue
        for number, line in enumerate(lines, 1):
            if redact(line) != line:
                print(f"{path}:{number}: {redact(line).strip()[:160]}")
                hits += 1
    return 1 if hits else 0


if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] != "--scan":
        sys.exit("Bruk: redact.py --scan FIL...")
    sys.exit(scan(sys.argv[2:]))
