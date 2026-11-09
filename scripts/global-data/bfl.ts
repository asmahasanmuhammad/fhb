// ═══════════════════════════════════════════════════════════════════════════
// Bangladesh Football League 2026-27 — REAL club list & standings
// (Wikipedia / league tables, October 2026). The league was rebranded from
// "Bangladesh Premier League (BPL)" to "Bangladesh Football League (BFL)"
// ahead of the 2025-26 season. Bashundhara Kings are defending champions.
// Standings tuple: [pos, name, P, W, D, L, GF, GA]
// Team tuple: [name, shortName, initials, city, stadium, founded, color, color2]
// ═══════════════════════════════════════════════════════════════════════════

import type { TeamTuple, StandingTuple } from "./european-leagues";

export const BFL_DEF = {
  key: "BFL",
  name: "Bangladesh Football League",
  shortName: "BFL",
  type: "LEAGUE",
  country: "Bangladesh",
  season: "2026-27",
  accentColor: "#006A4E",
  description:
    "The top flight of Bangladesh football — 13 professional clubs, now in its 19th season and second under the Bangladesh Football League banner. Bashundhara Kings defend the crown against a perfect-start Mohammedan side and surprise leaders Bangladesh Police.",
  teams: [
    ["Bashundhara Kings", "Bashundhara Kings", "BSK", "Dhaka", "Bashundhara Kings Arena", 2013, "#00A651", "#003B1F"],
    ["Dhaka Abahani", "Abahani", "ABA", "Dhaka", "Shaheed Dhirendranath Datta Stadium", 1972, "#0B6E4F", "#F5C518"],
    ["Mohammedan Sporting Club", "Mohammedan SC", "MOH", "Dhaka", "Shaheed Dhirendranath Datta Stadium", 1936, "#111111", "#FFFFFF"],
    ["Bangladesh Police Football Club", "Police FC", "POL", "Dhaka", "Shaheed Barkat Stadium", 1974, "#1B4D9B", "#F5C518"],
    ["Fortis Football Club", "Fortis FC", "FOR", "Dhaka", "Bashundhara Kings Arena", 2020, "#7A1FA2", "#F2B705"],
    ["Rahmatganj Muslim Friends Society", "Rahmatganj MFS", "RAH", "Dhaka", "Munshiganj Stadium", 1933, "#C8102E", "#FFFFFF"],
    ["Brothers Union", "Brothers Union", "BRO", "Dhaka", "Gopalganj Old Stadium", 1949, "#E4572E", "#172121"],
    ["City Club", "City Club", "CIT", "Dhaka", "Shaheed Barkat Stadium", 1985, "#0E7490", "#FFFFFF"],
    ["Fakirerpool Young Men's Club", "Fakirerpool YMC", "FAK", "Dhaka", "Chandpur Stadium", 1950, "#2D6A4F", "#FFE066"],
    ["Arambagh Krira Sangha", "Arambagh KS", "ARA", "Dhaka", "Gopalganj Old Stadium", 1950, "#5F0F40", "#FB8B24"],
    ["Chattogram City", "Chattogram City", "CHA", "Chattogram", "Munshiganj Stadium", 2010, "#0B4F6C", "#F6F740"],
    ["Dhaka Wanderers", "Dhaka Wanderers", "DHW", "Dhaka", "Chandpur Stadium", 1936, "#3A6EA5", "#FFFFFF"],
    ["PWD Sports Club", "PWD SC", "PWD", "Dhaka", "Shaheed Miraj–Tapan Stadium", 1962, "#8D6A08", "#FFFFFF"],
  ] as TeamTuple[],
  standings: [
    [1, "Bangladesh Police Football Club", 5, 4, 1, 0, 14, 1],
    [2, "Mohammedan Sporting Club", 4, 4, 0, 0, 13, 0],
    [3, "Bashundhara Kings", 4, 3, 1, 0, 15, 3],
    [4, "City Club", 5, 3, 1, 1, 12, 7],
    [5, "Fortis Football Club", 3, 2, 1, 0, 15, 3],
    [6, "Dhaka Abahani", 4, 2, 1, 1, 9, 4],
    [7, "Rahmatganj Muslim Friends Society", 5, 1, 3, 1, 8, 8],
    [8, "Brothers Union", 5, 1, 2, 2, 5, 13],
    [9, "PWD Sports Club", 5, 0, 3, 2, 2, 5],
    [10, "Fakirerpool Young Men's Club", 4, 1, 0, 3, 4, 13],
    [11, "Arambagh Krira Sangha", 5, 0, 3, 2, 4, 14],
    [12, "Chattogram City", 5, 0, 0, 5, 4, 18],
    [13, "Dhaka Wanderers", 4, 0, 0, 4, 2, 18],
  ] as StandingTuple[],
};

// ── National teams ─────────────────────────────────────────────────────────
export const NATIONAL_TEAMS: TeamTuple[] = [
  ["Bangladesh National Football Team", "Bangladesh", "BAN", "Dhaka", "Bangabandhu National Stadium", 1972, "#006A4E", "#F42A41"],
  ["India National Football Team", "India", "IND", "New Delhi", "Jawaharlal Nehru Stadium", 1938, "#FF9933", "#138808"],
  ["Maldives National Football Team", "Maldives", "MDV", "Malé", "Galolhu National Stadium", 1982, "#D21034", "#007E3A"],
  ["Nepal National Football Team", "Nepal", "NEP", "Kathmandu", "Dasarath Rangasala", 1951, "#DC143C", "#003893"],
  ["Spain National Football Team", "Spain", "ESP", "Madrid", "Santiago Bernabéu", 1920, "#C60B1E", "#FFC400"],
  ["Argentina National Football Team", "Argentina", "ARG", "Buenos Aires", "Monumental", 1893, "#75AADB", "#FFFFFF"],
];

// ── Cup & international competitions ──────────────────────────────────────
export const FED_CUP_DEF = {
  key: "FEDCUP",
  name: "Federation Cup",
  shortName: "Fed Cup",
  type: "CUP",
  country: "Bangladesh",
  season: "2026-27",
  accentColor: "#B8860B",
  description:
    "Bangladesh's premier knockout cup — where giant-killings are tradition and the Dhaka derby can strike at any round. The 2026-27 semi-finals are set: Mohammedan SC vs Dhaka Abahani and Bashundhara Kings vs Bangladesh Police.",
};

export const SAFF_DEF = {
  key: "SAFF",
  name: "SAFF Championship",
  shortName: "SAFF",
  type: "INTERNATIONAL",
  country: "SAFF Region",
  season: "2025",
  accentColor: "#1B7A43",
  description:
    "South Asia's flagship international tournament. Bangladesh reached the semi-finals of the 2025 edition — now the Red and Green prepare for a blockbuster last-four clash against India.",
};

export const UCL_DEF = {
  key: "UCL",
  name: "UEFA Champions League",
  shortName: "UCL",
  type: "INTERNATIONAL",
  country: "Europe",
  season: "2026-27",
  accentColor: "#0B1560",
  description:
    "Europe's crown jewel — 36 clubs, a single league phase and nights that echo forever. Matchday 5 falls on 24-25 November 2026 with the knockout race heating up.",
};

export const WC_DEF = {
  key: "WC26",
  name: "FIFA World Cup 2026",
  shortName: "World Cup",
  type: "INTERNATIONAL",
  country: "World",
  season: "2026",
  accentColor: "#4F9D4A",
  description:
    "The first 48-team World Cup, hosted across the USA, Canada and Mexico. Spain were crowned world champions on 19 July 2026, beating defending champions Argentina 1-0 after extra time at New York New Jersey Stadium — a second world title for La Roja.",
};
