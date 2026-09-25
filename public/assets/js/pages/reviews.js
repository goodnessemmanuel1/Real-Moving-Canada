import '../site.js';
import { $, esc, icon, stars, handleForm, pager } from '../core/ui.js';
import { loadReviews } from '../core/catalog.js';
import { reviewCard } from '../components/cards.js';
import { submitToFormspree } from '../core/formspree.js';

async function showPage(page = 1) {
  const data = await loadReviews(page, 9);
  const { summary } = data;
  $('[data-summary]').innerHTML = summary.count
    ? `<div class="review-summary"><span class="score">${summary.average.toFixed(1)}</span><div>${stars(Math.round(summary.average))}<div class="small" style="color:#C9D6DF">Based on ${summary.count} published review${summary.count === 1 ? '' : 's'}</div></div></div>`
    : '';
  $('[data-review-list]').innerHTML = data.reviews.length
    ? `<div class="review-grid">${data.reviews.map(reviewCard).join('')}</div>${pager(data.pagination, (p) => { showPage(p); scrollTo({ top: 0, behavior: 'smooth' }); })}`
    : `<div class="empty">${icon('message')}<h3>No published reviews yet</h3><p>Reviews from RealMovingCanada customers will appear here once they’ve been approved.</p></div>`;
}
showPage();

const formHost = $('[data-review-form]');
formHost.innerHTML = `<form class="card card-pad" novalidate>
  <div class="form-alert" role="alert"></div>
  <div class="form-grid" style="--cols:2">
    <div class="field"><label for="rv-name">Your name</label><input id="rv-name" name="name" autocomplete="name" required maxlength="100"></div>
    <div class="field"><label for="rv-email">Email</label><input id="rv-email" name="email" type="email" autocomplete="email" required maxlength="254"></div>
  </div>
  <div class="field" data-field="rating" style="margin-top:1rem"><span class="label">Your rating</span>
    <div class="stars-input" role="radiogroup" aria-label="Rating">${[5, 4, 3, 2, 1].map((n) => `<input type="radio" name="rating" id="rate-${n}" value="${n}"><label for="rate-${n}" title="${n} star${n > 1 ? 's' : ''}">${icon('star', 'i i-fill')}<span class="sr-only">${n} star${n > 1 ? 's' : ''}</span></label>`).join('')}</div></div>
  <div class="field" style="margin-top:1rem"><label for="rv-title">Title <span class="opt">(optional)</span></label><input id="rv-title" name="title" maxlength="100"></div>
  <div class="field" style="margin-top:1rem"><label for="rv-body">Your review</label><textarea id="rv-body" name="body" rows="5" maxlength="2000" required placeholder="Tell others about your move — what went well, and what could be better."></textarea><p class="hint">Between 20 and 2,000 characters. Reviews are published after our team reads them.</p></div>
  <div class="hp" aria-hidden="true"><label for="rv-website">Leave this field empty</label><input id="rv-website" name="_gotcha" tabindex="-1" autocomplete="off"></div>
  <button class="btn btn-primary" type="submit" style="margin-top:1.2rem">Submit review</button>
</form>`;
const form = $('form', formHost);
handleForm(form, (data) => {
  if (!data.rating) { const err = new Error('Please choose a star rating.'); err.fields = { rating: 'Please choose a rating.' }; throw err; }
  return submitToFormspree({
    'Name': data.name,
    'Email': data.email,
    'Rating': `${data.rating} / 5`,
    'Title': data.title || '—',
    'Review': data.body,
    _replyto: data.email,
    _gotcha: data._gotcha,
  }, { subject: `New customer review — ${data.name}` }).then(() => data);
}, {
  onSuccess: (data) => {
    formHost.innerHTML = `<div class="card success-panel"><div class="check-mark">${icon('check')}</div><h2>Thank you, ${esc(data.name.split(' ')[0])}!</h2><p class="lead">We’ve received your review and will publish it after our team reads it.</p></div>`;
  },
});
