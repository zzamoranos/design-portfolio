// Footer night sky: a nebula stitched across the whole footer like the top-of-page ASCII art —
// star-dust bands with thin streaks, a twinkling star field, cross-stitch stars and x sparkles,
// shooting stars with stitched tails, and star dust that trails the pointer.
(function () {
  'use strict';
  var canvas = document.querySelector('.footer__sky');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  var P = 5; // one stitch every 5 CSS px
  var SW = 0, SH = 0, COLS = 0, ROWS = 0, N = 0;
  function len(x, y) { return Math.sqrt(x * x + y * y); }
  function smooth(e0, e1, v) { var t = Math.max(0, Math.min(1, (v - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }
  var seed = 19;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function bez(p, t) {
    var u = 1 - t;
    return [u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0],
            u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]];
  }
  
  // Nebula bands as curves in 0–1 footer space, width as a share of the footer height
  var BANDS = [
    { p: [[-0.05, 0.86], [0.25, 0.30], [0.60, 0.80], [1.05, 0.18]], w: 0.15, a: 0.75 },
    { p: [[-0.05, 0.40], [0.30, 0.08], [0.68, 0.50], [1.05, 0.60]], w: 0.10, a: 0.55 },
    { p: [[0.10, 1.05], [0.42, 0.78], [0.75, 0.95], [1.05, 0.74]], w: 0.09, a: 0.45 }
  ];

  // Thin streaks, like light catching the edge of a swirl (curves in 0–1 footer space)
  var STREAKS = [
    [[-0.05, 0.80], [0.25, 0.24], [0.60, 0.74], [1.05, 0.12]], [[-0.05, 0.92], [0.27, 0.36], [0.62, 0.86], [1.05, 0.25]],
    [[-0.05, 0.34], [0.30, 0.02], [0.68, 0.44], [1.05, 0.54]]
  ];
  var NEB, ALONG, QUIET, BUF, JIT, JX, JY, FIELD, CROSSES, SPARKS, STREAK, GRAIN;
  // Everything that depends on the footer's size, rebuilt on resize
  function build() {
    seed = 19;
    N = COLS * ROWS;
    NEB = new Float32Array(N); ALONG = new Float32Array(N); BUF = new Float32Array(N); QUIET = new Float32Array(N);
    STREAK = []; GRAIN = new Float32Array(N);
    JIT = new Uint8Array(N); JX = new Float32Array(N); JY = new Float32Array(N);
    for (var gi = 0; gi < N; gi++) {
      var hsh = Math.sin(gi * 12.9898) * 43758.5453; GRAIN[gi] = hsh - Math.floor(hsh); // fixed per-cell noise
      var hx = Math.sin(gi * 78.233) * 24634.6345, hy = Math.sin(gi * 39.346) * 11135.1374;
      JX[gi] = (hx - Math.floor(hx) - 0.5) * 0.8; JY[gi] = (hy - Math.floor(hy) - 0.5) * 0.8;     // nudge for loose dots, so they don't sit on a grid
    }
    STREAKS.forEach(function (p, si) { // dotted along the curve, every other stitch
      for (var i = 0; i <= 400; i += 3) { var q = bez(p, i / 400); STREAK.push([Math.floor(q[0] * SW / P), Math.floor(q[1] * SH / P), i / 400, si]); }
    });
    BANDS.forEach(function (b) {
      var pts = [], w = b.w * SH;
      for (var i = 0; i <= 120; i++) { var q = bez(b.p, i / 120); pts.push([q[0] * SW, q[1] * SH]); }
      for (var gy = 0; gy < ROWS; gy++) for (var gx = 0; gx < COLS; gx++) {
        var x = (gx + 0.5) * P, y = (gy + 0.5) * P, best = 1e9, bi = 0;
        for (var j = 0; j < pts.length; j += 2) { var d = len(x - pts[j][0], y - pts[j][1]); if (d < best) { best = d; bi = j; } }
        var v = b.a * Math.exp(-Math.pow(best / w, 2) * 2.2), k = gy * COLS + gx;
        if (v > NEB[k]) { NEB[k] = v; ALONG[k] = bi / 120; }
      }
    });
    // quiet zones behind the footer text: the nebula dims to a faint glow there
    var c = canvas.getBoundingClientRect(), pad = 28;
    QUIET.fill(1);
    document.querySelectorAll('.footer__name, .footer__links').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (!r.width) return;
      var x0 = r.left - c.left, y0 = r.top - c.top, x1 = r.right - c.left, y1 = r.bottom - c.top;
      for (var gy = 0; gy < ROWS; gy++) for (var gx = 0; gx < COLS; gx++) {
        var x = (gx + 0.5) * P, y = (gy + 0.5) * P;
        var dx = Math.max(x0 - x, 0, x - x1), dy = Math.max(y0 - y, 0, y - y1), d = len(dx, dy);
        var k = gy * COLS + gx; QUIET[k] = Math.min(QUIET[k], 0.12 + 0.88 * smooth(4, pad, d));
      }
    });
    // stars scale with the footer's area
    var area = SW * SH / (560 * 260);
    // star field on a jittered grid: one star per tile, so they spread evenly without clumps
    FIELD = [];
    var tile = Math.sqrt(SW * SH / Math.max(1, Math.round(110 * area)));
    for (var ty = 0; ty < SH; ty += tile) for (var tx = 0; tx < SW; tx += tile) {
      var r0 = rand(), fx = tx + tile * (0.15 + rand() * 0.7), fy = ty + tile * (0.15 + rand() * 0.7);
      FIELD.push([Math.floor(fx / P), Math.floor(fy / P), 0.5 + rand() * 1.8, rand() * 6.28, r0 < 0.72 ? 0.16 + rand() * 0.14 : r0 < 0.94 ? 0.34 + rand() * 0.12 : 0.6 + rand() * 0.2]);
    }
    // bigger stars and sparkles keep their distance from each other
    var placed = [];
    function spaced(count, make) {
      var out = [], minD = Math.sqrt(SW * SH / Math.max(1, count)) * 0.75;
      for (var n = 0, tries = 0; n < count && tries < count * 40; tries++) {
        var x = SW * (0.03 + rand() * 0.94), y = SH * (0.06 + rand() * 0.88), ok = true;
        for (var j = 0; j < placed.length; j++) if (len(x - placed[j][0], y - placed[j][1]) < minD) { ok = false; break; }
        if (ok) { placed.push([x, y]); out.push(make(x, y)); n++; }
      }
      return out;
    }
    CROSSES = spaced(Math.round(5 * area), function (x, y) { return [x, y, 4 + Math.floor(rand() * 5), 0.4 + rand() * 0.5, rand() * 6.28]; });
    SPARKS = spaced(Math.round(3 * area), function (x, y) { return [x, y, 4 + Math.floor(rand() * 3), 0.4 + rand() * 0.25, rand() * 6.28]; });
  }

  // ---- shooting stars and pointer dust ----
  var METEORS = [], nextMeteor = 1.2, DUST = [], now = 0;

  // ---- glyph sprites ----
  var LEVELS = 6, SPR = [], cell = 1, dpr = 1;
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
  function resize(force) {
    var w = canvas.clientWidth, h = canvas.clientHeight, r = Math.min(window.devicePixelRatio || 1, 2);
    if (!force && w === SW && h === SH && r === dpr) return false; // e.g. mobile toolbar resizes: nothing to rebuild
    dpr = r; SW = w; SH = h;
    canvas.width = Math.round(SW * dpr); canvas.height = Math.round(SH * dpr);
    COLS = Math.ceil(SW / P); ROWS = Math.ceil(SH / P);
    cell = P * dpr; makeSprites(); build();
    return true;
  }
  function put(gx, gy, i, loose) { if (gx >= 0 && gy >= 0 && gx < COLS && gy < ROWS) { var k = gy * COLS + gx; if (i > BUF[k]) { BUF[k] = i; JIT[k] = loose ? 1 : 0; } } }
  function glow(x, y, r, a) {
    var q = QUIET[Math.min(N - 1, Math.max(0, Math.floor(y / P) * COLS + Math.floor(x / P)))] || 1;
    a *= q; if (a < 0.01) return;
    var g = ctx.createRadialGradient(x * dpr, y * dpr, 0, x * dpr, y * dpr, r * dpr);
    g.addColorStop(0, 'rgba(226,234,255,' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(141,168,238,0)');
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x * dpr, y * dpr, r * dpr, 0, 6.2832); ctx.fill();
  }

  function frame(t) {
    now = t;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    BUF.fill(0); JIT.fill(0);

    // nebula: dithered bands with light travelling slowly along them
    for (var k = 0; k < N; k++) {
      var nv = NEB[k];
      if (nv < 0.04) continue;
      var gx = k % COLS, gy = (k / COLS) | 0;
      // star dust: a scatter of fine dots whose density follows the band (milky-way stipple)
      var v = nv * (0.8 + 0.2 * Math.sin(ALONG[k] * 18 - t * 0.4));
      var gr = GRAIN[k];
      if (gr < v * 0.55) { BUF[k] = 0.15 + 0.3 * v + (gr < v * 0.05 ? 0.24 : 0) * (0.6 + 0.4 * Math.sin(t * 1.3 + gr * 90)); JIT[k] = 1; }
    }
    // thin dotted streaks with light gliding along them
    STREAK.forEach(function (p) { var g = 0.5 + 0.5 * Math.sin(p[2] * 9 - t * 0.6 + p[3] * 2); put(p[0], p[1], 0.14 + 0.24 * g * g); });
    FIELD.forEach(function (s) { put(s[0], s[1], s[4] * (0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * s[2] + s[3]), 3)) + 0.05, true); });
    CROSSES.forEach(function (c) {
      var a = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * c[3] + c[4]), 2), gx = Math.floor(c[0] / P), gy = Math.floor(c[1] / P);
      put(gx, gy, a);
      for (var d = 1; d <= c[2]; d++) { var f = a * 0.8 * Math.pow(1 - d / (c[2] + 1), 1.6); put(gx + d, gy, f); put(gx - d, gy, f); if (d <= c[2] * 0.7) { put(gx, gy + d, f * 0.8); put(gx, gy - d, f * 0.8); } }
    });
    SPARKS.forEach(function (sp) {
      var a = Math.pow(0.5 + 0.5 * Math.sin(t * sp[3] + sp[4]), 2), gx = Math.floor(sp[0] / P), gy = Math.floor(sp[1] / P);
      for (var d = -sp[2]; d <= sp[2]; d++) { var f = a * Math.pow(1 - Math.abs(d) / (sp[2] + 1), 1.4); put(gx + d, gy + d, f); if (d) put(gx + d, gy - d, f); }
    });

    // shooting stars: a bright head with a stitched tail, upper right to lower left
    if (t > nextMeteor) {
      var spawn = function (delay, scaleLen) { METEORS.push({ x: SW * (0.25 + rand() * 0.8), y: -10 + rand() * SH * 0.3, t0: t + delay, life: 1 + rand() * 0.8, len: (110 + rand() * 120) * scaleLen }); };
      spawn(0, 1);
      if (SW > 900 || rand() < 0.3) spawn(0.15 + rand() * 0.4, 0.8); // wide footers get company
      nextMeteor = t + 1.6 + rand() * 2.6;
    }
    METEORS = METEORS.filter(function (m) { return t - m.t0 < m.life; });
    METEORS.forEach(function (m) {
      var age = t - m.t0; if (age < 0) return;
      var kk = age / m.life, dd = kk * Math.max(280, SH * 1.4), hx = m.x - dd * 0.86, hy = m.y + dd * 0.5, a = Math.sin(Math.PI * Math.min(1, kk * 1.15));
      for (var s = 0; s <= m.len; s += P * 0.8) put(Math.floor((hx + s * 0.86) / P), Math.floor((hy - s * 0.5) / P), Math.pow(1 - s / m.len, 2.2) * a * 0.85);
      var hgx = Math.floor(hx / P), hgy = Math.floor(hy / P);
      put(hgx, hgy, a); put(hgx + 1, hgy, a * 0.5); put(hgx - 1, hgy, a * 0.5); put(hgx, hgy + 1, a * 0.5); put(hgx, hgy - 1, a * 0.5);
      glow(hx, hy, 9, 0.45 * a);
    });

    DUST = DUST.filter(function (d) { return t - d.t0 < 1.4; });
    DUST.forEach(function (d) { var kk = (t - d.t0) / 1.4; put(Math.floor((d.x + d.vx * kk * 18) / P), Math.floor((d.y + d.vy * kk * 18 + kk * 6) / P), d.b * (1 - kk)); });

    CROSSES.forEach(function (c) { glow(c[0], c[1], c[2] * 4, 0.18 * (0.4 + 0.6 * Math.pow(0.5 + 0.5 * Math.sin(t * c[3] + c[4]), 2))); });

    // stitch it out: dimmed behind the text, and feathered along the top edge into the page above
    for (var q = 0; q < N; q++) {
      var i = BUF[q];
      if (i < 0.08) continue;
      var cy = (q / COLS) | 0, cx = q - cy * COLS;
      var fade = QUIET[q] * smooth(0, 24, (cy + 0.5) * P);
      if (fade < 0.05) continue;
      ctx.globalAlpha = Math.min(1, (0.45 + 0.55 * Math.min(1, i)) * fade);
      var ox = JIT[q] ? JX[q] * cell : 0, oy = JIT[q] ? JY[q] * cell : 0; // loose dots are nudged off the grid
      ctx.drawImage(SPR[Math.min(LEVELS - 1, Math.floor(Math.min(1, i) * LEVELS))], cx * cell + ox, cy * cell + oy, cell, cell);
    }
    ctx.globalAlpha = 1;
  }

  function onMove(e) {
    var r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    for (var i = 0; i < 2; i++) DUST.push({ x: x, y: y, t0: now, vx: rand() - 0.5, vy: rand() - 0.3, b: 0.5 + rand() * 0.5 });
    if (DUST.length > 90) DUST.splice(0, DUST.length - 90);
  }
  function onDown(e) { // a tap sends a shooting star from where you touched
    var r = canvas.getBoundingClientRect();
    METEORS.push({ x: e.clientX - r.left + 40, y: e.clientY - r.top - 24, t0: now, life: 0.9, len: 60 });
  }

  // ---- loop: only while on screen; reduced motion gets one still frame ----
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var running = false, raf = 0, last = 0, start = performance.now() - (Date.now() - (window.SKY_EPOCH || Date.now())), visible = false, rz = 0;
  function tnow() { return (performance.now() - start) / 1000; }
  function tick(ts) { raf = requestAnimationFrame(tick); if (ts - last < 33) return; last = ts; frame((ts - start) / 1000); }
  function play() { if (!running && !reduce) { running = true; raf = requestAnimationFrame(tick); } }
  function stop() { running = false; cancelAnimationFrame(raf); }
  // rebuilding the sky is not free, so wait for the resize to settle
  function onResize() { clearTimeout(rz); rz = setTimeout(function () { if (resize()) frame(tnow()); }, 120); }

  nextMeteor = tnow() + 1.2;
  resize(true); frame(reduce ? 4 : tnow());
  window.addEventListener('resize', onResize);
  // the quiet zones follow the footer text, which shifts once the web fonts arrive
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { resize(true); frame(tnow()); });
  if (reduce) return;
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onDown);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; if (visible && !document.hidden) play(); else stop(); }).observe(canvas);
  } else { visible = true; play(); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (visible) play(); });
})();
