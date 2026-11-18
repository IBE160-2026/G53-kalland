---
name: g53-kalland
status: draft
sources:
  - {planning_artifacts}/prds/prd-g53-kalland-2026-11-18/prd.md
updated: 2026-11-18
---

# CRM-DAM — Experience Spine

Requirements, roles, glossary and fixed messages live in the PRD (FR / NFR / UJ IDs are cited, not restated). `DESIGN.md` owns how things look; this file owns how they behave. Visual references: [`mockups/key-screens.html`](mockups/key-screens.html) and [`mockups/more-screens.html`](mockups/more-screens.html). **This spine wins on conflict with any mock.**

## Foundation

- **Form factor:** desktop-first responsive web (designed at about 1440 px). Must work from 360 px wide (NFR-5a); phone and tablet are occasional, not primary. No native app.
- **Two faces, one shell:** an internal staff tool (primary users: designers and photographers) and a login-only client portal for contacts (gated storefront). Same shell, components and theme; different navigation and data.
- **UI system:** Designsystemet (Digdir), CSS `@digdir/designsystemet-css` / React `@digdir/designsystemet-react`, with the custom Graphite theme in `DESIGN.md`. This spine specifies only the behaviour on top of Designsystemet's component defaults. **Note:** architecture decision D-031 still has to settle Designsystemet vs shadcn/ui in `technology.md`; if it changes, `DESIGN.md` must be re-mapped, this spine's behaviour stays.
- **Language:** English UI in v1. Every UI string lives in a translation file so a Norwegian pack can be added later (NFR-8). Microcopy below is the English source string.
- **Light only.** No dark mode.
- **Feel:** minimal and efficient. The most-used actions (search, filter, open an image, edit metadata, upload, publish, download, add to cart) are one click away; less-used actions live in menus and the sidebar.

## Information Architecture

### Staff

| Surface | Reached from | Purpose | Reference |
|---|---|---|---|
| Library | Main nav (default after staff login) | Search and browse every image incl. drafts and archived (FR-27, FR-29); view and edit one image in the Details panel | `mockups/key-screens.html` (Library) |
| Image page | "Open full image page" icon in the Details panel | Larger image with all staff metadata and actions (FR-30, FR-25, FR-26) | spine-only `[ASSUMPTION]` same sections as the Details panel, larger image |
| Upload | Main nav | Batches, to-do, drop zone, file list, per-file review and publish (FR-8 to FR-20) | `mockups/key-screens.html` (Upload) |
| Clients | Main nav | Client list, client card with contacts, visible images and licences, setup links (FR-1, FR-2, FR-4, FR-7) | `mockups/more-screens.html` (Clients) |
| Licences | Main nav | Transaction log of all licences, filters client / date range / paid only, revoked and credit flags (FR-41) | spine-only |
| Settings | `[ASSUMPTION]` Account menu (avatar) | AI provider and key (FR-39), licence price and text (FR-40), staff users (FR-3) | spine-only |
| Action log | `[ASSUMPTION]` Account menu | Action log per user (FR-42b) | spine-only |

Context sidebar (toggleable) per surface: **Library** → Filters (Status, Processing, Visibility, Price, Client, Date taken). **Upload** → "To do in this batch" and batches ("Your batches", "Other staff"). Other staff surfaces: `[ASSUMPTION]` no sidebar; the toggle is hidden.

Collections are **out of v1** (PRD Out of Scope; UJ-1 "Later"), and no slot is reserved for them. The Library sidebar holds filters only.

### Client (contact)

| Surface | Reached from | Purpose | Reference |
|---|---|---|---|
| Overview | Main nav (landing after login and after setting a password) | Client dashboard: own images, licences, newly visible images, recent activity (FR-38a, FR-38b). Fallback if FR-38a is cut: land on My images | `mockups/more-screens.html` (Overview) |
| My images | Main nav | Own images only (FR-28), download | spine-only (same layout as Find images) |
| Find images | Main nav | Everything the client may see, green tick on own, filters, add to cart (FR-28, FR-29) | `mockups/key-screens.html` (Client) |
| Licences | Main nav | The client's licence history incl. "removed by the agency" (FR-33) | spine-only |
| Cart, Checkout, Confirmation | Cart button in the top bar; "Go to checkout" in the Details panel | Review lines, accept terms, check out, download what was bought (FR-31, FR-32, FR-37) | `mockups/more-screens.html` (Cart and checkout) |

Client sidebar: Find images and My images → Filters ("Only my images" on Find images only, Price, Date taken) and a note with the count of own images. No client filter (FR-28).

### Shared and system pages

Login, Set password (from a setup link), 403 (contact on a staff route, FR-6), Not found (anything a contact may not see, FR-22). All spine-only. `[ASSUMPTION]` Login and Set password are a single centred form on `canvas` with no navigation.

### Navigation rules

- Header-led: main sections are tabs in the top bar; the sidebar is contextual only, never navigation.
- No Upload button in the top bar or Library header; Upload is reached through its tab.
- Header search searches the Library (staff: "Search title, description, keywords and places") or Find images (client: "Search images").
- Account (avatar + first name) at the top-right. `[ASSUMPTION]` It opens a menu with Log out (and, for staff, Settings and Action log).
- Modal depth: one dialog at a time, never stacked.

## Voice and Tone

Microcopy. Brand posture lives in `DESIGN.md` → Brand & Style. The error and notice messages in NFR-7 are fixed and tested word for word; use them exactly, with file name, title and prices filled in.

| Do | Don't |
|---|---|
| Say what happened and what to do next: "Decide on the file name match first. Then you can publish it." | "Action unavailable" |
| Plain verbs on buttons: "Save changes", "Keep both", "Discard new file", "Try again", "Add to cart", "Download" | "Submit", "OK", "Proceed" |
| Counts with a noun: "Publish 41 ready images", "Try the 3 failed again", "Unsaved changes (1 field)" | "Publish all", "Retry (3)" |
| Speak to the reader: "Your image", "Yours to download", "Only my images", "Keep this page open until the last file has uploaded." | Third-person system voice: "The user's asset" |
| Name the cost of a choice: "Changing the price does not affect the 3 licences already sold." / "Publishing without it makes them less accessible" | Silent consequences |
| Glossary terms exactly as in the PRD: image, client, contact, licence, draft / published / archived, "Untitled image", "removed by the agency" | Synonyms: asset, customer, user (for a contact), purchase (for a licence) |
| Staff and clients get the same plain tone | Jargon to clients: "client copy", "visibility", "restricted" |

## Component Patterns

Behavioural. Visual specs live in `DESIGN.md` → Components; names are identical.

| Component | Use | Behavioural rules |
|---|---|---|
| Button (primary) | One main action per page header or panel footer | Disabled only with a visible reason next to it (e.g. "Decide on the file name match first. Then you can publish it."). Double submit never duplicates (NFR-7). |
| Button (secondary) | Second action | Same rules as primary. |
| Text action | Tertiary actions and links | Always underlined. Used for Cancel-level and navigation actions (Previous / Next, Add client, Edit batch settings, Discard new file, Close details). |
| Top bar | Every signed-in page | Holds the sidebar toggle, wordmark, main nav, header search, cart (clients) and account. At ≤ 900 px nav and search wrap onto their own full-width rows. |
| Main nav tab | Section switch | Current section has `aria-current="page"`. Leaving the Library with unsaved edits opens the Unsaved-changes dialog first. |
| Sidebar toggle | Show or hide the Context sidebar | `aria-expanded` matches the state. Wide screens: the sidebar opens and closes in place. ≤ 900 px: opens the drawer, moves focus into it, becomes a close (×) button that stays on top. Closing returns focus to the toggle. |
| Context sidebar | Filters, to-do, batches | Wide: a column, open by default. ≤ 900 px: an overlay drawer, closed by default; closes with the toggle, Escape or a click on the scrim; page scroll is locked while open. |
| List row | Facets, batches, to-do items | Click applies the facet or opens the batch / filters the file list; current row has `aria-current`. Counts update live with processing (FR-15). |
| Filter chip | Status, Visibility, Price filters; active-filter chips | Toggling a chip filters at once (no Apply button). Each active filter shows as a removable chip in the toolbar; removing it clears that filter. |
| Image wall | Library, Find images, My images | Newest first, paged (FR-29). Selecting an image opens its details (side panel or inline). Results, counts and thumbnails include only what the viewer may see (FR-22). |
| Image tile | One image in the wall | A button with `aria-pressed`; click or Enter / Space selects it. At ≤ 1240 px it also carries `aria-expanded` and a second activation closes the inline details. Image alt follows the NFR-5a fallback chain; "Untitled image" when there is no title (FR-30). |
| Status tag | Processing and lifecycle state | Updates within 10 s without reload (FR-15). Always has a text label; colour is never the only signal. Stays visible when captions are hidden. |
| Own-image tick | Client views | Shown on every own image (access table A3, A4, A6, A8, A10, A12), never on A1 before its first download. An own image never shows Add to cart. |
| Price | Every price, both faces | Always "{n} USD" or "Free", excluding VAT. Staff see the price on every published image; clients see it on images they can buy, and "Free" on A1 images. |
| Captions switch | Library, Find images, My images | "Show captions", on by default. Off hides the caption lines visually only (they remain the tile's accessible name); tags, tick and selected ring stay; rows close up. No hover or focus tooltip when off. Remembered per user across visits and devices (stored with the user account). |
| Details panel | Selected image (Library, client views) or file (Upload) | Wide screens: a fixed right-hand column showing the current selection, with no close control. Library variant: view → Edit → Save changes (see Editing and saving). Upload variant: fields editable at once, autosave. Client variant: read-only, licence and download / cart actions. |
| Inline details | The Details panel at ≤ 1240 px | Library and client: the selected image takes a full row, its details open directly below it, the other images continue below; "Close details" collapses it and returns focus to the tile. Upload: the selected file row expands as an accordion with the editable fields (still autosave). Never drops below all the images. |
| Access controls | Visibility and price, Library edit mode and Upload panel | Client picker shows only for Restricted (no client ownership of public images in v1). Paid shows the amount field. Restricted with an empty client list warns that it behaves as internal-only (S4) `[ASSUMPTION]` inline under the client chips. |
| Changed-field marker | Library edit mode | Appears on a field as soon as its value differs from the saved value; disappears if changed back. |
| Save status | Details panel status line and footer | Upload: "Saved" after each autosave. Library: "No changes yet" → "Unsaved changes (n fields)" while editing; "Changes saved" in the status line after Save changes. Announced via `role="status"`. |
| Unsaved-changes dialog | Leaving Library edit mode with unsaved changes | See Editing and saving. |
| Confirm dialog | Publish with missing metadata (FR-19a / FR-19b), apply batch settings to the draft batch (FR-9), discard a draft (FR-20), revoke (FR-25) | States what will happen and to which images or licences. Revoke requires a reason; the confirm button stays disabled until one is entered (S11). Primary confirms, "Go back" cancels; Escape = Go back. |
| Context alert | Upload: filename match (FR-10b), identical file (FR-10a) | Filename match: Keep both / Discard new file, plus "Use the same answer for the other file name match" (applies to all open matches in the batch). The file cannot be published until decided. Identical file: link "Open the existing image"; "Remove from this list" dismisses the row. |
| File row | Upload file list | Click selects the file and shows it in the Details panel (or expands it inline). Files that need a decision come first ("Showing 9 of 65, files that need you first"). Failed rows have an inline "Try again". |
| To-do list | Upload sidebar | Each item filters the file list to that group (failed, file name matches, need alt text, ready to publish, still processing, not added). "Try the 3 failed again" retries all failed drafts in the batch (FR-16b). |
| Batch list | Upload sidebar | Selecting a batch loads it in main. Other staff's batches are visible and openable (drafts are visible to all staff). |
| Batch progress | Upload main | Live counts per state and a meter; the text legend carries the meaning. |
| Drop zone | Upload main | Drop or choose JPEG / PNG files; rejections appear as file rows and never stop the batch (FR-8). |
| Keyword chip | Metadata keywords | Remove with the chip's × ("Remove keyword {k}"); "Add keyword" adds one. Upload groups generated keywords by category and shows "(n of 15)" (FR-14). |
| Licence option | Client details for a buyable image | One option in v1 (standard commercial use). "Read the licence terms" opens the licence text `[ASSUMPTION]` in a dialog. |
| Cart button | Client top bar | Shows the number of cart lines; opens the Cart. |
| Pagination | Under every paged wall and long table | Previous / numbered pages / Next; keeps filters and search. |
| Data table | Clients, Licences, licence history, action log | `[ASSUMPTION]` Sortable by date where relevant, newest first; a row opens its record. |
| Empty state | Every list (NFR-7) | Replaces the list, never a blank area; offers the one next step (e.g. Clear filters). |
| Focus ring | All interactive elements | Visible on keyboard focus only (`:focus-visible`). |

## Editing and saving

Two save models, by decision. Do not mix them.

| Where | Model | Rules |
|---|---|---|
| Upload → Details panel / inline row (draft review) | **Autosave** | Fields are editable at once ("Check and correct — Changes save as you type"). Status line shows "Saved". A failed save shows "Your change was not saved. Try again." and keeps the value (FR-17). |
| Library → Details panel (any image) | **View → Edit → Save changes** | Opens in view mode (read-only values). **Edit** switches the same panel to inputs and moves focus to Title. Changed fields get the Changed-field marker; the footer shows Save changes (primary), Cancel (secondary) and the save status. **Save changes** saves, returns to view mode, shows "Changes saved", focus back on Edit. **Cancel** discards without asking and returns to view mode. No autosave. Edit mode covers every FR-17 field: title, description, alt text, keywords, place name, date taken and GPS position (latitude and longitude), plus visibility, clients and price; camera data stays read-only. Date taken and GPS are not in the mock. |

**Unsaved changes (Library).** Leaving edit mode with at least one changed field — selecting another image, closing the inline details, switching main tab — opens the Unsaved-changes dialog: "You have unsaved changes" / "Your edits to **{title}** are not saved yet. Save them before you go on, or discard them."

- **Save changes:** saves, then continues to where the user was going.
- **Discard:** drops the edits, then continues.
- **Keep editing** (or Escape): closes the dialog, stays put, focus returns to the last edited field.
- Nothing is lost silently. `[ASSUMPTION]` Reload or closing the browser tab with unsaved edits uses the browser's own leave-page prompt.

`[ASSUMPTION]` A failed Save changes keeps edit mode and the values and shows "Your change was not saved. Try again." Validation errors (alt text over 250 characters, impossible date, latitude / longitude out of range; FR-17) show under the field and block Save changes.

## Access & price display

How the access table (FR-22) shows up for a client. Rows not listed return Not found and never appear in lists, counts or thumbnails.

| Access rows | Tile caption | Own tick | Details panel actions |
|---|---|---|---|
| A1 public, free, no licence | Price "Free" | No (until first download) | Download, with "Downloading accepts the licence terms. Read the terms"; first download records a 0 USD licence and the image becomes own `[ASSUMPTION]` panel layout as the own-image panel without the tick |
| A2, A5 paid, no licence | Price ("90 USD"); "In cart" when in the cart | No | Preview (up to 800 px), Licence option, Add to cart, cart summary ("Cart: 2 images, 270 USD") + "Go to checkout" |
| A3, A4, A6, A8, A10, A12 own | "Yours to download" | Yes | "Your image", Licence card, Download (+ terms note for a free first download) |

Client details show "About the image" (description, alt text, date taken, keywords) and "Technical details" (camera + lens, exposure, pixel size + orientation, download format and size). Never GPS, place name, photographer credit, staff notes, provider details or other clients (FR-30, FR-36). Empty fields are left out.

Staff tile captions show visibility (Public with a globe, the client name for Restricted, Internal only with a lock) and price. Staff see the place and "How the metadata was made" (provider, prompt version) in the Details panel; the Place field hint says "Staff only. Clients never see the place."

`[ASSUMPTION]` A paid image already in the cart shows "In cart" with a link to the cart instead of Add to cart.

## State Patterns

| Surface | State | Treatment |
|---|---|---|
| Library | Cold load | `[ASSUMPTION]` Designsystemet skeleton tiles in the wall; sidebar and toolbar render at once. |
| Library | Empty result (FR-29) | Empty state: says no images match and offers "Clear filters". `[ASSUMPTION]` copy: "No images match your search and filters." |
| Library | Processing images | Tags on the tile: Uploading (skeleton + percentage), Queued, Generating (spinner), Ready, Failed; Draft / Archived as lifecycle tags. Updates live. |
| Library | Failed image | Failed tag; with captions on, a one-line error under the title. With captions off, the Failed tag only. |
| Library | No selection | `[ASSUMPTION]` Wide: the panel shows a one-line hint to select an image. ≤ 1240 px: no details shown. |
| Library | View / editing / unsaved / saved / save failed | See Editing and saving. |
| Library | Locked by another user (FR-18, bonus) | The panel shows the NFR-7 lock message and Edit is disabled. A lock is taken when Edit starts and released on Save changes, Cancel or Discard, on leaving the editor, or after 15 minutes idle (PRD FR-18). |
| Upload | No batch yet | `[ASSUMPTION]` Main shows batch settings (FR-9 defaults: internal-only, free, place names on) and the drop zone. |
| Upload | Uploading | "Keep this page open until the last file has uploaded. Metadata keeps generating if you leave." Leaving while files are uploading warns first (FR-15). |
| Upload | Rejected file | File row "Not added" with the NFR-7 rejection message; tag Rejected. |
| Upload | Identical file | Context alert + link to the existing image. |
| Upload | Filename match | Tag "Needs a decision"; Context alert with comparison; publish disabled with a reason. |
| Upload | AI failed | Tag Failed, the NFR-7 AI failure message on the row; "Try again" per row, "Try the 3 failed again" in the to-do list; fields can be filled by hand. |
| Upload | Missing alt text | Tag "Needs alt text"; counts in the to-do list; publishing is allowed after the missing-metadata warning (FR-19a). |
| Upload | Ready | Tag Ready; "Publish this image" enabled; batch header "Publish {n} ready images". |
| Upload | Autosave | "Saved"; on failure the NFR-7 failed-save message, value kept. |
| Upload | Batch published | `[ASSUMPTION]` Result summary: published count, and any not published with the reason (FR-19b). |
| Find images / My images | Cold load | `[ASSUMPTION]` Skeleton tiles. |
| Find images / My images | Empty result | Empty state + "Clear filters" (FR-29). My images with no own images: `[ASSUMPTION]` says so and links to Find images. |
| Overview | New contact, nothing yet | `[ASSUMPTION]` Each section shows its own one-line empty state; links to My images and Find images stay. |
| Overview | Activity (FR-38b) cut | Section not shown. |
| Cart | Empty (FR-31) | Empty state with a link to Find images; Check out not available. |
| Checkout | Line no longer available / now free / already held | Line removed with the NFR-7 removal message before anything is recorded (FR-32). |
| Checkout | Price changed | The NFR-7 price-change message; the contact confirms before anything is recorded. |
| Checkout | Terms not accepted | Check out stays disabled until the terms checkbox is ticked `[ASSUMPTION]` with the reason shown next to it. |
| Checkout | Done | Confirmation lists the bought images with Download each, or one ZIP if FR-37 is built. Bought images now show the own tick. |
| Image page (staff) | All states | Same as the Library Details panel (view / edit / unsaved / locked), with the image larger `[ASSUMPTION]`. |
| Licences (staff) | Empty / filtered empty | Empty state; with filters, "Clear filters". Revoked rows show who, when, why and the credit flag (FR-25, FR-41). |
| Licences (client) | Empty | Empty state with a link to Find images `[ASSUMPTION]`. |
| Licences (client) | Revoked licence | Shown with "removed by the agency" (FR-33). |
| Settings | Validation | Paid price must be above 0, licence text not empty (FR-40): inline field errors. API key shown masked (FR-39). Saving a new licence text says it creates a new version `[ASSUMPTION]`. |
| Action log | Empty | Empty state (NFR-7). |
| Set password | Too short / link expired or used | Inline error for fewer than 12 characters (FR-4); an expired or used link goes to Login with the NFR-7 expired-link message. |
| Clients | Setup link | Created link shown with a Copy button; `[ASSUMPTION]` a short "Copied" status after copying. A new link cancels the old (FR-4). |
| Clients | Validation | Org number (9 digits, mod-11), unique email: inline field errors (FR-1, FR-2). |
| Clients | Inactive client | Shown as inactive; never deleted (S10). |
| Login | Wrong password / expired link / inactive account | The NFR-7 messages, on the login screen. |
| Any client page | Image not allowed | Not found page (FR-22). |
| Any staff route | Requested by a contact | 403 page, no data (FR-6). |
| Any page | Session expired after 8 h idle (FR-5) | `[ASSUMPTION]` Next action goes to Login and returns to the page after login. |
| Any list | Offline / server error | `[ASSUMPTION]` Designsystemet alert at the top of main: what failed and "Try again". |

## Interaction Primitives

- **Click / Enter / Space** to act. Tiles and file rows are buttons.
- **Select, don't navigate:** choosing an image or file shows it in the Details panel without leaving the page. The full image page is one click away (open icon).
- **Escape** closes the topmost thing: dialog (= Keep editing / Go back), then the drawer.
- **Filters apply at once**; every active filter is visible and removable.
- **Live updates** for processing states (within 10 s, FR-15) without reload.
- **Hover** only adds a ring or tint; no information or action is hover-only.
- **Paged lists**, not infinite scroll (FR-29).
- **Banned:** drag-and-drop other than dropping files on the drop zone; modal stacks deeper than one; autosave in the Library; hover tooltips for hidden captions; silent loss of edits.

## Accessibility Floor

Behavioural. Visual contrast lives in `DESIGN.md` → Colors. Target WCAG 2.1 A + AA on staff and client pages (NFR-5a): axe scan with no serious or critical violations on the main pages, plus a manual keyboard pass. WCAG 2.2 AA is a bonus (NFR-5b).

- **Alt text:** alt attribute = alt text → title → "Untitled image"; no image is presented as decorative (NFR-5a). Images published without alt text are the PRD's known exception.
- **Keyboard:** every action is reachable by Tab in reading order; tiles and file rows are buttons with `aria-pressed`, and `aria-expanded` when they open inline details.
- **Focus management:** drawer open → focus into the drawer; drawer close → focus back to the toggle. Edit → focus to Title; Save changes / Cancel → focus to Edit. Close details → focus to the tile. Keep editing → focus to the last edited field. Dialogs trap focus and return it to the trigger.
- **Status announcements:** save status, unsaved count and processing updates use `role="status"` (polite). The Generating spinner is labelled "In progress".
- **Colour is never the only signal:** tags have text, prices have the icon and weight, changed fields have a "Changed" label, the batch meter is decorative (`aria-hidden`) beside a text legend.
- **Hidden captions** are hidden visually only; each tile keeps its title, client and price as its accessible name.
- **Labels:** every icon-only button has an accessible name ("Show or hide filters", "Open full image page", "More actions: archive, revoke licences", "Remove keyword {k}"). Switches use `role="switch"`.
- **Reduced motion:** spinners and skeletons stop animating.
- **Reflow:** no horizontal scroll at 360 px; nothing essential is hidden at small widths (labels become visually hidden, not removed).

## Key Flows

### UJ-1: Ida finds images for a leaflet

1. Ida opens the Library (Filters sidebar open on a wide screen).
2. She types "drone city winter" in the header search; all terms must match (FR-29).
3. She narrows with filters (Status Published, Visibility, Date taken). Each filter appears as a removable chip; the count updates ("248 images, newest first").
4. She turns off "Show captions" to see more images at once; tags stay on the images.
5. She selects a tile. The Details panel shows the image, "Who can see it", Metadata and the Camera details (or, at ≤ 1240 px, the details open under the full-width image).
6. **Climax:** the photo once named `C0930_1467.jpg` now reads "Drone view of Bryggen in winter" with its place and keywords. She presses **Staff copy** and has the full-resolution file with all metadata (FR-34).

Failure: no match → empty state with "Clear filters" (FR-29). Reference: `mockups/key-screens.html` (Library: view, captions hidden).

### UJ-2: Ida uploads a client shoot

1. Ida opens Upload and starts a batch for the Fjordkaffe AS shoot `[ASSUMPTION: "New batch" in the Batch list]`.
2. She sets batch settings once: Restricted to Fjordkaffe AS, Free, AI metadata, place names on, keywords "fjordkaffe" and "autumn campaign" (FR-9). The settings show as one line under the batch title with "Edit batch settings".
3. She drops 65 files. Rows appear at once; an identical file and a PDF land as "Not added" with their messages, a filename match lands as "Needs a decision". The rest upload and generate in the background (FR-15).
4. The to-do list tells her what needs her: 3 failed, 2 file name matches, 12 need alt text, 41 ready to publish.
5. She opens the filename match: the Context alert shows both images side by side; she picks **Keep both** and ticks "Use the same answer for the other file name match".
6. She walks the files with **Next image**, correcting titles, alt text and keywords; each change shows "Saved".
7. She presses **Try the 3 failed again**; one still fails, so she fills its fields by hand.
8. **Climax:** she presses **Publish 41 ready images**. The missing-metadata warning lists what lacks alt text; she goes back for two, confirms the rest, and the batch publishes. In Jonas's portal the images appear with the green tick.

Failure: AI fails → the NFR-7 message on the row, retry or fill in by hand. A colleague holds a lock → the NFR-7 lock message (FR-18, bonus). Autosave fails → the NFR-7 failed-save message, value kept. Leaving while files upload → warning first. Reference: `mockups/key-screens.html` (Staff: Upload).

### UJ-3: Jonas buys images for a campaign

1. Jonas logs in with email and password and lands on **Overview** for Fjordkaffe AS: own images, licences, new images made available, recent activity (FR-38a, FR-38b).
2. He goes to **Find images**. Fjordkaffe's own images carry the green tick and "Yours to download"; others show their price.
3. He searches "harbour" and filters by price.
4. He selects "Harbour at dusk, Ålesund". The Details panel shows the preview, the Licence option "Standard commercial use — 90 USD", About the image and Technical details.
5. He opens "Read the licence terms", reads them, and presses **Add to cart**. The cart button count goes to 2; the tile shows "In cart".
6. He opens the **Cart**, removes a line he no longer needs, ticks the licence terms and presses **Check out** (no payment, FR-32).
7. **Climax:** the confirmation lists the images he just licensed with Download (one ZIP if FR-37 is built). Back in Find images they now carry the green tick; in My images they are his to download any time.

Failure: a cart image became unavailable or changed price → checkout shows the NFR-7 message and asks him to confirm before anything is recorded. Reference: `mockups/key-screens.html` (Client: Find images), `mockups/more-screens.html` (Overview, Cart and checkout).

### UJ-4: Ida onboards Fjordkaffe

1. Ida opens **Clients** and creates Fjordkaffe AS: name, org number, billing email, account manager, staff notes (FR-1).
2. On the client card she adds two contacts, Jonas and a colleague (FR-2).
3. For each contact she creates a setup link and presses Copy (FR-4); she pastes it into an email from her own mail client (the app sends no email).
4. Jonas opens the link, sets a password of at least 12 characters on the Set password page.
5. **Climax:** he lands straight on Fjordkaffe's **Overview**, already showing the images the agency has made available to Fjordkaffe (continues as UJ-3 step 2).

Failure: link expired or used → login screen shows "Link expired. Contact the agency for a new one."; Ida creates a new link, which cancels the old. Wrong password → "Incorrect email or password. Contact the agency to set up a new password." Invalid org number → inline field error. Reference: `mockups/more-screens.html` (Clients).

## Responsive & Platform

| Width | Behaviour |
|---|---|
| > 1240 px | Three columns: Context sidebar (open by default), main, Details panel on the right. The Details panel has no close control. |
| ≤ 1240 px | Details move inline (Library, Upload and client views share this breakpoint): wall → the selected image takes a full row with its details directly below and "Close details"; Upload → the selected file row expands as an accordion. Sidebar stays a column. |
| ≤ 900 px | Context sidebar becomes an overlay drawer (closed by default) with the toggle on top as a close button; Escape and scrim click close it; focus returns to the toggle. Main nav and header search wrap onto their own full-width rows. Main padding 16 px. |
| ≤ 560 px | Compact wall (shorter rows, tighter gaps); file rows stack (status below the name); key-value lists become one column; the cart label and the user's name are visually hidden (icon, badge and avatar remain). The Show captions switch moves onto its own line under the count. |
| 360 px | Floor (NFR-5a): everything works, no horizontal scroll. |

Pointer and keyboard are primary; touch works through the same click targets. No hover-only actions.

## Inspiration & Anti-patterns

From ten round-1 directions and three later rounds:

- **Lifted — Split inspector (02):** the right-hand Details panel next to the grid; the base of the design.
- **Lifted — Gallery wall (01):** one continuous masonry library; filters in the toggleable sidebar.
- **Lifted — Table-first (03):** the batch overview on Upload. **Editorial calm (07):** the to-do list on Upload and per-image settings on the right.
- **Lifted — Bold accent (08):** a header plus a sidebar, settled as header-led navigation (round-2 variant A).
- **Rejected — Pipeline board (05):** work by status columns.
- **Rejected — Table-first library (03), Search-first (04, cluttered), Client-centric (06, cluttered, colours).**
- **Rejected — Editorial calm's typography (07), Soft & rounded (09, childish), medium-soft shapes (round 2):** crisp 3 px won.
- **Rejected — Collections lightbox's pen-loop selection mark (10).**
- **Rejected — a separate drafts / batches section in the Library:** draft and processing states live on each image.
- **Rejected — sidebar-led navigation (round 2 B) and split-by-frequency navigation (round 2 C).**
- **Rejected — a big Upload button in the top bar or Library header.**
- **Rejected — autosave in the Library:** Library edits need an explicit Edit and Save changes.
- **Rejected — details dropping below all images on narrower screens (round 3):** they open under the selected image.
- **Rejected — sepia / yellow-brown price, accent-coloured price, price as a tag, plain-ink price in Graphite;** cyanotype blue replaced by Graphite.
- **Rejected — dark mode, serif display type, tooltips for hidden captions.**

## Open Questions

1. **Staff Settings, Action log, staff users and Log out placement.** Assumed in the account menu; not decided.
2. **Starting a new batch.** The mock shows an existing batch with "Add more files"; the new-batch entry and the pre-upload batch settings form are not designed.
3. **Generating vs Queued dots.** In Graphite the Generating dot (accent) and Queued dot (grey) are close; tags carry text, but the facet and progress dots rely on colour plus label. Accept or change.
4. **Licence terms view.** Dialog assumed; a separate page is the alternative.
5. **UI system.** Designsystemet vs shadcn/ui is open in architecture D-031.

Resolved during Finalize (see `.memlog.md`): the Library save model (PRD FR-17 updated), edit-lock timing (PRD FR-18 updated), collections (out of v1, no slot), date taken and GPS in Library edit mode.
