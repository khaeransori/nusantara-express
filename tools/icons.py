# App icons from the Oyen sprite: python3 icons.py sprites.json ../dist
import json, sys
from PIL import Image
data = json.load(open(sys.argv[1])); out = sys.argv[2]
pal = {k: tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) for k, v in data['pal'].items()}
oy = next(s for s in data['sprites'] if s['name'] == 'oyen')
W, H = oy['w'], 17  # face crop

def icon(size, pad_ratio):
    img = Image.new('RGB', (size, size), (45, 130, 201))
    # sea stripes
    for y in range(size):
        if y > size * 0.72:
            for x in range(size): img.putpixel((x, y), (29, 79, 145))
    scale = int(size * (1 - 2 * pad_ratio) / W)
    ox = (size - W * scale) // 2; oy_ = (size - H * scale) // 2
    for j in range(H):
        for i in range(W):
            c = oy['d'][j * W + i]
            if c == '.': continue
            for dy in range(scale):
                for dx in range(scale):
                    img.putpixel((ox + i * scale + dx, oy_ + j * scale + dy), pal[c])
    return img

icon(192, 0.1).save(f'{out}/icon-192.png')
icon(512, 0.18).save(f'{out}/icon-512.png')
icon(180, 0.1).save(f'{out}/apple-touch-icon.png')
print('icons ok')
