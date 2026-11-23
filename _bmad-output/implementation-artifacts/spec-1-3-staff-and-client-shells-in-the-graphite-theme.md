---
title: 'Story 1.3: Staff and client shells in the Graphite theme'
type: 'feature'
created: '2026-11-23'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '958769b11e9114556dc3df1cd26cebc2739c9ecf'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-g53-kalland-2026-11-18/DESIGN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Pages are unstyled semantic HTML with an inline Log out button. Staff and contacts have no top bar, navigation, theme or responsive layout, and every later UI story needs these to build on.

**Approach:** Generate the Graphite theme with the Designsystemet 1.24.0 CLI from `designsystemet.config.json` and load it with Designsystemet CSS/React and Instrument Sans (`next/font`). Add a staff shell and a client shell as route-group layouts (top bar, nav tabs, header search, account menu, Context sidebar with a ≤ 900 px drawer). Restyle Login and 403, give both landing pages empty states, and add axe scans.

## Boundaries & Constraints

**Always:** Story ACs in `epics.md` § Story 1.3 are the contract; DESIGN.md wins over the mocks. Every UI string goes in `messages/en.json`. Pages stay Server Components and call their guard first. Layouts only display: they may call the guard to read the user, but never replace the page's own guard. Designsystemet components are client components, so they receive plain data only. Light only: `data-color-scheme="light"` on `<html>`. New deps pinned exactly: `@digdir/designsystemet-react` and `@digdir/designsystemet-css` 1.24.0; dev `@digdir/designsystemet` (CLI) 1.24.0 and `@axe-core/playwright` 4.14.0.

**Never:** No real search, filters, upload, images or cart (later stories). Header search submits only as a GET to its surface. No Settings/Action log menu items, no Unsaved-changes dialog, no Details panel, no Not found page. No Tailwind, no other icon library (inline SVG from the mockup's symbols), no runtime font or CDN requests, no dark mode. Do not hand-edit the generated theme CSS.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Staff page | Ida on `/library` | top bar: toggle, "CRM-DAM" wordmark, tabs, search "Search title, description, keywords and places", avatar + "Ida"; Library tab `aria-current="page"` | N/A |
| Contact page | Jonas on `/overview` | top bar: "Fjordkaffe AS" over "Image portal", tabs, search "Search images", avatar + "Jonas"; Overview tab `aria-current="page"`; no sidebar toggle (Overview has no sidebar) | N/A |
| Log out | account menu → Log out | session ended, Login shown | N/A |
| Drawer open | ≤ 900 px, toggle clicked | drawer over scrim, focus in drawer, toggle shows × on top, `aria-expanded="true"`, body scroll locked | N/A |
| Drawer close | Escape, ×, or scrim click | drawer closed, focus on toggle, `aria-expanded="false"`, scroll restored | N/A |
| Wide sidebar | > 900 px | sidebar open by default as a column; toggle hides/shows it in place | N/A |
| Narrow | 360 px | no horizontal scroll; nav and search on their own rows; first name visually hidden (≤ 560 px) | N/A |
| Search submit | staff types "boat" | GET `/library?q=boat` (client: `/find-images?q=…`); no result filtering yet | N/A |

**Decisions (user, 2026-11-23):**
- Tabs: staff **Library, Upload**; contacts **Overview, Find images**. Overview is added beyond the AC's list so the contact landing page has a current tab (EXPERIENCE.md IA). `/upload` and `/find-images` ship now as guarded placeholder pages with an empty state; 1.4 and 1.8 replace them.
- Library sidebar before filters exist: a "Filters" heading (sidebar-heading style) and one muted line, "Filters appear when the library has images." It is removed when real filters arrive. Upload and Find images placeholders have no sidebar.
- Empty-state copy: Library "The library has no images yet." + text action "Upload images" (→ `/upload`). Overview "The agency has not shared any images with you yet." (no action). Placeholders (agent's wording, same rule): Upload "Uploading images comes in a later version." Find images "There are no images to show yet."
- Spec size: about 3,100 tokens, kept as one spec because theme, shells, drawer and axe scans depend on each other.

</frozen-after-approval>

## Code Map

- `src/app/layout.tsx` -- root: add `next/font/google` Instrument Sans (weights 400–700, `variable`), DS CSS + theme CSS + `src/app/globals.css` imports, `data-color-scheme="light"`, `NextIntlClientProvider` stays.
- `src/app/(staff)/library/page.tsx`, `src/app/(client)/overview/page.tsx` -- placeholders with an inline `LogoutButton`; become empty-state pages (h1 visually hidden on Library per DESIGN.md; visible "Overview" h1). Keep `requireStaff()`/`requireContact()` first.
- `src/app/_components/logout-button.tsx`, `actions.ts` -- `logOut` server action reused from the account menu (form action inside a DS Dropdown item). Delete `logout-button.tsx` if unused afterwards.
- `src/app/forbidden.tsx`, `src/app/login/{page,login-form}.tsx` -- restyle as a centred card on `canvas` with DS `Heading`/`Paragraph`/`Field`/`Input`/`Button`/`Alert`/`Link`, no nav. Keep the labels "Email", "Password", "Log in", and keep errors as `role="alert"` inside `main` (e2e relies on them).
- `src/modules/accounts/{clients,index}.ts` -- add a read `getClient(clientId)` → `{ id, name, status }` for the client shell; `getUser` already exists.
- `tests/e2e/auth.spec.ts` -- the "Log out" button now sits in the account menu: open the menu first. The headings "Library"/"Overview" stay (Library h1 visually hidden but still in the accessibility tree).
- `Dockerfile` e2e stage -- copies `node_modules` from `deps`, so `@axe-core/playwright` arrives through `package.json`.
- Mockup source for markup and icons: `_bmad-output/planning-artifacts/ux-designs/ux-g53-kalland-2026-11-18/mockups/key-screens.html` (`<symbol id="i-panel">`, `i-close`, top bar CSS; DS `Search` brings its own icon). Copy only the shell parts.
- Designsystemet 1.24 facts (verified in the tarballs): the CLI config takes a **flat** `colors` map (`accent`, `brand1`, `neutral`). DESIGN.md's nested `main`/`support` shape is pre-1.24 and is migrated by the CLI's `flatten-color-categories`. Status colours go in `overrides.severity`; each DESIGN.md role value goes in `overrides.colors.<color>.<token>.light` (for example `accent.base-hover`, `neutral.text-default`, `danger.text-subtle`) and `overrides.focus`. Without these overrides 1.24 generates different values (accent-hover `#36393e`, text `#2a2c2e`). `npx designsystemet --config designsystemet.config.json` with `output: [{type:"css", dir:…}]` writes `<theme>.css`. React: `Dropdown` (+`Dropdown.Trigger`/`List`/`Item`/`Button`), `Avatar`, `Search`, `SkipLink`, `Button`, `Link`; the package is `'use client'`. CSS entry: `@digdir/designsystemet-css` (components); the theme file comes from our generation.

## Tasks & Acceptance

**Execution:**
- [x] `package.json`, `package-lock.json` -- add the four deps above; script `theme:build` = `designsystemet --config designsystemet.config.json -y`
- [x] `designsystemet.config.json`, `src/styles/theme/graphite.css` (generated, committed) -- flat colours, severity overrides, a per-role override for every DESIGN.md Colors-table row, focus override, `borderRadius: 3`, font "Instrument Sans" -- UX-DR-1
- [x] `src/app/globals.css` -- product tokens (`--price`, layout spacing, radii), `font-variant-numeric: tabular-nums`, body on `canvas`, underlined tertiary text actions, `:focus-visible`-only ring, the three breakpoints, `.visually-hidden`, reduced motion -- UX-DR-2/3/45/49/50
- [x] `src/app/layout.tsx` -- per the Code Map
- [x] `src/app/_components/shell/` -- `top-bar.tsx` (server: reads data, passes plain props), `main-nav.tsx` (client, `usePathname` → `aria-current`), `header-search.tsx` (GET form, DS Search), `account-menu.tsx` (Avatar + first name, Dropdown with Log out), `sidebar.tsx` (client context: open state, toggle, column/drawer, scrim, focus, Escape, scroll lock), `nav.ts` (one tab list per role), `icons.tsx` -- UX-DR-6/7/8
- [x] `src/app/(staff)/layout.tsx`, `src/app/(client)/layout.tsx` -- guard for display data, `SkipLink` to `#main`, top bar, workspace with the optional sidebar slot
- [x] landing pages, `src/app/(staff)/upload/page.tsx`, `src/app/(client)/find-images/page.tsx`, `forbidden.tsx`, Login -- per the Code Map and the Decisions
- [x] `src/modules/accounts/` -- `getClient` + test
- [x] `messages/en.json` -- shell, nav, search, sidebar, empty-state strings -- NFR-8, UX-DR-5
- [x] `src/styles/theme/theme.test.ts` -- parses the generated CSS and asserts every DESIGN.md role hex on its `--ds-*` variable (light block), plus `--ds-border-radius-base: 0.1875rem` -- UX-DR-1/4
- [x] `tests/e2e/shell.spec.ts` -- matrix rows; widths 1440/1240/900/560/360 with `scrollWidth ≤ clientWidth`; focus ring only after keyboard focus; `tests/e2e/a11y.spec.ts` -- one `SCAN_LIST` (Login, 403, Library, Overview) via `@axe-core/playwright`, no serious/critical violations; update `auth.spec.ts`
- [x] `_bmad-output/planning-artifacts/ux-designs/ux-g53-kalland-2026-11-18/DESIGN.md` -- replace the config block with the real 1.24 config (point to the repo file); "CSS 1.23" → 1.24
- [x] `README.md` -- `npm run theme:build`, and the test counts

**Acceptance Criteria:**
- Given the README test command, then all Vitest and Playwright tests pass, including the theme-mapping test, shell e2e and axe scans.
- Given `npm run lint` and `npm run typecheck`, then both are clean.
- Given `docker compose up --build`, when Ida and then Jonas log in at 1440 px and at 360 px in a browser, then the shells match DESIGN.md and the mockup's top bar.

## Implementation Notes

- Account menu trigger: a DS `Button` with `popoverTarget` instead of `Dropdown.TriggerContext`/`Dropdown.Trigger`, which 1.24 marks deprecated ("use a Button with popovertarget"). `Search` is also deprecated in 1.24 but kept, as the spec names it.
- Shell parts live in `src/app/_components/shell/`; `shell.tsx` adds `Shell` (skip link, provider, top bar, workspace), `PageMain` (`<main id="main">`) and `EmptyState`, shared by the two route-group layouts and the pages.
- The sidebar toggle's name comes from the page's `<ContextSidebar toggleLabel>` ("Show or hide filters" on Library, as in the mockup). The toggle renders only after the sidebar registers, so it appears on hydration; CSS hides the column at ≤ 900 px before then.
- The generic focus ring in `globals.css` applies only to elements without a `ds-` class; Designsystemet components keep their own ring.
- `session.signedInAs` and `logout-button.tsx` were removed: the account menu replaces both.

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Evidence | Route |
|---|-------|---------|---------|----------|-------|
| 1 | blind, edge-case (×2) | Drawer state survives navigation to a page without a sidebar: scroll stays locked, Escape handler live, no toggle | medium | `SidebarProvider` lives in the persistent route-group layout; the `register` cleanup only clears `toggleLabel`, so `drawerOpen` stays true after Tab → Upload tab → Enter at ≤ 900 px | patch |
| 2 | blind, edge-case | Drawer has no focus trap / inert background | low | Real, but neither the AC nor EXPERIENCE.md asks for a trap (only dialogs trap); with #1 fixed, leaving via Tab is harmless; fix adds inert/trap machinery | reject |
| 3 | blind, verification-gap | `/upload` and `/find-images` missing from the axe `SCAN_LIST` | medium | The list's own rule says every built page goes on it; pre-verified gap | patch |
| 4 | blind | Axe scans never assert which page they scanned | low | A redirect would scan the wrong page and pass; direct fix: assert the h1 before `analyze()` | patch |
| 5 | blind | No cross-role test for the new guarded routes `/upload`, `/find-images` | medium | grep: no 403 test hits either route; CLAUDE.md puts access tests first | patch |
| 6 | blind | `getClient` takes no Actor or tenant | low | Same shape as the existing `getUser`; the only caller passes `actor.clientId`; single tenant; fix adds public surface | reject |
| 7 | blind | `theme.test.ts` claims to make DESIGN.md executable but holds a hand copy | low | Comment overclaims; direct correction: say it is a copy of DESIGN.md's table | patch |
| 8 | blind, verification-gap | Nothing in CI checks the committed CSS against the config | medium | `ci.yml` never runs `theme:build`; needs a CI step / decision on running the CLI in a container | defer |
| 9 | blind | `next/font/google` needs network at build | false | AD-23/spine: "Only building images needs the network"; the font is self-hosted at runtime | reject |
| 10 | blind, edge-case | Sidebar toggle appears only after hydration (layout shift; no toggle without JS) | low | Recorded in Implementation Notes; fix needs server knowledge of the page's sidebar (new plumbing) | reject |
| 11 | blind | Account trigger's accessible name is only the first name | low | Matches EXPERIENCE.md (avatar + first name); popovertarget exposes expanded state; fix needs new string and selector changes | reject |
| 12 | blind, edge-case (×2) | First-name logic: dead `?? user.name`, helper splits on `" "` vs `/\s+/` | low | `split` always returns an element, so the fallback is dead code; names are trimmed by `createUser`; direct correction | patch |
| 13 | blind | README hard-codes test counts | false | Existing README convention since 1.1/1.2 | reject |
| 14 | blind | Spec `in-review` vs sprint `in-progress` | false | Sprint sync happens at the present step | reject |
| 15 | blind | Placeholder h1s differ (Upload visible, Find images hidden) | false | DESIGN.md Typography: Library and Find images use a visually hidden h1; Upload has a page title | reject |
| 16 | blind | Header search does not keep the submitted `q` | low | No search yet (spec Never); fix adds `useSearchParams` + Suspense | reject |
| 17 | blind | No D-xxx for the new deps | low | Process files stay out of the code PR (D-013); recorded at `/wrap-up` | reject |
| 18 | blind | Unused tokens in `globals.css` | low | grep: `--inspector-width`, `--panel-pad`, `--panel-pad-mobile`, `--radius-tag`, `--radius-image`, `--radius-full` unused; `--price` is required by UX-DR-1; direct deletion | patch |
| 19 | blind | DESIGN.md config sample contains `"…": "…"` placeholders | low | Copy-paste gives an invalid config; direct correction: drop the placeholder line, the paragraph below explains overrides | patch |
| 20 | edge-case | `--drawer-pad` never removed | false | The effect recomputes it on every open | reject |
| 21 | edge-case | Empty search submits `?q=` | low | Harmless GET; fix adds a submit handler | reject |
| 22 | edge-case | `getClient` with a non-UUID gives a pg error | low | Only caller passes `actor.clientId` from the DB; unreachable | reject |
| 23 | verification-gap | Skip link and `#main` target untested | medium | Pre-verified: no test reaches the skip link; axe tags used skip the best-practice rule | patch |
| 24 | verification-gap | Drawer reset on widening past 900 px untested | low | Pre-verified; a test is a direct addition next to the #1 fix | patch |

## Design Notes

**Sidebar slot.** The layout cannot know a page's sidebar content, so the layout renders `<SidebarProvider>` (client) around the top bar and main. A page that has a sidebar renders `<ContextSidebar label=…>…</ContextSidebar>`; it registers with the provider, and only then does the top bar show the toggle. Overview, Login and 403 render none, so they show no toggle.

**Theme as generated code.** The config is the source; the CSS is committed so builds stay offline and reviewable. `theme.test.ts` makes DESIGN.md's token table executable: if someone regenerates without the overrides, the test fails.

## Verification

**Commands:**
- `npm run theme:build && git diff --exit-code src/styles/theme` -- expected: no diff (the committed CSS matches the config)
- README test command (`docker compose -p crm-dam-test down -v && … unit && … e2e`) -- expected: all pass
- `npm run lint && npm run typecheck` -- expected: clean

**Manual checks:**
- Browser at 1440 px and 360 px as Ida and as Jonas: top bar order, drawer, account menu, focus ring with Tab.
