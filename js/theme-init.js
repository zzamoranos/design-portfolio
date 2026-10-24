// Runs before first paint: apply saved theme, else follow the OS setting.
(function () {
  var theme = null;
  try { theme = localStorage.getItem('theme'); } catch (e) { /* storage blocked — fall back to OS */ }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();

// One clock for the sky and footer stars (sky.js, nebula.js) across the visit, so their twinkle
// carries on from page to page instead of restarting and jumping during the crossfade.
(function () {
  var epoch = Date.now();
  try {
    var saved = Number(sessionStorage.getItem('skyEpoch'));
    if (saved > 0 && saved <= epoch) epoch = saved; else sessionStorage.setItem('skyEpoch', String(epoch));
  } catch (e) { /* storage blocked — each page keeps its own clock */ }
  window.SKY_EPOCH = epoch;
})();

// Page transitions: give the main content its own transition layer only while a page change runs
// (see "Page transitions" in styles.css), then remove it so normal browsing isn't affected.
(function () {
  var root = document.documentElement;
  function done() { root.classList.remove('vt'); }
  // What's already on screen is part of the crossfade: show it in its final state right away,
  // so the scroll reveal and image blur-in don't replay underneath it and flicker.
  function settle() {
    var h = window.innerHeight;
    document.querySelectorAll('.reveal').forEach(function (el) { if (el.getBoundingClientRect().top < h) el.classList.add('is-visible'); });
    document.querySelectorAll('img.media-fade').forEach(function (img) { if (img.complete) img.classList.add('is-loaded'); });
  }
  window.addEventListener('pageswap', function (e) { if (e.viewTransition) root.classList.add('vt'); });
  window.addEventListener('pagereveal', function (e) {
    var vt = e.viewTransition;
    if (!vt) return;
    root.classList.add('vt');
    settle();
    vt.ready.catch(done);             // skipped transitions (fast clicks, hidden tab) are harmless
    vt.finished.then(done, done);
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) done(); });  // back/forward cache
})();
