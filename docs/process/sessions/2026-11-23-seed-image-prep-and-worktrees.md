# Session 2026-11-23: Seed image prep and worktrees

- **Story/task:** Story 1.7 (seed image preparation), worktree for Story 1.8
- **Prompts:** [prompts/2026-11-23.md](../prompts/2026-11-23.md) (19:07–20:31)
- **Transcript:** [transcripts/2026-11-23-0cd9f49d.md](../transcripts/2026-11-23-0cd9f49d.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/972-2026-11-23-20-32-01-seed-image-prep-and-worktrees.md](../../../.logs/marthekalland3/972-2026-11-23-20-32-01-seed-image-prep-and-worktrees.md)
- **Branch and PR:** no code in this session (main folder on `main`). It made the worktrees `story/1.7-sample-library` (PR #62, merged by another session's work) and `story/1.8-contact-finds-images`, and merged process PR #63.
- **Commits:** None of its own besides the `Logg:` commit; `/commit-logs` produced 5ad23cc (PR #63).

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| `/bmad-build` with no story given: start Story 1.7 | Accepted | Next story in the sprint; the user had photos ready |
| Put the photos in `../g53-kalland-sample-library/…` | Rejected (wrong path) | The user asked for the worktree first; `start.sh` names the folder `g53-kalland-1.7-sample-library`, and I corrected the path |
| Install `pngquant` to keep the PNG at ~1600 px and under 500 KB | Accepted (user's choice of three) | Meets both size limits; the user preferred it to a 600 px or a 2.3 MB PNG |
| The user's own choices: jellyfish photo as PNG, `IMG_20260720_144130024` as the Tromsø city file, `IMG_20260720_130431548` as the `fail` file | Accepted | The user picked public places for the location files |
| Write public Tromsø positions (city centre, Polaria) into the two location files | Accepted | No photo had a real position (D-067) |
| After `finish.sh` failed: compare the leftover folder with `origin/main`, then delete it and finish the skipped steps | Accepted | Nothing unique was lost; only generated files differed |

## Bugs found in AI-generated code
- **GPS check counted empty tags.** My first exiftool check reported "GPS yes" for 21 of 23 photos because it only tested that the tag existed. Found when I checked that the Tromsø photo's position really was in Tromsø; a check for numeric values found none. The copied GPS in the PNG turned out to be `0,0`. Fixed by writing public positions (D-067).
- **Garbled "ø" in IPTC City.** The first write had no IPTC UTF-8 marker, so the city read back as "TromsÃ¸". Found by reading the value back; fixed by writing `CodedCharacterSet=UTF8`.
- **`finish.sh` stops halfway** (not AI code from this session, a script from D-016): `git worktree remove` failed with "Directory not empty", which also skipped the pull and branch cleanup. Done by hand; open item in the teacher's log.

## Decisions
- [D-067](../decisions.md): the two location test images carry hand-written public positions
