import sys, asyncio
from playwright.async_api import async_playwright
# usage: shot.py file.html out_prefix
async def main():
    src, out = sys.argv[1], sys.argv[2]
    async with async_playwright() as p:
        b = await p.chromium.launch()
        logs = []
        for name, w, scheme in [('desk', 1200, 'light'), ('phone', 390, 'dark')]:
            ctx = await b.new_context(viewport={'width': w, 'height': 900}, device_scale_factor=1 if w > 800 else 2, color_scheme=scheme)
            pg = await ctx.new_page()
            pg.on('console', lambda m: logs.append(f'{m.type}: {m.text}'))
            pg.on('pageerror', lambda e: logs.append(f'pageerror: {e}'))
            # wrap like the artifact skeleton does
            html = open(src).read()
            await pg.set_content('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>body{margin:0}</style></head><body>' + html + '</body></html>')
            await pg.wait_for_timeout(900)
            await pg.screenshot(path=f'{out}_{name}.png', full_page=True)
            sw = await pg.evaluate('document.documentElement.scrollWidth')
            print(name, 'scrollWidth', sw, 'viewport', w)
            if name == 'desk':
                await pg.click('#lang-en'); await pg.wait_for_timeout(300)
                await pg.screenshot(path=f'{out}_desk_en.png', full_page=False, clip={'x': 0, 'y': 0, 'width': w, 'height': 900})
            await ctx.close()
        await b.close()
        print('\n'.join(logs) or 'no console output')
asyncio.run(main())
