(function () {
  'use strict';

  var config = window.SITE_CONFIG || { links: {} };
  var root = document.documentElement;
  var body = document.body;

  /* ---------- Theme toggle ---------- */
  var themeButtons = document.querySelectorAll('[data-theme-choice]');

  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    themeButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-theme-choice') === theme));
    });
    if (persist) {
      try { localStorage.setItem('theme', theme); } catch (e) { /* storage blocked — theme still applies this visit */ }
    }
  }

  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);
  themeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () { applyTheme(btn.getAttribute('data-theme-choice'), true); });
  });

  /* ---------- Links from config ---------- */
  function isSafeUrl(url) {
    // Only allow https links and same-site relative paths (blocks javascript:, data:, etc.)
    if (/^https:\/\//i.test(url)) return true;
    return /^(\.{0,2}\/)?[\w\-./#]+$/.test(url) && !/^[a-z][a-z0-9+.-]*:/i.test(url);
  }

  document.querySelectorAll('[data-link]').forEach(function (el) {
    var url = (config.links || {})[el.getAttribute('data-link')];
    if (url && isSafeUrl(url)) {
      el.setAttribute('href', url);
      if (/^https:\/\//i.test(url)) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    } else {
      el.setAttribute('aria-disabled', 'true');
      el.addEventListener('click', function (e) { e.preventDefault(); });
    }
  });

  /* ---------- Email (assembled only on click) ---------- */
  document.querySelectorAll('[data-email]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      if (!config.emailUser || !config.emailDomain) return;
      window.location.href = 'mailto:' + config.emailUser + '@' + config.emailDomain;
    });
  });

  /* ---------- Looping videos: play only while on screen, click to pause; reduced motion gets controls instead ---------- */
  var loopVideos = document.querySelectorAll('video[data-autoplay]');
  if (loopVideos.length) {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    loopVideos.forEach(function (video) {
      if (reduceMotion || !('IntersectionObserver' in window)) { video.controls = true; return; }
      video.addEventListener('click', function () {
        video.dataset.paused = video.paused ? '' : 'true';
        if (video.paused) video.play().catch(function () {}); else video.pause();
      });
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !video.dataset.paused) video.play().catch(function () {});
          else video.pause();
        });
      }, { threshold: 0.25 }).observe(video);
    });
  }

  /* ---------- Live clock ---------- */
  var clockEl = document.querySelector('[data-clock]');
  if (clockEl && window.Intl) {
    var fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: config.timeZone || 'America/Toronto',
      hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short'
    });
    var tick = function () {
      var now = new Date();
      clockEl.textContent = fmt.format(now).replace(',', '');
      clockEl.setAttribute('datetime', now.toISOString());
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Media blur-in ---------- */
  // Photos and collage objects fade from a soft blur to sharp as each one loads.
  document.querySelectorAll('.gallery img, .collage img').forEach(function (img) {
    img.classList.add('media-fade');
    var show = function () { img.classList.add('is-loaded'); };
    if (img.complete && img.naturalWidth) requestAnimationFrame(show);
    else { img.addEventListener('load', show, { once: true }); img.addEventListener('error', show, { once: true }); }
  });

  /* ---------- "View project" pill follows the cursor ---------- */
  // GPU transform only, at most one update per frame, gentle easing; sizes measured once on enter.
  document.querySelectorAll('.card__media').forEach(function (media) {
    var pill = media.querySelector('.card__cta');
    if (!pill) return;
    var OFFSET = 14, EASE = 0.35;           // sit just below-right of the pointer; glide factor
    var target = { x: 0, y: 0 }, pos = { x: 0, y: 0 }, size = null, raf = 0, rect = null;

    function aim(e) {
      rect = media.getBoundingClientRect();
      target.x = Math.min(Math.max(e.clientX - rect.left + OFFSET, 8), rect.width - size.w - 8);
      target.y = Math.min(Math.max(e.clientY - rect.top + OFFSET, 8), rect.height - size.h - 8);
    }
    function frame() {
      pos.x += (target.x - pos.x) * EASE;
      pos.y += (target.y - pos.y) * EASE;
      media.style.setProperty('--x', pos.x.toFixed(1) + 'px');
      media.style.setProperty('--y', pos.y.toFixed(1) + 'px');
      raf = (Math.abs(target.x - pos.x) > 0.3 || Math.abs(target.y - pos.y) > 0.3) ? requestAnimationFrame(frame) : 0;
    }
    media.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse') return;
      size = size || { w: pill.offsetWidth, h: pill.offsetHeight };
      aim(e);
      pos.x = target.x; pos.y = target.y;     // appear right at the pointer, no slide-in
      media.style.setProperty('--x', pos.x + 'px');
      media.style.setProperty('--y', pos.y + 'px');
      media.classList.add('is-tracking');
    });
    media.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || !size) return;
      aim(e);
      if (!raf) raf = requestAnimationFrame(frame);
    });
    // On leave the pill simply fades out where it is (no jump back to center).
  });

  /* ---------- Home page nav: Home vs Case Studies ---------- */
  // Both live on the home page, so the highlight follows the scroll: Case Studies once that section
  // has scrolled up near the top of the screen, Home above it. Home scrolls back to the top.
  var navHome = document.querySelector('[data-nav="home"]');
  var navCases = document.querySelector('[data-nav="case-studies"]');
  var casesSection = document.getElementById('case-studies');
  if (navHome && navCases && casesSection) {
    var onCases = null;
    var syncNav = function () {      // one rect read per scroll, and the DOM only changes when the state flips
      var now = casesSection.getBoundingClientRect().top < 160;
      if (now === onCases) return;
      onCases = now;
      navHome.classList.toggle('is-active', !now);
      navCases.classList.toggle('is-active', now);
      if (now) { navCases.setAttribute('aria-current', 'location'); navHome.removeAttribute('aria-current'); }
      else { navHome.setAttribute('aria-current', 'page'); navCases.removeAttribute('aria-current'); }
    };
    window.addEventListener('scroll', syncNav, { passive: true });
    syncNav();
    navHome.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0 });            // smooth via CSS scroll-behavior (instant with reduced motion)
      history.replaceState(null, '', location.pathname);
    });
  }

  /* ---------- Case study table of contents ---------- */
  // Highlights the section being read: the last one whose top has passed the upper third of the screen.
  var toc = document.querySelector('[data-toc]');
  if (toc) {
    var tocLinks = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
    var tocTargets = tocLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var current = -1;
    var syncToc = function () {
      var line = window.innerHeight * 0.33, idx = 0;
      tocTargets.forEach(function (el, i) { if (el && el.getBoundingClientRect().top <= line) idx = i; });
      // at the very bottom, the last section counts as reached even if it's short
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) idx = tocTargets.length - 1;
      if (idx === current) return;
      current = idx;
      tocLinks.forEach(function (a, i) {
        a.classList.toggle('is-active', i === idx);
        if (i === idx) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', syncToc, { passive: true });
    window.addEventListener('resize', syncToc);
    syncToc();
  }
  document.querySelectorAll('[data-to-top]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0 });               // smooth via CSS scroll-behavior (instant with reduced motion)
      history.replaceState(null, '', location.pathname);
    });
  });

  /* ---------- Year ---------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-button');
  var menuLabel = document.querySelector('[data-menu-label]');
  var sidebar = document.getElementById('sidebar');
  var mobileQuery = window.matchMedia('(max-width: 809.98px)');

  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    if (menuLabel) menuLabel.textContent = open ? 'Close menu' : 'Open menu';
    if (open) {
      var first = sidebar.querySelector('a, button');
      if (first) first.focus();
    }
  }

  function syncMenuSemantics() {
    // On mobile the closed menu is removed from the tab order; on desktop the sidebar is always reachable.
    if (mobileQuery.matches && !body.classList.contains('menu-open')) sidebar.setAttribute('inert', '');
    else sidebar.removeAttribute('inert');
    if (!mobileQuery.matches && body.classList.contains('menu-open')) setMenu(false);
  }

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function () {
      setMenu(!body.classList.contains('menu-open'));
      syncMenuSemantics();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && body.classList.contains('menu-open')) {
        setMenu(false); syncMenuSemantics(); menuBtn.focus();
      }
    });
    sidebar.addEventListener('click', function (e) {
      if (e.target.closest('a[href]:not([aria-disabled])') && mobileQuery.matches) { setMenu(false); syncMenuSemantics(); }
    });
    if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', syncMenuSemantics);
    syncMenuSemantics();
  }
})();
