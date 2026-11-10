#!/usr/bin/env python3
"""Find brand logo files on Wikipedia pages (FHB demo-ad brands)."""
import json
import time
import urllib.parse
import urllib.request

UA = {"User-Agent": "FHB-Research/1.0 (demo site asset research)"}
PAGES = {
    "bkash": "BKash",
    "grameenphone": "Grameenphone",
    "daraz": "Daraz",
    "walton": "Walton Hi-Tech Industries",
    "pathao": "Pathao",
    "samsung": "Samsung",
    "pran": "PRAN-RFL Group",
    "chaldal": "Chaldal",
    "citybank": "The City Bank (Bangladesh)",
    "foodpanda": "Foodpanda",
    "bata": "Bata Shoes",
    "teer": "City Group",
}


def api(params):
    url = "https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode())


for key, page in PAGES.items():
    print(f"=== {key} ({page}) ===")
    try:
        d = api({
            "action": "query", "titles": page, "prop": "images",
            "format": "json", "imlimit": "100",
        })
    except Exception as e:
        print(f"  ERROR: {e}")
        continue
    for p in d.get("query", {}).get("pages", {}).values():
        imgs = [i["title"] for i in p.get("images", [])]
        logos = [t for t in imgs if any(
            w in t.lower() for w in ("logo", "wordmark", "icon", "symbol"))]
        for t in logos:
            print(f"  {t}")
        if not logos:
            print(f"  (no logo files; {len(imgs)} images total)")
            for t in imgs[:12]:
                print(f"    - {t}")
    time.sleep(0.3)
