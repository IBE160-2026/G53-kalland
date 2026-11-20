/* Owner: Staff Clients, Licences, Settings and Action log (#/clients, #/clients/new, #/clients/:id,
   #/licences, #/settings, #/log). Screen JS for this area; registers screens with App.registerScreen
   (contract: the header comment of app.js). Spines: EXPERIENCE.md (Clients, Licences (staff),
   Settings, Action log; UJ-4) and DESIGN.md (Data table, Confirm dialog, Empty state).
   PRD: FR-1, FR-2, FR-3, FR-4, FR-7, FR-25, FR-39, FR-40, FR-41, FR-42a, FR-42b. */
(function (App) {
  'use strict';

  const h = App.h;
  const LIC_PER_PAGE = 20;
  const LOG_PER_PAGE = 25;
  const HISTORY_ROWS = 5;
  const STRIP_MAX = 12;
  const LINK_DAYS = 7;
  const MIN_PASSWORD = 12;

  /* Per-page UI state that does not belong in the store. */
  const ui = {
    filter: { q: '', active: true, inactive: false }, /* client list in the sidebar */
    editing: null,      /* client id whose details are in edit mode */
    dirty: false,       /* the client form has unsaved input */
    link: null,         /* { kind: 'contact'|'user', id } whose new setup link is shown */
    msg: {}             /* one-shot save messages per Settings section */
  };
  let copiedTimer = null;

  /* ====================================================================
     Small helpers
     ==================================================================== */
  const lower = (s) => String(s || '').trim().toLowerCase();
  const firstNameOf = (name) => String(name || '').trim().split(/\s+/)[0] || '';
  const byName = (a, b) => a.name.localeCompare(b.name, 'en');
  const sentence = (s) => { s = String(s || '').trim(); return /[.!?]$/.test(s) ? s : s + '.'; };
  const priceLabel = (n) => (n > 0 ? n + ' USD' : 'Free (0 USD)');
  function pad(n) { return String(n).padStart(2, '0'); }
  function isoDateTime(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function token() {
    const part = () => Math.random().toString(36).slice(2, 6).padEnd(4, 'x');
    return part() + '-' + part() + '-' + part();
  }

  /* Org number: 9 digits and the mod-11 check (FR-1). Empty is allowed: the field is optional. */
  function orgNoError(value) {
    const s = String(value || '').replace(/\s+/g, '');
    if (!s) return '';
    if (!/^\d{9}$/.test(s)) return 'An org number has 9 digits.';
    const w = [3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 8; i++) sum += Number(s[i]) * w[i];
    let check = 11 - (sum % 11);
    if (check === 11) check = 0;
    if (check === 10 || check !== Number(s[8])) return 'This org number is not valid. Check the digits.';
    return '';
  }
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  /* An email is unique across all users and contacts, and is the login (FR-2, FR-3). */
  function emailError(value, self, required) {
    const e = lower(value);
    if (!e) return required ? 'Enter an email address.' : '';
    if (!EMAIL_RE.test(e)) return 'Enter a valid email address, for example name@example.com.';
    const taken = App.store.users.some((u) => u !== self && lower(u.email) === e) ||
      App.store.contacts.some((c) => c !== self && lower(c.email) === e);
    return taken ? 'This email is already in use. Each person needs their own email.' : '';
  }
  function phoneError(value) {
    const s = String(value || '').trim();
    if (!s) return '';
    return /^\+?[\d\s()-]{5,20}$/.test(s) ? '' : 'Enter a phone number with digits only, for example +47 912 34 567.';
  }

  /* One labelled field: label, optional description, control, inline validation message. */
  function field(o) {
    const descId = o.desc ? o.id + '-d' : null;
    const errId = o.id + '-err';
    const describedBy = [descId, errId].filter(Boolean).join(' ');
    const extra = App.raw(o.attrs || '');
    let control;
    if (o.type === 'textarea') {
      control = h`<textarea class="ds-input" id="${o.id}" name="${o.name}" rows="${o.rows || 3}" aria-describedby="${describedBy}" ${extra}>${o.value || ''}</textarea>`;
    } else if (o.type === 'select') {
      control = h`<select class="ds-input" id="${o.id}" name="${o.name}" aria-describedby="${describedBy}" ${extra}>${
        o.options.map((op) => h`<option value="${op.value}"${op.value === o.value ? App.raw(' selected') : ''}>${op.label}</option>`)
      }</select>`;
    } else {
      control = h`<input class="ds-input" id="${o.id}" name="${o.name}" type="${o.type || 'text'}" value="${o.value == null ? '' : o.value}" aria-describedby="${describedBy}" ${extra}>`;
    }
    return h`<ds-field class="ds-field${o.cls ? ' ' + o.cls : ''}"${o.hidden ? App.raw(' hidden') : ''}><label class="ds-label" for="${o.id}">${o.label}</label>${
      o.desc ? h`<p class="ds-paragraph" data-field="description" id="${descId}">${o.desc}</p>` : ''
    }${control}<p class="ds-validation-message" data-field="validation" id="${errId}" hidden></p></ds-field>`;
  }
  /* Show or clear the inline error of a field made by field(). Returns true when there is an error. */
  function setError(scope, id, text) {
    const input = scope.querySelector('#' + id);
    const err = scope.querySelector('#' + id + '-err');
    if (err) { err.textContent = text || ''; err.hidden = !text; }
    if (input) { if (text) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
    return !!text;
  }
  function focusFirstError(scope) {
    const el = scope.querySelector('[aria-invalid="true"]');
    if (el) el.focus();
  }
  function focusId(id) {
    window.setTimeout(() => { const el = document.getElementById(id); if (el) el.focus(); }, 0);
  }
  /* Replace the current query without a history entry, re-render and keep focus (filters). */
  function setQuery(path, query) {
    window.history.replaceState(null, '', App.href(path, query));
    App.refresh();
  }

  /* ====================================================================
     Data derived from the store (never cached: Reset replaces the store)
     ==================================================================== */
  function contactsOf(clientId) { return App.store.contacts.filter((k) => k.clientId === clientId); }
  function staffUsers() { return App.store.users.slice().sort(byName); }
  function activeStaff() { return App.store.users.filter((u) => u.active); }

  /* What a client's contacts can see, through App.access (no rules re-implemented here).
     A stand-in active contact is used so the card shows the client's view even before it has
     contacts; an inactive client sees nothing (S2). */
  function clientView(client) {
    const probe = { id: null, clientId: client.id, active: true };
    const visible = App.sortNewest(App.store.images.filter((im) => App.access.canSee(probe, im)));
    const own = visible.filter((im) => App.access.isOwn(client.id, im));
    return { visible, own };
  }

  function linkMatches(l, kind, id) { return kind === 'contact' ? l.contactId === id : l.userId === id; }
  function openLink(kind, id) {
    const now = App.nowISO();
    return App.store.setupLinks
      .filter((l) => linkMatches(l, kind, id) && !l.usedAt && !l.cancelledAt && l.expiresAt >= now)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null;
  }
  function linkURL(t) { return window.location.href.split('#')[0] + '#/set-password/' + t; }

  /* A new setup link cancels earlier unused links for the same person (FR-4). */
  function createLink(kind, person) {
    const now = App.nowISO();
    let cancelled = 0;
    App.store.setupLinks.forEach((l) => {
      if (linkMatches(l, kind, person.id) && !l.usedAt && !l.cancelledAt) { l.cancelledAt = now; cancelled++; }
    });
    const exp = new Date();
    exp.setDate(exp.getDate() + LINK_DAYS);
    const me = App.currentUser();
    const link = {
      token: token(), contactId: kind === 'contact' ? person.id : null, createdBy: me ? me.id : null,
      createdAt: now, expiresAt: isoDateTime(exp), usedAt: null, cancelledAt: null
    };
    if (kind === 'user') link.userId = person.id;
    App.store.setupLinks.push(link);
    const client = kind === 'contact' ? App.find.client(person.clientId) : null;
    App.log('Created a setup link', person.name + (client ? ', ' + client.name : ', staff'));
    App.save();
    ui.link = { kind, id: person.id };
    return { link, cancelled };
  }

  /* ====================================================================
     Shared markup
     ==================================================================== */
  function miniThumb(image) {
    if (!image) return h`<span class="mini" aria-hidden="true"></span>`;
    return h`<span class="mini"><span class="ph ${image.ph || ''}" role="img" aria-label="${App.altFor(image)}"></span></span>`;
  }
  function contactName(l) {
    if (!l.contactId) return l.source === 'staff-grant' ? 'Given by the agency' : '';
    const k = App.find.contact(l.contactId);
    return k ? k.name : '';
  }
  const SOURCE = { purchase: 'Checkout', 'free-download': 'Free download', 'staff-grant': 'Given by the agency' };

  function creditTag() { return h`<span class="ds-tag" data-color="warning" data-size="sm">Credit flagged</span>`; }

  /* Status cell: Active, or Revoked with who, when, why and the credit flag (FR-25, FR-41). */
  function licenceStatus(l) {
    if (!l.revoked) return App.statusTag('active');
    const by = App.find.user(l.revoked.by);
    return h`<span class="adm-rv" id="lic-st-${l.id}" tabindex="-1"><span class="adm-tags">${App.statusTag('revoked')}${l.revoked.credit ? creditTag() : ''}</span><span class="rv-note">By ${by ? by.firstName : 'staff'} on ${App.fmt.date(l.revoked.date)}: ${sentence(l.revoked.reason)}${l.revoked.credit ? ' Flagged for a possible credit.' : ''}</span></span>`;
  }

  function setupLinkPanel(person, kind) {
    const link = openLink(kind, person.id);
    if (!link || !ui.link || ui.link.kind !== kind || ui.link.id !== person.id) return '';
    const first = person.firstName || firstNameOf(person.name);
    return h`<div class="setup-link" role="group" aria-labelledby="sl-h">
      <h3 id="sl-h">New setup link for ${person.name}</h3>
      <div class="link-row">
        <label class="ds-sr-only" for="sl-url">Setup link</label>
        <input class="ds-input" id="sl-url" type="text" readonly value="${linkURL(link.token)}" data-size="sm" aria-describedby="sl-hint">
        <button class="ds-button" data-variant="primary" data-size="sm" type="button" id="sl-copy" data-copy="sl-url" data-first="${first}">${App.icon('copy')}Copy link</button>
        <span class="copied" role="status" data-copied></span>
      </div>
      <p class="hint" id="sl-hint">Paste it into your own email to ${first}: the app sends no email. The link works once and expires on ${App.fmt.date(link.expiresAt)} at ${App.fmt.time(link.expiresAt)}. ${first} sets a new password of at least ${MIN_PASSWORD} characters. Making another link cancels this one.</p>
    </div>`;
  }

  /* Add or edit a contact or a staff user in a dialog. Resolves to the values, or null. */
  function personDialog(o) {
    const p = o.person || {};
    const body = h`${o.intro ? h`<p class="ds-paragraph">${o.intro}</p>` : ''}${
      field({ id: 'pd-name', name: 'name', label: 'Name', value: p.name || '', attrs: 'autocomplete="off"' })
    }${
      field({ id: 'pd-email', name: 'email', type: 'email', label: 'Email', value: p.email || '', desc: o.emailDesc, attrs: 'autocomplete="off"' })
    }${
      o.kind === 'contact' ? field({ id: 'pd-phone', name: 'phone', type: 'tel', label: 'Phone (optional)', value: p.phone || '' }) : ''
    }`;
    return App.dialog({
      title: o.title,
      body,
      actions: [{ label: o.confirm, value: 'save', variant: 'primary' }, { label: 'Cancel', value: null, variant: 'secondary' }],
      beforeClose(action, v, dlg) {
        let bad = setError(dlg, 'pd-name', String(v.name || '').trim() ? '' : 'Enter a name.');
        bad = setError(dlg, 'pd-email', emailError(v.email, o.person || null, true)) || bad;
        if (o.kind === 'contact') bad = setError(dlg, 'pd-phone', phoneError(v.phone)) || bad;
        if (bad) { focusFirstError(dlg); return 'Fix the marked fields to continue.'; }
        return '';
      }
    }).then((r) => (r.action === 'save' ? r.values : null));
  }

  /* Copy the setup link; a short "Copied" status, or a way out if the browser blocks it. */
  function copyLink(btn) {
    const input = document.getElementById(btn.getAttribute('data-copy'));
    const status = btn.parentNode.querySelector('[data-copied]');
    if (!input || !status) return;
    const first = btn.getAttribute('data-first');
    const show = (ok) => {
      status.innerHTML = ok
        ? String(h`${App.icon('check')}Copied. Paste it into your email to ${first}.`)
        : String(h`The link could not be copied. It is selected: press Ctrl+C (Cmd+C on a Mac) to copy it.`);
      window.clearTimeout(copiedTimer);
      copiedTimer = window.setTimeout(() => { if (status.isConnected) status.textContent = ''; }, 6000);
    };
    const fallback = () => {
      input.focus();
      input.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      show(ok);
    };
    input.select();
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(input.value).then(() => show(true), fallback);
    else fallback();
  }

  /* ====================================================================
     Clients: sidebar (client list)
     ==================================================================== */
  function clientSub(c) {
    const active = contactsOf(c.id).filter((k) => k.active);
    const people = App.fmt.plural(active.length, 'contact');
    if (!c.active) return 'Inactive, ' + people;
    if (active.length && !active.some((k) => k.passwordSet) && active.some((k) => openLink('contact', k.id))) {
      return people + ', setup link not used';
    }
    return people + ', ' + App.fmt.plural(clientView(c).own.length, 'own image');
  }

  function clientsSidebar(params) {
    const f = ui.filter;
    const cur = params.id || null;
    const all = App.store.clients.slice().sort(byName);
    const shown = all.filter((c) => (c.active ? f.active : f.inactive) || c.id === cur);
    const q = lower(f.q);
    const items = shown.map((c) => {
      const n = App.licences.forClient(c.id).length;
      const hide = q && lower(c.name + ' ' + c.orgNo).indexOf(q) === -1;
      return h`<li data-find="${lower(c.name + ' ' + c.orgNo)}"${hide ? App.raw(' hidden') : ''}><a href="#/clients/${c.id}"${c.id === cur ? App.raw(' aria-current="true"') : ''}><span class="two-line"><span>${c.name}</span><small>${clientSub(c)}</small></span><span class="n"><span class="ds-sr-only">, </span>${n}<span class="ds-sr-only"> ${n === 1 ? 'licence' : 'licences'}</span></span></a></li>`;
    });
    const none = !shown.length || shown.every((c) => q && lower(c.name + ' ' + c.orgNo).indexOf(q) === -1);
    return h`<section class="side-sec side-context" aria-labelledby="cl-list-h">
      <div class="side-head"><h2 id="cl-list-h">Clients</h2><a class="ds-button" data-variant="tertiary" data-size="sm" href="#/clients/new">Add client</a></div>
      <ds-field class="ds-field client-search" data-size="sm">
        <label class="ds-label ds-sr-only" for="cl-find">Find a client</label>
        <input class="ds-input" type="search" id="cl-find" placeholder="Find a client" value="${f.q}" aria-controls="cl-list" autocomplete="off">
      </ds-field>
      <div class="group">
        <h3 id="cl-st-h">Status</h3>
        <div class="chips" role="group" aria-labelledby="cl-st-h">
          <label class="ds-chip"><input class="ds-input" type="checkbox" id="cl-f-active" data-cl-status="active"${f.active ? App.raw(' checked') : ''}> Active</label>
          <label class="ds-chip"><input class="ds-input" type="checkbox" id="cl-f-inactive" data-cl-status="inactive"${f.inactive ? App.raw(' checked') : ''}> Inactive</label>
        </div>
      </div>
      <div class="group">
        <ul class="vlist" id="cl-list" aria-label="Client list">${items}</ul>
        <p class="side-hint" data-cl-none${none ? '' : App.raw(' hidden')}>No clients match. Change the search or tick Inactive.</p>
        <p class="side-hint">The number is each client's licences, revoked ones included. Inactive clients show when you tick Inactive.</p>
      </div>
    </section>`;
  }

  function filterClientList(q) {
    ui.filter.q = q;
    const list = document.getElementById('cl-list');
    if (!list) return;
    const needle = lower(q);
    let visible = 0;
    list.querySelectorAll('li').forEach((li) => {
      const hit = !needle || li.getAttribute('data-find').indexOf(needle) !== -1;
      li.hidden = !hit;
      if (hit) visible++;
    });
    const none = document.querySelector('[data-cl-none]');
    if (none) none.hidden = visible > 0;
  }

  /* ====================================================================
     Clients: overview table, client form, client card
     ==================================================================== */
  function clientsIndex() {
    const all = App.store.clients.slice().sort(byName);
    const active = all.filter((c) => c.active).length;
    if (!all.length) {
      return h`<div class="page-head"><div><h1 class="page-title">Clients</h1></div></div>${App.emptyState('No clients yet. Add the first client to give its contacts access.', { label: 'Add client', href: '#/clients/new' })}`;
    }
    const rows = all.map((c) => {
      const contacts = contactsOf(c.id).filter((k) => k.active).length;
      const view = clientView(c);
      return h`<tr>
        <td data-label="Client"><a class="ds-link" href="#/clients/${c.id}">${c.name}</a></td>
        <td data-label="Org number" class="nowrap">${c.orgNo ? App.fmt.orgNo(c.orgNo) : '–'}</td>
        <td data-label="Contacts">${contacts}</td>
        <td data-label="Own images">${view.own.length}</td>
        <td data-label="Licences">${App.licences.forClient(c.id).length}</td>
        <td data-label="Status">${App.statusTag(c.active ? 'active' : 'inactive')}</td>
      </tr>`;
    });
    return h`<div class="page-head">
        <div><h1 class="page-title">Clients</h1><p class="page-sub">${App.fmt.plural(active, 'active client')}${all.length > active ? ', ' + (all.length - active) + ' inactive' : ''}. Open a client to see its contacts, images and licences.</p></div>
        <div class="head-actions"><a class="ds-button" data-variant="primary" data-size="sm" href="#/clients/new">${App.icon('plus')}Add client</a></div>
      </div>
      <section class="card-sec" aria-labelledby="cl-all-h">
        <div class="sec-head"><h2 id="cl-all-h">All clients</h2><span class="sec-meta">Clients are never deleted. Set one inactive instead.</span></div>
        <div class="lic-wrap"><table class="ds-table lic-table" data-size="sm">
          <thead><tr><th scope="col">Client</th><th scope="col">Org number</th><th scope="col">Active contacts</th><th scope="col">Own images</th><th scope="col">Licences</th><th scope="col">Status</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
      </section>`;
  }

  function clientFormFields(c) {
    const managers = activeStaff().slice().sort(byName);
    const current = c && c.accountManagerId && App.find.user(c.accountManagerId);
    if (current && !current.active) managers.push(current);
    const me = App.currentUser();
    return h`<div class="sec-body adm-form">
      ${field({ id: 'cf-name', name: 'name', label: 'Name', value: c ? c.name : '', attrs: 'autocomplete="organization"' })}
      ${field({ id: 'cf-org', name: 'orgNo', label: 'Org number (optional)', value: c && c.orgNo ? App.fmt.orgNo(c.orgNo) : '', desc: '9 digits, for example 921 456 786.', attrs: 'inputmode="numeric" autocomplete="off"' })}
      ${field({ id: 'cf-billing', name: 'billingEmail', type: 'email', label: 'Billing email', value: c ? c.billingEmail : '', attrs: 'autocomplete="off"' })}
      ${field({ id: 'cf-manager', name: 'accountManagerId', type: 'select', label: 'Account manager', value: c ? c.accountManagerId : (me ? me.id : ''),
        options: managers.map((u) => ({ value: u.id, label: u.name + (u.active ? '' : ' (inactive)') })) })}
      ${field({ id: 'cf-notes', name: 'notes', type: 'textarea', rows: 4, label: 'Staff notes', value: c ? c.notes : '', desc: 'Staff only. Contacts never see notes or the account manager.', cls: 'adm-wide' })}
    </div>`;
  }

  function readClientForm(form, existing) {
    const v = {
      name: form.elements.name.value.trim(),
      orgNo: form.elements.orgNo.value.replace(/\s+/g, ''),
      billingEmail: form.elements.billingEmail.value.trim(),
      accountManagerId: form.elements.accountManagerId.value,
      notes: form.elements.notes.value.trim()
    };
    let bad = setError(form, 'cf-name', v.name ? '' : 'Enter the client\'s name.');
    if (!bad && App.store.clients.some((c) => c !== existing && lower(c.name) === lower(v.name))) {
      bad = setError(form, 'cf-name', 'A client with this name exists. Open it from the client list instead.');
    }
    bad = setError(form, 'cf-org', orgNoError(v.orgNo)) || bad;
    const billing = !v.billingEmail ? 'Enter a billing email.' : EMAIL_RE.test(v.billingEmail) ? '' : 'Enter a valid email address, for example name@example.com.';
    bad = setError(form, 'cf-billing', billing) || bad;
    bad = setError(form, 'cf-manager', App.find.user(v.accountManagerId) ? '' : 'Choose an account manager.') || bad;
    if (bad) { focusFirstError(form); return null; }
    return v;
  }

  function newClientPage() {
    return h`<div class="page-head"><div><h1 class="page-title">Add client</h1><p class="page-sub">After you create the client, add its contacts and give each a setup link.</p></div></div>
      <form class="card-sec" id="cl-form" data-mode="new" novalidate aria-labelledby="cl-new-h">
        <div class="sec-head"><h2 id="cl-new-h">Details</h2></div>
        ${clientFormFields(null)}
        <div class="sec-foot adm-actions">
          <button class="ds-button" data-variant="primary" type="submit" id="cf-save">Create client</button>
          <a class="ds-button" data-variant="secondary" href="#/clients">Cancel</a>
        </div>
      </form>`;
  }

  function detailsSection(c) {
    if (ui.editing === c.id) {
      return h`<form class="card-sec" id="cl-form" data-mode="edit" novalidate aria-labelledby="cl-det-h">
        <div class="sec-head"><h2 id="cl-det-h">Edit details</h2></div>
        ${clientFormFields(c)}
        <div class="sec-foot adm-actions">
          <button class="ds-button" data-variant="primary" type="submit" id="cf-save">Save changes</button>
          <button class="ds-button" data-variant="secondary" type="button" id="cf-cancel">Cancel</button>
        </div>
      </form>`;
    }
    const mgr = App.find.user(c.accountManagerId);
    return h`<section class="card-sec" aria-labelledby="cl-det-h">
      <div class="sec-head"><h2 id="cl-det-h">Details</h2></div>
      <div class="sec-body client-grid">
        <dl class="kv">
          <div><dt>Org number</dt><dd>${c.orgNo ? App.fmt.orgNo(c.orgNo) : 'Not given'}</dd></div>
          <div><dt>Billing email</dt><dd>${c.billingEmail || 'Not given'}</dd></div>
          <div><dt>Account manager</dt><dd>${mgr ? mgr.name : 'None'}</dd></div>
          <div><dt>Status</dt><dd>${c.active ? 'Active. Its contacts can log in.' : 'Inactive. Its contacts cannot log in. The client and its history are kept.'}</dd></div>
        </dl>
        <div class="notes">
          <h3>Staff notes</h3>
          <p class="hint">Staff only. Contacts never see notes or the account manager.</p>
          <p class="body">${c.notes || 'No notes yet.'}</p>
        </div>
      </div>
    </section>`;
  }

  function contactsSection(c) {
    const all = contactsOf(c.id).slice().sort((a, b) => (b.active - a.active) || byName(a, b));
    const active = all.filter((k) => k.active).length;
    const inactive = all.length - active;
    const people = all.map((k) => {
      const link = openLink('contact', k.id);
      let seen;
      if (!k.passwordSet) seen = link ? 'Setup link not used, expires ' + App.fmt.date(link.expiresAt) : 'No password yet. Create a setup link.';
      else seen = k.lastLoginAt ? 'Last login ' + App.fmt.date(k.lastLoginAt) : 'Has not logged in yet';
      const contactLine = [k.email, k.phone].filter(Boolean).join(', ');
      return h`<li class="person" id="person-${k.id}">
        ${App.avatar(k.name)}
        <span class="who-line"><b>${k.name}</b><span>${contactLine}</span></span>
        <span class="p-end">
          <span class="seen">${seen}</span>
          ${App.statusTag(k.active ? 'active' : 'inactive')}
          <button class="ds-button" data-variant="tertiary" data-size="sm" type="button" id="k-edit-${k.id}" data-edit-contact="${k.id}" aria-label="Edit ${k.name}">Edit</button>
          ${k.active ? h`<button class="ds-button" data-variant="tertiary" data-size="sm" type="button" id="k-link-${k.id}" data-link-contact="${k.id}" aria-label="${k.passwordSet ? 'New setup link' : 'Create setup link'} for ${k.name}">${k.passwordSet ? 'New setup link' : 'Create setup link'}</button>` : ''}
          <button class="ds-button" data-variant="tertiary" data-size="sm" type="button" id="k-st-${k.id}" data-toggle-contact="${k.id}" aria-label="${k.active ? 'Deactivate' : 'Reactivate'} ${k.name}">${k.active ? 'Deactivate' : 'Reactivate'}</button>
        </span>
        ${setupLinkPanel(k, 'contact')}
      </li>`;
    });
    return h`<section class="card-sec" aria-labelledby="cl-con-h">
      <div class="sec-head">
        <h2 id="cl-con-h">Contacts</h2><span class="sec-meta">${active} active${inactive ? ', ' + inactive + ' inactive' : ''}</span>
        <div class="sec-end"><button class="ds-button" data-variant="secondary" data-size="sm" type="button" id="cl-add-contact" data-add-contact>${App.icon('plus')}Add contact</button></div>
      </div>
      ${all.length ? h`<ul class="people">${people}</ul>` : App.emptyState('No contacts yet. Add a contact to give ' + c.name + ' access to its images.')}
    </section>`;
  }

  function imagesSection(c) {
    const { visible, own } = clientView(c);
    const pub = visible.filter((im) => im.visibility === 'public').length;
    const restricted = visible.filter((im) => im.visibility === 'restricted' && (im.clients || []).indexOf(c.id) !== -1).length;
    let body;
    if (!c.active) body = App.emptyState(c.name + ' is inactive, so its contacts see no images. Set it active to give them access again.');
    else if (!visible.length) body = App.emptyState('No images are visible to ' + c.name + ' yet. Share images with it from the Library or Upload.');
    else {
      body = h`<div class="sec-body">
        <ul class="counts" aria-label="Image counts">
          <li><b>${visible.length}</b> visible in total</li>
          <li><b>${own.length}</b> own ${own.length === 1 ? 'image' : 'images'}</li>
          <li><b>${pub}</b> public</li>
          <li><b>${restricted}</b> restricted to lists that include ${c.name}</li>
        </ul>
        <ul class="strip" aria-label="Newest images visible to ${c.name}">${
          visible.slice(0, STRIP_MAX).map((im) => h`<li>${own.indexOf(im) !== -1 ? App.ownTick('Own image') : ''}<span class="ph ${im.ph || ''}" role="img" aria-label="${App.altFor(im)}"></span></li>`)
        }</ul>
        <p class="strip-note"><span class="own-inline"><span class="own" aria-hidden="true">${App.icon('check')}</span>Own image</span> ${c.name} holds a licence, or the image is free and restricted to a list that includes it.${visible.length > STRIP_MAX ? ' Showing the ' + STRIP_MAX + ' newest.' : ''}</p>
      </div>`;
    }
    return h`<section class="card-sec" aria-labelledby="cl-img-h">
      <div class="sec-head"><h2 id="cl-img-h">Images ${c.name} can see</h2>
        <div class="sec-end"><a class="ds-link" href="${App.href('/library', { client: c.id })}">Open in Library</a></div></div>
      ${body}
    </section>`;
  }

  function licenceRows(list, opts) {
    return list.map((l) => {
      const im = App.find.image(l.imageId);
      const client = App.find.client(l.clientId);
      const title = im ? App.imageTitle(im) : 'Image no longer in the library';
      return h`<tr>
        ${opts.dateFirst ? h`<td data-label="Date" class="nowrap">${App.fmt.date(l.date)}</td>` : ''}
        <td class="td-img"><span class="img-cell">${miniThumb(im)}${im ? h`<a class="ds-link" href="#/image/${im.id}">${title}</a>` : title}</span></td>
        ${opts.showClient ? h`<td data-label="Client">${client ? h`<a class="ds-link" href="#/clients/${client.id}">${client.name}</a>` : ''}</td>` : ''}
        <td data-label="Price">${App.price(l.price)}</td>
        ${opts.dateFirst ? '' : h`<td data-label="Date" class="nowrap">${App.fmt.date(l.date)}</td>`}
        <td data-label="Contact">${contactName(l)}</td>
        ${opts.showSource ? h`<td data-label="Source">${SOURCE[l.source] || ''}</td>` : ''}
        <td data-label="Status">${licenceStatus(l)}</td>
        ${opts.revoke ? h`<td data-label="" class="td-act">${l.revoked ? '' : h`<button class="ds-button" data-variant="tertiary" data-size="sm" type="button" data-revoke="${l.id}" aria-label="Revoke licence for ${title}">Revoke</button>`}</td>` : ''}
      </tr>`;
    });
  }

  function historySection(c) {
    const all = App.licences.forClient(c.id);
    const shown = all.slice(0, HISTORY_ROWS);
    const lt = App.store.settings.licenceType;
    return h`<section class="card-sec" aria-labelledby="cl-lic-h">
      <div class="sec-head">
        <h2 id="cl-lic-h">Licence history</h2>${all.length ? h`<span class="sec-meta">${shown.length} of ${all.length}, newest first</span>` : ''}
        <div class="sec-end"><a class="ds-link" href="${App.href('/licences', { client: c.id })}">Open in Licences</a></div>
      </div>
      ${all.length ? h`<div class="lic-wrap"><table class="ds-table lic-table" data-size="sm">
          <thead><tr><th scope="col">Image</th><th scope="col">Price</th><th scope="col" aria-sort="descending">Date</th><th scope="col">Contact</th><th scope="col">Status</th><th scope="col"><span class="ds-sr-only">Actions</span></th></tr></thead>
          <tbody>${licenceRows(shown, { revoke: true })}</tbody>
        </table></div>
        <div class="sec-foot">All licences are ${lt.name}. Prices exclude VAT.</div>`
        : App.emptyState(c.name + ' has no licences yet. A licence is recorded when a contact buys an image or first downloads a free one.')}
    </section>`;
  }

  function clientCard(params) {
    const c = App.find.client(params.id);
    const mgr = App.find.user(c.accountManagerId);
    return h`<div class="page-head">
        <div>
          <div class="title-row"><h1 class="page-title">${c.name}</h1>${App.statusTag(c.active ? 'active' : 'inactive')}</div>
          <p class="page-sub">Client since ${App.fmt.date(c.createdAt)}.${mgr ? ' Account manager ' + mgr.firstName + '.' : ''}</p>
        </div>
        <div class="head-actions">
          ${ui.editing === c.id ? '' : h`<button class="ds-button" data-variant="secondary" data-size="sm" type="button" id="cl-edit">${App.icon('edit')}Edit client</button>`}
          <button class="ds-button" data-variant="tertiary" data-size="sm" type="button" id="cl-status">${c.active ? 'Set inactive' : 'Set active'}</button>
        </div>
      </div>
      ${detailsSection(c)}${contactsSection(c)}${imagesSection(c)}${historySection(c)}`;
  }

  /* ---------- Clients: actions ---------- */
  function refreshClients(focus) {
    App.refresh('main');
    App.refresh('sidebar');
    if (focus) focusId(focus);
  }

  function startEdit(clientId) {
    ui.editing = clientId;
    ui.dirty = false;
    App.setLeaveGuard(leaveGuard);
    refreshClients('cf-name');
  }
  function stopEdit(focus) {
    ui.editing = null;
    ui.dirty = false;
    App.setLeaveGuard(null);
    refreshClients(focus);
  }
  function leaveGuard() {
    if (!ui.dirty) return true;
    const c = App.find.client(ui.editing);
    return App.confirm({
      title: 'You have unsaved changes',
      body: h`<p class="ds-paragraph">Your edits to <b>${c ? c.name : 'this client'}</b> are not saved yet. Leave and discard them, or keep editing and save them first.</p>`,
      confirm: 'Discard changes',
      cancel: 'Keep editing',
      danger: true
    }).then((ok) => {
      if (ok) { ui.editing = null; ui.dirty = false; }
      return ok;
    });
  }

  function submitClientForm(form) {
    if (form.getAttribute('data-mode') === 'new') {
      const v = readClientForm(form, null);
      if (!v) return;
      const c = Object.assign({ id: App.uid('c'), active: true, createdAt: App.todayISO() }, v);
      App.store.clients.push(c);
      App.log('Created a client', c.name);
      App.save();
      ui.dirty = false;
      App.flash(c.name + ' is created. Add its contacts and give each a setup link.', { color: 'success' });
      App.navigate('#/clients/' + c.id);
      return;
    }
    const c = App.find.client(ui.editing);
    if (!c) return;
    const v = readClientForm(form, c);
    if (!v) return;
    const labels = { name: 'name', orgNo: 'org number', billingEmail: 'billing email', accountManagerId: 'account manager', notes: 'staff notes' };
    const changed = Object.keys(labels).filter((k) => String(c[k] || '') !== String(v[k] || ''));
    if (changed.length) {
      Object.assign(c, v);
      App.log('Edited a client', c.name + ': ' + changed.map((k) => labels[k]).join(', '));
      App.save();
      App.status('Changes saved.');
    } else {
      App.status('No changes to save.');
    }
    stopEdit('cl-edit');
  }

  function toggleClient(c) {
    const n = contactsOf(c.id).filter((k) => k.active).length;
    const body = c.active
      ? h`<p class="ds-paragraph">${c.name}'s ${App.fmt.plural(n, 'contact')} can no longer log in, from their next click. Images, licences and history stay, and you can set the client active again. Clients are never deleted.</p>`
      : h`<p class="ds-paragraph">${c.name}'s active contacts can log in again and see the images shared with ${c.name}.</p>`;
    App.confirm({ title: 'Set ' + c.name + (c.active ? ' inactive?' : ' active?'), body, confirm: c.active ? 'Set inactive' : 'Set active', danger: c.active })
      .then((ok) => {
        if (!ok) return;
        c.active = !c.active;
        App.log(c.active ? 'Set a client active' : 'Set a client inactive', c.name);
        App.save();
        App.status(c.name + (c.active ? ' is active.' : ' is inactive.'));
        refreshClients('cl-status');
      });
  }

  function addContact(c) {
    personDialog({ kind: 'contact', title: 'Add a contact to ' + c.name, confirm: 'Add contact',
      intro: 'You get a setup link for the new contact to copy into your own email.',
      emailDesc: 'The email is the login.' })
      .then((v) => {
        if (!v) return;
        const k = {
          id: App.uid('k'), clientId: c.id, name: v.name.trim(), firstName: firstNameOf(v.name), email: v.email.trim(),
          phone: String(v.phone || '').trim(), active: true, passwordSet: false, lastLoginAt: null, prefs: { captions: true }
        };
        App.store.contacts.push(k);
        App.log('Added a contact', k.name + ', ' + c.name);
        createLink('contact', k);
        App.status(k.name + ' is added. Copy the setup link and send it to ' + k.firstName + '.');
        refreshClients('sl-copy');
      });
  }

  function editContact(k) {
    personDialog({ kind: 'contact', person: k, title: 'Edit ' + k.name, confirm: 'Save changes',
      emailDesc: 'The email is the login. Changing it keeps ' + k.firstName + '\'s licences and history.' })
      .then((v) => {
        if (!v) return;
        const next = { name: v.name.trim(), email: v.email.trim(), phone: String(v.phone || '').trim() };
        const changed = Object.keys(next).filter((key) => (k[key] || '') !== next[key]);
        if (!changed.length) { App.status('No changes to save.'); return; }
        Object.assign(k, next, { firstName: firstNameOf(next.name) });
        App.log('Edited a contact', k.name + ': ' + changed.join(', '));
        App.save();
        App.status('Changes saved.');
        refreshClients('k-edit-' + k.id);
      });
  }

  function linkForContact(k) {
    const had = openLink('contact', k.id);
    const go = () => {
      const r = createLink('contact', k);
      App.status('New setup link for ' + k.name + '.' + (r.cancelled ? ' The earlier link no longer works.' : ''));
      refreshClients('sl-copy');
    };
    if (!had) { go(); return; }
    App.confirm({
      title: 'Make a new setup link?',
      body: h`<p class="ds-paragraph">${k.name} has a setup link that is not used yet. A new link cancels it, so the old one stops working.</p>`,
      confirm: 'Make a new link'
    }).then((ok) => { if (ok) go(); });
  }

  function toggleContact(k) {
    const c = App.find.client(k.clientId);
    const body = k.active
      ? h`<p class="ds-paragraph">${k.name} can no longer log in, from the next click. ${c ? c.name : 'The client'}'s licences and history stay. You can reactivate ${k.firstName} later.</p>`
      : h`<p class="ds-paragraph">${k.name} can log in again with the same email and password${c && !c.active ? ' once ' + c.name + ' is active again' : ''}.</p>`;
    App.confirm({ title: (k.active ? 'Deactivate ' : 'Reactivate ') + k.name + '?', body, confirm: k.active ? 'Deactivate' : 'Reactivate', danger: k.active })
      .then((ok) => {
        if (!ok) return;
        k.active = !k.active;
        if (!k.active && ui.link && ui.link.id === k.id) ui.link = null;
        App.log(k.active ? 'Reactivated a contact' : 'Deactivated a contact', k.name + (c ? ', ' + c.name : ''));
        App.save();
        App.status(k.name + (k.active ? ' is reactivated.' : ' is deactivated.'));
        refreshClients('k-st-' + k.id);
      });
  }

  /* Revoke with a required reason (FR-25, S11); App.licences.revoke flags paid ones for credit. */
  function revokeLicence(l) {
    const im = App.find.image(l.imageId);
    const c = App.find.client(l.clientId);
    const cname = c ? c.name : 'The client';
    const title = App.imageTitle(im);
    const isPublic = im && im.visibility === 'public' && im.status === 'published';
    const body = h`<p class="ds-paragraph">${cname} loses its licence for <b>${title}</b> (${priceLabel(l.price)}, ${App.fmt.date(l.date)}). The licence is marked as revoked with your name, the time and the reason, and is never deleted. ${cname}'s history shows the image as removed by the agency.</p>
      ${l.price > 0 ? h`<p class="ds-paragraph">A paid licence is flagged for a possible credit.</p>` : ''}
      <p class="ds-paragraph">${cname} is also removed from the image's client list.${isPublic ? ' The image is public, so ' + cname + ' can still find it and ' + (im.price > 0 ? 'buy it again.' : 'download it again.') : ''}</p>
      ${field({ id: 'rv-reason', name: 'reason', type: 'textarea', rows: 3, label: 'Reason', desc: 'Write a reason to revoke the licence. It is kept with the licence.' })}`;
    App.dialog({
      title: 'Revoke this licence?',
      className: 'revoke-dlg',
      body,
      actions: [{ label: 'Revoke licence', value: 'revoke', variant: 'primary', color: 'danger' }, { label: 'Go back', value: null, variant: 'secondary' }],
      onOpen(dlg) {
        const btn = dlg.querySelector('button[value="revoke"]');
        const ta = dlg.querySelector('#rv-reason');
        btn.disabled = true;
        ta.addEventListener('input', () => { btn.disabled = !ta.value.trim(); });
      },
      beforeClose(action, v, dlg) {
        if (String(v.reason || '').trim()) return '';
        setError(dlg, 'rv-reason', 'Write a reason to revoke the licence.');
        return 'Write a reason to revoke the licence.';
      }
    }).then((r) => {
      if (r.action !== 'revoke') return;
      const done = App.licences.revoke(l.id, r.values.reason);
      if (!done) {
        App.flash('The licence could not be revoked. It may be revoked already. Check the history and try again.', { color: 'danger' });
        App.refresh();
        return;
      }
      App.status('Licence revoked.' + (done.revoked.credit ? ' It is flagged for a possible credit.' : ''));
      App.refresh('main');
      if (App.current().pattern !== '/licences') App.refresh('sidebar');
      focusId('lic-st-' + l.id);
    });
  }

  function mountClients() {
    App.on('input', '#cl-find', (e, el) => filterClientList(el.value));
    App.on('change', '[data-cl-status]', (e, el) => {
      ui.filter[el.getAttribute('data-cl-status')] = el.checked;
      App.refresh('sidebar');
    });
    App.on('input', '#cl-form', () => { ui.dirty = true; });
    App.on('submit', '#cl-form', (e, form) => { e.preventDefault(); submitClientForm(form); });
    App.on('click', '#cf-cancel', () => stopEdit('cl-edit'));
    App.on('click', '#cl-edit', () => { const p = App.current().params; startEdit(p.id); });
    App.on('click', '#cl-status', () => toggleClient(App.find.client(App.current().params.id)));
    App.on('click', '[data-add-contact]', () => addContact(App.find.client(App.current().params.id)));
    App.on('click', '[data-edit-contact]', (e, b) => editContact(App.find.contact(b.getAttribute('data-edit-contact'))));
    App.on('click', '[data-link-contact]', (e, b) => linkForContact(App.find.contact(b.getAttribute('data-link-contact'))));
    App.on('click', '[data-toggle-contact]', (e, b) => toggleContact(App.find.contact(b.getAttribute('data-toggle-contact'))));
    App.on('click', '[data-revoke]', (e, b) => revokeLicence(App.find.licence(b.getAttribute('data-revoke'))));
    App.on('click', '[data-copy]', (e, b) => copyLink(b));
    return () => { window.clearTimeout(copiedTimer); ui.editing = null; ui.dirty = false; };
  }

  const clientsCommon = {
    role: 'staff',
    nav: 'clients',
    sidebar: clientsSidebar,
    sidebarLabel: 'Client list',
    sidebarToggleLabel: 'Show or hide the client list'
  };

  App.registerScreen('/clients', Object.assign({}, clientsCommon, {
    title: 'Clients',
    render() { ui.editing = null; return clientsIndex(); },
    mount: mountClients
  }));

  App.registerScreen('/clients/new', Object.assign({}, clientsCommon, {
    title: 'Add client',
    render() { ui.editing = null; return newClientPage(); },
    mount() {
      ui.dirty = false;
      App.setLeaveGuard(() => {
        if (!ui.dirty) return true;
        return App.confirm({
          title: 'You have unsaved changes',
          body: h`<p class="ds-paragraph">The new client is not created yet. Leave and discard what you typed, or keep editing.</p>`,
          confirm: 'Discard changes', cancel: 'Keep editing', danger: true
        }).then((ok) => { if (ok) ui.dirty = false; return ok; });
      });
      focusId('cf-name');
      return mountClients();
    }
  }));

  App.registerScreen('/clients/:id', Object.assign({}, clientsCommon, {
    title: (p) => { const c = App.find.client(p.id); return c ? c.name : 'Clients'; },
    render(params) {
      if (ui.editing && ui.editing !== params.id) { ui.editing = null; ui.dirty = false; }
      if (ui.link && ui.link.kind === 'contact') {
        const k = App.find.contact(ui.link.id);
        if (!k || k.clientId !== params.id) ui.link = null;
      }
      return clientCard(params);
    },
    mount: mountClients
  }));

  /* ====================================================================
     Licences (staff): transaction log (FR-41)
     ==================================================================== */
  function licenceFilters(q) {
    const from = /^\d{4}-\d{2}-\d{2}$/.test(q.from || '') ? q.from : '';
    const to = /^\d{4}-\d{2}-\d{2}$/.test(q.to || '') ? q.to : '';
    return {
      client: App.find.client(q.client) ? q.client : '',
      from, to,
      rangeError: from && to && from > to ? 'The start date is after the end date, so the date range is not applied. Change one of the dates.' : '',
      paid: q.paid === '1',
      oldest: q.sort === 'oldest',
      page: q.page
    };
  }
  function licencesQuery(f, extra) {
    return Object.assign({ client: f.client, from: f.from, to: f.to, paid: f.paid ? '1' : '', sort: f.oldest ? 'oldest' : '' }, extra || {});
  }

  function licencesPage(params) {
    const f = licenceFilters(params.query);
    let list = App.store.licences.slice();
    if (f.client) list = list.filter((l) => l.clientId === f.client);
    if (!f.rangeError) {
      if (f.from) list = list.filter((l) => l.date >= f.from);
      if (f.to) list = list.filter((l) => l.date <= f.to);
    }
    if (f.paid) list = list.filter((l) => l.price > 0);
    list.sort((a, b) => (f.oldest ? -1 : 1) * (String(b.date).localeCompare(String(a.date)) || String(b.id).localeCompare(String(a.id))));
    const filtered = !!(f.client || f.from || f.to || f.paid);
    const pg = App.paginate(list, f.page, LIC_PER_PAGE);
    const activePaid = list.filter((l) => !l.revoked && l.price > 0).reduce((s, l) => s + l.price, 0);
    const revoked = list.filter((l) => l.revoked).length;
    const credit = list.filter((l) => l.revoked && l.revoked.credit).length;
    const clients = App.store.clients.slice().sort(byName);
    const client = f.client && App.find.client(f.client);

    const filters = h`<form class="adm-filters" id="lic-filters" role="search" aria-label="Filter licences" novalidate>
      ${field({ id: 'lf-client', name: 'client', type: 'select', label: 'Client', value: f.client,
        options: [{ value: '', label: 'All clients' }].concat(clients.map((c) => ({ value: c.id, label: c.name + (c.active ? '' : ' (inactive)') }))) })}
      ${field({ id: 'lf-from', name: 'from', type: 'date', label: 'From', value: f.from })}
      ${field({ id: 'lf-to', name: 'to', type: 'date', label: 'To', value: f.to })}
      <ds-field class="ds-field adm-switch"><input class="ds-input" type="checkbox" role="switch" id="lf-paid" name="paid"${f.paid ? App.raw(' checked') : ''}><label class="ds-label" data-weight="regular" for="lf-paid">Paid only</label></ds-field>
      ${filtered ? h`<a class="ds-link adm-clear" href="#/licences">Clear filters</a>` : ''}
    </form>`;

    const sortHref = App.href('/licences', licencesQuery(f, { sort: f.oldest ? '' : 'oldest' }));
    const table = pg.total
      ? h`<section class="card-sec" aria-labelledby="lic-log-h">
          <div class="sec-head"><h2 id="lic-log-h" class="ds-sr-only">Licences</h2>
            <p class="adm-meta"><span class="count">${App.fmt.plural(pg.total, 'licence')}</span><span>${activePaid} USD in active paid licences</span><span>${revoked} revoked, ${credit} flagged for credit</span></p></div>
          <div class="lic-wrap"><table class="ds-table lic-table" data-size="sm">
            <thead><tr>
              <th scope="col" aria-sort="${f.oldest ? 'ascending' : 'descending'}"><a class="adm-sort" href="${sortHref}">Date<span class="ds-sr-only">, ${f.oldest ? 'oldest first. Sort newest first' : 'newest first. Sort oldest first'}</span><span aria-hidden="true">${f.oldest ? ' ↑' : ' ↓'}</span></a></th>
              <th scope="col">Image</th><th scope="col">Client</th><th scope="col">Price</th><th scope="col">Contact</th><th scope="col">Source</th><th scope="col">Status</th>
            </tr></thead>
            <tbody>${licenceRows(pg.items, { dateFirst: true, showClient: true, showSource: true })}</tbody>
          </table></div>
          <div class="sec-foot">Prices exclude VAT. Revoked licences stay in the log with who, when and why.</div>
        </section>
        ${App.pager({ page: pg.page, perPage: LIC_PER_PAGE, total: pg.total, hrefFor: (p) => App.href('/licences', licencesQuery(f, { page: p })) })}`
      : filtered
        ? App.emptyState('No licences match these filters.', { label: 'Clear filters', href: '#/licences' })
        : App.emptyState('No licences yet. A licence is recorded when a client buys an image or first downloads a free one.');

    return h`<div class="page-head"><div>
        <h1 class="page-title">Licences</h1>
        <p class="page-sub">${client ? 'Licences of ' + client.name + ', ' : 'Every licence for every client, '}${f.oldest ? 'oldest' : 'newest'} first. All prices exclude VAT.</p>
      </div></div>
      ${filters}
      ${table}`;
  }

  App.registerScreen('/licences', {
    role: 'staff',
    title: 'Licences',
    nav: 'licences',
    render: licencesPage,
    mount(root, params) {
      const apply = () => {
        const form = document.getElementById('lic-filters');
        if (!form) return;
        const f = licenceFilters(params.query);
        setQuery('/licences', licencesQuery({
          client: form.elements.client.value, from: form.elements.from.value, to: form.elements.to.value,
          paid: form.elements.paid.checked, oldest: f.oldest
        }));
      };
      App.on('change', '#lic-filters', apply);
      App.on('submit', '#lic-filters', (e) => { e.preventDefault(); apply(); });
      const f = licenceFilters(params.query);
      if (f.rangeError) setError(root, 'lf-to', f.rangeError);
    }
  });

  /* ====================================================================
     Settings: licence type (FR-40), AI provider (FR-39), staff users (FR-3)
     ==================================================================== */
  const PROVIDERS = [
    { value: 'mock', label: 'Mock (test mode)' },
    { value: 'claude', label: 'Claude' }
  ];
  const PROVIDER_NOTE = {
    mock: 'The mock gives fixed sample metadata. It needs no API key, costs nothing and sends no image out of the app. Use it for tests and demos.',
    claude: 'Claude writes the title, description, alt text and keywords from each image. Images are sent to the provider. It needs a valid API key: without one, generation fails with the AI failure message and staff fill in the fields by hand. The rest of the app keeps working.'
  };
  const providerLabel = (mode) => (PROVIDERS.find((p) => p.value === mode) || PROVIDERS[0]).label;
  function providerNote(next, saved) {
    const base = PROVIDER_NOTE[next] || '';
    if (next === saved) return base;
    return 'After you save, images uploaded from then on use ' + providerLabel(next) + ' instead of ' + providerLabel(saved) + '. Metadata already generated is not changed. ' + base;
  }
  function maskKey(key) { return key.slice(0, 7) + '…' + key.slice(-4); }
  function takeMsg(key) { const m = ui.msg[key]; delete ui.msg[key]; return m; }
  function savedMsg(key) {
    const m = takeMsg(key);
    return h`<p class="adm-saved" role="status" id="${key}-status">${m || ''}</p>`;
  }

  function licenceSettings() {
    const lt = App.store.settings.licenceType;
    const sold = App.store.licences.filter((l) => l.licenceTypeId === lt.id).length;
    return h`<form class="card-sec" id="set-licence" novalidate aria-labelledby="set-lic-h">
      <div class="sec-head"><h2 id="set-lic-h">Licence type</h2><span class="sec-meta">${lt.name}</span></div>
      <div class="sec-body adm-form">
        ${field({ id: 'ls-price', name: 'price', label: 'Price (USD, excl. VAT)', value: String(lt.price),
          desc: 'A whole number above 0. Existing licences keep the price they were granted with.', attrs: 'inputmode="numeric" autocomplete="off"' })}
        <div class="adm-wide">
          ${lt.isSample ? h`<div class="ds-alert adm-alert" data-color="warning" data-size="sm"><p class="ds-paragraph"><b>Sample text.</b> The agency's legal reviewer replaces it with the real licence text before launch.</p></div>` : ''}
          ${field({ id: 'ls-text', name: 'text', type: 'textarea', rows: 10, label: 'Licence text', value: lt.text,
            desc: 'Clients accept this text when they buy or first download an image. A new text applies to new licences only; the ' + App.fmt.plural(sold, 'existing licence') + ' keep the text as it was accepted. Leave an empty line between paragraphs.' })}
        </div>
      </div>
      <div class="sec-foot adm-actions">
        <button class="ds-button" data-variant="primary" type="submit" id="ls-save">Save changes</button>
        <span class="adm-last">Last changed ${App.fmt.date(lt.updatedAt)}.</span>
        ${savedMsg('ls')}
      </div>
    </form>`;
  }

  function aiSettings() {
    const ai = App.store.settings.aiProvider;
    return h`<form class="card-sec" id="set-ai" novalidate aria-labelledby="set-ai-h">
      <div class="sec-head"><h2 id="set-ai-h">AI provider</h2><span class="sec-meta">Now: ${ai.name}</span></div>
      <div class="sec-body adm-form">
        <div>
          ${field({ id: 'ai-provider', name: 'mode', type: 'select', label: 'Provider', value: ai.mode, options: PROVIDERS, attrs: 'aria-controls="ai-note"' })}
          <p class="hint adm-note" id="ai-note" aria-live="polite">${providerNote(ai.mode, ai.mode)}</p>
        </div>
        ${field({ id: 'ai-model', name: 'model', label: 'Model (optional)', value: ai.model || '', hidden: ai.mode !== 'claude',
          desc: 'Leave it empty to use the model from the environment variables.', attrs: 'autocomplete="off"' })}
        <div class="adm-wide">
          <dl class="kv adm-kv">
            <div><dt>Saved API key</dt><dd>${ai.keyMasked ? h`<code>${ai.keyMasked}</code>` : 'None saved here. The key from the environment variables is used, if there is one.'}</dd></div>
            <div><dt>Prompt</dt><dd>${ai.promptVersion}, owned by the app and the same for every provider.</dd></div>
          </dl>
        </div>
        ${field({ id: 'ai-key', name: 'key', type: 'password', label: ai.keyMasked ? 'Replace the API key' : 'API key',
          desc: 'Stored encrypted and shown masked. It is never written to the action log. Leave it empty to keep the current key.', attrs: 'autocomplete="off" spellcheck="false"' })}
      </div>
      <div class="sec-foot adm-actions">
        <button class="ds-button" data-variant="primary" type="submit" id="ai-save">Save changes</button>
        ${savedMsg('ai')}
      </div>
    </form>`;
  }

  function staffSettings() {
    const users = staffUsers();
    const me = App.currentUser();
    const activeCount = activeStaff().length;
    const items = users.map((u) => {
      const last = u.active && activeCount === 1;
      const link = openLink('user', u.id);
      return h`<li class="person" id="person-${u.id}">
        ${App.avatar(u.name)}
        <span class="who-line"><b>${u.name}${me && me.id === u.id ? ' (you)' : ''}</b><span>${u.email}${u.role === 'admin' ? ', admin' : ''}</span></span>
        <span class="p-end">
          ${link ? h`<span class="seen">Setup link not used, expires ${App.fmt.date(link.expiresAt)}</span>` : ''}
          ${last ? h`<span class="seen" id="st-last-${u.id}">The last active staff user cannot be deactivated.</span>` : ''}
          ${App.statusTag(u.active ? 'active' : 'inactive')}
          <button class="ds-button" data-variant="tertiary" data-size="sm" type="button" id="u-edit-${u.id}" data-edit-user="${u.id}" aria-label="Edit ${u.name}">Edit</button>
          ${u.active ? h`<button class="ds-button" data-variant="tertiary" data-size="sm" type="button" id="u-link-${u.id}" data-link-user="${u.id}" aria-label="New setup link for ${u.name}">New setup link</button>` : ''}
          <button class="ds-button" data-variant="tertiary" data-size="sm" type="button" id="u-st-${u.id}" data-toggle-user="${u.id}"${last ? App.raw(' disabled aria-describedby="st-last-' + App.esc(u.id) + '"') : ''} aria-label="${u.active ? 'Deactivate' : 'Reactivate'} ${u.name}">${u.active ? 'Deactivate' : 'Reactivate'}</button>
        </span>
        ${setupLinkPanel(u, 'user')}
      </li>`;
    });
    return h`<section class="card-sec" id="set-staff" aria-labelledby="set-staff-h">
      <div class="sec-head">
        <h2 id="set-staff-h">Staff users</h2><span class="sec-meta">${activeCount} active</span>
        <div class="sec-end"><button class="ds-button" data-variant="secondary" data-size="sm" type="button" id="st-add">${App.icon('plus')}Add staff user</button></div>
      </div>
      ${users.length ? h`<ul class="people">${items}</ul>` : App.emptyState('No staff users.')}
    </section>`;
  }

  function settingsPage() {
    return h`<div class="page-head"><div><h1 class="page-title">Settings</h1>
        <p class="page-sub">Licence price and text, the AI provider, and staff users. Every change is written to the action log.</p></div></div>
      ${licenceSettings()}${aiSettings()}${staffSettings()}`;
  }

  function saveLicence(form) {
    const lt = App.store.settings.licenceType;
    const raw = form.elements.price.value.trim();
    const text = form.elements.text.value.replace(/\r\n/g, '\n').trim();
    let bad = setError(form, 'ls-price', /^\d+$/.test(raw) && Number(raw) > 0 ? '' : 'A paid licence needs a price above 0 USD. Use whole dollars, for example 120.');
    bad = setError(form, 'ls-text', text ? '' : 'Write the licence text. It cannot be empty.') || bad;
    if (bad) { focusFirstError(form); return; }
    const price = Number(raw);
    const priceChanged = price !== lt.price;
    const textChanged = text !== lt.text;
    if (!priceChanged && !textChanged) { ui.msg.ls = 'No changes to save.'; App.refresh('main'); focusId('ls-save'); return; }
    const notes = [];
    if (priceChanged) {
      App.log('Changed the licence price', lt.name + ': ' + lt.price + ' USD to ' + price + ' USD');
      lt.price = price;
      notes.push('Existing licences keep the price they were granted with.');
    }
    if (textChanged) {
      App.log('Changed the licence text', lt.name);
      lt.text = text;
      lt.isSample = false;
      notes.push('The new text applies to new licences only. Existing licences keep the text as it was accepted.');
    }
    lt.updatedAt = App.todayISO();
    App.save();
    ui.msg.ls = 'Saved. ' + notes.join(' ');
    App.status(ui.msg.ls);
    App.refresh('main');
    focusId('ls-save');
  }

  function saveAI(form) {
    const ai = App.store.settings.aiProvider;
    const mode = form.elements.mode.value === 'claude' ? 'claude' : 'mock';
    const model = mode === 'claude' ? form.elements.model.value.trim() : '';
    const key = form.elements.key.value.trim();
    const bad = setError(form, 'ai-key', !key || (/^\S{20,}$/.test(key)) ? '' : 'This does not look like an API key. Paste the whole key, with no spaces.');
    if (bad) { focusFirstError(form); return; }
    const changes = [];
    if (mode !== ai.mode) changes.push('provider ' + providerLabel(ai.mode) + ' to ' + providerLabel(mode));
    if (model !== (ai.model || '')) changes.push(model ? 'model set' : 'model reset to the default');
    if (key) changes.push('API key replaced');
    if (!changes.length) { ui.msg.ai = 'No changes to save.'; App.refresh('main'); focusId('ai-save'); return; }
    ai.mode = mode;
    ai.name = providerLabel(mode);
    ai.model = model;
    if (key) ai.keyMasked = maskKey(key); /* the full key is never stored in the prototype or logged */
    form.elements.key.value = '';
    App.log('Changed AI settings', changes.join('; '));
    App.save();
    let msg = 'Saved. Images uploaded from now on use ' + ai.name + '. Metadata already generated is not changed.';
    if (mode === 'claude' && !ai.keyMasked) msg += ' No key is saved here, so the key from the environment variables is used. Without a valid key, generation fails and staff fill in the fields by hand.';
    ui.msg.ai = msg;
    App.status(msg);
    App.refresh('main');
    focusId('ai-save');
  }

  function addStaff() {
    personDialog({ kind: 'user', title: 'Add a staff user', confirm: 'Add staff user',
      intro: 'You get a setup link to copy into your own email. The new user sets a password with it.',
      emailDesc: 'The email is the login.' })
      .then((v) => {
        if (!v) return;
        const u = { id: App.uid('u'), name: v.name.trim(), firstName: firstNameOf(v.name), email: v.email.trim(), role: 'staff', active: true, prefs: { captions: true } };
        App.store.users.push(u);
        App.log('Added a staff user', u.name);
        createLink('user', u);
        App.status(u.name + ' is added. Copy the setup link and send it to ' + u.firstName + '.');
        App.refresh('main');
        focusId('sl-copy');
      });
  }
  function editStaff(u) {
    personDialog({ kind: 'user', person: u, title: 'Edit ' + u.name, confirm: 'Save changes',
      emailDesc: 'The email is the login. Changing it keeps the same user and history.' })
      .then((v) => {
        if (!v) return;
        const next = { name: v.name.trim(), email: v.email.trim() };
        const changed = Object.keys(next).filter((k) => u[k] !== next[k]);
        if (!changed.length) { App.status('No changes to save.'); return; }
        Object.assign(u, next, { firstName: firstNameOf(next.name) });
        App.log('Edited a staff user', u.name + ': ' + changed.join(', '));
        App.save();
        App.status('Changes saved.');
        App.refresh('main');
        App.refresh('topbar');
        focusId('u-edit-' + u.id);
      });
  }
  function linkForStaff(u) {
    const had = openLink('user', u.id);
    const go = () => {
      const r = createLink('user', u);
      App.status('New setup link for ' + u.name + '.' + (r.cancelled ? ' The earlier link no longer works.' : ''));
      App.refresh('main');
      focusId('sl-copy');
    };
    if (!had) { go(); return; }
    App.confirm({
      title: 'Make a new setup link?',
      body: h`<p class="ds-paragraph">${u.name} has a setup link that is not used yet. A new link cancels it, so the old one stops working.</p>`,
      confirm: 'Make a new link'
    }).then((ok) => { if (ok) go(); });
  }
  function toggleStaff(u) {
    const me = App.currentUser();
    if (u.active && activeStaff().length <= 1) { /* S9 */
      App.status('The last active staff user cannot be deactivated.');
      return;
    }
    const self = me && me.id === u.id;
    const body = u.active
      ? h`<p class="ds-paragraph">${u.name} can no longer log in, from the next click.${self ? ' That is you: you are logged out.' : ''} Everything ${u.firstName} did stays in the action log.</p>`
      : h`<p class="ds-paragraph">${u.name} can log in again with the same email and password.</p>`;
    App.confirm({ title: (u.active ? 'Deactivate ' : 'Reactivate ') + u.name + '?', body, confirm: u.active ? 'Deactivate' : 'Reactivate', danger: u.active })
      .then((ok) => {
        if (!ok) return;
        if (u.active && activeStaff().length <= 1) { App.status('The last active staff user cannot be deactivated.'); return; }
        u.active = !u.active;
        if (!u.active && ui.link && ui.link.id === u.id) ui.link = null;
        App.log(u.active ? 'Reactivated a staff user' : 'Deactivated a staff user', u.name);
        App.save();
        App.status(u.name + (u.active ? ' is reactivated.' : ' is deactivated.'));
        if (self) { App.refresh(); return; } /* the router logs an inactive user out */
        App.refresh('main');
        focusId('u-st-' + u.id);
      });
  }

  App.registerScreen('/settings', {
    role: 'staff',
    title: 'Settings',
    nav: 'settings',
    render() {
      if (ui.link && ui.link.kind === 'user' && !App.find.user(ui.link.id)) ui.link = null;
      return settingsPage();
    },
    mount() {
      App.on('submit', '#set-licence', (e, form) => { e.preventDefault(); saveLicence(form); });
      App.on('submit', '#set-ai', (e, form) => { e.preventDefault(); saveAI(form); });
      App.on('change', '#ai-provider', (e, sel) => {
        const saved = App.store.settings.aiProvider.mode;
        const note = document.getElementById('ai-note');
        if (note) note.textContent = providerNote(sel.value, saved);
        const model = document.getElementById('ai-model');
        const wrap = model && model.closest('.ds-field');
        if (wrap) wrap.hidden = sel.value !== 'claude';
      });
      App.on('click', '#st-add', addStaff);
      App.on('click', '[data-edit-user]', (e, b) => editStaff(App.find.user(b.getAttribute('data-edit-user'))));
      App.on('click', '[data-link-user]', (e, b) => linkForStaff(App.find.user(b.getAttribute('data-link-user'))));
      App.on('click', '[data-toggle-user]', (e, b) => toggleStaff(App.find.user(b.getAttribute('data-toggle-user'))));
      App.on('click', '[data-copy]', (e, b) => copyLink(b));
      return () => { window.clearTimeout(copiedTimer); };
    }
  });

  /* ====================================================================
     Action log (FR-42a, FR-42b): read-only, newest first, per user
     ==================================================================== */
  function actorOptions() {
    const seen = {};
    const out = [];
    staffUsers().forEach((u) => { seen[u.id] = true; out.push({ value: u.id, label: u.name + (u.active ? '' : ' (inactive)') }); });
    App.store.actionLog.forEach((e) => {
      if (!e.actorId || seen[e.actorId]) return;
      seen[e.actorId] = true;
      out.push({ value: e.actorId, label: e.actorName + (e.actorKind === 'contact' ? ' (contact)' : '') });
    });
    return out;
  }
  function actorSub(e) {
    if (e.actorKind === 'contact') {
      const k = App.find.contact(e.actorId);
      const c = k && App.find.client(k.clientId);
      return 'Contact' + (c ? ', ' + c.name : '');
    }
    return e.actorId ? 'Staff' : 'System';
  }

  function logPage(params) {
    const q = params.query;
    const users = actorOptions();
    const user = users.some((o) => o.value === q.user) ? q.user : '';
    const actions = Array.from(new Set(App.store.actionLog.map((e) => e.action))).sort();
    const action = actions.indexOf(q.action) !== -1 ? q.action : '';
    const oldest = q.sort === 'oldest';
    let list = App.store.actionLog.slice();
    if (user) list = list.filter((e) => e.actorId === user);
    if (action) list = list.filter((e) => e.action === action);
    list.sort((a, b) => (oldest ? -1 : 1) * String(b.at).localeCompare(String(a.at)));
    const pg = App.paginate(list, q.page, LOG_PER_PAGE);
    const filtered = !!(user || action);
    const userLabel = user ? (users.find((o) => o.value === user) || {}).label : '';
    const query = (extra) => Object.assign({ user, action, sort: oldest ? 'oldest' : '' }, extra || {});

    const filters = h`<form class="adm-filters" id="log-filters" role="search" aria-label="Filter the action log" novalidate>
      ${field({ id: 'lg-user', name: 'user', type: 'select', label: 'User', value: user, options: [{ value: '', label: 'All users' }].concat(users) })}
      ${field({ id: 'lg-action', name: 'action', type: 'select', label: 'Action', value: action, options: [{ value: '', label: 'All actions' }].concat(actions.map((a) => ({ value: a, label: a }))) })}
      ${filtered ? h`<a class="ds-link adm-clear" href="#/log">Clear filters</a>` : ''}
    </form>`;

    const rows = pg.items.map((e) => h`<tr>
      <td data-label="Time" class="nowrap"><time datetime="${e.at}">${App.fmt.dateTime(e.at)}</time></td>
      <td data-label="User"><span class="two-line">${e.actorId && e.actorId !== user ? h`<a class="ds-link" href="${App.href('/log', { user: e.actorId })}" aria-label="Show only actions by ${e.actorName}">${e.actorName}</a>` : h`<span>${e.actorName}</span>`}<small>${actorSub(e)}</small></span></td>
      <td data-label="Action">${e.action}</td>
      <td data-label="Target" class="adm-detail">${e.detail || '–'}</td>
    </tr>`);
    const sortHref = App.href('/log', query({ sort: oldest ? '' : 'oldest' }));

    let body;
    if (!App.store.actionLog.length) body = App.emptyState('Nothing is logged yet. Uploads, edits, publishing, licences and settings changes appear here.');
    else if (!pg.total) body = App.emptyState('No actions match these filters.', { label: 'Clear filters', href: '#/log' });
    else {
      body = h`<section class="card-sec" aria-labelledby="log-h">
          <div class="sec-head"><h2 id="log-h">${userLabel ? 'Actions by ' + userLabel : 'All actions'}</h2><span class="sec-meta">${App.fmt.plural(pg.total, 'entry', 'entries')}</span></div>
          <div class="lic-wrap"><table class="ds-table lic-table adm-log" data-size="sm">
            <thead><tr>
              <th scope="col" aria-sort="${oldest ? 'ascending' : 'descending'}"><a class="adm-sort" href="${sortHref}">Time<span class="ds-sr-only">, ${oldest ? 'oldest first. Sort newest first' : 'newest first. Sort oldest first'}</span><span aria-hidden="true">${oldest ? ' ↑' : ' ↓'}</span></a></th>
              <th scope="col">User</th><th scope="col">Action</th><th scope="col">Target</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table></div>
        </section>
        ${App.pager({ page: pg.page, perPage: LOG_PER_PAGE, total: pg.total, hrefFor: (p) => App.href('/log', query({ page: p })) })}`;
    }

    return h`<div class="page-head"><div>
        <h1 class="page-title">Action log</h1>
        <p class="page-sub">Who did what, and when. No one can edit the log.</p>
      </div></div>
      ${filters}${body}`;
  }

  App.registerScreen('/log', {
    role: 'staff',
    title: 'Action log',
    nav: 'log',
    render: logPage,
    mount(root, params) {
      const apply = () => {
        const form = document.getElementById('log-filters');
        if (!form) return;
        setQuery('/log', { user: form.elements.user.value, action: form.elements.action.value, sort: params.query.sort === 'oldest' ? 'oldest' : '' });
      };
      App.on('change', '#log-filters', apply);
      App.on('submit', '#log-filters', (e) => { e.preventDefault(); apply(); });
    }
  });
})(window.App);
