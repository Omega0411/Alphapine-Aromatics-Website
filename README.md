# Alphapine & Aromatics — website

Static, dependency-free site: landing page + 16 product detail pages (PDPs), generated from one data file.
Built for Vercel. No framework, no npm install needed.

```
src/data/products.mjs   ← all 16 products (from Product Catalogue 2025). Edit here.
src/data/site.mjs       ← landing copy, FAQ, contact details, WhatsApp number
src/data/molecules.json ← 2D structures for the molecule plates (RDKit-generated)
src/templates.mjs       ← page markup (landing + PDP)
src/lib/art.mjs         ← every illustration (molecules, gallery tiles, hero + facility plates)
public/assets/          ← css, js, fonts (self-hosted), logos, catalogue PDF
scripts/build.mjs       ← renders everything into dist/
```

## Run locally
```bash
node scripts/build.mjs          # → dist/
npx serve dist                  # or: npm run dev
```

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. Vercel → Add New Project → import the repo. `vercel.json` already sets
   build command `node scripts/build.mjs`, output `dist`, clean URLs (`/products/alpha-pinene`).
3. Every push to `main` redeploys — edits made here and pushed go live automatically.

## Before go-live — placeholders to replace
| Where | What |
|---|---|
| `src/data/site.mjs` | `whatsapp` (digits only, e.g. 919812345678), `phoneDisplay`, `email`, `url` (domain), social links |
| `public/assets/img/` | Drop real plant photos named `facility-plant.jpg` etc. and update `src/data/site.mjs` image names. Current plates are illustrations, not photos of the plant. A file in `public/assets/img/` with the same name as a generated plate overrides it. |
| `src/data/site.mjs → resources` | Company brochure PDF (none supplied yet — card says "shared on enquiry") |
| `products.mjs → sheet` | Rows marked "Reported on batch CoA" (SG, RI, optical rotation, purity where the catalogue gives no figure) — fill with your spec values |
| Longifolene CAS | Catalogue lists "—". Standard CAS for longifolene is 475-20-7 — confirm and set `cas` |

## CMS (Supabase) — planned hook, already wired
* **Products**: create table `products (slug text primary key, letter text, data jsonb)` where `data` has the same
  shape as one object in `products.mjs`. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` as Vercel env vars → the build
  pulls from Supabase instead of the local file (falls back to local on error). Add a Supabase webhook → Vercel
  Deploy Hook so publishing in the CMS triggers a rebuild.
* **Leads**: set `LEAD_ENDPOINT` (Vercel env) to a Supabase Edge Function URL that inserts into a `leads` table.
  Forms POST JSON `{name,email,company,phone,type,product,grade,qty,message,context,page,submitted_at}`.
  Until set, forms validate and hand the enquiry to WhatsApp / email instead (nothing is silently dropped).
* **WhatsApp bot**: WhatsApp Cloud API webhook → Edge Function → auto-reply + write to `leads`. Site links already
  use `wa.me/<number>?text=<product context>` so incoming chats arrive pre-tagged with the product.

## Design tokens (seed for the token set)
Colours: forest `#0b2e2a` · footer `#03272a` · teal CTA `#0e9f90` · mint `#55dcc6` · rust `#c9742f` · cream `#fbf8f1` / `#f7f2ea` / `#efe9dd` · ink `#1f3a34`.
Type: Playfair Display (display), Inter (UI/body), JetBrains Mono (labels). All defined as CSS variables at the top of `main.css`.
