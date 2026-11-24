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
    $('#q-title').textContent = opts.type === 'Sample request' ? 'Request a sample' : opts.type === 'Technical datasheet / CoA' ? 'Request the full datasheet' : 'Request a quote';
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
      const payload = { ...d, consent: true, context: form.dataset.context, page: location.pathname, submitted_at: new Date().toISOString() };
      const card = form.parentElement, done = $('.done', card), btn = $('.submit', form);
      let sent = false;
      if (SITE.leadEndpoint) {
        btn.disabled = true;
        try { const r = await fetch(SITE.leadEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(SITE.leadHeaders || {}) }, body: JSON.stringify(payload) }); sent = r.ok; } catch { sent = false; }
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

  /* ── year ── */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
}
