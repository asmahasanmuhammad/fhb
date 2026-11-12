import os
from PIL import Image, ImageEnhance, ImageFilter, ImageStat

RAW_DIR = "temp_posters_raw"
OUT_DIR = os.path.join("public", "news")
os.makedirs(OUT_DIR, exist_ok=True)

TARGET_W = 1280
TARGET_H = 720
TARGET_RATIO = TARGET_W / TARGET_H

def crop_and_resize(im):
    w, h = im.size
    current_ratio = w / h

    if current_ratio > TARGET_RATIO:
        # Image is wider than 16:9 -> crop left & right
        new_w = int(h * TARGET_RATIO)
        offset = (w - new_w) // 2
        box = (offset, 0, offset + new_w, h)
    else:
        # Image is taller than 16:9 -> crop top & bottom (favor top-center for faces/stadiums)
        new_h = int(w / TARGET_RATIO)
        offset = max(0, int((h - new_h) * 0.35))
        if offset + new_h > h:
            offset = h - new_h
        box = (0, offset, w, offset + new_h)

    cropped = im.crop(box)
    resized = cropped.resize((TARGET_W, TARGET_H), Image.Resampling.LANCZOS)
    return resized

def process_all():
    files = [f for f in os.listdir(RAW_DIR) if f.startswith("raw_")]
    print(f"Processing {len(files)} images to {TARGET_W}x{TARGET_H} (16:9)...")

    for f in sorted(files):
        art_id = f.replace("raw_", "").replace(".jpg", "")
        raw_path = os.path.join(RAW_DIR, f)
        out_path = os.path.join(OUT_DIR, f"news_{art_id}.jpg")

        try:
            with Image.open(raw_path) as im:
                im = im.convert("RGB")
                final_im = crop_and_resize(im)

                # Light clarity boost
                enhancer = ImageEnhance.Sharpness(final_im)
                final_im = enhancer.enhance(1.15)

                final_im.save(out_path, "JPEG", quality=92, optimize=True)

                file_size_kb = os.path.getsize(out_path) // 1024
                print(f"  [SAVED] news_{art_id}.jpg ({TARGET_W}x{TARGET_H}, {file_size_kb}KB)")
        except Exception as e:
            print(f"  [ERROR] {f}: {e}")

if __name__ == "__main__":
    process_all()
