# Render brief: round 3

Workspace: `_bmad-output/planning-artifacts/ux-designs/ux-g53-kalland-2026-11-18/` (repo root `/Users/marthekalland/Dev/g53-kalland-ux-design-round-3`).

The round-1 brief (`.working/render-brief.md`) and the round-2 brief (`.working/render-brief-round-2.md`) still apply. This brief adds to them and wins where they differ.

## Read first
- `.memlog.md`, especially the round-2 decisions and everything after them at the bottom.
- `.working/round2-a-header-nav.html` is the **base**. Copy it to `.working/round3-header-nav.html` and change only what this brief lists. Keep everything else as it is: theme, layout, content, components.

## Settled in round 2 (lock in, remove the alternatives)
- **Navigation:** header-led (variant A). The sidebar is contextual only.
- **Shape:** crisp (3 px base radius). Delete the `data-shape` toggle and all `[data-shape="soft"]` CSS.
- **Price:** plain (body text colour, semibold, small tag icon). "Free" uses the same treatment. Delete the `data-price` toggle and the accent and tag CSS.
- The mock switcher keeps only the screen buttons (and the new state buttons below).

## Changes in round 3
1. **No big Upload button.** Remove the primary "Upload images" button from the top bar on every staff screen. Upload is reached through the "Upload" tab in the main navigation only.
2. **Library inspector: view mode first, then Edit, then Save changes. No autosave.**
   - **View mode (default when an image is selected):** the metadata (title, description, alt text, keywords, place, who can see it, client, price) is shown as read-only values, not inputs. An **Edit** button sits in the inspector header. The other actions stay where they are.
   - **Edit mode:** the same fields become inputs. An unsaved-changes state shows once a field has changed (for example a small "Unsaved changes" status text near the buttons and a marker on the changed field). The footer has **Save changes** (primary) and **Cancel** (secondary). Save changes returns to view mode with a short confirmation. Cancel discards the changes and returns to view mode.
   - Remove the "Saved 10:42" autosave status from the Library inspector.
   - Add switcher buttons so both states can be seen: "Library: view", "Library: editing (unsaved)". The editing state shows one field already changed. The Edit, Save changes and Cancel buttons must also work by clicking inside the mock.
3. **Upload panel keeps autosave.** The per-image metadata review on the Upload screen stays editable directly and keeps its "Saved" status. Do not add an Edit step there.
4. **Fix the sidebar toggle on tablet and phone.** Today the open sidebar (overlay drawer) covers the toggle button, so it cannot be closed with the toggle. Requirements:
   - On every width where the sidebar is an overlay, the toggle button stays visible and clickable while the drawer is open, and closing works with it.
   - The drawer can also be closed with Escape and by clicking outside it.
   - `aria-expanded` on the toggle matches the state. When the drawer closes, focus goes back to the toggle.
   - Applies to all three screens (Library, Upload, Client).

## Output and checks
- Write `.working/round3-header-nav.html`. Do not edit the round-1 or round-2 files.
- Screenshot with headless Chrome at 1440×1000 for each switcher state (Library view, Library editing, Upload, Client) and look at the screenshots (Read the PNG). Write screenshots to the scratchpad given in your prompt, never into the repo.
- Check tablet (about 800 px) and phone (360 px) with the drawer **open**, using a wrapper page with an `<iframe>` of that width and `--allow-file-access-from-files`. Confirm in the screenshot that the toggle is visible on top of or beside the drawer.
- Check that no screen scrolls sideways at 360 px.
- Grep that every `ds-*` class exists in `vendor/ds-index.css`.
- Return only: the file path, a short list of what changed, how the toggle fix works, and any problems left.
