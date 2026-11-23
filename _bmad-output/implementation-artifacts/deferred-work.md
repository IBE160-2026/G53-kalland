- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-staff-and-contacts-log-in-and-out.md`
  summary: Demo users with a published password are seeded whenever `SEED_ON_START` is unset, because it defaults to `true` in docker-compose.yml and .env.example.
  evidence: Set in story 1.1; a deployment that forgets `SEED_ON_START=false` gets public staff logins. Settle with a production guard or a `false` default outside dev/test, if the app is ever deployed.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-staff-and-client-shells-in-the-graphite-theme.md`
  summary: Add a CI check that regenerates the Graphite theme from `designsystemet.config.json` and fails when it differs from the committed `src/styles/theme/graphite.css`.
  evidence: `ci.yml` never runs `theme:build`; editing an override without regenerating keeps `theme.test.ts` and CI green while config and CSS disagree. Needs a decision on running the CLI in CI (host Node or the unit container, which has no git).
- source_spec: `_bmad-output/implementation-artifacts/spec-1-5-uploaded-images-get-ai-metadata-from-the-mock-provider.md`
  summary: Test that the Upload page shows a stored `queued` or `generating` row as Failed after a reload (`fromStored` in `upload-workspace.tsx`).
  evidence: Review finding 21 (verification gap): no test reaches those states on reload, so mapping them to Ready would pass. Reaching them needs DB state inside an e2e test or an exported `fromStored`; settle when the worker (Story 3.11) makes these states reachable and live state (3.1) replaces the mapping.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-6-staff-publish-an-image-with-its-visibility-and-price.md`
  summary: Unsaved-changes dialog in the Library Details panel (UX-DR-20) when leaving edit mode with changed fields.
  evidence: User decision 2026-11-23 to defer it to Story 3.4, where metadata fields join edit mode.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-6-staff-publish-an-image-with-its-visibility-and-price.md`
  summary: E2E test that a stale Save changes in the Library panel shows the failed-save message, keeps edit mode and values, and that a second Save succeeds.
  evidence: Review finding 26: the panel's error branch (`router.refresh()` on `errors.saveFailed`) never runs in tests; it needs two pages editing one image, which the suite does not have yet.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-6-staff-publish-an-image-with-its-visibility-and-price.md`
  summary: Make the Vitest suite immune to `failInterruptedGenerations` sweeping another test file's freshly `queued` upload (seen in 1.6: `generation.test.ts` "fails every image while MOCK_FAIL=true" got `interrupted`).
  evidence: Story 1.5's "Known risk (not fixed)" fired in the 1.6 full run on 2026-11-23. `instrumentation.test.ts` and the restart test in `generation.test.ts` sweep every `queued` row of the shared test database while other files upload in parallel. Fix options: run the sweep tests in their own Vitest project/sequence, or scope the sweep in tests.
