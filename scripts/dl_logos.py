#!/usr/bin/env python3
"""Search, download and analyse brand logo candidates for FHB demo ads."""
import json
import os
import subprocess
import sys
import urllib.request

OUT = "/tmp/logos"
os.makedirs(OUT, exist_ok=True)

BRANDS = {
    "bkash": "bKash mobile financial service Bangladesh official logo transparent PNG",
    "grameenphone": "Grameenphone GP official logo transparent PNG",
    "daraz": "Daraz online shopping official logo transparent PNG",
    "walton": "Walton Bangladesh electronics official logo transparent PNG",
    "pathao": "Pathao ride sharing Bangladesh official logo transparent PNG",
    "samsung": "Samsung official wordmark logo transparent PNG",
    "pran": "PRAN RFL Group Bangladesh official logo transparent PNG",
    "chaldal": "Chaldal online grocery Bangladesh official logo transparent PNG",
    "citybank": "The City Bank Bangladesh Citytouch official logo transparent PNG",
    "foodpanda": "Foodpanda delivery official logo transparent PNG",
    "bata": "Bata shoes official logo transparent PNG",
    "teer": "Teer flour City Group Bangladesh official logo transparent PNG",
}

only = sys.argv[1:] if len(sys.argv) > 1 else list(BRANDS)

for key in only:
    query = BRANDS[key]
    print(f"\n############ {key} ############")
    json_path = f"{OUT}/{key}.json"
    if not os.path.exists(json_path):
        r = subprocess.run(
            ["z-ai", "image-search", "-q", query, "--count", "5",
             "--gl", "us", "--no-rank"],
            capture_output=True, text=True, timeout=180)
        out = r.stdout
        start = out.find("{")
        if start == -1:
            print("  NO JSON IN OUTPUT:", out[-300:])
            continue
        with open(json_path, "w") as f:
            f.write(out[start:])
    try:
        d = json.load(open(json_path))
    except Exception as e:
        print("  JSON ERROR:", e)
        continue
    if not d.get("success"):
        print("  search unsuccessful")
        continue
    for i, res in enumerate(d.get("results", [])):
        url = res.get("original_url", "")
        ext = os.path.splitext(url)[1].split("?")[0] or ".png"
        path = f"{OUT}/{key}_{i}{ext}"
        if not os.path.exists(path):
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=30) as resp, open(path, "wb") as f:
                    f.write(resp.read())
            except Exception as e:
                print(f"  [{i}] DOWNLOAD FAILED: {e}")
                continue
        print(f"  [{i}] {url} -> {os.path.basename(path)} ({os.path.getsize(path)} bytes) src={res.get('source')} {res.get('original_width')}x{res.get('original_height')}")
print("\nDone.")
