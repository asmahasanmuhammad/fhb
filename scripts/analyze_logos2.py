#!/usr/bin/env python3
"""Analyse round-2 logo candidates + contact sheets (with SVG rasterisation)."""
import os
import shutil
import subprocess
from PIL import Image, ImageDraw

SRC = "/tmp/logos2"
TH = 220

# rasterise SVGs if possible
for f in sorted(os.listdir(SRC)):
    if f.lower().endswith(".svg"):
        p = os.path.join(SRC, f)
        out = p[:-4] + "_r.png"
        if not os.path.exists(out):
            ok = shutil.which("rsvg-convert") and subprocess.run(
                ["rsvg-convert", "-w", "800", "-o", out, p]).returncode == 0
            if not ok:
                try:
                    import cairosvg
                    cairosvg.svg2png(url=p, write_to=out, output_width=800)
                except Exception as e:
                    print(f"{f}: SVG rasterise failed: {e}")
                    continue
        print(f"rasterised {f} -> {os.path.basename(out)}")

cands = []
for f in sorted(os.listdir(SRC)):
    if not f.lower().endswith((".png", ".jpg", ".jpeg")):
        continue
    p = os.path.join(SRC, f)
    try:
        im = Image.open(p)
        im.load()
    except Exception as e:
        print(f"{f}: BROKEN {e}")
        continue
    tr = 0.0
    if im.mode == "RGBA":
        a = im.getchannel("A")
        hist = a.histogram()
        tr = round(sum(hist[:200]) / (im.width * im.height), 2)
    # palette mode with transparency info
    if im.mode == "P" and "transparency" in im.info:
        rgba = im.convert("RGBA")
        a = rgba.getchannel("A")
        hist = a.histogram()
        tr = round(sum(hist[:200]) / (im.width * im.height), 2)
    cands.append((f, im.width, im.height, im.mode, tr))

for c in cands:
    print(f"{c[0]:28s} {c[1]:5d}x{c[2]:<5d} {c[3]:5s} tr={c[4]}")

import re

def cand_index(fname):
    m = re.search(r"_(\d+)(?:_r)?\.\w+$", fname)
    return int(m.group(1)) if m else 99

def brand_of(fname):
    m = re.match(r"([a-z]+)_\d+", fname)
    return m.group(1) if m else fname

brands = sorted({brand_of(f) for f, *_ in cands})
os.makedirs("/tmp/sheets2", exist_ok=True)
for brand in brands:
    group = sorted([c for c in cands if brand_of(c[0]) == brand],
                   key=lambda x: cand_index(x[0]))
    cols = 6
    rows = (len(group) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (TH + 14) + 14, rows * (TH + 44) + 14), "#20242b")
    d = ImageDraw.Draw(sheet)
    for i, (fname, w, h, mode, tr) in enumerate(group):
        im = Image.open(os.path.join(SRC, fname)).convert("RGBA")
        im.thumbnail((TH, TH))
        bg = Image.new("RGBA", (TH, TH + 6), (255, 255, 255, 255))
        d2 = ImageDraw.Draw(bg)
        for y in range(0, TH, 12):
            for x in range(0, TH, 12):
                if (x // 12 + y // 12) % 2 == 0:
                    d2.rectangle([x, y, x + 11, y + 11], fill=(210, 210, 210, 255))
        bg.paste(im, ((TH - im.width) // 2, (TH + 6 - im.height) // 2), im)
        cx = 14 + (i % cols) * (TH + 14)
        cy = 14 + (i // cols) * (TH + 44)
        sheet.paste(bg.convert("RGB"), (cx, cy))
        d.text((cx + 4, cy + TH + 10), f"#{i} {w}x{h} tr={tr}", fill="#ffffff")
    sheet.save(f"/tmp/sheets2/{brand}.jpg", quality=80)
    print(f"sheet: /tmp/sheets2/{brand}.jpg")

# combine into 2 sheets
names = brands
half = (len(names) + 1) // 2
for idx, group in enumerate([names[:half], names[half:]], 1):
    if not group:
        continue
    ims = [Image.open(f"/tmp/sheets2/{b}.jpg") for b in group]
    w = max(i.width for i in ims)
    h = sum(i.height for i in ims) + 10 * (len(ims) - 1)
    s = Image.new("RGB", (w, h), "#111318")
    y = 0
    for im in ims:
        s.paste(im, (0, y))
        y += im.height + 10
    s.save(f"/tmp/combined2_{idx}.jpg", quality=78)
    print(f"combined: /tmp/combined2_{idx}.jpg", s.size)
