# Seed image prep and worktrees

## 2026-11-23 kl. 20:32 — marthekalland3

### Task
Session `0cd9f49d` in the main folder, no code. It started as `/bmad-build` with no story given, then became preparing the user's phone photos as seed images for Story 1.7. Later: fix `finish.sh` failing after PR #62 merged, run `/commit-logs`, and make the Story 1.8 worktree.

### Plan
- `/bmad-build` found no active spec and recommended Story 1.7. Halted to ask instead of planning in the main folder.
- Made the worktree `story/1.7-sample-library` with `.claude/scripts/start.sh`; the user put 23 phone photos in `src/db/seed/images/`.
- Prepared the location test files with `sips`, `pngquant` and `exiftool`; the resize, `SOURCES.md` and seed code were left to the Story 1.7 session ([973-…-1-7-sample-library.md](973-2026-11-23-20-03-40-1-7-sample-library.md)).

### Result
- `IMG_20260720_122021652.jpg` → PNG (1204×1600, 497 KiB) after the user chose `brew install pngquant` (256 colours, quality 65–85) over a 600 px PNG or a 2.3 MB lossless one. The original JPEG was moved to the scratchpad.
- `IMG_20260720_144130024.jpg`: IPTC and XMP City "Tromsø", Country "Norway". The first write garbled "ø" because the file had no IPTC UTF-8 marker; rewritten with `CodedCharacterSet=UTF8`.
- `IMG_20260720_130431548.jpg` renamed to `…-fail.jpg`.
- An earlier check claimed 21 of 23 photos had GPS. It only tested whether the tag existed; a re-check found every GPS tag empty, and copying them had given the PNG `0,0`. With the user's ok, public positions were written: Stortorget, Tromsø (city JPEG) and Polaria (PNG, where the photo was taken). D-067.
- Also: the first path I gave for the worktree was wrong (it misses `1.7-` in the folder name).
- `finish.sh 62` merged PR #62 but stopped on `failed to delete … Directory not empty`. Checked the leftover folder against `origin/main` (only generated files differed), then removed it, pruned, pulled `main` (94695cf) and deleted the local branch.
- `/commit-logs`: PR #63 merged, 5ad23cc on `main`.
- Worktree `story/1.8-contact-finds-images` made from 5ad23cc.

### Open items
- `finish.sh` stops if `git worktree remove` fails partway (seen with the Docker VM holding old file handles), and then skips the pull and branch cleanup. Stop the worktree's `docker compose` first, or make the script carry on.
