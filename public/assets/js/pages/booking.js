import '../site.js';
import { $, esc, icon, handleForm, todayIso, place } from '../core/ui.js';
import { loadOptions, optionTags, labelFor } from '../core/options.js';
import { locationFields, wireLocations } from '../components/location.js';
import { submitToFormspree } from '../core/formspree.js';

const root = $('[data-booking-root]');
const notConfirmed = `<div class="notice warn">${icon('alert')}<div><strong>This is a booking request, not a confirmed booking.</strong>Your move is confirmed only once a RealMovingCanada representative reviews availability and contacts you to confirm the date and time.</div></div>`;

(async () => {
  const opts = await loadOptions();

  root.innerHTML = `<div class="form-page">
    <form class="card card-pad" novalidate>
      <div class="form-alert" role="alert"></div>
      <fieldset><legend>Your contact details</legend>
        <div class="form-grid" style="--cols:3">
          <div class="field"><label for="b-name">Full name</label><input id="b-name" name="customerName" autocomplete="name" required maxlength="100"></div>
          <div class="field"><label for="b-email">Email</label><input id="b-email" name="customerEmail" type="email" autocomplete="email" required></div>
          <div class="field"><label for="b-phone">Best phone number</label><input id="b-phone" name="contactPhone" type="tel" autocomplete="tel" required maxlength="30"></div>
        </div></fieldset>
      <fieldset><legend>Preferred date &amp; time</legend>
        <div class="form-grid" style="--cols:2">
          <div class="field"><label for="b-date">Preferred moving date</label><input id="b-date" name="preferredDate" type="date" min="${todayIso()}" required></div>
          <div class="field"><label for="b-time">Preferred time</label><select id="b-time" name="preferredTime" required>${optionTags(opts.timeWindows, 'morning')}</select></div>
        </div></fieldset>
      <fieldset><legend>Moving from</legend>${locationFields('origin', opts, { withAddress: true })}</fieldset>
      <fieldset><legend>Moving to</legend>${locationFields('destination', opts, { withAddress: true })}</fieldset>
      <fieldset><legend>Property information</legend>
        <div class="form-grid" style="--cols:3">
          <div class="field"><label for="b-type">Move type</label><select id="b-type" name="moveType" required>${optionTags(opts.moveTypes, 'residential')}</select></div>
          <div class="field"><label for="b-ptype">Property type</label><select id="b-ptype" name="propertyType" required>${optionTags(opts.propertyTypes, '', { placeholder: 'Select…' })}</select></div>
          <div class="field"><label for="b-size">Property size</label><select id="b-size" name="propertySize" required>${optionTags(opts.propertySizes, '', { placeholder: 'Select…' })}</select></div>
          <div class="field span-all"><label for="b-access">Access details <span class="opt">(optional)</span></label><input id="b-access" name="accessDetails" maxlength="500" placeholder="e.g. 3rd floor with elevator; street parking only at destination"></div>
        </div>
        <p class="label" style="margin:1.3rem 0 .6rem">Services <span class="opt">(optional)</span></p>
        <div class="chips" data-field="services">${opts.services.map((s) => `<label class="chip"><input type="checkbox" name="services" value="${s.value}"><span>${esc(s.label)}</span></label>`).join('')}</div>
      </fieldset>
      <fieldset><legend>Notes</legend>
        <div class="field"><label for="b-notes">Anything else we should know? <span class="opt">(optional)</span></label><textarea id="b-notes" name="notes" rows="4" maxlength="2000"></textarea></div>
      </fieldset>
      <label class="check" style="margin-top:1.6rem" data-field="ack"><input type="checkbox" name="ack" data-bool required> I understand this is a request and my booking is not confirmed until RealMovingCanada contacts me.</label>
      <div class="hp" aria-hidden="true"><label for="b-website">Leave this field empty</label><input id="b-website" name="_gotcha" tabindex="-1" autocomplete="off"></div>
      <div style="margin-top:1.4rem"><button class="btn btn-primary btn-lg" type="submit">Submit booking request</button></div>
    </form>
    <aside class="form-side">${notConfirmed}</aside>
  </div>`;

  const form = $('form', root);
  const moveType = form.elements.moveType;
  wireLocations(form, opts, () => {
    const intl = [form.elements['origin.province'].value, form.elements['destination.province'].value].includes('INTL');
    if (intl) moveType.value = 'international';
    else if (moveType.value === 'international') moveType.value = 'residential';
  });

  handleForm(form, (data) => {
    if (!data.ack) { const err = new Error('Please confirm you understand this is a booking request.'); err.fields = { ack: 'Please tick this box to continue.' }; throw err; }
    return submitToFormspree({
      'Full name': data.customerName,
      'Email': data.customerEmail,
      'Phone': data.contactPhone,
      'Preferred moving date': data.preferredDate,
      'Preferred time': labelFor(opts.timeWindows, data.preferredTime),
      'Moving from': place(data.origin) + (data.origin?.address ? ` (${data.origin.address})` : ''),
      'Moving to': place(data.destination) + (data.destination?.address ? ` (${data.destination.address})` : ''),
      'Move type': labelFor(opts.moveTypes, data.moveType),
      'Property type': labelFor(opts.propertyTypes, data.propertyType),
      'Property size': labelFor(opts.propertySizes, data.propertySize),
      'Access details': data.accessDetails || '—',
      'Services requested': (data.services || []).map((v) => labelFor(opts.services, v)).join(', ') || '—',
      'Notes': data.notes || '—',
      _replyto: data.customerEmail,
      _gotcha: data._gotcha,
    }, { subject: `New booking request — ${data.customerName}` }).then(() => data);
  }, {
    onSuccess: (data) => {
      root.innerHTML = `<div class="form-page"><div class="card success-panel">
        <div class="check-mark">${icon('check')}</div>
        <h2>Thanks, ${esc(data.customerName.split(' ')[0])} — your booking request is in</h2>
        <p class="lead" style="max-width:480px;margin:0 auto">Thanks for contacting RealMovingCanada. We’ve received your booking request and will get back to you shortly to confirm your date.</p>
        <p style="margin:1rem auto 0;max-width:520px">Preferred date: ${esc(data.preferredDate)} · ${esc(labelFor(opts.timeWindows, data.preferredTime))}</p>
        <a class="btn btn-primary" style="margin-top:1.2rem" href="/">Back to home</a>
      </div><aside class="form-side">${notConfirmed}</aside></div>`;
      scrollTo({ top: 0, behavior: 'smooth' });
    },
  });
})();
