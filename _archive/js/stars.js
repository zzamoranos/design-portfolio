// Subtle twinkle over the dark-mode sky. Positions come from the Figma "normal stars" (n)
// and "blinking stars" (b) layers, in the 1440px design's coordinates: [kind, x, y, size].
// Each star is a tiny element that only animates opacity, which browsers handle on the GPU.
(function () {
  'use strict';
  var layer = document.querySelector('.decor__stars');
  if (!layer) return;

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
  var W = 1600, H = 1240, OFFSET_X = 80; // matches dark-sky.jpg (1440 design centered in 1600)

  // Small deterministic random so the pattern is identical on every visit
  var seed = 7;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  var frag = document.createDocumentFragment();
  STARS.forEach(function (s) {
    var el = document.createElement('span');
    var size = Math.max(1, Math.round(s[3] * 0.5 * 10) / 10); // half the design size
    el.className = s[0] === 'b' ? 'star star--bright' : 'star';
    el.style.left = ((s[1] + OFFSET_X) / W * 100) + '%';
    el.style.top = (s[2] / H * 100) + '%';
    el.style.width = el.style.height = size + 'px';
    el.style.animationDuration = (3 + rand() * 3).toFixed(2) + 's';      // slow: 3–6s
    el.style.animationDelay = (-rand() * 6).toFixed(2) + 's';            // start mid-cycle, no sync
    frag.appendChild(el);
  });
  layer.appendChild(frag);
})();
