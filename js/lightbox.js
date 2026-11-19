/* ==========================================================================
   Playground viewer. Anything marked [data-lightbox] shows an "Expand" pill on
   hover; clicking dims the page and grows the piece out of its tile, with its
   title and a short description underneath. Arrows (buttons, ← →, or a swipe)
   step through every piece on the page; Esc or the backdrop closes it.
   ========================================================================== */
(function () {
  'use strict';
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  if (!items.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate;   // no Web Animations: open instantly
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var EASE = 'cubic-bezier(.2, .8, .2, 1)';
  var ICON = {
    expand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  /* ---------- "Expand" pill ---------- */
  var pill = document.querySelector('.cursor-pill');
  if (!pill) {
    pill = document.createElement('div');
    pill.className = 'cursor-pill';
    pill.setAttribute('aria-hidden', 'true');
    document.body.appendChild(pill);
  }
  if (finePointer) items.forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      pill.innerHTML = ICON.expand + 'Expand';
      pill.style.transform = 'translate3d(' + (e.clientX + 14) + 'px,' + (e.clientY + 16) + 'px,0)';
      pill.classList.add('is-on');
    });
    el.addEventListener('pointerleave', function () { pill.classList.remove('is-on'); });
  });

  /* ---------- viewer ---------- */
  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.hidden = true;
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-labelledby', 'lb-title');
  lb.innerHTML =
    '<div class="lb__backdrop" data-lb-close></div>' +
    '<p class="lb__count" aria-live="polite"></p>' +
    '<button class="lb__btn lb__close" type="button" aria-label="Close" data-lb-close>' + ICON.close + '</button>' +
    '<button class="lb__btn lb__prev" type="button" aria-label="Previous piece">' + ICON.prev + '</button>' +
    '<figure class="lb__figure">' +
      '<img class="lb__media" alt="">' +
      '<figcaption class="lb__cap"><p class="lb__title" id="lb-title"></p><p class="lb__desc"></p></figcaption>' +
    '</figure>' +
    '<button class="lb__btn lb__next" type="button" aria-label="Next piece">' + ICON.next + '</button>';
  document.body.appendChild(lb);

  var img = lb.querySelector('.lb__media'), title = lb.querySelector('.lb__title'), desc = lb.querySelector('.lb__desc');
  var count = lb.querySelector('.lb__count'), backdrop = lb.querySelector('.lb__backdrop'), figure = lb.querySelector('.lb__figure');
  var prevBtn = lb.querySelector('.lb__prev'), nextBtn = lb.querySelector('.lb__next'), closeBtn = lb.querySelector('.lb__close');
  var index = 0, opener = null, busy = false;

  function source(el) { return el.querySelector('img'); }
  function fill(i) {
    var el = items[i], s = source(el);
    img.src = s.currentSrc || s.src;
    img.alt = s.alt || '';
    title.textContent = el.getAttribute('data-title') || '';
    desc.textContent = el.getAttribute('data-desc') || '';
    desc.hidden = !desc.textContent;
    count.textContent = (i + 1) + ' / ' + items.length;
  }
  function ready() { return img.complete ? Promise.resolve() : new Promise(function (r) { img.onload = img.onerror = r; }); }

  // Grow the enlarged image out of the tile it came from (and back again on close)
  function flipFrom(rect, reverse) {
    var to = img.getBoundingClientRect();
    if (!rect || !to.width || reduce) return Promise.resolve();
    var dx = (rect.left + rect.width / 2) - (to.left + to.width / 2);
    var dy = (rect.top + rect.height / 2) - (to.top + to.height / 2);
    var sx = rect.width / to.width, sy = rect.height / to.height;
    var from = { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')', borderRadius: '8px' };
    var at = { transform: 'none', borderRadius: '6px' };
    var a = img.animate(reverse ? [at, from] : [from, at], { duration: reverse ? 320 : 460, easing: EASE, fill: 'both' });
    return a.finished.then(function () { a.cancel(); });
  }
  function fade(el, on, ms) {
    if (reduce) return Promise.resolve();
    var a = el.animate([{ opacity: on ? 0 : 1 }, { opacity: on ? 1 : 0 }], { duration: ms, easing: 'ease', fill: 'both' });
    return a.finished.then(function () { a.cancel(); });
  }

  function open(i) {
    index = i; opener = items[i];
    pill.classList.remove('is-on');
    fill(i);
    lb.hidden = false;
    document.documentElement.classList.add('lb-open');
    var rect = source(opener).getBoundingClientRect();
    closeBtn.focus({ preventScroll: true });
    fade(backdrop, true, 300);
    fade(lb.querySelector('.lb__cap'), true, 500);
    ready().then(function () { flipFrom(rect, false); });
  }

  function close() {
    if (lb.hidden || busy) return;
    busy = true;
    var target = source(items[index]).getBoundingClientRect();
    var onScreen = target.bottom > 0 && target.top < window.innerHeight;
    Promise.all([fade(backdrop, false, 280), fade(lb.querySelector('.lb__cap'), false, 160), onScreen ? flipFrom(target, true) : fade(img, false, 200)])
      .then(function () {
        lb.hidden = true; busy = false;
        document.documentElement.classList.remove('lb-open');
        (items[index] || opener).focus({ preventScroll: true });
      });
  }

  function go(step) {
    if (busy) return;
    busy = true;
    var next = (index + step + items.length) % items.length;
    var shift = step > 0 ? -28 : 28;
    var out = reduce ? Promise.resolve() : figure.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(' + shift + 'px)' }], { duration: 160, easing: 'ease-in', fill: 'both' }).finished;
    out.then(function () {
      index = next; fill(index);
      return ready();
    }).then(function () {
      if (reduce) { busy = false; return; }
      var a = figure.animate([{ opacity: 0, transform: 'translateX(' + (-shift) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: EASE, fill: 'both' });
      return a.finished.then(function () { a.cancel(); busy = false; });
    });
  }

  items.forEach(function (el, i) { el.addEventListener('click', function (e) { e.preventDefault(); open(i); }); });
  lb.addEventListener('click', function (e) { if (e.target.closest('[data-lb-close]')) close(); });
  prevBtn.addEventListener('click', function () { go(-1); });
  nextBtn.addEventListener('click', function () { go(1); });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'Tab') {          // keep focus inside the viewer
      var stops = [closeBtn, prevBtn, nextBtn], at = stops.indexOf(document.activeElement);
      e.preventDefault();
      stops[(at + (e.shiftKey ? -1 : 1) + stops.length) % stops.length].focus();
    }
  });

  // Swipe between pieces on touch screens
  var sx = null, sy = 0;
  figure.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') { sx = e.clientX; sy = e.clientY; } });
  figure.addEventListener('pointerup', function (e) {
    if (sx === null) return;
    var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  });
})();
