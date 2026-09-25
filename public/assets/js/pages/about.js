import '../site.js';
import { $, esc } from '../core/ui.js';
import { settingsReady } from '../site.js';

/** Paragraphs from admin-edited text; bracketed notes render as visible placeholders. */
const render = (text) => text.split(/\n{2,}/).map((p) =>
  `<p>${esc(p).replace(/\[([^\]]+)\]/g, '<span class="placeholder-note">[$1]</span>').replace(/\n/g, '<br>')}</p>`).join('');

settingsReady.then((s) => {
  if (!s?.about) return;
  if (s.about.story) $('[data-about-story]').innerHTML = render(s.about.story);
  if (s.about.mission) $('[data-about-mission]').innerHTML = render(s.about.mission).replace(/^<p>|<\/p>$/g, '');
});
