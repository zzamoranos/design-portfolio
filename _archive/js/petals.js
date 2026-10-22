// Footer concept — "petals": cherry-blossom petals floating on dark blue water, the reflection of
// bare branches wavering underneath and slow concentric ripples spreading through it all.
// Drawn as ASCII: every cell of a monospace grid picks a character by brightness
// (" .:-~=+*x%#@"), tinted from deep cobalt to near-white. Petals are small bright five-lobed
// stamps. A raindrop lands now and then; the pointer leaves ripples and nudges petals aside.
// One of the footer art modes (see js/footer-art.js). ~15fps while on screen; reduced motion gets one still frame.
(function () {
  'use strict';
  (window.FooterArt = window.FooterArt || []).push({ id: 'petals', label: 'Petals', mount: function (canvas) {
  var ctx = canvas.getContext('2d');

  // Scene units: 560 x 260; one character every 6 x 9 units
  var SW = 560, SH = 260, CW = 6, CH = 9, COLS = Math.floor(SW / CW), ROWS = Math.floor(SH / CH);
  var RAMP = ' .:-~=+*x%#@';

  function len(x, y) { return Math.sqrt(x * x + y * y); }
  function smooth(e0, e1, v) { var t = Math.max(0, Math.min(1, (v - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }
  var seed = 11;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  // ---- branch reflections: dark, gently forking streaks running down through the water ----
  // each [x at top, lean per unit of y, thickness, wobble phase]
  var BRANCHES = [];
  [[40, 0.12, 9], [96, -0.05, 6], [168, 0.22, 11], [214, -0.18, 5], [262, 0.08, 7], [318, 0.3, 10],
   [366, -0.1, 6], [404, 0.16, 8], [462, -0.24, 7], [508, 0.06, 9], [548, -0.14, 5]].forEach(function (b) {
    BRANCHES.push([b[0], b[1], b[2], rand() * 6.28]);
    // a thinner twig forking off part way down
    BRANCHES.push([b[0] + (rand() - 0.5) * 30, b[1] + (rand() > 0.5 ? 0.5 : -0.5), b[2] * 0.45, rand() * 6.28, 40 + rand() * 120]);
  });
  function branches(x, y, t) {
    var d = 0;
    for (var i = 0; i < BRANCHES.length; i++) {
      var B = BRANCHES[i];
      if (B[4] && y < B[4]) continue;                                // twigs start part way down
      var bx = B[0] + B[1] * y + 5 * Math.sin(y * 0.045 + t * 0.7 + B[3]) + 2 * Math.sin(y * 0.13 - t * 1.1 + B[3]);
      var w = B[2] * (0.75 + 0.25 * Math.sin(y * 0.02 + B[3]));
      d = Math.max(d, smooth(w, w * 0.3, Math.abs(x - bx)));
    }
    return d;
  }

  // ---- ripples: a standing set of rings left of centre (as in the photo), raindrops, and the pointer ----
  var CENTER = [150, 112];
  var RIPPLES = [], LIFE = 3.2, now = 0, lastDrop = 0, lastSpawn = { x: -99, y: -99, t: -1 };
  function addRipple(x, y, strength) {
    RIPPLES.push([x, y, now, strength]);
    if (RIPPLES.length > 14) RIPPLES.shift();
  }
  // returns [ring brightness, sideways displacement for the reflection]
  function ripples(x, y, t) {
    var e = len(x - CENTER[0], (y - CENTER[1]) / 0.62), b = 0, disp = 0;
    // the big slow rings: travelling outwards forever, fading with distance
    var wave = Math.sin(e * 0.22 - t * 1.6);
    var fade = smooth(250, 30, e);
    b += 0.34 * Math.pow(Math.max(0, wave), 8) * fade;
    disp += 4 * wave * fade;
    for (var r = 0; r < RIPPLES.length; r++) {
      var R = RIPPLES[r], age = t - R[2], d = len(x - R[0], (y - R[1]) / 0.62);
      for (var ring = 0; ring < 3; ring++) {
        var rad = age * 30 - ring * 12;
        if (rad <= 0) continue;
        var on = 1 - Math.abs(d - rad) / 7;
        if (on > 0) { var k = R[3] * on * Math.pow(1 - age / LIFE, 1.3) * (1 - ring * 0.25); b += 0.5 * k; disp += 6 * k; }
      }
    }
    return [b, disp];
  }

  // ---- petals [x, y, size, rotation, spin, drift x, drift y, bob phase, push x, push y] ----
  var PETALS = [];
  for (var n = 0; n < 34; n++) {
    var big = rand() < 0.35;
    PETALS.push([rand() * SW, rand() * SH, big ? 7 + rand() * 4 : 2.5 + rand() * 3, rand() * 6.28, (rand() - 0.5) * 0.15,
                 2 + rand() * 3, (rand() - 0.5) * 1.5, rand() * 6.28, 0, 0]);
  }
  // brightness of a five-lobed blossom (or a single loose petal when small) at a point
  function petalAt(x, y, P, px, py) {
    var dx = x - px, dy = y - py, r = len(dx, dy), s = P[2];
    if (r > s * 1.3) return 0;
    if (s < 5) return smooth(s, s * 0.3, r) * 0.95;                 // loose petal: a soft bright fleck
    var a = Math.atan2(dy, dx) - P[3];
    var lobe = s * (0.62 + 0.38 * Math.abs(Math.cos(a * 2.5)));     // five rounded lobes
    var body = smooth(lobe, lobe * 0.55, r);
    var core = smooth(s * 0.28, 0, r) * 0.25;                        // a faint pinkish-dark centre
    return Math.max(0, body - core);
  }

  // ---- drawing ----
  var LO = [62, 92, 184], HI = [240, 244, 255]; // deep cobalt in the shadows → near-white in the light
  var PETAL = [255, 236, 242];                 // petals a touch warm, like the photo
  var scale = 1, dpr = 1, fontPx = 9;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    scale = Math.min(w / SW, h / SH);
    fontPx = CH * scale * 1.05;
  }
  function mix(a, b, c) { return Math.round(a + (b - a) * c); }
  function ch(gx, gy, i, tint) {
    if (i < 0.05) return;
    i = Math.min(1, i);
    var c = i * i, col = tint || HI;
    ctx.fillStyle = 'rgba(' + mix(LO[0], col[0], c) + ',' + mix(LO[1], col[1], c) + ',' + mix(LO[2], col[2], c) + ',' + (0.2 + 0.8 * i).toFixed(2) + ')';
    ctx.fillText(RAMP.charAt(Math.min(RAMP.length - 1, Math.round(i * (RAMP.length - 1)))), (gx + 0.5) * CW * scale, (gy + 0.5) * CH * scale);
  }

  function frame(t) {
    now = t;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, SW * scale, SH * scale);
    ctx.font = '500 ' + fontPx.toFixed(2) + 'px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    // a raindrop now and then
    if (t - lastDrop > 2.6 + (Math.sin(t * 5.1) + 1)) {
      lastDrop = t;
      addRipple(40 + ((t * 977) % 480), 30 + ((t * 571) % 200), 0.6);
    }
    RIPPLES = RIPPLES.filter(function (r) { return t - r[2] < LIFE; });

    // move the petals: a slow drift to the right, bobbing on the rings, easing back after a push
    var pos = PETALS.map(function (P) {
      P[8] *= 0.94; P[9] *= 0.94;
      var x = (P[0] + t * P[5] + P[8]) % (SW + 40), y = P[1] + t * P[6] + P[9] + 1.5 * Math.sin(t * 0.8 + P[7]);
      if (x < 0) x += SW + 40;
      y = ((y % SH) + SH) % SH;
      return [x - 20, y];
    });

    for (var gy = 0; gy < ROWS; gy++) {
      for (var gx = 0; gx < COLS; gx++) {
        var x = (gx + 0.5) * CW, y = (gy + 0.5) * CH;
        // soft oval vignette so the water melts into the footer
        var v = smooth(1, 0.55, Math.pow((x - SW / 2) / (SW / 2), 2) + Math.pow((y - SH / 2) / (SH / 2), 2));
        if (v <= 0) continue;

        // petals sit on top of everything
        var p = 0;
        for (var j = 0; j < PETALS.length && p < 0.9; j++) p = Math.max(p, petalAt(x, y, PETALS[j], pos[j][0], pos[j][1]));
        if (p > 0.15) { ch(gx, gy, (0.55 + 0.45 * p) * (0.7 + 0.3 * v), PETAL); continue; }

        var rp = ripples(x, y, t), rx = x + rp[1];
        // the water: brighter sky towards the upper right, mottled by slow swells
        var sky = 0.16 + 0.36 * smooth(80, 560, rx + (SH - y) * 0.8);
        var swell = 0.5 + 0.5 * Math.sin(rx * 0.04 + t * 0.35 + 2 * Math.sin(y * 0.05 - t * 0.2));
        var mottle = 0.5 + 0.5 * Math.sin(rx * 0.017 - y * 0.03 + t * 0.15 + 1.7 * Math.sin(rx * 0.011 + t * 0.1));
        var i = sky * (0.35 + 1.1 * swell * swell * mottle);
        // branch reflections darken it, displaced by the ripples
        i *= 1 - 0.85 * branches(rx, y, t);
        i += rp[0];
        ch(gx, gy, i * v);
      }
    }
  }

  // ---- loop: ~15fps, only while visible ----
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var running = false, raf = 0, last = 0, start = performance.now(), visible = false, io = null;
  function tnow() { return (performance.now() - start) / 1000; }
  function tick(ts) {
    raf = requestAnimationFrame(tick);
    if (ts - last < 66) return;
    last = ts; frame((ts - start) / 1000);
  }
  function play() { if (!running && !reduce) { running = true; raf = requestAnimationFrame(tick); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  function toScene(e) { var r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) / scale, (e.clientY - r.top) / scale]; }
  // pointer pushes nearby petals away from it
  function nudge(x, y, force) {
    var t = tnow();
    PETALS.forEach(function (P) {
      var px = ((P[0] + t * P[5] + P[8]) % (SW + 40)) - 20, py = P[1] + t * P[6] + P[9];
      var dx = px - x, dy = py - y, d = len(dx, dy);
      if (d < 40 && d > 0.01) { var k = force * (1 - d / 40); P[8] += dx / d * k; P[9] += dy / d * k; }
    });
  }
  function onResize() { resize(); frame(tnow()); }
  function onVis() { if (document.hidden) stop(); else if (visible) play(); }
  function onMove(e) {
    var q = toScene(e), t = tnow();
    if (len(q[0] - lastSpawn.x, q[1] - lastSpawn.y) > 16 || t - lastSpawn.t > 0.35) {
      lastSpawn = { x: q[0], y: q[1], t: t };
      now = t; addRipple(q[0], q[1], 0.7); nudge(q[0], q[1], 6);
    }
  }
  function onDown(e) { var q = toScene(e); now = tnow(); addRipple(q[0], q[1], 1); nudge(q[0], q[1], 14); }

  resize(); frame(reduce ? 4 : 0);
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
