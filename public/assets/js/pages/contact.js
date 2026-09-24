import '../site.js';
import { $, esc, handleForm } from '../core/ui.js';
import { submitToFormspree } from '../core/formspree.js';

const form = $('#contact-form');

handleForm(form, (data) => submitToFormspree({
  'Name': data.name,
  'Email': data.email,
  'Phone': data.phone || '—',
  'Subject': data.subject,
  'Message': data.message,
  _replyto: data.email,
  _gotcha: data._gotcha,
}, { subject: `New contact message — ${data.subject}` }).then(() => data), {
  onSuccess: (data) => {
    form.innerHTML = `<div class="success-panel"><div class="check-mark"><svg class="i"><use href="#i-check"></use></svg></div>
      <h2>Message sent</h2><p class="lead">Thanks for contacting RealMovingCanada, ${esc(data.name.split(' ')[0])} — we’ve received your message and will reply to ${esc(data.email)} shortly.</p>
      <a class="btn btn-outline" href="/">Back to home</a></div>`;
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },
});
