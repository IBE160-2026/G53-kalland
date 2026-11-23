# Epic 1 Context: The whole flow, thinly — one image from upload to licence

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Build the thinnest end-to-end version of the CRM-DAM: staff log in, upload one image that gets mock AI metadata, set its visibility and price and publish it; a contact logs in, finds it and checks it out; the licence appears in the transaction log. Everything runs from `docker compose up` with seed data and no API key. This epic is the 2026-11-30 checkpoint test; later epics complete each first cut.

## Stories

- Story 1.1: The app starts from one command
- Story 1.2: Staff and contacts log in and out
- Story 1.3: Staff and client shells in the Graphite theme
- Story 1.4: Staff upload an image and the library stores it safely
- Story 1.5: Uploaded images get AI metadata from the mock provider
- Story 1.6: Staff publish an image with its visibility and price
- Story 1.7: The examiner starts with a sample library
- Story 1.8: A contact finds the images their client may see
- Story 1.9: A contact checks out a paid image and staff see the licence

## Requirements & Constraints

- Runnable without keys: from a machine with Docker to the full flow by following the README in about 20 minutes; no API key, paid account or local model. Only building images needs the network. CI builds and tests on x86 Linux.
- Security: access enforced on the server for every page, file and download through one access module; passwords hashed (argon2id); originals never reachable by a public path; upload filenames never used as storage paths; CSRF protection on state changes; embedded metadata and AI output are untrusted text, always escaped. Secrets only from env vars, documented in `.env.example`, never in code, logs or repo.
- Privacy: real images and client data never enter the repo; uploads and generated data stay out of git.
- Language: UI and generated metadata in English; every UI string in `messages/en.json` (next-intl, no locale segment in URLs).
- Integrity: a stored original's hash never changes; failed checkout leaves no partial licence.
- Data model seams: tenant ID on top-level tables, role field on users, prices as integer minor units + currency ex VAT, images and file versions as separate records.
- Every user-facing error is plain English with a next step; fixed NFR-7 messages are tested word for word.

## Technical Decisions

- One Next.js (App Router) TypeScript app, scaffolded with `create-next-app@16.4.6 --ts --app --src-dir --eslint --no-tailwind --no-cache-components --no-agent-feedback`. Designsystemet React for all UI (no Tailwind/shadcn). Drizzle on PostgreSQL 18.7. Node 26 LTS. The worker is the same codebase and image.
- Pinned versions: next 16.4.6, react 19.3.1, TypeScript 5.9.3, drizzle-orm 0.45.4 / drizzle-kit 0.31.11, pg 8.23.1, @node-rs/argon2 2.2.2, zod 4.6.7, next-intl 4.14.9, sharp 0.35.5, exiftool-vendored 39.2.0, pino 10.4.0, vitest 5.1.0, @playwright/test 1.65.0, @axe-core/playwright 4.14.0, Designsystemet 1.24.0.
- Compose services: `db` (postgres:18.7, healthcheck, dev + test DB, volume at `/var/lib/postgresql`), `migrate` (one-shot: migrations + later the places loader), `app` (Next.js, Debian full `perl` for ExifTool, `/api/health`), `worker` (FR-15, bonus), and a `test` profile with `app-test` and `e2e` (Playwright image v1.65.0-noble). `app` waits for `migrate` to complete successfully. `next.config` lists `exiftool-vendored` and `sharp` in `serverExternalPackages`.
- Env vars (exactly): `DATABASE_URL`, `TEST_DATABASE_URL`, `APP_ORIGIN`, `FILE_STORE_DIR`, `AI_PROVIDER`, `ANTHROPIC_API_KEY`, `AI_MODEL`, `AI_EFFORT`, `MOCK_DELAY_MS`, `MOCK_FAIL`, `WORKER_CONCURRENCY`, `SEED_ON_START`, `APP_ENCRYPTION_KEY`.
- Migrations only via `drizzle-kit generate` as committed SQL, forward-only; never `push`, never edit an applied migration.
- Routes are thin (guard → zod → module functions); only modules touch the DB. Module public API is `index.ts`; each table lives in `src/db/schema/<owner>.ts` and is written only by its owner (auth, accounts, images, licences, ai, places, activity; access/downloads/media own none).
- Source tree: `src/app/` routes only ((staff)/, (client)/, api/); `src/modules/{auth,accounts,images,access,licences,downloads,media,ai,ai/providers,places,activity}`; `src/db/{schema,migrations,seed,tenant.ts}`; `src/worker/`; `messages/en.json`; `tests/e2e/`; `data/places/`; `scripts/`.
- Conventions: UUID v7 from Postgres `uuidv7()`; constant `DEFAULT_TENANT_ID` in `src/db/tenant.ts`; `timestamptz` UTC shown in Europe/Oslo; tables snake_case plural; typed module errors (`NotFound`, `Forbidden`, `Conflict`, `Validation`, `Locked`) mapped by one helper; pino logging that never logs secrets.
- Auth: DB sessions with hashed random tokens; every page, Server Action and Route Handler calls `requireStaff()`/`requireContact()` (layouts are display only); Route Handlers reject state changes whose `Origin` ≠ `APP_ORIGIN`; GET never writes; no caching of session- or access-dependent data.
- Access tests go through real routes using a shared seed fixture (`src/db/seed/fixture.ts`) and a `loginAs` helper; each e2e run starts from a freshly migrated and seeded test DB and empty file dir.
- AI: mock provider is the default (`AI_PROVIDER=mock`), returns fixture metadata per seed image, waits `MOCK_DELAY_MS`, fails when `MOCK_FAIL=true` or the filename contains `fail`.
- Files: `FileStore` interface used only by media; keys never from upload filenames; local disk at `FILE_STORE_DIR`; files reach browsers only through guarded Route Handlers with `Cache-Control: private, no-store`.

## UX & Interaction Patterns

- Graphite theme generated from `designsystemet.config.json`; Instrument Sans self-hosted via `next/font` (offline at runtime); light only.
- Staff shell: top bar with "CRM-DAM" wordmark, tabs Library / Upload / Clients / Licences, header search, account menu. Client shell: client name over "Image portal", tabs Overview / My images / Find images / Licences, cart button.
- Login and set-password pages are one centred form without navigation; contacts on staff routes get a 403 page; anything a contact may not see is a Not found page.

## Cross-Story Dependencies

- 1.1 is the foundation for every later story: Compose, CI, test harness, env, source tree and migrations pipeline.
- 1.2 builds the auth module, guards, the seed fixture and `loginAs`, which every access test reuses.
- 1.4 → 1.5 → 1.6 form the upload-to-publish chain; 1.7 seeds the sample library through module functions; 1.8 and 1.9 depend on the access module's visibility condition.
