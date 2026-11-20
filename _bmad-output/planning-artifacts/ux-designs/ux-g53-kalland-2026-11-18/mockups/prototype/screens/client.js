/* Owner: Client portal (#/overview, #/my-images, #/find, #/licences, #/cart, #/checkout, #/checkout/done).
   Spines win: ../../EXPERIENCE.md (IA client, Access and Price Display A1-A13, State Patterns,
   UJ-3) and ../../DESIGN.md (Components, Client group). Static references: ../key-screens.html
   (Client: Find images) and ../more-screens.html (Overview, Cart, Checkout, Done).
   Access and price rules come from App.access only; the client never sees place, GPS, provider,
   notes or other clients (App.access.clientFields). NFR-7 messages are used word for word. */
(function (App) {
  'use strict';
  const h = App.h;
  const PER_PAGE = 12;
  const LICENCES_PER_PAGE = 20;
  const NEW_DAYS = 30;

  /* Route-local state. Read App.store lazily; never cache it here. */
  let pendingFocus = null;   /* selector focused by the next mount (after a refresh) */
  let wallPage = 1;          /* page shown by the last wall render, kept when selecting */
  let co = null;             /* checkout state for one visit: { removed, accepted, confirmed, busy } */

  const me = () => App.currentContact();
  const org = () => App.currentClient() || { name: '' };
  const licenceType = () => App.store.settings.licenceType;
  const ltName = (id) => { const lt = licenceType(); return lt && (!id || lt.id === id) ? lt.name : 'Licence'; };
  const sel = (id) => '[data-pick][data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]';
  const usd = (n) => (n ? n + ' USD' : 'Free');

  /* Change the hash without a hashchange, then re-render the route in place
     (keeps scroll, restores focus by id; see App.refresh). */
  function go(hash) {
    if (hash !== window.location.hash) window.history.pushState(null, '', hash);
    App.refresh();
  }
  function takeFocus(root) {
    if (!pendingFocus) return;
    const el = root.querySelector(pendingFocus);
    pendingFocus = null;
    if (el) el.focus();
  }
  function focusFirst(root, selectors) {
    for (let i = 0; i < selectors.length; i++) {
      const el = root.querySelector(selectors[i]);
      if (el) { el.focus(); return; }
    }
  }
  function daysAgoISO(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    const p = (x) => String(x).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  const validDate = (s) => (/^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) ? s : '');
  const contactName = (id) => { const k = id && App.find.contact(id); return k ? k.name : 'the agency'; };
  const thumb = (image) => (image && App.access.canSee(me(), image)
    ? h`<span class="ph ${image.ph || ''}" role="img" aria-label="${App.altFor(image)}"></span>`
    : h`<span class="ph" aria-hidden="true"></span>`);
  const cartTotal = (lines) => lines.reduce((s, l) => s + (l.priceAtAdd || 0), 0);

  /* Licence text as accepted (FR-33): the licence's own snapshot, never the current text. */
  function licenceTextDialog(licenceId) {
    const c = me();
    const lic = App.find.licence(licenceId);
    if (!c || !lic || lic.clientId !== c.clientId) return;
    const image = App.find.image(lic.imageId);
    const how = lic.source === 'staff-grant'
      ? 'given to ' + org().name + ' by the agency on ' + App.fmt.date(lic.date)
      : 'accepted for ' + org().name + ' by ' + contactName(lic.contactId) + ' on ' + App.fmt.date(lic.date);
    App.dialog({
      title: 'Licence text: ' + App.imageTitle(image),
      className: 'terms-dlg',
      body: h`<p class="hint">${ltName(lic.licenceTypeId)}, ${how}. This is the text as it was accepted.</p>${App.licenceTermsHTML(lic.textSnapshot)}`,
      actions: [{ label: 'Close', value: null, variant: 'secondary' }]
    });
  }

  /* ==================================================================
     Find images and My images (same layout; FR-28, FR-29)
     ================================================================== */
  function wallState(kind, params) {
    const c = me();
    const q = params.query || {};
    const f = {
      q: kind === 'find' ? String(q.q || '').trim() : '',
      mine: kind === 'find' && q.mine === '1',
      free: q.free === '1',
      paid: q.paid === '1',
      from: validDate(q.from),
      to: validDate(q.to)
    };
    const base = kind === 'find'
      ? App.access.visibleImages(c)
      : App.access.ownImages(c.clientId).filter((im) => App.access.canSee(c, im));
    let list = base;
    if (f.q) list = App.search.images(list, f.q, { viewer: 'client' });
    if (f.mine) list = list.filter((im) => App.access.isOwn(c.clientId, im));
    /* Price as the contact sees it: Free = no payment needed (free or own), Paid = can be bought. */
    if (f.free !== f.paid) list = list.filter((im) => (f.paid ? App.access.canBuy(c, im) : !App.access.canBuy(c, im)));
    if (f.from || f.to) {
      list = list.filter((im) => {
        const d = String(im.dateTaken || '').slice(0, 10);
        return !!d && (!f.from || d >= f.from) && (!f.to || d <= f.to);
      });
    }
    return { c, f, base, list, active: !!(f.q || f.mine || f.free || f.paid || f.from || f.to) };
  }
  const basePath = (kind) => (kind === 'find' ? '/find' : '/my-images');
  function queryWithout(params, keys) {
    const out = Object.assign({}, params.query || {});
    keys.forEach((k) => delete out[k]);
    return out;
  }
  function currentWallHref(kind, params, extra) {
    const path = basePath(kind) + (params.imageId ? '/' + encodeURIComponent(params.imageId) : '');
    return App.href(path, Object.assign(queryWithout(params, ['page']), extra || {}));
  }

  function wallSidebar(kind) {
    return function (params) {
      const s = wallState(kind, params);
      const f = s.f;
      const cl = org();
      const ownCount = App.access.ownImages(s.c.clientId).filter((im) => App.access.canSee(s.c, im)).length;
      const badRange = f.from && f.to && f.from > f.to;
      const chip = (key, label) => h`<label class="ds-chip"><input class="ds-input" type="checkbox" id="${kind}-f-${key}" data-filter="${key}"${f[key] ? App.raw(' checked') : ''}> ${label}</label>`;
      return h`<section class="side-sec side-context" aria-labelledby="${kind}-f-h">
        <h2 id="${kind}-f-h">Filters</h2>
        ${kind === 'find' ? h`<div class="group"><ds-field class="ds-field" data-size="sm">
          <input class="ds-input" type="checkbox" role="switch" id="find-f-mine" data-filter="mine"${f.mine ? App.raw(' checked') : ''}>
          <label class="ds-label" data-weight="regular" for="find-f-mine">Only my images</label>
        </ds-field></div>` : ''}
        <div class="group" role="group" aria-labelledby="${kind}-f-price">
          <h3 id="${kind}-f-price">Price</h3>
          <div class="chips">${chip('free', 'Free')}${chip('paid', 'Paid')}</div>
        </div>
        <div class="group">
          <fieldset class="daterange ds-fieldset" data-size="sm">
            <legend class="grp">Date taken</legend>
            <div class="dr-row"><label class="ds-label" data-weight="regular" for="${kind}-f-from">From</label><input class="ds-input" id="${kind}-f-from" type="date" data-filter="from" value="${f.from}"></div>
            <div class="dr-row"><label class="ds-label" data-weight="regular" for="${kind}-f-to">To</label><input class="ds-input" id="${kind}-f-to" type="date" data-filter="to" value="${f.to}"${badRange ? App.raw(' aria-invalid="true" aria-describedby="' + kind + '-f-range"') : ''}></div>
            ${badRange ? h`<p class="ds-validation-message cl-range-err" data-field="validation" id="${kind}-f-range">The From date is after the To date. Change one of them to see images.</p>` : ''}
          </fieldset>
        </div>
        <div class="group">
          <h3>Your images</h3>
          <p class="hint">${ownCount
            ? h`<span class="own-inline"><span class="own" aria-hidden="true">${App.icon('check')}</span>${App.fmt.plural(ownCount, 'image')}</span> belong to ${cl.name}. Download them as often as you need.`
            : h`${cl.name} has no images of its own yet.`}</p>
        </div>
      </section>`;
    };
  }

  function activeChips(f) {
    const out = [];
    const chip = (key, label, aria) => h`<button class="ds-chip" type="button" data-removable="true" data-remove-filter="${key}" aria-label="${aria}">${label}</button>`;
    if (f.q) out.push(chip('q', 'Search: ' + f.q, 'Remove search: ' + f.q));
    if (f.mine) out.push(chip('mine', 'Only my images', 'Remove filter: only my images'));
    if (f.free) out.push(chip('free', 'Free', 'Remove filter: free'));
    if (f.paid) out.push(chip('paid', 'Paid', 'Remove filter: paid'));
    if (f.from) out.push(chip('from', 'Taken from ' + App.fmt.date(f.from), 'Remove filter: taken from ' + App.fmt.date(f.from)));
    if (f.to) out.push(chip('to', 'Taken until ' + App.fmt.date(f.to), 'Remove filter: taken until ' + App.fmt.date(f.to)));
    return out;
  }

  function wallRender(kind) {
    return function (params) {
      const s = wallState(kind, params);
      const cl = org();
      const query = params.query || {};
      let page = query.page;
      if (!page && params.imageId) {
        const i = s.list.findIndex((im) => im.id === params.imageId);
        if (i >= 0) page = Math.floor(i / PER_PAGE) + 1;
      }
      const pg = App.paginate(s.list, page, PER_PAGE);
      wallPage = pg.page;
      const title = kind === 'find' ? 'Find images' : 'My images';

      if (!s.base.length) {
        const empty = kind === 'find'
          ? App.emptyState('No images are available to ' + cl.name + ' yet. The agency adds them here.')
          : App.emptyState(cl.name + ' has no images of its own yet. Images the agency makes for you, and images you license, show up here.', { label: 'Find images', href: '#/find' });
        return h`<h1 class="page-title">${title}</h1>${empty}`;
      }

      const what = kind === 'find'
        ? (s.active ? 'match your search and filters' : 'you can see')
        : (s.active ? 'match your filters' : 'that belong to ' + cl.name);
      const toolbar = h`<div class="toolbar-meta">
        <span><span class="count" id="${kind}-count" tabindex="-1">${App.fmt.plural(s.list.length, 'image')}</span> ${what}, newest first</span>
        ${activeChips(s.f)}
        <span class="spacer"></span>
        ${App.captionsSwitch(kind)}
      </div>`;
      const body = s.list.length
        ? h`${App.wall(pg.items, { label: title, selectedId: params.imageId, viewer: 'client', contact: s.c })}${App.pager({
            page: pg.page, perPage: PER_PAGE, total: pg.total,
            hrefFor: (p) => App.href(basePath(kind), Object.assign(queryWithout(params, ['page']), { page: p }))
          })}`
        : App.emptyState('No images match your search and filters.', { label: 'Clear filters', attrs: 'data-clear-filters' });
      return h`<h1 class="ds-sr-only">${title}</h1>${toolbar}${body}`;
    };
  }

  function wallDetails(params) {
    if (!params.imageId) {
      return h`<div class="panel-body"><p class="hint cl-no-pick">Select an image to see its licence, details and download.</p></div>`;
    }
    const image = App.find.image(params.imageId);
    return image ? imagePanel(image) : '';
  }

  /* The client Details panel: Access and Price Display table (A1, A2/A5, own rows). */
  function imagePanel(image) {
    const c = me();
    const cl = org();
    const lt = licenceType();
    const row = App.access.row(c.clientId, image);
    const own = App.access.isOwn(c.clientId, image);
    const lic = App.access.activeLicence(c.clientId, image.id);
    const buy = App.access.canBuy(c, image);
    const inCart = buy && App.cart.has(c.id, image.id);
    const im = App.access.clientFields(image); /* FR-30: no place, GPS, provider, notes, clients */
    /* A1 after its first download: own layout, without the tick (spine, Access and Price Display). */
    const quietOwn = own && row === 'A3' && !image.price && lic && lic.source === 'free-download';
    const tick = own && !quietOwn;
    const termsNote = row === 'A1' || (own && !lic);
    const termsLink = (label) => h`<button type="button" class="ds-link cl-small" data-licence-terms>${label}</button>`;

    const sub = own
      ? (tick ? h`<span class="own-inline"><span class="own" aria-hidden="true">${App.icon('check')}</span>Your image</span>` : 'Your image')
      : buy ? 'Preview, up to 800 px' : 'Free to download';

    let licCard;
    if (buy) {
      licCard = h`<div class="licence-opt"><div class="top"><span>${lt.name}</span>${App.price(im.price, { lg: true })}</div>
        <p>Use in print, web and social media for ${cl.name}. The price excludes VAT.</p>${termsLink('Read the licence terms')}</div>`;
    } else if (own) {
      const madeFor = image.visibility === 'restricted' && (image.clients || []).indexOf(c.clientId) !== -1;
      let line;
      if (!lic || madeFor) line = 'Made for ' + cl.name + '. Download it as often as you need.';
      else if (lic.source === 'purchase') line = 'Licensed to ' + cl.name + ' on ' + App.fmt.date(lic.date) + '. Download it as often as you need.';
      else if (lic.source === 'staff-grant') line = 'Given to ' + cl.name + ' by the agency on ' + App.fmt.date(lic.date) + '. Download it as often as you need.';
      else line = 'Free for ' + cl.name + ' since ' + App.fmt.date(lic.date) + '. Download it as often as you need.';
      licCard = h`<div class="licence-opt"><div class="top"><span>${lic ? ltName(lic.licenceTypeId) : lt.name}</span>${App.price(lic ? lic.price : 0, { lg: true })}</div>
        <p>${line}</p>${lic ? h`<button type="button" class="ds-link cl-small" data-lic-text="${lic.id}">Read the licence text</button>` : ''}</div>`;
    } else {
      licCard = h`<div class="licence-opt"><div class="top"><span>${lt.name}</span>${App.price(0, { lg: true })}</div>
        <p>Free for ${cl.name}. The first download records a free licence.</p></div>`;
    }

    const about = [];
    if (im.altText) about.push(h`<dt>Alt text</dt><dd>${im.altText}</dd>`);
    if (im.dateTaken) about.push(h`<dt>Date taken</dt><dd>${App.fmt.date(im.dateTaken)}</dd>`);
    if ((im.keywords || []).length) about.push(h`<dt>Keywords</dt><dd>${im.keywords.join(', ')}</dd>`);
    const tech = [];
    const camera = [im.camera, im.lens].filter(Boolean).join(', ');
    if (camera) tech.push(h`<dt>Camera</dt><dd>${camera}</dd>`);
    if (App.fmt.exposure(im)) tech.push(h`<dt>Exposure</dt><dd>${App.fmt.exposure(im)}</dd>`);
    if (im.size && im.size.w) tech.push(h`<dt>Size</dt><dd>${App.fmt.pixels(im)}</dd>`);
    if (im.size && im.size.bytes) tech.push(h`<dt>Download</dt><dd>${im.size.format}, ${App.fmt.bytes(im.size.bytes)}${buy ? ' after purchase' : ''}</dd>`);

    const lines = App.cart.lines(c.id);
    const cartMini = lines.length
      ? h`<div class="cart-mini"><span>Cart: ${App.fmt.plural(lines.length, 'image')}, ${App.price(cartTotal(lines))}</span><a class="ds-link" href="#/checkout">Go to checkout</a></div>`
      : '';
    let foot;
    if (buy && inCart) {
      foot = h`<p class="cl-in-cart">${App.statusTag('in-cart')}<a class="ds-link" href="#/cart" id="cl-cart-link">Go to the cart</a></p>${cartMini}`;
    } else if (buy) {
      foot = h`<button class="ds-button" data-variant="primary" type="button" data-add-cart="${image.id}">${App.icon('cart')}Add to cart</button>${cartMini}`;
    } else {
      foot = h`<button class="ds-button" data-variant="primary" type="button" id="cl-download" data-download="${image.id}">${App.icon('download')}Download</button>${
        termsNote ? h`<p class="note">Downloading accepts the licence terms. ${termsLink('Read the terms')}</p>` : ''}`;
    }

    return h`<div class="panel-body">
      <div class="insp-head"><div><h2>${App.imageTitle(im)}</h2><div class="file">${sub}</div></div></div>
      <div class="loupe">${tick ? App.ownTick() : ''}<span class="ph ${App.loupeClass(im)} ${im.ph || ''}" role="img" aria-label="${App.altFor(im)}"></span></div>
      <section class="insp-sec" aria-labelledby="cl-lic-h"><h3 id="cl-lic-h">Licence</h3>${licCard}</section>
      ${im.description || about.length ? h`<section class="insp-sec" aria-labelledby="cl-about-h"><h3 id="cl-about-h">About the image</h3>${
        im.description ? h`<p class="desc">${im.description}</p>` : ''}${about.length ? h`<dl class="facts">${about}</dl>` : ''}</section>` : ''}
      ${tech.length ? h`<section class="insp-sec" aria-labelledby="cl-tech-h"><h3 id="cl-tech-h">Technical details</h3><dl class="facts">${tech}</dl></section>` : ''}
      <div class="insp-pad"></div>
      <div class="insp-foot">${foot}</div>
    </div>`;
  }

  function closeWallDetails(kind) {
    const cur = App.current();
    const params = cur ? cur.params : { query: {} };
    if (params.imageId) pendingFocus = sel(params.imageId);
    go(App.href(basePath(kind), Object.assign(queryWithout(params, ['page']), { page: wallPage > 1 ? wallPage : '' })));
  }

  function download(imageId) {
    const c = me();
    const image = App.find.image(imageId);
    const res = App.licences.download(c, imageId);
    if (!res.ok) {
      App.status(App.imageTitle(image) + ' is no longer available to download. Contact the agency if you need it.');
      return res;
    }
    if (res.firstDownload) {
      App.status('Downloading ' + App.imageTitle(image) + '. A free licence is now recorded for ' + org().name + ', and the image is yours to download any time.');
    }
    return res;
  }

  function wallMount(kind) {
    return function (root, params) {
      const pick = params.imageId ? root.querySelector(sel(params.imageId)) : null;
      App.details.place(pick);
      takeFocus(root);

      App.on('click', '[data-pick]', (e, el) => {
        const id = el.getAttribute('data-id');
        if (id === params.imageId) {
          if (App.details.isInline()) closeWallDetails(kind);
          return;
        }
        pendingFocus = sel(id);
        go(App.href(basePath(kind) + '/' + encodeURIComponent(id), Object.assign(queryWithout(params, ['page']), { page: wallPage > 1 ? wallPage : '' })));
      });
      App.on('change', '[data-filter]', (e, el) => {
        const key = el.getAttribute('data-filter');
        const value = el.type === 'checkbox' ? (el.checked ? '1' : '') : validDate(el.value);
        const query = queryWithout(params, ['page', key]);
        if (value) query[key] = value;
        go(App.href(basePath(kind), query));
      });
      App.on('click', '[data-remove-filter]', (e, el) => {
        const key = el.getAttribute('data-remove-filter');
        pendingFocus = '#' + kind + '-count';
        go(App.href(basePath(kind) + (params.imageId ? '/' + encodeURIComponent(params.imageId) : ''), queryWithout(params, ['page', key])));
        App.status('Filter removed.');
      });
      App.on('click', '[data-clear-filters]', () => {
        pendingFocus = '#' + kind + '-count';
        go(App.href(basePath(kind), {}));
        App.status('Filters cleared.');
      });
      bindPanelActions();
    };
  }

  /* Add to cart, Download and the licence text in the client Details panel (walls and Overview). */
  function bindPanelActions() {
      App.on('click', '[data-add-cart]', (e, el) => {
        const c = me();
        const id = el.getAttribute('data-add-cart');
        const image = App.find.image(id);
        if (!App.cart.add(c.id, id)) {
          App.status(App.imageTitle(image) + ' cannot be added to the cart.');
          App.refresh();
          return;
        }
        App.log('Added to cart', App.imageTitle(image));
        pendingFocus = '#cl-cart-link';
        App.refresh();
        App.status(App.imageTitle(image) + ' is in your cart. The cart has ' + App.fmt.plural(App.cart.count(c.id), 'image') + '.');
      });
      App.on('click', '[data-download]', (e, el) => {
        download(el.getAttribute('data-download'));
        pendingFocus = '#cl-download';
        App.refresh();
      });
      App.on('click', '[data-lic-text]', (e, el) => licenceTextDialog(el.getAttribute('data-lic-text')));
  }

  function registerWall(kind) {
    const def = {
      role: 'client',
      title: kind === 'find' ? 'Find images' : 'My images',
      nav: kind === 'find' ? 'find' : 'my-images',
      sidebar: wallSidebar(kind),
      sidebarLabel: 'Filters',
      sidebarToggleLabel: 'Show or hide filters',
      render: wallRender(kind),
      details: wallDetails,
      detailsLabel: 'Selected image',
      onCloseDetails: () => closeWallDetails(kind),
      mount: wallMount(kind)
    };
    App.registerScreen(basePath(kind), def);
    App.registerScreen(basePath(kind) + '/:imageId', def);
  }
  registerWall('find');
  registerWall('mine');

  /* ==================================================================
     Overview (FR-38a, FR-38b)
     ================================================================== */
  /* Selecting an image on the Overview (new images, own-image strip, licence rows) opens it in
     the Details panel on the Overview itself; the page never navigates away. Selecting the same
     image again closes the panel. No selection: no panel. */
  function overviewDetails(params) {
    const image = params.imageId && App.find.image(params.imageId);
    return image && App.access.canSee(me(), image) ? imagePanel(image) : '';
  }
  function overviewGo(imageId, focus) {
    pendingFocus = focus;
    go(imageId ? '#/overview/' + encodeURIComponent(imageId) : '#/overview');
  }
  const overviewDef = {
    role: 'client',
    title: 'Overview',
    nav: 'overview',
    details: overviewDetails,
    detailsLabel: 'Selected image',
    inlineDetails: false,
    onCloseDetails() { const cur = App.current(); overviewGo(null, cur && cur.params.imageId ? sel(cur.params.imageId) : null); },
    mount(root, params) {
      takeFocus(root);
      /* below 1240 px the panel sits under the page: bring it into view (after the shell's focus) */
      const panel = params.imageId && App.isTight() && document.getElementById('app-details');
      if (panel) window.requestAnimationFrame(() => panel.scrollIntoView({ block: 'start' }));
      App.on('click', '#main [data-pick], #main [data-ov-pick]', (e, el) => {
        e.preventDefault();
        const id = el.getAttribute('data-id') || el.getAttribute('data-ov-pick');
        const focus = el.id ? '#' + el.id : '.wall ' + sel(id);
        overviewGo(id === params.imageId ? null : id, focus);
      });
      bindPanelActions();
    },
    render(params) {
      const c = me();
      const cl = org();
      const visible = App.access.visibleImages(c);
      /* FR-38a: since the last login or the last 30 days, whichever is longer. The data has no
         "made visible" date, so the image's createdAt stands in for it. */
      const thirty = daysAgoISO(NEW_DAYS);
      const lastLogin = String(c.prevLoginAt || '').slice(0, 10);
      const since = lastLogin && lastLogin < thirty ? lastLogin : thirty;
      const fresh = visible.filter((im) => String(im.createdAt).slice(0, 10) >= since);
      const own = App.access.ownImages(c.clientId).filter((im) => App.access.canSee(c, im));
      const lics = App.licences.forClient(c.clientId);
      const cart = App.cart.lines(c.id);
      const showLast = lastLogin && lastLogin < App.todayISO();
      const period = since === thirty ? 'in the last 30 days' : 'since your last login';

      const newSec = h`<section class="ov-sec" aria-labelledby="ov-new-h">
        <div class="ov-head"><h2 id="ov-new-h">New for ${cl.name}</h2>${fresh.length
          ? h`<p>${App.fmt.plural(fresh.length, 'image')} the agency made available to you ${period}</p><a class="ds-link" href="#/find">See them in Find images</a>`
          : ''}</div>
        ${fresh.length
          ? App.wall(fresh.slice(0, 8), { label: 'New images', viewer: 'client', contact: c, selectedId: params.imageId })
          : App.emptyState('No new images ' + period + '.', { label: 'Find images', href: '#/find' })}
      </section>`;

      const ownSec = h`<section class="ov-sec" aria-labelledby="ov-own-h">
        <div class="ov-head"><h2 id="ov-own-h">Your images</h2>${own.length
          ? h`<p>${App.fmt.plural(own.length, 'image')} ${cl.name} can download as often as it needs</p><a class="ds-link" href="#/my-images">See all in My images</a>`
          : ''}</div>
        ${own.length
          ? h`<ul class="strip" aria-label="Your newest images">${own.slice(0, 8).map((im) => h`<li><a class="cl-strip-link ds-focus" href="#/overview/${encodeURIComponent(im.id)}" id="${'ov-strip-' + im.id}" data-ov-pick="${im.id}"${im.id === params.imageId ? App.raw(' aria-current="true"') : ''}>${App.ownTick()}<span class="ph ${im.ph || ''}" role="img" aria-label="${App.altFor(im)}"></span></a></li>`)}</ul>`
          : App.emptyState(cl.name + ' has no images of its own yet. Images the agency makes for you, and images you license, show up here.', { label: 'Find images', href: '#/find' })}
      </section>`;

      const licRows = lics.slice(0, 4).map((l) => {
        const im = App.find.image(l.imageId);
        const who = l.source === 'staff-grant' ? 'given by the agency' : contactName(l.contactId);
        const title = App.access.canSee(c, im)
          ? h`<a class="ds-link" href="#/overview/${encodeURIComponent(im.id)}" id="${'ov-lic-' + l.id}" data-ov-pick="${im.id}"${im.id === params.imageId ? App.raw(' aria-current="true"') : ''}>${App.imageTitle(im)}</a>`
          : App.imageTitle(im);
        return h`<li><span class="mini">${thumb(im)}</span><span class="r-main"><b>${title}</b><span>${App.fmt.date(l.date)}, ${who}</span></span><span class="r-end">${l.revoked ? App.statusTag('removed') : App.price(l.price)}</span></li>`;
      });
      const licSec = h`<section class="card-sec" aria-labelledby="ov-lic-h">
        <div class="sec-head"><h2 id="ov-lic-h">Licences</h2><span class="sec-meta">${lics.length} for ${cl.name}</span>${lics.length ? h`<div class="sec-end"><a class="ds-link" href="#/licences">See all licences</a></div>` : ''}</div>
        ${lics.length ? h`<ul class="rows">${licRows}</ul>` : App.emptyState(cl.name + ' has no licences yet. You get one when you download a free image or check out.', { label: 'Find images', href: '#/find' })}
      </section>`;

      /* FR-38b: the 10 newest licences and downloads by the client's contacts. */
      const events = [];
      lics.forEach((l) => {
        if (!l.contactId) return;
        events.push({ at: l.date, who: contactName(l.contactId), text: (l.price ? 'got a licence for ' : 'got a free licence for ') + App.imageTitle(App.find.image(l.imageId)) });
      });
      App.store.downloads.filter((d) => d.clientId === c.clientId).forEach((d) => {
        events.push({ at: d.at, who: contactName(d.contactId), text: 'downloaded ' + App.imageTitle(App.find.image(d.imageId)) });
      });
      events.sort((a, b) => String(b.at).localeCompare(String(a.at)));
      const actSec = h`<section class="card-sec" aria-labelledby="ov-act-h">
        <div class="sec-head"><h2 id="ov-act-h">Recent activity</h2><span class="sec-meta">Licences and downloads by ${cl.name}'s contacts</span></div>
        ${events.length
          ? h`<ol class="act">${events.slice(0, 10).map((ev) => h`<li><time datetime="${String(ev.at).slice(0, 10)}">${App.fmt.day(ev.at)}</time><span><b>${ev.who}</b> ${ev.text}</span></li>`)}</ol>`
          : App.emptyState('No licences or downloads yet.')}
      </section>`;

      return h`<div class="page-head">
          <div>
            <h1 class="page-title">${showLast ? 'Welcome back' : 'Welcome'}, ${c.firstName}</h1>
            <p class="page-sub">${cl.name}.${showLast ? ' Your last login was ' + App.fmt.date(c.prevLoginAt) + '.' : ''}</p>
            ${cart.length ? h`<p class="page-sub">Your cart has ${App.fmt.plural(cart.length, 'image')}, ${App.price(cartTotal(cart))}. <a class="ds-link" href="#/cart">Go to the cart</a></p>` : ''}
          </div>
          <div class="head-actions">
            <a class="ds-button" data-variant="secondary" href="#/my-images">${App.icon('mine')}My images</a>
            <a class="ds-button" data-variant="primary" href="#/find">${App.icon('find')}Find images</a>
          </div>
        </div>
        ${newSec}${ownSec}
        <div class="ov-cols">${licSec}${actSec}</div>`;
    }
  };
  App.registerScreen('/overview', overviewDef);
  App.registerScreen('/overview/:imageId', overviewDef);

  /* ==================================================================
     Licences, client history (FR-33)
     ================================================================== */
  App.registerScreen('/licences', {
    role: 'client',
    title: 'Licences',
    render(params) {
      const c = me();
      const cl = org();
      const lics = App.licences.forClient(c.clientId);
      const head = h`<div class="page-head"><div><h1 class="page-title">Licences</h1>
        <p class="page-sub">Every licence ${cl.name} holds, from all its contacts, newest first. A licence belongs to ${cl.name}, not to the contact who got it.</p></div></div>`;
      if (!lics.length) {
        return h`${head}${App.emptyState(cl.name + ' has no licences yet. You get one when you download a free image or check out.', { label: 'Find images', href: '#/find' })}`;
      }
      const pg = App.paginate(lics, (params.query || {}).page, LICENCES_PER_PAGE);
      const rows = pg.items.map((l) => {
        const im = App.find.image(l.imageId);
        const title = App.imageTitle(im);
        const canOpen = !l.revoked && im && App.access.canSee(c, im) && App.access.isOwn(c.clientId, im);
        return h`<tr>
          <td class="td-img"><span class="img-cell"><span class="mini">${thumb(im)}</span>${canOpen ? h`<a class="ds-link" href="#/my-images/${encodeURIComponent(im.id)}">${title}</a>` : title}</span></td>
          <td data-label="Licence">${ltName(l.licenceTypeId)}</td>
          <td data-label="Price">${App.price(l.price)}</td>
          <td data-label="Date" class="nowrap">${App.fmt.date(l.date)}</td>
          <td data-label="Contact">${l.source === 'staff-grant' ? 'Given by the agency' : contactName(l.contactId)}</td>
          <td data-label="Status">${l.revoked ? App.statusTag('removed') : App.statusTag('active')}</td>
          <td class="td-act"><button class="ds-button" data-variant="tertiary" data-size="sm" type="button" data-lic-text="${l.id}" aria-label="Read the licence text for ${title}">Licence text</button></td>
        </tr>`;
      });
      return h`${head}<section class="card-sec" aria-labelledby="cl-lics-h">
        <div class="sec-head"><h2 id="cl-lics-h">Licence history</h2><span class="sec-meta">${App.fmt.plural(lics.length, 'licence')}</span></div>
        <div class="lic-wrap"><table class="ds-table lic-table" data-size="sm">
          <thead><tr><th scope="col">Image</th><th scope="col">Licence</th><th scope="col">Price</th><th scope="col">Date</th><th scope="col">Contact</th><th scope="col">Status</th><th scope="col"><span class="ds-sr-only">Licence text</span></th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
      </section>
      ${App.pager({ page: pg.page, perPage: LICENCES_PER_PAGE, total: pg.total, hrefFor: (p) => App.href('/licences', { page: p }) })}`;
    },
    mount() {
      App.on('click', '[data-lic-text]', (e, el) => licenceTextDialog(el.getAttribute('data-lic-text')));
    }
  });

  /* ==================================================================
     Cart (FR-31)
     ================================================================== */
  function hideEmptyAside(root) {
    const aside = root.querySelector('#app-details');
    const ws = root.querySelector('.workspace');
    const empty = !App.cart.count(me().id);
    if (aside) aside.hidden = empty;
    if (ws) ws.classList.toggle('no-insp', empty);
  }

  App.registerScreen('/cart', {
    role: 'client',
    title: 'Cart',
    render() {
      const c = me();
      const cl = org();
      const lt = licenceType();
      const lines = App.cart.lines(c.id);
      const others = App.store.contacts.some((k) => k.clientId === c.clientId && k.id !== c.id && k.active);
      const head = h`<div class="page-head"><div><h1 class="page-title">Cart</h1>
        <p class="page-sub">Your cart is kept when you log out. Only you see it${others ? h`; the other ${cl.name} contacts have their own` : ''}.</p></div></div>`;
      if (!lines.length) {
        return h`${head}<div class="empty">${App.icon('cart')}<h2>Your cart is empty</h2>
          <p>Add paid images from Find images. Your own images and free images are downloaded straight from the image, so they never go in the cart.</p>
          <a class="ds-button" data-variant="primary" href="#/find">${App.icon('find')}Find images</a></div>`;
      }
      const items = lines.map((l) => {
        const im = App.find.image(l.imageId);
        const title = App.imageTitle(im);
        return h`<li class="cline">
          <span class="cthumb">${thumb(im)}</span>
          <span class="cl-info"><b>${title}</b><span class="lic">${lt.name}, added ${App.fmt.date(l.addedAt)}</span><button type="button" class="ds-link" data-licence-terms>Read the licence terms</button></span>
          <span class="cl-end">${App.price(l.priceAtAdd, { lg: true })}<button class="ds-button" data-variant="tertiary" data-size="sm" type="button" data-remove="${l.imageId}" aria-label="Remove ${title} from the cart">Remove</button></span>
        </li>`;
      });
      return h`${head}<section class="card-sec" aria-labelledby="cart-h">
        <div class="sec-head"><h2 id="cart-h" tabindex="-1">Images to license</h2><span class="sec-meta">${App.fmt.plural(lines.length, 'image')}</span></div>
        <ul class="lines">${items}</ul>
      </section>`;
    },
    details() {
      const c = me();
      const cl = org();
      const lines = App.cart.lines(c.id);
      return h`<div class="panel-body">
        <div class="insp-head"><div><h2>Summary</h2></div></div>
        <section class="insp-sec" aria-label="Totals"><dl class="sum">
          <div><dt>Images</dt><dd>${lines.length}</dd></div>
          <div><dt>Licence</dt><dd>${licenceType().name}</dd></div>
          <div class="total"><dt>Total, ex VAT</dt><dd>${App.price(cartTotal(lines), { lg: true })}</dd></div>
        </dl></section>
        <section class="insp-sec"><p class="hint">There is no payment in the portal. At checkout you accept the licence terms, and ${cl.name} gets one licence per image.</p></section>
        <div class="insp-foot sum-foot">
          <a class="ds-button wide" data-variant="primary" href="#/checkout">Go to checkout</a>
          <a class="ds-link" href="#/find">Keep looking in Find images</a>
        </div>
      </div>`;
    },
    detailsLabel: 'Cart summary',
    inlineDetails: false,
    mount(root) {
      hideEmptyAside(root);
      App.on('click', '[data-remove]', (e, el) => {
        const c = me();
        const id = el.getAttribute('data-remove');
        const all = Array.prototype.slice.call(root.querySelectorAll('[data-remove]'));
        const idx = all.indexOf(el);
        const title = App.imageTitle(App.find.image(id));
        if (!App.cart.remove(c.id, id)) return;
        App.refresh('main');
        App.refresh('details');
        hideEmptyAside(root);
        const left = root.querySelectorAll('[data-remove]');
        if (left.length) left[Math.min(idx, left.length - 1)].focus();
        else focusFirst(root, ['.empty a', '#main']);
        App.status(title + ' was removed from your cart.' + (left.length ? '' : ' Your cart is empty.'));
      });
    }
  });

  /* ==================================================================
     Checkout (FR-32): re-check every line on entry and on confirm
     ================================================================== */
  /* Removes lines that are no longer visible, now free or already held, and returns the messages. */
  function recheck() {
    const c = me();
    const cl = org();
    const notes = [];
    App.cart.lines(c.id).slice().forEach((line) => {
      const im = App.find.image(line.imageId);
      const title = App.imageTitle(im);
      let why = null;
      if (!im || !App.access.canSee(c, im)) why = 'it is no longer available';
      else if (App.access.activeLicence(c.clientId, im.id)) why = cl.name + ' already has a licence for it';
      else if (!App.access.canBuy(c, im)) why = 'it is now free. Download it from Find images';
      if (why) {
        App.cart.remove(c.id, line.imageId);
        notes.push(title + ' was removed from your cart: ' + why + '.');
      }
    });
    return notes;
  }
  function ensureCo() {
    if (!co) co = { removed: recheck(), accepted: false, confirmed: {}, busy: false };
    return co;
  }
  function checkoutItems() {
    return App.cart.lines(me().id).map((line) => {
      const im = App.find.image(line.imageId);
      const conf = co.confirmed[line.imageId];
      const pending = !!im && im.price !== line.priceAtAdd;
      return { line, im, pending, from: pending ? line.priceAtAdd : conf ? conf.from : null };
    });
  }
  function blockReason(items) {
    const pending = items.some((it) => it.pending);
    if (!items.length) return 'Your cart is empty. Add images from Find images first.';
    if (pending && !co.accepted) return 'Confirm the new price and accept the licence terms to continue.';
    if (pending) return 'Confirm the new price first. Then you can get the licences.';
    if (!co.accepted) return 'Accept the licence terms to continue.';
    return '';
  }

  App.registerScreen('/checkout', {
    role: 'client',
    title: 'Check out',
    render() {
      ensureCo();
      const cl = org();
      const lt = licenceType();
      const items = checkoutItems();
      const pending = items.filter((it) => it.pending);
      const crumbs = h`<nav class="ds-breadcrumbs cl-crumbs" aria-label="You are here"><ol><li><a class="ds-link" href="#/cart">Cart</a></li><li><a class="ds-link" href="#/checkout" aria-current="page">Check out</a></li></ol></nav>`;
      const head = h`<div class="page-head"><div><h1 class="page-title">Check out</h1>
        <p class="page-sub">Each image is checked again when you confirm. Nothing is recorded until then.</p></div></div>`;
      const removed = co.removed.length
        ? h`<div class="ds-alert ctx-top" data-color="warning" id="co-removed" tabindex="-1">
            <h2 class="ds-heading" data-size="xs">${co.removed.length === 1 ? 'One image was removed from your cart' : co.removed.length + ' images were removed from your cart'}</h2>
            ${co.removed.map((m) => h`<p class="ds-paragraph">${m}</p>`)}
          </div>`
        : '';
      if (!items.length) {
        return h`${crumbs}${head}${removed}<div class="empty">${App.icon('cart')}<h2>Your cart is empty</h2>
          <p>There is nothing to check out. Add paid images from Find images.</p>
          <a class="ds-button" data-variant="primary" href="#/find">${App.icon('find')}Find images</a></div>`;
      }
      const changed = pending.length
        ? h`<div class="ds-alert ctx-top" data-color="warning" id="co-change" tabindex="-1">
            <h2 class="ds-heading" data-size="xs">${pending.length === 1 ? 'One price has changed' : pending.length + ' prices have changed'}</h2>
            ${pending.map((it) => {
              const title = App.imageTitle(it.im);
              return h`<div class="cl-change"><p class="ds-paragraph">The price of ${title} has changed from ${it.line.priceAtAdd} to ${it.im.price} USD. Confirm to continue.</p>
                <div class="dlg-actions">
                  <button class="ds-button" data-variant="primary" data-size="sm" type="button" data-accept-price="${it.im.id}"${pending.length > 1 ? App.raw(' aria-label="Confirm new price for ' + App.esc(title) + '"') : ''}>Confirm new price</button>
                  <button class="ds-button" data-variant="secondary" data-size="sm" type="button" data-drop="${it.im.id}" aria-label="Remove ${title} from the cart">Remove it from the cart</button>
                </div></div>`;
            })}
          </div>`
        : '';
      const lines = items.map((it) => h`<li class="cline">
          <span class="cthumb">${thumb(it.im)}</span>
          <span class="cl-info"><b>${App.imageTitle(it.im)}</b><span class="lic">${lt.name}</span></span>
          <span class="cl-end">
            ${it.pending ? App.statusTag('price-changed') : ''}
            ${it.from != null ? h`<s aria-label="Old price ${usd(it.from)}">${usd(it.from)}</s>` : ''}
            ${App.price(it.im.price, { lg: true })}
          </span>
        </li>`);
      return h`${crumbs}${head}${removed}${changed}
        <section class="card-sec" aria-labelledby="co-img-h">
          <div class="sec-head"><h2 id="co-img-h">Images</h2><span class="sec-meta">${App.fmt.plural(items.length, 'image')}</span><div class="sec-end"><a class="ds-link" href="#/cart">Edit cart</a></div></div>
          <ul class="lines">${lines}</ul>
        </section>
        <section class="card-sec" aria-labelledby="co-terms-h">
          <div class="sec-head"><h2 id="co-terms-h">Licence terms</h2>${lt.isSample ? h`<span class="sec-meta">Sample text, replaced by the agency's own before launch</span>` : ''}</div>
          <div class="sec-body">
            ${App.licenceTermsHTML()}
            <ds-field class="ds-field" data-size="md">
              <input class="ds-input" type="checkbox" id="co-accept" data-co-accept${co.accepted ? App.raw(' checked') : ''}>
              <label class="ds-label" data-weight="regular" for="co-accept">I accept the licence terms for these images on behalf of ${cl.name}</label>
            </ds-field>
          </div>
        </section>`;
    },
    details() {
      ensureCo();
      const cl = org();
      const items = checkoutItems();
      const total = items.reduce((s, it) => s + (it.im ? it.im.price : 0), 0);
      const reason = blockReason(items);
      return h`<div class="panel-body">
        <div class="insp-head"><div><h2>Summary</h2></div></div>
        <section class="insp-sec" aria-label="Totals"><dl class="sum">
          <div><dt>Images</dt><dd>${items.length}</dd></div>
          <div><dt>Licence</dt><dd>${licenceType().name}</dd></div>
          <div><dt>For</dt><dd>${cl.name}</dd></div>
          <div class="total"><dt>Total, ex VAT</dt><dd>${App.price(total, { lg: true })}</dd></div>
        </dl></section>
        <section class="insp-sec"><p class="hint">No payment is taken in the portal. Confirming records one licence per image for ${cl.name}, and all of ${cl.name}'s contacts can then see and download them.</p></section>
        <div class="insp-foot sum-foot">
          <button class="ds-button wide" data-variant="primary" type="button" id="co-confirm" data-co-confirm${reason ? App.raw(' disabled aria-describedby="co-reason"') : ''}>Confirm and get licences</button>
          ${reason ? h`<p class="hint cl-reason" id="co-reason">${reason}</p>` : ''}
        </div>
      </div>`;
    },
    detailsLabel: 'Checkout summary',
    inlineDetails: false,
    mount(root) {
      App.refreshChrome(); /* the top bar was drawn before the re-check removed lines */
      hideEmptyAside(root);
      const rerender = () => { App.refresh('main'); App.refresh('details'); hideEmptyAside(root); };

      App.on('change', '[data-co-accept]', (e, el) => {
        co.accepted = el.checked;
        App.refresh('details');
      });
      App.on('click', '[data-accept-price]', (e, el) => {
        const id = el.getAttribute('data-accept-price');
        const line = App.cart.lines(me().id).find((l) => l.imageId === id);
        const im = App.find.image(id);
        if (!line || !im) return;
        co.confirmed[id] = { from: line.priceAtAdd };
        line.priceAtAdd = im.price;
        App.save();
        rerender();
        focusFirst(root, ['[data-accept-price]', '#co-accept']);
        App.status('New price confirmed: ' + App.imageTitle(im) + ', ' + usd(im.price) + '.');
      });
      App.on('click', '[data-drop]', (e, el) => {
        const id = el.getAttribute('data-drop');
        const title = App.imageTitle(App.find.image(id));
        if (!App.cart.remove(me().id, id)) return;
        rerender();
        focusFirst(root, ['[data-accept-price]', '#co-accept', '.empty a']);
        App.status(title + ' was removed from your cart.');
      });
      App.on('click', '[data-co-confirm]', (e, el) => {
        if (!co || co.busy || el.disabled) return;
        const c = me();
        const cl = org();
        const notes = recheck();
        if (notes.length) {
          co.removed = co.removed.concat(notes);
          rerender();
          focusFirst(root, ['#co-removed']);
          return;
        }
        const items = checkoutItems();
        if (blockReason(items)) { rerender(); focusFirst(root, ['#co-change', '#co-accept']); return; }
        co.busy = true;
        el.disabled = true;
        /* All lines together (FR-32); S5 keeps one active licence per client and image. */
        const recorded = items.map((it) => App.licences.record({
          imageId: it.im.id, clientId: c.clientId, contactId: c.id, price: it.im.price, source: 'purchase'
        }));
        App.cart.lines(c.id).length = 0;
        App.save();
        App.refreshChrome();
        const total = recorded.reduce((s, l) => s + l.price, 0);
        App.log('Checked out', App.fmt.plural(recorded.length, 'licence') + ' for ' + cl.name + ': ' +
          items.map((it) => App.imageTitle(it.im)).join(', ') + ' (' + usd(total) + ')');
        App.store.ui.client = Object.assign({}, App.store.ui.client, {
          receipt: { at: App.nowISO(), contactId: c.id, clientId: c.clientId, licenceIds: recorded.map((l) => l.id) }
        });
        App.save();
        App.navigate('#/checkout/done');
      });
      return () => { co = null; };
    }
  });

  /* ==================================================================
     Checkout done (receipt)
     ================================================================== */
  App.registerScreen('/checkout/done', {
    role: 'client',
    title: 'Checkout done',
    render() {
      const c = me();
      const cl = org();
      const r = (App.store.ui.client || {}).receipt;
      if (!r || r.contactId !== c.id) {
        return h`<div class="main-cap"><h1 class="page-title">No recent checkout</h1>
          ${App.emptyState('There is no checkout to show here. Every licence ' + cl.name + ' holds is listed under Licences.', { label: 'See all licences', href: '#/licences' })}</div>`;
      }
      const lics = r.licenceIds.map((id) => App.find.licence(id)).filter(Boolean);
      const total = lics.reduce((s, l) => s + l.price, 0);
      const n = lics.length;
      const lt = licenceType();
      const items = lics.map((l) => {
        const im = App.find.image(l.imageId);
        const title = App.imageTitle(im);
        const ok = im && App.access.canDownload(c, im);
        const fields = im ? App.access.clientFields(im) : null;
        return h`<li class="cline">
          <span class="cthumb">${ok ? App.ownTick() : ''}${thumb(im)}</span>
          <span class="cl-info"><b>${title}</b><span class="lic">${ltName(l.licenceTypeId)}, ${App.price(l.price)}</span>${
            fields && fields.size ? h`<span class="lic">${fields.size.format}, ${fields.size.w} × ${fields.size.h} px, ${App.fmt.bytes(fields.size.bytes)}</span>` : ''}</span>
          <span class="cl-end">${ok
            ? h`<button class="ds-button" data-variant="primary" data-size="sm" type="button" data-download="${im.id}" aria-label="Download ${title}">${App.icon('download')}Download</button>`
            : h`<span class="hint">${l.revoked ? 'Removed by the agency' : 'No longer available'}</span>`}</span>
        </li>`;
      });
      const zipLabel = n === 2 ? 'Download both as ZIP' : 'Download all ' + n + ' as ZIP';
      return h`<div class="main-cap">
        <div class="ds-alert ctx-top" data-color="success">
          <h1 class="ds-heading" data-size="xs">Done: ${App.fmt.plural(n, 'licence')} recorded for ${cl.name}</h1>
          <p class="ds-paragraph">The images are now ${cl.name}'s own. Download them here, or later from My images.</p>
        </div>
        <p class="done-meta">Recorded ${App.fmt.date(r.at)} at ${App.fmt.time(r.at)} by ${c.name}. ${lt.name}. Total ${App.price(total)} ex VAT.</p>
        <section class="card-sec" aria-labelledby="done-img-h">
          <div class="sec-head"><h2 id="done-img-h">Your new images</h2>${n > 1 ? h`<div class="sec-end"><button class="ds-button" data-variant="secondary" data-size="sm" type="button" data-download-all>${App.icon('download')}${zipLabel}</button></div>` : ''}</div>
          <ul class="lines">${items}</ul>
          <div class="sec-foot">Each download has the current title, description, alt text and keywords, and no location data.</div>
        </section>
        <div class="done-links">
          <a class="ds-button" data-variant="secondary" href="#/my-images">${App.icon('mine')}Go to My images</a>
          <a class="ds-button" data-variant="tertiary" href="#/licences">See all licences</a>
        </div>
      </div>`;
    },
    mount(root) {
      App.on('click', '[data-download]', (e, el) => { download(el.getAttribute('data-download')); });
      App.on('click', '[data-download-all]', () => {
        const ids = Array.prototype.map.call(root.querySelectorAll('[data-download]'), (b) => b.getAttribute('data-download'));
        const ok = ids.filter((id) => download(id).ok).length;
        App.status('Downloading ' + App.fmt.plural(ok, 'image') + ' as one ZIP.');
      });
    }
  });
})(window.App);
