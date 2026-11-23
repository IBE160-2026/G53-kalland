- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-staff-and-contacts-log-in-and-out.md`
  summary: Demo users with a published password are seeded whenever `SEED_ON_START` is unset, because it defaults to `true` in docker-compose.yml and .env.example.
  evidence: Set in story 1.1; a deployment that forgets `SEED_ON_START=false` gets public staff logins. Settle with a production guard or a `false` default outside dev/test, if the app is ever deployed.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-staff-and-client-shells-in-the-graphite-theme.md`
  summary: Add a CI check that regenerates the Graphite theme from `designsystemet.config.json` and fails when it differs from the committed `src/styles/theme/graphite.css`.
  evidence: `ci.yml` never runs `theme:build`; editing an override without regenerating keeps `theme.test.ts` and CI green while config and CSS disagree. Needs a decision on running the CLI in CI (host Node or the unit container, which has no git).
- source_spec: `_bmad-output/implementation-artifacts/spec-1-5-uploaded-images-get-ai-metadata-from-the-mock-provider.md`
  summary: Test that the Upload page shows a stored `queued` or `generating` row as Failed after a reload (`fromStored` in `upload-workspace.tsx`).
  evidence: Review finding 21 (verification gap): no test reaches those states on reload, so mapping them to Ready would pass. Reaching them needs DB state inside an e2e test or an exported `fromStored`; settle when the worker (Story 3.11) makes these states reachable and live state (3.1) replaces the mapping.
