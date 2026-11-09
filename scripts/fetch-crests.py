#!/usr/bin/env python3
"""Fetch real club crest images from Wikipedia REST API → public/crests/{teamId}.png
Updates db/custom.db Team.logoUrl. Idempotent (skips existing files)."""
import json
import os
import sqlite3
import time
import urllib.parse
import urllib.request

ROOT = "/home/z/my-project"
CRESTS = os.path.join(ROOT, "public", "crests")
DB = os.path.join(ROOT, "db", "custom.db")
UA = "Mozilla/5.0 (X11; Linux x86_64) FHB-Research/1.0 (design asset fetch)"

# DB team name → Wikipedia page title (None → try name itself)
WIKI = {
    "1. FC Köln": "1. FC Köln",
    "AC Milan": "AC Milan",
    "AJ Auxerre": "AJ Auxerre",
    "AS Monaco": "AS Monaco FC",
    "AS Roma": "AS Roma",
    "Angers SCO": "Angers SCO",
    "Arambagh Krira Sangha": "Arambagh Krira Sangha",
    "Argentina National Football Team": "Argentina national football team",
    "Arsenal": "Arsenal F.C.",
    "Aston Villa": "Aston Villa F.C.",
    "Atalanta": "Atalanta BC",
    "Athletic Club": "Athletic Bilbao",
    "Atlético Madrid": "Atlético Madrid",
    "Bangladesh National Football Team": "Bangladesh national football team",
    "Bangladesh Police Football Club": "Bangladesh Police FC",
    "Bashundhara Kings": "Bashundhara Kings",
    "Bayer Leverkusen": "Bayer 04 Leverkusen",
    "Bayern Munich": "FC Bayern Munich",
    "Bologna": "Bologna FC 1909",
    "Borussia Dortmund": "Borussia Dortmund",
    "Borussia Mönchengladbach": "Borussia Mönchengladbach",
    "Bournemouth": "A.F.C. Bournemouth",
    "Brentford": "Brentford F.C.",
    "Brighton & Hove Albion": "Brighton & Hove Albion F.C.",
    "Brothers Union": "Brothers Union",
    "CA Osasuna": "CA Osasuna",
    "Cagliari": "Cagliari Calcio",
    "Celta de Vigo": "Celta Vigo",
    "Chattogram City": "Chattogram City FC",
    "Chelsea": "Chelsea F.C.",
    "City Club": "City Club (Bangladesh)",
    "Como 1907": "Como 1907",
    "Coventry City": "Coventry City F.C.",
    "Crystal Palace": "Crystal Palace F.C.",
    "Deportivo Alavés": "Deportivo Alavés",
    "Deportivo de A Coruña": "Deportivo de La Coruña",
    "Dhaka Abahani": "Abahani Limited Dhaka",
    "Dhaka Wanderers": "Dhaka Wanderers Club",
    "ESTAC Troyes": "ES Troyes AC",
    "Eintracht Frankfurt": "Eintracht Frankfurt",
    "Elche CF": "Elche CF",
    "Everton": "Everton F.C.",
    "FC Augsburg": "FC Augsburg",
    "FC Barcelona": "FC Barcelona",
    "FC Lorient": "FC Lorient",
    "Fakirerpool Young Men's Club": "Fakirerpool Young Men's Club",
    "Fiorentina": "ACF Fiorentina",
    "Fortis Football Club": "Fortis FC",
    "Frosinone": "Frosinone Calcio",
    "Fulham": "Fulham F.C.",
    "Genoa": "Genoa CFC",
    "Getafe": "Getafe CF",
    "Hamburger SV": "Hamburger SV",
    "Hull City": "Hull City A.F.C.",
    "India National Football Team": "India national football team",
    "Inter Milan": "Inter Milan",
    "Ipswich Town": "Ipswich Town F.C.",
    "Juventus": "Juventus FC",
    "Lazio": "SS Lazio",
    "Le Havre AC": "Le Havre AC",
    "Le Mans FC": "Le Mans FC",
    "Lecce": "US Lecce",
    "Leeds United": "Leeds United F.C.",
    "Levante UD": "Levante UD",
    "Lille OSC": "Lille OSC",
    "Liverpool": "Liverpool F.C.",
    "Mainz 05": "1. FSV Mainz 05",
    "Maldives National Football Team": "Maldives national football team",
    "Manchester City": "Manchester City F.C.",
    "Manchester United": "Manchester United F.C.",
    "Mohammedan Sporting Club": "Mohammedan SC (Dhaka)",
    "Monza": "AC Monza",
    "Málaga CF": "Málaga CF",
    "Napoli": "SSC Napoli",
    "Nepal National Football Team": "Nepal national football team",
    "Newcastle United": "Newcastle United F.C.",
    "Nottingham Forest": "Nottingham Forest F.C.",
    "OGC Nice": "OGC Nice",
    "Olympique Lyonnais": "Olympique Lyonnais",
    "Olympique de Marseille": "Olympique de Marseille",
    "PWD Sports Club": "PWD Sports Club",
    "Paris FC": "Paris FC",
    "Paris Saint-Germain": "Paris Saint-Germain F.C.",
    "Parma": "Parma Calcio 1913",
    "RB Leipzig": "RB Leipzig",
    "RC Lens": "RC Lens",
    "RC Strasbourg": "RC Strasbourg Alsace",
    "RCD Espanyol": "RCD Espanyol",
    "Racing de Santander": "Racing de Santander",
    "Rahmatganj Muslim Friends Society": "Rahmatganj MFS",
    "Rayo Vallecano": "Rayo Vallecano",
    "Real Betis": "Real Betis",
    "Real Madrid": "Real Madrid CF",
    "Real Sociedad": "Real Sociedad",
    "SC Freiburg": "SC Freiburg",
    "SC Paderborn": "SC Paderborn 07",
    "SV Elversberg": "SV Elversberg",
    "Sassuolo": "US Sassuolo Calcio",
    "Schalke 04": "FC Schalke 04",
    "Sevilla FC": "Sevilla FC",
    "Spain National Football Team": "Spain national football team",
    "Stade Brestois": "Stade Brestois 29",
    "Stade Rennais": "Stade Rennais FC",
    "Sunderland": "Sunderland A.F.C.",
    "TSG Hoffenheim": "TSG 1899 Hoffenheim",
    "Torino": "Torino FC",
    "Tottenham Hotspur": "Tottenham Hotspur F.C.",
    "Toulouse FC": "Toulouse FC",
    "Udinese": "Udinese Calcio",
    "Union Berlin": "1. FC Union Berlin",
    "Valencia CF": "Valencia CF",
    "Venezia": "Venezia FC",
    "VfB Stuttgart": "VfB Stuttgart",
    "Villarreal": "Villarreal CF",
    "Werder Bremen": "SV Werder Bremen",
}


def http_get(url: str, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def summary(title: str):
    url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title.replace(" ", "_"))
    try:
        data = json.loads(http_get(url))
        return data
    except Exception:
        return None


def main():
    os.makedirs(CRESTS, exist_ok=True)
    con = sqlite3.connect(DB)
    cur = con.cursor()
    teams = cur.execute("SELECT id, name FROM Team ORDER BY name").fetchall()

    results = {}
    for tid, name in teams:
        out = os.path.join(CRESTS, f"{tid}.png")
        if os.path.exists(out) and os.path.getsize(out) > 400:
            results[name] = "cached"
            continue
        title = WIKI.get(name, name)
        data = summary(title)
        thumb = None
        if data and data.get("type") != "disambiguation":
            thumb = (data.get("thumbnail") or {}).get("source") or (data.get("originalimage") or {}).get("source")
        if not thumb:
            time.sleep(0.25)
            results[name] = "NO-PAGE"
            continue
        try:
            blob = http_get(thumb)
            if len(blob) < 400:
                results[name] = "TOO-SMALL"
                continue
            # ensure PNG-ish or webp; wikipedia thumbs are png for svg sources
            with open(out, "wb") as f:
                f.write(blob)
            results[name] = "ok"
        except Exception as e:
            results[name] = f"ERR {type(e).__name__}"
        time.sleep(0.35)

    # update DB logoUrl for all teams that have a crest file
    for tid, name in teams:
        out = os.path.join(CRESTS, f"{tid}.png")
        if os.path.exists(out) and os.path.getsize(out) > 400:
            cur.execute("UPDATE Team SET logoUrl = ? WHERE id = ?", (f"/crests/{tid}.png", tid))
        else:
            cur.execute("UPDATE Team SET logoUrl = NULL WHERE id = ?", (tid,))
    con.commit()
    con.close()

    ok = sum(1 for v in results.values() if v in ("ok", "cached"))
    print(f"Fetched {ok}/{len(teams)} crests")
    for name, status in results.items():
        if status not in ("ok", "cached"):
            print(f"  MISS {status}: {name}")


if __name__ == "__main__":
    main()
