#!/usr/bin/env python3
"""Download wiki logo files + try apple-touch-icons for remaining brands."""
import json
import os
import time
import urllib.parse
import urllib.request

OUT = "/tmp/logos4"
UA = {"User-Agent": "FHB-Demo-Site-Asset-Research/1.2 (contact: dev@fhb.example; identifying logo files for internal demo mockups)"}

WANTED = {
    "grameenphone": "File:Grameenphone Logo GP Logo.svg",
    "foodpanda": "File:Foodpanda logo.svg",
    "chaldal": "File:Chaldal.com logo.png",
}


def api(params, retries=3):
    url = "https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode(params)
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=25) as r:
                return json.loads(r.read().decode())
        except Exception as e:
            print(f"  retry {attempt+1}: {e}")
            time.sleep(8)
    return None


# 1) wiki files via imageinfo
for key, title in WANTED.items():
    d = api({"action": "query", "titles": title, "prop": "imageinfo",
             "iiprop": "url", "format": "json"})
    if not d:
        continue
    for p in d.get("query", {}).get("pages", {}).values():
        for info in p.get("imageinfo", []):
            url = info["url"]
            ext = os.path.splitext(url)[1]
            path = f"{OUT}/wiki_{key}{ext}"
            try:
                req = urllib.request.Request(url, headers=UA)
                with urllib.request.urlopen(req, timeout=30) as r, open(path, "wb") as f:
                    f.write(r.read())
                print(f"wiki {key}: {path} ({os.path.getsize(path)}b) <- {url}")
            except Exception as e:
                print(f"wiki {key}: download failed {e}")
    time.sleep(2)

# 2) apple-touch-icons
TOUCH = {
    "pathao": ["https://pathao.com/apple-touch-icon.png",
               "https://pathao.com/wp-content/uploads/2019/04/cropped-pathao-app-icon-1.png"],
    "walton": ["https://waltonhil.com/apple-touch-icon.png",
               "https://www.waltonbd.com/apple-touch-icon.png",
               "https://waltonhil.com/favicon.ico"],
    "citybank": ["https://www.thecitybank.com/apple-touch-icon.png",
                 "https://www.citybankplc.com/apple-touch-icon.png",
                 "https://www.thecitybank.com/favicon.ico"],
    "pran": ["https://www.pran-rfl.com/apple-touch-icon.png",
             "https://www.pranfoods.net/apple-touch-icon.png",
             "https://pranfoods.net/favicon.ico"],
    "teer": ["https://www.citygroup.com.bd/apple-touch-icon.png",
             "https://teer.com.bd/apple-touch-icon.png",
             "https://www.citygroup.com.bd/favicon.ico"],
}
for key, urls in TOUCH.items():
    for u in urls:
        try:
            req = urllib.request.Request(u, headers=UA)
            with urllib.request.urlopen(req, timeout=20) as r:
                data = r.read()
            if len(data) > 400 and not data.startswith(b"<"):
                path = f"{OUT}/touch_{key}_" + os.path.basename(u.split("?")[0]).replace("-", "_")
                with open(path, "wb") as f:
                    f.write(data)
                print(f"touch {key}: {path} ({len(data)}b) <- {u}")
                break
        except Exception as e:
            print(f"touch {key}: miss {u} ({e})")
    time.sleep(1)
print("done")
