// Slide viewer for the Remo presentation: turns the stacked list of slide images into a click-through deck.
// Without JavaScript the slides simply stack down the page. Controls: prev/next buttons, a thumbnail strip,
// click or tap the slide for the next one, swipe, and the arrow / Home / End keys while the deck has focus.
(function () {
  'use strict';
  var deck = document.querySelector('[data-deck]');
  if (!deck) return;
  var list = deck.querySelector('.deck__slides');
  var slides = Array.prototype.slice.call(deck.querySelectorAll('.deck__slide'));
  var total = slides.length;
  if (!list || total < 2) return;

  var NS = 'http://www.w3.org/2000/svg', cur = 0;
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }
  function arrow(d) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('width', '16'); s.setAttribute('height', '16'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); s.appendChild(p); return s;
  }
  function button(label, d) {
    var b = el('button', 'deck__btn'); b.type = 'button'; b.setAttribute('aria-label', label); b.appendChild(arrow(d)); return b;
  }

  deck.classList.add('deck--js');
  list.tabIndex = 0;
  list.setAttribute('aria-label', 'Slides. Use the left and right arrow keys to move between them.');
  slides.forEach(function (li, i) {
    li.setAttribute('role', 'group'); li.setAttribute('aria-roledescription', 'slide');
    li.setAttribute('aria-label', (i + 1) + ' of ' + total);
  });

  // controls
  var bar = el('div', 'deck__bar');
  var prev = button('Previous slide', 'M15 5l-7 7 7 7');
  var next = button('Next slide', 'M9 5l7 7-7 7');
  var count = el('p', 'deck__count'); count.setAttribute('aria-live', 'polite');
  bar.appendChild(prev); bar.appendChild(count); bar.appendChild(next);

  var strip = el('div', 'deck__thumbs');
  var thumbs = slides.map(function (li, i) {
    var img = li.querySelector('img');
    var b = el('button', 'deck__thumb'); b.type = 'button'; b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    var t = document.createElement('img');
    t.src = img.getAttribute('data-thumb') || img.src; t.alt = ''; t.width = 280; t.height = 158; t.loading = 'lazy'; t.decoding = 'async';
    b.appendChild(t);
    b.addEventListener('click', function () { show(i, true); });
    strip.appendChild(b);
    return b;
  });
  deck.appendChild(bar); deck.appendChild(strip);

  function show(i, focusList) {
    cur = Math.max(0, Math.min(total - 1, i));
    slides.forEach(function (li, k) { li.hidden = k !== cur; });
    // warm the neighbours so the next click is instant
    [cur - 1, cur + 1].forEach(function (k) { var im = slides[k] && slides[k].querySelector('img'); if (im) im.loading = 'eager'; });
    count.textContent = (cur + 1) + ' / ' + total;
    prev.disabled = cur === 0; next.disabled = cur === total - 1;
    thumbs.forEach(function (b, k) { if (k === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    if (focusList) list.focus({ preventScroll: true });
  }
  prev.addEventListener('click', function () { show(cur - 1); });
  next.addEventListener('click', function () { show(cur + 1); });
  list.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var k = e.key, to = null;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown') to = cur + 1;
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') to = cur - 1;
    else if (k === 'Home') to = 0; else if (k === 'End') to = total - 1;
    if (to === null) return;
    e.preventDefault(); show(to);
  });

  // click for next (loops back to the start from the last slide); swipe for either direction
  var downX = null, downY = null, swiped = false;
  list.addEventListener('pointerdown', function (e) { downX = e.clientX; downY = e.clientY; swiped = false; });
  list.addEventListener('pointerup', function (e) {
    if (downX === null) return;
    var dx = e.clientX - downX, dy = e.clientY - downY; downX = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped = true; show(cur + (dx < 0 ? 1 : -1)); }
  });
  list.addEventListener('click', function () {
    if (swiped) { swiped = false; return; }
    show(cur === total - 1 ? 0 : cur + 1);
  });

  show(0);
})();
