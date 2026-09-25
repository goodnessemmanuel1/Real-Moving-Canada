/**
 * Formspree integration point.
 *
 * Replace FORMSPREE_ENDPOINT with the real form endpoint from
 * https://formspree.io (looks like "https://formspree.io/f/xxxxxxxx") once
 * it's ready. Every public form on the site (quote, contact, reviews) posts
 * through submitToFormspree() below, so wiring up one endpoint here connects
 * all of them.
 */
export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xaenbadr';

const isConfigured = () => /^https:\/\/formspree\.io\/f\/\w+$/.test(FORMSPREE_ENDPOINT);
export const formspreeConfigured = () => isConfigured();

export class FormspreeError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.fields = fields;
  }
}

/**
 * Posts a flat object of form fields to Formspree as JSON.
 * `subject` becomes the email subject line (Formspree's `_subject` field).
 */
export async function submitToFormspree(data, { subject } = {}) {
  if (!isConfigured()) {
    throw new FormspreeError('This form isn’t connected yet. Add your Formspree endpoint in assets/js/core/formspree.js to start receiving submissions.');
  }
  const payload = { ...data };
  if (subject) payload._subject = subject;

  let res;
  try {
    res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new FormspreeError('We couldn’t reach the server. Check your connection and try again.');
  }

  if (res.ok) return true;

  let body = null;
  try { body = await res.json(); } catch { /* non-JSON error body */ }
  const fields = {};
  (body?.errors || []).forEach((e) => { if (e.field) fields[e.field] = e.message; });
  const message = body?.errors?.map((e) => e.message).filter(Boolean).join(' ')
    || 'We couldn’t send your request. Please try again, or call us directly.';
  throw new FormspreeError(message, fields);
}
