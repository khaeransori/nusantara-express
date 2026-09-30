// Build the offline game:
//   dist/index.html  full page for GitHub Pages (registers sw.js, links manifest)
//   dist/play.html   same game without the document shell (for the Claude artifact)
//   dist/sw.js, dist/manifest.webmanifest   offline + installable
import fs from 'node:fs';
const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), 'utf8');
const b64 = p => fs.readFileSync(new URL(p, import.meta.url)).toString('base64');
const font = (w) => `@font-face{font-family:"Pixelify Sans";font-style:normal;font-weight:${w};font-display:block;src:url(data:font/woff2;base64,${b64(`node_modules/@fontsource/pixelify-sans/files/pixelify-sans-latin-${w}-normal.woff2`)}) format("woff2");}`;
const fonts = [400, 500, 600, 700].map(font).join('\n');
const VERSION = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
const scripts = ['src/assets/px.js', 'src/assets/sprites.js', 'src/assets/map-world.js', 'src/i18n.js', 'src/content-game.js', 'src/game.js']
  .map(p => `<script>\n${read(p)}\n</script>`).join('\n');
const body = read('game/template.html').replace('/*__FONTS__*/', fonts).replace('<!--__SCRIPTS__-->', scripts);
fs.mkdirSync(new URL('dist/', root), { recursive: true });
fs.writeFileSync(new URL('dist/play.html', root), body);

const sw = `if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));`;
const page = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#173a6e">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
</head>
<body>
${body}
<script>${sw}</script>
</body>
</html>
`;
fs.writeFileSync(new URL('dist/index.html', root), page);
fs.writeFileSync(new URL('dist/manifest.webmanifest', root), JSON.stringify({
  name: 'Nusantara Express', short_name: 'Nusantara', start_url: './', scope: './', display: 'fullscreen', orientation: 'landscape',
  background_color: '#173a6e', theme_color: '#173a6e', lang: 'id',
  icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }]
}, null, 2));
fs.writeFileSync(new URL('dist/sw.js', root), `// Offline cache for Nusantara Express (${VERSION})
const CACHE = 'nx-${VERSION}';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
  }).catch(() => caches.match('./index.html'))));
});
`);
console.log('play.html', (body.length / 1024).toFixed(1), 'KB · index.html', (page.length / 1024).toFixed(1), 'KB · cache', VERSION);
