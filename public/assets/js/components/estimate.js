import { post } from '../core/api.js';
import { esc, icon, money, handleForm, fillForm, todayIso, formToObject } from '../core/ui.js';
import { loadOptions, optionTags } from '../core/options.js';
import { locationFields, wireLocations } from './location.js';

export const DISCLAIMER = 'Your estimate is based on the information provided. Final pricing will be confirmed by a RealMovingCanada representative.';
const STORE_KEY = 'rmc:estimate-draft';

/**
 * Instant estimate calculator. All pricing is computed on the server
 * (POST /api/public/estimate) using the admin-configured pricing factors.
 */
export async function mountEstimate(el) {
  const opts = await loadOptions();
  el.innerHTML = `
  <div class="estimate-layout">
    <form class="card estimate-form" novalidate>
      <div class="form-alert" role="alert"></div>
      <fieldset><legend><span class="no">1</span> Moving from</legend>${locationFields('origin', opts)}</fieldset>
      <fieldset><legend><span class="no">2</span> Moving to</legend>${locationFields('destination', opts)}</fieldset>
      <fieldset><legend><span class="no">3</span> Your move</legend>
        <div class="form-grid">
          <div class="field"><label for="est-type">Move type</label><select id="est-type" name="moveType" required>${optionTags(opts.moveTypes, 'residential')}</select></div>
          <div class="field"><label for="est-size">Property size</label><select id="est-size" name="propertySize" required>${optionTags(opts.propertySizes, '', { placeholder: 'Select…' })}</select></div>
          <div class="field"><label for="est-date">Moving date</label><input id="est-date" type="date" name="moveDate" min="${todayIso()}" required></div>
        </div>
      </fieldset>
      <fieldset><legend><span class="no">4</span> Services you need <span class="opt small">(optional)</span></legend>
        <div class="chips" data-field="services">${opts.services.map((s) => `<label class="chip"><input type="checkbox" name="services" value="${s.value}"><span>${esc(s.label)}</span></label>`).join('')}</div>
        <div class="field" style="margin-top:1.2rem"><label for="est-notes">Additional information <span class="opt">(optional)</span></label>
          <textarea id="est-notes" name="details" maxlength="2000" rows="3" placeholder="Stairs or elevators, large or fragile items, parking, anything we should know"></textarea></div>
      </fieldset>
      <div class="estimate-actions">
        <button class="btn btn-primary btn-lg" type="submit">Calculate my estimate</button>
        <span class="small muted">Free, instant, no account needed.</span>
      </div>
    </form>
    <aside class="ticket estimate-result" aria-live="polite" data-result>${emptyResult()}</aside>
  </div>`;

  const form = el.querySelector('form');
  const result = el.querySelector('[data-result]');
  const moveType = form.elements.moveType;
  wireLocations(form, opts, () => {
    const intl = [form.elements['origin.province'].value, form.elements['destination.province'].value].includes('INTL');
    if (intl) moveType.value = 'international';
    else if (moveType.value === 'international') moveType.value = 'residential';
  });

  // Prefill from the hero route ticket (?from=ON&to=AB&size=two_bed) or a saved draft.
  const params = new URLSearchParams(location.search);
  const saved = safeParse(sessionStorage.getItem(STORE_KEY));
  if (saved) fillForm(form, saved);
  applyRoute(form, { from: params.get('from'), to: params.get('to'), size: params.get('size') });

  handleForm(form, async (data) => {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(data));
    try {
      return await post('/public/estimate', data);
    } catch {
      return { unavailable: true };
    }
  }, {
    onSuccess: (res) => {
      result.innerHTML = res.unavailable ? unavailableResult() : renderResult(res.estimate, res.disclaimer || DISCLAIMER);
      result.classList.remove('updated'); void result.offsetWidth; result.classList.add('updated');
      if (window.innerWidth < 960) result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  });

  result.addEventListener('click', (e) => {
    if (e.target.closest('[data-to-quote]')) {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(formToObject(form)));
    }
  });

  el.estimateForm = form;
  return form;
}

export function applyRoute(form, { from, to, size }) {
  const set = (name, v) => { if (v && form.elements[name]) { form.elements[name].value = v; form.elements[name].dispatchEvent(new Event('change', { bubbles: true })); } };
  set('origin.province', from);
  set('destination.province', to);
  set('propertySize', size);
}

export const getEstimateDraft = () => safeParse(sessionStorage.getItem(STORE_KEY));
function safeParse(s) { try { return s ? JSON.parse(s) : null; } catch { return null; } }

function emptyResult() {
  return `<div class="ticket-head"><h3>Your estimate</h3><span class="tag">${icon('clock')} Instant</span></div>
  <div class="ticket-body estimate-empty">
    <p style="margin:0 0 .4rem"><strong style="color:var(--ink)">Fill in your move details to see a price range.</strong></p>
    <p style="margin:0">Your estimate takes into account:</p>
    <ul><li>Distance between your locations</li><li>Property size and move type</li><li>Moving date and season</li><li>Packing, storage and other services</li></ul>
    <p class="disclaimer">${DISCLAIMER}</p>
  </div>`;
}

function unavailableResult() {
  return `<div class="ticket-head"><h3>Your estimate</h3><span class="tag">${icon('info')} Request a quote</span></div>
  <div class="ticket-body estimate-empty">
    <p style="margin:0 0 .6rem"><strong style="color:var(--ink)">We can’t calculate an instant price right now.</strong></p>
    <p>Request a free quote instead — a member of our team will review your move details and follow up with a price.</p>
    <div style="display:grid;gap:.6rem;margin-top:1.2rem">
      <a class="btn btn-primary btn-block" href="/quote" data-to-quote>Get a Quote</a>
    </div>
  </div>`;
}

function renderResult(est, disclaimer) {
  return `<div class="ticket-head"><h3>Your estimate</h3><span class="tag">${icon('check')} Calculated</span></div>
  <div class="ticket-body">
    <div class="estimate-label">Estimated Moving Cost</div>
    <div class="estimate-price">${money(est.min)} – ${money(est.max)}<span class="cur">CAD</span></div>
    <ul class="factor-list">${(est.factors || []).map((f) => `<li>${icon('check')}<span>${esc(f)}</span></li>`).join('')}</ul>
    ${est.notes?.length ? `<div class="estimate-notes">${est.notes.map(esc).join('<br>')}</div>` : ''}
    <p class="disclaimer">${esc(disclaimer)}</p>
    <div style="display:grid;gap:.6rem">
      <a class="btn btn-primary btn-block" href="/quote" data-to-quote>Get a Quote</a>
      <a class="btn btn-outline btn-block" href="/contact">Ask a question</a>
    </div>
  </div>`;
}
