import { get } from './api.js';
import { FALLBACK_OPTIONS } from './data.js';

let cache;
/** Form options (labels only — rates stay on the server). Falls back to built-in lists offline. */
export function loadOptions() {
  cache ??= get('/public/estimate/options')
    .then((o) => ({ ...FALLBACK_OPTIONS, ...o }))
    .catch(() => FALLBACK_OPTIONS);
  return cache;
}
export const optionTags = (list, selected, { placeholder } = {}) =>
  (placeholder !== undefined ? `<option value="">${placeholder}</option>` : '') +
  list.map((o) => `<option value="${o.value}"${String(selected) === String(o.value) ? ' selected' : ''}>${o.label}</option>`).join('');
export const labelFor = (list, value) => list.find((o) => o.value === value)?.label || value;
