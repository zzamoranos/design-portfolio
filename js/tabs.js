// Experience / Community / Awards: stacked accordion — one section open at a time.
// Clicking a collapsed (greyed) heading opens its list underneath and collapses the others.
(function () {
  'use strict';
  document.querySelectorAll('.timeline-groups').forEach(function (root) {
    var groups = Array.prototype.slice.call(root.querySelectorAll('.timeline-group'));

    function open(target) {
      groups.forEach(function (g) {
        var on = g === target;
        var btn = g.querySelector('.timeline-toggle');
        var panel = g.querySelector('.timeline-panel');
        g.classList.toggle('is-open', on);
        btn.setAttribute('aria-expanded', String(on));
        if (on) panel.removeAttribute('inert'); else panel.setAttribute('inert', '');
      });
    }

    groups.forEach(function (g) {
      g.querySelector('.timeline-toggle').addEventListener('click', function () {
        if (!g.classList.contains('is-open')) open(g);
      });
    });
  });
})();
