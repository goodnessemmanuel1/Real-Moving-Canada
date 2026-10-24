# Real Moving Canada — Movers You Can Trust

Public website, five-step quote flow and customer portal for Real Moving Canada,
built with **React 19 + Vite + React Router**. The design follows the supplied
Real Moving Canada UI design (public website, quote flow, customer app desktop and
mobile, and payment states).

## Running it=

````
npm install
npm run dev       # development server at http://localhost:5173
npm run build     # production build into dist/
npm start         # serves dist/ at http://localhost:3000 (zero-dependency Node server)
```

**Vercel** — `vercel.json` builds with Vite into `dist/`, rewrites every page URL to
`index.html` (so a refresh on any route works and unknown URLs show the app's 404
page), and caches the hashed files in `/assets/` for a year while always
revalidating `index.html`, so a new deploy shows up on the next reload.

`server.js` (for running the build yourself) serves real files from `dist/` and answers every other path with
`index.html`, so a hard refresh on any route (e.g. `/services/storage`,
`/dashboard/quotes`) works and unknown URLs show the app's own 404 page. Any static
host works the same way once it is configured to fall back to `index.html`
(Netlify `_redirects`, Vercel rewrites, nginx `try_files`).

## Structure

```
src/
  main.jsx, App.jsx        entry point; BrowserRouter + ScrollToTop + AuthProvider
  routes/                  AppRoutes (all routes, lazy-loaded pages) and RequireAuth
  layouts/                 PublicLayout, QuoteLayout, AuthLayout, DashboardLayout
  pages/public|auth|dashboard/   one component per screen
  components/
    common/                Button, Icon, Logo, Badge, Notice, EmptyState, Skeleton,
                           Accordion, PageHero, SuccessPanel, ScrollToTop, …
    layout/                SiteHeader (desktop nav, services dropdown, mobile menu),
                           SiteFooter, CtaBand
    forms/                 Field, TextField, SelectField, TextareaField, Checkbox,
                           Switch, PasswordField, LocationFields, ContactForm, ReviewForm
    home/ services/ quote/ estimate/ dashboard/ auth/   feature components
  hooks/                   useScrollToTop, useForm, useAsync, useDocumentTitle, useLockBodyScroll
  services/                apiClient + one module per backend area (see below)
  constants/               company details, service catalogue, form options, navigation
  utils/                   formatting, validation, storage, calendar (.ics)
  styles/                  tokens.css (colours/type), then base, components, layout, pages,
                           quote, auth and dashboard styles
  assets/                  logo and photos (optimised WebP)
static/                    favicon files copied as-is into dist/
```

Brand colours, type and spacing live in `src/styles/tokens.css`. Business details
(phone, email, address) live in `src/constants/company.js`. Services — their text,
photos and related services — live in `src/constants/services.js`; the header menu,
footer, services pages and quote form are all generated from it.

## What talks to what

| Area | Where | Status |
| --- | --- | --- |
| Quote, contact and review forms | `services/formsService.js` → Formspree | **Live** (endpoint in `services/config.js` or `VITE_FORMSPREE_ENDPOINT`) |
| Instant estimate | `POST /api/public/estimate` | No backend yet — the page says so and offers a quote request |
| Service areas, reviews | `GET /api/public/service-areas`, `/api/public/reviews` | Falls back to built-in provinces / an empty reviews state |
| Login, sign up, password reset | `services/authService.js` → `/api/auth/*` | No backend yet — forms show "accounts aren't available yet" |
| Customer portal data | `services/portalService.js` → `/api/portal/*` | No backend yet — every page shows empty states |
| Payments | `services/paymentService.js` | No provider connected — card details are never sent anywhere |

Until accounts exist, `/dashboard` can be browsed without signing in (empty states and a sign-in prompt). Set
`VITE_REQUIRE_AUTH=true` once `/api/auth/session` works to require sign-in.

## Backend (API + MongoDB Atlas)

The API is a separate project in **[`backend/`](backend/README.md)** (Express + MongoDB
Atlas), deployed on its own at `https://api.realmovingcanada.ca`. The website calls it
at `VITE_API_BASE` with cookies; the API allows the website's origins (CORS) and is the
only thing that connects to the database. Setup, environment variables and the
go-live checklist are in [backend/README.md](backend/README.md).

```
npm run dev:api      # backend on http://localhost:4000 (needs backend/.env)
npm run dev          # website on http://localhost:5173 — /api is proxied to the backend
npm run test:api     # backend tests
```

## SEO

- `index.html` carries the default title, description, keywords, Open Graph/Twitter
  tags (with `static/og-image.jpg`) and `MovingCompany` structured data.
- Each page sets its own title, description, keywords, canonical URL and social tags
  through `useDocumentTitle()` (`src/hooks/useDocumentTitle.js`); keyword lists live in
  `src/constants/seo.js`. Service pages add `Service` + breadcrumb data, the home and
  pricing pages add FAQ data. Account and dashboard pages are `noindex`.
- `npm run build` also writes `dist/sitemap.xml` and `dist/robots.txt`
  (`scripts/generate-seo.mjs`).
- **Set `VITE_SITE_URL`** (Vercel → Settings → Environment Variables) to the real domain
  once there is one — canonical links, social previews and the sitemap all use it.
  It defaults to `https://realmovingcanada.ca`.

## Notes

- **Scroll restoration** — `hooks/useScrollToTop.js` (mounted once via
  `<ScrollToTop />`) opens every new route at the top, scrolls to `#hash` targets,
  restores the previous position on browser back/forward, and ignores query-string
  changes such as tabs.
- **Loading** — `index.html` contains a lightweight page frame that shows instantly on
  a full reload; while a page's code downloads, a skeleton shaped like that page is
  shown (`components/common/PageSkeleton.jsx`). Common pages are prefetched when the
  browser is idle (`hooks/usePrefetchRoutes.js`).
- **Old URLs** — `/home` redirects to `/`, and the previous `/services/<slug>` pages
  redirect to the closest service in the new catalogue.
- **Legacy site** — the previous static site is still in `public/` and
  `web-sources/` for reference. Nothing uses it any more (Vite's static folder is
  `static/`), so both folders can be deleted.
- **Photos** — taken from the design file. Photos showing other companies' names
  were left out, and the branding on the home hero truck was removed.
- **Privacy / Terms** — full text lives in `src/constants/legal.js` (update `LEGAL_UPDATED` when it changes). It was written for this website and should be reviewed by the company's legal adviser.
