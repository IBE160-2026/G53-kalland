---
name: g53-kalland
description: CRM-DAM for a design agency. Designsystemet (Digdir) with a custom "Graphite" theme; this file specifies the theme and the product components on top of it. Light only.
status: final
sources:
  - {planning_artifacts}/prds/prd-g53-kalland-2026-11-18/prd.md
updated: 2026-11-20
colors:
  # Graphite theme. Each token maps to a Designsystemet (--ds-*) variable where one
  # exists (table in "Colors"). Light only: no dark tokens.
  accent: '#25282D'
  accent-hover: '#1D1F24'
  accent-active: '#14171C'
  on-accent: '#FFFFFF'
  accent-text: '#25282D'
  selected-tint: '#E3E4E6'
  selected-row-tint: '#F3F3F4'
  canvas: '#F5F6F6'
  surface: '#FFFFFF'
  surface-tinted: '#EDEEEF'
  surface-hover: '#E2E3E4'
  text: '#202124'
  text-muted: '#595C5F'
  border: '#7F8185'
  border-strong: '#5F6265'
  hairline: '#CCCED0'
  price: '#5D6672'
  success: '#16803C'
  success-text: '#186B34'
  danger: '#CC1631'
  danger-text: '#BD0529'
  warning: '#EE6A0E'
  warning-text: '#A84802'
  on-warning: '#000000'
  info: '#1E5FC2'
  info-text: '#255BB1'
  focus-outer: '#25282D'
  focus-inner: '#FFFFFF'
  scrim: '#1C222B59'
typography:
  # Instrument Sans everywhere, tabular numerals on. Sizes not listed inherit
  # Designsystemet's type scale (--ds-body-*, --ds-heading-*).
  page-title:
    fontFamily: Instrument Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.015em
  panel-title:
    fontFamily: Instrument Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  wordmark:
    fontFamily: Instrument Sans
    fontSize: 17px
    fontWeight: '650'
    letterSpacing: -0.01em
  sidebar-heading:
    fontFamily: Instrument Sans
    fontSize: 16px
    fontWeight: '600'
  section-title:
    fontFamily: Instrument Sans
    fontSize: 15px
    fontWeight: '600'
  nav:
    fontFamily: Instrument Sans
    fontSize: 16px
    fontWeight: '500'
  body:
    fontFamily: Instrument Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Instrument Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.5'
  tile-title:
    fontFamily: Instrument Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: '1.3'
  label:
    fontFamily: Instrument Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  meta:
    fontFamily: Instrument Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.35'
  price:
    fontFamily: Instrument Sans
    fontWeight: '600'
    lineHeight: '1.35'
  price-lg:
    fontFamily: Instrument Sans
    fontSize: 20px
    fontWeight: '600'
    letterSpacing: -0.01em
  stat-number:
    fontFamily: Instrument Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.01em
rounded:
  # Crisp. Designsystemet --ds-border-radius-base = 3px; the rest derive from it.
  none: 0px
  tag: 1.5px
  image: 2px
  DEFAULT: 3px
  full: 9999px
spacing:
  # Designsystemet --ds-size-* scale (4px unit at the default size mode) for
  # component internals; the named tokens below are the product layout values.
  unit: 4px
  topbar-height: 64px
  page-pad-top: 28px
  page-pad-x: 36px
  page-pad-bottom: 56px
  page-pad-mobile: 16px
  panel-pad: 24px
  panel-pad-mobile: 16px
  section-gap: 22px
  field-gap: 18px
  sidebar-pad-y: 28px
  sidebar-pad-x: 24px
  sidebar-group-gap: 24px
  sidebar-section-gap: 32px
  wall-row-gap: 28px
  wall-row-gap-compact: 16px
  wall-col-gap: 16px
  wall-row-height: 168px
  wall-row-height-sm: 120px
  sidebar-width: 264px
  inspector-width: 400px
  drawer-width: 320px
components:
  button-primary:
    background: '{colors.accent}'
    foreground: '{colors.on-accent}'
    hover: '{colors.accent-hover}'
    active: '{colors.accent-active}'
    radius: '{rounded.DEFAULT}'
  button-secondary:
    background: '{colors.surface}'
    foreground: '{colors.accent-text}'
    border: '{colors.accent}'
    radius: '{rounded.DEFAULT}'
  text-action:
    foreground: '{colors.accent-text}'
    decoration: 'underline 1px, offset 0.2em; 2px on hover'
  top-bar:
    background: '{colors.surface}'
    border-bottom: '1px {colors.hairline}'
    height: '{spacing.topbar-height}'
  main-nav-tab:
    foreground: '{colors.text-muted}'
    foreground-current: '{colors.text}'
    indicator-current: '2px bottom {colors.accent}'
    typography: '{typography.nav}'
  sidebar-toggle:
    variant: 'tertiary icon button'
    open-drawer-background: '{colors.surface}'
  context-sidebar:
    background: '{colors.surface}'
    border-right: '1px {colors.hairline}'
    width: '{spacing.sidebar-width}'
    drawer-width: '{spacing.drawer-width}'
    drawer-shadow: '6px 0 24px rgba(28, 34, 43, 0.18)'
    scrim: '{colors.scrim}'
    radius: '{rounded.none}'
  list-row:
    radius: '{rounded.DEFAULT}'
    hover: '{colors.surface-tinted}'
    current: '{colors.selected-tint}'
  filter-chip:
    variant: 'Designsystemet chip'
  image-wall:
    row-height: '{spacing.wall-row-height}'
    row-gap: '{spacing.wall-row-gap}'
    col-gap: '{spacing.wall-col-gap}'
  image-tile:
    radius: '{rounded.image}'
    placeholder: '{colors.surface-tinted}'
    hover-ring: '1px {colors.border}'
    selected-ring: '2px {colors.canvas} gap + 2px {colors.accent}'
    title: '{typography.tile-title}'
    meta: '{typography.meta}'
  status-tag:
    radius: '{rounded.tag}'
    on-image-shadow: '0 1px 2px rgba(20, 26, 34, 0.22)'
  own-tick:
    background: '{colors.success}'
    foreground: '{colors.on-accent}'
    radius: '{rounded.full}'
    size: 26px
    ring: '2px {colors.surface}'
  price:
    foreground: '{colors.price}'
    typography: '{typography.price}'
    icon: 'tag icon, same colour'
  captions-switch:
    variant: 'Designsystemet switch (checkbox, role switch), size sm'
  details-panel:
    background: '{colors.surface}'
    border-left: '1px {colors.hairline}'
    width: '{spacing.inspector-width}'
    padding: '{spacing.panel-pad}'
    title: '{typography.panel-title}'
    radius: '{rounded.none}'
  inline-details:
    background: '{colors.surface}'
    border: '1px {colors.hairline}'
    border-top: '3px {colors.accent}'
    radius: '{rounded.DEFAULT}'
  access-controls:
    variant: 'Designsystemet toggle group, size sm'
  changed-marker:
    bar: '3px {colors.warning}'
    label: '{colors.warning-text}'
  save-status:
    saved: '{colors.success-text}'
    dirty: '{colors.warning-text}'
    neutral: '{colors.text-muted}'
  unsaved-dialog:
    variant: 'Designsystemet dialog'
    max-width: 480px
  confirm-dialog:
    variant: 'Designsystemet dialog'
  context-alert:
    variant: 'Designsystemet alert, warning, size sm'
  file-row:
    divider: '1px {colors.hairline}'
    selected-background: '{colors.selected-row-tint}'
    selected-bar: 'inset 3px {colors.accent}'
    thumb-size: 52px
    thumb-radius: '{rounded.image}'
  todo-list:
    number: '{typography.stat-number}'
    current: '{colors.selected-tint}'
  batch-list:
    current: '{colors.selected-tint}'
  batch-progress:
    meter-height: 6px
    track: '{colors.surface-tinted}'
  drop-zone:
    variant: 'Designsystemet file upload'
    background: '{colors.surface}'
  keyword-chip:
    variant: 'Designsystemet removable chip (edit) / neutral tag (view)'
  licence-option:
    background: '{colors.canvas}'
    border: '1px {colors.hairline}'
    radius: '{rounded.DEFAULT}'
  cart-button:
    variant: 'secondary button + Designsystemet badge (count)'
  pagination:
    variant: 'Designsystemet pagination, size sm'
  data-table:
    variant: 'Designsystemet table'
  empty-state:
    text: '{colors.text-muted}'
  focus-ring:
    outer: '{colors.focus-outer}'
    inner: '{colors.focus-inner}'
    width: 3px
---

# CRM-DAM — Design Spine

`EXPERIENCE.md` is the behaviour spine. Visual references: [`mockups/key-screens.html`](mockups/key-screens.html) (Staff Library, Staff Upload, Client Find images; its "Theme reference" legend lists every Graphite role with hex) and [`mockups/more-screens.html`](mockups/more-screens.html) (Staff Clients, Client Overview, Client Cart and checkout), and the clickable prototype [`mockups/prototype/index.html`](mockups/prototype/index.html) (all surfaces). **This spine wins on conflict with any mock or the prototype.**

## Brand & Style

A white-walled gallery. The agency has no brand to carry (branding is out of scope in the PRD), so the interface steps back: graphite and white only, and the photographs carry the colour. Status colours are small, saturated signals; nothing else is chromatic. The posture is a working tool for designers and photographers: minimal, airy, never cramped, with the most-used actions one click away and the rest in menus and the sidebar.

Built on **Designsystemet** (Digdir, CSS 1.23) with a custom theme. Components come from Designsystemet unchanged unless listed under Components; this file specifies the theme values and the product components.

Theme builder input (`designsystemet.config.json`):

```json
{
  "themes": {
    "graphite": {
      "colors": {
        "main":    { "accent": "#25282D" },
        "support": { "brand1": "#5D6672" },
        "neutral": "#2B2D30"
      },
      "borderRadius": 3,
      "typography": { "fontFamily": "Instrument Sans" }
    }
  }
}
```

## Colors

Status colours override the Designsystemet defaults: success `#16803C`, danger `#CC1631`, warning `#EE6A0E`, info `#1E5FC2`. `brand2` is not used. The full generated scales are in the `:root` block of `mockups/key-screens.html`; the tokens below are the roles the product uses.

| Token | Hex | Designsystemet variable | Use | Not for |
|---|---|---|---|---|
| `accent` | `#25282D` | `--ds-color-accent-base-default` | Primary buttons, selected-image ring, current nav tab, selected file bar | Prices or status |
| `accent-hover` / `accent-active` | `#1D1F24` / `#14171C` | `--ds-color-accent-base-hover` / `-active` | Primary button states | |
| `on-accent` | `#FFFFFF` | `--ds-color-accent-base-contrast-default` | Text on accent; checkmark on the own-image tick | |
| `accent-text` | `#25282D` | `--ds-color-accent-text-subtle` | Links, selected tile title | |
| `selected-tint` | `#E3E4E6` | `--ds-color-accent-surface-tinted` | Current filter, list row, to-do item, batch | Large page areas |
| `selected-row-tint` | `#F3F3F4` | `--ds-color-accent-background-tinted` | Selected file row on Upload | |
| `canvas` | `#F5F6F6` | `--ds-color-neutral-background-tinted` | Page behind panels | |
| `surface` | `#FFFFFF` | `--ds-color-neutral-surface-default` | Top bar, Context sidebar, Details panel, cards, dialogs | |
| `surface-tinted` / `surface-hover` | `#EDEEEF` / `#E2E3E4` | `--ds-color-neutral-surface-tinted` / `-hover` | Row hover, image placeholders, meter track | |
| `text` | `#202124` | `--ds-color-neutral-text-default` | Body, headings, values | |
| `text-muted` | `#595C5F` | `--ds-color-neutral-text-subtle` | Meta, hints, labels in key-value lists, inactive nav | Prices |
| `border` / `border-strong` | `#7F8185` / `#5F6265` | `--ds-color-neutral-border-default` / `-strong` | Inputs, controls, hover ring | Dividers |
| `hairline` | `#CCCED0` | `--ds-color-neutral-border-subtle` | Dividers, panel edges | Control boundaries (below 3:1) |
| `price` | `#5D6672` | `brand1` (product variable `--price`) | Every price and "Free", with its tag icon | Anything that is not a price |
| `success` / `success-text` | `#16803C` / `#186B34` | `--ds-color-success-base-default` / `-text-subtle` | Own-image tick, Ready, Published, "Saved" | |
| `danger` / `danger-text` | `#CC1631` / `#BD0529` | `--ds-color-danger-base-default` / `-text-subtle` | Failed, file errors | |
| `warning` / `warning-text` / `on-warning` | `#EE6A0E` / `#A84802` / `#000000` | `--ds-color-warning-base-default` / `-text-subtle` / `-base-contrast-default` | Needs a decision, Rejected, needs alt text, changed-field marker, unsaved status | Price |
| `info` / `info-text` | `#1E5FC2` / `#255BB1` | `--ds-color-info-base-default` / `-text-subtle` | Uploading | Links (links are graphite + underline) |
| `focus-outer` / `focus-inner` | `#25282D` / `#FFFFFF` | `--ds-color-focus-outer` / `-inner` | Keyboard focus ring | |
| `scrim` | `#1C222B` at 35 % | — | Behind the sidebar drawer | |

**Price.** Cool slate grey `#5D6672`, semibold, with the tag icon in the same colour; "Free" gets the identical treatment. It is a deliberately quiet price, set apart from meta text by weight and icon more than by hue. It never uses a status colour (green, blue, orange, red), the accent, a tag, or sepia / yellow-brown.

**Contrast (WCAG 2.1 AA).** Text pairs ≥ 4.5:1; UI boundaries and non-text signals ≥ 3:1. All load-bearing pairs pass:

| Pair | Ratio | Target |
|---|---|---|
| `text` on `surface` / `canvas` | 16.1 / 14.9 | 4.5 |
| `text-muted` on `surface` / `canvas` / `selected-tint` | 6.7 / 6.2 / 5.3 | 4.5 |
| `on-accent` on `accent` | 14.8 | 4.5 |
| `accent-text` on `selected-tint` | 11.6 | 4.5 |
| `price` on `surface` / `canvas` / `selected-tint` | 5.8 / 5.4 / 4.6 | 4.5 |
| `success-text` / `danger-text` / `warning-text` / `info-text` on `surface` | 6.6 / 6.5 / 5.9 / 6.5 | 4.5 |
| `on-warning` on `warning` | 6.7 | 4.5 |
| `on-accent` on `success` (own-image tick) | 5.0 | 3 |
| `warning` (changed marker, dots) on `surface` | 3.1 | 3 |
| `border` on `surface` / `canvas` | 3.9 / 3.6 | 3 |
| `hairline` on `surface` | 1.6 | decorative only |

## Typography

**Instrument Sans** (Google Fonts, weights 400–700), fallback `system-ui, -apple-system, 'Segoe UI', sans-serif`. Tabular numerals on everywhere, so counts, prices and file sizes line up. No serif or display face.

| Role | Token | Where |
|---|---|---|
| Page title | `{typography.page-title}` | Batch name on Upload, page headings (Library and Find images use a visually hidden h1) |
| Panel title | `{typography.panel-title}` | Details panel header (image title) |
| Wordmark | `{typography.wordmark}` | "CRM-DAM" in the staff top bar |
| Sidebar heading | `{typography.sidebar-heading}` | "Filters", "To do in this batch", "Your batches" |
| Section title | `{typography.section-title}` | Details panel sections ("Who can see it", "Metadata", "Licence") |
| Nav | `{typography.nav}` | Main nav tabs |
| Body / body-sm | `{typography.body}` / `{typography.body-sm}` | Values, descriptions / list rows, file names |
| Tile title | `{typography.tile-title}` | Caption title under an image, one line with ellipsis |
| Label | `{typography.label}` | Field labels, group headings, status lines |
| Meta | `{typography.meta}` | Caption meta line, hints, counts, file sub-lines |
| Price / price-lg | `{typography.price}` / `{typography.price-lg}` | Prices inline (inherit size) / in the licence option |
| Stat number | `{typography.stat-number}` | To-do counts |

Weights: 400 body, 500 labels and nav, 600 titles, key values and prices. No all-caps labels.

## Layout & Spacing

Desktop-first at about 1440 px; works down to 360 px with no horizontal scroll.

- **Shell:** `top-bar` (`{spacing.topbar-height}`) over a three-column workspace: Context sidebar (`{spacing.sidebar-width}`), main (fluid), Details panel (`{spacing.inspector-width}`). Context sidebar and Details panel are sticky and scroll on their own.
- **Main padding:** `{spacing.page-pad-top}` / `{spacing.page-pad-x}` / `{spacing.page-pad-bottom}`; `{spacing.page-pad-mobile}` at ≤ 900 px.
- **Panels:** `{spacing.panel-pad}` inside the Details panel, `{spacing.section-gap}` between its sections, `{spacing.field-gap}` between fields; `{spacing.panel-pad-mobile}` at ≤ 900 px.
- **Sidebar:** `{spacing.sidebar-pad-y}` / `{spacing.sidebar-pad-x}`, `{spacing.sidebar-group-gap}` between groups, `{spacing.sidebar-section-gap}` between sections.
- **Image wall:** justified rows (row masonry); each image's width follows its aspect ratio at `{spacing.wall-row-height}`. Row gap `{spacing.wall-row-gap}` with captions, `{spacing.wall-row-gap-compact}` without; column gap `{spacing.wall-col-gap}`. At ≤ 560 px the row height is `{spacing.wall-row-height-sm}`.
- **Breakpoints:** 1240 px (details move inline), 900 px (sidebar becomes a drawer; nav and search wrap to their own rows), 560 px (compact wall, icon-only cart, stacked rows). Behaviour per breakpoint lives in `EXPERIENCE.md` → Responsive & Platform.

## Elevation & Depth

Flat. Panels sit on `canvas` and are separated by `hairline` edges and tone, not shadows. Shadows appear only where something floats:

- the sidebar drawer at ≤ 900 px (`6px 0 24px rgba(28, 34, 43, 0.18)`) over the `scrim`;
- popovers and dropdowns (`--ds-shadow-md`);
- dialogs (Designsystemet default);
- status tags drawn on an image (`0 1px 2px rgba(20, 26, 34, 0.22)`) and the own-image tick's 2 px white ring, so they stay legible on any photograph.

## Shapes

Crisp. `--ds-border-radius-base` is 3 px.

| Token | Value | Applies to |
|---|---|---|
| `{rounded.none}` | 0 | Top bar, Context sidebar, Details panel (square, full height) |
| `{rounded.tag}` | 1.5 px | Status tags, keyword tags |
| `{rounded.image}` | 2 px | Images and thumbnails |
| `{rounded.DEFAULT}` | 3 px | Buttons, inputs, chips, cards, list rows, inline details, licence option |
| `{rounded.full}` | 9999 px | Own-image tick, status dots, avatar only |

## Components

Designsystemet components used as shipped: Button, Link, Search, Field, Input, Select, Checkbox, Switch, Chip, Tag, Badge, Toggle group, Details, Dialog, Alert, File upload, Pagination, Skeleton, Spinner, Avatar, Table. Product-level specs (names and groups are identical in `EXPERIENCE.md`; behaviour lives there):

### Shell

| Component | Visual spec |
|---|---|
| **Top bar** `top-bar` | White, hairline bottom edge. Left to right: sidebar toggle, wordmark (staff: "CRM-DAM" with a square mark; client: client name over "Image portal" in `meta`), main nav, header search (max 520 px), then, right-aligned, the cart button (clients) and account (avatar + first name). |
| **Main nav tab** `main-nav-tab` | Text tabs in `text-muted`; current tab in `text` with a 2 px accent underline. |
| **Sidebar toggle** `sidebar-toggle` | Tertiary icon button (panel icon). While the drawer is open it shows a close (×) icon on white with a hairline ring, above the drawer and scrim. |
| **Context sidebar** `context-sidebar` | White, hairline right edge, square. As a drawer: `{spacing.drawer-width}` (max 86 vw), drawer shadow, `scrim` behind. |
| **List row** `list-row` | Facet, batch and to-do rows: label left, count right in `meta`; hover `surface-tinted`; current `selected-tint`. Processing facets carry an 8 px status dot; Failed carries a danger count badge. |

### Wall and tile

| Component | Visual spec |
|---|---|
| **Filter chip** `filter-chip` | Designsystemet checkbox chips for Status, Visibility, Price; a removable chip for each active filter in the wall toolbar ("Taken from 1 Jan 2025"). |
| **Image wall** `image-wall` | Justified rows (see Layout). Toolbar above: count semibold ("248 images, newest first"), active filter chips, sort select (staff), captions switch. Pagination below. |
| **Image tile** `image-tile` | Image at its own aspect ratio, `{rounded.image}`. Status tags top-left on the image; own-image tick top-right. Caption below: title (`tile-title`, one line), meta line (`meta`, muted): visibility icon + label or client name, and price. Hover: 1 px `border` ring. Selected: 2 px canvas gap + 2 px accent ring, title in `accent-text`. Uploading: skeleton with a white percentage pill. Failed: one-line error in `danger-text` under the title (captions on only). |
| **Status tag** `status-tag` | Designsystemet tag, size sm. Neutral: Draft, Queued, Archived. Info: Uploading. Accent + spinner: Generating (its facet dot and progress dot pulse slowly, so it stands apart from the grey Queued dot). Success: Ready, Published. Danger: Failed. Warning: Needs a decision, Rejected, Needs alt text. |
| **Own-image tick** `own-tick` | 26 px success circle, white check, 2 px white ring, on the image top-right. Inline variant 18 px before "Your image" / "Yours to download" in `success-text` semibold `meta`. |
| **Price** `price` | See Colors → Price; no wrap; `price-lg` in the licence option. |
| **Captions switch** `captions-switch` | Switch labelled "Show captions" in the wall toolbar. |

### Details panel

| Component | Visual spec |
|---|---|
| **Details panel** `details-panel` | White column, hairline left edge, square. Header: `panel-title` + file line in `meta`, actions right. Then a 236 px "loupe" (image centred on `canvas`, hairline border), a status line (tags, counts, save status), sections under `section-title`, Designsystemet Details for secondary groups, and a sticky footer (hairline top) with the primary action. |
| **Inline details** `inline-details` | The Details panel placed in the flow at ≤ 1240 px: hairline border, 3 px accent top edge, `{rounded.DEFAULT}`, "Close details" text action top-right, no loupe (the selected image above it is shown at full width, up to `min(60vh, 520px)` tall). Upload accordion: a chevron at the file row end. |
| **Access controls** `access-controls` | Toggle groups for Visibility (Internal / Restricted / Public) and Price (Free / Paid); a one-line muted hint under Visibility; client chips + "Add client" when Restricted; a USD amount field "Price per licence, ex VAT" (max 11 rem) when Paid. View mode shows the same as a key-value list. |
| **Changed-field marker** `changed-marker` | 3 px warning bar left of a changed field, plus "Changed" in `warning-text` 12 px after its label. |
| **Save status** `save-status` | "Saved" / "Changes saved": check icon, `success-text`. "Unsaved changes (n fields)": 8 px warning dot, `warning-text`, weight 500. "No changes yet": muted. |
| **Unsaved-changes dialog** `unsaved-dialog` | Designsystemet dialog, max 30 rem: heading (xs), one paragraph with the image title in bold, actions Save changes (primary), Discard (secondary), Keep editing (text action). |
| **Keyword chip** `keyword-chip` | View: neutral tags. Edit: removable chips plus an "Add keyword" text action; on Upload grouped by category (label in `meta`, 6.5 rem column) with "(n of 15)" after the field label. |

### Upload

| Component | Visual spec |
|---|---|
| **Context alert** `context-alert` | Warning alert at the top of the Details panel. For a file name match it holds a two-up comparison ("New file" / "In the library", 104 px thumbs, captions in `meta`) and the actions; for an identical file, the message with a link plus a card of the existing image (96 px thumb, title, status, visibility, price). |
| **File row** `file-row` | 52 px thumb, file name or title (semibold), sub-line in `meta`, message line in `danger-text` or `warning-text`; status tag and row action at the end. Hairline dividers. Selected: `selected-row-tint` + 3 px accent inset bar. |
| **To-do list** `todo-list` | Count in `stat-number`, right-aligned, coloured by kind (danger, warning, success, muted); label semibold with a muted one-line instruction below. Current item `selected-tint`. |
| **Batch list** `batch-list` | List rows: batch name, muted second line (when, what is left), file count. Groups "Your batches" and "Other staff". |
| **Batch progress** `batch-progress` | Legend line of status dots with bold counts, then a 6 px segmented meter in the same status colours on a `surface-tinted` track. |
| **Drop zone** `drop-zone` | Designsystemet file upload on white: "Drop JPEG or PNG files here, up to 50 MB each" + "Choose files" secondary button. |

### Client

| Component | Visual spec |
|---|---|
| **Licence option** `licence-option` | Card on `canvas`, hairline border: licence name (semibold) and `price-lg` on one line, one line of scope in `meta`, "Read the licence terms" link. |
| **Cart button** `cart-button` | Secondary button: cart icon, "Cart", count badge. |

### Shared

| Component | Visual spec |
|---|---|
| **Button (primary)** `button-primary` | `{colors.accent}` fill, `{colors.on-accent}` text, `{rounded.DEFAULT}`. At most one per panel footer or page header. Optional leading icon (download, cart). |
| **Button (secondary)** `button-secondary` | White fill, graphite border and text. Used for Edit, Keep both, Try the 3 failed again and Cart. |
| **Text action** `text-action` | Tertiary button or link, underlined 1 px (2 px on hover), offset 0.2 em, because graphite gives no colour cue. Not underlined: icon-only buttons, toggle-group options, pagination, search clear. |
| **Confirm dialog** `confirm-dialog` | Same layout as the unsaved-changes dialog: heading, one paragraph or a short list, primary action first, then "Go back". Destructive confirmations (discard draft, revoke) use the Designsystemet danger button colour. |
| **Pagination** `pagination` | Designsystemet pagination, sm, with "Showing 1–14 of 248" in muted text on the left. |
| **Data table** `data-table` | Designsystemet table for client and contact lists, the staff Licences log, the client licence history and the action log. Prices in a table use the `price` treatment. |
| **Empty state** `empty-state` | One sentence in `text-muted` where the list would be, plus at most one action (text action or secondary button). No illustration. |
| **Focus ring** `focus-ring` | Designsystemet focus: 3 px, graphite outer, white inner, on every interactive element including image tiles and file rows. |

## Do's and Don'ts

| Do | Don't |
|---|---|
| Let the photographs carry the colour; keep chrome graphite and white | Add a brand colour, gradients or tinted page backgrounds |
| Price in `{colors.price}` semibold with the tag icon, "Free" the same | Price in a status colour, in accent, in a tag, or in sepia / yellow-brown |
| Status colour only on small signals: tags, dots, tick, counts, markers | Fill large areas with status colour |
| Underline text actions | Rely on graphite text alone to signal a link or action |
| Crisp 3 px corners, square panels, 2 px images | Medium-soft radii or pills (except the tick, dots and avatar) |
| Separate with hairlines and tone | Use shadow for hierarchy |
| Light only | Dark mode |
| Instrument Sans with tabular numerals | Serif or display faces, all-caps labels |
