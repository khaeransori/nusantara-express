// Screen shapes: every city visible, HUD inside the screen, and a city tap flies to the right place.
// Covers a landscape phone, a portrait phone (game turns itself sideways), a short Claude-viewer-like
// frame where fullscreen is refused, and a desktop window.
import path from 'node:path';
import { serve, launch, phone, drain, tapCity, check, done, SHOTS } from './lib.mjs';

const noFs = "Object.defineProperty(document, 'fullscreenEnabled', { get: () => false }); Element.prototype.requestFullscreen = function () { return Promise.reject(new TypeError('blocked')); };";
const frame = (h) => `<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><body style="margin:0;background:#333"><div style="height:60px;background:#eee"></div><iframe src="/" style="display:block;width:100%;height:${h}px;border:0"></iframe></body>`;
const srv = await serve({ '/__short': frame(250), '/__tall': frame(700) });
const browser = await launch();

const cases = [
  { name: 'landscape-phone', ctx: phone(844, 390), url: '/' },
  { name: 'portrait-phone', ctx: phone(390, 844), url: '/' },
  { name: 'short-viewer', ctx: phone(844, 390), url: '/__short', framed: true },
  { name: 'portrait-viewer', ctx: phone(390, 844), url: '/__tall', framed: true },
  { name: 'desktop', ctx: { viewport: { width: 1280, height: 760 } }, url: '/' }
];

const errors = [];
for (const c of cases) {
  const context = await browser.newContext(c.ctx);
  if (c.framed) await context.addInitScript(noFs);
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(`${c.name}: ${e}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`${c.name}: ${m.text()}`); });
  await page.goto(srv.url + c.url);
  await page.waitForTimeout(700);
  const f = c.framed ? page.frames()[1] : page.mainFrame();
  await f.locator('#title .play').click();
  await page.waitForTimeout(1300);
  await drain(page, f);
  const r = await f.evaluate(() => {
    const s = NX.game.scene, cv = document.querySelector('#world'); let cities = 0;
    for (const id of Object.keys(NX.CITIES)) { const [x, y] = s.pos(id); if (x >= 0 && x <= cv.width && y - 8 >= s.top && y + 6 <= cv.height - s.bot) cities++; }
    const out = [];
    for (const sel of ['#hud [data-act="book"]', '#hud [data-act="base"]', '#hud [data-act="menu"]', '#hud .stats', '#task']) {
      const b = document.querySelector(sel).getBoundingClientRect();
      if (!(b.left >= -1 && b.top >= -1 && b.right <= innerWidth + 1 && b.bottom <= innerHeight + 1)) out.push(sel);
    }
    const px = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let land = 0;
    for (let i = 0; i < px.length; i += 4) if (px[i + 1] > 150 && px[i] < 140 && px[i + 2] < 120) land++;
    return { cities, out, land, mapWidth: Math.round(168 * cv.offsetWidth / cv.width), turned: document.querySelector('#stage').style.transform !== 'none' };
  });
  await page.screenshot({ path: path.join(SHOTS, `layout-${c.name}.png`) });
  check(r.cities === 8, `${c.name}: all 8 cities on screen (map ${r.mapWidth}px wide${r.turned ? ', turned sideways' : ''})`);
  check(r.land > 500, `${c.name}: map is drawn (${r.land} green land pixels)`);
  check(r.out.length === 0, `${c.name}: HUD and task bar inside the screen${r.out.length ? ' (outside: ' + r.out.join(', ') + ')' : ''}`);
  await tapCity(page, c.framed ? f : null, 'yogyakarta');
  await page.waitForTimeout(900);
  const to = await f.evaluate(() => NX.game.scene.name === 'flight' && NX.game.scene.to);
  check(to === 'yogyakarta', `${c.name}: tapping Yogyakarta flies there`);
  await context.close();
}
check(errors.length === 0, `no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
await browser.close(); srv.close();
done();
