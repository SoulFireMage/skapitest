(function () {
  var SVGNS = 'http://www.w3.org/2000/svg';
  var NOW = 2026;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var byId = {};
  PROJECTS.forEach(function (p) { byId[p.id] = p; });
  var clusterById = {};
  CLUSTERS.forEach(function (c) { clusterById[c.id] = c; });

  var state = { lens: 'kat', selected: null, sparks: {}, walkTimer: null };

  function $(sel) { return document.querySelector(sel); }
  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) n.textContent = text;
    return n;
  }
  function svg(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  // ---------- layout: golden-angle spiral per constellation
  function layout() {
    var counts = {};
    PROJECTS.forEach(function (p) {
      var c = clusterById[p.cluster];
      var i = counts[p.cluster] = (counts[p.cluster] || 0) + 1;
      var a = i * 2.39996 + c.hue / 57.3;
      var r = 22 + 46 * Math.sqrt(i);
      p.x = c.x + Math.cos(a) * r * 1.25;
      p.y = c.y + Math.sin(a) * r * 0.9;
      // Older light is dimmer: it left a long time ago.
      p.glow = 0.35 + 0.65 * Math.max(0, 1 - (NOW - p.year) / 14);
    });
  }

  function neighbours(id) {
    var out = [];
    THREADS.forEach(function (t) {
      if (t.a === id && byId[t.b]) out.push({ p: byId[t.b], why: t.why });
      if (t.b === id && byId[t.a]) out.push({ p: byId[t.a], why: t.why });
    });
    return out;
  }

  // ---------- the sky
  function drawSky() {
    var root = $('#sky');
    var gLinks = svg('g', { 'class': 'links' });
    var gThreads = svg('g', { 'class': 'threads' });
    var gLabels = svg('g', { 'class': 'clabels' });
    var gStars = svg('g', { 'class': 'stars' });

    CLUSTERS.forEach(function (c) {
      var members = PROJECTS.filter(function (p) { return p.cluster === c.id; });
      for (var i = 1; i < members.length; i++) {
        gLinks.appendChild(svg('line', {
          x1: members[i - 1].x, y1: members[i - 1].y, x2: members[i].x, y2: members[i].y,
          stroke: 'hsl(' + c.hue + ' 70% 70% / .18)'
        }));
      }
      var minY = Math.min.apply(null, members.map(function (m) { return m.y; }));
      var t = svg('text', { x: c.x, y: minY - 30, 'class': 'clabel', fill: 'hsl(' + c.hue + ' 80% 78%)' });
      t.textContent = c.name;
      gLabels.appendChild(t);
    });

    THREADS.forEach(function (t, i) {
      var a = byId[t.a], b = byId[t.b];
      if (!a || !b) return;
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      var dx = b.x - a.x, dy = b.y - a.y;
      var bend = 0.18;
      var d = 'M' + a.x + ' ' + a.y + ' Q' + (mx - dy * bend) + ' ' + (my + dx * bend) + ' ' + b.x + ' ' + b.y;
      var path = svg('path', { d: d, 'class': 'thread', 'data-a': t.a, 'data-b': t.b });
      t.el = path;
      gThreads.appendChild(path);
    });

    PROJECTS.forEach(function (p) {
      var c = clusterById[p.cluster];
      var g = svg('g', {
        'class': 'star', tabindex: '0', role: 'button',
        'aria-label': p.name + ', ' + p.year + ', ' + c.name,
        transform: 'translate(' + p.x + ' ' + p.y + ')',
        'data-id': p.id
      });
      var col = 'hsl(' + c.hue + ' 90% ' + Math.round(60 + 25 * p.glow) + '%)';
      var halo = svg('circle', { r: 16, fill: col, 'class': 'halo', opacity: (0.12 + 0.25 * p.glow).toFixed(2) });
      var core = svg('circle', { r: (3 + 4 * p.glow).toFixed(1), fill: col, 'class': 'core' });
      if (!reduceMotion) halo.style.animationDelay = (-(p.x * 7 + p.y * 3) % 5000) + 'ms';
      var label = svg('text', { y: 26, 'class': 'slabel' });
      label.textContent = p.name;
      g.appendChild(halo); g.appendChild(core); g.appendChild(label);
      g.addEventListener('click', function () { stopWalk(); select(p.id); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stopWalk(); select(p.id); }
      });
      p.el = g;
      gStars.appendChild(g);
    });

    root.appendChild(gLinks);
    root.appendChild(gThreads);
    root.appendChild(gLabels);
    root.appendChild(gStars);
  }

  function highlight(id, activeThread) {
    var near = {};
    if (id) neighbours(id).forEach(function (n) { near[n.p.id] = true; });
    PROJECTS.forEach(function (p) {
      p.el.classList.toggle('selected', p.id === id);
      p.el.classList.toggle('near', !!near[p.id]);
      p.el.classList.toggle('dim', !!id && p.id !== id && !near[p.id]);
    });
    THREADS.forEach(function (t) {
      if (!t.el) return;
      var on = id && (t.a === id || t.b === id);
      t.el.classList.toggle('on', !!on);
      t.el.classList.toggle('walk', t === activeThread);
    });
  }

  // ---------- detail panel
  function summary(p) { return state.lens === 'kat' ? p.kat : p.rich; }

  function renderPanel() {
    var panel = $('#panel');
    var p = state.selected && byId[state.selected];
    if (!p) { panel.hidden = true; return; }
    var c = clusterById[p.cluster];
    panel.hidden = false;
    panel.classList.toggle('left', p.x > 800);
    panel.style.setProperty('--hue', c.hue);
    $('#p-cluster').textContent = c.name;
    $('#p-name').textContent = p.name;
    $('#p-meta').textContent = p.year + ' · ' + p.lang;
    $('#p-summary').textContent = summary(p);
    var link = $('#p-link');
    link.href = p.url;
    link.textContent = /huggingface\.co/.test(p.url) ? 'Open the Space ↗' : /github\.com/.test(p.url) ? 'Open on GitHub ↗' : 'Visit ↗';
    var alt = $('#p-alt');
    alt.hidden = !p.alt;
    if (p.alt) {
      alt.href = p.alt;
      alt.textContent = /huggingface\.co/.test(p.alt) ? 'Hugging Face Space ↗' : 'Source ↗';
    }

    var ul = $('#p-threads');
    ul.textContent = '';
    var ns = neighbours(p.id);
    $('#p-threads-h').hidden = ns.length === 0;
    ns.forEach(function (n) {
      var li = el('li');
      var b = el('button', { type: 'button', 'class': 'linkish' }, n.p.name);
      b.addEventListener('click', function () { stopWalk(); select(n.p.id); });
      li.appendChild(b);
      li.appendChild(el('span', null, ' — ' + n.why));
      ul.appendChild(li);
    });

    var trivia = TRIVIA.filter(function (t) { return t.p === p.id; });
    var tb = $('#p-trivia');
    tb.hidden = trivia.length === 0;
    if (trivia.length) $('#p-trivia-text').textContent = trivia[Math.floor(Math.random() * trivia.length)].t;

    renderSpark();
  }

  function renderSpark() {
    var p = state.selected;
    var btn = $('#p-spark');
    if (!p) return;
    var n = state.sparks[p] || 0;
    var done = store('sparked:' + p) === '1';
    btn.disabled = !Backend.enabled() || done;
    btn.textContent = (done ? '✦ Sparked' : '✦ Spark this') + (n ? ' · ' + n : '');
    btn.title = Backend.enabled() ? 'Leave a small light on this project' : 'Sparks need a Skapi project ID';
  }

  function select(id) {
    state.selected = id;
    highlight(id);
    renderPanel();
    if (id) {
      try { history.replaceState(null, '', '#' + id); } catch (e) {}
    }
  }

  // ---------- follow a thread: a short random walk across the links
  function stopWalk() {
    if (state.walkTimer) clearTimeout(state.walkTimer);
    state.walkTimer = null;
    $('#walk').textContent = 'Follow a thread';
    $('#walk-note').textContent = '';
  }

  function walk() {
    if (state.walkTimer) { stopWalk(); return; }
    var start = state.selected || THREADS[Math.floor(Math.random() * THREADS.length)].a;
    var seen = {}; seen[start] = true;
    var cur = start, steps = 0;
    $('#walk').textContent = 'Stop';
    select(cur);
    function step() {
      var options = neighbours(cur).filter(function (n) { return !seen[n.p.id]; });
      if (!options.length || steps >= 6) {
        $('#walk-note').textContent = steps ? 'End of the thread (' + steps + ' hops).' : 'This star has no threads.';
        state.walkTimer = null;
        $('#walk').textContent = 'Follow a thread';
        return;
      }
      var next = options[Math.floor(Math.random() * options.length)];
      var thread = THREADS.filter(function (t) {
        return (t.a === cur && t.b === next.p.id) || (t.b === cur && t.a === next.p.id);
      })[0];
      seen[next.p.id] = true;
      cur = next.p.id; steps++;
      state.selected = cur;
      highlight(cur, thread);
      renderPanel();
      $('#walk-note').textContent = '↪ ' + next.why;
      state.walkTimer = setTimeout(step, reduceMotion ? 4500 : 3200);
    }
    state.walkTimer = setTimeout(step, 1800);
  }

  // ---------- lens
  function setLens(lens) {
    state.lens = lens;
    store('lens', lens);
    document.body.dataset.lens = lens;
    document.querySelectorAll('[data-lens-btn]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lensBtn === lens));
    });
    renderPanel();
    renderList();
  }

  // ---------- the list view (also the mobile-friendly way in)
  function renderList() {
    var root = $('#list');
    root.textContent = '';
    CLUSTERS.forEach(function (c) {
      var sec = el('section', { 'class': 'cluster' });
      sec.style.setProperty('--hue', c.hue);
      sec.appendChild(el('h3', null, c.name));
      sec.appendChild(el('p', { 'class': 'cblurb' }, c.blurb));
      var ul = el('ul');
      PROJECTS.filter(function (p) { return p.cluster === c.id; })
        .sort(function (a, b) { return b.year - a.year; })
        .forEach(function (p) {
          var li = el('li');
          var head = el('div', { 'class': 'lhead' });
          var a = el('a', { href: p.url, target: '_blank', rel: 'noopener' }, p.name);
          head.appendChild(a);
          head.appendChild(el('span', { 'class': 'meta' }, p.year + ' · ' + p.lang));
          var show = el('button', { type: 'button', 'class': 'linkish small' }, 'on the chart');
          show.addEventListener('click', function () {
            stopWalk(); select(p.id);
            $('#chart').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
          });
          head.appendChild(show);
          li.appendChild(head);
          li.appendChild(el('p', null, summary(p)));
          ul.appendChild(li);
        });
      sec.appendChild(ul);
      root.appendChild(sec);
    });
  }

  // ---------- transmissions (trivia strip)
  var tIndex = Math.floor(Math.random() * TRIVIA.length);
  function showTransmission(delta) {
    tIndex = (tIndex + (delta || 0) + TRIVIA.length) % TRIVIA.length;
    var t = TRIVIA[tIndex];
    $('#tx-text').textContent = t.t;
    var b = $('#tx-from');
    b.textContent = 'relates to: ' + (byId[t.p] ? byId[t.p].name : t.p);
    b.onclick = function () {
      stopWalk(); select(t.p);
      $('#chart').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    };
  }

  // ---------- backend bits
  function setStatus(text, kind) {
    var s = $('#status');
    s.textContent = text;
    s.dataset.kind = kind;
  }

  function fmtDate(ms) {
    if (typeof ms !== 'number') return '';
    try { return new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch (e) { return ''; }
  }

  function renderStarlog(list) {
    var ul = $('#log-list');
    ul.textContent = '';
    if (!list.length) {
      ul.appendChild(el('li', { 'class': 'empty' }, 'No entries yet. The first one is yours.'));
      return;
    }
    list.forEach(function (r) {
      var d = (r && r.data) || {};
      var name = typeof d.name === 'string' && d.name.trim() ? d.name.slice(0, 40) : 'a passing ship';
      var msg = typeof d.message === 'string' ? d.message.slice(0, 280) : '';
      if (!msg) return;
      var li = el('li');
      var top = el('div', { 'class': 'lhead' });
      top.appendChild(el('strong', null, name));
      top.appendChild(el('span', { 'class': 'meta' }, fmtDate(r.uploaded)));
      if (typeof d.project === 'string' && byId[d.project]) {
        var b = el('button', { type: 'button', 'class': 'linkish small' }, '→ ' + byId[d.project].name);
        b.addEventListener('click', function () {
          select(d.project);
          $('#chart').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        });
        top.appendChild(b);
      }
      li.appendChild(top);
      li.appendChild(el('p', null, msg));
      ul.appendChild(li);
    });
  }

  function loadStarlog() {
    var note = $('#log-note');
    note.textContent = 'Listening…';
    return Backend.readStarlog().then(function (list) {
      note.textContent = '';
      renderStarlog(list);
    }).catch(function (err) {
      note.textContent = Backend.explain(err);
    });
  }

  function wireStarlog() {
    var form = $('#log-form');
    var sel = $('#log-project');
    PROJECTS.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (p) {
      sel.appendChild(el('option', { value: p.id }, p.name));
    });

    if (!Backend.enabled()) {
      form.querySelectorAll('input, textarea, select, button').forEach(function (n) { n.disabled = true; });
      $('#log-note').textContent = 'The Starlog is switched off until a Skapi project ID is added in js/config.js.';
      return;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = $('#log-note');
      if (form.elements.website.value) return; // honeypot: bots fill every field
      var last = Number(store('logged-at') || 0);
      if (Date.now() - last < 60000) { note.textContent = 'One entry a minute, please.'; return; }
      var entry = {
        name: form.elements.name.value.trim().slice(0, 40),
        message: form.elements.message.value.trim().slice(0, 280),
        project: form.elements.project.value || ''
      };
      if (!entry.message) { note.textContent = 'Say something first.'; return; }
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      note.textContent = 'Transmitting…';
      Backend.writeStarlog(entry).then(function () {
        store('logged-at', String(Date.now()));
        form.reset();
        return loadStarlog().then(function () { note.textContent = 'Logged. Thank you.'; });
      }).catch(function (err) {
        note.textContent = Backend.explain(err);
      }).then(function () { btn.disabled = false; });
    });
  }

  function wireSpark() {
    $('#p-spark').addEventListener('click', function () {
      var id = state.selected;
      if (!id || !Backend.enabled()) return;
      var btn = $('#p-spark');
      btn.disabled = true;
      Backend.spark(id).then(function () {
        store('sparked:' + id, '1');
        state.sparks[id] = (state.sparks[id] || 0) + 1;
        renderSpark();
      }).catch(function (err) {
        btn.disabled = false;
        btn.textContent = Backend.explain(err);
      });
    });
  }

  function startBackend() {
    if (!Backend.enabled()) { setStatus('backend: offline (no project ID)', 'off'); return; }
    setStatus('backend: connecting…', 'wait');
    Backend.info().then(function (info) {
      setStatus('backend: Skapi · ' + ((info && info.service_name) || 'connected'), 'on');
    }).catch(function (err) {
      setStatus('backend: ' + Backend.explain(err), 'off');
    });
    Backend.readSparks().then(function (counts) {
      state.sparks = counts || {};
      renderSpark();
    }).catch(function () { /* the starlog note already explains read failures */ });
    loadStarlog();
  }

  // ---------- background starfield (decorative)
  function starfield() {
    var c = $('#field');
    var ctx = c.getContext && c.getContext('2d');
    if (!ctx) return;
    var stars = [];
    function size() {
      var dpr = window.devicePixelRatio || 1;
      c.width = innerWidth * dpr; c.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = [];
      var n = Math.round(innerWidth * innerHeight / 3500);
      for (var i = 0; i < n; i++) {
        stars.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight,
          r: Math.random() * 1.1 + 0.2, p: Math.random() * 6.28, s: 0.3 + Math.random() });
      }
    }
    function frame(t) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var a = reduceMotion ? 0.6 : 0.35 + 0.35 * Math.sin(s.p + t / 1000 * s.s);
        ctx.fillStyle = 'rgba(220,230,255,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(frame);
    }
    size();
    addEventListener('resize', function () { size(); if (reduceMotion) frame(0); });
    requestAnimationFrame(frame);
  }

  // ---------- go
  layout();
  drawSky();
  starfield();

  var years = PROJECTS.map(function (p) { return p.year; });
  $('#stat-count').textContent = PROJECTS.length;
  $('#stat-threads').textContent = THREADS.length;
  $('#stat-span').textContent = Math.min.apply(null, years) + '–' + Math.max.apply(null, years);

  document.querySelectorAll('[data-lens-btn]').forEach(function (b) {
    b.addEventListener('click', function () { setLens(b.dataset.lensBtn); });
  });
  $('#walk').addEventListener('click', walk);
  $('#surprise').addEventListener('click', function () {
    stopWalk();
    select(PROJECTS[Math.floor(Math.random() * PROJECTS.length)].id);
  });
  $('#p-close').addEventListener('click', function () {
    stopWalk(); select(null);
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.selected) $('#p-close').click();
  });
  $('#tx-next').addEventListener('click', function () { showTransmission(1); });

  wireSpark();
  wireStarlog();
  setLens(store('lens') === 'rich' ? 'rich' : 'kat');
  showTransmission(0);

  var hash = decodeURIComponent(location.hash.slice(1));
  if (byId[hash]) select(hash);

  startBackend();
})();
