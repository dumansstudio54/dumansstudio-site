/* DumansStudio — site behaviour (vanilla JS, no framework).
   Content lives in index.html so search engines can read it without JS. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Preloader: short, once per session, never blocks content ── */
  var pre = doc.getElementById('preloader');
  var seen = false;
  try { seen = sessionStorage.getItem('ds-pre') === '1'; sessionStorage.setItem('ds-pre', '1'); } catch (e) { /* private mode */ }
  var heroRevealAt = 0;
  function hidePre() {
    if (!pre || pre.classList.contains('done')) return;
    pre.classList.add('done');
    heroRevealAt = performance.now();
    setTimeout(function () { pre.remove(); }, 700);
  }
  if (seen || reduce) hidePre();
  else setTimeout(hidePre, 900);

  /* ── Header: solid on scroll, mobile menu ── */
  var header = doc.querySelector('.site-header');
  var ham = doc.querySelector('.ham');
  // Sub-pages have no dark hero, so their header carries data-solid and stays solid.
  var alwaysSolid = header.hasAttribute('data-solid');
  function onScroll() { header.classList.toggle('solid', alwaysSolid || window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var scrollY = 0;
  function setMenu(open) {
    if (open === root.classList.contains('menu-open')) return;
    if (open) {
      scrollY = window.scrollY;
      body.style.cssText = 'position:fixed;top:-' + scrollY + 'px;left:0;right:0;overflow-y:scroll';
    } else {
      body.style.cssText = '';
      window.scrollTo(0, scrollY);
    }
    root.classList.toggle('menu-open', open);
    ham.setAttribute('aria-expanded', String(open));
    ham.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  }
  ham.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
  doc.querySelectorAll('.mob-menu a').forEach(function (a) {
    a.addEventListener('click', function () {
      var href = a.getAttribute('href');
      setMenu(false);
      if (href.charAt(0) === '#') {
        var t = doc.querySelector(href);
        if (t) { setTimeout(function () { t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }, 20); }
      }
    });
  });

  /* ── Scroll reveal ── */
  var revealEls = Array.prototype.slice.call(doc.querySelectorAll('[data-reveal]'));
  function reveal(el) { el.classList.add('is-visible'); }
  if (!('IntersectionObserver' in window) || reduce) {
    revealEls.forEach(reveal);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ── Hero rotating word ── */
  var word = doc.querySelector('.hero-word');
  if (word && !reduce) {
    var WORDS = ['Reformer Pilates', 'EMS', 'Yoga'], wi = 0;
    setInterval(function () {
      wi = (wi + 1) % WORDS.length;
      word.textContent = WORDS[wi];
      word.classList.remove('swap'); void word.offsetWidth; word.classList.add('swap');
    }, 2600);
  }

  /* ── Hero particle figure: a dotted pilates figure that rotates and morphs between poses ── */
  (function heroFigure() {
    var canvas = doc.querySelector('.hero-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var hero = canvas.closest('.hero');
    var inner = hero.querySelector('.hero-inner');
    var mobile = Math.min(window.innerWidth, window.innerHeight) < 640 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    var DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    var STRIDE = mobile ? 2 : 1;
    var W = 0, H = 0, cx = 0, cy = 0, figScale = 1, raf = 0, visible = true;

    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx = W / 2;
      var textTop = inner.getBoundingClientRect().top - hero.getBoundingClientRect().top;
      var topPad = Math.max(54, H * 0.075);
      var avail = Math.max(140, textTop - topPad - 14);
      figScale = Math.min(avail / 184, (W * 0.96) / 178);
      cy = topPad + avail / 2;
    }
    resize();
    window.addEventListener('resize', resize);
    setTimeout(resize, 400);

    var N = 0, poses = [], P = [];
    // Pose data comes from assets/js/poses.js (a plain script, so it also works when opened from file://).
    var d = window.DUMANS_POSES;
    if (d) {
      N = d.n; poses = d.poses;
      for (var i = 0; i < N; i++) P.push({ z: (Math.random() - 0.5) * 44, tw: Math.random() * 6.283, ix: Math.random(), iy: Math.random() });
    }

    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    var HOLD = 5.0, TRANS = 1.6, SEG = HOLD + TRANS, INTRO = 1.8;
    var angle = 0, t = 0, last = 0, revealT = -1;

    var AMB = [];
    for (var a = 0; a < (mobile ? 26 : 52); a++) AMB.push({ x: Math.random(), y: Math.random(), r: Math.random() * 0.85 + 0.35, a: Math.random() * 0.22 + 0.05, vy: (Math.random() * 0.45 + 0.2) * 0.0016, vx: (Math.random() - 0.5) * 0.001, ph: Math.random() * 6.283, gold: Math.random() < 0.5 });
    var EMIT = [];

    function frame(now) {
      raf = 0;
      if (!visible) return;
      if (!last) last = now;
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (canvas.clientWidth && canvas.clientWidth !== W) resize();
      t += dt; angle += 0.27 * dt;
      if (revealT < 0 && N && (heroRevealAt || !pre || pre.classList.contains('done'))) revealT = t;
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < AMB.length; i++) {
        var p = AMB[i];
        p.y -= reduce ? p.vy * 0.5 : p.vy; if (!reduce) p.x += p.vx;
        if (p.y < -0.02) p.y = 1.02;
        if (p.x < -0.02) p.x = 1.02; else if (p.x > 1.02) p.x = -0.02;
        var al = clamp(p.a * (0.45 + 0.55 * Math.sin(t * 0.7 + p.ph)), 0, 0.32);
        ctx.fillStyle = (p.gold ? 'rgba(212,175,55,' : 'rgba(244,242,234,') + al.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, 6.2832); ctx.fill();
      }

      if (N && poses.length) {
        var cycle = t / SEG, idx = Math.floor(cycle) % poses.length, nxt = (idx + 1) % poses.length;
        var local = t - Math.floor(cycle) * SEG;
        var mt = local <= HOLD ? 0 : easeInOut((local - HOLD) / TRANS);
        var A = poses[idx], B = poses[nxt];
        var sin = Math.sin(angle), cos = Math.cos(angle);
        var introT = reduce ? 1 : (revealT < 0 ? 0 : clamp((t - revealT) / INTRO, 0, 1));
        var ie = 1 - Math.pow(1 - introT, 3);
        for (var k = 0; k < N; k += STRIDE) {
          var x = A[k * 2] + (B[k * 2] - A[k * 2]) * mt;
          var y = A[k * 2 + 1] + (B[k * 2 + 1] - A[k * 2 + 1]) * mt;
          var z = P[k].z;
          var rx = x * cos - z * sin, rz = x * sin + z * cos;
          var persp = 560 / (560 + rz);
          var sx = cx + rx * figScale * persp, sy = cy + y * figScale * persp;
          var depthN = clamp((rz + 70) / 140, 0, 1);
          var alpha = clamp((0.5 + 0.5 * depthN) * (0.85 + 0.15 * Math.sin(t * 2 + P[k].tw)), 0.16, 1);
          var size = clamp((1.0 + 1.15 * depthN) * persp, 0.7, 3.9);
          var fx = sx, fy = sy, fa = alpha;
          if (introT < 1) {
            fx = P[k].ix * W * (1 - ie) + sx * ie;
            fy = P[k].iy * H * (1 - ie) + sy * ie;
            fa = alpha * (0.12 + 0.88 * introT);
          }
          ctx.fillStyle = (depthN > 0.66 ? 'rgba(232,199,102,' : 'rgba(244,242,234,') + fa.toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(fx, fy, size, 0, 6.2832); ctx.fill();
          if (!reduce && introT >= 1 && Math.random() < 0.0009) EMIT.push({ x: sx, y: sy, vx: (Math.random() - 0.5) * 0.5, vy: -(Math.random() * 0.5 + 0.22), life: 1.6, max: 1.6 });
        }
        for (var e = EMIT.length - 1; e >= 0; e--) {
          var m = EMIT[e];
          m.life -= dt; m.x += m.vx; m.y += m.vy;
          if (m.life <= 0) { EMIT.splice(e, 1); continue; }
          ctx.fillStyle = 'rgba(232,199,102,' + clamp((m.life / m.max) * 0.55, 0, 0.55).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(m.x, m.y, 0.95, 0, 6.2832); ctx.fill();
        }
      }
      raf = requestAnimationFrame(frame);
    }
    // Pause drawing while the hero is off-screen to save battery.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && !raf) { last = 0; raf = requestAnimationFrame(frame); }
      }).observe(hero);
    }
    raf = requestAnimationFrame(frame);
  })();

  /* ── Event galleries + photo viewer (home page only) ── */
  var viewer = doc.getElementById('viewer');
  if (viewer) initGalleries();
  function initGalleries() {
  var vImg = viewer.querySelector('img');
  var vCount = viewer.querySelector('.viewer-count');
  var vList = [], vIdx = 0;

  function lockScroll(on) { root.style.overflow = on ? 'hidden' : ''; }
  function openDialog(d) {
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    lockScroll(true);
  }
  function closeDialog(d) {
    if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
  }
  doc.querySelectorAll('dialog').forEach(function (d) {
    d.addEventListener('close', function () { if (!doc.querySelector('dialog[open]')) lockScroll(false); });
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-close]')) closeDialog(d); });
  });

  function showPhoto(i) {
    vIdx = (i + vList.length) % vList.length;
    var a = vList[vIdx];
    vImg.src = a.getAttribute('href');
    vImg.alt = a.querySelector('img').alt;
    vCount.textContent = (vIdx + 1) + ' / ' + vList.length;
    [vIdx + 1, vIdx - 1].forEach(function (j) { var n = vList[(j + vList.length) % vList.length]; if (n) new Image().src = n.getAttribute('href'); });
  }
  function openPhoto(gal, i) {
    vList = Array.prototype.slice.call(gal.querySelectorAll('.gal-grid a'));
    showPhoto(i);
    openDialog(viewer);
  }

  doc.querySelectorAll('[data-gallery]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var gal = doc.getElementById(btn.getAttribute('data-gallery'));
      var photo = btn.getAttribute('data-photo');
      if (photo !== null) openPhoto(gal, parseInt(photo, 10));
      else openDialog(gal);
    });
  });
  doc.querySelectorAll('.gal-grid').forEach(function (grid) {
    var gal = grid.closest('dialog');
    grid.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      e.preventDefault();
      openPhoto(gal, Array.prototype.indexOf.call(grid.querySelectorAll('a'), a));
    });
  });
  viewer.querySelector('.viewer-prev').addEventListener('click', function () { showPhoto(vIdx - 1); });
  viewer.querySelector('.viewer-next').addEventListener('click', function () { showPhoto(vIdx + 1); });
  viewer.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') showPhoto(vIdx - 1);
    if (e.key === 'ArrowRight') showPhoto(vIdx + 1);
  });
  var tx = null;
  viewer.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 40) showPhoto(vIdx + (dx < 0 ? 1 : -1));
  });
  }

  /* ── Gold water-ripple on tap ── */
  if (!reduce) {
    var RINGS = [{ d: 70, delay: 0, a: 0.55 }, { d: 150, delay: 90, a: 0.34 }, { d: 240, delay: 190, a: 0.2 }];
    doc.addEventListener('pointerdown', function (e) {
      RINGS.forEach(function (r) {
        var el = doc.createElement('span');
        el.className = 'ripple';
        el.style.cssText = 'left:' + e.clientX + 'px;top:' + e.clientY + 'px;width:' + r.d + 'px;height:' + r.d + 'px;border-color:rgba(212,175,55,' + r.a + ');animation-delay:' + r.delay + 'ms';
        body.appendChild(el);
        setTimeout(function () { el.remove(); }, 820 + r.delay);
      });
    }, true);
  }
})();
