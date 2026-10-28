# Session 2026-10-28: Haiku pilot – run and results

- **Story/task:** – (pre-architecture pilot, D-017)
- **Prompts:** [prompts/2026-10-28.md](../prompts/2026-10-28.md) (13:29–14:30)
- **Transcript:** [transcripts/2026-10-28-cd45fc60.md](../transcripts/2026-10-28-cd45fc60.md) (written when the session ends)
- **Task, plan, result and open items:** [.logs/marthekalland3/994-2026-10-28-13-24-47-haiku-pilot.md](../../../.logs/marthekalland3/994-2026-10-28-13-24-47-haiku-pilot.md) (section 14:31)
- **Branch and PR:** `docs/haiku-pilot`, #25 (open)
- **Commits:**
  - `2ac117c` docs(research): Haiku 5.5 pilot runner, runs and results
  - `83da8e0` Logg: Haiku pilot

## AI suggestions and our assessment
| AI suggested | We did | Why |
|---|---|---|
| Personal Console key in a gitignored `.env`, with a spend limit, never pasted in chat | Accepted | The user chose their own API; prompts and transcripts are public |
| Python runner using the Anthropic SDK and structured outputs | Accepted | Same JSON guarantee the app will use |
| Smoke test on one image, then try `low` effort | Accepted | Default effort took 9.8 s; `low` took 5.1 s |
| Prompt v2 against the problems found in v1 | Accepted | Fixed keyword count, clock times, wrong GPS places, gender guessing |
| Compare Haiku `medium` and Sonnet 5.5 on five images, then Haiku `medium` on the full set | Accepted | Sonnet wrote no better than Haiku `medium` at about 15× the cost |
| Verdict "Partly", because latency was over the 5 s target | Adjusted | The user accepted 5.9 s and chose Go for v1 |
| Sonnet as the next model to try | Adjusted | The user named Gemini Flash as the later test, likely better and faster |
| Keep the images and `.env` only in the worktree | Adjusted | The user asked to keep them locally in the main folder |

## Bugs found in AI-generated code
- **Hard-coded Haiku prices in `run_pilot.py`** would have reported Sonnet's cost about 20× too low. Claude caught it before the Sonnet run and replaced them with a price per model; an unknown model now stops the script.
- **Shell command:** `echo ===` between two runs failed in zsh, so the variation run did not start. Found from the error output and run again.
- **Wrong numbers in Claude's summaries:** it said 11 images had more than 15 keywords (it was 12) and 13 used no thinking (it was 15). The first `results.md` draft said 108 calls (it was 90). Found when computing the run table from `summary.csv`; corrected in `results.md` and noted to the user.

## Decisions
[D-021](../decisions.md): Haiku 5.5 at `medium` with prompt v2 for v1; the AI provider stays swappable.
