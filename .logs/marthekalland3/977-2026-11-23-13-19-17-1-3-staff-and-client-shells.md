# 1.3 staff and client shells

## 2026-11-23 kl. 13:19 — marthekalland3

### Task
Build story 1.3 with `/bmad-build`: the Graphite theme, a staff and a client shell (top bar, nav tabs, header search, account menu, Context sidebar with a ≤ 900 px drawer), restyled Login and 403, empty states and axe scans.

### Plan
- Spec: [spec-1-3-staff-and-client-shells-in-the-graphite-theme.md](../../_bmad-output/implementation-artifacts/spec-1-3-staff-and-client-shells-in-the-graphite-theme.md) (status `done`; Decisions and Review Triage Log inside).
- Investigated the Designsystemet 1.24.0 tarballs and ran the CLI in the scratchpad: the config takes flat `colors`; status colours go in `overrides.severity`; per-token `overrides.colors` are needed to reproduce DESIGN.md's values.
- User answered four questions: tabs (AC + Overview), Library sidebar placeholder, empty-state copy, keep one ~3,100-token spec.
- Implementation by a subagent from the spec; my own diff check, test run and matrix audit; three reviewers; fixes sent back to the implementer; verified again.

### Result
- Commits on `story/1.3-staff-and-client-shells-in-the-graphite-theme`, PR #54 (open): `9181850` theme, `a8ca840` shells, `ad4e83f` e2e tests, `68a5204` spec/DESIGN.md/README/sprint status/deferred work.
- New deps: `@digdir/designsystemet-react`/`-css` 1.24.0, dev `@digdir/designsystemet` 1.24.0 and `@axe-core/playwright` 4.14.0; `npm run theme:build`.
- Review: 9 patches (drawer state surviving navigation → scroll lock; axe list missing Upload/Find images; scans not asserting the page; cross-role 403 tests; skip link test; resize test; dead first-name fallback; unused CSS tokens; DESIGN.md sample). The drawer-navigation test was confirmed to fail without its fix.
- README test command: exit 0, Vitest 111/111, Playwright 45/45; lint and typecheck clean; `theme:build` regenerates byte-identical CSS.
- Closes the 2026-11-18 open item about building the Graphite theme.

### Open items
- Check the shells by hand in a browser at 1440 px and 360 px as Ida and as Jonas (story 1.3 manual check).
- Add a CI check that the committed theme CSS matches `designsystemet.config.json` (deferred in `deferred-work.md`).
- Decide whether `designsystemet.config.json` may stay in the repo root (CLAUDE.md: no loose files in the root).
