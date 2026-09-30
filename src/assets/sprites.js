// Nusantara Express: all game sprites, drawn as code on the shared palette (see px.js).
(function (NX) {
  const { Px } = NX;
  const S = NX.SPR = {};

  function tri(p, a, b, c, col) {
    const minX = Math.min(a[0], b[0], c[0]), maxX = Math.max(a[0], b[0], c[0]);
    const minY = Math.min(a[1], b[1], c[1]), maxY = Math.max(a[1], b[1], c[1]);
    const e = (p0, p1, x, y) => (p1[0] - p0[0]) * (y - p0[1]) - (p1[1] - p0[1]) * (x - p0[0]);
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5, py = y + 0.5, w0 = e(b, c, px, py), w1 = e(c, a, px, py), w2 = e(a, b, px, py);
      if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0)) p.set(x, y, typeof col === 'function' ? col(x, y) : col);
    }
    return p;
  }

  /* ---------------- OYEN: orange cat courier-pilot ---------------- */
  const OYEN_HALF = [
    '12.',
    '3. o 8.',
    '3. p o 7.',
    '3. 2p o 6.',
    '3. 3o 3k 3o',
    '2. 3B k a i a k 2B',
    '. 4o k 3a k 2o',
    '. 5o 3k 3o',
    '. 11o',
    '. 6o w k 3o',
    '. 2o 2P 2o 2k 3y',
    '. 7o 3y p',
    '2. 5o 4y k',
    '3. 3o 4y k y',
    '4. 2o 6y',
    '4. R 7r',
    '5. 2R 5r',
    '5. 3o 4y',
    '4. o k 2o 4y',
    '4. o k 2o 4y',
    '4. w k 2o 4y',
    '5. 3o 4y',
    '7. 4w .',
    '12.'
  ];
  function oyen(blink) {
    const p = Px.from(OYEN_HALF, { mirror: true });
    // fur shading on the left cheek and ear edges
    [[2, 10], [2, 11], [3, 12], [4, 13]].forEach(([x, y]) => p.set(x, y, 'O'));
    [[21, 10], [21, 11], [20, 12], [19, 13]].forEach(([x, y]) => p.set(x, y, 'O'));
    // scarf tail, satchel strap and bag
    p.stamp(19, 15, ['2r', '. r R', '2. R']);
    p.line(6, 16, 15, 19, 'B');
    p.stamp(15, 18, ['5b', 'c Y 3c', '5c', '5c']);
    if (blink) { [7, 8, 15, 16].forEach(x => p.set(x, 9, 'o')); }
    return p.outline('k');
  }
  S.oyen = oyen(false);
  S.oyenBlink = oyen(true);
  S.oyenFace = S.oyen.crop(0, 0, 24, 17);

  /* ---------------- People (chibi, 16x24 base) ---------------- */
  const PERSON = [
    '8.', '8.', '8.',
    '5. 3#',
    '3. 5#',
    '2. 6#',
    '2. 2# 4@',
    '2. # 5@',
    '2. # 2@ k 2@',
    '2. # 2@ k 2@',
    '3. @ & 3@',
    '3. 4@ %',
    '4. 4@',
    '4. 4*',
    '3. 5*',
    '3. * + 3*',
    '3. * + 3*',
    '3. @ + 3*',
    '4. 4=',
    '4. 4=',
    '4. 3= -',
    '4. 3^ .',
    '8.', '8.'
  ];
  const SKIN = {
    light: { '@': 's', '%': 'S', '&': 'p' },
    medium: { '@': 't', '%': 'T', '&': 'P' },
    deep: { '@': 'u', '%': 'U', '&': 'P' }
  };
  function person(cfg) {
    const map = Object.assign({}, SKIN[cfg.skin], {
      '#': cfg.hair || 'H', '*': cfg.top, '+': cfg.topShade, '=': cfg.bottom, '-': cfg.bottomShade, '^': cfg.shoes
    });
    const p = Px.from(PERSON, { mirror: true, map });
    if (cfg.deco) cfg.deco(p);
    const out = p.pad(1).outline('k');
    out.face = out.crop(0, 0, 18, 15);
    return out;
  }

  // Uni Rani, Padang (Minangkabau): tengkuluak tanduak headcloth, baju kurung, songket
  S.uniRani = person({
    skin: 'light', top: 'r', topShade: 'R', bottom: 'R', bottomShade: 'B', shoes: 'B',
    deco(p) {
      p.stamp(0, 0, ['R 7.', 'r R 6.', '. r Y 5.', '. 2r Y 4r', '2. r Y 4Y', '2. 2r 4.', '2. 2r 4.'], { mirror: true });
      p.set(7, 13, 'Y'); p.set(8, 13, 'Y');
      for (let y = 18; y <= 20; y++) for (let x = 4; x <= 11; x++) if ((x + y) % 3 === 0 && p.get(x, y) === 'R') p.set(x, y, 'Y');
    }
  });
  // Mas Bayu, Yogyakarta (Jawa): blangkon, surjan lurik, jarik batik
  S.masBayu = person({
    skin: 'medium', top: 'b', topShade: 'B', bottom: 'c', bottomShade: 'B', shoes: 'B',
    deco(p) {
      p.stamp(0, 0, ['8.', '8.', '5. 3B', '3. B c B c B', '2. B c B c 2B', '2. 6K'], { mirror: true });
      for (let y = 13; y <= 17; y++) for (let x = 5; x <= 10; x++) if (x % 2 === 1 && p.get(x, y) === 'b') p.set(x, y, 'B');
      for (let y = 18; y <= 20; y++) for (let x = 4; x <= 11; x++) if ((x - y + 30) % 3 === 0 && p.get(x, y) === 'c') p.set(x, y, 'B');
    }
  });
  // Bli Made, Bali: udeng, white shirt, gold saput over kamen
  S.bliMade = person({
    skin: 'medium', top: 'w', topShade: 'x', bottom: 'Y', bottomShade: 'j', shoes: 't',
    deco(p) {
      p.stamp(0, 0, ['8.', '7. w', '6. 2w', '3. 5w', '2. x 5w', '2. 2x 4w'], { mirror: true });
      p.hline(5, 10, 3, 'x');
      for (let x = 4; x <= 11; x++) if (p.get(x, 20) === 'Y') p.set(x, 20, 'x');
      p.hline(4, 11, 17, 'j');
    }
  });
  // Daeng Ical, Makassar: songkok recca, jas tutu, lipa' sabbe
  S.daengIcal = person({
    skin: 'light', top: 'K', topShade: 'k', bottom: 'g', bottomShade: 'G', shoes: 'k',
    deco(p) {
      p.stamp(0, 0, ['8.', '8.', '4. 4q', '3. q Q q Q q', '3. Q q Q q Q', '3. 5Y'], { mirror: true });
      p.set(7, 14, 'Y'); p.set(8, 14, 'Y'); p.set(7, 16, 'Y'); p.set(8, 16, 'Y');
      for (let y = 18; y <= 20; y++) for (let x = 4; x <= 11; x++) if (((x >> 1) + y) % 2 === 0 && p.get(x, y) === 'g') p.set(x, y, 'G');
      p.hline(4, 11, 19, 'r');
    }
  });
  // Mama Yosina, Jayapura (Papua): curly hair, bright dress, noken bag
  S.mamaYosina = person({
    skin: 'deep', top: 'e', topShade: 'E', bottom: 'e', bottomShade: 'E', shoes: 'B',
    deco(p) {
      p.stamp(0, 0, ['8.', '8.', '4. H K 2H', '2. H K 4H', '. H K 5H', '. 2H K 4.', '. H K 6.', '. 2H 5.', '2. H 5.'], { mirror: true });
      [[5, 14], [9, 15], [6, 17], [10, 18], [5, 19], [8, 20]].forEach(([x, y]) => { if (p.get(x, y) === 'e') p.set(x, y, 'Y'); });
      [[10, 14], [6, 16], [9, 19]].forEach(([x, y]) => { if (p.get(x, y) === 'e') p.set(x, y, 'w'); });
      p.line(11, 13, 3, 15, 'r');
      p.stamp(0, 15, ['4r', '4Y', '4G', '4r']);
    }
  });

  // Ayuk Ina, Palembang: sanggul with gold pin, purple baju kurung, red-gold songket
  S.ayukIna = person({
    skin: 'medium', top: 'v', topShade: 'K', bottom: 'R', bottomShade: 'B', shoes: 'B',
    deco(p) {
      p.stamp(0, 0, ['8.', '6. 2H', '5. 3H'], { mirror: true });
      p.set(10, 1, 'Y'); p.set(11, 0, 'Y');
      p.set(7, 13, 'Y'); p.set(8, 13, 'Y');
      for (let y = 18; y <= 20; y++) for (let x = 4; x <= 11; x++) if (y % 2 === 0 && x % 2 === 0 && p.get(x, y) === 'R') p.set(x, y, 'Y');
    }
  });
  // Mpok Siti, Jakarta (Betawi): kerudung, kebaya encim, batik
  S.mpokSiti = person({
    skin: 'light', hair: 'g', top: 'w', topShade: 'x', bottom: 'r', bottomShade: 'R', shoes: 'B',
    deco(p) {
      p.stamp(0, 7, ['. 2g 5.', '. 2g 5.', '. 2g 5.', '. 2g 5.', '. 3g 4.', '2. 2g 4.'], { mirror: true });
      p.hline(4, 11, 13, 'g'); p.hline(5, 10, 14, 'G');
      [[5, 15], [10, 16], [6, 17], [9, 15]].forEach(([x, y]) => { if (p.get(x, y) === 'w') p.set(x, y, 'p'); });
      for (let y = 18; y <= 20; y++) for (let x = 4; x <= 11; x++) if ((x + y) % 3 === 0 && p.get(x, y) === 'r') p.set(x, y, 'Y');
    }
  });
  // Acil Aisyah, Banjarmasin: wide tanggui hat of the floating market, sasirangan top
  S.acilAisyah = person({
    skin: 'medium', top: 'e', topShade: 'E', bottom: 'v', bottomShade: 'K', shoes: 'B',
    deco(p) {
      p.stamp(0, 0, ['7. q', '5. 3q', '3. 5q', '. 7q', '8Q'], { mirror: true });
      p.map((c, x, y) => (c === 'q' && y >= 2 && (x + y) % 3 === 0 ? 'Q' : c));
      for (let y = 13; y <= 17; y++) for (let x = 4; x <= 11; x++) if ((x + (y % 2)) % 3 === 0 && p.get(x, y) === 'e') p.set(x, y, 'v');
      p.hline(4, 11, 19, 'e');
    }
  });

  /* ---------------- Vehicles ---------------- */
  function capung(frame) {
    const p = new Px(40, 25);
    for (let y = 2; y <= 9; y++) p.hline(3, 4 + Math.round((y - 2) * 0.7), y, 'r');
    p.vline(3, 2, 9, 'R');
    const top = x => (x < 14 ? 7 + (14 - x) * 0.3 : x > 29 ? 7 + (x - 29) * 0.8 : 7);
    const bot = x => (x < 14 ? 16 - (14 - x) * 0.5 : x > 29 ? 16 - (x - 29) * 0.8 : 16);
    p.span(4, 33, top, bot, (x, y, t, b) => (y >= b - 1 ? 'j' : y === 12 ? 'r' : 'Y'));
    p.rect(2, 10, 7, 2, 'Y'); p.hline(2, 8, 11, 'j');
    p.rect(11, 5, 11, 2, 'Y'); p.hline(11, 21, 6, 'j');
    p.rect(21, 8, 6, 3, 'a'); p.set(26, 8, 'i');
    p.rect(22, 8, 3, 3, 'o'); p.set(22, 7, 'o'); p.set(24, 7, 'o'); p.set(24, 9, 'k'); p.set(23, 8, 'a'); p.set(21, 10, 'r');
    p.rect(34, 10, 1, 4, 'x');
    if (frame === 0) { p.vline(36, 4, 20, 'X'); p.set(36, 4, 'z'); p.set(36, 20, 'z'); }
    else { p.vline(36, 9, 15, 'X'); p.set(36, 6, 'x'); p.set(36, 18, 'x'); }
    p.set(35, 11, 'z'); p.set(35, 12, 'z');
    p.vline(13, 17, 20, 'z'); p.vline(25, 17, 20, 'z');
    p.hline(9, 29, 21, 'w'); p.hline(9, 28, 22, 'x'); p.set(30, 20, 'w'); p.set(29, 20, 'w');
    return p.outline('k');
  }
  S.capung = [capung(0), capung(1)];

  function pinisi() {
    const p = new Px(50, 36);
    // sails first (hull and masts draw over their feet)
    const sail = (x0, x1, top0, top1) => p.span(x0, x1, x => top0 + (top1 - top0) * (x - x0) / (x1 - x0), () => 23,
      (x, y, t, b) => (y === b ? 'x' : (x - x0) % 3 === 2 ? 'x' : 'm'));
    sail(9, 16, 4, 7);
    sail(20, 27, 3, 6);
    tri(p, [29, 4], [29, 22], [40, 22], (x, y) => (x === 29 ? 'x' : 'w'));
    tri(p, [30, 7], [42, 21], [36, 21], 'm');
    const deck = x => 25 - (x > 36 ? (x - 36) * 0.9 : 0) - (x < 8 ? (8 - x) * 0.6 : 0);
    const keel = x => 31 - (x > 30 ? (x - 30) * 0.55 : 0) - (x < 10 ? (10 - x) * 0.9 : 0);
    p.span(3, 43, deck, keel, (x, y, t, b) => (y === t ? 'c' : y === t + 1 ? 'w' : y >= b ? 'B' : y === t + 3 ? 'R' : 'b'));
    p.vline(17, 3, 24, 'B'); p.vline(28, 1, 24, 'B');
    p.line(40, 21, 47, 18, 'B');
    p.rect(29, 1, 4, 1, 'r'); p.rect(29, 2, 4, 1, 'w');
    return p.outline('k');
  }
  S.pinisi = pinisi();

  /* ---------------- Food (16x16) ---------------- */
  const plate = (p, cx = 8, cy = 11.5, rx = 7.2, ry = 3.3) => {
    p.ellipse(cx, cy, rx, ry, 'w');
    p.ellipse(cx, cy, rx, ry, 'x', (x, y) => y >= cy + ry - 1.5);
  };
  const food = {};
  food.rendang = (() => {
    const p = new Px(18, 18); plate(p, 9, 12);
    p.ellipse(9, 11, 6, 2.5, 'g'); p.hline(5, 12, 11, 'G');
    const chunk = ['.bb.', 'bBBb', 'BBRB', '.BB.'];
    [[3, 7], [8, 5], [11, 8], [6, 9]].forEach(([x, y]) => p.stamp(x, y, chunk));
    p.set(7, 6, 'r'); p.set(12, 10, 'r');
    return p.outline();
  })();
  food.pempek = (() => {
    const p = new Px(18, 18); plate(p, 9, 12);
    p.ellipse(6, 10, 4, 2.6, 'c'); p.ellipse(6, 9.3, 3, 1.4, 'n');
    p.ellipse(8.5, 12, 3.2, 1.8, 'c'); p.set(8, 11, 'n'); p.set(9, 11, 'n');
    p.ellipse(13, 8, 3.2, 2.4, 'x'); p.ellipse(13, 7.5, 2.4, 1.3, 'B'); p.set(12, 7, 'r'); p.set(14, 8, 'l');
    return p.outline();
  })();
  food.kerakTelor = (() => {
    const p = new Px(18, 18); plate(p, 9, 12);
    p.ellipse(9, 10, 6.3, 3.6, 'j');
    p.ellipse(9, 9.6, 5, 2.7, 'c');
    const r = NX.rng(7);
    for (let i = 0; i < 14; i++) { const x = 5 + Math.floor(r() * 9), y = 8 + Math.floor(r() * 4); if (p.get(x, y) === 'c') p.set(x, y, r() < 0.5 ? 'b' : r() < 0.5 ? 'R' : 'n'); }
    return p.outline();
  })();
  food.gudeg = (() => {
    const p = new Px(18, 18); plate(p, 9, 12);
    p.ellipse(9, 11, 6.5, 2.8, 'g'); p.hline(4, 13, 11, 'G');
    p.ellipse(5.5, 9, 3, 2.4, 'm'); p.set(5, 8, 'w');
    p.ellipse(11, 10, 3.6, 2.2, 'R'); p.set(10, 9, 'r'); p.set(12, 10, 'b');
    p.ellipse(9, 7, 2, 1.6, 'c'); p.set(9, 7, 'Y'); p.set(8, 6, 'n');
    return p.outline();
  })();
  food.ayamBetutu = (() => {
    const p = new Px(18, 18);
    p.ellipse(9, 12, 7.5, 3.2, 'g'); p.ellipse(9, 12, 7.5, 3.2, 'G', (x, y) => y >= 14);
    p.line(3, 12, 7, 8, 'w'); p.line(4, 12, 7, 9, 'x'); p.rect(1, 12, 2, 2, 'w'); p.set(2, 11, 'w'); p.set(3, 14, 'x');
    p.ellipse(10, 8.5, 5, 3.6, 'O');
    p.ellipse(9.5, 7.6, 3.4, 2, 'j'); p.set(8, 7, 'Y');
    [[7, 9], [11, 7], [13, 9], [10, 10]].forEach(([x, y]) => p.set(x, y, 'R'));
    return p.outline();
  })();
  food.sotoBanjar = (() => {
    const p = new Px(18, 18);
    p.ellipse(9, 10, 7.5, 5.5, 'w', (x, y) => y >= 10);
    p.hline(3, 14, 13, 'A'); p.ellipse(9, 10, 7.5, 5.5, 'x', (x, y) => y >= 15);
    p.ellipse(9, 10, 7.5, 2, 'x'); p.ellipse(9, 10, 6.5, 1.5, 'y');
    p.ellipse(6.5, 9.6, 1.7, 1, 'w'); p.set(6, 9, 'Y'); p.set(7, 9, 'Y');
    [[10, 9], [12, 10], [11, 11], [4, 10]].forEach(([x, y]) => p.set(x, y, 'g'));
    p.set(9, 10, 'n'); p.set(13, 9, 'n');
    p.outline();
    [[6, 2], [7, 3], [6, 4], [11, 3], [12, 4], [11, 5]].forEach(([x, y]) => p.set(x, y, 'x'));
    return p;
  })();
  food.cotoMakassar = (() => {
    const p = new Px(18, 18);
    p.ellipse(7, 10, 5.8, 4.8, 'R', (x, y) => y >= 10); p.hline(2, 12, 12, 'Y');
    p.ellipse(7, 10, 5.8, 1.8, 'R'); p.ellipse(7, 10, 4.8, 1.2, 'b');
    p.set(5, 10, 'B'); p.set(8, 10, 'B'); p.set(6, 9, 'g'); p.set(9, 10, 'g'); p.set(4, 10, 'n');
    for (let y = 5; y <= 13; y++) for (let x = 10; x <= 16; x++) if (Math.abs(x - 13) + Math.abs(y - 9) <= 3.5) p.set(x, y, (x + y) % 2 ? 'l' : 'g');
    p.set(14, 5, 'l'); p.set(15, 4, 'l'); p.set(15, 3, 'g');
    return p.outline();
  })();
  food.papeda = (() => {
    const p = new Px(18, 18);
    p.ellipse(9, 11, 7.5, 5, 'c', (x, y) => y >= 11); p.ellipse(9, 11, 7.5, 5, 'b', (x, y) => y >= 15);
    p.ellipse(9, 11, 7.5, 2, 'c'); p.ellipse(9, 11, 6.5, 1.5, 'Y'); p.hline(4, 14, 12, 'j');
    p.line(10, 8, 13, 1, 'c'); p.line(11, 8, 15, 2, 'c');
    p.ellipse(9, 9, 3.6, 2.6, 'x'); p.ellipse(8.4, 8.4, 2, 1.2, 'w');
    p.set(13, 11, 'X'); p.set(14, 11, 'w'); p.set(4, 11, 'g');
    return p.outline();
  })();
  S.food = food;

  /* ---------------- Rumah adat ---------------- */
  const houses = {};
  houses.rumahGadang = (() => {
    const p = new Px(50, 36);
    for (let x = 8; x <= 42; x += 6) p.vline(x, 28, 32, 'B');
    for (let y = 28; y <= 32; y++) p.hline(23 - Math.floor((y - 28) / 2), 27 + Math.floor((y - 28) / 2), y, y % 2 ? 'c' : 'b');
    p.rect(6, 19, 39, 9, 'R'); p.hline(6, 44, 19, 'B');
    for (let x = 6; x <= 44; x++) { if (x % 2 === 0) p.set(x, 21, 'Y'); p.set(x, 26, x % 4 < 2 ? 'Y' : 'j'); }
    [9, 15, 32, 38].forEach(x => { p.rect(x, 22, 3, 3, 'B'); p.set(x + 1, 22, 'k'); });
    p.rect(23, 21, 5, 6, 'B'); p.rect(24, 22, 3, 5, 'b');
    const peaks = [[3, 1], [15, 5], [35, 5], [47, 1]];
    const top = x => {
      if (x <= peaks[0][0]) return peaks[0][1] + (peaks[0][0] - x) * 3;
      const L = peaks[peaks.length - 1]; if (x >= L[0]) return L[1] + (x - L[0]) * 3;
      for (let i = 0; i < peaks.length - 1; i++) {
        const a = peaks[i], b = peaks[i + 1];
        if (x >= a[0] && x <= b[0]) { const t = (x - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * t + Math.min(9, (b[0] - a[0]) * 0.65) * Math.pow(Math.sin(Math.PI * t), 0.55); }
      }
    };
    p.span(2, 48, top, () => 18, (x, y, t) => (y === t ? 'z' : (y - t) % 3 === 2 ? 'z' : 'K'));
    peaks.forEach(([x, y]) => p.set(x, y - 1, 'Y'));
    return p.outline();
  })();
  houses.joglo = (() => {
    const p = new Px(44, 32);
    p.rect(3, 27, 38, 2, 'x'); p.hline(3, 40, 28, 'X');
    p.rect(6, 18, 32, 9, 'B');
    [5, 12, 18, 24, 30, 37].forEach(x => { p.rect(x, 18, 2, 9, 'c'); p.vline(x + 1, 18, 26, 'b'); });
    // Joglo: steep, tall centre (brunjung) over flatter, wider lower roofs
    const tier = (y0, y1, a0, a1, b0, b1) => {
      for (let y = y0; y <= y1; y++) { const t = (y - y0) / (y1 - y0 || 1); const x0 = Math.round(a0 + (b0 - a0) * t), x1 = Math.round(a1 + (b1 - a1) * t); p.hline(x0, x1, y, y === y1 ? 'R' : (y1 - y) % 2 === 1 ? 'R' : 'r'); }
    };
    tier(15, 17, 5, 38, 1, 42);
    tier(11, 14, 10, 33, 7, 36);
    tier(1, 10, 19, 24, 14, 29);
    p.hline(19, 24, 1, 'R'); p.set(18, 0, 'Y'); p.set(25, 0, 'Y');
    return p.outline();
  })();
  houses.rumahBetang = (() => {
    const p = new Px(52, 32);
    for (let x = 5; x <= 46; x += 4) p.vline(x, 20, 29, 'B');
    p.hline(3, 48, 19, 'B');
    p.rect(4, 13, 44, 6, 'b');
    for (let x = 6; x <= 46; x += 3) p.vline(x, 13, 17, 'B');
    for (let x = 4; x <= 47; x++) p.set(x, 18, x % 2 ? 'Y' : 'k');
    [8, 15, 34, 41].forEach(x => p.rect(x, 14, 3, 2, 'k'));
    p.rect(24, 13, 4, 5, 'B'); p.rect(25, 14, 2, 4, 'k');
    for (let y = 6; y <= 12; y++) { const t = (y - 6) / 6; p.hline(Math.round(6 - 5 * t), Math.round(45 + 5 * t), y, y === 12 ? 'b' : y % 2 ? 'c' : 'N'); }
    p.hline(6, 45, 5, 'b'); p.set(5, 4, 'Y'); p.set(46, 4, 'Y'); p.set(4, 3, 'Y'); p.set(47, 3, 'Y');
    p.line(25, 20, 28, 29, 'c'); p.line(26, 20, 29, 29, 'c');
    for (let y = 21; y <= 29; y += 2) p.set(25 + Math.round((y - 20) / 3), y, 'B');
    return p.outline();
  })();
  houses.tongkonan = (() => {
    const p = new Px(46, 38);
    [14, 19, 26, 31].forEach(x => p.vline(x, 27, 34, 'B'));
    p.hline(12, 33, 27, 'B');
    for (let y = 18; y <= 26; y++) for (let x = 12; x <= 33; x++) {
      const yy = y - 18, xx = x - 12;
      p.set(x, y, yy % 3 === 0 ? 'k' : yy % 3 === 1 ? (xx % 4 === 1 ? 'Y' : 'R') : (xx % 4 === 3 ? 'Y' : 'R'));
    }
    const top = x => 2 + 12 * (1 - Math.pow((x - 22.5) / 21.5, 2));
    const thick = x => 3 + 3 * (1 - Math.abs(x - 22.5) / 21.5);
    p.span(1, 44, top, x => top(x) + thick(x), (x, y, t) => (y === t ? 'X' : (y - t) % 2 === 1 ? 'z' : 'K'));
    p.rect(22, 16, 2, 19, 'b');
    for (let i = 0; i < 4; i++) { const y = 20 + i * 3, w = 5 - Math.floor(i / 2); p.hline(23 - w, 22 + w, y, 'w'); p.set(22 - w, y - 1, 'w'); p.set(23 + w, y - 1, 'w'); p.hline(22, 23, y, 'x'); }
    return p.outline();
  })();
  houses.honai = (() => {
    const p = new Px(30, 28);
    p.rect(6, 15, 18, 9, 'b');
    for (let x = 7; x < 24; x += 3) p.vline(x, 16, 23, 'B');
    p.rect(13, 18, 4, 6, 'k'); p.hline(12, 17, 17, 'B');
    p.ellipse(15, 16.5, 12, 13.5, 'q', (x, y) => y <= 16);
    p.map((c, x, y) => (c === 'q' && (x * 2 + y * 3) % 7 === 0 ? 'Q' : c));
    for (let x = 3; x <= 26; x++) if (x % 2) p.set(x, 17, 'Q');
    p.vline(15, 1, 3, 'Q'); p.set(14, 2, 'Q'); p.set(16, 2, 'Q');
    return p.outline();
  })();
  S.houses = houses;

  /* ---------------- Icons ---------------- */
  const icons = {};
  icons.koin = (() => {
    const p = new Px(14, 14);
    p.ellipse(7, 7, 5.6, 5.6, 'Y'); p.ellipse(7, 7, 4.2, 4.2, 'j'); p.ellipse(7, 7, 3.2, 3.2, 'Y');
    p.set(5, 4, 'm'); p.set(4, 5, 'm'); p.vline(7, 5, 8, 'j');
    return p.outline();
  })();
  icons.bintang = Px.from([
    '.............', '......Y......', '.....YYY.....', '.....YYY.....', '.YYYYYYYYYYY.', '..YYYYYYYYY..',
    '...YYYYYYj...', '....YYYYj....', '...YYYYYjj...', '...YYj.Yjj...', '..YYj...jjj..', '..Yj.....jj..', '.............'
  ]).outline();
  icons.paket = (() => {
    const p = new Px(14, 14);
    p.rect(2, 3, 10, 9, 'c'); p.rect(2, 3, 10, 2, 'n'); p.hline(2, 11, 11, 'b');
    p.vline(6, 3, 11, 'Y'); p.vline(7, 3, 11, 'Y'); p.rect(8, 7, 3, 2, 'w'); p.set(9, 7, 'r');
    return p.outline();
  })();
  icons.pin = (() => {
    const p = new Px(13, 15);
    p.ellipse(6.5, 6, 4.5, 4.5, 'r'); p.ellipse(6.5, 6, 4.5, 4.5, 'R', (x, y) => x >= 8 && y >= 5);
    for (let y = 9; y <= 12; y++) { const w = Math.max(0, 3 - (y - 9)); p.hline(6 - Math.floor(w / 2 + 0.5) + 1, 6 + Math.floor(w / 2), y, 'r'); }
    p.ellipse(6.5, 5.5, 1.8, 1.8, 'w');
    return p.outline();
  })();
  icons.ikan = (() => {
    const p = new Px(15, 11);
    p.ellipse(8, 5.5, 5, 3, 'a'); p.ellipse(8, 6.5, 4, 1.6, 'i', (x, y) => y >= 7);
    tri(p, [1, 2], [1, 8], [4, 5], 'a'); p.set(10, 4, 'k'); p.vline(6, 4, 7, 'A');
    return p.outline();
  })();
  icons.buku = (() => {
    const p = new Px(15, 13);
    p.rect(1, 2, 6, 9, 'r'); p.rect(8, 2, 6, 9, 'r'); p.rect(2, 3, 5, 7, 'w'); p.rect(8, 3, 5, 7, 'w');
    p.vline(7, 2, 11, 'R'); [4, 6, 8].forEach(y => { p.hline(3, 5, y, 'x'); p.hline(9, 11, y, 'x'); });
    return p.outline();
  })();
  icons.rumah = (() => {
    const p = new Px(15, 14);
    for (let y = 1; y <= 6; y++) p.hline(7 - y, 7 + y, y, 'r');
    p.hline(1, 13, 6, 'R'); p.rect(3, 7, 9, 5, 'c'); p.rect(6, 8, 3, 4, 'B'); p.set(4, 8, 'a'); p.set(10, 8, 'a');
    return p.outline();
  })();
  icons.menu = (() => {
    const p = new Px(13, 12);
    [2, 5, 8].forEach(y => p.rect(2, y, 9, 2, 'w'));
    return p.outline();
  })();
  S.icons = icons;

  // Spinning coin for the flight game (4 frames, 9x9 + outline)
  S.coinSpin = [4.2, 3, 1.4, 3].map((rx, i) => {
    const p = new Px(11, 11);
    p.ellipse(5.5, 5.5, rx, 4.2, 'Y');
    if (rx > 2) p.ellipse(5.5, 5.5, Math.max(0.8, rx - 1.6), 2.6, 'j');
    if (rx > 3) { p.ellipse(5.5, 5.5, rx - 2.2, 2, 'Y'); p.set(4, 3, 'm'); }
    if (i === 2) p.vline(5, 2, 8, 'j');
    return p.outline();
  });
  // Rain cloud obstacle (rain is drawn live by the flight scene)
  S.rainCloud = (() => {
    const p = new Px(34, 18);
    p.ellipse(10, 10, 8, 6, 'X'); p.ellipse(18, 7.5, 9, 6.5, 'X'); p.ellipse(26, 10, 7, 5.5, 'X');
    p.rect(4, 10, 26, 5, 'X');
    p.map((c, x, y) => (c === 'X' && y >= 13 ? 'z' : c === 'X' && y <= 4 ? 'x' : c));
    p.set(12, 9, 'k'); p.set(13, 9, 'k'); p.set(21, 9, 'k'); p.set(22, 9, 'k'); p.hline(15, 19, 11, 'z');
    return p.outline();
  })();
  S.cloudWhite = (() => {
    const p = new Px(30, 13);
    p.ellipse(9, 8, 7, 4.5, 'w'); p.ellipse(16, 6, 8, 5.5, 'w'); p.ellipse(23, 8, 6, 4, 'w'); p.rect(4, 8, 22, 4, 'w');
    return p.map((c, x, y) => (c === 'w' && y >= 11 ? 'x' : c));
  })();
  S.splash = Px.from(['..a...a..', '.aia.aia.', 'aiiiiiiia', '.aaiiiaa.']);

  /* ---------------- Map bits ---------------- */
  S.miniPlane = (() => {
    const p = new Px(15, 10);
    p.hline(3, 11, 5, 'Y'); p.hline(4, 11, 6, 'j'); p.hline(6, 10, 4, 'Y');
    p.set(2, 3, 'r'); p.set(2, 4, 'r'); p.set(3, 4, 'r'); p.set(12, 5, 'x'); p.set(12, 6, 'x'); p.set(9, 5, 'a');
    p.vline(13, 3, 8, 'X');
    return p.outline();
  })();
  S.mapPin = Px.from(['.......', '..rrr..', '.rrrrr.', '.rrwrr.', '.rrrRr.', '..rRr..', '...r...', '.......']).outline();
})(NX);
