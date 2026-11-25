// Illustration library — every graphic on the site is drawn here as SVG.
// Inline art (molecules, gallery tiles, bottles, icons) is returned as strings;
// scene plates (hero forest, facility images) are written to /assets/img by the build.
import { readFileSync } from 'node:fs';
const MOL = JSON.parse(readFileSync(new URL('../data/molecules.json', import.meta.url)));

// deterministic RNG so builds are reproducible
export function rng(seed = 7) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const f = (n) => Math.round(n * 10) / 10;

// ───────────────────────── icons (24×24, stroke) ─────────────────────────
const I = {
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  pill: '<rect x="3.5" y="8.5" width="17" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="M9.2 7.9l5.6 8"/>',
  leafdrop: '<path d="M12 3.5c3.2 3.9 5.5 7 5.5 10a5.5 5.5 0 0 1-11 0c0-3 2.3-6.1 5.5-10z"/><path d="M9.5 14.5a2.6 2.6 0 0 0 2.5 2.5"/>',
  spray: '<rect x="7" y="9" width="8" height="12" rx="1.6"/><path d="M9 9V6.5h4V9M13 6.5h3.5l1.5-1.5"/><path d="M19.5 8h1.5M19 10.5l1.2.8M19 5.5l1.2-.8"/>',
  drop: '<path d="M12 3.5c3.2 3.9 5.5 7 5.5 10a5.5 5.5 0 0 1-11 0c0-3 2.3-6.1 5.5-10z"/>',
  layers: '<path d="M12 4l8.5 4.3L12 12.6 3.5 8.3z"/><path d="M3.5 12.2L12 16.5l8.5-4.3"/><path d="M3.5 16L12 20.3l8.5-4.3"/>',
  brush: '<path d="M14.5 4.5l5 5-7.8 7.8-5-5z"/><path d="M6.7 12.3c-2.2.4-3.2 2.4-3.2 5.2 2.8 0 4.8-1 5.2-3.2"/>',
  shirt: '<path d="M8.5 4L4 6.5 5.5 10.5 7.5 9.5V20h9V9.5l2 1L20 6.5 15.5 4c-.5 1.6-1.9 2.5-3.5 2.5S9 5.6 8.5 4z"/>',
  pick: '<path d="M4 9c4-4.5 11-4.5 16 0"/><path d="M12 6.8L6 20"/>',
  bug: '<rect x="8" y="8" width="8" height="12" rx="4"/><path d="M12 8V20M9.5 8a2.5 2.5 0 0 1 5 0M8 12.5H4.5M16 12.5h3.5M8 16.5l-3 1.5M16 16.5l3 1.5M8.5 9.5L6 7M15.5 9.5L18 7"/>',
  smile: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14a4 4 0 0 0 7 0"/><path d="M9.2 9.6h.01M14.8 9.6h.01"/>',
  candy: '<circle cx="12" cy="12" r="4.2"/><path d="M8.2 9.8L4 7.5v9l4.2-2.3M15.8 9.8L20 7.5v9l-4.2-2.3"/>',
  heart: '<path d="M12 19.5s-7.5-4.6-7.5-9.7A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.2c0 5.1-7.5 9.7-7.5 9.7z"/>',
  flask: '<path d="M9.5 3.5h5M10.5 3.5v5.2L5.2 18.2a1.6 1.6 0 0 0 1.4 2.3h10.8a1.6 1.6 0 0 0 1.4-2.3L13.5 8.7V3.5"/><path d="M7.5 14.5h9"/>',
  beaker: '<path d="M5.5 4h13M7 4v14.5A1.5 1.5 0 0 0 8.5 20h7a1.5 1.5 0 0 0 1.5-1.5V4"/><path d="M7 12h10"/>',
  factory: '<path d="M3.5 20V10l5 3V10l5 3V6.5h4.5V20z"/><path d="M3 20h18M15.5 6.5V3.5"/>',
  wind: '<path d="M3.5 9h11a2.8 2.8 0 1 0-2.8-2.8M3.5 14.5h14.5a2.8 2.8 0 1 1-2.8 2.8M3.5 12h7"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3.5v2.6M12 17.9v2.6M3.5 12h2.6M17.9 12h2.6M6 6l1.8 1.8M16.2 16.2L18 18M6 18l1.8-1.8M16.2 7.8L18 6"/>',
  atom: '<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="8.5" ry="3.4"/><ellipse cx="12" cy="12" rx="8.5" ry="3.4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="8.5" ry="3.4" transform="rotate(120 12 12)"/>',
  pen: '<path d="M4 20l1.2-4.6L15.8 4.8a1.9 1.9 0 0 1 2.7 0l.7.7a1.9 1.9 0 0 1 0 2.7L8.6 18.8z"/><path d="M14 6.6l3.4 3.4"/>',
  sun: '<path d="M12 3.5c-2.2 3-2.2 5.5 0 8 2.2-2.5 2.2-5 0-8z"/><path d="M5 15.5h14l-2 4.5H7z"/><path d="M12 11.5v4"/>',
  shield: '<path d="M12 3.5l7 2.8v5.3c0 4.4-3 7.6-7 8.9-4-1.3-7-4.5-7-8.9V6.3z"/><path d="M9 12l2.1 2.1L15.2 10"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  check: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.4 4.8-5"/>',
  book: '<path d="M4 5.5a2 2 0 0 1 2-2h5v16H6a2 2 0 0 0-2 2zM20 5.5a2 2 0 0 0-2-2h-5v16h5a2 2 0 0 1 2 2z"/>',
  file: '<path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3.5V8h4.5M9 12.5h6M9 16h6"/>',
  download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
  arrow: '<path d="M5 12h14M13.5 6.5L19 12l-5.5 5.5"/>',
  arrowUR: '<path d="M7 17L17 7M9 7h8v8"/>',
  chev: '<path d="M6.5 9.5L12 15l5.5-5.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  left: '<path d="M14.5 6L8.5 12l6 6"/>',
  right: '<path d="M9.5 6l6 6-6 6"/>',
  wa: '<path d="M4 20l1.2-4.1A8.3 8.3 0 1 1 8.4 19z"/><path d="M9 8.6c.3 2.9 2.8 5.6 6 6.3l1.3-1.4-2-1-1 .8a4.6 4.6 0 0 1-2.3-2.3l.8-1-1-2z"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>',
  phone: '<path d="M6.5 3.5h3l1.5 4-2 1.3a10.5 10.5 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>',
  sample: '<path d="M9 3.5h6M10 3.5v6.5l-4.2 7.4A2 2 0 0 0 7.5 20.5h9a2 2 0 0 0 1.7-3.1L14 10V3.5"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.3 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.3-3.5-8.5s1.1-6.1 3.5-8.5z"/>',
  trend: '<path d="M3.5 17l6-6 4 4 7-7.5"/><path d="M15 7.5h5.5V13"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  hand: '<path d="M8 11V5.5a1.5 1.5 0 0 1 3 0V10M11 9.5V4.5a1.5 1.5 0 0 1 3 0V10M14 9.5V6a1.5 1.5 0 0 1 3 0v7.5a7 7 0 0 1-7 7 6 6 0 0 1-5.3-3.2L3 14.2a1.5 1.5 0 0 1 2.5-1.6L8 15"/>',
  lungs: '<path d="M12 4v8M12 10l-2.5 2M12 10l2.5 2"/><path d="M9.5 8.5C6.5 8.5 4 12 4 16.5c0 2 1 3 2.5 3 2 0 3-1.5 3-4V8.5zM14.5 8.5c3 0 5.5 3.5 5.5 8 0 2-1 3-2.5 3-2 0-3-1.5-3-4V8.5z"/>',
  flame: '<path d="M12 3.5c.5 3-3 5-3 8.5a3 3 0 0 0 6 0c0-1.2-.6-2-1.2-2.8 2.5 1 4.7 3.7 4.7 7a6.5 6.5 0 0 1-13 0c0-5.2 5-7.2 6.5-12.7z"/>',
  mouth: '<path d="M4 11c2.5-3 5.5-3 8-1.2C14.5 8 17.5 8 20 11c-2 4.5-5 6.5-8 6.5S6 15.5 4 11z"/><path d="M4 11h16"/>',
  leaf: '<path d="M5 19C5 10 10 5 19.5 4.5 19 14 14 19 5 19z"/><path d="M5 19l9-9"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  soap: '<rect x="3.5" y="11" width="13.5" height="8.5" rx="2.6"/><path d="M7.5 15.2h5.5"/><circle cx="17.6" cy="6.4" r="2.6"/><circle cx="11.6" cy="6" r="1.5"/>',
  cup: '<path d="M6 4.5h12l-1.5 14.6a1.6 1.6 0 0 1-1.6 1.4H9.1a1.6 1.6 0 0 1-1.6-1.4z"/><path d="M6.7 10.5h10.6"/><path d="M14.5 4.5l1.8-2"/>',
  incense: '<path d="M4.5 20.5h15"/><path d="M8 20.5l1.2-3h5.6l1.2 3"/><path d="M12 17.5V10"/><path d="M12 8c-1.6-1.2-1.6-2.4 0-3.6s1.6-2.4 0-3.4"/>',
  home: '<path d="M3.8 11.5L12 4.5l8.2 7"/><path d="M6 9.8v9.7h12V9.8"/><path d="M10 19.5v-5h4v5"/>',
  bucket: '<path d="M5 9h14l-1.6 10.6a1.6 1.6 0 0 1-1.6 1.4H8.2a1.6 1.6 0 0 1-1.6-1.4z"/><path d="M6.5 9a5.5 5.5 0 0 1 11 0"/><path d="M9 13.5h6"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>',
  in: '<path d="M6.5 9.5v8M6.5 6.5v.01M10.5 17.5v-8M10.5 13a3 3 0 0 1 6 0v4.5"/>',
  ig: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><path d="M16.8 7.2v.01"/>',
  yt: '<rect x="3" y="6" width="18" height="12" rx="3.5"/><path d="M10.5 9.5l4.2 2.5-4.2 2.5z"/>',
};
// icon names, offered as choices in the CMS admin
export const ICON_NAMES = Object.keys(I);

export function icon(name, cls = '', sw = 1.6) {
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[name] || I.flask}</svg>`;
}

// ───────────────────────── chemistry helpers ─────────────────────────
export function formulaHTML(fm) { return fm ? fm.replace(/(\d+)/g, '<sub>$1</sub>') : ''; }

// Molecule glyph — design-language rendering of a real 2D structure (RDKit layout)
export function molecule(key, { size = 520, maxBond = 74, fit = 300 } = {}) {
  const m = MOL[key]; if (!m) return '';
  const xs = m.atoms.map(a => a[0]), ys = m.atoms.map(a => a[1]);
  const w = Math.max(...xs) - Math.min(...xs) || 1, h = Math.max(...ys) - Math.min(...ys) || 1;
  const s = Math.min(fit / w, fit / h, maxBond);
  const c = size / 2;
  const P = m.atoms.map(([x, y]) => [c + x * s, c + y * s]);
  const r = rng(key.length * 97 + 13);
  let out = `<svg class="mol" viewBox="0 0 ${size} ${size}" aria-hidden="true">`;
  out += `<defs><radialGradient id="mg-${key}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffffff" stop-opacity=".10"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>`;
  out += `<circle cx="${c}" cy="${c}" r="${size * 0.42}" fill="url(#mg-${key})"/>`;
  out += `<circle class="orbit" cx="${c}" cy="${c}" r="${size * 0.36}" fill="none" stroke="#ffffff" stroke-opacity=".07" stroke-dasharray="2 7"/>`;
  out += `<circle class="orbit o2" cx="${c}" cy="${c}" r="${size * 0.46}" fill="none" stroke="#ffffff" stroke-opacity=".05"/>`;
  for (let i = 0; i < 16; i++) { const a = r() * Math.PI * 2, d = size * (0.22 + r() * 0.3); out += `<circle class="spk" style="--d:${f(r() * 6)}s" cx="${f(c + Math.cos(a) * d)}" cy="${f(c + Math.sin(a) * d)}" r="${f(0.8 + r() * 1.6)}" fill="#ffffff" opacity="${f(0.15 + r() * 0.35)}"/>`; }
  out += '<g class="mol-g">';
  for (const [a, b, o] of m.bonds) {
    const [x1, y1] = P[a], [x2, y2] = P[b];
    if (o === 2) {
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L * 4.2, ny = dx / L * 4.2;
      out += `<line x1="${f(x1 + nx)}" y1="${f(y1 + ny)}" x2="${f(x2 + nx)}" y2="${f(y2 + ny)}" class="bd"/><line x1="${f(x1 - nx)}" y1="${f(y1 - ny)}" x2="${f(x2 - nx)}" y2="${f(y2 - ny)}" class="bd"/>`;
    } else out += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="bd"/>`;
  }
  m.atoms.forEach(([, , t], i) => {
    const [x, y] = P[i];
    if (t === 'o') out += `<circle cx="${f(x)}" cy="${f(y)}" r="20" fill="#e07a2c" opacity=".18" class="halo"/><circle cx="${f(x)}" cy="${f(y)}" r="11.5" fill="#e07a2c"/><text x="${f(x)}" y="${f(y + 3.6)}" class="atl">O</text>`;
    else if (t === 'x') out += `<circle cx="${f(x)}" cy="${f(y)}" r="22" fill="#e07a2c" opacity=".16" class="halo"/><circle cx="${f(x)}" cy="${f(y)}" r="12.5" fill="#e07a2c"/>`;
    else if (t === 'm') out += `<circle cx="${f(x)}" cy="${f(y)}" r="7.5" fill="#f3c98d"/>`;
    else out += `<circle cx="${f(x)}" cy="${f(y)}" r="10" fill="#f6f1e6"/>`;
  });
  return out + '</g></svg>';
}

// ───────────────────────── gallery tiles (PDP "seen up close") ─────────────────────────
export function flaskArt(liquid, form = 'liquid') {
  if (form === 'crystal') {
    const r = rng(5); let cr = '';
    for (let i = 0; i < 26; i++) { const x = 140 + r() * 120, y = 186 - r() * 36 * (1 - Math.abs(x - 200) / 70), s = 6 + r() * 9; cr += `<path d="M${f(x)} ${f(y - s)} L${f(x + s * .55)} ${f(y)} L${f(x)} ${f(y + s * .4)} L${f(x - s * .55)} ${f(y)}Z" fill="#fbf8f1" opacity="${f(.7 + r() * .3)}" stroke="#d9e4dc" stroke-width=".6"/>`; }
    return `<svg viewBox="0 0 400 300" class="art" aria-hidden="true"><defs><radialGradient id="glw" cx="50%" cy="55%" r="45%"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="170" r="140" fill="url(#glw)"/><ellipse cx="200" cy="214" rx="104" ry="18" fill="#000" opacity=".12"/><path d="M96 190 Q200 240 304 190" fill="#ffffff" fill-opacity=".14" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>${cr}<path d="M96 190 Q200 210 304 190" fill="none" stroke="#fff" stroke-opacity=".35"/></svg>`;
  }
  return `<svg viewBox="0 0 400 300" class="art" aria-hidden="true"><defs>
  <radialGradient id="glw" cx="50%" cy="60%" r="45%"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <linearGradient id="liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${liquid}"/><stop offset="1" stop-color="#d98a3a"/></linearGradient>
  <clipPath id="bulb"><ellipse cx="200" cy="190" rx="58" ry="76"/></clipPath></defs>
  <circle cx="200" cy="180" r="130" fill="url(#glw)"/>
  <ellipse cx="200" cy="272" rx="64" ry="8" fill="#000" opacity=".14"/>
  <g clip-path="url(#bulb)"><rect class="liq-fill" x="130" y="176" width="140" height="100" fill="url(#liq)"/><path d="M130 176 Q165 168 200 176 T270 176" fill="${liquid}" opacity=".7"/></g>
  <circle cx="186" cy="214" r="3" fill="#fff" opacity=".55" class="bub"/><circle cx="214" cy="236" r="2" fill="#fff" opacity=".45" class="bub b2"/><circle cx="198" cy="250" r="2.4" fill="#fff" opacity=".5" class="bub b3"/>
  <path d="M190 34 V112 A58 76 0 1 0 210 112 V34" fill="none" stroke="#f6f1e6" stroke-opacity=".75" stroke-width="2.2"/>
  <rect x="186" y="26" width="28" height="10" rx="2" fill="#f6f1e6" opacity=".9"/>
  <path d="M160 150 Q150 190 168 226" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="5" stroke-linecap="round"/></svg>`;
}

export function sourceArt(kind) {
  const r = rng(kind.length * 31 + 3);
  const fog = '<defs><linearGradient id="fogS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#0f3a2e" stop-opacity=".55"/></linearGradient></defs>';
  let g = '';
  if (kind === 'pine') {
    const tree = (x, b, h, w, c, o) => { let p = ''; for (let k = 0; k < 4; k++) { const y = b - h + k * h * .22, ww = w * (.42 + k * .2); p += `<path d="M${f(x)} ${f(y)} L${f(x + ww)} ${f(y + h * .34)} L${f(x - ww)} ${f(y + h * .34)}Z"/>`; } return `<g fill="${c}" opacity="${o}">${p}<rect x="${f(x - 2)}" y="${f(b - 6)}" width="4" height="10"/></g>`; };
    for (let i = 0; i < 8; i++) g += tree(20 + i * 40 + r() * 10, 150, 70 + r() * 25, 22, '#3f7a5a', .45);
    for (let i = 0; i < 6; i++) g += tree(30 + i * 52 + r() * 12, 175, 95 + r() * 30, 30, '#1d5a3d', .9);
  } else if (kind === 'grass') {
    for (let i = 0; i < 70; i++) { const x = r() * 300, h = 60 + r() * 110, bend = (r() - .5) * 60; g += `<path d="M${f(x)} 200 Q${f(x + bend * .3)} ${f(200 - h * .6)} ${f(x + bend)} ${f(200 - h)}" stroke="${r() > .5 ? '#2f7350' : '#4f9467'}" stroke-width="${f(1.5 + r() * 2.5)}" fill="none" stroke-linecap="round" opacity=".9"/>`; }
  } else if (kind === 'mint') {
    for (let s = 0; s < 4; s++) { const x = 45 + s * 72; g += `<path d="M${x} 200 V${60 + s * 6}" stroke="#2c6a48" stroke-width="3"/>`; for (let k = 0; k < 4; k++) { const y = 80 + s * 6 + k * 30, L = 22 - k * 2; g += `<ellipse cx="${x - L * .9}" cy="${y}" rx="${L}" ry="${L * .55}" fill="#3e8a5f" transform="rotate(-25 ${x - L * .9} ${y})"/><ellipse cx="${x + L * .9}" cy="${y}" rx="${L}" ry="${L * .55}" fill="#4f9c6c" transform="rotate(25 ${x + L * .9} ${y})"/>`; } }
  } else if (kind === 'bud') {
    for (let i = 0; i < 9; i++) { const x = 30 + i * 30 + r() * 8, y = 70 + r() * 70, a = (r() - .5) * 40; g += `<g transform="rotate(${f(a)} ${f(x)} ${f(y)})"><path d="M${f(x)} ${f(y)} V${f(y + 70)}" stroke="#7a4a2a" stroke-width="5" stroke-linecap="round"/><circle cx="${f(x)}" cy="${f(y - 4)}" r="9" fill="#8f5a33"/><path d="M${f(x - 9)} ${f(y - 2)} l-5 -7 M${f(x + 9)} ${f(y - 2)} l5 -7 M${f(x)} ${f(y - 12)} v-7" stroke="#6d4122" stroke-width="3" stroke-linecap="round"/></g>`; }
  } else if (kind === 'leaf') {
    for (let i = 0; i < 9; i++) { const x = 20 + i * 34, y = 30 + r() * 30, L = 90 + r() * 50, a = (r() - .5) * 30; g += `<g transform="rotate(${f(a)} ${f(x)} ${f(y)})"><path d="M${f(x)} ${f(y)} q${f(18)} ${f(L * .4)} 0 ${f(L)} q-${f(14)} -${f(L * .5)} 0 -${f(L)}z" fill="${r() > .5 ? '#5e9a7d' : '#7fb197'}" opacity=".95"/><path d="M${f(x)} ${f(y)} q6 ${f(L * .5)} 0 ${f(L)}" stroke="#2c5e47" stroke-width="1" fill="none"/></g>`; }
    g += '<path d="M0 30 Q150 10 300 34" stroke="#3a5a45" stroke-width="4" fill="none"/>';
  } else { // wood
    g += '<rect x="40" y="0" width="70" height="200" fill="#5b4532"/>';
    for (let i = 0; i < 14; i++) g += `<path d="M${f(44 + r() * 62)} 0 V200" stroke="#3f2f22" stroke-width="${f(1 + r() * 2)}" opacity=".7"/>`;
    g += '<ellipse cx="205" cy="125" rx="72" ry="60" fill="#c79a66"/>';
    for (let i = 1; i < 7; i++) g += `<ellipse cx="205" cy="125" rx="${72 - i * 10}" ry="${60 - i * 8.4}" fill="none" stroke="#9c7046" stroke-width="1.6" opacity=".8"/>`;
    g += '<path d="M133 125 Q133 190 205 190 Q277 190 277 125" fill="#7a5638" opacity=".9"/>';
  }
  return `<svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMax slice" class="art" aria-hidden="true">${fog}${g}<rect width="300" height="200" fill="url(#fogS)"/></svg>`;
}

export function chromArt(bars) {
  const peaks = (bars && bars.length ? bars : [['', '', '', 70], ['', '', '', 22], ['', '', '', 12], ['', '', '', 6]]).map(b => Math.max(6, Math.sqrt(b[3]) * 10));
  const xs = [70, 130, 180, 225, 255, 280].slice(0, peaks.length);
  let d = 'M20 150';
  for (let x = 20; x <= 290; x += 2) { let y = 150; peaks.forEach((h, i) => { y -= h * Math.exp(-((x - xs[i]) ** 2) / 60); }); d += ` L${x} ${f(y)}`; }
  const top = xs[0];
  return `<svg viewBox="0 0 300 200" class="art" aria-hidden="true"><path d="M20 20 V150 H290" stroke="#21473c" stroke-opacity=".5" fill="none"/>${[40, 70, 100, 130].map(y => `<path d="M20 ${y} H290" stroke="#21473c" stroke-opacity=".08"/>`).join('')}<path d="${d} L290 150 Z" fill="#e07a2c" opacity=".12"/><path class="trace" d="${d}" fill="none" stroke="#d26f25" stroke-width="2"/><circle cx="${top}" cy="${f(150 - peaks[0])}" r="3.5" fill="#d26f25"/><text x="${top + 8}" y="${f(146 - peaks[0])}" class="tl">${bars && bars[0] ? bars[0][0] : ''}</text></svg>`;
}

export function processArt(kind) {
  if (kind === 'column') {
    let trays = ''; for (let y = 50; y < 190; y += 16) trays += `<path d="M184 ${y} H216" stroke="#f6f1e6" stroke-opacity=".35"/>`;
    return `<svg viewBox="0 0 400 260" class="art" aria-hidden="true"><defs><radialGradient id="pc" cx="50%" cy="40%" r="50%"><stop offset="0" stop-color="#f3c98d" stop-opacity=".22"/><stop offset="1" stop-color="#f3c98d" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="90" r="110" fill="url(#pc)"/><rect x="180" y="30" width="40" height="170" rx="6" fill="none" stroke="#f6f1e6" stroke-opacity=".75" stroke-width="1.6"/><rect x="186" y="18" width="28" height="14" rx="3" fill="none" stroke="#f6f1e6" stroke-opacity=".6"/>${trays}<path d="M220 60 H252 M220 120 H252 M220 176 H252" stroke="#f3c98d" stroke-opacity=".8" stroke-dasharray="3 3"/><circle cx="256" cy="60" r="2.5" fill="#f3c98d"/><circle cx="256" cy="120" r="2.5" fill="#f3c98d"/><circle cx="256" cy="176" r="2.5" fill="#f3c98d"/><text x="262" y="63" class="tlw">Light cut</text><text x="262" y="123" class="tlw">Heart cut</text><text x="262" y="179" class="tlw">Heavy end</text></svg>`;
  }
  if (kind === 'reactor') {
    return `<svg viewBox="0 0 400 260" class="art" aria-hidden="true"><path d="M150 70 H250 V160 Q250 200 200 200 Q150 200 150 160Z" fill="#f6f1e6" fill-opacity=".06" stroke="#f6f1e6" stroke-opacity=".75" stroke-width="1.6"/><path d="M150 70 Q200 46 250 70" fill="none" stroke="#f6f1e6" stroke-opacity=".75" stroke-width="1.6"/><rect x="188" y="22" width="24" height="26" rx="3" fill="none" stroke="#f3c98d" stroke-opacity=".9"/><path d="M200 48 V170 M184 170 H216" stroke="#f3c98d" stroke-opacity=".8" stroke-width="1.6"/><path d="M150 120 Q200 132 250 120 V160 Q250 200 200 200 Q150 200 150 160Z" fill="#e07a2c" opacity=".35"/></svg>`;
  }
  return `<svg viewBox="0 0 400 260" class="art" aria-hidden="true"><path d="M170 40 H210 M176 40 V110 L150 170 A10 10 0 0 0 159 184 H221 A10 10 0 0 0 230 170 L204 110 V40" fill="none" stroke="#f6f1e6" stroke-opacity=".75" stroke-width="1.6"/><path d="M160 158 H220 L229 172 A8 8 0 0 1 222 182 H158 A8 8 0 0 1 151 172Z" fill="#e07a2c" opacity=".45"/><circle cx="262" cy="96" r="34" fill="none" stroke="#f3c98d" stroke-width="2.2"/><path d="M286 120 L318 152" stroke="#f3c98d" stroke-width="5" stroke-linecap="round"/><path d="M248 96 l9 9 18 -19" stroke="#f6f1e6" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

export function appArt(iconName, tone = 'dark') {
  const col = tone === 'light' ? '#1d5a3d' : '#fbf8f1';
  if (iconName === 'sparkle' && tone !== 'light') {
    return `<svg viewBox="0 0 300 200" class="art" aria-hidden="true"><rect x="138" y="34" width="24" height="22" rx="3" fill="#2a3f35"/><rect x="146" y="56" width="8" height="10" fill="#e9dcc4"/><rect x="118" y="66" width="64" height="92" rx="12" fill="#fbf8f1" fill-opacity=".28" stroke="#fbf8f1" stroke-opacity=".7"/><rect x="130" y="100" width="40" height="30" rx="3" fill="#fbf8f1" fill-opacity=".85"/><path d="M118 128 H182 V146 a12 12 0 0 1 -12 12 H130 a12 12 0 0 1 -12 -12Z" fill="#f3c98d" opacity=".7"/></svg>`;
  }
  return `<svg viewBox="0 0 300 200" class="art" aria-hidden="true"><circle cx="150" cy="96" r="54" fill="none" stroke="${col}" stroke-opacity=".55" stroke-width="2"/><circle cx="150" cy="96" r="40" fill="${tone === 'light' ? '#1d5a3d' : '#fbf8f1'}" fill-opacity="${tone === 'light' ? '.92' : '.12'}"/><g transform="translate(126 72) scale(2)" fill="none" stroke="${tone === 'light' ? '#f3c98d' : '#fbf8f1'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${I[iconName] || I.flask}</g></svg>`;
}

export function drumsArt() {
  const drum = (x, h) => `<g><rect x="${x}" y="${170 - h}" width="54" height="${h}" rx="4" fill="#1d4a37"/><rect x="${x}" y="${170 - h}" width="54" height="8" rx="3" fill="#e2b46a"/><path d="M${x} ${170 - h * .55} H${x + 54} M${x} ${170 - h * .28} H${x + 54}" stroke="#123326" stroke-width="2"/><rect x="${x + 6}" y="${170 - h + 12}" width="6" height="${h - 20}" fill="#fff" opacity=".08"/></g>`;
  return `<svg viewBox="0 0 300 200" class="art" aria-hidden="true"><ellipse cx="150" cy="172" rx="110" ry="8" fill="#000" opacity=".18"/>${drum(78, 84)}${drum(138, 104)}${drum(198, 78)}</svg>`;
}

// Appearance section bottle / jar
export function bottleArt(liquid, label, form = 'liquid') {
  if (form === 'crystal') {
    const r = rng(9); let cr = '';
    for (let i = 0; i < 40; i++) { const x = 92 + r() * 116, y = 268 + r() * 64, s = 5 + r() * 7; cr += `<path d="M${f(x)} ${f(y - s)} L${f(x + s * .6)} ${f(y)} L${f(x)} ${f(y + s * .5)} L${f(x - s * .6)} ${f(y)}Z" fill="#ffffff" stroke="#d8dfd6" stroke-width=".6"/>`; }
    return `<svg viewBox="0 0 300 400" class="bottle" aria-hidden="true"><ellipse cx="150" cy="360" rx="92" ry="12" fill="#000" opacity=".08"/><rect x="88" y="132" width="124" height="34" rx="8" fill="#123f31"/><path d="M84 170 H216 V330 a22 22 0 0 1 -22 22 H106 a22 22 0 0 1 -22 -22Z" fill="#fbf8f1" stroke="#3b4b43" stroke-width="3"/><clipPath id="jar"><path d="M86 172 H214 V330 a20 20 0 0 1 -20 20 H106 a20 20 0 0 1 -20 -20Z"/></clipPath><g clip-path="url(#jar)" class="fill-up"><rect x="84" y="262" width="132" height="92" fill="#eef2ec"/>${cr}</g><rect x="104" y="188" width="92" height="62" rx="4" fill="#fbf8f1" stroke="#3b4b43" stroke-width="1.4"/><text x="150" y="214" class="bl">${label}</text><path d="M118 226 H182 M126 236 H174" stroke="#e07a2c" stroke-width="2" opacity=".6"/></svg>`;
  }
  return `<svg viewBox="0 0 300 400" class="bottle" aria-hidden="true"><defs><linearGradient id="bl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${liquid}"/><stop offset="1" stop-color="#e8a868"/></linearGradient><clipPath id="bt"><path d="M122 92 V112 Q92 126 92 160 V330 a20 20 0 0 0 20 20 H188 a20 20 0 0 0 20 -20 V160 Q208 126 178 112 V92Z"/></clipPath></defs>
  <ellipse cx="150" cy="362" rx="78" ry="11" fill="#000" opacity=".08"/>
  <g clip-path="url(#bt)"><rect x="80" y="90" width="140" height="270" fill="#fbf8f1"/><rect class="fill-up" x="80" y="282" width="140" height="80" fill="url(#bl)"/></g>
  <path d="M122 92 V112 Q92 126 92 160 V330 a20 20 0 0 0 20 20 H188 a20 20 0 0 0 20 -20 V160 Q208 126 178 112 V92" fill="none" stroke="#3b4b43" stroke-width="3"/>
  <rect x="116" y="60" width="68" height="34" rx="6" fill="#123f31"/>
  <rect x="108" y="190" width="84" height="70" rx="4" fill="#fbf8f1" stroke="#3b4b43" stroke-width="1.4"/>
  <text x="150" y="218" class="bl">${label}</text><path d="M122 232 H178 M130 242 H170" stroke="#e07a2c" stroke-width="2" opacity=".6"/>
  <path d="M104 170 V300" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/></svg>`;
}

// ───────────────────────── scene plates (written as files) ─────────────────────────
function cyl(x, y, w, h, c1, c2, c3, id) {
  return `<linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".38" stop-color="${c2}"/><stop offset=".62" stop-color="${c3}"/><stop offset="1" stop-color="${c1}"/></linearGradient>|<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="url(#${id})"/>`;
}

export function scenePlant() {
  const r = rng(21); let defs = '', body = '';
  const towers = [[150, 70, 380], [215, 40, 300], [520, 46, 420], [585, 30, 330], [690, 40, 470], [760, 54, 560], [830, 34, 390], [905, 30, 350], [990, 120, 260], [1080, 40, 300]];
  towers.forEach(([x, w, h], i) => {
    const [d, s] = cyl(x, 690 - h, w, h, '#2a2c2b', '#7c7f7b', '#4d504d', 'tw' + i).split('|'); defs += d; body += s;
    for (let y = 690 - h + 30; y < 690; y += 46 + (i % 3) * 8) body += `<rect x="${x - 10}" y="${y}" width="${w + 20}" height="3" fill="#252726"/><path d="M${x - 10} ${y - 14} H${x + w + 10}" stroke="#2f3130" stroke-width="1.2"/>`;
    body += `<rect x="${x + w * .2}" y="${690 - h - 26}" width="${w * .6}" height="26" fill="#3a3c3b"/><path d="M${x + w / 2} ${690 - h - 26} V${690 - h - 60}" stroke="#2f3130" stroke-width="3"/>`;
  });
  let steam = '';
  for (let i = 0; i < 9; i++) steam += `<ellipse cx="${f(760 + i * 40 + r() * 40)}" cy="${f(110 + i * 35 - r() * 60)}" rx="${f(90 + r() * 70)}" ry="${f(50 + r() * 30)}" fill="#f2f2ef" opacity="${f(.35 + r() * .3)}"/>`;
  for (let i = 0; i < 4; i++) steam += `<ellipse cx="${f(1000 + i * 30)}" cy="${f(380 - i * 40)}" rx="${f(70 + r() * 40)}" ry="${f(40 + r() * 20)}" fill="#f2f2ef" opacity=".35"/>`;
  let rack = ''; for (let x = 0; x < 1200; x += 60) rack += `<rect x="${x}" y="600" width="5" height="90" fill="#2b2d2c"/>`;
  rack += '<rect x="0" y="600" width="1200" height="6" fill="#2b2d2c"/><rect x="0" y="628" width="1200" height="10" fill="#3b3e3c"/><rect x="0" y="648" width="1200" height="6" fill="#2b2d2c"/>';
  let trees = ''; for (let i = 0; i < 14; i++) trees += `<circle cx="${f(r() * 160)}" cy="${f(700 + r() * 60)}" r="${f(30 + r() * 40)}" fill="#151716"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4d5d1"/><stop offset=".7" stop-color="#a7aaa6"/><stop offset="1" stop-color="#8c8f8b"/></linearGradient><filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="26"/></filter><filter id="bl2"><feGaussianBlur stdDeviation="2"/></filter><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2c2b"/><stop offset="1" stop-color="#0e0f0f"/></linearGradient>${defs}</defs>
<rect width="1200" height="900" fill="url(#sky)"/><g filter="url(#bl2)" opacity=".55"><rect x="40" y="560" width="120" height="130" fill="#7d807c"/><rect x="300" y="590" width="160" height="100" fill="#7d807c"/><rect x="1120" y="540" width="80" height="150" fill="#7d807c"/></g>
<g filter="url(#bl)">${steam}</g>${body}${rack}
<g><circle cx="420" cy="640" r="48" fill="#3c3f3d"/><rect x="372" y="640" width="96" height="50" fill="#3c3f3d"/><rect x="1110" y="560" width="70" height="130" fill="#333534"/></g>
<rect x="0" y="688" width="1200" height="212" fill="url(#gr)"/>${trees}<rect width="1200" height="900" fill="#000" opacity=".06"/></svg>`;
}

export function sceneColumns() {
  let defs = '', body = '';
  const cols = [[300, 120], [500, 190], [770, 130]];
  cols.forEach(([x, w], i) => {
    const [d, s] = cyl(x, 0, w, 900, '#5a3a24', '#d79a66', '#9a643c', 'cc' + i).split('|'); defs += d; body += s;
    for (let y = 80; y < 900; y += 170) body += `<rect x="${x - 14}" y="${y}" width="${w + 28}" height="22" rx="3" fill="#8e5d38"/><rect x="${x - 14}" y="${y}" width="${w + 28}" height="5" fill="#d9a477" opacity=".7"/>${Array.from({ length: Math.floor(w / 22) }, (_, k) => `<circle cx="${x - 4 + k * 22}" cy="${y + 11}" r="3" fill="#4a2f1c"/>`).join('')}`;
    body += `<g><circle cx="${x + w / 2}" cy="${300 + i * 90}" r="${w * .22}" fill="#6b4329"/><circle cx="${x + w / 2}" cy="${300 + i * 90}" r="${w * .15}" fill="#2a1a10"/><circle cx="${x + w / 2}" cy="${300 + i * 90}" r="${w * .22}" fill="none" stroke="#e0a87a" stroke-width="3" opacity=".6"/></g>`;
  });
  let ladder = ''; for (let y = 0; y < 900; y += 26) ladder += `<path d="M1000 ${y} H1040" stroke="#6f726f" stroke-width="3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b3f3c"/><stop offset="1" stop-color="#171918"/></linearGradient><radialGradient id="lt" cx="55%" cy="20%" r="60%"><stop offset="0" stop-color="#fff2dc" stop-opacity=".35"/><stop offset="1" stop-color="#fff2dc" stop-opacity="0"/></radialGradient>${defs}</defs>
<rect width="1200" height="900" fill="url(#bg)"/>${[80, 1120].map(x => `<rect x="${x}" y="0" width="34" height="900" fill="#2a2d2b"/>`).join('')}<path d="M0 640 H1200" stroke="#454946" stroke-width="10"/><path d="M0 660 H1200" stroke="#2c2f2d" stroke-width="3"/>
<path d="M240 0 V900 M262 0 V900" stroke="#7c807c" stroke-width="8"/><path d="M700 0 V900" stroke="#6a6e6a" stroke-width="14"/>${body}<path d="M1000 0 V900 M1040 0 V900" stroke="#6f726f" stroke-width="4"/>${ladder}<rect width="1200" height="900" fill="url(#lt)"/></svg>`;
}

export function sceneReactor() {
  let defs = '', body = '';
  [[150, 260], [470, 280], [810, 250]].forEach(([x, w], i) => {
    const top = 260 + (i % 2) * 20, h = 330;
    const [d, s] = cyl(x, top, w, h, '#5e6461', '#e3e6e2', '#9aa09c', 'rv' + i).split('|'); defs += d; body += s;
    body += `<ellipse cx="${x + w / 2}" cy="${top}" rx="${w / 2}" ry="44" fill="#c9cdc9"/><ellipse cx="${x + w / 2}" cy="${top + h}" rx="${w / 2}" ry="70" fill="url(#rv${i})"/>`;
    body += `<rect x="${x + w / 2 - 34}" y="${top - 130}" width="68" height="90" rx="6" fill="#2f5d4d"/><rect x="${x + w / 2 - 50}" y="${top - 52}" width="100" height="22" fill="#4b524f"/><circle cx="${x + w / 2}" cy="${top - 86}" r="16" fill="#25483c"/>`;
    body += `<circle cx="${x + w * .75}" cy="${top + 110}" r="20" fill="#3d4441"/><circle cx="${x + w * .75}" cy="${top + 110}" r="13" fill="#f1c27d" opacity=".75"/>`;
    body += `<rect x="${x + 16}" y="${top + 60}" width="${w - 32}" height="6" fill="#7d837f"/><rect x="${x + 16}" y="${top + 250}" width="${w - 32}" height="6" fill="#7d837f"/>`;
    body += `<rect x="${x + 20}" y="${top + h + 40}" width="16" height="140" fill="#4b524f"/><rect x="${x + w - 36}" y="${top + h + 40}" width="16" height="140" fill="#4b524f"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfd3cf"/><stop offset="1" stop-color="#8a908c"/></linearGradient><radialGradient id="lt" cx="50%" cy="0%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>${defs}</defs>
<rect width="1200" height="900" fill="url(#bg)"/><path d="M0 120 H1200" stroke="#9ba19d" stroke-width="18"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${i * 200 - 10}" y="0" width="20" height="900" fill="#b4b9b5"/>`).join('')}
<path d="M0 200 H1200" stroke="#6d7470" stroke-width="12"/><path d="M0 222 H1200" stroke="#c46d2e" stroke-width="8" opacity=".8"/>${body}
<rect x="0" y="770" width="1200" height="130" fill="#545b57"/>${Array.from({ length: 40 }, (_, i) => `<path d="M${i * 30} 770 V900" stroke="#454b48" stroke-width="2"/>`).join('')}<path d="M0 730 H1200 M0 770 H1200" stroke="#e2b04f" stroke-width="5"/>${Array.from({ length: 13 }, (_, i) => `<path d="M${i * 100} 730 V770" stroke="#e2b04f" stroke-width="5"/>`).join('')}<rect width="1200" height="900" fill="url(#lt)"/></svg>`;
}

export function sceneThermic() {
  let defs = ''; const [d1, s1] = cyl(0, 0, 1, 1, '#4d5250', '#c9cdc9', '#8b918d', 'tf').split('|'); defs += d1;
  const pipe = (x1, y1, x2, y2, w) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#b9bfba" stroke-width="${w}" stroke-linecap="butt"/><path d="M${x1} ${y1} L${x2} ${y2}" stroke="#e8ebe7" stroke-width="${w * .3}" opacity=".6"/>`;
  let seg = ''; for (let x = 90; x < 1180; x += 70) seg += `<path d="M${x} 214 V246 M${x} 594 V626" stroke="#8e948f" stroke-width="2"/>`;
  const valve = (x, y) => `<path d="M${x - 18} ${y - 14} L${x + 18} ${y + 14} V${y - 14} L${x - 18} ${y + 14}Z" fill="#b84c2a"/><path d="M${x} ${y} V${y - 34}" stroke="#333" stroke-width="4"/><circle cx="${x}" cy="${y - 38}" r="16" fill="none" stroke="#b84c2a" stroke-width="5"/>`;
  const gauge = (x, y) => `<circle cx="${x}" cy="${y}" r="26" fill="#f4f4f0" stroke="#3d423f" stroke-width="5"/><path d="M${x} ${y} L${x + 13} ${y - 12}" stroke="#c0392b" stroke-width="3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e7470"/><stop offset="1" stop-color="#2b2f2d"/></linearGradient><linearGradient id="hv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a605c"/><stop offset=".35" stop-color="#d7dbd6"/><stop offset=".65" stop-color="#9aa09c"/><stop offset="1" stop-color="#3e4340"/></linearGradient><radialGradient id="fl" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffcf7a"/><stop offset="1" stop-color="#e07a2c" stop-opacity="0"/></radialGradient>${defs}</defs>
<rect width="1200" height="900" fill="url(#bg)"/><rect x="860" y="0" width="90" height="420" fill="url(#hv)" transform="rotate(90 905 210) translate(0 0)" opacity="0"/>
<rect x="880" y="0" width="80" height="400" fill="#7f8682"/><rect x="880" y="0" width="22" height="400" fill="#5a605c"/><rect x="940" y="0" width="20" height="400" fill="#a5aba7"/>
${pipe(0, 230, 1200, 230, 34)}${pipe(0, 610, 1200, 610, 34)}${seg}${pipe(1020, 230, 1020, 610, 28)}${pipe(150, 230, 150, 400, 24)}
<rect x="120" y="380" width="760" height="260" rx="130" fill="url(#hv)"/><rect x="120" y="380" width="120" height="260" rx="30" fill="#4a504c"/><circle cx="180" cy="510" r="56" fill="#2d312f"/><circle cx="180" cy="510" r="38" fill="url(#fl)"/>
${Array.from({ length: 6 }, (_, i) => `<path d="M${300 + i * 95} 382 V638" stroke="#7b827e" stroke-width="5"/>`).join('')}
<rect x="980" y="300" width="150" height="70" rx="35" fill="#c9cdc9"/>${valve(520, 230)}${valve(760, 610)}${valve(1020, 470)}${gauge(640, 330)}${gauge(1090, 160)}
<rect x="0" y="660" width="1200" height="240" fill="#232625"/><path d="M0 660 H1200" stroke="#e2b04f" stroke-width="6"/><rect width="1200" height="900" fill="#000" opacity=".05"/></svg>`;
}

export function sceneLab() {
  const r = rng(77);
  let peaks = 'M760 300'; for (let x = 760; x <= 960; x += 3) { let y = 300; [[800, 70], [850, 30], [890, 50], [930, 18]].forEach(([c, h]) => { y -= h * Math.exp(-((x - c) ** 2) / 30); }); peaks += ` L${x} ${f(y)}`; }
  let shelf = ''; for (let i = 0; i < 12; i++) { const x = 90 + i * 46 + r() * 8, h = 40 + r() * 34; shelf += `<rect x="${f(x)}" y="${f(232 - h)}" width="26" height="${f(h)}" rx="4" fill="${['#8a6a3c', '#e9e2d3', '#6e8a7c', '#c98a4b'][i % 4]}" opacity=".9"/><rect x="${f(x + 6)}" y="${f(232 - h - 8)}" width="14" height="9" fill="#2f3533"/>`; }
  let vials = ''; for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; vials += `<rect x="${f(318 + Math.cos(a) * 34)}" y="${f(452 + Math.sin(a) * 10)}" width="9" height="22" rx="2" fill="#f4f1ea" stroke="#9aa39d"/>`; }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="wl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef1ee"/><stop offset="1" stop-color="#cfd6d1"/></linearGradient><linearGradient id="bx" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dfe3df"/><stop offset=".5" stop-color="#f7f8f6"/><stop offset="1" stop-color="#c6ccc7"/></linearGradient></defs>
<rect width="1200" height="900" fill="url(#wl)"/><rect x="0" y="0" width="1200" height="40" fill="#dfe4e0"/><rect x="200" y="40" width="300" height="10" fill="#fff"/><rect x="700" y="40" width="300" height="10" fill="#fff"/>
<rect x="70" y="232" width="560" height="10" fill="#b6bdb8"/>${shelf}
<rect x="40" y="560" width="1120" height="30" fill="#5d6f66"/><rect x="60" y="590" width="1080" height="310" fill="#d8ddd9"/>${[0, 1, 2, 3].map(i => `<rect x="${80 + i * 268}" y="610" width="250" height="270" rx="6" fill="#e9ece9" stroke="#bfc6c1"/><rect x="${190 + i * 268}" y="640" width="30" height="6" rx="3" fill="#8c958f"/>`).join('')}
<rect x="250" y="380" width="210" height="180" rx="10" fill="url(#bx)" stroke="#aeb6b1" stroke-width="2"/><rect x="270" y="400" width="80" height="24" rx="3" fill="#2f5d4d"/><rect x="300" y="430" width="40" height="40" rx="20" fill="#cfd6d1"/>${vials}
<rect x="470" y="330" width="250" height="230" rx="10" fill="url(#bx)" stroke="#aeb6b1" stroke-width="2"/><rect x="490" y="350" width="120" height="30" rx="3" fill="#24443a"/><circle cx="680" cy="365" r="8" fill="#5fbf8f"/>${[0, 1, 2].map(i => `<rect x="490" y="${400 + i * 34}" width="210" height="22" rx="3" fill="#e3e7e3"/>`).join('')}
<rect x="740" y="210" width="240" height="160" rx="8" fill="#202826"/><rect x="752" y="222" width="216" height="128" fill="#f7f8f5"/><path d="${peaks}" stroke="#d26f25" stroke-width="2.5" fill="none"/><rect x="842" y="370" width="40" height="60" fill="#3a4541"/><rect x="800" y="430" width="124" height="10" rx="4" fill="#3a4541"/>
${[1010, 1070, 1130].map((x, i) => `<rect x="${x}" y="${300 + i * 6}" width="44" height="${260 - i * 6}" rx="20" fill="${['#2f5d4d', '#9aa39d', '#c46d2e'][i]}"/><rect x="${x + 14}" y="${282 + i * 6}" width="16" height="22" rx="3" fill="#4a524e"/>`).join('')}<path d="M1000 400 H1180" stroke="#7d857f" stroke-width="4"/>
<rect width="1200" height="900" fill="#fff" opacity=".04"/></svg>`;
}

export function sceneForest() {
  const r = rng(1972);
  const trunk = (x, w, c1, c2, op, blur) => `<g opacity="${op}" ${blur ? `filter="url(#b${blur})"` : ''}><rect x="${f(x)}" y="-20" width="${f(w)}" height="1060" fill="${c1}"/><rect x="${f(x + w * .55)}" y="-20" width="${f(w * .3)}" height="1060" fill="${c2}" opacity=".6"/></g>`;
  let far = '', mid = '', fol = '', bark = '', plates = '';
  for (let i = 0; i < 16; i++) far += trunk(r() * 1600, 14 + r() * 22, '#8f9c8a', '#b7c2b1', .55, 3);
  for (let i = 0; i < 7; i++) { const x = r() * 1500; if (x > 820 && x < 1250) continue; mid += trunk(x, 46 + r() * 50, '#4c5348', '#6c7363', .9, 1); }
  for (let i = 0; i < 26; i++) fol += `<circle cx="${f(1180 + r() * 460)}" cy="${f(80 + r() * 760)}" r="${f(40 + r() * 90)}" fill="${['#7fa36a', '#a6c28a', '#5d8450', '#c3d6a3'][i % 4]}" opacity="${f(.35 + r() * .4)}"/>`;
  // foreground tapped pine
  const X0 = 860, W = 360;
  for (let i = 0; i < 70; i++) { const x = X0 + r() * W, w = 2 + r() * 6, y = r() * 1000, h = 60 + r() * 220; bark += `<path d="M${f(x)} ${f(y)} q${f((r() - .5) * 10)} ${f(h / 2)} 0 ${f(h)}" stroke="${r() > .5 ? '#2c241d' : '#7d6a55'}" stroke-width="${f(w)}" opacity="${f(.35 + r() * .45)}" fill="none" stroke-linecap="round"/>`; }
  for (let i = 0; i < 46; i++) { const x = X0 + 14 + r() * (W - 40), y = r() * 1000, w = 18 + r() * 34, h = 70 + r() * 140; plates += `<path d="M${f(x)} ${f(y)} c${f(w * .3)} ${f(-6)} ${f(w * .8)} ${f(-2)} ${f(w)} ${f(6)} c${f(4)} ${f(h * .4)} ${f(-2)} ${f(h * .7)} ${f(-4)} ${f(h)} c${f(-w * .4)} ${f(6)} ${f(-w * .7)} ${f(4)} ${f(-w + 4)} ${f(-4)} c${f(-4)} ${f(-h * .3)} ${f(2)} ${f(-h * .7)} 0 ${f(-h + 2)}z" fill="${r() > .5 ? '#5d4e3f' : '#4a3e33'}" opacity="${f(.4 + r() * .4)}" stroke="#231d17" stroke-width="2" stroke-opacity=".5"/>`; }
  let chev = ''; for (let k = 0; k < 9; k++) { const y = 420 + k * 34; chev += `<path d="M${X0 + 70} ${y} L${X0 + W / 2} ${y + 60} L${X0 + W - 70} ${y}" stroke="#8a6c47" stroke-width="7" fill="none" opacity=".9"/><path d="M${X0 + 70} ${y + 5} L${X0 + W / 2} ${y + 65} L${X0 + W - 70} ${y + 5}" stroke="#f1d39b" stroke-width="2" fill="none" opacity=".5"/>`; }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"><defs>
<linearGradient id="sk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5f6f5c"/><stop offset=".6" stop-color="#8ea082"/><stop offset="1" stop-color="#b9c7a6"/></linearGradient>
<linearGradient id="tk" x1="0" x2="1"><stop offset="0" stop-color="#2a231c"/><stop offset=".35" stop-color="#5b4c3d"/><stop offset=".7" stop-color="#43382d"/><stop offset="1" stop-color="#1e1914"/></linearGradient>
<linearGradient id="fc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c7ad7e"/><stop offset="1" stop-color="#a88a5c"/></linearGradient>
<linearGradient id="rs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2b54a"/><stop offset="1" stop-color="#c77a1f"/></linearGradient>
<filter id="b3"><feGaussianBlur stdDeviation="3"/></filter><filter id="b1"><feGaussianBlur stdDeviation="1.2"/></filter><filter id="b9" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
<radialGradient id="sun" cx="78%" cy="18%" r="45%"><stop offset="0" stop-color="#f4f1d8" stop-opacity=".6"/><stop offset="1" stop-color="#f4f1d8" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="1000" fill="url(#sk)"/>${far}<g filter="url(#b9)">${fol}</g>${mid}
<path d="M${X0 + 6} -20 C${X0 - 8} 300 ${X0 + 10} 640 ${X0 - 12} 1040 L${X0 + W + 14} 1040 C${X0 + W - 4} 700 ${X0 + W + 12} 300 ${X0 + W - 6} -20Z" fill="url(#tk)"/>${plates}${bark}
<path d="M${X0 + 60} 400 L${X0 + W - 60} 400 L${X0 + W - 70} 760 Q${X0 + W / 2} 830 ${X0 + 70} 760Z" fill="url(#fc)"/>${chev}
<path d="M${X0 + W / 2} 470 V800" stroke="url(#rs)" stroke-width="10" stroke-linecap="round"/><path d="M${X0 + W / 2 - 40} 520 q4 60 -2 140 M${X0 + W / 2 + 46} 560 q-6 50 0 110" stroke="#e7a43a" stroke-width="4" opacity=".8" fill="none"/>
<path d="M${X0 + W / 2 - 50} 812 L${X0 + W / 2 + 50} 812 L${X0 + W / 2 + 40} 880 Q${X0 + W / 2} 896 ${X0 + W / 2 - 40} 880Z" fill="#9aa29a"/><ellipse cx="${X0 + W / 2}" cy="812" rx="50" ry="10" fill="#d58a2a"/><path d="M${X0 + W / 2 - 50} 812 L${X0 + W / 2 + 50} 812" stroke="#e8ebe6" stroke-width="2"/>
<path d="M${X0 - 6} 300 C${X0 + 120} 330 ${X0 + 260} 270 ${X0 + W + 6} 320" stroke="#d9cfb8" stroke-width="5" fill="none"/><path d="M${X0 - 6} 312 C${X0 + 120} 342 ${X0 + 260} 282 ${X0 + W + 6} 332" stroke="#9c9178" stroke-width="2" fill="none"/>
<path d="M${X0 + W + 6} 320 C${X0 + W + 120} 380 ${X0 + W + 160} 520 ${X0 + W + 240} 600" stroke="#cfc6ad" stroke-width="3" fill="none" opacity=".7"/>
<rect width="1600" height="1000" fill="url(#sun)"/></svg>`;
}
