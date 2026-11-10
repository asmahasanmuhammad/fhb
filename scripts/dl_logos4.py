#!/usr/bin/env python3
"""Round 4: polite Wikipedia API queries for brand logo files + apple-touch-icons."""
import json
import os
import time
import urllib.parse
import urllib.request

OUT = "/tmp/logos4"
os.makedirs(OUT, exist_ok=True)
UA = {"User-Agent": "FHB-Demo-Site-Asset-Research/1.2 (contact: dev@fhb.example; identifying logo files for internal demo mockups)"}

PAGES = {
    "grameenphone": "Grameenphone",
    "pathao": "Pathao",
    "walton": "Walton Hi-Tech Industries",
    "citybank": "City Bank PLC",
    "foodpanda": "Foodpanda",
    "pran": "PRAN-RFL Group",
    "teer": "Teer (brand)",
    "chaldal": "Chaldal",
    "bkash": "BKash",
    "daraz": "Daraz",
    "samsung": "Samsung",
    "bata": "Bata Shoes",
}


def api(params, retries=3):
    url = "https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode(params)
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=25) as r:
                return json.loads(r.read().decode())
        except Exception as e:
            print(f"    attempt {attempt+1} failed: {e}")
            time.sleep(8 * (attempt + 1))
    return None


results = {}
for key, page in PAGES.items():
    print(f"\n=== {key} ===")
    d = api({"action": "query", "titles": page, "prop": "images",
             "format": "json", "imlimit": "100"})
    if not d:
        print("  API FAILED")
        continue
    logos = []
    for p in d.get("query", {}).get("pages", {}).values():
        for img in p.get("images", []):
            t = img["title"]
            if any(w in t.lower() for w in ("logo", "wordmark")) and t.lower().endswith((".svg", ".png")):
                logos.append(t)
    print("  logo files:", logos)
    results[key] = logos
    time.sleep(3)

with open(f"{OUT}/wiki_files.json", "w") as f:
    json.dump(results, f, indent=1)
print("\nsaved", f"{OUT}/wiki_files.json")
