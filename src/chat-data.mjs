// Knowledge for the site chatbot (public/assets/js/chat.js), generated at build time from the same
// content as the pages — products, FAQs, quality section, industries (CMS content when Supabase is on).
// Written to dist/assets/data/chat.json and loaded only when a visitor opens the chat.
import { site, hero, heritage, quality, industries, faq, content } from './data/site.mjs';

const CAT = { mfg: 'Manufactured', qa: 'Quality Assured' };

export function chatData(ordered) {
  return {
    contact: { whatsapp: site.whatsapp, phone: site.phoneDisplay, email: site.email, address: site.address },
    brochure: hero.brochure,
    categories: Object.entries(CAT).map(([id, label]) => ({ id, label, count: ordered.filter(p => p.cat === id).length })),
    // catalogue order; only fields the bot shows
    products: ordered.map(p => ({
      slug: p.slug, name: p.name, letter: p.letter, cat: p.cat, cas: p.cas, cls: p.cls, pill: p.pill,
      card: p.card, grades: p.grades || [], uses: (p.uses || []).map(u => [u[1], u[2]]),
    })),
    faqs: faq.map(([q, a]) => ({ q, a })),
    quality: { intro: quality.intro, lab: quality.lab, cards: quality.cards.map(c => ({ title: c.title, text: c.text })) },
    about: heritage.intro,
    catalogueIntro: content.catalogue.intro,
    industries: industries.map(d => ({ slug: d.slug, name: d.name, line: d.line })),
    // where things are on the site; href is relative to the site root
    sections: [
      { id: 'about', label: 'About Alphapine', href: 'index.html#about', text: heritage.intro, keys: ['about', 'company', 'history', 'heritage', '1972', 'jolly', 'who'] },
      { id: 'plant', label: 'Our plant & facilities', href: 'index.html#plant', text: 'Our fully automated plant, commissioned in 2021, runs on Gum Turpentine Oil as the exclusive feedstock — with packed distillation columns, reactors, thermic fluid heating and an in-house quality laboratory.', keys: ['plant', 'facility', 'facilities', 'factory', 'manufacturing', 'distillation', 'lab', 'laboratory'] },
      { id: 'catalogue', label: 'Product catalogue', href: 'index.html#catalogue', text: content.catalogue.intro, keys: ['catalogue', 'catalog', 'products', 'portfolio', 'range', 'list'] },
      { id: 'industries', label: 'Industries we serve', href: 'industries.html', text: 'Pharmaceuticals, nutraceuticals, soaps & detergents, perfumery, flavour, beverages, incense, mehendi, paints & coatings, home care and industrial cleaning.', keys: ['industry', 'industries', 'application', 'applications', 'sector', 'sectors', 'use'] },
      { id: 'quality', label: 'Quality & certifications', href: 'index.html#quality', text: quality.intro, keys: ['quality', 'certification', 'certifications', 'certificate', 'testing', 'gc-ms', 'gcms', 'purity'] },
      { id: 'faq', label: 'FAQs', href: 'index.html#faq', text: 'Straight answers on grades, MOQs, lead times, export, CoAs and packaging.', keys: ['faq', 'faqs', 'questions', 'moq', 'lead', 'shipping', 'export', 'packaging'] },
      { id: 'contact', label: 'Contact & enquiry form', href: 'index.html#contact', text: `Email ${site.email} · Phone / WhatsApp ${site.phoneDisplay} · ${site.address}`, keys: ['contact', 'phone', 'call', 'email', 'mail', 'address', 'location', 'where', 'visit', 'reach'] },
    ],
  };
}
