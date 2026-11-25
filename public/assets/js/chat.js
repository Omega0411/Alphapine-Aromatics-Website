/* Alphapine site assistant — a guided, rule-based chat (no AI service).
   Answers come only from the site's own content (assets/data/chat.json, generated at build time),
   and anything it cannot resolve is handed to the team on WhatsApp with the context pre-filled.
   Flow: 1 topic → 2 product type / question / section → 3 product detail or "did that help?" → 4 WhatsApp.
   The conversation persists across pages for the browser session. All content is rendered as text. */
(() => {
  'use strict';
  const SITE = window.SITE || {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'ap-chat-v1';
  const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; } };
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(S)); } catch { /* storage unavailable */ } };
  let S = load() || { open: false, log: [], ctx: {} };
  let D = null; // chat.json

  /* ───────────── DOM helpers ───────────── */
  function el(tag, props = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c)));
    return n;
  }
  const ICON = {
    chat: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5z"/><path d="M8.5 8.5h7M8.5 11.5h4.5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    restart: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>',
    send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/>',
    wa: '<path d="M4 20l1.2-4.1A8.3 8.3 0 1 1 8.4 19z"/><path d="M9 8.6c.3 2.9 2.8 5.6 6 6.3l1.3-1.4-2-1-1 .8a4.6 4.6 0 0 1-2.3-2.3l.8-1-1-2z"/>',
  };
  const svg = (name) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'ic'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.7'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.innerHTML = ICON[name]; return s; };
  const url = (href) => (SITE.base || '') + href;

  /* ───────────── shell ───────────── */
  const launcher = el('button', { class: 'chat-launch', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'ap-chat', 'aria-label': 'Open chat — ask Alphapine' }, svg('chat'), el('span', { text: 'Ask Alphapine' }));
  const logEl = el('div', { class: 'chat-log', role: 'log', 'aria-live': 'polite', 'aria-label': 'Conversation' });
  const input = el('input', { type: 'text', class: 'chat-in', placeholder: 'Type your question…', 'aria-label': 'Type your question', maxlength: '500', autocomplete: 'off' });
  const form = el('form', { class: 'chat-form', onsubmit: (e) => { e.preventDefault(); const t = input.value.trim(); if (t) { input.value = ''; typed(t); } } },
    input, el('button', { type: 'submit', class: 'chat-send', 'aria-label': 'Send' }, svg('send')));
  const panel = el('section', { class: 'chat-panel', id: 'ap-chat', role: 'dialog', 'aria-label': 'Alphapine assistant', hidden: true },
    el('header', { class: 'chat-head' },
      el('span', { class: 'chat-ava', 'aria-hidden': 'true' }, svg('chat')),
      el('div', {}, el('b', { text: 'Alphapine Assistant' }), el('small', { text: 'Instant answers · team on WhatsApp' })),
      el('button', { type: 'button', class: 'chat-ib', 'aria-label': 'Start over', title: 'Start over', onclick: () => restart() }, svg('restart')),
      el('button', { type: 'button', class: 'chat-ib', 'aria-label': 'Close chat', title: 'Close', onclick: () => setOpen(false) }, svg('close'))),
    logEl, form);
  const root = el('div', { class: 'chat-root' }, panel, launcher);
  document.body.append(root);

  launcher.addEventListener('click', () => setOpen(!S.open));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.open && !document.querySelector('.modal.open')) setOpen(false); });

  async function setOpen(open, quiet) {
    S.open = open; save();
    panel.hidden = !open; launcher.setAttribute('aria-expanded', String(open));
    root.classList.toggle('is-open', open);
    if (!open) { if (!quiet) launcher.focus(); return; }
    if (!D) await loadData();
    if (!S.log.length) { go('start'); save(); }
    render();
    if (!quiet) { const first = logEl.querySelector('.chat-msg:last-child .chat-opt:not([disabled]), .chat-msg:last-child a'); (first || input).focus({ preventScroll: true }); }
  }
  async function loadData() {
    try {
      const r = await fetch(url(SITE.chatData || 'assets/data/chat.json'));
      if (!r.ok) throw new Error(r.status);
      D = await r.json();
    } catch {
      D = { contact: { whatsapp: SITE.whatsapp, email: SITE.email }, products: [], faqs: [], sections: [], industries: [], categories: [], quality: { lab: [], cards: [] } };
    }
  }
  function restart() { S.log = []; S.ctx = {}; go('start'); save(); render(); input.focus(); }

  /* ───────────── messages ───────────── */
  // A bot message is data: { text, list, card, links:[{label,href,dl,wa,quote,type}], opts:[{label,go,arg}] }
  function say(msg) { S.log.push(Object.assign({ who: 'bot' }, msg)); }
  function me(text) { S.log.push({ who: 'me', text }); }
  function render() {
    logEl.textContent = '';
    S.log.forEach((m, i) => logEl.append(msgEl(m, i === S.log.length - 1)));
    logEl.scrollTop = logEl.scrollHeight;
  }
  function msgEl(m, last) {
    if (m.who === 'me') return el('div', { class: 'chat-msg me' }, el('p', { text: m.text }));
    return el('div', { class: 'chat-msg bot' },
      m.text ? m.text.split('\n').map(t => el('p', { text: t })) : null,
      m.list ? el('ul', {}, m.list.map(t => el('li', { text: t }))) : null,
      m.card ? el('div', { class: 'chat-card' }, el('b', { text: m.card.name }), el('small', { text: m.card.meta }), el('p', { text: m.card.text })) : null,
      m.links && m.links.length ? el('div', { class: 'chat-links' }, m.links.map(linkEl)) : null,
      m.opts && m.opts.length ? el('div', { class: 'chat-opts', role: 'group', 'aria-label': 'Options' }, m.opts.map(o => el('button', { type: 'button', class: 'chat-opt', disabled: !last, onclick: () => pick(o) }, o.label))) : null);
  }
  function linkEl(l) {
    if (l.quote) return el('button', { type: 'button', class: 'chat-link', 'data-quote': '', 'data-product': l.product || null, 'data-type': l.type || null, onclick: () => { if (matchMedia('(max-width: 640px)').matches) setOpen(false, true); } }, l.label);
    const a = el('a', { class: `chat-link${l.wa ? ' wa' : ''}`, href: l.wa ? waHref() : url(l.href), target: l.wa ? '_blank' : null, rel: l.wa ? 'noopener' : null, download: l.dl || null }, l.wa ? svg('wa') : null, l.label);
    a.addEventListener('click', () => {
      if (l.wa) a.href = waHref();   // always send the latest context
      // on a phone the open chat covers the page: close it so the destination is visible
      if (!l.wa && !l.dl && matchMedia('(max-width: 640px)').matches) setOpen(false, true);
    });
    return a;
  }
  async function pick(o) { me(o.label); await reply(() => go(o.go, o.arg, true)); }
  async function typed(t) { me(t); await reply(() => answerText(t)); }
  async function reply(fn) {
    render();
    const dots = el('div', { class: 'chat-msg bot typing', 'aria-hidden': 'true' }, el('i'), el('i'), el('i'));
    logEl.append(dots); logEl.scrollTop = logEl.scrollHeight;
    if (!reduce) await new Promise(r => setTimeout(r, 450));
    dots.remove(); fn(); save(); render();
    const first = logEl.querySelector('.chat-msg:last-child .chat-opt, .chat-msg:last-child .chat-link');
    if (first && document.activeElement !== input) first.focus({ preventScroll: true });
  }

  /* ───────────── WhatsApp hand-off (stage 4) ───────────── */
  function waHref() {
    const c = S.ctx, lines = ['Hello Alphapine team, I have a query from your website.'];
    if (c.topic) lines.push(`Topic: ${c.topic}`);
    if (c.product) lines.push(`Product: ${c.product}`);
    if (c.query) lines.push(`My question: ${c.query}`);
    lines.push(`Page: ${location.href.split('#')[0]}`);
    return `https://wa.me/${(D && D.contact.whatsapp) || SITE.whatsapp || ''}?text=${encodeURIComponent(lines.join('\n'))}`;
  }
  function handoff(text) {
    const c = D.contact;
    say({ text: `${text || 'Our team will help you directly.'}\nWhatsApp: ${c.phone || ''}${c.email ? `\nEmail: ${c.email}` : ''}`,
      links: [{ label: 'Chat on WhatsApp', wa: true }], opts: [{ label: 'Back to main menu', go: 'start' }] });
  }
  const helped = (extra = []) => [...extra, { label: 'Yes, that helps', go: 'done' }, { label: 'No — talk to the team', go: 'wa' }];

  /* ───────────── flow ───────────── */
  const prod = (slug) => D.products.find(p => p.slug === slug);
  const catLabel = (id) => (D.categories.find(c => c.id === id) || {}).label || id;
  const faq = (re) => D.faqs.find(f => re.test(f.q));

  function go(node, arg, fromUser) {
    S.ctx.awaiting = null;
    switch (node) {
      // ── stage 1
      case 'start':
        S.ctx = {};
        say({ text: (fromUser ? '' : 'Hello! I\'m the Alphapine assistant.\n') + 'What can I help you with?', opts: [
          { label: 'Products', go: 'products' },
          { label: 'Quality & certifications', go: 'quality' },
          { label: 'Website help / about Alphapine', go: 'general' },
          { label: 'My query isn\'t listed', go: 'other' }] });
        break;
      case 'done':
        say({ text: 'Glad that helped. Anything else?', opts: [{ label: 'Products', go: 'products' }, { label: 'Quality & certifications', go: 'quality' }, { label: 'Website help', go: 'general' }, { label: 'My query isn\'t listed', go: 'other' }] });
        break;
      case 'wa': handoff('No problem — our team will take it from here.'); break;

      // ── stage 2: products
      case 'products':
        S.ctx.topic = 'Products';
        say({ text: 'Which product type are you looking for?', opts: [
          ...D.categories.map(c => ({ label: `${c.label} (${c.count})`, go: 'cat', arg: c.id })),
          { label: 'Search by product name', go: 'search-product' },
          { label: 'Back', go: 'start' }] });
        break;
      case 'cat':
        say({ text: arg === 'mfg' ? 'Made at our own automated plant from Gum Turpentine Oil. Choose a product:' : 'Procured from verified sources and re-tested in our lab before dispatch. Choose a product:',
          opts: [...D.products.filter(p => p.cat === arg).map(p => ({ label: p.name, go: 'product', arg: p.slug })), { label: 'Back', go: 'products' }] });
        break;
      case 'search-product':
        S.ctx.awaiting = 'product-search';
        say({ text: 'Type the product name or CAS number (e.g. "Terpineol" or "98-55-5").', opts: [{ label: 'Back', go: 'products' }] });
        break;

      // ── stage 3: one product
      case 'product': {
        const p = prod(arg); if (!p) return go('products');
        S.ctx.topic = 'Products'; S.ctx.product = p.name; S.ctx.slug = p.slug;
        say({ card: { name: p.name, meta: `${catLabel(p.cat)} · CAS ${p.cas}${p.pill ? ` · ${p.pill}` : ''}`, text: p.card },
          text: 'What would you like to know?', opts: productOpts(p) });
        break;
      }
      case 'p-grades': {
        const p = prod(arg);
        say({ text: p.grades.length > 1 ? `${p.name} is available in ${p.grades.length} grades:` : `${p.name} grade:`, list: p.grades.length ? p.grades : ['Grade details are shared with your quotation.'],
          links: [{ label: 'Request a quote', quote: true, product: p.name }], opts: helped([{ label: 'More about this product', go: 'product', arg: p.slug }]) });
        break;
      }
      case 'p-apps': {
        const p = prod(arg);
        say({ text: `Main applications of ${p.name}:`, list: p.uses.map(([t, d]) => `${t} — ${d}`),
          links: [{ label: 'See industries we serve', href: 'industries.html' }], opts: helped([{ label: 'More about this product', go: 'product', arg: p.slug }]) });
        break;
      }
      case 'p-docs': {
        const p = prod(arg);
        say({ text: `You can request the Technical Data Sheet (TDS) and Material Safety Data Sheet (MSDS) for ${p.name} on its page — our team emails them to you.`,
          links: [{ label: 'Request TDS & MSDS', href: `products/${p.slug}.html#tds-msds` }], opts: helped([{ label: 'More about this product', go: 'product', arg: p.slug }]) });
        break;
      }
      case 'p-quote': {
        const p = prod(arg);
        say({ text: `Share your grade and quantity for ${p.name} and we respond with pricing, availability and a batch CoA. MOQ starts from 25 kg; samples dispatch within 48 hours.`,
          links: [{ label: 'Request a quote', quote: true, product: p.name }, { label: 'Request a sample', quote: true, product: p.name, type: 'Sample request' }], opts: helped([{ label: 'More about this product', go: 'product', arg: p.slug }]) });
        break;
      }
      case 'p-ask': {
        const p = prod(arg);
        S.ctx.awaiting = 'product-question';
        say({ text: `Type your question about ${p.name} — for example a specification, packaging or a specific application.`, opts: [{ label: 'Back', go: 'product', arg: p.slug }] });
        break;
      }

      // ── stage 2: quality & certifications
      case 'quality':
        S.ctx = { topic: 'Quality & certifications' };
        say({ text: 'What would you like to know about quality?', opts: [
          { label: 'How do you test every batch?', go: 'q-test' },
          { label: 'Can I get a CoA / GC-MS report?', go: 'q-coa' },
          { label: 'Manufactured vs Quality Assured', go: 'q-types' },
          { label: 'Certificates & compliance documents', go: 'q-certs' },
          { label: 'Something else', go: 'q-other' },
          { label: 'Back', go: 'start' }] });
        break;
      case 'q-test':
        say({ text: D.quality.intro, list: D.quality.lab.map(([a, b]) => `${a} — ${b}`), links: [{ label: 'See our quality section', href: 'index.html#quality' }], opts: helped([{ label: 'Another quality question', go: 'quality' }]) });
        break;
      case 'q-coa': {
        const f = faq(/Certificate of Analysis|CoA/i);
        say({ text: f ? f.a : 'Yes — a batch Certificate of Analysis can be shared with your quotation or order.', opts: helped([{ label: 'Another quality question', go: 'quality' }]) });
        break;
      }
      case 'q-types': {
        const f = faq(/Manufactured.*Quality Assured/i);
        say({ text: f ? f.a : 'Manufactured products are made at our own plant; Quality Assured products are sourced from verified producers and re-tested in our lab.', opts: helped([{ label: 'Another quality question', go: 'quality' }]) });
        break;
      }
      case 'q-certs':
        say({ text: 'Our quality section explains how every batch is tested and released. For specific certificates or compliance documents for your market or industry, our team shares what applies to your product and grade.',
          links: [{ label: 'See our quality section', href: 'index.html#quality' }], opts: [{ label: 'Ask the team on WhatsApp', go: 'wa' }, { label: 'Another quality question', go: 'quality' }, { label: 'Main menu', go: 'start' }] });
        break;
      case 'q-other':
        S.ctx.awaiting = 'free';
        say({ text: 'Type your quality or certification question.', opts: [{ label: 'Back', go: 'quality' }] });
        break;

      // ── stage 2: website help / about
      case 'general':
        S.ctx = { topic: 'Website help' };
        say({ text: 'What are you looking for?', opts: [
          ...D.sections.map(s => ({ label: s.label, go: 'sec', arg: s.id })),
          { label: 'Download the brochure', go: 'brochure' },
          { label: 'Search the website', go: 'search' },
          { label: 'Back', go: 'start' }] });
        break;
      case 'sec': {
        const s = D.sections.find(x => x.id === arg);
        say({ text: s.text, links: [{ label: `Go to ${s.label}`, href: s.href }], opts: helped([{ label: 'Something else on the site', go: 'general' }]) });
        break;
      }
      case 'brochure':
        say({ text: 'Our brochure covers all product lines — grades, CAS numbers, characteristics, applications and safety notes (PDF).',
          links: [{ label: 'Download brochure (PDF)', href: D.brochure.file, dl: D.brochure.name }], opts: helped([{ label: 'Something else on the site', go: 'general' }]) });
        break;
      case 'search':
        S.ctx.awaiting = 'search';
        say({ text: 'What are you looking for? Type a product, industry or topic (e.g. "pine oil", "perfumery", "MOQ", "address").', opts: [{ label: 'Back', go: 'general' }] });
        break;

      // ── stage 2: not listed
      case 'other':
        S.ctx = { topic: 'Other query' }; S.ctx.awaiting = 'free';
        say({ text: 'Please type your query below and I\'ll point you to the right place — or connect you with our team.', opts: [{ label: 'Back', go: 'start' }] });
        break;
      default: go('start');
    }
  }
  function productOpts(p) {
    return [
      { label: 'Grades & purity', go: 'p-grades', arg: p.slug },
      { label: 'Applications', go: 'p-apps', arg: p.slug },
      { label: 'Request TDS & MSDS', go: 'p-docs', arg: p.slug },
      { label: 'Price, quote or sample', go: 'p-quote', arg: p.slug },
      { label: 'Ask a specific question', go: 'p-ask', arg: p.slug },
      { label: 'Other products', go: 'products' }];
  }

  /* ───────────── free text ───────────── */
  const STOP = new Set('the a an and or of for to in on is are do does did you your we our i my me it its this that with what which how can could would should about from be been have has any get need want please tell know there where when who why give show find looking look like will at by as if not no yes hi hello hey thanks thank'.split(' '));
  const GENERIC = new Set(['oil', 'oils', 'grade', 'grades', 'natural', 'indian', 'crystal', 'bold', 'pure', 'product', 'products', 'alphapine', 'aromatics']);
  const norm = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
  const toks = (s) => norm(s).split(/[^a-z0-9α-ω]+/).filter(t => t.length > 1 && !STOP.has(t));
  const near = (a, b) => a === b || (Math.min(a.length, b.length) >= 4 && (a.startsWith(b) || b.startsWith(a)));

  function search(text) {
    const q = toks(text), flat = norm(text).replace(/[^a-z0-9]/g, ''), sig = q.filter(t => !GENERIC.has(t));
    const products = D.products.map(p => {
      const name = norm(p.name.replace(/\(.*?\)|[\d.]+\s*[–-]?\s*[\d.]*\s*%/g, ' '));
      const nt = toks(name).filter(t => !GENERIC.has(t));
      let score = nt.filter(t => q.some(x => near(x, t))).length;
      if (nt.length && flat.includes(name.replace(/[^a-z0-9]/g, ''))) score += 3;
      if (p.cas && text.includes(p.cas)) score += 5;
      return { p, score };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
    const top = products.length ? products.filter(x => x.score === products[0].score).map(x => x.p).slice(0, 4) : [];
    const industries = D.industries.filter(d => toks(d.name).some(t => sig.some(x => near(x, t))));
    const sections = D.sections.filter(s => s.keys.some(k => sig.some(x => near(x, k))));
    const faqs = D.faqs.map(f => { const ft = new Set(toks(`${f.q} ${f.a}`)); return { f, score: sig.filter(x => [...ft].some(t => near(x, t))).length }; })
      .filter(x => x.score >= Math.min(2, sig.length) && x.score > 0).sort((a, b) => b.score - a.score);
    return { products: top, industries, sections, faq: faqs[0] && faqs[0].f, sig };
  }

  function answerText(text) {
    const mode = S.ctx.awaiting;
    S.ctx.awaiting = null;
    const t = norm(text);
    // a question about the product being viewed: the team answers it (stage 4)
    if (mode === 'product-question') { S.ctx.query = text; handoff(`Thanks — our technical team will answer your question about ${S.ctx.product} directly.`); return; }
    if (mode === 'free') S.ctx.query = text;
    if (/whats ?app|human|agent|person|call me|talk to/.test(t)) { S.ctx.query = S.ctx.query || text; handoff('Connecting you with our team.'); return; }

    const r = search(text);
    const intents = [];
    if (/\b(price|pricing|cost|rate|quote|quotation|buy|order|purchase)\b/.test(t)) intents.push('quote');
    if (/\bsample/.test(t)) intents.push('sample');
    if (/\b(tds|msds|sds|datasheet|data sheet|safety data)\b/.test(t)) intents.push('docs');
    if (/\b(brochure|catalogue|catalog|pdf|download)\b/.test(t)) intents.push('brochure');
    if (/\b(certif|iso|gmp|fssai|halal|kosher|reach|compliance)/.test(t)) intents.push('certs');

    // one clear product → open it
    if (r.products.length === 1 && !(mode === 'free' && !r.sig.length)) {
      const p = r.products[0];
      S.ctx.product = p.name; S.ctx.slug = p.slug; S.ctx.topic = S.ctx.topic || 'Products';
      if (intents.includes('docs')) return go('p-docs', p.slug);
      if (intents.includes('quote') || intents.includes('sample')) return go('p-quote', p.slug);
      return go('product', p.slug);
    }
    let found = false;
    if (r.products.length > 1) { found = true; say({ text: 'I found these products — which one?', opts: r.products.map(p => ({ label: p.name, go: 'product', arg: p.slug })) }); }
    if (intents.includes('certs')) { found = true; go('q-certs'); }
    if (intents.includes('brochure')) { found = true; say({ text: 'Here is our brochure (PDF):', links: [{ label: 'Download brochure (PDF)', href: D.brochure.file, dl: D.brochure.name }] }); }
    if (!r.products.length && (intents.includes('quote') || intents.includes('sample'))) { found = true; say({ text: 'Share your product, grade and quantity and we respond with pricing, availability and a batch CoA.', links: [{ label: intents.includes('sample') ? 'Request a sample' : 'Request a quote', quote: true, type: intents.includes('sample') ? 'Sample request' : null }] }); }
    if (!r.products.length && intents.includes('docs')) { found = true; say({ text: 'TDS and MSDS are requested on each product page. Which product do you need them for?', opts: [...D.categories.map(c => ({ label: c.label, go: 'cat', arg: c.id }))] }); }
    if (r.faq) { found = true; say({ text: `${r.faq.q}\n${r.faq.a}` }); }
    if (r.industries.length) { found = true; say({ text: r.industries.map(d => `${d.name} — ${d.line}`).join('\n'), links: r.industries.slice(0, 3).map(d => ({ label: d.name, href: `industries.html#${d.slug}` })) }); }
    if (r.sections.length && !r.faq) { found = true; const s = r.sections[0]; say({ text: s.text, links: [{ label: `Go to ${s.label}`, href: s.href }] }); }

    S.ctx.query = S.ctx.query || text;
    if (mode === 'free') {
      // "not listed": always share the team's WhatsApp as the next step
      if (found) say({ text: 'Did that answer your query?', opts: helped() });
      else handoff('Thanks for sharing your query. I couldn\'t find an exact answer on the website, so our team will help you directly.');
      return;
    }
    if (found) say({ text: 'Did that help?', opts: helped() });
    else handoff('I couldn\'t find that on the website. Our team will help you directly.');
  }

  /* ───────────── restore across pages ───────────── */
  if (S.open) setOpen(true, true);
})();
