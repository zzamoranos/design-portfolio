// Figma-style select + drag for the About page desk collage.
(function () {
  'use strict';
  var board = document.querySelector('.collage__board');
  if (!board) return;

  var DESIGN_W = 970;
  var items = Array.prototype.slice.call(board.querySelectorAll(':scope > .c-item, :scope > .c-group, :scope > .tools'));
  var selected = null;
  var drag = null;
  var z = 10;

  // Size of 1 design px right now (matches the CSS --u, including the portrait layout and the cap)
  function unit() {
    var w = parseFloat(getComputedStyle(board).getPropertyValue('--W')) || DESIGN_W;
    return Math.min(board.getBoundingClientRect().width / w, 1.1);
  }
  function offset(el) {
    return { x: parseFloat(el.style.getPropertyValue('--dx')) || 0, y: parseFloat(el.style.getPropertyValue('--dy')) || 0 };
  }
  var resetBtn = document.querySelector('.collage__reset');
  function setOffset(el, x, y) {
    el.style.setProperty('--dx', x.toFixed(2));
    el.style.setProperty('--dy', y.toFixed(2));
    if (resetBtn && (Math.abs(x) > 0.5 || Math.abs(y) > 0.5)) resetBtn.hidden = false;
  }

  // Reset: glide every item back to its Figma position
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      select(null);
      board.classList.add('is-resetting');
      items.forEach(function (el) {
        el.style.setProperty('--dx', '0');
        el.style.setProperty('--dy', '0');
        el.style.zIndex = '';
      });
      resetBtn.hidden = true;
      setTimeout(function () { board.classList.remove('is-resetting'); }, 500);
    });
  }

  // Selection frame: border + four corner handles, attached to the item so it moves with it.
  items.forEach(function (el) {
    el.classList.add('is-draggable');
    var sel = document.createElement('span');
    sel.className = 'sel-box';
    sel.setAttribute('aria-hidden', 'true');
    ['tl', 'tr', 'bl', 'br'].forEach(function (pos) {
      var h = document.createElement('span');
      h.className = 'sel-box__handle sel-box__handle--' + pos;
      sel.appendChild(h);
    });
    el.appendChild(sel);
    el.querySelectorAll('img').forEach(function (img) { img.draggable = false; });
  });

  function select(el) {
    if (selected === el) return;
    if (selected) selected.classList.remove('is-selected');
    selected = el;
    if (el) {
      el.classList.add('is-selected');
      el.style.zIndex = String(++z);   // bring to front, like clicking a layer in Figma
    }
  }

  // Keep the item's box inside the board: limits for the move, in screen px.
  function limits(el) {
    var b = board.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    return { minX: b.left - r.left, maxX: b.right - r.right, minY: b.top - r.top, maxY: b.bottom - r.bottom };
  }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  board.addEventListener('pointerdown', function (e) {
    var el = e.target.closest('.is-draggable');
    if (!el || e.button > 0) return;
    e.preventDefault();
    select(el);
    var start = offset(el);
    drag = { el: el, id: e.pointerId, x: e.clientX, y: e.clientY, start: start, lim: limits(el), u: unit() };
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* capture unavailable: drag still tracks via board events */ }
    el.classList.add('is-dragging');
  });

  board.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = clamp(e.clientX - drag.x, drag.lim.minX, drag.lim.maxX);
    var dy = clamp(e.clientY - drag.y, drag.lim.minY, drag.lim.maxY);
    setOffset(drag.el, drag.start.x + dx / drag.u, drag.start.y + dy / drag.u);
  });

  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    drag.el.classList.remove('is-dragging');
    drag = null;
  }
  board.addEventListener('pointerup', endDrag);
  board.addEventListener('pointercancel', endDrag);

  // Click anywhere that isn't a collage item clears the selection.
  document.addEventListener('pointerdown', function (e) {
    if (selected && !e.target.closest('.collage__board .is-draggable')) select(null);
  });

  // Keyboard: arrows nudge the selected item (Shift = 10px), Escape deselects.
  document.addEventListener('keydown', function (e) {
    if (!selected) return;
    if (e.key === 'Escape') { select(null); return; }
    var step = e.shiftKey ? 10 : 1;
    var d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!d) return;
    e.preventDefault();
    var u = unit(), lim = limits(selected), o = offset(selected);
    var mx = clamp(d[0] * u, lim.minX, lim.maxX) / u;
    var my = clamp(d[1] * u, lim.minY, lim.maxY) / u;
    setOffset(selected, o.x + mx, o.y + my);
  });
})();
