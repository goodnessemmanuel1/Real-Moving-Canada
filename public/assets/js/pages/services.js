import '../site.js';
import { $, esc, icon, imageFallbacks } from '../core/ui.js';
import { loadServices } from '../core/catalog.js';
import { initCarousel } from '../components/carousel.js';
import { observeReveals } from '../site.js';

const paragraphs = (t) => String(t || '').split(/\n{2,}/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('');

const PROCESS_STEPS = [
  { title: 'Packing', desc: 'Fragile items, kitchenware and furniture are carefully wrapped and boxed before moving day.' },
  { title: 'Loading', desc: 'Furniture and boxes are loaded securely into the truck, protected and organized for transport.' },
  { title: 'Transportation', desc: 'Your belongings travel safely to their destination, with the route and timing agreed in advance.' },
  { title: 'Unloading', desc: 'Boxes and furniture are carefully unloaded and brought into your new home or office.' },
  { title: 'Final setup', desc: 'Furniture is placed where you want it, so you can start settling in right away.' },
];

const gallery = $('.process-gallery');
if (gallery) {
  const captionText = $('[data-process-text]', gallery);
  initCarousel(gallery, {
    onChange: (i) => {
      const step = PROCESS_STEPS[i];
      if (!step || !captionText) return;
      captionText.innerHTML = `<span class="no">Step ${i + 1} of ${PROCESS_STEPS.length}</span><h3>${esc(step.title)}</h3><p>${esc(step.desc)}</p>`;
    },
  });
}

loadServices().then((list) => {
  $('[data-jump-links]').innerHTML = list.map((s) => `<a href="#${esc(s.slug)}">${esc(s.name)}</a>`).join('');
  $('[data-service-rows]').innerHTML = list.map((s) => `
    <article class="svc-row reveal" id="${esc(s.slug)}">
      <div class="media svc-row-media"><img src="${esc(s.imageUrl || '')}" alt="${esc(s.imageAlt || '')}" loading="lazy" width="1200" height="900"></div>
      <div>
        <span class="icon-badge">${icon(s.icon || 'box')}</span>
        <h2>${esc(s.name)}</h2>
        <p class="lead">${esc(s.summary)}</p>
        <div class="desc">${paragraphs(s.description)}</div>
        ${s.highlights?.length ? `<ul class="checklist">${s.highlights.map((h) => `<li>${icon('check')}${esc(h)}</li>`).join('')}</ul>` : ''}
        <div style="display:flex;gap:.75rem;flex-wrap:wrap">
          <a class="btn btn-primary" href="/quote">Get a Free Moving Quote</a>
          <a class="btn btn-outline" href="/pricing#estimate">Instant estimate</a>
        </div>
      </div>
    </article>`).join('');
  imageFallbacks($('[data-service-rows]'));
  observeReveals();
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
});
