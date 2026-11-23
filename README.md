# G53 — Marthe

Solo project in **IBE160 Programmering med KI** (Programming with AI) at Molde University College, autumn 2026 (15 ECTS).

The repo contains the application and documentation of how it was developed, tested and quality-assured with AI.

## Member

- Marthe Kalland (solo project)

## The app

**CRM-DAM** is an image library with client management and licensing for a small design agency. Staff upload and describe images (with AI-generated metadata), decide which clients may see each image and at what price, and track licences. The agency's clients log in to find, buy and download the images they may use.

v1 is under construction. Story 1.1 (this version) gives the runnable foundation: the app, its database, migrations, tests and CI. The features follow in the order in [`sprint-status.yaml`](_bmad-output/implementation-artifacts/sprint-status.yaml).

### Prerequisites

- Docker with Docker Compose v2 (tested with Docker 29 and Compose 5.4 on macOS; CI uses Ubuntu x86).
- Nothing else: Node.js 26, PostgreSQL 18.7, Perl/ExifTool and Playwright all run in containers. Only building the images needs network access. No API key is needed.

### Start the app

```bash
docker compose up --build
```

Open <http://localhost:3000>. Compose starts `db` (PostgreSQL), then `migrate` (applies the database migrations and exits), then `app`. `GET /api/health` returns `{"status":"ok"}` once the database answers.

Stop with `Ctrl+C`, or `docker compose down`. Add `-v` to also delete the database and the stored files.

### Run the tests

```bash
docker compose -p crm-dam-test --profile test down -v && docker compose -p crm-dam-test --profile test run --rm --build unit && docker compose -p crm-dam-test --profile test run --rm --build e2e
```

This runs as its own Compose project (`crm-dam-test`), with its own database, so it never touches the running app. The first part removes any earlier test stack. `unit` runs Vitest against a freshly migrated test database. `e2e` resets the test database again, starts `app-test` on it with an empty file directory, and runs Playwright (image `v1.65.0-noble`) against it. The command exits non-zero if any test fails. Afterwards, stop the test stack with `docker compose -p crm-dam-test --profile test down -v`.

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs the same steps on every pull request and on pushes to `main`.

### Environment variables

Compose works without a `.env` file. To change a setting, copy `.env.example` to `.env` and edit it; `.env` is never committed. `DATABASE_URL`, `TEST_DATABASE_URL` and `FILE_STORE_DIR` are fixed by Compose, and the tests always use the mock provider. The app is meant to run in Docker; running it directly on the host is not supported in v1. [`.env.example`](.env.example) documents every variable:

| Variable | Purpose | Default |
| --- | --- | --- |
| `DATABASE_URL` | App database | set by Compose |
| `TEST_DATABASE_URL` | Test database (reset by the tests) | set by Compose |
| `APP_ORIGIN` | Address the browser uses; other origins cannot change data | `http://localhost:3000` |
| `FILE_STORE_DIR` | Where uploaded and derived files are stored | Compose volume |
| `AI_PROVIDER` | `mock` (no key) or `claude` | `mock` |
| `ANTHROPIC_API_KEY` | Only for `AI_PROVIDER=claude` | empty |
| `AI_MODEL`, `AI_EFFORT` | Claude model and effort | `claude-haiku-5-5`, `medium` |
| `MOCK_DELAY_MS`, `MOCK_FAIL` | Mock provider delay, and forced failures | `1500`, `false` |
| `WORKER_CONCURRENCY` | Images generated at once by the worker | `2` |
| `SEED_ON_START` | Seed demo data on an empty database (dev and tests only) | `true` |
| `APP_ENCRYPTION_KEY` | Encrypts an AI key saved in Settings | empty |

### Test data

No seed data yet. Demo users and sample images come with stories 1.2 and 1.7.

### Folder overview

```text
src/app/            routes only: pages and /api Route Handlers
src/modules/        domain modules (auth, accounts, images, access, licences, downloads, media, ai, places, activity)
src/db/             schema/ (one file per owning module), migrations/ (committed SQL), seed/, migrate and test-reset scripts
src/worker/         background worker (later)
messages/en.json    every UI string
tests/e2e/          Playwright tests
data/places/        place-name data (later)
scripts/            developer scripts (later)
docker/             database init script
_bmad-output/       planning (PRD, architecture, UX, epics) and implementation specs
docs/process/       process documentation
```

Schema changes are made in `src/db/schema/` and turned into a committed SQL migration with `npm run db:generate` (needs `npm ci` on the host). `drizzle-kit push` is never used.

## Process tool tests

The process logging tools (`.claude/hooks/`, `.claude/scripts/`) have tests that need Python 3.10 or newer and git 2.31 or newer:

```bash
python3 -m unittest discover -s .claude/hooks/tests
```

## Working sessions

Several Claude sessions can write code at once, each in its own git worktree ([D-016](docs/process/decisions.md#d-016-parallel-sessions-in-worktrees-and-a-one-command-session-end)). The main folder stays on `main` and collects the process files from every session. The scripts need the GitHub CLI (`gh`), logged in as `marthekalland3`.

```bash
.claude/scripts/start.sh story/1.2-upload   # new worktree ../g53-kalland-1.2-upload on a new branch from origin/main
cd ../g53-kalland-1.2-upload && claude      # work; end with /wrap-up <topic>, then /exit
.claude/scripts/finish.sh                   # wait for checks, merge the PR, remove the worktree, pull main
.claude/scripts/commit-logs.sh              # any time: commit docs/process/ through its own PR
```

`start.sh` copies `.env` from the main folder into the worktree. Dependencies (`node_modules`, `venv`) are installed per worktree.

## Process documentation

Process documentation lives in `docs/process/` on `main`, but is committed in its own `docs/process-*` pull requests, separate from code ([D-013](docs/process/decisions.md#d-013-process-files-are-committed-separately-from-code)).

- [Process documentation – overview](docs/process/README.md)
- [Grading criteria (summary, English)](docs/process/vurderingskriterier.en.md) · [Norwegian original](docs/process/vurderingskriterier.md)
- [Decision log](docs/process/decisions.md)
- [Planning documents (BMad)](_bmad-output/planning-artifacts/)
- Conventions for AI-assisted development: [CLAUDE.md](CLAUDE.md)
