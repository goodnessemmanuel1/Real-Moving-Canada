'use strict';
/**
 * Builds the static HTML pages in /public from /web/pages.
 * Each page starts with <!--meta {json}--> and is wrapped in a shared layout
 * (header, footer, icon sprite). Run: npm run build:pages
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
  logout: '<path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/>',
  headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M19 19a3 3 0 0 1-3 3h-3"/>',
  hands: '<path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V10M10 10V5a1.5 1.5 0 0 1 3 0v5M13 10V6a1.5 1.5 0 0 1 3 0v6M16 10a1.5 1.5 0 0 1 3 0v4a7 7 0 0 1-7 7h-1a6 6 0 0 1-4.5-2l-3-3.6a1.6 1.6 0 0 1 2.4-2.1L7 14.5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M9.5 7V4h5v3M6 7l1 13h10l1-13"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.01"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4"/>',
  'external': '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
  archive: '<rect x="3" y="4" width="18" height="4.5" rx="1"/><path d="M5 8.5V20h14V8.5M10 12.5h4"/>',
  scale: '<path d="M12 4v16M5 20h14M4 8h16M7 8l-3 6a3 3 0 0 0 6 0zM17 8l-3 6a3 3 0 0 0 6 0z"/>',
  ruler: '<path d="M3 16.5 16.5 3 21 7.5 7.5 21z"/><path d="m7 12.5 2 2M10 9.5l2 2M13 6.5l2 2"/>',
};
const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">${Object.entries(ICONS)
  .map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('')}</svg>`;
const I = (name, cls = 'i') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;

// ─── Relative-path handling ───────────────────────────────────────────────
// All internal links/assets are written relative to each page's own output
// location, so the built site also works opened directly from disk (no
// server) in addition to being served by Express. `depth` is how many
// directories an output file sits below /public (e.g. admin/index.html = 1).
const PAGE_FILE_MAP = {
  '': 'index.html', about: 'about.html', services: 'services.html', 'service-areas': 'service-areas.html',
  pricing: 'pricing.html', reviews: 'reviews.html', contact: 'contact.html', quote: 'quote.html',
  booking: 'booking.html', account: 'account.html', dashboard: 'dashboard.html',
  admin: 'admin/index.html', 'admin/login': 'admin/login.html',
};
const relPrefix = (depth) => (depth === 0 ? './' : '../'.repeat(depth));

/** Rewrites root-absolute hrefs/srcs ("/about", "/assets/...") in a chunk of HTML into paths relative to a page at the given depth. */
function rewriteLocalPaths(html, depth) {
  const prefix = relPrefix(depth);
  html = html.replace(/(href|src)="\/assets\/([^"]*)"/g, (_, attr, rest) => `${attr}="${prefix}assets/${rest}"`);
  html = html.replace(/href="\/(?!\/|assets\/)([^"]*)"/g, (m, rest) => {
    const idx = rest.search(/[#?]/);
    const pathPart = idx === -1 ? rest : rest.slice(0, idx);
    const suffix = idx === -1 ? '' : rest.slice(idx);
    const target = PAGE_FILE_MAP[pathPart];
    return target ? `href="${prefix}${target}${suffix}"` : m;
  });
  return html;
}

// ─── Shared partials ──────────────────────────────────────────────────────
const header = (rel) => `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${rel('index.html')}" aria-label="RealMovingCanada — home"><img src="${rel('assets/img/logo.svg')}" alt="RealMovingCanada" width="329" height="44" data-logo></a>
    <nav class="nav" id="site-nav" aria-label="Main">
      <a href="${rel('index.html')}">Home</a>
      <a href="${rel('services.html')}">Services</a>
      <a href="${rel('service-areas.html')}">Service Areas</a>
      <a href="${rel('pricing.html')}">Pricing</a>
      <a href="${rel('reviews.html')}">Reviews</a>
      <a href="${rel('about.html')}">About</a>
      <a href="${rel('contact.html')}">Contact</a>
      <div class="nav-mobile-cta">
        <a class="btn btn-primary" href="${rel('quote.html')}">Get a Free Moving Quote</a>
        <a class="btn btn-outline" href="${rel('booking.html')}">Request a Booking</a>
      </div>
    </nav>
    <div class="header-actions">
      <a class="account-link" href="${rel('account.html')}" data-account-link>${I('user')}<span>Sign in</span></a>
      <a class="btn btn-primary btn-sm btn-quote" href="${rel('quote.html')}">Get a quote</a>
      <button class="icon-btn menu-toggle" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="Open menu">${I('menu')}</button>
    </div>
  </div>
</header>`;

const footer = (rel) => `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <img src="${rel('assets/img/logo-light.svg')}" alt="RealMovingCanada" width="329" height="44" data-logo-light>
      <p>Residential, commercial, long-distance and international moving services — planned carefully and communicated clearly, across Canada.</p>
    </div>
    <div>
      <h2>Services</h2>
      <ul>
        <li><a href="${rel('services.html')}#residential-moving">Residential moving</a></li>
        <li><a href="${rel('services.html')}#commercial-office-moving">Commercial &amp; office</a></li>
        <li><a href="${rel('services.html')}#long-distance-moving">Long-distance</a></li>
        <li><a href="${rel('services.html')}#international-moving">International</a></li>
        <li><a href="${rel('services.html')}#packing-unpacking">Packing &amp; unpacking</a></li>
        <li><a href="${rel('services.html')}#storage">Storage</a></li>
      </ul>
    </div>
    <div>
      <h2>Company</h2>
      <ul>
        <li><a href="${rel('about.html')}">About us</a></li>
        <li><a href="${rel('service-areas.html')}">Service areas</a></li>
        <li><a href="${rel('pricing.html')}">Pricing</a></li>
        <li><a href="${rel('reviews.html')}">Reviews</a></li>
        <li><a href="${rel('contact.html')}">Contact</a></li>
      </ul>
    </div>
    <div>
      <h2>Customers</h2>
      <ul>
        <li><a href="${rel('quote.html')}">Get a quote</a></li>
        <li><a href="${rel('booking.html')}">Request a booking</a></li>
        <li><a href="${rel('account.html')}">Sign in or register</a></li>
        <li><a href="${rel('dashboard.html')}">My dashboard</a></li>
      </ul>
    </div>
    <div class="footer-contact-col">
      <h2>Contact</h2>
      <ul class="footer-contact">
        <li>${I('phone')}<span data-contact="phone"><span class="placeholder-note">[Phone number]</span></span></li>
        <li>${I('mail')}<span data-contact="email"><span class="placeholder-note">[Email address]</span></span></li>
        <li>${I('clock')}<span data-contact="hours-short"><span class="placeholder-note">[Business hours]</span></span></li>
        <li>${I('pin')}<span>Serving communities across Canada</span></li>
      </ul>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <span>© <span data-year>2026</span> RealMovingCanada. All rights reserved.</span>
    <div class="socials" data-socials></div>
  </div>
</footer>`;

function layout(meta, body, depth) {
  const rel = (target) => relPrefix(depth) + target;
  const css = meta.layout === 'app' ? ['core', 'app'] : meta.layout === 'site+app' ? ['core', 'site', 'app'] : ['core', 'site'];
  // Page scripts import site.js themselves, so each page has a single module entry point.
  const scripts = meta.scripts?.length ? meta.scripts : meta.layout === 'app' ? [] : ['site'];
  const robots = meta.noindex ? '\n  <meta name="robots" content="noindex, nofollow">' : '';
  const shell = meta.layout === 'app'
    ? `${sprite}\n${body}`
    : `${sprite}\n${header(rel)}\n<main id="main">\n${body}\n</main>\n${footer(rel)}`;
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
  <link rel="icon" href="${rel('assets/img/favicon.svg')}" type="image/svg+xml">
  <link rel="preload" href="${rel('assets/fonts/archivo-variable.woff2')}" as="font" type="font/woff2" crossorigin>
${css.map((c) => `  <link rel="stylesheet" href="${rel(`assets/css/${c}.css?v=${VERSION}`)}">`).join('\n')}
</head>
<body${meta.bodyClass ? ` class="${meta.bodyClass}"` : ''}>
${shell}
${scripts.map((s) => `<script type="module" src="${rel(`assets/js/${s}.js?v=${VERSION}`)}"></script>`).join('\n')}
</body>
</html>
`;
}

let count = 0;
for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith('.html')).sort()) {
  const raw = fs.readFileSync(path.join(SRC, file), 'utf8');
  const m = raw.match(/^<!--meta\s+([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`${file}: missing <!--meta {...}--> header`);
  const meta = JSON.parse(m[1]);
  const outRel = meta.output || file;
  const depth = (outRel.match(/\//g) || []).length;
  const body = rewriteLocalPaths(
    raw.slice(m[0].length).replace(/\{\{icon:([\w-]+)(?::([\w\s-]+))?\}\}/g, (_, n, c) => I(n, c || 'i')),
    depth
  );
  const out = path.join(OUT, outRel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, layout(meta, body, depth));
  count++;
}
console.log(`[build] wrote ${count} pages`);
