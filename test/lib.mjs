// Shared test helpers: serve dist/ over HTTP, launch Chromium, drive dialogs.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const SHOTS = path.join(ROOT, 'test/shots');
fs.mkdirSync(SHOTS, { recursive: true });

if (!fs.existsSync(path.join(ROOT, 'dist/pwa/index.html'))) {
  console.error('dist/pwa/index.html not found: run `npm run build` first');
  process.exit(1);
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };
// Serves dist/pwa at / and extra in-memory pages (e.g. an iframe harness) at /__name.
export function serve(extra = {}) {
  return new Promise(ok => {
    const srv = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      if (url === '/favicon.ico') { res.writeHead(204); res.end(); return; }
      if (extra[url]) { res.writeHead(200, { 'content-type': TYPES['.html'] }); res.end(extra[url]); return; }
      const file = path.join(ROOT, 'dist/pwa', url.endsWith('/') ? url + 'index.html' : url);
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end('not found'); return; }
        res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' }); res.end(data);
      });
    });
    srv.listen(0, '127.0.0.1', () => ok({ url: `http://127.0.0.1:${srv.address().port}`, close: () => srv.close() }));
  });
}

// Uses Playwright's own Chromium; set CHROMIUM_PATH to use another build.
export async function launch() {
  if (process.env.CHROMIUM_PATH) return chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  try { return await chromium.launch(); } catch (e) {
    for (const p of ['/opt/pw-browsers/chromium', '/usr/bin/chromium', '/usr/bin/chromium-browser']) if (fs.existsSync(p)) return chromium.launch({ executablePath: p });
    throw e;
  }
}

export const phone = (w, h) => ({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });

// Click through dialogs and cards; fast-forward flights. Stops early on a card with class `stopOn`.
export async function drain(page, frame, { stopOn, steps = 80 } = {}) {
  const f = frame || page;
  let idle = 0;
  for (let i = 0; i < steps; i++) {
    const s = await state(f);
    if (s.modal) {
      if (stopOn && await f.locator(`#modal .${stopOn}`).count()) return s;
      const primary = f.locator('#modal .gbtn.primary').first();
      await (await primary.count() ? primary : f.locator('#modal .gbtn').first()).click(); idle = 0;
    } else if (s.talk) {
      await f.locator('#talk').click(); await page.waitForTimeout(40);
      if (await f.locator('#talk').isVisible()) await f.locator('#talk').click();
      idle = 0;
    } else if (s.scene === 'flight') {
      if (s.phase === 'ready') await f.locator('#world').click();
      else if (s.phase === 'fly') await f.evaluate(() => { const sc = NX.game.scene; if (sc.t < sc.dur - 0.3) sc.t = sc.dur - 0.3; });
      idle = 0;
    } else if (++idle > 3) return s;
    await page.waitForTimeout(220);
  }
  return state(f);
}

export function state(f) {
  return f.evaluate(() => {
    const g = NX.game.state, s = NX.game.scene;
    return { scene: s.name, phase: s.phase, step: g.step, order: g.order, loc: g.loc, ch: g.ch, coins: g.coins, stars: g.stars,
      found: g.found.length, houses: g.houses.slice(), talk: !document.querySelector('#talk').hidden, modal: !document.querySelector('#modal').hidden };
  });
}

// Tap a city pin through the canvas, working out screen coordinates even when the stage is rotated.
export async function tapCity(page, frame, city) {
  const f = frame || page;
  const [x, y] = await f.evaluate(id => {
    const s = NX.game.scene, [lx, ly] = s.pos(id), cv = document.querySelector('#world'), r = cv.getBoundingClientRect();
    const turned = document.querySelector('#stage').style.transform !== 'none';
    return turned ? [r.right - (ly - 3) / cv.height * r.width, r.top + lx / cv.width * r.height] : [r.left + lx / cv.width * r.width, r.top + (ly - 3) / cv.height * r.height];
  }, city);
  const box = frame ? await page.locator('iframe').boundingBox() : { x: 0, y: 0 };
  await page.mouse.click(box.x + x, box.y + y);
}

let failed = 0;
export function check(ok, msg) { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) failed++; }
export function done() { if (failed) { console.log(`\n${failed} check(s) failed`); process.exit(1); } console.log('\nall checks passed'); }
