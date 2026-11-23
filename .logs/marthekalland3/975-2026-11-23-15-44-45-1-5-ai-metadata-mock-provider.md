# 1.5 AI metadata from the mock provider

## 2026-11-23 kl. 15:44 — marthekalland3

### Task
Build Story 1.5 with `/bmad-build`: every uploaded image gets title, description, alt text and keywords from an AI provider port, with the mock as default, so the app runs without an API key.

### Plan
- Spec: [spec-1-5-uploaded-images-get-ai-metadata-from-the-mock-provider.md](../../_bmad-output/implementation-artifacts/spec-1-5-uploaded-images-get-ai-metadata-from-the-mock-provider.md). Two user decisions: a Failed row shows the tag only (message in 3.2); the ~2,800-token spec stays one spec.
- Implementation by a fresh subagent from the spec; three review layers (blind, edge case, verification gap) on the diff; patches back to the same subagent.

### Result
- ai module: port, prompt + schema v3, provider registry (`mock`), `metadata_generations` (migration `0004_ai.sql`). Media makes the AI input in memory (1568 px sRGB JPEG, no metadata). `images.generateMetadata` runs inline after upload (claim → generate → save); startup fails `queued`/expired `generating` images as "interrupted". Upload page gains the Failed tag.
- Review: 30 findings; 11 patched (DB clock for the lease sweep, control-character-only AI text, prompt fencing of embedded metadata, `MOCK_FAIL` pinned in the test env, README `claude` wording, `Object.hasOwn` lookups, keyword insert conflict, two new tests), 1 deferred, 18 rejected. Log in the spec.
- Verified: 205 Vitest + 62 Playwright pass; lint, typecheck clean; `db:generate` no changes.
- Commits `d0507d0` (code) and `818add0` (spec, README, sprint status); PR #57.

### Open items
- Manual browser check as Ida with `docker compose up --build`: placeholder title on a JPEG, `fail-x.jpg` ends Failed.
- Rare test flake risk: the restart sweep test can fail another test file's freshly `queued` upload when Vitest files run in parallel.
- Test that a reloaded `queued`/`generating` row shows Failed (deferred-work.md, with 3.1/3.11).
