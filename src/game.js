// Nusantara Express: the game. One pixel canvas for the world, HTML on top for words and buttons.
(function (NX) {
  const { Px, PAL, SPR } = NX;
  const $ = (s, r = document) => r.querySelector(s);
  const reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = a => a[Math.floor(Math.random() * a.length)];

  /* ================= save ================= */
  const KEY = 'nx-save-v1';
  const fresh = () => ({ v: 1, lang: NX.DEFAULT_LANG, sound: true, coins: 0, stars: 0, loc: NX.START_CITY, ch: 0, deliveries: 0,
    found: [], houses: [], order: null, step: null, wrong: 0, seen: false, flights: 0, introDone: false });
  let G = fresh();
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.v === 1) G = Object.assign(fresh(), s); } catch (e) { /* no storage */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) { /* no storage */ } };

  /* ================= words ================= */
  const fill = (s, v) => (v ? s.replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m)) : s);
  const T = (k, v) => fill((NX.GT[G.lang] && NX.GT[G.lang][k]) || NX.GT.id[k] || k, v);
  const L = o => (o ? o[G.lang] || o.id : '');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dish = id => NX.DISHES[id];
  const dishVars = id => ({ dish: dish(id).low, Dish: dish(id).name });
  const npcOf = city => NX.CITIES[city].npc;
  const houseInfo = id => NX.CONTENT.houses.find(h => h.spr === id);
  const foodInfo = id => NX.CONTENT.food.find(f => f.spr === id);

  /* ================= sound (synth blips, no files) ================= */
  const Snd = {
    ac: null,
    ensure() {
      if (!this.ac) { try { this.ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; } }
      if (this.ac.state === 'suspended') this.ac.resume();
    },
    note(f, t0, dur, type = 'square', vol = 0.05, f2) {
      if (!G.sound || !this.ac) return;
      const ac = this.ac, o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + t0;
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
    },
    click() { this.note(660, 0, 0.06, 'square', 0.03); },
    coin() { this.note(988, 0, 0.05, 'square', 0.035); this.note(1319, 0.05, 0.1, 'square', 0.035); },
    fish() { this.note(523, 0, 0.08, 'triangle', 0.08); this.note(784, 0.08, 0.14, 'triangle', 0.08); },
    bump() { this.note(260, 0, 0.3, 'sawtooth', 0.04, 90); },
    wrong() { this.note(440, 0, 0.12, 'triangle', 0.07); this.note(370, 0.12, 0.22, 'triangle', 0.07); },
    ok() { [523, 659, 784, 1047].forEach((f, i) => this.note(f, i * 0.08, 0.14, 'square', 0.035)); },
    fanfare() { [523, 659, 784, 659, 784, 1047].forEach((f, i) => this.note(f, i * 0.12, 0.22, 'square', 0.04)); },
    talk() { this.note(620 + Math.random() * 240, 0, 0.025, 'square', 0.012); }
  };

  /* ================= pixel helpers ================= */
  const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  function grad(stops, x, y) {
    for (let i = 0; i < stops.length - 1; i++) {
      const [y0, c0] = stops[i], [y1, c1] = stops[i + 1];
      if (y >= y0 && y < y1) return BAYER[y & 3][x & 3] < ((y - y0) / (y1 - y0)) * 16 ? c1 : c0;
    }
    return stops[stops.length - 1][1];
  }
  const RGB = {};
  Object.keys(PAL).forEach(k => { const h = PAL[k]; RGB[k] = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; });
  function offscreen(px) {
    const c = document.createElement('canvas'); c.width = px.w; c.height = px.h;
    const x = c.getContext('2d'), img = x.createImageData(px.w, px.h);
    px.d.forEach((ch, i) => { if (ch !== '.') { const v = RGB[ch]; img.data[i * 4] = v[0]; img.data[i * 4 + 1] = v[1]; img.data[i * 4 + 2] = v[2]; img.data[i * 4 + 3] = 255; } });
    x.putImageData(img, 0, 0); return c;
  }
  const spriteCache = new Map();
  const sprCanvas = spr => { if (!spriteCache.has(spr)) spriteCache.set(spr, offscreen(spr)); return spriteCache.get(spr); };
  const blitSpr = (spr, x, y) => ctx.drawImage(sprCanvas(spr), Math.round(x), Math.round(y));
  const silhouette = spr => spr.clone().map(c => (c === '.' ? '.' : c === 'k' ? 'z' : 'X'));
  const getSpr = path => path.split('.').reduce((o, k) => (o ? o[k] : undefined), SPR);
  function fillSprites(root) {
    root.querySelectorAll('[data-spr]').forEach(el => {
      let spr = getSpr(el.dataset.spr); if (!spr) return;
      if (el.dataset.face) spr = el.dataset.spr === 'oyen' ? SPR.oyenFace : spr.face || spr;
      if (el.dataset.sil) spr = silhouette(spr);
      const c = offscreen(spr); c.className = 'spr'; c.style.width = spr.w * (+el.dataset.scale || 3) + 'px';
      c.setAttribute('aria-hidden', 'true'); el.textContent = ''; el.appendChild(c);
    });
  }
  function ring(cx, cy, r, col) {
    ctx.fillStyle = PAL[col]; let x = r, y = 0, e = 1 - r;
    while (x >= y) {
      [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]].forEach(([dx, dy]) => ctx.fillRect(Math.round(cx + dx), Math.round(cy + dy), 1, 1));
      y++; if (e < 0) e += 2 * y + 1; else { x--; e += 2 * (y - x) + 1; }
    }
  }

  /* ================= canvas + scene plumbing ================= */
  const game = $('#game'), cv = $('#world'), ctx = cv.getContext('2d');
  let scene = null, SCALE = 1, paused = false, clock = 0;
  // The stage fills the real visible box of #game. On a portrait touch screen it is turned 90deg so the
  // game plays in landscape; this happens inside #game, so fullscreen on #game keeps the rotation.
  const stage = $('#stage');
  let turnedState = false;
  function layoutStage() {
    const W = game.clientWidth, H = game.clientHeight;
    turnedState = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches) && H > W;
    stage.style.width = (turnedState ? H : W) + 'px';
    stage.style.height = (turnedState ? W : H) + 'px';
    stage.style.transform = turnedState ? `translateX(${W}px) rotate(90deg)` : 'none';
  }
  function fit() {
    layoutStage();
    game.classList.toggle('compact', stage.clientHeight < 380);
    const W = stage.clientWidth, H = stage.clientHeight;
    SCALE = scene.scale(W, H);
    cv.width = Math.ceil(W / SCALE); cv.height = Math.ceil(H / SCALE);
    cv.style.width = cv.width * SCALE + 'px'; cv.style.height = cv.height * SCALE + 'px';
    ctx.imageSmoothingEnabled = false;
    if (scene.layout) scene.layout(cv.width, cv.height);
  }
  function setScene(s) {
    if (scene && scene.exit) scene.exit();
    scene = s; game.dataset.scene = s.name; fit();
    if (s.enter) s.enter();
  }
  let resizeT = 0;
  const refit = () => { clearTimeout(resizeT); resizeT = setTimeout(() => scene && fit(), 60); };
  addEventListener('resize', refit);
  addEventListener('orientationchange', refit);
  document.addEventListener('fullscreenchange', () => { refit(); renderFsBtns(); });
  if (window.visualViewport) visualViewport.addEventListener('resize', refit);
  const turned = () => turnedState;
  const toLogical = e => {
    const r = cv.getBoundingClientRect();
    if (turned()) return [(e.clientY - r.top) / r.height * cv.width, (r.right - e.clientX) / r.width * cv.height];
    return [(e.clientX - r.left) / r.width * cv.width, (e.clientY - r.top) / r.height * cv.height];
  };
  cv.addEventListener('pointerdown', e => { Snd.ensure(); try { cv.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } if (scene.down) scene.down(...toLogical(e), e); });
  cv.addEventListener('pointermove', e => { if (scene.move) scene.move(...toLogical(e), e); });
  const up = e => { if (scene.up) scene.up(...toLogical(e), e); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', e => { if (scene.wheel) { e.preventDefault(); scene.wheel(e.deltaY); } }, { passive: false });
  const keys = {};
  addEventListener('keydown', e => {
    if (['ArrowUp', 'KeyW'].includes(e.code)) keys.up = true;
    if (['ArrowDown', 'KeyS'].includes(e.code)) keys.down = true;
    if (e.code === 'Space' || e.code === 'Enter') {
      if (!$('#talk').hidden) { e.preventDefault(); $('#talk').click(); }
      else if (scene && scene.name === 'flight' && scene.phase === 'ready') { e.preventDefault(); scene.down(0, 0); scene.up(); }
    }
    if (e.code === 'Escape' && $('#modal').hidden && $('#talk').hidden) openMenu();
  });
  addEventListener('keyup', e => {
    if (['ArrowUp', 'KeyW'].includes(e.code)) keys.up = false;
    if (['ArrowDown', 'KeyS'].includes(e.code)) keys.down = false;
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && scene && scene.name === 'flight' && scene.phase !== 'ready') openMenu(); });

  let last = performance.now();
  let seenW = 0, seenH = 0;
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (game.clientWidth !== seenW || game.clientHeight !== seenH) { seenW = game.clientWidth; seenH = game.clientHeight; if (scene) fit(); }
    if (!paused) { clock += dt; if (scene && scene.update) scene.update(dt); }
    if (scene) scene.draw(Math.floor(clock * 8), clock);
    requestAnimationFrame(loop);
  }

  /* ================= overlays: talk, cards, toasts, fade ================= */
  function faceOf(who) { return who === 'oyen' ? SPR.oyenFace : SPR[who].face; }
  function nameOf(who) { return who === 'oyen' ? 'Oyen' : NX.NPCS[who].name; }
  function talk(who, text) {
    return new Promise(res => {
      const el = $('#talk'), p = el.querySelector('.say'), pic = el.querySelector('.pic');
      el.querySelector('.tag').textContent = nameOf(who);
      pic.textContent = ''; const c = offscreen(faceOf(who)); c.className = 'spr'; c.style.width = faceOf(who).w * 3 + 'px'; pic.appendChild(c);
      el.classList.toggle('oyen', who === 'oyen'); el.classList.remove('done'); el.hidden = false;
      let i = 0, done = false, timer = 0;
      const finish = () => { done = true; clearTimeout(timer); p.textContent = text; el.classList.add('done'); };
      const step = () => { if (done) return; i += 2; p.textContent = text.slice(0, i); if (i % 8 === 0) Snd.talk(); if (i >= text.length) finish(); else timer = setTimeout(step, 28); };
      if (reduceMotion) finish(); else step();
      el.onclick = () => {
        if (!done) { finish(); return; }
        el.hidden = true; el.onclick = null; Snd.click(); res();
      };
    });
  }
  function card({ cls = '', html, buttons }) {
    return new Promise(res => {
      const m = $('#modal');
      m.innerHTML = `<div class="gp card ${cls}" role="dialog" aria-modal="true">${html}<div class="acts">${buttons.map(b =>
        `<button type="button" class="gbtn ${b.kind || ''}" data-id="${b.id}">${esc(b.label)}</button>`).join('')}</div></div>`;
      fillSprites(m); m.hidden = false;
      m.querySelectorAll('button[data-id]').forEach(b => { b.onclick = () => { Snd.click(); m.hidden = true; m.innerHTML = ''; res(b.dataset.id); }; });
      const first = m.querySelector('.gbtn.primary') || m.querySelector('.gbtn'); if (first) first.focus({ preventScroll: true });
    });
  }
  function toast(html, ms = 2200) {
    const box = $('#toasts'), t = document.createElement('div');
    t.className = 'gp toast'; t.innerHTML = html; fillSprites(t); box.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, ms);
  }
  const icon = (path, scale = 2) => `<span data-spr="${path}" data-scale="${scale}"></span>`;
  function fade(fn) {
    const f = $('#fade');
    return new Promise(res => {
      f.classList.add('on');
      setTimeout(() => { fn(); requestAnimationFrame(() => { f.classList.remove('on'); setTimeout(res, 260); }); }, reduceMotion ? 0 : 260);
    });
  }
  function bubble(text, ms = 1400) {
    const b = $('#bubble'); b.textContent = text; b.hidden = false; clearTimeout(bubble.t);
    bubble.t = setTimeout(() => { b.hidden = true; }, ms);
  }

  /* ================= hero (title) scene ================= */
  const HH = 120, HORIZON = 72;
  function heroBase(w) {
    const p = new Px(w, HH);
    for (let y = 0; y < HH; y++) for (let x = 0; x < w; x++)
      p.set(x, y, y < HORIZON ? grad([[0, 'a'], [34, 'i'], [64, 'm'], [72, 'm']], x, y) : grad([[72, 'a'], [80, 'A'], [104, 'd'], [120, 'D']], x, y));
    p.ellipse(w - 36, 32, 12, 12, 'm'); p.ellipse(w - 36, 32, 9, 9, 'Y');
    const volcano = x => Math.max(0, 17 - Math.abs(x - 40) * 0.55);
    const hills = x => 4 + 3 * Math.sin(x * 0.13) + 1.5 * Math.sin(x * 0.41);
    for (let x = 0; x <= 96; x++) {
      const h = Math.min(15, Math.max(volcano(x), hills(x) * Math.max(0, 1 - Math.max(0, x - 80) / 16)));
      for (let y = Math.round(HORIZON - h); y < HORIZON; y++) p.set(x, y, x > 40 && BAYER[y & 3][x & 3] < 7 ? 'h' : 'G');
    }
    const r0 = w - 90;
    const ih = x => Math.max(0, (6 + 4 * Math.sin((x - r0) * 0.07) + 1.5 * Math.sin(x * 0.33)) * Math.min(1, (x - r0) / 10));
    for (let x = r0; x < w; x++) { const top = Math.round(HORIZON - ih(x)); for (let y = top; y < HORIZON; y++) p.set(x, y, y === top ? 'g' : 'G'); }
    [[r0 + 22, 0], [r0 + 34, 1], [r0 + 76, 0]].forEach(([x, tilt]) => {
      if (x >= w - 3) return;
      const baseY = HORIZON - Math.round(ih(x));
      for (let i = 1; i <= 7; i++) p.set(x + (i > 4 ? tilt : 0), baseY - i, 'b');
      [[-3, 1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [3, 1], [-1, -1], [1, -1], [-2, 1], [2, 1]].forEach(([dx, dy]) => p.set(x + tilt + dx, baseY - 8 + dy, 'G'));
    });
    p.hline(0, 90, HORIZON - 1, 'n'); p.hline(r0 + 2, w - 1, HORIZON - 1, 'n');
    return p;
  }
  function makeCloud(w) {
    const p = new Px(w + 2, 12);
    p.ellipse(w * 0.3, 7, w * 0.26, 4, 'w'); p.ellipse(w * 0.55, 5.5, w * 0.28, 5, 'w'); p.ellipse(w * 0.78, 7.5, w * 0.2, 3.5, 'w');
    p.rect(Math.round(w * 0.1), 8, Math.round(w * 0.82), 3, 'w');
    return p.map((c, x, y) => (c === 'w' && y >= 10 ? 'x' : c));
  }
  const HCLOUDS = [{ s: makeCloud(34), x: 20, y: 10, v: 0.12 }, { s: makeCloud(24), x: 120, y: 22, v: 0.2 }, { s: makeCloud(40), x: 170, y: 6, v: 0.08 }];
  const TitleScene = {
    name: 'title',
    scale(W, H) { return Math.max(1, Math.min(W / 240, H / HH)); },
    layout(w, h) {
      this.bg = offscreen(heroBase(w)); this.y0 = Math.floor((h - HH) / 2);
      const r = NX.rng(11); this.glints = Array.from({ length: Math.round(w / 7) }, () => ({ x: r() * w, y: HORIZON + 3 + Math.floor(r() * 43), l: 2 + Math.floor(r() * 3) }));
    },
    draw(f) {
      const w = cv.width, h = cv.height, y0 = this.y0;
      ctx.fillStyle = PAL.a; ctx.fillRect(0, 0, w, y0 + 1); ctx.fillStyle = PAL.D; ctx.fillRect(0, y0 + HH - 1, w, h);
      ctx.drawImage(this.bg, 0, y0);
      HCLOUDS.forEach(c => { const W2 = w + c.s.w; blitSpr(c.s, ((c.x - f * c.v) % W2 + W2) % W2 - c.s.w, y0 + c.y); });
      this.glints.forEach(g => { ctx.fillStyle = g.y < 86 ? PAL.i : PAL.a; ctx.fillRect(Math.round((g.x + f * 0.25) % w), y0 + g.y, g.l, 1); });
      blitSpr(SPR.pinisi, 14, y0 + 56 + (Math.floor(f / 4) % 2));
      ctx.fillStyle = PAL.w; [[16, 0], [22, 1], [50, 0], [56, 1]].forEach(([x, o]) => ctx.fillRect(x + ((f >> 2) % 2), y0 + 87 + o, 3, 1));
      const px = Math.round(w * 0.58), py = y0 + 40 + Math.round(Math.sin(f / 5) * 2);
      blitSpr(SPR.capung[f % 2], px, py);
      ctx.fillStyle = PAL.w; for (let i = 0; i < 3; i++) if ((f + i) % 3) ctx.fillRect(px - 16 - i * 6 - (f % 3) * 2, py + 9 + i * 4, 5, 1);
    }
  };

  /* ================= map scene ================= */
  const WLD = NX.WORLD;
  const mapXY = (lon, lat) => [(lon - 94.5) / 47 * 168, (6.5 - lat) / 18 * 64];
  let worldBg = null;
  function worldBase() {
    const W = WLD.W, H = WLD.H, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? '.' : WLD.rows[y][x]);
    const dist = new Array(W * H).fill(99), q = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (at(x, y) !== '.') { dist[y * W + x] = 0; q.push([x, y]); }
    for (let i = 0; i < q.length; i++) {
      const [x, y] = q[i], d = dist[y * W + x];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H && dist[ny * W + nx] > d + 1) { dist[ny * W + nx] = d + 1; q.push([nx, ny]); }
      }
    }
    const r = NX.rng(5), p = new Px(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = at(x, y), d = dist[y * W + x], b = BAYER[y & 3][x & 3];
      if (c === '.') p.set(x, y, d === 1 ? 'i' : d <= 3 ? (d === 3 && b < 8 ? 'A' : 'a') : d <= 7 ? 'A' : (b < Math.min(16, (d - 7) * 5) ? 'd' : 'A'));
      else {
        const edge = at(x - 1, y) === '.' || at(x + 1, y) === '.' || at(x, y - 1) === '.' || at(x, y + 1) === '.';
        const below = at(x, y + 1) === '.', v = r();
        if (c === 'I') p.set(x, y, below ? 'N' : edge ? 'n' : v < 0.1 ? 'G' : v < 0.15 ? 'l' : 'g');
        else p.set(x, y, below ? 'X' : edge ? 'x' : v < 0.1 ? 'X' : 'x');
      }
    }
    return p;
  }
  const MAPWAVES = (() => { const r = NX.rng(3), out = []; for (let i = 0; i < 110; i++) out.push([Math.floor(r() * WLD.W), Math.floor(r() * WLD.H)]); return out; })();
  // Layout offsets, not screen rects: they stay correct when the game is rotated for portrait phones.
  function edgeH(sel, fromTop) {
    const el = $(sel); if (!el || !el.offsetHeight) return 0;
    return fromTop ? el.offsetTop + el.offsetHeight : stage.clientHeight - el.offsetTop;
  }
  function routePts(a, b) {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const c = [mx, my - Math.min(22, len * 0.22)], pts = [];
    const n = Math.max(8, Math.round(len * 1.5));
    for (let i = 0; i <= n; i++) { const s = i / n, u = 1 - s; pts.push([u * u * a[0] + 2 * u * s * c[0] + s * s * b[0], u * u * a[1] + 2 * u * s * c[1] + s * s * b[1]]); }
    return pts;
  }
  // Box that holds every pin and label, in core-map pixels. Default zoom fits it to the free area.
  const CITIES_BOX = { x0: 13, x1: 172, y0: 15, y1: 62 };
  const MapScene = {
    name: 'map', zoom: 1, cx: null, cy: null, pts: new Map(), pinch: null, moved: false,
    edges() { const c = game.classList.contains('compact'); return [Math.max(edgeH('#hud', true), c ? edgeH('#task', true) : 0), c ? 6 : edgeH('#task', false)]; },
    free(W, H) { const [t, b] = this.edges(); return [W, H - t - b]; },
    scale(W, H) {
      const [fw, fh] = this.free(W, H);
      this.base = Math.max(1, Math.min(fw / (CITIES_BOX.x1 - CITIES_BOX.x0), fh / (CITIES_BOX.y1 - CITIES_BOX.y0)));
      this.minZoom = Math.min(1, Math.min(W / (WLD.W - 8), H / (WLD.H - 8)) / this.base);
      this.zoom = clamp(this.zoom, this.minZoom, 3);
      return this.base * this.zoom;
    },
    layout(w, h) {
      if (!worldBg) worldBg = offscreen(worldBase());
      const [t, b] = this.edges(); this.top = t / SCALE; this.bot = b / SCALE;
      if (this.cx === null) { this.cx = (CITIES_BOX.x0 + CITIES_BOX.x1) / 2; this.cy = (CITIES_BOX.y0 + CITIES_BOX.y1) / 2; }
      this.place(w, h); placeLabels();
    },
    // Put the focus point (cx, cy in core-map px) at the centre of the free area, keeping the map raster under the whole view.
    place(w, h) {
      const fx = w / 2, fy = this.top + (h - this.top - this.bot) / 2;
      const lim = (v, lo, hi) => (lo > hi ? (lo + hi) / 2 : clamp(v, lo, hi));
      this.ox = Math.round(lim(fx - this.cx, w - WLD.W + WLD.MX, WLD.MX));
      this.oy = Math.round(lim(fy - this.cy, h - WLD.H + WLD.MY, WLD.MY));
      this.cx = fx - this.ox; this.cy = fy - this.oy;
    },
    show(cities) {
      if (!cities.length || this.ox === undefined) return;
      const w = cv.width, h = cv.height, m = 10;
      let dx = 0, dy = 0;
      cities.forEach(id => {
        const [x, y] = this.pos(id);
        if (x < m) dx = Math.max(dx, m - x); if (x > w - m) dx = Math.min(dx, w - m - x);
        if (y - 8 < this.top + 2) dy = Math.max(dy, this.top + 2 - (y - 8)); if (y + 8 > h - this.bot - 2) dy = Math.min(dy, h - this.bot - 2 - (y + 8));
      });
      if (dx || dy) { this.cx -= dx; this.cy -= dy; this.place(w, h); moveLabels(); }
    },
    down(x, y, e) {
      this.pts.set(e.pointerId, { x, y, sx: e.clientX, sy: e.clientY, cx: e.clientX, cy: e.clientY });
      if (this.pts.size === 1) { this.moved = false; this.downAt = [x, y]; }
      if (this.pts.size === 2) { const [a, b] = [...this.pts.values()]; this.pinch = { d: Math.hypot(a.cx - b.cx, a.cy - b.cy) || 1, zoom: this.zoom }; this.moved = true; }
    },
    move(x, y, e) {
      const p = this.pts.get(e.pointerId); if (!p) return;
      p.cx = e.clientX; p.cy = e.clientY;
      if (this.pts.size === 1) {
        if (!this.moved && Math.hypot(e.clientX - p.sx, e.clientY - p.sy) > 8) this.moved = true;
        if (this.moved && !isNaN(p.x)) { this.cx -= x - p.x; this.cy -= y - p.y; this.place(cv.width, cv.height); moveLabels(); }
        p.x = x; p.y = y;
      } else if (this.pinch && this.pts.size === 2) {
        const [a, b] = [...this.pts.values()];
        this.zoom = this.pinch.zoom * Math.hypot(a.cx - b.cx, a.cy - b.cy) / this.pinch.d;
        fit(); this.pts.forEach(q => { q.x = NaN; });
      }
    },
    up(x, y, e) {
      const had = this.pts.delete(e.pointerId);
      if (had && this.pts.size === 0 && !this.moved) { const c = this.cityAt(...this.downAt); if (c) onCity(c); }
      if (this.pts.size < 2) this.pinch = null;
      if (this.pts.size === 1) { const [q] = [...this.pts.values()]; q.x = NaN; this.moved = true; }
    },
    wheel(dy) { this.zoom *= Math.pow(1.0015, -dy); fit(); },
    pos(city) { const c = NX.CITIES[city], [x, y] = mapXY(c.lon, c.lat); return [this.ox + x, this.oy + y]; },
    cityAt(x, y) {
      let best = null, bd = 10;
      for (const id of Object.keys(NX.CITIES)) { const [cx, cy] = this.pos(id), d = Math.hypot(x - cx, y - (cy - 3)); if (d < bd) { bd = d; best = id; } }
      return best;
    },
    draw(f) {
      const w = cv.width, h = cv.height;
      ctx.fillStyle = PAL.d; ctx.fillRect(0, 0, w, h);
      const bx = this.ox - WLD.MX, by = this.oy - WLD.MY;
      ctx.drawImage(worldBg, bx, by);
      ctx.fillStyle = PAL.a;
      MAPWAVES.forEach(([x, y]) => {
        const xx = (x + (f >> 2)) % WLD.W;
        if (WLD.rows[y][xx] === '.' && WLD.rows[y][(xx + 1) % WLD.W] === '.' && (f + x) % 16 < 12) ctx.fillRect(bx + xx, by + y, 2, 1);
      });
      const o = G.order, d = o && dish(o.dish);
      if (o && G.step === 'deliver') {
        ctx.fillStyle = PAL.w;
        routePts(this.pos(G.loc), this.pos(o.to)).forEach(([x, y], i) => { if ((i + (f >> 1)) % 4 < 2) ctx.fillRect(Math.round(x), Math.round(y), 1, 1); });
      }
      for (const id of Object.keys(NX.CITIES)) {
        const [x, y] = this.pos(id);
        const hot = o && G.step === 'pickup' && G.wrong >= 1 && NX.CITIES[id].island === NX.CITIES[d.city].island;
        blitSpr(SPR.mapPin, Math.round(x) - 3, Math.round(y) - 7 - (hot ? (f >> 1) % 2 : 0));
      }
      const target = o ? (G.step === 'deliver' ? o.to : G.wrong >= 2 ? d.city : null) : null;
      if (target) { const [x, y] = this.pos(target); ring(x, y - 3, 6 + (f % 3), f % 2 ? 'Y' : 'w'); }
      const [lx, ly] = this.pos(G.loc);
      blitSpr(SPR.miniPlane, Math.round(lx) + 1, Math.round(ly) - 14 + ((f >> 2) % 2));
    },
  };
  let labelEls = [];
  function placeLabels() {
    const box = $('#labels'); box.textContent = ''; labelEls = [];
    for (const isl of Object.values(NX.ISLANDS)) {
      const el = document.createElement('span'); el.className = 'isle'; el.textContent = isl.name;
      box.appendChild(el); labelEls.push({ el, xy: mapXY(isl.lon, isl.lat) });
    }
    for (const [id, c] of Object.entries(NX.CITIES)) {
      const xy = mapXY(c.lon, c.lat), b = document.createElement('button');
      b.type = 'button'; b.className = 'city'; b.textContent = c.name;
      b.onclick = () => { Snd.ensure(); onCity(id); }; box.appendChild(b); labelEls.push({ el: b, xy, city: true });
    }
    moveLabels();
  }
  function moveLabels() {
    const s = MapScene, w = cv.width;
    labelEls.forEach(({ el, xy, city }) => {
      const x = s.ox + xy[0], y = s.oy + xy[1];
      el.style.left = x * SCALE + 'px'; el.style.top = y * SCALE + 'px';
      el.classList.toggle('end', x > w - 14); el.classList.toggle('start', x < 14);
    });
  }

  /* ================= flight scene ================= */
  function flightBg(w, h, sea) {
    const p = new Px(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
      p.set(x, y, y < sea ? grad([[0, 'a'], [Math.round(sea * 0.55), 'i'], [Math.round(sea * 0.92), 'm'], [sea, 'm']], x, y) : grad([[sea, 'a'], [sea + 7, 'A'], [h, 'd']], x, y));
    p.ellipse(w - 42, Math.round(sea * 0.3), 11, 11, 'm'); p.ellipse(w - 42, Math.round(sea * 0.3), 8, 8, 'Y');
    return p;
  }
  function islandStrip() {
    const W = 520, H = 26, p = new Px(W, H), r = NX.rng(21);
    let x = 10;
    while (x < W - 60) {
      const iw = 30 + Math.floor(r() * 60), ih = 5 + Math.floor(r() * 9), volc = r() < 0.3;
      for (let i = 0; i < iw; i++) {
        const t = i / iw, hh = volc ? Math.min(ih + 6, (1 - Math.abs(t - 0.5) * 2) * (ih + 10)) : Math.sin(Math.PI * t) * ih + Math.sin(i * 0.5) * 0.8;
        for (let y = Math.round(H - Math.max(1, hh)); y < H; y++) p.set(x + i, y, y === Math.round(H - Math.max(1, hh)) ? 'g' : BAYER[y & 3][(x + i) & 3] < 5 ? 'h' : 'G');
      }
      p.hline(x, x + iw - 1, H - 1, 'n');
      x += iw + 30 + Math.floor(r() * 70);
    }
    return offscreen(p);
  }
  const PX = 26;
  function FlightScene(from, to) {
    const a = mapXY(NX.CITIES[from].lon, NX.CITIES[from].lat), b = mapXY(NX.CITIES[to].lon, NX.CITIES[to].lat);
    const dur = clamp(13 + Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.11, 14, 30);
    let resolve; const result = new Promise(r => { resolve = r; });
    const easy = G.flights < 2;
    return {
      name: 'flight', result, from, to, dur, t: 0, phase: 'ready', coins: 0, bumps: 0, inv: 0, speed: 0, items: [], parts: [],
      nextCoin: 0.8, nextCloud: easy ? 4 : 3, fishDone: false, warned: false, landT: 0, py: 0, target: 0, dragY: null, dragT: 0, scroll: 0, done: false,
      scale(W, H) { return Math.max(1, Math.min(H / 120, W / 200)); },
      layout(w, h) {
        this.w = w; this.h = h; this.sea = h - 26; this.minY = 12; this.maxY = this.sea - 21;
        if (!this.py) this.py = this.target = Math.round((this.minY + this.maxY) / 2);
        this.py = clamp(this.py, this.minY, this.maxY + 3); this.target = clamp(this.target, this.minY, this.maxY + 3);
        this.bg = offscreen(flightBg(w, h, this.sea)); this.isl = islandStrip();
        const r = NX.rng(9);
        this.sky = Array.from({ length: Math.max(3, Math.round(w / 80)) }, () => ({ x: r() * w, y: 6 + r() * (this.sea * 0.5), v: 0.3 + r() * 0.3 }));
        this.glints = Array.from({ length: Math.round(w / 8) }, () => ({ x: r() * w, y: this.sea + 2 + Math.floor(r() * 22), l: 2 + Math.floor(r() * 3) }));
      },
      enter() {
        $('#fhud .from').textContent = NX.CITIES[from].name; $('#fhud .to').textContent = NX.CITIES[to].name;
        $('#ready .how').textContent = G.flights < 3 ? T('howTo') : '';
        $('#ready .go').textContent = T('tapToFly'); $('#ready').hidden = false; this.hud();
      },
      exit() { $('#ready').hidden = true; $('#bubble').hidden = true; },
      hud() { $('#fhud .bar i').style.width = clamp(this.t / dur, 0, 1) * 100 + '%'; $('#fhud .n').textContent = this.coins; },
      stars() { return this.bumps <= 1 ? 3 : this.bumps <= 3 ? 2 : 1; },
      spawnCoins() {
        const kind = Math.random() < 0.5 ? 'line' : 'arc', n = kind === 'line' ? 5 : 6;
        let y0 = this.minY + 8 + Math.random() * (this.maxY - this.minY);
        const near = this.items.filter(i => i.type === 'cloud' && i.x > this.w - 60);
        if (near.some(c => Math.abs(c.y + 8 - y0) < 22)) y0 = y0 < this.sea / 2 ? y0 + 30 : y0 - 30;
        y0 = clamp(y0, this.minY + 4, this.sea - 12);
        for (let i = 0; i < n; i++) this.items.push({ type: 'coin', x: this.w + 8 + i * 13, y: kind === 'line' ? y0 : y0 - Math.sin(i / (n - 1) * Math.PI) * 14, ph: i });
      },
      spawnCloud() {
        const y = this.minY - 2 + Math.random() * (this.maxY - this.minY);
        this.items.push({ type: 'cloud', x: this.w + 30, y });
        if (!this.warned && G.flights < 3) { this.warned = true; bubble(T('rainWarn'), 2000); }
      },
      update(dt) {
        if (this.phase === 'ready') { this.scroll += 8 * dt; return; }
        if (keys.up) this.target -= 80 * dt;
        if (keys.down) this.target += 80 * dt;
        if (this.phase === 'fly') this.target = clamp(this.target, this.minY, this.maxY);
        this.py += (this.target - this.py) * Math.min(1, dt * 8);
        if (this.phase === 'fly') {
          this.t += dt; this.speed = Math.min(46, this.speed + 50 * dt);
          if (this.t < dur - 2.5) {
            if ((this.nextCoin -= dt) <= 0) { this.nextCoin = 1.3 + Math.random() * 0.8; this.spawnCoins(); }
            if ((this.nextCloud -= dt) <= 0) { this.nextCloud = (easy ? 3.8 : 2.6) + Math.random() * 1.4; this.spawnCloud(); }
            if (!this.fishDone && this.t > dur * 0.45 && Math.random() < dt * 0.4) { this.fishDone = true; this.items.push({ type: 'fish', x: this.w + 10, y: this.minY + 10 + Math.random() * (this.maxY - this.minY) }); }
          }
          if (this.t >= dur) { this.phase = 'land'; bubble(T('landing')); }
        } else if (this.phase === 'land') {
          this.landT += dt; this.speed = Math.max(0, this.speed - 20 * dt); this.target = this.maxY + 3;
          if (!this.splashed && this.py > this.maxY + 1.5) { this.splashed = true; this.parts.push({ kind: 'splash', x: PX + 12, y: this.sea - 3, t: 0.6 }); Snd.note(300, 0, 0.2, 'triangle', 0.05, 120); }
          if (this.landT > 2.6 && !this.done) { this.done = true; resolve({ coins: this.coins, stars: this.stars() }); }
        }
        this.scroll += this.speed * dt;
        const x0 = PX + 5, x1 = PX + 34, y0 = this.py + 6, y1 = this.py + 19;
        for (const it of this.items) {
          it.x -= this.speed * dt;
          if (it.dead) continue;
          if (it.type === 'coin' && it.x + 9 > x0 && it.x + 2 < x1 && it.y + 9 > y0 && it.y + 2 < y1) {
            it.dead = true; this.coins++; Snd.coin(); this.parts.push({ kind: 'spark', x: it.x + 5, y: it.y + 5, t: 0.35 });
          } else if (it.type === 'fish' && it.x + 13 > x0 && it.x + 2 < x1 && it.y + 10 > y0 && it.y + 1 < y1) {
            it.dead = true; this.coins += 10; Snd.fish(); bubble(T('fish')); this.parts.push({ kind: 'spark', x: it.x + 7, y: it.y + 5, t: 0.5 });
          } else if (it.type === 'cloud' && this.inv <= 0 && this.phase === 'fly' && it.x + 30 > x0 && it.x + 4 < x1 && it.y + 15 > y0 && it.y + 3 < y1) {
            this.bumps++; this.inv = 1.4; Snd.bump(); bubble(T('bump')); this.target = clamp(this.target + (this.py < this.sea / 2 ? 12 : -12), this.minY, this.maxY);
          }
        }
        this.items = this.items.filter(i => i.x > -40 && !(i.dead && i.type !== 'cloud'));
        this.inv = Math.max(0, this.inv - dt);
        this.parts.forEach(p => { p.t -= dt; }); this.parts = this.parts.filter(p => p.t > 0);
        this.hud();
      },
      draw(f, time) {
        const w = this.w, sea = this.sea;
        ctx.drawImage(this.bg, 0, 0);
        const iw = 520, sx = -((this.scroll * 0.2) % iw);
        for (let x = sx; x < w; x += iw) ctx.drawImage(this.isl, Math.round(x), sea - 26);
        this.sky.forEach(c => { const W2 = w + 40; blitSpr(SPR.cloudWhite, ((c.x - this.scroll * c.v) % W2 + W2) % W2 - 32, c.y); });
        this.glints.forEach(g => { ctx.fillStyle = g.y < sea + 8 ? PAL.i : PAL.a; ctx.fillRect(Math.round(((g.x - this.scroll) % w + w) % w), g.y, g.l, 1); });
        for (const it of this.items) {
          if (it.type === 'cloud') {
            blitSpr(SPR.rainCloud, it.x, it.y);
            ctx.fillStyle = PAL.a;
            for (let i = 0; i < 6; i++) ctx.fillRect(Math.round(it.x + 6 + i * 4), Math.round(it.y + 17 + ((f * 3 + i * 5) % 12)), 1, 2);
          } else if (!it.dead && it.type === 'coin') blitSpr(SPR.coinSpin[(f + it.ph) % 4], it.x, it.y);
          else if (!it.dead && it.type === 'fish') blitSpr(SPR.icons.ikan, it.x, it.y + Math.round(Math.sin(time * 5) * 1.5));
        }
        const bob = this.phase === 'ready' ? Math.round(Math.sin(time * 3) * 1.5) : 0;
        if (!(this.inv > 0 && f % 2 === 0)) blitSpr(SPR.capung[f % 2], PX, this.py + bob);
        if (this.speed > 20 && f % 2) { ctx.fillStyle = PAL.w; for (let i = 0; i < 3; i++) ctx.fillRect(PX - 6 - i * 6, Math.round(this.py) + 9 + i * 4, 4, 1); }
        for (const p of this.parts) {
          if (p.kind === 'spark') { ctx.fillStyle = PAL.m; const r = Math.round((0.4 - p.t) * 16); [[r, 0], [-r, 0], [0, r], [0, -r]].forEach(([dx, dy]) => ctx.fillRect(Math.round(p.x + dx), Math.round(p.y + dy), 1, 1)); }
          else blitSpr(SPR.splash, p.x - 4, p.y - Math.round((0.6 - p.t) * 6));
        }
        if (!$('#bubble').hidden) { const b = $('#bubble'), above = (this.py - 3) * SCALE - b.offsetHeight; b.style.left = (PX + 24) * SCALE + 'px'; b.style.top = (above > 64 ? above : (this.py + 27) * SCALE) + 'px'; }
      },
      down(x, y) {
        if (this.phase === 'ready') { this.phase = 'fly'; $('#ready').hidden = true; Snd.click(); }
        this.dragY = y; this.dragT = this.target;
      },
      move(x, y) { if (this.dragY !== null && this.phase === 'fly') this.target = clamp(this.dragT + (y - this.dragY) * 1.25, this.minY, this.maxY); },
      up() { this.dragY = null; }
    };
  }

  /* ================= base (markas) scene ================= */
  const SIGN = (() => {
    const p = new Px(13, 17);
    p.vline(6, 8, 15, 'b'); p.rect(1, 1, 11, 7, 'c'); p.hline(1, 11, 7, 'b');
    [[5, 2], [6, 2], [7, 2], [8, 3], [7, 4], [6, 5], [6, 7]].forEach(([x, y]) => p.set(x, y, 'k'));
    p.set(6, 7, 'c'); p.set(6, 6, 'k');
    return p.outline();
  })();
  const SLOTS = [
    { id: 'rumahGadang', dx: -114, row: 0 }, { id: 'rumahBetang', dx: -60, row: 0 }, { id: 'tongkonan', dx: -4, row: 0 },
    { id: 'joglo', dx: -110, row: 1 }, { id: 'honai', dx: -56, row: 1 }
  ];
  const BaseScene = {
    name: 'base', sparkle: null,
    scale(W, H) { return Math.max(1, Math.min(W / 270, H / 140)); },
    layout(w, h) {
      const cx = Math.round(w / 2), hz = h - 84, p = new Px(w, h);
      this.cx = cx; this.hz = hz;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
        p.set(x, y, y < hz ? grad([[0, 'a'], [Math.round(hz * 0.6), 'i'], [hz, 'm']], x, y) : grad([[hz, 'a'], [hz + 10, 'A'], [h, 'd']], x, y));
      const icx = cx - 24, icy = hz + 36;
      p.ellipse(icx, icy + 2, 112, 32, 'N'); p.ellipse(icx, icy, 112, 31, 'n'); p.ellipse(icx, icy - 1, 106, 27, 'g');
      const r = NX.rng(4);
      p.map((c, x, y) => (c === 'g' && r() < 0.08 ? 'G' : c === 'g' && r() < 0.04 ? 'l' : c));
      [[icx - 100, icy - 6], [icx + 96, icy - 4]].forEach(([x, y]) => {
        for (let i = 1; i <= 12; i++) p.set(x + (i > 7 ? 1 : 0), y - i, 'b');
        [[-4, 1], [-3, 0], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [3, 0], [4, 1], [-2, -1], [2, -1], [-3, 1], [3, 1], [0, -1]].forEach(([dx, dy]) => p.set(x + 1 + dx, y - 13 + dy, 'G'));
      });
      this.bg = offscreen(p);
      this.slots = SLOTS.map(s => { const spr = SPR.houses[s.id]; const base = s.row === 0 ? hz + 20 : hz + 47; return { id: s.id, x: cx + s.dx, y: base - spr.h, w: spr.w, h: spr.h, base, spr }; });
    },
    draw(f, time) {
      ctx.drawImage(this.bg, 0, 0);
      for (const s of this.slots) {
        if (G.houses.includes(s.id)) blitSpr(s.spr, s.x, s.y);
        else blitSpr(SIGN, s.x + Math.round(s.w / 2) - 6, s.base - 16);
      }
      blitSpr(f % 30 === 29 ? SPR.oyenBlink : SPR.oyen, this.cx - 12, this.hz + 47 - 24);
      blitSpr(SPR.capung[0], this.cx + 82, this.hz + 42 + ((f >> 2) % 2));
      if (this.sparkle) {
        const s = this.slots.find(q => q.id === this.sparkle.id);
        if (s && time - this.sparkle.t < 3) {
          const r = NX.rng(Math.floor(time * 6));
          for (let i = 0; i < 6; i++) { const x = s.x + r() * s.w, y = s.y + r() * s.h; ctx.fillStyle = PAL[i % 2 ? 'Y' : 'w']; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); ctx.fillRect(Math.round(x) - 1, Math.round(y), 3, 1); ctx.fillRect(Math.round(x), Math.round(y) - 1, 1, 3); }
        }
      }
    },
    down(x, y) {
      for (const s of this.slots) {
        const inside = x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.base;
        if (!inside) continue;
        const info = houseInfo(s.id);
        if (G.houses.includes(s.id)) {
          Snd.click();
          card({ cls: 'fact', html: `<div class="fh">${esc(info.name)}</div><div class="fb">${icon('houses.' + s.id, 2)}<div><small class="place">${esc(info.place)}</small><p>${esc(L(info.d))}</p></div></div>`, buttons: [{ id: 'ok', label: T('ok'), kind: 'primary' }] });
        } else {
          const isl = Object.values(NX.ISLANDS).find(i => i.house === s.id);
          toast(esc(T('lockedHouse', { island: isl.name, house: info.name })), 2600);
        }
        return;
      }
    }
  };

  /* ================= HUD, task, labels, book, menu ================= */
  function renderHud() {
    const inCh = G.ch < NX.CHAPTER1.length;
    $('#hud .coins b').textContent = G.coins;
    $('#hud .stars b').textContent = G.stars;
    $('#hud .prog').textContent = inCh ? `${T('chapter')} · ${G.ch}/${NX.CHAPTER1.length}` : `${T('free')} · ${G.deliveries}`;
    $('#hud [data-act="book"] span.l').textContent = T('book');
    $('#hud [data-act="base"] span.l').textContent = T('base');
    $('#hud [data-act="menu"] span.l').textContent = T('pause');
  }
  function renderTask() {
    const el = $('#task');
    if (!G.order) { el.innerHTML = ''; return; }
    const o = G.order, d = dish(o.dish);
    if (G.step === 'pickup') {
      el.innerHTML = `${icon('food.' + o.dish, 2)}<div class="tt"><b>${esc(T('pickupTask', { dish: d.name }))}</b><small>${esc(T('pickupHelp', { dish: d.low }))}</small></div>
        <button type="button" class="gbtn sea" data-act="clue">${esc(T('clue'))}</button>`;
    } else {
      const c = NX.CITIES[o.to];
      el.innerHTML = `${icon('food.' + o.dish, 2)}<div class="tt"><b>${esc(T('deliverTask', { name: NX.NPCS[c.npc].name }))}</b><small>${esc(T('deliverHelp', { city: c.name }))}</small></div>
        <span class="who">${`<span data-spr="${c.npc}" data-face="1" data-scale="2"></span>`}</span>`;
    }
    fillSprites(el);
    const btn = el.querySelector('[data-act="clue"]'); if (btn) btn.onclick = () => { if (!busy) showOrder(false); };
  }
  function refresh() {
    renderHud(); renderTask();
    if (scene && scene.name === 'map') {
      fit();
      const o = G.order, want = [G.loc];
      if (o && G.step === 'deliver') want.push(o.to);
      if (o && G.step === 'pickup' && G.wrong >= 2) want.push(dish(o.dish).city);
      MapScene.show(want);
    }
  }

  function applyLang(lang) {
    G.lang = lang; save(); document.documentElement.lang = lang;
    document.querySelectorAll('[data-gt]').forEach(el => { el.textContent = T(el.dataset.gt); });
    document.querySelectorAll('[data-setlang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.setlang === lang)));
    $('#title .play').textContent = G.introDone ? T('resume') : T('play');
    renderSoundBtns(); renderFsBtns(); refresh();
    if (!$('#book').hidden) renderBook();
    if (scene && scene.name === 'map') placeLabels();
  }
  function renderSoundBtns() { document.querySelectorAll('[data-act="sound"]').forEach(b => { b.textContent = `${T('sound')}: ${G.sound ? T('on') : T('off')}`; b.setAttribute('aria-pressed', String(G.sound)); }); }

  let bookTab = 'food';
  function renderBook() {
    const el = $('#book'), list = bookTab === 'food' ? NX.CONTENT.food : NX.CONTENT.houses;
    const have = id => (bookTab === 'food' ? G.found : G.houses).includes(id);
    const path = id => (bookTab === 'food' ? 'food.' : 'houses.') + id, sc = bookTab === 'food' ? 4 : 2;
    const tiles = list.map(x => have(x.spr)
      ? `<button type="button" class="bk" data-id="${x.spr}">${icon(path(x.spr), sc)}<b>${esc(x.name)}</b></button>`
      : `<div class="bk off"><span data-spr="${path(x.spr)}" data-sil="1" data-scale="${sc}"></span><b>???</b></div>`).join('');
    el.innerHTML = `<div class="bk-head"><h2>${esc(T('bookTitle'))}</h2>
      <div class="gseg" role="tablist"><button type="button" role="tab" data-tab="food" aria-selected="${bookTab === 'food'}">${esc(T('tabFood'))} ${G.found.length}/8</button><button type="button" role="tab" data-tab="house" aria-selected="${bookTab === 'house'}">${esc(T('tabHouse'))} ${G.houses.length}/5</button></div>
      <button type="button" class="gbtn" data-act="close">${esc(T('back'))}</button></div>
      <div class="bk-grid">${tiles}</div>`;
    fillSprites(el);
    el.querySelectorAll('[data-tab]').forEach(b => { b.onclick = () => { Snd.click(); bookTab = b.dataset.tab; renderBook(); }; });
    el.querySelectorAll('.bk[data-id]').forEach(b => { b.onclick = () => { Snd.click(); bookCard(b.dataset.id); }; });
    el.querySelector('[data-act="close"]').onclick = () => { Snd.click(); el.hidden = true; };
  }
  function bookCard(id) {
    if (bookTab === 'food') {
      const f = foodInfo(id), d = dish(id);
      card({ cls: 'fact', html: `<div class="fh">${esc(f.name)}</div><div class="fb">${icon('food.' + id, 4)}<div><small class="place">${esc(f.place)}</small><p>${esc(L(f.d))}</p><p>${esc(L(d.fact))}</p></div></div>`, buttons: [{ id: 'ok', label: T('ok'), kind: 'primary' }] });
    } else {
      const h = houseInfo(id);
      card({ cls: 'fact', html: `<div class="fh">${esc(h.name)}</div><div class="fb">${icon('houses.' + id, 2)}<div><small class="place">${esc(h.place)}</small><p>${esc(L(h.d))}</p></div></div>`, buttons: [{ id: 'ok', label: T('ok'), kind: 'primary' }] });
    }
  }
  function openBook() { Snd.click(); renderBook(); $('#book').hidden = false; $('#book').scrollTop = 0; }

  function openMenu() {
    if (!scene || scene.name === 'title' || !$('#modal').hidden || !$('#talk').hidden) return;
    const inFlight = scene.name === 'flight';
    paused = true;
    const m = $('#modal');
    const render = () => {
      m.innerHTML = `<div class="gp card menu" role="dialog" aria-modal="true"><div class="fh">${esc(T('paused'))}</div>
        <div class="menu-body">
          <button type="button" class="gbtn primary" data-m="resume">${esc(T('continue'))}</button>
          <div class="row"><span>${esc(T('lang'))}</span><div class="gseg"><button type="button" data-setlang="id" aria-pressed="${G.lang === 'id'}">ID</button><button type="button" data-setlang="en" aria-pressed="${G.lang === 'en'}">EN</button></div></div>
          <button type="button" class="gbtn" data-act="sound"></button>
          <button type="button" class="gbtn" data-act="fs"></button>
          ${inFlight ? '' : `<button type="button" class="gbtn" data-m="title">${esc(T('toTitle'))}</button><button type="button" class="gbtn danger" data-m="restart">${esc(T('restart'))}</button>`}
        </div></div>`;
      renderSoundBtns(); renderFsBtns();
      m.querySelector('[data-act="fs"]').onclick = () => { Snd.click(); goFullscreen().then(render); };
      m.querySelector('[data-m="resume"]').onclick = () => { Snd.click(); m.hidden = true; m.innerHTML = ''; paused = false; };
      m.querySelectorAll('[data-setlang]').forEach(b => { b.onclick = () => { Snd.click(); applyLang(b.dataset.setlang); render(); }; });
      m.querySelector('[data-act="sound"]').onclick = () => { G.sound = !G.sound; save(); Snd.ensure(); Snd.click(); renderSoundBtns(); };
      const t = m.querySelector('[data-m="title"]'); if (t) t.onclick = () => { Snd.click(); m.hidden = true; paused = false; goTitle(); };
      const r = m.querySelector('[data-m="restart"]');
      if (r) r.onclick = () => {
        m.innerHTML = `<div class="gp card menu"><div class="fh">${esc(T('restart'))}</div><div class="menu-body"><p>${esc(T('sure'))}</p>
          <button type="button" class="gbtn danger" data-m="yes">${esc(T('yesRestart'))}</button><button type="button" class="gbtn" data-m="no">${esc(T('cancel'))}</button></div></div>`;
        m.querySelector('[data-m="yes"]').onclick = () => { const keep = { lang: G.lang, sound: G.sound }; G = Object.assign(fresh(), keep); save(); m.hidden = true; paused = false; goTitle(); };
        m.querySelector('[data-m="no"]').onclick = () => { Snd.click(); render(); };
      };
    };
    render(); m.hidden = false;
  }

  /* ================= fullscreen ================= */
  // Fullscreen #game itself, then try to lock landscape. Either may be refused or never answer
  // inside an embedded viewer, so each gets a short timeout and can never hold up the game.
  const settle = p => Promise.race([Promise.resolve(p).catch(() => {}), new Promise(r => setTimeout(r, 700))]);
  const canFs = () => !!(document.fullscreenEnabled !== false && (game.requestFullscreen || game.webkitRequestFullscreen));
  async function goFullscreen() {
    if (!document.fullscreenElement && canFs()) {
      try { await settle(game.requestFullscreen ? game.requestFullscreen({ navigationUI: 'hide' }) : game.webkitRequestFullscreen()); } catch (e) { /* refused */ }
    }
    if (document.fullscreenElement && screen.orientation && screen.orientation.lock) { try { await settle(screen.orientation.lock('landscape')); } catch (e) { /* refused */ } }
    refit(); renderFsBtns();
  }
  function renderFsBtns() {
    document.querySelectorAll('[data-act="fs"]').forEach(b => { b.hidden = !canFs() || !!document.fullscreenElement; b.textContent = T('full'); });
  }

  /* ================= game flow ================= */
  let busy = false;
  function newOrder() {
    let o;
    if (G.ch < NX.CHAPTER1.length) o = Object.assign({}, NX.CHAPTER1[G.ch]);
    else {
      const prev = G.lastDish, all = Object.keys(NX.DISHES).filter(d => d !== prev && NX.DISHES[d].city !== G.loc);
      const dd = pick(all.length ? all : Object.keys(NX.DISHES));
      o = { dish: dd, to: pick(Object.keys(NX.CITIES).filter(c => c !== NX.DISHES[dd].city)) };
    }
    G.order = o; G.step = 'pickup'; G.wrong = 0; G.seen = false; save(); refresh();
  }
  async function showOrder(first) {
    const o = G.order; if (!o) return;
    const d = dish(o.dish), c = NX.CITIES[o.to], who = c.npc, npc = NX.NPCS[who];
    const extra = G.wrong >= 1 ? `<div class="clue x"><b>${esc(T('extra'))}</b><span>${esc(L(d.hint))}</span></div>` : '';
    await card({
      cls: 'order',
      html: `<div class="ribbon">${esc(T('newOrder'))}</div>
        <div class="who"><span data-spr="${who}" data-face="1" data-scale="3"></span><div><b>${esc(npc.name)}</b><small>${esc(c.name)}</small></div>${icon('food.' + o.dish, 3)}</div>
        <p class="msg">${esc(fill(L(npc.ask), dishVars(o.dish)))}</p>
        <div class="clue"><b>${esc(T('clue'))}</b><span>${esc(L(d.clue))}</span></div>${extra}`,
      buttons: [{ id: 'ok', label: first ? T('accept') : T('ok'), kind: 'primary' }]
    });
    if (first) { G.seen = true; save(); await talk('oyen', fill(L(pick(NX.OYEN.accept)), dishVars(o.dish))); }
    refresh();
  }
  async function flyTo(city) {
    await fade(() => setScene(FlightScene(G.loc, city)));
    const res = await scene.result;
    G.coins += res.coins; G.stars += res.stars; G.loc = city; G.flights++; save();
    await fade(() => setScene(MapScene));
    toast(`${icon('icons.koin')}<span>${esc(T('coinsGot', { n: res.coins }))}</span>${Array.from({ length: res.stars }, () => icon('icons.bintang')).join('')}`, 2400);
  }
  async function doPickup() {
    const o = G.order, d = dish(o.dish);
    await talk(npcOf(d.city), L(d.pickup));
    await talk('oyen', L(pick(NX.OYEN.afterPickup)));
    G.step = 'deliver'; save(); Snd.ok(); refresh();
    toast(`${icon('food.' + o.dish)}<span>${esc(T('ready', { dish: d.name }))}</span>`);
  }
  async function doDeliver() {
    const o = G.order, d = dish(o.dish), who = npcOf(o.to);
    await talk(who, fill(L(NX.NPCS[who].thanks), dishVars(o.dish)));
    G.coins += 50; G.deliveries++; G.lastDish = o.dish; Snd.ok(); save(); refresh();
    toast(`${icon('icons.koin')}<b>${esc(T('delivered'))}</b><span>+50</span>`);
    if (!G.found.includes(o.dish)) {
      G.found.push(o.dish); save();
      await card({ cls: 'fact', html: `<div class="fh">${esc(T('didYouKnow'))}</div><div class="fb">${icon('food.' + o.dish, 4)}<div><b class="nm">${esc(d.name)}</b><small class="place">${esc(foodInfo(o.dish).place)}</small><p>${esc(L(d.fact))}</p></div></div><p class="ff">${icon('icons.buku', 1)}${esc(T('newCard'))}</p>`, buttons: [{ id: 'ok', label: T('ok'), kind: 'primary' }] });
    }
    let placeHouse = null;
    const isl = NX.ISLANDS[NX.CITIES[d.city].island];
    if (isl.house && !G.houses.includes(isl.house)) {
      G.houses.push(isl.house); save(); Snd.fanfare();
      const info = houseInfo(isl.house);
      const choice = await card({ cls: 'unlock', html: `<div class="fh gold">${esc(info.name)}</div><div class="fb col">${icon('houses.' + isl.house, 3)}<p>${esc(T('unlocked', { house: info.name }))}</p></div>`,
        buttons: [{ id: 'place', label: T('place'), kind: 'primary' }, { id: 'later', label: T('later') }] });
      if (choice === 'place') placeHouse = isl.house;
    }
    const inChapter = G.ch < NX.CHAPTER1.length;
    if (inChapter) G.ch++;
    G.order = null; save();
    if (inChapter && G.ch === NX.CHAPTER1.length) {
      Snd.fanfare();
      await card({ cls: 'unlock', html: `<div class="fh gold">${esc(T('chapter'))}</div><div class="fb col">${icon('oyen', 3)}<p>${esc(T('chapterDone'))}</p></div>`, buttons: [{ id: 'ok', label: T('ok'), kind: 'primary' }] });
      await talk('oyen', T('afterChapter'));
    }
    newOrder();
    if (placeHouse) { await fade(() => { BaseScene.sparkle = { id: placeHouse, t: clock }; setScene(BaseScene); }); return; }
    await showOrder(true);
  }
  async function onCity(id) {
    if (busy || !G.order || scene.name !== 'map') return;
    busy = true; Snd.click();
    try {
      const o = G.order, d = dish(o.dish), c = NX.CITIES[id];
      if (G.step === 'pickup') {
        if (id === d.city) {
          if (G.loc !== id) await flyTo(id); else await talk('oyen', T('sameCity', { city: c.name }));
          await doPickup();
        } else {
          G.wrong++; save(); Snd.wrong();
          await talk('oyen', T('wrong', { dish: d.low, city: c.name }));
          await talk('oyen', `${T('extra')}: ${L(d.hint)}`);
        }
      } else if (G.step === 'deliver') {
        if (id === o.to) { await flyTo(id); await doDeliver(); }
        else { const t = NX.CITIES[o.to]; await talk('oyen', T('notHere', { name: NX.NPCS[t.npc].name, city: t.name })); }
      }
    } finally { busy = false; refresh(); }
  }
  async function backToMap() {
    await fade(() => setScene(MapScene));
    if (G.order && !G.seen) await showOrder(true);
  }
  function goTitle() { $('#book').hidden = true; setScene(TitleScene); applyLang(G.lang); }
  async function startPlay() {
    Snd.ensure(); Snd.click();
    if (window.matchMedia('(pointer: coarse)').matches) await goFullscreen();
    await fade(() => setScene(MapScene));
    busy = true;
    try {
      if (!G.introDone) { for (const l of NX.OYEN.intro) await talk('oyen', L(l)); G.introDone = true; save(); }
      if (!G.order) newOrder();
      if (!G.seen) await showOrder(true);
    } finally { busy = false; refresh(); }
  }

  /* ================= wire up ================= */
  $('#title .play').onclick = startPlay;
  document.querySelectorAll('[data-setlang]').forEach(b => { b.onclick = () => { Snd.ensure(); Snd.click(); applyLang(b.dataset.setlang); }; });
  document.querySelectorAll('#title [data-act="fs"]').forEach(b => { b.onclick = () => { Snd.ensure(); Snd.click(); goFullscreen(); }; });
  document.querySelectorAll('#title [data-act="sound"]').forEach(b => { b.onclick = () => { G.sound = !G.sound; save(); Snd.ensure(); Snd.click(); renderSoundBtns(); }; });
  $('#hud [data-act="book"]').onclick = () => { if (!busy) openBook(); };
  $('#hud [data-act="base"]').onclick = () => { if (!busy) { Snd.click(); fade(() => setScene(BaseScene)); } };
  $('#hud [data-act="menu"]').onclick = () => { if (!busy) openMenu(); };
  $('#fhud .pause').onclick = openMenu;
  $('#basebar [data-act="back"]').onclick = () => { Snd.click(); backToMap(); };
  ['#hud .coins', '#hud .stars'].forEach((s, i) => { const el = $(s + ' i'); el.dataset.spr = i ? 'icons.bintang' : 'icons.koin'; el.dataset.scale = '2'; });
  document.querySelectorAll('#hud [data-ic]').forEach(el => { el.dataset.spr = 'icons.' + el.dataset.ic; el.dataset.scale = '2'; });
  const fhudCoin = $('#fhud .c i'); fhudCoin.dataset.spr = 'icons.koin'; fhudCoin.dataset.scale = '2';
  const logoOyen = $('#title .mascot'); logoOyen.dataset.spr = 'oyen'; logoOyen.dataset.scale = '4';
  fillSprites(document);
  NX.game = { get state() { return G; }, onCity, get scene() { return scene; } };
  setScene(TitleScene);
  applyLang(G.lang);
  requestAnimationFrame(loop);
})(NX);
