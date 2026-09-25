import '../site.js';
import { $, esc, icon, handleForm, fillForm, todayIso, place } from '../core/ui.js';
import { loadOptions, optionTags, labelFor } from '../core/options.js';
import { locationFields, wireLocations } from '../components/location.js';
import { getEstimateDraft, DISCLAIMER } from '../components/estimate.js';
import { submitToFormspree } from '../core/formspree.js';

const root = $('[data-quote-root]');

(async () => {
  const opts = await loadOptions();

  root.innerHTML = `<div class="form-page">
    <form class="card card-pad" novalidate>
      <div class="form-alert" role="alert"></div>
      <fieldset><legend>Your contact details</legend>
        <div class="form-grid" style="--cols:3">
          <div class="field"><label for="q-name">Full name</label><input id="q-name" name="customerName" autocomplete="name" required maxlength="100" placeholder="Jordan Smith"></div>
          <div class="field"><label for="q-email">Email</label><input id="q-email" name="customerEmail" type="email" autocomplete="email" required placeholder="jordan@email.com"></div>
          <div class="field"><label for="q-phone">Phone</label><input id="q-phone" name="customerPhone" type="tel" autocomplete="tel" required maxlength="30" placeholder="(555) 555-5555"></div>
        </div></fieldset>
      <fieldset><legend>Moving from</legend>${locationFields('origin', opts)}</fieldset>
      <fieldset><legend>Moving to</legend>${locationFields('destination', opts)}</fieldset>
      <fieldset><legend>About your move</legend>
        <div class="form-grid" style="--cols:3">
          <div class="field"><label for="q-date">Preferred moving date</label><input id="q-date" name="moveDate" type="date" min="${todayIso()}" required></div>
          <div class="field"><label for="q-type">Move type</label><select id="q-type" name="moveType" required>${optionTags(opts.moveTypes, 'residential')}</select></div>
          <div class="field"><label for="q-ptype">Property type</label><select id="q-ptype" name="propertyType" required>${optionTags(opts.propertyTypes, '', { placeholder: 'Select…' })}</select></div>
          <div class="field"><label for="q-size">Approximate move size</label><select id="q-size" name="propertySize" required>${optionTags(opts.propertySizes, '', { placeholder: 'Select…' })}</select></div>
        </div>
        <p class="label" style="margin:1.3rem 0 .6rem">Services you need <span class="opt">(optional)</span></p>
        <div class="chips" data-field="services">${opts.services.map((s) => `<label class="chip"><input type="checkbox" name="services" value="${s.value}"><span>${esc(s.label)}</span></label>`).join('')}</div>
      </fieldset>
      <fieldset><legend>Additional details</legend>
        <div class="form-grid" style="--cols:1">
          <div class="field"><label for="q-inv">Estimated inventory <span class="opt">(optional)</span></label>
            <textarea id="q-inv" name="inventory" rows="4" maxlength="3000" placeholder="e.g. 1 sofa, queen bed, dining table with 6 chairs, about 30 boxes, piano"></textarea>
            <p class="hint">A rough list of large items and the number of boxes helps us confirm an accurate price.</p></div>
          <div class="field"><label for="q-notes">Anything else we should know? <span class="opt">(optional)</span></label>
            <textarea id="q-notes" name="notes" rows="3" maxlength="2000" placeholder="Stairs, elevators, parking, fragile items, timing constraints"></textarea></div>
        </div></fieldset>
      <div class="hp" aria-hidden="true"><label for="q-website">Leave this field empty</label><input id="q-website" name="_gotcha" tabindex="-1" autocomplete="off"></div>
      <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-top:1.8rem">
        <button class="btn btn-primary btn-lg" type="submit">Submit quote request</button>
        <span class="small muted">We typically reply within one business day.</span>
      </div>
    </form>
    <aside class="form-side">
      <div class="notice">${icon('info')}<div><strong>What happens next</strong>A member of our team reviews your request and follows up by phone or email with a confirmed price and any questions about your move.</div></div>
      <div class="card card-pad"><h3 style="font-size:1.05rem">Prefer to talk it through?</h3><p class="muted small" style="margin:0 0 .9rem">Call or message us directly and we’ll help you plan your move.</p><a class="btn btn-outline btn-block" href="/contact">Contact us</a></div>
    </aside>
  </div>`;

  const form = $('form', root);
  const moveType = form.elements.moveType;
  wireLocations(form, opts, () => {
    const intl = [form.elements['origin.province'].value, form.elements['destination.province'].value].includes('INTL');
    if (intl) moveType.value = 'international';
    else if (moveType.value === 'international') moveType.value = 'residential';
  });

  // Carry over details from the instant estimate, if the visitor used it first.
  const draft = getEstimateDraft();
  if (draft) {
    fillForm(form, { origin: draft.origin, destination: draft.destination, moveType: draft.moveType, propertySize: draft.propertySize, moveDate: draft.moveDate, services: draft.services || [], notes: draft.details || '' });
  }

  handleForm(form, (data) => submitToFormspree({
    'Full name': data.customerName,
    'Email': data.customerEmail,
    'Phone': data.customerPhone,
    'Moving from': place(data.origin),
    'Moving to': place(data.destination),
    'Preferred moving date': data.moveDate,
    'Move type': labelFor(opts.moveTypes, data.moveType),
    'Property type': labelFor(opts.propertyTypes, data.propertyType),
    'Approximate move size': labelFor(opts.propertySizes, data.propertySize),
    'Services requested': (data.services || []).map((v) => labelFor(opts.services, v)).join(', ') || '—',
    'Estimated inventory': data.inventory || '—',
    'Additional notes': data.notes || '—',
    _replyto: data.customerEmail,
    _gotcha: data._gotcha,
  }, { subject: `New moving quote request — ${data.customerName}` }).then(() => data), {
    onSuccess: (data) => {
      root.innerHTML = `<div class="form-page">
        <div class="card success-panel">
          <div class="check-mark">${icon('check')}</div>
          <h2>Thanks, ${esc(data.customerName.split(' ')[0])} — your request is in</h2>
          <p class="lead" style="max-width:480px;margin:0 auto">Thanks for contacting RealMovingCanada. We’ve received your moving quote request and will get back to you shortly.</p>
          <p class="muted" style="margin-top:1rem">${esc(place(data.origin))} → ${esc(place(data.destination))} · ${esc(labelFor(opts.propertySizes, data.propertySize))}</p>
          <p class="disclaimer" style="text-align:left;max-width:520px;margin:1.2rem auto">${DISCLAIMER}</p>
          <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
            <a class="btn btn-primary" href="/pricing#estimate">See an instant price range</a>
            <a class="btn btn-outline" href="/services">Browse our services</a>
          </div>
        </div>
        <aside class="form-side"><div class="notice">${icon('mail')}<div><strong>Confirmation sent</strong>We’ve recorded a copy of your request and will reply to ${esc(data.customerEmail)}.</div></div></aside>
      </div>`;
      scrollTo({ top: 0, behavior: 'smooth' });
    },
  });
})();
