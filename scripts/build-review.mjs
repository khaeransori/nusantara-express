// Asset review sheet (the tone check before gameplay): dist/nusantara-express-aset.html
import fs from 'node:fs';
import { root, read } from './lib.mjs';

const b64 = p => fs.readFileSync(new URL(p, root)).toString('base64');
const font = (fam, w, file) => `@font-face{font-family:"${fam}";font-style:normal;font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${b64(file)}) format("woff2");}`;
const fonts = [
  ...[400, 500, 600, 700].map(w => font('Pixelify Sans', w, `node_modules/@fontsource/pixelify-sans/files/pixelify-sans-latin-${w}-normal.woff2`)),
  ...[400, 700].map(w => font('Nunito', w, `node_modules/@fontsource/nunito/files/nunito-latin-${w}-normal.woff2`))
].join('\n');
const scripts = ['src/assets/px.js', 'src/assets/sprites.js', 'src/assets/map-data.js', 'src/i18n.js', 'review/review.js']
  .map(p => `<script>\n${read(p)}\n</script>`).join('\n');
const html = read('review/template.html').replace('/*__FONTS__*/', fonts).replace('<!--__SCRIPTS__-->', scripts);
fs.mkdirSync(new URL('dist/', root), { recursive: true });
fs.writeFileSync(new URL('dist/nusantara-express-aset.html', root), html);
console.log('dist/nusantara-express-aset.html', (html.length / 1024).toFixed(0), 'KB');
