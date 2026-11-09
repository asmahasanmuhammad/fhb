#!/usr/bin/env python3
"""Fetch remaining 19 crest images from Wikipedia REST API (slow, policy-compliant UA)."""
import json
import os
import sqlite3
import time
import urllib.parse
import urllib.request

ROOT = "/home/z/my-project"
CRESTS = os.path.join(ROOT, "public", "crests")
DB = os.path.join(ROOT, "db", "custom.db")
UA = "FHB-DesignAssetFetcher/1.0 (https://footballhub.example; design@footballhub.example) python-urllib"

WIKI = {
    "Arambagh Krira Sangha": "Arambagh Krira Sangha",
    "Argentina National Football Team": "Argentina national football team",
    "Bangladesh National Football Team": "Bangladesh national football team",
    "Bangladesh Police Football Club": "Bangladesh Police FC",
    "Bashundhara Kings": "Bashundhara Kings",
    "Brothers Union": "Brothers Union",
    "Chattogram City": "Chattogram City FC",
    "City Club": "City Club (Bangladesh)",
    "Dhaka Abahani": "Abahani Limited Dhaka",
    "Dhaka Wanderers": "Dhaka Wanderers Club",
    "Fakirerpool Young Men's Club": "Fakirerpool Young Men's Club",
    "Fortis Football Club": "Fortis FC",
    "India National Football Team": "India national football team",
    "Maldives National Football Team": "Maldives national football team",
    "Mohammedan Sporting Club": "Mohammedan SC (Dhaka)",
    "Nepal National Football Team": "Nepal national football team",
    "PWD Sports Club": "PWD Sports Club",
    "Rahmatganj Muslim Friends Society": "Rahmatganj MFS",
    "Spain National Football Team": "Spain national football team",
}


def http_get(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def main():
    con = sqlite3.connect(DB)
    cur = con.cursor()
    teams = {name: tid for tid, name in cur.execute("SELECT id, name FROM Team").fetchall()}

    results = {}
    for name, title in WIKI.items():
        tid = teams.get(name)
        if not tid:
            results[name] = "NOT-IN-DB"
            continue
        out = os.path.join(CRESTS, f"{tid}.png")
        if os.path.exists(out) and os.path.getsize(out) > 400:
            results[name] = "cached"
            continue
        try:
            url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title.replace(" ", "_"))
            data = json.loads(http_get(url))
            if data.get("type") == "disambiguation":
                results[name] = "DISAMBIG"
                time.sleep(3.2)
                continue
            thumb = (data.get("thumbnail") or {}).get("source") or (data.get("originalimage") or {}).get("source")
            if not thumb:
                results[name] = "NO-IMAGE"
                time.sleep(3.2)
                continue
            blob = http_get(thumb)
            if len(blob) < 500:
                results[name] = "SMALL"
                time.sleep(3.2)
                continue
            with open(out, "wb") as f:
                f.write(blob)
            results[name] = "ok"
        except Exception as e:
            results[name] = f"ERR {type(e).__name__}: {str(e)[:60]}"
        time.sleep(3.4)

    for name, status in results.items():
        print(f"{status}: {name}")

    # update logoUrl
    for name, tid in teams.items():
        p = os.path.join(CRESTS, f"{tid}.png")
        if os.path.exists(p) and os.path.getsize(p) > 400:
            cur.execute("UPDATE Team SET logoUrl = ? WHERE id = ?", (f"/crests/{tid}.png", tid))
        else:
            cur.execute("UPDATE Team SET logoUrl = NULL WHERE id = ?", (tid,))
    con.commit()
    con.close()
    ok = sum(1 for v in results.values() if v in ("ok", "cached"))
    print(f"\n{ok}/{len(WIKI)} fetched")


if __name__ == "__main__":
    main()
