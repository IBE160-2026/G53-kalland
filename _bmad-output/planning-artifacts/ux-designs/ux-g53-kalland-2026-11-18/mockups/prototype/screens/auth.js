/* Owner: foundation. Shared pages without navigation: Login (#/login) and Set password
   (#/set-password/:token). 403 and Not found are built into app.js.
   Messages from PRD NFR-7 are used word for word. */
(function (App) {
  'use strict';
  const h = App.h;
  const MIN_PASSWORD = 12;
  const MSG_WRONG = 'Incorrect email or password. Contact the agency to set up a new password.';
  const MSG_INACTIVE = 'Your account is not active. Contact the agency.';
  const MSG_EXPIRED = 'Link expired. Contact the agency for a new one.';

  function brand() {
    return h`<p class="auth-brand"><span class="wordmark"><span class="wordmark-mark" aria-hidden="true"></span>CRM-DAM</span></p>`;
  }
  function alertHTML(f) {
    return f ? h`<div class="ds-alert auth-alert" data-color="${f.color || 'danger'}" data-size="sm" tabindex="-1" id="auth-alert"><p class="ds-paragraph">${f.text}</p></div>` : '';
  }
  function fieldError(id, text) {
    return h`<p class="ds-validation-message" data-field="validation" id="${id}"${text ? '' : App.raw(' hidden')}>${text || ''}</p>`;
  }
  function setFieldError(input, errEl, text) {
    errEl.textContent = text || '';
    errEl.hidden = !text;
    if (text) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  }
  function showAlert(root, text, color) {
    const slot = root.querySelector('[data-auth-alert]');
    slot.innerHTML = String(alertHTML({ text, color }));
    const el = slot.querySelector('#auth-alert');
    if (el) el.focus();
  }

  /* ---------------------------------------------------------------- Login */
  App.registerScreen('/login', {
    role: 'public',
    title: 'Log in',
    render() {
      const flash = App.takeFlash();
      return h`<main class="auth"><div class="auth-card">
        ${brand()}
        <h1 class="page-title" id="login-h">Log in</h1>
        <p class="page-sub">For agency staff and for client contacts with an account.</p>
        <div data-auth-alert aria-live="polite">${alertHTML(flash)}</div>
        <form class="auth-form" id="login-form" novalidate aria-labelledby="login-h">
          <ds-field class="ds-field">
            <label class="ds-label" for="login-email">Email</label>
            <input class="ds-input" id="login-email" name="email" type="email" autocomplete="username" aria-describedby="login-email-err">
            ${fieldError('login-email-err')}
          </ds-field>
          <ds-field class="ds-field">
            <label class="ds-label" for="login-pw">Password</label>
            <input class="ds-input" id="login-pw" name="password" type="password" autocomplete="current-password" aria-describedby="login-pw-err">
            ${fieldError('login-pw-err')}
          </ds-field>
          <button class="ds-button" data-variant="primary" type="submit">Log in</button>
          <p class="hint">Forgot your password? Contact the agency for a new setup link.</p>
        </form>
        <section class="auth-quick" aria-labelledby="quick-h">
          <h2 id="quick-h">Prototype shortcuts</h2>
          <button class="ds-button" data-variant="secondary" type="button" data-quick="staff">Log in as Ida (staff)</button>
          <button class="ds-button" data-variant="secondary" type="button" data-quick="client">Log in as Jonas (client)</button>
          <details class="ds-details" data-size="sm">
            <summary>Seed accounts</summary>
            <div>
              <p class="hint">Any password of ${MIN_PASSWORD} characters or more works for these accounts.</p>
              <ul class="auth-accounts">
                <li>ida@agency.example, tor@agency.example (staff)</li>
                <li>jonas.hauge@fjordkaffe.no, kari.lie@fjordkaffe.no (Fjordkaffe AS)</li>
                <li>eirik@nordlyssykkel.no (Nordlys Sykkel AS), siri.dahl@bergenbryggeri.no (Bergen Bryggeri AS)</li>
                <li>henrik@nordlyssykkel.no (deactivated contact), ola@gammelkunde.no (inactive client)</li>
                <li>liv@lindasbakeri.no has no password yet: <a class="ds-link" href="#/set-password/lindas-7Hq2-4pVt">open her setup link</a>.
                  A used link: <a class="ds-link" href="#/set-password/kari-Xk4m-81Ld">Kari's old link</a>.</li>
              </ul>
            </div>
          </details>
        </section>
      </div></main>`;
    },
    mount(root) {
      const form = root.querySelector('#login-form');
      const email = form.elements.email;
      const pw = form.elements.password;
      const emailErr = root.querySelector('#login-email-err');
      const pwErr = root.querySelector('#login-pw-err');
      let busy = false;

      App.on('click', '[data-quick]', (e, btn) => {
        const staff = btn.getAttribute('data-quick') === 'staff';
        App.login(staff ? { role: 'staff', userId: 'u-ida' } : { role: 'client', contactId: 'k-jonas' });
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (busy) return; /* NFR-7: a double submit never runs twice */
        const em = email.value.trim().toLowerCase();
        const pass = pw.value;
        setFieldError(email, emailErr, em ? '' : 'Enter your email address.');
        setFieldError(pw, pwErr, pass ? '' : 'Enter your password.');
        if (!em) { email.focus(); return; }
        if (!pass) { pw.focus(); return; }

        const store = App.store;
        const user = store.users.find((u) => u.email.toLowerCase() === em);
        const contact = store.contacts.find((c) => c.email.toLowerCase() === em);
        const known = user || (contact && contact.passwordSet ? contact : null);
        if (!known || pass.length < MIN_PASSWORD) {
          showAlert(root, MSG_WRONG, 'danger');
          pw.value = '';
          return;
        }
        if (user ? !user.active : !App.access.contactActive(contact)) {
          showAlert(root, MSG_INACTIVE, 'danger');
          return;
        }
        busy = true;
        App.login(user ? { role: 'staff', userId: user.id } : { role: 'client', contactId: contact.id });
      });
    }
  });

  /* --------------------------------------------------------- Set password */
  function linkState(token) {
    const link = App.store.setupLinks.find((l) => l.token === token);
    if (!link || link.usedAt || link.cancelledAt || link.expiresAt < App.nowISO()) return { ok: false };
    if (link.userId) {
      const user = App.find.user(link.userId);
      return user ? { ok: true, link, user, person: user, client: null } : { ok: false };
    }
    const contact = App.find.contact(link.contactId);
    if (!contact) return { ok: false };
    return { ok: true, link, contact, person: contact, client: App.find.client(contact.clientId) };
  }

  App.registerScreen('/set-password/:token', {
    role: 'public',
    title: 'Set password',
    render(params) {
      const s = linkState(params.token);
      if (!s.ok) return h`<main class="auth"><div class="auth-card">${brand()}<p class="page-sub">Checking the link…</p></div></main>`;
      return h`<main class="auth"><div class="auth-card">
        ${brand()}
        <h1 class="page-title" id="sp-h">Set your password</h1>
        <p class="page-sub">${s.person.name}, ${s.client ? s.client.name : 'staff'}. This link works once and expires on ${App.fmt.dateTime(s.link.expiresAt)}.</p>
        <div data-auth-alert aria-live="polite"></div>
        <form class="auth-form" id="sp-form" novalidate aria-labelledby="sp-h">
          <ds-field class="ds-field">
            <label class="ds-label" for="sp-pw">New password</label>
            <p class="ds-paragraph" data-field="description" id="sp-pw-d">At least ${MIN_PASSWORD} characters.</p>
            <input class="ds-input" id="sp-pw" name="password" type="password" autocomplete="new-password" aria-describedby="sp-pw-d sp-pw-err">
            ${fieldError('sp-pw-err')}
          </ds-field>
          <ds-field class="ds-field">
            <label class="ds-label" for="sp-pw2">Repeat the password</label>
            <input class="ds-input" id="sp-pw2" name="repeat" type="password" autocomplete="new-password" aria-describedby="sp-pw2-err">
            ${fieldError('sp-pw2-err')}
          </ds-field>
          <button class="ds-button" data-variant="primary" type="submit">Set password and log in</button>
        </form>
      </div></main>`;
    },
    mount(root, params) {
      const s = linkState(params.token);
      if (!s.ok) {
        /* expired, used, cancelled or unknown: back to Login with the NFR-7 message (FR-4, S8) */
        App.flash(MSG_EXPIRED, { color: 'warning' });
        App.navigate('#/login', { replace: true, force: true });
        return;
      }
      const form = root.querySelector('#sp-form');
      const pw = form.elements.password;
      const pw2 = form.elements.repeat;
      const err1 = root.querySelector('#sp-pw-err');
      const err2 = root.querySelector('#sp-pw2-err');
      let busy = false;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (busy) return;
        const short = pw.value.length < MIN_PASSWORD;
        setFieldError(pw, err1, short ? 'Use at least ' + MIN_PASSWORD + ' characters.' : '');
        setFieldError(pw2, err2, !short && pw.value !== pw2.value ? 'The passwords do not match.' : '');
        if (short) { pw.focus(); return; }
        if (pw.value !== pw2.value) { pw2.focus(); return; }
        const fresh = linkState(params.token);
        if (!fresh.ok) { App.flash(MSG_EXPIRED, { color: 'warning' }); App.navigate('#/login', { replace: true, force: true }); return; }
        const active = fresh.user ? fresh.user.active : App.access.contactActive(fresh.contact);
        if (!active) { showAlert(root, MSG_INACTIVE, 'danger'); return; }
        busy = true;
        fresh.link.usedAt = App.nowISO();
        fresh.person.passwordSet = true;
        App.save();
        App.status('Your password is set.');
        if (fresh.user) App.login({ role: 'staff', userId: fresh.user.id }, { to: '#/library' });
        else App.login({ role: 'client', contactId: fresh.contact.id }, { to: '#/overview' });
      });
    }
  });
})(window.App);
