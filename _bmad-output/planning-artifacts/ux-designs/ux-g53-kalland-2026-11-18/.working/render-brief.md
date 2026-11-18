# Render brief — design directions, round 1

Shared brief for every renderer subagent. Workspace: `_bmad-output/planning-artifacts/ux-designs/ux-g53-kalland-2026-11-18/` (repo root `/Users/marthekalland/Dev/g53-kalland`).

## Read first
1. `.memlog.md`: the user's decisions. These win over everything else.
2. `.working/source-extract-prd.md`: product, roles, journeys, surfaces and exact microcopy (NFR-7 error messages verbatim).
3. `/Users/marthekalland/Dev/g53-kalland/.claude/skills/frontend-design/SKILL.md`: design-quality guidance. Its landing-page "hero" advice does not apply, because this is a product app. Where this brief pins a choice, the brief wins.
4. Designsystemet docs as Markdown: `https://designsystemet.no/llms.txt` (append `.md` to any doc page). Do not invent components, classes, attributes or tokens. Grep `.working/vendor/ds-index.css` and `.working/vendor/ds-theme.css` to confirm every `ds-*` class, `data-*` attribute and `--ds-*` variable you use.

## Fixed in every direction
- **Designsystemet CSS 1.23.0**, linked relatively from the HTML file in `.working/`:
  `<link rel="stylesheet" href="vendor/ds-index.css">` then `<link rel="stylesheet" href="vendor/ds-theme.css">`. Use real Designsystemet components (button, search, field, input, card, chip, tag, badge, table, tabs, dialog, alert, file-upload, pagination, avatar, details, dropdown, skeleton, spinner…).
- **Theme by overriding `--ds-*` custom properties** in your own `<style>` (colours, border radius, font family). Put a comment at the top of the `<style>` that documents the hex values **and** the equivalent `designsystemet.config.json` snippet (`themes.<name>.colors.accent/brand1/brand2/neutral`, `borderRadius`, `typography.fontFamily`).
- **Light only**: `data-color-scheme="light"`. No dark mode.
- **Minimal, airy, never cramped.** Generous whitespace. Efficiency matters: the most-used actions (search, upload, filter, open image, edit metadata, publish) are one click away. Less-used actions live in menus or the sidebar.
- **Shell:** a main header navigation **plus a sidebar that can be toggled** (working toggle button). What goes in each is yours to decide per direction.
- **Desktop-first** (design at ~1440 px), but responsive. Nothing may break or scroll horizontally at 360 px.
- **English UI.** Real content from the PRD: Ida (agency designer), Jonas (contact at Fjordkaffe AS), other plausible clients, image titles, photographers, dates, prices in USD (PRD FR-23; free images are 0 USD). No lorem ipsum.
- **Accessibility floor:** semantic HTML, WCAG 2.1 AA contrast, visible keyboard focus, alt text on every image (PRD fallback rules).
- **Fonts:** system fonts, or Google Fonts via `fonts.googleapis.com`. No other network requests. Images are inline SVG or CSS placeholders that read like photographs (varied aspect ratios and tones), never external URLs.
- **JS:** small inline scripts only, for switching screens and toggling the sidebar.

## Screens in each file
At the top, outside the app frame, add a small mock switcher (not part of the design) that shows the direction's name, a 2–3 sentence rationale, and buttons to switch between:
1. **Staff · Library** (hero screen). Search, filters and results. Show the processing-state badges (uploading, queued, generating, ready, failed, rejected), visibility × price indicators and at least one state variant (an empty result or a failed item).
2. **Staff · Upload.** A batch drop zone, batch settings, per-file processing status, an exact-duplicate rejection and a filename-match warning, and AI metadata to review and correct before publishing.
3. **Client · My images / Find images** (Jonas at Fjordkaffe AS). Licensed images with the green "own image" tick, browsable images for purchase with a price, and the cart affordance.

## The 10 directions (round 1, wide variation)
Each direction is a whole visual and structural personality, not a palette swap. Know all ten so yours stay distinct:
01 **Gallery wall**: very large thumbnails; metadata only on demand.
02 **Split inspector**: a grid plus a persistent right-hand inspector for metadata.
03 **Table-first**: list or table rows with thumbnails, made for bulk editing. Spreadsheet-efficient but still airy.
04 **Search-first**: a large central search with facet chips; keyboard and command-palette feel.
05 **Pipeline board**: work organised by status (processing → needs review → ready → published).
06 **Client-centric**: the library is organised by client and project; the sidebar is a client tree.
07 **Editorial calm**: typography-led, wide margins, very restrained colour.
08 **Bold accent**: one strong saturated brand colour carries the identity, still on a light base.
09 **Soft & rounded**: large radii, tinted neutrals, friendly. The opposite of 07's sharpness.
10 **Collections / lightbox**: the work centres on gathering images into collections for clients, with a selection tray.

## Output
One self-contained HTML file per direction: `.working/direction-NN-slug.html` (e.g. `direction-01-gallery-wall.html`). Do not open browsers. Return only: file path(s), a one-line personality summary per direction, theme hexes and radius, and any Designsystemet limits you ran into.
