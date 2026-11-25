// Site-wide content for the landing page, nav and footer.
// Edit here (or later via the Supabase CMS) — templates read only from this file.

export const site = {
  name: 'Alphapine & Aromatics Pvt. Ltd.',
  short: 'Alphapine & Aromatics',
  founded: 1972,
  plantYear: 2021,
  email: 'reachus@alphapineandaromatics.com',
  phoneDisplay: '+91 99991 99229',
  whatsapp: '919999199229',             // country code + number, digits only
  address: 'Alphapine & Aromatics Pvt. Ltd. — C-17, C-18, C-19 Industrial Area, Pandoga, UNA, H.P. – 177207',
  url: 'https://alphapine.in',          // TODO: production domain (used for canonical/OG tags)
  social: [
    ['LinkedIn', 'https://www.linkedin.com/company/alphapine-and-aromatics-pvt-ltd/', 'in'],
    ['Instagram', 'https://www.instagram.com/alphapinearomaticspvt/', 'ig'],
    ['YouTube', '#', 'yt'],
    ['WhatsApp', 'wa', 'wa'],
  ],
};

export const nav = [
  ['About', 'about'],
  ['Plant', 'plant'],
  ['Catalogue', 'catalogue'],
  ['Certifications', 'quality'],
  ['Contact', 'contact'],
  ['FAQ', 'faq'],
];

export const hero = {
  pill: 'B2B Chemical Manufacturing Excellence',
  // Design copy said "pharma-grade synthetic camphor" — not in the 16-product catalogue, so it is not claimed here.
  body: "India's trusted manufacturer of high-purity terpene derivatives, essential oils and aroma chemicals — delivering precision chemistry to pharmaceutical, FMCG and industrial sectors worldwide.",
  // Background slideshow of plant photos (crossfade + slow zoom, ~5.5 s each), in this order.
  // Each needs assets/img/<photo>-{800,1400,2000}.webp + <photo>.jpg. pos / posM = crop on desktop / mobile;
  // label = caption shown next to the progress bar.
  slides: [
    { photo: 'hero-plant-tank-farm', pos: '50% 62%', posM: '55% 50%', label: 'Bulk storage & tank farm' },
    { photo: 'hero-tank-row', pos: '50% 58%', posM: '62% 50%', label: 'Storage tanks & transfer lines' },
    { photo: 'hero-pipe-rack', pos: '50% 42%', posM: '50% 50%', label: 'Process pipe rack' },
    { photo: 'facility-plant-exterior', pos: '50% 22%', posM: '66% 50%', label: 'Distillation tower & plant' },
  ],
  brochure: { file: 'assets/docs/alphapine-product-catalogue-2025.pdf', name: 'Alphapine-Aromatics-Product-Catalogue.pdf' },
};

// [label, product slug | null] — null links to the catalogue section
export const ticker = [['Gum Turpentine Oil', null], ['Terpineol', 'terpineol'], ['Pine Oil', 'pine-oil'], ['Alpha Pinene', 'alpha-pinene'], ['Dipentine', 'dipentine'], ['Longifolene', 'longifolene'], ['Terpinyl Acetate', 'terpinyl-acetate'], ['DD Turpentine Oil', 'dd-turpentine-oil'], ['Menthol', 'menthol'], ['Citronella Oil', 'citronella-oil'], ['Lemon Grass Oil', 'lemongrass-oil'], ['Eugenol', 'eugenol'], ['Clove Oil', 'clove-oil'], ['L-Carvone', 'l-carvone'], ['Eucalyptus Oil', 'eucalyptus-oil'], ['Eucalyptol', 'eucalyptol'], ['Camphor Oil', 'camphor-oil']];

export const heritage = {
  intro: 'From a single trading house in 1972 to a fully automated manufacturing plant commissioned in 2021 — every milestone earned through rigorous quality and deep customer trust.',
  stats: [
    // value 'auto-years' is computed at build time from site.founded
    { label: 'Heritage', value: 'auto-years', unit: 'yrs', text: 'Continuous presence in aroma chemicals & essential oils — formerly New Jolly Oil Company.' },
    { label: 'Catalogue', value: 16, unit: 'SKUs', text: 'Product lines across manufactured and quality-assured portfolios.' },
    { label: 'Made in-house', value: 7, unit: 'lines', text: 'Manufactured at our automated GTO plant, commissioned in 2021.' },
    { label: 'Lab tests', value: 6, unit: 'methods', text: 'GC-MS, specific gravity, refractive index, optical rotation, flash point & odour.' },
  ],
};

export const catalogueIntro = 'Seven products manufactured at our fully automated GTO plant, commissioned in 2021. Nine quality-assured lines sourced from verified producers and re-tested in our in-house lab before dispatch. Every batch profiled. Every grade declared.';

// Industries Served — homepage cards (name + one-line) and the dedicated /industries page (paragraph + products).
// `products` are catalogue slugs whose listed applications (products.mjs → uses) cover that industry.
// Empty where the catalogue lists no matching application — the page then shows only the quote CTA.
export const industriesIntro = {
  home: 'Our terpene derivatives, essential oils and aroma chemicals reach well beyond gum turpentine derivatives — into eleven industries, from pharmaceutical actives to agarbatti, paints and home care.',
  page: 'Terpene derivatives, essential oils and aroma chemicals from Alphapine & Aromatics go into formulations across eleven industries. Every batch is tested in our in-house laboratory before dispatch — tell us your application and we will match the product and grade.',
};

export const industries = [
  { slug: 'pharmaceuticals', name: 'Pharmaceuticals', icon: 'pill',
    line: 'APIs, intermediates, excipients and aroma-chemical inputs for pharma applications.',
    para: 'Our portfolio for pharma runs from menthol, eucalyptol, eucalyptus oil and camphor oil to Terpineol in a Medicinal Grade and Alpha Pinene as a pharma intermediate. Every batch is GC-MS profiled in our in-house laboratory, and a batch Certificate of Analysis can accompany your order.',
    products: ['menthol', 'eucalyptol', 'eucalyptus-oil', 'camphor-oil', 'terpineol', 'alpha-pinene', 'l-carvone', 'eugenol'] },
  { slug: 'nutraceuticals', name: 'Nutraceuticals', icon: 'leafdrop',
    line: 'Ingredients and aroma / flavour inputs for nutraceutical and wellness formulations.',
    para: 'Suitability depends on grade and your regulatory requirement — share the formulation and target specification, and our team will advise on the right product, grade and supporting documentation.',
    products: [] },
  { slug: 'soaps-detergents', name: 'Soaps & Detergents', icon: 'soap',
    line: 'Fragrance and functional ingredients for bar soaps, liquid soaps, detergents and washing products.',
    para: 'Pine Oil, Dipentine and Terpinyl Acetate are manufactured at our own plant; essential oils such as citronella, clove, eucalyptus and lemongrass are re-tested in-house before dispatch.',
    products: ['pine-oil', 'dipentine', 'terpinyl-acetate', 'citronella-oil', 'clove-oil', 'eucalyptus-oil', 'lemongrass-oil', 'camphor-oil'] },
  { slug: 'perfumery', name: 'Perfumery', icon: 'spray',
    line: 'Fine fragrance, perfumery compounds and aroma chemicals for perfumes, attars and body care.',
    para: 'Terpineol, Terpinyl Acetate and Alpha Pinene are used in fine perfumery, Longifolene in woody and amber accords and Eugenol in oriental and spice accords. Odour evaluation is part of every batch release.',
    products: ['terpineol', 'terpinyl-acetate', 'alpha-pinene', 'longifolene', 'eugenol', 'citronella-oil', 'eucalyptol'] },
  { slug: 'flavour', name: 'Flavour', icon: 'candy',
    line: 'Flavour chemicals and ingredients for food, confectionery and related flavour applications.',
    para: 'Terpineol is FEMA-listed as a flavouring agent; menthol and L-Carvone are supplied for confectionery and gum, with grade suitability confirmed against your specification.',
    products: ['menthol', 'l-carvone', 'terpineol', 'terpinyl-acetate', 'eugenol', 'clove-oil', 'eucalyptol', 'lemongrass-oil'] },
  { slug: 'beverages', name: 'Beverages', icon: 'cup',
    line: 'Flavour and aroma inputs for beverages — alcoholic and non-alcoholic.',
    para: 'Menthol, L-Carvone, lemongrass oil and clove oil are among the inputs we supply for beverage applications. Tell us the beverage application and the market it is for, and we will recommend a grade and share the batch CoA.',
    products: ['menthol', 'l-carvone', 'lemongrass-oil', 'clove-oil'] },
  { slug: 'incense', name: 'Incense', icon: 'incense',
    line: 'Agarbatti, dhoop and incense — fragrance oils, aroma chemicals and incense raw materials.',
    para: 'Camphor oil, long used in religious and ceremonial applications, is part of our quality-assured portfolio — share your fragrance profile and we will suggest the right inputs.',
    products: ['camphor-oil'] },
  { slug: 'mehendi', name: 'Mehendi', icon: 'hand',
    line: 'Henna / Mehendi formulations — fragrance, oils and related aroma inputs.',
    para: 'Share your formulation requirement and our team will recommend suitable products and grades from the catalogue.',
    products: [] },
  { slug: 'paints-coatings', name: 'Paints & Coatings', icon: 'brush',
    line: 'Solvents, resins / intermediates and aroma-chemical inputs for paints, coatings and allied products.',
    para: 'DD Turpentine Oil, Dipentine and Pine Oil — all manufactured at our GTO plant — serve as thinners, solvents and paint strippers, while Longifolene is used as a resin modifier.',
    products: ['dd-turpentine-oil', 'dipentine', 'pine-oil', 'terpineol', 'longifolene'] },
  { slug: 'home-care', name: 'Home Care', icon: 'home',
    line: 'Home-care formulations — cleaners, air care, dish care and surface care.',
    para: 'Pine Oil and Terpineol are used in cleaners and disinfectants, Terpinyl Acetate in household and air-care fragrance, and Dipentine in bio-based cleaning.',
    products: ['pine-oil', 'terpineol', 'terpinyl-acetate', 'dipentine', 'lemongrass-oil'] },
  { slug: 'industrial-cleaning', name: 'Industrial Cleaning', icon: 'bucket',
    line: 'Industrial and institutional cleaning — degreasers, cleaners and functional chemicals.',
    para: 'Dipentine is a bio-based industrial solvent, Pine Oil is used in cleaning and degreasing, and Alpha Pinene and eucalyptus oil serve as solvents in cleaning formulations.',
    products: ['dipentine', 'pine-oil', 'alpha-pinene', 'eucalyptus-oil'] },
];

// Real plant photos: assets/img/<photo>-{800,1400,2000}.webp + <photo>.jpg fallback.
// pos / posM = object-position on desktop (wide crop) / mobile (portrait crop).
export const facilities = [
  { photo: 'facility-plant-exterior', pos: '50% 10%', posM: '66% 50%', alt: 'Alphapine & Aromatics plant at the main gate, with the steel distillation tower and cooling towers rising behind the building', title: 'Our Manufacturing Plant', text: 'Fully automated plant commissioned in 2021. The steel tower houses our packed distillation columns, with Gum Turpentine Oil as the exclusive feedstock — no pine needles in the process.' },
  { photo: 'facility-weighbridge-tank-farm', pos: '50% 46%', posM: '42% 50%', alt: 'On-site weighbridge in front of a bulk storage tank, stacked dispatch drums and hydrant fire-protection points', title: 'Storage, Weighing & Dispatch', text: 'Bulk storage tanks, an on-site weighbridge for every inbound and outbound load, and drums staged for dispatch — with hydrant and hose-reel fire protection across the yard.' },
  { photo: 'facility-process-pumps', pos: '50% 60%', posM: '38% 50%', alt: 'Row of blue centrifugal process pumps with stainless-steel pipework and pressure gauges beside storage tanks', title: 'Process Pumps & Transfer Lines', text: 'A dedicated bank of centrifugal pumps, stainless-steel pipework and pressure gauges moves material between storage and the distillation process.' },
  { photo: 'facility-quality-lab', pos: '50% 88%', posM: '62% 50%', alt: 'Quality laboratory bench with a magnetic stirrer hot plate, heating mantle with round-bottom flask, overhead stirrer and labelled terpene samples', title: 'In-House Quality Laboratory', text: 'Bench-scale distillation and sample preparation, backed by GC-MS, specific gravity, refractive index, optical rotation, flash point and odour evaluation — before every dispatch.' },
];

export const plant = {
  eyebrow: 'Inside the plant · Est. 2021',
  intro: 'Commissioned in 2021 — fully automated, with GTO as the exclusive feedstock. Packed distillation columns, controlled reactors and thermic fluid heating, built for consistent, high-purity output across all seven manufactured lines.',
  stations: [
    { img: 'facility-columns.svg', title: 'Packed Distillation Columns', text: 'Precise fraction separation of Gum Turpentine Oil.' },
    { img: 'facility-reactor.svg', title: 'Reactor Vessels', text: 'Controlled chemical transformations.' },
    { img: 'facility-thermic.svg', title: 'Thermic Fluid Heating', text: 'Stable, uniform heat transfer across operations.' },
    { img: 'facility-lab.svg', title: 'In-House GC-MS Lab', text: 'Purity and composition profiling for every batch.' },
  ],
};

export const quality = {
  intro: 'We do not compromise on quality. Every batch — whether manufactured in-house or quality-assured from verified sources — undergoes rigorous in-house testing before dispatch, against declared specifications for purity, composition, physical constants and sensory attributes.',
  lab: [
    ['GC-MS Spectrometry', 'Purity & composition profiling'],
    ['Fractional Distillation Unit', 'Fraction analysis & R&D'],
    ['Specific Gravity', 'Density / purity check'],
    ['Refractive Index', 'Optical purity verification'],
    ['Optical Rotation', 'Chirality & authenticity'],
    ['Flash Point', 'Safety & transport compliance'],
    ['Odour Evaluation', 'Sensory quality assurance'],
  ],
  cards: [
    { icon: 'shield', title: 'GC-MS Verified', text: 'Every batch profiled by gas chromatography–mass spectrometry before dispatch.', tag: 'Every batch' },
    { icon: 'clock', title: '50+ Year Heritage', text: 'Trading since 1972 as New Jolly Oil Company; manufacturing since 2021.', tag: 'Est. 1972' },
    { icon: 'factory', title: 'Automated Plant', text: 'GTO-fed fractional distillation with packed columns, reactors and thermic fluid heating.', tag: 'Since 2021' },
    { icon: 'check', title: 'Specs Declared', text: 'Purity, composition, physical constants and odour — verified against declared specifications.', tag: 'Every grade' },
  ],
};

export const resources = {
  intro: 'Access comprehensive documentation including our product catalogue, Certificates of Analysis and company information — everything you need to make informed procurement decisions.',
  items: [
    // same PDF as the hero "Download Brochure" button (hero.brochure)
    { icon: 'file', title: 'Download Brochure', text: 'All 16 product lines — grades, CAS numbers, characteristics, applications and safety notes.', meta: 'PDF · 59 KB', file: 'assets/docs/alphapine-product-catalogue-2025.pdf' },
  ],
};

export const inquiryTypes = ['Product quote', 'Sample request', 'Technical datasheet / CoA', 'Bulk / export order', 'General enquiry'];

export const faq = [
  ['What is the difference between "Manufactured" and "Quality Assured" products?',
    'Manufactured products (Terpineol, Pine Oil, Dipentine, DD Turpentine Oil, Longifolene, Alpha Pinene and Terpinyl Acetate) are produced at our own fully automated plant by fractional distillation of Gum Turpentine Oil. Quality Assured products are procured from verified sources and re-tested in our in-house laboratory — GC-MS plus physical and chemical parameters — before every dispatch. Both carry the same release standard.'],
  ['What is your manufacturing feedstock and process?',
    'Gum Turpentine Oil (GTO) is the exclusive feedstock — the plant operates entirely without pine needles. GTO is processed through highly controlled fractional distillation using packed distillation columns for precise fraction separation, reactors for controlled chemical transformations, and a thermic fluid heating system for stable, uniform heat transfer.'],
  ['Can I request a Certificate of Analysis (CoA) and GC-MS report?',
    'Yes. Every batch is tested in-house before dispatch, so a batch-specific Certificate of Analysis — including the GC-MS profile and physical constants such as specific gravity, refractive index, optical rotation and flash point where applicable — can be shared with your quotation or order.'],
  ['What grades and purities are available for Terpineol and Pine Oil?',
    'Terpineol: Perfumery, Medicinal, Commercial, Super and Extra Pure grades, plus Alpha Terpineol 92–98%. Pine Oil: Industrial 18%, Commercial 22–25%, Super 32%, Pure 40%, and 65%, 70%, 80%, 85% and 92% — the percentage denotes terpineol content.'],
  ['What are minimum order quantities (MOQs) and lead times?',
    'MOQ starts from 25 kg, sample dispatch is within 48 hours, and bulk pricing applies from 500 kg. Lead times depend on product, grade and volume and are confirmed with your quotation.'],
  ['Do you ship internationally and handle export documentation?',
    'Yes — we supply domestic and export customers. Share your destination, product and volumes and our team will confirm logistics and documentation with the quotation.'],
  ['Are your products suitable for pharmaceutical and food applications?',
    'Several are used there: Terpineol is FEMA-listed as a flavouring agent and offered in a Medicinal Grade; L-Carvone is verified against pharmaceutical and food-grade specifications; Eucalyptol 99% is preferred for precise pharmaceutical and flavour dosing. Suitability depends on grade and your regulatory requirement — tell us the application and we will advise.'],
  ['How is packaging handled for bulk shipments?',
    'Packaging is specified with each quotation according to product, volume and destination. Oxidation-sensitive terpenes such as Alpha Pinene and DD Turpentine Oil are shipped in sealed containers, as their stability requires.'],
];

// ── CMS-editable copy & form settings ─────────────────────────────────────────
// Defaults for the Supabase `site_content` table (one row per key). At build time a
// CMS row replaces the matching fields here. In headings, *word* renders in italics
// (the accent style) and a line break renders as <br>.
export const content = {
  catalogue: {
    eyebrow: 'Product catalogue 2025',
    heading: 'From terpene to *fragrance* —\na portfolio of sixteen.',
    intro: catalogueIntro,
  },
  faq_section: {
    eyebrow: 'Frequently asked',
    heading: 'Answers, before\nyou ask.',
    intro: 'Everything procurement managers, formulators and R&D teams ask us — distilled into straight answers.',
    help_title: 'Still have questions?',
    help_text: 'Our specialists are available on WhatsApp and email for detailed sourcing or grade-related queries.',
    help_button: 'Contact Us',
  },
  quote_form: {
    title: 'Request a quote',
    sub: 'Share your requirement — we respond with pricing, availability and a batch CoA.',
    submit: 'Submit Request',
    inquiry_types: inquiryTypes,
  },
  contact_form: {
    title: 'Fill the Form for Any Product Related Enquiry or Requesting a Quote',
    sub: 'Fill in your details below and our technical team will reach out with customized information.',
    submit: 'Submit Inquiry & Download Brochure',
  },
  tds_form: {
    title: 'Request technical documents',
    sub: 'Share your details and we will email the requested documents for this product.',
    submit: 'Submit Request',
    // {document} and {product} are filled in when the visitor submits
    confirmation: 'Thank you. Your request for {document} for {product} has been received. Our team will share the document on your email shortly.',
  },
  forms_common: {
    consent: 'I consent to Alphapine & Aromatics processing my data in accordance with the Privacy Policy and DPDP Act regulations.',
  },
};
