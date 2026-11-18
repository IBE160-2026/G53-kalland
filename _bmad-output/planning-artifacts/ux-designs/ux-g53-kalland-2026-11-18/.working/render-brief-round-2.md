# Render brief: round 2

Workspace: `_bmad-output/planning-artifacts/ux-designs/ux-g53-kalland-2026-11-18/` (repo root `/Users/marthekalland/Dev/g53-kalland`).

The round-1 brief (`.working/render-brief.md`) still applies. That covers Designsystemet 1.23.0 linked from `vendor/`, light only, airy, English, real PRD content, prices in **USD**, the accessibility floor, inline SVG photo placeholders, small inline JS, and no horizontal scroll at 360 px. This brief adds to it and wins where they differ.

## Read first
- `.memlog.md`, especially the round-1 feedback and the round-2 decisions at the bottom.
- `.working/direction-02-split-inspector.html` is the **base**: its theme (cyanotype blue accent, cool slate neutral, Instrument Sans), its components and its inspector pattern. Reuse its markup and CSS as the starting point.
- For borrowed parts, look at `direction-01-gallery-wall.html` (masonry), `direction-03-table-first.html` (the batch overview on the upload screen), `direction-07-editorial-calm.html` (the to-do list on the upload screen) and `direction-10-collections-lightbox.html` (collections listed in the library sidebar).
- `.claude/skills/frontend-design/SKILL.md`.

## The merged design (the same in all three variants)
- **Staff · Library.** One continuous **masonry** image layout, as in 01. There is **no separate section** for batches or drafts: draft and processing states show on each image (tags) and can be filtered. A selected image opens 02's **right-hand inspector** for metadata, who can see it, price and actions. The toggleable sidebar holds the **filters** (with a working date-from/to layout, since the date inputs in 02 broke) and a **Collections** list.
- **Staff · Upload.** Three zones:
  - **Left:** the batch overview ("Your batches" and "Other staff", as in 03) plus a **to-do list** for the current batch (as in 07): for example, 3 failed, 12 need alt text, 41 ready to publish.
  - **Middle:** the drop zone and the list of uploading and draft images with their per-file states (02's list).
  - **Right:** **per-image** settings and metadata review for the selected file (title, description, alt text, keywords, visibility, price), with the exact-duplicate rejection and the filename-match warning shown in context.
- **Client · My images / Find images** (Jonas at Fjordkaffe AS). The same masonry. Clicking an image opens a **right-hand detail panel** with the description, licence, price, "Add to cart" (or download if he already owns it) and the green own-image tick. Show the panel open.
- **No sepia or yellow-brown anywhere.** No pen-loop selection marks. No serif display type.

## What varies: three navigation variants, one file each
- **A · Header-led** → `round2-a-header-nav.html`. The header has the main sections (Library, Upload, Clients, Licences), search, an Upload button and the account. The sidebar is contextual only: filters and collections on Library, batches and to-do on Upload.
- **B · Sidebar-led** → `round2-b-sidebar-nav.html`. The sidebar has the main sections at the top, then the contextual content (collections, filters, batches, to-do) below. The header is slim: search, Upload button, account. When the sidebar is toggled off, there must still be a way to reach the sections (for example a menu button).
- **C · Split by frequency (as in 08)** → `round2-c-split-nav.html`. The header has the frequent destinations (Library, Upload) and search. The sidebar has saved views and collections, then the less-used destinations under a "Manage" group (Clients, Licences, Action log, Settings). Filters sit in a filter bar above the masonry, with a "More filters" control.

The client side follows the same navigation idea in each variant (sections: Overview, My images, Find images, Licences, Cart).

## Two extra toggles in each file's mock switcher
Put these in the switcher bar outside the app frame. They switch with `data-*` attributes on the root, not separate pages:
- **Shape: Crisp / Medium soft.**
  - **Crisp** is 02 as it is (3 px radius).
  - **Medium soft** is clearly rounder and gentler: about 8–12 px on controls, larger on panels and images, softer surface tints and a very light elevation. It must stay grown-up: no pastel page, no playful font, not every element a pill.
  - Implement both by overriding `--ds-border-radius-*` and your own tokens.
- **Price: three treatments.**
  1. **Plain:** the same colour as body text, semibold, with a small tag icon.
  2. **Accent:** 02's blue.
  3. **Neutral tag:** a neutral `ds-tag` or outlined chip.

  The price must stay readable in every treatment (AA). "Free" uses the same treatment.

## Output and checks
- Write the three HTML files to `.working/`.
- Screenshot each one with headless Chrome at 1440×1000 and look at the screenshots (Read the PNG). Fix anything broken before you finish:
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=3000 --window-size=1440,1000 --screenshot=OUT.png "file://ABS_PATH"`
  Headless Chrome cannot go narrower than about 485 px. To check 360 px, load the file in a 360-px-wide `<iframe>` inside a wrapper page, using `--allow-file-access-from-files`.
- Grep that every `ds-*` class exists in `vendor/ds-index.css`.
- Return only: the file paths, a one-line description per variant, how you made medium soft (the radii), the three price treatments, and any problems left.
