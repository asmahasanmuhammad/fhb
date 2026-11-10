#!/usr/bin/env python3
"""Round 3: direct worldvectorlogo CDN + brand homepage logo scraping."""
import os
import re
import urllib.parse
import urllib.request

OUT = "/tmp/logos3"
os.makedirs(OUT, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"}


def dl(url, path):
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=25) as r, open(path, "wb") as f:
            f.write(r.read())
        size = os.path.getsize(path)
        head = open(path, "rb").read(16)
        if head.startswith(b"<") or head.startswith(b"<!") or size < 300:
            os.remove(path)
            return None
        return size
    except Exception:
        if os.path.exists(path):
            os.remove(path)
        return None


# ---- 1. worldvectorlogo CDN ----
WVL = {
    "grameenphone": "grameenphone",
    "pathao": "pathao",
    "foodpanda": "foodpanda-1",
    "samsung": "samsung-4",
    "bata": "bata-1",
    "daraz": "daraz",
    "bkash": "bkash",
    "walton": "walton",
    "pran": "pran",
    "teer": "teer",
    "chaldal": "chaldal",
    "citybank": "city-bank",
}
print("== worldvectorlogo ==")
for key, slug in WVL.items():
    for variant in [slug, slug.replace("-1", ""), slug.replace("-4", "")]:
        url = f"https://cdn.worldvectorlogo.com/logos/{variant}.svg"
        path = f"{OUT}/wvl_{key}.svg"
        size = dl(url, path)
        if size:
            print(f"  {key}: OK {variant}.svg ({size}b)")
            break
    else:
        print(f"  {key}: miss")

# ---- 2. brand homepage scraping ----
SITES = {
    "grameenphone": "https://www.grameenphone.com",
    "pathao": "https://pathao.com",
    "walton": "https://waltonhil.com",
    "chaldal": "https://chaldal.com",
    "citybank": "https://www.thecitybank.com",
    "foodpanda": "https://www.foodpanda.com.bd",
    "bata": "https://www.batabd.com",
    "pran": "https://www.pranfoods.net",
    "teer": "https://www.teer.com.bd",
    "bkash": "https://www.bkash.com",
}
print("\n== homepage scrape ==")
for key, site in SITES.items():
    try:
        req = urllib.request.Request(site, headers=UA)
        with urllib.request.urlopen(req, timeout=25) as r:
            html = r.read().decode("utf-8", "ignore")
        base = site
    except Exception as e:
        print(f"  {key}: site fetch failed ({e})")
        continue
    # find img/logo references
    urls = set()
    for m in re.finditer(r'(?:src|href|content|data-src)=["\']([^"\']+)["\']', html, re.I):
        u = m.group(1)
        low = u.lower()
        if ("logo" in low or "brand" in low) and re.search(r"\.(svg|png)(\?|$)", low):
            if u.startswith("//"):
                u = "https:" + u
            elif u.startswith("/"):
                u = urllib.parse.urljoin(base, u)
            elif not u.startswith("http"):
                u = urllib.parse.urljoin(base, u)
            urls.add(u)
    got = 0
    for i, u in enumerate(sorted(urls)[:8]):
        ext = ".svg" if ".svg" in u.lower() else ".png"
        path = f"{OUT}/{key}_site{i}{ext}"
        if dl(u, path):
            print(f"  {key}: {os.path.basename(path)} <- {u[:110]}")
            got += 1
    if not got:
        print(f"  {key}: no logo images found ({len(urls)} candidates)")
