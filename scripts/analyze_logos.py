#!/usr/bin/env python3
"""Analyse logo candidates + build labelled contact sheets for review."""
import os
from PIL import Image

SRC = "/tmp/logos"
SHEET_W = 4  # candidates per row
TH = 200     # thumbnail height

files = sorted(os.listdir(SRC))
cands = []  # (path, info)
for f in files:
    if not f.lower().endswith((".png", ".jpg", ".jpeg")):
        continue
    p = os.path.join(SRC, f)
    try:
        im = Image.open(p)
        im.load()
    except Exception as e:
        print(f"{f}: BROKEN {e}")
        continue
    has_alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info
    alpha_ratio = 0.0
    if has_alpha and im.mode == "RGBA":
        a = im.getchannel("A")
        hist = a.histogram()
        transparent = sum(hist[:200])
        alpha_ratio = transparent / (im.width * im.height)
    cands.append((f, im.width, im.height, im.mode, round(alpha_ratio, 2)))

for c in sorted(cands):
    print(f"{c[0]:24s} {c[1]:5d}x{c[2]:<5d} mode={c[3]:5s} transparent={c[4]}")

# ---- contact sheets, grouped by brand ----
brands = sorted({f.rsplit("_", 1)[0] for f, *_ in cands})
os.makedirs("/tmp/sheets", exist_ok=True)
for brand in brands:
    group = sorted([c for c in cands if c[0].startswith(brand + "_")],
                   key=lambda x: int(x[0].rsplit("_", 1)[1].split(".")[0]))
    cols = max(SHEET_W, 2)
    rows = (len(group) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (TH + 20) + 20, rows * (TH + 46) + 20), "#20242b")
    from PIL import ImageDraw
    d = ImageDraw.Draw(sheet)
    for i, (fname, w, h, mode, tr) in enumerate(group):
        im = Image.open(os.path.join(SRC, fname)).convert("RGBA")
        im.thumbnail((TH, TH))
        # checkerboard to reveal transparency
        bg = Image.new("RGBA", (TH, TH + 6), (255, 255, 255, 255))
        for y in range(0, TH, 12):
            for x in range(0, TH, 12):
                if (x // 12 + y // 12) % 2 == 0:
                    d2 = ImageDraw.Draw(bg)
                    d2.rectangle([x, y, x + 11, y + 11], fill=(210, 210, 210, 255))
        bg.paste(im, ((TH - im.width) // 2, (TH + 6 - im.height) // 2), im)
        cx = 20 + (i % cols) * (TH + 20)
        cy = 20 + (i // cols) * (TH + 46)
        sheet.paste(bg.convert("RGB"), (cx, cy))
        d.text((cx + 4, cy + TH + 10), f"{brand} #{i}  {w}x{h} tr={tr}", fill="#ffffff")
    sheet.save(f"/tmp/sheets/{brand}.jpg", quality=80)
    print(f"sheet: /tmp/sheets/{brand}.jpg")
