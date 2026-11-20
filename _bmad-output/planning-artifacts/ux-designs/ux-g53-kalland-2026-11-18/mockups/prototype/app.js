/* ==========================================================================
   CRM-DAM clickable prototype: app.js (foundation and contract)
   ==========================================================================

   Spines win on any conflict: ../../DESIGN.md (look) and ../../EXPERIENCE.md
   (behaviour). The PRD access table (A1-A13, S1-S15) is implemented once, in
   App.access below; screens never re-implement visibility or price rules.

   LOAD ORDER (index.html, classic scripts, works from file://, no modules,
   no fetch, no build, no external JS):
     app.js -> screens/auth.js -> screens/library.js -> screens/upload.js
     -> screens/admin.js -> screens/client.js -> boot.js (calls App.start()).
   Screen files run before App.start(), so at load time they may only call
   App.registerScreen (and define their own private helpers). Read App.store
   lazily inside render/mount, never cache it at load time (Reset data
   replaces the whole object).

   --------------------------------------------------------------------------
   1. GLOBALS
   --------------------------------------------------------------------------
   window.App is the only global. Everything below hangs off it.

   --------------------------------------------------------------------------
   2. STORE  (App.store; plain JSON, saved to sessionStorage on App.save())
   --------------------------------------------------------------------------
   App.store = {
     version: 1,
     users:    [{ id:'u-ida', name, firstName, email, role:'admin'|'staff', active, prefs:{captions:true} }],
     clients:  [{ id:'c-fjord', name, orgNo:'921456786', billingEmail, accountManagerId:'u-ida',
                  notes, active, createdAt }],
     contacts: [{ id:'k-jonas', clientId, name, firstName, email, phone, active,
                  passwordSet, lastLoginAt|null, prevLoginAt|null (login before the current one), prefs:{captions:true} }],
     setupLinks: [{ token, contactId|null, userId|null (staff link), createdBy, createdAt, expiresAt, usedAt|null, cancelledAt|null }],
     images:   [{ id, fileName, title ('' = untitled), description, altText, keywords:[],
                  place, gps:{lat,lng}|null, dateTaken:'YYYY-MM-DDTHH:mm'|null,
                  camera, lens, exposure:{focal:24, aperture:2.8, shutter:'1/60', iso:400}|null,
                  size:{w,h,format:'JPEG'|'PNG',bytes},
                  ph:'p-bryggen'|null   (placeholder photo class from app.css; null while uploading),
                  status:'draft'|'published'|'archived',
                  processing:'uploading'|'queued'|'generating'|'ready'|'failed',
                  progress: 0-100 (uploading only), error: string|null (failed only, the *reason* part of NFR-7),
                  visibility:'public'|'restricted'|'internal', clients:[clientId] (restricted only),
                  price: 0 = Free, else whole USD ex VAT,
                  createdAt, uploadedBy:userId, batchId|null,
                  provider:{ name, promptVersion, generatedAt }|null, editedBy:userId|null,
                  lockedBy:{ userId, since }|null  (FR-18; the prototype ignores the 15-min expiry),
                  notes: '' (staff notes) }],
     licences: [{ id, imageId, clientId, contactId|null, price, currency:'USD', date:'YYYY-MM-DD',
                  source:'purchase'|'free-download'|'staff-grant', licenceTypeId, textSnapshot,
                  revoked: null | { by:userId, date, reason, credit:boolean } }],
     downloads: [{ id, imageId, contactId, clientId, at }],
     batches:  [{ id, name, ownerId, createdAt,
                  settings:{ visibility, clients:[], price, ai:true, placeNames:true, keywords:[] },
                  files:[{ id, fileName, bytes, imageId|null,
                           rejected: null | { reason:'identical'|'type'|'size'|'damaged', existingImageId? },
                           match:    null | { imageId, answer:null|'keep-both'|'discard' },
                           dismissed:false }] }],
     carts:    { [contactId]: [{ imageId, priceAtAdd, addedAt }] },
     settings: { licenceType:{ id:'lt-standard', name:'Standard commercial use', price:120, currency:'USD',
                               text, isSample:true, updatedAt },
                 aiProvider:{ name:'Mock (test mode)', mode:'mock', keyMasked:'', promptVersion:'v3',
                              placeNames:true } },
     actionLog: [{ id, at, actorKind:'staff'|'contact', actorId, actorName, action, detail }],
     session:  null | { role:'staff', userId } | { role:'client', contactId },
     ui:       {}   // free per-area state that should survive reload; namespace it: ui.library, ui.upload ...
   }
   Counts shown in the UI must be derived from this data, never hard-coded.
   Seed highlights: Jonas (Fjordkaffe) has 'Drone view of Bryggen in winter' (120 USD) and
   'Mountain ridge above the fjord' (added at 150, now 180 USD -> price-change confirm) in his
   cart. Fjordkaffe has 12 licences (one revoked, credit flagged). 'Harbour at dusk, Ålesund' is
   locked by Tor. Batch 'b-fjord-autumn' mirrors key-screens Upload. Setup links: token
   'lindas-7Hq2-4pVt' is valid (Liv Haugland, Lindås Bakeri); 'kari-Xk4m-81Ld' is used.

   --------------------------------------------------------------------------
   3. ROUTES  (hash routes; params come in as one object: path params + params.query)
   --------------------------------------------------------------------------
   public : #/login, #/set-password/:token                                  (screens/auth.js)
   any    : #/403, #/404                                                     (built in)
   staff  : #/library, #/library/:imageId, #/image/:id                       (library.js)
            #/upload, #/upload/:batchId                                      (upload.js)
            #/clients, #/clients/:id, #/licences, #/settings, #/log          (admin.js)
   client : #/overview, #/my-images, #/my-images/:imageId, #/find, #/find/:imageId,
            #/licences, #/cart, #/checkout, #/checkout/done                  (client.js)
   Rules: not logged in -> #/login (and back to the page after login). Logged in on #/login ->
   home (staff #/library, client #/overview). Contact on a staff route -> 403 (FR-6, S6).
   Staff on a client-only route -> Not found. Unknown path -> Not found. Built-in param checks
   give Not found: unknown image / batch / client id; client :imageId the contact may not see
   (App.access.canSee), and for #/my-images/:imageId also not own (FR-22). A deactivated
   contact, inactive client or inactive staff user is logged out on the next route (S1, S2).
   Search: the header search goes to #/library?q=... (staff) or #/find?q=... (client).
   Paging and filters live in the query (App.href builds it).
   A registered route that has no screen yet shows a neutral "Screen not built yet" page.

   --------------------------------------------------------------------------
   4. REGISTERING A SCREEN
   --------------------------------------------------------------------------
   App.registerScreen('/library', {
     role: 'staff' | 'client' | 'public',          // required; '/licences' exists for both roles
     title: 'Library' | fn(params) -> string,      // document.title
     nav: 'library',                               // optional; main nav key to mark aria-current
                                                   //   (default: first path segment; 'image' -> library;
                                                   //    'cart'/'checkout' mark the cart button)
     sidebar: fn(params) -> html,                  // optional; Context sidebar content (side-sec ...)
     sidebarLabel: 'Filters',                      // aria-label of the sidebar <aside>
     sidebarToggleLabel: 'Show or hide filters',   // accessible name of the toggle
     render: fn(params) -> html,                   // required; content of <main>
     details: fn(params) -> html,                  // optional; Details panel content (right column).
                                                   //   Empty output = no panel: the column takes no space
     detailsLabel: 'Selected image',
     inlineDetails: true,                          // default true; false keeps details as a column
     onCloseDetails: fn(collapse),                 // optional; "Close details" clicked. Call collapse()
                                                   //   when done (e.g. after the unsaved-changes dialog)
     mount: fn(rootEl, params) -> cleanup?         // optional; after render. rootEl = #app
   });
   Registering a pattern not in the table above adds it for that role (e.g. '/clients/new').
   Literal segments beat :params. HTML: return App.h`...` (or a trusted string).
   Events: prefer App.on(type, selector, handler) inside mount; those listeners are removed on
   the next route automatically. A function returned from mount runs on leave.

   --------------------------------------------------------------------------
   5. SHELL DOM (rendered by the foundation; screen CSS can rely on it)
   --------------------------------------------------------------------------
   <div id="app" class="app [no-sb]" data-role="staff|client" data-route="/library"
        data-sidebar="open|closed" data-captions="on|off">
     <header class="topbar"> [button.ds-button[data-sidebar-toggle]] a.wordmark
        nav.mainnav  form.hsearch[data-hsearch] > .ds-search > input#hsearch
        .topbar-end > [a.cart-btn] .acct > button.who.acct-btn[data-acct-toggle] + .acct-menu#acct-menu
     <div class="workspace [no-insp]">
        <aside class="sidebar" id="app-sidebar" tabindex="-1">  (only with def.sidebar)
        <main class="main" id="main" tabindex="-1">              (flash alert first, then render())
        <aside class="inspector" id="app-details">               (only with def.details)
           .insp-inline-bar > button[data-details-close]  (visible only when inline)
           <div class="details-body" id="app-details-body">   (details() output)
   Public screens (role 'public') get #app with class "app auth-app" and render() output only.
   The prototype pill (#proto-pill) and the live region (#app-status) live outside #app.
   Existing CSS for content: see app.css (wall, tile, shot, cap, meta, price, own, insp-head,
   loupe, statusline, insp-sec, insp-foot, dl.ro, dl.facts, dl.kv, access-key, batch-*, files,
   file-row, todo, blist, vlist, facet, chips, card-sec, sec-head, sec-body, people, person,
   setup-link, strip, counts, lic-table, rows, act, lines, cline, sum, terms, empty, page-head,
   page-title, page-sub, toolbar-meta, pager, empty-state, ...).

   --------------------------------------------------------------------------
   6. HELPERS (signatures)
   --------------------------------------------------------------------------
   Markup     App.h`...${x}...`  -> App.Raw  (escapes x; App.Raw / arrays of Raw pass through;
                                              null/undefined/false render nothing)
              App.raw(htmlString) -> App.Raw   App.esc(s) -> string
              App.icon(name, {label?, cls?}) -> Raw   (name without 'i-': 'globe', 'price', 'check' ...)
              App.price(n, {lg?}) -> Raw   ("120 USD" / "Free", slate grey + tag icon)
              App.statusTag(kind, label?) -> Raw   kinds: draft published archived uploading queued
                  generating ready failed needs-decision rejected needs-alt active inactive revoked
                  price-changed in-cart removed
              App.tileTags(image) -> Raw   (lifecycle + processing tags drawn on a staff tile)
              App.visibilityMeta(image) -> Raw   (globe Public / users client names / lock Internal only)
              App.tile(image, {viewer?:'staff'|'client', contact?, selected?, href?}) -> Raw (<li>)
                  button.tile[data-pick][data-id][aria-pressed]; with href an <a class="tile">.
              App.wall(images, {label?, selectedId?, viewer?, contact?, hrefFor?}) -> Raw
                  ul.wall[data-select-group]
              App.pager({page, perPage, total, hrefFor(page)}) -> Raw  ("Showing 1–14 of 30" + pages)
              App.paginate(list, page, perPage) -> {items, page, pages, total, from, to}
              App.emptyState(text, action?) -> Raw   action: {label, href} | {label, attrs:'data-x'} | Raw
              App.avatar(name, {size?}) -> Raw
              App.captionsSwitch(idSuffix) -> Raw   ("Show captions" switch, wired by the foundation)
              App.licenceTermsHTML(text?) -> Raw
   Data       App.find.image(id) .client(id) .contact(id) .user(id) .batch(id) .licence(id)
              App.imageTitle(image) ("Untitled image" fallback)  App.altFor(image) (NFR-5a chain)
              App.ratio(image)  App.loupeClass(image) -> 'r32'|'r23'|'r45'|'r43'|'r169'|''
              App.clientNames(ids) -> 'Fjordkaffe AS, ...'
              App.search.images(list, q, {viewer}) (all terms, case-insensitive; staff also match place)
              App.sortNewest(list)   App.batchFileState(file) -> 'uploading'|'queued'|'generating'|
                  'failed'|'needs-decision'|'needs-alt'|'ready'|'published'|'archived'|'rejected'|'discarded'
              App.uid(prefix)   App.nowISO()   App.todayISO()
   Format     App.fmt.date(iso) '14 Nov 2026'  .dateShort '14 Nov'  .dateTime '14 Jan 2026, 16:52'
              .time '16:52'  .day(iso) 'Today'|'Yesterday'|'12 Nov'  .bytes(n) '21.4 MB'
              .plural(n, 'image', 'images?') '2 images'  .exposure(image)  .pixels(image)
              .orgNo('921456786') '921 456 786'
   Access     App.access.row(clientId, image) -> 'A1'..'A13'  (S4: restricted with no clients = internal)
              App.access.activeLicence(clientId, imageId) -> licence|null (revoked = none)
              App.access.isOwn(clientId, image)     (A3 A4 A6 A8 A10 A12)
              App.access.canSee(contact, image)     (contact object or id; inactive contact/client -> false)
              App.access.canDownload(contact, image) (own, or A1)
              App.access.canBuy(contact, image)     (A2, A5)
              App.access.visibleImages(contact) / ownImages(clientId)  (newest first)
              App.access.clientFields(image) -> copy without place, gps, provider, notes, clients (FR-30)
   Actions    App.cart.lines(contactId) .count(contactId) .has(contactId, imageId)
              .add(contactId, imageId) -> bool (refuses unless canBuy)  .remove(contactId, imageId)
              App.licences.forClient(clientId) / forImage(imageId)  (newest first)
              App.licences.record({imageId, clientId, contactId, price, source}) -> licence
                  (one active licence per client and image, S5: returns the existing one)
              App.licences.revoke(licenceId, reason) -> licence (credit flag if paid; removes the
                  client from the image's list, FR-25)
              App.licences.download(contact, imageId) -> {ok, firstDownload, licence}
                  (records the 0 USD licence on a first A1/A4 download, logs the download)
              App.locks.holder(image) -> user|null
   Session    App.session()  App.isStaff()  App.isClient()  App.currentUser()  App.currentContact()
              App.currentClient()  App.login(session, {to?})  App.logout()  App.homeFor(session)
              App.prefs.get(key, fallback) / set(key, value)   (stored on the user / contact)
   UI         App.dialog({title, body, actions:[{label, value, variant?, color?}], className?,
                  initialFocus?, onOpen?(dlg), beforeClose?(action, values, dlg) -> errorText|falsy})
                  -> Promise<{action, values}>  (native <dialog>, one at a time; Escape or an action
                  with value null/'' -> action null; values = named fields in the body)
              App.confirm({title, body, confirm, cancel:'Go back', danger?}) -> Promise<boolean>
              App.licenceTermsDialog()   (any element with [data-licence-terms] also opens it)
              App.status(msg)  polite live region      App.flash(text, {color?, heading?})
                  (alert at the top of the next rendered page)  App.takeFlash()
              App.log(action, detail)  appends to actionLog with the current actor
              App.save()  App.reset()
              App.navigate(hash, {replace?})  App.href(path, query) -> '#/path?x=1'
              App.current() -> {path, pattern, role, params, def}
              App.refresh(slot?)  slot: 'main'|'sidebar'|'details'|'topbar'; none = whole route
              App.refreshChrome()  (cart badge and account in the top bar)
              App.on(type, selector, handler(event, matchedEl))  route-scoped delegated listener
              App.setLeaveGuard(fn(targetHash) -> boolean|Promise<boolean>)  asked before any hash
                  change, logout or role switch; cleared on route change
              App.setUnloadWarning(bool)  browser leave-page prompt (Upload while uploading,
                  Library unsaved edits)
              App.details.place(pickEl|null)  show the Details panel for the selected tile / file row:
                  right column above 1240 px; inline below (wall: after the tile's <li>, which gets
                  .is-open; file list: inside the row's <li>); sets aria-expanded on [data-pick].
              App.details.isInline()  App.details.collapse()  App.details.currentId()
              App.isNarrow() (<= 900 px)   App.isTight() (<= 1240 px)
   ========================================================================== */
(function (window, document) {
  'use strict';

  const App = (window.App = {});
  const STORAGE_KEY = 'crm-dam-prototype-v1';

  /* ======================================================================
     Dates
     ====================================================================== */
  function pad(n) { return String(n).padStart(2, '0'); }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function isoDateTime(d) { return isoDate(d) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function daysFromToday(n, time) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return isoDate(d) + (time ? 'T' + time : '');
  }
  App.todayISO = () => isoDate(new Date());
  App.nowISO = () => isoDateTime(new Date());

  /* ======================================================================
     Seed data
     ====================================================================== */
  const LICENCE_TEXT = [
    'The agency grants the client a non-exclusive, non-transferable right to use the image in its own marketing and communication: print, web, social media, packaging and presentations. The licence does not expire.',
    'The client may crop, resize and adjust colour. The client may not resell the image, offer it as a stock image, or use it in a logo or trademark.',
    'The photographer is credited where it is practical. The licence belongs to the client organisation, not to the contact who accepted it, and lasts if that contact leaves.',
    'Prices exclude VAT.'
  ].join('\n\n');

  function seed() {
    /* Today's seed times are written as clock times up to 10:44. They are shifted so that 10:44
       lands 5 minutes before the moment of seeding, keeping their order and never lying in the future. */
    const T = (time) => {
      const [hh, mm] = time.split(':').map(Number);
      const minutesBefore = (10 * 60 + 44) - (hh * 60 + mm) + 5;
      return isoDateTime(new Date(Date.now() - minutesBefore * 60000));
    };
    const Y = (time) => daysFromToday(-1, time);
    const provider = (at) => ({ name: 'Mock (test mode)', promptVersion: 'v3', generatedAt: at });

    function img(id, o) {
      const base = {
        id, fileName: id.replace(/^img-/, '') + '.jpg', title: '', description: '', altText: '', keywords: [],
        place: '', gps: null, dateTaken: null, camera: '', lens: '', exposure: null,
        size: { w: 6000, h: 4000, format: 'JPEG', bytes: 18200000 }, ph: null,
        status: 'published', processing: 'ready', progress: 0, error: null,
        visibility: 'public', clients: [], price: 0, createdAt: '2026-01-01T09:00', uploadedBy: 'u-ida',
        batchId: null, provider: null, editedBy: null, lockedBy: null, notes: ''
      };
      const out = Object.assign(base, o);
      if (!out.provider && out.processing === 'ready' && out.title) out.provider = provider(out.createdAt);
      return out;
    }
    const sz = (w, h, mb, format) => ({ w, h, format: format || 'JPEG', bytes: Math.round(mb * 1e6) });
    const fjordShoot = { visibility: 'restricted', clients: ['c-fjord'], price: 0, uploadedBy: 'u-ida', batchId: 'b-fjord-autumn', status: 'draft' };
    const fjordKw = ['fjordkaffe', 'autumn campaign'];
    const fx7 = { camera: 'Fujifilm X-T5', lens: 'XF 33 mm F1.4', dateTaken: '2026-11-12T10:20', place: 'Fjordkaffe Bryggen, Bergen, Vestland, Norway' };

    const images = [
      img('img-bryggen', { fileName: 'C0930_1467.jpg', title: 'Drone view of Bryggen in winter', ph: 'p-bryggen',
        description: 'Snow on the wooden rooftops of Bryggen seen from above on a January evening, with a few windows lit along the wharf.',
        altText: 'Drone view of snow-covered rooftops at Bryggen in Bergen, with a few lit windows',
        keywords: ['drone', 'winter', 'rooftops', 'snow', 'Bergen', 'Bryggen'], place: 'Bryggen, Bergen, Vestland, Norway',
        gps: { lat: 60.3975, lng: 5.3242 }, dateTaken: '2026-01-14T16:52', camera: 'DJI Mavic 3 Pro', lens: 'Hasselblad 24 mm',
        exposure: { focal: 24, aperture: 2.8, shutter: '1/60', iso: 400 }, size: sz(5280, 3956, 21.4),
        visibility: 'public', price: 120, createdAt: '2026-01-14T18:10', editedBy: 'u-ida' }),
      img('img-harbour', { fileName: 'DSC_4410.jpg', title: 'Harbour at dusk, Ålesund', ph: 'p-harbour',
        description: 'The inner harbour in Ålesund at dusk, with a pink sky and the lights of the Art Nouveau houses reflected in still water.',
        altText: 'Harbour at dusk in Ålesund with pink sky and lights reflected in the water',
        keywords: ['harbour', 'dusk', 'Ålesund', 'reflection', 'city lights'], place: 'Brosundet, Ålesund, Møre og Romsdal, Norway',
        gps: { lat: 62.4723, lng: 6.1497 }, dateTaken: '2026-09-28T19:41', camera: 'Nikon Z8', lens: 'NIKKOR Z 24-70 mm f/2.8 S',
        exposure: { focal: 35, aperture: 8, shutter: '2', iso: 64 }, size: sz(6000, 3375, 19.6),
        price: 90, createdAt: '2026-10-02T11:05', uploadedBy: 'u-tor', batchId: 'b-tor-harbour',
        lockedBy: { userId: 'u-tor', since: T('09:55') } }),
      img('img-ridge', { fileName: 'IMG_8812.jpg', title: 'Mountain ridge above the fjord', ph: 'p-ridge',
        description: 'A sharp mountain ridge above a deep blue fjord on a clear late-summer day.',
        altText: 'Mountain ridge above a fjord on a clear day', keywords: ['mountain', 'ridge', 'fjord', 'summer', 'landscape'],
        place: 'Romsdalseggen, Rauma, Møre og Romsdal, Norway', gps: { lat: 62.5583, lng: 7.6869 }, dateTaken: '2025-08-30T13:15',
        camera: 'Canon EOS R5', lens: 'RF 24-105 mm F4 L', exposure: { focal: 40, aperture: 11, shutter: '1/250', iso: 100 },
        size: sz(8256, 5504, 24.9), price: 180, createdAt: '2025-09-10T09:30' }),
      img('img-fjord', { fileName: 'IMG_9120.jpg', title: 'Still morning on Sognefjorden', ph: 'p-fjord',
        description: 'Calm water on Sognefjorden in the early morning, with a green headland under a pale sky.',
        altText: 'Calm fjord with a green headland under a pale sky', keywords: ['fjord', 'morning', 'calm', 'Sognefjorden'],
        place: 'Balestrand, Sogndal, Vestland, Norway', gps: { lat: 61.2081, lng: 6.5336 }, dateTaken: '2026-10-19T07:02',
        camera: 'Canon EOS R5', lens: 'RF 24-105 mm F4 L', exposure: { focal: 50, aperture: 8, shutter: '1/125', iso: 100 },
        size: sz(6000, 4500, 17.3), createdAt: '2026-10-25T14:00' }),
      img('img-market', { fileName: 'DSC_2051.jpg', title: 'Bergen fish market at dawn', ph: 'p-market',
        description: 'Stalls with red awnings being set up at the fish market in Bergen just after sunrise.',
        altText: 'Bergen fish market at dawn with stalls and red awnings', keywords: ['market', 'fish market', 'dawn', 'Bergen'],
        place: 'Fisketorget, Bergen, Vestland, Norway', gps: { lat: 60.3946, lng: 5.3254 }, dateTaken: '2026-05-16T05:48',
        camera: 'Nikon Z8', lens: 'NIKKOR Z 24-70 mm f/2.8 S', exposure: { focal: 28, aperture: 5.6, shutter: '1/200', iso: 400 },
        size: sz(6000, 4500, 16.8), price: 60, createdAt: '2026-05-18T10:15', uploadedBy: 'u-tor' }),
      img('img-cyclist', { fileName: 'NS_cat_0112.jpg', title: 'Cyclist on gravel road in Nordmarka', ph: 'p-cyclist',
        description: 'A cyclist in a red jacket rides a gravel road through spruce forest.',
        altText: 'Cyclist in a red jacket on a gravel road through spruce forest', keywords: ['cycling', 'gravel', 'forest', 'Nordlys Sykkel'],
        place: 'Nordmarka, Oslo, Norway', gps: { lat: 60.0, lng: 10.68 }, dateTaken: '2026-10-04T11:30',
        camera: 'Sony A7 IV', lens: 'FE 70-200 mm F4', exposure: { focal: 135, aperture: 4, shutter: '1/1000', iso: 320 },
        size: sz(4000, 6000, 15.1), visibility: 'restricted', clients: ['c-nordlys'], createdAt: Y('14:40'), batchId: 'b-nordlys-spring' }),
      img('img-trail', { fileName: 'NS_cat_0131.jpg', title: 'Trail runner on the ridge', ph: 'p-ridge',
        description: 'A trail runner crossing a rocky ridge with the valley below.',
        altText: 'Trail runner crossing a rocky mountain ridge', keywords: ['running', 'ridge', 'mountain', 'Nordlys Sykkel'],
        place: 'Jotunheimen, Innlandet, Norway', dateTaken: '2026-09-21T09:12', camera: 'Sony A7 IV', lens: 'FE 24-70 mm F2.8 GM II',
        exposure: { focal: 50, aperture: 5.6, shutter: '1/1600', iso: 200 }, size: sz(4000, 5000, 13.9),
        visibility: 'restricted', clients: ['c-nordlys'], createdAt: Y('14:42'), batchId: 'b-nordlys-spring' }),
      img('img-aurora', { fileName: 'LY_0907.jpg', title: 'Northern lights over Lyngen', ph: 'p-aurora',
        description: 'Green northern lights over a dark ridge in the Lyngen Alps.', altText: 'Northern lights over a dark ridge',
        keywords: ['aurora', 'northern lights', 'night', 'Lyngen'], place: 'Lyngen, Troms, Norway', dateTaken: '2025-11-21T22:40',
        camera: 'Sony A7S III', lens: 'FE 14 mm F1.8 GM', exposure: { focal: 14, aperture: 1.8, shutter: '6', iso: 3200 },
        size: sz(4000, 4000, 12.2), status: 'archived', visibility: 'restricted', clients: ['c-nordlys'], price: 80, createdAt: '2025-11-30T12:00' }),
      img('img-tram', { fileName: 'BW_0207.jpg', title: 'Snowy street with tram lights', ph: 'p-tram',
        description: 'A snowy street in Bergen at night, lit by the lights of a passing tram.', altText: 'Snowy street at night with tram lights',
        keywords: ['snow', 'night', 'tram', 'Bergen', 'winter'], place: 'Kaigaten, Bergen, Vestland, Norway', dateTaken: '2026-11-14T21:05',
        camera: 'Fujifilm X-T5', lens: 'XF 23 mm F1.4', exposure: { focal: 23, aperture: 1.4, shutter: '1/60', iso: 1600 },
        size: sz(4000, 3000, 11.4), status: 'draft', visibility: 'internal', createdAt: daysFromToday(-4, '14:31'),
        uploadedBy: 'u-tor', batchId: 'b-tor-winter' }),
      img('img-floibanen', { fileName: 'BW_0211.jpg', title: 'Snow on the Fløibanen tracks', ph: 'p-tram',
        description: 'Fresh snow on the funicular tracks up Mount Fløyen at dusk.', altText: 'Funicular tracks covered in snow at dusk',
        keywords: ['snow', 'funicular', 'Fløibanen', 'Bergen', 'winter'], place: 'Fløyen, Bergen, Vestland, Norway', dateTaken: '2026-11-14T16:20',
        camera: 'Fujifilm X-T5', lens: 'XF 23 mm F1.4', exposure: { focal: 23, aperture: 4, shutter: '1/125', iso: 800 },
        size: sz(6000, 4000, 14.0), visibility: 'internal', createdAt: daysFromToday(-4, '14:33'), uploadedBy: 'u-tor', batchId: 'b-tor-winter' }),
      img('img-tramstop', { fileName: 'DSC_1880.jpg', title: 'Tram stop at Byparken', ph: 'p-tram',
        description: 'People waiting at the Byparken tram stop on a grey winter afternoon.', altText: 'People waiting at a tram stop in winter',
        keywords: ['tram', 'city', 'winter', 'Bergen', 'commute'], place: 'Byparken, Bergen, Vestland, Norway', dateTaken: '2025-12-12T15:10',
        camera: 'Nikon Z8', lens: 'NIKKOR Z 24-70 mm f/2.8 S', exposure: { focal: 50, aperture: 4, shutter: '1/250', iso: 800 },
        size: sz(6000, 4000, 17.9), price: 70, createdAt: '2025-12-20T10:00', uploadedBy: 'u-tor' }),
      img('img-latte', { fileName: 'FK_shoot_0312.jpg', title: 'Barista pouring latte art', ph: 'p-latte',
        description: 'A barista pours a heart in latte art into a white cup, close-up in warm light.',
        altText: 'Barista pouring a heart in latte art into a white cup, close-up in warm light',
        keywords: ['coffee', 'latte art', 'barista', 'café', 'fjordkaffe'], place: 'Fjordkaffe Bryggen, Bergen, Vestland, Norway',
        dateTaken: '2026-11-03T09:40', camera: 'Fujifilm X-T5', lens: 'XF 33 mm F1.4', exposure: { focal: 33, aperture: 2, shutter: '1/250', iso: 640 },
        size: sz(4000, 5000, 12.6), visibility: 'restricted', clients: ['c-fjord'], createdAt: '2026-11-10T13:20' }),
      img('img-pack', { fileName: 'FK_shoot_0420.jpg', title: 'Fjordkaffe bag, summer label', ph: 'p-pack',
        description: 'A Fjordkaffe coffee bag with the summer label on a pale table.', altText: 'Fjordkaffe coffee bag on a pale table',
        keywords: ['packaging', 'coffee bag', 'summer', 'fjordkaffe'], place: 'Studio, Bergen, Vestland, Norway', dateTaken: '2026-06-12T11:00',
        camera: 'Canon EOS R5', lens: 'RF 100 mm F2.8 L Macro', exposure: { focal: 100, aperture: 8, shutter: '1/160', iso: 100 },
        size: sz(6000, 4000, 16.2), visibility: 'restricted', clients: ['c-fjord'], createdAt: '2026-06-20T09:10' }),
      img('img-roaster', { fileName: 'FK_shoot_0390.jpg', title: 'Roaster drum at Fjordkaffe', ph: 'p-roaster',
        description: 'The coffee roaster drum in the dark roastery, with warm light from a window.',
        altText: 'Coffee roaster drum in a dark roastery with warm light from a window', keywords: ['roastery', 'coffee', 'roaster', 'fjordkaffe'],
        place: 'Fjordkaffe roastery, Bergen, Vestland, Norway', dateTaken: '2026-10-28T08:15', camera: 'Fujifilm X-T5', lens: 'XF 23 mm F1.4',
        exposure: { focal: 23, aperture: 2, shutter: '1/125', iso: 1250 }, size: sz(4000, 5000, 13.1),
        visibility: 'restricted', clients: ['c-fjord'], createdAt: '2026-11-01T10:00' }),
      img('img-barista', { fileName: 'FK_shoot_0355.jpg', title: 'Barista behind the counter', ph: 'p-barista',
        description: 'A smiling barista behind the counter in a dark café.', altText: 'Barista behind the counter, smiling, in a dark café',
        keywords: ['barista', 'café', 'portrait', 'fjordkaffe'], place: 'Fjordkaffe Bryggen, Bergen, Vestland, Norway', dateTaken: '2026-11-03T10:05',
        camera: 'Fujifilm X-T5', lens: 'XF 56 mm F1.2', exposure: { focal: 56, aperture: 1.4, shutter: '1/200', iso: 800 },
        size: sz(4000, 6000, 14.4), visibility: 'restricted', clients: ['c-fjord'], createdAt: '2026-11-08T09:30' }),
      img('img-filtercup', { fileName: 'FK_shoot_0361.jpg', title: 'Filter coffee from above', ph: 'p-filter',
        description: 'A cup of filter coffee on a green table, seen from above.', altText: 'Cup of filter coffee seen from above on a green table',
        keywords: ['filter coffee', 'cup', 'flat lay', 'fjordkaffe'], place: 'Fjordkaffe Bryggen, Bergen, Vestland, Norway', dateTaken: '2026-11-03T10:30',
        camera: 'Fujifilm X-T5', lens: 'XF 33 mm F1.4', exposure: { focal: 33, aperture: 4, shutter: '1/160', iso: 400 },
        size: sz(4000, 4000, 10.8), visibility: 'restricted', clients: ['c-fjord'], createdAt: '2026-11-08T09:32' }),
      img('img-cafe', { fileName: 'IMG_2207.jpg', title: 'Café window on a rainy evening', ph: 'p-cafe',
        description: 'A café window on a rainy evening, with warm lamps inside and rain streaks on the glass.',
        altText: 'Café window on a rainy evening with warm lamps inside', keywords: ['café', 'rain', 'evening', 'window', 'cosy'],
        place: 'Marken, Bergen, Vestland, Norway', dateTaken: '2026-02-11T18:25', camera: 'Nikon Z8', lens: 'NIKKOR Z 50 mm f/1.8 S',
        exposure: { focal: 50, aperture: 1.8, shutter: '1/100', iso: 1600 }, size: sz(6000, 4000, 18.0),
        price: 90, createdAt: '2026-02-20T15:00', uploadedBy: 'u-tor' }),
      img('img-beans', { fileName: 'FK_shoot_0402.jpg', title: 'Roasted coffee beans on linen', ph: 'p-beans',
        description: 'Roasted coffee beans spread on a pale linen cloth.', altText: 'Roasted coffee beans spread on a pale linen cloth',
        keywords: ['coffee beans', 'roasted', 'linen', 'fjordkaffe'], place: 'Studio, Bergen, Vestland, Norway', dateTaken: '2026-06-12T11:40',
        camera: 'Canon EOS R5', lens: 'RF 100 mm F2.8 L Macro', exposure: { focal: 100, aperture: 11, shutter: '1/160', iso: 100 },
        size: sz(6000, 4000, 15.5), visibility: 'restricted', clients: ['c-fjord'], createdAt: '2026-06-20T09:12' }),
      img('img-quay', { fileName: 'FK_shoot_0244.jpg', title: 'Coffee on the quay at Bryggen', ph: 'p-latte',
        description: 'A takeaway latte on the quay at Bryggen, with the wharf houses out of focus behind.',
        altText: 'Takeaway latte on a quay with old wharf houses behind', keywords: ['coffee', 'takeaway', 'Bryggen', 'fjordkaffe'],
        place: 'Bryggen, Bergen, Vestland, Norway', dateTaken: '2026-08-06T12:10', camera: 'Fujifilm X-T5', lens: 'XF 33 mm F1.4',
        exposure: { focal: 33, aperture: 2, shutter: '1/1000', iso: 160 }, size: sz(4000, 3000, 11.0),
        visibility: 'restricted', clients: ['c-fjord'], createdAt: '2026-08-10T09:00' }),
      img('img-cups', { fileName: 'FK_shoot_0230.jpg', title: 'Takeaway cups on a café counter', ph: 'p-pack',
        description: 'A row of Fjordkaffe takeaway cups on a pale café counter.', altText: 'Row of takeaway coffee cups on a counter',
        keywords: ['cups', 'takeaway', 'counter', 'fjordkaffe'], place: 'Fjordkaffe Bryggen, Bergen, Vestland, Norway', dateTaken: '2026-06-24T08:50',
        camera: 'Fujifilm X-T5', lens: 'XF 33 mm F1.4', exposure: { focal: 33, aperture: 5.6, shutter: '1/125', iso: 400 },
        size: sz(4000, 4000, 10.2), visibility: 'restricted', clients: ['c-fjord'], createdAt: '2026-06-28T13:00' }),
      img('img-ferry', { fileName: 'FK_popup_011.jpg', title: 'Fjordkaffe pop-up on the ferry', ph: 'p-fjord',
        description: 'The Fjordkaffe pop-up counter on the deck of a ferry crossing the fjord.', altText: 'Coffee pop-up counter on a ferry deck with the fjord behind',
        keywords: ['ferry', 'pop-up', 'fjord', 'fjordkaffe'], place: 'Lavik–Oppedal ferry, Vestland, Norway', dateTaken: '2025-05-24T14:00',
        camera: 'Canon EOS R5', lens: 'RF 24-105 mm F4 L', exposure: { focal: 32, aperture: 8, shutter: '1/500', iso: 100 },
        size: sz(6000, 3375, 15.8), visibility: 'internal', createdAt: '2025-05-30T10:00' }),
      img('img-cabin', { fileName: 'LY_1131.jpg', title: 'Aurora above a mountain cabin', ph: 'p-aurora',
        description: 'Northern lights above a small mountain cabin with one lit window.', altText: 'Northern lights above a small cabin with a lit window',
        keywords: ['aurora', 'cabin', 'night', 'winter'], place: 'Kvaløya, Tromsø, Troms, Norway', dateTaken: '2026-01-22T23:15',
        camera: 'Sony A7S III', lens: 'FE 14 mm F1.8 GM', exposure: { focal: 14, aperture: 1.8, shutter: '8', iso: 2500 },
        size: sz(6000, 4000, 16.4), price: 110, createdAt: '2026-01-30T11:00' }),
      img('img-fruit', { fileName: 'DSC_2290.jpg', title: 'Fruit stall at Torgallmenningen', ph: 'p-market',
        description: 'A fruit stall with oranges and apples on a busy square.', altText: 'Fruit stall with oranges and apples on a city square',
        keywords: ['market', 'fruit', 'square', 'Bergen'], place: 'Torgallmenningen, Bergen, Vestland, Norway', dateTaken: '2026-03-20T12:30',
        camera: 'Nikon Z8', lens: 'NIKKOR Z 24-70 mm f/2.8 S', exposure: { focal: 45, aperture: 5.6, shutter: '1/320', iso: 200 },
        size: sz(4000, 4000, 12.0), createdAt: '2026-03-25T10:00', uploadedBy: 'u-tor' }),
      img('img-tanks', { fileName: 'BB_0044.jpg', title: 'Copper tanks at Bergen Bryggeri', ph: 'p-roaster',
        description: 'Copper brewing tanks in the brewhouse, with warm light from the windows.', altText: 'Copper brewing tanks in a brewhouse',
        keywords: ['brewery', 'copper', 'tanks', 'Bergen Bryggeri'], place: 'Bergen Bryggeri, Bergen, Vestland, Norway', dateTaken: '2026-04-08T10:00',
        camera: 'Canon EOS R5', lens: 'RF 24-105 mm F4 L', exposure: { focal: 24, aperture: 5.6, shutter: '1/60', iso: 1000 },
        size: sz(4000, 3000, 12.9), visibility: 'restricted', clients: ['c-bryggeri'], createdAt: '2026-04-12T09:00' }),
      img('img-boats', { fileName: 'DSC_4433.jpg', title: 'Fishing boats in Vågen harbour', ph: 'p-harbour',
        description: 'Fishing boats moored in Vågen harbour in the blue hour.', altText: 'Fishing boats moored in a harbour at dusk',
        keywords: ['boats', 'harbour', 'dusk', 'Bergen'], place: 'Vågen, Bergen, Vestland, Norway', dateTaken: '2026-09-29T19:55',
        camera: 'Nikon Z8', lens: 'NIKKOR Z 24-70 mm f/2.8 S', exposure: { focal: 50, aperture: 8, shutter: '1', iso: 64 },
        size: sz(6000, 4000, 18.7), visibility: 'restricted', clients: ['c-bryggeri'], price: 75, createdAt: '2026-10-02T11:07',
        uploadedBy: 'u-tor', batchId: 'b-tor-harbour' }),
      img('img-harbour-gen', { fileName: 'DSC_4460.jpg', ph: 'p-harbour', status: 'draft', processing: 'generating',
        dateTaken: '2026-11-18T18:40', camera: 'Nikon Z8', lens: 'NIKKOR Z 24-70 mm f/2.8 S', exposure: { focal: 24, aperture: 8, shutter: '1', iso: 64 },
        size: sz(6000, 4000, 18.9), visibility: 'internal', createdAt: T('09:40'), uploadedBy: 'u-tor', batchId: 'b-tor-harbour' }),

      /* Fjordkaffe autumn shoot (Upload, today) */
      img('img-up-0441', Object.assign({}, fjordShoot, { fileName: 'FK_shoot_0441.jpg', processing: 'uploading', progress: 64,
        size: sz(6000, 4000, 18.4), createdAt: T('10:44') })),
      img('img-up-0438', Object.assign({}, fjordShoot, fx7, { fileName: 'FK_shoot_0438.jpg', ph: 'p-barista', processing: 'queued',
        size: sz(4000, 5333, 16.1), createdAt: T('10:43') })),
      img('img-up-0417', Object.assign({}, fjordShoot, fx7, { fileName: 'FK_shoot_0417.jpg', ph: 'p-beans', processing: 'generating',
        size: sz(6000, 4000, 17.0), createdAt: T('10:42') })),
      img('img-up-0420', Object.assign({}, fjordShoot, fx7, { fileName: 'FK_shoot_0420.jpg', ph: 'p-pack',
        title: 'Coffee bag on a pale table', description: 'A Fjordkaffe coffee bag with the autumn label on a pale table.',
        altText: 'Fjordkaffe coffee bag with an autumn label on a pale table', keywords: fjordKw.concat(['packaging', 'coffee bag', 'autumn']),
        size: sz(6000, 4000, 4.2), createdAt: T('10:38') })),
      img('img-up-0402', Object.assign({}, fjordShoot, fx7, { fileName: 'FK_shoot_0402.jpg', ph: 'p-beans',
        title: 'Beans on linen, top view', description: 'Freshly roasted beans on a linen cloth, seen from above.',
        altText: 'Roasted coffee beans on a linen cloth seen from above', keywords: fjordKw.concat(['coffee beans', 'flat lay']),
        size: sz(6000, 4000, 15.9), createdAt: T('10:37') })),
      img('img-up-0433', Object.assign({}, fjordShoot, fx7, { fileName: 'FK_shoot_0433.jpg', ph: 'p-filter', processing: 'failed',
        error: 'the AI service did not answer within 30 seconds', keywords: fjordKw.slice(), size: sz(4000, 4000, 11.2), createdAt: T('10:36') })),
      img('img-up-0436', Object.assign({}, fjordShoot, fx7, { fileName: 'FK_shoot_0436.jpg', ph: 'p-cafe', processing: 'failed',
        error: 'the AI service returned an empty answer', keywords: fjordKw.slice(), size: sz(6000, 4000, 17.4), createdAt: T('10:36') })),
      img('img-up-0412', Object.assign({}, fjordShoot, fx7, { fileName: 'FK_shoot_0412.jpg', ph: 'p-latte',
        title: 'Latte art, close-up', description: 'Close-up of a heart in latte art in a white cup.',
        altText: 'Close-up of a heart in latte art in a white cup', keywords: fjordKw.concat(['latte art', 'coffee', 'close-up']),
        size: sz(4000, 5000, 12.4), createdAt: T('10:34') })),
      img('img-up-0425', Object.assign({}, fjordShoot, fx7, { fileName: 'FK_shoot_0425.jpg', ph: 'p-roaster',
        title: 'Roaster drum, side light', description: 'The roaster drum lit from the side by the morning sun.', altText: '',
        keywords: fjordKw.concat(['roastery', 'roaster']), size: sz(4000, 5000, 13.3), createdAt: T('10:35') })),
      img('img-up-0409', Object.assign({}, fjordShoot, fx7, { fileName: 'FK_shoot_0409.jpg', ph: 'p-pack',
        title: 'Cups lined up on the bar', description: 'Autumn-label takeaway cups lined up on the bar.',
        altText: 'Takeaway cups with autumn labels lined up on a bar', keywords: fjordKw.concat(['cups', 'takeaway']),
        size: sz(6000, 4000, 15.0), createdAt: T('10:33') }))
    ];

    const L = (id, imageId, clientId, contactId, price, date, source, revoked) => ({
      id, imageId, clientId, contactId, price, currency: 'USD', date, source: source || (price > 0 ? 'purchase' : 'free-download'),
      licenceTypeId: 'lt-standard', textSnapshot: LICENCE_TEXT, revoked: revoked || null
    });
    const licences = [
      /* Fjordkaffe AS: 12 licences, one revoked */
      L('lic-01', 'img-latte', 'c-fjord', 'k-jonas', 0, '2026-11-14'),
      L('lic-02', 'img-pack', 'c-fjord', 'k-kari', 0, '2026-11-12'),
      L('lic-03', 'img-roaster', 'c-fjord', 'k-jonas', 0, '2026-11-05'),
      L('lic-04', 'img-market', 'c-fjord', 'k-kari', 60, '2026-09-20', 'purchase',
        { by: 'u-ida', date: '2026-10-03', reason: 'Bought by mistake, the same motif is in Fjordkaffe\'s own images.', credit: true }),
      L('lic-05', 'img-cafe', 'c-fjord', 'k-jonas', 90, '2026-03-12'),
      L('lic-06', 'img-ferry', 'c-fjord', null, 0, '2025-06-02', 'staff-grant'),
      L('lic-07', 'img-beans', 'c-fjord', 'k-kari', 0, '2026-10-28'),
      L('lic-08', 'img-cabin', 'c-fjord', 'k-jonas', 110, '2026-02-10'),
      L('lic-09', 'img-tramstop', 'c-fjord', 'k-kari', 70, '2026-01-15'),
      L('lic-10', 'img-fruit', 'c-fjord', 'k-jonas', 0, '2026-04-02'),
      L('lic-11', 'img-quay', 'c-fjord', 'k-jonas', 0, '2026-08-14'),
      L('lic-12', 'img-cups', 'c-fjord', 'k-kari', 0, '2026-07-01'),
      /* other clients */
      L('lic-13', 'img-bryggen', 'c-nordlys', 'k-eirik', 120, '2026-01-20'),
      L('lic-14', 'img-bryggen', 'c-bryggeri', 'k-siri', 120, '2026-02-02'),
      L('lic-15', 'img-bryggen', 'c-gammel', 'k-ola', 120, '2026-01-16'),
      L('lic-16', 'img-aurora', 'c-nordlys', 'k-marte', 80, '2025-12-05'),
      L('lic-17', 'img-cyclist', 'c-nordlys', 'k-eirik', 0, daysFromToday(-1)),
      L('lic-18', 'img-tanks', 'c-bryggeri', 'k-siri', 0, '2026-04-20'),
      L('lic-19', 'img-boats', 'c-bryggeri', 'k-siri', 75, '2026-10-15'),
      L('lic-20', 'img-harbour', 'c-bryggeri', 'k-siri', 90, '2026-10-20'),
      L('lic-21', 'img-ridge', 'c-nordlys', 'k-henrik', 150, '2026-08-01')
    ];

    const file = (id, fileName, mb, imageId, extra) => Object.assign({ id, fileName, bytes: Math.round(mb * 1e6), imageId, rejected: null, match: null, dismissed: false }, extra || {});

    return {
      version: 1,
      users: [
        { id: 'u-ida', name: 'Ida Berg', firstName: 'Ida', email: 'ida@agency.example', role: 'admin', active: true, prefs: { captions: true } },
        { id: 'u-tor', name: 'Tor Vik', firstName: 'Tor', email: 'tor@agency.example', role: 'staff', active: true, prefs: { captions: true } }
      ],
      clients: [
        { id: 'c-fjord', name: 'Fjordkaffe AS', orgNo: '921456786', billingEmail: 'faktura@fjordkaffe.no', accountManagerId: 'u-ida',
          notes: 'Autumn campaign launches 1 Dec. Jonas handles marketing; Kari orders images for the cafés. Prefers photos with people in them.',
          active: true, createdAt: '2025-03-04' },
        { id: 'c-nordlys', name: 'Nordlys Sykkel AS', orgNo: '914778328', billingEmail: 'regnskap@nordlyssykkel.no', accountManagerId: 'u-tor',
          notes: 'Spring catalogue every year in March.', active: true, createdAt: '2024-09-12' },
        { id: 'c-bryggeri', name: 'Bergen Bryggeri AS', orgNo: '987654325', billingEmail: 'post@bergenbryggeri.no', accountManagerId: 'u-ida',
          notes: '', active: true, createdAt: '2025-11-02' },
        { id: 'c-lindas', name: 'Lindås Bakeri', orgNo: '975312461', billingEmail: 'post@lindasbakeri.no', accountManagerId: 'u-ida',
          notes: 'New client. First shoot planned for January.', active: true, createdAt: daysFromToday(-2) },
        { id: 'c-gammel', name: 'Gammel Kunde AS', orgNo: '922334455', billingEmail: 'faktura@gammelkunde.no', accountManagerId: 'u-tor',
          notes: 'Contract ended in 2026.', active: false, createdAt: '2023-05-20' }
      ],
      contacts: [
        { id: 'k-jonas', clientId: 'c-fjord', name: 'Jonas Hauge', firstName: 'Jonas', email: 'jonas.hauge@fjordkaffe.no', phone: '+47 912 34 567',
          active: true, passwordSet: true, lastLoginAt: '2026-11-16T08:30', prefs: { captions: true } },
        { id: 'k-kari', clientId: 'c-fjord', name: 'Kari Lie', firstName: 'Kari', email: 'kari.lie@fjordkaffe.no', phone: '',
          active: true, passwordSet: true, lastLoginAt: '2026-11-17T09:05', prefs: { captions: true } },
        { id: 'k-eirik', clientId: 'c-nordlys', name: 'Eirik Nyheim', firstName: 'Eirik', email: 'eirik@nordlyssykkel.no', phone: '+47 934 55 210',
          active: true, passwordSet: true, lastLoginAt: daysFromToday(-1, '15:20'), prefs: { captions: true } },
        { id: 'k-marte', clientId: 'c-nordlys', name: 'Marte Solberg', firstName: 'Marte', email: 'marte@nordlyssykkel.no', phone: '',
          active: true, passwordSet: true, lastLoginAt: '2026-10-30T10:00', prefs: { captions: true } },
        { id: 'k-henrik', clientId: 'c-nordlys', name: 'Henrik Aas', firstName: 'Henrik', email: 'henrik@nordlyssykkel.no', phone: '',
          active: false, passwordSet: true, lastLoginAt: '2026-08-01T13:00', prefs: { captions: true } },
        { id: 'k-siri', clientId: 'c-bryggeri', name: 'Siri Dahl', firstName: 'Siri', email: 'siri.dahl@bergenbryggeri.no', phone: '+47 977 01 020',
          active: true, passwordSet: true, lastLoginAt: '2026-10-20T11:00', prefs: { captions: true } },
        { id: 'k-liv', clientId: 'c-lindas', name: 'Liv Haugland', firstName: 'Liv', email: 'liv@lindasbakeri.no', phone: '',
          active: true, passwordSet: false, lastLoginAt: null, prefs: { captions: true } },
        { id: 'k-ola', clientId: 'c-gammel', name: 'Ola Nordmann', firstName: 'Ola', email: 'ola@gammelkunde.no', phone: '',
          active: true, passwordSet: true, lastLoginAt: '2026-01-16T12:00', prefs: { captions: true } }
      ],
      setupLinks: [
        { token: 'lindas-7Hq2-4pVt', contactId: 'k-liv', createdBy: 'u-ida', createdAt: daysFromToday(-2, '11:20'), expiresAt: daysFromToday(5, '11:20'), usedAt: null, cancelledAt: null },
        { token: 'kari-Xk4m-81Ld', contactId: 'k-kari', createdBy: 'u-ida', createdAt: '2025-03-05T09:00', expiresAt: '2025-03-12T09:00', usedAt: '2025-03-05T14:12', cancelledAt: null }
      ],
      images,
      licences,
      downloads: [
        { id: 'dl-1', imageId: 'img-roaster', contactId: 'k-jonas', clientId: 'c-fjord', at: '2026-11-05T10:12' },
        { id: 'dl-2', imageId: 'img-pack', contactId: 'k-kari', clientId: 'c-fjord', at: '2026-11-12T13:40' },
        { id: 'dl-3', imageId: 'img-latte', contactId: 'k-jonas', clientId: 'c-fjord', at: '2026-11-14T09:02' },
        { id: 'dl-4', imageId: 'img-roaster', contactId: 'k-jonas', clientId: 'c-fjord', at: '2026-11-16T13:40' },
        { id: 'dl-5', imageId: 'img-pack', contactId: 'k-kari', clientId: 'c-fjord', at: '2026-11-17T09:12' }
      ],
      batches: [
        { id: 'b-fjord-autumn', name: 'Fjordkaffe autumn shoot', ownerId: 'u-ida', createdAt: T('10:31'),
          settings: { visibility: 'restricted', clients: ['c-fjord'], price: 0, ai: true, placeNames: true, keywords: fjordKw.slice() },
          files: [
            file('f-0441', 'FK_shoot_0441.jpg', 18.4, 'img-up-0441'),
            file('f-0438', 'FK_shoot_0438.jpg', 16.1, 'img-up-0438'),
            file('f-0417', 'FK_shoot_0417.jpg', 17.0, 'img-up-0417'),
            file('f-0420', 'FK_shoot_0420.jpg', 4.2, 'img-up-0420', { match: { imageId: 'img-pack', answer: null } }),
            file('f-0402', 'FK_shoot_0402.jpg', 15.9, 'img-up-0402', { match: { imageId: 'img-beans', answer: null } }),
            file('f-0433', 'FK_shoot_0433.jpg', 11.2, 'img-up-0433'),
            file('f-0436', 'FK_shoot_0436.jpg', 17.4, 'img-up-0436'),
            file('f-2207', 'IMG_2207.jpg', 18.0, null, { rejected: { reason: 'identical', existingImageId: 'img-cafe' } }),
            file('f-mood', 'moodboard.pdf', 2.3, null, { rejected: { reason: 'type' } }),
            file('f-0412', 'FK_shoot_0412.jpg', 12.4, 'img-up-0412'),
            file('f-0425', 'FK_shoot_0425.jpg', 13.3, 'img-up-0425'),
            file('f-0409', 'FK_shoot_0409.jpg', 15.0, 'img-up-0409')
          ] },
        { id: 'b-nordlys-spring', name: 'Nordlys spring catalogue', ownerId: 'u-ida', createdAt: Y('14:20'),
          settings: { visibility: 'restricted', clients: ['c-nordlys'], price: 0, ai: true, placeNames: true, keywords: ['Nordlys Sykkel'] },
          files: [file('f-ns-0112', 'NS_cat_0112.jpg', 15.1, 'img-cyclist'), file('f-ns-0131', 'NS_cat_0131.jpg', 13.9, 'img-trail')] },
        { id: 'b-tor-harbour', name: 'Harbour series', ownerId: 'u-tor', createdAt: '2026-10-02T10:40',
          settings: { visibility: 'public', clients: [], price: 90, ai: true, placeNames: true, keywords: ['harbour'] },
          files: [file('f-th-4410', 'DSC_4410.jpg', 19.6, 'img-harbour'), file('f-th-4433', 'DSC_4433.jpg', 18.7, 'img-boats'),
            file('f-th-4460', 'DSC_4460.jpg', 18.9, 'img-harbour-gen')] },
        { id: 'b-tor-winter', name: 'Bergen winter', ownerId: 'u-tor', createdAt: daysFromToday(-4, '14:30'),
          settings: { visibility: 'internal', clients: [], price: 0, ai: true, placeNames: true, keywords: ['winter', 'Bergen'] },
          files: [file('f-bw-0207', 'BW_0207.jpg', 11.4, 'img-tram'), file('f-bw-0211', 'BW_0211.jpg', 14.0, 'img-floibanen')] }
      ],
      carts: {
        'k-jonas': [
          { imageId: 'img-bryggen', priceAtAdd: 120, addedAt: '2026-11-16T10:02' },
          { imageId: 'img-ridge', priceAtAdd: 150, addedAt: '2026-11-17T08:45' }
        ],
        'k-kari': []
      },
      settings: {
        licenceType: { id: 'lt-standard', name: 'Standard commercial use', price: 120, currency: 'USD', text: LICENCE_TEXT, isSample: true, updatedAt: '2025-03-01' },
        aiProvider: { name: 'Mock (test mode)', mode: 'mock', keyMasked: '', promptVersion: 'v3', placeNames: true }
      },
      actionLog: [
        { id: 'log-1', at: T('10:31'), actorKind: 'staff', actorId: 'u-ida', actorName: 'Ida Berg', action: 'Started a batch', detail: 'Fjordkaffe autumn shoot' },
        { id: 'log-2', at: T('09:55'), actorKind: 'staff', actorId: 'u-tor', actorName: 'Tor Vik', action: 'Started editing', detail: 'Harbour at dusk, Ålesund' },
        { id: 'log-3', at: Y('15:02'), actorKind: 'staff', actorId: 'u-ida', actorName: 'Ida Berg', action: 'Published images', detail: 'Cyclist on gravel road in Nordmarka, Trail runner on the ridge' },
        { id: 'log-4', at: daysFromToday(-2, '11:20'), actorKind: 'staff', actorId: 'u-ida', actorName: 'Ida Berg', action: 'Created a setup link', detail: 'Liv Haugland, Lindås Bakeri' },
        { id: 'log-5', at: daysFromToday(-2, '11:05'), actorKind: 'staff', actorId: 'u-ida', actorName: 'Ida Berg', action: 'Created a client', detail: 'Lindås Bakeri' },
        { id: 'log-6', at: daysFromToday(-3, '09:05'), actorKind: 'staff', actorId: 'u-tor', actorName: 'Tor Vik', action: 'Changed a price', detail: 'Mountain ridge above the fjord: 150 USD to 180 USD' },
        { id: 'log-7', at: daysFromToday(-4, '14:30'), actorKind: 'staff', actorId: 'u-tor', actorName: 'Tor Vik', action: 'Started a batch', detail: 'Bergen winter' },
        { id: 'log-8', at: '2026-10-03T10:12', actorKind: 'staff', actorId: 'u-ida', actorName: 'Ida Berg', action: 'Revoked a licence', detail: 'Bergen fish market at dawn for Fjordkaffe AS: Bought by mistake, the same motif is in Fjordkaffe\'s own images.' }
      ],
      session: null,
      ui: {}
    };
  }

  /* ======================================================================
     Persistence
     ====================================================================== */
  function load() {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.version === 1) return data;
      }
    } catch (e) { /* storage blocked or corrupt: start from the seed */ }
    return seed();
  }
  App.store = seed();
  App.save = function () {
    try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(App.store)); } catch (e) { /* not persisted */ }
  };
  App.reset = function () {
    try { window.sessionStorage.removeItem(STORAGE_KEY); } catch (e) { /* nothing stored */ }
    App.store = seed();
    App.save();
    state.returnTo = null;
    state.flash = null;
    App.navigate('#/login', { replace: true, force: true });
    App.status('The prototype data is reset.');
  };

  /* ======================================================================
     Lookups and small data helpers
     ====================================================================== */
  const byId = (list, id) => list.find((x) => x.id === id) || null;
  App.find = {
    image: (id) => byId(App.store.images, id),
    client: (id) => byId(App.store.clients, id),
    contact: (id) => byId(App.store.contacts, id),
    user: (id) => byId(App.store.users, id),
    batch: (id) => byId(App.store.batches, id),
    licence: (id) => byId(App.store.licences, id)
  };
  let uidCounter = 0;
  App.uid = (prefix) => (prefix || 'id') + '-' + Date.now().toString(36) + (uidCounter++).toString(36);
  App.imageTitle = (image) => (image && image.title) || 'Untitled image';
  App.altFor = (image) => (image && (image.altText || image.title)) || 'Untitled image';
  App.ratio = (image) => (image && image.size && image.size.h ? image.size.w / image.size.h : 1.5);
  App.loupeClass = function (image) {
    const r = App.ratio(image);
    const opts = [['r169', 16 / 9], ['r32', 1.5], ['r43', 4 / 3], ['r45', 0.8], ['r23', 2 / 3]];
    let best = opts[0];
    opts.forEach((o) => { if (Math.abs(o[1] - r) < Math.abs(best[1] - r)) best = o; });
    return Math.abs(r - 1) < 0.05 ? '' : best[0];
  };
  App.clientNames = (ids) => (ids || []).map((id) => (App.find.client(id) || {}).name).filter(Boolean).join(', ');
  App.sortNewest = (list) => list.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  App.search = {
    /* FR-27 / FR-29: case-insensitive; every term must match. Staff also match the place name. */
    images(list, q, opts) {
      const terms = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) return list.slice();
      const staff = !opts || opts.viewer !== 'client';
      return list.filter((im) => {
        const hay = [im.title, im.description, (im.keywords || []).join(' '), staff ? im.place : '', staff ? im.fileName : '']
          .join(' ').toLowerCase();
        return terms.every((t) => hay.indexOf(t) !== -1);
      });
    }
  };

  App.batchFileState = function (f) {
    if (f.rejected) return 'rejected';
    const im = App.find.image(f.imageId);
    if (!im) return 'discarded';
    if (f.match && f.match.answer === 'discard') return 'discarded';
    if (im.status === 'published') return 'published';
    if (im.status === 'archived') return 'archived';
    if (im.processing !== 'ready') return im.processing;
    if (f.match && !f.match.answer) return 'needs-decision';
    if (!im.altText) return 'needs-alt';
    return 'ready';
  };

  App.locks = {
    holder(image) { return image && image.lockedBy ? App.find.user(image.lockedBy.userId) : null; }
  };

  /* ======================================================================
     Session
     ====================================================================== */
  App.session = () => App.store.session;
  App.isStaff = () => !!(App.store.session && App.store.session.role === 'staff');
  App.isClient = () => !!(App.store.session && App.store.session.role === 'client');
  App.currentUser = () => (App.isStaff() ? App.find.user(App.store.session.userId) : null);
  App.currentContact = () => (App.isClient() ? App.find.contact(App.store.session.contactId) : null);
  App.currentClient = function () { const c = App.currentContact(); return c ? App.find.client(c.clientId) : null; };
  App.homeFor = (session) => (session && session.role === 'client' ? '#/overview' : session ? '#/library' : '#/login');

  App.prefs = {
    get(key, fallback) {
      const who = App.currentUser() || App.currentContact();
      return who && who.prefs && key in who.prefs ? who.prefs[key] : fallback;
    },
    set(key, value) {
      const who = App.currentUser() || App.currentContact();
      if (!who) return;
      who.prefs = who.prefs || {};
      who.prefs[key] = value;
      App.save();
    }
  };

  /* Log in without a password check (quick buttons, role switch, set password). */
  App.login = function (session, opts) {
    opts = opts || {};
    App.store.session = session;
    const who = session.role === 'staff' ? App.find.user(session.userId) : App.find.contact(session.contactId);
    if (who && session.role === 'client') { who.prevLoginAt = who.lastLoginAt || null; who.lastLoginAt = App.nowISO(); }
    App.save();
    let to = opts.to || state.returnTo || App.homeFor(session);
    state.returnTo = null;
    const res = resolve(to);
    if (res.kind !== 'screen' && res.kind !== 'not-built') to = App.homeFor(session);
    App.navigate(to, { replace: true, force: true });
  };
  App.logout = function () {
    runGuard('#/login').then((ok) => {
      if (!ok) return;
      App.store.session = null;
      App.save();
      state.returnTo = null;
      App.navigate('#/login', { replace: true, force: true });
      App.status('You are logged out.');
    });
  };
  App.switchSession = function (session, to) {
    runGuard(to || App.homeFor(session)).then((ok) => {
      if (!ok) return;
      state.returnTo = null;
      App.login(session, { to: to || App.homeFor(session) });
    });
  };

  /* ======================================================================
     Access (PRD FR-22 access table A1-A13, edge rules S1-S5, S7, S12, S15)
     ====================================================================== */
  function asContact(c) { return typeof c === 'string' ? App.find.contact(c) : c; }
  function asImage(i) { return typeof i === 'string' ? App.find.image(i) : i; }
  const VISIBLE_ROWS = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A8', 'A10', 'A12'];
  const OWN_ROWS = ['A3', 'A4', 'A6', 'A8', 'A10', 'A12'];

  App.access = {
    activeLicence(clientId, imageId) {
      return App.store.licences.find((l) => l.clientId === clientId && l.imageId === imageId && !l.revoked) || null;
    },
    row(clientId, image) {
      image = asImage(image);
      if (!image) return null;
      const lic = !!App.access.activeLicence(clientId, image.id);
      if (image.status === 'draft') return 'A13';
      if (image.status === 'archived') return lic ? 'A12' : 'A11';
      let vis = image.visibility;
      if (vis === 'restricted' && !(image.clients || []).length) vis = 'internal'; /* S4 */
      if (vis === 'public') return lic ? 'A3' : image.price === 0 ? 'A1' : 'A2';
      if (vis === 'restricted') {
        if ((image.clients || []).indexOf(clientId) !== -1) return lic ? 'A6' : image.price === 0 ? 'A4' : 'A5';
        return lic ? 'A8' : 'A7';
      }
      return lic ? 'A10' : 'A9';
    },
    isOwn(clientId, image) { return OWN_ROWS.indexOf(App.access.row(clientId, image)) !== -1; },
    contactActive(contact) {
      contact = asContact(contact);
      const client = contact && App.find.client(contact.clientId);
      return !!(contact && contact.active && client && client.active); /* S1, S2 */
    },
    canSee(contact, image) {
      contact = asContact(contact);
      if (!App.access.contactActive(contact)) return false;
      return VISIBLE_ROWS.indexOf(App.access.row(contact.clientId, image)) !== -1;
    },
    canDownload(contact, image) {
      contact = asContact(contact);
      if (!App.access.canSee(contact, image)) return false;
      const row = App.access.row(contact.clientId, image);
      return row === 'A1' || OWN_ROWS.indexOf(row) !== -1;
    },
    canBuy(contact, image) {
      contact = asContact(contact);
      if (!App.access.canSee(contact, image)) return false;
      const row = App.access.row(contact.clientId, image);
      return row === 'A2' || row === 'A5'; /* S7: never free or own */
    },
    visibleImages(contact) {
      contact = asContact(contact);
      return App.sortNewest(App.store.images.filter((im) => App.access.canSee(contact, im)));
    },
    ownImages(clientId) {
      return App.sortNewest(App.store.images.filter((im) => App.access.isOwn(clientId, im)));
    },
    clientFields(image) {
      const copy = Object.assign({}, image);
      ['place', 'gps', 'provider', 'notes', 'clients', 'lockedBy', 'editedBy', 'uploadedBy', 'batchId', 'fileName'].forEach((k) => delete copy[k]);
      return copy;
    }
  };

  /* ======================================================================
     Cart and licences
     ====================================================================== */
  App.cart = {
    lines(contactId) {
      const carts = App.store.carts;
      if (!carts[contactId]) carts[contactId] = [];
      return carts[contactId];
    },
    count(contactId) { return App.cart.lines(contactId).length; },
    has(contactId, imageId) { return App.cart.lines(contactId).some((l) => l.imageId === imageId); },
    add(contactId, imageId) {
      const image = App.find.image(imageId);
      if (!image || !App.access.canBuy(contactId, image) || App.cart.has(contactId, imageId)) return false;
      App.cart.lines(contactId).push({ imageId, priceAtAdd: image.price, addedAt: App.nowISO() });
      App.save();
      App.refreshChrome();
      return true;
    },
    remove(contactId, imageId) {
      const lines = App.cart.lines(contactId);
      const i = lines.findIndex((l) => l.imageId === imageId);
      if (i === -1) return false;
      lines.splice(i, 1);
      App.save();
      App.refreshChrome();
      return true;
    }
  };

  App.licences = {
    forClient(clientId) {
      return App.store.licences.filter((l) => l.clientId === clientId).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    },
    forImage(imageId) {
      return App.store.licences.filter((l) => l.imageId === imageId).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    },
    record(o) {
      const existing = App.access.activeLicence(o.clientId, o.imageId);
      if (existing) return existing; /* S5 */
      const lt = App.store.settings.licenceType;
      const lic = {
        id: App.uid('lic'), imageId: o.imageId, clientId: o.clientId, contactId: o.contactId || null,
        price: o.price || 0, currency: 'USD', date: App.todayISO(),
        source: o.source || ((o.price || 0) > 0 ? 'purchase' : 'free-download'),
        licenceTypeId: lt.id, textSnapshot: lt.text, revoked: null
      };
      App.store.licences.push(lic);
      App.save();
      return lic;
    },
    revoke(licenceId, reason) {
      const lic = App.find.licence(licenceId);
      if (!lic || lic.revoked || !String(reason || '').trim()) return null; /* S11 */
      const user = App.currentUser();
      lic.revoked = { by: user ? user.id : null, date: App.todayISO(), reason: String(reason).trim(), credit: lic.price > 0 };
      const image = App.find.image(lic.imageId);
      if (image && image.clients) image.clients = image.clients.filter((c) => c !== lic.clientId);
      const client = App.find.client(lic.clientId);
      App.log('Revoked a licence', App.imageTitle(image) + ' for ' + (client ? client.name : '') + ': ' + lic.revoked.reason);
      App.save();
      return lic;
    },
    download(contact, imageId) {
      contact = asContact(contact);
      const image = App.find.image(imageId);
      if (!contact || !image || !App.access.canDownload(contact, image)) return { ok: false, firstDownload: false, licence: null };
      let licence = App.access.activeLicence(contact.clientId, imageId);
      let firstDownload = false;
      if (!licence) {
        licence = App.licences.record({ imageId, clientId: contact.clientId, contactId: contact.id, price: 0, source: 'free-download' });
        firstDownload = true;
      }
      App.store.downloads.push({ id: App.uid('dl'), imageId, contactId: contact.id, clientId: contact.clientId, at: App.nowISO() });
      App.save();
      App.status('Downloading ' + App.imageTitle(image) + '.');
      return { ok: true, firstDownload, licence };
    }
  };

  /* ======================================================================
     Formatting
     ====================================================================== */
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function parts(iso) {
    const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
    return m ? { y: +m[1], mo: +m[2], d: +m[3], hh: m[4], mm: m[5] } : null;
  }
  App.fmt = {
    date(iso) { const p = parts(iso); return p ? p.d + ' ' + MONTHS[p.mo - 1] + ' ' + p.y : ''; },
    dateShort(iso) { const p = parts(iso); return p ? p.d + ' ' + MONTHS[p.mo - 1] : ''; },
    time(iso) { const p = parts(iso); return p && p.hh ? p.hh + ':' + p.mm : ''; },
    dateTime(iso) { const t = App.fmt.time(iso); return App.fmt.date(iso) + (t ? ', ' + t : ''); },
    day(iso) {
      const d = String(iso || '').slice(0, 10);
      if (d === App.todayISO()) return 'Today';
      if (d === daysFromToday(-1)) return 'Yesterday';
      return App.fmt.dateShort(iso);
    },
    bytes(n) {
      if (n == null) return '';
      if (n >= 1e6) return (n / 1e6).toFixed(1) + ' MB';
      if (n >= 1e3) return Math.round(n / 1e3) + ' KB';
      return n + ' B';
    },
    plural(n, one, many) { return n + ' ' + (n === 1 ? one : many || one + 's'); },
    exposure(image) {
      const e = image && image.exposure;
      if (!e) return '';
      const bits = [];
      if (e.shutter) bits.push(e.shutter + ' s');
      if (e.aperture) bits.push('f/' + e.aperture);
      if (e.iso) bits.push('ISO ' + e.iso);
      if (e.focal) bits.push(e.focal + ' mm');
      return bits.join(', ');
    },
    pixels(image) {
      if (!image || !image.size) return '';
      const s = image.size;
      const o = s.w > s.h ? 'landscape' : s.w < s.h ? 'portrait' : 'square';
      return s.w + ' × ' + s.h + ' px, ' + o;
    },
    orgNo(s) { s = String(s || '').replace(/\D/g, ''); return s.length === 9 ? s.slice(0, 3) + ' ' + s.slice(3, 6) + ' ' + s.slice(6) : s; }
  };

  /* ======================================================================
     Markup helpers
     ====================================================================== */
  function Raw(html) { this.html = html; }
  Raw.prototype.toString = function () { return this.html; };
  App.Raw = Raw;
  App.raw = (html) => new Raw(String(html == null ? '' : html));
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  App.esc = (v) => String(v).replace(/[&<>"']/g, (c) => ESC[c]);
  function part(v) {
    if (v == null || v === false) return '';
    if (v instanceof Raw) return v.html;
    if (Array.isArray(v)) return v.map(part).join('');
    return App.esc(v);
  }
  App.h = function (strings) {
    let out = strings[0];
    for (let i = 1; i < strings.length; i++) out += part(arguments[i]) + strings[i];
    return new Raw(out);
  };
  const h = App.h;

  App.icon = function (name, opts) {
    opts = opts || {};
    const cls = 'ic' + (opts.cls ? ' ' + opts.cls : '');
    return opts.label
      ? h`<svg class="${cls}" role="img" aria-label="${opts.label}"><use href="#i-${name}"/></svg>`
      : h`<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  };

  App.price = function (n, opts) {
    opts = opts || {};
    const label = !n ? 'Free' : n + ' USD';
    return h`<span class="price${opts.lg ? ' price-lg' : ''}">${App.icon('price')}${label}</span>`;
  };

  const SPINNER = '<svg class="ds-spinner" role="img" aria-label="In progress" viewBox="0 0 50 50"><circle class="ds-spinner__background" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle><circle class="ds-spinner__circle" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>';
  const TAGS = {
    draft: ['neutral', 'Draft'], published: ['success', 'Published'], archived: ['neutral', 'Archived'],
    uploading: ['info', 'Uploading'], queued: ['neutral', 'Queued'], generating: ['accent', 'Generating'],
    ready: ['success', 'Ready'], failed: ['danger', 'Failed'], 'needs-decision': ['warning', 'Needs a decision'],
    rejected: ['warning', 'Rejected'], 'needs-alt': ['warning', 'Needs alt text'], active: ['success', 'Active'],
    inactive: ['neutral', 'Inactive'], revoked: ['neutral', 'Revoked'], 'price-changed': ['warning', 'Price changed'],
    'in-cart': ['neutral', 'In cart'], removed: ['neutral', 'Removed by the agency']
  };
  App.statusTag = function (kind, label) {
    const t = TAGS[kind] || ['neutral', kind];
    if (kind === 'generating') {
      return h`<span class="ds-tag tag-row" data-color="accent" data-size="sm">${App.raw(SPINNER)}${label || t[1]}</span>`;
    }
    return h`<span class="ds-tag" data-color="${t[0]}" data-size="sm">${label || t[1]}</span>`;
  };
  App.tileTags = function (image) {
    if (image.status === 'archived') return App.statusTag('archived');
    if (image.status === 'draft') return [App.statusTag('draft'), App.statusTag(image.processing)];
    return null;
  };
  App.visibilityMeta = function (image) {
    if (image.visibility === 'public') return h`<span>${App.icon('globe')}Public</span>`;
    if (image.visibility === 'restricted' && (image.clients || []).length) {
      return h`<span>${App.icon('users')}${App.clientNames(image.clients)}</span>`;
    }
    if (image.visibility === 'restricted') return h`<span>${App.icon('lock')}Restricted, no clients yet</span>`;
    return h`<span>${App.icon('lock')}Internal only</span>`;
  };
  App.ownTick = (label) => h`<span class="own" role="img" aria-label="${label || 'Your image'}">${App.icon('check')}</span>`;

  App.tile = function (image, opts) {
    opts = opts || {};
    const viewer = opts.viewer || (App.isClient() ? 'client' : 'staff');
    const contact = asContact(opts.contact) || App.currentContact();
    const r = App.ratio(image).toFixed(3);
    const uploading = image.processing === 'uploading';
    const own = viewer === 'client' && contact && App.access.isOwn(contact.clientId, image);
    const inCart = viewer === 'client' && contact && App.cart.has(contact.id, image.id);

    const tags = viewer === 'staff' ? App.tileTags(image) : null;
    const shot = h`<span class="shot">${tags ? h`<span class="state">${tags}</span>` : ''}${own ? App.ownTick() : ''}${
      uploading
        ? h`<span class="skel"><span class="ds-skeleton" aria-hidden="true"></span><span class="progress">${image.progress} %</span></span>`
        : h`<span class="ph ${image.ph || ''}" role="img" aria-label="${App.altFor(image)}"></span>`
    }</span>`;

    let cap;
    if (viewer === 'staff') {
      if (uploading) cap = h`<span class="t-title">${image.fileName}</span><span class="meta"><span>${App.fmt.bytes(image.size.bytes)}</span></span>`;
      else if (image.processing === 'failed') cap = h`<span class="t-title">${App.imageTitle(image)}</span><span class="t-error">Metadata could not be generated. Open it to fill in or try again.</span>`;
      else cap = h`<span class="t-title">${App.imageTitle(image)}</span><span class="meta">${App.visibilityMeta(image)}${App.price(image.price)}</span>`;
    } else {
      cap = h`<span class="t-title">${App.imageTitle(image)}</span><span class="meta">${
        own ? h`<span class="own-inline">Yours to download</span>` : [App.price(image.price), inCart ? h`<span>In cart</span>` : '']
      }</span>`;
    }
    const inner = h`${shot}<span class="cap">${cap}</span>`;
    const body = opts.href
      ? h`<a class="tile ds-focus" href="${opts.href}" data-id="${image.id}">${inner}</a>`
      : h`<button class="tile ds-focus" type="button" data-pick data-id="${image.id}" aria-pressed="${opts.selected ? 'true' : 'false'}">${inner}</button>`;
    return h`<li style="--r:${r}">${body}</li>`;
  };

  App.wall = function (images, opts) {
    opts = opts || {};
    return h`<ul class="wall" aria-label="${opts.label || 'Images'}"${opts.hrefFor ? '' : App.raw(' data-select-group')}>${
      images.map((im) => App.tile(im, { viewer: opts.viewer, contact: opts.contact, selected: im.id === opts.selectedId, href: opts.hrefFor ? opts.hrefFor(im) : null }))
    }</ul>`;
  };

  App.paginate = function (list, page, perPage) {
    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const p = Math.min(Math.max(1, parseInt(page, 10) || 1), pages);
    const start = (p - 1) * perPage;
    return { items: list.slice(start, start + perPage), page: p, pages, total, from: total ? start + 1 : 0, to: Math.min(start + perPage, total) };
  };

  App.pager = function (o) {
    const pages = Math.max(1, Math.ceil(o.total / o.perPage));
    const page = Math.min(Math.max(1, o.page || 1), pages);
    const from = o.total ? (page - 1) * o.perPage + 1 : 0;
    const to = Math.min(page * o.perPage, o.total);
    if (!o.total) return h``;
    const btn = (p, label, aria, disabled, current) => disabled
      ? h`<li><button class="ds-button" data-variant="tertiary" type="button" aria-label="${aria}" disabled>${label}</button></li>`
      : h`<li><a class="ds-button" data-variant="tertiary" href="${o.hrefFor(p)}" aria-label="${aria}"${current ? App.raw(' aria-current="true"') : ''}>${label}</a></li>`;
    const nums = [];
    for (let p = 1; p <= pages; p++) nums.push(btn(p, String(p), 'Page ' + p, false, p === page));
    return h`<div class="pager"><span>Showing ${from}–${to} of ${o.total}</span>${
      pages > 1 ? h`<nav class="ds-pagination" aria-label="Pages" data-size="sm"><ul>${btn(page - 1, 'Previous', 'Previous page', page === 1)}${nums}${btn(page + 1, 'Next', 'Next page', page === pages)}</ul></nav>` : ''
    }</div>`;
  };

  App.emptyState = function (text, action) {
    let act = '';
    if (action instanceof Raw) act = action;
    else if (action && action.href) act = h`<a class="ds-button" data-variant="secondary" data-size="sm" href="${action.href}">${action.label}</a>`;
    else if (action && action.label) act = h`<button class="ds-button" data-variant="secondary" data-size="sm" type="button" ${App.raw(action.attrs || '')}>${action.label}</button>`;
    return h`<div class="empty-state"><p>${text}</p>${act}</div>`;
  };

  App.avatar = function (name, opts) {
    opts = opts || {};
    const initials = String(name || '?').split(/\s+/).filter(Boolean).slice(0, opts.short ? 1 : 2).map((s) => s[0]).join('').toUpperCase();
    return h`<span class="ds-avatar" role="img" aria-label="${name}" data-size="${opts.size || 'sm'}">${initials}</span>`;
  };

  App.captionsSwitch = function (idSuffix) {
    const id = 'caps-' + (idSuffix || 'wall');
    const on = App.prefs.get('captions', true);
    return h`<ds-field class="ds-field cap-toggle" data-size="sm"><input class="ds-input" type="checkbox" role="switch" id="${id}" data-caption-toggle${on ? App.raw(' checked') : ''}><label class="ds-label" data-weight="regular" for="${id}">Show captions</label></ds-field>`;
  };

  App.licenceTermsHTML = function (text) {
    const lt = App.store.settings.licenceType;
    const paras = String(text == null ? lt.text : text).split(/\n{2,}/).filter(Boolean);
    return h`<div class="terms" tabindex="0" role="region" aria-label="Licence text"><h3>${lt.name}</h3>${paras.map((p) => h`<p>${p}</p>`)}</div>`;
  };

  /* ======================================================================
     Live region, flash, action log
     ====================================================================== */
  App.status = function (msg) {
    const el = document.getElementById('app-status');
    if (!el) return;
    el.textContent = '';
    window.setTimeout(() => { el.textContent = msg; }, 60);
  };
  App.flash = function (text, opts) { state.flash = Object.assign({ text, color: 'info' }, opts || {}); };
  App.takeFlash = function () { const f = state.flash; state.flash = null; return f; };
  function flashHTML(f) {
    if (!f) return '';
    return h`<div class="ds-alert app-flash" data-color="${f.color}" data-size="sm">${f.heading ? h`<h2 class="ds-heading" data-size="2xs">${f.heading}</h2>` : ''}<p class="ds-paragraph">${f.text}</p></div>`;
  }
  App.flashHTML = flashHTML;

  App.log = function (action, detail) {
    const s = App.store.session;
    const who = App.currentUser() || App.currentContact();
    App.store.actionLog.unshift({
      id: App.uid('log'), at: App.nowISO(), actorKind: s && s.role === 'client' ? 'contact' : 'staff',
      actorId: who ? who.id : null, actorName: who ? who.name : 'System', action, detail: detail || ''
    });
    App.save();
  };

  /* ======================================================================
     Dialogs (native <dialog>, one at a time, never window.alert/confirm/prompt)
     ====================================================================== */
  let openDialog = null;
  App.dialog = function (opts) {
    if (openDialog) openDialog.finish(null);
    return new Promise((resolve) => {
      const trigger = document.activeElement;
      const dlg = document.createElement('dialog');
      const hid = App.uid('dlg-h');
      dlg.className = 'ds-dialog app-dlg' + (opts.className ? ' ' + opts.className : '');
      dlg.setAttribute('aria-labelledby', hid);
      const actions = (opts.actions || [{ label: 'Close', value: null, variant: 'secondary' }]).map((a, i) =>
        h`<button class="ds-button" type="submit" data-variant="${a.variant || (i === 0 ? 'primary' : 'secondary')}"${a.color ? App.raw(' data-color="' + App.esc(a.color) + '"') : ''} value="${a.value == null ? '' : a.value}">${a.label}</button>`);
      dlg.innerHTML = String(h`<form novalidate><h2 class="ds-heading" data-size="xs" id="${hid}">${opts.title}</h2><div class="dlg-body">${App.raw(String(opts.body || ''))}</div><p class="ds-validation-message dlg-error" data-field="validation" role="alert" hidden></p><div class="dlg-actions">${actions}</div></form>`);
      document.body.appendChild(dlg);
      const form = dlg.querySelector('form');
      const err = dlg.querySelector('.dlg-error');
      let done = false;
      function values() {
        const out = {};
        form.querySelectorAll('[name]').forEach((el) => {
          if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) { if (el.type === 'checkbox') out[el.name] = false; return; }
          out[el.name] = el.type === 'checkbox' ? true : el.value;
        });
        return out;
      }
      function finish(action) {
        if (done) return;
        done = true;
        const vals = values();
        if (dlg.open) dlg.close();
        dlg.remove();
        openDialog = null;
        if (trigger && document.body.contains(trigger) && typeof trigger.focus === 'function') trigger.focus();
        resolve({ action, values: vals });
      }
      openDialog = { finish };
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = e.submitter ? e.submitter.value : '';
        const action = v === '' ? null : v;
        if (action !== null && opts.beforeClose) {
          const msg = opts.beforeClose(action, values(), dlg);
          if (msg) { err.textContent = msg; err.hidden = false; return; }
        }
        finish(action);
      });
      dlg.addEventListener('cancel', (e) => { e.preventDefault(); finish(null); });
      dlg.showModal();
      const first = opts.initialFocus ? dlg.querySelector(opts.initialFocus) : dlg.querySelector('.dlg-body input, .dlg-body textarea, .dlg-body select');
      if (first) first.focus();
      if (opts.onOpen) opts.onOpen(dlg);
    });
  };
  App.confirm = function (o) {
    return App.dialog({
      title: o.title,
      body: o.body,
      actions: [
        { label: o.confirm || 'Continue', value: 'ok', variant: 'primary', color: o.danger ? 'danger' : null },
        { label: o.cancel || 'Go back', value: null, variant: 'secondary' }
      ]
    }).then((r) => r.action === 'ok');
  };
  App.licenceTermsDialog = function () {
    const lt = App.store.settings.licenceType;
    return App.dialog({
      title: 'Licence terms: ' + lt.name,
      className: 'terms-dlg',
      body: h`${lt.isSample ? h`<p class="hint">Sample text. The agency's own licence text replaces it before launch.</p>` : ''}${App.licenceTermsHTML()}`,
      actions: [{ label: 'Close', value: null, variant: 'secondary' }]
    });
  };

  /* ======================================================================
     Router
     ====================================================================== */
  const isImage = (p) => !!App.find.image(p.imageId || p.id);
  const clientCanSee = (p) => { const c = App.currentContact(); const im = App.find.image(p.imageId); return !!(c && im && App.access.canSee(c, im)); };
  const ROUTES = [
    { pattern: '/login', role: 'public', title: 'Log in', owner: 'auth' },
    { pattern: '/set-password/:token', role: 'public', title: 'Set password', owner: 'auth' },
    { pattern: '/403', role: 'any', title: 'No access' },
    { pattern: '/404', role: 'any', title: 'Not found' },
    { pattern: '/library', role: 'staff', title: 'Library', owner: 'library' },
    { pattern: '/library/:imageId', role: 'staff', title: 'Library', owner: 'library', check: isImage },
    { pattern: '/image/:id', role: 'staff', title: 'Image', owner: 'library', check: isImage },
    { pattern: '/upload', role: 'staff', title: 'Upload', owner: 'upload' },
    { pattern: '/upload/:batchId', role: 'staff', title: 'Upload', owner: 'upload', check: (p) => !!App.find.batch(p.batchId) },
    { pattern: '/clients', role: 'staff', title: 'Clients', owner: 'admin' },
    { pattern: '/clients/:id', role: 'staff', title: 'Clients', owner: 'admin', check: (p) => !!App.find.client(p.id) },
    { pattern: '/licences', role: 'staff', title: 'Licences', owner: 'admin' },
    { pattern: '/settings', role: 'staff', title: 'Settings', owner: 'admin' },
    { pattern: '/log', role: 'staff', title: 'Action log', owner: 'admin' },
    { pattern: '/overview', role: 'client', title: 'Overview', owner: 'client' },
    { pattern: '/my-images', role: 'client', title: 'My images', owner: 'client' },
    { pattern: '/my-images/:imageId', role: 'client', title: 'My images', owner: 'client',
      check: (p) => clientCanSee(p) && App.access.isOwn(App.currentContact().clientId, App.find.image(p.imageId)) },
    { pattern: '/find', role: 'client', title: 'Find images', owner: 'client' },
    { pattern: '/find/:imageId', role: 'client', title: 'Find images', owner: 'client', check: clientCanSee },
    { pattern: '/licences', role: 'client', title: 'Licences', owner: 'client' },
    { pattern: '/cart', role: 'client', title: 'Cart', owner: 'client' },
    { pattern: '/checkout', role: 'client', title: 'Check out', owner: 'client' },
    { pattern: '/checkout/done', role: 'client', title: 'Checkout done', owner: 'client' }
  ];
  const registry = {};

  App.registerScreen = function (pattern, def) {
    if (!def || !def.role || typeof def.render !== 'function') {
      throw new Error('App.registerScreen(' + pattern + '): role and render are required');
    }
    if (!ROUTES.some((r) => r.pattern === pattern && r.role === def.role)) {
      ROUTES.push({ pattern, role: def.role, title: typeof def.title === 'string' ? def.title : pattern, owner: 'custom' });
    }
    registry[def.role + ' ' + pattern] = def;
  };

  function parseHash(hash) {
    let s = String(hash || '').replace(/^#/, '');
    if (!s) s = '/';
    const qi = s.indexOf('?');
    const path = (qi === -1 ? s : s.slice(0, qi)).replace(/\/+$/, '') || '/';
    const query = {};
    if (qi !== -1) {
      s.slice(qi + 1).split('&').forEach((kv) => {
        if (!kv) return;
        const i = kv.indexOf('=');
        const k = decodeURIComponent(i === -1 ? kv : kv.slice(0, i));
        query[k] = i === -1 ? '' : decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' '));
      });
    }
    return { path, query };
  }
  function matchPattern(pattern, path) {
    const a = pattern.split('/').filter(Boolean);
    const b = path.split('/').filter(Boolean);
    if (a.length !== b.length) return null;
    const params = {};
    for (let i = 0; i < a.length; i++) {
      if (a[i][0] === ':') params[a[i].slice(1)] = decodeURIComponent(b[i]);
      else if (a[i] !== b[i]) return null;
    }
    return params;
  }
  const literalCount = (p) => p.split('/').filter((s) => s && s[0] !== ':').length;

  App.href = function (path, query) {
    const q = Object.keys(query || {}).filter((k) => query[k] !== '' && query[k] != null && query[k] !== false)
      .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(query[k])).join('&');
    return '#' + path + (q ? '?' + q : '');
  };

  function sessionStillValid() {
    const s = App.store.session;
    if (!s) return true;
    if (s.role === 'staff') { const u = App.find.user(s.userId); return !!(u && u.active); }
    return App.access.contactActive(s.contactId);
  }

  function resolve(hash) {
    const { path, query } = parseHash(hash);
    const sess = App.store.session;
    const matches = ROUTES.map((r) => ({ r, params: matchPattern(r.pattern, path) }))
      .filter((m) => m.params)
      .sort((x, y) => literalCount(y.r.pattern) - literalCount(x.r.pattern));
    const base = { path, query, hash };
    if (path === '/') return Object.assign(base, { kind: 'redirect', to: App.homeFor(sess) });
    if (!matches.length) return Object.assign(base, { kind: 'system', code: 404 });
    const pub = matches.find((m) => m.r.role === 'public');
    if (pub) {
      if (sess && pub.r.pattern === '/login') return Object.assign(base, { kind: 'redirect', to: App.homeFor(sess) });
      return Object.assign(base, { kind: registry['public ' + pub.r.pattern] ? 'screen' : 'not-built', route: pub.r, params: pub.params });
    }
    const sys = matches.find((m) => m.r.role === 'any');
    if (sys) return Object.assign(base, { kind: 'system', code: sys.r.pattern === '/403' ? 403 : 404 });
    if (!sess) return Object.assign(base, { kind: 'login' });
    const mine = matches.find((m) => m.r.role === sess.role);
    if (!mine) {
      const staffOnly = matches.some((m) => m.r.role === 'staff');
      return Object.assign(base, { kind: 'system', code: sess.role === 'client' && staffOnly ? 403 : 404 });
    }
    if (mine.r.check && !mine.r.check(mine.params)) return Object.assign(base, { kind: 'system', code: 404 });
    const key = sess.role + ' ' + mine.r.pattern;
    return Object.assign(base, { kind: registry[key] ? 'screen' : 'not-built', route: mine.r, params: mine.params });
  }

  /* ---------- route state ---------- */
  const state = {
    current: null, cleanup: [], scoped: [], leaveGuard: null, unloadWarning: false,
    returnTo: null, flash: null, sidebarOpen: null, detailsPick: null, detailsManaged: false, started: false
  };
  const mq = {};

  App.current = function () {
    const c = state.current;
    return c ? { path: c.res.path, pattern: c.res.route ? c.res.route.pattern : null, role: c.res.route ? c.res.route.role : null, params: c.params, def: c.def } : null;
  };

  App.setLeaveGuard = function (fn) { state.leaveGuard = fn || null; };
  function runGuard(target) {
    const g = state.leaveGuard;
    if (!g) return Promise.resolve(true);
    return Promise.resolve(g(target)).then((ok) => { if (ok) state.leaveGuard = null; return !!ok; });
  }
  function onBeforeUnload(e) { if (state.unloadWarning) { e.preventDefault(); e.returnValue = ''; } }
  App.setUnloadWarning = function (on) { state.unloadWarning = !!on; };

  App.on = function (type, selector, handler) {
    const fn = function (e) {
      const el = selector ? e.target.closest && e.target.closest(selector) : e.target;
      if (el) handler(e, el);
    };
    document.addEventListener(type, fn);
    state.scoped.push({ type, fn });
  };

  App.navigate = function (hash, opts) {
    opts = opts || {};
    if (!hash || hash[0] !== '#') hash = '#' + (hash || '/');
    const same = hash === window.location.hash;
    if (opts.replace) {
      window.history.replaceState(null, '', hash);
      if (opts.force) { route(); return; }
      onHashChange();
      return;
    }
    if (same) { route(); return; }
    window.location.hash = hash;
  };

  let lastHash = null;
  function onHashChange() {
    const target = window.location.hash;
    if (state.leaveGuard && target !== lastHash) {
      const back = lastHash;
      runGuard(target).then((ok) => {
        if (ok) route();
        else if (back) window.history.replaceState(null, '', back);
      });
      return;
    }
    route();
  }

  function teardown(keepGuard) {
    state.cleanup.forEach((fn) => { try { fn(); } catch (e) { window.console.error(e); } });
    state.cleanup = [];
    state.scoped.forEach((s) => document.removeEventListener(s.type, s.fn));
    state.scoped = [];
    if (!keepGuard) { state.leaveGuard = null; state.unloadWarning = false; }
    state.detailsPick = null;
    state.detailsManaged = false;
    closeAcctMenu(false);
    if (openDialog) openDialog.finish(null);
  }

  function route(opts) {
    opts = opts || {};
    let hash = window.location.hash || '#/login';
    if (!sessionStillValid()) {
      App.store.session = null;
      App.save();
      App.flash('Your account is not active. Contact the agency.', { color: 'danger' });
      window.history.replaceState(null, '', '#/login');
      hash = '#/login';
    }
    const res = resolve(hash);
    if (res.kind === 'redirect') { window.history.replaceState(null, '', res.to); return route(opts); }
    if (res.kind === 'login') {
      state.returnTo = hash;
      window.history.replaceState(null, '', '#/login');
      return route(opts);
    }
    const keep = !!opts.refresh;
    const prevFocusId = keep && document.activeElement ? document.activeElement.id : null;
    const scrollY = window.scrollY;
    teardown(keep);
    lastHash = hash;

    let def;
    const params = Object.assign({}, res.params || {}, { query: res.query });
    if (res.kind === 'screen') def = registry[res.route.role + ' ' + res.route.pattern];
    else if (res.kind === 'not-built') def = notBuiltDef(res.route);
    else def = systemDef(res.code);
    state.current = { res, def, params };

    const root = document.getElementById('app');
    const bare = def.role === 'public' || (res.kind === 'system' && !App.store.session);
    if (bare) renderBare(root, def, params);
    else renderShell(root, def, params, res);

    const title = typeof def.title === 'function' ? def.title(params) : def.title;
    document.title = (title ? title + ' · ' : '') + 'CRM-DAM prototype';

    if (def.mount) {
      const c = def.mount(root, params);
      if (typeof c === 'function') state.cleanup.push(c);
    }

    if (keep) {
      window.scrollTo(0, scrollY);
      const el = prevFocusId && document.getElementById(prevFocusId);
      if (el) el.focus();
    } else {
      window.scrollTo(0, 0);
      if (state.started) focusMain(root);
    }
    state.started = true;
  }

  function focusMain(root) {
    const h1 = root.querySelector('#main h1, main h1, h1');
    const target = h1 || root.querySelector('#main') || root;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }

  App.refresh = function (slot) {
    const c = state.current;
    if (!c) return;
    if (!slot) { route({ refresh: true }); return; }
    const def = c.def;
    const active = document.activeElement;
    const focusId = active && active.id;
    const root = document.getElementById('app');
    if (slot === 'main') {
      const main = document.getElementById('main');
      if (!main) return;
      detailsHome();
      main.innerHTML = String(def.render(c.params) || '');
      placeDetails();
    } else if (slot === 'sidebar') {
      const sb = document.getElementById('app-sidebar');
      if (sb && def.sidebar) sb.innerHTML = String(def.sidebar(c.params) || '');
    } else if (slot === 'details') {
      const body = document.getElementById('app-details-body');
      const html = def.details ? String(def.details(c.params) || '') : '';
      if (!body !== !html) { route({ refresh: true }); return; } // panel appears or goes away
      if (body) body.innerHTML = html;
    } else if (slot === 'topbar') {
      const tb = root.querySelector('.topbar');
      if (tb) tb.outerHTML = String(topbarHTML(def, c.params));
    }
    if (focusId && !document.body.contains(active)) {
      const el = document.getElementById(focusId);
      if (el) el.focus();
    }
  };

  /* ---------- system pages and "not built yet" ---------- */
  function systemDef(code) {
    const client = App.isClient();
    const home = App.homeFor(App.store.session);
    if (code === 403) {
      return {
        role: 'any', title: 'No access', nav: null,
        render: () => h`<div class="sys-page"><h1 class="page-title">You do not have access to this page</h1><p class="page-sub">This page is for agency staff. Nothing on it is shown to client contacts.</p><p class="sys-actions"><a class="ds-button" data-variant="primary" href="${home}">${client ? 'Go to your overview' : 'Go to the start page'}</a></p></div>`
      };
    }
    return {
      role: 'any', title: 'Not found', nav: null,
      render: () => h`<div class="sys-page"><h1 class="page-title">Page not found</h1><p class="page-sub">The page or image does not exist, or it is not available to you.</p><p class="sys-actions"><a class="ds-button" data-variant="primary" href="${home}">${App.store.session ? (client ? 'Go to your overview' : 'Go to the Library') : 'Go to the login page'}</a>${client ? h` <a class="ds-link" href="#/find">Find images</a>` : ''}</p></div>`
    };
  }
  function notBuiltDef(r) {
    return {
      role: r.role, title: r.title,
      render: () => h`<div class="not-built"><h1 class="page-title">${r.title}</h1><p>Screen not built yet.</p><p class="hint">Route <code>#${r.pattern}</code> for ${r.role === 'public' ? 'everyone' : r.role}. It appears here when <code>screens/${r.owner || 'custom'}.js</code> registers it.</p></div>`
    };
  }

  /* ======================================================================
     Shell
     ====================================================================== */
  const STAFF_NAV = [['library', 'Library', '#/library'], ['upload', 'Upload', '#/upload'], ['clients', 'Clients', '#/clients'], ['licences', 'Licences', '#/licences']];
  const CLIENT_NAV = [['overview', 'Overview', '#/overview'], ['my-images', 'My images', '#/my-images'], ['find', 'Find images', '#/find'], ['licences', 'Licences', '#/licences']];

  function navKey(def, params, path) {
    if (def.nav !== undefined) return def.nav;
    const seg = (path || '').split('/').filter(Boolean)[0] || '';
    return seg === 'image' ? 'library' : seg;
  }

  function topbarHTML(def, params) {
    const c = state.current;
    const path = c ? c.res.path : '';
    const client = App.isClient();
    const current = navKey(def, params, path);
    const nav = (client ? CLIENT_NAV : STAFF_NAV).map((n) =>
      h`<a href="${n[2]}"${n[0] === current ? App.raw(' aria-current="page"') : ''}>${n[1]}</a>`);
    const searchRoute = client ? '/find' : '/library';
    const q = path.indexOf(searchRoute) === 0 && c ? c.params.query.q || '' : '';
    const searchLabel = client ? 'Search images' : 'Search title, description, keywords and places';
    const toggle = def.sidebar
      ? h`<button class="ds-button" data-variant="tertiary" data-icon type="button" data-sidebar-toggle aria-expanded="${sidebarIsOpen() ? 'true' : 'false'}" aria-controls="app-sidebar">${App.icon('panel', { cls: 'ic-panel' })}${App.icon('close', { cls: 'ic-close' })}<span class="ds-sr-only">${def.sidebarToggleLabel || 'Show or hide filters'}</span></button>`
      : '';
    const wordmark = client
      ? h`<a class="wordmark client-name" href="#/overview"><span>${(App.currentClient() || {}).name}</span><small>Image portal</small></a>`
      : h`<a class="wordmark" href="#/library"><span class="wordmark-mark" aria-hidden="true"></span>CRM-DAM</a>`;
    return h`<header class="topbar">${toggle}${wordmark}<nav class="mainnav" aria-label="Main">${nav}</nav><form class="hsearch" role="search" data-hsearch><div class="ds-search" data-size="sm"><input class="ds-input" type="search" id="hsearch" name="q" aria-label="${searchLabel}" placeholder="${searchLabel}" value="${q}"><button class="ds-button" type="reset" data-variant="tertiary" aria-label="Clear search"></button></div></form><div class="topbar-end">${topbarEndHTML(current)}</div></header>`;
  }

  function cartButtonHTML(current) {
    const contact = App.currentContact();
    if (!contact) return '';
    const n = App.cart.count(contact.id);
    const isCur = current === 'cart' || current === 'checkout';
    return h`<a class="ds-button cart-btn" data-variant="secondary" href="#/cart"${isCur ? App.raw(' aria-current="page"') : ''}${n ? '' : App.raw(' aria-label="Cart, empty"')}>${App.icon('cart')}<span class="btn-label">Cart</span>${n ? h` <span class="ds-badge" data-count="${n}" aria-label="${App.fmt.plural(n, 'image')}"></span>` : ''}</a>`;
  }

  function topbarEndHTML(current) {
    const user = App.currentUser();
    const contact = App.currentContact();
    const who = user || contact;
    if (!who) return '';
    const sub = user ? who.email : (App.currentClient() || {}).name;
    const items = user
      ? h`<li><a href="#/settings">Settings</a></li><li><a href="#/log">Action log</a></li>`
      : '';
    return h`${cartButtonHTML(current)}<div class="acct"><button class="who acct-btn" type="button" data-acct-toggle aria-expanded="false" aria-controls="acct-menu" aria-label="Account: ${who.firstName}">${App.avatar(who.firstName, { short: true })}<span>${who.firstName}</span></button><div class="acct-menu" id="acct-menu" hidden><p class="acct-who"><b>${who.name}</b><span>${sub}</span></p><ul>${items}<li><button type="button" data-logout>Log out</button></li></ul></div></div>`;
  }

  App.refreshChrome = function () {
    const end = document.querySelector('#app .topbar-end');
    const c = state.current;
    if (!end || !c) return;
    const old = end.querySelector('.cart-btn');
    const html = String(cartButtonHTML(navKey(c.def, c.params, c.res.path)));
    if (old) {
      if (html) old.outerHTML = html; else old.remove();
    } else if (html) end.insertAdjacentHTML('afterbegin', html);
  };

  function renderBare(root, def, params) {
    root.className = 'app auth-app';
    root.removeAttribute('data-sidebar');
    root.setAttribute('data-role', 'public');
    if (def.role === 'any') {
      root.innerHTML = String(h`<main class="auth"><div class="auth-card">${def.render(params)}</div></main>`);
    } else {
      root.innerHTML = String(def.render(params) || '');
    }
  }

  function sidebarIsOpen() {
    if (state.sidebarOpen === null) state.sidebarOpen = !App.isNarrow();
    return state.sidebarOpen;
  }

  function renderShell(root, def, params, res) {
    const hasSb = !!def.sidebar;
    const detailsBody = def.details ? String(def.details(params) || '') : '';
    const hasDetails = !!detailsBody;
    if (App.isNarrow()) state.sidebarOpen = false;
    root.className = 'app' + (hasSb ? '' : ' no-sb');
    root.setAttribute('data-role', App.isClient() ? 'client' : 'staff');
    root.setAttribute('data-route', res.route ? res.route.pattern : '/' + (res.code || ''));
    root.setAttribute('data-sidebar', hasSb && sidebarIsOpen() ? 'open' : 'closed');
    root.setAttribute('data-captions', App.prefs.get('captions', true) ? 'on' : 'off');
    document.documentElement.style.overflow = '';
    const sidebar = hasSb
      ? h`<aside class="sidebar" id="app-sidebar" tabindex="-1" aria-label="${def.sidebarLabel || 'Filters'}">${App.raw(String(def.sidebar(params) || ''))}</aside>`
      : '';
    const details = hasDetails
      ? h`<aside class="inspector" id="app-details" aria-label="${def.detailsLabel || 'Details'}"><div class="insp-inline-bar"><button class="ds-button" data-variant="tertiary" data-size="sm" type="button" data-details-close>${App.icon('close')}Close details</button></div><div class="details-body" id="app-details-body">${App.raw(detailsBody)}</div></aside>`
      : '';
    root.innerHTML = String(h`${topbarHTML(def, params)}<div class="workspace${hasDetails ? '' : ' no-insp'}">${sidebar}<main class="main" id="main" tabindex="-1">${flashHTML(App.takeFlash())}${App.raw(String(def.render(params) || ''))}</main>${details}</div>`);
  }

  /* ---------- sidebar and drawer (from key-screens) ---------- */
  App.isNarrow = () => (mq.narrow ? mq.narrow.matches : false);
  App.isTight = () => (mq.tight ? mq.tight.matches : false);

  function placeDrawer() {
    const app = document.getElementById('app');
    const t = app.querySelector('[data-sidebar-toggle]');
    if (!t) return;
    const top = Math.max(0, app.getBoundingClientRect().top);
    app.style.setProperty('--drawer-top', top + 'px');
    app.style.setProperty('--drawer-pad', Math.round(t.getBoundingClientRect().bottom - top + 20) + 'px');
  }
  function setSidebar(open, opts) {
    opts = opts || {};
    const app = document.getElementById('app');
    const t = app.querySelector('[data-sidebar-toggle]');
    if (!t) return;
    state.sidebarOpen = open;
    app.setAttribute('data-sidebar', open ? 'open' : 'closed');
    t.setAttribute('aria-expanded', String(open));
    const asDrawer = open && App.isNarrow();
    document.documentElement.style.overflow = asDrawer ? 'hidden' : '';
    if (asDrawer) {
      placeDrawer();
      if (opts.focus) { const sb = document.getElementById('app-sidebar'); if (sb) sb.focus(); }
    }
    if (!open && opts.returnFocus) t.focus();
  }
  function drawerOpen() {
    const app = document.getElementById('app');
    return App.isNarrow() && app && app.getAttribute('data-sidebar') === 'open' && !!app.querySelector('[data-sidebar-toggle]');
  }
  App.sidebar = {
    open: () => setSidebar(true, { focus: true }),
    close: () => setSidebar(false, { returnFocus: true }),
    isOpen: () => document.getElementById('app').getAttribute('data-sidebar') === 'open'
  };

  /* ---------- account menu ---------- */
  function closeAcctMenu(returnFocus) {
    const menu = document.getElementById('acct-menu');
    const btn = document.querySelector('[data-acct-toggle]');
    if (!menu || menu.hidden) return false;
    menu.hidden = true;
    if (btn) { btn.setAttribute('aria-expanded', 'false'); if (returnFocus) btn.focus(); }
    return true;
  }
  function openAcctMenu() {
    const menu = document.getElementById('acct-menu');
    const btn = document.querySelector('[data-acct-toggle]');
    if (!menu) return;
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    const first = menu.querySelector('a, button');
    if (first) first.focus();
  }

  /* ---------- details panel placement (right column, or inline at <= 1240 px) ---------- */
  function detailsHome() {
    const a = document.getElementById('app-details');
    const ws = document.querySelector('#app .workspace');
    if (a && ws && a.parentNode !== ws) ws.appendChild(a);
    document.querySelectorAll('#app li.wall-insp').forEach((li) => li.remove());
    document.querySelectorAll('#app .wall > li.is-open').forEach((li) => li.classList.remove('is-open'));
  }
  function findPick() {
    const id = state.detailsPick;
    if (!id) return null;
    return document.querySelector('#app [data-pick][data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
  }
  function placeDetails() {
    if (!state.detailsManaged) return;
    const a = document.getElementById('app-details');
    const c = state.current;
    if (!a || !c) return;
    const inline = App.isTight() && c.def.inlineDetails !== false;
    const pick = findPick();
    detailsHome();
    document.querySelectorAll('#app [data-select-group] [data-pick]').forEach((p) => {
      if (inline) p.setAttribute('aria-expanded', String(p === pick)); else p.removeAttribute('aria-expanded');
    });
    if (!inline) { a.classList.remove('is-inline'); a.hidden = false; return; }
    a.classList.add('is-inline');
    if (!pick) { a.hidden = true; return; }
    a.hidden = false;
    const li = pick.closest('li');
    const group = pick.closest('[data-select-group]');
    if (group && group.classList.contains('wall')) {
      li.classList.add('is-open');
      const host = document.createElement('li');
      host.className = 'wall-insp';
      li.after(host);
      host.appendChild(a);
    } else if (li) {
      li.appendChild(a);
    }
  }
  App.details = {
    place(pickEl) {
      state.detailsManaged = true;
      state.detailsPick = pickEl ? pickEl.getAttribute('data-id') : null;
      placeDetails();
    },
    isInline: () => App.isTight() && !!state.current && state.current.def.inlineDetails !== false,
    currentId: () => state.detailsPick,
    collapse() {
      const pick = findPick();
      state.detailsPick = null;
      placeDetails();
      if (pick) pick.focus();
    }
  };

  /* ======================================================================
     Prototype pill (bottom-left, outside the design)
     ====================================================================== */
  /* Prototype only: how many sample files "Choose files" / drop adds on Upload (10 or 100). */
  App.protoBatchSize = function () {
    try { return window.localStorage.getItem('proto-batch-size') === '100' ? 100 : 10; } catch (e) { return 10; }
  };
  function renderPill() {
    if (document.getElementById('proto-pill')) return;
    const el = document.createElement('details');
    el.className = 'proto-pill';
    el.id = 'proto-pill';
    el.innerHTML = String(h`<summary>Prototype</summary><div class="proto-body" role="group" aria-label="Prototype controls"><p class="proto-h">Switch role</p><button class="ds-button" data-variant="secondary" data-size="sm" type="button" data-proto-role="staff">Staff: Ida</button><button class="ds-button" data-variant="secondary" data-size="sm" type="button" data-proto-role="client">Client: Jonas Hauge, Fjordkaffe AS</button><p class="proto-h">Sample batch for "Choose files"</p><div class="proto-size">${[10, 100].map((n) => h`<label><input type="radio" name="proto-size" value="${n}" data-proto-size${App.protoBatchSize() === n ? App.raw(' checked') : ''}> ${n} files</label>`)}</div><button class="ds-button" data-variant="tertiary" data-size="sm" type="button" data-proto-reset>Reset data</button><p class="proto-links"><a class="ds-link" href="../../EXPERIENCE.md">Behaviour spine</a> <a class="ds-link" href="../../DESIGN.md">Design spine</a></p></div>`);
    document.body.appendChild(el);
  }

  /* ======================================================================
     Global listeners (permanent)
     ====================================================================== */
  function bindGlobal() {
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('resize', () => { if (drawerOpen()) placeDrawer(); });
    mq.narrow.addEventListener('change', () => {
      if (document.getElementById('app-sidebar')) setSidebar(!App.isNarrow());
      else state.sidebarOpen = !App.isNarrow();
    });
    mq.tight.addEventListener('change', placeDetails);

    document.addEventListener('click', (e) => {
      const t = e.target;
      if (!t.closest) return;
      const pill = document.getElementById('proto-pill');

      const toggle = t.closest('[data-sidebar-toggle]');
      if (toggle) {
        const open = document.getElementById('app').getAttribute('data-sidebar') !== 'open';
        setSidebar(open, { focus: open, returnFocus: !open });
        return;
      }
      if (drawerOpen() && !t.closest('dialog') && !t.closest('.sidebar') && !(pill && pill.contains(t))) {
        setSidebar(false, { returnFocus: true });
      }

      const acct = t.closest('[data-acct-toggle]');
      if (acct) {
        if (acct.getAttribute('aria-expanded') === 'true') closeAcctMenu(true); else openAcctMenu();
        return;
      }
      if (!t.closest('.acct')) closeAcctMenu(false);
      if (t.closest('[data-logout]')) { closeAcctMenu(false); App.logout(); return; }
      if (t.closest('.acct-menu a')) closeAcctMenu(false);

      if (t.closest('[data-details-close]')) {
        const c = state.current;
        if (c && c.def.onCloseDetails) c.def.onCloseDetails(App.details.collapse); else App.details.collapse();
        return;
      }
      const terms = t.closest('[data-licence-terms]');
      if (terms) { e.preventDefault(); App.licenceTermsDialog(); return; }

      const role = t.closest('[data-proto-role]');
      if (role) {
        pill.open = false;
        if (role.getAttribute('data-proto-role') === 'staff') App.switchSession({ role: 'staff', userId: 'u-ida' });
        else App.switchSession({ role: 'client', contactId: 'k-jonas' });
        return;
      }
      if (t.closest('[data-proto-reset]')) {
        pill.open = false;
        App.confirm({
          title: 'Reset the prototype data?',
          body: h`<p class="ds-paragraph">Every change made in this tab is lost and the seed data comes back. You are logged out.</p>`,
          confirm: 'Reset data', danger: true
        }).then((ok) => { if (ok) { state.leaveGuard = null; state.unloadWarning = false; App.reset(); } });
      }
    });

    document.addEventListener('submit', (e) => {
      const form = e.target.closest && e.target.closest('[data-hsearch]');
      if (!form) return;
      e.preventDefault();
      const q = form.querySelector('input').value.trim();
      App.navigate(App.href(App.isClient() ? '/find' : '/library', { q }));
    });
    document.addEventListener('reset', (e) => {
      const form = e.target.closest && e.target.closest('[data-hsearch]');
      const c = state.current;
      if (!form || !c || !c.params.query.q) return;
      const base = App.isClient() ? '/find' : '/library';
      if (c.res.path.indexOf(base) === 0) {
        const query = Object.assign({}, c.params.query);
        delete query.q;
        delete query.page;
        App.navigate(App.href(c.res.path, query));
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.matches && e.target.matches('[data-proto-size]')) {
        try { window.localStorage.setItem('proto-batch-size', e.target.value); } catch (err) { /* private window: stays 10 */ }
        return;
      }
      const sw = e.target.closest && e.target.closest('[data-caption-toggle]');
      if (!sw) return;
      App.prefs.set('captions', sw.checked);
      document.getElementById('app').setAttribute('data-captions', sw.checked ? 'on' : 'off');
      document.querySelectorAll('[data-caption-toggle]').forEach((o) => { o.checked = sw.checked; });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || document.querySelector('dialog[open]')) return;
      if (closeAcctMenu(true)) { e.preventDefault(); return; }
      const pill = document.getElementById('proto-pill');
      if (pill && pill.open && pill.contains(document.activeElement)) { pill.open = false; pill.querySelector('summary').focus(); return; }
      if (drawerOpen()) { e.preventDefault(); setSidebar(false, { returnFocus: true }); }
    });
    document.addEventListener('focusout', (e) => {
      const acct = e.target.closest && e.target.closest('.acct');
      if (acct && e.relatedTarget && !acct.contains(e.relatedTarget)) closeAcctMenu(false);
    });
  }

  /* ======================================================================
     Start
     ====================================================================== */
  App.start = function () {
    App.store = load();
    mq.narrow = window.matchMedia('(max-width: 900px)');
    mq.tight = window.matchMedia('(max-width: 1240px)');
    renderPill();
    bindGlobal();
    if (!window.location.hash) window.history.replaceState(null, '', App.homeFor(App.store.session));
    route();
  };

  /* exposed for tests and the screen files' own checks */
  App._seed = seed;
  App._resolve = resolve;
  App._routes = ROUTES;
})(window, document);
