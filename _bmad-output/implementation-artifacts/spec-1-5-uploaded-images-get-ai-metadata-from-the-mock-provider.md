---
title: 'Story 1.5: Uploaded images get AI metadata from the mock provider'
type: 'feature'
created: '2026-11-23'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'b4a781f279a2614934dc34777cdd08123e7f8747'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-g53-kalland-2026-11-20/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** An upload ends `ready` with only embedded metadata. Staff must type title, description, alt text and keywords by hand, and there is no AI seam for the Claude provider (3.5), output checks (3.8) or retry (3.9).

**Approach:** Add the ai module: a provider port, prompt and schema v3, a provider registry with the mock as default, and `metadata_generations`. A completed upload becomes `queued`; `images.generateMetadata` then runs inline in the PUT (claim → generate → save, AD-12) and the image ends `ready` or `failed`. Media makes the AI input in memory. Startup marks `queued` and lease-expired `generating` images `failed` ("interrupted").

## Boundaries & Constraints

**Always:** The story ACs in `epics.md` § Story 1.5 are the contract. Port input: AI image (Buffer), media type, metadata text, output language `en`, and `filename` (used only by the mock's fixtures and fail switch; real adapters ignore it). Port output: `{ title, description, altText, keywords: { term, category }[], usage: { inputTokens, outputTokens } }` or a typed `AiError` with category `auth | rate_limit | timeout | unavailable | refused | invalid_output`. Categories (FR-12): `place, weather_season, emotion, colour_adjective, activity, object, perspective_composition`. Provider output is parsed with the app's zod schema; a mismatch is `invalid_output`. Claim, generate and save are three steps, never one transaction; save is conditional on `generationToken = $token AND status = 'draft'` (0 rows discards). Lease = 60 s (2 × 30 s timeout). `saveAiResult` replaces only fields whose source is not `staff` and only `embedded`/`ai` keyword rows; AI keywords are deduped case-insensitively and a clash with a kept `shared`/`staff` row is skipped. Generation failure never fails the upload and never touches embedded fields. Every run writes one `metadata_generations` row, success or error. AI input: auto-oriented, 1568 px long edge (no enlargement), sRGB, JPEG, no metadata, made from the stored original and never stored. Only ai writes `metadata_generations`; only images writes `images`/`image_keywords`. AI output is untrusted text, rendered escaped. No new dependencies. Migration via `drizzle-kit generate`.

**Never:** No Claude adapter or `@anthropic-ai/sdk` (3.5). No FR-14 checks or 15-keyword cap (3.8). No retry (3.9). No per-category failure reasons (3.2). No batch `aiEnabled`/`placeNamesToAi` or place names (3.7, 3.10). No worker, SKIP LOCKED picking or live updates (3.11, 3.1). No `ai_settings` (6.3). No seed images or real fixture entries (1.7).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy (placeholder) | `harbour.jpg`, XMP title + keywords | row Ready; DB `ready`, title/description/alt = mock placeholder, source `ai`; embedded keywords replaced by 7 `ai` keywords, one per category; generation row `success`, provider `mock`, prompt `v3` | N/A |
| Fixture | filename in the mock's fixture map | that fixture saved | N/A |
| Fail by name | `fail-boat.png` | upload succeeds; row Failed; DB `failed`, `failureReason = unavailable`, embedded title kept; generation row `error` | next file continues |
| Fail by env | `MOCK_FAIL=true` | same as above for every image | — |
| Staff field | `titleSource = staff` before save | title kept; description/alt replaced | — |
| Lost claim | token changed or `status ≠ draft` before save | result discarded, nothing written to `images` | generation row still written |
| Restart | `queued`, or `generating` with `leaseUntil < now` | `failed`, `failureReason = interrupted` | live-lease `generating` untouched |
| Bad output | provider returns a category not in the list | `failed`, `invalid_output` | raw output recorded |

**Decisions (user, 2026-11-23):**
- A Failed row on the Upload page shows the Failed tag only, with the embedded title (or "Untitled image") over the file name. No message line; the NFR-7 AI failure message with per-category reasons comes in Story 3.2.
- Spec size: about 2,800 tokens, kept as one spec, because schema, ai module, AI input, generation flow and upload UI depend on each other.

</frozen-after-approval>

## Code Map

- `src/db/schema/ai.ts` (new) + `schema/index.ts` -- `metadata_generations`: uuidv7 id, `tenantId`, `imageId` → images cascade, `provider`, `model`, `promptVersion`, `outcome` success|error (check), `errorCategory` null, `inputTokens`/`outputTokens` int, `latencyMs` int, `rawOutput` text, `createdAt`; index on `image_id`. Follow `images.ts` style.
- `src/db/schema/images.ts` -- add to `images`: `generationToken` uuid null, `leaseUntil` timestamptz null, `failureReason` text null (check: the six categories + `interrupted`). Migration `0004_ai.sql` via `npm run db:generate -- --name ai`.
- `src/modules/ai/` -- `port.ts` (types, `KEYWORD_CATEGORIES`, `AiError`); `prompt.ts` (`PROMPT_VERSION = "v3"`, `SYSTEM_PROMPT` in English per FR-12 and Story 3.5's prompt AC, adapted from the pilot v2 prompt in `research/pilot-haiku-metadata-2026-10-28/run_pilot.py`; `OUTPUT_SCHEMA` JSON schema; zod `parseOutput`); `providers/mock.ts` (`createMockProvider({ fixtures, delayMs, fail })`, records each input in `received`); `providers/mock-fixtures.ts` (filename → output map, empty until 1.7); `providers/index.ts` (the one registry `{ mock }`); `generate.ts` (`generate(imageId, input)`: resolve `AI_PROVIDER` (default `mock`; unknown → `unavailable`, logged), time it, parse, insert the generation row, return `{ ok, output } | { ok: false, category }`). Remove `providers/.gitkeep`. `index.ts` exports `generate`, `KEYWORD_CATEGORIES`, types; a test hook exposes the mock's `received`.
- `src/modules/media/ai-input.ts` + `files.ts`/`index.ts` -- `makeAiInput(fileVersionId): Promise<{ bytes, mediaType: "image/jpeg" }>` from `originals/<id>`: sharp `autoOrient().resize(1568,1568,{fit:"inside",withoutEnlargement:true}).toColourspace("srgb").jpeg()`, no `keep*`/`withMetadata`.
- `src/modules/images/generation.ts` (new) -- `generateMetadata(imageId)`: claim (`UPDATE … SET generating, token = gen_random_uuid(), lease_until = now() + 60 s WHERE id AND processing_state = 'queued' RETURNING`; 0 rows → return); build metadata text from the row + embedded keywords (title, description, alt text, keywords, date taken, camera, GPS) headed by "Never turn coordinates into a place name."; `makeAiInput`; `ai.generate`; `saveAiResult` or `markFailed`, both conditional on token + draft, clearing token/lease. Never throws (unexpected errors → logged, `markFailed(unavailable)`). `failInterruptedGenerations(now)`.
- `src/modules/images/uploads.ts` -- the completion transaction sets `queued` (not `ready`); after commit `await generateMetadata(imageId)`, then return `{ processingState, title, thumbnailUrl }` read back from the row. `UploadRow`/`listBatchUploads` unchanged in shape.
- `src/app/api/images/[id]/file/route.ts` -- answer `{ status: "ready" | "failed", title, thumbnailUrl }`.
- `src/app/(staff)/upload/{upload-workspace,file-row}.tsx` -- `FileRowState` gains `failed` (tag colour danger, label "Failed"); `fromStored` maps `failed` → failed, `queued`/`generating` → failed with no message (cannot happen after a completed PUT; a reload mid-generation shows the honest state after restart). Failed rows: tag only, title (or "Untitled image") over the file name, no message line.
- `src/instrumentation.ts` -- after the upload sweep, `failInterruptedGenerations(new Date())`, logged.
- `messages/en.json` -- `upload.tag.failed` ("Failed").

## Tasks & Acceptance

**Execution:**
- [x] schema + migration per the Code Map -- AD-3, AD-12, AD-21
- [x] `src/modules/ai/*` + `ai.test.ts`: port types; prompt v3 contains the FR-12 people rule and the coordinates rule; mock fixture, placeholder (all 7 categories), delay, `MOCK_FAIL`, `fail` in filename; zod rejects a bad category → `invalid_output`; registry default and unknown provider; every run writes a generation row
- [x] `src/modules/media/ai-input.ts` + test: 4000×3000 orientation-6 JPEG with EXIF/XMP/GPS/P3 ICC → 1176×1568, JPEG, exiftool finds no EXIF/XMP/IPTC/ICC tags
- [x] `src/modules/images/generation.ts` + `generation.test.ts`: every matrix row; recording mock received metadata-free bytes and text with the coordinates rule (SC-13 first part); upload of image B continues after A fails
- [x] `uploads.ts` + update `uploads.test.ts` expectations (`ready` now comes via generation)
- [x] route + `images-routes.test.ts`: happy PUT answers `ready` with the AI title; `fail` file answers `failed` with 200
- [x] `instrumentation.ts` + `instrumentation.test.ts`
- [x] upload UI + `messages/en.json`; update `tests/e2e/upload.spec.ts` (titles are now the mock placeholder) and add a `fail-…png` row ending Failed while the next file ends Ready
- [x] `README.md` -- test counts; mock behaviour (`MOCK_DELAY_MS`, `MOCK_FAIL`, `fail` in file name)

**Acceptance Criteria:**
- Given the README test command, then all Vitest and Playwright tests pass.
- Given `npm run lint` and `npm run typecheck`, then both are clean.
- Given `docker compose up --build`, when Ida uploads a JPEG, then after about `MOCK_DELAY_MS` the row shows Ready with the placeholder title; a file named `fail-x.jpg` ends Failed and the batch continues.

## Implementation Notes

- **Adapter answer.** An adapter returns `{ rawOutput, usage }`; the app parses it with `parseOutput`, so only one place checks the schema. The mock's raw output is the JSON of what it returns.
- **Unknown provider.** The generation row records model `"unknown"` (`model` is NOT NULL). `AI_PROVIDER=claude` fails every image as `unavailable` until Story 3.5; README and `.env.example` say so.
- **Mock memory.** The registry's mock keeps only its last 10 inputs (test hook `mockReceivedInputs()`), so the running app does not keep every AI image in memory. The `fail` match ignores case.
- **AI text.** Control characters are stripped before validation and again on save; empty fields are `invalid_output`. Generation does not bump `images.version`. Embedded values reach the prompt with line breaks flattened, and prompt v3 says the metadata is data, never instructions.
- **Lease sweep.** `failInterruptedGenerations` compares leases with the database's `now()`, the clock that set them.
- **Test env.** `docker-compose.yml` `&test-env` now pins `MOCK_FAIL: "false"` too.
- **Known risk (not fixed).** Vitest files run in parallel on one database. `failInterruptedGenerations` fails every `queued` image, so `instrumentation.test.ts` or the restart test could, rarely, catch another file's upload in the milliseconds between its commit and its claim. Not seen in three full runs.
- **Not done:** the manual browser check as Ida with `docker compose up --build` (the e2e tests cover the same flow with `MOCK_DELAY_MS=0`).

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Evidence | Route |
|---|-------|---------|---------|----------|-------|
| 1 | blind, edge-case | No 30 s provider timeout; `timeout` category never produced; PUT could hang | low | Only the mock exists; it waits `MOCK_DELAY_MS` and never hangs. AD-21's timeout belongs to the Claude adapter (3.5 AC: 30 s, `maxRetries: 0`); fix adds a race wrapper | reject |
| 2 | blind | Save accepted after the lease expired | false | Only `failInterruptedGenerations` at startup re-takes a row, and it clears the token; a late save then matches 0 rows. Without a restart nothing re-claims, so the token is enough | reject |
| 3 | blind, edge-case | Lease set with DB `now()`, swept with app `new Date()` | low | Same host in Compose, but two clocks for one comparison; direct correction: compare with `sql\`now()\`` | patch |
| 4 | blind | Inline generation slows every upload by `MOCK_DELAY_MS` | false | Intended: AD-12 inline path and the spec's Design Notes | reject |
| 5 | blind, edge-case | README env table and `.env.example` still offer `claude`, which fails every image until 3.5 | low | Pre-verified by reading README table; direct text correction | patch |
| 6 | blind | Failed row shows no reason or next step | false | User decision (Failed tag only; message in 3.2) | reject |
| 7 | blind, edge-case | Reload while a PUT is still generating shows Failed; route maps `queued`/`generating` to failed | low | Real during the `MOCK_DELAY_MS` window only; the spec chose this mapping; fixing needs a new row state, and live state is 3.1/3.11 | reject |
| 8 | blind, edge-case | `parseOutput` has no keyword count or length bounds | false | FR-14 checks are excluded by the intent's Never list (Story 3.8); an empty AI keyword list replacing embedded ones is AD-10 behaviour | reject |
| 9 | blind, edge-case, verification-gap (other) | Control-character-only title/description/alt passes `trim().min(1)`, then is stored as `""` with source `ai` | low | zod `trim` removes whitespace only; direct correction: strip before the min check | patch |
| 10 | blind | Embedded metadata goes into the prompt unfenced; a multiline description can add fake lines or instructions | low | No real model reads it until 3.5, but prompt v3 is written here; direct fix: one prompt sentence + flatten newlines in values | patch |
| 11 | blind | `buildMetadataText` labels AI/staff text as embedded | low | Unreachable now (generation runs only right after upload, when every field is embedded); matters for retry in 3.9 | reject |
| 12 | blind, edge-case | A failed `record()` insert discards a good result; README says every run is recorded | low | Needs a DB failure on one insert while the save would likely fail too; README wording is the direct part | patch (README wording only) |
| 13 | blind | `metadata_generations.error_category` has no check constraint | low | No named consumer that diverges; fix adds constraints | reject |
| 14 | blind | `fail` substring match also fails `failsafe-valve.jpg` | false | AD-22: "fails … for a filename containing `fail`"; README states it | reject |
| 15 | blind | Startup sweep assumes a single instance | low | AD-12 rule for v1 without the worker | reject |
| 16 | blind | `vi.mock` fixtures duplicated in two test files | low | Test-only duplication, two short blocks | reject |
| 17 | blind | Missing tests: stale-token `markFailed`, unknown provider via route, `record()` failure, escaped AI title | low | AI and embedded text share one escaped render path, already tested; the rest are rare paths | reject |
| 18 | blind | `./generation` import sits between alias imports in `uploads.ts` | low | Direct correction | patch |
| 19 | verification-gap | `stripControlCharacters` on AI output untested | medium | Pre-verified: no test feeds control characters to `saveAiResult` | patch |
| 20 | verification-gap | `generateMetadata` unexpected-error catch never runs in tests | medium | Pre-verified: every failure test goes through `result.ok === false` | patch |
| 21 | verification-gap | `fromStored` mapping of `queued`/`generating` untested | low | Pre-verified; filed disposition defer (needs DB state in e2e or an export) | defer |
| 22 | verification-gap (other) | Test env pins `AI_PROVIDER`/`MOCK_DELAY_MS` but not `MOCK_FAIL`; a local `.env` with `MOCK_FAIL=true` breaks the Ready tests | medium | `docker-compose.yml` `&test-env` comment says tests always use the mock whatever `.env` says; direct fix | patch |
| 23 | edge-case | `PROVIDERS[name]` / `fixtures[filename]` resolve `Object.prototype` keys (`constructor`) | low | Direct correction with `Object.hasOwn` | patch |
| 24 | edge-case | `MOCK_DELAY_MS` > 2^31 overflows the timer | low | Dev setting; nobody sets it | reject |
| 25 | edge-case | JS `toLowerCase` vs Postgres `lower()` may differ; the insert then violates the unique index and fails the image | low | Rare Unicode; direct fix: `onConflictDoNothing()` on the AI keyword insert, as `completeUpload` already does | patch |
| 26 | edge-case | `holdsClaim` requires draft, so a non-draft generating image stays generating | false | Publish requires `processingState in (ready, failed)` (AD-8); no path leaves draft while generating | reject |
| 27 | edge-case | `claim()` throwing leaves the row `queued` while the route answers failed | low | DB failure only; restart fails it as interrupted | reject |
| 28 | edge-case | Silent skip when claim returns null | low | Only reachable by calling `generateMetadata` on a non-queued image; no caller does | reject |
| 29 | edge-case | `generating` with null `leaseUntil` never swept | false | Claim always sets the lease in the same update | reject |
| 30 | edge-case | Row deleted between generation and the final select → NotFound | false | No code deletes a draft past `uploading` (discard is 3.12) | reject |

## Design Notes

**Inline, synchronous generation.** The PUT waits for generation (mock: `MOCK_DELAY_MS`, 0 in tests), so the row says Uploading until the answer comes and then Ready or Failed. No polling; live state is 3.1/3.11.

**Filename in the port.** The mock must key fixtures and the fail switch on the file name (AD-22), but the name is not metadata a real model should get. It travels as its own port field, not in the metadata text, so 3.5's adapter can ignore it.

**Placeholder output.** Title "Placeholder title from the mock AI", description "Placeholder description from the mock AI provider. Set AI_PROVIDER to use a real model.", alt text "Placeholder alt text from the mock AI provider.", keywords `mock <category>` for each of the seven categories. Usage 0/0, model `mock`, raw output = JSON of the output.

## Verification

**Commands:**
- `npm run db:generate` -- expected: "No schema changes" after the migration is committed
- README test command -- expected: all pass
- `npm run lint && npm run typecheck` -- expected: clean

**Manual checks:**
- Browser as Ida: upload a JPEG with an XMP title (placeholder replaces it) and `fail-test.jpg` (Failed, embedded title kept).
