#!/usr/bin/env python3
"""Build finalist contact sheet: chosen candidates + remaining options."""
import os
import subprocess
from PIL import Image, ImageDraw

SRC1, SRC2, SRC4, SRC5, OUTD = "/tmp/logos", "/tmp/logos2", "/tmp/logos4", "/tmp/logos5", "/tmp/final_sheets"
os.makedirs(OUTD, exist_ok=True)

# rasterise any svg in logos2 grameenphone_0 (Vareto 964x818) for comparison? skip.
PICKS = [
    # (label, path)
    ("bkash_A", f"{SRC1}/bkash_0.png"),
    ("daraz_A", f"{SRC1}/daraz_1.png"),
    ("daraz_B", f"{SRC1}/daraz_2.png"),
    ("samsung_A", f"{SRC2}/samsung_0.png"),
    ("samsung_B", f"{SRC2}/samsung_2.png"),
    ("gp_A_wiki", f"{SRC4}/wiki_grameenphone.svg"),
    ("foodpanda_A_wiki", f"{SRC4}/wiki_foodpanda.svg"),
    ("chaldal_A_wiki", f"{SRC4}/wiki_chaldal.png"),
    ("chaldal_B_site", f"{SRC3_SITE}" if False else "/tmp/logos3/chaldal_site1.png"),
    ("bata_A_site", "/tmp/logos3/bata_site1.png"),
    ("bata_B_site", "/tmp/logos3/bata_site4.png"),
    ("pathao_A_wiki", f"{SRC4}/Pathao_Logo.png"),
    ("pathao_B_wiki", f"{SRC4}/Pathao-logo.jpg"),
    ("walton_A_wiki", f"{SRC4}/Walton_Group_Logo.png"),
    ("walton_B_vec", f"{SRC5}/walton_0.png"),
    ("walton_C_bb", f"{SRC5}/walton_3.png"),
    ("citybank_A_official", f"{SRC5}/citybank_5.png"),
    ("citybank_B_mark", f"{SRC5}/citybank_1.png"),
    ("pran_A_pbil", f"{SRC5}/pran_0.png"),
    ("pran_B_nop", f"{SRC5}/pran_2.jpg"),
    ("teer_A_biponee", f"{SRC5}/teer_3.png"),
    ("teer_B_bi", f"{SRC5}/teer_1.jpg"),
]

TH = 230
cols = 4
rows = (len(PICKS) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (TH + 16) + 16, rows * (TH + 46) + 16), "#20242b")
d = ImageDraw.Draw(sheet)


def load(path):
    if path.endswith(".svg"):
        out = path + ".png"
        if not os.path.exists(out):
            import cairosvg
            cairosvg.svg2png(url=path, write_to=out, output_width=700)
        path = out
    return Image.open(path).convert("RGBA")


for i, (label, path) in enumerate(PICKS):
    try:
        im = load(path)
    except Exception as e:
        print("skip", label, e)
        continue
    w0, h0 = im.width, im.height
    im.thumbnail((TH, TH))
    bg = Image.new("RGBA", (TH, TH + 6), (255, 255, 255, 255))
    d2 = ImageDraw.Draw(bg)
    for y in range(0, TH, 12):
        for x in range(0, TH, 12):
            if (x // 12 + y // 12) % 2 == 0:
                d2.rectangle([x, y, x + 11, y + 11], fill=(210, 210, 210, 255))
    bg.paste(im, ((TH - im.width) // 2, (TH + 6 - im.height) // 2), im)
    cx = 16 + (i % cols) * (TH + 16)
    cy = 16 + (i // cols) * (TH + 46)
    sheet.paste(bg.convert("RGB"), (cx, cy))
    d.text((cx + 4, cy + TH + 12), f"{label} {w0}x{h0}", fill="#ffd166")
sheet.save(f"{OUTD}/finalists.jpg", quality=82)
print("saved", f"{OUTD}/finalists.jpg", sheet.size)
