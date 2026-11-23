---
review: verify-current
target: ARCHITECTURE-SPINE.md (updated 2026-11-23)
checked: 2026-11-23
lens: every committed decision web-researched or reality-checked; versions current and at least ~2 weeks old (cut-off 2026-11-09)
---

# Review: are the spine's versions and library claims current?

**Verdict:** The stack holds up. Every named technology exists, is maintained and fits. But **three Stack pins break the project's two-week rule**, and the memlog records one of them as checked. The spine's starter line also leaves out several **create-next-app 16.4.6 defaults that change the architecture**: Cache Components is on by default, Tailwind is on, and `src/` is off. Four Docker/runtime details need a sentence each in the spine: Perl modules, the `postgres:18` volume path, bundling of exiftool-vendored, and how the CSRF check treats a missing Origin header.

## How the checks were done

- `npm view <pkg> dist-tags` and `npm view <pkg> time --json` for every Stack row (run 2026-11-23). Two-week cut-off: published on or before 2026-11-09.
- Downloaded and read the actual tarballs (`npm pack`) for create-next-app 16.4.6, next 16.4.6 (including its bundled docs in `dist/docs/`), @digdir/designsystemet-react 1.24.0, sharp 0.35.5, drizzle-orm 0.45.4, exiftool-vendored 39.2.0, exiftool-vendored.pl 13.61.0, @anthropic-ai/sdk 1.7.0 and playwright 1.65.0.
- Node release index (`nodejs.org/dist/index.json`), the Docker Hub tag API (`library/node`, `library/postgres`), the MCR tag list (`playwright`) and the Debian trixie `perl-base` file list.
- GitHub Advisory API (`gh api /advisories?affects=<pkg>@<ver>`) for next, react-dom, sharp, drizzle-orm, next-intl, @anthropic-ai/sdk, exiftool-vendored, pg and zod. I sanity-checked the query against next@16.0.0, which does return hits.
- Web pages: postgresql.org/docs/18 (`uuidv7`), docker-library/docs postgres README, next-intl.dev "without i18n routing", and a web search on next-intl with cacheComponents.
- The claude-api reference (model table, SDK client config, API version 2026-10-21).
- Not done: I did not run anything in Docker (the daemon was not running), so runtime behaviour inside the image is inferred from package contents, not observed.

## Stack rows

| Row | Spine pin | Published | Latest today | Result | Severity | Fix |
| --- | --- | --- | --- | --- | --- | --- |
| Node.js | 26 LTS (26.13.x) | 26.13.0 on 10-28 (start of LTS "Lithium"), 26.13.1 on 11-10 | 26.13.1 | **Confirmed**: Active LTS. 26.13.1 is 13 days old today, so it passes the rule from tomorrow. `node:26-slim` = `26.13.1-trixie-slim` = `lts-slim` (same digest, built 11-11). | Low | Pin the image tag explicitly, e.g. `node:26.13.1-trixie-slim` (Debian 13, not bookworm). |
| Starter | create-next-app 16.4.6 (TS, App Router, `src/`, no Tailwind) | 11-09 | 16.4.6 | **Version confirmed; defaults wrong or incomplete.** See finding F2. | High | Put the exact command in the spine (see F2). |
| TypeScript | 5.x (starter default) | starter writes `typescript: "^5"` → 5.9.3 (2025-09-30) | 7.0.2 (`latest`) | **Confirmed**: the starter installs TS 5. TS 7 is npm `latest` and is deliberately not used. | Low | Pin `5.9.3` exactly instead of "5.x". |
| next | 16.4.6 | 11-09 20:33 UTC (14 days) | 16.4.6 | **Confirmed**, at the limit of the rule. It is patched against all five Next advisories published 10-22 to 11-19 (fixed in 16.4.1 and 16.4.5). No advisory affects 16.4.6. | — | — |
| react / react-dom | 19.3.1 | 10-14 | 19.3.1 | **Confirmed.** Note: create-next-app 16.4.6 writes `react: "19.3.0"` (constant in its source), so 19.3.1 is a manual bump. next peer `^19.0.0` is OK. | Low | Say "bump to 19.3.1 after scaffolding". |
| @digdir/designsystemet-react / -css / -web | 1.24.0 | 11-09 12:1x (14 days) | 1.24.1 (11-19, too new) | **Confirmed.** Peer `react >=18.3.1 \|\| ^19.0.0`. `-react` depends on `-web` at exactly 1.24.0. See F9 for client-component and theme notes. | Low | — |
| PostgreSQL | 18 (18.7) | `postgres:18` = `18.7` = `18-trixie` (digest identical, built 11-20) | 19 (`postgres:latest` now points at 19) | **Confirmed.** `uuidv7()` is built in (PG 18 docs, Table 9.45). See F5 for the volume path. | Medium (F5) | Pin `postgres:18.7`; never `latest`. |
| drizzle-orm / drizzle-kit | 0.45.4 / 0.31.11 | 10-08 / 09-21 | same; 1.0.0-rc.6 on the `rc` tag | **Confirmed.** All three APIs the ADs rely on exist in 0.45.4 (see the "Library-behaviour claims" table below). 1.0 is in RC: staying on 0.45 is right for v1. | Low | Note that Drizzle 1.0 is not adopted in v1. |
| pg | 8.23.1 | 09-30 | 8.23.1 | **Confirmed**; in Next's built-in server-externals list. | — | — |
| @node-rs/argon2 | 2.2.2 | 10-06 | 2.2.2 | **Confirmed**: prebuilt binaries for linux-x64-gnu, linux-arm64-gnu and darwin-arm64 (covers the Mac dev setup, Docker on Apple Silicon and x86 CI). In Next's server-externals list. | — | — |
| zod | 4.6.7 | 10-12 | 4.6.7 | **Confirmed.** | — | — |
| next-intl | 4.14.9 | 10-02 | 4.15.3 (4.15.0 on 11-11, too new) | **Confirmed**; peer `next ^16`. Works without a locale segment and without proxy/middleware (official "without i18n routing" guide). See F2 on Cache Components. | Low | — |
| sharp | 0.35.5 | 09-27 | 0.35.5 | **Confirmed.** See F8. | Low | — |
| exiftool-vendored | 39.2.0 | 11-07 (16 days) | 39.4.0 | **Confirmed.** Bundles ExifTool 13.61 (`exiftool-vendored.pl`); `engines.node >=22`. See F3 and F4. | Medium | — |
| @anthropic-ai/sdk | 1.11.0 | **11-19 (4 days)** | 1.12.0 (11-20) | **Wrong per the project rule.** The memlog says "1.11.0 (1.12.0 too new)", but 1.11.0 is too new as well. The last release on or before 11-09 is **1.7.0** (11-09 18:56). 1.7.0 has `output_config.format`, `effort` (incl. `medium`), the `claude-haiku-5-5` model literal, `messages.parse()` and client `timeout`/`maxRetries`. | **High** (rule breach; the memlog shows it as verified) | Pin `1.7.0` (or `1.6.0`, 11-05). Correct the memlog entry. |
| Claude model | claude-haiku-5-5, effort medium | — | current Haiku | **Confirmed**: active model, 1M context, effort `low`–`max`, **default `medium`**, structured outputs supported. See F7. | Medium (F7) | — |
| vitest | 5.1.1 | **11-18 (5 days)** | 5.1.1 | **Wrong per the rule.** 5.1.0 (11-02) qualifies. 5.1.0 requires Node `^22.12 \|\| ^24 \|\| >=26` (OK) and peer `@types/node ^22 \|\| >=24` (see F10). | **High** (rule breach) | Pin `5.1.0`. |
| @playwright/test / @axe-core/playwright | 1.65.1 / 4.14.0 | **1.65.1: 11-13 (10 days)** / 4.14.0: 10-15 | 1.65.1 / 4.14.0 | **1.65.1 wrong per the rule; axe confirmed.** 1.65.0 (11-05) qualifies, and MCR has `mcr.microsoft.com/playwright:v1.65.0-noble` (and `v1.65.1-noble`). The image tag must match the npm version exactly. | **High** (rule breach) | Pin `@playwright/test 1.65.0` and image `v1.65.0-noble`. |
| Docker Compose | v2 | — | — | Confirmed as a concept; no version pin needed. | — | — |
| GeoNames extract | build-date dump, CC BY 4.0 | — | — | Confirmed in memlog 2026-11-23 (licence, county list, file sizes). Not re-checked here. | — | — |

## Library-behaviour claims in the ADs

| AD | Claim | How checked | Result | Severity | Fix |
| --- | --- | --- | --- | --- | --- |
| AD-4 | "Next's Origin check is the CSRF guard" for Server Actions | next 16.4.6 `dist/docs` (`serverActions.md`, `data-security.md`) | **Partly confirmed.** Next compares the `Origin` host with `x-forwarded-host`/`host` and aborts on mismatch. But: "A request that carries no `Origin` header at all is **allowed through with a warning** rather than rejected." Next's docs also rely on SameSite cookies as the main defence. AD-5 does not say SameSite. | Medium | See F6. |
| AD-4 | Uploads via Route Handlers (not Server Actions) | same docs | **Confirmed fit.** The Server Actions body limit is 1 MB by default. Route Handlers have no such limit, unless a `proxy.ts` exists, which buffers bodies only up to 10 MB (`experimental.proxyClientMaxBodySize`). | Low | See F11. |
| AD-7 | Access tests via the Playwright request API, no browser | playwright 1.65.0 `types/test.d.ts` (`request: APIRequestContext` fixture) | **Confirmed.** Caveat: the request API sends no `Origin` header, and Server Actions are not plain HTTP endpoints (they need Next's internal action ID). | Low | See F6 and F12. |
| Conventions | IDs from Postgres `uuidv7()` | PG 18 docs, functions-uuid | **Confirmed** (built in since 18). Drizzle 0.45.4 has only `uuid().defaultRandom()` (= `gen_random_uuid()`, v4). | Low | Write `uuid('id').primaryKey().default(sql\`uuidv7()\`)`; do not use `defaultRandom()`. |
| AD-9 | Partial unique index on `file_versions.hash` where not null | drizzle-orm 0.45.4 `pg-core/indexes.d.ts` (`where(condition: SQL)`) | **Confirmed.** | — | — |
| AD-10 | Worker claims with `FOR UPDATE SKIP LOCKED` | drizzle-orm 0.45.4 `select.d.ts` (`for(strength, { skipLocked: true })`) | **Confirmed.** | — | — |
| AD-16 | Insert with on-conflict-do-nothing against the partial unique index | drizzle-orm 0.45.4 `insert.js` | **Confirmed.** `onConflictDoNothing({ target, where })` emits `on conflict (cols) where <pred> do nothing`, which is the form Postgres needs to infer a partial index. | Low | Note that the `where` must repeat the index predicate (`revoked_at is null`). |
| AD-14 | sharp re-encodes and keeps no metadata except ICC | sharp 0.35.5 `lib/index.d.ts` | **Confirmed.** By default sharp strips everything and converts to sRGB. `keepIccProfile()` exists (`withIccProfile()` is the transform-and-attach variant). | Low | See F8 (orientation). |
| AD-14/15, deploy | ExifTool needs Perl in the app image | exiftool-vendored 39.2.0 (`ExifToolOptions.d.ts`: assumes a valid perl), exiftool-vendored.pl `#!/usr/bin/env perl`, Debian trixie `perl-base` file list | **Confirmed, and narrower than stated.** See F3. | Medium | See F3. |
| AD-20 | Claude adapter uses `output_config.format`, 30 s timeout, "no auto-retry beyond the SDK's own" | @anthropic-ai/sdk 1.7.0 types, claude-api reference | **Confirmed APIs; semantics clash.** See F7. | Medium | See F7. |
| AD-1 | Designsystemet React with Next 16 / React 19.3 | `@digdir/designsystemet-react@1.24.0` package.json and dist | **Confirmed compatible.** See F9. | Low | See F9. |
| Text | next-intl, no locale segment in URLs | next-intl.dev "without i18n routing" | **Confirmed**: needs only `createNextIntlPlugin`, `src/i18n/request.ts` with a fixed locale and `NextIntlClientProvider`. No proxy needed. | — | — |
| Deferred | Vercel 4.5 MB body limit | memlog 2026-11-20 | Verified earlier; not re-checked (deferred, no impact on v1). | — | — |

## Findings

### F1. Three pins break the two-week rule (High)

`@anthropic-ai/sdk 1.11.0` (11-19), `vitest 5.1.1` (11-18) and `@playwright/test 1.65.1` (11-13) were all published after the 2026-11-09 cut-off. The memlog's "npm 2026-11-23 with 2-week rule" entry checked exiftool-vendored, next-intl and the SDK against their *newer* releases, but not the SDK pin itself. The 11-20 entry recorded vitest and Playwright and was never re-checked against the rule.

**Fix:** pin `@anthropic-ai/sdk 1.7.0`, `vitest 5.1.0`, `@playwright/test 1.65.0` with the `mcr.microsoft.com/playwright:v1.65.0-noble` image. Add a memlog `(version)` correction. Since process counts 30 %, mention it in the session log as a corrected own error.

### F2. create-next-app 16.4.6 live defaults are not what the spine assumes (High)

The defaults in the 16.4.6 source (the "recommended defaults" object) are: `typescript: true`, `linter: "eslint"`, **`tailwind: true`**, `app: true`, **`srcDir: false`**, `importAlias: "@/*"`, `reactCompiler: false`, **`cacheComponents: true`** (which also writes `partialPrefetching: true`), **`agentsMd: true`** (writes `AGENTS.md`), and in recommended mode **`experimental.agentFeedback: true`**. The bundler is Turbopack (`--webpack` only on request). It writes `@types/node: "^20"` and `react: "19.3.0"`.

The spine says only "TypeScript, App Router, `src/`, no Tailwind", so two of the four stated choices are opposite to the defaults. Two more architectural defaults are not mentioned at all:

- **Cache Components on by default.** Data fetching is dynamic by default, and uncached runtime data (`cookies()`, DB reads) must sit behind `<Suspense>` or the build or dev run errors. `use cache` caches across requests, which is dangerous next to AD-5 and AD-6 (per-session, per-client data). Two of the five recent Next advisories are in exactly this feature: GHSA-673q-mjm6-r5xr (critical RCE in `use cache`, fixed in 16.4.1) and GHSA-rhh4-g77r-r9qj (cross-user cache disclosure, fixed in 16.4.5). next-intl's locale lookup also has known friction with Cache Components (community demo; next-intl issue #1493).
- **AGENTS.md** is generated, and per its own text `next dev` re-adds the block. The repo's agent rules live in `CLAUDE.md`.

**Fix:** put the exact scaffold command into the spine's Stack or Structural Seed, e.g.

`npx create-next-app@16.4.6 <dir> --ts --app --src-dir --no-tailwind --eslint --no-react-compiler --no-cache-components --no-agent-feedback --import-alias "@/*" --use-npm`

Then decide AGENTS.md explicitly: keep it and reference it from CLAUDE.md, or drop it with `--no-agents-md` and accept that `next dev` may write it back. Also add a rule: **no `use cache` in any code path that reads sessions or the access module** (or record Cache Components as rejected for v1, which is simpler). This is a technology choice, so it needs a D-xxx entry.

### F3. "Perl in the image" needs the full `perl` package, not just slim's `perl-base` (Medium)

Debian slim images (node:26-slim is **trixie**, not bookworm) include `perl-base`, so `/usr/bin/perl` exists. The memlog's worry that "slim may lack perl" is therefore half right. But `perl-base` lacks `Encode`, `Digest::MD5`, `Time::Local` and `Compress::Zlib`. ExifTool 13.61 loads them with `eval { require … }` and **silently degrades** without them:

- `IPTC.pm:1073` skips the IPTCDigest update without Digest::MD5.
- The UTF-8 checks in `Writer.pl` and `ExifTool.pm` need Encode, which matters for Norwegian æøå in IIM (D-028).
- The date and time-zone conversions need Time::Local.

Nothing will error. The client and staff copies will just be subtly wrong.

**Fix:** in the Dockerfile, `apt-get install -y --no-install-recommends perl`. Add a foundation-story smoke test: write an IIM caption with æøå, read it back, and check that IPTCDigest matches. Name the base image (`node:26.13.1-trixie-slim`) in the Stack.

### F4. exiftool-vendored must be excluded from the Next server bundle (Medium, unverified at runtime)

Next 16.4.6 auto-externalises `sharp`, `pg` and `@node-rs/argon2` (`dist/lib/server-external-packages.jsonc`), but **not** `exiftool-vendored`. The package finds its binary with a computed dynamic `import("exiftool-vendored." + (win ? "exe" : "pl"))` and checks the resulting path with `existsSync`, which bundlers cannot resolve. Under Turbopack or `output: 'standalone'`, that likely fails with "Failed to find exiftool".

**Fix:** set `serverExternalPackages: ['exiftool-vendored']` in `next.config.ts`. If standalone output is used, also add `outputFileTracingIncludes` for `node_modules/exiftool-vendored.pl/**`. Alternatively, install Debian `libimage-exiftool-perl` and pass `exiftoolPath`. Verify this in the foundation story.

### F5. postgres:18 moved its data directory (Medium)

From PostgreSQL 18, the official image uses `PGDATA=/var/lib/postgresql/18/docker` and `VOLUME /var/lib/postgresql` (docker-library postgres README). The usual Compose line `- db:/var/lib/postgresql/data`, which an agent will write from training data, is wrong for 18. Also, `postgres:latest` is now 19.

**Fix:** in the Deployment section, specify `image: postgres:18.7` and mount the volume at `/var/lib/postgresql`.

### F6. CSRF: missing Origin is allowed; cookie SameSite is unstated (Medium)

Next 16.4.6 docs say Server Actions with **no** `Origin` header are allowed through with a warning. Next relies on SameSite cookies as the primary guard. AD-5 specifies "random token in an httpOnly cookie stored hashed" but no `SameSite` or `Secure` attributes. AD-4 says Route Handlers "check `Origin` themselves", but not what happens when it is missing. Playwright's request API (AD-7) sends no `Origin` by default.

**Fix:**
- AD-5: the session cookie is `HttpOnly; SameSite=Lax; Path=/` and `Secure` outside localhost.
- AD-4: Route Handlers **reject** state-changing requests with a missing or foreign `Origin`.
- AD-7: the HTTP test client sets `extraHTTPHeaders: { Origin: baseURL }`, plus one negative test without it.
- Note `serverActions.allowedOrigins` for the later reverse-proxy host (RG-1).

### F7. AI timeout and retry semantics (Medium)

TS SDK: `timeout` is in **milliseconds**, `maxRetries` defaults to **2**, and timeouts are retried. So "provider timeout 30 s" together with "no auto-retry beyond the SDK's own" gives up to about 90 s wall-clock per generation, which conflicts with the NFR-4 intent.

Haiku 5.5 runs adaptive thinking by default and its effort default is already `medium`. It can return `stop_reason: "refusal"` with no server-side fallback. AD-20's four error categories (auth, rate limit, timeout, invalid output) have no slot for a refusal.

SDK 1.x sends API version `2026-10-21`, which rejects `temperature`, `top_p` and `top_k`. The pilot used the Python SDK, so the TS adapter's request shape is untested.

**Fix:**
- AD-20: `new Anthropic({ timeout: 30_000, maxRetries: <0 or 1> })` and state whether 30 s is per attempt or total.
- Set `output_config: { effort: 'medium', format: … }` explicitly.
- Map `refusal` to "invalid output" (or add a fifth category).
- Never send sampling parameters.

### F8. sharp: add auto-orientation before stripping (Low)

Confirmed that sharp 0.35.5 strips all metadata by default and has `keepIccProfile()`. But stripping also drops EXIF `Orientation`. Without `.autoOrient()` (or `.rotate()` with no args) before resizing, portrait camera JPEGs come out sideways in thumbnails, previews and the AI input.

**Fix:** AD-14 should say: `sharp(src).autoOrient().resize(…).keepIccProfile()`.

### F9. Designsystemet React is wholly `'use client'`; the theme comes from the CLI (Low)

`dist/esm/index.js` starts with `'use client'`, and so do about 300 files. All DS components are client components. They can be used from Server Components with serializable props, but event handlers need a small `'use client'` wrapper. This fits AD-4 (forms post to Server Actions, which are serializable).

`@digdir/designsystemet-theme` is deprecated ("Use themebuilder…"; last release 1.11.0). The Graphite theme in DESIGN.md is generated with the `@digdir/designsystemet` CLI (1.24.0, 11-09).

**Fix:** optionally add `@digdir/designsystemet` (CLI) 1.24.0 to the Stack, and one line that DS components are client components.

### F10. `@types/node` from the starter conflicts with vitest 5 (Low)

The starter writes `@types/node: "^20"`. vitest 5.1.0 declares peer `@types/node ^22 || >=24`. The runtime is Node 26.

**Fix:** set `@types/node` to `26.x` (latest 26.6.6) after scaffolding.

### F11. Keep any future `proxy.ts` away from the upload route (Low)

Next 16 renamed `middleware` to `proxy`. When a proxy exists, Next buffers request bodies only up to 10 MB by default, and anything above that is cut off with a warning. v1 needs no proxy (next-intl without routing, auth in modules). If one is added later (auth redirects, locale routing), large uploads will be truncated.

**Fix:** one line under AD-4: no `proxy.ts` in v1, and if one is added, its matcher must exclude the upload Route Handler.

### F12. Server Actions cannot be driven by the Playwright request API (Low, fit)

AD-7's HTTP matrix targets GET surfaces (page, preview, download, lists, counts), which is fine. Checkout and other Server-Action mutations are not plain HTTP endpoints, because they need Next's internal action ID.

**Fix:** AD-7 should say that S-rules exercised through Server Actions are tested via a browser page in the same Playwright run, or at module level. Downloads and free first downloads are Route Handlers and stay HTTP-testable.

## Confirmed without remarks

- Node 26 Active LTS.
- next 16.4.6 has no open advisories.
- react 19.3.1.
- Designsystemet 1.24.0 is compatible with React 19 and Next 16.
- PostgreSQL 18.7 with `uuidv7()`.
- Drizzle partial unique index, `FOR UPDATE SKIP LOCKED`, and `onConflictDoNothing` with a partial-index `where`.
- pg, argon2 prebuilds, zod, next-intl without a locale segment.
- sharp's default stripping and `keepIccProfile`.
- exiftool-vendored 39.2.0 (Node ≥ 22).
- `claude-haiku-5-5` with effort `medium` and `output_config.format` (in SDK 1.7.0 types).
- Playwright `request` fixture; MCR image tags exist; @axe-core/playwright 4.14.0.
- No GitHub advisories against the pinned versions of next, react-dom, sharp, drizzle-orm, next-intl, @anthropic-ai/sdk, exiftool-vendored, pg or zod.

## Not verified

- Runtime behaviour inside the Docker image (F3 and F4). The daemon was not running, so these are inferred from package source and Debian file lists.
- next-intl issue #1493 status (Cache Components). This becomes moot if `--no-cache-components` is chosen.
