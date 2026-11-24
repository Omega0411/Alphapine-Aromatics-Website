// Page templates. Pure functions: data in → HTML string out.
import { icon, molecule, formulaHTML, flaskArt, sourceArt, chromArt, processArt, appArt, drumsArt, bottleArt } from './lib/art.mjs';
import { site, nav, hero, ticker, heritage, catalogueIntro, facilities, plant, quality, resources, inquiryTypes, faq, industries, industriesIntro } from './data/site.mjs';
import { NOTES } from './data/products.mjs';

export const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CAT = { mfg: 'Manufactured', qa: 'Quality Assured' };
// keep Greek letters lower-case inside uppercase mono labels (α must not become Α)
const up = (s) => esc(s).replace(/([α-ωΔ]+)/g, '<span class="nt">$1</span>');
const years = () => new Date().getFullYear() - site.founded;
// Cache-busting: /assets/* is cached for 7 days (vercel.json), so CSS/JS URLs carry a content hash set by the build.
const V = {};
export const setAssetVersions = (v) => Object.assign(V, v);
const ver = (k) => (V[k] ? `?v=${V[k]}` : '');
// Responsive plant photo: WebP at 800/1400/2000w with a full-res JPEG fallback (files in public/assets/img/).
const PHOTO_W = [800, 1400, 2000];
const photo = (name, { alt = '', sizes, base = '', attrs = '', cls = '' }) => `<picture${cls ? ` class="${cls}" aria-hidden="true"` : ''}><source type="image/webp" srcset="${PHOTO_W.map(w => `${base}assets/img/${name}-${w}.webp ${w}w`).join(', ')}" sizes="${sizes}"><img src="${base}assets/img/${name}.jpg" alt="${esc(alt)}" width="2000" height="1500" decoding="async" ${attrs}></picture>`;

// ───────────────────────────── shell ─────────────────────────────
function head({ title, desc, base, canonical, jsonld }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0b2e2a">
<link rel="canonical" href="${esc(site.url + canonical)}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website">
<link rel="icon" href="${base}assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="${base}assets/fonts/playfair-display-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${base}assets/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${base}assets/css/fonts.css${ver('fonts')}">
<link rel="stylesheet" href="${base}assets/css/main.css${ver('css')}">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
</head>
<body>`;
}

function header(base, products, isHome) {
  const link = (id) => isHome ? `#${id}` : `${base}index.html#${id}`;
  const list = (cat) => products.filter(p => p.cat === cat).map(p => `<li><a href="${base}products/${p.slug}.html"><b>${p.letter}</b>${esc(p.name)}</a></li>`).join('');
  return `<a class="sr" href="#main">Skip to content</a>
<header class="nav" id="top">
  <div class="wrap nav-in">
    <a class="brand" href="${base}index.html" aria-label="Alphapine &amp; Aromatics — home"><img src="${base}assets/img/logo-light.png" alt="Alphapine &amp; Aromatics" width="61" height="46"></a>
    <nav class="links" aria-label="Primary">${nav.map(([t, id]) => `<a href="${link(id)}">${t}</a>`).join('')}</nav>
    <div class="nav-cta">
      <button class="btn btn-teal sm" data-mega aria-expanded="false" aria-controls="mega">Explore Products ${icon('chev', 'chev')}</button>
      <button class="burger" data-burger aria-label="Open menu" aria-expanded="false">${icon('menu')}</button>
    </div>
  </div>
  <div class="mega" id="mega">
    <div class="wrap mega-in">
      <div><h4>Manufactured · 7</h4><ul>${list('mfg')}</ul></div>
      <div><h4>Quality Assured · 9</h4><ul>${list('qa')}</ul></div>
      <div class="mega-card"><span class="eyebrow" style="color:var(--gold);margin:0">Catalogue 2025</span><b style="font:500 20px/1.2 var(--serif)">Sixteen product lines, one release standard.</b><p>Every batch tested in-house before dispatch.</p><a class="btn btn-teal sm" href="${link('catalogue')}">View catalogue ${icon('arrow')}</a></div>
    </div>
  </div>
  <div class="mobile-menu" id="mmenu"><div class="wrap">${nav.map(([t, id]) => `<a href="${link(id)}">${t}</a>`).join('')}<button class="btn btn-teal" data-quote>Request a Quote ${icon('arrow')}</button></div></div>
</header>`;
}

function footer(base, isHome) {
  const link = (id) => isHome ? `#${id}` : `${base}index.html#${id}`;
  return `<footer class="foot">
  <div class="wrap">
    <div class="f-top">
      <div>
        <a class="f-logo" href="${base}index.html" aria-label="Alphapine &amp; Aromatics — home"><img src="${base}assets/img/logo-dark-footer.png" alt="Alphapine &amp; Aromatics Pvt. Ltd." width="150" height="116" loading="lazy"></a>
        <p>Formerly New Jolly Oil Company. Established ${site.founded}. Manufacturing since ${site.plantYear}. Sixteen product lines across aroma chemicals, essential oils and terpene derivatives — verified batch by batch.</p>
        <div class="socials">${site.social.map(([n, h, i]) => `<a ${h === 'wa' ? 'data-wa="Hello Alphapine team, I have an enquiry." href="#"' : `href="${h}"`} aria-label="${n}" target="_blank" rel="noopener">${icon(i)}</a>`).join('')}</div>
      </div>
      <div><h4>Catalogue</h4><ul><li><a href="${link('catalogue')}" data-filter-link="mfg">Manufactured</a></li><li><a href="${link('catalogue')}" data-filter-link="qa">Quality Assured</a></li><li><a href="${base}products/terpineol.html">Grades &amp; Purity</a></li><li><a href="#" data-quote data-type="Sample request">Sample Request</a></li></ul></div>
      <div><h4>Company</h4><ul><li><a href="${link('about')}">About</a></li><li><a href="${link('plant')}">Plant &amp; Lab</a></li><li><a href="${link('quality')}">Certifications</a></li><li><a href="${link('faq')}">FAQ</a></li></ul></div>
      <div><h4>Contact</h4><ul><li><a href="mailto:${site.email}">${site.email}</a></li><li><a href="tel:${site.phoneDisplay.replace(/\s/g, '')}">${site.phoneDisplay}</a></li><li><a href="#" data-wa="Hello Alphapine team, I have an enquiry.">WhatsApp Business</a></li><li><a href="#" data-quote>Ask a query</a></li><li><address class="f-addr">${esc(site.address)}</address></li></ul></div>
    </div>
    <div class="f-bot"><span>© <span data-year>${new Date().getFullYear()}</span> Alphapine &amp; Aromatics Pvt. Ltd. · All rights reserved</span><nav><a href="#">Privacy</a><a href="#">Terms</a><a href="${base}sitemap.xml">Sitemap</a></nav></div>
  </div>
</footer>`;
}

function formFields(products, { modal = false } = {}) {
  const opts = products.map(p => `<option>${esc(p.name)}</option>`).join('');
  return `<div class="fgrid">
  <div class="field"><label for="${modal ? 'm' : 'c'}-name">Full Name *</label><input id="${modal ? 'm' : 'c'}-name" name="name" required autocomplete="name" placeholder="Your full name"><span class="err">Please enter your name.</span></div>
  <div class="field"><label for="${modal ? 'm' : 'c'}-email">Your Email *</label><input id="${modal ? 'm' : 'c'}-email" name="email" type="email" required autocomplete="email" placeholder="you@company.com"><span class="err">Please enter a valid email.</span></div>
  <div class="field"><label for="${modal ? 'm' : 'c'}-company">Company Name</label><input id="${modal ? 'm' : 'c'}-company" name="company" autocomplete="organization" placeholder="Your organization"></div>
  <div class="field"><label for="${modal ? 'm' : 'c'}-phone">Phone / WhatsApp</label><input id="${modal ? 'm' : 'c'}-phone" name="phone" type="tel" autocomplete="tel" placeholder="+91 …"></div>
  <div class="field"><label for="${modal ? 'm' : 'c'}-type">Inquiry Type</label><select id="${modal ? 'm' : 'c'}-type" name="type">${inquiryTypes.map(t => `<option>${t}</option>`).join('')}</select></div>
  <div class="field"><label for="${modal ? 'm' : 'c'}-product">Product</label><select id="${modal ? 'm' : 'c'}-product" name="product"><option value="">Select a product</option>${opts}<option>Multiple products</option></select></div>
  ${modal ? `<div class="field"><label for="m-grade">Grade</label><input id="m-grade" name="grade" placeholder="e.g. 90–95% or Perfumery Grade"></div><div class="field"><label for="m-qty">Quantity</label><input id="m-qty" name="qty" placeholder="e.g. 500 kg"></div>` : ''}
  <div class="field full"><label for="${modal ? 'm' : 'c'}-msg">Message</label><textarea id="${modal ? 'm' : 'c'}-msg" name="message" placeholder="Describe your requirement (product name, quantity, specifications…)"></textarea></div>
</div>
<label class="consent"><input type="checkbox" name="consent" required> I consent to Alphapine &amp; Aromatics processing my data in accordance with the Privacy Policy and DPDP Act regulations.</label>`;
}

function doneBlock() {
  return `<div class="done" aria-live="polite"><div class="tick">${icon('check')}</div><h4>Your enquiry is ready to send.</h4><p data-done-text>Choose how you'd like to send it — our team will reply with a quote, datasheet or CoA.</p><div class="row"><a class="btn btn-wa" data-done-wa href="#" target="_blank" rel="noopener">${icon('wa')} Send via WhatsApp</a><a class="btn btn-out" data-done-mail href="#">${icon('mail')} Send via Email</a><a class="btn btn-out" data-done-dl href="#" target="_blank" rel="noopener" hidden>${icon('download')} Download catalogue</a></div><p class="note">Online submission connects once the CMS endpoint is configured (assets/js/config.js).</p></div>`;
}

function modal(products) {
  return `<div class="modal" id="quote" role="dialog" aria-modal="true" aria-labelledby="q-title">
  <div class="form-card">
    <button class="x" data-close aria-label="Close">${icon('close')}</button>
    <span class="ctx" data-ctx>Direct procurement</span>
    <h3 id="q-title">Request a quote</h3>
    <p class="sub">Share your requirement — we respond with pricing, availability and a batch CoA.</p>
    <form data-lead data-context="quote" novalidate>${formFields(products, { modal: true })}<button class="submit" type="submit">Submit Request</button></form>
    ${doneBlock()}
  </div>
</div>`;
}

function scripts(base) {
  return `<script src="${base}assets/js/config.js${ver('config')}"></script><script src="${base}assets/js/main.js${ver('js')}" defer></script></body></html>`;
}

// ───────────────────────────── product card ─────────────────────────────
export function productCard(p, base, i = 0, compact = false) {
  const chips = p.chips.slice(0, compact ? 0 : 5);
  const more = p.chips.length - chips.length;
  return `<a class="pcard" href="${base}products/${p.slug}.html" data-cat="${p.cat}" data-reveal style="--i:${i % 3}">
  <span class="letter">${p.letter}</span>
  <span class="tag ${p.cat}">${CAT[p.cat]}</span>
  <h3>${esc(p.name.replace(/\s*\(Natural Indian\)/, ''))}${/Natural Indian/.test(p.name) ? ' <i>(Natural)</i>' : ''}</h3>
  <span class="cas">CAS ${esc(p.cas)}</span>
  <p>${esc(p.card)}</p>
  ${chips.length ? `<div class="chips">${chips.map((c, k) => `<span class="chip${k === 0 ? ' on' : ''}">${esc(c)}</span>`).join('')}${!compact && more > 0 ? `<span class="chip">+${more}</span>` : ''}</div>` : ''}
  <div class="pcard-foot"><span class="mono">${p.tags.map(esc).join(' · ')}</span><span class="go" aria-hidden="true">${icon('arrow')}</span></div>
</a>`;
}

// ───────────────────────────── landing ─────────────────────────────
export function renderIndex(products, ordered) {
  const base = '';
  const mfgN = products.filter(p => p.cat === 'mfg').length, qaN = products.length - mfgN;
  const tItems = ticker.map(([t, slug]) => `<li><a href="${slug ? `products/${slug}.html` : '#catalogue'}">${esc(t)}</a></li>`).join('');
  const h1 = ['Engineering', '<em>Purity</em>', 'at', '<br>', '<em>Global</em>', '<em>Scale</em>'];
  let wi = 0;
  const jsonld = { '@context': 'https://schema.org', '@type': 'Organization', name: site.name, foundingDate: String(site.founded), url: site.url, email: site.email, description: hero.body };

  return head({ title: 'Alphapine & Aromatics — Terpene Derivatives, Essential Oils & Aroma Chemicals', desc: hero.body, base, canonical: '/', jsonld }) + header(base, products, true) + `
<main id="main">
<section class="hero" aria-label="Introduction">
  <div class="hero-bg">${photo(hero.photo, { sizes: '(max-width: 760px) 250vw, 100vw', attrs: `fetchpriority="high" style="object-position:${hero.photoPos}"` })}</div>
  <div class="hero-ov"></div>
  <div class="wrap hero-in">
    <span class="pill-glass fade-in" style="animation-delay:.05s">${esc(hero.pill)}</span>
    <h1>${h1.map(w => w === '<br>' ? '<br>' : `<span class="w" style="--i:${wi++}">${w}</span> `).join('')}</h1>
    <p class="fade-in">${esc(hero.body)}</p>
    <div class="hero-ctas fade-in" style="animation-delay:.9s"><a class="btn btn-teal lg" href="#catalogue">Explore Products ${icon('arrow')}</a><button class="btn btn-ghost lg" data-quote>Request a Quote</button><a class="btn btn-ghost lg" href="${hero.brochure.file}" download="${hero.brochure.name}" type="application/pdf">Download Brochure ${icon('download')}</a></div>
  </div>
</section>
<div class="ticker" aria-label="Product lines"><div class="ticker-track"><ul>${tItems}</ul><ul aria-hidden="true">${tItems}</ul></div></div>

<section class="sec heritage" id="about">
  <div class="wrap-n">
    <div class="sec-head" data-reveal>
      <div><p class="eyebrow">Industry footprint</p><h2 class="h2">A heritage of precision, measured in <em>numbers</em>.</h2></div>
      <p class="lede">${esc(heritage.intro)}</p>
    </div>
    <div class="stats">${heritage.stats.map((s, i) => { const v = s.value === 'auto-years' ? years() : s.value; return `<div class="stat" data-reveal style="--i:${i}"><span class="k">${s.label}</span><div class="v"><span data-count="${v}">${v}</span><em>${s.unit}</em></div><p>${esc(s.text)}</p></div>`; }).join('')}</div>
  </div>
</section>

<section class="sec industries" id="industries" aria-labelledby="ind-title">
  <div class="wrap">
    <div class="sec-head" data-reveal>
      <div><p class="eyebrow">Industries we serve</p><h2 class="h2" id="ind-title">Industries <em>Served</em></h2></div>
      <p class="lede">${esc(industriesIntro.home)}</p>
    </div>
    <div class="ind-grid" data-spot>${industries.map((d, i) => `<a class="ind" href="industries.html#${d.slug}" data-reveal style="--i:${i % 4}"><span class="ind-n">${String(i + 1).padStart(2, '0')}</span><span class="ibox">${icon(d.icon)}</span><h3>${esc(d.name)}</h3><p>${esc(d.line)}</p><span class="ind-go">Explore application ${icon('arrow')}</span></a>`).join('')}
      <div class="ind ind-cta" data-reveal style="--i:3"><span class="ind-n">${industries.length} industries</span><h3>Your formulation, <em>our chemistry.</em></h3><p>See how each industry uses our catalogue — or tell us your application directly.</p><div class="row"><a class="btn btn-dark sm" href="industries.html">View all industries ${icon('arrow')}</a><button class="btn btn-line sm" data-quote>Request a Quote</button></div></div>
    </div>
  </div>
</section>

<section class="sec" id="catalogue">
  <div class="wrap">
    <div class="sec-head" data-reveal>
      <div><p class="eyebrow">Product catalogue 2025</p><h2 class="h2">From terpene to <em>fragrance</em> —<br>a portfolio of sixteen.</h2>
        <div class="filters" role="tablist" aria-label="Filter products"><button class="on" data-filter="all" role="tab" aria-selected="true">All Products <b>${products.length}</b></button><button data-filter="mfg" role="tab" aria-selected="false">Manufactured <b>${mfgN}</b></button><button data-filter="qa" role="tab" aria-selected="false">Quality Assured <b>${qaN}</b></button></div></div>
      <p class="lede">${esc(catalogueIntro)}</p>
    </div>
    <div class="grid3" data-grid>${ordered.map((p, i) => productCard(p, base, i)).join('')}</div>
  </div>
</section>

<section class="sec facilities" id="plant">
  <div class="wrap">
    <div class="sec-head c" data-reveal><p class="eyebrow c nodash" style="letter-spacing:.24em">Manufacturing excellence</p><h2 class="h2">Inside Our <em>Facilities</em></h2></div>
    <div class="carousel" data-carousel data-reveal="scale" aria-roledescription="carousel" aria-label="Facilities">
      <div class="slides" tabindex="0">${facilities.map((f, i) => `<figure class="slide photo" aria-roledescription="slide" aria-label="${i + 1} of ${facilities.length}" style="margin:0;--op:${f.pos};--op-m:${f.posM}">${[0, 1].map(k => photo(f.photo, { alt: k ? '' : f.alt, cls: k ? 'clr' : '', sizes: '(max-width: 760px) 167vw, (max-width: 1280px) 100vw, 1200px', attrs: `loading="${i ? 'lazy' : 'eager'}"` })).join('')}<figcaption class="cap"><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></figcaption></figure>`).join('')}</div>
      <button class="cbtn prev" data-prev aria-label="Previous slide">${icon('left')}</button><button class="cbtn next" data-next aria-label="Next slide">${icon('right')}</button>
      <div class="dots">${facilities.map((_, i) => `<button aria-label="Go to slide ${i + 1}"${i === 0 ? ' class="on"' : ''}></button>`).join('')}</div>
    </div>
  </div>
</section>

<section class="sec plant">
  <div class="wrap-n">
    <div class="sec-head" data-reveal><div><p class="eyebrow">${esc(plant.eyebrow)}</p><h2 class="h2">Where Gum Turpentine becomes <em>precision.</em></h2></div><p class="lede">${esc(plant.intro)}</p></div>
    <div class="stations">${plant.stations.map((s, i) => `<article class="station" tabindex="0" data-reveal style="--i:${i}"><img src="assets/img/${s.img}" alt="" loading="lazy"><span class="pin">${icon('arrowUR')}</span><div class="cap"><span class="k">Station 0${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></article>`).join('')}</div>
  </div>
</section>

<section class="sec quality" id="quality">
  <div class="wrap-n q-grid">
    <div data-reveal><p class="eyebrow">Quality architecture</p><h2 class="h2">Trust, <em>tested.</em></h2><p class="lede" style="margin-top:20px">${esc(quality.intro)}</p>
      <ul class="lab-list">${quality.lab.map(([a, b]) => `<li><b>${a}</b><span>${b}</span></li>`).join('')}</ul></div>
    <div class="qcards">${quality.cards.map((c, i) => `<div class="qcard" data-reveal style="--i:${i}"><span class="ibox">${icon(c.icon)}</span><h3>${c.title}</h3><p>${c.text}</p><span class="mono">${c.tag}</span></div>`).join('')}</div>
  </div>
</section>

<section class="sec contact" id="contact">
  <div class="wrap c-grid">
    <div data-reveal><p class="eyebrow nodash">Resources &amp; downloads</p><h2 class="h2">Download Our<br><em>Brochure</em> &amp; <em>Technical Resources</em></h2><p class="lede">${esc(resources.intro)}</p>
      ${resources.items.map(r => `<a class="res" href="${r.file}" download="${hero.brochure.name}" type="application/pdf"><span class="ib">${icon(r.icon)}</span><span><b>${r.title}</b><small>${r.text}</small><em>${r.meta}</em></span><span class="dl">${icon('download')}</span></a>`).join('')}
    </div>
    <div class="form-card" data-reveal style="--i:1">
      <h3>Fill the Form for Any Product Related Enquiry or Requesting a Quote</h3><p class="sub">Fill in your details below and our technical team will reach out with customized information.</p>
      <form data-lead data-context="brochure" novalidate>${formFields(products)}<button class="submit" type="submit">Submit Inquiry &amp; Download Brochure</button></form>
      ${doneBlock()}
    </div>
  </div>
</section>

<section class="sec faq" id="faq">
  <div class="wrap-n f-grid">
    <div data-reveal><p class="eyebrow">Frequently asked</p><h2 class="h2">Answers, before<br>you ask.</h2><p class="lede" style="margin-top:18px">Everything procurement managers, formulators and R&amp;D teams ask us — distilled into straight answers.</p>
      <div class="help"><h3>Still have questions?</h3><p>Our specialists are available on WhatsApp and email for detailed sourcing or grade-related queries.</p><button class="btn btn-out sm" data-quote>Contact Us ${icon('arrow')}</button></div></div>
    <div class="acc" data-acc="single" data-reveal style="--i:1">${faq.map(([q, a], i) => `<div class="acc-item${i === 0 ? ' open' : ''}"><button class="acc-q" aria-expanded="${i === 0}">${esc(q)}<span class="tg">${icon('plus')}</span></button><div class="acc-a"><div><p>${esc(a)}</p></div></div></div>`).join('')}</div>
  </div>
</section>
</main>
` + footer(base, true) + modal(products) + scripts(base);
}

// ───────────────────────────── industries page ─────────────────────────────
export function renderIndustries(products) {
  const base = '';
  const bySlug = Object.fromEntries(products.map(p => [p.slug, p]));
  const pad = (i) => String(i + 1).padStart(2, '0');
  const jsonld = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Industries Served — Alphapine & Aromatics', description: industriesIntro.page, url: `${site.url}/industries`, hasPart: industries.map(d => ({ '@type': 'WebPageElement', name: d.name, description: d.line, url: `${site.url}/industries#${d.slug}` })) };
  return head({ title: 'Industries Served — Pharma, Perfumery, Flavour, Home Care & more | Alphapine & Aromatics', desc: industriesIntro.page, base, canonical: '/industries', jsonld }) + header(base, products, false) + `
<main id="main">
<section class="ind-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">Industries Served</span></nav>
    <p class="eyebrow fade-in" style="animation-delay:.05s">Applications · ${industries.length} industries</p>
    <h1 class="ind-h1"><span class="w" style="--i:0">Industries</span> <span class="w" style="--i:1"><em>Served</em></span></h1>
    <p class="lede fade-in">${esc(industriesIntro.page)}</p>
    <div class="fade-in" style="animation-delay:.9s"><button class="btn btn-teal lg" data-quote>Request a Quote ${icon('arrow')}</button></div>
    <nav class="ind-jump fade-in" style="animation-delay:1s" aria-label="Jump to an industry">${industries.map((d, i) => `<a href="#${d.slug}"><b>${pad(i)}</b>${esc(d.name)}</a>`).join('')}</nav>
  </div>
</section>

<section class="sec ind-list">
  <div class="wrap-n">${industries.map((d, i) => {
    const prods = d.products.map(s => bySlug[s]).filter(Boolean);
    return `<article class="ind-row" id="${d.slug}" data-reveal>
      <div class="ind-row-h"><span class="ind-n">${pad(i)} / ${pad(industries.length - 1)}</span><span class="ibox">${icon(d.icon)}</span></div>
      <div class="ind-row-b"><h2>${esc(d.name)}</h2><p class="ind-line">${esc(d.line)}</p><p>${esc(d.para)}</p>
        ${prods.length ? `<div class="ind-prods"><small>From our catalogue</small><div class="chips">${prods.map(p => `<a class="chip" href="products/${p.slug}.html">${esc(p.name.replace(/\s*\(Natural Indian\)/, ''))}</a>`).join('')}</div></div>` : ''}
        <button class="btn btn-rust sm" data-quote data-msg="Industry / application: ${esc(d.name)} — ">Request a Quote ${icon('arrow')}</button>
      </div>
    </article>`;
  }).join('')}
  </div>
</section>

<section class="ind-band">
  <div class="wrap-n ind-band-in" data-reveal>
    <div><p class="eyebrow">Direct procurement</p><h2 class="h2">Have an application <em>in mind?</em></h2><p class="lede">Share your industry, product and volume — we respond with pricing, availability and a batch CoA. MOQ from 25 kg.</p></div>
    <button class="btn btn-teal lg" data-quote>Request a Quote ${icon('arrow')}</button>
  </div>
</section>
</main>
` + footer(base, false) + modal(products) + scripts(base);
}

// ───────────────────────────── PDP ─────────────────────────────
function titleHTML(t) {
  const sup = t.sup ? `<sup>${esc(t.sup)}</sup>` : '';
  if (!t.a) return `<h1 class="pdp-title"><em class="one">${esc(t.b)}</em>${sup}</h1>`;
  return `<h1 class="pdp-title">${esc(t.a)}<em>${esc(t.b)}${sup}</em></h1>`;
}

const TOX = ['Low', 'Mild', 'Moderate', 'High', 'Severe'];
function flamm(fp) {
  if (fp < 60) return ['Flammable liquid', 'Vapours can ignite. Keep away from heat, sparks and open flames; earth containers during transfer.'];
  if (fp < 93) return ['Combustible', 'Combustible when heated. Keep away from heat and ignition sources.'];
  return ['High flash point', 'Low fire risk under normal handling. Keep away from strong heat and open flames.'];
}

export function renderPDP(p, products) {
  const base = '../';
  const isMix = !!p.principal;
  const plain = p.name.replace(/\s*\(Natural Indian\)/, '');
  const short = p.title.b && p.title.a ? `${p.title.a} ${p.title.b}` : p.title.b;
  const plateName = p.slug === 'alpha-pinene' ? '<i>Alpha</i>-Pinene' : p.title.a ? `<i>${esc(p.title.a)}</i> ${esc(p.title.b)}` : `<i>${esc(p.title.b)}</i>`;
  const flash = flamm(p.tox.fp);
  const related = products.filter(x => x.cat === p.cat && x.slug !== p.slug);
  const idx = products.findIndex(x => x.slug === p.slug);
  const rel = [...related.filter(x => products.indexOf(x) > idx), ...related.filter(x => products.indexOf(x) < idx)].slice(0, 3);
  const usesHead = p.slug === 'alpha-pinene' ? ['pharma', 'perfumery'] : [p.uses[0][0].toLowerCase(), p.uses[p.uses.length - 1][0].toLowerCase()];
  const quoteAttrs = `data-quote data-product="${esc(p.name)}"`;
  const waMsg = `Hello Alphapine team, I'd like a quote for ${p.name} (CAS ${p.cas}).`;
  const usesCards = p.uses.map((u, i) => `<div class="ucard" data-reveal style="--i:${i % 3}"><span class="mono">0${i + 1} / ${esc(u[0])}</span><div class="ibox">${icon(u[4])}</div><h3>${esc(u[1])}</h3><p>${esc(u[2])}</p><div class="chips">${u[3].map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div></div>`);
  if (usesCards.length % 3) usesCards.push(`<div class="ucard cta" data-reveal style="--i:${usesCards.length % 3}"><div><span class="mono" style="color:var(--gold)">0${usesCards.length + 1} / Your process</span><h3 style="margin-top:18px">Have a different application?</h3><p>Tell us the process and specification — our technical team will advise on grade and supply.</p></div><button class="btn btn-rust sm" ${quoteAttrs} data-type="General enquiry" style="align-self:flex-start">Talk to us ${icon('arrow')}</button></div>`);
  const jsonld = { '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.slug, description: p.overview, category: CAT[p.cat], brand: { '@type': 'Brand', name: 'Alphapine & Aromatics' }, additionalProperty: [{ '@type': 'PropertyValue', name: 'CAS', value: p.cas }] };

  const gc = p.gcms;
  const barsHTML = gc.bars ? `<div class="bars">${gc.bars.map(([n, note, range, pct]) => `<div><div class="bar-top"><b>${esc(n)}${note ? `<i>(${esc(note)})</i>` : ''}</b><span>${esc(range)}</span></div><div class="track"><i style="--w:${pct}%"></i></div></div>`).join('')}</div>` : '';
  const checksHTML = gc.checks ? `<div class="checks">${gc.checks.map(([n, m]) => `<div class="check">${icon('check')}<b>${esc(n)}</b><span>${esc(m)}</span></div>`).join('')}</div>` : '';

  const toxCard = (ic, title, d, label = 'First response') => `<div class="tcard" data-reveal><div class="tcard-h"><span class="ib">${icon(ic)}</span><div><b>${title}</b><small>${up(d[0])}</small></div></div><p>${esc(d[1])}</p><div class="resp"><small>${label}</small><p>${esc(d[2])}</p></div></div>`;

  return head({ title: `${p.name} — CAS ${p.cas} | Alphapine & Aromatics`, desc: `${p.name} (CAS ${p.cas}) — ${p.card}`, base, canonical: `/products/${p.slug}`, jsonld }) + header(base, products, false) + `
<main id="main">
<section class="pdp-hero">
  <div class="wrap ph-grid">
    <div class="plate" data-reveal="scale">
      <span class="tl">${CAT[p.cat]} · ${p.letter}</span>
      <div class="tr"><small>${isMix ? 'Principal · ' + esc(p.principal) : 'No. ' + p.letter + ' · Formula'}</small><b>${formulaHTML(p.formula)}</b></div>
      ${molecule(p.mol)}
      <div class="bl"><b>${plateName}</b><small>${esc(p.pill)}</small></div>
      <div class="br"><small>CAS</small><b>${esc(p.cas)}</b></div>
    </div>
    <div class="ph-info">
      <div class="pills" data-reveal><span class="tag ${p.cat}">${CAT[p.cat]}</span><span class="tag qa" style="background:#f6dcb3">${up(p.pill)}</span><span class="tag soft">${up(p.cls)}</span></div>
      <div data-reveal style="--i:1">${titleHTML(p.title)}</div>
      <div class="idline" data-reveal style="--i:2"><span>CAS: <b>${esc(p.cas)}</b></span>${p.mw ? `<span>MW: <b>${p.mw}</b></span>` : `<span>Principal: <b>${esc(p.principal)}</b></span>`}${p.ec ? `<span>EC: <b>${p.ec}</b></span>` : ''}<span>Cat. ${p.letter}</span></div>
      <p class="natural" data-reveal style="--i:2">All the products come from a natural source</p>
      <div data-reveal style="--i:3"><p class="pdp-lead">${esc(p.lead)}</p><ul class="bul">${p.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>
      ${p.grades.length > 1 ? `<div class="grades" data-reveal style="--i:3"><span class="k">Available grades · tap to quote</span><div class="row">${p.grades.map(g => `<button ${quoteAttrs} data-grade="${esc(g)}">${esc(g)}</button>`).join('')}</div></div>` : ''}
      <div class="specs" data-reveal style="--i:4">${p.specs.map(([l, v, u, n]) => `<div class="spec"><small>${up(l)}</small><b>${esc(v)}${u ? `<span>${esc(u)}</span>` : ''}</b><i>${esc(n)}</i></div>`).join('')}</div>
      <div class="bulk" data-reveal style="--i:5"><p class="eyebrow">Direct procurement</p><h3>Need this in <em>bulk?</em></h3><p>MOQ from 25 kg. Sample dispatch within 48 hours. Certificate of Analysis with every batch.</p><div class="row"><a class="btn btn-rust sm" href="#tds-msds" data-docs-req="Both">Request TDS &amp; MSDS ${icon('arrow')}</a></div></div>
    </div>
  </div>
</section>

<section class="sec gallery">
  <div class="wrap-n">
    <div class="sec-head c" data-reveal><p class="eyebrow c">Visual journey</p><h2 class="h2">From <em>${esc(p.source.word)}</em> to ${esc(p.source.end)} —<br>seen up close.</h2></div>
    <div class="bento">
      <div class="tile t1" data-reveal style="--i:0">${flaskArt(p.look.liquid, p.look.form)}<div class="cap"><small>01 · Pure form</small><b>${esc(p.look.caption)}</b></div></div>
      <div class="tile t2" data-reveal style="--i:1">${sourceArt(p.source.kind)}<div class="cap"><small>02 · Source</small><b>${esc(p.source.caption)}</b></div></div>
      <div class="tile t3" data-reveal style="--i:2">${chromArt(gc.bars)}<div class="cap"><small>03 · GC-MS</small><b>${esc(gc.caption)}</b></div></div>
      <div class="tile t4" data-reveal style="--i:1">${processArt(p.process.kind)}<div class="cap"><small>04 · Process</small><b>${esc(p.process.caption)}</b></div></div>
      <div class="tile t5" data-reveal style="--i:0">${appArt(p.uses[0][4], 'dark')}<div class="cap"><small>05 · Application</small><b>${esc(p.uses[0][1])}</b></div></div>
      <div class="tile t6" data-reveal style="--i:1">${appArt(p.uses[1][4], 'light')}<div class="cap"><small>06 · Application</small><b>${esc(p.uses[1][1])}</b></div></div>
      <div class="tile t7" data-reveal style="--i:2">${drumsArt()}<div class="cap"><small>07 · Bulk</small><b>Industrial supply.</b></div></div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap-n">
    <div class="sec-head" data-reveal><div><p class="eyebrow">What it looks &amp; smells like</p><h2 class="h2">An <em>appearance</em>,<br>quietly remarkable.</h2></div><p class="lede">${esc(p.look.intro)}</p></div>
    <div class="look-card" data-reveal="scale">
      <div class="look-vis">${bottleArt(p.look.liquid, esc(short.length > 14 ? (p.title.b || p.title.a) : short), p.look.form)}<svg class="waves" viewBox="0 0 60 70" aria-hidden="true"><path d="M14 66 q-8 -14 0 -28 q8 -14 0 -28"/><path d="M30 66 q-8 -14 0 -28 q8 -14 0 -28"/><path d="M46 66 q-8 -14 0 -28 q8 -14 0 -28"/></svg></div>
      <div class="look-txt"><p class="eyebrow">Visual snapshot</p><h3 class="h3">${esc(p.look.heading[0])} <em>${esc(p.look.heading[1])}</em><br>${esc(p.look.heading[2])}</h3><p>${esc(p.appearance)}</p><div class="attrs">${p.look.attrs.map(([k, v]) => `<div class="attr"><small>${esc(k)}</small><b>${esc(v).replace('H₂O', 'H<sub>2</sub>O')}</b></div>`).join('')}</div></div>
    </div>
  </div>
</section>

<section class="sec gcms">
  <div class="wrap-n g-grid">
    <div data-reveal><p class="eyebrow">Compositional profile</p><h2 class="h2">Verified by <em>GC-MS</em>,<br>down to the trace.</h2><p class="lede" style="margin-top:20px">${esc(gc.intro)}</p><p class="lede">${gc.typical ? 'Figures shown are typical ranges. ' : ''}Compositional ranges can vary slightly batch to batch within tolerance — the full chromatographic profile is supplied with every Certificate of Analysis.</p></div>
    <div data-reveal style="--i:1">${barsHTML}${checksHTML}<div class="labnote"><span class="dot">${icon('flask')}</span><span><b>Lab verification.</b> ${p.cat === 'mfg' ? 'Profiled on our in-house GC-MS, with physical constants — specific gravity, refractive index, optical rotation and flash point — verified on the same batch.' : esc(NOTES.qa)}</span></div></div>
  </div>
</section>

<section class="sec">
  <div class="wrap-n">
    <div class="sec-head" data-reveal><div><p class="eyebrow">Where it's used</p><h2 class="h2">From <em>${esc(usesHead[0])}</em><br>to ${esc(usesHead[1])}.</h2></div><p class="lede">${esc(p.applications)}</p></div>
    <div class="grid3">${usesCards.join('')}</div>
  </div>
</section>

<section class="sec roles">
  <div class="wrap-n">
    <div class="sec-head c" data-reveal><p class="eyebrow c">Purpose &amp; functions</p><h2 class="h2">Why <em>this ${isMix ? 'oil' : 'molecule'}</em><br>matters in the lab.</h2><p class="lede">${p.roles.length} functional roles where ${esc(plain)} earns its place — what specialists actually do with it, once it arrives.</p></div>
    <div class="rlist" data-acc="multi">${p.roles.map(([t, d], i) => `<div class="ritem" data-reveal style="--i:${i % 3}"><button class="rq" aria-expanded="false"><span class="n">0${i + 1}</span><span><b>${esc(t)}</b><span>${esc(d)}</span></span><span class="tg">${icon('chev')}</span></button><div class="rmore"><div><div class="inner">${(p.uses[i] ? p.uses[i][3] : p.tags).map(x => `<span class="chip">${esc(x)}</span>`).join('')}<button class="ask" ${quoteAttrs} data-msg="${esc(`Application: ${t}.`)}">Ask about this application ${icon('arrow')}</button></div></div></div></div>`).join('')}</div>
  </div>
</section>

<section class="sec tox">
  <div class="wrap">
    <div class="sec-head c" data-reveal><p class="eyebrow c">Safety &amp; handling</p><h2 class="h2">Toxicity, <em>plainly</em><br>communicated.</h2></div>
    <div class="meter" data-reveal><div class="meter-top"><small>Overall toxicity class</small><b>${TOX[p.tox.level]}</b></div><div class="mtrack"><span class="knob" style="--p:${[6, 27, 50, 73, 94][p.tox.level]}%"></span></div><div class="mlabels">${TOX.map((t, i) => `<span${i === p.tox.level ? ' class="on"' : ''}>${t}</span>`).join('')}</div><p class="fine">Indicative handling class, drawn from our catalogue safety notes. The product Safety Data Sheet (SDS) governs GHS classification.</p></div>
    <div class="grid3">
      ${toxCard('hand', 'Skin Contact', p.tox.skin)}
      ${toxCard('eye', 'Eye Contact', p.tox.eye)}
      ${toxCard('lungs', 'Inhalation', p.tox.inh)}
      ${toxCard('flame', 'Flammability', [`Flash point ${p.tox.flash} · ${flash[0]}`, flash[1], p.tox.store], 'Storage')}
      ${toxCard('mouth', 'Ingestion', ['Not for direct ingestion', 'Neat or industrial material is not intended for ingestion. Food- and pharma-grade use is governed by the grade specification and applicable regulations.', 'Rinse mouth with water and seek medical advice. Refer to the SDS.'])}
      ${toxCard('leaf', 'Environmental', ['Prevent release', 'Avoid release to drains, surface water or soil.', 'Contain spills with an inert absorbent and dispose of in accordance with local regulations.'], 'Spill response')}
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap-n d-grid">
    <div data-reveal><p class="eyebrow">Technical specifications</p><h2 class="h2">The full <em>data sheet</em>.</h2><p class="lede" style="margin:20px 0 26px">Every parameter is measured in our in-house laboratory. A batch-specific Certificate of Analysis is available on request before order confirmation.</p>
      <button class="btn btn-dark" ${quoteAttrs} data-type="Technical datasheet / CoA">Download Full Datasheet ${icon('download')}</button>
      <div class="entry acc" data-acc="multi"><div class="acc-item"><button class="acc-q" aria-expanded="false">Catalogue entry — full product note<span class="tg">${icon('plus')}</span></button><div class="acc-a"><div>
        <h5>${p.cat === 'mfg' ? 'Manufactured note' : 'Quality assured note'}</h5><p>${esc(NOTES[p.cat])}</p>
        <h5>Overview</h5><p>${esc(p.overview)}</p><h5>Characteristics</h5><p>${esc(p.characteristics)}</p><h5>Appearance</h5><p>${esc(p.appearance)}</p><h5>Applications &amp; uses</h5><p>${esc(p.applications)}</p>
        <h5>Safety &amp; handling</h5><p>Skin contact: ${esc(p.tox.skin[1])} ${esc(p.tox.skin[2])}<br>Eye contact: ${esc(p.tox.eye[1])} ${esc(p.tox.eye[2])}<br>Inhalation: ${esc(p.tox.inh[1])} ${esc(p.tox.inh[2])}</p>
        <p style="font-size:12px">Source: Product Catalogue 2025, page ${p.page}.</p>
      </div></div></div></div>
    </div>
    <div class="sheet" data-reveal style="--i:1"><table><tbody>${p.sheet.map(([a, b, c]) => `<tr><td>${up(a)}</td><td${/CoA/.test(b) ? ' class="coa"' : ''}>${esc(b)}</td><td>${esc(c)}</td></tr>`).join('')}</tbody></table></div>
  </div>
</section>

<section class="sec ready">
  <div class="wrap-n r-grid">
    <div data-reveal><p class="eyebrow">Order ${esc(plain)}</p><h2 class="h2">Ready to source<br><em>at scale?</em></h2><p class="lede">MOQ from 25 kg. Sample dispatch within 48 hours. Bulk pricing for 500 kg+ orders. Our specialists respond with a quote, datasheets or a custom-grade discussion.</p>
      <div class="row"><button class="btn btn-rust" ${quoteAttrs}>Request a Quote ${icon('arrow')}</button><a class="btn btn-wa" href="#" data-wa="${esc(waMsg)}">${icon('wa')} Chat on WhatsApp</a><button class="btn btn-line" ${quoteAttrs} data-type="Sample request">${icon('sample')} Request Sample</button></div></div>
    <div data-reveal style="--i:1">
      ${[['shield', 'GC-MS Verified Batches', 'Every batch profiled in-house before dispatch.'], ['trend', 'Bulk Pricing Available', 'Tiered pricing for 500 kg+ and recurring orders.'], ['globe', 'Domestic & Export Supply', 'Logistics and documentation confirmed with your quote.'], ['clock', '48-Hour Sample Dispatch', 'Evaluate the grade on your own bench first.']].map(([i, t, s]) => `<div class="feat"><span class="ib">${icon(i)}</span><span><b>${t}</b><small>${s}</small></span></div>`).join('')}
    </div>
  </div>
</section>

<section class="sec contact docs" id="tds-msds" aria-labelledby="docs-title">
  <div class="wrap-n c-grid">
    <div data-reveal><p class="eyebrow nodash">Technical documents</p><h2 class="h2" id="docs-title">Request <em>TDS</em> &amp; <em>MSDS</em></h2><p class="lede">The Technical Data Sheet and Material Safety Data Sheet for ${esc(plain)} — shared by our team on your work email.</p>
      <div class="res doc-i"><span class="ib">${icon('file')}</span><span><b>TDS · Technical Data Sheet</b><small>Specifications, physical constants and grade details for ${esc(plain)}.</small></span></div>
      <div class="res doc-i"><span class="ib">${icon('shield')}</span><span><b>MSDS · Material Safety Data Sheet</b><small>Hazards, safe handling, storage and transport information.</small></span></div>
    </div>
    <div class="form-card" data-reveal style="--i:1">
      <h3>Request technical documents</h3><p class="sub">Share your details and we will email the requested documents for this product.</p>
      <form data-docs novalidate>
        <div class="fgrid">
          <div class="field"><label for="d-name">Full Name *</label><input id="d-name" name="name" required autocomplete="name" placeholder="Your full name"><span class="err">Please enter your name.</span></div>
          <div class="field"><label for="d-company">Company Name *</label><input id="d-company" name="company" required autocomplete="organization" placeholder="Your organization"><span class="err">Please enter your company name.</span></div>
          <div class="field"><label for="d-email">Work Email *</label><input id="d-email" name="email" type="email" required autocomplete="email" placeholder="you@company.com"><span class="err">Please enter a valid work email.</span></div>
          <div class="field"><label for="d-phone">Mobile / WhatsApp</label><input id="d-phone" name="phone" type="tel" autocomplete="tel" placeholder="+91 …"></div>
          <div class="field"><label for="d-country">Country</label><input id="d-country" name="country" autocomplete="country-name" placeholder="e.g. India"></div>
          <div class="field"><label for="d-product">Product Name</label><input id="d-product" name="product" value="${esc(p.name)}" readonly></div>
          <div class="field full"><label for="d-doc">Document Requested</label><select id="d-doc" name="doc"><option value="TDS">TDS</option><option value="MSDS">MSDS</option><option value="Both" selected>Both (TDS &amp; MSDS)</option></select></div>
        </div>
        <button class="submit" type="submit">Submit Request</button>
      </form>
      <div class="done" aria-live="polite"><div class="tick">${icon('check')}</div><h4></h4><p data-done-text></p><div class="row" data-docs-fallback hidden><a class="btn btn-out" data-done-mail href="#">${icon('mail')} Send via Email</a><a class="btn btn-wa" data-done-wa href="#" target="_blank" rel="noopener">${icon('wa')} Send via WhatsApp</a></div></div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap-n">
    <div class="rel-head" data-reveal><div><p class="eyebrow">From the same catalogue</p><h2 class="h2">Related <em>products</em>.</h2></div><a class="btn btn-out" href="../index.html#catalogue">View All 16 Products ${icon('arrow')}</a></div>
    <div class="grid3">${rel.map((x, i) => productCard(x, base, i, true)).join('')}</div>
  </div>
</section>
</main>
` + footer(base, false) + modal(products) + scripts(base);
}
