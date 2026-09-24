/**
 * Lightweight, dependency-free carousel used by the hero slideshow and the
 * "Moving Done Right" process gallery. Expects markup shaped like:
 *   <div class="carousel" data-carousel data-interval="6000">
 *     <div class="carousel-track">
 *       <div class="carousel-slide">…</div> …
 *     </div>
 *     <button class="carousel-arrow prev" data-carousel-prev>…</button>
 *     <button class="carousel-arrow next" data-carousel-next>…</button>
 *     <div class="carousel-dots" data-carousel-dots></div>
 *   </div>
 */
const REDUCE_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initCarousel(root, { onChange } = {}) {
  if (!root || root.dataset.carouselReady) return;
  root.dataset.carouselReady = '1';

  const track = root.querySelector('.carousel-track');
  const slides = [...root.querySelectorAll('.carousel-slide')];
  if (slides.length < 2) return;

  const dotsHost = root.querySelector('[data-carousel-dots]');
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');
  const interval = Number(root.dataset.interval) || 6000;
  let index = 0;
  let timer = null;

  if (dotsHost) {
    dotsHost.innerHTML = slides.map((_, i) => `<button type="button" class="carousel-dot" aria-label="Show slide ${i + 1} of ${slides.length}"></button>`).join('');
  }
  const dots = dotsHost ? [...dotsHost.children] : [];

  function render() {
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    if (track) track.setAttribute('aria-live', 'off');
    onChange?.(index);
  }

  function go(i) {
    index = (i + slides.length) % slides.length;
    render();
  }
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  function stop() { clearInterval(timer); timer = null; }
  function start() {
    if (REDUCE_MOTION || timer) return;
    timer = setInterval(next, interval);
  }

  prevBtn?.addEventListener('click', () => { prev(); stop(); start(); });
  nextBtn?.addEventListener('click', () => { next(); stop(); start(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); stop(); start(); }));

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);

  // Touch swipe
  let touchX = null;
  root.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; stop(); }, { passive: true });
  root.addEventListener('touchend', (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    touchX = null;
    start();
  }, { passive: true });

  render();
  start();
  return { go, next, prev, stop, start };
}

export function initCarousels(root = document) {
  root.querySelectorAll('[data-carousel]').forEach(initCarousel);
}
