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

  /* ---------- Cover loops (Remo): play only while on screen; reduced motion keeps the still poster ---------- */
  var coverLoops = document.querySelectorAll('video[data-cover-loop]');
  if (coverLoops.length && 'IntersectionObserver' in window && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var coverIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !document.hidden) entry.target.play().catch(function () {});
        else entry.target.pause();
      });
    }, { threshold: 0.25 });
    coverLoops.forEach(function (v) { coverIO.observe(v); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) coverLoops.forEach(function (v) { v.pause(); }); });
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
    if (img.complete && img.naturalWidth) {
      if (document.documentElement.classList.contains('vt')) show(); else requestAnimationFrame(show);  // no blur-in under a page transition
    }
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
    var current = -1, lockUntil = 0;
    var mark = function (idx) {
      if (idx === current) return;
      current = idx;
      tocLinks.forEach(function (a, i) {
        a.classList.toggle('is-active', i === idx);
        if (i === idx) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    };
    var syncToc = function () {
      if (Date.now() < lockUntil) return;          // a click just started a jump: keep the clicked item active until it lands
      var line = window.innerHeight * 0.33, idx = 0;
      tocTargets.forEach(function (el, i) { if (el && el.getBoundingClientRect().top <= line) idx = i; });
      // at the very bottom, the last section counts as reached even if it's short
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) idx = tocTargets.length - 1;
      mark(idx);
    };
    // a short section (like TL;DR) can sit above the next one on tall screens: honour the click, not the scroll position
    tocLinks.forEach(function (a, i) {
      a.addEventListener('click', function () { lockUntil = Date.now() + 1100; mark(i); });
    });
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

  /* ---------- Sounds ---------- */
  // Hover: a short blip when the pointer moves onto a sidebar text link (Home, Case Studies, Playground, About Me, LinkedIn, Resume, Email).
  // Click: a different sound on links, buttons and cards. On by default; a small button beside the theme
  // toggle turns it off, and the choice is remembered on this device (localStorage only, nothing is sent).
  (function () {
    var isCase = !!document.querySelector('[data-toc]');   // case studies: sidebar is a table of contents; click sound on it only, no hover
    var KEY = 'sound', SRC = { hover: '/assets/sfx/hover.m4a', click: '/assets/sfx/click.m4a' };
    var VOL = { hover: 0.22, click: 0.07 };   // per-sound playback volume (0 to 1)
    var CLICKABLE = 'a[href], button, [role="button"], summary, .card';
    var NAV = '.nav-link, .social-link';   // the sidebar's text links only
    var SKIP = '[aria-disabled="true"], [disabled], [data-no-sound]';
    var on = true, audio = {};
    try { on = localStorage.getItem(KEY) !== 'off'; } catch (e) { /* storage blocked: stay on for this visit */ }

    function load(kind) {
      if (!audio[kind]) { try { audio[kind] = new Audio(SRC[kind]); audio[kind].preload = 'auto'; audio[kind].volume = VOL[kind]; } catch (e) { audio[kind] = null; } }
      return audio[kind];
    }
    function play(kind) {
      if (!on) return;
      var a = load(kind);
      if (!a) return;
      try { a.currentTime = 0; var p = a.play(); if (p && p.catch) p.catch(function () { /* blocked until the first tap: ignore */ }); } catch (e) { /* ignore */ }
    }
    if (on) { load('hover'); load('click'); }

    // the on/off button joins the theme toggle's row
    var group = document.querySelector('.theme-toggle');
    if (group) {
      var NS = 'http://www.w3.org/2000/svg';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-toggle__btn theme-toggle__btn--sound';
      btn.setAttribute('aria-label', 'Click sounds');
      btn.setAttribute('aria-pressed', String(on));
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('width', '16'); svg.setAttribute('height', '16'); svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
      [['', 'M4 9v6h4l5 4V5L8 9H4z'], ['sfx-on', 'M16.5 9a4.5 4.5 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11'], ['sfx-off', 'M16.5 9.5l5 5M21.5 9.5l-5 5']].forEach(function (d) {
        var path = document.createElementNS(NS, 'path');
        if (d[0]) path.setAttribute('class', d[0]);
        path.setAttribute('d', d[1]);
        svg.appendChild(path);
      });
      btn.appendChild(svg);
      btn.addEventListener('click', function () {
        on = !on;
        btn.setAttribute('aria-pressed', String(on));
        try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) { /* ignore */ }
        if (on) { load('hover'); load('click'); play('click'); }   // a blip as confirmation when turned on
      });
      group.setAttribute('aria-label', 'Display and sound');
      group.appendChild(btn);
    }

    // Hover: one blip as the pointer enters a link, button or card. Mouse/trackpad only (touch screens have no hover),
    // and a short gap between blips so sweeping across a row of links doesn't stutter.
    var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var lastAt = 0;
    // After clicking a nav link the next page loads with the pointer still on that link, which would fire the hover
    // blip again. The click leaves a short-lived note in sessionStorage so the new page can skip that one hover.
    var skip = null;
    try {
      var note = JSON.parse(sessionStorage.getItem('sfx-nav') || 'null');
      sessionStorage.removeItem('sfx-nav');
      if (note && Date.now() - note.t < 3000) skip = note;
    } catch (e) { /* ignore */ }
    if (canHover && !isCase) document.addEventListener('mouseover', function (e) {
      var t = e.target.closest ? e.target.closest(NAV) : null;
      if (!t || t.matches(SKIP)) return;
      if (e.relatedTarget && t.contains(e.relatedTarget)) return;   // moving between the icon and text of one link
      if (skip) {
        var same = Date.now() - skip.t < 3000 && t.textContent.trim() === skip.label;
        skip = null;
        if (same) return;   // the link that was just clicked: stay quiet
      }
      var n = Date.now();
      if (n - lastAt < 90) return;
      lastAt = n; play('hover');
    });
  
    // Click: bubbling phase, so the on/off button has already updated the state (turning sound off is silent)
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest(isCase ? NAV : CLICKABLE) : null;
      if (!t || t.matches(SKIP) || t.matches('.theme-toggle__btn--sound')) return;
      play('click');
      // A link that loads another page would cut the sound off, so hold the navigation for a beat (plain left-clicks only).
      var a = t.closest('a[href]');
      if (on && a && !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey &&
          (!a.target || a.target === '_self') && !a.hasAttribute('download') && a.origin === location.origin &&
          (a.pathname !== location.pathname || a.search !== location.search)) {
        if (a.matches(NAV)) { try { sessionStorage.setItem('sfx-nav', JSON.stringify({ t: Date.now(), label: a.textContent.trim() })); } catch (err) { /* ignore */ } }
        e.preventDefault();
        setTimeout(function () { location.href = a.href; }, 160);
      }
    });
  })();

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
