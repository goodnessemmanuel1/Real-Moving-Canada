'use strict';
/**
 * Builds the static HTML pages in /public from /web-sources/pages.
 * Each page starts with <!--meta {json}--> and is wrapped in a shared layout
 * (header, footer, icon sprite). Run: npm run build:pages
 *
 * Routing: every page is written as a real directory with its own
 * index.html (e.g. about.html -> about/index.html), so it's servable at a
 * clean URL ("/about") with no ".html" extension and no client-side router —
 * any static file server that resolves a directory request to its
 * index.html (this repo's own server.js, Netlify, Vercel, GitHub Pages,
 * nginx, `npx serve`) handles it natively, including on a hard refresh.
 * The homepage is written twice — to / and to /home — since both are valid
 * entry points. 404.html stays at the server root, which is the convention
 * static hosts look for.
 *
 * All internal links/assets in the page sources are already absolute
 * ("/quote", "/assets/img/logo.svg"), so nothing needs rewriting per page.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'pages');
const OUT = path.join(ROOT, '..', 'public');
const VERSION = Date.now().toString(36);

// ─── Icon sprite (24×24, stroke-based) ────────────────────────────────────
const ICONS = {
  truck: '<path d="M2.5 6.5h11v10h-11z"/><path d="M13.5 9.5h4l3.5 3.5v3.5h-7.5"/><circle cx="7" cy="17.5" r="1.9"/><circle cx="17" cy="17.5" r="1.9"/>',
  home: '<path d="M3 11 12 4l9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>',
  building: '<rect x="4" y="3" width="10.5" height="18" rx="1"/><path d="M14.5 9H20v12h-5.5M7.5 7h3.5M7.5 11h3.5M7.5 15h3.5"/>',
  pin: '<path d="M12 21s-6.5-5.8-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.2-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  route: '<circle cx="6" cy="18" r="2.3"/><circle cx="18" cy="6" r="2.3"/><path d="M8.3 18H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.7"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.6 3.7 5.6 3.7 9s-1.3 6.4-3.7 9c-2.4-2.6-3.7-5.6-3.7-9S9.6 5.6 12 3z"/>',
  box: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9M7.8 5.2l8.4 4.6"/>',
  warehouse: '<path d="M3 20.5V9l9-5 9 5v11.5"/><path d="M7 20.5V13h10v7.5M7 16.8h10"/>',
  sofa: '<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3z"/><path d="M5.5 18v2M18.5 18v2"/>',
  shield: '<path d="M12 3 5 6v5c0 4.4 3 8.2 7 10 4-1.8 7-5.6 7-10V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  star: '<path d="m12 3.2 2.7 5.5 6 .9-4.35 4.25 1.03 6-5.38-2.83-5.38 2.83 1.03-6L3.3 9.6l6-.9z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  phone: '<path d="M5 3.8h3.6l1.8 4.6-2.3 1.4a11 11 0 0 0 5.1 5.1l1.4-2.3 4.6 1.8v3.6a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 3 5.9a2 2 0 0 1 2-2.1z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  file: '<path d="M6 3h8.5L19 7.5V21H6z"/><path d="M14 3v5h5M9 12.5h7M9 16.5h7"/>',
  message: '<path d="M4 5h16v11H9.5L4 20z"/><path d="M8 9.5h8M8 12.5h5"/>',
  dollar: '<path d="M12 3v18M16.5 7.5C16 6 14.3 5 12 5 9.5 5 7.5 6.3 7.5 8.3c0 4.7 9 2.6 9 7.4 0 2-2 3.3-4.5 3.3-2.5 0-4.3-1-4.8-2.7"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M19 19a3 3 0 0 1-3 3h-3"/>',
  hands: '<path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V10M10 10V5a1.5 1.5 0 0 1 3 0v5M13 10V6a1.5 1.5 0 0 1 3 0v6M16 10a1.5 1.5 0 0 1 3 0v4a7 7 0 0 1-7 7h-1a6 6 0 0 1-4.5-2l-3-3.6a1.6 1.6 0 0 1 2.4-2.1L7 14.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.01"/>',
  archive: '<rect x="3" y="4" width="18" height="4.5" rx="1"/><path d="M5 8.5V20h14V8.5M10 12.5h4"/>',
  scale: '<path d="M12 4v16M5 20h14M4 8h16M7 8l-3 6a3 3 0 0 0 6 0zM17 8l-3 6a3 3 0 0 0 6 0z"/>',
  ruler: '<path d="M3 16.5 16.5 3 21 7.5 7.5 21z"/><path d="m7 12.5 2 2M10 9.5l2 2M13 6.5l2 2"/>',
  trash: '<path d="M4 7h16M9.5 7V4h5v3M6 7l1 13h10l1-13"/>',
};
const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">${Object.entries(ICONS)
  .map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('')}</svg>`;
const I = (name, cls = 'i') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;

// ─── Shared partials ──────────────────────────────────────────────────────
// All hrefs/srcs below are root-absolute clean routes ("/quote", "/assets/…"),
// which resolve correctly no matter how deep the current page's own URL is.
const header = () => `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="RealMovingCanada — home"><img src="/assets/img/logo.svg" alt="RealMovingCanada" width="329" height="44" data-logo></a>
    <nav class="nav" id="site-nav" aria-label="Main">
      <a href="/">Home</a>
      <a href="/services">Services</a>
      <a href="/service-areas">Service Areas</a>
      <a href="/pricing">Pricing</a>
      <a href="/reviews">Reviews</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
      <div class="nav-mobile-cta">
        <a class="btn btn-primary" href="/quote">Get a Quote</a>
      </div>
    </nav>
    <div class="header-actions">
      <a class="btn btn-primary btn-sm btn-quote" href="/quote">Get a Quote</a>
      <button class="icon-btn menu-toggle" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="Open menu">${I('menu')}</button>
    </div>
  </div>
</header>`;

const footer = () => `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <img src="/assets/img/logo-light.svg" alt="RealMovingCanada" width="329" height="44" data-logo-light>
      <p class="footer-motto">Movers You Can Trust</p>
      <p>Residential, commercial, local, long-distance and specialty moving services — planned carefully and communicated clearly, across Canada.</p>
    </div>
    <div>
      <h2>Services</h2>
      <ul>
        <li><a href="/services#residential-moving">Residential moving</a></li>
        <li><a href="/services#packing-unpacking">Packing &amp; unpacking</a></li>
        <li><a href="/services#specialty-moving">Specialty moving</a></li>
        <li><a href="/services#logistics-storage">Logistics &amp; storage</a></li>
        <li><a href="/services#junk-removal">Junk removal</a></li>
      </ul>
    </div>
    <div>
      <h2>Company</h2>
      <ul>
        <li><a href="/about">About us</a></li>
        <li><a href="/service-areas">Service areas</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li><a href="/reviews">Reviews</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </div>
    <div>
      <h2>Get started</h2>
      <ul>
        <li><a href="/quote">Get a Quote</a></li>
        <li><a href="/pricing#estimate">Instant estimate</a></li>
        <li><a href="/reviews#write">Share your experience</a></li>
        <li><a href="/contact">Ask a question</a></li>
      </ul>
    </div>
    <div class="footer-contact-col">
      <h2>Contact</h2>
      <ul class="footer-contact">
        <li>${I('phone')}<span data-contact="phone"><span class="placeholder-note">[Phone number]</span></span></li>
        <li>${I('mail')}<span data-contact="email"><span class="placeholder-note">[Email address]</span></span></li>
        <li>${I('clock')}<span data-contact="hours-short"><span class="placeholder-note">[Business hours]</span></span></li>
        <li>${I('pin')}<span>Serving communities across Canada · Postal Code S7V 1R9</span></li>
      </ul>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <span>© <span data-year>2026</span> RealMovingCanada. All rights reserved.</span>
    <div class="socials" data-socials></div>
  </div>
</footer>`;

function layout(meta, body) {
  const css = ['core', 'site'];
  const scripts = meta.scripts?.length ? meta.scripts : ['site'];
  const robots = meta.noindex ? '\n  <meta name="robots" content="noindex, nofollow">' : '';
  const shell = `${sprite}\n${header()}\n<main id="main">\n${body}\n</main>\n${footer()}`;
  return `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description || ''}">${robots}
  <meta name="theme-color" content="#0E2433">
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.description || ''}">
  <meta property="og:type" content="website">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/assets/fonts/archivo-variable.woff2" as="font" type="font/woff2" crossorigin>
${css.map((c) => `  <link rel="stylesheet" href="/assets/css/${c}.css?v=${VERSION}">`).join('\n')}
</head>
<body${meta.bodyClass ? ` class="${meta.bodyClass}"` : ''}>
${shell}
${scripts.map((s) => `<script type="module" src="/assets/js/${s}.js?v=${VERSION}"></script>`).join('\n')}
</body>
</html>
`;
}

/** Maps a source filename to its built, servable path (a real directory + index.html for clean URLs). */
function outputPathFor(file, meta) {
  if (meta.output) return meta.output;
  if (file === 'index.html') return 'index.html';
  return `${file.replace(/\.html$/, '')}/index.html`;
}

let count = 0;
for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith('.html')).sort()) {
  const raw = fs.readFileSync(path.join(SRC, file), 'utf8');
  const m = raw.match(/^<!--meta\s+([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`${file}: missing <!--meta {...}--> header`);
  const meta = JSON.parse(m[1]);
  const body = raw.slice(m[0].length).replace(/\{\{icon:([\w-]+)(?::([\w\s-]+))?\}\}/g, (_, n, c) => I(n, c || 'i'));
  const html = layout(meta, body);

  const outRel = outputPathFor(file, meta);
  const out = path.join(OUT, outRel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  count++;

  // The homepage is also reachable at the clean "/home" route.
  if (file === 'index.html') {
    const homeOut = path.join(OUT, 'home', 'index.html');
    fs.mkdirSync(path.dirname(homeOut), { recursive: true });
    fs.writeFileSync(homeOut, html);
    count++;
  }
}
console.log(`[build] wrote ${count} pages`);
