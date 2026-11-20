/* Owner: Staff Library and Image page (#/library, #/library/:imageId, #/image/:id).
   Spines: ../../EXPERIENCE.md (Library rows of State Patterns, Editing and Saving, Access and
   Price Display) and ../../DESIGN.md (Details panel). Ported from ../key-screens.html (Library).

   Library: Filters sidebar (query-driven, counts from the store), toolbar, wall, pager, Details
   panel. Selecting a tile swaps the URL in place (replaceState + App.refresh) so the page does
   not jump; filters push a history entry the same way. Pager and nav links are ordinary hash
   navigation and go through the leave guard.

   Details panel and Image page share panelHTML(): view -> Edit -> Save changes / Cancel
   (FR-17, D-033, no autosave), changed-field markers, "Unsaved changes (n fields)", inline
   validation, edit lock (FR-18: taken on Edit, released on Save, Cancel, Discard and leave),
   the Unsaved-changes dialog on leave, Publish (FR-19a), Archive / Restore (FR-26), Revoke
   (FR-25) and Staff copy (FR-34).

   The edit session (`ed`) lives in this module, not in the DOM, so a re-render (filter change,
   moving between #/library/:id and #/image/:id) keeps the unsaved values. */
(function (App) {
  'use strict';
  const h = App.h;
  const raw = App.raw;

  const PER_PAGE = 14;
  const ALT_MAX = 250;
  const MSG_SAVE_FAILED = 'Your change was not saved. Try again.';
  const msgLock = (name) => name + ' is editing this image. You can edit it when they finish, or after 15 minutes without activity.';
  const msgAi = (reason) => 'Metadata could not be generated: ' + reason + '. Fill in the fields yourself or try again.';

  const STATUS = [['draft', 'Draft'], ['published', 'Published'], ['archived', 'Archived']];
  const PROC = [['uploading', 'Uploading'], ['queued', 'Queued'], ['generating', 'Generating'], ['ready', 'Ready'], ['failed', 'Failed']];
  const VIS = [['internal', 'Internal only'], ['restricted', 'Restricted'], ['public', 'Public']];
  const PRICE = [['free', 'Free'], ['paid', 'Paid']];
  const SORTS = [['newest', 'Newest first', 'newest first'], ['taken', 'Date taken', 'by date taken, newest first'], ['title', 'Title A–Z', 'by title A–Z']];
  const VIS_TEXT = {
    internal: ['Internal only', 'Only agency staff can see it.'],
    restricted: ['Restricted', 'Only the clients listed can see it.'],
    public: ['Public', 'Every logged-in client can find it.']
  };
  /* tracked edit fields: key, label (for the action log), id of the input that gets focus */
  const FIELDS = [
    ['title', 'title', 'lib-title'], ['description', 'description', 'lib-desc'], ['altText', 'alt text', 'lib-alt'],
    ['keywords', 'keywords', 'lib-kw'], ['dateTaken', 'date taken', 'lib-date'], ['gps', 'GPS position', 'lib-lat'],
    ['place', 'place', 'lib-place'], ['visibility', 'visibility', 'lib-vis-internal'], ['clients', 'clients', 'lib-add-client'],
    ['price', 'price', 'lib-price-free']
  ];
  const ERROR_IDS = { altText: 'lib-alt', dateTaken: 'lib-date', lat: 'lib-lat', lng: 'lib-lng', amount: 'lib-amt' };
  const INPUT_NAMES = ['title', 'description', 'altText', 'dateTaken', 'lat', 'lng', 'place', 'amount'];

  /* edit session: { imageId, v, errors, kwError, lastField, saveError } | null */
  let ed = null;
  /* one-line result in the status line after Save / Publish / Archive ... : { imageId, text } */
  let note = null;

  /* ======================================================================
     Small helpers
     ====================================================================== */
  const me = () => App.currentUser();
  const firstName = (userId) => (App.find.user(userId) || {}).firstName || 'someone';
  const css = (s) => (window.CSS && CSS.escape ? CSS.escape(s) : s);
  const hidden = (cond) => (cond ? raw(' hidden') : '');
  const flag = (cond, attr) => (cond ? raw(' ' + attr) : '');

  function focusId(id) {
    const el = id && document.getElementById(id);
    if (el) el.focus();
    return !!el;
  }
  function tileFor(id) {
    return id ? document.querySelector('#main .wall [data-pick][data-id="' + css(id) + '"]') : null;
  }
  /* change the URL without the route jumping to the top: same screen, re-rendered in place */
  function softGo(hash, replace) {
    if (replace) window.history.replaceState(null, '', hash);
    else window.history.pushState(null, '', hash);
    App.refresh();
  }
  function lockHolderOther(image) {
    const u = me();
    const holder = App.locks.holder(image);
    return holder && (!u || holder.id !== u.id) ? holder : null;
  }
  function lockedByMe(image) {
    const u = me();
    return !!(image && image.lockedBy && u && image.lockedBy.userId === u.id);
  }
  function activeLicences(imageId) { return App.licences.forImage(imageId).filter((l) => !l.revoked); }
  function priceLabel(n) { return n ? n + ' USD' : 'Free'; }
  function visLabel(image) {
    if (image.visibility === 'restricted' && !(image.clients || []).length) return 'Restricted, no clients';
    if (image.visibility === 'restricted') return 'Restricted to ' + App.clientNames(image.clients);
    return VIS_TEXT[image.visibility][0];
  }

  /* ======================================================================
     Filters (query: q, status, proc, vis, price, client, from, to, sort, page)
     ====================================================================== */
  const listOf = (s, allowed) => String(s || '').split(',').filter((x) => allowed.some((a) => a[0] === x));
  function readFilters(query) {
    query = query || {};
    const iso = (s) => (/^\d{4}-\d{2}-\d{2}$/.test(s || '') ? s : '');
    return {
      q: (query.q || '').trim(),
      status: listOf(query.status, STATUS),
      proc: PROC.some((p) => p[0] === query.proc) ? query.proc : '',
      vis: listOf(query.vis, VIS),
      price: listOf(query.price, PRICE),
      client: App.find.client(query.client) ? query.client : '',
      from: iso(query.from),
      to: iso(query.to),
      sort: SORTS.some((s) => s[0] === query.sort) ? query.sort : 'newest'
    };
  }
  function matchClient(image, clientId) {
    return (image.visibility === 'restricted' && (image.clients || []).indexOf(clientId) !== -1) ||
      !!App.access.activeLicence(clientId, image.id);
  }
  /* skip: one group to leave out, so its own counts show what choosing it would give */
  function applyFilters(list, f, skip) {
    return list.filter((im) => {
      if (skip !== 'status' && f.status.length && f.status.indexOf(im.status) === -1) return false;
      if (skip !== 'proc' && f.proc && im.processing !== f.proc) return false;
      if (skip !== 'vis' && f.vis.length && f.vis.indexOf(im.visibility) === -1) return false;
      if (skip !== 'price' && f.price.length && f.price.indexOf(im.price > 0 ? 'paid' : 'free') === -1) return false;
      if (skip !== 'client' && f.client && !matchClient(im, f.client)) return false;
      if (skip !== 'date' && (f.from || f.to)) {
        const d = String(im.dateTaken || '').slice(0, 10);
        if (!d || (f.from && d < f.from) || (f.to && d > f.to)) return false;
      }
      return true;
    });
  }
  function sortList(list, sort) {
    if (sort === 'taken') {
      return list.slice().sort((a, b) => String(b.dateTaken || '').localeCompare(String(a.dateTaken || '')) ||
        String(b.createdAt).localeCompare(String(a.createdAt)));
    }
    if (sort === 'title') {
      return list.slice().sort((a, b) => {
        if (!a.title !== !b.title) return a.title ? -1 : 1; /* Untitled images last */
        return String(a.title).localeCompare(String(b.title), 'en', { sensitivity: 'base' }) || String(b.createdAt).localeCompare(String(a.createdAt));
      });
    }
    return App.sortNewest(list);
  }
  function searched(f) { return App.search.images(App.store.images, f.q, { viewer: 'staff' }); }
  function results(f) { return sortList(applyFilters(searched(f), f), f.sort); }

  function libPath(params) { return params.imageId ? '/library/' + params.imageId : '/library'; }
  /* href for the same Library view with some query keys changed; paging restarts */
  function hrefWith(params, changes) {
    const q = Object.assign({}, params.query, changes);
    if (!('page' in changes)) delete q.page;
    Object.keys(q).forEach((k) => { if (Array.isArray(q[k])) q[k] = q[k].join(','); });
    return App.href(libPath(params), q);
  }
  function activeChips(f) {
    const out = [];
    if (f.q) out.push({ key: 'q', value: '', label: '“' + f.q + '”' });
    f.status.forEach((s) => out.push({ key: 'status', value: s, label: STATUS.find((x) => x[0] === s)[1] }));
    if (f.proc) out.push({ key: 'proc', value: '', label: PROC.find((x) => x[0] === f.proc)[1] });
    f.vis.forEach((s) => out.push({ key: 'vis', value: s, label: VIS.find((x) => x[0] === s)[1] }));
    f.price.forEach((s) => out.push({ key: 'price', value: s, label: PRICE.find((x) => x[0] === s)[1] }));
    if (f.client) out.push({ key: 'client', value: '', label: App.find.client(f.client).name });
    if (f.from) out.push({ key: 'from', value: '', label: 'Taken from ' + App.fmt.date(f.from) });
    if (f.to) out.push({ key: 'to', value: '', label: 'Taken until ' + App.fmt.date(f.to) });
    return out;
  }

  /* ======================================================================
     Sidebar: Filters
     ====================================================================== */
  function chipGroup(title, group, options, f, base) {
    const counted = applyFilters(base, f, group);
    const key = (im) => (group === 'price' ? (im.price > 0 ? 'paid' : 'free') : im[group === 'vis' ? 'visibility' : group]);
    return h`<div class="group" role="group" aria-labelledby="lib-g-${group}"><h3 id="lib-g-${group}">${title}</h3><div class="chips">${
      options.map((o) => {
        const n = counted.filter((im) => key(im) === o[0]).length;
        return h`<label class="ds-chip"><input class="ds-input" type="checkbox" id="lib-f-${group}-${o[0]}" data-filter="${group}" value="${o[0]}"${flag(f[group].indexOf(o[0]) !== -1, 'checked')}> ${o[1]} <span class="chip-n">${n}</span></label>`;
      })
    }</div></div>`;
  }
  function sidebarHTML(params) {
    const f = readFilters(params.query);
    const base = searched(f);
    const procBase = applyFilters(base, f, 'proc');
    const clientBase = applyFilters(base, f, 'client');
    const proc = PROC.map((p) => {
      const n = procBase.filter((im) => im.processing === p[0]).length;
      const cur = f.proc === p[0];
      const count = p[0] === 'failed' && n
        ? h`<span class="ds-badge" data-color="danger" data-count="${n}" aria-hidden="true"></span><span class="ds-sr-only">${n}</span>`
        : h`<span class="n">${n}</span>`;
      return h`<li><a href="${hrefWith(params, { proc: cur ? '' : p[0] })}" id="lib-proc-${p[0]}" data-soft${cur ? raw(' aria-current="true"') : ''}><span class="lbl"><span class="dot dot-${p[0]}" aria-hidden="true"></span>${p[1]}</span>${count}</a></li>`;
    });
    const clients = App.store.clients.slice().sort((a, b) => a.name.localeCompare(b.name, 'en'));
    return h`<section class="side-sec side-context" aria-labelledby="lib-f-h">
      <h2 id="lib-f-h">Filters</h2>
      ${chipGroup('Status', 'status', STATUS, f, base)}
      <div class="group"><h3 id="lib-g-proc">Processing</h3><ul class="facet" aria-labelledby="lib-g-proc">${proc}</ul></div>
      ${chipGroup('Visibility', 'vis', VIS, f, base)}
      ${chipGroup('Price', 'price', PRICE, f, base)}
      <div class="group">
        <ds-field class="ds-field" data-size="sm">
          <label class="ds-label" for="lib-client">Client</label>
          <select class="ds-input" id="lib-client" data-filter="client">
            <option value="">All clients</option>
            ${clients.map((c) => h`<option value="${c.id}"${flag(f.client === c.id, 'selected')}>${c.name}${c.active ? '' : ' (inactive)'} (${clientBase.filter((im) => matchClient(im, c.id)).length})</option>`)}
          </select>
        </ds-field>
      </div>
      <div class="group">
        <fieldset class="daterange ds-fieldset" data-size="sm">
          <legend class="grp">Date taken</legend>
          <div class="dr-row"><label class="ds-label" data-weight="regular" for="lib-from">From</label><input class="ds-input" id="lib-from" type="date" data-filter="from" value="${f.from}"${f.to ? raw(' max="' + f.to + '"') : ''}></div>
          <div class="dr-row"><label class="ds-label" data-weight="regular" for="lib-to">To</label><input class="ds-input" id="lib-to" type="date" data-filter="to" value="${f.to}"${f.from ? raw(' min="' + f.from + '"') : ''}></div>
        </fieldset>
      </div>
    </section>`;
  }

  /* ======================================================================
     Main: toolbar, wall, pager, empty state
     ====================================================================== */
  function libraryHTML(params) {
    const f = readFilters(params.query);
    const all = results(f);
    const pg = App.paginate(all, params.query.page, PER_PAGE);
    const chips = activeChips(f);
    const sortText = SORTS.find((s) => s[0] === f.sort)[2];
    let body;
    if (!App.store.images.length) {
      body = App.emptyState('No images yet. Images you upload appear here.', { label: 'Go to Upload', href: '#/upload' });
    } else if (!all.length) {
      body = App.emptyState('No images match your search and filters.', { label: 'Clear filters', attrs: 'data-clear-filters id="lib-clear"' });
    } else {
      body = h`${App.wall(pg.items, { label: 'Images', selectedId: params.imageId, viewer: 'staff' })}${App.pager({
        page: pg.page, perPage: PER_PAGE, total: pg.total, hrefFor: (p) => hrefWith(params, { page: p > 1 ? p : '' })
      })}`;
    }
    return h`<h1 class="ds-sr-only" id="lib-h" tabindex="-1">Library</h1>
      <div class="toolbar-meta">
        <span id="lib-count"><span class="count">${App.fmt.plural(all.length, 'image')}</span>, ${sortText}</span>
        ${chips.map((c, i) => h`<button class="ds-chip" type="button" data-removable="true" id="lib-chip-${i}" data-remove-filter="${c.key}" data-value="${c.value}" aria-label="Remove filter: ${c.label}">${c.label}</button>`)}
        <span class="spacer"></span>
        <ds-field class="ds-field sort" data-size="sm">
          <label class="ds-label" data-weight="regular" for="lib-sort">Sort</label>
          <select class="ds-input" id="lib-sort" data-filter="sort">${SORTS.map((s) => h`<option value="${s[0]}"${flag(f.sort === s[0], 'selected')}>${s[1]}</option>`)}</select>
        </ds-field>
        ${App.captionsSwitch('lib')}
      </div>
      ${body}`;
  }

  /* ======================================================================
     Edit session
     ====================================================================== */
  function valuesOf(im) {
    return {
      title: im.title || '', description: im.description || '', altText: im.altText || '', keywords: (im.keywords || []).slice(),
      dateTaken: im.dateTaken || '', lat: im.gps ? String(im.gps.lat) : '', lng: im.gps ? String(im.gps.lng) : '',
      place: im.place || '', visibility: im.visibility, clients: (im.clients || []).slice(),
      priceMode: im.price > 0 ? 'paid' : 'free', amount: im.price > 0 ? String(im.price) : ''
    };
  }
  function num(s) {
    const t = String(s == null ? '' : s).trim().replace(',', '.');
    return t !== '' && isFinite(Number(t)) ? Number(t) : null;
  }
  function numKey(s) { const n = num(s); return n === null ? String(s || '').trim() : String(n); }
  function fieldKey(v, k) {
    if (k === 'keywords') return v.keywords.join('\u0001');
    if (k === 'gps') return numKey(v.lat) + '|' + numKey(v.lng);
    if (k === 'clients') return v.visibility === 'restricted' ? v.clients.slice().sort().join(',') : '';
    if (k === 'price') return v.priceMode === 'paid' ? 'paid:' + numKey(v.amount) : 'free';
    return String(v[k] || '').trim();
  }
  function isChanged(k) {
    if (!ed) return false;
    const im = App.find.image(ed.imageId);
    return !!im && fieldKey(ed.v, k) !== fieldKey(valuesOf(im), k);
  }
  function changedKeys() { return FIELDS.map((f) => f[0]).filter(isChanged); }
  function dirtyCount() { return ed ? changedKeys().length : 0; }
  function dirtyText(n) { return n ? 'Unsaved changes (' + App.fmt.plural(n, 'field') + ')' : 'No changes yet'; }

  function realDateTime(s) {
    const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
    if (!m) return false;
    const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
    return d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] && +m[4] < 24 && +m[5] < 60;
  }
  function validate(v) {
    const e = {};
    const alt = v.altText.trim().length;
    if (alt > ALT_MAX) e.altText = 'Alt text can be at most ' + ALT_MAX + ' characters. Shorten it by ' + (alt - ALT_MAX) + '.';
    if (v.dateTaken) {
      if (!realDateTime(v.dateTaken)) e.dateTaken = 'Enter a real date and time, for example 14 Jan 2026, 16:52.';
      else if (v.dateTaken > App.nowISO()) e.dateTaken = 'The date taken cannot be in the future. Check the date.';
    }
    const lat = num(v.lat);
    const lng = num(v.lng);
    const latSet = v.lat.trim() !== '';
    const lngSet = v.lng.trim() !== '';
    if (latSet && lat === null) e.lat = 'Enter the latitude as a number, for example 60.3975.';
    else if (latSet && (lat < -90 || lat > 90)) e.lat = 'Latitude must be between -90 and 90.';
    if (lngSet && lng === null) e.lng = 'Enter the longitude as a number, for example 5.3242.';
    else if (lngSet && (lng < -180 || lng > 180)) e.lng = 'Longitude must be between -180 and 180.';
    if (latSet && !lngSet) e.lng = 'Enter the longitude too, or clear the latitude.';
    if (lngSet && !latSet) e.lat = 'Enter the latitude too, or clear the longitude.';
    if (v.priceMode === 'paid') {
      const n = num(v.amount);
      if (n === null || n <= 0 || !Number.isInteger(n)) e.amount = 'Enter a price above 0, in whole USD.';
    }
    return e;
  }

  function startEdit(id) {
    const im = App.find.image(id);
    const u = me();
    if (!im || !u || lockHolderOther(im) || im.processing === 'uploading') { renderPanel(); return; }
    im.lockedBy = { userId: u.id, since: App.nowISO() };
    App.save();
    ed = { imageId: id, v: valuesOf(im), errors: {}, kwError: '', lastField: null, saveError: '' };
    note = null;
    renderPanel('lib-title');
  }
  /* drop the edit session and release the lock (Cancel, Discard, leave) */
  function endEdit() {
    if (!ed) return;
    const im = App.find.image(ed.imageId);
    if (im && lockedByMe(im)) { im.lockedBy = null; App.save(); }
    ed = null;
    App.setUnloadWarning(false);
  }
  /* Save changes: validate, write to the store, release the lock. false keeps edit mode. */
  function commitEdit() {
    if (!ed) return true;
    const im = App.find.image(ed.imageId);
    if (!im) { ed = null; return true; }
    ed.errors = validate(ed.v);
    ed.saveError = '';
    const bad = Object.keys(ed.errors);
    if (bad.length) {
      renderPanel(ERROR_IDS[bad[0]]);
      return false;
    }
    if (!lockedByMe(im)) { /* FR-18: a save from a lost lock is refused, the values stay */
      ed.saveError = MSG_SAVE_FAILED;
      renderPanel('lib-save');
      return false;
    }
    const changed = changedKeys();
    if (changed.length) {
      const v = ed.v;
      const before = { vis: visLabel(im), price: im.price };
      im.title = v.title.trim();
      im.description = v.description.trim();
      im.altText = v.altText.trim();
      im.keywords = v.keywords.slice();
      im.dateTaken = v.dateTaken || null;
      im.gps = v.lat.trim() !== '' ? { lat: num(v.lat), lng: num(v.lng) } : null;
      im.place = v.place.trim();
      im.visibility = v.visibility;
      im.clients = v.visibility === 'restricted' ? v.clients.slice() : [];
      im.price = v.priceMode === 'paid' ? num(v.amount) : 0;
      im.editedBy = me().id;
      const title = App.imageTitle(im);
      const meta = changed.filter((k) => ['visibility', 'clients', 'price'].indexOf(k) === -1);
      if (meta.length) App.log('Edited metadata', title + ': ' + meta.map((k) => FIELDS.find((f) => f[0] === k)[1]).join(', '));
      if (changed.indexOf('visibility') !== -1 || changed.indexOf('clients') !== -1) App.log('Changed visibility', title + ': ' + before.vis + ' to ' + visLabel(im));
      if (changed.indexOf('price') !== -1) App.log('Changed a price', title + ': ' + priceLabel(before.price) + ' to ' + priceLabel(im.price));
      note = { imageId: im.id, text: 'Changes saved' };
    }
    im.lockedBy = null;
    App.save();
    ed = null;
    App.setUnloadWarning(false);
    return true;
  }
  function focusLastField() {
    if (!ed) return;
    const first = changedKeys()[0];
    const id = ed.lastField || (first && FIELDS.find((f) => f[0] === first)[2]) || 'lib-title';
    if (!focusId(id)) focusId('lib-title');
  }
  /* the Unsaved-changes dialog. Resolves true when the caller may go on. */
  function confirmLeave() {
    if (!ed) return Promise.resolve(true);
    if (!dirtyCount()) { endEdit(); return Promise.resolve(true); }
    const im = App.find.image(ed.imageId);
    return App.dialog({
      title: 'You have unsaved changes',
      className: 'unsaved-dlg',
      body: h`<p class="ds-paragraph">Your edits to <b>${App.imageTitle(im)}</b> are not saved yet. Save them before you go on, or discard them.</p>`,
      actions: [
        { label: 'Save changes', value: 'save', variant: 'primary' },
        { label: 'Discard', value: 'discard', variant: 'secondary' },
        { label: 'Keep editing', value: null, variant: 'tertiary' }
      ]
    }).then((r) => {
      if (r.action === 'save') {
        if (!commitEdit()) return false;
        App.status('Changes saved');
        return true;
      }
      if (r.action === 'discard') { endEdit(); App.status('Your edits were discarded.'); return true; }
      focusLastField();
      return false;
    });
  }
  /* before showing another image (or none): ask only when the edit is for a different image */
  function leaveFor(targetId) {
    if (!ed || ed.imageId === targetId) return Promise.resolve(true);
    return confirmLeave();
  }
  /* App.setLeaveGuard: staying on the same image (Library <-> Image page, filters, pages) keeps the edit */
  function guard(target) {
    if (!ed) return true;
    const path = String(target || '').replace(/^#/, '').split('?')[0].replace(/\/+$/, '');
    if (path === '/library/' + ed.imageId || path === '/image/' + ed.imageId) return true;
    return confirmLeave();
  }
  /* run at mount: an edit session for an image no longer shown (forced navigation, Reset data) ends */
  function syncEdit(imageId) {
    if (ed) {
      const im = App.find.image(ed.imageId);
      if (!im || ed.imageId !== imageId || (im.lockedBy && !lockedByMe(im))) {
        if (im && lockedByMe(im) && ed.imageId !== imageId) { im.lockedBy = null; App.save(); }
        ed = null;
      }
    }
    if (note && note.imageId !== imageId) note = null;
    App.setLeaveGuard(guard);
    App.setUnloadWarning(dirtyCount() > 0);
  }

  /* ======================================================================
     Details panel (also the body of the Image page)
     ====================================================================== */
  function errP(key, id) {
    const text = ed && ed.errors[key];
    return h`<p class="ds-validation-message" data-field="validation" id="${id}-err"${hidden(!text)}>${text || ''}</p>`;
  }
  function invalid(key, id, describedBy) {
    const bad = !!(ed && ed.errors[key]);
    const ids = [describedBy, bad ? id + '-err' : ''].filter(Boolean).join(' ');
    return raw((bad ? ' aria-invalid="true"' : '') + (ids ? ' aria-describedby="' + ids + '"' : ''));
  }
  const tracked = (k) => raw(' data-track="' + k + '"' + (isChanged(k) ? ' data-changed' : ''));
  const chg = (k) => h`<span class="chg"${hidden(!isChanged(k))}>Changed</span>`;
  const notSet = () => h`<span class="hint">Not set</span>`;
  function altCount(len) {
    return len > ALT_MAX ? len + ' of ' + ALT_MAX + ' characters, ' + (len - ALT_MAX) + ' too many' : len + ' of ' + ALT_MAX + ' characters';
  }
  function originText(im) {
    if (im.processing === 'uploading' || im.processing === 'queued' || im.processing === 'generating') return 'Not generated yet';
    const by = im.editedBy ? 'edited by ' + firstName(im.editedBy) : '';
    if (im.provider) return 'Generated' + (by ? ', ' + by : '');
    if (im.processing === 'failed') return 'Generation failed' + (by ? ', ' + by : '');
    return by ? 'Filled in by hand, ' + by : 'Filled in by hand';
  }
  function moreItems(im) {
    const items = [];
    if (im.status === 'published') items.push(['archive', 'Archive image', 'archive']);
    if (im.status === 'archived') items.push(['restore', 'Restore image', 'restore']);
    if (activeLicences(im.id).length) items.push(['revoke', 'Revoke licences', 'revoke licences']);
    return items;
  }

  function headHTML(im, o) {
    const editing = !!o.editing;
    const holder = lockHolderOther(im);
    const uploading = im.processing === 'uploading';
    const items = editing ? [] : moreItems(im);
    const editBtn = editing ? '' : h`<button class="ds-button" data-variant="secondary" data-size="sm" type="button" id="lib-edit-btn" data-edit-start${
      holder || uploading ? raw(' disabled aria-describedby="' + (holder ? 'lib-lock' : 'lib-upl') + '"') : ''}>${App.icon('edit')}Edit</button>`;
    const title = o.page ? h`<h1 id="lib-insp-title">${App.imageTitle(im)}</h1>` : h`<h2 id="lib-insp-title">${App.imageTitle(im)}</h2>`;
    return h`<div class="insp-head has-edit">
      <div>${title}<div class="file">${im.fileName}, uploaded by ${firstName(im.uploadedBy)} ${App.fmt.date(im.createdAt)}</div></div>
      <div class="actions">
        ${editBtn}
        ${o.page ? '' : h`<a class="ds-button" data-variant="tertiary" data-icon href="#/image/${im.id}" aria-label="Open full image page">${App.icon('open')}</a>`}
        ${items.length ? h`<div class="lib-more"><button class="ds-button" data-variant="tertiary" data-icon type="button" id="lib-more-btn" data-more-toggle aria-expanded="false" aria-controls="lib-more-menu" aria-label="More actions: ${items.map((i) => i[2]).join(', ')}">${App.icon('more')}</button><ul class="lib-more-menu" id="lib-more-menu" hidden>${
          items.map((i) => h`<li><button type="button" data-act="${i[0]}">${i[1]}</button></li>`)}</ul></div>` : ''}
      </div>
    </div>`;
  }
  function statusHTML(im) {
    const n = activeLicences(im.id).length;
    const saved = note && note.imageId === im.id ? note.text : '';
    return h`<div class="statusline">
      ${App.statusTag(im.status)}${im.processing !== 'ready' ? App.statusTag(im.processing) : ''}
      ${n ? h`<span>${App.fmt.plural(n, 'active licence')}</span>` : ''}
      <span class="saved" data-save-status>${saved ? h`${App.icon('check')}${saved}` : ''}</span>
    </div>`;
  }
  function alertsHTML(im) {
    const holder = lockHolderOther(im);
    const out = [];
    if (holder) out.push(h`<div class="ds-alert lib-alert" data-color="warning" data-size="sm" id="lib-lock"><p class="ds-paragraph">${msgLock(holder.name)}</p></div>`);
    if (im.processing === 'failed') {
      out.push(h`<div class="ds-alert lib-alert" data-color="danger" data-size="sm"><p class="ds-paragraph">${msgAi(im.error || 'the AI service did not answer')}</p>${
        im.batchId && App.find.batch(im.batchId) ? h`<p class="ds-paragraph"><a class="ds-link" href="#/upload/${im.batchId}">Open its batch in Upload</a></p>` : ''}</div>`);
    }
    if (im.processing === 'uploading') out.push(h`<p class="hint lib-note" id="lib-upl">The file is still uploading (${im.progress} %). You can edit it when the upload is done.</p>`);
    return out;
  }
  function loupeHTML(im) {
    if (im.processing === 'uploading') return h`<div class="loupe"><span class="skel"><span class="ds-skeleton" aria-hidden="true"></span><span class="progress">${im.progress} %</span></span></div>`;
    return h`<div class="loupe"><span class="ph ${App.loupeClass(im)} ${im.ph || ''}" role="img" aria-label="${App.altFor(im)}"></span></div>`;
  }

  function accessViewHTML(im) {
    const restrictedEmpty = im.visibility === 'restricted' && !(im.clients || []).length;
    const vt = VIS_TEXT[im.visibility];
    let clients;
    if (im.visibility === 'public') clients = 'All clients';
    else if (im.visibility === 'internal') clients = 'None';
    else clients = restrictedEmpty ? 'None listed yet' : App.clientNames(im.clients);
    return h`<section class="insp-sec" aria-labelledby="acc-h">
      <h3 id="acc-h">Who can see it</h3>
      <dl class="ro ro-cols">
        <div><dt>Visibility</dt><dd><span>${vt[0]}</span>${restrictedEmpty
          ? h`<span class="lib-warn">No clients yet, so it behaves as internal-only.</span>`
          : h`<span class="hint">${vt[1]}</span>`}</dd></div>
        <div><dt>Clients</dt><dd>${clients}</dd></div>
        <div><dt>Price</dt><dd><div class="price-line">${App.price(im.price)}<span>${im.price > 0 ? App.store.settings.licenceType.name.toLowerCase() + ', ex VAT' : 'no licence fee'}</span></div></dd></div>
      </dl>
    </section>`;
  }
  function metaViewHTML(im) {
    const val = (s) => (s ? s : notSet());
    return h`<section class="insp-sec" aria-labelledby="meta-h">
      <h3 id="meta-h">Metadata <small>${originText(im)}</small></h3>
      <dl class="ro">
        <div><dt>Title</dt><dd>${im.title ? im.title : h`<span class="hint">Untitled image</span>`}</dd></div>
        <div><dt>Description</dt><dd>${val(im.description)}</dd></div>
        <div><dt>Alt text</dt><dd>${val(im.altText)}</dd></div>
        <div><dt>Keywords</dt><dd>${(im.keywords || []).length
          ? h`<ul class="kw-ro" aria-label="Keywords">${im.keywords.map((k) => h`<li class="ds-tag" data-color="neutral" data-size="sm">${k}</li>`)}</ul>`
          : notSet()}</dd></div>
        <div><dt>Place</dt><dd>${val(im.place)}<span class="hint">Staff only. Clients never see the place.</span></dd></div>
        <div><dt>GPS position</dt><dd>${im.gps ? im.gps.lat + ', ' + im.gps.lng : notSet()}</dd></div>
      </dl>
    </section>`;
  }

  function accessEditHTML(im) {
    const v = ed.v;
    const nLic = activeLicences(im.id).length;
    const clientsAll = App.store.clients;
    const free = clientsAll.filter((c) => c.active && v.clients.indexOf(c.id) === -1);
    const radio = (name, id, value, label) =>
      h`<label class="ds-button" data-variant="tertiary"><input type="radio" name="${name}" id="${id}" value="${value}"${flag(v[name] === value, 'checked')}>${label}</label>`;
    let clientsRow;
    if (v.visibility === 'restricted') {
      clientsRow = h`<div class="chips cl-pick lib-cl-pick" role="group" aria-labelledby="cl-l">${
        v.clients.map((cid) => {
          const c = App.find.client(cid) || { name: cid };
          return h`<button class="ds-chip" type="button" data-removable="true" data-size="sm" id="lib-cl-${cid}" data-client-remove="${cid}" aria-label="Remove client ${c.name}">${c.name}</button>`;
        })}<button class="ds-button" type="button" data-variant="tertiary" data-size="sm" id="lib-add-client" data-client-add${flag(!free.length, 'disabled aria-describedby="lib-cl-all"')}>Add client</button></div>
        ${free.length ? '' : h`<p class="hint" id="lib-cl-all">Every active client is listed.</p>`}
        ${v.clients.length ? '' : h`<p class="lib-warn" id="lib-cl-warn">No clients yet, so the image behaves as internal-only until you add one.</p>`}`;
    } else {
      clientsRow = h`<p class="hint">${v.visibility === 'public'
        ? 'All clients. Choose Restricted to limit it to the clients you list.'
        : 'None. Choose Restricted to share it with the clients you list.'}</p>`;
    }
    return h`<section class="insp-sec" aria-labelledby="acc-e-h">
      <h3 id="acc-e-h">Who can see it</h3>
      <div class="access-key">
        <div class="row"${tracked('visibility')}>
          <span id="vis-l">Visibility ${chg('visibility')}</span>
          <fieldset class="ds-toggle-group" aria-labelledby="vis-l" data-size="sm">
            ${radio('visibility', 'lib-vis-internal', 'internal', 'Internal')}${radio('visibility', 'lib-vis-restricted', 'restricted', 'Restricted')}${radio('visibility', 'lib-vis-public', 'public', 'Public')}
          </fieldset>
          <p class="hint">${v.visibility === 'restricted' ? 'Only the clients you list can see it.' : VIS_TEXT[v.visibility][1]}${nLic ? ' Clients who hold a licence keep it whatever you choose.' : ''}</p>
        </div>
        <div class="row clients-row"${tracked('clients')}>
          <span id="cl-l">Clients ${chg('clients')}</span>
          ${clientsRow}
        </div>
        <div class="row"${tracked('price')}>
          <span id="price-l">Price ${chg('price')}</span>
          <fieldset class="ds-toggle-group" aria-labelledby="price-l" data-size="sm">
            ${h`<label class="ds-button" data-variant="tertiary"><input type="radio" name="priceMode" id="lib-price-free" value="free"${flag(v.priceMode === 'free', 'checked')}>Free</label>`}${
              h`<label class="ds-button" data-variant="tertiary"><input type="radio" name="priceMode" id="lib-price-paid" value="paid"${flag(v.priceMode === 'paid', 'checked')}>Paid</label>`}
          </fieldset>
          ${v.priceMode === 'paid' ? h`<ds-field class="ds-field price-amt lib-amt" data-size="sm"><label class="ds-label" data-weight="regular" for="lib-amt">Price per licence, ex VAT</label><div class="ds-field-affixes"><input class="ds-input" id="lib-amt" name="amount" type="number" min="1" step="1" inputmode="numeric" value="${v.amount}"${invalid('amount', 'lib-amt')}><span class="ds-field-affix">USD</span></div>${errP('amount', 'lib-amt')}</ds-field>` : ''}
          ${nLic ? h`<p class="hint">Changing the price does not affect the ${App.fmt.plural(nLic, 'licence')} already sold.</p>` : ''}
        </div>
      </div>
    </section>`;
  }
  function metaEditHTML(im) {
    const v = ed.v;
    const altLen = v.altText.trim().length;
    return h`<section class="insp-sec" aria-labelledby="meta-e-h">
      <h3 id="meta-e-h">Metadata <small>${originText(im)}</small></h3>
      <div class="stack" data-size="sm">
        <ds-field class="ds-field"${tracked('title')}><label class="ds-label" for="lib-title">Title ${chg('title')}</label><input class="ds-input" id="lib-title" name="title" value="${v.title}" autocomplete="off"></ds-field>
        <ds-field class="ds-field"${tracked('description')}><label class="ds-label" for="lib-desc">Description ${chg('description')}</label><textarea class="ds-input" id="lib-desc" name="description" rows="3">${v.description}</textarea></ds-field>
        <ds-field class="ds-field"${tracked('altText')}><label class="ds-label" for="lib-alt">Alt text ${chg('altText')}</label><textarea class="ds-input" id="lib-alt" name="altText" rows="2"${invalid('altText', 'lib-alt', 'lib-alt-d')}>${v.altText}</textarea><div data-field="description" id="lib-alt-d" class="lib-count${altLen > ALT_MAX ? ' is-over' : ''}">${altCount(altLen)}</div>${errP('altText', 'lib-alt')}</ds-field>
        <div${tracked('keywords')}>
          <div class="ds-label lib-kw-label" id="lib-kw-l">Keywords ${chg('keywords')}</div>
          <div class="chips" role="group" aria-labelledby="lib-kw-l">${v.keywords.map((k, i) =>
            h`<button class="ds-chip" type="button" data-removable="true" data-size="sm" id="lib-kw-${i}" data-kw-remove="${i}" aria-label="Remove keyword ${k}">${k}</button>`)}</div>
          <div class="lib-kw-add">
            <input class="ds-input" id="lib-kw" type="text" autocomplete="off" aria-label="New keyword" placeholder="New keyword"${ed.kwError ? raw(' aria-invalid="true" aria-describedby="lib-kw-err"') : ''}>
            <button class="ds-button" type="button" data-variant="tertiary" data-size="sm" id="lib-kw-add" data-kw-add>Add keyword</button>
          </div>
          <p class="ds-validation-message" data-field="validation" id="lib-kw-err"${hidden(!ed.kwError)}>${ed.kwError}</p>
        </div>
        <ds-field class="ds-field"${tracked('dateTaken')}><label class="ds-label" for="lib-date">Date taken ${chg('dateTaken')}</label><input class="ds-input lib-date" id="lib-date" name="dateTaken" type="datetime-local" value="${v.dateTaken}"${invalid('dateTaken', 'lib-date')}>${errP('dateTaken', 'lib-date')}</ds-field>
        <fieldset class="ds-fieldset lib-gps"${tracked('gps')} aria-describedby="lib-gps-d">
          <legend class="ds-label">GPS position ${chg('gps')}</legend>
          <div class="lib-gps-row">
            <ds-field class="ds-field"><label class="ds-label" data-weight="regular" for="lib-lat">Latitude</label><input class="ds-input" id="lib-lat" name="lat" type="text" inputmode="decimal" autocomplete="off" value="${v.lat}"${invalid('lat', 'lib-lat')}>${errP('lat', 'lib-lat')}</ds-field>
            <ds-field class="ds-field"><label class="ds-label" data-weight="regular" for="lib-lng">Longitude</label><input class="ds-input" id="lib-lng" name="lng" type="text" inputmode="decimal" autocomplete="off" value="${v.lng}"${invalid('lng', 'lib-lng')}>${errP('lng', 'lib-lng')}</ds-field>
          </div>
          <p class="hint" id="lib-gps-d">Staff only. Clients never see the GPS position.</p>
        </fieldset>
        <ds-field class="ds-field"${tracked('place')}><label class="ds-label" for="lib-place">Place ${chg('place')}</label><input class="ds-input" id="lib-place" name="place" value="${v.place}" autocomplete="off" aria-describedby="lib-place-d"><div data-field="description" id="lib-place-d">Staff only. Clients never see the place.</div></ds-field>
      </div>
    </section>`;
  }

  function moreDetailsHTML(im, editing) {
    const lic = App.licences.forImage(im.id);
    const p = App.store.settings.aiProvider;
    const facts = [];
    if (!editing && im.dateTaken) facts.push(['Date taken', App.fmt.dateTime(im.dateTaken)]);
    if (im.camera) facts.push(['Camera', im.camera]);
    if (im.lens) facts.push(['Lens', im.lens]);
    if (im.exposure) facts.push(['Exposure', App.fmt.exposure(im)]);
    if (im.size) facts.push(['Size', App.fmt.pixels(im)]);
    if (im.size) facts.push(['File', im.size.format + ', ' + App.fmt.bytes(im.size.bytes)]);
    return h`<section class="insp-sec" aria-label="More details">
      <details class="ds-details" data-size="sm" id="lib-d-camera">
        <summary>Camera</summary>
        <div>${facts.length ? h`<dl class="facts">${facts.map((f) => h`<dt>${f[0]}</dt><dd>${f[1]}</dd>`)}</dl>` : h`<p class="hint">No camera data in the file.</p>`}</div>
      </details>
      <details class="ds-details" data-size="sm" id="lib-d-lic">
        <summary>Licences (${lic.length})</summary>
        <div>${lic.length ? h`<dl class="facts lib-lic">${lic.map((l) => {
          const c = App.find.client(l.clientId);
          return h`<dt>${c ? c.name : 'Unknown client'}</dt><dd>${App.price(l.price)}, ${App.fmt.date(l.date)}${
            l.revoked ? h` <span class="lib-revoked">${App.statusTag('revoked')} ${App.fmt.date(l.revoked.date)}: ${l.revoked.reason}${l.revoked.credit ? ' Flagged for a possible credit.' : ''}</span>` : ''}</dd>`;
        })}</dl>` : h`<p class="hint">No licences yet.</p>`}</div>
      </details>
      <details class="ds-details" data-size="sm" id="lib-d-ai">
        <summary>How the metadata was made</summary>
        <div>${im.provider
          ? h`<dl class="facts"><dt>Provider</dt><dd>${im.provider.name}</dd><dt>Prompt</dt><dd>Version ${String(im.provider.promptVersion).replace(/^v/, '')}</dd><dt>Generated</dt><dd>${App.fmt.dateTime(im.provider.generatedAt)}</dd><dt>Place names</dt><dd>${p.placeNames ? 'On' : 'Off'}</dd></dl>`
          : h`<p class="hint">${im.processing === 'ready' || im.processing === 'failed' ? 'Not generated by AI. The fields were filled in by hand.' : 'Not generated yet.'}</p>`}</div>
      </details>
    </section>`;
  }

  function viewFootHTML(im) {
    if (im.processing === 'uploading') return '';
    const staffCopy = (variant) => h`<button class="ds-button" data-variant="${variant}" type="button" id="lib-copy" data-act="staff-copy">${App.icon('download')}Staff copy</button>`;
    if (im.status !== 'draft') return h`<div class="insp-foot">${staffCopy('primary')}</div>`;
    const busy = im.processing === 'queued' || im.processing === 'generating';
    return h`<div class="insp-foot">
      <button class="ds-button" data-variant="primary" type="button" id="lib-publish" data-act="publish"${busy ? raw(' disabled aria-describedby="lib-pub-note"') : ''}>Publish image</button>
      ${staffCopy('secondary')}
      ${busy ? h`<p class="note" id="lib-pub-note">Wait until the metadata has been generated. Then you can publish it.</p>` : ''}
    </div>`;
  }
  function editFootHTML() {
    const n = dirtyCount();
    return h`<div class="insp-foot">
      <button class="ds-button" data-variant="primary" type="submit" form="lib-edit" id="lib-save">Save changes</button>
      <button class="ds-button" data-variant="secondary" type="button" id="lib-cancel" data-edit-cancel>Cancel</button>
      <p class="dirty" role="status" data-dirty-status data-state="${n ? 'dirty' : 'clean'}">${dirtyText(n)}</p>
      ${ed.saveError ? h`<p class="ds-validation-message" data-field="validation" role="alert">${ed.saveError}</p>` : ''}
    </div>`;
  }

  function panelHTML(im, o) {
    o = o || {};
    const editing = !!(ed && ed.imageId === im.id);
    return h`<div class="panel-body${o.page ? ' lib-page-panel' : ''}" data-lib-panel data-id="${im.id}" data-mode="${editing ? 'edit' : 'view'}"${o.page ? raw(' data-page') : ''}>
      ${headHTML(im, { editing, page: o.page })}
      ${o.page ? '' : loupeHTML(im)}
      ${statusHTML(im)}
      ${alertsHTML(im)}
      ${editing
        ? h`<form id="lib-edit" aria-label="Edit image details" novalidate>${accessEditHTML(im)}${metaEditHTML(im)}</form>`
        : h`${accessViewHTML(im)}${metaViewHTML(im)}`}
      ${moreDetailsHTML(im, editing)}
      <div class="insp-pad"></div>
      ${editing ? editFootHTML() : viewFootHTML(im)}
    </div>`;
  }
  function detailsHTML(params) {
    const im = params.imageId && App.find.image(params.imageId);
    if (!im) return h`<div class="panel-body lib-none"><p class="hint">Select an image to see its details.</p></div>`;
    return panelHTML(im);
  }
  /* re-render the panel in place (keeps its placement, open <details> and focus) */
  function renderPanel(focus) {
    const host = document.querySelector('[data-lib-panel]');
    if (!host) return;
    const im = App.find.image(host.getAttribute('data-id'));
    if (!im) return;
    const open = Array.prototype.map.call(host.querySelectorAll('details[open]'), (d) => d.id);
    const active = document.activeElement;
    const keep = focus || (active && host.contains(active) ? active.id : null);
    host.outerHTML = String(panelHTML(im, { page: host.hasAttribute('data-page') }));
    open.forEach((id) => { const d = document.getElementById(id); if (d) d.open = true; });
    if (keep && !focusId(keep) && ed) focusId('lib-title');
    App.setUnloadWarning(dirtyCount() > 0);
  }
  /* the panel was rendered in edit mode for an edit that syncEdit has just ended */
  function refreshStaleMode() {
    const host = document.querySelector('[data-lib-panel]');
    if (host && host.getAttribute('data-mode') === 'edit' && !(ed && ed.imageId === host.getAttribute('data-id'))) renderPanel();
  }
  /* live update while typing: markers, unsaved count, alt counter, errors that are now fixed */
  function updateDirtyUI() {
    if (!ed) return;
    FIELDS.forEach((f) => {
      const w = document.querySelector('[data-lib-panel] [data-track="' + f[0] + '"]');
      if (!w) return;
      const c = isChanged(f[0]);
      if (c) w.setAttribute('data-changed', ''); else w.removeAttribute('data-changed');
      const mark = w.querySelector('.chg');
      if (mark) mark.hidden = !c;
    });
    const n = dirtyCount();
    const st = document.querySelector('[data-dirty-status]');
    if (st && st.textContent !== dirtyText(n)) { st.textContent = dirtyText(n); st.setAttribute('data-state', n ? 'dirty' : 'clean'); }
    const cnt = document.getElementById('lib-alt-d');
    if (cnt) {
      const len = ed.v.altText.trim().length;
      cnt.textContent = altCount(len);
      cnt.classList.toggle('is-over', len > ALT_MAX);
    }
    App.setUnloadWarning(n > 0);
  }
  function revalidate() {
    const now = validate(ed.v);
    Object.keys(ed.errors).forEach((k) => {
      const id = ERROR_IDS[k];
      const input = document.getElementById(id);
      const msg = document.getElementById(id + '-err');
      if (!input || !msg) return;
      if (now[k]) { ed.errors[k] = now[k]; msg.textContent = now[k]; return; }
      delete ed.errors[k];
      msg.hidden = true;
      msg.textContent = '';
      input.removeAttribute('aria-invalid');
      const rest = (input.getAttribute('aria-describedby') || '').split(' ').filter((x) => x && x !== id + '-err').join(' ');
      if (rest) input.setAttribute('aria-describedby', rest); else input.removeAttribute('aria-describedby');
    });
  }

  /* ======================================================================
     Actions: publish, archive, restore, revoke, staff copy
     ====================================================================== */
  function afterAction(im, text, focus) {
    note = { imageId: im.id, text };
    App.save();
    App.refresh();
    App.status(text);
    if (!focusId(focus)) focusId('lib-edit-btn');
  }
  function publish(im) {
    if (im.status !== 'draft') return; /* publishing again changes nothing */
    if (['uploading', 'queued', 'generating'].indexOf(im.processing) !== -1) return;
    const missing = [['title', 'title'], ['description', 'description'], ['altText', 'alt text']]
      .filter((m) => !String(im[m[0]] || '').trim()).map((m) => m[1]);
    if (!(im.keywords || []).length) missing.push('keywords');
    const s4 = im.visibility === 'restricted' && !(im.clients || []).length;
    const done = () => {
      im.status = 'published';
      App.log('Published an image', App.imageTitle(im));
      afterAction(im, 'Published', 'lib-copy');
    };
    if (!missing.length && !s4) { done(); return; }
    App.confirm({
      title: missing.length ? 'Publish with missing metadata?' : 'Publish without clients?',
      body: h`${missing.length ? h`<p class="ds-paragraph"><b>${App.imageTitle(im)}</b> has no ${missing.join(', ').replace(/, ([^,]*)$/, ' or $1')}. It will be harder to find${
        missing.indexOf('alt text') !== -1 ? ' and less accessible' : ''}.</p>` : ''}${
        s4 ? h`<p class="ds-paragraph">It is restricted but lists no clients, so it behaves as internal-only until you add one.</p>` : ''}`,
      confirm: 'Publish image'
    }).then((ok) => { if (ok) done(); });
  }
  function archive(im) {
    const n = activeLicences(im.id).length;
    App.confirm({
      title: 'Archive this image?',
      body: h`<p class="ds-paragraph"><b>${App.imageTitle(im)}</b> leaves the client portal. ${n === 1
        ? 'The client with a licence keeps it and can still download it.'
        : n ? n + ' clients with a licence keep it and can still download it.' : 'No client holds a licence to it.'} You can restore it later.</p>`,
      confirm: 'Archive image'
    }).then((ok) => {
      if (!ok) return;
      im.status = 'archived';
      App.log('Archived an image', App.imageTitle(im));
      afterAction(im, 'Archived', 'lib-more-btn');
    });
  }
  function restore(im) {
    im.status = 'published';
    App.log('Restored an image', App.imageTitle(im));
    afterAction(im, 'Restored and published again', 'lib-more-btn');
  }
  function revoke(im) {
    const lic = activeLicences(im.id);
    if (!lic.length) return;
    const body = h`<p class="ds-paragraph">Choose the licences to revoke for <b>${App.imageTitle(im)}</b>. Each stays on record as revoked with your reason${
      lic.some((l) => l.price > 0) ? ', and paid ones are flagged for a possible credit' : ''}.</p>
      <fieldset class="ds-fieldset lib-revoke-list"><legend class="ds-label">Licences</legend>${lic.map((l) => {
        const c = App.find.client(l.clientId);
        return h`<ds-field class="ds-field" data-size="sm"><input class="ds-input" type="checkbox" name="lic-${l.id}" id="rv-${l.id}" checked><label class="ds-label" data-weight="regular" for="rv-${l.id}">${c ? c.name : 'Unknown client'}, ${priceLabel(l.price)}, ${App.fmt.date(l.date)}</label></ds-field>`;
      })}</fieldset>
      <p class="hint">${im.visibility === 'public'
        ? 'The image stays public, so these clients can still find it under the normal rules.'
        : 'Each client is also removed from the image’s client list.'}</p>
      <ds-field class="ds-field"><label class="ds-label" for="rv-reason">Reason</label><textarea class="ds-input" id="rv-reason" name="reason" rows="3" aria-describedby="rv-hint"></textarea><div data-field="description" id="rv-hint">Revoke stays off until you give a reason.</div></ds-field>`;
    App.dialog({
      title: 'Revoke licences?',
      body,
      initialFocus: '#rv-reason',
      actions: [{ label: 'Revoke licences', value: 'revoke', variant: 'primary', color: 'danger' }, { label: 'Go back', value: null, variant: 'secondary' }],
      onOpen(dlg) {
        const btn = dlg.querySelector('button[value="revoke"]');
        const sync = () => {
          const reason = dlg.querySelector('#rv-reason').value.trim();
          const any = dlg.querySelector('.lib-revoke-list input:checked');
          btn.disabled = !reason || !any;
        };
        dlg.addEventListener('input', sync);
        dlg.addEventListener('change', sync);
        sync();
      },
      beforeClose(action, values) {
        if (!String(values.reason || '').trim()) return 'Give a reason for revoking.';
        if (!lic.some((l) => values['lic-' + l.id])) return 'Choose at least one licence to revoke.';
        return '';
      }
    }).then((r) => {
      if (r.action !== 'revoke') return;
      const chosen = lic.filter((l) => r.values['lic-' + l.id]);
      chosen.forEach((l) => App.licences.revoke(l.id, r.values.reason));
      afterAction(im, App.fmt.plural(chosen.length, 'licence') + ' revoked', 'lib-edit-btn');
    });
  }
  function staffCopy(im) {
    App.log('Downloaded a staff copy', App.imageTitle(im));
    App.status('Downloading the staff copy of ' + App.imageTitle(im) + ', with all metadata including location data.');
  }
  function closeMore(returnFocus) {
    const menu = document.getElementById('lib-more-menu');
    const btn = document.getElementById('lib-more-btn');
    if (!menu || menu.hidden) return false;
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (returnFocus) btn.focus();
    return true;
  }

  /* ======================================================================
     Events shared by the Details panel and the Image page
     ====================================================================== */
  function panelImage() {
    const host = document.querySelector('[data-lib-panel]');
    return host ? App.find.image(host.getAttribute('data-id')) : null;
  }
  function addKeyword() {
    const input = document.getElementById('lib-kw');
    if (!ed || !input) return;
    const k = input.value.trim();
    ed.kwError = '';
    if (!k) { ed.kwError = 'Type a keyword first.'; renderPanel('lib-kw'); return; }
    if (ed.v.keywords.some((x) => x.toLowerCase() === k.toLowerCase())) {
      ed.kwError = '“' + k + '” is already a keyword.';
      renderPanel('lib-kw');
      document.getElementById('lib-kw').value = k;
      return;
    }
    ed.v.keywords.push(k);
    ed.lastField = 'lib-kw';
    renderPanel('lib-kw');
  }
  function addClient() {
    if (!ed) return;
    const free = App.store.clients.filter((c) => c.active && ed.v.clients.indexOf(c.id) === -1);
    if (!free.length) return;
    App.dialog({
      title: 'Add a client',
      body: h`<ds-field class="ds-field"><label class="ds-label" for="add-cl">Client</label><select class="ds-input" id="add-cl" name="client"><option value="">Choose a client</option>${
        free.map((c) => h`<option value="${c.id}">${c.name}</option>`)}</select></ds-field>`,
      actions: [{ label: 'Add client', value: 'add', variant: 'primary' }, { label: 'Go back', value: null, variant: 'secondary' }],
      beforeClose: (action, values) => (values.client ? '' : 'Choose a client first.')
    }).then((r) => {
      if (!ed) return;
      if (r.action === 'add' && r.values.client && ed.v.clients.indexOf(r.values.client) === -1) {
        ed.v.clients.push(r.values.client);
        ed.lastField = 'lib-add-client';
      }
      renderPanel('lib-add-client');
    });
  }

  function bindPanel() {
    App.on('click', '[data-edit-start]', (e, el) => { if (!el.disabled) { const im = panelImage(); if (im) startEdit(im.id); } });
    App.on('click', '[data-edit-cancel]', () => { endEdit(); renderPanel('lib-edit-btn'); App.status('Edit cancelled. Nothing was changed.'); });
    App.on('submit', '#lib-edit', (e) => {
      e.preventDefault();
      const had = dirtyCount();
      if (!commitEdit()) return;
      if (had) { App.refresh(); App.status('Changes saved'); } else renderPanel();
      focusId('lib-edit-btn');
    });
    App.on('input', '#lib-edit', (e) => {
      const t = e.target;
      if (!ed || !t.name || INPUT_NAMES.indexOf(t.name) === -1) return;
      ed.v[t.name] = t.value;
      ed.lastField = t.id;
      if (ed.saveError) ed.saveError = '';
      revalidate();
      updateDirtyUI();
    });
    App.on('change', '#lib-edit', (e) => {
      const t = e.target;
      if (!ed || t.type !== 'radio') return;
      ed.v[t.name] = t.value;
      ed.lastField = t.id;
      if (t.name === 'priceMode' && t.value === 'paid' && !ed.v.amount) {
        const im = App.find.image(ed.imageId);
        ed.v.amount = String(im && im.price > 0 ? im.price : App.store.settings.licenceType.price);
      }
      if (t.name === 'priceMode' && t.value === 'free') delete ed.errors.amount;
      renderPanel(t.id);
    });
    App.on('click', '[data-kw-remove]', (e, el) => {
      if (!ed) return;
      const i = +el.getAttribute('data-kw-remove');
      ed.v.keywords.splice(i, 1);
      ed.lastField = 'lib-kw';
      renderPanel(ed.v.keywords.length ? 'lib-kw-' + Math.min(i, ed.v.keywords.length - 1) : 'lib-kw');
    });
    App.on('click', '[data-kw-add]', () => addKeyword());
    App.on('keydown', '#lib-kw', (e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } });
    App.on('click', '[data-client-add]', (e, el) => { if (!el.disabled) addClient(); });
    App.on('click', '[data-client-remove]', (e, el) => {
      if (!ed) return;
      const id = el.getAttribute('data-client-remove');
      const i = ed.v.clients.indexOf(id);
      if (i !== -1) ed.v.clients.splice(i, 1);
      ed.lastField = 'lib-add-client';
      const next = ed.v.clients[Math.min(i, ed.v.clients.length - 1)];
      renderPanel(next ? 'lib-cl-' + next : 'lib-add-client');
    });
    App.on('click', '[data-more-toggle]', (e, btn) => {
      const menu = document.getElementById('lib-more-menu');
      if (!menu) return;
      if (!menu.hidden) { closeMore(true); return; }
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      const first = menu.querySelector('button');
      if (first) first.focus();
    });
    App.on('click', null, (e) => { if (!(e.target.closest && e.target.closest('.lib-more'))) closeMore(false); });
    App.on('keydown', '.lib-more', (e) => { if (e.key === 'Escape' && closeMore(true)) { e.preventDefault(); e.stopPropagation(); } });
    App.on('focusout', '.lib-more', (e) => {
      const box = e.target.closest('.lib-more');
      if (e.relatedTarget && box && !box.contains(e.relatedTarget)) closeMore(false);
    });
    App.on('click', '[data-act]', (e, el) => {
      const im = panelImage();
      if (!im || el.disabled) return;
      const act = el.getAttribute('data-act');
      closeMore(false);
      if (act === 'publish') publish(im);
      else if (act === 'archive') archive(im);
      else if (act === 'restore') restore(im);
      else if (act === 'revoke') revoke(im);
      else if (act === 'staff-copy') staffCopy(im);
    });
  }

  /* ======================================================================
     Library: tile selection, filters, close details
     ====================================================================== */
  function selectImage(params, id) {
    leaveFor(id).then((ok) => {
      if (!ok) return;
      softGo(App.href('/library/' + id, params.query), true);
      const t = tileFor(id);
      if (t) t.focus();
    });
  }
  function closeDetails() {
    const c = App.current();
    if (!c) return;
    const id = c.params.imageId;
    leaveFor(null).then((ok) => {
      if (!ok) return;
      softGo(App.href('/library', c.params.query), true);
      const t = tileFor(id);
      if (t) t.focus(); else focusId('lib-h');
    });
  }
  function filterGo(params, changes, focus) {
    softGo(hrefWith(params, changes));
    const cnt = document.getElementById('lib-count');
    if (cnt) App.status(cnt.textContent);
    if (focus) focusId(focus);
  }

  function bindLibrary(params) {
    App.on('click', '#main .wall [data-pick]', (e, el) => {
      const id = el.getAttribute('data-id');
      const cur = params.imageId;
      if (id === cur) { if (App.details.isInline()) closeDetails(); return; }
      selectImage(params, id);
    });
    App.on('change', '[data-filter]', (e, el) => {
      const group = el.getAttribute('data-filter');
      const f = readFilters(params.query);
      let changes;
      if (el.type === 'checkbox') {
        const set = f[group].filter((x) => x !== el.value);
        if (el.checked) set.push(el.value);
        changes = { [group]: set };
      } else {
        changes = { [group]: el.value };
      }
      if (group === 'sort' && el.value === 'newest') changes.sort = '';
      filterGo(params, changes, el.id);
    });
    App.on('click', 'a[data-soft]', (e, a) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault();
      softGo(a.getAttribute('href'));
      focusId(a.id);
    });
    App.on('click', '[data-remove-filter]', (e, el) => {
      const key = el.getAttribute('data-remove-filter');
      const value = el.getAttribute('data-value');
      const f = readFilters(params.query);
      const changes = {};
      if (Array.isArray(f[key])) changes[key] = f[key].filter((x) => x !== value); else changes[key] = '';
      const i = +String(el.id).replace('lib-chip-', '');
      filterGo(params, changes);
      if (!focusId('lib-chip-' + i) && !focusId('lib-chip-' + (i - 1))) focusId('lib-sort');
    });
    App.on('click', '[data-clear-filters]', () => {
      const f = readFilters(params.query);
      softGo(App.href(libPath(params), { sort: f.sort === 'newest' ? '' : f.sort }));
      App.status(document.getElementById('lib-count') ? document.getElementById('lib-count').textContent : '');
      focusId('lib-h');
    });
  }

  /* ======================================================================
     Image page
     ====================================================================== */
  function imagePageHTML(params) {
    const im = App.find.image(params.id);
    const stage = im.processing === 'uploading'
      ? h`<span class="skel"><span class="ds-skeleton" aria-hidden="true"></span><span class="progress">${im.progress} %</span></span>`
      : h`<span class="ph ${im.ph || ''}" role="img" aria-label="${App.altFor(im)}"></span>`;
    return h`<div class="lib-page">
      <p class="lib-back"><a class="ds-link" href="#/library/${im.id}">Back to Library</a></p>
      <div class="lib-page-grid">
        <div class="lib-stage"><div class="lib-stage-img" style="--r:${App.ratio(im).toFixed(3)}">${stage}</div></div>
        <section class="lib-page-card" aria-label="Image details">${panelHTML(im, { page: true })}</section>
      </div>
    </div>`;
  }

  /* ======================================================================
     Registration
     ====================================================================== */
  const libraryDef = {
    role: 'staff',
    title: 'Library',
    nav: 'library',
    sidebar: sidebarHTML,
    sidebarLabel: 'Filters',
    sidebarToggleLabel: 'Show or hide filters',
    render: libraryHTML,
    details: detailsHTML,
    detailsLabel: 'Selected image',
    onCloseDetails() { closeDetails(); },
    mount(root, params) {
      syncEdit(params.imageId || null);
      refreshStaleMode();
      App.details.place(tileFor(params.imageId));
      bindPanel();
      bindLibrary(params);
    }
  };
  App.registerScreen('/library', libraryDef);
  App.registerScreen('/library/:imageId', libraryDef);

  App.registerScreen('/image/:id', {
    role: 'staff',
    title: (params) => App.imageTitle(App.find.image(params.id)),
    nav: 'library',
    render: imagePageHTML,
    mount(root, params) {
      syncEdit(params.id);
      refreshStaleMode();
      bindPanel();
    }
  });
})(window.App);
