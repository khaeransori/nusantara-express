// Plays all of chapter 1 on a landscape phone: intro, a wrong guess, 8 pickups + flights + deliveries,
// Buku Oyen, Markas Oyen, free-play order, and switching to English. Screenshots land in test/shots.
import path from 'node:path';
import { serve, launch, phone, drain, state, tapCity, check, done, SHOTS } from './lib.mjs';

const srv = await serve();
const browser = await launch();
const page = await (await browser.newContext(phone(844, 390))).newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const shot = name => page.screenshot({ path: path.join(SHOTS, `play-${name}.png`) });

await page.goto(srv.url + '/');
await page.waitForTimeout(500);
await shot('01-title');
await page.locator('#title .play').click();
await page.waitForTimeout(1200);
let s = await drain(page, null, { stopOn: 'order' });
check(s.modal, 'first order card shows after the intro');
await shot('02-order');
s = await drain(page);
check(s.scene === 'map' && s.step === 'pickup' && s.order.dish === 'gudeg', 'order 1 is gudeg, waiting for pickup');

// wrong city first: gentle hint, no penalty
await tapCity(page, null, 'padang');
await page.waitForTimeout(800);
await shot('03-wrong');
s = await drain(page);
const wrong = await page.evaluate(() => NX.game.state.wrong);
check(wrong === 1 && s.scene === 'map', 'a wrong city gives a hint and stays on the map');

for (let i = 0; i < 8; i++) {
  s = await state(page);
  const o = s.order, from = await page.evaluate(d => NX.DISHES[d].city, o.dish);
  if (s.loc === from) await page.evaluate(c => { NX.game.onCity(c); }, from); else await tapCity(page, null, from);
  await page.waitForTimeout(700);
  if (i === 0) {
    s = await state(page);
    check(s.scene === 'flight', 'tapping the right city starts the flight');
    await shot('04-flight-ready');
    await page.locator('#world').click();
    await page.waitForTimeout(2500);
    await shot('05-flight');
  }
  s = await drain(page);
  check(s.step === 'deliver' && s.loc === from, `${o.dish}: picked up in ${from}`);
  await tapCity(page, null, o.to);
  await page.waitForTimeout(700);
  s = await drain(page, null, { stopOn: 'unlock' });
  if (s.modal) {
    if (i === 0) { await shot('06-unlock'); await page.locator('#modal .gbtn.primary').click(); await page.waitForTimeout(900); await shot('07-base'); await page.locator('#basebar [data-act="back"]').click(); await page.waitForTimeout(700); }
    else await page.locator('#modal .gbtn').last().click();
  }
  s = await drain(page, null, { stopOn: 'order' });
  check(s.ch === i + 1, `${o.dish}: delivered to ${o.to} (chapter ${s.ch}/8)`);
  await drain(page);
}
s = await state(page);
check(s.found === 8 && s.houses.length === 5, 'chapter 1 unlocks all 8 dish cards and 5 houses');
check(!!s.order && s.step === 'pickup', 'free play hands out a new order');

await page.locator('#hud [data-act="book"]').click(); await page.waitForTimeout(300);
await shot('08-book');
check(await page.locator('#book .bk[data-id]').count() === 8, 'Buku Oyen shows 8 dish tiles');
await page.locator('#book [data-act="close"]').click();
await page.locator('#hud [data-act="base"]').click(); await page.waitForTimeout(700);
await shot('09-base-full');
await page.locator('#basebar [data-act="back"]').click(); await page.waitForTimeout(700);
await drain(page);
await page.locator('#hud [data-act="menu"]').click(); await page.waitForTimeout(200);
await page.locator('#modal [data-setlang="en"]').click(); await page.waitForTimeout(200);
await page.locator('#modal [data-m="resume"]').click(); await page.waitForTimeout(300);
await shot('10-english');
check((await page.locator('#hud [data-act="book"] .l').textContent()) === 'Notebook', 'English switch updates the interface');
check(errors.length === 0, `no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`);

await browser.close(); srv.close();
done();
