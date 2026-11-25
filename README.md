# G53 — Marthe

Solo project in **IBE160 Programmering med KI** (Programming with AI) at Molde University College, autumn 2026 (15 ECTS).

The repo contains the application and documentation of how it was developed, tested and quality-assured with AI.

## Member

- Marthe Kalland (solo project)

## The app

**CRM-DAM** is an image library with client management and licensing for a small design agency. Staff upload and describe images (with AI-generated metadata), decide which clients may see each image and at what price, and track licences. The agency's clients log in to find, buy and download the images they may use.

v1 is under construction. Story 1.1 gave the runnable foundation (the app, its database, migrations, tests and CI); story 1.2 added logging in and out for staff and contacts, with demo users; story 1.3 added the staff and client shells (top bar, navigation, sidebar drawer) in the Graphite theme; story 1.4 added Upload: staff upload JPEG and PNG files, and each is stored unchanged as a draft with a thumbnail, a preview and its embedded metadata; story 1.5 added AI metadata: after each upload the AI provider (the mock by default) writes the title, description, alt text and keywords, and the file ends Ready, or Failed with its embedded text kept; story 1.6 added the Library: staff see every image, drafts included, newest first and 48 a page, open one in the Details panel, choose who can see it (Internal only, Restricted to chosen clients, or Public) and whether it is free or paid (the seeded licence type "Standard commercial use", 90 USD ex VAT), and publish it, with a confirm dialog when metadata is missing; story 1.7 added the [sample library](#sample-images): 22 photos that the app uploads, describes and publishes on its first start, so every access case can be tried without uploading anything. Story 1.8 adds Find images for contacts: the images their client may see, newest first and 48 a page, each with its price, "Free" or a tick and "Yours to download"; selecting one opens a read-only Details panel with the preview, the image's description and technical details, and for a paid image the licence option with its terms. Anything the client may not see answers Not found. Story 1.9 adds licensing: a contact chooses "License this image" on a paid image, accepts the licence terms on the checkout page and checks it out (no payment is taken); the image then becomes the client's own, with a tick and "Yours to download". Staff see every licence in the new Licences tab, newest first. Story 2.1 adds the Clients tab: staff see every client in the sidebar, newest first, add a client (name, optional org number, billing email, account manager, staff notes), edit it and set it inactive or active again; a contact of an inactive client is refused on their next request. Clients are never deleted. Story 2.2 adds contacts: the client page lists the client's contacts by name (email, phone, Active or Inactive), and staff add a contact (name, email, optional phone), edit one, and deactivate or reactivate one; a deactivated contact is refused on their next request. Each email belongs to one user, staff or contact. Users are never deleted, and a new contact cannot log in until setup links arrive (story 2.3). The features follow in the order in [`sprint-status.yaml`](_bmad-output/implementation-artifacts/sprint-status.yaml).

### Prerequisites

- Docker with Docker Compose v2 (tested with Docker 29 and Compose 5.4 on macOS; CI uses Ubuntu x86).
- Nothing else: Node.js 26, PostgreSQL 18.7, Perl/ExifTool and Playwright all run in containers. Only building the images needs network access. No API key is needed.

### Start the app

```bash
docker compose up --build
```

Open <http://localhost:3000> and log in as one of the [demo users](#test-data). The first start on an empty database takes about 40 seconds longer, while the app seeds the [sample images](#sample-images) (`MOCK_DELAY_MS`, 1.5 s, per image); `docker compose up` reports the app healthy once that is done. Compose starts `db` (PostgreSQL), then `migrate` (applies the database migrations and exits), then `app`. `GET /api/health` returns `{"status":"ok"}` once the database answers.

Stop with `Ctrl+C`, or `docker compose down`. Add `-v` to also delete the database and the stored files.

### Run the tests

```bash
docker compose -p crm-dam-test --profile test down -v && docker compose -p crm-dam-test --profile test run --rm --build unit && docker compose -p crm-dam-test --profile test run --rm --build e2e
```

This runs as its own Compose project (`crm-dam-test`), with its own database, so it never touches the running app. The first part removes any earlier test stack. `unit` runs Vitest against a freshly migrated and seeded test database. `e2e` resets the test database again, starts `app-test` on it with an empty file directory, and runs Playwright (image `v1.65.0-noble`) against it. The command exits non-zero if any test fails. At story 2.2 there are 492 Vitest tests (in 40 files, including the theme token test, the upload, media, AI, generation, Library, publish, licence, checkout and access tests, the client, contact, route and action tests, and the sample library tests, which seed a database of their own) and 126 Playwright tests (including the shell, upload, Library, Find images, checkout, Clients and contact tests, the SC-3 checkpoint test, the client access table and the axe scans). `app-test` seeds the sample library when it starts, so the e2e database always has images; the seeded-library test and the client access table run first, as their own Playwright project, and count them before other tests upload more. The Clients tests run last, as a third project, because they set Nordlys Sykkel AS and its contact Emil Strand inactive for a moment. Apart from the sample images in `src/db/seed/images/`, the tests make their images on the fly. Afterwards, stop the test stack with `docker compose -p crm-dam-test --profile test down -v`.

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs the same steps on every pull request and on pushes to `main`.

### Environment variables

Compose works without a `.env` file. To change a setting, copy `.env.example` to `.env` and edit it; `.env` is never committed. `DATABASE_URL`, `TEST_DATABASE_URL` and `FILE_STORE_DIR` are fixed by Compose, and the tests always use the mock provider. The app is meant to run in Docker; running it directly on the host is not supported in v1. [`.env.example`](.env.example) documents every variable:

| Variable | Purpose | Default |
| --- | --- | --- |
| `DATABASE_URL` | App database | set by Compose |
| `TEST_DATABASE_URL` | Test database (reset by the tests) | set by Compose |
| `APP_ORIGIN` | Address the browser uses; other origins cannot change data | `http://localhost:3000` |
| `FILE_STORE_DIR` | Where uploaded originals and their thumbnails and previews are stored, under keys the app makes (never the file name). No URL serves this folder; files reach the browser only through guarded routes | Compose volume `files` |
| `AI_PROVIDER` | `mock` (no key). `claude` arrives with story 3.5; until then any value other than `mock` makes generation fail | `mock` |
| `ANTHROPIC_API_KEY` | Only for `AI_PROVIDER=claude` (story 3.5) | empty |
| `AI_MODEL`, `AI_EFFORT` | Claude model and effort | `claude-haiku-5-5`, `medium` |
| `MOCK_DELAY_MS`, `MOCK_FAIL` | Mock provider delay, and forced failures | `1500`, `false` |
| `WORKER_CONCURRENCY` | Images generated at once by the worker | `2` |
| `SEED_ON_START` | Seed the demo users on a database without users, and the sample library on one without images (dev and tests only) | `true` |
| `APP_ENCRYPTION_KEY` | Encrypts an AI key saved in Settings | empty |

**The mock AI provider** (`AI_PROVIDER=mock`, the default) needs no key or network. It waits `MOCK_DELAY_MS` milliseconds per image (`0` in the tests), then returns the fixture metadata written for each [sample image](#sample-images) (in [`mock-fixtures.ts`](src/modules/ai/providers/mock-fixtures.ts), covering all seven keyword categories) or clearly labelled placeholder metadata ("Placeholder title from the mock AI", one `mock <category>` keyword per keyword category) for any other file. It fails, and the image ends Failed with its embedded text kept, when `MOCK_FAIL=true` or when the file name contains `fail` (for example `fail-boat.jpg`); the other files in the batch carry on. Every provider run is recorded in the `metadata_generations` table. The Claude provider arrives with story 3.5; until then any other `AI_PROVIDER` value makes generation fail.

### Test data

With `SEED_ON_START=true` (the default), the app creates these demo users when it starts on an empty database; it does not add users if any exist. On every start it also makes sure the licence type "Standard commercial use" (9000 minor units, that is 90 USD, ex VAT, with licence text version 1) exists, so databases seeded earlier get it too. All six share the demo password **`crm-dam-demo-2026`**.

| Email | Role | Client | Lands on |
| --- | --- | --- | --- |
| `ida@agency.example` | staff | – | `/library` |
| `per@agency.example` | staff | – | `/library` |
| `jonas@fjordkaffe.example` | contact | Fjordkaffe AS | `/overview` |
| `kari@fjordkaffe.example` | contact | Fjordkaffe AS | `/overview` |
| `emil@nordlys.example` | contact | Nordlys Sykkel AS | `/overview` |
| `liv@gammelkunde.example` | contact | Gammel Kunde AS (inactive) | refused: "Your account is not active." |

The seed gives each client a made-up but valid org number (Fjordkaffe AS `921 456 786`), a billing email and Ida as account manager. The seed runs only on a database without users, so the details appear on a fresh database: run `docker compose down -v`, then start again.

The same users are the named fixture in [`src/db/seed/fixture.ts`](src/db/seed/fixture.ts) that the tests log in as.

#### Sample images

With `SEED_ON_START=true`, the app also seeds a sample library when it starts with no images, also on a database whose users were seeded earlier. It uploads the 22 files in [`src/db/seed/images/`](src/db/seed/images/) as Ida Berg, in one batch, through the same module functions as the Upload page, so each gets a thumbnail, a preview and mock AI metadata; then it sets each file's visibility, price and status. The first start takes about 40 seconds (`MOCK_DELAY_MS` × 22 images, plus processing); later starts skip it. If that first start is interrupted (for example with `Ctrl+C`), the library stays incomplete, since later starts see images and skip the seed: run `docker compose down -v` and start again.

The photos are the developer's own: **Photos by Marthe Kalland, © all rights reserved, used only as sample data in this repo.** None comes from a stock site. [`SOURCES.md`](src/db/seed/images/SOURCES.md) lists each file with its author, licence and notes, and the commands that prepared them (at most 1600 px and under 500 KB, all camera metadata removed).

Which seeded client sees what, by row of the PRD's access table. An own image is one the client may use: it shows with a tick and "Yours to download", and the client may download it without buying. The seed licenses A3, A6, A8, A10 and A12 to Fjordkaffe AS, each as a purchase by Jonas Fjell at the current price, so Ida sees five licences in Licences on a fresh start.

| Row | File | Status | Visibility | Price | Fjordkaffe AS | Nordlys Sykkel AS |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | `jellyfish-tank.jpg` | Published | Public | Free | Sees it, may download | Sees it, may download |
| A2 | `low-tide-beach.jpg` | Published | Public | Paid | Sees it, may buy | Sees it, may buy |
| A3 | `aerial-coast-plane-window.jpg` | Published | Public | Paid, licensed to Fjordkaffe | Own image | Sees it, may buy |
| A4 | `dinner-table-wine.jpg` | Published | Restricted to Fjordkaffe | Free | Own image (sees it, may download) | Not found |
| A5 | `mountain-farm-painting.jpg` | Published | Restricted to Fjordkaffe | Paid | Sees it, may buy | Not found |
| A6 | `birch-path-thaw.jpg` | Published | Restricted to Fjordkaffe | Paid, licensed to Fjordkaffe | Own image | Not found |
| A7 | `snowy-path-overcast.jpg` | Published | Restricted to Nordlys | Free | Not found | Own image (sees it, may download) |
| A8 | `king-crab-claw.jpg` | Published | Restricted to Nordlys | Paid, licensed to Fjordkaffe | Own image | Sees it, may buy |
| A9 | `wrap-film-samples.jpg` | Published | Internal only | Free | Not found | Not found |
| A10 | `seal-pool-window.jpg` | Published | Internal only | Paid, licensed to Fjordkaffe | Own image | Not found |
| A11 | `birthday-balloon-window.jpg` | Archived | Public | Free | Not found | Not found |
| A12 | `starfish-aquarium.jpg` | Archived | Public | Paid, licensed to Fjordkaffe | Own image | Not found |
| A13 | `garden-clearing-trimmer.jpg` | Draft | Public | Free | Not found | Not found |
| S4 | `gilded-frame-corner.jpg` | Published | Restricted, no clients | Free | Not found | Not found |
| – | `aquarium-jellyfish-fail.jpg` | Draft, AI failed | Internal only | Free | Not found | Not found |

The other 7 files, including the location test files `tromso-harbour-gps.jpg` (JPEG with GPS, City and Country), `jellyfish-polaria-location.png` (PNG with location data) and the thumbnail test file `tabby-cat-terrace-thumbnail.jpg` (JPEG with an embedded EXIF thumbnail), are published, public and free, so every client sees them. Staff see all 22 in the Library. Fjordkaffe AS sees 16 images in Find images and Nordlys Sykkel AS 12. Contacts of Gammel Kunde AS cannot log in.

### Folder overview

```text
src/app/            routes only: pages and /api Route Handlers
src/modules/        domain modules (auth, accounts, images, access, licences, downloads, media, ai, places, activity)
src/db/             schema/ (one file per owning module), migrations/ (committed SQL), seed/ (demo users, sample images with SOURCES.md, and the test fixture), migrate and test-reset scripts
src/styles/theme/   generated Graphite theme CSS (from designsystemet.config.json) and its token test
src/test/           Vitest setup and helpers (loginAs, factories)
src/worker/         background worker (later)
messages/en.json    every UI string
tests/e2e/          Playwright tests
data/places/        place-name data (later)
scripts/            developer scripts (later)
docker/             database init script
_bmad-output/       planning (PRD, architecture, UX, epics) and implementation specs
docs/process/       process documentation
```

The theme is generated, never edited by hand: change [`designsystemet.config.json`](designsystemet.config.json) and run `npm run theme:build` (needs `npm ci` on the host), which rewrites `src/styles/theme/graphite.css` with the Designsystemet CLI 1.24.0. Commit both files; the theme test checks the colours in [DESIGN.md](_bmad-output/planning-artifacts/ux-designs/ux-g53-kalland-2026-11-18/DESIGN.md) against the CSS.

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
