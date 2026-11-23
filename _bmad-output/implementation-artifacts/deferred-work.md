- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-staff-and-contacts-log-in-and-out.md`
  summary: Demo users with a published password are seeded whenever `SEED_ON_START` is unset, because it defaults to `true` in docker-compose.yml and .env.example.
  evidence: Set in story 1.1; a deployment that forgets `SEED_ON_START=false` gets public staff logins. Settle with a production guard or a `false` default outside dev/test, if the app is ever deployed.
