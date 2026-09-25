/** Runs on every public page: header, navigation state, account link, site settings, images, reveal. */
import { get } from './core/api.js';
import { $, $$, esc, icon, imageFallbacks } from './core/ui.js';

document.documentElement.classList.add('js');

// Header shadow on scroll
const header = $('.site-header');
const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
addEventListener('scroll', onScroll, { passive: true });

// Keep --header-h in sync with the header's real (animated) height, so the
// mobile menu panel — which is positioned below it — never drifts out of
// alignment when the header condenses on scroll.
if (header) {
  const syncHeaderHeight = () => document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
  syncHeaderHeight();
  if ('ResizeObserver' in window) new ResizeObserver(syncHeaderHeight).observe(header);
  else addEventListener('resize', syncHeaderHeight);
}

// Mobile navigation
const toggle = $('.menu-toggle');
const nav = $('#site-nav');
function setMenu(open) {
  nav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  toggle.innerHTML = icon(open ? 'x' : 'menu');
}
toggle?.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav?.classList.contains('open')) { setMenu(false); toggle.focus(); } });

// Current page in navigation — compare by filename so this works whether
// the page was reached via a clean server route ("/about") or a relative
// file link ("about.html" / "../about.html", e.g. when opened from disk).
const pageKey = (p) => {
  const last = p.split('#')[0].split('?')[0].replace(/\/+$/, '').split('/').pop() || 'index';
  return last.replace(/\.html$/, '') || 'index';
};
const here = pageKey(location.pathname);
$$('#site-nav > a').forEach((a) => { if (pageKey(a.getAttribute('href')) === here) a.setAttribute('aria-current', 'page'); });

// Year
$$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

// Site settings (contact info, hours, socials, logo, homepage text)
const SOCIAL_LABELS = { facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn', x: 'X', youtube: 'YouTube', tiktok: 'TikTok' };
export const settingsReady = get('/public/settings').then((d) => d.settings).catch(() => null);

settingsReady.then((s) => {
  if (!s) return;
  const pick = (path) => path.split('.').reduce((o, k) => o?.[k], s);
  $$('[data-setting]').forEach((el) => { const v = pick(el.dataset.setting); if (v) el.textContent = v; });

  if (s.company?.logoUrl && !s.company.logoUrl.endsWith('/assets/img/logo.svg')) {
    $$('[data-logo], [data-logo-light]').forEach((img) => { img.src = s.company.logoUrl; img.removeAttribute('width'); img.removeAttribute('height'); });
  }
  if (s.homepage?.heroImageUrl) { const hero = $('[data-hero-img]'); if (hero) hero.src = s.homepage.heroImageUrl; }
  if (Array.isArray(s.homepage?.trust) && s.homepage.trust.length) {
    const icons = ['truck', 'map', 'file', 'shield', 'calendar', 'headset'];
    const ul = $('[data-trust]');
    if (ul) ul.innerHTML = s.homepage.trust.slice(0, 4).map((t, i) => `<li>${icon(icons[i])}<span>${esc(t)}</span></li>`).join('');
  }

  const c = s.contact || {};
  const tel = (p) => `tel:${p.replace(/[^\d+]/g, '')}`;
  if (c.phone) {
    $$('[data-contact="phone"]').forEach((el) => { el.innerHTML = `<a href="${tel(c.phone)}">${esc(c.phone)}</a>`; });
    $$('[data-contact="phone-link"]').forEach((el) => { el.innerHTML = `<a href="${tel(c.phone)}">${esc(c.phone)}</a>`; });
  }
  if (c.email) {
    $$('[data-contact="email"], [data-contact="email-link"]').forEach((el) => { el.innerHTML = `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`; });
  }
  const rows = s.hours?.rows || [];
  if (rows.length) {
    $$('[data-contact="hours-short"]').forEach((el) => { el.textContent = rows.map((r) => `${r.label}: ${r.hours}`).join(' · '); });
    $$('[data-contact="hours"]').forEach((el) => { el.innerHTML = `<dl class="hours">${rows.map((r) => `<dt>${esc(r.label)}</dt><dd>${esc(r.hours)}</dd>`).join('')}</dl>`; });
  }
  const socials = Object.entries(s.social || {}).filter(([, v]) => v);
  if (socials.length) {
    $$('[data-socials]').forEach((el) => {
      el.innerHTML = socials.map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener noreferrer">${SOCIAL_LABELS[k] || k}</a>`).join('');
    });
  }
});

imageFallbacks();

// Gentle reveal on scroll
const io = 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches
  ? new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' })
  : null;
export function observeReveals(root = document) {
  $$('.reveal:not(.in)', root).forEach((el) => (io ? io.observe(el) : el.classList.add('in')));
}
observeReveals();
