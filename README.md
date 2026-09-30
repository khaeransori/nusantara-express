# Nusantara Express

A pixel-art web game for kids: Oyen the orange cat flies Si Capung around Indonesia,
finds where each local dish comes from, and delivers it to customers. Works offline,
Indonesian by default with English as an option.

## Play
Open `dist/index.html` (or the GitHub Pages URL). Landscape phone is the main target;
portrait phones render the game sideways so you just turn the phone.

## Layout
- `src/assets/` sprites as code (`px.js`, `sprites.js`), map rasters (`map-world.js`, `map-data.js`)
- `src/i18n.js` review-sheet strings + shared content (dishes, houses)
- `src/content-game.js` all in-game lines, clues and chapter 1, in ID and EN
- `src/game.js` the game (scenes: title, map, flight, base; overlays: dialog, cards, notebook, menu)
- `game/template.html` game layout and styles
- `review/` the asset review sheet
- `tools/` build + map rasterizer + playtest scripts

## Build
```
cd tools && npm install
node build-game.mjs          # dist/index.html, dist/play.html, sw.js, manifest
node preview.mjs /tmp/s.json && python3 icons.py /tmp/s.json ../dist   # app icons
node rasterize-world.mjs     # only if the map bounds change
```

## Deploy (GitHub Pages)
Publish the `dist/` folder. `sw.js` caches everything on first visit, so the game
keeps working offline afterwards and can be added to the home screen.

Map data: Natural Earth via world-atlas (public domain). Font: Pixelify Sans (OFL).
