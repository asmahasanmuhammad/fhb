#!/usr/bin/env python3
"""Process final brand logos -> /home/z/my-project/public/brands/"""
import collections
import os
from PIL import Image

OUT = "/home/z/my-project/public/brands"
os.makedirs(OUT, exist_ok=True)

SRC = {
    "bkash": "/tmp/logos/bkash_0.png",
    "grameenphone": "/tmp/logos4/wiki_grameenphone.svg",
    "daraz": "/tmp/logos/daraz_2.png",
    "walton": "/tmp/logos5/walton_0.png",
    "pathao": "/tmp/logos4/Pathao_Logo.png",
    "samsung": "/tmp/logos8/samsung_current.svg",
    "pran": "/tmp/logos8/pran_rfl_logo.jpg",
    "chaldal": "/tmp/logos4/wiki_chaldal.png",
    "citybank": "/tmp/logos5/citybank_5.png",
    "foodpanda": "/tmp/logos4/wiki_foodpanda.svg",
    "bata": "/tmp/logos3/bata_site4.png",
    "citygroup": "/tmp/logos8/citygroup_logo.png",
}


def flood_remove_white(im, tol=238):
    """Remove only near-white pixels connected to the image border."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    seen = [[False] * w for _ in range(h)]
    q = collections.deque()

    def is_white(x, y):
        r, g, b, a = px[x, y]
        return a == 0 or (r >= tol and g >= tol and b >= tol)

    for x in range(w):
        for y in (0, h - 1):
            if is_white(x, y) and not seen[y][x]:
                seen[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_white(x, y) and not seen[y][x]:
                seen[y][x] = True
                q.append((x, y))
    while q:
        x, y = q.popleft()
        r, g, b, a = px[x, y]
        if a != 0:
            px[x, y] = (r, g, b, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and is_white(nx, ny):
                seen[ny][nx] = True
                q.append((nx, ny))
    return im


def trim(im, pad_ratio=0.03):
    bbox = im.getchannel("A").point(lambda v: 255 if v > 12 else 0).getbbox()
    if not bbox:
        return im
    im = im.crop(bbox)
    pad = max(2, int(max(im.size) * pad_ratio))
    canvas = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    canvas.paste(im, (pad, pad), im)
    return canvas


def limit(im, max_w=800):
    if im.width > max_w:
        im = im.resize((max_w, int(im.height * max_w / im.width)), Image.LANCZOS)
    return im


for key, src in SRC.items():
    if src.endswith(".svg"):
        dst = f"{OUT}/{key}.svg"
        with open(src, "rb") as f, open(dst, "wb") as g:
            g.write(f.read())
        print(f"{key}: copied SVG -> {dst} ({os.path.getsize(dst)}b)")
        continue
    im = Image.open(src).convert("RGBA")
    if src.endswith(".jpg") or key == "walton":
        im = flood_remove_white(im, tol=238)
    im = trim(im)
    im = limit(im)
    dst = f"{OUT}/{key}.png"
    im.save(dst)
    print(f"{key}: {im.size} -> {dst} ({os.path.getsize(dst)}b)")
