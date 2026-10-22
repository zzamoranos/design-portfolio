// Runs before first paint: apply saved theme, else follow the OS setting.
(function () {
  var theme = null;
  try { theme = localStorage.getItem('theme'); } catch (e) { /* storage blocked — fall back to OS */ }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();

// Page transitions: give the main content its own transition layer only while a page change runs
// (see "Page transitions" in styles.css), then remove it so normal browsing isn't affected.
(function () {
  var root = document.documentElement;
  function done() { root.classList.remove('vt'); }
  window.addEventListener('pageswap', function (e) { if (e.viewTransition) root.classList.add('vt'); });
  window.addEventListener('pagereveal', function (e) {
    var vt = e.viewTransition;
    if (!vt) return;
    root.classList.add('vt');
    vt.ready.catch(done);              // skipped transitions (fast clicks, hidden tab) are harmless
    vt.finished.then(done, done);
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) done(); });  // back/forward cache
})();
