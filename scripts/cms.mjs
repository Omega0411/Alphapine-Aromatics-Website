// Build-time CMS loader (Supabase → static pages).
// With SUPABASE_URL + SUPABASE_ANON_KEY set, the build reads the *published* products, FAQs
// and section copy through Supabase's REST API (anon key = public read access, enforced by
// the RLS policies in supabase/schema.sql). Without them it uses the bundled src/data.
// If Supabase is configured but unreachable (e.g. a paused free-tier project), the build FAILS
// on purpose: Vercel then keeps the last good deployment live instead of silently replacing
// CMS edits with the bundled defaults. Set CMS_ALLOW_FALLBACK=1 to build from src/data anyway.
// A single malformed product is skipped (with a warning) rather than failing the build.
import { products as localProducts, gridOrder } from '../src/data/products.mjs';
import { faq, content } from '../src/data/site.mjs';

const env = process.env;
export const cmsConfigured = !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
const allowFallback = env.CMS_ALLOW_FALLBACK === '1';
function unavailable(what, e) {
  const msg = `${what} could not be loaded from Supabase (${e.message}). Is the Supabase project paused or the URL/key wrong? The live site was left unchanged. Set CMS_ALLOW_FALLBACK=1 to build from the bundled src/data instead.`;
  if (!allowFallback) throw new Error(`CMS: ${msg}`);
  console.warn(`CMS (fallback): ${msg}`);
}

async function rest(path) {
  const r = await fetch(`${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}`, {
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` },
  });
  if (!r.ok) throw new Error(`${path.split('?')[0]}: HTTP ${r.status} ${await r.text()}`);
  return r.json();
}

// Minimal shape check so one malformed CMS product cannot crash every page.
const REQUIRED = ['slug', 'letter', 'name', 'cat', 'cas', 'title', 'card', 'grades', 'chips', 'tags', 'specs', 'look', 'source', 'process', 'gcms', 'uses', 'roles', 'tox', 'sheet'];
export function productProblems(p) {
  const miss = REQUIRED.filter(k => p[k] === undefined || p[k] === null);
  if (p.cat && !['mfg', 'qa'].includes(p.cat)) miss.push('cat (must be mfg or qa)');
  return miss;
}

function localOrdered() {
  const ordered = gridOrder.map(l => localProducts.find(p => p.letter === l)).filter(Boolean);
  localProducts.filter(p => !ordered.includes(p)).forEach(p => ordered.push(p));
  return ordered;
}

// Menus, form dropdowns and related products list products by catalogue letter (A, B, C…);
// the catalogue grid uses the separate display order (CMS sort order, or gridOrder for bundled data).
const byLetter = (list) => [...list].sort((a, b) => String(a.letter).localeCompare(String(b.letter), 'en', { numeric: true }));

/** Returns { products (by letter), ordered (catalogue grid order), source } and applies CMS FAQ + copy in place. */
export async function loadCms() {
  const log = (m) => console.log(`CMS: ${m}`);
  if (!cmsConfigured) { log('Supabase not configured — using bundled content (src/data)'); return { products: localProducts, ordered: localOrdered(), source: 'local' }; }

  let products = localProducts, ordered = localOrdered(), source = 'local';
  try {
    const rows = await rest('products?select=slug,data&published=is.true&order=sort_order.asc,slug.asc');
    const good = [];
    for (const r of rows) {
      const bad = productProblems(r.data);
      if (bad.length) console.warn(`CMS: skipping product "${r.slug}" — missing/invalid: ${bad.join(', ')}`);
      else good.push(r.data);
    }
    if (!good.length) throw new Error('no valid published products (run supabase/seed.sql, or switch at least one product live)');
    ordered = good; products = byLetter(good); source = 'supabase'; log(`${good.length} published products from Supabase`);
  } catch (e) { unavailable('Products', e); }

  try {
    const rows = await rest('faqs?select=question,answer&published=is.true&order=sort_order.asc,id.asc');
    faq.splice(0, faq.length, ...rows.map(r => [r.question, r.answer]));   // the CMS decides, even if every FAQ is hidden
    log(`${rows.length} published FAQs from Supabase`);
  } catch (e) { unavailable('FAQs', e); }

  try {
    const rows = await rest('site_content?select=key,value');
    for (const { key, value } of rows) {
      if (!content[key] || !value || typeof value !== 'object') continue;
      for (const [k, v] of Object.entries(value)) {
        if (!(k in content[key])) continue;                                   // ignore unknown fields
        if (Array.isArray(content[key][k]) ? Array.isArray(v) && v.length : typeof v === 'string' && v.trim()) content[key][k] = v;
      }
    }
    log(`section copy & form settings: ${rows.length} keys from Supabase`);
  } catch (e) { unavailable('Section copy', e); }

  return { products, ordered, source };
}
