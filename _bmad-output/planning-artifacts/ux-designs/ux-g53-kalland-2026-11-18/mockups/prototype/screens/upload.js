/* Owner: Staff Upload (#/upload, #/upload/:batchId). Screen JS for this area; register screens with App.registerScreen (see app.js).
   Spines win: EXPERIENCE.md (Upload component patterns, Editing and Saving = autosave for drafts, D-033,
   State Patterns -> Upload rows, UJ-2) and DESIGN.md (Components -> Upload). NFR-7 messages are word for word.
   Processing is simulated with a timer while a batch is open: uploading -> queued -> generating -> ready / failed.
   Per-area state that survives reload lives in App.store.ui.upload. */
(function (App) {
  'use strict';
  const h = App.h;

  const TICK_MS = 500;
  const MAX_GENERATING = 3;
  const ALT_MAX = 250;
  const KW_MAX = 15;
  const MSG_SAVE_FAILED = 'Your change was not saved. Try again.';
  const MSG_DECIDE = 'Decide on the file name match first. Then you can publish it.';
  const MSG_WAIT = 'Wait until its metadata is ready. Then you can publish it.';
  const MSG_PRICE = 'Enter a price above 0 in whole USD.';
  const MSG_ALT_LONG = 'Alt text can be at most 250 characters.';
  const REJECT_REASON = {
    type: 'it is not a JPEG or PNG image',
    size: 'it is larger than 50 MB',
    damaged: 'the file is damaged'
  };
  const PROCESSING = ['uploading', 'queued', 'generating'];
  const PH_CYCLE = ['p-fjord', 'p-harbour', 'p-cafe', 'p-market', 'p-latte', 'p-ridge', 'p-tram', 'p-beans'];

  /* To-do groups (sidebar) and their file states. */
  const KINDS = [
    { key: 'failed', cls: 'is-danger', states: ['failed'], one: 'failed', many: 'failed', hint: 'Fill in the fields or try again' },
    { key: 'match', cls: 'is-warn', states: ['needs-decision'], one: 'file name match', many: 'file name matches', hint: 'Keep both or discard the new file' },
    { key: 'alt', cls: 'is-warn', states: ['needs-alt'], one: 'needs alt text', many: 'need alt text', hint: 'Publishing without it makes them less accessible', hintOne: 'Publishing without it makes it less accessible' },
    { key: 'ready', cls: 'is-ok', states: ['ready'], one: 'ready to publish', many: 'ready to publish', hint: 'Checked and complete' },
    { key: 'processing', cls: 'is-quiet', states: PROCESSING, one: 'still processing', many: 'still processing', hint: 'Updates on its own' },
    { key: 'notadded', cls: 'is-quiet', states: ['rejected'], one: 'not added', many: 'not added', hint: 'Identical file or not an image' },
    { key: 'published', cls: 'is-quiet', states: ['published', 'archived'], one: 'published', many: 'published', hint: 'In the library now' }
  ];
  /* "Files that need you first" */
  const RANK = { 'needs-decision': 0, failed: 1, 'needs-alt': 2, rejected: 3, uploading: 4, queued: 4, generating: 4, ready: 5, published: 6, archived: 6 };

  /* Mock AI output per placeholder photo (Mock provider, test mode). */
  const MOCK = {
    'p-fjord': ['Calm fjord in the morning', 'Still water on a fjord in the early morning, with a green headland under a pale sky.', 'Calm fjord with a green headland under a pale morning sky', ['fjord', 'morning', 'calm', 'water', 'landscape']],
    'p-harbour': ['Harbour lights at dusk', 'Boats and wharf houses reflected in the harbour at dusk, under a pink sky.', 'Harbour at dusk with houses and boats reflected in the water', ['harbour', 'dusk', 'reflection', 'boats', 'pink']],
    'p-cafe': ['Café window in the rain', 'Rain streaks on the window of a warm, lamp-lit café in the evening.', 'Rain-streaked café window with warm lamps inside', ['café', 'rain', 'evening', 'window', 'cosy']],
    'p-market': ['Market stalls at dawn', 'Stalls with red awnings being set up at a market just after sunrise.', 'Market stalls with red awnings at dawn', ['market', 'dawn', 'stalls', 'red', 'city']],
    'p-latte': ['Latte art in a white cup', 'A heart in latte art in a white cup, close-up in warm window light.', 'Heart in latte art in a white cup, close-up', ['latte art', 'coffee', 'cup', 'close-up', 'warm']],
    'p-ridge': ['Ridge above the fjord', 'A sharp mountain ridge above a deep blue fjord on a clear day.', 'Mountain ridge above a deep blue fjord on a clear day', ['mountain', 'ridge', 'fjord', 'clear sky', 'landscape']],
    'p-tram': ['Tram lights in the snow', 'A snowy street at night, lit by the lights of a passing tram.', 'Snowy street at night lit by tram lights', ['snow', 'night', 'tram', 'winter', 'street']],
    'p-beans': ['Roasted beans on linen', 'Freshly roasted coffee beans on a pale linen cloth, seen from above.', 'Roasted coffee beans on a pale linen cloth seen from above', ['coffee beans', 'roasted', 'linen', 'flat lay', 'brown']],
    'p-filter': ['Filter coffee from above', 'A cup of filter coffee on a green café table, seen from above.', 'Cup of filter coffee seen from above on a green table', ['filter coffee', 'cup', 'flat lay', 'green', 'café']],
    'p-barista': ['Barista behind the counter', 'A smiling barista behind the counter of a dark café.', 'Smiling barista behind the counter of a dark café', ['barista', 'café', 'portrait', 'counter', 'smile']],
    'p-pack': ['Coffee bag on a pale table', 'A coffee bag with an autumn label on a pale table against a white wall.', 'Coffee bag with an autumn label on a pale table', ['packaging', 'coffee bag', 'label', 'product shot', 'autumn']],
    'p-roaster': ['Roaster drum in warm light', 'The coffee roaster drum in a dark roastery, lit by warm light from a window.', 'Coffee roaster drum in a dark roastery with warm window light', ['roastery', 'roaster', 'coffee', 'warm light', 'industrial']]
  };
  const MOCK_FALLBACK = ['Photo from the shoot', 'A photo from the shoot.', 'Photo from the shoot', ['photo']];

  /* ---------------------------------------------------------------- module state (per mount) */
  let sel = null;            // selected file id in the open batch
  let view = null;           // { key, ids, seen } stable order of the file list
  let editing = null;        // batch id whose settings form is open
  let editDraft = null;      // settings draft while editing
  let newDraft = null;       // settings draft on the New batch page
  let jumpToRows = false;    // a To do item was clicked: scroll to the rows it moved to the top
  let result = null;         // { batchId, published:[names], skipped:[{name, reason}] }
  let lastSidebar = '';
  let lastDetailsKey = '';
  let rowCache = {};         // fileId -> { th, txt, end }
  let partCache = {};        // part name -> html
  let pending = {};          // field -> { imageId, value, timer }
  let timers = [];
  let wasProcessing = false;
  let wasUploading = false;
  let sbRendered = '';       // sidebar html currently in the DOM
  let dpartCache = {};       // details part -> html currently in the DOM
  let mounted = false;

  /* ---------------------------------------------------------------- data helpers */
  function U() {
    if (!App.store.ui) App.store.ui = {};
    if (!App.store.ui.upload) App.store.ui.upload = { sel: {}, edited: {}, plan: {}, seq: 500 };
    if (!App.store.ui.upload.openDone) App.store.ui.upload.openDone = {};
    return App.store.ui.upload;
  }
  function me() { return App.currentUser(); }
  const stateOf = (f) => App.batchFileState(f);
  function liveFiles(b) { return b.files.filter((f) => !f.dismissed && stateOf(f) !== 'discarded'); }
  function fileById(b, id) { return b.files.find((x) => x.id === id) || null; }
  function countStates(b) {
    const c = {};
    liveFiles(b).forEach((f) => { const s = stateOf(f); c[s] = (c[s] || 0) + 1; });
    return c;
  }
  function kindCount(c, kind) { return kind.states.reduce((n, s) => n + (c[s] || 0), 0); }
  function isEditable(f) {
    const s = stateOf(f);
    return s === 'ready' || s === 'needs-alt' || s === 'failed' || s === 'needs-decision';
  }
  function isPublishable(f) { const s = stateOf(f); return s === 'ready' || s === 'needs-alt' || s === 'failed'; }
  function nameOf(f) { const im = App.find.image(f.imageId); return (im && im.title) || f.fileName; }
  function missingFields(im) {
    const out = [];
    if (!im.title) out.push('title');
    if (!im.description) out.push('description');
    if (!im.altText) out.push('alt text');
    if (!(im.keywords || []).length) out.push('keywords');
    return out;
  }
  function listAnd(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  function s4(im) { return im.visibility === 'restricted' && !(im.clients || []).length; }
  function hashNum(s) { let n = 0; for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 9973; return n; }
  function edited(imageId) { const e = U().edited; return e[imageId] || (e[imageId] = []); }
  function markEdited(imageId, field) { const e = edited(imageId); if (e.indexOf(field) === -1) e.push(field); }
  function plan(imageId) { const p = U().plan; return p[imageId] || (p[imageId] = {}); }
  function currentBatch() {
    const c = App.current();
    return c && c.pattern === '/upload/:batchId' ? App.find.batch(c.params.batchId) : null;
  }
  function locker(im) {
    const u = App.locks.holder(im);
    return u && me() && u.id !== me().id ? u : null;
  }

  /* settings <-> draft (the forms keep paid/amount apart so typing never loses the value) */
  function draftFrom(s) {
    return { name: '', visibility: s.visibility, clients: (s.clients || []).slice(), priceMode: s.price > 0 ? 'paid' : 'free',
      amount: s.price > 0 ? String(s.price) : '', ai: s.ai !== false, placeNames: s.placeNames !== false, keywords: (s.keywords || []).slice() };
  }
  function defaultDraft() { return draftFrom({ visibility: 'internal', clients: [], price: 0, ai: true, placeNames: true, keywords: [] }); }
  function validAmount(v) { return /^\s*\d+\s*$/.test(String(v)) && parseInt(v, 10) > 0; }
  function settingsFrom(d) {
    return { visibility: d.visibility, clients: d.visibility === 'restricted' ? d.clients.slice() : [],
      price: d.priceMode === 'paid' ? parseInt(d.amount, 10) : 0, ai: d.ai, placeNames: d.ai && d.placeNames, keywords: d.keywords.slice() };
  }
  function settingsLine(s) {
    let vis;
    if (s.visibility === 'public') vis = 'Public';
    else if (s.visibility === 'internal') vis = 'Internal only';
    else if ((s.clients || []).length) vis = 'Restricted to ' + listAnd((s.clients || []).map((id) => (App.find.client(id) || {}).name).filter(Boolean));
    else vis = 'Restricted, no clients yet (behaves as internal only)';
    const price = s.price > 0 ? s.price + ' USD per licence' : 'free';
    const ai = s.ai ? (s.placeNames ? 'AI metadata with place names' : 'AI metadata without place names') : 'metadata by hand';
    const kw = (s.keywords || []).length ? 'keywords ' + listAnd(s.keywords) : 'no batch keywords';
    return vis + ', ' + price + ', ' + ai + ', ' + kw;
  }

  /* ---------------------------------------------------------------- file order (stable while you work) */
  function sortFiles(files) {
    const idx = {};
    files.forEach((f, i) => { idx[f.id] = i; });
    return files.slice().sort((a, b) => (RANK[stateOf(a)] - RANK[stateOf(b)]) || (idx[a.id] - idx[b.id]));
  }
  function topRank(kind, f) { return kind && kind.states.indexOf(stateOf(f)) === -1 ? 1 : 0; }
  /* The order holds while you work and catches up when you are idle: no file selected and
     focus outside the file list and the Details panel. Rows never move under the cursor. */
  function isIdle() {
    const a = document.activeElement;
    return !sel && !(a && a.closest && a.closest('#main .files, #app-details'));
  }
  function shownIds(b, show) {
    const live = liveFiles(b);
    const liveSet = new Set(live.map((f) => f.id));
    const key = b.id + '|' + (show || '');
    if (!view || view.key !== key || live.some((f) => !view.seen.has(f.id)) || isIdle()) {
      const kind = KINDS.find((k) => k.key === show);
      view = {
        key,
        /* a To do item moves its files to the top; every file stays in the list */
        ids: sortFiles(live).sort((x, y) => topRank(kind, x) - topRank(kind, y)).map((f) => f.id),
        seen: new Set(live.map((f) => f.id))
      };
    }
    view.ids = view.ids.filter((id) => liveSet.has(id));
    return view.ids;
  }

  /* Ready and published files fold into one group row at the end of the list, so the rows
     that need you stay in view. The group opens on "Show", when its to-do item is the current
     one, when the selected file is in it, or when nothing else is left. */
  const DONE = ['ready', 'published', 'archived'];
  function fileList(b, show) {
    const ids = shownIds(b, show);
    const isDone = (id) => DONE.indexOf(stateOf(fileById(b, id))) !== -1;
    const done = ids.filter(isDone);
    const rest = ids.filter((id) => !isDone(id));
    if (!done.length || show === 'ready' || show === 'published') return { rows: ids, done, group: null };
    const open = !!U().openDone[b.id] || done.indexOf(sel) !== -1 || !rest.length;
    return { rows: open ? rest.concat(done) : rest, done, group: { at: rest.length, open } };
  }
  function listKey(b, fl) {
    const keys = fl.rows.slice();
    if (fl.group) keys.splice(fl.group.at, 0, 'group:' + groupText(b, fl.done) + ':' + fl.group.open);
    return keys.join();
  }
  function groupText(b, done) {
    const n = { ready: 0, published: 0 };
    done.forEach((id) => { n[stateOf(fileById(b, id)) === 'ready' ? 'ready' : 'published']++; });
    return [n.ready ? n.ready + ' ready to publish' : '', n.published ? n.published + ' published' : ''].filter(Boolean).join(', ');
  }
  function groupHTML(b, fl) {
    const open = fl.group.open;
    return h`<li class="file-group" data-group="${'group:' + groupText(b, fl.done) + ':' + open}"><button class="up-fold ds-focus" type="button" data-fold id="up-fold" aria-expanded="${open ? 'true' : 'false'}"><span class="up-fold-n">${groupText(b, fl.done)}</span><span class="up-fold-act">${open ? 'Hide' : 'Show'}</span></button></li>`;
  }

  /* ---------------------------------------------------------------- shared markup */
  function clientChips(scope, d) {
    const ids = d.clients || [];
    const free = App.store.clients.filter((c) => c.active && ids.indexOf(c.id) === -1);
    return h`${ids.map((id) => {
      const c = App.find.client(id);
      return c ? h`<button class="ds-chip" type="button" data-removable="true" data-size="sm" data-acc-remove="${id}" aria-label="${'Remove ' + c.name}">${c.name}</button>` : '';
    })}${free.length ? h`<select class="ds-input up-add-client" data-size="sm" data-acc="add-client" id="${'up-' + scope + '-addcl'}" aria-label="Add client"><option value="">Add client</option>${free.map((c) => h`<option value="${c.id}">${c.name}</option>`)}</select>` : ''}${
      ids.length ? '' : h`<p class="up-warn">No clients chosen yet, so it behaves as internal only.</p>`}`;
  }

  /* Visibility + clients + price. d: { visibility, clients, priceMode, amount }. */
  function accessHTML(scope, d, opts) {
    opts = opts || {};
    const p = 'up-' + scope + '-';
    const radio = (name, value, label, checked) =>
      h`<label class="ds-button" data-variant="tertiary"><input type="radio" name="${p + name}" value="${value}" data-acc="${name}"${checked ? App.raw(' checked') : ''}${opts.disabled ? App.raw(' disabled') : ''}>${label}</label>`;
    return h`<div class="access-key">
      <div class="row">
        <span id="${p + 'vis-l'}">Visibility</span>
        <fieldset class="ds-toggle-group" aria-labelledby="${p + 'vis-l'}" data-size="sm">
          ${radio('vis', 'internal', 'Internal', d.visibility === 'internal')}${radio('vis', 'restricted', 'Restricted', d.visibility === 'restricted')}${radio('vis', 'public', 'Public', d.visibility === 'public')}
        </fieldset>
        <p class="hint vh vh-internal">Only agency staff can see it.</p>
        <p class="hint vh vh-restricted">Only the clients you list can see it.</p>
        <p class="hint vh vh-public">Every logged-in client can find it.</p>
      </div>
      <div class="row clients-row">
        <span id="${p + 'cl-l'}">Clients</span>
        <p class="hint cl-none">All clients. Choose Restricted to limit it to the clients you list.</p>
        <div class="chips cl-pick" role="group" aria-labelledby="${p + 'cl-l'}" data-acc-clients>${clientChips(scope, d)}</div>
      </div>
      <div class="row">
        <span id="${p + 'price-l'}">Price</span>
        <fieldset class="ds-toggle-group" aria-labelledby="${p + 'price-l'}" data-size="sm">
          ${radio('price', 'free', 'Free', d.priceMode !== 'paid')}${radio('price', 'paid', 'Paid', d.priceMode === 'paid')}
        </fieldset>
        <ds-field class="ds-field price-amt" data-size="sm"><label class="ds-label" data-weight="regular" for="${p + 'amt'}">Price per licence, ex VAT</label><div class="ds-field-affixes"><input class="ds-input" id="${p + 'amt'}" type="number" min="1" step="1" inputmode="numeric" value="${d.amount}" data-acc="amt" aria-describedby="${p + 'amt-err'}"${opts.disabled ? App.raw(' disabled') : ''}><span class="ds-field-affix">USD</span></div><p class="ds-validation-message" data-field="validation" id="${p + 'amt-err'}" hidden></p></ds-field>
      </div>
    </div>`;
  }

  function keywordChips(scope, kws, batchKws) {
    const chip = (k) => h`<button class="ds-chip" type="button" data-removable="true" data-size="sm" data-kw-remove="${k}" aria-label="${'Remove keyword ' + k}">${k}</button>`;
    if (!batchKws) return h`<div class="chips">${kws.map(chip)}</div>`;
    const fromBatch = kws.filter((k) => batchKws.indexOf(k) !== -1);
    const own = kws.filter((k) => batchKws.indexOf(k) === -1);
    return h`${fromBatch.length ? h`<div class="kw-group"><span>From batch</span><div class="chips">${fromBatch.map(chip)}</div></div>` : ''}${
      own.length ? h`<div class="kw-group"><span>This image</span><div class="chips">${own.map(chip)}</div></div>` : ''}`;
  }
  function keywordsHTML(scope, kws, batchKws, opts) {
    opts = opts || {};
    const p = 'up-' + scope + '-kw';
    const own = batchKws ? kws.filter((k) => batchKws.indexOf(k) === -1).length : kws.length;
    return h`<div data-kw-scope="${scope}">
      <div class="ds-label up-kw-label" id="${p + '-l'}">${opts.label || 'Keywords'}${batchKws ? h` <span class="up-kw-n">(${own} of ${KW_MAX})</span>` : ''}</div>
      <div data-kw-list>${keywordChips(scope, kws, batchKws)}</div>
      <div class="up-kw-add">
        <input class="ds-input" data-size="sm" id="${p + '-in'}" data-kw-input aria-labelledby="${p + '-l'}" aria-describedby="${p + '-err'}" placeholder="Add keyword"${opts.disabled ? App.raw(' disabled') : ''}>
        <button class="ds-button" data-variant="tertiary" data-size="sm" type="button" data-kw-add${opts.disabled ? App.raw(' disabled') : ''}>Add keyword</button>
      </div>
      <p class="ds-validation-message" data-field="validation" id="${p + '-err'}" hidden></p>
    </div>`;
  }

  function dropBarHTML() {
    return h`<div class="drop up-drop-bar" data-drop role="group" aria-label="Add more files to this batch">
      <button class="ds-button" data-variant="secondary" data-size="sm" type="button" data-choose id="up-choose">${App.icon('plus')}Add more files</button>
      <p class="ds-paragraph">or drop JPEG or PNG files anywhere on this page, up to 50 MB each</p>
    </div>`;
  }
  function dropHTML(label) {
    return h`<div class="drop">
      <p class="ds-label up-drop-label" id="up-drop-l">${label}</p>
      <div class="ds-file-upload" data-drop role="group" aria-labelledby="up-drop-l">
        <p class="ds-paragraph" data-field="description">Drop JPEG or PNG files here, up to 50 MB each</p>
        <button class="ds-button" data-variant="secondary" type="button" data-choose id="up-choose">Choose files</button>
      </div>
    </div>`;
  }

  /* Batch settings form: scope 'new' (New batch page) or 'edit' (Edit batch settings). */
  function settingsFormHTML(scope, d) {
    const p = 'up-' + scope + '-';
    return h`<form class="up-card up-settings" id="${p + 'form'}" novalidate data-acc-scope="${scope}" aria-labelledby="${p + 'form-h'}">
      <h2 class="up-card-h" id="${p + 'form-h'}">${scope === 'new' ? 'Batch settings' : 'Edit batch settings'}</h2>
      <p class="hint up-card-sub">${scope === 'new'
        ? 'Set them once. Every file you add gets them, and you can change single images afterwards.'
        : 'AI and place-name settings apply to files you add from now on.'}</p>
      ${scope === 'new' ? h`<ds-field class="ds-field up-name" data-size="sm"><label class="ds-label" for="${p + 'name'}">Batch name</label><input class="ds-input" id="${p + 'name'}" data-set="name" value="${d.name}" placeholder="For example: Fjordkaffe autumn shoot" autocomplete="off"></ds-field>` : ''}
      <section class="up-set-sec" aria-labelledby="${p + 'acc-h'}">
        <h3 id="${p + 'acc-h'}">Who can see the images</h3>
        ${accessHTML(scope, d)}
      </section>
      <section class="up-set-sec" aria-labelledby="${p + 'ai-h'}">
        <h3 id="${p + 'ai-h'}">Metadata</h3>
        <ds-field class="ds-field" data-size="sm"><input class="ds-input" type="checkbox" role="switch" id="${p + 'ai'}" data-set="ai"${d.ai ? App.raw(' checked') : ''} aria-describedby="${p + 'ai-d'}"><label class="ds-label" data-weight="regular" for="${p + 'ai'}">Generate metadata with AI</label><div data-field="description" id="${p + 'ai-d'}">Title, description, alt text and keywords in English. You check them before you publish.</div></ds-field>
        <ds-field class="ds-field" data-size="sm"><input class="ds-input" type="checkbox" role="switch" id="${p + 'pn'}" data-set="placeNames"${d.ai && d.placeNames ? App.raw(' checked') : ''}${d.ai ? '' : App.raw(' disabled')} aria-describedby="${p + 'pn-d'}"><label class="ds-label" data-weight="regular" for="${p + 'pn'}">Send place names to the AI</label><div data-field="description" id="${p + 'pn-d'}">The place comes from the GPS position. Turn it off for shoots at private addresses.</div></ds-field>
      </section>
      <section class="up-set-sec">
        ${keywordsHTML(scope, d.keywords, null, { label: 'Batch keywords' })}
        <p class="hint">Added to every image in the batch.</p>
      </section>
      ${scope === 'edit' ? h`<div class="up-set-actions"><button class="ds-button" data-variant="primary" type="submit" id="up-edit-save">Save batch settings</button><button class="ds-button" data-variant="tertiary" type="button" data-cancel-settings>Cancel</button></div>` : ''}
    </form>`;
  }

  /* ---------------------------------------------------------------- sidebar */
  function batchSub(b) {
    const c = countStates(b);
    const day = App.fmt.day(b.createdAt);
    const proc = PROCESSING.reduce((n, s) => n + (c[s] || 0), 0);
    const needYou = (c.failed || 0) + (c['needs-decision'] || 0) + (c['needs-alt'] || 0);
    const drafts = needYou + (c.ready || 0) + proc;
    if (proc) return day + ', processing';
    if (needYou) return day + ', ' + needYou + (needYou === 1 ? ' needs you' : ' need you');
    if (c.ready) return day + ', ready to publish';
    if (!drafts && (c.published || c.archived)) return day + ', all published';
    return day;
  }
  function batchRow(b, current, other) {
    const owner = App.find.user(b.ownerId);
    const label = other && owner ? owner.name + ': ' + b.name : b.name;
    return h`<li><a href="${'#/upload/' + b.id}" id="${'up-bl-' + b.id}"${current ? App.raw(' aria-current="true"') : ''}><span class="two-line"><span>${label}</span><small>${batchSub(b)}</small></span><span class="n">${liveFiles(b).length}</span></a></li>`;
  }
  function sidebarHTML(params) {
    const b = params.batchId ? App.find.batch(params.batchId) : null;
    const show = params.query && params.query.show;
    const user = me();
    let todo = '';
    if (b) {
      const c = countStates(b);
      const items = KINDS.map((k) => ({ k, n: kindCount(c, k) })).filter((x) => x.n > 0);
      const failed = c.failed || 0;
      todo = h`<section class="side-sec side-context" aria-labelledby="up-todo-h">
        <h2 id="up-todo-h" tabindex="-1">To do in this batch</h2>
        ${items.length ? h`<ul class="todo">${items.map((x) => {
          const cur = show === x.k.key;
          const href = cur ? '#/upload/' + b.id : App.href('/upload/' + b.id, { show: x.k.key });
          return h`<li class="${x.k.cls}"><a href="${href}" id="${'up-todo-' + x.k.key}"${cur ? App.raw(' aria-current="true"') : ''}><span class="num">${x.n}</span><span class="what">${x.n === 1 ? x.k.one : x.k.many}<small>${x.n === 1 && x.k.hintOne ? x.k.hintOne : x.k.hint}</small></span></a></li>`;
        })}</ul>` : h`<p class="side-hint">Nothing to do yet. Add files to the batch.</p>`}
        ${failed ? h`<div class="todo-actions"><button class="ds-button" data-variant="secondary" data-size="sm" type="button" data-retry-all id="up-retry-all">${App.icon('retry')}Try the ${failed} failed again</button></div>` : ''}
      </section>`;
    }
    const all = App.sortNewest(App.store.batches);
    const mine = all.filter((x) => user && x.ownerId === user.id);
    const others = all.filter((x) => !user || x.ownerId !== user.id);
    const html = h`${todo}<section class="side-sec side-context" aria-labelledby="up-b-h">
      <a class="ds-button up-new-batch" data-variant="secondary" data-size="sm" href="#/upload" id="up-new-batch"${b ? '' : App.raw(' aria-current="page"')}>${App.icon('plus')}New batch</a>
      <h2 id="up-b-h">Your batches</h2>
      ${mine.length ? h`<ul class="blist">${mine.map((x) => batchRow(x, b && x.id === b.id, false))}</ul>` : h`<p class="side-hint">No batches yet. Start one with New batch.</p>`}
      ${others.length ? h`<h2 class="up-other-h">Other staff</h2><ul class="blist">${others.map((x) => batchRow(x, b && x.id === b.id, true))}</ul>` : ''}
    </section>`;
    lastSidebar = String(html);
    return html;
  }

  /* ---------------------------------------------------------------- main: batch view parts */
  function publishHeadHTML(b) {
    const c = countStates(b);
    const ready = c.ready || 0;
    const other = (c['needs-alt'] || 0) + (c.failed || 0);
    const drafts = ready + other + (c['needs-decision'] || 0) + PROCESSING.reduce((n, s) => n + (c[s] || 0), 0);
    if (!drafts && liveFiles(b).length) return h`<div class="up-head-act"><p class="hint">Every image in this batch is published.</p></div>`;
    if (ready) return h`<div class="up-head-act"><button class="ds-button" data-variant="primary" type="button" data-publish-batch id="up-publish">Publish ${App.fmt.plural(ready, 'ready image')}</button></div>`;
    if (other) return h`<div class="up-head-act"><button class="ds-button" data-variant="primary" type="button" data-publish-batch id="up-publish">Publish ${App.fmt.plural(other, 'image')}</button><p class="hint">Their metadata is not complete. You see what is missing before anything is published.</p></div>`;
    return h`<div class="up-head-act"><button class="ds-button" data-variant="primary" type="button" disabled id="up-publish">Publish ready images</button><p class="hint">Nothing is ready to publish yet.</p></div>`;
  }

  const LEGEND = [
    ['ready', 'ready', 'ready', 'var(--ds-color-success-base-default)'],
    ['alt', 'needs alt text', 'need alt text', 'var(--ds-color-warning-text-subtle)'],
    ['generating', 'generating', 'generating', 'var(--ds-color-accent-base-default)'],
    ['queued', 'queued', 'queued', 'var(--ds-color-neutral-border-default)'],
    ['uploading', 'uploading', 'uploading', 'var(--ds-color-info-base-default)'],
    ['failed', 'failed', 'failed', 'var(--ds-color-danger-base-default)'],
    ['decision', 'needs a decision or was not added', 'need a decision or were not added', 'var(--ds-color-warning-base-default)'],
    ['published', 'published', 'published', 'var(--ds-color-success-border-subtle)']
  ];
  function progressHTML(b) {
    const c = countStates(b);
    const n = {
      ready: c.ready || 0, alt: c['needs-alt'] || 0, generating: c.generating || 0, queued: c.queued || 0, uploading: c.uploading || 0,
      failed: c.failed || 0, decision: (c['needs-decision'] || 0) + (c.rejected || 0), published: (c.published || 0) + (c.archived || 0)
    };
    const total = liveFiles(b).length;
    if (!total) return h``;
    const rows = LEGEND.filter((l) => n[l[0]] > 0);
    return h`<ul class="summary" aria-label="Batch progress">${rows.map((l) =>
      h`<li><span class="${'dot' + (l[0] === 'generating' ? ' is-gen' : '')}" style="${'background:' + l[3]}"></span><b>${n[l[0]]}</b> ${n[l[0]] === 1 ? l[1] : l[2]}</li>`)}</ul>
      <div class="meter up-meter" aria-hidden="true">${rows.map((l) => h`<i style="${'width:' + (n[l[0]] * 100 / total).toFixed(1) + '%;background:' + l[3]}"></i>`)}</div>`;
  }

  function keepOpenHTML(b) {
    const up = (countStates(b).uploading || 0);
    return up ? h`<p class="keep-open">${App.icon('upload')}Keep this page open until the last file has uploaded. Metadata keeps generating if you leave.</p>` : h``;
  }

  function filesHeadHTML(b, show) {
    const live = liveFiles(b);
    const total = live.length;
    const kind = KINDS.find((k) => k.key === show);
    const top = kind ? live.filter((f) => !topRank(kind, f)).length : 0;
    if (top) {
      return h`<h2 id="up-files-h">Files</h2><span>${App.fmt.plural(total, 'file')}. At the top: ${top} ${top === 1 ? kind.one : kind.many}</span><a class="ds-link up-show-all" href="${'#/upload/' + b.id}">Back to the usual order</a>`;
    }
    return h`<h2 id="up-files-h">Files</h2><span>${App.fmt.plural(total, 'file')}, files that need you first</span>`;
  }

  /* one file row, split in parts so live updates never replace the row button (focus stays) */
  function rowParts(f) {
    const st = stateOf(f);
    const im = App.find.image(f.imageId);
    const blank = h`<span class="th"><span class="ph up-blank" aria-hidden="true"></span></span>`;
    let th; let name; let sub; let msg = ''; let end;
    if (st === 'rejected') {
      th = blank; name = f.fileName; sub = 'Not added';
      msg = h`<span class="fmsg warn">${f.rejected.reason === 'identical'
        ? f.fileName + ' is already in the library.'
        : f.fileName + ' was not uploaded: ' + (REJECT_REASON[f.rejected.reason] || REJECT_REASON.damaged) + '.'}</span>`;
      end = App.statusTag('rejected');
    } else {
      th = st === 'uploading'
        ? h`<span class="th"><span class="ds-skeleton" aria-hidden="true"></span></span>`
        : h`<span class="th"><span class="${'ph ' + (im.ph || '')}" role="img" aria-label="${App.altFor(im)}"></span></span>`;
      name = im.title || f.fileName;
      const fn = im.title ? f.fileName + ', ' : '';
      const p = plan(im.id);
      end = App.statusTag(st);
      if (st === 'uploading') sub = App.fmt.bytes(f.bytes) + ', ' + im.progress + ' % uploaded';
      else if (st === 'queued') sub = 'Waiting for metadata';
      else if (st === 'generating') sub = 'Generating title, description, alt text and keywords';
      else if (st === 'needs-decision') sub = f.fileName + ', same file name as an image in the library';
      else if (st === 'failed') {
        sub = fn + 'Draft';
        msg = h`<span class="fmsg danger">Metadata could not be generated: ${im.error}. Fill in the fields yourself or try again.</span>`;
        end = h`${App.statusTag('failed')}<button class="ds-button" data-variant="tertiary" data-size="sm" type="button" data-retry="${f.id}" id="${'up-retry-' + f.id}">Try again</button>`;
      } else if (st === 'needs-alt') sub = fn + 'alt text missing';
      else if (st === 'ready') sub = f.fileName + (p.secs ? ', generated in ' + p.secs + ' s' : ', ready to publish');
      else sub = f.fileName + ', ' + st;
    }
    return {
      th: String(th),
      txt: String(h`<span class="fname">${name}</span><span class="fsub">${sub}</span>${msg}`),
      end: String(end)
    };
  }
  function rowHTML(f) {
    const p = rowParts(f);
    rowCache[f.id] = p;
    return h`<li class="file-row" data-row="${f.id}"><button class="row-open ds-focus" type="button" data-pick data-id="${f.id}" id="${'up-row-' + f.id}" aria-pressed="${sel === f.id ? 'true' : 'false'}">${App.raw(p.th)}<span data-rtxt>${App.raw(p.txt)}</span></button><div class="row-end">${App.raw(p.end)}</div></li>`;
  }

  function resultHTML(b) {
    if (!result || result.batchId !== b.id) return '';
    const n = result.published.length;
    return h`<div class="ds-alert up-result" data-color="${result.skipped.length ? 'info' : 'success'}" data-size="sm" tabindex="-1" id="up-result">
      <h2 class="ds-heading" data-size="2xs">${n ? App.fmt.plural(n, 'image') + ' published' : 'Nothing was published'}</h2>
      ${result.skipped.length ? h`<p class="ds-paragraph">${App.fmt.plural(result.skipped.length, 'image')} not published:</p><ul class="up-result-list">${result.skipped.map((s) => h`<li><b>${s.name}</b>: ${s.reason}</li>`)}</ul>` : ''}
      <button class="ds-button" data-variant="tertiary" data-size="sm" type="button" data-close-result>Close</button>
    </div>`;
  }

  function stillDrafts(n) { return n === 1 ? '1 still a draft.' : n + ' still drafts.'; }
  function batchMainHTML(params) {
    const b = App.find.batch(params.batchId);
    const show = params.query && params.query.show;
    const fl = fileList(b, show);
    if (sel && fl.rows.indexOf(sel) === -1) sel = null;
    const owner = App.find.user(b.ownerId);
    const day = App.fmt.day(b.createdAt);
    const when = day === 'Today' || day === 'Yesterday' ? day.toLowerCase() : 'on ' + day;
    const c = countStates(b);
    const total = liveFiles(b).length;
    const pub = (c.published || 0) + (c.archived || 0);
    const fileLine = !total ? 'No files yet.'
      : App.fmt.plural(total, 'file') + ', ' + (pub ? pub + ' published, ' + stillDrafts(total - pub - (c.rejected || 0)) : 'all drafts until you publish.');
    rowCache = {};
    partCache = { head: String(publishHeadHTML(b)), progress: String(progressHTML(b)), keep: String(keepOpenHTML(b)), fhead: String(filesHeadHTML(b, show)) };
    const rows = fl.rows.map((id) => rowHTML(fileById(b, id)));
    if (fl.group) rows.splice(fl.group.at, 0, groupHTML(b, fl));
    return h`${resultHTML(b)}
      <div class="batch-head">
        <div>
          <h1 class="page-title" id="up-h1">${b.name}</h1>
          <p class="page-sub">Batch started by ${owner ? owner.firstName : 'staff'} ${when} at ${App.fmt.time(b.createdAt)}. ${fileLine}</p>
        </div>
        <div data-part="head">${App.raw(partCache.head)}</div>
      </div>
      ${editing === b.id ? settingsFormHTML('edit', editDraft) : h`<div class="batch-set">
        <span><b>Batch settings</b>${settingsLine(b.settings)}</span>
        <button class="ds-button" data-variant="tertiary" data-size="sm" type="button" data-edit-settings id="up-edit-settings">Edit batch settings</button>
      </div>`}
      <div data-part="progress">${App.raw(partCache.progress)}</div>
      <div data-part="keep">${App.raw(partCache.keep)}</div>
      ${total ? dropBarHTML() : dropHTML('Add more files to this batch')}
      <div class="files-card">
        <div class="files-head" data-part="fhead">${App.raw(partCache.fhead)}</div>
        ${rows.length
          ? h`<ul class="files" aria-labelledby="up-files-h" data-select-group>${rows}</ul>`
          : h`<div class="up-files-empty">${App.emptyState('No files in this batch yet. Drop files above or choose them.')}</div>`}
      </div>`;
  }

  /* ---------------------------------------------------------------- details panel */
  function detailsKey(f) {
    if (!f) return 'none';
    const im = App.find.image(f.imageId);
    const st = stateOf(f);
    const phase = st === 'rejected' || st === 'discarded' ? st
      : PROCESSING.indexOf(st) !== -1 ? st
        : st === 'published' || st === 'archived' ? 'done' : 'edit';
    return [f.id, phase, f.match ? f.match.answer || 'open' : '', im ? im.ph : ''].join('|');
  }

  function navHTML() {
    return h`<div class="actions"><button class="ds-button" data-variant="tertiary" data-size="sm" type="button" data-prev id="up-prev">Previous</button><button class="ds-button" data-variant="tertiary" data-size="sm" type="button" data-next id="up-next">Next</button></div>`;
  }

  function matchAlertHTML(b, f, im) {
    const ex = App.find.image(f.match.imageId);
    const others = b.files.filter((x) => x !== f && x.match && !x.match.answer && stateOf(x) !== 'discarded').length;
    const exLine = !ex ? 'No longer in the library'
      : ex.status === 'published' ? App.imageTitle(ex) + '. Published ' + App.fmt.date(ex.createdAt)
        : ex.status === 'archived' ? App.imageTitle(ex) + '. Archived'
          : App.imageTitle(ex) + '. Draft from ' + App.fmt.date(ex.createdAt);
    return h`<div class="ds-alert ctx-alert" data-color="warning" data-size="sm">
      <p>An image with the same file name is already in the library. The files are different. Keep both, or discard the new one.</p>
      <div class="compare">
        <figure><div class="cmp-img"><span class="${'ph ' + (im.ph || '')}" role="img" aria-label="${App.altFor(im) + ', new upload'}"></span></div><figcaption><b>New file</b>${im.dateTaken ? 'Taken ' + App.fmt.date(im.dateTaken) + ', ' : ''}${App.fmt.bytes(f.bytes)}</figcaption></figure>
        <figure><div class="cmp-img"><span class="${'ph ' + ((ex && ex.ph) || '')}" style="filter:saturate(.7) brightness(1.06)" role="img" aria-label="${(ex ? App.altFor(ex) : 'Untitled image') + ', existing image'}"></span></div><figcaption><b>In the library</b>${exLine}</figcaption></figure>
      </div>
      <div class="cmp-actions">
        <button class="ds-button" data-variant="secondary" data-size="sm" type="button" data-match="keep-both" id="up-keep-both">Keep both</button>
        <button class="ds-button" data-variant="tertiary" data-size="sm" type="button" data-match="discard" id="up-discard-new">Discard new file</button>
        ${others ? h`<ds-field class="ds-field" data-size="sm"><input class="ds-input" type="checkbox" id="up-match-all"><label class="ds-label" data-weight="regular" for="up-match-all">${others === 1 ? 'Use the same answer for the other file name match' : 'Use the same answer for the other ' + others + ' file name matches'}</label></ds-field>` : ''}
      </div>
    </div>`;
  }

  function dAlertHTML(b, f, im) {
    const lk = locker(im);
    if (lk) return h`<div class="ds-alert ctx-alert" data-color="warning" data-size="sm"><p style="margin:0">${lk.name} is editing this image. You can edit it when they finish, or after 15 minutes without activity.</p></div>`;
    if (f.match && !f.match.answer) return matchAlertHTML(b, f, im);
    if (im.processing === 'failed') {
      return h`<div class="ds-alert ctx-alert" data-color="danger" data-size="sm"><p>Metadata could not be generated: ${im.error}. Fill in the fields yourself or try again.</p><button class="ds-button" data-variant="secondary" data-size="sm" type="button" data-retry="${f.id}" id="up-d-retry">${App.icon('retry')}Try again</button></div>`;
    }
    return h``;
  }

  function dStatusHTML(f, im) {
    const st = stateOf(f);
    const p = plan(im.id);
    let info = '';
    if (st === 'uploading') info = im.progress + ' % uploaded';
    else if (st === 'queued') info = 'Waiting for metadata';
    else if (st === 'generating') info = 'Generating title, description, alt text and keywords';
    else if (im.provider && p.secs) info = 'Generated in ' + p.secs + ' s';
    return h`${App.statusTag(st)}${info ? h`<span>${info}</span>` : ''}`;
  }

  function dFootHTML(b, f, im) {
    const st = stateOf(f);
    const can = isPublishable(f) && !locker(im);
    let note = '';
    if (st === 'needs-decision') note = MSG_DECIDE;
    else if (PROCESSING.indexOf(st) !== -1) note = MSG_WAIT;
    else if (locker(im)) note = 'You can publish it when they finish editing.';
    return h`<button class="ds-button" data-variant="primary" type="button" data-publish-one id="up-publish-one"${can ? '' : App.raw(' disabled')}>Publish this image</button>
      <button class="ds-button" data-variant="tertiary" type="button" data-next id="up-next-image">Next image</button>
      ${st !== 'uploading' && !locker(im) ? h`<button class="ds-button up-discard" data-variant="tertiary" data-color="danger" type="button" data-discard id="up-discard">Discard draft</button>` : ''}
      ${note ? h`<p class="note">${note}</p>` : ''}`;
  }

  function loupeHTML(im) {
    if (im.processing === 'uploading') return h`<div class="loupe"><span class="skel"><span class="ds-skeleton" aria-hidden="true"></span><span class="progress">${im.progress} %</span></span></div>`;
    return h`<div class="loupe"><span class="${'ph ' + App.loupeClass(im) + ' ' + (im.ph || '')}" role="img" aria-label="${App.altFor(im)}"></span></div>`;
  }

  function factsHTML(im) {
    const rows = [];
    if (im.dateTaken) rows.push(['Date taken', App.fmt.dateTime(im.dateTaken)]);
    if (im.camera) rows.push(['Camera', im.camera + (im.lens ? ', ' + im.lens : '')]);
    if (im.exposure) rows.push(['Exposure', App.fmt.exposure(im)]);
    if (im.size && im.size.w) rows.push(['Size', App.fmt.pixels(im) + ', ' + App.fmt.bytes(im.size.bytes)]);
    if (im.provider) rows.push(['Metadata by', im.provider.name + ', prompt ' + im.provider.promptVersion]);
    if (!rows.length) return '';
    return h`<section class="insp-sec" aria-labelledby="up-d-facts-h"><h3 id="up-d-facts-h">Camera and file <small>Read only</small></h3><dl class="facts">${rows.map((r) => h`<dt>${r[0]}</dt><dd>${r[1]}</dd>`)}</dl></section>`;
  }

  function detailsHTML(params) {
    const b = App.find.batch(params.batchId);
    const f = b && sel ? fileById(b, sel) : null;
    lastDetailsKey = detailsKey(f);
    dpartCache = {};
    if (!f || stateOf(f) === 'discarded') {
      return h`<div class="panel-body"><p class="up-d-empty">Select a file to check and correct its metadata.</p></div>`;
    }
    const st = stateOf(f);
    if (st === 'rejected') {
      const ex = f.rejected.existingImageId ? App.find.image(f.rejected.existingImageId) : null;
      return h`<div class="panel-body">
        <div class="insp-head"><div><h2 id="up-d-title">${f.fileName}</h2><div class="file">Not added to the batch</div></div>${navHTML()}</div>
        <div class="ds-alert ctx-alert" data-color="warning" data-size="sm"><p style="margin:0">${f.rejected.reason === 'identical'
          ? h`${f.fileName} is already in the library. ${ex ? h`<a class="ds-link" href="${'#/library/' + ex.id}">Open the existing image</a>` : ''}`
          : f.fileName + ' was not uploaded: ' + (REJECT_REASON[f.rejected.reason] || REJECT_REASON.damaged) + '.'}</p></div>
        ${ex ? h`<div class="existing"><div class="cmp-img"><span class="${'ph ' + (ex.ph || '')}" role="img" aria-label="${App.altFor(ex)}"></span></div><p><b>${App.imageTitle(ex)}</b>${ex.status === 'published' ? 'Published ' + App.fmt.date(ex.createdAt) : ex.status === 'archived' ? 'Archived' : 'Draft'}, ${ex.visibility === 'public' ? 'public' : ex.visibility === 'internal' ? 'internal only' : 'restricted'}, ${App.price(ex.price)}</p></div>` : ''}
        <section class="insp-sec"><p class="hint">${f.rejected.reason === 'identical' ? 'The file is identical to one that is already stored, so nothing was added. ' : ''}The rest of the batch carried on.</p></section>
        <div class="insp-pad"></div>
        <div class="insp-foot"><button class="ds-button" data-variant="secondary" type="button" data-dismiss id="up-dismiss">Remove from this list</button></div>
      </div>`;
    }
    const im = App.find.image(f.imageId);
    const head = h`<div class="insp-head"><div><h2 id="up-d-title">${im.title || f.fileName}</h2><div class="file">${f.fileName}, ${App.fmt.bytes(f.bytes)}</div></div>${navHTML()}</div>`;
    if (st === 'published' || st === 'archived') {
      return h`<div class="panel-body">${head}${loupeHTML(im)}
        <div class="statusline">${App.statusTag(st)}<span>${App.visibilityMeta(im)}</span>${App.price(im.price)}</div>
        <section class="insp-sec"><p class="hint">Published images are changed in the Library, with Edit and Save changes.</p></section>
        <div class="insp-pad"></div>
        <div class="insp-foot"><a class="ds-button" data-variant="secondary" href="${'#/library/' + im.id}">Open in the Library</a><button class="ds-button" data-variant="tertiary" type="button" data-next id="up-next-image">Next image</button></div>
      </div>`;
    }
    const editable = isEditable(f) && !locker(im);
    const dis = editable ? '' : App.raw(' disabled');
    const access = { visibility: im.visibility, clients: im.clients || [], priceMode: im.price > 0 || plan(im.id).paid ? 'paid' : 'free', amount: im.price > 0 ? String(im.price) : '' };
    const altLen = (im.altText || '').length;
    dpartCache = { alert: String(dAlertHTML(b, f, im)), status: String(dStatusHTML(f, im)), foot: String(dFootHTML(b, f, im)) };
    return h`<div class="panel-body">${head}
      <div data-dpart="alert">${App.raw(dpartCache.alert)}</div>
      ${loupeHTML(im)}
      <div class="statusline"><span class="up-st" data-dpart="status">${App.raw(dpartCache.status)}</span><span class="saved" role="status" id="up-saved"></span></div>
      ${editable ? h`
      <section class="insp-sec" aria-labelledby="up-d-acc-h" data-acc-scope="file">
        <h3 id="up-d-acc-h">Who can see it <small>From batch settings</small></h3>
        ${accessHTML('file', access)}
      </section>
      <section class="insp-sec" aria-labelledby="up-d-rev-h">
        <h3 id="up-d-rev-h">Check and correct <small>Changes save as you type</small></h3>
        <div class="stack" data-size="sm">
          <ds-field class="ds-field"><label class="ds-label" for="up-f-title">Title</label><input class="ds-input" id="up-f-title" data-meta="title" value="${im.title}" placeholder="Untitled image"${dis}></ds-field>
          <ds-field class="ds-field"><label class="ds-label" for="up-f-desc">Description</label><textarea class="ds-input" id="up-f-desc" data-meta="description" rows="3"${dis}>${im.description}</textarea></ds-field>
          <ds-field class="ds-field"><label class="ds-label" for="up-f-alt">Alt text</label><textarea class="ds-input" id="up-f-alt" data-meta="altText" rows="2" aria-describedby="up-f-alt-d up-f-alt-err"${dis}>${im.altText}</textarea><div data-field="description" id="up-f-alt-d">${altLen} of ${ALT_MAX} characters. Aim for under 150.</div><p class="ds-validation-message" data-field="validation" id="up-f-alt-err" hidden></p></ds-field>
          ${keywordsHTML('file', im.keywords || [], b.settings.keywords || [], { disabled: !editable })}
          <ds-field class="ds-field"><label class="ds-label" for="up-f-place">Place</label><input class="ds-input" id="up-f-place" data-meta="place" value="${im.place}" aria-describedby="up-f-place-d"${dis}><div data-field="description" id="up-f-place-d">Staff only. Clients never see the place.</div></ds-field>
        </div>
      </section>` : h`<section class="insp-sec"><p class="hint">${st === 'uploading' ? 'You can check and correct it when it has uploaded and the metadata is ready.' : 'You can check and correct it when the metadata is ready.'}</p></section>`}
      ${factsHTML(im)}
      <div class="insp-pad"></div>
      <div class="insp-foot" data-dpart="foot">${App.raw(dpartCache.foot)}</div>
    </div>`;
  }

  /* ---------------------------------------------------------------- live updates */
  function keepFocus(fn) {
    const a = document.activeElement;
    const id = a && a.id;
    let range = null;
    try { if (a && typeof a.selectionStart === 'number') range = [a.selectionStart, a.selectionEnd]; } catch (e) { range = null; }
    fn();
    const el = id && document.getElementById(id);
    if (el && document.activeElement !== el) {
      el.focus({ preventScroll: true });
      if (range && el.setSelectionRange) { try { el.setSelectionRange(range[0], range[1]); } catch (e) { /* not a text field */ } }
    }
  }
  function setPart(el, html) {
    if (!el) return;
    keepFocus(() => { el.innerHTML = html; });
  }

  function refreshMain() { keepFocus(() => App.refresh('main')); }
  function refreshDetails() { keepFocus(() => App.refresh('details')); }

  function refreshLive() {
    if (!mounted) return;
    const c = App.current();
    const b = currentBatch();
    if (!b) return;
    const params = c.params;
    if (String(sidebarHTML(params)) !== sbRendered) { sbRendered = lastSidebar; keepFocus(() => App.refresh('sidebar')); }
    const main = document.getElementById('main');
    if (!main) return;
    const show = params.query && params.query.show;
    const fl = fileList(b, show);
    const ids = fl.rows;
    const rendered = Array.prototype.map.call(main.querySelectorAll('.files [data-row], .files [data-group]'), (li) => li.getAttribute('data-row') || li.getAttribute('data-group'));
    if (listKey(b, fl) !== rendered.join()) {
      if (sel && ids.indexOf(sel) === -1) sel = null;
      refreshMain();
    } else {
      const parts = { head: publishHeadHTML(b), progress: progressHTML(b), keep: keepOpenHTML(b), fhead: filesHeadHTML(b, show) };
      Object.keys(parts).forEach((k) => {
        const html = String(parts[k]);
        if (partCache[k] !== html) { partCache[k] = html; setPart(main.querySelector('[data-part="' + k + '"]'), html); }
      });
      ids.forEach((id) => {
        const f = fileById(b, id);
        const p = rowParts(f);
        const old = rowCache[id] || {};
        const li = main.querySelector('[data-row="' + id + '"]');
        if (!li) return;
        if (old.th !== p.th) { const th = li.querySelector('.row-open > .th'); if (th) th.outerHTML = p.th; }
        if (old.txt !== p.txt) setPart(li.querySelector('[data-rtxt]'), p.txt);
        if (old.end !== p.end) {
          const hadFocus = li.querySelector('.row-end').contains(document.activeElement);
          setPart(li.querySelector('.row-end'), p.end);
          if (hadFocus && !li.querySelector('.row-end').contains(document.activeElement)) li.querySelector('[data-pick]').focus();
        }
        rowCache[id] = p;
      });
    }
    /* details */
    const f = sel ? fileById(b, sel) : null;
    if (detailsKey(f) !== lastDetailsKey) refreshDetails();
    else if (f && f.imageId && App.find.image(f.imageId)) {
      const im = App.find.image(f.imageId);
      const body = document.getElementById('app-details-body');
      if (body) {
        [['alert', dAlertHTML(b, f, im)], ['status', dStatusHTML(f, im)], ['foot', dFootHTML(b, f, im)]].forEach((x) => {
          const el = body.querySelector('[data-dpart="' + x[0] + '"]');
          const html = String(x[1]);
          if (el && dpartCache[x[0]] !== html) { dpartCache[x[0]] = html; setPart(el, html); }
        });
      }
    }
    syncGuard(b);
  }
  /* FR-15: leaving while files are still uploading warns first. */
  function syncGuard(b) {
    const c = countStates(b);
    const up = c.uploading || 0;
    const proc = PROCESSING.reduce((n, s) => n + (c[s] || 0), 0);
    if (up) {
      App.setUnloadWarning(true);
      App.setLeaveGuard((target) => {
        const path = String(target || '').replace(/^#/, '').split('?')[0];
        if (path === '/upload/' + b.id) return true;
        const n = countStates(b).uploading || 0;
        if (!n) return true;
        return App.confirm({
          title: 'Files are still uploading',
          body: h`<p class="ds-paragraph">${App.fmt.plural(n, 'file')} ${n === 1 ? 'has' : 'have'} not finished uploading. If you leave now, ${n === 1 ? 'it is' : 'they are'} not added to the batch. Metadata keeps generating for the files that have uploaded.</p>`,
          confirm: 'Leave the page'
        });
      });
    } else {
      App.setUnloadWarning(false);
      App.setLeaveGuard(null);
    }
    if (wasUploading && !up) App.status('All files have uploaded.');
    if (wasProcessing && !proc) App.status('Every file in the batch is processed.');
    wasUploading = !!up;
    wasProcessing = !!proc;
  }

  /* ---------------------------------------------------------------- simulated processing */
  function generate(b, im) {
    const p = plan(im.id);
    const done = edited(im.id);
    if (p.fail) {
      im.processing = 'failed';
      im.error = p.fail;
      p.fail = null;
      return;
    }
    const m = MOCK[im.ph] || MOCK_FALLBACK;
    if (done.indexOf('title') === -1) im.title = m[0];
    if (done.indexOf('description') === -1) im.description = m[1];
    if (done.indexOf('altText') === -1) im.altText = p.noAlt ? '' : m[2];
    if (done.indexOf('keywords') === -1) {
      const kws = (b.settings.keywords || []).slice();
      const gen = m[3].slice();
      if (b.settings.placeNames && im.place) gen.unshift(im.place.split(',')[0].trim());
      gen.slice(0, KW_MAX).forEach((k) => { if (kws.map((x) => x.toLowerCase()).indexOf(k.toLowerCase()) === -1) kws.push(k); });
      im.keywords = kws;
    }
    const ai = App.store.settings.aiProvider;
    im.provider = { name: ai.name, promptVersion: ai.promptVersion, generatedAt: App.nowISO() };
    im.processing = 'ready';
    im.error = null;
    p.secs = 4 + (hashNum(im.fileName) % 6);
    p.noAlt = false;
  }

  function finishUpload(b, f, im) {
    const p = plan(im.id);
    im.progress = 100;
    if (p.identical) {
      f.rejected = { reason: 'identical', existingImageId: p.identical };
      f.imageId = null;
      App.store.images = App.store.images.filter((x) => x.id !== im.id);
      return;
    }
    im.ph = im.ph || p.ph || PH_CYCLE[hashNum(f.fileName) % PH_CYCLE.length];
    if (p.exif !== false && !im.camera) {
      im.dateTaken = im.dateTaken || App.todayISO() + 'T09:' + String(10 + (hashNum(f.fileName) % 49)).padStart(2, '0');
      im.camera = 'Fujifilm X-T5';
      im.lens = 'XF 33 mm F1.4';
      im.exposure = { focal: 33, aperture: 2.8, shutter: '1/250', iso: 400 };
    }
    if (p.place && !im.place) { im.place = p.place; im.gps = p.gps || null; }
    const lower = f.fileName.toLowerCase();
    const same = App.store.images.find((x) => x.id !== im.id && x.batchId !== b.id && String(x.fileName).toLowerCase() === lower);
    if (same && !f.match) f.match = { imageId: same.id, answer: null };
    im.processing = b.settings.ai ? 'queued' : 'ready';
    if (!b.settings.ai) im.keywords = (b.settings.keywords || []).slice();
  }

  function tick() {
    const b = currentBatch();
    if (!b) return;
    let changed = false;
    let generating = 0;
    b.files.forEach((f) => { const im = App.find.image(f.imageId); if (im && im.processing === 'generating') generating++; });
    b.files.forEach((f) => {
      if (f.rejected || f.dismissed) return;
      const im = App.find.image(f.imageId);
      if (!im || im.status !== 'draft') return;
      const p = plan(im.id);
      if (im.processing === 'uploading') {
        im.progress = Math.min(100, (im.progress || 0) + 22 + (hashNum(f.fileName) % 14));
        if (im.progress >= 100) finishUpload(b, f, im);
        changed = true;
      } else if (im.processing === 'queued' && generating < MAX_GENERATING) {
        im.processing = 'generating';
        p.genTicks = 0;
        generating++;
        changed = true;
      } else if (im.processing === 'generating') {
        p.genTicks = (p.genTicks || 0) + 1;
        if (p.genTicks >= 3) { generate(b, im); generating--; changed = true; }
      }
    });
    if (changed) { App.save(); refreshLive(); }
  }

  /* ---------------------------------------------------------------- adding files */
  function sampleSpecs(b) {
    const u = U();
    const next = (ext) => 'IMG_' + String(u.seq++).padStart(4, '0') + (ext || '.jpg');
    const inBatch = (name) => b.files.some((f) => f.fileName.toLowerCase() === name.toLowerCase());
    const bergen = { place: 'Bryggen, Bergen, Vestland, Norway', gps: { lat: 60.3975, lng: 5.3242 } };
    if (App.protoBatchSize() === 100) return largeSpecs(next, inBatch, bergen);
    const specs = [
      Object.assign({ name: next(), mb: 14.2, ph: 'p-fjord' }, bergen),
      Object.assign({ name: next(), mb: 16.8, ph: 'p-harbour' }, bergen),
      { name: next(), mb: 12.1, ph: 'p-cafe', noAlt: true },
      { name: next(), mb: 15.5, ph: 'p-latte', fail: 'the AI service returned an empty answer' },
      { name: next(), mb: 13.4, ph: 'p-ridge', fail: 'the AI service did not answer within 30 seconds' },
      { name: next('.png'), mb: 9.6, ph: 'p-tram' }
    ];
    if (!inBatch('DSC_2051.jpg')) specs.push({ name: 'DSC_2051.jpg', mb: 17.0, ph: 'p-market' });
    if (!inBatch('IMG_9120.jpg')) specs.push({ name: 'IMG_9120.jpg', mb: 17.3, identical: 'img-fjord' });
    specs.push({ name: 'shot-list.docx', mb: 0.4, reject: 'type' });
    specs.push({ name: next(), mb: 61.5, reject: 'size' });
    return specs;
  }
  /* Prototype "100 files" sample: a full shoot with the mix a real batch has. 3 fail, 10 lack
     alt text, 2 file name matches, 1 identical file, 1 wrong type and 1 too large. */
  function largeSpecs(next, inBatch, bergen) {
    const phs = Object.keys(MOCK);
    const specs = [];
    for (let i = 0; i < 95; i++) {
      const sp = { name: next(), mb: 9 + (i * 7 % 90) / 10, ph: phs[i % phs.length] };
      if (i % 3 === 0) Object.assign(sp, bergen);
      if (i === 17) sp.fail = 'the AI service did not answer within 30 seconds';
      if (i === 48 || i === 81) sp.fail = 'the AI service returned an empty answer';
      if (i % 9 === 4) sp.noAlt = true;
      specs.push(sp);
    }
    ['DSC_2051.jpg', 'DSC_4410.jpg'].forEach((name, i) => { if (!inBatch(name)) specs.splice(30 + i * 30, 0, { name, mb: 16.4, ph: 'p-market' }); });
    if (!inBatch('IMG_9120.jpg')) specs.splice(55, 0, { name: 'IMG_9120.jpg', mb: 17.3, identical: 'img-fjord' });
    specs.push({ name: 'shot-list.pdf', mb: 0.4, reject: 'type' });
    specs.push({ name: next(), mb: 61.5, reject: 'size' });
    return specs;
  }
  function specsFromFiles(list) {
    return Array.prototype.map.call(list, (file) => {
      const ok = /^image\/(jpeg|png)$/.test(file.type) || /\.(jpe?g|png)$/i.test(file.name);
      const spec = { name: file.name, mb: file.size / 1e6 };
      if (!ok) spec.reject = 'type';
      else if (file.size > 50e6) spec.reject = 'size';
      else if (file.size === 0) spec.reject = 'damaged';
      return spec;
    });
  }
  function addFiles(b, specs) {
    const user = me();
    const s = b.settings;
    specs.forEach((sp, i) => {
      const fid = App.uid('f');
      const bytes = Math.round(sp.mb * 1e6);
      if (sp.reject) {
        b.files.push({ id: fid, fileName: sp.name, bytes, imageId: null, rejected: { reason: sp.reject }, match: null, dismissed: false });
        return;
      }
      const id = App.uid('img');
      const dims = [[6000, 4000], [4000, 5000], [4000, 6000], [6000, 3375]][(hashNum(sp.name) + i) % 4];
      App.store.images.push({
        id, fileName: sp.name, title: '', description: '', altText: '', keywords: (s.keywords || []).slice(),
        place: '', gps: null, dateTaken: null, camera: '', lens: '', exposure: null,
        size: { w: dims[0], h: dims[1], format: /\.png$/i.test(sp.name) ? 'PNG' : 'JPEG', bytes }, ph: null,
        status: 'draft', processing: 'uploading', progress: 0, error: null,
        visibility: s.visibility, clients: s.visibility === 'restricted' ? (s.clients || []).slice() : [], price: s.price || 0,
        createdAt: App.nowISO(), uploadedBy: user ? user.id : null, batchId: b.id,
        provider: null, editedBy: null, lockedBy: null, notes: ''
      });
      Object.assign(plan(id), { ph: sp.ph || null, fail: sp.fail || null, noAlt: !!sp.noAlt, identical: sp.identical || null, place: sp.place || '', gps: sp.gps || null });
      b.files.push({ id: fid, fileName: sp.name, bytes, imageId: id, rejected: null, match: null, dismissed: false });
    });
    App.log('Added files to a batch', App.fmt.plural(specs.length, 'file') + ' to ' + b.name);
    App.save();
    App.status(App.fmt.plural(specs.length, 'file') + ' added to ' + b.name + '.');
  }

  /* ---------------------------------------------------------------- actions */
  function selectFile(fid, opts) {
    opts = opts || {};
    flushPending();
    const b = currentBatch();
    if (!b) return;
    if (opts.toggle && sel === fid) {
      /* the selected row again deselects it (at every width), which lets the order catch up */
      deselect(b);
      return;
    }
    sel = fid;
    U().sel[b.id] = fid;
    App.save();
    markPressed();
    const btn = fid ? document.getElementById('up-row-' + fid) : null;
    keepFocus(() => { App.refresh('details'); App.details.place(btn); });
    if (opts.focusRow && btn) btn.focus();
  }
  function deselect(b) {
    sel = null;
    U().sel[b.id] = null;
    App.save();
    markPressed();
    if (App.details.isInline()) App.details.collapse(); else refreshDetails();
  }
  function markPressed() {
    document.querySelectorAll('#main .files [data-pick]').forEach((el) => el.setAttribute('aria-pressed', String(el.getAttribute('data-id') === sel)));
  }
  function step(dir, triggerId) {
    const b = currentBatch();
    if (!b) return;
    const c = App.current();
    const ids = fileList(b, c.params.query.show).rows;
    if (!ids.length) return;
    const i = ids.indexOf(sel);
    const j = i === -1 ? 0 : (i + dir + ids.length) % ids.length;
    selectFile(ids[j]);
    const t = document.getElementById(triggerId) || document.getElementById('up-next-image') || document.getElementById('up-next');
    if (t && document.activeElement !== t) t.focus();
  }

  function retry(b, fids) {
    const failed = fids.map((id) => fileById(b, id)).filter((f) => f && stateOf(f) === 'failed');
    failed.forEach((f, i) => {
      const im = App.find.image(f.imageId);
      const p = plan(im.id);
      /* UJ-2: with several, the last one still fails on its first retry */
      p.fail = failed.length > 1 && i === failed.length - 1 && !p.retried ? 'the AI service did not answer within 30 seconds' : null;
      p.retried = true;
      im.processing = 'queued';
      im.error = null;
    });
    if (!failed.length) return;
    App.log('Retried metadata', failed.map((f) => f.fileName).join(', '));
    App.save();
    App.status('Trying again for ' + App.fmt.plural(failed.length, 'image') + '.');
    refreshLive();
  }

  function decideMatch(b, f, answer, all) {
    const files = all ? b.files.filter((x) => x.match && !x.match.answer && stateOf(x) !== 'discarded') : [f];
    files.forEach((x) => {
      x.match.answer = answer;
      if (answer === 'discard') App.store.images = App.store.images.filter((im) => im.id !== x.imageId);
    });
    App.log(answer === 'discard' ? 'Discarded new files' : 'Kept both files', files.map((x) => x.fileName).join(', '));
    App.save();
    App.status(answer === 'discard'
      ? (files.length === 1 ? f.fileName + ' was discarded.' : App.fmt.plural(files.length, 'new file') + ' discarded.')
      : (files.length === 1 ? 'Both files are kept.' : 'Both files are kept for ' + App.fmt.plural(files.length, 'file name match', 'file name matches') + '.'));
    if (answer === 'discard') moveOn(b, f);
    refreshLive();
  }
  /* select the next row after f is gone from the list */
  function moveOn(b, f) {
    const c = App.current();
    const ids = Array.prototype.map.call(document.querySelectorAll('#main .files [data-row]'), (li) => li.getAttribute('data-row'));
    const i = ids.indexOf(f.id);
    const rest = fileList(b, c.params.query.show).rows;
    const next = rest.find((id) => ids.indexOf(id) > i) || rest[rest.length - 1] || null;
    sel = next;
    U().sel[b.id] = next;
    refreshMain();
    refreshDetails();
    const el = next && document.getElementById('up-row-' + next);
    if (el) { App.details.place(el); el.focus(); } else { App.details.place(null); const h1 = document.getElementById('up-h1'); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus(); } }
  }

  function doPublish(images) {
    images.forEach((im) => { im.status = 'published'; im.lockedBy = null; });
    if (images.length) App.log('Published images', images.map((im) => App.imageTitle(im)).join(', '));
    App.save();
  }

  function missingList(items) {
    return h`<ul class="up-dlg-list">${items.map((x) => h`<li><b>${x.name}</b>: no ${listAnd(x.missing)}</li>`)}</ul>`;
  }

  function publishOne(b, f) {
    const im = App.find.image(f.imageId);
    if (!im || !isPublishable(f) || locker(im)) return;
    const missing = missingFields(im);
    const go = () => {
      doPublish([im]);
      App.status(App.imageTitle(im) + ' is published.');
      refreshLive();
      const n = document.getElementById('up-next-image');
      if (n) n.focus();
    };
    if (!missing.length && !s4(im)) { go(); return; }
    App.dialog({
      title: missing.length ? 'Publish with missing metadata?' : 'Publish it as internal only?',
      body: h`${missing.length ? h`<p class="ds-paragraph"><b>${App.imageTitle(im)}</b> has no ${listAnd(missing)}. It will be harder to find and less accessible.</p>` : ''}${
        s4(im) ? h`<p class="ds-paragraph">It is restricted with no clients chosen, so it behaves as internal only.</p>` : ''}`,
      actions: [{ label: 'Publish anyway', value: 'ok', variant: 'primary' }, { label: 'Go back', value: null, variant: 'secondary' }]
    }).then((r) => { if (r.action === 'ok') go(); });
  }

  function publishBatch(b) {
    const live = liveFiles(b);
    const ready = live.filter((f) => stateOf(f) === 'ready');
    const extra = live.filter((f) => stateOf(f) === 'needs-alt' || stateOf(f) === 'failed').filter((f) => !locker(App.find.image(f.imageId)));
    const blocked = live.filter((f) => ['uploading', 'queued', 'generating', 'needs-decision'].indexOf(stateOf(f)) !== -1);
    const imgs = (fs) => fs.map((f) => App.find.image(f.imageId));
    const lacking = ready.concat(extra).map((f) => ({ f, name: nameOf(f), missing: missingFields(App.find.image(f.imageId)) })).filter((x) => x.missing.length);
    const s4n = imgs(ready.concat(extra)).filter(s4).length;

    const finish = (files) => {
      const chosen = new Set(files.map((f) => f.id));
      doPublish(imgs(files));
      const skipped = blocked.map((f) => {
        const st = stateOf(f);
        return { name: nameOf(f), reason: st === 'needs-decision' ? 'decide on the file name match first' : st === 'uploading' ? 'it is still uploading' : 'its metadata is still being generated' };
      }).concat(extra.filter((f) => !chosen.has(f.id)).map((f) => ({ name: nameOf(f), reason: 'missing metadata, so it is still a draft' })));
      result = { batchId: b.id, published: files.map(nameOf), skipped };
      App.status(App.fmt.plural(files.length, 'image') + ' published.');
      refreshMain();
      refreshLive();
      const r = document.getElementById('up-result');
      if (r) r.focus();
    };

    if (!lacking.length && !s4n && !extra.length) { finish(ready); return; }
    const actions = [];
    if (ready.length) actions.push({ label: 'Publish ' + App.fmt.plural(ready.length, 'ready image'), value: 'ready', variant: 'primary' });
    if (extra.length) actions.push({ label: 'Publish ' + App.fmt.plural(ready.length + extra.length, 'image'), value: 'all', variant: ready.length ? 'secondary' : 'primary' });
    actions.push({ label: 'Go back', value: null, variant: 'tertiary' });
    App.dialog({
      title: lacking.length ? 'Some images have missing metadata' : 'Publish ' + App.fmt.plural(ready.length, 'ready image') + '?',
      body: h`${lacking.length ? h`<p class="ds-paragraph">Missing metadata does not stop publishing, but these images will be harder to find and less accessible:</p>${missingList(lacking)}` : ''}${
        extra.length && ready.length ? h`<p class="ds-paragraph">${App.fmt.plural(extra.length, 'image')} ${extra.length === 1 ? 'is' : 'are'} not ready: publish ${App.fmt.plural(ready.length + extra.length, 'image')} to include ${extra.length === 1 ? 'it' : 'them'}, or only the ready ones.</p>` : ''}${
        s4n ? h`<p class="ds-paragraph">${App.fmt.plural(s4n, 'image')} ${s4n === 1 ? 'is' : 'are'} restricted with no clients chosen, so ${s4n === 1 ? 'it behaves' : 'they behave'} as internal only.</p>` : ''}${
        blocked.length ? h`<p class="ds-paragraph">${App.fmt.plural(blocked.length, 'file')} ${blocked.length === 1 ? 'is' : 'are'} still processing or ${blocked.length === 1 ? 'needs' : 'need'} a decision and ${blocked.length === 1 ? 'stays a draft' : 'stay drafts'}.</p>` : ''}`,
      actions
    }).then((r) => {
      if (r.action === 'ready') finish(ready);
      else if (r.action === 'all') finish(ready.concat(extra));
    });
  }

  function discardDraft(b, f) {
    const im = App.find.image(f.imageId);
    if (!im || im.status !== 'draft') return;
    App.confirm({
      title: 'Discard ' + (im.title || f.fileName) + '?',
      body: h`<p class="ds-paragraph">The draft and its file are deleted for good. Nothing about it is kept, so the same file can be uploaded again later.</p>`,
      confirm: 'Discard draft', danger: true
    }).then((ok) => {
      if (!ok) return;
      App.store.images = App.store.images.filter((x) => x.id !== im.id);
      delete U().plan[im.id];
      delete U().edited[im.id];
      App.log('Discarded a draft', f.fileName);
      App.save();
      App.status(f.fileName + ' was discarded.');
      moveOn(b, f);
      refreshLive();
    });
  }

  /* ---------------------------------------------------------------- autosave (drafts, D-033) */
  function showSaved(ok) {
    const el = document.getElementById('up-saved');
    if (!el) return;
    el.classList.toggle('is-failed', !ok);
    el.innerHTML = ok ? String(h`${App.icon('check')}Saved`) : App.esc(MSG_SAVE_FAILED);
  }
  function fieldError(id, text) {
    const err = document.getElementById(id);
    if (!err) return;
    err.textContent = text || '';
    err.hidden = !text;
  }
  function selectedImage() {
    const b = currentBatch();
    const f = b && sel ? fileById(b, sel) : null;
    return f && f.imageId ? App.find.image(f.imageId) : null;
  }
  /* a failed draft that staff have filled in by hand is no longer failed */
  function settleFailed(im) {
    if (im.processing === 'failed' && !missingFields(im).length) { im.processing = 'ready'; im.error = null; }
  }
  function canSave(im) { return !!(im && App.find.image(im.id) && im.status === 'draft' && !locker(im)); }

  function saveField(imageId, field, value) {
    const im = App.find.image(imageId);
    if (!canSave(im)) { showSaved(false); return; }
    if (field === 'altText' && value.length > ALT_MAX) { fieldError('up-f-alt-err', MSG_ALT_LONG); return; }
    if (field === 'altText') fieldError('up-f-alt-err', '');
    im[field] = value.trim();
    markEdited(im.id, field);
    im.editedBy = me() ? me().id : null;
    settleFailed(im);
    App.save();
    showSaved(true);
    if (field === 'title') { const t = document.getElementById('up-d-title'); if (t) t.textContent = im.title || im.fileName; }
    refreshLive();
  }
  function flushPending() {
    Object.keys(pending).forEach((k) => {
      const p = pending[k];
      window.clearTimeout(p.timer);
      delete pending[k];
      saveField(p.imageId, k, p.value);
    });
  }
  function onFieldInput(el) {
    const im = selectedImage();
    if (!im) return;
    const field = el.getAttribute('data-meta');
    if (field === 'altText') {
      const d = document.getElementById('up-f-alt-d');
      if (d) d.textContent = el.value.length + ' of ' + ALT_MAX + ' characters. Aim for under 150.';
      const over = el.value.length > ALT_MAX;
      fieldError('up-f-alt-err', over ? MSG_ALT_LONG : '');
      if (over) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    }
    if (pending[field]) window.clearTimeout(pending[field].timer);
    const timer = window.setTimeout(() => { const p = pending[field]; if (!p) return; delete pending[field]; saveField(p.imageId, field, p.value); }, 600);
    pending[field] = { imageId: im.id, value: el.value, timer };
  }

  /* access controls and keywords: one handler for the three scopes */
  function scopeTarget(scope) {
    if (scope === 'new') return newDraft;
    if (scope === 'edit') return editDraft;
    return null;
  }
  function rerenderClients(scope, root, d) {
    const box = root.querySelector('[data-acc-clients]');
    if (box) setPart(box, String(clientChips(scope, d)));
  }
  function onAccess(el, kind) {
    const root = el.closest('[data-acc-scope]');
    if (!root) return;
    const scope = root.getAttribute('data-acc-scope');
    const p = 'up-' + scope + '-';
    if (scope !== 'file') {
      const d = scopeTarget(scope);
      if (!d) return;
      if (kind === 'vis') d.visibility = el.value;
      else if (kind === 'price') { d.priceMode = el.value; if (el.value === 'paid') { const a = document.getElementById(p + 'amt'); if (a) a.focus(); } else fieldError(p + 'amt-err', ''); }
      else if (kind === 'amt') { d.amount = el.value; if (validAmount(el.value)) fieldError(p + 'amt-err', ''); }
      else if (kind === 'add-client' && el.value) { d.clients.push(el.value); rerenderClients(scope, root, d); const s = document.getElementById(p + 'addcl'); if (s) s.focus(); }
      return;
    }
    const im = selectedImage();
    if (!canSave(im)) { showSaved(false); return; }
    if (kind === 'vis') {
      im.visibility = el.value;
      if (el.value !== 'restricted') im.clients = [];
      rerenderClients('file', root, { clients: im.clients });
    } else if (kind === 'price') {
      if (el.value === 'free') { im.price = 0; plan(im.id).paid = false; fieldError(p + 'amt-err', ''); } else {
        plan(im.id).paid = true;
        const a = document.getElementById(p + 'amt');
        if (a) { if (validAmount(a.value)) im.price = parseInt(a.value, 10); a.focus(); }
      }
    } else if (kind === 'amt') {
      if (!validAmount(el.value)) { fieldError(p + 'amt-err', MSG_PRICE); el.setAttribute('aria-invalid', 'true'); return; }
      fieldError(p + 'amt-err', '');
      el.removeAttribute('aria-invalid');
      im.price = parseInt(el.value, 10);
    } else if (kind === 'add-client' && el.value) {
      im.clients = (im.clients || []).concat([el.value]);
      rerenderClients('file', root, { clients: im.clients });
      const s = document.getElementById(p + 'addcl'); if (s) s.focus();
    } else return;
    markEdited(im.id, kind === 'amt' || kind === 'price' ? 'price' : 'visibility');
    App.save();
    showSaved(true);
    refreshLive();
  }
  function onRemoveClient(btn) {
    const root = btn.closest('[data-acc-scope]');
    const scope = root.getAttribute('data-acc-scope');
    const id = btn.getAttribute('data-acc-remove');
    const p = 'up-' + scope + '-';
    if (scope === 'file') {
      const im = selectedImage();
      if (!canSave(im)) { showSaved(false); return; }
      im.clients = (im.clients || []).filter((x) => x !== id);
      markEdited(im.id, 'visibility');
      App.save();
      rerenderClients('file', root, { clients: im.clients });
      showSaved(true);
      refreshLive();
    } else {
      const d = scopeTarget(scope);
      d.clients = d.clients.filter((x) => x !== id);
      rerenderClients(scope, root, d);
    }
    const next = root.querySelector('[data-acc-remove]') || document.getElementById(p + 'addcl');
    if (next) next.focus();
  }

  function kwBox(el) { return el.closest('[data-kw-scope]'); }
  function kwRerender(box, scope, kws) {
    const b = currentBatch();
    const batchKws = scope === 'file' && b ? b.settings.keywords || [] : null;
    setPart(box.querySelector('[data-kw-list]'), String(keywordChips(scope, kws, batchKws)));
    const n = box.querySelector('.up-kw-n');
    if (n && batchKws) n.textContent = '(' + kws.filter((k) => batchKws.indexOf(k) === -1).length + ' of ' + KW_MAX + ')';
  }
  function kwTarget(scope) {
    if (scope === 'file') { const im = selectedImage(); return canSave(im) ? { list: im.keywords || [], im } : null; }
    const d = scopeTarget(scope);
    return d ? { list: d.keywords } : null;
  }
  function kwCommit(scope, t, list) {
    if (t.im) {
      t.im.keywords = list;
      markEdited(t.im.id, 'keywords');
      settleFailed(t.im);
      App.save();
      showSaved(true);
      refreshLive();
    } else scopeTarget(scope).keywords = list;
  }
  function onAddKeyword(box) {
    const scope = box.getAttribute('data-kw-scope');
    const input = box.querySelector('[data-kw-input]');
    const errId = 'up-' + scope + '-kw-err';
    const t = kwTarget(scope);
    if (!t) { if (scope === 'file') showSaved(false); return; }
    const k = input.value.trim();
    if (!k) { fieldError(errId, 'Type a keyword first.'); input.focus(); return; }
    if (t.list.some((x) => x.toLowerCase() === k.toLowerCase())) { fieldError(errId, 'That keyword is already there.'); input.focus(); return; }
    fieldError(errId, '');
    const list = t.list.concat([k]);
    kwCommit(scope, t, list);
    kwRerender(box, scope, list);
    input.value = '';
    input.focus();
  }
  function onRemoveKeyword(btn) {
    const box = kwBox(btn);
    const scope = box.getAttribute('data-kw-scope');
    const t = kwTarget(scope);
    if (!t) { if (scope === 'file') showSaved(false); return; }
    const k = btn.getAttribute('data-kw-remove');
    const before = Array.prototype.indexOf.call(box.querySelectorAll('[data-kw-remove]'), btn);
    const list = t.list.filter((x) => x !== k);
    kwCommit(scope, t, list);
    kwRerender(box, scope, list);
    const chips = box.querySelectorAll('[data-kw-remove]');
    const next = chips[Math.min(before, chips.length - 1)] || box.querySelector('[data-kw-input]');
    if (next) next.focus();
  }

  /* ---------------------------------------------------------------- batch settings */
  function validateDraft(scope, d) {
    const p = 'up-' + scope + '-';
    if (d.priceMode === 'paid' && !validAmount(d.amount)) {
      fieldError(p + 'amt-err', MSG_PRICE);
      const a = document.getElementById(p + 'amt');
      if (a) { a.setAttribute('aria-invalid', 'true'); a.focus(); }
      return false;
    }
    return true;
  }
  function saveBatchSettings(b) {
    if (!validateDraft('edit', editDraft)) return;
    const next = settingsFrom(editDraft);
    const drafts = liveFiles(b).map((f) => App.find.image(f.imageId)).filter((im) => im && im.status === 'draft');
    const store = (apply) => {
      const oldKws = b.settings.keywords || [];
      if (apply) {
        drafts.forEach((im) => {
          im.visibility = next.visibility;
          im.clients = next.clients.slice();
          im.price = next.price;
          const own = (im.keywords || []).filter((k) => oldKws.indexOf(k) === -1 && next.keywords.indexOf(k) === -1);
          im.keywords = next.keywords.concat(own);
        });
      }
      b.settings = next;
      App.log('Changed batch settings', b.name + (apply ? ', applied to ' + App.fmt.plural(drafts.length, 'draft') : ', for files added later'));
      App.save();
      editing = null;
      editDraft = null;
      App.status(apply ? 'Batch settings saved and applied to ' + App.fmt.plural(drafts.length, 'draft') + '.' : 'Batch settings saved.');
      refreshMain();
      refreshDetails();
      refreshLive();
      const btn = document.getElementById('up-edit-settings');
      if (btn) btn.focus();
    };
    if (!drafts.length) { store(false); return; }
    App.dialog({
      title: 'Apply the new settings to the drafts?',
      body: h`<p class="ds-paragraph">The ${App.fmt.plural(drafts.length, 'draft image')} in this batch get the new visibility, price and batch keywords. This overwrites their current values, also changes made to single images. Published images keep theirs.</p><p class="ds-paragraph">Files you add later always get the new settings.</p>`,
      actions: [
        { label: 'Apply to ' + App.fmt.plural(drafts.length, 'draft'), value: 'apply', variant: 'primary' },
        { label: 'Only for files added later', value: 'later', variant: 'secondary' },
        { label: 'Go back', value: null, variant: 'tertiary' }
      ]
    }).then((r) => { if (r.action) store(r.action === 'apply'); });
  }

  function startBatch(specs) {
    if (!validateDraft('new', newDraft)) return;
    const user = me();
    const now = App.nowISO();
    const b = {
      id: App.uid('b'),
      name: newDraft.name.trim() || 'Batch of ' + App.fmt.date(now),
      ownerId: user ? user.id : null, createdAt: now, settings: settingsFrom(newDraft), files: []
    };
    App.store.batches.push(b);
    App.log('Started a batch', b.name);
    addFiles(b, specs);
    newDraft = null;
    App.navigate('#/upload/' + b.id);
  }

  /* ---------------------------------------------------------------- events */
  function bindCommon() {
    App.on('change', '[data-acc]', (e, el) => {
      const k = el.getAttribute('data-acc');
      if (k === 'amt') return;
      onAccess(el, k);
    });
    App.on('input', '[data-acc="amt"]', (e, el) => {
      const root = el.closest('[data-acc-scope]');
      if (root && root.getAttribute('data-acc-scope') !== 'file') onAccess(el, 'amt');
    });
    App.on('change', '[data-acc="amt"]', (e, el) => {
      const root = el.closest('[data-acc-scope]');
      if (root && root.getAttribute('data-acc-scope') === 'file') onAccess(el, 'amt');
    });
    App.on('click', '[data-acc-remove]', (e, el) => onRemoveClient(el));
    App.on('click', '[data-kw-remove]', (e, el) => onRemoveKeyword(el));
    App.on('click', '[data-kw-add]', (e, el) => onAddKeyword(kwBox(el)));
    App.on('keydown', '[data-kw-input]', (e, el) => { if (e.key === 'Enter') { e.preventDefault(); onAddKeyword(kwBox(el)); } });
    App.on('input', '[data-set="name"]', (e, el) => { if (newDraft) newDraft.name = el.value; });
    App.on('change', '[data-set="ai"], [data-set="placeNames"]', (e, el) => {
      const form = el.closest('[data-acc-scope]');
      const d = scopeTarget(form && form.getAttribute('data-acc-scope'));
      if (!d) return;
      d[el.getAttribute('data-set')] = el.checked;
      if (el.getAttribute('data-set') === 'ai') {
        const pn = form.querySelector('[data-set="placeNames"]');
        pn.disabled = !el.checked;
        pn.checked = el.checked && d.placeNames;
      }
    });
    App.on('dragover', '[data-drop]', (e, el) => { e.preventDefault(); el.classList.add('is-over'); });
    App.on('dragleave', '[data-drop]', (e, el) => { if (!el.contains(e.relatedTarget)) el.classList.remove('is-over'); });
  }

  function mountBatch(root, params) {
    const store = App.store;
    const b = App.find.batch(params.batchId);
    const batchId = b.id;
    timers.push(window.setInterval(tick, TICK_MS));
    bindCommon();

    App.on('click', '.files [data-pick]', (e, el) => selectFile(el.getAttribute('data-id'), { toggle: true }));
    App.on('click', '.todo a', () => { jumpToRows = true; });
    App.on('click', '[data-fold]', (e, el) => {
      const open = el.getAttribute('aria-expanded') !== 'true';
      U().openDone[b.id] = open;
      if (!open && sel && DONE.indexOf(stateOf(fileById(b, sel))) !== -1) deselect(b);
      App.save();
      refreshMain();
      const btn = document.getElementById('up-fold');
      if (btn) btn.focus();
      App.status(open ? 'Showing the ready and published files.' : 'Ready and published files hidden.');
    });
    if (jumpToRows) {
      jumpToRows = false;
      const first = params.query && params.query.show && root.querySelector('.files [data-pick]');
      const card = root.querySelector('.files-card');
      if (first && card) {
        /* after the shell has placed focus for the new route */
        window.requestAnimationFrame(() => {
          card.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
          first.focus({ preventScroll: true });
        });
      }
    }
    App.on('click', '[data-prev]', (e, el) => step(-1, el.id));
    App.on('click', '[data-next]', (e, el) => step(1, el.id));
    App.on('click', '[data-retry]', (e, el) => {
      const fid = el.getAttribute('data-retry');
      const inRow = !!el.closest('.row-end');
      retry(b, [fid]);
      const r = inRow ? document.getElementById('up-row-' + fid) : document.getElementById('up-d-title');
      if (r) { if (!inRow) r.setAttribute('tabindex', '-1'); r.focus(); }
    });
    App.on('click', '[data-retry-all]', () => {
      retry(b, b.files.filter((f) => stateOf(f) === 'failed').map((f) => f.id));
      if (!document.getElementById('up-retry-all')) { const t = document.getElementById('up-todo-h'); if (t) t.focus(); }
    });
    App.on('click', '[data-publish-batch]', () => { flushPending(); publishBatch(b); });
    App.on('click', '[data-publish-one]', () => { flushPending(); const f = sel && fileById(b, sel); if (f) publishOne(b, f); });
    App.on('click', '[data-discard]', () => { flushPending(); const f = sel && fileById(b, sel); if (f) discardDraft(b, f); });
    App.on('click', '[data-match]', (e, el) => {
      const f = sel && fileById(b, sel);
      if (!f || !f.match || f.match.answer) return;
      const all = document.getElementById('up-match-all');
      decideMatch(b, f, el.getAttribute('data-match'), !!(all && all.checked));
      const k = document.getElementById('up-next-image');
      if (k && el.getAttribute('data-match') === 'keep-both') k.focus();
    });
    App.on('click', '[data-dismiss]', () => {
      const f = sel && fileById(b, sel);
      if (!f) return;
      f.dismissed = true;
      App.save();
      App.status(f.fileName + ' was removed from the list.');
      moveOn(b, f);
      refreshLive();
    });
    App.on('click', '[data-edit-settings]', () => {
      editing = b.id;
      editDraft = draftFrom(b.settings);
      refreshMain();
      const el = document.getElementById('up-edit-form-h');
      if (el) { el.setAttribute('tabindex', '-1'); el.focus(); }
    });
    App.on('click', '[data-cancel-settings]', () => {
      editing = null;
      editDraft = null;
      refreshMain();
      const el = document.getElementById('up-edit-settings');
      if (el) el.focus();
    });
    App.on('submit', '#up-edit-form', (e) => { e.preventDefault(); saveBatchSettings(b); });
    App.on('click', '[data-close-result]', () => {
      result = null;
      refreshMain();
      const el = document.getElementById('up-h1');
      if (el) { el.setAttribute('tabindex', '-1'); el.focus(); }
    });
    App.on('input', '#app-details [data-meta]', (e, el) => onFieldInput(el));
    App.on('click', '[data-choose]', () => {
      addFiles(b, sampleSpecs(b));
      refreshLive();
    });
    const dropFiles = (e) => {
      e.preventDefault();
      document.querySelectorAll('#main .is-over').forEach((x) => x.classList.remove('is-over'));
      const list = e.dataTransfer && e.dataTransfer.files;
      addFiles(b, list && list.length ? specsFromFiles(list) : sampleSpecs(b));
      refreshLive();
    };
    App.on('drop', '[data-drop]', (e) => dropFiles(e));
    /* with the compact bar, the whole page takes the drop; the bar lights up while dragging */
    App.on('dragover', '#main', (e) => {
      const bar = document.querySelector('#main .up-drop-bar');
      if (!bar) return;
      e.preventDefault();
      bar.classList.add('is-over');
    });
    App.on('dragleave', '#main', (e) => {
      const main = document.getElementById('main');
      if (main && !main.contains(e.relatedTarget)) document.querySelectorAll('#main .up-drop-bar.is-over').forEach((x) => x.classList.remove('is-over'));
    });
    App.on('drop', '#main', (e) => { if (document.querySelector('#main .up-drop-bar') && !e.target.closest('[data-drop]')) dropFiles(e); });

    /* first paint: selection, inline placement, guard */
    const btn = sel ? document.getElementById('up-row-' + sel) : null;
    App.details.place(btn);
    sbRendered = lastSidebar;
    mounted = true;
    wasUploading = false;
    wasProcessing = false;
    syncGuard(b);
    if (result && result.batchId !== batchId) result = null;

    return function cleanup() {
      mounted = false;
      timers.forEach((t) => window.clearInterval(t));
      timers = [];
      if (App.store !== store) {
        Object.keys(pending).forEach((k) => window.clearTimeout(pending[k].timer));
        pending = {};
        return;
      }
      flushPending();
      const path = window.location.hash.replace(/^#/, '').split('?')[0];
      if (path === '/upload/' + batchId) return;
      /* leaving the batch: files still uploading are not added (the guard warned) */
      const bb = App.find.batch(batchId);
      if (!bb) return;
      const gone = bb.files.filter((f) => { const im = App.find.image(f.imageId); return im && im.processing === 'uploading'; });
      if (gone.length) {
        const ids = new Set(gone.map((f) => f.imageId));
        App.store.images = App.store.images.filter((im) => !ids.has(im.id));
        bb.files = bb.files.filter((f) => gone.indexOf(f) === -1);
        App.save();
      }
      editing = null;
      editDraft = null;
      result = null;
    };
  }

  /* ---------------------------------------------------------------- register */
  App.registerScreen('/upload', {
    role: 'staff',
    title: 'New batch · Upload',
    nav: 'upload',
    sidebarLabel: 'Batches and to-do',
    sidebarToggleLabel: 'Show or hide batches',
    sidebar: sidebarHTML,
    render() {
      if (!newDraft) newDraft = defaultDraft();
      const anyBatch = App.store.batches.length > 0;
      return h`<div class="batch-head"><div>
          <h1 class="page-title" id="up-h1">New batch</h1>
          <p class="page-sub">${anyBatch ? 'Start a new batch here, or open one of the batches in the list.' : 'No batch yet. Set the batch settings and add files to start one.'}</p>
        </div></div>
        ${settingsFormHTML('new', newDraft)}
        ${dropHTML('Add files to start the batch')}`;
    },
    mount() {
      bindCommon();
      App.on('submit', '#up-new-form', (e) => e.preventDefault());
      App.on('click', '[data-choose]', () => startBatch(sampleSpecs({ files: [] })));
      App.on('drop', '[data-drop]', (e, el) => {
        e.preventDefault();
        el.classList.remove('is-over');
        const list = e.dataTransfer && e.dataTransfer.files;
        startBatch(list && list.length ? specsFromFiles(list) : sampleSpecs({ files: [] }));
      });
      return function cleanup() { if (window.location.hash.indexOf('#/upload/') === 0) newDraft = null; };
    }
  });

  App.registerScreen('/upload/:batchId', {
    role: 'staff',
    title: (p) => { const b = App.find.batch(p.batchId); return (b ? b.name + ' · ' : '') + 'Upload'; },
    nav: 'upload',
    sidebarLabel: 'Batches and to-do',
    sidebarToggleLabel: 'Show or hide batches',
    sidebar: sidebarHTML,
    render(params) {
      const b = App.find.batch(params.batchId);
      if (!view || view.key.split('|')[0] !== b.id) {
        sel = U().sel[b.id] || null;
        if (editing !== b.id) { editing = null; editDraft = null; }
      }
      return batchMainHTML(params);
    },
    details: detailsHTML,
    detailsLabel: 'Selected file',
    onCloseDetails(collapse) {
      flushPending();
      const b = currentBatch();
      sel = null;
      if (b) U().sel[b.id] = null;
      markPressed();
      collapse();
    },
    mount: mountBatch
  });
})(window.App);
