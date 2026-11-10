#!/usr/bin/env python3
"""Round 2: refined logo searches for brands missing clean logos."""
import json
import os
import subprocess
import sys
import urllib.request

OUT = "/tmp/logos2"
os.makedirs(OUT, exist_ok=True)

BRANDS = {
    "grameenphone": "Grameenphone logo vector transparent PNG seeklogo",
    "walton": "Walton Group Bangladesh logo vector transparent PNG",
    "pathao": "Pathao logo red letter P vector transparent PNG",
    "samsung": "Samsung logo wordmark vector transparent PNG logos world",
    "pran": "PRAN food products Bangladesh logo transparent PNG vector",
    "chaldal": "Chaldal logo green transparent PNG",
    "citybank": "City Bank PLC Bangladesh logo transparent PNG",
    "foodpanda": "Foodpanda pink panda logo transparent PNG vector",
    "bata": "Bata shoes red wordmark logo transparent PNG vector",
    "teer": "Teer atta brand logo transparent PNG Bangladesh",
}

only = sys.argv[1:] if len(sys.argv) > 1 else list(BRANDS)

for key in only:
    query = BRANDS[key]
    print(f"\n############ {key} ############")
    r = subprocess.run(
        ["z-ai", "image-search", "-q", query, "--count", "6",
         "--gl", "us", "--no-rank"],
        capture_output=True, text=True, timeout=180)
    out = r.stdout
    start = out.find("{")
    if start == -1:
        print("  NO JSON:", out[-200:])
        continue
    try:
        d = json.loads(out[start:])
    except Exception as e:
        print("  JSON ERR:", e)
        continue
    if not d.get("success"):
        print("  search failed")
        continue
    for i, res in enumerate(d.get("results", [])):
        url = res.get("original_url", "")
        ext = os.path.splitext(url)[1].split("?")[0] or ".png"
        path = f"{OUT}/{key}_{i}{ext}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as resp, open(path, "wb") as f:
                f.write(resp.read())
            print(f"  [{i}] {os.path.basename(path)} ({os.path.getsize(path)}b) src={res.get('source')} {res.get('original_width')}x{res.get('original_height')}")
        except Exception as e:
            print(f"  [{i}] DL FAIL {e}")
print("\nDone.")
