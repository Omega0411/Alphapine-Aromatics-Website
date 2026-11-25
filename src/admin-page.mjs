// CMS admin shell — rendered by the build to dist/admin/index.html.
// The page itself is static; public/assets/admin/admin.js signs in with Supabase Auth and
// reads/writes the CMS tables (access enforced by RLS, see supabase/schema.sql).
import { readFileSync } from 'node:fs';
import { ver } from './templates.mjs';
import { ICON_NAMES } from './lib/art.mjs';
import { content } from './data/site.mjs';

const MOLECULES = Object.keys(JSON.parse(readFileSync(new URL('./data/molecules.json', import.meta.url))));

// Choices offered by the product editor. Illustration "kinds" must match what src/lib/art.mjs can draw.
const OPTIONS = {
  icons: ICON_NAMES,
  molecules: MOLECULES,
  sourceKinds: ['pine', 'mint', 'grass', 'bud', 'leaf', 'wood'],
  processKinds: ['column', 'reactor', 'verify'],
  lookForms: ['liquid', 'crystal'],
};

// Bundled copy, captured before the build applies CMS overrides: the admin shows it as the default.
const DEFAULTS = structuredClone(content);

const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

export function renderAdmin() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Alphapine CMS</title>
<link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../assets/css/fonts.css${ver('fonts')}">
<link rel="stylesheet" href="../assets/admin/admin.css${ver('adminCss')}">
<script src="../assets/js/config.js${ver('config')}"></script>
<script>window.CMS_OPTIONS = ${json(OPTIONS)}; window.CMS_DEFAULTS = ${json(DEFAULTS)};</script>
<script src="../assets/admin/admin.js${ver('adminJs')}" defer></script>
</head>
<body>
<div id="app" aria-live="polite"><p class="boot">Loading the CMS…</p></div>
<noscript><p class="boot">The CMS needs JavaScript enabled.</p></noscript>
</body>
</html>`;
}
