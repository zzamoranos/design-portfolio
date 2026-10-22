// Stars and sparkles over the top-of-page sky, stitched on a grid in the same style as the footer
// nebula: brightness picks the glyph (faint dot → + → cross-stitch x → bold x). Star positions come
// from the Figma "normal stars" (n) and "blinking stars" (b) layers, in the 1440px design's
// coordinates [kind, x, y, size]. Works in both themes (cobalt on the light sky, pale blue on the dark).
// ~30fps, only while the top of the page is on screen; reduced motion gets one still frame.
(function () {
  'use strict';
  var canvas = document.querySelector('.decor__sky');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  var STARS = [
    ['n',1362.5,81.5,3],['n',1186.5,223.5,3],['n',1241.5,59.5,3],['n',1151.5,71.5,1],['n',1189.5,58.5,1],['n',893.5,36.5,1],
    ['n',1268.5,94.5,1],['n',1313.5,64.5,1],['n',1330.5,153.5,1],['n',1122.5,106.5,1],['n',864.5,158.5,1],['n',1013.5,157.5,1],
    ['n',998.5,143.5,1],['n',936.5,297.5,1],['n',367,82,2],['n',555,73,2],['n',279,294,2],['n',1001,73,2],['n',1068,217,2],
    ['n',1049,207,2],['n',967,222,2],['n',348.5,66.5,1],['n',621,79,6],['n',243,180,6],['n',178,82,2],['n',302,172,2],
    ['n',221,87,2],['n',197.5,103.5,1],['n',307.5,262.5,1],['n',1227.5,45.5,1],['n',1207.5,97.5,1],['n',1187.5,149.5,1],
    ['n',1167.5,201.5,1],['n',1088.5,121.5,1],['n',761.5,97.5,1],['n',952.5,59.5,1],['n',976,81,2],['n',832.5,57.5,1],
    ['n',906.5,91.5,1],['n',609,57,2],['n',1046,147,2],['n',1101,92,2],['n',334,37,2],['n',252,156,2],['n',1167.5,78.5,3],
    ['n',1344.5,178.5,3],['n',1254.5,302.5,3],['n',1071.5,274.5,3],['n',1285.5,97.5,3],['n',1311.5,212.5,3],['n',1129.5,185.5,1],
    ['n',1251.5,115.5,1],['n',1299.5,158.5,1],['n',1320.5,144.5,1],['n',1402.5,144.5,1],['n',1032.5,27.5,1],['n',684.5,61.5,1],
    ['n',423.5,61.5,1],['n',375,69,2],['n',269,243,2],['n',240,337,2],['n',386.5,134.5,1],['n',183.5,228.5,1],['n',507.5,29.5,1],
    ['n',1319.5,32.5,7],['n',640,42,4],['n',497,51,4],['n',401,90,4],['n',418,76,2],['n',498,112,2],['n',539,131,2],
    ['n',571,340,2],['n',790,313,2],['n',609,324,2],['n',807,305,2],['n',957,321,2],['n',945,169,2],['n',375,219,2],
    ['n',329,406,2],['n',748,148,2],['n',296,90,4],['n',197,107,4],['n',322,128,4],['n',223,46,4],
    ['b',1376.5,59.5,5],['b',249,54,6],['b',301,193,6],['b',361,344,6],['b',209,255,6],['b',705,118,2],['b',1230,140,6],
    ['b',1373.5,240.5,3],['b',1033,238,2],['b',803,72,4],['b',1400.5,96.5,7],['b',1001.5,127.5,7],['b',522.5,80.5,7]
  ];
  // diagonal x sparkles, like the braille ones in the sky art [x, y, ray length in stitches]
  var SPARKS = [[452, 214, 4], [868, 252, 5], [1104, 30, 4], [150, 330, 3], [690, 200, 3]];
  var FRAME_W = 1600, FRAME_H = 440, OFFSET_X = 80, P = 4; // 1440 design centered in the 1600 frame

  var seed = 7;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  STARS.forEach(function (s) { s.push(0.4 + rand() * 1.2, rand() * 6.28); }); // twinkle speed, phase
  SPARKS.forEach(function (s) { s.push(0.3 + rand() * 0.4, rand() * 6.28); });

  var PALETTE = {
    dark: ['86,108,200', '104,128,220', '141,168,238', '170,190,245', '210,222,255', '238,243,255'],
    light: ['126,152,236', '102,132,232', '74,110,226', '52,92,220', '38,78,214', '28,66,205']
  };
  var WHITE = ['246,248,255', '248,250,255', '250,251,255', '252,253,255', '255,255,255', '255,255,255'];
  var LEVELS = 6, SPR = [], SPRW = [], cell = 1, k = 1, dpr = 1, COLS = 0, ROWS = 0, theme = 'light';
  function makeSprites() {
    SPR = build(PALETTE[theme]);
    SPRW = build(WHITE); // the glowing stars, white in both themes
  }
  function build(cols) {
    var out = [];
    for (var l = 0; l < LEVELS; l++) {
      var c = document.createElement('canvas'), n = Math.max(4, Math.round(cell));
      c.width = c.height = n;
      var g = c.getContext('2d'), col = 'rgb(' + cols[l] + ')', m = n * 0.2;
      g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round';
      if (l === 0) { g.beginPath(); g.arc(n / 2, n / 2, n * 0.09, 0, 6.2832); g.fill(); }
      else if (l === 1) { g.beginPath(); g.arc(n / 2, n / 2, n * 0.13, 0, 6.2832); g.fill(); }
      else if (l === 2) { g.lineWidth = n * 0.11; g.beginPath(); g.moveTo(n / 2, m + n * 0.08); g.lineTo(n / 2, n - m - n * 0.08); g.moveTo(m + n * 0.08, n / 2); g.lineTo(n - m - n * 0.08, n / 2); g.stroke(); }
      else { g.lineWidth = n * (l === 5 ? 0.2 : l === 4 ? 0.16 : 0.12); var mm = l === 3 ? m * 1.2 : m; g.beginPath(); g.moveTo(mm, mm); g.lineTo(n - mm, n - mm); g.moveTo(n - mm, mm); g.lineTo(mm, n - mm); g.stroke(); }
      out.push(c);
    }
    return out;
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    k = w / FRAME_W; cell = P * dpr; COLS = Math.ceil(w / P); ROWS = Math.ceil(h / P);
    theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    makeSprites();
    markBlocked();
  }
  // Keep stars off the text: the sky is a fixed 1600px frame but the sidebar and content move with
  // the window, so at some widths a star would land right next to a word. Skip any that would.
  var TEXT = '.sidebar a, .sidebar p, .topbar, .main h1, .main h2, .main p, .main a';
  function markBlocked() {
    var c = canvas.getBoundingClientRect(), boxes = [];
    document.querySelectorAll(TEXT).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (!r.width || r.top - c.top > c.height) return;
      boxes.push([r.left - c.left, r.top - c.top, r.right - c.left, r.bottom - c.top]);
    });
    function near(x, y, pad) {
      for (var i = 0; i < boxes.length; i++) { var b = boxes[i]; if (x > b[0] - pad && x < b[2] + pad && y > b[1] - pad && y < b[3] + pad) return true; }
      return false;
    }
    STARS.forEach(function (s) { s.blocked = near((s[1] + OFFSET_X) * k, s[2] * k, s[0] === 'b' ? Math.max(2, Math.round(s[3] * 0.7)) * P + 28 : 10); });
    SPARKS.forEach(function (sp) { sp.blocked = near((sp[0] + OFFSET_X) * k, sp[1] * k, sp[2] * P + 12); });
  }
  // white: the glowing stars. On the light sky they get a faint neutral shadow so they stay visible.
  function put(gx, gy, i, white) {
    if (i < 0.08 || gx < 0 || gy < 0 || gx >= COLS || gy >= ROWS) return;
    i = Math.min(1, i);
    var lightWhite = white && theme === 'light';
    ctx.globalAlpha = 0.45 + 0.55 * i;
    if (lightWhite) { ctx.shadowColor = 'rgba(70,78,110,.45)'; ctx.shadowBlur = 2 * dpr; }
    ctx.drawImage((white ? SPRW : SPR)[Math.min(LEVELS - 1, Math.floor(i * LEVELS))], gx * cell, gy * cell, cell, cell);
    if (lightWhite) ctx.shadowBlur = 0;
  }
  function glow(x, y, r, a) {
    var rgb = '255,255,255';
    var g = ctx.createRadialGradient(x * dpr, y * dpr, 0, x * dpr, y * dpr, r * dpr);
    g.addColorStop(0, 'rgba(' + rgb + ',' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x * dpr, y * dpr, r * dpr, 0, 6.2832); ctx.fill();
  }
  function cellOf(x, y) { return [Math.floor((x + OFFSET_X) * k / P), Math.floor(y * k / P)]; }

  var METEOR = null, nextMeteor = 3;
  // small shooting stars, kept to the empty margins so they never cross the text
  // (design coords: right of the content, a thin strip above the intro, the corner above the logo)
  // [x0, x1, y0, y1] spawn areas; each streak then drifts ~100 left and ~55 down
  var MINI_ZONES = [[1340, 1520, 0, 300], [520, 1300, 0, 40], [-70, 120, 0, 35]];
  var MINIS = [], nextMini = 1.5;
  function frame(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var dim = theme === 'dark' ? 1 : 0.8;

    STARS.forEach(function (s) {
      if (s.blocked) return;
      var tw = 0.5 + 0.5 * Math.sin(t * s[4] + s[5]), c = cellOf(s[1], s[2]);
      if (s[0] === 'b') { // four-point stitched star with thin fading rays and a soft glow
        var a = (0.3 + 0.7 * tw * tw) * dim, L = Math.max(2, Math.round(s[3] * 0.7));
        glow((s[1] + OFFSET_X) * k, s[2] * k, L * 5, (theme === 'dark' ? 0.22 : 0.7) * a);
        put(c[0], c[1], a, true);
        for (var d = 1; d <= L; d++) { var f = a * Math.pow(1 - d / (L + 1), 1.3); put(c[0] + d, c[1], f, true); put(c[0] - d, c[1], f, true); put(c[0], c[1] + d, f * 0.85, true); put(c[0], c[1] - d, f * 0.85, true); }
      } else { // small stars: dots and + stitches by size
        var base = s[3] >= 6 ? 0.62 : s[3] >= 3 ? 0.42 : s[3] >= 2 ? 0.3 : 0.2;
        put(c[0], c[1], base * (0.45 + 0.55 * tw) * dim);
      }
    });
    SPARKS.forEach(function (sp) {
      if (sp.blocked) return;
      var a = Math.pow(0.5 + 0.5 * Math.sin(t * sp[3] + sp[4]), 2) * dim, c = cellOf(sp[0], sp[1]);
      for (var d = -sp[2]; d <= sp[2]; d++) { var f = a * Math.pow(1 - Math.abs(d) / (sp[2] + 1), 1.4); put(c[0] + d, c[1] + d, f, true); if (d) put(c[0] + d, c[1] - d, f, true); }
    });

    // now and then a shooting star crosses the upper sky
    if (!METEOR && t > nextMeteor) METEOR = { x: 700 + rand() * 700, y: 10 + rand() * 120, t0: t, life: 1.3, len: 120 + rand() * 80 };
    if (METEOR) {
      var kk = (t - METEOR.t0) / METEOR.life;
      if (kk >= 1) { METEOR = null; nextMeteor = t + 6 + rand() * 6; }
      else {
        var dd = kk * 420, hx = METEOR.x - dd * 0.88, hy = METEOR.y + dd * 0.47, a2 = Math.sin(Math.PI * kk) * dim * (theme === 'dark' ? 0.6 : 1);
        for (var s2 = 0; s2 <= METEOR.len; s2 += 3.5) { var c2 = cellOf(hx + s2 * 0.88, hy - s2 * 0.47); put(c2[0], c2[1], a2 * Math.pow(1 - s2 / METEOR.len, 1.5), true); }
        var h = cellOf(hx, hy); put(h[0], h[1], a2, true); put(h[0] + 1, h[1], a2 * 0.5, true); put(h[0] - 1, h[1], a2 * 0.5, true); put(h[0], h[1] + 1, a2 * 0.5, true); put(h[0], h[1] - 1, a2 * 0.5, true);
        glow((hx + OFFSET_X) * k, hy * k, 12, 0.4 * a2);
      }
    }
    // small ones: short, faint streaks in the margins
    if (t > nextMini) {
      var z = MINI_ZONES[Math.floor(rand() * MINI_ZONES.length)];
      MINIS.push({ x: z[0] + 40 + rand() * (z[1] - z[0] - 40), y: z[2] + rand() * (z[3] - z[2] - 30), t0: t, life: 0.7 + rand() * 0.4, len: 30 + rand() * 30, travel: 70 + rand() * 50 });
      nextMini = t + 2 + rand() * 3;
    }
    MINIS = MINIS.filter(function (m) { return t - m.t0 < m.life; });
    MINIS.forEach(function (m) {
      var q = (t - m.t0) / m.life, mx = m.x - q * m.travel * 0.88, my = m.y + q * m.travel * 0.47, a3 = Math.sin(Math.PI * q) * dim * 0.45;
      for (var s3 = 0; s3 <= m.len; s3 += 3.5) { var c3 = cellOf(mx + s3 * 0.88, my - s3 * 0.47); put(c3[0], c3[1], a3 * Math.pow(1 - s3 / m.len, 1.6), true); }
      var hh = cellOf(mx, my); put(hh[0], hh[1], a3 * 1.3, true);
      glow((mx + OFFSET_X) * k, my * k, 6, 0.25 * a3);
    });
    ctx.globalAlpha = 1;
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var running = false, raf = 0, last = 0, start = performance.now(), visible = true;
  function tnow() { return (performance.now() - start) / 1000; }
  function tick(ts) { raf = requestAnimationFrame(tick); if (ts - last < 33) return; last = ts; frame((ts - start) / 1000); }
  function play() { if (!running && !reduce) { running = true; raf = requestAnimationFrame(tick); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  resize(); frame(reduce ? 2 : 0);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { markBlocked(); frame(tnow()); }); // text settles once fonts load
  // resize and theme changes rebuild the sprites at most once per frame
  var pending = 0;
  function refresh() { if (!pending) pending = requestAnimationFrame(function () { pending = 0; resize(); frame(tnow()); }); }
  window.addEventListener('resize', refresh);
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (reduce) return;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; if (visible && !document.hidden) play(); else stop(); }).observe(canvas);
  } else play();
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (visible) play(); });
})();
