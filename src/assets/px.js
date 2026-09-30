// Nusantara Express: tiny pixel-art engine. Sprites are code, so the game ships fully offline.
// Rows can be literal ("kkoo..") or run-length ("2. 3o k"). '.' is transparent.
var NX = (typeof NX !== 'undefined') ? NX : {};
(function (NX) {
  // One shared palette keeps every asset in the same world.
  NX.PAL = {
    k: '#2b1d2e', K: '#45344a', z: '#6b5f66', X: '#9c918f', x: '#d6cdc4', w: '#fffaf0',
    m: '#fff0c2', y: '#ffd79a', o: '#f7a23b', O: '#d4721f', p: '#f6a1ae', P: '#de7f76',
    r: '#e2463b', R: '#a8313a', Y: '#ffcc33', j: '#e09a14', n: '#f3dc9b', N: '#d9b766',
    q: '#d3ae5f', Q: '#a17b35', c: '#c98b55', b: '#8e5a36', B: '#5b3724', H: '#33262a',
    s: '#f4c796', S: '#d9a06e', t: '#c6834e', T: '#99603a', u: '#7c4a2d', U: '#5d361f',
    l: '#b8e36f', g: '#5fbf48', G: '#2f8f45', h: '#1f5e40', i: '#bdf1f5', a: '#52bde8',
    A: '#2d82c9', d: '#1d4f91', D: '#173a6e', e: '#26a69a', E: '#177468', v: '#7b4fa6'
  };

  function row(str) {
    if (!/[\s\d]/.test(str)) return str.split('');
    const out = [];
    str.trim().split(/\s+/).forEach(tok => {
      const m = tok.match(/^(\d*)(.+)$/);
      const n = m[1] ? +m[1] : 1;
      for (let i = 0; i < n; i++) out.push(...m[2]);
    });
    return out;
  }

  class Px {
    constructor(w, h) { this.w = w; this.h = h; this.d = new Array(w * h).fill('.'); }
    static from(rows, opt = {}) {
      let r = rows.map(row);
      if (opt.mirror) r = r.map(a => a.concat(a.slice(0, opt.odd ? -1 : undefined).reverse()));
      const w = opt.w || Math.max(...r.map(a => a.length));
      const p = new Px(w, opt.h || r.length);
      r.forEach((a, y) => a.forEach((c, x) => p.set(x, y, opt.map && opt.map[c] !== undefined ? opt.map[c] : c)));
      return p;
    }
    get(x, y) { return (x < 0 || y < 0 || x >= this.w || y >= this.h) ? '.' : this.d[y * this.w + x]; }
    set(x, y, c) {
      x = Math.round(x); y = Math.round(y);
      if (c && c !== '.' && x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = c;
      return this;
    }
    clear(x, y) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = '.'; return this; }
    rect(x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c); return this; }
    hline(x0, x1, y, c) { return this.rect(Math.min(x0, x1), y, Math.abs(x1 - x0) + 1, 1, c); }
    vline(x, y0, y1, c) { return this.rect(x, Math.min(y0, y1), 1, Math.abs(y1 - y0) + 1, c); }
    line(x0, y0, x1, y1, c) {
      let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, e = dx + dy;
      for (;;) { this.set(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
      return this;
    }
    ellipse(cx, cy, rx, ry, c, test) {
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
        for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
          const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
          if (dx * dx + dy * dy <= 1 && (!test || test(x, y))) this.set(x, y, c);
        }
      return this;
    }
    // Fill between top(x) and bot(x) for x in [x0, x1]
    span(x0, x1, top, bot, c) {
      for (let x = x0; x <= x1; x++) { const t = Math.round(top(x)), b = Math.round(bot(x)); for (let y = t; y <= b; y++) this.set(x, y, typeof c === 'function' ? c(x, y, t, b) : c); }
      return this;
    }
    stamp(x, y, rows, opt = {}) {
      const s = rows instanceof Px ? rows : Px.from(rows, opt);
      for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) { const c = s.get(i, j); if (c !== '.') this.set(x + i, y + j, c); }
      return this;
    }
    map(fn) { this.d = this.d.map((c, i) => fn(c, i % this.w, Math.floor(i / this.w))); return this; }
    swap(m) { return this.map(c => (m[c] !== undefined ? m[c] : c)); }
    outline(c = 'k') {
      const src = this.d.slice(), W = this.w;
      const at = (x, y) => (x < 0 || y < 0 || x >= this.w || y >= this.h) ? '.' : src[y * W + x];
      for (let y = 0; y < this.h; y++) for (let x = 0; x < W; x++)
        if (at(x, y) === '.' && (at(x - 1, y) !== '.' || at(x + 1, y) !== '.' || at(x, y - 1) !== '.' || at(x, y + 1) !== '.')) this.d[y * W + x] = c;
      return this;
    }
    clone() { const p = new Px(this.w, this.h); p.d = this.d.slice(); return p; }
    crop(x, y, w, h) { const p = new Px(w, h); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p.d[j * w + i] = this.get(x + i, y + j); return p; }
    flipX() { const p = new Px(this.w, this.h); for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) p.d[y * this.w + x] = this.get(this.w - 1 - x, y); return p; }
    pad(n) { const p = new Px(this.w + 2 * n, this.h + 2 * n); return p.stamp(n, n, this); }
  }
  NX.Px = Px;

  // Draw a sprite onto a 2D canvas context at integer scale.
  NX.draw = function (ctx, spr, x, y, s = 1) {
    for (let j = 0; j < spr.h; j++) for (let i = 0; i < spr.w; i++) {
      const c = spr.d[j * spr.w + i];
      if (c !== '.') { ctx.fillStyle = NX.PAL[c] || c; ctx.fillRect((x + i) * s, (y + j) * s, s, s); }
    }
  };
  // Seeded random so decorations never jump between renders.
  NX.rng = function (seed) { return function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; };
})(NX);
