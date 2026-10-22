// The little loaf cat in the bottom-left corner (it sits on the footer when you reach it).
// Click or tap to give it a pat: its head squishes, its eyes go happy and a heart floats up.
(function () {
  'use strict';
  var cat = document.querySelector('.cat');
  if (!cat) return;
  var timer = 0;
  cat.addEventListener('click', function () {
    cat.classList.remove('is-patted');
    void cat.offsetWidth; // restart the animation on repeat pats
    cat.classList.add('is-patted');
    clearTimeout(timer);
    timer = setTimeout(function () { cat.classList.remove('is-patted'); }, 1100);
  });
})();
