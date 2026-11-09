// ═══════════════════════════════════════════════════════════════════════════
// European top-5 leagues — REAL 2026-27 season data (BBC Sport tables,
// early November 2026) + club profile data (city, stadium, founded, colors).
// Standings tuple: [pos, name, P, W, D, L, GF, GA] — points derived as W*3+D.
// Team tuple: [name, shortName, initials, city, stadium, founded, color, color2]
// ═══════════════════════════════════════════════════════════════════════════

export type TeamTuple = [string, string, string, string, string, number, string, string];
export type StandingTuple = [number, string, number, number, number, number, number, number]; // pos, name, P, W, D, L, GF, GA

export type LeagueDef = {
  key: string;
  name: string;
  shortName: string;
  type: string;
  country: string;
  season: string;
  accentColor: string;
  description: string;
  teams: TeamTuple[];
  standings: StandingTuple[];
};

// ── England · Premier League ───────────────────────────────────────────────
const EPL: LeagueDef = {
  key: "EPL",
  name: "Premier League",
  shortName: "EPL",
  type: "LEAGUE",
  country: "England",
  season: "2026-27",
  accentColor: "#3D195B",
  description:
    "England's top flight and the most-watched league on the planet — 20 clubs, relentless intensity and the richest broadcast deal in world football. A Bangladeshi fan favourite since the satellite-TV era.",
  teams: [
    ["Arsenal", "Arsenal", "ARS", "London", "Emirates Stadium", 1886, "#EF0107", "#9C824A"],
    ["Brighton & Hove Albion", "Brighton", "BHA", "Brighton", "Amex Stadium", 1901, "#0057B8", "#FFCD00"],
    ["Manchester City", "Man City", "MCI", "Manchester", "Etihad Stadium", 1880, "#6CABDD", "#1C2C5B"],
    ["Liverpool", "Liverpool", "LIV", "Liverpool", "Anfield", 1892, "#C8102E", "#00B2A9"],
    ["Chelsea", "Chelsea", "CHE", "London", "Stamford Bridge", 1905, "#034694", "#DBA111"],
    ["Everton", "Everton", "EVE", "Liverpool", "Hill Dickinson Stadium", 1878, "#003399", "#FFFFFF"],
    ["Bournemouth", "Bournemouth", "BOU", "Bournemouth", "Vitality Stadium", 1899, "#DA291C", "#000000"],
    ["Brentford", "Brentford", "BRE", "London", "Gtech Community Stadium", 1889, "#E30613", "#FBB800"],
    ["Leeds United", "Leeds United", "LEE", "Leeds", "Elland Road", 1919, "#1D428A", "#FFCD00"],
    ["Aston Villa", "Aston Villa", "AVL", "Birmingham", "Villa Park", 1874, "#95BFE5", "#670E36"],
    ["Tottenham Hotspur", "Tottenham", "TOT", "London", "Tottenham Hotspur Stadium", 1882, "#132257", "#FFFFFF"],
    ["Newcastle United", "Newcastle", "NEW", "Newcastle", "St James' Park", 1892, "#241F20", "#FFFFFF"],
    ["Hull City", "Hull City", "HUL", "Hull", "MKM Stadium", 1904, "#F18A00", "#000000"],
    ["Ipswich Town", "Ipswich Town", "IPS", "Ipswich", "Portman Road", 1878, "#3A64A3", "#FFFFFF"],
    ["Fulham", "Fulham", "FUL", "London", "Craven Cottage", 1879, "#FFFFFF", "#000000"],
    ["Nottingham Forest", "Nottm Forest", "NFO", "Nottingham", "City Ground", 1865, "#DD0000", "#FFFFFF"],
    ["Coventry City", "Coventry City", "COV", "Coventry", "Coventry Building Society Arena", 1883, "#78D0F3", "#FFFFFF"],
    ["Manchester United", "Man United", "MUN", "Manchester", "Old Trafford", 1878, "#DA291C", "#FBE122"],
    ["Sunderland", "Sunderland", "SUN", "Sunderland", "Stadium of Light", 1879, "#EB172B", "#FFFFFF"],
    ["Crystal Palace", "Crystal Palace", "CRY", "London", "Selhurst Park", 1905, "#1B458F", "#C4122E"],
  ],
  standings: [
    [1, "Arsenal", 10, 9, 0, 1, 15, 5],
    [2, "Brighton & Hove Albion", 10, 7, 1, 2, 26, 7],
    [3, "Manchester City", 10, 7, 0, 3, 21, 13],
    [4, "Liverpool", 10, 5, 3, 2, 14, 10],
    [5, "Chelsea", 10, 5, 1, 4, 19, 16],
    [6, "Everton", 10, 4, 4, 2, 12, 10],
    [7, "Bournemouth", 10, 4, 3, 3, 16, 14],
    [8, "Brentford", 10, 3, 5, 2, 16, 11],
    [9, "Leeds United", 10, 3, 5, 2, 10, 8],
    [10, "Aston Villa", 10, 3, 4, 3, 14, 17],
    [11, "Tottenham Hotspur", 10, 3, 3, 4, 10, 11],
    [12, "Newcastle United", 10, 3, 3, 4, 13, 16],
    [13, "Hull City", 10, 2, 5, 3, 11, 11],
    [14, "Ipswich Town", 10, 3, 2, 5, 15, 20],
    [15, "Fulham", 10, 2, 4, 4, 10, 12],
    [16, "Nottingham Forest", 10, 2, 3, 5, 9, 13],
    [17, "Coventry City", 10, 3, 0, 7, 10, 19],
    [18, "Manchester United", 10, 1, 5, 4, 14, 19],
    [19, "Sunderland", 10, 2, 2, 6, 8, 17],
    [20, "Crystal Palace", 10, 2, 1, 7, 10, 24],
  ],
};

// ── Spain · LaLiga ─────────────────────────────────────────────────────────
const LALIGA: LeagueDef = {
  key: "LALIGA",
  name: "LaLiga EA Sports",
  shortName: "LaLiga",
  type: "LEAGUE",
  country: "Spain",
  season: "2026-27",
  accentColor: "#E5322D",
  description:
    "Spain's first division — home of El Clásico, technical mastery and two of the greatest academies in football history. Barcelona and Real Madrid remain the rivalry that stops the world.",
  teams: [
    ["FC Barcelona", "Barcelona", "BAR", "Barcelona", "Spotify Camp Nou", 1899, "#A50044", "#EDBB00"],
    ["Atlético Madrid", "Atlético", "ATM", "Madrid", "Riyadh Air Metropolitano", 1903, "#CB3524", "#FFFFFF"],
    ["Real Madrid", "Real Madrid", "RMA", "Madrid", "Santiago Bernabéu", 1902, "#FEBE10", "#00529F"],
    ["Real Betis", "Real Betis", "BET", "Seville", "Benito Villamarín", 1907, "#00954C", "#FFFFFF"],
    ["Real Sociedad", "R. Sociedad", "RSO", "San Sebastián", "Reale Arena", 1909, "#0067B1", "#FFFFFF"],
    ["Sevilla FC", "Sevilla", "SEV", "Seville", "Ramón Sánchez-Pizjuán", 1890, "#F43333", "#FFFFFF"],
    ["Athletic Club", "Athletic", "ATH", "Bilbao", "San Mamés", 1898, "#EE2523", "#FFFFFF"],
    ["Deportivo de A Coruña", "Deportivo", "DEP", "A Coruña", "Riazor", 1906, "#0072CE", "#FFFFFF"],
    ["Villarreal", "Villarreal", "VIL", "Villarreal", "Estadio de la Cerámica", 1923, "#FFE667", "#005187"],
    ["Celta de Vigo", "Celta Vigo", "CEL", "Vigo", "Balaídos", 1923, "#8AC3EE", "#FFFFFF"],
    ["Deportivo Alavés", "Alavés", "ALA", "Vitoria", "Mendizorroza", 1921, "#0761AF", "#FFFFFF"],
    ["Rayo Vallecano", "Rayo", "RAY", "Madrid", "Vallecas", 1924, "#FFFFFF", "#E53027"],
    ["Getafe", "Getafe", "GET", "Getafe", "Coliseum", 1983, "#005999", "#FFFFFF"],
    ["RCD Espanyol", "Espanyol", "RCDE", "Barcelona", "Stage Front Stadium", 1900, "#0072CE", "#FFFFFF"],
    ["CA Osasuna", "Osasuna", "OSA", "Pamplona", "El Sadar", 1920, "#0A346F", "#D91A21"],
    ["Racing de Santander", "Racing", "RAC", "Santander", "El Sardinero", 1913, "#FFFFFF", "#009B48"],
    ["Elche CF", "Elche", "ELC", "Elche", "Martínez Valero", 1923, "#FFFFFF", "#00954C"],
    ["Levante UD", "Levante", "LEV", "Valencia", "Ciutat de València", 1909, "#004FA3", "#B4053F"],
    ["Valencia CF", "Valencia", "VAL", "Valencia", "Mestalla", 1919, "#FFFFFF", "#F18E00"],
    ["Málaga CF", "Málaga", "MAL", "Málaga", "La Rosaleda", 1948, "#00549F", "#FFFFFF"],
  ],
  standings: [
    [1, "FC Barcelona", 11, 10, 0, 1, 46, 12],
    [2, "Atlético Madrid", 11, 9, 1, 1, 22, 8],
    [3, "Real Madrid", 11, 9, 0, 2, 28, 10],
    [4, "Real Betis", 11, 7, 2, 2, 18, 15],
    [5, "Real Sociedad", 11, 6, 1, 4, 20, 20],
    [6, "Sevilla FC", 11, 5, 2, 4, 17, 19],
    [7, "Athletic Club", 10, 4, 3, 3, 14, 10],
    [8, "Deportivo de A Coruña", 11, 3, 5, 3, 15, 14],
    [9, "Villarreal", 11, 3, 3, 5, 15, 15],
    [10, "Celta de Vigo", 11, 2, 6, 3, 10, 10],
    [11, "Deportivo Alavés", 11, 3, 3, 5, 15, 17],
    [12, "Rayo Vallecano", 10, 3, 3, 4, 15, 20],
    [13, "Getafe", 11, 3, 3, 5, 8, 16],
    [14, "RCD Espanyol", 11, 3, 2, 6, 13, 14],
    [15, "CA Osasuna", 11, 3, 2, 6, 11, 22],
    [16, "Racing de Santander", 11, 3, 2, 6, 15, 29],
    [17, "Elche CF", 11, 2, 4, 5, 14, 18],
    [18, "Levante UD", 11, 2, 4, 5, 16, 21],
    [19, "Valencia CF", 11, 2, 3, 6, 8, 17],
    [20, "Málaga CF", 11, 0, 5, 6, 8, 21],
  ],
};

// ── Italy · Serie A ────────────────────────────────────────────────────────
const SERIEA: LeagueDef = {
  key: "SERIEA",
  name: "Serie A",
  shortName: "Serie A",
  type: "LEAGUE",
  country: "Italy",
  season: "2026-27",
  accentColor: "#0B1560",
  description:
    "Italy's premier division — the home of tactical sophistication. Lazio's unbeaten start has lit up the 2026-27 season, with the Rome clubs and Como fighting Juventus giants for the Scudetto.",
  teams: [
    ["Lazio", "Lazio", "LAZ", "Rome", "Stadio Olimpico", 1900, "#87D8F7", "#FFFFFF"],
    ["Inter Milan", "Inter", "INT", "Milan", "San Siro", 1908, "#0068A8", "#221F20"],
    ["AS Roma", "Roma", "ROM", "Rome", "Stadio Olimpico", 1927, "#8E1F2F", "#F0BC42"],
    ["Como 1907", "Como", "COM", "Como", "Giuseppe Sinigaglia", 1907, "#004B9B", "#FFFFFF"],
    ["AC Milan", "AC Milan", "MIL", "Milan", "San Siro", 1899, "#FB090B", "#000000"],
    ["Frosinone", "Frosinone", "FRO", "Frosinone", "Benito Stirpe", 1912, "#FFD500", "#0066B3"],
    ["Juventus", "Juventus", "JUV", "Turin", "Allianz Stadium", 1897, "#FFFFFF", "#000000"],
    ["Napoli", "Napoli", "NAP", "Naples", "Diego Armando Maradona", 1926, "#12A0D7", "#FFFFFF"],
    ["Bologna", "Bologna", "BOL", "Bologna", "Renato Dall'Ara", 1909, "#1A2F48", "#A21C25"],
    ["Torino", "Torino", "TOR", "Turin", "Olimpico Grande Torino", 1906, "#8A1E03", "#FFFFFF"],
    ["Genoa", "Genoa", "GEN", "Genoa", "Luigi Ferraris", 1893, "#A21C25", "#0B1560"],
    ["Cagliari", "Cagliari", "CAG", "Cagliari", "Unipol Domus", 1920, "#B01B2E", "#0B1560"],
    ["Atalanta", "Atalanta", "ATA", "Bergamo", "Gewiss Stadium", 1907, "#1E71B8", "#000000"],
    ["Lecce", "Lecce", "LEC", "Lecce", "Via del Mare", 1908, "#FFE500", "#D2001F"],
    ["Parma", "Parma", "PAR", "Parma", "Ennio Tardini", 1913, "#FFE500", "#0B1560"],
    ["Fiorentina", "Fiorentina", "FIO", "Florence", "Artemio Franchi", 1926, "#7B2E8E", "#FFFFFF"],
    ["Sassuolo", "Sassuolo", "SAS", "Sassuolo", "Mapei Stadium", 1922, "#00A752", "#000000"],
    ["Monza", "Monza", "MON", "Monza", "U-Power Stadium", 1912, "#E2001A", "#FFFFFF"],
    ["Udinese", "Udinese", "UDI", "Udine", "Bluenergy Stadium", 1896, "#000000", "#FFFFFF"],
    ["Venezia", "Venezia", "VEN", "Venice", "Pierluigi Penzo", 1907, "#000000", "#F58220"],
  ],
  standings: [
    [1, "Lazio", 10, 9, 1, 0, 24, 8],
    [2, "Inter Milan", 10, 8, 1, 1, 26, 13],
    [3, "AS Roma", 10, 7, 3, 0, 28, 10],
    [4, "Como 1907", 10, 7, 2, 1, 18, 8],
    [5, "AC Milan", 10, 6, 3, 1, 21, 12],
    [6, "Frosinone", 10, 6, 2, 2, 24, 14],
    [7, "Juventus", 10, 5, 2, 3, 13, 10],
    [8, "Napoli", 10, 4, 2, 4, 17, 13],
    [9, "Bologna", 10, 4, 2, 4, 14, 13],
    [10, "Torino", 10, 4, 1, 5, 14, 16],
    [11, "Genoa", 10, 4, 1, 5, 10, 14],
    [12, "Cagliari", 10, 4, 1, 5, 9, 15],
    [13, "Atalanta", 10, 3, 2, 5, 16, 20],
    [14, "Lecce", 10, 3, 0, 7, 11, 21],
    [15, "Parma", 10, 2, 2, 6, 8, 15],
    [16, "Fiorentina", 10, 2, 2, 6, 15, 23],
    [17, "Sassuolo", 10, 2, 2, 6, 16, 26],
    [18, "Monza", 10, 2, 1, 7, 17, 24],
    [19, "Udinese", 10, 1, 2, 7, 11, 23],
    [20, "Venezia", 10, 1, 0, 9, 6, 20],
  ],
};

// ── Germany · Bundesliga ───────────────────────────────────────────────────
const BUNDESLIGA: LeagueDef = {
  key: "BUNDES",
  name: "Bundesliga",
  shortName: "Bundesliga",
  type: "LEAGUE",
  country: "Germany",
  season: "2026-27",
  accentColor: "#D20515",
  description:
    "Germany's top division — the league of packed stadiums and attacking football. Bayern and Dortmund are level at the summit in 2026-27, while fairy-tale clubs Elversberg and Paderborn shake up the establishment.",
  teams: [
    ["Bayern Munich", "Bayern", "BAY", "Munich", "Allianz Arena", 1900, "#DC052D", "#0066B2"],
    ["Borussia Dortmund", "Dortmund", "BVB", "Dortmund", "Signal Iduna Park", 1909, "#FDE100", "#000000"],
    ["SC Freiburg", "Freiburg", "SCF", "Freiburg", "Europa-Park Stadion", 1904, "#E2001A", "#000000"],
    ["RB Leipzig", "RB Leipzig", "RBL", "Leipzig", "Red Bull Arena", 2009, "#DD0741", "#FFFFFF"],
    ["Werder Bremen", "Bremen", "SVW", "Bremen", "Weserstadion", 1899, "#1D9053", "#FFFFFF"],
    ["Bayer Leverkusen", "Leverkusen", "B04", "Leverkusen", "BayArena", 1904, "#E32221", "#000000"],
    ["SV Elversberg", "Elversberg", "ELS", "Elversberg", "Ursapharm-Arena", 1907, "#000000", "#E2001A"],
    ["Eintracht Frankfurt", "Frankfurt", "SGE", "Frankfurt", "Deutsche Bank Park", 1899, "#E1000F", "#000000"],
    ["Mainz 05", "Mainz 05", "M05", "Mainz", "Mewa Arena", 1905, "#C3141E", "#FFFFFF"],
    ["FC Augsburg", "Augsburg", "FCA", "Augsburg", "WWK Arena", 1907, "#BA3733", "#46714D"],
    ["VfB Stuttgart", "Stuttgart", "VFB", "Stuttgart", "MHPArena", 1893, "#E32219", "#FFFFFF"],
    ["TSG Hoffenheim", "Hoffenheim", "TSG", "Sinsheim", "PreZero Arena", 1899, "#1C63B7", "#FFFFFF"],
    ["1. FC Köln", "Köln", "KOE", "Cologne", "RheinEnergieStadion", 1948, "#ED1C24", "#FFFFFF"],
    ["SC Paderborn", "Paderborn", "SCP", "Paderborn", "Home Deluxe Arena", 1907, "#004C97", "#FFFFFF"],
    ["Hamburger SV", "Hamburg", "HSV", "Hamburg", "Volksparkstadion", 1887, "#0C5EB1", "#000000"],
    ["Union Berlin", "Union Berlin", "FCU", "Berlin", "An der Alten Försterei", 1966, "#EB1923", "#FFE500"],
    ["Schalke 04", "Schalke 04", "S04", "Gelsenkirchen", "Arena AufSchalke", 1904, "#0060A9", "#FFFFFF"],
    ["Borussia Mönchengladbach", "Gladbach", "BMG", "Mönchengladbach", "Borussia-Park", 1900, "#FFFFFF", "#000000"],
  ],
  standings: [
    [1, "Bayern Munich", 8, 5, 3, 0, 27, 8],
    [2, "Borussia Dortmund", 8, 5, 3, 0, 14, 6],
    [3, "SC Freiburg", 8, 5, 1, 2, 18, 10],
    [4, "RB Leipzig", 8, 5, 0, 3, 22, 11],
    [5, "Werder Bremen", 8, 4, 3, 1, 17, 14],
    [6, "Bayer Leverkusen", 8, 4, 1, 3, 18, 16],
    [7, "SV Elversberg", 8, 4, 1, 3, 16, 16],
    [8, "Eintracht Frankfurt", 8, 3, 2, 3, 13, 18],
    [9, "Mainz 05", 8, 3, 1, 4, 17, 17],
    [10, "FC Augsburg", 8, 2, 3, 3, 18, 15],
    [11, "VfB Stuttgart", 8, 3, 0, 5, 14, 15],
    [12, "TSG Hoffenheim", 8, 3, 0, 5, 14, 16],
    [13, "1. FC Köln", 8, 2, 3, 3, 9, 12],
    [14, "SC Paderborn", 8, 2, 3, 3, 6, 9],
    [15, "Hamburger SV", 8, 3, 0, 5, 7, 19],
    [16, "Union Berlin", 8, 1, 4, 3, 7, 19],
    [17, "Schalke 04", 8, 1, 3, 4, 4, 9],
    [18, "Borussia Mönchengladbach", 8, 1, 1, 6, 11, 22],
  ],
};

// ── France · Ligue 1 ───────────────────────────────────────────────────────
const LIGUE1: LeagueDef = {
  key: "LIGUE1",
  name: "Ligue 1",
  shortName: "Ligue 1",
  type: "LEAGUE",
  country: "France",
  season: "2026-27",
  accentColor: "#091C3E",
  description:
    "France's top flight — the great talent factory of European football. PSG lead the way in 2026-27 while capital newcomers Paris FC and a resurgent Lyon chase the Champions League places.",
  teams: [
    ["Paris Saint-Germain", "PSG", "PSG", "Paris", "Parc des Princes", 1970, "#004170", "#DA291C"],
    ["Lille OSC", "Lille", "LIL", "Lille", "Stade Pierre-Mauroy", 1944, "#E01E13", "#0F1F3C"],
    ["Olympique Lyonnais", "Lyon", "LYO", "Lyon", "Groupama Stadium", 1950, "#1B448B", "#DA291C"],
    ["Paris FC", "Paris FC", "PFC", "Paris", "Stade Jean-Bouin", 1969, "#0F1F3C", "#B4A0D1"],
    ["Stade Rennais", "Rennes", "REN", "Rennes", "Roazhon Park", 1901, "#E23237", "#000000"],
    ["Olympique de Marseille", "Marseille", "OM", "Marseille", "Orange Vélodrome", 1899, "#2FAEE0", "#FFFFFF"],
    ["AS Monaco", "Monaco", "ASM", "Monaco", "Stade Louis II", 1924, "#E63946", "#FFFFFF"],
    ["OGC Nice", "Nice", "NIC", "Nice", "Allianz Riviera", 1904, "#E30613", "#000000"],
    ["RC Lens", "Lens", "RCL", "Lens", "Stade Bollaert-Delelis", 1906, "#FFE500", "#E30613"],
    ["Stade Brestois", "Brest", "SB29", "Brest", "Stade Francis-Le Blé", 1950, "#E30613", "#FFFFFF"],
    ["FC Lorient", "Lorient", "LOR", "Lorient", "Stade du Moustoir", 1926, "#F58220", "#000000"],
    ["Toulouse FC", "Toulouse", "TFC", "Toulouse", "Stadium de Toulouse", 1970, "#582C83", "#FFFFFF"],
    ["RC Strasbourg", "Strasbourg", "RCS", "Strasbourg", "Stade de la Meinau", 1906, "#0F5FA6", "#FFFFFF"],
    ["AJ Auxerre", "Auxerre", "AJA", "Auxerre", "Stade de l'Abbé-Deschamps", 1905, "#1B448B", "#FFFFFF"],
    ["Angers SCO", "Angers", "SCO", "Angers", "Stade Raymond Kopa", 1919, "#000000", "#FFFFFF"],
    ["ESTAC Troyes", "Troyes", "TRO", "Troyes", "Stade de l'Aube", 1986, "#0F5FA6", "#FFFFFF"],
    ["Le Mans FC", "Le Mans", "LEM", "Le Mans", "Marcel Saupin", 1985, "#E30613", "#FFD700"],
    ["Le Havre AC", "Le Havre", "HAC", "Le Havre", "Stade Océane", 1872, "#87CEEB", "#0F1F3C"],
  ],
  standings: [
    [1, "Paris Saint-Germain", 9, 6, 2, 1, 21, 10],
    [2, "Lille OSC", 9, 5, 3, 1, 12, 6],
    [3, "Olympique Lyonnais", 9, 5, 2, 2, 15, 7],
    [4, "Paris FC", 9, 5, 2, 2, 16, 10],
    [5, "Stade Rennais", 9, 5, 1, 3, 20, 19],
    [6, "Olympique de Marseille", 9, 5, 0, 4, 20, 13],
    [7, "AS Monaco", 9, 4, 3, 2, 12, 10],
    [8, "OGC Nice", 9, 4, 2, 3, 13, 12],
    [9, "RC Lens", 9, 4, 1, 4, 16, 13],
    [10, "Stade Brestois", 9, 3, 3, 3, 16, 12],
    [11, "FC Lorient", 9, 3, 3, 3, 7, 8],
    [12, "Toulouse FC", 9, 2, 4, 3, 12, 13],
    [13, "RC Strasbourg", 9, 3, 1, 5, 17, 19],
    [14, "AJ Auxerre", 9, 3, 1, 5, 13, 23],
    [15, "Angers SCO", 9, 2, 2, 5, 9, 17],
    [16, "ESTAC Troyes", 9, 2, 2, 5, 7, 16],
    [17, "Le Mans FC", 9, 1, 4, 4, 11, 18],
    [18, "Le Havre AC", 9, 0, 2, 7, 9, 20],
  ],
};

export const EUROPEAN_LEAGUES: LeagueDef[] = [EPL, LALIGA, SERIEA, BUNDESLIGA, LIGUE1];

// Deterministic form guide derived from team strength (points ratio),
// used only for the visual "form" column — standings themselves are real.
export function seededForm(name: string, points: number, played: number): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const ratio = points / (played * 3);
  const chars: string[] = [];
  for (let i = 0; i < 5; i++) {
    const r = ((h >> (i * 5)) & 31) / 31; // 0..1
    const winP = 0.15 + ratio * 0.6;
    const drawP = 0.2 + (1 - ratio) * 0.15;
    chars.push(r < winP ? "W" : r < winP + drawP ? "D" : "L");
  }
  return chars.join("");
}
