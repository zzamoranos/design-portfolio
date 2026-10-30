// Scroll reveal: content fades up the first time it scrolls into view (styles in css/styles.css).
// About: each section below the intro. Home: the case study cards, staggered across a row.
// Case studies: the stats, project facts, each section, the hero visual and the "read next" card.
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var targets = document.querySelectorAll([
    '.main--about > section:not(:first-child)',
    '.card-grid > li',
    '.case__stats', '.case__outcome', '.case__meta', '.case__toc',
    '.case__figure--hero', '.case__phones--hero', '.dc-hero', '.case__section', '.cs-section', '.main--playground > .pg-section', '.cs-hero', '.cs-meta', '.case__next'
  ].join(', '));
  if (!targets.length) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      io.unobserve(e.target); // reveal once
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 }); // any part in view: a ratio threshold can't be met by sections taller than the screen

  // Arriving by page transition (html.vt): what's already on screen comes in with the crossfade instead
  var pageChange = document.documentElement.classList.contains('vt');
  Array.prototype.forEach.call(targets, function (el) {
    if (pageChange && el.getBoundingClientRect().top < window.innerHeight) return;
    // cards in the same row arrive one after another
    if (el.parentNode.classList.contains('card-grid')) {
      var i = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--reveal-delay', (i % 2) * 0.1 + 's');
    }
    el.classList.add('reveal');
    io.observe(el);
  });
  document.documentElement.classList.add('reveal-ready');
})();
