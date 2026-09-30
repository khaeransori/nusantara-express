// Inline fonts + scripts into one offline HTML file: review/nusantara-express-assets.html
import fs from 'node:fs';
const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), 'utf8');
const b64 = p => fs.readFileSync(new URL(p, import.meta.url)).toString('base64');
const font = (fam, w, file) => `@font-face{font-family:"${fam}";font-style:normal;font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${b64(file)}) format("woff2");}`;
const fonts = [
  font('Pixelify Sans', 400, 'node_modules/@fontsource/pixelify-sans/files/pixelify-sans-latin-400-normal.woff2'),
  font('Pixelify Sans', 500, 'node_modules/@fontsource/pixelify-sans/files/pixelify-sans-latin-500-normal.woff2'),
  font('Pixelify Sans', 600, 'node_modules/@fontsource/pixelify-sans/files/pixelify-sans-latin-600-normal.woff2'),
  font('Pixelify Sans', 700, 'node_modules/@fontsource/pixelify-sans/files/pixelify-sans-latin-700-normal.woff2'),
  font('Nunito', 400, 'node_modules/@fontsource/nunito/files/nunito-latin-400-normal.woff2'),
  font('Nunito', 700, 'node_modules/@fontsource/nunito/files/nunito-latin-700-normal.woff2')
].join('\n');
const scripts = ['src/assets/px.js', 'src/assets/sprites.js', 'src/assets/map-data.js', 'src/i18n.js', 'review/review.js']
  .map(p => `<script>\n${read(p)}\n</script>`).join('\n');
const html = read('review/template.html').replace('/*__FONTS__*/', fonts).replace('<!--__SCRIPTS__-->', scripts);
fs.writeFileSync(new URL('review/nusantara-express-assets.html', root), html);
console.log('wrote', (html.length / 1024).toFixed(1), 'KB');
