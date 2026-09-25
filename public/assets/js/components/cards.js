import { esc, icon, stars, initials, fmtDate } from '../core/ui.js';
import { TILE_POS } from '../core/data.js';

const img = (s, cls = '') => `<div class="media ${cls}"><img src="${esc(s.imageUrl || '')}" alt="${esc(s.imageAlt || '')}" loading="lazy" decoding="async" width="1200" height="800"></div>`;

export function featureCard(s) {
  return `<article class="svc-feature reveal">
    ${img(s)}
    <div class="body">
      <h3>${esc(s.name)}</h3>
      <p class="muted">${esc(s.summary)}</p>
      <ul>${(s.highlights || []).slice(0, 3).map((h) => `<li>${icon('check')}${esc(h)}</li>`).join('')}</ul>
      <a class="link" href="/services#${esc(s.slug)}">Learn more<span class="sr-only"> about ${esc(s.name)}</span></a>
    </div>
  </article>`;
}

export function compactCard(s) {
  return `<a class="svc-card" href="/services#${esc(s.slug)}">
    <div class="thumb-wrap">${img(s, 'thumb')}<span class="thumb-icon">${icon(s.icon || 'box')}</span></div>
    <h3>${esc(s.name)}</h3>
    <p>${esc(s.summary)}</p>
    <span class="more">Learn more ${icon('arrow-right')}</span>
  </a>`;
}

export function servicesBlock(list) {
  const featured = list.filter((s) => s.isFeatured).slice(0, 2);
  const rest = list.filter((s) => !featured.includes(s));
  return `${featured.length ? `<div class="svc-features">${featured.map(featureCard).join('')}</div>` : ''}
    <div class="svc-grid reveal">${rest.map(compactCard).join('')}</div>`;
}

/** Homepage teaser: one card per top-level service category, linking into its section on /services. */
export function categoryGrid(categories) {
  return `<div class="svc-cat-grid">${categories.map((c) => `
    <a class="svc-cat-card reveal" href="/services#${esc(c.slug)}">
      ${img(c)}
      <div class="body">
        <span class="thumb-icon">${icon(c.icon || 'box')}</span>
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.summary)}</p>
        <span class="more">Explore ${icon('arrow-right')}</span>
      </div>
    </a>`).join('')}</div>`;
}

export function tileMap(provinces, { light = false, hrefBase = '/service-areas' } = {}) {
  return `<nav class="tile-map${light ? ' light' : ''}" aria-label="Provinces and territories">${provinces.map((p) => {
    const [c, r] = TILE_POS[p.code] || [1, 1];
    const active = p.isActive !== false;
    return `<a class="tile${active ? ' active' : ''}" href="${hrefBase}#${p.code.toLowerCase()}" style="--c:${c};--r:${r}" title="${esc(p.name)}${active ? '' : ' (not currently listed)'}">
      <strong>${p.code}</strong><span>${esc(p.name)}</span></a>`;
  }).join('')}</nav>`;
}

export function reviewCard(r) {
  return `<article class="review-card">
    ${stars(r.rating)}
    ${r.title ? `<h3>${esc(r.title)}</h3>` : ''}
    <blockquote>${esc(r.body).replace(/\n/g, '<br>')}</blockquote>
    <footer><span class="avatar" aria-hidden="true">${esc(initials(r.displayName))}</span>
      <div><strong>${esc(r.displayName)}</strong><div class="tiny muted">${fmtDate(r.date)}</div></div></footer>
  </article>`;
}

export function reviewInvite() {
  return `<div class="review-invite">
    ${icon('message')}
    <div><h3>Moved with RealMovingCanada?</h3><p>Customer reviews appear here once they’ve been read and approved by our team. We’d love to hear about your move.</p></div>
    <a class="btn btn-dark" href="/reviews#write">Share your experience</a>
  </div>`;
}
