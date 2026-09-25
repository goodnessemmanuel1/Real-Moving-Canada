import '../site.js';
import { $, esc } from '../core/ui.js';
import { loadAreas } from '../core/catalog.js';
import { PROVINCES, REGION_ORDER } from '../core/data.js';
import { tileMap } from '../components/cards.js';

loadAreas().then((areas) => {
  const byCode = Object.fromEntries(areas.map((a) => [a.code, a]));
  const all = PROVINCES.map((p) => ({ ...p, ...(byCode[p.code] || {}), isActive: !!byCode[p.code] && byCode[p.code].isActive !== false }));
  $('[data-tile-map]').innerHTML = tileMap(all);
  const active = all.filter((p) => p.isActive);
  $('[data-regions]').innerHTML = REGION_ORDER.map((region) => {
    const list = active.filter((p) => p.region === region);
    if (!list.length) return '';
    return `<div class="region-group"><h2>${esc(region)}</h2><div class="province-grid">${list.map((p) => `
      <article class="province-card" id="${p.code.toLowerCase()}">
        <header><span class="code">${p.code}</span><h3>${esc(p.name)}</h3></header>
        <p>${esc(p.note || `Local and long-distance moves to, from and within ${p.name}.`)}</p>
        ${p.cities?.length ? `<ul class="city-list" aria-label="Communities served">${p.cities.map((c) => `<li>${esc(c.name)}</li>`).join('')}</ul>` : ''}
      </article>`).join('')}</div></div>`;
  }).join('') || '<p class="empty">Service areas are being updated. Please contact us about your move.</p>';
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
});
