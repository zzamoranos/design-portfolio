// Footer pond: a glowing cat standing on a lily pad under starbursts, drawn as a halftone of
// braille-style dots in the same blues as the top-of-page ASCII art. Lily pads use a checkerboard
// dither with a solid underside. The water drifts, raindrops fall now and then, and the pointer
// leaves ripples behind it. ~15fps while the footer is on screen; reduced motion gets one still frame.
(function () {
  'use strict';
  // Registers as a footer art mode; js/footer-art.js mounts one mode at a time on the footer canvas.
  (window.FooterArt = window.FooterArt || []).push({ id: 'pond', label: 'Pond', mount: function (canvas) {
  var ctx = canvas.getContext('2d');

  // Scene units: 560 x 260, sampled every 5 units
  var SW = 560, SH = 260, P = 5, COLS = SW / P, ROWS = SH / P;

  // ---- distance-field helpers (negative = inside) ----
  function len(x, y) { return Math.sqrt(x * x + y * y); }
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
  function smooth(e0, e1, v) { var t = Math.max(0, Math.min(1, (v - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }
  function bezier(p, n, r0, r1) {
    var out = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n, u = 1 - t;
      out.push([u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0],
                u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1], r0 + (r1 - r0) * t]);
    }
    return out;
  }
  function sdPath(x, y, pts) {
    var d = 1e9;
    for (var i = 0; i < pts.length - 1; i++) d = Math.min(d, sdSeg(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]) - pts[i][2]);
    return d;
  }

  // ---- the cat: side view, standing on the middle pad, head up, tail curling (faces left) ----
  var TAIL = bezier([[330, 124], [356, 124], [366, 96], [348, 82]], 24, 4.6, 2.6);
  function sdCat(x, y) {
    var d = sdEllipse(x, y, 302, 128, 32, 15);                    // body
    d = Math.min(d, sdEllipse(x, y, 276, 124, 15, 17));            // chest
    d = Math.min(d, sdEllipse(x, y, 323, 130, 14, 15));            // haunch
    d = Math.min(d, sdEllipse(x, y, 268, 110, 10, 12));            // neck
    d = Math.min(d, sdEllipse(x, y, 258, 98, 14, 12));             // head
    d = Math.min(d, sdEllipse(x, y, 247, 103, 7, 5.5));           // muzzle
    d = Math.min(d, sdTri(x, y, [247, 92], [249, 72], [259, 88]) - 1.5); // front ear
    d = Math.min(d, sdTri(x, y, [261, 88], [269, 71], [273, 93]) - 1.5); // back ear
    d = Math.min(d, sdSeg(x, y, 272, 134, 268, 158) - 4.2);        // front legs
    d = Math.min(d, sdSeg(x, y, 284, 136, 286, 158) - 3.8);
    d = Math.min(d, sdSeg(x, y, 326, 138, 322, 158) - 4.4);        // back legs
    d = Math.min(d, sdSeg(x, y, 312, 140, 306, 158) - 3.6);
    d = Math.min(d, sdPath(x, y, TAIL));                           // tail
    return d;
  }

  // ---- lily pads [cx, cy, rx, ry] (flat, dithered, with a solid underside) ----
  var PADS = [[296, 166, 96, 26], [106, 202, 72, 18], [470, 208, 66, 17], [150, 98, 48, 14], [452, 104, 56, 15], [48, 148, 34, 10], [538, 150, 28, 9], [226, 238, 42, 11], [372, 240, 34, 10]];
  // Things growing from the pads
  var LOTUS = { x: 472, y: 170, stem: [472, 204, 472, 176] };
  var LEAF = { x: 94, y: 172, stem: [94, 200, 94, 175] };       // a small leaf held up on a stem
  var BUD = { x: 162, y: 76, stem: [160, 98, 162, 82] };

  function sdLotus(x, y) {
    var L = LOTUS, d = sdEllipse(x, y, L.x, L.y - 8, 4.5, 9);
    d = Math.min(d, sdEllipse(x, y, L.x - 8, L.y - 3, 5, 7), sdEllipse(x, y, L.x + 8, L.y - 3, 5, 7));
    d = Math.min(d, sdEllipse(x, y, L.x - 15, L.y + 2, 6, 4), sdEllipse(x, y, L.x + 15, L.y + 2, 6, 4));
    return Math.min(d, sdEllipse(x, y, L.x, L.y + 3, 14, 3.5));
  }

  // ---- precompute the still layer ----
  var N = COLS * ROWS;
  var STILL = new Array(N), CLEAR = new Uint8Array(N), HALO = new Float32Array(N);
  for (var gy = 0; gy < ROWS; gy++) {
    for (var gx = 0; gx < COLS; gx++) {
      var x = (gx + 0.5) * P, y = (gy + 0.5) * P, k = gy * COLS + gx, s = null;
      var dc = sdCat(x, y);
      if (dc < 0) s = 0.82 + 0.18 * smooth(0, -8, dc);                       // luminous silhouette
      else {
        HALO[k] = dc < 4 ? 0 : 0.32 * Math.exp(-(dc - 4) / 9);               // halftone glow around the cat
        // things on stems
        if (sdLotus(x, y) < 0) s = 0.92;
        else if (sdEllipse(x, y, LEAF.x, LEAF.y, 17, 3.6) < 0) s = 0.75;
        else if (sdEllipse(x, y, BUD.x, BUD.y, 3, 5) < 0) s = 0.85;
        else if ((sdSeg(x, y, LOTUS.stem[0], LOTUS.stem[1], LOTUS.stem[2], LOTUS.stem[3]) < 1.6 ||
                  sdSeg(x, y, LEAF.stem[0], LEAF.stem[1], LEAF.stem[2], LEAF.stem[3]) < 1.6 ||
                  sdSeg(x, y, BUD.stem[0], BUD.stem[1], BUD.stem[2], BUD.stem[3]) < 1.6) && gy % 2 === 0) s = 0.6;
        // pads: checkerboard dither on top, solid underside along the lower rim
        for (var p = 0; p < PADS.length && s === null; p++) {
          var Q = PADS[p], dp = sdEllipse(x, y, Q[0], Q[1], Q[2], Q[3]);
          if (dp >= 0) { if (dp < 6) CLEAR[k] = 1; continue; }
          CLEAR[k] = 1;
          var under = y > Q[1] + Q[3] * 0.2 && dp > -5.5;
          if (under) s = 0.88;
          else if ((gx + gy) % 2 === 0) s = 0.55;
          break;
        }
      }
      STILL[k] = s;
    }
  }

  // Starbursts made of braille dots [x, y, ray length in dots, speed, phase]; plus soft blurred glow points.
  var SPARKS = [[58, 44, 9, 0.5, 0.3], [440, 32, 12, 0.4, 2.2], [526, 92, 6, 0.6, 4.1], [204, 24, 5, 0.7, 1.4], [24, 112, 4, 0.55, 5.0], [330, 44, 6, 0.45, 3.4]];
  var GLOWS = [[120, 22, 2.6, 0.8, 0.1], [272, 30, 2.2, 1.1, 1.9], [378, 18, 1.8, 0.9, 3.3], [508, 62, 2.4, 0.7, 4.6], [222, 62, 1.6, 1.3, 2.8], [30, 70, 1.8, 1.0, 5.6], [548, 226, 2.0, 0.9, 0.9]];
  var seed = 7;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  var SPECKS = [];
  for (var n = 0; n < 22; n++) SPECKS.push([rand() * SW, rand() * SH, 3 + rand() * 5, rand() * 6.28]);

  // ---- ripples: from the pointer, and the odd raindrop [x, y, start time, strength] ----
  var RIPPLES = [], LIFE = 2.4, now = 0, lastDrop = 0, lastSpawn = { x: -99, y: -99, t: -1 };
  function addRipple(x, y, strength) {
    RIPPLES.push([x, y, now, strength]);
    if (RIPPLES.length > 16) RIPPLES.shift();
  }

  // ---- drawing ----
  var LO = [92, 122, 226], HI = [238, 243, 255]; // deep cobalt in the shadows → near-white in the light
  var scale = 1, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    scale = Math.min(w / SW, h / SH);
  }
  function dot(x, y, i) {
    if (i < 0.06) return;
    i = Math.min(1, i);
    var c = i * i;
    ctx.fillStyle = 'rgba(' + Math.round(LO[0] + (HI[0] - LO[0]) * c) + ',' + Math.round(LO[1] + (HI[1] - LO[1]) * c) + ',' + Math.round(LO[2] + (HI[2] - LO[2]) * c) + ',' + (0.15 + 0.85 * i).toFixed(2) + ')';
    ctx.beginPath(); ctx.arc(x * scale, y * scale, (0.55 + 0.75 * Math.sqrt(i)) * scale, 0, 6.2832); ctx.fill();
  }
  function glow(x, y, r, a) {
    var g = ctx.createRadialGradient(x * scale, y * scale, 0, x * scale, y * scale, r * scale);
    g.addColorStop(0, 'rgba(226,234,255,' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(141,168,238,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x * scale, y * scale, r * scale, 0, 6.2832); ctx.fill();
  }

  function frame(t) {
    now = t;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, SW * scale, SH * scale);

    // a raindrop now and then
    if (t - lastDrop > 2.2 + (Math.sin(t * 7.3) + 1)) {
      lastDrop = t;
      addRipple(40 + ((t * 977) % 480), 70 + ((t * 571) % 170), 0.55);
    }
    RIPPLES = RIPPLES.filter(function (r) { return t - r[2] < LIFE; });

    // mist and bloom (squashed to flat ovals so they fade out inside the canvas edges)
    ctx.save(); ctx.translate(0, SH * scale / 2); ctx.scale(1, 0.42); ctx.translate(0, -SH * scale / 2);
    glow(280 + Math.sin(t * 0.07) * 30, 130, 210, 0.07);
    glow(150 + Math.sin(t * 0.05 + 2) * 20, 170, 110, 0.05);
    glow(420 + Math.sin(t * 0.06 + 4) * 20, 95, 110, 0.045);
    ctx.restore();
    glow(300, 120, 90, 0.11 + 0.03 * Math.sin(t * 0.5)); // bloom around the cat

    for (var gy = 0; gy < ROWS; gy++) {
      for (var gx = 0; gx < COLS; gx++) {
        var x = (gx + 0.5) * P, y = (gy + 0.5) * P, k = gy * COLS + gx;
        // soft oval vignette so the pond melts into the footer
        var v = smooth(1, 0.5, Math.pow((x - SW / 2) / (SW / 2), 2) + Math.pow((y - SH / 2) / (SH / 2), 2));
        var s = STILL[k];
        if (s !== null) { dot(x, y, s * (0.6 + 0.4 * v)); continue; }
        if (v <= 0 || CLEAR[k]) continue;
        // halftone haze: a soft luminous cloud around the cat, breathing slowly
        var haze = 0.15 * (0.85 + 0.15 * Math.sin(t * 0.4)) * Math.exp(-(Math.pow((x - 300) / 190, 2) + Math.pow((y - 125) / 80, 2)));
        var i = 1 - (1 - HALO[k]) * (1 - haze);
        // slow, layered water swell
        var w = 0.5 + 0.5 * Math.sin(x * 0.035 - t * 0.6 + 2.4 * Math.sin(y * 0.06 + t * 0.25));
        i = Math.max(i, 0.28 * Math.pow(w, 7) * (gy % 2 ? 0.45 : 1));
        // ripples: a few thin rings per drop, squashed for perspective, fading as they spread
        for (var r = 0; r < RIPPLES.length; r++) {
          var R = RIPPLES[r], age = t - R[2], e = len(x - R[0], (y - R[1]) / 0.42);
          for (var ring = 0; ring < 3; ring++) {
            var rad = age * 34 - ring * 13;
            if (rad <= 0) continue;
            var on = 1 - Math.abs(e - rad) / 6; // as wide as the dot grid, so every ring lands on dots
            if (on > 0) i += R[3] * on * Math.pow(1 - age / LIFE, 1.2) * (1 - ring * 0.25);
          }
        }
        dot(x, y, i * v);
      }
    }

    // starbursts drawn in braille dots: long horizontal and vertical rays, short diagonals, a glowing core
    SPARKS.forEach(function (st) {
      var a = 0.25 + 0.75 * Math.pow(0.5 + 0.5 * Math.sin(t * st[3] + st[4]), 2), L = st[2], sp = P * 0.7;
      glow(st[0], st[1], L * 3, 0.45 * a);
      for (var d = 1; d <= L; d++) {
        var fall = Math.pow(1 - d / (L + 1), 1.5);
        dot(st[0] + d * sp, st[1], a * fall); dot(st[0] - d * sp, st[1], a * fall);
        if (d <= L * 0.75) { var fv = Math.pow(1 - d / (L * 0.75 + 1), 1.5); dot(st[0], st[1] + d * sp, a * fv); dot(st[0], st[1] - d * sp, a * fv); }
        if (d <= L * 0.35) { var fd = 0.7 * (1 - d / (L * 0.35 + 1)); [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (o) { dot(st[0] + o[0] * d * sp * 0.8, st[1] + o[1] * d * sp * 0.8, a * fd); }); }
      }
      dot(st[0], st[1], a);
    });
    // soft glow stars
    GLOWS.forEach(function (g) {
      var a = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * g[3] + g[4]), 3);
      glow(g[0], g[1], g[2] * 3.2, 0.5 * a);
      dot(g[0], g[1], 0.6 * a);
    });
    // specks drifting up
    SPECKS.forEach(function (sp) {
      var y = (sp[1] - t * sp[2]) % SH; if (y < 0) y += SH;
      var x = sp[0] + Math.sin(t * 0.3 + sp[3]) * 6;
      dot(x, y, 0.35 * (0.5 + 0.5 * Math.sin(t * 0.9 + sp[3])) * smooth(0, 40, y) * smooth(SH, SH - 40, y));
    });
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
  // pointer ripples: a new ring whenever the pointer has moved a little; a tap makes a stronger one
  function toScene(e) { var r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) / scale, (e.clientY - r.top) / scale]; }
  function onMove(e) {
    var p = toScene(e), t = tnow();
    if (len(p[0] - lastSpawn.x, p[1] - lastSpawn.y) > 16 || t - lastSpawn.t > 0.35) { lastSpawn = { x: p[0], y: p[1], t: t }; now = t; addRipple(p[0], p[1], 0.8); }
  }
  function onDown(e) { var p = toScene(e); now = tnow(); addRipple(p[0], p[1], 1); }

  resize(); frame(reduce ? 0 : 0);
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
