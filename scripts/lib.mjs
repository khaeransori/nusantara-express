// Tiny helpers for the build: load the game's sprite code in Node, and write PNGs without native deps.
import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';

export const root = new URL('../', import.meta.url);
export const read = p => fs.readFileSync(new URL(p, root), 'utf8');

// Run the browser sprite scripts in a sandbox and hand back NX (palette + sprites).
export function loadSprites() {
  const ctx = {};
  vm.createContext(ctx);
  for (const f of ['src/assets/px.js', 'src/assets/sprites.js']) vm.runInContext(read(f), ctx, { filename: f });
  return vm.runInContext('NX', ctx);
}

const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = buf => { let c = -1; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
// rgba: Uint8Array of w*h*4
export function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// App icon: Oyen's face on a sea-blue tile. pad = share of the edge kept empty (bigger for maskable icons).
export function icon(NX, size, pad = 0.1) {
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const face = NX.SPR.oyenFace, sea = hex(NX.PAL.A), deep = hex(NX.PAL.d);
  const px = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const c = y > size * 0.72 ? deep : sea; px.set([...c, 255], (y * size + x) * 4);
  }
  const s = Math.floor(size * (1 - 2 * pad) / face.w), ox = Math.floor((size - face.w * s) / 2), oy = Math.floor((size - face.h * s) / 2);
  for (let j = 0; j < face.h; j++) for (let i = 0; i < face.w; i++) {
    const ch = face.d[j * face.w + i]; if (ch === '.') continue;
    const c = hex(NX.PAL[ch]);
    for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) px.set([...c, 255], ((oy + j * s + dy) * size + ox + i * s + dx) * 4);
  }
  return png(size, size, px);
}
