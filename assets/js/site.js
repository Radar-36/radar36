/* Radar 36 — site interactions (no dependencies) */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Nav ---------- */
  var nav = $('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 12); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    var mb = $('.menu-btn', nav);
    if (mb) {
      mb.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        mb.setAttribute('aria-expanded', String(open));
      });
      $$('.nav-links a', nav).forEach(function (a) {
        a.addEventListener('click', function () { nav.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); });
      });
    }
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$('.rv, .rv-scale, .steps, .compare');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Card cursor glow ---------- */
  $$('.card').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Radar dot field (echoes the logo) ---------- */
  function radar(canvas) {
    var dark = canvas.hasAttribute('data-dark');
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var size = 1000;
    canvas.width = canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    var dots = [];
    var rings = 13;
    for (var r = 1; r <= rings; r++) {
      var rad = 70 + r * 33;
      var n = Math.round((2 * Math.PI * rad) / 30);
      for (var i = 0; i < n; i++) {
        dots.push({ a: (i / n) * Math.PI * 2 + (r % 2 ? 0 : Math.PI / n), r: rad });
      }
    }
    var base = dark ? [165, 160, 255] : [79, 70, 229];
    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(canvas);
    }
    function draw(t) {
      if (visible) {
        ctx.clearRect(0, 0, size, size);
        var sweep = (t / 5200) % 1 * Math.PI * 2;
        var pulse = ((t / 3800) % 1) * 560 + 40;
        for (var k = 0; k < dots.length; k++) {
          var d = dots[k];
          var diff = (sweep - d.a) % (Math.PI * 2);
          if (diff < 0) diff += Math.PI * 2;
          var glow = Math.max(0, 1 - diff / 1.5);
          var ring = Math.max(0, 1 - Math.abs(d.r - pulse) / 46) * 0.5;
          var a = 0.1 + glow * 0.62 + ring;
          var s = 1.5 + glow * 1.9 + ring * 1.4;
          ctx.beginPath();
          ctx.arc(size / 2 + Math.cos(d.a) * d.r, size / 2 + Math.sin(d.a) * d.r, s, 0, 6.2832);
          ctx.fillStyle = 'rgba(' + base[0] + ',' + base[1] + ',' + base[2] + ',' + Math.min(a, 0.9) + ')';
          ctx.fill();
        }
      }
      if (!reduce) requestAnimationFrame(draw);
    }
    if (reduce) draw(900); else requestAnimationFrame(draw);
  }
  $$('canvas[data-radar]').forEach(radar);

  /* ---------- Hero workflow simulation ---------- */
  var sim = $('[data-sim]');
  if (sim) {
    var node = function (id) { return $('#n-' + id, sim); };
    var edge = function (id) { return $('#e-' + id, sim); };
    var statusEl = $('.status', sim), statusTxt = $('.status span', sim);
    var ringBar = $('.ring .bar', sim), ringTxt = $('.ring b', sim);
    var progTitle = $('[data-prog-title]', sim), progSub = $('[data-prog-sub]', sim);
    var logEl = $('.log', sim);
    var sevEls = { c: $('[data-sev="c"]', sim), h: $('[data-sev="h"]', sim), m: $('[data-sev="m"]', sim), l: $('[data-sev="l"]', sim) };
    var sev = { c: 0, h: 0, m: 0, l: 0 };
    var clock = 0;
    var timers = [];
    var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };

    function log(tag, msg, cls) {
      clock += 7 + Math.floor(Math.random() * 30);
      var mm = String(24 + Math.floor(clock / 60)).padStart(2, '0'), ss = String(clock % 60).padStart(2, '0');
      var p = document.createElement('p');
      p.innerHTML = '<i>10:' + mm + ':' + ss + '</i> <em class="' + (cls || '') + '">[' + tag + ']</em> ' + msg;
      logEl.appendChild(p);
      while (logEl.children.length > 7) logEl.removeChild(logEl.firstChild);
    }
    function bump(add) {
      Object.keys(add).forEach(function (k) {
        var from = sev[k], to = from + add[k]; sev[k] = to;
        var i = from;
        var iv = setInterval(function () { i++; sevEls[k].textContent = i; if (i >= to) clearInterval(iv); }, 70);
        timers.push(iv);
      });
    }
    function progress(pct, done, total) {
      ringBar.style.strokeDashoffset = String(150.8 * (1 - pct / 100));
      ringTxt.textContent = pct + '%';
      progSub.textContent = pct === 100 ? 'All ' + total + ' steps finished' : 'Step ' + done + ' of ' + total + ' running';
    }
    function run(ids) { ids.forEach(function (i) { node(i).classList.remove('done'); node(i).classList.add('running'); }); }
    function done(ids) { ids.forEach(function (i) { node(i).classList.remove('running'); node(i).classList.add('done'); }); }
    function flow(ids) { ids.forEach(function (i) { edge(i).classList.add('on'); }); }
    function fin(ids) { ids.forEach(function (i) { edge(i).classList.remove('on'); edge(i).classList.add('fin'); }); }

    function reset() {
      timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = [];
      $$('.n', sim).forEach(function (n) { n.classList.remove('running', 'done'); });
      $$('.ef', sim).forEach(function (e) { e.classList.remove('on', 'fin'); });
      sev = { c: 0, h: 0, m: 0, l: 0 }; clock = 0;
      Object.keys(sevEls).forEach(function (k) { sevEls[k].textContent = '0'; });
      logEl.innerHTML = '';
      statusEl.classList.remove('done'); statusTxt.textContent = 'Running';
      progTitle.textContent = 'Workflow in progress';
      progress(0, 1, 7);
    }

    function play() {
      reset();
      var T = 0, S = 1500;
      at(T += 300, function () { run(['trigger']); log('INFO', 'Run started in sandbox pentest-vm-01'); });
      at(T += 800, function () { done(['trigger']); flow(['1']); run(['nessus']); progress(8, 2, 7); log('INFO', 'Nessus scan started on {{target}}'); });
      at(T += S, function () { done(['nessus']); fin(['1']); flow(['2']); run(['nuclei']); progress(24, 3, 7); bump({ m: 4, l: 3 }); log('INFO', 'Nessus finished, output passed to Nuclei'); });
      at(T += S, function () { done(['nuclei']); fin(['2']); flow(['3a', '3b']); run(['darkmoon', 'strix']); progress(42, 4, 7); bump({ h: 3, m: 5, l: 2 }); log('INFO', '127 endpoints discovered'); });
      at(T += 900, function () { log('INFO', 'AI agents running in parallel'); });
      at(T += 900, function () { bump({ c: 2, h: 2 }); log('WARN', 'Possible SQL injection at /api/users', 'w'); });
      at(T += 900, function () { done(['darkmoon', 'strix']); fin(['3a', '3b']); flow(['4a', '4b']); run(['analysis']); progress(64, 5, 7); bump({ c: 1, h: 3, m: 3 }); log('INFO', 'Deduplicating and checking false positives'); });
      at(T += S, function () { done(['analysis']); fin(['4a', '4b']); flow(['5']); run(['report']); progress(82, 6, 7); log('OK', '18 findings confirmed, 9 likely valid', 'g'); });
      at(T += S, function () { done(['report']); fin(['5']); flow(['6']); run(['notify']); progress(94, 7, 7); log('INFO', 'Impact and fix drafted for each finding'); });
      at(T += 1100, function () {
        done(['notify']); fin(['6']); progress(100, 7, 7);
        statusEl.classList.add('done'); statusTxt.textContent = 'Completed';
        progTitle.textContent = 'Workflow completed';
        log('OK', 'Report sent to Jira and Slack', 'g');
      });
      at(T += 4200, play);
    }

    if (reduce) {
      reset();
      done(['trigger', 'nessus', 'nuclei', 'darkmoon', 'strix', 'analysis', 'report', 'notify']);
      $$('.ef', sim).forEach(function (e) { e.classList.add('fin'); });
      sev = { c: 3, h: 8, m: 12, l: 5 };
      Object.keys(sevEls).forEach(function (k) { sevEls[k].textContent = sev[k]; });
      progress(100, 7, 7); statusEl.classList.add('done'); statusTxt.textContent = 'Completed'; progTitle.textContent = 'Workflow completed';
      log('OK', 'Report sent to Jira and Slack', 'g');
    } else {
      var started = false;
      new IntersectionObserver(function (es, o) {
        if (es[0].isIntersecting && !started) { started = true; play(); o.disconnect(); }
      }, { threshold: 0.25 }).observe(sim);
    }
  }

  /* ---------- Feature tabs with autoplay ---------- */
  $$('[data-tabs]').forEach(function (root) {
    var tabs = $$('.tab', root), panels = $$('.shot', root);
    var idx = 0, timer = null, DUR = 7000, auto = !reduce;
    root.style.setProperty('--dur', DUR + 'ms');
    function show(i, user) {
      idx = i;
      tabs.forEach(function (t, k) { t.classList.toggle('active', k === i); t.setAttribute('aria-selected', String(k === i)); });
      panels.forEach(function (p, k) { p.classList.toggle('active', k === i); });
      if (user) { auto = false; root.classList.remove('auto'); clearTimeout(timer); }
      else if (auto) { clearTimeout(timer); timer = setTimeout(function () { show((idx + 1) % tabs.length); }, DUR); }
    }
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { show(k, true); }); });
    if (auto && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        if (!auto) return;
        if (es[0].isIntersecting) { root.classList.add('auto'); show(idx); }
        else { clearTimeout(timer); root.classList.remove('auto'); }
      }, { threshold: 0.3 }).observe(root);
    }
    show(0, !auto);
  });

  /* ---------- Count up ---------- */
  var counters = $$('[data-count]');
  if (counters.length) {
    var runCount = function (el) {
      var to = parseFloat(el.getAttribute('data-count')), suffix = el.getAttribute('data-suffix') || '';
      if (reduce) { el.textContent = to + suffix; return; }
      var t0 = null, dur = 1600;
      var step = function (t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(to * e) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { cio.observe(c); });
    } else counters.forEach(runCount);
  }

  /* ---------- Subtle parallax tilt on feature screenshots ---------- */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    $$('.f-media').forEach(function (m) {
      var s = $('.shot, .toolcloud', m); if (!s) return;
      m.addEventListener('pointermove', function (e) {
        var r = m.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        s.style.transform = 'perspective(1400px) rotateY(' + (x * 3) + 'deg) rotateX(' + (-y * 3) + 'deg) translateY(-4px)';
      });
      m.addEventListener('pointerleave', function () { s.style.transform = ''; });
    });
  }

  var y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();
