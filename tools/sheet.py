import json, sys
from PIL import Image, ImageDraw
data = json.load(open(sys.argv[1]))
pal = {k: tuple(int(v[i:i+2], 16) for i in (1, 3, 5)) for k, v in data['pal'].items()}
S = int(sys.argv[3]) if len(sys.argv) > 3 else 6
sprites = data['sprites']
names = sys.argv[4].split(',') if len(sys.argv) > 4 else None
if names: sprites = [s for s in sprites if s['name'] in names]
W = 1400; x = y = 10; rowh = 0; placed = []
for s in sprites:
    w, h = s['w'] * S, s['h'] * S
    if x + w > W - 10: x = 10; y += rowh + 24; rowh = 0
    placed.append((s, x, y)); x += w + 16; rowh = max(rowh, h)
img = Image.new('RGB', (W, y + rowh + 30), (120, 190, 200))
d = ImageDraw.Draw(img)
for s, ox, oy in placed:
    d.text((ox, oy + s['h'] * S + 4), s['name'], fill=(0, 0, 0))
    for j in range(s['h']):
        for i in range(s['w']):
            c = s['d'][j * s['w'] + i]
            if c != '.': d.rectangle([ox + i * S, oy + j * S, ox + i * S + S - 1, oy + j * S + S - 1], fill=pal[c])
img.save(sys.argv[2])
