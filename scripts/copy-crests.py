#!/usr/bin/env python3
"""Copy real club crests from /tmp/football-logos repo → public/crests/{teamId}.png
Maps DB team names to repo file paths. Reports misses."""
import os
import shutil
import sqlite3

ROOT = "/home/z/my-project"
SRC = "/tmp/football-logos/logos"
CRESTS = os.path.join(ROOT, "public", "crests")
DB = os.path.join(ROOT, "db", "custom.db")

# DB team name → (league dir, file name)
MAP = {
    # England
    "Arsenal": ("England - Premier League", "Arsenal FC.png"),
    "Aston Villa": ("England - Premier League", "Aston Villa.png"),
    "Bournemouth": ("England - Premier League", "AFC Bournemouth.png"),
    "Brentford": ("England - Premier League", "Brentford FC.png"),
    "Brighton & Hove Albion": ("England - Premier League", "Brighton & Hove Albion.png"),
    "Chelsea": ("England - Premier League", "Chelsea FC.png"),
    "Coventry City": ("England - Premier League", "Coventry City.png"),
    "Crystal Palace": ("England - Premier League", "Crystal Palace.png"),
    "Everton": ("England - Premier League", "Everton FC.png"),
    "Fulham": ("England - Premier League", "Fulham FC.png"),
    "Hull City": ("England - Premier League", "Hull City.png"),
    "Ipswich Town": ("England - Premier League", "Ipswich Town.png"),
    "Leeds United": ("England - Premier League", "Leeds United.png"),
    "Liverpool": ("England - Premier League", "Liverpool FC.png"),
    "Manchester City": ("England - Premier League", "Manchester City.png"),
    "Manchester United": ("England - Premier League", "Manchester United.png"),
    "Newcastle United": ("England - Premier League", "Newcastle United.png"),
    "Nottingham Forest": ("England - Premier League", "Nottingham Forest.png"),
    "Sunderland": ("England - Premier League", "Sunderland AFC.png"),
    "Tottenham Hotspur": ("England - Premier League", "Tottenham Hotspur.png"),
    # Spain
    "Athletic Club": ("Spain - LaLiga", "Athletic Bilbao.png"),
    "Atlético Madrid": ("Spain - LaLiga", "Atlético de Madrid.png"),
    "CA Osasuna": ("Spain - LaLiga", "CA Osasuna.png"),
    "Celta de Vigo": ("Spain - LaLiga", "Celta de Vigo.png"),
    "Deportivo de A Coruña": ("Spain - LaLiga", "Deportivo A Coruña.png"),
    "Deportivo Alavés": ("Spain - LaLiga", "Deportivo Alavés.png"),
    "Elche CF": ("Spain - LaLiga", "Elche CF.png"),
    "FC Barcelona": ("Spain - LaLiga", "FC Barcelona.png"),
    "Getafe": ("Spain - LaLiga", "Getafe CF.png"),
    "Levante UD": ("Spain - LaLiga", "Levante UD.png"),
    "Málaga CF": ("Spain - LaLiga", "Málaga CF.png"),
    "RCD Espanyol": ("Spain - LaLiga", "RCD Espanyol Barcelona.png"),
    "Racing de Santander": ("Spain - LaLiga", "Racing Santander.png"),
    "Rayo Vallecano": ("Spain - LaLiga", "Rayo Vallecano.png"),
    "Real Betis": ("Spain - LaLiga", "Real Betis Balompié.png"),
    "Real Madrid": ("Spain - LaLiga", "Real Madrid.png"),
    "Real Sociedad": ("Spain - LaLiga", "Real Sociedad.png"),
    "Sevilla FC": ("Spain - LaLiga", "Sevilla FC.png"),
    "Valencia CF": ("Spain - LaLiga", "Valencia CF.png"),
    "Villarreal": ("Spain - LaLiga", "Villarreal CF.png"),
    # Germany
    "1. FC Köln": ("Germany - Bundesliga", "1.FC Köln.png"),
    "Union Berlin": ("Germany - Bundesliga", "1.FC Union Berlin.png"),
    "Mainz 05": ("Germany - Bundesliga", "1.FSV Mainz 05.png"),
    "Bayer Leverkusen": ("Germany - Bundesliga", "Bayer 04 Leverkusen.png"),
    "Bayern Munich": ("Germany - Bundesliga", "Bayern Munich.png"),
    "Borussia Dortmund": ("Germany - Bundesliga", "Borussia Dortmund.png"),
    "Borussia Mönchengladbach": ("Germany - Bundesliga", "Borussia Mönchengladbach.png"),
    "Eintracht Frankfurt": ("Germany - Bundesliga", "Eintracht Frankfurt.png"),
    "FC Augsburg": ("Germany - Bundesliga", "FC Augsburg.png"),
    "Schalke 04": ("Germany - Bundesliga", "FC Schalke 04.png"),
    "Hamburger SV": ("Germany - Bundesliga", "Hamburger SV.png"),
    "RB Leipzig": ("Germany - Bundesliga", "RB Leipzig.png"),
    "SC Freiburg": ("Germany - Bundesliga", "SC Freiburg.png"),
    "SC Paderborn": ("Germany - Bundesliga", "SC Paderborn 07.png"),
    "SV Elversberg": ("Germany - Bundesliga", "SV 07 Elversberg.png"),
    "Werder Bremen": ("Germany - Bundesliga", "SV Werder Bremen.png"),
    "TSG Hoffenheim": ("Germany - Bundesliga", "TSG 1899 Hoffenheim.png"),
    "VfB Stuttgart": ("Germany - Bundesliga", "VfB Stuttgart.png"),
    # Italy
    "AC Milan": ("Italy - Serie A", "AC Milan.png"),
    "Monza": ("Italy - Serie A", "AC Monza.png"),
    "Fiorentina": ("Italy - Serie A", "ACF Fiorentina.png"),
    "AS Roma": ("Italy - Serie A", "AS Roma.png"),
    "Atalanta": ("Italy - Serie A", "Atalanta BC.png"),
    "Bologna": ("Italy - Serie A", "Bologna FC 1909.png"),
    "Cagliari": ("Italy - Serie A", "Cagliari Calcio.png"),
    "Como 1907": ("Italy - Serie A", "Como 1907.png"),
    "Frosinone": ("Italy - Serie A", "Frosinone Calcio.png"),
    "Genoa": ("Italy - Serie A", "Genoa CFC.png"),
    "Inter Milan": ("Italy - Serie A", "Inter Milan.png"),
    "Juventus": ("Italy - Serie A", "Juventus FC.png"),
    "Parma": ("Italy - Serie A", "Parma Calcio 1913.png"),
    "Lazio": ("Italy - Serie A", "SS Lazio.png"),
    "Napoli": ("Italy - Serie A", "SSC Napoli.png"),
    "Torino": ("Italy - Serie A", "Torino FC.png"),
    "Lecce": ("Italy - Serie A", "US Lecce.png"),
    "Sassuolo": ("Italy - Serie A", "US Sassuolo.png"),
    "Udinese": ("Italy - Serie A", "Udinese Calcio.png"),
    "Venezia": ("Italy - Serie A", "Venezia FC.png"),
    # France
    "AJ Auxerre": ("France - Ligue 1", "AJ Auxerre.png"),
    "AS Monaco": ("France - Ligue 1", "AS Monaco.png"),
    "Angers SCO": ("France - Ligue 1", "Angers SCO.png"),
    "ESTAC Troyes": ("France - Ligue 1", "ESTAC Troyes.png"),
    "FC Lorient": ("France - Ligue 1", "FC Lorient.png"),
    "Toulouse FC": ("France - Ligue 1", "FC Toulouse.png"),
    "Lille OSC": ("France - Ligue 1", "LOSC Lille.png"),
    "Le Havre AC": ("France - Ligue 1", "Le Havre AC.png"),
    "Le Mans FC": ("France - Ligue 1", "Le Mans FC.png"),
    "OGC Nice": ("France - Ligue 1", "OGC Nice.png"),
    "Olympique Lyonnais": ("France - Ligue 1", "Olympique Lyon.png"),
    "Olympique de Marseille": ("France - Ligue 1", "Olympique Marseille.png"),
    "Paris FC": ("France - Ligue 1", "Paris FC.png"),
    "Paris Saint-Germain": ("France - Ligue 1", "Paris Saint-Germain.png"),
    "RC Lens": ("France - Ligue 1", "RC Lens.png"),
    "RC Strasbourg": ("France - Ligue 1", "RC Strasbourg Alsace.png"),
    "Stade Brestois": ("France - Ligue 1", "Stade Brestois 29.png"),
    "Stade Rennais": ("France - Ligue 1", "Stade Rennais FC.png"),
}


def main():
    os.makedirs(CRESTS, exist_ok=True)
    con = sqlite3.connect(DB)
    cur = con.cursor()
    teams = cur.execute("SELECT id, name FROM Team ORDER BY name").fetchall()

    copied, missing = 0, []
    for tid, name in teams:
        if name in MAP:
            league, fname = MAP[name]
            src = os.path.join(SRC, league, fname)
            if os.path.exists(src):
                shutil.copyfile(src, os.path.join(CRESTS, f"{tid}.png"))
                copied += 1
            else:
                missing.append((name, "FILE-NOT-FOUND"))
        else:
            missing.append((name, "NO-MAPPING"))

    # Update DB logoUrl where a crest file exists
    for tid, name in teams:
        p = os.path.join(CRESTS, f"{tid}.png")
        if os.path.exists(p):
            cur.execute("UPDATE Team SET logoUrl = ? WHERE id = ?", (f"/crests/{tid}.png", tid))
        else:
            cur.execute("UPDATE Team SET logoUrl = NULL WHERE id = ?", (tid,))
    con.commit()
    con.close()

    print(f"Copied {copied} crests; missing {len(missing)}:")
    for name, why in missing:
        print(f"  {why}: {name}")


if __name__ == "__main__":
    main()
