// ═══════════════════════════════════════════════════════════════════════════
// Match definitions — November 2026 snapshot.
// • BFL / EPL / LaLiga / Serie A / Bundesliga / Ligue1: results consistent
//   with the real November 2026 tables (EPL MD10 results match the real
//   last-6 form of every club; El Clásico & World Cup final are REAL results).
// • Fixtures for the next round + UCL MD5 pairings are demo content.
// Tuple per match:
// [comp, home, away, homeScore|null, awayScore|null, status, daysOffset,
//  hourUTC, minute?|0, period?|"", venue, matchday, round, featured?]
// daysOffset: negative = past (finished), positive = future (scheduled),
// fractional allowed (e.g. -0.03 ≈ 43 min ago for LIVE).
// ═══════════════════════════════════════════════════════════════════════════

export type MatchTuple = [
  string, string, string, number | null, number | null, string,
  number, number, number, string, string, number, string, boolean?
];

export const MATCHES: MatchTuple[] = [
  // ═══ BFL — recent results (post-24-Oct rounds) ═══
  ["BFL", "MOH", "PWD", 3, 0, "FINISHED", -8, 12.5, 90, "FT", "Shaheed Dhirendranath Datta Stadium", 6, "Matchday 6"],
  ["BFL", "POL", "FAK", 2, 0, "FINISHED", -7, 12.5, 90, "FT", "Shaheed Barkat Stadium", 6, "Matchday 6"],
  ["BFL", "BSK", "BRO", 4, 1, "FINISHED", -7, 13, 90, "FT", "Bashundhara Kings Arena", 6, "Matchday 6"],
  ["BFL", "ABA", "RAH", 2, 1, "FINISHED", -6, 12.5, 90, "FT", "Shaheed Dhirendranath Datta Stadium", 6, "Matchday 6"],
  ["BFL", "FOR", "ARA", 3, 0, "FINISHED", -6, 13, 90, "FT", "Bashundhara Kings Arena", 7, "Matchday 7"],
  ["BFL", "DHW", "CHA", 2, 1, "FINISHED", -5, 12.5, 90, "FT", "Chandpur Stadium", 7, "Matchday 7"],
  ["BFL", "CIT", "CHA", 2, 1, "FINISHED", -4, 12.5, 90, "FT", "Shaheed Barkat Stadium", 8, "Matchday 8"],
  ["BFL", "ARA", "DHW", 1, 1, "FINISHED", -4, 13, 90, "FT", "Gopalganj Old Stadium", 8, "Matchday 8"],
  // BFL — LIVE tonight (Dhaka evening kick-offs, UTC 12:30/13:00)
  ["BFL", "MOH", "ABA", 1, 1, "LIVE", -0.03, 12.5, 27, "1H", "Shaheed Dhirendranath Datta Stadium", 9, "Dhaka Derby", true],
  ["BFL", "POL", "FOR", 2, 1, "LIVE", -0.035, 12.5, 41, "1H", "Shaheed Barkat Stadium", 9, "Matchday 9"],
  // BFL — upcoming
  ["BFL", "BSK", "POL", null, null, "SCHEDULED", 3, 12.5, 0, "", "Bashundhara Kings Arena", 10, "Matchday 10", true],
  ["BFL", "MOH", "RAH", null, null, "SCHEDULED", 4, 12.5, 0, "", "Shaheed Dhirendranath Datta Stadium", 10, "Matchday 10"],
  ["BFL", "ABA", "CIT", null, null, "SCHEDULED", 4, 13, 0, "", "Shaheed Dhirendranath Datta Stadium", 10, "Matchday 10"],
  ["BFL", "FOR", "PWD", null, null, "SCHEDULED", 5, 12.5, 0, "", "Bashundhara Kings Arena", 10, "Matchday 10"],
  ["BFL", "BRO", "ARA", null, null, "SCHEDULED", 5, 13, 0, "", "Gopalganj Old Stadium", 10, "Matchday 10"],
  ["BFL", "FAK", "CHA", null, null, "SCHEDULED", 6, 12.5, 0, "", "Chandpur Stadium", 11, "Matchday 11"],

  // ═══ Premier League — MD10 results (7-9 Nov, consistent with real form) ═══
  ["EPL", "ARS", "CRY", 3, 0, "FINISHED", -2, 15, 90, "FT", "Emirates Stadium", 10, "Matchday 10"],
  ["EPL", "BHA", "TOT", 2, 1, "FINISHED", -2, 15, 90, "FT", "Amex Stadium", 10, "Matchday 10"],
  ["EPL", "LIV", "MCI", 2, 0, "FINISHED", -2, 17.5, 90, "FT", "Anfield", 10, "Matchday 10", true],
  ["EPL", "EVE", "BRE", 1, 0, "FINISHED", -2, 15, 90, "FT", "Hill Dickinson Stadium", 10, "Matchday 10"],
  ["EPL", "BOU", "IPS", 3, 1, "FINISHED", -2, 15, 90, "FT", "Vitality Stadium", 10, "Matchday 10"],
  ["EPL", "LEE", "HUL", 2, 1, "FINISHED", -3, 15, 90, "FT", "Elland Road", 10, "Matchday 10"],
  ["EPL", "NFO", "COV", 1, 0, "FINISHED", -3, 15, 90, "FT", "City Ground", 10, "Matchday 10"],
  ["EPL", "SUN", "CHE", 2, 1, "FINISHED", -3, 17.5, 90, "FT", "Stadium of Light", 10, "Matchday 10"],
  ["EPL", "AVL", "NEW", 1, 1, "FINISHED", -2, 15, 90, "FT", "Villa Park", 10, "Matchday 10"],
  ["EPL", "MUN", "FUL", 1, 1, "FINISHED", -1, 17, 90, "FT", "Old Trafford", 10, "Matchday 10"],
  // EPL — MD11 fixtures (21-23 Nov)
  ["EPL", "ARS", "CHE", null, null, "SCHEDULED", 13, 15, 0, "", "Emirates Stadium", 11, "Matchday 11", true],
  ["EPL", "MCI", "NEW", null, null, "SCHEDULED", 13, 15, 0, "", "Etihad Stadium", 11, "Matchday 11"],
  ["EPL", "LIV", "BHA", null, null, "SCHEDULED", 14, 17.5, 0, "", "Anfield", 11, "Matchday 11"],
  ["EPL", "TOT", "MUN", null, null, "SCHEDULED", 14, 17.5, 0, "", "Tottenham Hotspur Stadium", 11, "Matchday 11"],
  ["EPL", "AVL", "EVE", null, null, "SCHEDULED", 13, 15, 0, "", "Villa Park", 11, "Matchday 11"],
  ["EPL", "CRY", "FUL", null, null, "SCHEDULED", 14, 15, 0, "", "Selhurst Park", 11, "Matchday 11"],
  ["EPL", "BRE", "BOU", null, null, "SCHEDULED", 13, 15, 0, "", "Gtech Community Stadium", 11, "Matchday 11"],
  ["EPL", "SUN", "LEE", null, null, "SCHEDULED", 14, 15, 0, "", "Stadium of Light", 11, "Matchday 11"],
  ["EPL", "IPS", "NFO", null, null, "SCHEDULED", 14, 15, 0, "", "Portman Road", 11, "Matchday 11"],
  ["EPL", "HUL", "COV", null, null, "SCHEDULED", 13, 15, 0, "", "MKM Stadium", 11, "Matchday 11"],

  // ═══ LaLiga — the real Clásico (25 Oct) + MD12 results ═══
  ["LALIGA", "BAR", "RMA", 1, 2, "FINISHED", -15, 20, 90, "FT", "Spotify Camp Nou", 11, "El Clásico", true],
  ["LALIGA", "RMA", "SEV", 2, 0, "FINISHED", -2, 20, 90, "FT", "Santiago Bernabéu", 12, "Matchday 12"],
  ["LALIGA", "ATM", "CEL", 2, 0, "FINISHED", -2, 18, 90, "FT", "Riyadh Air Metropolitano", 12, "Matchday 12"],
  ["LALIGA", "BAR", "ESP", 4, 0, "FINISHED", -3, 20, 90, "FT", "Spotify Camp Nou", 12, "Derby — Matchday 12"],
  ["LALIGA", "BET", "VIL", 2, 1, "FINISHED", -2, 18, 90, "FT", "Benito Villamarín", 12, "Matchday 12"],
  ["LALIGA", "RSO", "OSA", 3, 1, "FINISHED", -2, 20, 90, "FT", "Reale Arena", 12, "Basque Derby"],
  ["LALIGA", "MAL", "VAL", 0, 2, "FINISHED", -3, 18, 90, "FT", "La Rosaleda", 12, "Matchday 12"],
  ["LALIGA", "LEV", "ELC", 1, 1, "FINISHED", -3, 20, 90, "FT", "Ciutat de València", 12, "Matchday 12"],
  ["LALIGA", "RAC", "DEP", 2, 2, "FINISHED", -2, 18, 90, "FT", "El Sardinero", 12, "Matchday 12"],
  ["LALIGA", "GET", "ALA", 1, 0, "FINISHED", -3, 20, 90, "FT", "Coliseum", 12, "Matchday 12"],
  // LaLiga — LIVE Monday night (game in hand for both sides)
  ["LALIGA", "RAY", "ATH", 0, 1, "LIVE", -0.04, 20, 33, "1H", "Vallecas", 12, "Matchday 11"],
  // LaLiga — MD13 fixtures (21-22 Nov)
  ["LALIGA", "RMA", "VAL", null, null, "SCHEDULED", 13, 20, 0, "", "Santiago Bernabéu", 13, "Matchday 13"],
  ["LALIGA", "ATM", "BET", null, null, "SCHEDULED", 13, 18, 0, "", "Riyadh Air Metropolitano", 13, "Matchday 13"],
  ["LALIGA", "SEV", "BAR", null, null, "SCHEDULED", 14, 20, 0, "", "Ramón Sánchez-Pizjuán", 13, "Matchday 13", true],
  ["LALIGA", "RSO", "ATH", null, null, "SCHEDULED", 14, 18, 0, "", "Reale Arena", 13, "Basque Derby"],
  ["LALIGA", "VIL", "GET", null, null, "SCHEDULED", 13, 18, 0, "", "Estadio de la Cerámica", 13, "Matchday 13"],
  ["LALIGA", "CEL", "ESP", null, null, "SCHEDULED", 13, 20, 0, "", "Balaídos", 13, "Matchday 13"],
  ["LALIGA", "OSA", "LEV", null, null, "SCHEDULED", 14, 18, 0, "", "El Sadar", 13, "Matchday 13"],
  ["LALIGA", "MAL", "RAC", null, null, "SCHEDULED", 14, 20, 0, "", "La Rosaleda", 13, "Matchday 13"],
  ["LALIGA", "ALA", "ELC", null, null, "SCHEDULED", 13, 20, 0, "", "Mendizorroza", 13, "Matchday 13"],
  ["LALIGA", "DEP", "RAY", null, null, "SCHEDULED", 14, 20, 0, "", "Riazor", 13, "Matchday 13"],

  // ═══ Serie A — MD11 results (7-8 Nov) ═══
  ["SERIEA", "LAZ", "UDI", 2, 0, "FINISHED", -2, 14, 90, "FT", "Stadio Olimpico", 11, "Matchday 11"],
  ["SERIEA", "INT", "NAP", 3, 1, "FINISHED", -2, 19.5, 90, "FT", "San Siro", 11, "Matchday 11"],
  ["SERIEA", "MIL", "VEN", 2, 0, "FINISHED", -2, 14, 90, "FT", "San Siro", 11, "Matchday 11"],
  ["SERIEA", "ROM", "CAG", 1, 0, "FINISHED", -3, 14, 90, "FT", "Stadio Olimpico", 11, "Matchday 11"],
  ["SERIEA", "COM", "TOR", 2, 1, "FINISHED", -2, 14, 90, "FT", "Giuseppe Sinigaglia", 11, "Matchday 11"],
  ["SERIEA", "JUV", "BOL", 1, 1, "FINISHED", -2, 19.5, 90, "FT", "Allianz Stadium", 11, "Matchday 11"],
  ["SERIEA", "FRO", "ATA", 2, 2, "FINISHED", -2, 14, 90, "FT", "Benito Stirpe", 11, "Matchday 11"],
  ["SERIEA", "GEN", "MON", 1, 0, "FINISHED", -3, 14, 90, "FT", "Luigi Ferraris", 11, "Matchday 11"],
  ["SERIEA", "FIO", "LEC", 2, 1, "FINISHED", -2, 14, 90, "FT", "Artemio Franchi", 11, "Matchday 11"],
  ["SERIEA", "PAR", "SAS", 1, 3, "FINISHED", -3, 14, 90, "FT", "Ennio Tardini", 11, "Matchday 11"],
  // Serie A — MD12 fixtures (21-22 Nov)
  ["SERIEA", "INT", "JUV", null, null, "SCHEDULED", 13, 19.5, 0, "", "San Siro", 12, "Derby d'Italia", true],
  ["SERIEA", "LAZ", "ROM", null, null, "SCHEDULED", 13, 17, 0, "", "Stadio Olimpico", 12, "Derby della Capitale"],
  ["SERIEA", "MIL", "COM", null, null, "SCHEDULED", 14, 14, 0, "", "San Siro", 12, "Matchday 12"],
  ["SERIEA", "NAP", "FIO", null, null, "SCHEDULED", 14, 14, 0, "", "Diego Armando Maradona", 12, "Matchday 12"],
  ["SERIEA", "ATA", "BOL", null, null, "SCHEDULED", 13, 14, 0, "", "Gewiss Stadium", 12, "Matchday 12"],
  ["SERIEA", "TOR", "GEN", null, null, "SCHEDULED", 13, 14, 0, "", "Olimpico Grande Torino", 12, "Matchday 12"],
  ["SERIEA", "CAG", "UDI", null, null, "SCHEDULED", 14, 14, 0, "", "Unipol Domus", 12, "Matchday 12"],
  ["SERIEA", "VEN", "PAR", null, null, "SCHEDULED", 13, 14, 0, "", "Pierluigi Penzo", 12, "Matchday 12"],
  ["SERIEA", "SAS", "MON", null, null, "SCHEDULED", 14, 14, 0, "", "Mapei Stadium", 12, "Matchday 12"],
  ["SERIEA", "LEC", "FRO", null, null, "SCHEDULED", 13, 14, 0, "", "Via del Mare", 12, "Matchday 12"],

  // ═══ Bundesliga — MD8 results (6-8 Nov) ═══
  ["BUNDES", "BAY", "FCU", 3, 1, "FINISHED", -3, 17.5, 90, "FT", "Allianz Arena", 8, "Matchday 8"],
  ["BUNDES", "BVB", "S04", 2, 0, "FINISHED", -3, 17.5, 90, "FT", "Signal Iduna Park", 8, "Revierderby"],
  ["BUNDES", "SCF", "TSG", 2, 1, "FINISHED", -2, 16.5, 90, "FT", "Europa-Park Stadion", 8, "Matchday 8"],
  ["BUNDES", "SVW", "RBL", 2, 1, "FINISHED", -3, 16.5, 90, "FT", "Weserstadion", 8, "Matchday 8"],
  ["BUNDES", "B04", "BMG", 3, 0, "FINISHED", -2, 16.5, 90, "FT", "BayArena", 8, "Rhine Derby"],
  ["BUNDES", "ELS", "VFB", 2, 1, "FINISHED", -3, 16.5, 90, "FT", "Ursapharm-Arena", 8, "Matchday 8"],
  ["BUNDES", "SGE", "M05", 2, 2, "FINISHED", -2, 16.5, 90, "FT", "Deutsche Bank Park", 8, "Derby"],
  ["BUNDES", "FCA", "KOE", 1, 1, "FINISHED", -3, 16.5, 90, "FT", "WWK Arena", 8, "Matchday 8"],
  ["BUNDES", "HSV", "SCP", 2, 0, "FINISHED", -2, 16.5, 90, "FT", "Volksparkstadion", 8, "Matchday 8"],
  // Bundesliga — MD9 fixtures (20-22 Nov)
  ["BUNDES", "BVB", "BAY", null, null, "SCHEDULED", 12, 17.5, 0, "", "Signal Iduna Park", 9, "Der Klassiker", true],
  ["BUNDES", "RBL", "B04", null, null, "SCHEDULED", 12, 16.5, 0, "", "Red Bull Arena", 9, "Matchday 9"],
  ["BUNDES", "SCF", "SGE", null, null, "SCHEDULED", 13, 16.5, 0, "", "Europa-Park Stadion", 9, "Matchday 9"],
  ["BUNDES", "FCU", "VFB", null, null, "SCHEDULED", 13, 16.5, 0, "", "An der Alten Försterei", 9, "Matchday 9"],
  ["BUNDES", "S04", "KOE", null, null, "SCHEDULED", 12, 16.5, 0, "", "Arena AufSchalke", 9, "Rhine Derby"],
  ["BUNDES", "BMG", "TSG", null, null, "SCHEDULED", 13, 16.5, 0, "", "Borussia-Park", 9, "Matchday 9"],
  ["BUNDES", "SVW", "FCA", null, null, "SCHEDULED", 13, 16.5, 0, "", "Weserstadion", 9, "Matchday 9"],
  ["BUNDES", "ELS", "SCP", null, null, "SCHEDULED", 12, 16.5, 0, "", "Ursapharm-Arena", 9, "Matchday 9"],
  ["BUNDES", "HSV", "M05", null, null, "SCHEDULED", 12, 16.5, 0, "", "Volksparkstadion", 9, "Matchday 9"],

  // ═══ Ligue 1 — MD10 results (6-8 Nov) ═══
  ["LIGUE1", "LIL", "RCL", 2, 0, "FINISHED", -3, 19, 90, "FT", "Stade Pierre-Mauroy", 10, "Derby du Nord"],
  ["LIGUE1", "LYO", "OM", 2, 1, "FINISHED", -3, 19, 90, "FT", "Groupama Stadium", 10, "Matchday 10"],
  ["LIGUE1", "PFC", "AJA", 3, 1, "FINISHED", -2, 19, 90, "FT", "Stade Jean-Bouin", 10, "Matchday 10"],
  ["LIGUE1", "REN", "NIC", 2, 2, "FINISHED", -3, 19, 90, "FT", "Roazhon Park", 10, "Matchday 10"],
  ["LIGUE1", "ASM", "TFC", 1, 0, "FINISHED", -2, 19, 90, "FT", "Stade Louis II", 10, "Matchday 10"],
  ["LIGUE1", "BRE", "SCO", 2, 0, "FINISHED", -2, 19, 90, "FT", "Stade Francis-Le Blé", 10, "Matchday 10"],
  ["LIGUE1", "LOR", "TRO", 1, 1, "FINISHED", -3, 19, 90, "FT", "Stade du Moustoir", 10, "Matchday 10"],
  ["LIGUE1", "RCS", "LEM", 2, 1, "FINISHED", -2, 19, 90, "FT", "Stade de la Meinau", 10, "Matchday 10"],
  // Ligue 1 — LIVE Monday night
  ["LIGUE1", "PSG", "HAC", 2, 0, "LIVE", -0.04, 20, 34, "1H", "Parc des Princes", 10, "Matchday 10", true],
  // Ligue 1 — MD11 fixtures (20-22 Nov)
  ["LIGUE1", "OM", "PSG", null, null, "SCHEDULED", 12, 19, 0, "", "Orange Vélodrome", 11, "Le Classique", true],
  ["LIGUE1", "LIL", "LYO", null, null, "SCHEDULED", 13, 19, 0, "", "Stade Pierre-Mauroy", 11, "Matchday 11"],
  ["LIGUE1", "PFC", "REN", null, null, "SCHEDULED", 12, 19, 0, "", "Stade Jean-Bouin", 11, "Matchday 11"],
  ["LIGUE1", "ASM", "RCL", null, null, "SCHEDULED", 13, 19, 0, "", "Stade Louis II", 11, "Matchday 11"],
  ["LIGUE1", "NIC", "BRE", null, null, "SCHEDULED", 12, 19, 0, "", "Allianz Riviera", 11, "Matchday 11"],
  ["LIGUE1", "TFC", "RCS", null, null, "SCHEDULED", 13, 19, 0, "", "Stadium de Toulouse", 11, "Matchday 11"],
  ["LIGUE1", "AJA", "SCO", null, null, "SCHEDULED", 13, 19, 0, "", "Stade de l'Abbé-Deschamps", 11, "Matchday 11"],
  ["LIGUE1", "TRO", "LEM", null, null, "SCHEDULED", 12, 19, 0, "", "Stade de l'Aube", 11, "Matchday 11"],
  ["LIGUE1", "HAC", "LOR", null, null, "SCHEDULED", 12, 19, 0, "", "Stade Océane", 11, "Matchday 11"],

  // ═══ UEFA Champions League — MD5 fixtures (24-25 Nov, demo pairings) ═══
  ["UCL", "RMA", "BAY", null, null, "SCHEDULED", 15, 20, 0, "", "Santiago Bernabéu", 5, "League Phase · MD5", true],
  ["UCL", "BAR", "INT", null, null, "SCHEDULED", 16, 20, 0, "", "Spotify Camp Nou", 5, "League Phase · MD5"],
  ["UCL", "ARS", "PSG", null, null, "SCHEDULED", 15, 20, 0, "", "Emirates Stadium", 5, "League Phase · MD5"],
  ["UCL", "LIV", "BVB", null, null, "SCHEDULED", 16, 20, 0, "", "Anfield", 5, "League Phase · MD5"],
  ["UCL", "MCI", "JUV", null, null, "SCHEDULED", 16, 17.5, 0, "", "Etihad Stadium", 5, "League Phase · MD5"],
  ["UCL", "ATM", "NAP", null, null, "SCHEDULED", 15, 17.5, 0, "", "Riyadh Air Metropolitano", 5, "League Phase · MD5"],

  // ═══ FIFA World Cup 2026 — the REAL final ═══
  ["WC26", "ESP", "ARG", 1, 0, "FINISHED", -113, 19, 120, "FT", "New York New Jersey Stadium", 0, "Final", true],

  // ═══ SAFF Championship 2025 — group stage + upcoming semi ═══
  ["SAFF", "BAN", "MDV", 2, 1, "FINISHED", -58, 13, 90, "FT", "Bangabandhu National Stadium", 0, "Group A"],
  ["SAFF", "IND", "MDV", 3, 0, "FINISHED", -55, 13, 90, "FT", "Bangabandhu National Stadium", 0, "Group A"],
  ["SAFF", "BAN", "IND", 1, 2, "FINISHED", -52, 13, 90, "FT", "Bangabandhu National Stadium", 0, "Group A"],
  ["SAFF", "BAN", "IND", null, null, "SCHEDULED", 5, 13, 0, "", "Bangabandhu National Stadium", 0, "Semi-Final", true],

  // ═══ Federation Cup 2026-27 — QF results + semis ═══
  ["FEDCUP", "BSK", "CHA", 3, 0, "FINISHED", -10, 12.5, 90, "FT", "Bashundhara Kings Arena", 0, "Quarter-Final"],
  ["FEDCUP", "MOH", "FOR", 2, 1, "FINISHED", -9, 12.5, 90, "FT", "Shaheed Dhirendranath Datta Stadium", 0, "Quarter-Final"],
  ["FEDCUP", "ABA", "RAH", 2, 0, "FINISHED", -9, 13, 90, "FT", "Shaheed Dhirendranath Datta Stadium", 0, "Quarter-Final"],
  ["FEDCUP", "POL", "BRO", 2, 1, "FINISHED", -8, 12.5, 90, "FT", "Shaheed Barkat Stadium", 0, "Quarter-Final"],
  ["FEDCUP", "MOH", "ABA", null, null, "SCHEDULED", 6, 12.5, 0, "", "Bangabandhu National Stadium", 0, "Semi-Final", true],
  ["FEDCUP", "BSK", "POL", null, null, "SCHEDULED", 7, 12.5, 0, "", "Bangabandhu National Stadium", 0, "Semi-Final"],
];

// Live-match starting events (score lines shown before the simulator takes over)
export const LIVE_EVENTS: Array<{
  matchKey: string; // "HOME:AWAY"
  minute: number;
  type: string;
  side: "home" | "away";
  player: string;
  detail: string;
}> = [
  // Mohammedan 1-1 Abahani (Dhaka Derby)
  { matchKey: "BFL:MOH:ABA", minute: 12, type: "GOAL", side: "home", player: "Kwabena Owusu", detail: "Goal — close-range finish" },
  { matchKey: "BFL:MOH:ABA", minute: 19, type: "GOAL", side: "away", player: "Md Jibon", detail: "Goal — header from the far post" },
  { matchKey: "BFL:MOH:ABA", minute: 24, type: "YELLOW", side: "away", player: "Hasan Murad", detail: "Yellow Card — tactical foul" },
  // Police 2-1 Fortis
  { matchKey: "BFL:POL:FOR", minute: 9, type: "GOAL", side: "home", player: "Emeka Ogbugh", detail: "Goal — penalty" },
  { matchKey: "BFL:POL:FOR", minute: 22, type: "GOAL", side: "away", player: "Charles Junior", detail: "Goal — counter-attack" },
  { matchKey: "BFL:POL:FOR", minute: 33, type: "GOAL", side: "home", player: "Nazir Uddin", detail: "Goal — corner header" },
  // Rayo 0-1 Athletic
  { matchKey: "LALIGA:RAY:ATH", minute: 21, type: "GOAL", side: "away", player: "Nico Williams", detail: "Goal — cut inside, low finish" },
  // PSG 2-0 Le Havre
  { matchKey: "LIGUE1:PSG:HAC", minute: 14, type: "GOAL", side: "home", player: "Khvicha Kvaratskhelia", detail: "Goal — curled effort" },
  { matchKey: "LIGUE1:PSG:HAC", minute: 29, type: "GOAL", side: "home", player: "Ousmane Dembélé", detail: "Goal — tap-in after a run" },
];
