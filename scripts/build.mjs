// Build every release file from src/ + game/template.html:
//   dist/pwa/                              installable offline app for any HTTPS static host (GitHub Pages, Arcade)
//   dist/nusantara-express.html            one offline file, open it straight in a browser
//   dist/nusantara-express-pwa.zip         dist/pwa zipped
//   dist/nusantara-express-artifact.html   variant for a Claude Artifact (no doctype/head/body)
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { root, read, loadSprites, icon } from './lib.mjs';

const TITLE = 'Nusantara Express';
const DESC = 'Game edukasi piksel: bantu Oyen si kucing oren mengantar makanan khas ke seluruh Nusantara.';
const out = p => new URL(p, root);
const b64 = p => fs.readFileSync(out(p)).toString('base64');

const fonts = [400, 500, 600, 700].map(w => `@font-face{font-family:"Pixelify Sans";font-style:normal;font-weight:${w};font-display:block;src:url(data:font/woff2;base64,${b64(`node_modules/@fontsource/pixelify-sans/files/pixelify-sans-latin-${w}-normal.woff2`)}) format("woff2");}`).join('\n');
const scripts = ['src/assets/px.js', 'src/assets/sprites.js', 'src/assets/map-world.js', 'src/i18n.js', 'src/content-game.js', 'src/game.js']
  .map(p => `<script>\n${read(p)}\n</script>`).join('\n');
const body = read('game/template.html').replace('/*__FONTS__*/', fonts).replace('<!--__SCRIPTS__-->', scripts);

const NX = loadSprites();
const favicon = 'data:image/png;base64,' + icon(NX, 64, 0.06).toString('base64');
const page = (headExtra, bodyExtra) => `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="description" content="${DESC}">
<meta name="theme-color" content="#173a6e">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="icon" type="image/png" href="${favicon}">
${headExtra}</head>
<body>
${body}
${bodyExtra}</body>
</html>
`;

fs.rmSync(out('dist'), { recursive: true, force: true });
fs.mkdirSync(out('dist/pwa'), { recursive: true });

// 1) Claude Artifact variant + standalone file
fs.writeFileSync(out('dist/nusantara-express-artifact.html'), body);
fs.writeFileSync(out('dist/nusantara-express.html'), page('', ''));

// 2) PWA folder
const dir = 'dist/pwa/';
fs.writeFileSync(out(dir + 'icon-192.png'), icon(NX, 192, 0.1));
fs.writeFileSync(out(dir + 'icon-512.png'), icon(NX, 512, 0.1));
fs.writeFileSync(out(dir + 'icon-maskable.png'), icon(NX, 512, 0.2));
fs.writeFileSync(out(dir + 'apple-touch-icon.png'), icon(NX, 180, 0.1));
const files = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable.png', './apple-touch-icon.png'];
fs.writeFileSync(out(dir + 'manifest.webmanifest'), JSON.stringify({
  name: TITLE, short_name: 'Nusantara', description: DESC, lang: 'id', start_url: './', scope: './',
  display: 'fullscreen', orientation: 'landscape', background_color: '#173a6e', theme_color: '#173a6e',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2));
const version = 'nx-' + Date.now().toString(36);
fs.writeFileSync(out(dir + 'sw.js'), `const CACHE = '${version}';
const FILES = ${JSON.stringify(files)};
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
// Game page: network-first so a new version shows right away when online;
// falls back to the cache when offline or the network is slow (>4 s).
function fresh(req) {
  const net = fetch(req, { cache: 'no-cache' }).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); }
    return res;
  });
  const slow = new Promise((ok) => setTimeout(ok, 4000)).then(() => caches.match('./index.html'));
  return Promise.race([net, slow.then((hit) => hit || net)]).catch(() => caches.match('./index.html'));
}
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (e.request.mode === 'navigate' || url.pathname.endsWith('/index.html')) { e.respondWith(fresh(e.request)); return; }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request)));
});
`);
const pwaHead = `<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
`;
const sw = `<script>if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(function(){});</script>
`;
fs.writeFileSync(out(dir + 'index.html'), page(pwaHead, sw));
fs.writeFileSync(out(dir + 'CARA-PASANG.txt'), `NUSANTARA EXPRESS — versi aplikasi (PWA)

1. Upload SEMUA file di folder ini ke hosting statis HTTPS (GitHub Pages, Netlify Drop, Cloudflare Pages).
2. Buka alamatnya sekali di HP pakai Chrome (Android) atau Safari (iPhone) selagi ada internet.
3. Android: menu titik tiga > "Tambahkan ke Layar utama" / "Instal aplikasi".
   iPhone: tombol Bagikan > "Tambah ke Layar Utama".
4. Selesai. Game bisa dimainkan tanpa internet, dan progres (koin, bintang, Buku Oyen, markas) tersimpan di HP.
`);

// 3) zip of the PWA folder
try { fs.rmSync(out('dist/nusantara-express-pwa.zip')); } catch (e) { /* none yet */ }
try { execSync('zip -q -r ../nusantara-express-pwa.zip .', { cwd: fileURLToPath(out(dir)) }); } catch (e) { console.warn('zip not available, skipped'); }

const kb = p => (fs.statSync(out(p)).size / 1024).toFixed(0) + ' KB';
console.log(`release: nusantara-express.html ${kb('dist/nusantara-express.html')}, artifact ${kb('dist/nusantara-express-artifact.html')}, pwa: ${fs.readdirSync(out(dir)).join(', ')}`);
