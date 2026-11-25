/* Alphapine & Aromatics — CMS admin (/admin)
   Talks directly to Supabase: Auth (email + password) and the REST API. No dependencies.
   Every read/write is checked server-side by the RLS policies in supabase/schema.sql —
   this file only decides what to show. All user content is rendered as text, never HTML. */
(() => {
  'use strict';
  const SITE = window.SITE || {}, OPT = window.CMS_OPTIONS || {}, DEF = window.CMS_DEFAULTS || {};
  const BASE = (SITE.supabaseUrl || '').replace(/\/$/, ''), KEY = SITE.supabaseAnonKey || '';
  const app = document.getElementById('app');

  /* ───────────────────────── helpers ───────────────────────── */
  function el(tag, props = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (k === 'value') n.value = v;
      else if (k === 'checked' || k === 'disabled' || k === 'selected' || k === 'hidden' || k === 'readOnly') n[k] = !!v;
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c)));
    return n;
  }
  const clear = (n) => { while (n.firstChild) n.removeChild(n.firstChild); return n; };
  // append children: flattens arrays, skips null/false (native append would print them as text)
  const put = (n, ...kids) => { for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c))); return n; };
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const fmtDate = (s) => s ? new Date(s).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  const store = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch { return null; } },
    set(k, v) { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };
  let toastTimer;
  function toast(msg, kind = 'ok') {
    let t = document.querySelector('.toast');
    if (!t) { t = el('div', { class: 'toast', role: 'status' }); document.body.append(t); }
    t.className = `toast show ${kind}`; t.textContent = msg;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), kind === 'err' ? 7000 : 3500);
  }
  const fail = (e) => toast(e && e.message ? e.message : String(e), 'err');
  async function busy(btn, fn) {
    const old = btn.textContent; btn.disabled = true; btn.textContent = 'Working…';
    try { return await fn(); } catch (e) { fail(e); } finally { btn.disabled = false; btn.textContent = old; }
  }

  /* ───────────────────────── auth (Supabase GoTrue) ───────────────────────── */
  let session = store.get('ap-cms-session');
  async function authCall(path, body, method = 'POST', bearer) {
    const r = await fetch(`${BASE}/auth/v1/${path}`, { method, headers: { apikey: KEY, 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error_description || j.msg || j.message || `Request failed (${r.status})`);
    return j;
  }
  function keep(j) {
    session = { access: j.access_token, refresh: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, email: (j.user && j.user.email) || (session && session.email) || '' };
    store.set('ap-cms-session', session);
  }
  let refreshing = null;
  async function token() {
    if (!session) throw new Error('Signed out');
    if (Date.now() > session.exp - 60_000) {
      refreshing = refreshing || authCall('token?grant_type=refresh_token', { refresh_token: session.refresh }).then(keep).finally(() => { refreshing = null; });
      try { await refreshing; } catch (e) { signOut(true); throw new Error('Your session expired — please sign in again.'); }
    }
    return session.access;
  }
  function signOut(silent) {
    const t = session && session.access;
    session = null; store.set('ap-cms-session', null);
    if (t) fetch(`${BASE}/auth/v1/logout`, { method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${t}` } }).catch(() => {});
    if (!silent) toast('Signed out.');
    renderLogin();
  }

  /* ───────────────────────── REST (PostgREST) ───────────────────────── */
  async function api(path, { method = 'GET', body, prefer, range } = {}) {
    const headers = { apikey: KEY, Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' };
    if (prefer) headers.Prefer = prefer;
    if (range) headers.Range = range;
    const r = await fetch(`${BASE}/rest/v1/${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    if (r.status === 401) { signOut(true); throw new Error('Your session expired — please sign in again.'); }
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.message || j.hint || `Request failed (${r.status})`); }
    const cr = r.headers.get('content-range');
    const total = cr && cr.includes('/') && cr.split('/')[1] !== '*' ? +cr.split('/')[1] : undefined;
    const text = await r.text();
    return { data: text ? JSON.parse(text) : null, total };
  }
  const q = encodeURIComponent;
  const setSetting = (key, value) => api('admin_settings?on_conflict=key', { method: 'POST', body: { key, value }, prefer: 'resolution=merge-duplicates,return=minimal' });
  const getSettings = async () => Object.fromEntries(((await api('admin_settings?select=key,value')).data || []).map(r => [r.key, r.value]));

  /* ───────────────────────── sign-in screens ───────────────────────── */
  function renderLogin(msg) {
    const email = el('input', { type: 'email', id: 'l-email', required: true, autocomplete: 'username', value: (session && session.email) || '' });
    const pass = el('input', { type: 'password', id: 'l-pass', required: true, autocomplete: 'current-password' });
    const err = el('p', { class: 'err', role: 'alert', text: msg || '' });
    const btn = el('button', { class: 'btn primary', type: 'submit', text: 'Sign in' });
    const form = el('form', { class: 'login', onsubmit: (e) => {
      e.preventDefault(); err.textContent = '';
      busy(btn, async () => {
        try { keep(await authCall('token?grant_type=password', { email: email.value.trim(), password: pass.value })); await boot(); }
        catch (x) { err.textContent = x.message === 'Invalid login credentials' ? 'Incorrect email or password.' : x.message; }
      });
    } },
      el('img', { src: '../assets/img/logo-light.png', alt: 'Alphapine & Aromatics', width: 92, height: 70 }),
      el('h1', { text: 'Content manager' }),
      el('p', { class: 'muted', text: 'Sign in with your admin account.' }),
      el('label', { for: 'l-email', text: 'Email' }), email,
      el('label', { for: 'l-pass', text: 'Password' }), pass,
      err, btn,
      el('button', { type: 'button', class: 'link', text: 'Forgot password?', onclick: () => {
        if (!email.value.trim()) { err.textContent = 'Enter your email first, then click "Forgot password?".'; email.focus(); return; }
        authCall('recover', { email: email.value.trim() }).then(() => { err.textContent = ''; toast('If that account exists, a password-reset email is on its way.'); }).catch(fail);
      } }),
    );
    put(clear(app), el('main', { class: 'center' }, form));
    (email.value ? pass : email).focus();
  }

  // Password-reset / invite links from Supabase land here with #access_token=…&type=recovery|invite
  function handleAuthRedirect() {
    const p = new URLSearchParams(location.hash.slice(1));
    if (!p.get('access_token')) return false;
    keep({ access_token: p.get('access_token'), refresh_token: p.get('refresh_token'), expires_in: +p.get('expires_in') || 3600 });
    history.replaceState(null, '', location.pathname);
    if (p.get('type') === 'recovery' || p.get('type') === 'invite') {
      const pass = el('input', { type: 'password', id: 'n-pass', required: true, minlength: 8, autocomplete: 'new-password' });
      const btn = el('button', { class: 'btn primary', type: 'submit', text: 'Save new password' });
      put(clear(app), el('main', { class: 'center' }, el('form', { class: 'login', onsubmit: (e) => {
        e.preventDefault();
        if (pass.value.length < 8) { toast('Use at least 8 characters.', 'err'); return; }
        busy(btn, async () => { await authCall('user', { password: pass.value }, 'PUT', await token()); toast('Password saved.'); await boot(); });
      } }, el('h1', { text: 'Set a new password' }), el('label', { for: 'n-pass', text: 'New password (min. 8 characters)' }), pass, btn)));
      pass.focus();
      return true;
    }
    return false;
  }

  /* ───────────────────────── shell ───────────────────────── */
  const TABS = [['responses', 'Responses'], ['products', 'Products'], ['faqs', 'FAQs'], ['content', 'Page content & forms'], ['settings', 'Settings']];
  let main, pubState;

  async function boot() {
    if (!BASE || !KEY) {
      put(clear(app), el('main', { class: 'center' }, el('div', { class: 'login' },
        el('h1', { text: 'CMS not connected' }),
        el('p', { text: 'Supabase is not configured for this deployment. Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel → Project → Settings → Environment Variables, then redeploy. Setup steps: supabase/README.md in the repository.' }))));
      return;
    }
    if (!session) return renderLogin();
    let ok;
    try { ok = (await api('rpc/is_admin', { method: 'POST', body: {} })).data; } catch (e) { return renderLogin(e.message); }
    if (!ok) { const who = session.email; signOut(true); renderLogin(`${who || 'This account'} is not an admin. Ask the site owner to add it (see supabase/README.md).`); return; }

    pubState = el('span', { class: 'pub-state' });
    const pubBtn = el('button', { class: 'btn primary', text: 'Publish to website', onclick: (e) => publish(e.currentTarget) });
    const nav = el('nav', { class: 'tabs', 'aria-label': 'CMS sections' }, TABS.map(([id, label]) => el('a', { href: `#${id}`, 'data-tab': id, text: label })));
    main = el('main', { class: 'view', id: 'view' });
    put(clear(app), 
      el('header', { class: 'top' },
        el('div', { class: 'brand' }, el('img', { src: '../assets/img/logo-light.png', alt: '', width: 46, height: 35 }), el('b', { text: 'Alphapine CMS' })),
        el('div', { class: 'top-r' }, pubState, pubBtn, el('span', { class: 'who', text: session.email }), el('button', { class: 'btn ghost', text: 'Sign out', onclick: () => signOut() }))),
      nav, main);
    addEventListener('hashchange', route);
    route();
    refreshPubState();
  }

  function route() {
    const id = (location.hash.slice(1) || 'responses').split('/')[0];
    const tab = TABS.find(t => t[0] === id) ? id : 'responses';
    document.querySelectorAll('.tabs a').forEach(a => a.setAttribute('aria-current', a.dataset.tab === tab ? 'page' : 'false'));
    clear(main);
    ({ responses: viewResponses, products: viewProducts, faqs: viewFaqs, content: viewContent, settings: viewSettings })[tab]().catch(fail);
  }

  /* ───────────────────────── publish (Vercel deploy hook) ───────────────────────── */
  async function latestEdit() {
    const t = await Promise.all(['products', 'faqs', 'site_content'].map(tb => api(`${tb}?select=updated_at&order=updated_at.desc&limit=1`).then(r => r.data[0] && r.data[0].updated_at).catch(() => null)));
    return t.filter(Boolean).sort().pop() || null;
  }
  async function refreshPubState() {
    try {
      const [s, lastRow] = await Promise.all([getSettings(), latestEdit()]);
      const pub = s.last_published_at;
      const last = [lastRow, s.last_edit_at].filter(Boolean).sort((a, b) => new Date(a) - new Date(b)).pop();
      const pending = last && (!pub || new Date(last) > new Date(pub));
      pubState.textContent = pending ? 'Unpublished changes' : pub ? `Live · published ${fmtDate(pub)}` : 'Not published yet';
      pubState.className = `pub-state ${pending ? 'pending' : ''}`;
    } catch { pubState.textContent = ''; }
  }
  async function publish(btn) {
    await busy(btn, async () => {
      const hook = (await getSettings()).deploy_hook_url;
      if (!hook) { toast('Add your Vercel Deploy Hook URL in Settings first.', 'err'); location.hash = 'settings'; return; }
      if (!confirm('Publish all saved changes to the live website now? The site rebuilds and updates in about 1–2 minutes.')) return;
      // Vercel deploy hooks do not send CORS headers: the request is still delivered, but its response cannot be read here.
      await fetch(hook, { method: 'POST', mode: 'no-cors' });
      await setSetting('last_published_at', new Date().toISOString());
      toast('Publishing started — the live site updates in about 1–2 minutes.');
      refreshPubState();
      if (location.hash === '#settings') route();
    });
  }
  // record the time of every edit (deletes do not touch updated_at), then refresh the badge
  const edited = () => setSetting('last_edit_at', new Date().toISOString()).catch(() => {}).then(refreshPubState);

  /* ═════════════════════════ RESPONSES (leads) ═════════════════════════ */
  const FORMS = { quote: 'Quote request', contact: 'Contact form', 'tds-msds': 'TDS / MSDS' };
  const STATUSES = [['new', 'New'], ['in_progress', 'In progress'], ['responded', 'Responded'], ['closed', 'Closed'], ['spam', 'Spam']];
  const statusLabel = (s) => (STATUSES.find(x => x[0] === s) || [s, s])[1];
  const LEAD_FIELDS = [['created_at', 'Received'], ['form', 'Form'], ['name', 'Name'], ['company', 'Company'], ['email', 'Email'], ['phone', 'Mobile / WhatsApp'], ['country', 'Country'], ['inquiry_type', 'Inquiry type'], ['product', 'Product'], ['grade', 'Grade'], ['qty', 'Quantity'], ['document', 'Document requested'], ['message', 'Message'], ['page', 'Page'], ['consent', 'Consent given'], ['status', 'Status'], ['notes', 'Internal notes'], ['updated_at', 'Last updated']];
  const R = store.get('ap-cms-rfilter') || { form: '', status: '', q: '', from: '', to: '', sort: 'created_at', dir: 'desc', page: 0, size: 50 };
  const picked = new Set();

  function leadFilter(includeStatus = true) {
    const f = [];
    if (R.form) f.push(`form=eq.${q(R.form)}`);
    if (includeStatus && R.status) f.push(`status=eq.${q(R.status)}`);
    if (R.from) f.push(`created_at=gte.${q(new Date(`${R.from}T00:00:00`).toISOString())}`);
    if (R.to) { const d = new Date(`${R.to}T00:00:00`); d.setDate(d.getDate() + 1); f.push(`created_at=lt.${q(d.toISOString())}`); }
    const term = R.q.trim().replace(/["\\(),]/g, ' ').trim();
    if (term) f.push(`or=${q(`(${['name', 'email', 'company', 'product', 'phone', 'country', 'message', 'notes'].map(c => `${c}.ilike."*${term}*"`).join(',')})`)}`);
    return f;
  }

  async function viewResponses() {
    const head = el('div', { class: 'vhead' }, el('div', {}, el('h1', { text: 'Responses' }), el('p', { class: 'muted', text: 'Every submission from the quote, contact and TDS / MSDS forms. Filter, sort, update status, add notes and export.' })));
    const counts = el('div', { class: 'chips' });
    const search = el('input', { type: 'search', placeholder: 'Search name, email, company, product, message…', value: R.q, 'aria-label': 'Search responses' });
    const formSel = el('select', { 'aria-label': 'Form' }, el('option', { value: '', text: 'All forms' }), Object.entries(FORMS).map(([v, t]) => el('option', { value: v, text: t, selected: R.form === v })));
    const from = el('input', { type: 'date', value: R.from, 'aria-label': 'From date' }), to = el('input', { type: 'date', value: R.to, 'aria-label': 'To date' });
    const tableBox = el('div', { class: 'tbl-wrap' }), pager = el('div', { class: 'pager' }), bulk = el('div', { class: 'bulk' });
    const apply = () => { R.page = 0; store.set('ap-cms-rfilter', R); load(); };
    let t; search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { R.q = search.value; apply(); }, 300); });
    formSel.addEventListener('change', () => { R.form = formSel.value; apply(); loadCounts(); });
    from.addEventListener('change', () => { R.from = from.value; apply(); loadCounts(); });
    to.addEventListener('change', () => { R.to = to.value; apply(); loadCounts(); });
    const exportBtn = el('button', { class: 'btn', text: 'Export CSV', onclick: (e) => busy(e.currentTarget, exportCsv) });
    const reset = el('button', { class: 'btn ghost', text: 'Clear filters', onclick: () => { Object.assign(R, { form: '', status: '', q: '', from: '', to: '', page: 0 }); store.set('ap-cms-rfilter', R); route(); } });
    put(main, head, counts, el('div', { class: 'filters' }, search, formSel, el('label', { class: 'inline' }, 'From ', from), el('label', { class: 'inline' }, 'To ', to), reset, exportBtn), bulk, tableBox, pager);

    async function loadCounts() {
      const base = leadFilter(false).join('&');
      const all = [['', 'All'], ...STATUSES];
      const res = await Promise.all(all.map(([s]) => api(`leads?select=id&limit=1${base ? `&${base}` : ''}${s ? `&status=eq.${s}` : ''}`, { prefer: 'count=exact' }).then(r => r.total || 0).catch(() => '?')));
      put(clear(counts), all.map(([s, label], i) => el('button', { class: `chip ${R.status === s ? 'on' : ''} st-${s || 'all'}`, onclick: () => { R.status = s; apply(); loadCounts(); } }, label, el('b', { text: res[i] }))));
    }

    async function load() {
      picked.clear(); renderBulk();
      put(clear(tableBox), el('p', { class: 'muted pad', text: 'Loading…' }));
      const filt = leadFilter().join('&');
      const { data, total } = await api(`leads?select=*&order=${R.sort}.${R.dir}.nullslast,id.desc&offset=${R.page * R.size}&limit=${R.size}${filt ? `&${filt}` : ''}`, { prefer: 'count=exact' });
      const cols = [['created_at', 'Received'], ['form', 'Form'], ['name', 'Name'], ['company', 'Company'], ['email', 'Email'], ['product', 'Product'], ['inquiry_type', 'Type / document'], ['status', 'Status']];
      const all = el('input', { type: 'checkbox', 'aria-label': 'Select all on this page', onchange: (e) => { data.forEach(r => e.target.checked ? picked.add(r.id) : picked.delete(r.id)); tableBox.querySelectorAll('tbody input[type=checkbox]').forEach(c => { c.checked = e.target.checked; }); renderBulk(); } });
      const thead = el('thead', {}, el('tr', {}, el('th', { class: 'cb' }, all), cols.map(([k, label]) => el('th', { 'aria-sort': R.sort === k ? (R.dir === 'asc' ? 'ascending' : 'descending') : 'none' },
        el('button', { class: 'sort', onclick: () => { R.dir = R.sort === k ? (R.dir === 'desc' ? 'asc' : 'desc') : (k === 'created_at' ? 'desc' : 'asc'); R.sort = k; apply(); } }, label, R.sort === k ? (R.dir === 'asc' ? ' ▲' : ' ▼') : '')))));
      const tbody = el('tbody', {}, data.map(r => el('tr', { class: r.status === 'new' ? 'unread' : '', tabindex: 0, onclick: (e) => { if (!e.target.closest('input')) openLead(r, load, loadCounts); }, onkeydown: (e) => { if (e.key === 'Enter') openLead(r, load, loadCounts); } },
        el('td', { class: 'cb' }, el('input', { type: 'checkbox', 'aria-label': `Select ${r.name}`, onchange: (e) => { e.target.checked ? picked.add(r.id) : picked.delete(r.id); renderBulk(); } })),
        el('td', { class: 'nowrap', text: fmtDate(r.created_at) }),
        el('td', {}, el('span', { class: `tag f-${r.form}`, text: FORMS[r.form] || r.form })),
        el('td', { class: 'strong', text: r.name }), el('td', { text: r.company || '—' }), el('td', { text: r.email }),
        el('td', { text: r.product || '—' }), el('td', { text: r.document || r.inquiry_type || '—' }),
        el('td', {}, el('span', { class: `status st-${r.status}`, text: statusLabel(r.status) })))));
      put(clear(tableBox), data.length ? el('table', { class: 'tbl' }, thead, tbody) : el('p', { class: 'muted pad', text: 'No responses match these filters.' }));
      const pages = Math.max(1, Math.ceil((total || 0) / R.size));
      put(clear(pager), 
        el('span', { class: 'muted', text: `${total || 0} response${total === 1 ? '' : 's'} · page ${R.page + 1} of ${pages}` }),
        el('button', { class: 'btn ghost', text: '← Previous', disabled: R.page === 0, onclick: () => { R.page--; load(); } }),
        el('button', { class: 'btn ghost', text: 'Next →', disabled: R.page + 1 >= pages, onclick: () => { R.page++; load(); } }));
    }

    function renderBulk() {
      clear(bulk);
      if (!picked.size) return;
      const sel = el('select', { 'aria-label': 'New status' }, STATUSES.map(([v, t]) => el('option', { value: v, text: t })));
      put(bulk, el('b', { text: `${picked.size} selected` }), sel,
        el('button', { class: 'btn', text: 'Set status', onclick: (e) => busy(e.currentTarget, async () => { await api(`leads?id=in.(${[...picked].join(',')})`, { method: 'PATCH', body: { status: sel.value }, prefer: 'return=minimal' }); toast('Status updated.'); load(); loadCounts(); }) }),
        el('button', { class: 'btn danger', text: 'Delete', onclick: (e) => { if (confirm(`Permanently delete ${picked.size} response(s)? This cannot be undone.`)) busy(e.currentTarget, async () => { await api(`leads?id=in.(${[...picked].join(',')})`, { method: 'DELETE', prefer: 'return=minimal' }); toast('Deleted.'); load(); loadCounts(); }); } }));
    }

    async function exportCsv() {
      const filt = leadFilter().join('&'), rows = [];
      for (let off = 0; off < 20000; off += 1000) {
        const { data } = await api(`leads?select=*&order=${R.sort}.${R.dir}.nullslast,id.desc&offset=${off}&limit=1000${filt ? `&${filt}` : ''}`);
        rows.push(...data); if (data.length < 1000) break;
      }
      // neutralise spreadsheet formulas (=, +, -, @) and quote every cell
      const cell = (v) => { let s = v == null ? '' : String(v); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; };
      const csv = [LEAD_FIELDS.map(f => cell(f[1])).join(','), ...rows.map(r => LEAD_FIELDS.map(([k]) => cell(k === 'form' ? FORMS[r[k]] || r[k] : k === 'status' ? statusLabel(r[k]) : k === 'consent' ? (r[k] ? 'Yes' : '') : r[k])).join(','))].join('\r\n');
      const a = el('a', { href: URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })), download: `alphapine-responses-${new Date().toISOString().slice(0, 10)}.csv` });
      document.body.append(a); a.click(); a.remove();
      toast(`Exported ${rows.length} response(s).`);
    }

    await Promise.all([loadCounts(), load()]);
  }

  function openLead(r, reload, recount) {
    const status = el('select', { id: 'd-status' }, STATUSES.map(([v, t]) => el('option', { value: v, text: t, selected: r.status === v })));
    const notes = el('textarea', { id: 'd-notes', rows: 5, placeholder: 'Visible to admins only — calls, quotes sent, follow-ups…', value: r.notes || '' });
    const digits = (r.phone || '').replace(/\D/g, '');
    const subject = r.form === 'tds-msds' ? `${r.document || 'TDS / MSDS'} — ${r.product || 'your request'}` : `Your enquiry${r.product ? ` — ${r.product}` : ''}`;
    const body = el('div', { class: 'drawer-body' },
      el('dl', { class: 'facts' }, LEAD_FIELDS.filter(([k]) => !['status', 'notes'].includes(k) && r[k] != null && r[k] !== '').map(([k, label]) => [el('dt', { text: label }),
        el('dd', { class: k === 'message' ? 'pre' : '', text: k.endsWith('_at') ? fmtDate(r[k]) : k === 'form' ? FORMS[r[k]] || r[k] : k === 'consent' ? (r[k] ? 'Yes' : 'No') : String(r[k]) })])),
      el('div', { class: 'row' },
        el('a', { class: 'btn', href: `mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent(subject)}`, text: 'Reply by email' }),
        digits.length >= 8 ? el('a', { class: 'btn', href: `https://wa.me/${digits}`, target: '_blank', rel: 'noopener', text: 'WhatsApp' }) : null),
      el('label', { for: 'd-status', text: 'Status' }), status,
      el('label', { for: 'd-notes', text: 'Internal notes' }), notes);
    const save = el('button', { class: 'btn primary', text: 'Save', onclick: (e) => busy(e.currentTarget, async () => { await api(`leads?id=eq.${r.id}`, { method: 'PATCH', body: { status: status.value, notes: notes.value || null }, prefer: 'return=minimal' }); toast('Saved.'); close(); reload(); recount(); }) });
    const del = el('button', { class: 'btn danger', text: 'Delete', onclick: (e) => { if (confirm('Permanently delete this response?')) busy(e.currentTarget, async () => { await api(`leads?id=eq.${r.id}`, { method: 'DELETE', prefer: 'return=minimal' }); toast('Deleted.'); close(); reload(); recount(); }); } });
    const close = drawer(`${r.name}${r.company ? ` · ${r.company}` : ''}`, body, [del, save]);
    if (r.status === 'new') { status.value = 'in_progress'; } // opening a new response suggests it is being handled; nothing changes until Save
  }

  /* drawer / modal panel; returns close() */
  function drawer(title, body, actions, wide) {
    const prev = document.activeElement;
    const box = el('div', { class: `drawer ${wide ? 'wide' : ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
    const shade = el('div', { class: 'shade' }, box);
    const close = () => { shade.remove(); document.removeEventListener('keydown', esc); prev && prev.focus && prev.focus(); };
    const esc = (e) => { if (e.key === 'Escape') close(); };
    put(box, el('div', { class: 'drawer-h' }, el('h2', { text: title }), el('button', { class: 'btn ghost', 'aria-label': 'Close', text: '✕', onclick: close })), body, el('div', { class: 'drawer-f' }, actions));
    shade.addEventListener('mousedown', (e) => { if (e.target === shade) close(); });
    document.addEventListener('keydown', esc);
    document.body.append(shade);
    const first = box.querySelector('input, select, textarea, button:not(.ghost)'); first && first.focus();
    return close;
  }

  /* ═════════════════════════ PRODUCTS ═════════════════════════ */
  const CAT = { mfg: 'Manufactured', qa: 'Quality Assured' };
  const opt = (arr) => arr.map(v => Array.isArray(v) ? v : [v, v]);
  // Product editor schema — covers every field of a product (shape: src/data/products.mjs).
  const PRODUCT_SCHEMA = [
    { section: 'Identity & catalogue card', open: true, fields: [
      { key: 'name', label: 'Product name', type: 'text', required: true },
      { key: 'slug', label: 'URL slug', type: 'text', required: true, help: 'Page address: /products/<slug>. Lowercase letters, numbers and hyphens. Changing it changes the page URL.' },
      { key: 'letter', label: 'Catalogue letter', type: 'text', required: true, help: 'Shown large on the catalogue card (e.g. A).' },
      { key: 'cat', label: 'Category', type: 'select', options: [['mfg', 'Manufactured'], ['qa', 'Quality Assured']], required: true },
      { key: 'cas', label: 'CAS number', type: 'text', required: true },
      { key: 'ec', label: 'EC number', type: 'text', nullable: true, help: 'Leave empty if none.' },
      { key: 'formula', label: 'Molecular formula', type: 'text' },
      { key: 'mw', label: 'Molecular weight', type: 'text', nullable: true, help: 'Leave empty for oils / mixtures.' },
      { key: 'principal', label: 'Principal constituent', type: 'text', nullable: true, help: 'For oils and mixtures (e.g. α-Pinene). Leave empty for single molecules.' },
      { key: 'cls', label: 'Chemical class', type: 'text' },
      { key: 'pill', label: 'Grade badge', type: 'text', help: 'e.g. "6 Grades" or "99%".' },
      { key: 'page', label: 'Catalogue PDF page', type: 'number' },
      { key: 'card', label: 'Card description', type: 'textarea', required: true },
      { key: 'chips', label: 'Card chips', type: 'list', help: 'Small labels on the catalogue card (first five shown).' },
      { key: 'tags', label: 'Card footer tags', type: 'list' },
    ] },
    { section: 'Product page — top', fields: [
      { key: 'title', type: 'group', fields: [
        { key: 'a', label: 'Title line 1 (plain)', type: 'text', help: 'Optional, e.g. "Alpha".' },
        { key: 'b', label: 'Title line 2 (italic)', type: 'text', required: true },
        { key: 'sup', label: 'Title superscript', type: 'text', help: 'e.g. "6 grades". Optional.' },
      ] },
      { key: 'lead', label: 'Lead sentence', type: 'textarea' },
      { key: 'bullets', label: 'Key points', type: 'list' },
      { key: 'grades', label: 'Available grades', type: 'list', help: 'Each becomes a "tap to quote" button when there is more than one.' },
      { key: 'specs', label: 'Spec tiles', type: 'tuples', columns: [{ label: 'Label' }, { label: 'Value' }, { label: 'Unit' }, { label: 'Note' }] },
      { key: 'mol', label: 'Molecule drawing', type: 'select', options: opt(OPT.molecules || []) },
    ] },
    { section: 'Overview & specification text', fields: [
      { key: 'overview', label: 'Overview', type: 'textarea', rows: 5 },
      { key: 'characteristics', label: 'Characteristics', type: 'textarea' },
      { key: 'appearance', label: 'Appearance', type: 'textarea' },
      { key: 'applications', label: 'Applications', type: 'textarea' },
    ] },
    { section: 'Look & feel (appearance section)', fields: [
      { key: 'look', type: 'group', fields: [
        { key: 'liquid', label: 'Product colour', type: 'color' },
        { key: 'form', label: 'Physical form (drawing)', type: 'select', options: opt(OPT.lookForms || ['liquid', 'crystal']) },
        { key: 'heading', label: 'Heading — three short phrases', type: 'fixed', columns: [{ label: 'Phrase 1' }, { label: 'Phrase 2 (italic)' }, { label: 'Phrase 3' }] },
        { key: 'intro', label: 'Intro', type: 'textarea' },
        { key: 'attrs', label: 'Attributes', type: 'tuples', columns: [{ label: 'Attribute' }, { label: 'Value' }] },
        { key: 'caption', label: 'Gallery caption — pure form', type: 'text' },
      ] },
    ] },
    { section: 'Source & process illustrations', fields: [
      { key: 'source', type: 'group', fields: [
        { key: 'kind', label: 'Source drawing', type: 'select', options: opt(OPT.sourceKinds || []) },
        { key: 'word', label: 'Gallery heading word — "From <word> …"', type: 'text' },
        { key: 'end', label: 'Gallery heading end — "… to <end>"', type: 'text' },
        { key: 'caption', label: 'Source caption', type: 'text' },
      ] },
      { key: 'process', type: 'group', fields: [
        { key: 'kind', label: 'Process drawing', type: 'select', options: opt(OPT.processKinds || []) },
        { key: 'caption', label: 'Process caption', type: 'text' },
      ] },
    ] },
    { section: 'GC-MS & lab verification', fields: [
      { key: 'gcms', type: 'group', fields: [
        { key: 'intro', label: 'Intro', type: 'textarea' },
        { key: 'bars', label: 'Composition bars', type: 'tuples', optional: true, help: 'Optional. Bar length is a number from 0 to 100.', columns: [{ label: 'Component' }, { label: 'Note' }, { label: 'Range shown' }, { label: 'Bar length %', type: 'number' }] },
        { key: 'checks', label: 'Verification checks', type: 'tuples', optional: true, help: 'Optional. Shown as tick rows.', columns: [{ label: 'Check' }, { label: 'Method' }] },
        { key: 'caption', label: 'Gallery caption — GC-MS', type: 'text' },
      ] },
    ] },
    { section: 'Applications', fields: [
      { key: 'uses', label: 'Application cards', type: 'tuples', min: 2, help: 'At least two. The first two also appear in the gallery.', columns: [{ label: 'Category' }, { label: 'Title' }, { label: 'Description', type: 'textarea' }, { label: 'Tags (comma-separated)', type: 'csv' }, { label: 'Icon', type: 'select', options: opt(OPT.icons || []) }] },
    ] },
    { section: 'Purpose & functions', fields: [
      { key: 'roles', label: 'Functions', type: 'tuples', columns: [{ label: 'Title' }, { label: 'Description', type: 'textarea' }] },
    ] },
    { section: 'Safety & handling', fields: [
      { key: 'tox', type: 'group', fields: [
        { key: 'level', label: 'Overall toxicity class', type: 'select', number: true, options: [[0, 'Low'], [1, 'Mild'], [2, 'Moderate'], [3, 'High'], [4, 'Severe']] },
        { key: 'fp', label: 'Flash point (°C, number)', type: 'number', required: true, help: 'Sets the flammability class: below 60 flammable, below 93 combustible.' },
        { key: 'flash', label: 'Flash point as displayed', type: 'text', help: 'e.g. "≈ 90 °C".' },
        { key: 'skin', label: 'Skin contact', type: 'fixed', columns: [{ label: 'Classification' }, { label: 'Description', type: 'textarea' }, { label: 'First response', type: 'textarea' }] },
        { key: 'eye', label: 'Eye contact', type: 'fixed', columns: [{ label: 'Classification' }, { label: 'Description', type: 'textarea' }, { label: 'First response', type: 'textarea' }] },
        { key: 'inh', label: 'Inhalation', type: 'fixed', columns: [{ label: 'Classification' }, { label: 'Description', type: 'textarea' }, { label: 'First response', type: 'textarea' }] },
        { key: 'store', label: 'Storage', type: 'textarea' },
      ] },
    ] },
    { section: 'Specification sheet', fields: [
      { key: 'sheet', label: 'Sheet rows', type: 'tuples', help: 'Values containing "CoA" are styled as "reported on batch CoA".', columns: [{ label: 'Parameter' }, { label: 'Value' }, { label: 'Method' }] },
    ] },
  ];

  // ── generic field renderer: edits obj[field.key] in place
  function fieldEl(obj, f, onChange) {
    const id = `f-${Math.random().toString(36).slice(2, 9)}`;
    const wrap = el('div', { class: `fld ${f.type}` });
    const label = f.label ? el('label', { for: id }, f.label, f.required ? ' *' : '') : null;
    const help = f.help ? el('small', { class: 'help', text: f.help }) : null;
    const set = (v) => { obj[f.key] = v; onChange && onChange(); };

    if (f.type === 'group') {
      if (obj[f.key] == null || typeof obj[f.key] !== 'object') obj[f.key] = {};
      f.fields.forEach(sub => put(wrap, fieldEl(obj[f.key], sub, onChange)));
      return wrap;
    }
    if (f.type === 'list' || f.type === 'tuples' || f.type === 'fixed') {
      put(wrap, el('div', { class: 'lbl' }, f.label, f.required ? ' *' : ''), help);
      const box = el('div', { class: 'rows' }); put(wrap, box);
      if (f.type === 'fixed') {
        if (!Array.isArray(obj[f.key])) obj[f.key] = f.columns.map(() => '');
        put(box, el('div', { class: 'row-cells' }, f.columns.map((c, ci) => cellEl(obj[f.key], ci, c, onChange))));
        return wrap;
      }
      const draw = () => {
        const arr = Array.isArray(obj[f.key]) ? obj[f.key] : (obj[f.key] = []);
        clear(box);
        arr.forEach((item, i) => {
          const cells = f.type === 'list' ? [cellEl(arr, i, { label: `${f.label} ${i + 1}`, hideLabel: true }, onChange)] : f.columns.map((c, ci) => cellEl(item, ci, c, onChange, i));
          put(box, el('div', { class: 'row-item' },
            el('div', { class: 'row-cells' }, cells),
            el('div', { class: 'row-tools' },
              el('button', { type: 'button', class: 'icon', title: 'Move up', 'aria-label': 'Move up', disabled: i === 0, onclick: () => { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); draw(); onChange && onChange(); } }, '▲'),
              el('button', { type: 'button', class: 'icon', title: 'Move down', 'aria-label': 'Move down', disabled: i === arr.length - 1, onclick: () => { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); draw(); onChange && onChange(); } }, '▼'),
              el('button', { type: 'button', class: 'icon del', title: 'Remove', 'aria-label': 'Remove', onclick: () => { arr.splice(i, 1); draw(); onChange && onChange(); } }, '✕'))));
        });
        put(box, el('button', { type: 'button', class: 'btn ghost add', onclick: () => { arr.push(f.type === 'list' ? '' : f.columns.map(c => c.type === 'number' ? 0 : c.type === 'csv' ? [] : c.type === 'select' ? (c.options[0] || [''])[0] : '')); draw(); onChange && onChange(); } }, `+ Add ${f.type === 'list' ? 'item' : 'row'}`));
      };
      draw();
      return wrap;
    }
    let input;
    const v = obj[f.key];
    if (f.type === 'textarea') input = el('textarea', { id, rows: f.rows || 3, value: v == null ? '' : v });
    else if (f.type === 'select') input = el('select', { id }, (f.options.some(o => String(o[0]) === String(v)) || v == null ? [] : [el('option', { value: v, text: `${v} (current)` })]), f.options.map(([ov, ol]) => el('option', { value: ov, text: ol, selected: String(ov) === String(v) })));
    else if (f.type === 'color') input = el('input', { id, type: 'color', value: /^#[0-9a-f]{6}$/i.test(v || '') ? v : '#cccccc' });
    else if (f.type === 'number') input = el('input', { id, type: 'number', step: 'any', value: v == null ? '' : v });
    else input = el('input', { id, type: 'text', value: v == null ? '' : v });
    input.addEventListener('input', () => {
      let val = input.value;
      if (f.type === 'number') val = val === '' ? null : Number(val);
      else if (f.type === 'select' && f.number) val = Number(val);
      else if (f.nullable && val.trim() === '') val = null;
      set(val);
    });
    input.addEventListener('change', () => input.dispatchEvent(new Event('input')));
    put(wrap, label, input, help);
    return wrap;
  }
  function cellEl(arr, i, c, onChange) {
    const id = `c-${Math.random().toString(36).slice(2, 9)}`;
    const v = arr[i];
    let input;
    if (c.type === 'textarea') input = el('textarea', { id, rows: 2, value: v == null ? '' : v });
    else if (c.type === 'select') input = el('select', { id }, (c.options.some(o => String(o[0]) === String(v)) || v == null ? [] : [el('option', { value: v, text: `${v} (current)` })]), c.options.map(([ov, ol]) => el('option', { value: ov, text: ol, selected: String(ov) === String(v) })));
    else if (c.type === 'number') input = el('input', { id, type: 'number', step: 'any', value: v == null ? '' : v });
    else input = el('input', { id, type: 'text', value: c.type === 'csv' ? (Array.isArray(v) ? v.join(', ') : '') : v == null ? '' : v });
    input.addEventListener('input', () => {
      arr[i] = c.type === 'number' ? (input.value === '' ? 0 : Number(input.value)) : c.type === 'csv' ? input.value.split(',').map(s => s.trim()).filter(Boolean) : input.value;
      onChange && onChange();
    });
    input.addEventListener('change', () => input.dispatchEvent(new Event('input')));
    return el('div', { class: 'cell' }, c.hideLabel ? null : el('label', { for: id, text: c.label }), c.hideLabel ? (input.setAttribute('aria-label', c.label), input) : input);
  }

  function validateProduct(p, others) {
    const errs = [];
    const need = (v, label) => { if (v == null || String(v).trim() === '') errs.push(`${label} is required.`); };
    need(p.name, 'Product name'); need(p.letter, 'Catalogue letter'); need(p.cas, 'CAS number'); need(p.card, 'Card description'); need(p.title && p.title.b, 'Title line 2');
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug || '')) errs.push('URL slug must use lowercase letters, numbers and single hyphens (e.g. "alpha-pinene").');
    if (others.some(o => o === p.slug)) errs.push(`Another product already uses the slug "${p.slug}".`);
    if (!['mfg', 'qa'].includes(p.cat)) errs.push('Choose a category.');
    if (!Array.isArray(p.uses) || p.uses.length < 2) errs.push('Add at least two application cards.');
    if (typeof (p.tox && p.tox.fp) !== 'number' || Number.isNaN(p.tox.fp)) errs.push('Flash point (°C) must be a number.');
    ['skin', 'eye', 'inh'].forEach(k => { if (!p.tox || !Array.isArray(p.tox[k]) || p.tox[k].length !== 3) errs.push(`Safety — ${k} needs all three fields.`); });
    if (!p.look || !Array.isArray(p.look.heading) || p.look.heading.length !== 3) errs.push('Look & feel heading needs three phrases.');
    ['grades', 'chips', 'tags', 'bullets', 'specs', 'roles', 'sheet'].forEach(k => { if (!Array.isArray(p[k])) p[k] = []; });
    // clean empty list entries; drop empty optional GC-MS lists so the page omits them
    ['grades', 'chips', 'tags', 'bullets'].forEach(k => { p[k] = p[k].map(s => String(s).trim()).filter(Boolean); });
    ['bars', 'checks'].forEach(k => { if (p.gcms && Array.isArray(p.gcms[k]) && !p.gcms[k].length) delete p.gcms[k]; });
    return errs;
  }

  async function viewProducts() {
    let rows = (await api('products?select=slug,sort_order,published,updated_at,data&order=sort_order.asc,slug.asc')).data;
    let orderDirty = false;
    const F = { q: '', cat: '' };
    const head = el('div', { class: 'vhead' }, el('div', {}, el('h1', { text: 'Products' }), el('p', { class: 'muted', text: 'The catalogue grid and every product page. Drag or use the arrows to change catalogue order. Hidden products have no page on the live site.' })),
      el('div', { class: 'row' }, el('button', { class: 'btn primary', text: '+ New product', onclick: () => newProduct() })));
    const search = el('input', { type: 'search', placeholder: 'Search name, CAS, letter…', 'aria-label': 'Search products' });
    const catSel = el('select', { 'aria-label': 'Category' }, el('option', { value: '', text: 'All categories' }), Object.entries(CAT).map(([v, t]) => el('option', { value: v, text: t })));
    const saveOrder = el('button', { class: 'btn primary', text: 'Save order', hidden: true, onclick: (e) => busy(e.currentTarget, async () => {
      for (const [i, r] of rows.entries()) if (r.sort_order !== (i + 1) * 10) { await api(`products?slug=eq.${q(r.slug)}`, { method: 'PATCH', body: { sort_order: (i + 1) * 10 }, prefer: 'return=minimal' }); r.sort_order = (i + 1) * 10; }
      orderDirty = false; saveOrder.hidden = true; toast('Catalogue order saved.'); edited();
    }) });
    const box = el('div', { class: 'tbl-wrap' });
    search.addEventListener('input', () => { F.q = search.value.toLowerCase(); draw(); });
    catSel.addEventListener('change', () => { F.cat = catSel.value; draw(); });
    const countNote = el('span', { class: 'muted' });
    put(main, head, el('div', { class: 'filters' }, search, catSel, saveOrder, countNote), box);

    const move = (from, to) => { if (to < 0 || to >= rows.length) return; rows.splice(to, 0, rows.splice(from, 1)[0]); orderDirty = true; saveOrder.hidden = false; draw(); };
    let dragFrom = null;
    function draw() {
      countNote.textContent = `${rows.length} products · ${rows.filter(r => r.published).length} live`;
      const filtering = F.q || F.cat;
      const vis = rows.filter(r => (!F.cat || r.data.cat === F.cat) && (!F.q || [r.data.name, r.data.cas, r.data.letter, r.slug].join(' ').toLowerCase().includes(F.q)));
      put(clear(box), el('table', { class: 'tbl' },
        el('thead', {}, el('tr', {}, ['Order', 'Letter', 'Product', 'CAS', 'Category', 'Live', 'Updated', ''].map(t => el('th', { text: t })))),
        el('tbody', {}, vis.map(r => {
          const i = rows.indexOf(r);
          const live = el('input', { type: 'checkbox', checked: r.published, 'aria-label': `Show ${r.data.name} on the website`, onchange: async (e) => {
            try { await api(`products?slug=eq.${q(r.slug)}`, { method: 'PATCH', body: { published: e.target.checked }, prefer: 'return=minimal' }); r.published = e.target.checked; draw(); toast(`${r.data.name} will be ${r.published ? 'shown' : 'hidden'} after the next publish.`); edited(); }
            catch (x) { e.target.checked = !e.target.checked; fail(x); }
          } });
          return el('tr', { draggable: filtering ? null : 'true', class: r.published ? '' : 'muted-row',
            ondragstart: () => { dragFrom = i; }, ondragover: (e) => e.preventDefault(), ondrop: (e) => { e.preventDefault(); if (dragFrom != null && dragFrom !== i) move(dragFrom, i); dragFrom = null; } },
            el('td', { class: 'nowrap' }, filtering ? el('span', { class: 'muted', text: String(i + 1) }) : [
              el('span', { class: 'grip', 'aria-hidden': 'true', text: '⋮⋮' }),
              el('button', { class: 'icon', 'aria-label': `Move ${r.data.name} up`, disabled: i === 0, onclick: () => move(i, i - 1) }, '▲'),
              el('button', { class: 'icon', 'aria-label': `Move ${r.data.name} down`, disabled: i === rows.length - 1, onclick: () => move(i, i + 1) }, '▼')]),
            el('td', { class: 'strong', text: r.data.letter }),
            el('td', { class: 'strong', text: r.data.name }),
            el('td', { class: 'nowrap', text: r.data.cas }),
            el('td', {}, el('span', { class: `tag c-${r.data.cat}`, text: CAT[r.data.cat] || r.data.cat })),
            el('td', {}, el('label', { class: 'switch' }, live, el('span', { 'aria-hidden': 'true' }))),
            el('td', { class: 'nowrap muted', text: fmtDate(r.updated_at) }),
            el('td', { class: 'nowrap actions' },
              el('button', { class: 'btn', text: 'Edit', onclick: () => editProduct(r) }),
              el('button', { class: 'btn ghost', text: 'Duplicate', onclick: () => editProduct(r, true) }),
              el('a', { class: 'btn ghost', href: `../products/${r.slug}`, target: '_blank', rel: 'noopener', text: 'View' }),
              el('button', { class: 'btn ghost danger', text: 'Delete', onclick: (e) => { if (confirm(`Delete "${r.data.name}" from the CMS? Its page disappears from the website at the next publish.`)) busy(e.currentTarget, async () => { await api(`products?slug=eq.${q(r.slug)}`, { method: 'DELETE', prefer: 'return=minimal' }); rows = rows.filter(x => x !== r); draw(); toast('Product deleted.'); edited(); }); } })));
        }))));
    }
    draw();

    function newProduct() {
      if (!rows.length) { toast('There is no product to start from. Run supabase/seed.sql first.', 'err'); return; }
      const sel = el('select', { id: 'np-from' }, rows.map(r => el('option', { value: r.slug, text: `${r.data.letter} · ${r.data.name}` })));
      const close = drawer('New product', el('div', { class: 'drawer-body' }, el('p', { text: 'A new product starts as a copy of an existing one, so every section is already filled in. Change what differs, then save. It stays hidden until you switch it live.' }), el('label', { for: 'np-from', text: 'Start from a copy of' }), sel),
        [el('button', { class: 'btn primary', text: 'Continue', onclick: () => { close(); editProduct(rows.find(r => r.slug === sel.value), true); } })]);
    }

    function editProduct(row, asCopy) {
      const p = clone(row.data);
      const isNew = !!asCopy;
      if (isNew) { p.slug = `${row.slug}-copy`; p.name = `${p.name} (copy)`; p.title = Object.assign({}, p.title, { b: `${p.title.b} (copy)` }); }
      let dirty = false; const mark = () => { dirty = true; };
      const errBox = el('div', { class: 'errors', role: 'alert' });
      const form = el('div', { class: 'editor' }, errBox,
        PRODUCT_SCHEMA.map(s => el('details', { class: 'sect', open: s.open || null }, el('summary', { text: s.section }), el('div', { class: 'sect-b' }, s.fields.map(f => fieldEl(p, f, mark))))));
      const raw = el('details', { class: 'sect' }, el('summary', { text: 'Advanced — raw data (JSON)' }));
      const rawTa = el('textarea', { class: 'mono', rows: 18, spellcheck: 'false', 'aria-label': 'Product JSON' });
      raw.addEventListener('toggle', () => { if (raw.open) rawTa.value = JSON.stringify(p, null, 2); });
      put(raw, el('div', { class: 'sect-b' }, el('p', { class: 'muted', text: 'Every field of this product as JSON. Editing here replaces the form values above when you apply it.' }), rawTa,
        el('button', { class: 'btn', type: 'button', text: 'Apply JSON', onclick: () => { try { const j = JSON.parse(rawTa.value); if (!j || typeof j !== 'object' || Array.isArray(j)) throw new Error('JSON must be an object'); close(); editProduct(Object.assign({}, row, { data: j }), asCopy); toast('JSON applied — review, then save.'); } catch (x) { toast(`Invalid JSON: ${x.message}`, 'err'); } } })));
      put(form, raw);
      const save = el('button', { class: 'btn primary', text: isNew ? 'Create product' : 'Save product', onclick: (e) => busy(e.currentTarget, async () => {
        const errs = validateProduct(p, rows.filter(r => r !== row || isNew).map(r => r.slug).filter(s => isNew || s !== row.slug));
        clear(errBox); if (errs.length) { put(errBox, el('b', { text: 'Fix these before saving:' }), el('ul', {}, errs.map(x => el('li', { text: x })))); errBox.scrollIntoView({ block: 'start' }); return; }
        if (isNew) {
          const sort = Math.max(0, ...rows.map(r => r.sort_order)) + 10;
          await api('products', { method: 'POST', body: { slug: p.slug, sort_order: sort, published: false, data: p }, prefer: 'return=minimal' });
          toast(`${p.name} created — hidden until you switch it live.`);
        } else {
          if (p.slug !== row.slug && !confirm(`Change the URL from /products/${row.slug} to /products/${p.slug}? Links to the old address will stop working.`)) return;
          await api(`products?slug=eq.${q(row.slug)}`, { method: 'PATCH', body: { slug: p.slug, data: p }, prefer: 'return=minimal' });
          toast(`${p.name} saved. Publish to update the website.`);
        }
        dirty = false; close(); edited(); route();
      }) });
      const cancel = el('button', { class: 'btn ghost', text: 'Cancel', onclick: () => { if (!dirty || confirm('Discard unsaved changes?')) close(); } });
      const close = drawer(isNew ? 'New product' : `Edit · ${row.data.name}`, el('div', { class: 'drawer-body' }, form), [cancel, save], true);
    }
  }

  /* ═════════════════════════ FAQs ═════════════════════════ */
  async function viewFaqs() {
    const orig = (await api('faqs?select=id,question,answer,sort_order,published&order=sort_order.asc,id.asc')).data;
    let items = clone(orig);
    const removed = [];
    const list = el('div', { class: 'faq-list' });
    const saveBtn = el('button', { class: 'btn primary', text: 'Save changes', onclick: (e) => busy(e.currentTarget, save) });
    const dirtyNote = el('span', { class: 'pending', text: 'Unsaved changes', hidden: true });
    const mark = () => { dirtyNote.hidden = false; };
    put(main, el('div', { class: 'vhead' }, el('div', {}, el('h1', { text: 'FAQs' }), el('p', { class: 'muted', text: 'Questions and answers in the FAQ section, in display order. Untick "Live" to hide one without deleting it.' })),
      el('div', { class: 'row' }, dirtyNote, el('button', { class: 'btn', text: '+ Add question', onclick: () => { items.push({ question: '', answer: '', published: true }); mark(); draw(); list.lastElementChild.querySelector('input').focus(); } }), saveBtn)), list);
    let dragFrom = null;
    function draw() {
      put(clear(list), items.map((it, i) => {
        const qIn = el('input', { type: 'text', value: it.question, 'aria-label': `Question ${i + 1}`, placeholder: 'Question', oninput: (e) => { it.question = e.target.value; mark(); } });
        const aIn = el('textarea', { rows: 3, value: it.answer, 'aria-label': `Answer ${i + 1}`, placeholder: 'Answer', oninput: (e) => { it.answer = e.target.value; mark(); } });
        // only the grip starts a drag, so text in the fields stays selectable
        return el('div', { class: `faq-item ${it.published ? '' : 'muted-row'}`, ondragstart: () => { dragFrom = i; }, ondragend: (e) => { e.currentTarget.draggable = false; }, ondragover: (e) => e.preventDefault(), ondrop: (e) => { e.preventDefault(); if (dragFrom != null && dragFrom !== i) { items.splice(i, 0, items.splice(dragFrom, 1)[0]); mark(); draw(); } dragFrom = null; } },
          el('div', { class: 'faq-tools' }, el('span', { class: 'grip', 'aria-hidden': 'true', text: '⋮⋮', title: 'Drag to reorder', onmousedown: (e) => { e.currentTarget.closest('.faq-item').draggable = true; }, onmouseup: (e) => { e.currentTarget.closest('.faq-item').draggable = false; } }), el('b', { text: String(i + 1).padStart(2, '0') }),
            el('button', { class: 'icon', 'aria-label': 'Move up', disabled: i === 0, onclick: () => { items.splice(i - 1, 0, items.splice(i, 1)[0]); mark(); draw(); } }, '▲'),
            el('button', { class: 'icon', 'aria-label': 'Move down', disabled: i === items.length - 1, onclick: () => { items.splice(i + 1, 0, items.splice(i, 1)[0]); mark(); draw(); } }, '▼'),
            el('label', { class: 'inline' }, el('input', { type: 'checkbox', checked: it.published, onchange: (e) => { it.published = e.target.checked; mark(); draw(); } }), ' Live'),
            el('button', { class: 'btn ghost danger', text: 'Delete', onclick: () => { if (confirm('Delete this question?')) { if (it.id) removed.push(it.id); items.splice(i, 1); mark(); draw(); } } })),
          qIn, aIn);
      }));
    }
    draw();
    async function save() {
      const bad = items.findIndex(it => !it.question.trim() || !it.answer.trim());
      if (bad >= 0) { toast(`Question ${bad + 1} needs both a question and an answer.`, 'err'); return; }
      for (const id of removed.splice(0)) await api(`faqs?id=eq.${id}`, { method: 'DELETE', prefer: 'return=minimal' });
      for (const [i, it] of items.entries()) {
        const body = { question: it.question.trim(), answer: it.answer.trim(), published: it.published, sort_order: (i + 1) * 10 };
        if (!it.id) { const { data } = await api('faqs', { method: 'POST', body, prefer: 'return=representation' }); it.id = data[0].id; }
        else { const o = orig.find(x => x.id === it.id); if (!o || o.question !== body.question || o.answer !== body.answer || o.published !== body.published || o.sort_order !== body.sort_order) await api(`faqs?id=eq.${it.id}`, { method: 'PATCH', body, prefer: 'return=minimal' }); }
      }
      dirtyNote.hidden = true; toast('FAQs saved. Publish to update the website.'); edited(); route();
    }
  }

  /* ═════════════════════════ PAGE CONTENT & FORMS ═════════════════════════ */
  const HEAD_HELP = 'Wrap a word in *asterisks* for the italic accent. Press Enter for a line break.';
  const CONTENT_SCHEMA = [
    ['catalogue', 'Product catalogue section', [
      { key: 'eyebrow', label: 'Small label above the heading', type: 'text' },
      { key: 'heading', label: 'Heading', type: 'textarea', rows: 2, help: HEAD_HELP },
      { key: 'intro', label: 'Intro paragraph', type: 'textarea', rows: 4 }]],
    ['faq_section', 'FAQ section', [
      { key: 'eyebrow', label: 'Small label above the heading', type: 'text' },
      { key: 'heading', label: 'Heading', type: 'textarea', rows: 2, help: HEAD_HELP },
      { key: 'intro', label: 'Intro paragraph', type: 'textarea' },
      { key: 'help_title', label: 'Help box — title', type: 'text' },
      { key: 'help_text', label: 'Help box — text', type: 'textarea' },
      { key: 'help_button', label: 'Help box — button label', type: 'text' }]],
    ['quote_form', 'Request a Quote form (pop-up)', [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'sub', label: 'Sub-heading', type: 'textarea', rows: 2 },
      { key: 'submit', label: 'Submit button label', type: 'text' },
      { key: 'inquiry_types', label: 'Inquiry type options', type: 'list', help: 'Choices in the "Inquiry Type" dropdown of the quote and contact forms, in this order. Keep "Sample request" and "Technical datasheet / CoA" spelled exactly as they are if you want their special titles and download link to keep working.' }]],
    ['contact_form', 'Contact form (Resources section)', [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'sub', label: 'Sub-heading', type: 'textarea', rows: 2 },
      { key: 'submit', label: 'Submit button label', type: 'text' }]],
    ['tds_form', 'TDS & MSDS request form (product pages)', [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'sub', label: 'Sub-heading', type: 'textarea', rows: 2 },
      { key: 'submit', label: 'Submit button label', type: 'text' },
      { key: 'confirmation', label: 'Confirmation message', type: 'textarea', help: '{document} and {product} are replaced with the visitor\'s choices.' }]],
    ['forms_common', 'All forms', [
      { key: 'consent', label: 'Consent checkbox text', type: 'textarea', rows: 2 }]],
  ];
  async function viewContent() {
    const rows = Object.fromEntries(((await api('site_content?select=key,value,updated_at')).data || []).map(r => [r.key, r]));
    put(main, el('div', { class: 'vhead' }, el('div', {}, el('h1', { text: 'Page content & forms' }), el('p', { class: 'muted', text: 'Section wording and form settings. Empty fields fall back to the built-in default shown as the placeholder.' }))));
    for (const [key, title, fields] of CONTENT_SCHEMA) {
      const val = Object.assign(clone(DEF[key] || {}), (rows[key] && rows[key].value) || {});
      const note = el('span', { class: 'muted', text: rows[key] ? `Saved ${fmtDate(rows[key].updated_at)}` : 'Using defaults' });
      const card = el('section', { class: 'card' }, el('div', { class: 'card-h' }, el('h2', { text: title }), note),
        fields.map(f => { const n = fieldEl(val, f); const inp = n.querySelector('input:not([type=checkbox]),textarea'); if (inp && f.type !== 'list' && DEF[key]) inp.placeholder = DEF[key][f.key] || ''; return n; }),
        el('div', { class: 'row end' },
          el('button', { class: 'btn ghost', text: 'Reset to defaults', onclick: (e) => { if (confirm(`Reset "${title}" to the built-in defaults?`)) busy(e.currentTarget, async () => { await api(`site_content?key=eq.${key}`, { method: 'DELETE', prefer: 'return=minimal' }); toast('Reset. Publish to update the website.'); edited(); route(); }); } }),
          el('button', { class: 'btn primary', text: 'Save', onclick: (e) => busy(e.currentTarget, async () => {
            const clean = {};
            for (const f of fields) { const v = val[f.key]; clean[f.key] = Array.isArray(v) ? v.map(s => String(s).trim()).filter(Boolean) : String(v || '').trim(); }
            if (key === 'quote_form' && !clean.inquiry_types.length) { toast('Keep at least one inquiry type.', 'err'); return; }
            await api('site_content?on_conflict=key', { method: 'POST', body: { key, value: clean }, prefer: 'resolution=merge-duplicates,return=minimal' });
            note.textContent = `Saved ${fmtDate(new Date().toISOString())}`; toast(`${title} saved. Publish to update the website.`); edited();
          }) })));
      put(main, card);
    }
  }

  /* ═════════════════════════ SETTINGS ═════════════════════════ */
  async function viewSettings() {
    const s = await getSettings();
    const hook = el('input', { type: 'url', id: 's-hook', value: s.deploy_hook_url || '', placeholder: 'https://api.vercel.com/v1/integrations/deploy/…' });
    const admins = (await api('admins?select=user_id,created_at')).data || [];
    put(main, el('div', { class: 'vhead' }, el('div', {}, el('h1', { text: 'Settings' }))),
      el('section', { class: 'card' }, el('div', { class: 'card-h' }, el('h2', { text: 'Publishing' })),
        el('p', { class: 'muted', text: 'The "Publish to website" button calls a Vercel Deploy Hook, which rebuilds the site from the CMS. Create one in Vercel → Project → Settings → Git → Deploy Hooks (branch: main) and paste its URL here.' }),
        el('label', { for: 's-hook', text: 'Vercel Deploy Hook URL' }), hook,
        el('p', { class: 'muted', text: s.last_published_at ? `Last published ${fmtDate(s.last_published_at)}.` : 'Not published from the CMS yet.' }),
        el('div', { class: 'row end' }, el('button', { class: 'btn primary', text: 'Save', onclick: (e) => busy(e.currentTarget, async () => {
          const v = hook.value.trim();
          if (v && !/^https:\/\/api\.vercel\.com\/v1\/integrations\/deploy\//.test(v)) { toast('That does not look like a Vercel Deploy Hook URL (it starts with https://api.vercel.com/v1/integrations/deploy/).', 'err'); return; }
          await setSetting('deploy_hook_url', v || null); toast('Saved.');
        }) }))),
      el('section', { class: 'card' }, el('div', { class: 'card-h' }, el('h2', { text: 'Admin accounts' })),
        el('p', { text: `${admins.length} admin account${admins.length === 1 ? '' : 's'} can sign in. You are signed in as ${session.email}.` }),
        el('p', { class: 'muted', text: 'To add an admin: in Supabase → Authentication → Users, click "Add user" (email + password, auto-confirm), then in Supabase → SQL Editor run:' }),
        el('pre', { class: 'mono', text: "insert into public.admins (user_id)\nselect id from auth.users where email = 'new.admin@example.com';" }),
        el('p', { class: 'muted', text: 'To remove one, delete the user in Supabase → Authentication → Users.' })));
  }

  /* ───────────────────────── start ───────────────────────── */
  if (!handleAuthRedirect()) boot();
})();
