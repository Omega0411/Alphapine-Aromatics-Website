// Site-wide content for the landing page, nav and footer.
// Edit here (or later via the Supabase CMS) — templates read only from this file.

export const site = {
  name: 'Alphapine & Aromatics Pvt. Ltd.',
  short: 'Alphapine & Aromatics',
  founded: 1972,
  plantYear: 2021,
  email: 'sales@alphapine.in',          // TODO: confirm
  phoneDisplay: '+91 00000 00000',      // TODO: replace with real number
  whatsapp: '910000000000',             // TODO: replace (country code + number, digits only)
  url: 'https://alphapine.in',          // TODO: production domain (used for canonical/OG tags)
  social: [
    ['LinkedIn', '#', 'in'],
    ['Instagram', '#', 'ig'],
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

export const facilities = [
  { img: 'facility-plant.svg', title: 'Industrial Manufacturing Plant', text: 'Fully automated plant commissioned in 2021 — Gum Turpentine Oil is the exclusive feedstock, with no pine needles in the process.' },
  { img: 'facility-columns.svg', title: 'Packed Distillation Columns', text: 'Engineered for precise fraction separation — the heart of our controlled fractional distillation.' },
  { img: 'facility-reactor.svg', title: 'Reactor Systems', text: 'Reactors for controlled chemical transformations across our manufactured product lines.' },
  { img: 'facility-thermic.svg', title: 'Thermic Fluid Heating', text: 'Stable, uniform heat transfer across operations — the basis of consistent, high-purity output.' },
  { img: 'facility-lab.svg', title: 'In-House Quality Laboratory', text: 'GC-MS, specific gravity, refractive index, optical rotation, flash point and odour evaluation — before every dispatch.' },
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
    { icon: 'book', title: 'Company Brochure', text: "Overview of Alphapine's heritage, plant, laboratory and product portfolio.", meta: 'Shared by our team on enquiry', file: null },
    { icon: 'file', title: 'Product Catalogue 2025', text: 'All 16 product lines — grades, CAS numbers, characteristics, applications and safety notes.', meta: 'PDF · 59 KB', file: 'assets/docs/alphapine-product-catalogue-2025.pdf' },
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
