#!/usr/bin/env python3
"""Download crest candidates + build labeled contact sheet for VLM verification."""
import json
import os
import urllib.request

CAND = "/tmp/crest-cands"
UA = "Mozilla/5.0 FHB/AssetFetch/1.0"

keys = sorted(f[:-5] for f in os.listdir(CAND) if f.endswith(".json"))
cells = []

for key in keys:
    with open(os.path.join(CAND, key + ".json")) as f:
        d = json.load(f)
    results = d.get("results", [])
    for i, r in enumerate(results[:4]):
        url = r["original_url"]
        ext = ".png" if ".png" in url.lower() else ".jpg"
        out = os.path.join(CAND, f"{key}-{i}{ext}")
        if not os.path.exists(out):
            try:
                req = urllib.request.Request(url, headers={"User-Agent": UA})
                with urllib.request.urlopen(req, timeout=30) as resp:
                    blob = resp.read()
                with open(out, "wb") as f2:
                    f2.write(blob)
            except Exception as e:
                print("DL-ERR", key, i, type(e).__name__)

print("Downloaded candidates. Building montage...")

from PIL import Image, ImageDraw

COLS = 4
CELL_W, CELL_H = 220, 250
LABEL_H = 26

valid = []
for key in keys:
    for i in range(4):
        for ext in (".png", ".jpg"):
            p = os.path.join(CAND, f"{key}-{i}{ext}")
            if os.path.exists(p):
                try:
                    im = Image.open(p).convert("RGBA")
                    valid.append((key, i, im.copy()))
                except Exception:
                    pass
                break

rows = (len(valid) + COLS - 1) // COLS
sheet = Image.new("RGB", (COLS * CELL_W, rows * CELL_H), (24, 24, 28))
draw = ImageDraw.Draw(sheet)
for idx, (key, i, im) in enumerate(valid):
    cx = (idx % COLS) * CELL_W
    cy = (idx // COLS) * CELL_H
    im.thumbnail((CELL_W - 16, CELL_H - LABEL_H - 16))
    # paste on white so transparent logos are visible
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    bg.alpha_composite(im)
    sheet.paste(bg.convert("RGB"), (cx + (CELL_W - im.width) // 2, cy + LABEL_H + (CELL_H - LABEL_H - im.height) // 2))
    draw.text((cx + 8, cy + 5), f"{key} #{i}", fill=(255, 220, 80))

sheet.save("/tmp/crest-cands/montage.png")
print("Montage:", sheet.size, "cells:", len(valid))
