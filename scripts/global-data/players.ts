// ═══════════════════════════════════════════════════════════════════════════
// Player pool. Tuple:
// [name, teamInitials, position, nationality, jersey, birthYear, heightCm,
//  goals, assists, appearances, rating, isNationalTeam]
//
// • European stars: real players at their real clubs (2026-27).
//   EPL top-scorer numbers are real (Haaland 9, Isak 7, Barry 6 — Nov 2026).
//   Other stat lines are demo-season estimates consistent with team totals.
// • Bangladesh internationals: real names (Hamza Choudhury, Jamal Bhuyan…).
// • Remaining BFL squad members: demo players for a realistic squad depth.
// ═══════════════════════════════════════════════════════════════════════════

export type PlayerTuple = [
  string, string, string, string, number, number, number, number, number, number, number, boolean?
];

export const PLAYERS: PlayerTuple[] = [
  // ── Premier League ──
  ["Erling Haaland", "MCI", "FW", "Norway", 9, 2000, 195, 9, 3, 10, 8.1],
  ["Phil Foden", "MCI", "MF", "England", 47, 2000, 171, 3, 4, 10, 7.4],
  ["Rodri", "MCI", "MF", "Spain", 16, 1996, 191, 1, 2, 8, 7.8],
  ["Rúben Dias", "MCI", "DF", "Portugal", 3, 1997, 187, 1, 0, 10, 7.3],
  ["Bukayo Saka", "ARS", "FW", "England", 7, 2001, 178, 5, 5, 10, 8.0],
  ["Martin Ødegaard", "ARS", "MF", "Norway", 8, 1998, 178, 2, 4, 9, 7.9],
  ["Kai Havertz", "ARS", "FW", "Germany", 29, 1999, 193, 4, 2, 10, 7.6],
  ["Declan Rice", "ARS", "MF", "England", 41, 1999, 185, 1, 2, 10, 7.7],
  ["William Saliba", "ARS", "DF", "France", 2, 2001, 192, 0, 0, 10, 7.5],
  ["Kaoru Mitoma", "BHA", "FW", "Japan", 22, 1997, 178, 6, 3, 10, 7.8],
  ["Danny Welbeck", "BHA", "FW", "England", 18, 1990, 185, 4, 2, 9, 7.3],
  ["Yankuba Minteh", "BHA", "FW", "Gambia", 17, 2004, 180, 5, 3, 10, 7.5],
  ["Georginio Rutter", "BHA", "FW", "France", 24, 2002, 187, 3, 3, 10, 7.2],
  ["Mohamed Salah", "LIV", "FW", "Egypt", 11, 1992, 175, 5, 5, 10, 7.9],
  ["Alexander Isak", "LIV", "FW", "Sweden", 9, 1999, 192, 7, 2, 10, 8.0],
  ["Florian Wirtz", "LIV", "MF", "Germany", 7, 2003, 176, 3, 6, 10, 7.8],
  ["Hugo Ekitiké", "LIV", "FW", "France", 22, 2002, 189, 4, 2, 9, 7.4],
  ["Virgil van Dijk", "LIV", "DF", "Netherlands", 4, 1991, 193, 1, 0, 10, 7.5],
  ["Cole Palmer", "CHE", "FW", "England", 10, 2002, 189, 6, 4, 10, 7.8],
  ["João Pedro", "CHE", "FW", "Brazil", 9, 2001, 183, 4, 2, 10, 7.4],
  ["Enzo Fernández", "CHE", "MF", "Argentina", 8, 2001, 178, 2, 3, 10, 7.5],
  ["Thierno Barry", "EVE", "FW", "France", 19, 2002, 191, 6, 1, 10, 7.5],
  ["Dwight McNeil", "EVE", "MF", "England", 7, 1999, 178, 2, 3, 9, 7.2],
  ["Jordan Pickford", "EVE", "GK", "England", 1, 1994, 185, 0, 0, 10, 7.3],
  ["Bruno Fernandes", "MUN", "MF", "Portugal", 8, 1994, 179, 3, 4, 10, 7.5],
  ["Amad Diallo", "MUN", "FW", "Ivory Coast", 16, 2002, 173, 3, 2, 9, 7.3],
  ["Kobbie Mainoo", "MUN", "MF", "England", 37, 2005, 175, 0, 1, 8, 7.0],
  ["Dominic Solanke", "TOT", "FW", "England", 19, 1997, 187, 3, 1, 10, 7.1],
  ["James Maddison", "TOT", "MF", "England", 10, 1996, 175, 2, 3, 9, 7.2],
  ["Anthony Gordon", "NEW", "FW", "England", 11, 2001, 178, 3, 3, 10, 7.4],
  ["Sandro Tonali", "NEW", "MF", "Italy", 8, 2000, 181, 1, 2, 10, 7.5],
  ["Morgan Rogers", "AVL", "FW", "England", 27, 2002, 183, 3, 2, 10, 7.3],

  // ── LaLiga ──
  ["Kylian Mbappé", "RMA", "FW", "France", 9, 1998, 178, 10, 3, 11, 8.4],
  ["Jude Bellingham", "RMA", "MF", "England", 5, 2003, 186, 4, 4, 11, 8.0],
  ["Vinícius Júnior", "RMA", "FW", "Brazil", 7, 2000, 176, 6, 5, 11, 7.9],
  ["Thibaut Courtois", "RMA", "GK", "Belgium", 1, 1992, 199, 0, 0, 11, 7.6],
  ["Lamine Yamal", "BAR", "FW", "Spain", 19, 2007, 180, 8, 7, 11, 8.3],
  ["Raphinha", "BAR", "FW", "Brazil", 11, 1996, 176, 7, 5, 11, 8.1],
  ["Pedri", "BAR", "MF", "Spain", 8, 2002, 174, 3, 5, 10, 8.0],
  ["Marc Casadó", "BAR", "MF", "Spain", 16, 2003, 176, 0, 1, 9, 7.2],
  ["Marcus Rashford", "BAR", "FW", "England", 14, 1997, 180, 6, 2, 10, 7.7],
  ["Julián Álvarez", "ATM", "FW", "Argentina", 19, 2000, 170, 7, 3, 11, 7.9],
  ["Jan Oblak", "ATM", "GK", "Slovenia", 13, 1993, 188, 0, 0, 11, 7.5],
  ["Giuliano Simeone", "ATM", "FW", "Argentina", 22, 2002, 177, 4, 2, 10, 7.4],
  ["Antony", "BET", "FW", "Brazil", 7, 2000, 174, 5, 4, 11, 7.6],
  ["Isco", "BET", "MF", "Spain", 10, 1992, 176, 3, 3, 10, 7.5],
  ["Mikel Oyarzabal", "RSO", "FW", "Spain", 10, 1997, 181, 5, 3, 11, 7.7],
  ["Takefusa Kubo", "RSO", "FW", "Japan", 14, 2001, 173, 4, 4, 11, 7.6],
  ["Luka Sučić", "SEV", "MF", "Croatia", 8, 2002, 178, 2, 2, 10, 7.2],
  ["Nico Williams", "ATH", "FW", "Spain", 10, 2002, 181, 4, 3, 9, 7.5],

  // ── Serie A ──
  ["Lautaro Martínez", "INT", "FW", "Argentina", 10, 1997, 174, 8, 2, 10, 8.0],
  ["Marcus Thuram", "INT", "FW", "France", 9, 1997, 192, 5, 3, 10, 7.6],
  ["Nicolò Barella", "INT", "MF", "Italy", 23, 1997, 172, 3, 4, 10, 7.8],
  ["Alessandro Bastoni", "INT", "DF", "Italy", 95, 1999, 190, 0, 1, 10, 7.5],
  ["Mattia Zaccagni", "LAZ", "FW", "Italy", 18, 1995, 177, 6, 3, 10, 7.8],
  ["Valentín Castellanos", "LAZ", "FW", "Argentina", 9, 1998, 181, 5, 2, 10, 7.5],
  ["Alessio Romagnoli", "LAZ", "DF", "Italy", 13, 1995, 188, 1, 0, 10, 7.4],
  ["Ivan Provedel", "LAZ", "GK", "Italy", 94, 1994, 191, 0, 0, 10, 7.6],
  ["Paulo Dybala", "ROM", "FW", "Argentina", 21, 1993, 177, 6, 4, 10, 7.9],
  ["Artem Dovbyk", "ROM", "FW", "Ukraine", 11, 1997, 189, 5, 1, 10, 7.4],
  ["Mile Svilar", "ROM", "GK", "Serbia", 99, 1999, 190, 0, 0, 10, 7.7],
  ["Rafael Leão", "MIL", "FW", "Portugal", 10, 1999, 188, 5, 4, 10, 7.7],
  ["Christian Pulisic", "MIL", "FW", "USA", 11, 1998, 178, 4, 3, 10, 7.6],
  ["Mike Maignan", "MIL", "GK", "France", 16, 1995, 191, 0, 0, 10, 7.5],
  ["Dušan Vlahović", "JUV", "FW", "Serbia", 9, 2000, 190, 5, 1, 10, 7.4],
  ["Kenan Yıldız", "JUV", "FW", "Türkiye", 10, 2005, 185, 4, 3, 10, 7.5],
  ["Scott McTominay", "NAP", "MF", "Scotland", 8, 1996, 193, 4, 2, 10, 7.6],
  ["Romelu Lukaku", "NAP", "FW", "Belgium", 11, 1993, 191, 5, 3, 10, 7.5],
  ["Nico Paz", "COM", "MF", "Argentina", 10, 2004, 180, 4, 4, 10, 7.7],
  ["Patrick Cutrone", "COM", "FW", "Italy", 9, 1998, 182, 5, 2, 10, 7.3],
  ["Mateo Retegui", "ATA", "FW", "Italy", 19, 1999, 187, 6, 1, 10, 7.5],

  // ── Bundesliga ──
  ["Harry Kane", "BAY", "FW", "England", 9, 1993, 188, 10, 4, 8, 8.6],
  ["Michael Olise", "BAY", "FW", "France", 17, 2001, 183, 5, 5, 8, 8.0],
  ["Jamal Musiala", "BAY", "MF", "Germany", 42, 2003, 184, 4, 3, 7, 7.9],
  ["Joshua Kimmich", "BAY", "MF", "Germany", 6, 1995, 177, 1, 5, 8, 7.8],
  ["Manuel Neuer", "BAY", "GK", "Germany", 1, 1986, 193, 0, 0, 8, 7.4],
  ["Serhou Guirassy", "BVB", "FW", "Guinea", 9, 1996, 187, 6, 1, 8, 7.8],
  ["Karim Adeyemi", "BVB", "FW", "Germany", 27, 2002, 180, 3, 3, 8, 7.4],
  ["Jobe Bellingham", "BVB", "MF", "England", 7, 2005, 187, 2, 2, 8, 7.3],
  ["Gregor Kobel", "BVB", "GK", "Switzerland", 1, 1997, 195, 0, 0, 8, 7.6],
  ["Rocco Reitz", "B04", "MF", "Germany", 8, 2002, 180, 1, 2, 8, 7.2],
  ["Ernest Poku", "B04", "FW", "Netherlands", 26, 2005, 178, 3, 2, 8, 7.3],
  ["Vincenzo Grifo", "SCF", "MF", "Italy", 10, 1993, 180, 3, 4, 8, 7.5],
  ["Ritsu Dōan", "SCF", "FW", "Japan", 8, 1998, 172, 4, 3, 8, 7.6],
  ["Romulo", "HSV", "FW", "Brazil", 11, 2004, 182, 4, 2, 8, 7.6],
  ["Jean-Mattéo Bahoya", "RBL", "FW", "France", 17, 2005, 180, 3, 2, 8, 7.3],
  ["Ermedin Demirović", "SGE", "FW", "Bosnia", 9, 1998, 180, 4, 2, 8, 7.3],

  // ── Ligue 1 ──
  ["Khvicha Kvaratskhelia", "PSG", "FW", "Georgia", 7, 2001, 183, 6, 5, 9, 8.1],
  ["Ousmane Dembélé", "PSG", "FW", "France", 10, 1997, 178, 8, 4, 9, 8.3],
  ["Vitinha", "PSG", "MF", "Portugal", 17, 2000, 172, 2, 3, 9, 7.9],
  ["Achraf Hakimi", "PSG", "DF", "Morocco", 2, 1998, 181, 2, 3, 9, 7.8],
  ["João Neves", "PSG", "MF", "Portugal", 87, 2004, 174, 1, 2, 9, 7.7],
  ["Mason Greenwood", "OM", "FW", "England", 10, 2001, 181, 7, 2, 9, 7.8],
  ["Pierre-Emerick Aubameyang", "OM", "FW", "Gabon", 9, 1989, 187, 5, 3, 9, 7.4],
  ["Corentin Tolisso", "LYO", "MF", "France", 8, 1994, 181, 3, 3, 9, 7.5],
  ["Malick Fofana", "LYO", "FW", "Belgium", 21, 2005, 175, 4, 2, 9, 7.5],
  ["Emanuel Emegha", "LIL", "FW", "Netherlands", 9, 2003, 188, 5, 2, 9, 7.6],
  ["Hákon Haraldsson", "LIL", "MF", "Iceland", 8, 2003, 186, 3, 3, 9, 7.4],
  ["Ilan Kebbal", "PFC", "MF", "France", 10, 1998, 173, 3, 4, 9, 7.5],
  ["Pierre Lees-Melou", "PFC", "MF", "France", 8, 1993, 187, 2, 2, 9, 7.3],
  ["Adrien Truffert", "REN", "DF", "France", 3, 2001, 178, 1, 3, 9, 7.3],
  ["Florian Sotoca", "RCL", "FW", "France", 9, 1990, 181, 5, 3, 9, 7.4],

  // ── Bangladesh internationals (real) ──
  ["Hamza Choudhury", "BAN", "MF", "Bangladesh", 16, 1997, 178, 2, 3, 8, 7.6, true],
  ["Jamal Bhuyan", "BAN", "MF", "Bangladesh", 10, 1990, 178, 3, 4, 8, 7.5, true],
  ["Rahmat Mia", "BAN", "DF", "Bangladesh", 3, 1999, 172, 0, 1, 8, 7.2, true],
  ["Topu Barman", "BAN", "DF", "Bangladesh", 5, 1993, 180, 1, 0, 8, 7.2, true],
  ["Tariq Raihan Kazi", "BAN", "DF", "Bangladesh", 4, 2000, 184, 1, 0, 8, 7.3, true],
  ["Mahbubur Rahman Sufil", "BAN", "FW", "Bangladesh", 11, 1999, 175, 2, 1, 7, 7.1, true],
  ["Saad Uddin", "BAN", "FW", "Bangladesh", 7, 1998, 178, 2, 2, 7, 7.2, true],
  ["Ashraful Islam Rana", "BAN", "GK", "Bangladesh", 1, 1994, 183, 0, 0, 8, 7.3, true],
  ["Sheikh Morsalin", "ABA", "MF", "Bangladesh", 21, 2004, 176, 3, 3, 8, 7.4, true],
  ["Md Jibon", "ABA", "FW", "Bangladesh", 9, 2000, 179, 5, 2, 8, 7.5, true],

  // ── BFL club squads (demo depth around real internationals) ──
  // Bashundhara Kings
  ["Daniel Ogbu", "BSK", "FW", "Nigeria", 9, 1998, 186, 6, 2, 8, 7.6],
  ["Sohel Rana", "BSK", "MF", "Bangladesh", 8, 1996, 175, 2, 4, 8, 7.4],
  ["Mehedi Hasan Royal", "BSK", "DF", "Bangladesh", 5, 1997, 180, 1, 1, 8, 7.3],
  ["Anisur Rahman Zico", "BSK", "GK", "Bangladesh", 1, 1997, 185, 0, 0, 8, 7.5],
  ["John Okoli", "BSK", "FW", "Ghana", 11, 1999, 183, 5, 3, 8, 7.5],
  // Mohammedan SC
  ["Kwabena Owusu", "MOH", "FW", "Ghana", 9, 1997, 182, 6, 1, 8, 7.6],
  ["Salah Uddin Sohel", "MOH", "MF", "Bangladesh", 8, 1995, 174, 2, 3, 8, 7.3],
  ["Rahul Das", "MOH", "DF", "Bangladesh", 4, 1998, 179, 0, 1, 8, 7.1],
  ["Sabbir Ahmed", "MOH", "GK", "Bangladesh", 1, 1996, 184, 0, 0, 8, 7.4],
  ["Faisal Mahmud", "MOH", "MF", "Bangladesh", 10, 1994, 176, 1, 2, 7, 7.0],
  // Dhaka Abahani
  ["Milos Stojanović", "ABA", "FW", "Serbia", 9, 1997, 188, 5, 2, 8, 7.5],
  ["Rakib Hossain", "ABA", "MF", "Bangladesh", 7, 1999, 173, 2, 4, 8, 7.4],
  ["Hasan Murad", "ABA", "DF", "Bangladesh", 5, 1996, 181, 0, 0, 8, 7.1],
  ["Naeem Ahmed", "ABA", "GK", "Bangladesh", 1, 1995, 186, 0, 0, 8, 7.2],
  // Bangladesh Police
  ["Emeka Ogbugh", "POL", "FW", "Nigeria", 9, 1996, 180, 6, 2, 8, 7.7],
  ["Nazir Uddin", "POL", "MF", "Bangladesh", 8, 1997, 175, 3, 3, 8, 7.4],
  ["Shahinur Mondal", "POL", "DF", "Bangladesh", 4, 1994, 178, 1, 0, 8, 7.2],
  ["Rana Ghosh", "POL", "GK", "Bangladesh", 1, 1997, 183, 0, 0, 8, 7.5],
  // Fortis FC
  ["Charles Junior", "FOR", "FW", "Cameroon", 9, 1998, 184, 5, 3, 8, 7.4],
  ["Tanvir Hasan", "FOR", "MF", "Bangladesh", 8, 2000, 174, 2, 2, 7, 7.2],
  ["Zahid Hossain", "FOR", "DF", "Bangladesh", 5, 1999, 179, 0, 1, 7, 7.0],
  // Rahmatganj MFS
  ["Michael Oladayo", "RAH", "FW", "Nigeria", 9, 1997, 181, 4, 1, 8, 7.3],
  ["Shakil Topu", "RAH", "MF", "Bangladesh", 7, 1998, 172, 1, 2, 8, 7.1],
  // Brothers Union
  ["Samuel Adeniyi", "BRO", "FW", "Nigeria", 9, 1996, 183, 3, 1, 8, 7.1],
  ["Rezaul Karim", "BRO", "DF", "Bangladesh", 5, 1995, 177, 0, 0, 8, 6.9],
  // City Club
  ["Peter Tahmindjis", "CIT", "FW", "Australia", 9, 1998, 185, 5, 2, 8, 7.3],
  ["Jahid Hasan", "CIT", "MF", "Bangladesh", 8, 1997, 174, 2, 1, 8, 7.1],
  ["Wahid Akram", "CIT", "GK", "Bangladesh", 1, 1998, 184, 0, 0, 8, 7.2],
  // Fakirerpool YMC
  ["Benjamin Osei", "FAK", "FW", "Ghana", 9, 1999, 180, 3, 0, 8, 7.0],
  ["Mizanur Rahman", "FAK", "MF", "Bangladesh", 7, 1996, 173, 1, 1, 7, 6.8],
  // Arambagh KS
  ["Ibrahim Kargbo Jr.", "ARA", "FW", "Sierra Leone", 9, 2000, 179, 2, 1, 8, 7.0],
  ["Rony Chowdhury", "ARA", "DF", "Bangladesh", 5, 1997, 176, 0, 0, 8, 6.8],
  // Chattogram City
  ["Abdul Malek", "CHA", "FW", "Bangladesh", 9, 1998, 177, 2, 0, 7, 6.9],
  ["Sajid Hossain", "CHA", "GK", "Bangladesh", 1, 1999, 182, 0, 0, 8, 6.9],
  // Dhaka Wanderers
  ["Tawhidul Islam", "DHW", "FW", "Bangladesh", 9, 1999, 175, 1, 1, 7, 6.8],
  ["Kamrul Islam", "DHW", "MF", "Bangladesh", 8, 1997, 172, 1, 0, 7, 6.7],
  // PWD SC
  ["Al Amin Hossain", "PWD", "DF", "Bangladesh", 5, 1996, 175, 0, 0, 8, 6.8],
  ["Sumon Barua", "PWD", "GK", "Bangladesh", 1, 1997, 180, 0, 0, 8, 6.9],
];

// India & Maldives squads (demo depth for SAFF coverage)
export const SAFF_PLAYERS: PlayerTuple[] = [
  ["Sunil Chhetri", "IND", "FW", "India", 11, 1984, 170, 2, 1, 4, 7.4, true],
  ["Sandesh Jhingan", "IND", "DF", "India", 5, 1993, 187, 0, 0, 4, 7.2, true],
  ["Anirudh Thapa", "IND", "MF", "India", 8, 1998, 173, 1, 2, 4, 7.3, true],
  ["Ali Ashfaq", "MDV", "FW", "Maldives", 10, 1985, 172, 1, 0, 3, 7.2, true],
  ["Hamza Mohamed", "MDV", "MF", "Maldives", 8, 1996, 175, 0, 1, 3, 7.0, true],
];

// Spain & Argentina — World Cup 2026 finalists
export const WC_PLAYERS: PlayerTuple[] = [
  ["Lamine Yamal", "ESP", "FW", "Spain", 19, 2007, 180, 4, 3, 7, 8.2, true],
  ["Pedri", "ESP", "MF", "Spain", 8, 2002, 174, 1, 2, 7, 7.9, true],
  ["Álvaro Morata", "ESP", "FW", "Spain", 7, 1992, 189, 2, 1, 6, 7.3, true],
  ["Unai Simón", "ESP", "GK", "Spain", 23, 1997, 190, 0, 0, 7, 7.6, true],
  ["Rodri", "ESP", "MF", "Spain", 16, 1996, 191, 1, 1, 6, 7.8, true],
  ["Nico Williams", "ESP", "FW", "Spain", 17, 2002, 181, 2, 2, 7, 7.7, true],
  ["Lionel Messi", "ARG", "FW", "Argentina", 10, 1987, 170, 3, 2, 7, 8.0, true],
  ["Julián Álvarez", "ARG", "FW", "Argentina", 9, 2000, 170, 3, 1, 7, 7.8, true],
  ["Enzo Fernández", "ARG", "MF", "Argentina", 24, 2001, 178, 1, 2, 7, 7.6, true],
  ["Emiliano Martínez", "ARG", "GK", "Argentina", 23, 1992, 195, 0, 0, 7, 7.7, true],
];
