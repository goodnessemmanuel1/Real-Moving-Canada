import { esc } from '../core/ui.js';

let uid = 0;
/** Province / city / postal (+ country for international, + optional street address). */
export function locationFields(prefix, opts, { withAddress = false, legend } = {}) {
  const id = `loc${++uid}`;
  const provinces = opts.provinces.map((p) => `<option value="${p.code}">${esc(p.name)}</option>`).join('');
  return `<div class="form-grid" data-location="${prefix}" style="--cols:3">
    ${legend ? `<p class="span-all label" style="margin:0">${esc(legend)}</p>` : ''}
    ${withAddress ? `<div class="field span-all"><label for="${id}-addr">Street address <span class="opt">(optional)</span></label>
      <input id="${id}-addr" name="${prefix}.address" autocomplete="${prefix === 'origin' ? 'section-from' : 'section-to'} street-address" maxlength="160"></div>` : ''}
    <div class="field"><label for="${id}-prov">Province or territory</label>
      <select id="${id}-prov" name="${prefix}.province" required><option value="">Select…</option>${provinces}<option value="INTL">Outside Canada</option></select></div>
    <div class="field"><label for="${id}-city">City</label>
      <input id="${id}-city" name="${prefix}.city" list="${id}-cities" required maxlength="80" autocomplete="off"><datalist id="${id}-cities"></datalist></div>
    <div class="field" data-country hidden><label for="${id}-country">Country</label>
      <input id="${id}-country" name="${prefix}.country" maxlength="60" autocomplete="country-name"></div>
    <div class="field" data-postal><label for="${id}-postal"><span data-postal-label>Postal code</span> <span class="opt">(optional)</span></label>
      <input id="${id}-postal" name="${prefix}.postalCode" maxlength="12" placeholder="A1A 1A1" autocomplete="off"></div>
  </div>`;
}

export function wireLocations(root, opts, onProvinceChange) {
  root.querySelectorAll('[data-location]').forEach((group) => {
    const select = group.querySelector('select[name$=".province"]');
    const list = group.querySelector('datalist');
    const country = group.querySelector('[data-country]');
    const postalLabel = group.querySelector('[data-postal-label]');
    const postal = group.querySelector('input[name$=".postalCode"]');
    const update = () => {
      const code = select.value;
      const intl = code === 'INTL';
      country.hidden = !intl;
      country.querySelector('input').required = intl;
      postalLabel.textContent = intl ? 'Postal / ZIP code' : 'Postal code';
      postal.placeholder = intl ? '' : 'A1A 1A1';
      list.innerHTML = (opts.citySuggestions?.[code] || []).map((c) => `<option value="${esc(c)}">`).join('');
      onProvinceChange?.();
    };
    select.addEventListener('change', update);
    postal.addEventListener('blur', () => {
      if (select.value !== 'INTL') {
        const v = postal.value.replace(/[\s-]/g, '').toUpperCase();
        if (/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(v)) postal.value = `${v.slice(0, 3)} ${v.slice(3)}`;
      }
    });
    update();
  });
}
