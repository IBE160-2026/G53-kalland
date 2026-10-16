# Grading criteria – Part 1 (application and process)

> English translation of [`vurderingskriterier.md`](vurderingskriterier.md). The Norwegian original is authoritative and is kept unchanged (D-008).

Summary of *Sensorveiledning – Del 1, IBE160 Programmering med KI, autumn 2026* (the examiner's grading guide). Part 1 counts **70 %** of the final grade; the reflection report (part 2) counts 30 %. The original is course material and is not versioned in the repo (see [D-004](decisions.md#d-004)).

The examiner clones the repo and checks out the **last commit before the deadline**, follows the README on a clean machine (about 15–20 minutes of effort), tests the app, reads the history, process documents and code, and runs the tests.

## Criteria and weights

| # | Criterion | Weight | What it means for us |
|---|---|---|---|
| 1 | Process and AI governance | **30 %** | See below |
| 2 | Functionality and scope | 20 % | See below |
| 3 | Quality assurance and testing | 15 % | See below |
| 4 | Design and user experience | 10 % | See below |
| 5 | Code quality and architecture | 10 % | See below |
| 6 | README and runnability | 10 % | See below |
| 7 | Repository tidiness | 5 % | See below |

Criteria 1, 6 and 7 (process and verifiability) make up 45 %; 2–5 (the product) make up 55 %.

### 1. Process and AI governance (30 %)
- The BMad documents (brief, PRD, architecture, epics/stories) must be **used and updated**, not generated once.
- Code must be traceable to requirements and stories; deviations from the plan are explained.
- Steady commit history over time, small commits with descriptive messages. Branches, PRs and issues.
- Saved prompts and AI sessions, with **concrete examples of us clarifying, rejecting or correcting AI suggestions**.
- Justified decisions about technology and architecture.
- **A–B:** the process can be followed from plan to app; prompts and decisions are linked to concrete changes. **C:** traceable, but the link to code is partly implicit.

### 2. Functionality and scope (20 %)
- The core flows from the brief and README work end to end.
- Handles bad input and repeated actions without crashing.
- Whatever was left out of or changed from the brief/proposal is described and justified.
- If the app cannot be run, this grade is clearly limited.

### 3. Quality assurance and testing (15 %)
- Automated tests that run as described in the README and test meaningful logic.
- Manual test plans where automated tests do not fit.
- Evidence of code review: PR comments, described bugs in AI code and how they were fixed.
- Error handling, input validation, no secrets in the code.

### 4. Design and user experience (10 %)
- Consistent visual style, clear navigation, understandable error messages and empty states.
- Basic accessibility: contrast, keyboard, alt text, form labels. Responsive.
- Evidence of design work (sketches, wireframes, UX document).

### 5. Code quality and architecture (10 %)
- Folder structure that matches the architecture document.
- Readable names, little duplication, **no dead code or commented-out leftovers from AI attempts**.
- Linter/formatter, sensible handling of configuration and dependencies.

### 6. README and runnability (10 %)
- What the app does and for whom (preferably with a screenshot).
- Prerequisites with versions; exact commands for installation and startup.
- Environment variables with `.env.example`; test data/test users; how to run the tests.
- Folder overview and links to planning and process documentation. Up to date, not a template.
- Gaps an ordinary user cannot resolve through the README count as README faults.

### 7. Repository tidiness (5 %)
- Clear separation between code, documentation and resources.
- `.gitignore` keeps out build artifacts, dependencies and local files.
- **No secrets in the repo or its history.** No loose files in the root folder.

## Warning signs the examiner looks for
- Almost all code in one or a few commits right before the deadline.
- Planning documents that describe a different app, or that were clearly written afterwards.
- The README is an unchanged template, or its commands do not work.
- API keys, passwords or `.env` committed; `node_modules`, `venv`, build folders or large binary files in the repo.
- Tests that fail or only test trivial things.
- Dead code, duplicated files, leftovers from discarded AI attempts.
- **AI documentation that is generic and cannot be linked to concrete changes.**

## Grade calculation
Letter per criterion → number (A=5, B=4, C=3, D=2, E=1, F=0), multiplied by the weight and summed.
Thresholds: **A ≥ 4.5 · B ≥ 3.5 · C ≥ 2.5 · D ≥ 1.5 · E ≥ 0.5 · F < 0.5**.
Example: (B, C, C, A, C, B, D) → 0.30·4 + 0.20·3 + 0.15·3 + 0.10·5 + 0.10·3 + 0.10·4 + 0.05·2 = 3.55 → B.
The examiner may deviate from the calculation based on a justified overall impression.
