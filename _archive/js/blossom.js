// Footer art mode "blossom": cherry blossoms floating on dark water, each sending out faint rings,
// petals scattered between them, stars reflected in the surface. Everything is "stitched" on a fine
// grid like the top-of-page ASCII art: brightness picks the glyph (faint dot → + → cross-stitch x → bold x).
// One of the footer art modes (see js/footer-art.js).
// ~15fps while the footer is on screen; reduced motion gets one still frame.
(function () {
  'use strict';
  (window.FooterArt = window.FooterArt || []).push({ id: 'blossom', label: 'Blossom', mount: function (canvas) {
  var ctx = canvas.getContext('2d');

  var SW = 560, SH = 260, P = 4, COLS = SW / P, ROWS = SH / P;

  function len(x, y) { return Math.sqrt(x * x + y * y); }
  function smooth(e0, e1, v) { var t = Math.max(0, Math.min(1, (v - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }
  function sdEllipse(x, y, cx, cy, rx, ry) { return (len((x - cx) / rx, (y - cy) / ry) - 1) * Math.min(rx, ry); }
  function sdSeg(x, y, ax, ay, bx, by) {
    var px = x - ax, py = y - ay, dx = bx - ax, dy = by - ay;
    var h = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy)));
    return len(px - dx * h, py - dy * h);
  }
  function sdTri(x, y, a, b, c) {
    var e0x = b[0] - a[0], e0y = b[1] - a[1], e1x = c[0] - b[0], e1y = c[1] - b[1], e2x = a[0] - c[0], e2y = a[1] - c[1];
    var v0x = x - a[0], v0y = y - a[1], v1x = x - b[0], v1y = y - b[1], v2x = x - c[0], v2y = y - c[1];
    function q(vx, vy, ex, ey) { var h = Math.max(0, Math.min(1, (vx * ex + vy * ey) / (ex * ex + ey * ey))); return [vx - ex * h, vy - ey * h]; }
    var q0 = q(v0x, v0y, e0x, e0y), q1 = q(v1x, v1y, e1x, e1y), q2 = q(v2x, v2y, e2x, e2y);
    var s = Math.sign(e0x * e2y - e0y * e2x);
    var d0 = [q0[0] * q0[0] + q0[1] * q0[1], s * (v0x * e0y - v0y * e0x)];
    var d1 = [q1[0] * q1[0] + q1[1] * q1[1], s * (v1x * e1y - v1y * e1x)];
    var d2 = [q2[0] * q2[0] + q2[1] * q2[1], s * (v2x * e2y - v2y * e2x)];
    return -Math.sqrt(Math.min(d0[0], d1[0], d2[0])) * Math.sign(Math.min(d0[1], d1[1], d2[1]));
  }
  var seed = 3;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  // ---- blossoms spread across the pond [x, y, radius], each bobbing gently ----
  var SWIRL = [282, 150];
  var FLOWERS = [[82, 122, 24], [178, 60, 22], [182, 186, 26], [292, 124, 28], [400, 58, 22], [410, 182, 25], [500, 112, 22]].map(function (f) {
    return { x: f[0], y: f[1], R: f[2], ph: rand() * 6.28, spin: rand() * 6.28, rate: (rand() - 0.5) * 0.12 };
  });
  var PETALS = [];
  while (PETALS.length < 16) {
    var px = 40 + rand() * 480, py = 30 + rand() * 200;
    if (Math.pow((px - 280) / 280, 2) + Math.pow((py - 130) / 130, 2) < 0.7) PETALS.push({ x: px, y: py, L: 5.5 + rand() * 3, ph: rand() * 6.28, spin: rand() * 6.28, rate: (rand() - 0.5) * 0.4 });
  }
  function bob(o, t, ax, ay) { return [o.x + Math.sin(t * 0.12 + o.ph) * ax, o.y + Math.cos(t * 0.15 + o.ph) * ay]; }

  // ---- sparkles: diagonal braille-style x's like the top art, plus 4-point stars reflected in the water ----
  var SPARKS = [[52, 40, 6, 0.5, 0.3], [470, 30, 8, 0.4, 2.2], [530, 120, 4, 0.6, 4.1], [200, 26, 4, 0.7, 1.4], [372, 54, 5, 0.55, 3.0]];
  var STARS = [];
  for (var s = 0; s < 18; s++) STARS.push([30 + rand() * 500, 30 + rand() * 210, rand() * 6.28, 0.6 + rand()]);

  // ---- ripples [x, y, start, strength] ----
  var RIPPLES = [], LIFE = 2.6, now = 0, lastDrop = 0, lastSpawn = { x: -99, y: -99, t: -1 };
  function addRipple(x, y, s) { RIPPLES.push([x, y, now, s]); if (RIPPLES.length > 18) RIPPLES.shift(); }

  // ---- glyph sprites: brightness → dot, +, x, bold x (pre-rendered per size) ----
  var LEVELS = 6, SPR = [], cell = 1, scale = 1, dpr = 1;
  var COLORS = ['86,108,200', '104,128,220', '141,168,238', '170,190,245', '210,222,255', '238,243,255'];
  function makeSprites() {
    SPR = [];
    for (var l = 0; l < LEVELS; l++) {
      var c = document.createElement('canvas'), n = Math.max(4, Math.round(cell));
      c.width = c.height = n;
      var g = c.getContext('2d'), col = 'rgb(' + COLORS[l] + ')', m = n * 0.2;
      g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round';
      if (l === 0) { g.beginPath(); g.arc(n / 2, n / 2, n * 0.08, 0, 6.2832); g.fill(); }
      else if (l === 1) { g.beginPath(); g.arc(n / 2, n / 2, n * 0.12, 0, 6.2832); g.fill(); }
      else if (l === 2) { g.lineWidth = n * 0.11; g.beginPath(); g.moveTo(n / 2, m + n * 0.08); g.lineTo(n / 2, n - m - n * 0.08); g.moveTo(m + n * 0.08, n / 2); g.lineTo(n - m - n * 0.08, n / 2); g.stroke(); }
      else { g.lineWidth = n * (l === 5 ? 0.2 : l === 4 ? 0.16 : 0.12); var mm = l === 3 ? m * 1.2 : m; g.beginPath(); g.moveTo(mm, mm); g.lineTo(n - mm, n - mm); g.moveTo(n - mm, mm); g.lineTo(mm, n - mm); g.stroke(); }
      SPR.push(c);
    }
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    scale = Math.min(w / SW, h / SH); cell = P * scale * dpr; makeSprites();
  }
  function glyph(gx, gy, i, fade) {
    if (i < 0.08) return;
    var l = Math.min(LEVELS - 1, Math.floor(i * LEVELS));
    ctx.globalAlpha = Math.min(1, (0.45 + 0.55 * Math.min(1, i)) * fade);
    ctx.drawImage(SPR[l], gx * cell, gy * cell, cell, cell);
  }
  function glow(x, y, r, a) {
    var s = scale * dpr, g = ctx.createRadialGradient(x * s, y * s, 0, x * s, y * s, r * s);
    g.addColorStop(0, 'rgba(226,234,255,' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(141,168,238,0)');
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x * s, y * s, r * s, 0, 6.2832); ctx.fill();
  }

  // intensity field for one cell
  var flowerPos = [], petalPos = [];
  function field(x, y, gx, gy, t) {
    var i = 0;
    // swirling eddy: spiral arms in a flattened disc, turning slowly
    var dx = x - SWIRL[0], dy = (y - SWIRL[1]) / 0.42, r = len(dx, dy), th = Math.atan2(dy, dx);
    var arm = Math.sin(th * 2 + r * 0.06 - t * 0.35);
    i = Math.max(i, 0.3 * smooth(0.75, 1, arm) * smooth(14, 40, r) * smooth(270, 140, r) * (gy % 2 ? 0.6 : 1));
    // faint stipple of the water surface
    var n = Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453; n -= Math.floor(n);
    if (n > 0.93) i = Math.max(i, 0.1 + 0.08 * Math.sin(t * 0.8 + n * 50));
    // ripples
    for (var q = 0; q < RIPPLES.length; q++) {
      var R = RIPPLES[q], age = t - R[2], e = len(x - R[0], (y - R[1]) / 0.42);
      for (var ring = 0; ring < 3; ring++) {
        var rad = age * 30 - ring * 11;
        if (rad <= 0) continue;
        var on = 1 - Math.abs(e - rad) / 5;
        if (on > 0) i += R[3] * on * Math.pow(1 - age / LIFE, 1.3) * (1 - ring * 0.25);
      }
    }
    // blossoms: five notched sakura petals, bold outline, a vein down each petal, bright center;
    // each sends out faint rings so it reads as floating
    for (var f = 0; f < flowerPos.length; f++) {
      var F = flowerPos[f], fx = x - F[0], fy = (y - F[1]) / 0.8;
      if (Math.abs(fx) > F[2] + 40 || Math.abs(fy) > F[2] + 40) continue;
      var fr = len(fx, fy), fa = Math.atan2(fy, fx) - F[3], cs = Math.abs(Math.cos(2.5 * fa));
      var pr = F[2] * (0.4 + 0.6 * Math.pow(cs, 0.5)) - F[2] * 0.2 * smooth(0.95, 1, cs); // notch at each tip
      if (fr < pr) {
        if (fr < F[2] * 0.2) return 1;                                      // center
        if (fr < F[2] * 0.3) return 0.2;
        if (pr - fr < P * 1.05) return 0.98;                                 // outline, a full stitch wide so it never breaks
        return (gx + gy) % 2 ? 0.3 : 0.14;                                   // soft dotted petal fill
      }
      var er = len(fx, (y - F[1]) / 0.6);
      for (var w = 0; w < 2; w++) {
        var pg = (t * 0.28 + F[4] + w * 0.5) % 1, rad = F[2] * 1.1 + pg * 34;
        var on = 1 - Math.abs(er - rad) / 6;
        if (on > 0) i = Math.max(i, 0.55 * on * Math.pow(1 - pg, 1.2));
      }
    }
    // loose petals: small rotated ovals
    for (var q2 = 0; q2 < petalPos.length; q2++) {
      var Pp = petalPos[q2], ppx = x - Pp[0], ppy = y - Pp[1];
      if (Math.abs(ppx) > 8 || Math.abs(ppy) > 8) continue;
      var c = Math.cos(Pp[3]), sn = Math.sin(Pp[3]), u = ppx * c + ppy * sn, vv = -ppx * sn + ppy * c;
      if (sdEllipse(u, vv, 0, 0, Pp[2], Pp[2] * 0.55) < 0) i = Math.max(i, 0.8);
    }
    return i;
  }

  function frame(t) {
    now = t;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // a raindrop now and then
    if (t - lastDrop > 2.4 + (Math.sin(t * 5.1) + 1)) { lastDrop = t; addRipple(40 + ((t * 977) % 480), 60 + ((t * 571) % 180), 0.5); }
    RIPPLES = RIPPLES.filter(function (r) { return t - r[2] < LIFE; });
    flowerPos = FLOWERS.map(function (f) { var q = bob(f, t, 6, 3); return [q[0], q[1], f.R, f.spin + t * f.rate, f.ph / 6.28]; });
    petalPos = PETALS.map(function (p) { var q = bob(p, t, 9, 4); return [q[0], q[1], p.L, p.spin + t * p.rate]; });

    // soft glows: a little light under each blossom, and blurred stars like the top art
    flowerPos.forEach(function (F) { glow(F[0], F[1], F[2] * 1.8, 0.1); });
    STARS.forEach(function (s) { var a = Math.pow(0.5 + 0.5 * Math.sin(t * s[3] + s[2]), 4); if (a > 0.05) glow(s[0], s[1], 7, 0.5 * a); });

    for (var gy = 0; gy < ROWS; gy++) {
      for (var gx = 0; gx < COLS; gx++) {
        var x = (gx + 0.5) * P, y = (gy + 0.5) * P, k = gy * COLS + gx;
        var v = smooth(1, 0.5, Math.pow((x - SW / 2) / (SW / 2), 2) + Math.pow((y - SH / 2) / (SH / 2), 2));
        if (v <= 0) continue;
        glyph(gx, gy, Math.min(1, field(x, y, gx, gy, t)), v);
      }
    }

    // diagonal x sparkles in braille-style dots, twinkling like the top art
    SPARKS.forEach(function (st) {
      var a = Math.pow(0.5 + 0.5 * Math.sin(t * st[3] + st[4]), 2), gx0 = Math.floor(st[0] / P), gy0 = Math.floor(st[1] / P);
      for (var d = -st[2]; d <= st[2]; d++) {
        var fall = Math.pow(1 - Math.abs(d) / (st[2] + 1), 1.4) * a;
        glyph(gx0 + d, gy0 + d, fall, 1); if (d) glyph(gx0 + d, gy0 - d, fall, 1);
      }
      glow(st[0], st[1], 10, 0.3 * a);
    });
    // reflected 4-point stars on the water
    STARS.forEach(function (s, idx) {
      if (idx % 3) return;
      var a = Math.pow(0.5 + 0.5 * Math.sin(t * s[3] * 0.8 + s[2] + 1), 2), gx0 = Math.floor(s[0] / P), gy0 = Math.floor(s[1] / P);
      glyph(gx0, gy0, a, 1);
      for (var d = 1; d <= 2; d++) { var f = a * (1 - d / 3); glyph(gx0 + d, gy0, f, 1); glyph(gx0 - d, gy0, f, 1); glyph(gx0, gy0 + d, f, 1); glyph(gx0, gy0 - d, f, 1); }
    });
    ctx.globalAlpha = 1;
  }

  // ---- loop: only while on screen; reduced motion gets one still frame ----
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var running = false, raf = 0, last = 0, start = performance.now(), visible = false, io = null;
  function tnow() { return (performance.now() - start) / 1000; }
  function tick(ts) { raf = requestAnimationFrame(tick); if (ts - last < 66) return; last = ts; frame((ts - start) / 1000); }
  function play() { if (!running && !reduce) { running = true; raf = requestAnimationFrame(tick); } }
  function stop() { running = false; cancelAnimationFrame(raf); }
  function onResize() { resize(); frame(tnow()); }
  function onVis() { if (document.hidden) stop(); else if (visible) play(); }
  function onMove(e) {
    var r = canvas.getBoundingClientRect(), x = (e.clientX - r.left) / scale, y = (e.clientY - r.top) / scale, t = tnow();
    if (len(x - lastSpawn.x, y - lastSpawn.y) > 16 || t - lastSpawn.t > 0.35) { lastSpawn = { x: x, y: y, t: t }; now = t; addRipple(x, y, 0.75); }
  }
  function onDown(e) { var r = canvas.getBoundingClientRect(); now = tnow(); addRipple((e.clientX - r.left) / scale, (e.clientY - r.top) / scale, 1); }

  resize(); frame(reduce ? 8 : 0);
  window.addEventListener('resize', onResize);
  if (!reduce) {
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; if (visible && !document.hidden) play(); else stop(); });
      io.observe(canvas);
    } else { visible = true; play(); }
    document.addEventListener('visibilitychange', onVis);
  }
  return {
    destroy: function () {
      stop(); if (io) io.disconnect();
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      document.removeEventListener('visibilitychange', onVis);
    }
  };
  } });
})();
