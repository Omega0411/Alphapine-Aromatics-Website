/* Alphapine & Aromatics — site interactions (no dependencies) */
{
  const SITE = window.SITE || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };
  const waLink = (msg) => `https://wa.me/${SITE.whatsapp || ''}?text=${encodeURIComponent(msg)}`;

  /* ── nav: shadow, mega menu, mobile menu ── */
  const navEl = $('.nav');
  const onScroll = () => { navEl && navEl.classList.toggle('scrolled', scrollY > 8); if (scrollY < 300) $$('.links a.on').forEach(a => a.classList.remove('on')); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const mega = $('#mega'), megaBtn = $('[data-mega]');
  const setMega = (open) => { if (!mega) return; mega.classList.toggle('open', open); megaBtn.setAttribute('aria-expanded', open); };
  megaBtn && megaBtn.addEventListener('click', (e) => { e.stopPropagation(); setMega(!mega.classList.contains('open')); });
  document.addEventListener('click', (e) => { if (mega && !mega.contains(e.target)) setMega(false); });
  mega && mega.addEventListener('click', (e) => { if (e.target.closest('a')) setMega(false); });

  const mm = $('#mmenu'), burger = $('[data-burger]');
  burger && burger.addEventListener('click', () => { const o = !mm.classList.contains('open'); mm.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); });
  mm && mm.addEventListener('click', (e) => { if (e.target.closest('a,button')) { mm.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });

  // highlight current section in nav (home page)
  const navLinks = $$('.links a[href^="#"]');
  if (navLinks.length) {
    const map = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((es) => es.forEach(en => { if (en.isIntersecting) { navLinks.forEach(a => a.classList.remove('on')); const a = map.get(en.target.id); a && a.classList.add('on'); } }), { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); s && spy.observe(s); });
  }

  /* ── reveal on scroll ── */
  const revealer = new IntersectionObserver((es) => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); revealer.unobserve(en.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach(el => reduce ? el.classList.add('in') : revealer.observe(el));

  /* ── counters ── */
  const counter = new IntersectionObserver((es) => es.forEach(en => {
    if (!en.isIntersecting) return; counter.unobserve(en.target);
    const el = en.target, to = +el.dataset.count; if (reduce) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 1600;
    const step = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(step); };
    el.textContent = 0; requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => counter.observe(el));

  /* ── catalogue filters ── */
  const grid = $('[data-grid]');
  const applyFilter = (f) => {
    if (!grid) return;
    $$('[data-filter]').forEach(b => { const on = b.dataset.filter === f; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    $$('.pcard', grid).forEach(c => {
      const show = f === 'all' || c.dataset.cat === f;
      if (show && c.classList.contains('hide')) { c.classList.remove('hide'); c.animate && !reduce && c.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.2,.7,.2,1)' }); }
      else if (!show) c.classList.add('hide');
      c.classList.add('in');
    });
    store.set('ap-filter', f);
  };
  $$('[data-filter]').forEach(b => b.addEventListener('click', () => applyFilter(b.dataset.filter)));
  $$('[data-filter-link]').forEach(a => a.addEventListener('click', () => { if (grid) applyFilter(a.dataset.filterLink); else store.set('ap-filter', a.dataset.filterLink); }));
  if (grid) { const saved = store.get('ap-filter'); if (saved && saved !== 'all') applyFilter(saved); }

  /* ── carousel (native scroll-snap) ── */
  $$('[data-carousel]').forEach(car => {
    const track = $('.slides', car), slides = $$('.slide', car), dots = $$('.dots button', car);
    let i = 0, timer = null;
    const go = (n) => { i = (n + slides.length) % slides.length; track.scrollTo({ left: slides[i].offsetLeft, behavior: reduce ? 'auto' : 'smooth' }); };
    const sync = () => { const n = Math.round(track.scrollLeft / track.clientWidth); if (n !== i) i = n; dots.forEach((d, k) => d.classList.toggle('on', k === i)); };
    track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    $('[data-prev]', car).addEventListener('click', () => { go(i - 1); restart(); });
    $('[data-next]', car).addEventListener('click', () => { go(i + 1); restart(); });
    dots.forEach((d, k) => d.addEventListener('click', () => { go(k); restart(); }));
    track.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); restart(); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); restart(); } });
    const start = () => { if (!reduce && !timer) timer = setInterval(() => go(i + 1), 5200); };
    const stop = () => { clearInterval(timer); timer = null; };
    const restart = () => { stop(); start(); };
    car.addEventListener('mouseenter', stop); car.addEventListener('mouseleave', start);
    car.addEventListener('focusin', stop); car.addEventListener('focusout', start);
    const vis = new IntersectionObserver(([en]) => en.isIntersecting ? start() : stop(), { threshold: 0.3 }); vis.observe(car);
  });

  /* ── accordions ── */
  $$('[data-acc]').forEach(acc => {
    const single = acc.dataset.acc === 'single';
    acc.addEventListener('click', (e) => {
      const q = e.target.closest('.acc-q, .rq'); if (!q || e.target.closest('[data-quote]')) return;
      const item = q.parentElement, open = !item.classList.contains('open');
      if (single) $$('.open', acc).forEach(x => { x.classList.remove('open'); $('.acc-q,.rq', x).setAttribute('aria-expanded', false); });
      item.classList.toggle('open', open); q.setAttribute('aria-expanded', open);
    });
  });

  /* ── WhatsApp links ── */
  $$('[data-wa]').forEach(a => { a.href = waLink(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });

  /* ── lead forms (landing + modal) ── */
  const modal = $('#quote');
  const openModal = (opts = {}) => {
    if (!modal) return;
    const f = $('form', modal), done = $('.done', modal);
    f.hidden = false; done.classList.remove('show');
    if (opts.product) f.product.value = opts.product;
    if (opts.type) f.type.value = opts.type; else f.type.value = 'Product quote';
    f.grade.value = opts.grade || '';
    if (opts.msg) f.message.value = opts.msg;
    $('[data-ctx]', modal).textContent = opts.product ? `${opts.type || 'Quote'} · ${opts.product}` : 'Direct procurement';
    $('#q-title').textContent = opts.type === 'Sample request' ? 'Request a sample' : opts.type === 'Technical datasheet / CoA' ? 'Request the full datasheet' : ($('#q-title').dataset.title || 'Request a quote');
    modal.classList.add('open'); document.body.style.overflow = 'hidden';
    setTimeout(() => f.name.focus(), 120);
  };
  const closeModal = () => { if (!modal) return; modal.classList.remove('open'); document.body.style.overflow = ''; };
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-quote]'); if (!t) return;
    e.preventDefault(); e.stopPropagation();
    openModal({ product: t.dataset.product, type: t.dataset.type, grade: t.dataset.grade, msg: t.dataset.msg });
  });
  modal && modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); setMega(false); } });

  // resource buttons on the landing page → preselect and focus the form
  $$('[data-res]').forEach(b => b.addEventListener('click', () => {
    const f = $('#contact form'); if (!f) return;
    f.type.value = b.dataset.res === 'catalogue' ? 'Technical datasheet / CoA' : 'General enquiry';
    f.message.value = b.dataset.res === 'catalogue' ? 'Please share the Product Catalogue 2025.' : 'Please share the company brochure.';
    f.name.focus({ preventScroll: true }); f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }));

  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  // Stores a submission: Supabase `leads` table when configured (see supabase/schema.sql),
  // otherwise the optional LEAD_ENDPOINT. Resolves true only when it was actually stored.
  const LEAD_MAX = { form: 20, name: 200, email: 320, company: 200, phone: 60, country: 100, inquiry_type: 100, product: 200, grade: 200, qty: 100, document: 40, message: 5000, page: 300 };
  async function saveLead(row, extra) {
    try {
      if (SITE.supabaseUrl && SITE.supabaseAnonKey) {
        const body = {};
        for (const [k, max] of Object.entries(LEAD_MAX)) { const v = row[k]; if (typeof v === 'string' && v.trim()) body[k] = v.trim().slice(0, max); }
        if (row.consent != null) body.consent = !!row.consent;
        const r = await fetch(`${SITE.supabaseUrl}/rest/v1/leads`, { method: 'POST', headers: { apikey: SITE.supabaseAnonKey, Authorization: `Bearer ${SITE.supabaseAnonKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(body) });
        return r.ok;
      }
      if (SITE.leadEndpoint) {
        const r = await fetch(SITE.leadEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(SITE.leadHeaders || {}) }, body: JSON.stringify({ ...row, ...extra }) });
        return r.ok;
      }
    } catch { /* network error: fall through to the email / WhatsApp hand-off */ }
    return false;
  }
  // hidden "website" field: people never see it, bots fill it in
  const isBot = (form) => !!(form.website && form.website.value);
  $$('form[data-lead]').forEach(form => {
    form.addEventListener('input', (e) => e.target.closest('.field') && e.target.closest('.field').classList.remove('bad'));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      let ok = true;
      const bad = (name) => { form[name].closest('.field').classList.add('bad'); ok = false; };
      if (!d.name || !d.name.trim()) bad('name');
      if (!validEmail(d.email || '')) bad('email');
      if (!form.consent.checked) { form.consent.focus(); ok = false; }
      if (!ok) { const first = $('.bad input, .bad select', form); first && first.focus(); return; }

      const lines = [
        `Enquiry — ${d.type || 'General'}`, d.product && `Product: ${d.product}`, d.grade && `Grade: ${d.grade}`, d.qty && `Quantity: ${d.qty}`,
        `Name: ${d.name}`, d.company && `Company: ${d.company}`, `Email: ${d.email}`, d.phone && `Phone: ${d.phone}`, d.message && `Message: ${d.message}`,
      ].filter(Boolean);
      const text = lines.join('\n');
      const card = form.parentElement, done = $('.done', card), btn = $('.submit', form);
      let sent = isBot(form);
      if (!sent) {
        btn.disabled = true;
        sent = await saveLead({ form: form.dataset.context === 'quote' ? 'quote' : 'contact', name: d.name, email: d.email, company: d.company, phone: d.phone, inquiry_type: d.type, product: d.product, grade: d.grade, qty: d.qty, message: d.message, page: location.pathname, consent: true },
          { type: d.type, context: form.dataset.context, submitted_at: new Date().toISOString() });
        btn.disabled = false;
      }
      $('h4', done).textContent = sent ? 'Thank you — your enquiry has been received.' : 'Your enquiry is ready to send.';
      $('[data-done-text]', done).textContent = sent ? 'Our team will reply with a quote, datasheet or CoA. You can also reach us directly:' : "Choose how you'd like to send it — our team will reply with a quote, datasheet or CoA.";
      $('.note', done).hidden = sent;
      $('[data-done-wa]', done).href = waLink(text);
      $('[data-done-mail]', done).href = `mailto:${SITE.email}?subject=${encodeURIComponent(`Enquiry: ${d.product || d.type || 'Alphapine'}`)}&body=${encodeURIComponent(text)}`;
      const dl = $('[data-done-dl]', done);
      if (SITE.catalogueUrl && (form.dataset.context === 'brochure' || /datasheet/i.test(d.type || ''))) { dl.hidden = false; dl.href = SITE.base + SITE.catalogueUrl; } else dl.hidden = true;
      form.hidden = true; done.classList.add('show');
    });
  });

  /* ── facility photos: B&W at rest, colour revealed on hover from the pointer's entry point ── */
  $$('[data-carousel]').forEach(car => {
    if (!$('.slide.photo', car)) return;
    const at = (e) => { const r = car.getBoundingClientRect(); car.style.setProperty('--rx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`); car.style.setProperty('--ry', `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`); };
    car.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; at(e); car.classList.add('lit'); });
    car.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'mouse') return; at(e); car.classList.remove('lit'); });
    // touch screens have no hover: reveal colour once the carousel is in view
    if (matchMedia('(hover: none)').matches) new IntersectionObserver(([en]) => car.classList.toggle('lit', en.isIntersecting), { threshold: 0.6 }).observe(car);
  });

  /* ── industries cards: soft spotlight follows the pointer ── */
  $$('[data-spot]').forEach(g => g.addEventListener('pointermove', (e) => {
    const c = e.target.closest('.ind'); if (!c) return;
    const r = c.getBoundingClientRect(); c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true }));

  /* ── TDS / MSDS request (product pages) — separate from the quote form ── */
  const docsForm = $('form[data-docs]');
  if (docsForm) {
    const done = $('.done', docsForm.parentElement), sec = document.getElementById('tds-msds');
    $$('[data-docs-req]').forEach(a => a.addEventListener('click', (e) => {
      e.preventDefault();
      if (a.dataset.docsReq) docsForm.doc.value = a.dataset.docsReq;
      sec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', '#tds-msds');
      if (!docsForm.hidden) setTimeout(() => docsForm.name.focus({ preventScroll: true }), reduce ? 0 : 700);
    }));
    docsForm.addEventListener('input', (e) => e.target.closest('.field') && e.target.closest('.field').classList.remove('bad'));
    docsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(docsForm));
      let ok = true;
      const bad = (n) => { docsForm[n].closest('.field').classList.add('bad'); ok = false; };
      if (!d.name || !d.name.trim()) bad('name');
      if (!d.company || !d.company.trim()) bad('company');
      if (!validEmail(d.email || '')) bad('email');
      if (!ok) { $('.bad input', docsForm).focus(); return; }
      const docLabel = d.doc === 'Both' ? 'TDS & MSDS' : d.doc;
      const btn = $('.submit', docsForm);
      let sent = isBot(docsForm);
      if (!sent) {
        btn.disabled = true;
        sent = await saveLead({ form: 'tds-msds', name: d.name, company: d.company, email: d.email, phone: d.phone, country: d.country, product: d.product, document: docLabel, page: location.pathname },
          { type: 'TDS / MSDS request', context: 'tds-msds', submitted_at: new Date().toISOString() });
        btn.disabled = false;
      }
      const fallback = $('[data-docs-fallback]', done);
      if (sent) {
        // confirmation text is editable in the CMS: {document} and {product} are filled in here
        const tpl = docsForm.dataset.confirm || 'Thank you. Your request for {document} for {product} has been received. Our team will share the document on your email shortly.';
        const msg = tpl.replace(/\{document\}/g, docLabel).replace(/\{product\}/g, d.product);
        const m = msg.match(/^(Thank you[.!]?)\s+([\s\S]*)$/);
        $('h4', done).textContent = m ? m[1] : 'Thank you.';
        $('[data-done-text]', done).textContent = m ? m[2] : msg;
        fallback.hidden = true;
      } else {
        // no lead endpoint configured (or it failed): hand the request to email / WhatsApp rather than claim it was received
        const text = [`${docLabel} request — ${d.product}`, `Name: ${d.name}`, `Company: ${d.company}`, `Work email: ${d.email}`, d.phone && `Mobile / WhatsApp: ${d.phone}`, d.country && `Country: ${d.country}`].filter(Boolean).join('\n');
        $('h4', done).textContent = 'Your request is ready to send.';
        $('[data-done-text]', done).textContent = `Send your request for ${docLabel} for ${d.product} by email or WhatsApp, and our team will share the document on your email.`;
        $('[data-done-mail]', done).href = `mailto:${SITE.email}?subject=${encodeURIComponent(`${docLabel} request: ${d.product}`)}&body=${encodeURIComponent(text)}`;
        $('[data-done-wa]', done).href = waLink(text);
        fallback.hidden = false;
      }
      docsForm.hidden = true; done.classList.add('show');
    });
  }

  /* ── product pages: quick-enquiry dock — hidden while the product header (it has its own quote buttons), the TDS form or the footer is on screen ── */
  const dock = $('.pdp-dock');
  if (dock && 'IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver((es) => { es.forEach(en => en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)); dock.classList.toggle('hide', seen.size > 0); }, { threshold: 0, rootMargin: '-90px 0px 0px 0px' });   // ignore the strip under the sticky nav
    ['.pdp-hero', '#tds-msds .form-card', '.foot'].forEach(s => { const n = $(s); n && io.observe(n); });
  }

  /* ── landing hero: crossfading plant photos ──
     The first photo loads with the page; the others load after it, one ahead of the slide shown.
     Runs while the hero is on screen and the tab is visible; the pause button stops it. The progress bar
     (CSS animation) is kept in step with the timer. Reduced motion: still advances, with a fade and no zoom. */
  const slides = $$('.hero-bg .hs');
  if (slides.length > 1) {
    const DUR = 5500;
    const hero = $('.hero'), ctrl = $('.hero-ctrl'), segs = $$('.hs-seg', ctrl), pauseBtn = $('.hs-pause', ctrl);
    const capN = $('.hs-cap b', ctrl), capT = $('.hs-cap em', ctrl);
    ctrl.style.setProperty('--hs-dur', `${DUR}ms`);
    let cur = 0, paused = false, onScreen = true, timer = null, left = DUR, startedAt = 0, waiting = false;
    const running = () => !paused && onScreen && !document.hidden;
    const hydrate = (pic) => { if (pic.dataset.ready) return; pic.dataset.ready = '1'; $$('source[data-srcset]', pic).forEach(s => { s.srcset = s.dataset.srcset; }); const img = $('img', pic); if (img.dataset.src) img.src = img.dataset.src; };
    const loaded = (pic) => { const img = $('img', pic); return !!pic.dataset.ready && img.complete && img.naturalWidth > 0; };
    const stop = () => { if (timer) { clearTimeout(timer); timer = null; left = Math.max(0, left - (performance.now() - startedAt)); } };
    const arm = () => { if (timer || waiting || !running()) return; startedAt = performance.now(); timer = setTimeout(() => { timer = null; advance(cur + 1); }, left); };
    const sync = () => { ctrl.classList.toggle('paused', !running()); running() ? arm() : stop(); };
    function show(n) {
      const next = (n + slides.length) % slides.length;
      if (next !== cur) {
        const prev = slides[cur];
        prev.classList.remove('on'); prev.classList.add('out');
        setTimeout(() => prev.classList.remove('out'), 1600);
        slides[next].classList.add('on'); cur = next;
      }
      segs.forEach((g, k) => { g.classList.remove('on'); if (k === cur) { void g.offsetWidth; g.classList.add('on'); g.setAttribute('aria-current', 'true'); } else g.removeAttribute('aria-current'); });
      capN.textContent = String(cur + 1).padStart(2, '0'); capT.textContent = slides[cur].dataset.label || '';
      hydrate(slides[(cur + 1) % slides.length]);
      left = DUR; stop(); left = DUR; sync();
    }
    function advance(n) {
      const pic = slides[(n + slides.length) % slides.length];
      hydrate(pic);
      if (loaded(pic)) return show(n);
      waiting = true; ctrl.classList.add('paused');
      const img = $('img', pic);
      const done = () => { waiting = false; show(n); };
      img.addEventListener('load', done, { once: true }); img.addEventListener('error', () => { waiting = false; show(n + 1); }, { once: true });
    }
    pauseBtn.addEventListener('click', () => { paused = !paused; pauseBtn.setAttribute('aria-pressed', String(paused)); pauseBtn.setAttribute('aria-label', paused ? 'Play background slideshow' : 'Pause background slideshow'); sync(); });
    segs.forEach((g, k) => g.addEventListener('click', () => { stop(); advance(k); }));
    document.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; sync(); }).observe(hero);
    ctrl.hidden = false;
    show(0);
    // fetch the second photo once the page itself has finished loading
    if (document.readyState === 'complete') hydrate(slides[1]); else addEventListener('load', () => hydrate(slides[1]), { once: true });
  }

  /* ── year ── */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
}
