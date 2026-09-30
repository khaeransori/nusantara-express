// Asset review sheet: renders sprites, scenes and bilingual copy. Game code will reuse src/*.
(function (NX) {
  const { Px, PAL, SPR, CONTENT } = NX;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lang = NX.DEFAULT_LANG;
  try { const s = localStorage.getItem('nx-lang'); if (NX.LANGS.includes(s)) lang = s; } catch (e) { /* storage blocked */ }

  const get = path => path.split('.').reduce((o, k) => (o ? o[k] : undefined), SPR);
  const t = k => (NX.T[lang] && NX.T[lang][k]) || NX.T.id[k] || k;
  const L = o => (o && typeof o === 'object' ? (o[lang] || o.id) : o);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function canvasFor(spr, scale) {
    const c = document.createElement('canvas');
    c.width = spr.w; c.height = spr.h;
    c.style.width = spr.w * scale + 'px';
    c.className = 'spr';
    NX.draw(c.getContext('2d'), spr, 0, 0, 1);
    return c;
  }
  function fillSprites(root) {
    root.querySelectorAll('[data-spr]').forEach(el => {
      const spr = get(el.dataset.spr);
      if (!spr) return;
      el.textContent = '';
      const c = canvasFor(spr.face && el.dataset.face ? spr.face : spr, +el.dataset.scale || 4);
      c.setAttribute('aria-hidden', 'true');
      el.appendChild(c);
    });
  }

  /* ---------- content lists ---------- */
  function renderLists() {
    document.getElementById('people').innerHTML = CONTENT.people.map(p => `
      <article class="card">
        <div class="stage"><span data-spr="${p.spr}" data-scale="5"></span></div>
        <div class="card-body">
          <h4>${esc(p.name)}</h4>
          <p class="place">${esc(p.place)}</p>
          <p>${esc(L(p.wear))}</p>
          <p class="aside">${esc(L(p.title))}</p>
        </div>
      </article>`).join('');
    document.getElementById('food').innerHTML = CONTENT.food.map(f => `
      <article class="card">
        <div class="stage"><span data-spr="food.${f.spr}" data-scale="5"></span></div>
        <div class="card-body">
          <h4>${esc(f.name)}</h4>
          <p class="place">${esc(f.place)}</p>
          <p>${esc(L(f.d))}</p>
        </div>
      </article>`).join('');
    document.getElementById('houses').innerHTML = CONTENT.houses.map((h, i) => `
      <article class="card${i < 2 ? ' wide' : ''}">
        <div class="stage tall"><span data-spr="houses.${h.spr}" data-scale="4"></span></div>
        <div class="card-body">
          <h4>${esc(h.name)}</h4>
          <p class="place">${esc(h.place)}</p>
          <p>${esc(L(h.d))}</p>
        </div>
      </article>`).join('');
    document.getElementById('palette').innerHTML = CONTENT.palette.map(p => `
      <li><span class="sw" style="background:${PAL[p.c]}"></span><span class="sw-name">${esc(p[lang])}</span><code>${PAL[p.c]}</code></li>`).join('');
    document.getElementById('voice').innerHTML = CONTENT.voice.map(v => `
      <div class="vrow">
        <p class="vwhen">${esc(L(v.when))}</p>
        <p class="vline${lang === 'id' ? ' on' : ''}" lang="id"><b>ID</b>${esc(v.id)}</p>
        <p class="vline${lang === 'en' ? ' on' : ''}" lang="en"><b>EN</b>${esc(v.en)}</p>
      </div>`).join('');
    document.getElementById('legend').innerHTML = CONTENT.food.map(f => `
      <li><span data-spr="food.${f.spr}" data-scale="2"></span><span><b>${esc(f.place.split(',')[0])}</b> ${esc(f.name)}</span></li>`).join('');
    const labels = document.getElementById('map-labels');
    labels.innerHTML = CONTENT.food.map(f => {
      const [x, y] = mapXY(f.lon, f.lat);
      const edge = x / NX.MAP.W > 0.9 ? ' end' : '';
      return `<span class="map-label${edge}" style="left:${(x / NX.MAP.W) * 100}%;top:${(y / NX.MAP.H) * 100}%">${esc(f.place.split(',')[0])}</span>`;
    }).join('');
    fillSprites(document);
  }

  function applyLang(next) {
    lang = next;
    try { localStorage.setItem('nx-lang', lang); } catch (e) { /* storage blocked */ }
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    renderLists();
  }
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang)));

  /* ---------- dithering helpers ---------- */
  const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  function grad(stops, x, y) {
    for (let i = 0; i < stops.length - 1; i++) {
      const [y0, c0] = stops[i], [y1, c1] = stops[i + 1];
      if (y >= y0 && y < y1) { const f = (y - y0) / (y1 - y0); return BAYER[y & 3][x & 3] < f * 16 ? c1 : c0; }
    }
    return stops[stops.length - 1][1];
  }
  function blit(ctx, px) {
    const img = ctx.createImageData(px.w, px.h);
    const rgb = {};
    Object.keys(PAL).forEach(k => { const h = PAL[k]; rgb[k] = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; });
    px.d.forEach((c, i) => { if (c === '.') return; const v = rgb[c]; img.data.set([v[0], v[1], v[2], 255], i * 4); });
    ctx.putImageData(img, 0, 0);
  }
  const offscreen = (px) => { const c = document.createElement('canvas'); c.width = px.w; c.height = px.h; blit(c.getContext('2d'), px); return c; };

  /* ---------- hero scene ---------- */
  const HW = 240, HH = 120, HORIZON = 72;
  function heroBase() {
    const p = new Px(HW, HH);
    for (let y = 0; y < HH; y++) for (let x = 0; x < HW; x++)
      p.set(x, y, y < HORIZON ? grad([[0, 'a'], [34, 'i'], [64, 'm'], [72, 'm']], x, y) : grad([[72, 'a'], [80, 'A'], [104, 'd'], [120, 'D']], x, y));
    p.ellipse(204, 32, 12, 12, 'm'); p.ellipse(204, 32, 9, 9, 'Y');
    const volcano = x => Math.max(0, 17 - Math.abs(x - 40) * 0.55);
    const hills = x => 4 + 3 * Math.sin(x * 0.13) + 1.5 * Math.sin(x * 0.41);
    for (let x = 0; x <= 96; x++) {
      const h = Math.min(15, Math.max(volcano(x), hills(x) * Math.max(0, 1 - Math.max(0, x - 80) / 16)));
      for (let y = Math.round(HORIZON - h); y < HORIZON; y++) p.set(x, y, x > 40 && BAYER[y & 3][x & 3] < 7 ? 'h' : 'G');
    }
    for (let x = 150; x < HW; x++) {
      const h = Math.max(0, (6 + 4 * Math.sin((x - 150) * 0.07) + 1.5 * Math.sin(x * 0.33)) * Math.min(1, (x - 150) / 10));
      const top = Math.round(HORIZON - h);
      for (let y = top; y < HORIZON; y++) p.set(x, y, y === top ? 'g' : 'G');
    }
    [[172, 0], [184, 1], [226, 0]].forEach(([x, tilt]) => {
      const baseY = HORIZON - Math.round(6 + 4 * Math.sin((x - 150) * 0.07) + 1.5 * Math.sin(x * 0.33));
      for (let i = 1; i <= 7; i++) p.set(x + (i > 4 ? tilt : 0), baseY - i, 'b');
      const ty = baseY - 8, tx = x + tilt;
      [[-3, 1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [3, 1], [-1, -1], [1, -1], [-2, 1], [2, 1]].forEach(([dx, dy]) => p.set(tx + dx, ty + dy, 'G'));
    });
    p.hline(0, 90, HORIZON - 1, 'n'); p.hline(152, HW - 1, HORIZON - 1, 'n');
    return p;
  }
  function cloud(w) {
    const p = new Px(w + 2, 12);
    p.ellipse(w * 0.3, 7, w * 0.26, 4, 'w'); p.ellipse(w * 0.55, 5.5, w * 0.28, 5, 'w'); p.ellipse(w * 0.78, 7.5, w * 0.2, 3.5, 'w');
    p.rect(Math.round(w * 0.1), 8, Math.round(w * 0.82), 3, 'w');
    p.map((c, x, y) => (c === 'w' && y >= 10 ? 'x' : c));
    return p;
  }
  const CLOUDS = [{ s: cloud(34), x: 20, y: 10, v: 0.12 }, { s: cloud(24), x: 120, y: 22, v: 0.2 }, { s: cloud(40), x: 170, y: 6, v: 0.08 }];
  const rnd = NX.rng(11);
  const GLINTS = Array.from({ length: 34 }, () => ({ x: rnd() * HW, y: HORIZON + 3 + Math.floor(rnd() * (HH - HORIZON - 5)), l: 2 + Math.floor(rnd() * 3) }));
  let heroCanvas, heroCtx, heroBg;
  function drawHero(f) {
    heroCtx.drawImage(heroBg, 0, 0);
    CLOUDS.forEach(c => { const W = HW + c.s.w; const x = ((c.x - f * c.v) % W + W) % W - c.s.w; NX.draw(heroCtx, c.s, Math.round(x), c.y, 1); });
    heroCtx.fillStyle = PAL.x;
    const sm = (f % 24) / 24;
    heroCtx.fillRect(40, Math.round(52 - sm * 8), 2, 2); heroCtx.fillRect(38 + Math.round(sm * 4), Math.round(47 - sm * 8), 2, 2);
    GLINTS.forEach(g => { heroCtx.fillStyle = g.y < 86 ? PAL.i : PAL.a; heroCtx.fillRect(Math.round((g.x + f * 0.25) % HW), g.y, g.l, 1); });
    const bob = Math.floor(f / 4) % 2;
    NX.draw(heroCtx, SPR.pinisi, 14, 56 + bob, 1);
    heroCtx.fillStyle = PAL.w;
    [[16, 0], [22, 1], [50, 0], [55, 1], [58, 0]].forEach(([x, o]) => heroCtx.fillRect(x + ((f >> 2) % 2), 87 + o, 3, 1));
    const py = 44 + Math.round(Math.sin(f / 5) * 2);
    NX.draw(heroCtx, SPR.capung[f % 2], 140, py, 1);
    heroCtx.fillStyle = PAL.w;
    for (let i = 0; i < 3; i++) if ((f + i) % 3) heroCtx.fillRect(122 - i * 6 - (f % 3) * 2, py + 9 + i * 4, 5, 1);
    heroCtx.fillStyle = PAL.k;
    [[176, 18], [186, 23]].forEach(([x, y], i) => {
      const up = (f + i * 2) % 6 < 3;
      heroCtx.fillRect(x, y, 1, 1); heroCtx.fillRect(x + 4, y, 1, 1); heroCtx.fillRect(x + 2, y + 1, 1, 1);
      heroCtx.fillRect(x + 1, y + (up ? -1 : 1), 1, 1); heroCtx.fillRect(x + 3, y + (up ? -1 : 1), 1, 1);
    });
  }

  /* ---------- map ---------- */
  const M = NX.MAP;
  function mapXY(lon, lat) { return [(lon - M.LON0) / (M.LON1 - M.LON0) * M.W, (M.LAT0 - lat) / (M.LAT0 - M.LAT1) * M.H]; }
  function mapBase() {
    const W = M.W, H = M.H, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? '.' : M.rows[y][x]);
    const dist = new Array(W * H).fill(99), q = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (at(x, y) !== '.') { dist[y * W + x] = 0; q.push([x, y]); }
    for (let i = 0; i < q.length; i++) {
      const [x, y] = q[i], d = dist[y * W + x];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        if (dist[ny * W + nx] > d + 1) { dist[ny * W + nx] = d + 1; q.push([nx, ny]); }
      }
    }
    const r = NX.rng(5), p = new Px(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = at(x, y), d = dist[y * W + x];
      if (c === '.') p.set(x, y, d === 1 ? 'i' : d <= 3 ? (d === 3 && BAYER[y & 3][x & 3] < 8 ? 'A' : 'a') : d <= 7 ? 'A' : (BAYER[y & 3][x & 3] < Math.min(16, (d - 7) * 5) ? 'd' : 'A'));
      else {
        const edge = at(x - 1, y) === '.' || at(x + 1, y) === '.' || at(x, y - 1) === '.' || at(x, y + 1) === '.';
        const below = at(x, y + 1) === '.';
        const v = r();
        if (c === 'I') p.set(x, y, below ? 'N' : edge ? 'n' : v < 0.1 ? 'G' : v < 0.15 ? 'l' : 'g');
        else p.set(x, y, below ? 'X' : edge ? 'x' : v < 0.1 ? 'X' : 'x');
      }
    }
    return p;
  }
  let mapCtx, mapBg;
  const route = (() => {
    const a = mapXY(100.35, -0.95), b = mapXY(140.72, -2.53), c = [95, 12];
    const pts = [];
    for (let i = 0; i <= 200; i++) { const s = i / 200, u = 1 - s; pts.push([u * u * a[0] + 2 * u * s * c[0] + s * s * b[0], u * u * a[1] + 2 * u * s * c[1] + s * s * b[1]]); }
    return pts;
  })();
  const WAVES = (() => { const r = NX.rng(3), out = []; for (let i = 0; i < 70; i++) out.push([Math.floor(r() * M.W), Math.floor(r() * M.H)]); return out; })();
  function drawMap(f) {
    mapCtx.drawImage(mapBg, 0, 0);
    mapCtx.fillStyle = PAL.a;
    WAVES.forEach(([x, y]) => {
      const xx = (x + (f >> 2)) % M.W;
      if (M.rows[y][xx] === '.' && M.rows[y][(xx + 1) % M.W] === '.' && (f + x) % 16 < 12) mapCtx.fillRect(xx, y, 2, 1);
    });
    mapCtx.fillStyle = PAL.w;
    route.forEach(([x, y], i) => { if (i % 6 < 3 && y > 0) mapCtx.fillRect(Math.round(x), Math.round(y), 1, 1); });
    CONTENT.food.forEach((fd, i) => {
      const [x, y] = mapXY(fd.lon, fd.lat);
      const lift = fd.spr === 'papeda' && (f >> 2) % 2 ? 1 : 0;
      NX.draw(mapCtx, SPR.mapPin, Math.round(x) - 3, Math.round(y) - 7 - lift, 1);
    });
    const k = Math.floor((f * 1.2) % 240);
    const idx = Math.min(route.length - 1, k);
    const [px, py] = route[idx];
    NX.draw(mapCtx, SPR.miniPlane, Math.round(px) - 7, Math.round(py) - 5, 1);
  }

  /* ---------- small animations ---------- */
  function animated() {
    const oy = document.getElementById('oyen-big');
    const cap = document.getElementById('capung');
    const pin = document.getElementById('pinisi');
    const mk = (el, w, h, scale) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.style.width = w * scale + 'px'; c.className = 'spr'; c.setAttribute('aria-hidden', 'true'); el.appendChild(c); return c.getContext('2d'); };
    const oc = mk(oy, 24, 24, 8), cc = mk(cap, 40, 25, 5), pc = mk(pin, 50, 38, 4);
    return f => {
      oc.clearRect(0, 0, 24, 24); NX.draw(oc, f % 30 === 29 ? SPR.oyenBlink : SPR.oyen, 0, 0, 1);
      cc.clearRect(0, 0, 40, 25); NX.draw(cc, SPR.capung[f % 2], 0, Math.round(Math.sin(f / 5)), 1);
      pc.clearRect(0, 0, 50, 38); NX.draw(pc, SPR.pinisi, 0, 1 + (Math.floor(f / 4) % 2), 1);
    };
  }

  function boot() {
    applyLang(lang);
    fillSprites(document);
    heroCanvas = document.getElementById('hero');
    heroCtx = heroCanvas.getContext('2d');
    heroBg = offscreen(heroBase());
    const mc = document.getElementById('map');
    mapCtx = mc.getContext('2d');
    mapBg = offscreen(mapBase());
    const small = animated();
    let f = 0;
    const tick = () => { drawHero(f); drawMap(f); small(f); f++; };
    tick();
    if (reduce) return;
    let last = 0;
    const loop = ts => { if (ts - last > 125) { last = ts; tick(); } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(NX);
