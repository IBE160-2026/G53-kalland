# Rubric review: ARCHITECTURE-SPINE.md (CRM-DAM v1)

- **Reviewed:** `ARCHITECTURE-SPINE.md` (updated 2026-11-23) against PRD 2026-11-18 (+ addendum)
- **Reviewer:** rubric walker, 2026-11-23
- **Verdict:** Strong spine. It is terse, mostly made of real trade-offs, covers the PRD's capability areas, and fixes the hard divergence points: access, licences, transactions, file pipelines and the AI port. It is not ready to bind yet. The module-dependency graph is declared binding but contradicts several PRD flows. The client data projection and the authorization placement are left open, and both are security divergence points. The no-FR-15 path can leave images stuck for good. Data-model seams that FR-16b, FR-38a and FR-10b need are missing. Migrations and test data need a policy, given the parallel worktrees (D-016).

Severity counts: critical 0 · high 4 · medium 11 · low 9

---

## High

### H1. The module dependency graph is binding but contradicts PRD flows
- **Location:** Design Paradigm diagram and the sentence "Arrows are the only allowed call directions", AD-3, AD-19.
- **Issue:** Several flows the PRD requires have no allowed arrow, so each story will either break the rule or route around it in its own way:
  - FR-42a logs downloads, setup-link creation and settings changes, but `downloads`, `auth` and `ai` have no arrow to `activity` (`ai` is even declared leaf-only, yet FR-39 settings changes must be logged).
  - Routes have no arrow to `ai` (FR-39 settings page), `activity` (FR-42b view, FR-38b list) or `places`.
  - FR-4: creating a user gives a setup link. `accounts` owns users and `auth` owns setup_links, and there is no ACC→AUTH arrow. AD-2's "one module function per route" forbids the route from calling both.
  - FR-38a needs the contact's last login. `auth` handles login, but `accounts` owns `users`, and there is no AUTH→ACC arrow or owned column.
- **Fix:** redraw the graph from the use cases. Add R→AI, R→ACT and ACC→AUTH, plus DL→ACT, AUTH→ACT and LIC→ACT (already there). Put `lastLoginAt` on `sessions` or in a table that auth owns, or add AUTH→ACC. Drop "ai calls no other module", or move AI settings logging to the caller. Then add one line: "`activity.record(tx, …)` may be called by any module; activity calls none."

### H2. The client-facing projection is not fixed (location, staff notes and provider data can leak)
- **Location:** AD-6 ("returns the image with own/canDownload/canBuy").
- **Issue:** FR-6, FR-30 and SC-6 require contact pages never to show GPS, the place name, staff notes, provider details, visibility lists or other clients. AD-6 only fixes *which rows* a client gets, not *which fields*. If access functions return the full image row, every client page decides for itself what to omit. That is exactly the divergence the spine exists to prevent, and it is the location-privacy invariant (D-011).
- **Fix:** add to AD-6: "Access functions return a `ClientImage` DTO with an explicit field whitelist (agency fields, date taken, camera data, flags). It never has coordinates, place name, notes, visibility list, provider or generation data. Client routes never select from `images` directly." Add an SC-6 test that asserts the DTO keys.

### H3. Where authorization is enforced is not fixed
- **Location:** AD-5 and AD-4. The source tree uses `(staff)/` and `(client)/` route groups.
- **Issue:** with route groups, the natural move is a guard in `layout.tsx` or `proxy`/middleware. In Next.js, layouts don't re-run on every navigation, and Server Actions and Route Handlers bypass layouts completely. If some stories guard in the layout and others in the handler, a Server Action or Route Handler will end up unguarded, and S6 (403, no data) quietly fails.
- **Fix:** add to AD-5: "Every page, Server Action and Route Handler calls `requireStaff()`/`requireContact()` itself as its first statement. Layouts and middleware may redirect for UX but are never the guard." Add an AD-7 test that enumerates the staff Route Handlers and Server Actions as a contact.

### H4. Without FR-15, a restart leaves images permanently stuck in `queued`
- **Location:** AD-9 (startup sweep "resets `generating` to `queued`"), AD-10 ("Without FR-15, the upload route calls it inline"), AD-8.
- **Issue:** FR-15 is bonus rank 10 and likely below the cut. Without a worker, nothing ever claims a `queued` image after a restart. AD-8 forbids publishing while queued, and retry (FR-16b) works only on `failed`. So such images can never be published or retried. The same gap appears if the inline request dies mid-generation. With FR-15, the sweep owner is ambiguous: if `app` restarts while `worker` keeps running, the app's sweep resets the worker's in-flight `generating` rows, and generation runs twice.
- **Fix:** state it explicitly. Without FR-15, the startup sweep sets `queued`/`generating` to `failed` with reason "interrupted". With FR-15, only the worker resets `generating`, on its own startup, or by lease (`claimedAt` older than 2 × the provider timeout). The app's sweep only deletes stale `uploading` rows.

---

## Medium

### M1. "Search implementation" deferral lets two modules diverge on FR-29
- **Location:** Deferred, last bullet; Capability map F4 ("images (staff), access (client)").
- **Issue:** FR-29 requires *the same* search behaviour for staff and clients (case-insensitive, all terms match, newest first, paged, empty-state). The spine splits search across two modules and defers the implementation "when the search story is built". There are two search stories, so two implementations will drift, and NFR-4 might be measured on only one of them.
- **Fix:** add a rule. `images` exports one `searchPredicate(terms, fields)` plus the ordering and paging helper. `access` composes it with the visibility condition, and the field set is the only difference (clients: no place name). Keep only ILIKE vs full-text deferred, inside that one function.

### M2. No pagination or list convention
- **Location:** Consistency Conventions.
- **Issue:** staff search, Find images, My images, the transaction log (FR-41), the action log (FR-42b) and licence history are all paged lists built in separate stories. Offset vs cursor, page size and URL params will differ, and so will the "newest first" tie-breaker.
- **Fix:** add a row: "Lists: offset paging via `?page=` (1-based), page size 24 (images) / 50 (tables), order `createdAt desc, id desc`, empty state required (NFR-7)." Or choose cursor paging, but decide once.

### M3. Data-model seams that bound FRs need are missing
- **Location:** AD-8, AD-12, AD-17, ERD.
- **Issue:**
  - **FR-16b / AS-7:** "retry never overwrites a field staff have edited" needs per-field provenance. Without it, the edit story and the retry story will each invent their own.
  - **FR-38a:** "images made visible to it since …" needs a *visible-since* time per client (publish time, the time it became public, `image_clients` insert time). There is no such column.
  - **FR-10b:** an undecided filename match must wait before AI runs, but `processingState` has no state for it.
  - **Addendum, data-model accommodations:** a licence records its source (purchase / free download / staff grant) and may have no contact. AD-17 makes contact mandatory and has no source field.
- **Fix:** add to AD-8: `fieldSources` (or `editedFields`) on images, written by every save action and checked by `generateMetadata`. Add `awaiting_decision` to `processingState`, used only by FR-10b. Add `publishedAt` and `image_clients.addedAt`, and let access compute `visibleSince`. Add to AD-17: `source` enum and nullable `contactId`.

### M4. Migration authoring policy is silent (risky with parallel worktrees)
- **Location:** Deployment & environments (`migrate` one-shot), AD-23.
- **Issue:** every story adds schema. `drizzle-kit push` vs `generate`, editing applied migrations, and journal conflicts when two worktrees (D-016) each generate migration `0007_*` are all undecided. The result is broken or diverging schemas between branches.
- **Fix:** add a line: "Schema changes only via `drizzle-kit generate`, committed SQL, forward-only. Never `push`, never edit an applied migration. Rebase onto `main` and regenerate before merge if the journal conflicts. The `migrate` service uses drizzle-orm's migrator (no dev dependency in the runtime image)."

### M5. Test data isolation and reset are not decided
- **Location:** AD-7, Deployment & environments ("Tests").
- **Issue:** A1/A4 first downloads, checkout and revoke tests *mutate* the shared seed fixture, so a table-driven matrix becomes order-dependent. Who resets the test DB, and how, is open, as is how the `e2e` service reaches an app bound to the *test* DB (the `app` service uses the dev DB). Each story will improvise.
- **Fix:** fix it in AD-7. Vitest gets a per-test transaction rolled back, or truncate-and-reseed per file. E2E gets a fresh seed per run plus an `app-test` Compose service (profile `test`) on `TEST_DATABASE_URL`. Tests that mutate create their own rows through a fixture factory, never the matrix rows.

### M6. Seeding can bypass table ownership
- **Location:** AD-3, AD-23, `src/db/seed/`.
- **Issue:** the seed must create users, credentials, images (hash, thumbnails, previews in the FileStore), licences and places. If it inserts rows directly, it skips owner rules (hashes, derived files, licence facts) and drifts from what the app produces.
- **Fix:** add to AD-23: "The seed writes only through module functions, with the mock provider. The places extract is the only bulk load." Or name the exception explicitly.

### M7. The licence-granting download vs the CSRF rule
- **Location:** AD-4, AD-18.
- **Issue:** a free first download *creates a licence* (state change). If it is a GET link to a Route Handler, it is not covered by "check Origin on every state-changing method". Cookie `SameSite` is not fixed either (AD-5).
- **Fix:** add to AD-4: "GET never writes. A licence-granting download is a POST (form or Server Action) that returns or redirects to the stream." Add to AD-5: "session cookie `HttpOnly; Secure (non-dev); SameSite=Lax`."

### M8. Caching of per-user data and files is not fixed
- **Location:** AD-4, AD-6, AD-13.
- **Issue:** Next 16's `use cache` / cache components and browser or proxy caching of thumbnail and preview responses can serve one client's view to another, or keep serving a file after access is revoked or the image archived (S3, S12). Different stories will set different headers.
- **Fix:** add a rule. "No `use cache`/`unstable_cache` on anything that depends on session or access. Every file Route Handler sends `Cache-Control: private, no-store` (client) / `private, max-age=0` (staff)."

### M9. Previews and thumbnails are outside the fail-closed check
- **Location:** AD-14, AD-15.
- **Issue:** AD-15 checks only on-demand *client copies*. Thumbnails and previews are made once by sharp and served to clients too (FR-36 "images shown on a page", SC-6 "every file served to a client"). They are never read back against the location checklist.
- **Fix:** add to AD-15: "derived thumbnails and previews are checked against the same checklist when created; a hit fails the upload's derive step."

### M10. The AI input size contradicts the addendum
- **Location:** AD-14 ("AI input (≈ 1000 px)").
- **Issue:** the addendum ("Upload size") says the provider receives about 1568 px. The spine says ≈ 1000 px without recording why, so the prompt contract, the pilot comparability and cost all shift silently.
- **Fix:** choose one. If 1000 px is intended, record it as a D-xxx and note it against the addendum. Otherwise change it to ≈ 1568 px.

### M11. AD-22's "seed or migration" is an unresolved choice
- **Location:** AD-22.
- **Issue:** seeding runs only on an empty DB with `SEED_ON_START=true` (AD-23). If places load through the seed, any non-seeded environment (rollout, a fresh test DB without the seed) has no place names. "Or" leaves the choice to the implementing story.
- **Fix:** "Loaded by an idempotent loader run in the `migrate` service, independent of `SEED_ON_START`."

---

## Low

### L1. Orphaned files in the FileStore
- **Location:** AD-9, AD-13.
- **Issue:** the sweep deletes leftover `uploading` *rows*, but not the bytes already streamed. A duplicate's file and a crash mid-stream also leave files behind.
- **Fix:** stream to `tmp/<uuid>` and rename to `originals/<fileVersionId>` in the completion step. The sweep clears `tmp/`.

### L2. Operations and observability are not listed as deferred
- **Location:** Deferred, Conventions (Logging).
- **Issue:** hosting and backups are deferred (RG-1/RG-2), but operations, monitoring, error tracking and breach response (RG-13) are not mentioned. Compose healthchecks and the `depends_on` conditions (db healthy → migrate completed → app) are also not stated, and the structured logger is not named in Stack.
- **Fix:** add "Operations, monitoring, error tracking — RG-13" to Deferred. In Deployment, add one line: db healthcheck; `migrate` `service_completed_successfully`; app `/api/health`. Name the logger (e.g. pino) in Stack.

### L3. The env var list is incomplete
- **Location:** Deployment & environments.
- **Issue:** the Route Handler Origin check needs the expected origin (`APP_ORIGIN`/`APP_URL`), the tests need `TEST_DATABASE_URL`, and the cookie `Secure` flag depends on the env. These are not listed, so each story will name them its own way.
- **Fix:** add them to the list. State that `.env.example` mirrors this list exactly.

### L4. Stack: a few names or versions look off or are missing
- **Location:** Stack.
- **Issue:** TypeScript is "5.x (create-next-app default)", unpinned, and possibly not the late-2026 default (TS 6/7). drizzle 0.45.x should be checked against a 1.x stable line. No libraries are named for ZIP (FR-37), content-type sniffing (FR-8; sharp metadata may suffice), the logger, or `APP_ENCRYPTION_KEY` (algorithm, e.g. AES-256-GCM via node:crypto).
- **Fix:** pin TypeScript to an exact version. Confirm drizzle's line (the version reviewer). Add the ZIP library and the logger, and add one word on the FR-39 encryption primitive.

### L5. The ERD omits entities and relations the ADs rely on
- **Location:** Core entities.
- **Issue:** `PLACE`, `AI_SETTINGS`, `LOGIN_ATTEMPT` are missing, as are LICENCE_TYPE→LICENCE, CART_ITEM→LICENCE_TYPE, USER(contact)→LICENCE, and revokedBy→USER.
- **Fix:** add these relations (they are cheap), or say "selected entities".

### L6. The preview pipeline departs from "Settled for the architecture" without a recorded decision
- **Location:** AD-14.
- **Issue:** the addendum says "the same pipeline [as client copies] produces previews", and the Glossary calls a preview a client copy. The spine makes previews metadata-free sharp output instead. This is stricter and fine, but it is a change.
- **Fix:** note it in a D-xxx, or add one clause to AD-14: "previews carry no metadata (stricter than the addendum)."

### L7. Binds and Capability map gaps
- **Location:** frontmatter `binds`, Capability map.
- **Issue:** NFR-5b is absent. FR-10b, FR-29 paging and FR-42a/b are only implicitly mapped (F8 → "AD-19" only).
- **Fix:** add NFR-5b ("AD-1, UX"). Add FR-10b to F2's ADs once M3 lands. Add a row for the action log (activity, AD-19, H1's `record`).

### L8. `.gitattributes eol=lf` risk from the addendum is not carried over
- **Location:** AD-23 / Deployment.
- **Issue:** the addendum lists Windows line endings in shell scripts as an architecture risk for the examiner's run (NFR-1).
- **Fix:** add half a line to AD-23: "`.gitattributes` forces `eol=lf` for scripts and Dockerfiles."

### L9. Minor rationale in Rules and Deferred
- **Location:** AD-5 ("Better Auth and Auth.js rejected"), Deferred hosting bullet (the Vercel reasons).
- **Issue:** rationale belongs in decisions.md or the memlog, not the spine.
- **Fix:** cut it to "Host must run containers with a volume and a long-running worker; S3-compatible FileStore added then." Move the rejected-library note to a D-xxx.

---

## Checks that passed

- **Mermaid:** the flowchart, deployment and erDiagram are syntactically valid (the empty `""` ER labels are accepted). No template leftovers.
- **ADs:** every AD names the divergence it prevents, and most Rules are enforceable by review or test. AD-6, AD-16, AD-18 and AD-19 together make a good access and licence core.
- **Envelope:** deployment & environments, offline runtime, secrets, seeding gate and file storage are decided. Hosting and backups are explicitly deferred to RG-1/RG-2.
- **Tech:** names are plausible for 2026-11. PG 18 has `uuidv7()`, and the stack is consistent with D-027 and D-031. Versions are left to the version reviewer.
- **Coverage:** every PRD area F1–F9 and NFR-1–NFR-10 has a home in the Capability map.
