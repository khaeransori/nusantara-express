# Automated playthrough of chapter 1 + screenshots of each screen.
# usage: python3 playtest.py ../dist/play.html OUTDIR [width height]
import sys, asyncio
from playwright.async_api import async_playwright

SRC, OUT = sys.argv[1], sys.argv[2]
W = int(sys.argv[3]) if len(sys.argv) > 3 else 844
H = int(sys.argv[4]) if len(sys.argv) > 4 else 390

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2, has_touch=True, is_mobile=True)
        pg = await ctx.new_page()
        logs = []
        pg.on('console', lambda m: logs.append(f'{m.type}: {m.text}') if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: logs.append(f'PAGEERROR: {e}'))
        html = open(SRC).read()
        await pg.set_content('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>body{margin:0}</style></head><body>' + html + '</body></html>', wait_until='domcontentloaded')
        await pg.wait_for_timeout(700)
        shots = {}
        async def shot(name):
            print('shot', name, flush=True)
            await pg.screenshot(path=f'{OUT}/{name}.png'); shots[name] = 1

        async def state():
            return await pg.evaluate('''() => { const g = NX.game.state, s = NX.game.scene;
              return { scene: s.name, phase: s.phase, step: g.step, order: g.order, loc: g.loc, ch: g.ch, coins: g.coins, stars: g.stars,
                talk: !document.querySelector('#talk').hidden, modal: !document.querySelector('#modal').hidden, found: g.found.length, houses: g.houses.slice() } }''')

        async def drain(stop_on_modal=None, max_steps=80):
            """Advance dialogs/cards/flights until nothing is pending."""
            idle = 0
            for _ in range(max_steps):
                s = await state()
                if 0: print('  drain', s['scene'], s['phase'], s['step'], 'talk' if s['talk'] else '', 'modal' if s['modal'] else '', flush=True)
                if s['modal']:
                    if stop_on_modal and await pg.locator(f'#modal .{stop_on_modal}').count():
                        return s
                    btn = pg.locator('#modal .gbtn.primary').first
                    if not await btn.count(): btn = pg.locator('#modal .gbtn').first
                    await btn.click(); idle = 0
                elif s['talk']:
                    await pg.locator('#talk').click(); await pg.wait_for_timeout(40)
                    if await pg.locator('#talk').is_visible(): await pg.locator('#talk').click()
                    idle = 0
                elif s['scene'] == 'flight':
                    if s['phase'] == 'ready':
                        await pg.mouse.click(W / 2, H / 2)
                    elif s['phase'] == 'fly':
                        await pg.evaluate('() => { const s = NX.game.scene; if (s.t < s.dur - 0.3) s.t = s.dur - 0.3; }')
                    idle = 0
                else:
                    idle += 1
                    if idle > 3: return s
                await pg.wait_for_timeout(250)
            return await state()

        print('loaded', flush=True)
        await shot('01_title')
        await pg.locator('#title .play').click()
        await pg.wait_for_timeout(500)
        await shot('02_intro_talk')
        s = await drain(stop_on_modal='order')
        await pg.wait_for_timeout(200)
        await shot('03_order_card')
        await drain()
        await shot('04_map_pickup')

        # a wrong guess first (order 1 is gudeg -> tap Jakarta)
        await pg.evaluate("() => { NX.game.onCity('padang'); }")
        await pg.wait_for_timeout(900)
        await shot('05_wrong_talk')
        await drain()
        await pg.wait_for_timeout(300)
        await shot('06_map_hint')

        chapter_log = []
        for i in range(8):
            s = await state()
            o = s['order']
            origin = await pg.evaluate(f"() => NX.DISHES['{o['dish']}'].city")
            await pg.evaluate(f"() => {{ NX.game.onCity('{origin}'); }}")
            await pg.wait_for_timeout(700)
            if i == 0:
                await shot('07_flight_ready')
                await pg.mouse.click(W / 2, H / 2)
                # steer a bit
                await pg.mouse.move(W / 2, H / 2); await pg.mouse.down(); await pg.mouse.move(W / 2, H / 2 - 60, steps=8)
                await pg.wait_for_timeout(4200)
                await shot('08_flight')
                await pg.mouse.up()
            await drain()
            s = await state()
            if i == 0: await shot('09_map_deliver')
            await pg.evaluate(f"() => {{ NX.game.onCity('{o['to']}'); }}")
            await pg.wait_for_timeout(600)
            # stop at fact card on first delivery for screenshots
            s = await drain(stop_on_modal='fact')
            if i == 0 and s['modal']:
                await shot('10_fact_card');
            s = await drain(stop_on_modal='unlock')
            if s['modal'] and await pg.locator('#modal .unlock').count():
                if i == 0: await shot('11_unlock_card')
                # choose "place" only the first time
                if i == 0:
                    await pg.locator('#modal .gbtn.primary').click()
                    await pg.wait_for_timeout(900)
                    await shot('12_base')
                    await pg.locator('#basebar [data-act="back"]').click()
                    await pg.wait_for_timeout(700)
                else:
                    await pg.locator('#modal .gbtn').last.click()
            s = await drain()
            chapter_log.append((o['dish'], o['to'], s['ch'], s['coins'], s['stars'], s['found'], len(s['houses'])))

        await shot('13_after_chapter_map')
        await pg.locator('#hud [data-act="book"]').click(); await pg.wait_for_timeout(300)
        await shot('14_book_food')
        await pg.locator('#book [data-tab="house"]').click(); await pg.wait_for_timeout(200)
        await shot('15_book_house')
        await pg.locator('#book [data-act="close"]').click()
        await pg.locator('#hud [data-act="base"]').click(); await pg.wait_for_timeout(700)
        await shot('16_base_full')
        await pg.locator('#basebar [data-act="back"]').click(); await pg.wait_for_timeout(700)
        await drain(stop_on_modal='order')
        await shot('17_free_order')
        await drain()
        await pg.locator('#hud [data-act="menu"]').click(); await pg.wait_for_timeout(200)
        await pg.locator('#modal [data-setlang="en"]').click(); await pg.wait_for_timeout(200)
        await shot('18_menu_en')
        await pg.locator('#modal [data-m="resume"]').click(); await pg.wait_for_timeout(300)
        await shot('19_map_en')
        s = await state()
        print('final', s)
        for row in chapter_log: print('delivered', row)
        print('\n'.join(logs) or 'no errors')
        await b.close()

asyncio.run(main())
