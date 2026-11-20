// About › Experience and Community: glass ID badges beside the list (larger screens only, and only when there's room).
// Experience and Community: nothing at rest; hovering a row shows that row's badge, always in the same spot.
// Badges are decoration built from the list itself (aria-hidden), so the list stays the real content.
(function () {
  'use strict';
  var root = document.querySelector('.timeline-groups');
  if (!root) return;
  var desktop = window.matchMedia('(min-width: 960px) and (hover: hover) and (pointer: fine)');
  var BW = 140;                                 // badge width; matches .badge in about.css
  var MIN_STAGE = 240;                          // room needed beside the list at full size
  var MIN_SCALE = 0.8;                          // on tighter screens badges shrink to this, then hide
  var k = 1;                                    // current badge scale
  var PANELS = ['panel-experience', 'panel-community'];   // Awards get no badges

  var stage = document.createElement('div');
  stage.className = 'badge-stage';
  stage.setAttribute('aria-hidden', 'true');
  root.appendChild(stage);

  var sets = {};   // panel id -> { group, badges: [{el, li}] }

  function makeBadge(role, org, date) {
    var b = document.createElement('div');
    b.className = 'badge';
    b.innerHTML =
      '<span class="badge__card">' +
        '<span class="badge__slot"></span>' +
        '<span class="badge__inner">' +
          '<span class="badge__role"></span>' +
          '<span class="badge__org"></span>' +
          '<span class="badge__date"></span>' +
        '</span>' +
      '</span>';
    b.querySelector('.badge__role').textContent = role;
    b.querySelector('.badge__org').textContent = org;
    b.querySelector('.badge__date').textContent = date;
    return b;
  }

  PANELS.forEach(function (id) {
    var panel = document.getElementById(id);
    if (!panel) return;
    var community = id === 'panel-community';
    var set = { badges: [] };
    var group = document.createElement('div');
    group.className = 'badge-set';
    stage.appendChild(group);
    set.group = group;
    Array.prototype.forEach.call(panel.querySelectorAll('.timeline__list li'), function (li, i) {
      var a = li.querySelector('.timeline__role').textContent.trim();
      var b = li.querySelector('.timeline__org').textContent.trim();
      var date = li.querySelector('.timeline__date').textContent.trim();
      // Experience rows read role / company; Community rows read org / role. Badges always show role first.
      var badge = community ? makeBadge(b, a, date) : makeBadge(a, b, date);
      group.appendChild(badge);
      set.badges.push({ el: badge, li: li });
      li.addEventListener('pointerenter', function () { if (root.classList.contains('has-badges')) focus(set, i); });
      li.addEventListener('pointerleave', function () { if (root.classList.contains('has-badges')) focus(set, -1); });
    });
    sets[id] = set;
  });

  // Every badge shows in one fixed spot beside the top of the list
  function layout() {
    var w = stage.clientWidth / k;              // work in unscaled units
    Object.keys(sets).forEach(function (id) {
      sets[id].group.style.setProperty('--cx', ((w - BW) / 2).toFixed(0) + 'px');
      sets[id].group.style.setProperty('--cy', '8px');
    });
  }

  function focus(set, index) {
    set.group.classList.toggle('has-focus', index > -1);
    set.badges.forEach(function (b, i) {
      var on = i === index;
      b.el.classList.toggle('is-focus', on);
      b.li.classList.toggle('is-badged', on);
    });
  }

  // Follow the accordion: show the open panel's badges, lined up with its list
  function sync() {
    var open = root.querySelector('.timeline-group.is-open .timeline-panel');
    var id = open && open.id;
    Object.keys(sets).forEach(function (key) {
      sets[key].group.classList.toggle('is-active', key === id);
      if (key !== id) focus(sets[key], -1);
    });
    if (open) stage.style.top = (open.offsetTop + 12) + 'px';
  }

  function update() {
    root.classList.toggle('has-badges', desktop.matches);
    if (!desktop.matches) return;
    k = Math.min(1, stage.clientWidth / MIN_STAGE);
    if (k < MIN_SCALE) { root.classList.remove('has-badges'); return; }   // not enough room beside the list
    stage.style.setProperty('--k', k.toFixed(3));
    layout(); sync();
  }

  var mo = new MutationObserver(function () {
    window.requestAnimationFrame(sync);
    setTimeout(sync, 420);   // again once the accordion has finished resizing
  });
  Array.prototype.forEach.call(root.querySelectorAll('.timeline-group'), function (g) {
    mo.observe(g, { attributes: true, attributeFilter: ['class'] });   // only the accordion opening/closing
  });
  window.addEventListener('resize', update);
  if (desktop.addEventListener) desktop.addEventListener('change', update);
  update();
})();
