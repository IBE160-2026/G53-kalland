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
- source_spec: `_bmad-output/implementation-artifacts/spec-1-7-the-examiner-starts-with-a-sample-library.md`
  summary: Restore test coverage of the Library page's empty state (the `total === 0` branch, the sidebar text "Filters appear when the library has images." and its axe scan), lost when the e2e database became always seeded in Story 1.7.
  evidence: `tests/e2e/empty-library.spec.ts` was deleted; `src/app/_components/shell/empty-state.test.ts` renders only `EmptyState` with its own props, so removing or inverting the branch in `src/app/(staff)/library/page.tsx` passes every test. The user accepted the gap on 2026-11-23. Possible fixes: an app-test instance with `SEED_ON_START=false`, or a reachable empty/no-results state in e2e (Story 4.1 filters).
- source_spec: `_bmad-output/implementation-artifacts/spec-1-8-a-contact-finds-the-images-their-client-may-see.md`
  summary: Test the shared wall pagination (`WallPagination` in `src/app/_components/wall/wall.tsx`), used by the Library and Find images, with a page count above 1.
  evidence: Review finding 14. No test renders a wall with more than 48 images (22 seed images in e2e). A broken `hrefFor` call, Next link or `wall.*` key would ship unnoticed. The cheap fix is a static render test of `Wall` with a stub `hrefFor`, in the style of `empty-state.test.ts`.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-8-a-contact-finds-the-images-their-client-may-see.md`
  summary: Cover the Find images page's empty branch (`list.total === 0` → `EmptyState`) for a contact whose client may see nothing.
  evidence: Review finding 15. `empty-state.test.ts` renders only the component, and every test DB holds public images, so inverting the branch passes every test. This is the same class as the 1.7 Library empty-state gap. Fix options: a page-level test with `listClientImages` stubbed, or an app-test instance without the sample library.
- source_spec: `_bmad-output/implementation-artifacts/spec-2-1-staff-create-and-manage-clients.md`
  summary: Going Back to Add client after a create may reuse the form nonce, so a second client is silently dropped and staff land on the first one.
  evidence: maybe-false (would be medium). The nonce is rendered by `/clients/new/page.tsx`; if Next's back/forward router cache replays that payload, `createClientAsStaff` returns the earlier client's id. Settle with an e2e test: create a client, press Back, fill a different client, save, and check two clients exist.
- source_spec: `_bmad-output/implementation-artifacts/spec-2-1-staff-create-and-manage-clients.md`
  summary: `accounts.createClient` is exported with no Actor or role check and now accepts org number, billing email and account manager without the mod-11 and active-staff checks.
  evidence: Pre-existing seed/factory function widened in 2.1. Story 2.4's guard test ("every exported module write function with a contact Actor expecting Forbidden") must either exempt it as seed/test-only or move it out of the public API.
- source_spec: `_bmad-output/implementation-artifacts/spec-2-3-contacts-set-their-password-from-a-setup-link.md`
  summary: Check that Next's request log never prints `/setup/<token>` paths (`logging.incomingRequests.ignore` in `next.config.ts`).
  evidence: Review finding 5 (verification gap). Deleting the `logging` entry or breaking its regex passes every test; the "never reach the log" unit test mocks only the app logger. Settle with an e2e step that opens a setup link and greps the `app-test` output for `/setup/`.
