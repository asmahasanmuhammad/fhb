"""Pixel-level verification of ad creatives in screenshots (no VLM needed).

Checks that expected brand colors actually appear in the ad regions,
proving the creatives rendered with their brand monograms/CTAs.
"""
from PIL import Image
import sys

def color_near(px, target, tol=40):
    return all(abs(a - b) <= tol for a, b in zip(px[:3], target))

def count_color(img, box, target, tol=40):
    region = img.crop(box).convert("RGB")
    w, h = region.size
    data = region.getdata()
    return sum(1 for p in data if color_near(p, target, tol)), w * h

checks = [
    # (file, box(x1,y1,x2,y2), rgb target, label)
    ("/tmp/verify/center-header.png", (60, 300, 1380, 600), (0x00, 0x9F, 0xE3), "GP teal monogram/CTA in header banner"),
    ("/tmp/verify/center-sidebar.png", (880, 250, 1440, 650), (0xFF, 0x4B, 0x63), "Pathao red in sidebar ad"),
    ("/tmp/verify/center-infeed.png", (60, 330, 1380, 570), (0x00, 0x57, 0xB8), "City Bank blue in in-feed ad"),
    ("/tmp/verify/preroll-live.png", (450, 150, 990, 750), (0x00, 0x9F, 0xE3), "GP teal in preroll overlay"),
]

ok = True
for f, box, target, label in checks:
    try:
        img = Image.open(f)
    except FileNotFoundError:
        print(f"SKIP (missing): {f}")
        continue
    hits, total = count_color(img, box, target)
    pct = 100 * hits / max(total, 1)
    status = "PASS" if pct > 0.15 else "FAIL"
    if status == "FAIL":
        ok = False
    print(f"{status}  {label}: {pct:.2f}% matching pixels in region ({hits}px)")

# Preroll darkness check: phone-frame area should be mostly dark (overlay over video)
img = Image.open("/tmp/verify/preroll-live.png").convert("L")
region = img.crop((470, 60, 970, 840))
data = list(region.getdata())
dark_ratio = sum(1 for v in data if v < 70) / len(data)
print(f"{'PASS' if dark_ratio > 0.5 else 'FAIL'}  Preroll overlay dark coverage: {dark_ratio*100:.1f}% (expect >50% dark)")

sys.exit(0 if ok else 1)
