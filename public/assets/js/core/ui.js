/** Shared DOM, formatting and feedback helpers. */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
export const icon = (name, cls = 'i') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;

// ─── Formatting ───────────────────────────────────────────────────────────
const moneyFmt = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
export const money = (n) => (n == null || n === '' ? '—' : moneyFmt.format(Number(n)));
const toDate = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T12:00:00`) : new Date(v));
export const fmtDate = (v, opts = {}) => (v ? toDate(v).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', ...opts }) : '—');
export const todayIso = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
export const initials = (name) => String(name || '?').trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
export const place = (loc) => (!loc ? '—' : loc.province === 'INTL' ? `${loc.city}, ${loc.country || 'Outside Canada'}` : `${loc.city}, ${loc.province}`);
export function stars(n) {
  let out = `<span class="stars" role="img" aria-label="${Number(n)} out of 5 stars">`;
  for (let i = 1; i <= 5; i++) out += icon('star', `i i-fill${i > n ? ' off' : ''}`);
  return `${out}</span>`;
}

// ─── Toasts ───────────────────────────────────────────────────────────────
export function toast(message, type = 'ok') {
  let host = $('.toasts');
  if (!host) { host = document.createElement('div'); host.className = 'toasts'; host.setAttribute('role', 'status'); host.setAttribute('aria-live', 'polite'); document.body.append(host); }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `${icon(type === 'error' ? 'alert' : 'check')}<div>${esc(message)}</div>`;
  host.append(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 320); }, 4200);
}

// ─── Forms ────────────────────────────────────────────────────────────────
/** Serialise a form into a nested object: "origin.city" → { origin: { city } }, repeated checkboxes → arrays. */
export function formToObject(form) {
  const out = {};
  const set = (path, value) => {
    const keys = path.split('.');
    let o = out;
    keys.slice(0, -1).forEach((k) => { o[k] ??= {}; o = o[k]; });
    o[keys.at(-1)] = value;
  };
  const get = (path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), out);
  for (const el of form.elements) {
    if (!el.name || el.disabled || el.type === 'submit' || el.type === 'button' || el.type === 'file') continue;
    if (el.closest('[hidden]') && !el.dataset.keep) continue;
    if (el.type === 'checkbox') {
      if (el.dataset.bool !== undefined) { set(el.name, el.checked); continue; }
      if (!Array.isArray(get(el.name))) set(el.name, []);
      if (el.checked) get(el.name).push(el.value);
      continue;
    }
    if (el.type === 'radio') { if (el.checked) set(el.name, el.value); continue; }
    if (el.type === 'number') { set(el.name, el.value === '' ? undefined : Number(el.value)); continue; }
    set(el.name, el.value);
  }
  return out;
}

export function clearErrors(form) {
  $$('.field-error', form).forEach((e) => e.remove());
  $$('.has-error', form).forEach((e) => e.classList.remove('has-error'));
  $$('[aria-invalid]', form).forEach((e) => e.removeAttribute('aria-invalid'));
  const alert = $('.form-alert', form);
  if (alert) { alert.textContent = ''; alert.classList.remove('ok'); }
}

export function showErrors(form, fields = {}, message) {
  clearErrors(form);
  let first = null;
  const unmatched = [];
  for (const [name, msg] of Object.entries(fields)) {
    const input = form.querySelector(`[name="${CSS.escape(name)}"]`);
    const field = input?.closest('.field') || form.querySelector(`[data-field="${CSS.escape(name)}"]`);
    if (!field || field.closest('[hidden]')) { unmatched.push(msg); continue; }
    field.classList.add('has-error');
    input?.setAttribute('aria-invalid', 'true');
    const p = document.createElement('p');
    p.className = 'field-error';
    p.id = `err-${name.replace(/\W/g, '-')}`;
    p.textContent = msg;
    field.append(p);
    input?.setAttribute('aria-describedby', p.id);
    first ??= input || field;
  }
  const alert = $('.form-alert', form);
  const text = [message, ...unmatched].filter(Boolean).join(' ');
  if (alert && text) alert.textContent = text;
  else if (text && !first) toast(text, 'error');
  if (first) { first.focus?.({ preventScroll: true }); first.scrollIntoView?.({ behavior: 'smooth', block: 'center' }); }
}

/** Wire a form: busy state, API errors mapped to fields, success callback. */
export function handleForm(form, submit, { onSuccess } = {}) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    if (btn?.getAttribute('aria-busy') === 'true') return;
    clearErrors(form);
    btn?.setAttribute('aria-busy', 'true');
    try {
      const result = await submit(formToObject(form), form);
      await onSuccess?.(result, form);
    } catch (err) {
      showErrors(form, err.fields || {}, err.message);
    } finally {
      btn?.removeAttribute('aria-busy');
    }
  });
}

export function fillForm(form, data, prefix = '') {
  for (const [k, v] of Object.entries(data || {})) {
    const name = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) { fillForm(form, v, name); continue; }
    const els = form.querySelectorAll(`[name="${CSS.escape(name)}"]`);
    els.forEach((el) => {
      if (el.type === 'checkbox') el.checked = Array.isArray(v) ? v.includes(el.value) : !!v;
      else if (el.type === 'radio') el.checked = el.value === String(v);
      else if (v != null) el.value = v;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
}

/** Photos degrade to a branded panel when they can't load. */
export function imageFallbacks(root = document) {
  $$('.media img', root).forEach((img) => {
    const fail = () => img.closest('.media')?.classList.add('img-failed');
    if (img.complete && img.naturalWidth === 0 && img.src) fail();
    img.addEventListener('error', fail, { once: true });
  });
}

export function pager(p, onGo) {
  if (!p || p.totalPages <= 1) return '';
  const id = `pg${Math.random().toString(36).slice(2, 8)}`;
  queueMicrotask(() => {
    const el = document.getElementById(id);
    el?.addEventListener('click', (e) => { const b = e.target.closest('[data-page]'); if (b) onGo(Number(b.dataset.page)); });
  });
  return `<div class="pager" id="${id}"><span>Page ${p.page} of ${p.totalPages} · ${p.total} total</span><div class="btns">
    <button class="btn btn-outline btn-sm" data-page="${p.page - 1}" ${p.page <= 1 ? 'disabled' : ''}>Previous</button>
    <button class="btn btn-outline btn-sm" data-page="${p.page + 1}" ${p.page >= p.totalPages ? 'disabled' : ''}>Next</button></div></div>`;
}

export const debounce = (fn, ms = 300) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
