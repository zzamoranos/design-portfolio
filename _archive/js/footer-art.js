// Footer art: mounts the registered art mode (js/nebula.js) on the footer canvas.
// Modes register themselves on window.FooterArt as { id, label, fill, mount(canvas) → { destroy } };
// a mode with fill: true covers the whole footer.
(function () {
  'use strict';
  var canvas = document.querySelector('.footer__pond');
  var modes = window.FooterArt || [];
  if (!canvas || !canvas.getContext || !modes.length) return;
  var mode = modes.filter(function (m) { return m.id === 'nebula'; })[0] || modes[0];
  canvas.classList.toggle('is-full', !!mode.fill);
  mode.mount(canvas);
})();
