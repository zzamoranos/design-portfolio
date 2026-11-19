/* ==========================================================================
   Playground photobooth: a CSS 3D booth that turns toward the pointer, is lit
   by a light that follows the pointer, and walks you inside on click.
   Everything is plain DOM planes (no WebGL), so it fits the site's strict CSP:
   geometry is set through element.style (CSSOM), never style attributes.
   ========================================================================== */
(function () {
  'use strict';
  var links = document.querySelectorAll('[data-booth]');
  if (!links.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !!(navigator.connection && navigator.connection.saveData) ||             // data saver on
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);  // very low-end device: keep it still
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var DESIGN_W = 640;        // stage design size; the scene scales to the stage width
  var PERSPECTIVE = 1600;

  // One cursor pill shared by every booth on the page
  var pill = document.querySelector('.cursor-pill');
  if (!pill) {
    pill = document.createElement('div');
    pill.className = 'cursor-pill';
    pill.setAttribute('aria-hidden', 'true');
    document.body.appendChild(pill);
  }

  function rotY(v, a) { var c = Math.cos(a), s = Math.sin(a); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; }
  function rotX(v, a) { var c = Math.cos(a), s = Math.sin(a); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]; }
  function norm(v) { var l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  Array.prototype.forEach.call(links, init);

  /* data-booth="full": follows the pointer anywhere on the page and plays the print demo on click.
     data-booth="cover": a small preview that only reacts while hovered and links on normally. */
  function init(link) {
  var isCover = link.getAttribute('data-booth') === 'cover';
  var label = link.getAttribute('data-booth-label') || 'Step inside';
  var stage = link.querySelector('.booth-stage');
  var scene = link.querySelector('.booth-scene');
  var booth = link.querySelector('.booth');
  var faces = [];

  function face(cls, w, h, x, y, z, ry, rx, kind, parent) {
    var d = document.createElement('div');
    d.className = 'bf ' + cls;
    var s = d.style;
    s.width = w + 'px'; s.height = h + 'px';
    s.left = (-w / 2) + 'px'; s.top = (-h / 2) + 'px';
    s.transform = 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px) rotateY(' + (ry || 0) + 'deg) rotateX(' + (rx || 0) + 'deg)';
    (parent || booth).appendChild(d);
    var a = (ry || 0) * Math.PI / 180, b = (rx || 0) * Math.PI / 180;
    faces.push({ el: d, n: [Math.sin(a) * Math.cos(b), -Math.sin(b), Math.cos(a) * Math.cos(b)], kind: kind || 'matte' });
    return d;
  }

  /* Body: a rounded capsule. Footprint 500 x 340 with 70-unit rounded corners; walls y -250..264,
     an oak header band above (y -306..-250) and a chrome base ring below (y 264..282).
     Front (z = 170): left panel x -180..-40 with a backlit panel and the pickup slot,
     doorway x -40..150, a narrow right panel x 150..180. */
  var R = 70, CX = 180, CZ = 100, SEG_WALL = 10, SEG_THIN = 5;   // strips per rounded corner

  // One horizontal ring of the capsule between y0 and y1: four rounded corners plus straight sides.
  // `front` decides what goes on the straight front: true = one full-width face, false = nothing.
  function ring(cls, y0, y1, kind, front, deco, seg) {
    var h = y1 - y0, cy = (y0 + y1) / 2, out = {}, SEG = seg || SEG_WALL;
    [[1, 1, 0], [-1, 1, 0], [1, -1, 180], [-1, -1, 180]].forEach(function (c) {
      var sx = c[0], sz = c[1], base = c[2], step = 90 / SEG;
      for (var i = 0; i < SEG; i++) {
        var deg = sz > 0 ? sx * (i + 0.5) * step : 180 - sx * (i + 0.5) * step;
        var rad = deg * Math.PI / 180;
        var w = 2 * R * Math.tan((step / 2) * Math.PI / 180) + 0.8;
        face(cls + ' ring-curve', w, h, sx * CX + R * Math.sin(rad), cy, sz * CZ + R * Math.cos(rad), deg, 0, kind);
      }
    });
    out.right = face(cls + ' ring-side', CZ * 2, h, CX + R, cy, 0, 90, 0, kind);
    out.left = face(cls + ' ring-side', CZ * 2, h, -CX - R, cy, 0, -90, 0, kind);
    out.back = face(cls + ' ring-back', CX * 2, h, 0, cy, -CZ - R, 180, 0, kind);
    if (front) out.front = face(cls + ' ring-front', CX * 2, h, 0, cy, CZ + R, 0, 0, kind);
    if (deco) deco(out);
    return out;
  }

  // Painted walls
  ring('booth-paint', -250, 264, 'paint', false);
  var fl = face('booth-front booth-paint', 140, 514, -110, 7, 170, 0, 0, 'paint');
  face('booth-front booth-paint', 30, 514, 165, 7, 170, 0, 0, 'paint');

  // Oak frame around the doorway, and an oak upright at the start of each front corner
  [-40, 150].forEach(function (x) { face('booth-trim', 12, 514, x, 7, 171, 0, 0, 'wood'); });
  [-180, 180].forEach(function (x) { face('booth-trim', 8, 514, x, 7, 170.5, 0, 0, 'wood'); });

  // Header band: oak, wrapping all the way round, with little windows of photo strips and a lit name plaque
  var WIN = ['photo-09-central-park', 'photo-02-corgi', 'photo-08-matcha', 'photo-05-cafe', 'photo-07-pottery', 'photo-04-community', 'photo-06-charcoal', 'photo-10-uwux'];
  var wi = 0;
  function windows(n) {
    var h = '';
    for (var i = 0; i < n; i++) {
      h += '<span class="band-window"><img src="assets/about/' + WIN[wi % WIN.length] + '.jpg" alt="" loading="lazy" decoding="async"><img src="assets/about/' + WIN[(wi + 3) % WIN.length] + '.jpg" alt="" loading="lazy" decoding="async"></span>';
      wi++;
    }
    return h;
  }
  ring('booth-band', -306, -250, 'wood', true, function (o) {
    o.front.innerHTML = '<div class="band-row">' + windows(2) + '<span class="band-plaque">Photobooth</span>' + windows(2) + '</div>';
    o.left.innerHTML = '<div class="band-row">' + windows(4) + '</div>';
    o.right.innerHTML = '<div class="band-row">' + windows(4) + '</div>';
  }, SEG_THIN);
  // Rounded lid
  face('booth-roof', 2 * (CX + R), 2 * (CZ + R), 0, -306, 0, 0, 90, 'wood');
  // Chrome base ring
  ring('booth-base', 264, 282, 'metal', true, null, SEG_THIN);

  // Interior room seen through the doorway
  face('booth-in booth-in--back', 190, 514, 55, 7, -150, 0, 0, 'room');
  face('booth-in booth-in--wall', 320, 514, -40, 7, 10, 90, 0, 'room');
  face('booth-in booth-in--wall', 320, 514, 150, 7, 10, -90, 0, 'room');
  face('booth-in booth-in--floor', 190, 320, 55, 264, 10, 0, 90, 'room');
  face('booth-in booth-in--ceil', 190, 320, 55, -250, 10, 0, -90, 'room');

  // A round shape built from flat strips: n side panels around the axis, plus top/bottom caps
  function cyl(cls, r, h, cx, cy, cz, n, kind, caps) {
    var w = 2 * r * Math.tan(Math.PI / n) + 0.6;           // a hair of overlap so no seams show
    for (var i = 0; i < n; i++) {
      var a = i * 360 / n, rad = a * Math.PI / 180;
      face(cls + ' cyl-side', w, h, cx + r * Math.sin(rad), cy, cz + r * Math.cos(rad), a, 0, kind);
    }
    if (caps !== false) {
      face(cls + ' cyl-cap', r * 2, r * 2, cx, cy - h / 2, cz, 0, 90, kind);     // top
      face(cls + ' cyl-cap', r * 2, r * 2, cx, cy + h / 2, cz, 0, -90, kind);    // underside
    }
  }

  // Stool: an oak seat on a steel post, standing on a steel foot. Every part meets the next.
  cyl('stool-foot', 30, 6, 55, 261, -40, 16, 'metal');
  cyl('stool-post', 5, 174, 55, 171, -40, 8, 'metal', false);
  cyl('stool-collar', 12, 10, 55, 79, -40, 12, 'metal');
  cyl('stool-seat', 46, 14, 55, 67, -40, 20, 'wood');

  // Curtain on a rod across the doorway: closed until you come close, then it draws back
  face('curtain-rod', 196, 5, 55, -244, 160, 0, 0, 'metal');
  var curtain = face('curtain', 184, 494, 55, 2, 158, 0, 0, 'cloth');
  curtain.innerHTML = '<div class="curtain__cloth"><i class="curtain__rings"></i></div>';

  // Contact shadow on the floor
  var shadow = face('booth-shadow', 900, 620, 30, 284, 20, 0, 90, 'none');
  shadow.innerHTML = '<i></i>';

  // Front-left panel: a tall backlit panel in an oak frame with a sample strip, then the strip pickup
  fl.innerHTML =
    '<div class="light-panel"><span class="light-panel__text">Photos</span><div class="panel-strip">' +
      ['photo-09-central-park', 'photo-02-corgi', 'photo-08-matcha', 'photo-07-pottery'].map(function (t) {
        return '<img src="assets/about/' + t + '.jpg" alt="" loading="lazy" decoding="async">';
      }).join('') + '</div></div>' +
    '<div class="pickup"><span class="pickup__label">strip pickup</span><i></i></div>';

  /* ---------- state ---------- */
  var REST = { ax: isCover ? -7 : -9, ay: isCover ? -13 : -10 };
  var cur = { ax: REST.ax, ay: REST.ay, lx: -0.3, ly: -0.75 };
  var tgt = { ax: REST.ax, ay: REST.ay, lx: -0.3, ly: -0.75 };
  var hasPointer = false, visible = true, raf = 0, entering = false, cam = { x: 0, y: 0, z: 0 };
  var scale = 1;

  function resize() {
    scale = Math.min(1.1, stage.clientWidth / DESIGN_W);
    render();
  }

  var GLOSS = { metal: 0.55, sign: 0.4, paint: 0.3, wood: 0.18 };   // satin paint, oiled oak
  var lastScene = '', lastBooth = '';
  function setVar(el, cache, key, val) {             // only touch the DOM when a value actually changes
    if (cache[key] !== val) { cache[key] = val; el.style.setProperty(key, val); }
  }
  var linkCache = {};

  function render() {
    var ax = cur.ax * Math.PI / 180, ay = cur.ay * Math.PI / 180;
    var sceneT = 'scale3d(' + scale + ',' + scale + ',' + scale + ') translate3d(' + cam.x.toFixed(2) + 'px,' + cam.y.toFixed(2) + 'px,' + cam.z.toFixed(2) + 'px)';
    var boothT = 'rotateX(' + cur.ax.toFixed(3) + 'deg) rotateY(' + cur.ay.toFixed(3) + 'deg)';
    if (sceneT !== lastScene) { scene.style.transform = lastScene = sceneT; }
    if (boothT !== lastBooth) { booth.style.transform = lastBooth = boothT; }

    var L = norm([cur.lx, cur.ly, 0.7]);
    var H = norm([L[0], L[1], L[2] + 1]);          // Blinn half vector, viewer on +z
    for (var i = 0; i < faces.length; i++) {
      var f = faces[i];
      if (f.kind === 'none') continue;
      var n = rotX(rotY(f.n, ay), ax);
      var diff = Math.max(0, dot(n, L));
      var shade, hi = 0;
      if (f.kind === 'room') {                       // inside: soft, mostly lit by the booth lamp
        shade = 0.16 - diff * 0.14;
      } else {
        shade = 0.42 - diff * 0.5;                   // ambient + Lambert
        var gloss = GLOSS[f.kind] || 0;
        if (gloss) hi = Math.pow(Math.max(0, dot(n, H)), 24) * gloss;
      }
      if (shade < 0) { hi += -shade; shade = 0; }
      f.c = f.c || {};
      setVar(f.el, f.c, '--shade', shade.toFixed(2));
      setVar(f.el, f.c, '--hi', hi.toFixed(2));
    }
    // Reflections slide across the paint and glass as the booth turns
    setVar(link, linkCache, '--sheen', (50 + cur.ay * 2.2 + cur.lx * 30).toFixed(1) + '%');
    setVar(link, linkCache, '--glare', (50 - cur.ay * 3 - cur.lx * 40).toFixed(1) + '%');
    // Shadow falls away from the light
    setVar(link, linkCache, '--shx', (-cur.lx * 70).toFixed(1) + 'px');
    setVar(link, linkCache, '--shy', (-cur.ly * -30 - 20).toFixed(1) + 'px');
  }

  function tick(t) {
    raf = 0;
    if (!hasPointer && !entering) {                  // no pointer: ease back to the resting pose, then stop
      tgt.ay = REST.ay; tgt.ax = REST.ax; tgt.lx = -0.3; tgt.ly = -0.75;
    }
    var k = entering ? 0.08 : 0.075, moving = false;
    ['ax', 'ay', 'lx', 'ly'].forEach(function (p) {
      var d = tgt[p] - cur[p];
      if (Math.abs(d) > 0.01) { cur[p] += d * k; moving = true; } else cur[p] = tgt[p];
    });
    render();
    // the loop only runs while something is actually moving: a resting booth costs nothing
    if (visible && !document.hidden && (moving || entering)) raf = requestAnimationFrame(tick);
  }
  function kick() { if (!raf && !reduce) raf = requestAnimationFrame(tick); }

  /* ---------- pointer: turn toward it, light from it ---------- */
  function aim(e, box, halfW, halfH) {
    var px = Math.max(-1, Math.min(1, (e.clientX - (box.left + box.width / 2)) / halfW));
    var py = Math.max(-1, Math.min(1, (e.clientY - (box.top + box.height * 0.55)) / halfH));
    tgt.ay = px * 24;
    tgt.ax = REST.ax + py * 7;
    tgt.lx = -0.15 + px * 0.85;
    tgt.ly = -0.7 + py * 0.55;
    kick();
  }
  if (finePointer && !reduce) {
    if (isCover) {
      link.addEventListener('pointermove', function (e) {
        hasPointer = true;
        var r = link.getBoundingClientRect();
        aim(e, r, r.width / 2, r.height / 2);
      });
      link.addEventListener('pointerleave', function () { hasPointer = false; kick(); });
    } else {
      window.addEventListener('pointermove', function (e) {
        if (entering) return;
        hasPointer = true;
        aim(e, stage.getBoundingClientRect(), window.innerWidth / 2, window.innerHeight / 2);
      }, { passive: true });
      document.addEventListener('pointerleave', function () { hasPointer = false; kick(); });
    }
  }

  // Only animate while on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); }).observe(stage);
  }

  /* ---------- cursor pill ---------- */
  if (finePointer) {
    link.addEventListener('pointermove', function (e) {
      if (entering) { pill.classList.remove('is-on'); return; }
      var on = isCover || !!e.target.closest('.bf');   // the cover is one big target; the full booth only on the booth itself
      link.classList.toggle('is-hot', on);
      if (!on) { pill.classList.remove('is-on'); return; }
      pill.textContent = label;
      pill.style.transform = 'translate3d(' + (e.clientX + 14) + 'px,' + (e.clientY + 16) + 'px,0)';
      pill.classList.add('is-on');
    });
    link.addEventListener('pointerleave', function () { pill.classList.remove('is-on'); link.classList.remove('is-hot'); });
  }

  /* ---------- print demo: zoom onto the pickup slot, a strip prints and drops to the floor, zoom back out ---------- */
  var PRINT_PHOTOS = ['photo-09-central-park', 'photo-02-corgi', 'photo-08-matcha', 'photo-05-cafe', 'photo-07-pottery', 'photo-04-community', 'photo-06-charcoal', 'photo-10-uwux', 'photo-01-designer'];
  var SLOT = { x: -110, y: 92, z: 171.5 };           // the pickup slot on the front-left panel (booth units)
  var STRIP_W = 56, STRIP_H = 132;

  function tween(dur, fn, easing) {
    return new Promise(function (done) {
      var t0 = performance.now();
      (function step(now) {
        var t = Math.min(1, (now - t0) / dur);
        fn((easing || ease)(t));
        render();
        if (t < 1) requestAnimationFrame(step); else done();
      })(t0);
    });
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function camTo(x, y, z, dur) {
    var from = { x: cam.x, y: cam.y, z: cam.z };
    return tween(dur, function (e) { cam.x = from.x + (x - from.x) * e; cam.y = from.y + (y - from.y) * e; cam.z = from.z + (z - from.z) * e; });
  }
  function makeStrip() {
    var picks = PRINT_PHOTOS.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 3);
    var w = document.createElement('div');
    w.className = 'print';
    var st = w.style;
    st.width = STRIP_W + 'px'; st.height = '0px';
    st.left = (-STRIP_W / 2) + 'px'; st.top = '0px';
    st.transform = 'translate3d(' + SLOT.x + 'px,' + SLOT.y + 'px,' + SLOT.z + 'px)';
    w.innerHTML = '<div class="print__paper">' + picks.map(function (t) {
      return '<img src="assets/about/' + t + '.jpg" alt="">';
    }).join('') + '<span class="print__foot"></span></div>';
    w.firstChild.style.height = STRIP_H + 'px';
    booth.appendChild(w);
    return w;
  }

  function printStrip() {
    entering = true;                                   // locks pointer-follow while the shot plays
    pill.classList.remove('is-on');
    link.classList.add('is-printing');
    var strip = makeStrip();
    var zoomZ = (PERSPECTIVE * 0.6) / scale - 171;    // pickup slot appears ~2.5x larger
    tgt.ax = -15; tgt.ay = 14; tgt.lx = -0.1; tgt.ly = -0.6;
    kick();
    return camTo(110, -150, zoomZ, 1300)
      .then(function () { return wait(250); })
      .then(function () {
        // printing: the strip feeds out in small mechanical steps
        link.classList.add('is-feeding');
        return tween(2300, function (e) {
          var stepped = Math.round(e * 34) / 34;
          strip.style.height = (STRIP_H * stepped).toFixed(1) + 'px';
        }, function (t) { return t; });
      })
      .then(function () { link.classList.remove('is-feeding'); return wait(450); })
      .then(function () {
        // it lets go: drops, tips forward and lands face up on the floor in front of the booth
        var a = strip.animate([
          { transform: 'translate3d(' + SLOT.x + 'px,' + SLOT.y + 'px,' + SLOT.z + 'px) rotateX(0deg) rotateZ(0deg)', offset: 0 },
          { transform: 'translate3d(' + (SLOT.x - 3) + 'px,' + (SLOT.y + 38) + 'px,' + (SLOT.z + 14) + 'px) rotateX(18deg) rotateZ(-5deg)', offset: 0.35 },
          { transform: 'translate3d(' + (SLOT.x - 10) + 'px,281px,' + (SLOT.z + 40) + 'px) rotateX(92deg) rotateZ(10deg)', offset: 0.82 },
          { transform: 'translate3d(' + (SLOT.x - 11) + 'px,281px,' + (SLOT.z + 42) + 'px) rotateX(86deg) rotateZ(12deg)', offset: 0.92 },
          { transform: 'translate3d(' + (SLOT.x - 11) + 'px,281px,' + (SLOT.z + 42) + 'px) rotateX(90deg) rotateZ(12deg)', offset: 1 }
        ], { duration: 950, easing: 'cubic-bezier(.45, 0, .8, .6)', fill: 'forwards' });
        return a.finished;
      })
      .then(function () {
        // as soon as it lands it fades away, then the camera eases back out
        return strip.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease-out', fill: 'forwards' }).finished;
      })
      .then(function () {
        tgt.ax = REST.ax; tgt.ay = REST.ay; tgt.lx = -0.3; tgt.ly = -0.75;
        kick();
        return camTo(0, 0, 0, 1400);
      })
      .then(finish, function () { cam.x = cam.y = cam.z = 0; render(); finish(); });   // never get stuck mid-shot
    function finish() {
      if (strip.parentNode) strip.remove();
      link.classList.remove('is-printing', 'is-feeding');
      entering = false; hasPointer = false;
      tgt.ax = REST.ax; tgt.ay = REST.ay;
      kick();
    }
  }

  if (!isCover && link.getAttribute('data-booth-action') === 'print') link.addEventListener('click', function (e) {
    e.preventDefault();
    if (entering) return;
    if (reduce || !Element.prototype.animate) {         // no camera move: the strip just appears on the floor, then goes
      var s = makeStrip();
      s.style.height = STRIP_H + 'px';
      s.style.transform = 'translate3d(' + (SLOT.x - 11) + 'px,281px,' + (SLOT.z + 42) + 'px) rotateX(90deg) rotateZ(12deg)';
      entering = true;
      setTimeout(function () { s.remove(); entering = false; }, 2500);
      return;
    }
    printStrip();
  });

  // Coming back with the browser's back button restores the page from cache: reset everything
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    entering = false; hasPointer = false; cam.x = cam.y = cam.z = 0;
    pill.classList.remove('is-on');
    link.classList.remove('is-hot', 'is-printing', 'is-feeding');
    render(); kick();
  });

  window.addEventListener('resize', resize);
  resize();
  if (reduce) { cur.ay = tgt.ay = REST.ay - 6; render(); } else kick();
  }
})();
