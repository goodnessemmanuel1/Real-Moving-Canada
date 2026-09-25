# RealMovingCanada — Movers You Can Trust

The public marketing site for RealMovingCanada: home, about, services, service
areas, pricing, reviews, contact and a quote request form, built as static
HTML with a shared vanilla-JS design system and clean (extension-less) URL
routing. There is no login/signup, admin panel or customer account area — the
only conversion action on the site is **Get a Quote**.

## Running it locally

```
npm run build:pages   # regenerates public/ from web-sources/pages/
npm start              # serves public/ at http://localhost:3000 with clean routing
```

or both at once: `npm run dev`.

`server.js` is a zero-dependency Node static file server that resolves
`/about` to `public/about/index.html` (the same convention Netlify, Vercel,
GitHub Pages and nginx use for pretty URLs), and falls back to `public/404.html`
for anything unmatched — so a hard refresh on any route always returns a real
page. Any other static host that serves a directory's `index.html` for its
own path works the same way, since every route is already a real directory
in `public/`.

## What's in here

```
public/                  ← the BUILT, servable website
  index.html               "/" — the homepage
  home/index.html          "/home" — same homepage, also reachable here
  about/, services/, service-areas/, pricing/, reviews/, contact/, quote/
                            one directory + index.html per route (clean URLs,
                            no .html extensions)
  404.html                  served for any unmatched route
  assets/css/                core.css (design tokens/components), site.css (site)
  assets/js/                  core/ (api client, UI helpers, reference data,
                              Formspree integration), components/ (location
                              fields, estimate calculator, cards, carousel),
                              pages/ (one script per page), site.js
  assets/img/                 placeholder logo (SVG) + favicon
  assets/fonts/                self-hosted Archivo variable font

web-sources/              ← EDITABLE page templates + the page builder
  pages/*.html               one source file per page (each starts with
                              <!--meta {...}--> for title/description/scripts;
                              "output" overrides the built path — used by
                              404.html to stay at the server root)
  scripts/build-pages.js     wraps each page in the shared header/footer/icon
                              sprite and writes it into public/ as a clean-URL
                              directory (npm run build:pages)

server.js                  zero-dependency static file server (see above)
```

To change a page's content, edit the matching file in `web-sources/pages/`
and run `npm run build:pages`. Assets under `public/assets/` are edited
directly — they aren't templated by the build script.

## How pages fetch data

Every page's JS module calls a small REST client (`assets/js/core/api.js`)
against `/api/...` routes — e.g. the instant estimate calculator posts to
`/api/public/estimate`, and the services/reviews/service-area lists read from
`/api/public/...`. None of that data is hard-coded into the HTML.

**There's no backend wired up yet**, so those calls 404 and every page falls
back to built-in content (`assets/js/core/data.js`) so the site still looks
complete. Once a backend exists, pointing it at the same `/api/public/...`
routes is all that's needed — no frontend changes required.

## Forms

The quote, contact and review forms all post through one place —
`submitToFormspree()` in `assets/js/core/formspree.js`. Set
`FORMSPREE_ENDPOINT` there (a URL from https://formspree.io) to start
receiving submissions by email; until then, submitting a form shows an honest
"this form isn't connected yet" message rather than a fake success screen.

## Design system

- Colours, type, spacing and component styles live in `assets/css/core.css`
  as CSS custom properties — change `--ink` / `--red` / `--paper` etc. there
  to re-theme the whole site.
- The logo is a placeholder wordmark (`assets/img/logo.svg` and
  `logo-light.svg`, plus `favicon.svg`) — swap these for the real
  RealMovingCanada logo whenever it's ready; every page references the same
  three files.
- Contact details (phone, email, hours, social links) show as clearly marked
  placeholders until real values are wired up through `/api/public/settings`
  — nothing is invented.
