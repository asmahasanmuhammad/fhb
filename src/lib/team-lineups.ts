import type { TeamRef, Player } from "@/lib/types";
import type { PitchPlayerNode } from "@/components/football/tactical-pitch";

export interface PitchPosition {
  x: number; // 0 to 100%
  y: number; // 0 to 100%
  role: string;
}

/**
 * Dynamic Formation Coordinates Calculator
 * Computes exact (x, y) pitch positions based on formation numbers (e.g. "4-3-3", "4-2-3-1", "3-5-2", "4-4-2").
 */
export function getFormationPositions(
  formation: string,
  mode: "single" | "home_half" | "away_half"
): PitchPosition[] {
  // Parse formation lines e.g. "4-2-3-1" => [4, 2, 3, 1]
  const clean = formation.replace(/[^0-9-]/g, "");
  let lines = clean.split("-").map((n) => parseInt(n, 10)).filter((n) => !isNaN(n) && n > 0);
  if (lines.length === 0 || lines.reduce((a, b) => a + b, 0) !== 10) {
    // Default 4-3-3 if malformed
    lines = [4, 3, 3];
  }

  const positions: PitchPosition[] = [];

  // Helper for distributing X coordinates across pitch width
  const getXSpread = (count: number): number[] => {
    if (count === 1) return [50];
    if (count === 2) return [34, 66];
    if (count === 3) return [22, 50, 78];
    if (count === 4) return [16, 38, 62, 84];
    if (count === 5) return [13, 31, 50, 69, 87];
    if (count === 6) return [12, 27, 42, 58, 73, 88];
    // Generic fallback
    const step = 80 / (count + 1);
    return Array.from({ length: count }, (_, i) => Math.round(10 + (i + 1) * step));
  };

  // Roles map per line
  const getRolesForLine = (lineIdx: number, totalLines: number, count: number): string[] => {
    if (lineIdx === 0) {
      // Defense
      if (count === 3) return ["LCB", "CB", "RCB"];
      if (count === 4) return ["LB", "CB", "CB", "RB"];
      if (count === 5) return ["LWB", "LCB", "CB", "RCB", "RWB"];
      return Array(count).fill("DF");
    }
    if (lineIdx === totalLines - 1) {
      // Attack
      if (count === 1) return ["ST"];
      if (count === 2) return ["LS", "RS"];
      if (count === 3) return ["LW", "ST", "RW"];
      return Array(count).fill("FW");
    }
    // Midfield lines
    if (totalLines === 4) {
      // e.g. 4-2-3-1: line 1 is CDM (2), line 2 is CAM/W (3)
      if (lineIdx === 1) return count === 2 ? ["LDM", "RDM"] : Array(count).fill("CDM");
      if (lineIdx === 2) return count === 3 ? ["LAM", "CAM", "RAM"] : Array(count).fill("CAM");
    }
    if (count === 3) return ["LCM", "CM", "RCM"];
    if (count === 4) return ["LM", "LCM", "RCM", "RM"];
    if (count === 5) return ["LWB", "LCM", "CM", "RCM", "RWB"];
    return Array(count).fill("MF");
  };

  if (mode === "single") {
    // ── Single Team View (Team defends bottom goal at y=88, attacks upwards to y=20)
    // GK
    positions.push({ x: 50, y: 88, role: "GK" });

    const yMin = 20; // Strikers line
    const yMax = 71; // Defense line
    const k = lines.length;

    lines.forEach((count, lineIdx) => {
      // lineIdx 0 = defense, lineIdx k-1 = forward
      const y = k === 1 ? 50 : Math.round(yMax - lineIdx * ((yMax - yMin) / (k - 1)));
      const xs = getXSpread(count);
      const roles = getRolesForLine(lineIdx, k, count);
      xs.forEach((x, pIdx) => {
        positions.push({ x, y, role: roles[pIdx] || "MF" });
      });
    });
  } else if (mode === "home_half") {
    // ── 22-Man H2H: Home Team (defending bottom goal, y between 92% and 53%)
    // GK
    positions.push({ x: 50, y: 92, role: "GK" });

    const yMin = 53; // Strikers near half-way line
    const yMax = 79; // Defense
    const k = lines.length;

    lines.forEach((count, lineIdx) => {
      const y = k === 1 ? 66 : Math.round(yMax - lineIdx * ((yMax - yMin) / (k - 1)));
      const xs = getXSpread(count);
      const roles = getRolesForLine(lineIdx, k, count);
      xs.forEach((x, pIdx) => {
        positions.push({ x, y, role: roles[pIdx] || "MF" });
      });
    });
  } else {
    // ── 22-Man H2H: Away Team (defending top goal, y between 8% and 47%)
    // GK
    positions.push({ x: 50, y: 8, role: "GK" });

    const yMin = 21; // Defense near top goal
    const yMax = 47; // Strikers near half-way line
    const k = lines.length;

    lines.forEach((count, lineIdx) => {
      // lineIdx 0 = defense (closest to yMin=21), lineIdx k-1 = forward (closest to yMax=47)
      const y = k === 1 ? 34 : Math.round(yMin + lineIdx * ((yMax - yMin) / (k - 1)));
      const xs = getXSpread(count);
      const roles = getRolesForLine(lineIdx, k, count);
      xs.forEach((x, pIdx) => {
        positions.push({ x, y, role: roles[pIdx] || "MF" });
      });
    });
  }

  return positions;
}

interface FullTeamLineup {
  formation: string;
  manager?: string;
  players: Array<{
    name: string;
    number: number;
    position: "GK" | "DF" | "MF" | "FW";
    role: string;
    isCaptain?: boolean;
    rating: number;
    photoUrl?: string;
    goals?: number;
    yellowCard?: boolean;
  }>;
  subs: Array<{
    name: string;
    number: number;
    position: "GK" | "DF" | "MF" | "FW";
    role: string;
    rating: number;
    photoUrl?: string;
  }>;
}

/**
 * Authentic Squads with real photos, ratings, captaincies, and substitutes.
 */
export const TEAM_LINEUPS: Record<string, FullTeamLineup> = {
  // Paris Saint-Germain
  psg: {
    formation: "4-3-3",
    manager: "Luis Enrique",
    players: [
      { name: "Donnarumma", number: 1, position: "GK", role: "GK", rating: 8.4, photoUrl: "/players/donnarumma.jpg" },
      { name: "Nuno Mendes", number: 25, position: "DF", role: "LB", rating: 8.1, photoUrl: "/players/nuno_mendes.jpg" },
      { name: "W. Pacho", number: 51, position: "DF", role: "CB", rating: 7.9, photoUrl: "/players/pacho.jpg" },
      { name: "Marquinhos", number: 5, position: "DF", role: "CB", isCaptain: true, rating: 8.5, photoUrl: "/players/marquinhos.jpg" },
      { name: "A. Hakimi", number: 2, position: "DF", role: "RB", rating: 8.8, photoUrl: "/players/hakimi.jpg", goals: 1 },
      { name: "Vitinha", number: 17, position: "MF", role: "LCM", rating: 8.6, photoUrl: "/players/vitinha.jpg" },
      { name: "Zaïre-Emery", number: 33, position: "MF", role: "CDM", rating: 8.0, photoUrl: "/players/zaire_emery.jpg" },
      { name: "Fabián Ruiz", number: 8, position: "MF", role: "RCM", rating: 7.9, photoUrl: "/players/fabian_ruiz.jpg" },
      { name: "B. Barcola", number: 29, position: "FW", role: "LW", rating: 8.7, photoUrl: "/players/barcola.jpg", goals: 1 },
      { name: "Gonçalo Ramos", number: 9, position: "FW", role: "ST", rating: 8.2, photoUrl: "/players/goncalo_ramos.jpg" },
      { name: "O. Dembélé", number: 10, position: "FW", role: "RW", rating: 8.9, photoUrl: "/players/dembele.jpg" },
    ],
    subs: [
      { name: "Safonov", number: 39, position: "GK", role: "GK", rating: 7.0 },
      { name: "Beraldo", number: 35, position: "DF", role: "CB", rating: 7.3 },
      { name: "Kang-in Lee", number: 19, position: "MF", role: "CAM", rating: 7.7 },
      { name: "Mayulu", number: 24, position: "MF", role: "CM", rating: 7.1 },
      { name: "Kolo Muani", number: 23, position: "FW", role: "ST", rating: 7.5 },
    ],
  },

  // Le Havre AC
  lehavre: {
    formation: "4-2-3-1",
    manager: "Didier Digard",
    players: [
      { name: "A. Desmas", number: 30, position: "GK", role: "GK", rating: 7.3, photoUrl: "/players/desmas.jpg" },
      { name: "C. Operi", number: 27, position: "DF", role: "LB", rating: 7.1, photoUrl: "/players/operi.jpg" },
      { name: "G. Lloris", number: 4, position: "DF", role: "CB", rating: 7.5, photoUrl: "/players/lloris.jpg" },
      { name: "E. Youté", number: 6, position: "DF", role: "CB", isCaptain: true, rating: 7.4, photoUrl: "/players/youte.jpg", yellowCard: true },
      { name: "L. Nego", number: 7, position: "DF", role: "RB", rating: 7.2, photoUrl: "/players/nego.jpg" },
      { name: "A. Touré", number: 94, position: "MF", role: "LDM", rating: 7.6, photoUrl: "/players/toure.jpg" },
      { name: "O. Targhalline", number: 5, position: "MF", role: "RDM", rating: 7.3, photoUrl: "/players/targhalline.jpg" },
      { name: "Y. Kechta", number: 8, position: "MF", role: "CAM", rating: 7.8, photoUrl: "/players/kechta.jpg" },
      { name: "J. Casimir", number: 23, position: "FW", role: "LW", rating: 7.4, photoUrl: "/players/casimir.jpg" },
      { name: "M. Bayo", number: 9, position: "FW", role: "ST", rating: 7.7, photoUrl: "/players/bayo.jpg" },
      { name: "E. Sabbi", number: 11, position: "FW", role: "RW", rating: 7.5, photoUrl: "/players/sabbi.jpg" },
    ],
    subs: [
      { name: "Gorgelin", number: 1, position: "GK", role: "GK", rating: 6.8 },
      { name: "Salmier", number: 22, position: "DF", role: "CB", rating: 7.0 },
      { name: "Kuzyaev", number: 14, position: "MF", role: "CM", rating: 7.4 },
      { name: "Joujou", number: 70, position: "FW", role: "LW", rating: 7.2 },
      { name: "Soumaré", number: 45, position: "FW", role: "ST", rating: 7.1 },
    ],
  },

  // Real Madrid
  realmadrid: {
    formation: "4-3-3",
    manager: "Carlo Ancelotti",
    players: [
      { name: "T. Courtois", number: 1, position: "GK", role: "GK", rating: 8.8, photoUrl: "/players/courtois.jpg" },
      { name: "F. Mendy", number: 23, position: "DF", role: "LB", rating: 7.9, photoUrl: "/players/mendy.jpg" },
      { name: "A. Rüdiger", number: 22, position: "DF", role: "CB", rating: 8.6, photoUrl: "/players/rudiger.jpg" },
      { name: "É. Militão", number: 3, position: "DF", role: "CB", rating: 8.4, photoUrl: "/players/militao.jpg" },
      { name: "D. Carvajal", number: 2, position: "DF", role: "RB", isCaptain: true, rating: 8.7, photoUrl: "/players/carvajal.jpg" },
      { name: "J. Bellingham", number: 5, position: "MF", role: "LCM", rating: 9.1, photoUrl: "/players/jude_bellingham.jpg", goals: 1 },
      { name: "A. Tchouaméni", number: 14, position: "MF", role: "CDM", rating: 8.3, photoUrl: "/players/tchouameni.jpg" },
      { name: "F. Valverde", number: 8, position: "MF", role: "RCM", rating: 8.9, photoUrl: "/players/valverde.jpg" },
      { name: "Vinícius Jr", number: 7, position: "FW", role: "LW", rating: 9.3, photoUrl: "/players/vinicius_júnior.jpg" },
      { name: "K. Mbappé", number: 9, position: "FW", role: "ST", rating: 9.4, photoUrl: "/players/kylian_mbappe.jpg", goals: 2 },
      { name: "Rodrygo", number: 11, position: "FW", role: "RW", rating: 8.6, photoUrl: "/players/rodrygo.jpg" },
    ],
    subs: [
      { name: "Lunin", number: 13, position: "GK", role: "GK", rating: 7.4 },
      { name: "Lucas Vázquez", number: 17, position: "DF", role: "RB", rating: 7.6 },
      { name: "Camavinga", number: 6, position: "MF", role: "CM", rating: 8.3 },
      { name: "Modrić", number: 10, position: "MF", role: "CM", rating: 8.1 },
      { name: "Brahim Díaz", number: 21, position: "FW", role: "RW", rating: 8.0 },
      { name: "Endrick", number: 16, position: "FW", role: "ST", rating: 7.8 },
    ],
  },

  // FC Barcelona
  barcelona: {
    formation: "4-2-3-1",
    manager: "Hansi Flick",
    players: [
      { name: "Ter Stegen", number: 1, position: "GK", role: "GK", isCaptain: true, rating: 8.5, photoUrl: "/players/ter_stegen.jpg" },
      { name: "A. Balde", number: 3, position: "DF", role: "LB", rating: 8.0, photoUrl: "/players/balde.jpg" },
      { name: "P. Cubarsí", number: 2, position: "DF", role: "CB", rating: 8.3, photoUrl: "/players/cubarsi.jpg" },
      { name: "R. Araújo", number: 4, position: "DF", role: "CB", rating: 8.4, photoUrl: "/players/araujo.jpg" },
      { name: "J. Koundé", number: 23, position: "DF", role: "RB", rating: 8.5, photoUrl: "/players/kounde.jpg" },
      { name: "Pedri", number: 8, position: "MF", role: "LDM", rating: 8.9, photoUrl: "/players/pedri.jpg" },
      { name: "M. Casadó", number: 17, position: "MF", role: "RDM", rating: 8.1, photoUrl: "/players/casado.jpg" },
      { name: "Dani Olmo", number: 20, position: "MF", role: "CAM", rating: 8.8, photoUrl: "/players/dani_olmo.jpg" },
      { name: "Raphinha", number: 11, position: "FW", role: "LW", rating: 9.2, photoUrl: "/players/raphinha.jpg", goals: 1 },
      { name: "R. Lewandowski", number: 9, position: "FW", role: "ST", rating: 8.9, photoUrl: "/players/lewandowski.jpg" },
      { name: "Lamine Yamal", number: 19, position: "FW", role: "RW", rating: 9.4, photoUrl: "/players/lamine_yamal.jpg" },
    ],
    subs: [
      { name: "Iñaki Peña", number: 13, position: "GK", role: "GK", rating: 7.1 },
      { name: "Eric García", number: 24, position: "DF", role: "CB", rating: 7.3 },
      { name: "Frenkie de Jong", number: 21, position: "MF", role: "CM", rating: 8.4 },
      { name: "Gavi", number: 6, position: "MF", role: "CM", rating: 8.2 },
      { name: "Ferran Torres", number: 7, position: "FW", role: "ST", rating: 7.6 },
      { name: "Ansu Fati", number: 10, position: "FW", role: "LW", rating: 7.4 },
    ],
  },

  // Manchester City
  mancity: {
    formation: "4-1-4-1",
    manager: "Pep Guardiola",
    players: [
      { name: "Ederson", number: 31, position: "GK", role: "GK", rating: 8.4, photoUrl: "/players/ederson.jpg" },
      { name: "J. Gvardiol", number: 24, position: "DF", role: "LB", rating: 8.6, photoUrl: "/players/gvardiol.jpg" },
      { name: "Rúben Dias", number: 3, position: "DF", role: "CB", rating: 8.7, photoUrl: "/players/ruben_dias.jpg" },
      { name: "M. Akanji", number: 25, position: "DF", role: "CB", rating: 8.2 },
      { name: "K. Walker", number: 2, position: "DF", role: "RB", isCaptain: true, rating: 8.1 },
      { name: "Rodri", number: 16, position: "MF", role: "CDM", rating: 9.2, photoUrl: "/players/rodri.jpg" },
      { name: "J. Grealish", number: 10, position: "MF", role: "LM", rating: 8.2 },
      { name: "K. De Bruyne", number: 17, position: "MF", role: "LCM", rating: 9.1, photoUrl: "/players/de_bruyne.jpg" },
      { name: "Bernardo Silva", number: 20, position: "MF", role: "RCM", rating: 8.7, photoUrl: "/players/bernardo_silva.jpg" },
      { name: "Phil Foden", number: 47, position: "MF", role: "RM", rating: 8.8, photoUrl: "/players/phil_foden.jpg" },
      { name: "E. Haaland", number: 9, position: "FW", role: "ST", rating: 9.5, photoUrl: "/players/erling_haaland.jpg", goals: 2 },
    ],
    subs: [
      { name: "Ortega", number: 18, position: "GK", role: "GK", rating: 7.3 },
      { name: "Stones", number: 5, position: "DF", role: "CB", rating: 8.1 },
      { name: "Kovačić", number: 8, position: "MF", role: "CM", rating: 8.0 },
      { name: "Doku", number: 11, position: "FW", role: "LW", rating: 8.3 },
      { name: "Savinho", number: 26, position: "FW", role: "RW", rating: 7.9 },
    ],
  },

  // Arsenal
  arsenal: {
    formation: "4-3-3",
    manager: "Mikel Arteta",
    players: [
      { name: "David Raya", number: 22, position: "GK", role: "GK", rating: 8.5 },
      { name: "J. Timber", number: 12, position: "DF", role: "LB", rating: 8.1 },
      { name: "Gabriel M.", number: 6, position: "DF", role: "CB", rating: 8.6 },
      { name: "W. Saliba", number: 2, position: "DF", role: "CB", rating: 8.9, photoUrl: "/players/saliba.jpg" },
      { name: "Ben White", number: 4, position: "DF", role: "RB", rating: 8.3 },
      { name: "Declan Rice", number: 41, position: "MF", role: "LCM", rating: 8.8, photoUrl: "/players/rice.jpg" },
      { name: "Thomas Partey", number: 5, position: "MF", role: "CDM", rating: 8.1 },
      { name: "M. Ødegaard", number: 8, position: "MF", role: "RCM", isCaptain: true, rating: 9.0, photoUrl: "/players/odegaard.jpg" },
      { name: "G. Martinelli", number: 11, position: "FW", role: "LW", rating: 8.4 },
      { name: "Kai Havertz", number: 29, position: "FW", role: "ST", rating: 8.5, photoUrl: "/players/havertz.jpg" },
      { name: "Bukayo Saka", number: 7, position: "FW", role: "RW", rating: 9.1, photoUrl: "/players/bukayo_saka.jpg" },
    ],
    subs: [
      { name: "Neto", number: 32, position: "GK", role: "GK", rating: 7.0 },
      { name: "Calafiori", number: 33, position: "DF", role: "LB", rating: 7.8 },
      { name: "Merino", number: 23, position: "MF", role: "CM", rating: 7.9 },
      { name: "Trossard", number: 19, position: "FW", role: "LW", rating: 8.2 },
      { name: "Jesus", number: 9, position: "FW", role: "ST", rating: 7.7 },
    ],
  },

  // Bashundhara Kings
  bashundhara: {
    formation: "4-3-3",
    manager: "Valeriu Tița",
    players: [
      { name: "Anisur Rahman Zico", number: 1, position: "GK", role: "GK", rating: 8.3, photoUrl: "/players/zico.jpg" },
      { name: "Rahmat Mia", number: 3, position: "DF", role: "LB", rating: 7.6, photoUrl: "/players/rahmat_mia.jpg" },
      { name: "Tariq Kazi", number: 4, position: "DF", role: "CB", rating: 8.2, photoUrl: "/players/tariq_kazi.jpg" },
      { name: "Topu Barman", number: 2, position: "DF", role: "CB", isCaptain: true, rating: 8.4, photoUrl: "/players/topu_barman.jpg" },
      { name: "Bishwanath Ghosh", number: 12, position: "DF", role: "RB", rating: 7.9, photoUrl: "/players/bishwanath_ghosh.jpg" },
      { name: "Sohel Rana", number: 8, position: "MF", role: "LCM", rating: 8.0, photoUrl: "/players/sohel_rana.jpg" },
      { name: "Masuk Mia Zoni", number: 6, position: "MF", role: "CDM", rating: 7.7 },
      { name: "Miguel Figueira", number: 10, position: "MF", role: "RCM", rating: 8.9 },
      { name: "Robinho", number: 7, position: "FW", role: "LW", rating: 9.1, photoUrl: "/players/robinho.jpg" },
      { name: "Dorielton Gomes", number: 9, position: "FW", role: "ST", rating: 8.7, photoUrl: "/players/dorielton_gomes.jpg", goals: 2 },
      { name: "Rakib Hossain", number: 11, position: "FW", role: "RW", rating: 8.5, photoUrl: "/players/rakib_hossain.jpg" },
    ],
    subs: [
      { name: "Saiful Islam", number: 22, position: "GK", role: "GK", rating: 7.1 },
      { name: "Mehedi Hasan Royal", number: 14, position: "DF", role: "CB", rating: 7.4 },
      { name: "Chandon Roy", number: 18, position: "MF", role: "CM", rating: 7.3 },
      { name: "John Okoli", number: 19, position: "FW", role: "ST", rating: 7.8 },
      { name: "Ibrahim", number: 17, position: "FW", role: "RW", rating: 7.2 },
    ],
  },

  // Mohammedan SC
  mohammedan: {
    formation: "4-2-3-1",
    manager: "Alfaz Ahmed",
    players: [
      { name: "Sabbir Ahmed", number: 1, position: "GK", role: "GK", rating: 7.6 },
      { name: "Emmanuel", number: 2, position: "DF", role: "LB", rating: 7.4 },
      { name: "Rahul Das", number: 5, position: "DF", role: "CB", rating: 7.8 },
      { name: "Mehedi Hasan", number: 4, position: "DF", role: "CB", isCaptain: true, rating: 7.9 },
      { name: "Kazi Rahat", number: 14, position: "DF", role: "RB", rating: 7.3 },
      { name: "Muzaffar", number: 8, position: "MF", role: "LDM", rating: 8.1 },
      { name: "Salah Uddin Sohel", number: 16, position: "MF", role: "RDM", rating: 7.5 },
      { name: "Sanowar Hossain", number: 10, position: "MF", role: "CAM", rating: 7.9 },
      { name: "Kwabena Owusu", number: 11, position: "FW", role: "LW", rating: 8.4 },
      { name: "Souleymane Diabate", number: 9, position: "FW", role: "ST", rating: 8.9, photoUrl: "/players/diabate.jpg", goals: 1 },
      { name: "Jafar Iqbal", number: 7, position: "FW", role: "RW", rating: 8.0 },
    ],
    subs: [
      { name: "Shakil", number: 22, position: "GK", role: "GK", rating: 7.0 },
      { name: "Rashedul", number: 3, position: "DF", role: "CB", rating: 7.1 },
      { name: "Faisal Mahmud", number: 15, position: "MF", role: "CM", rating: 7.3 },
      { name: "Arif", number: 19, position: "FW", role: "RW", rating: 7.2 },
    ],
  },

  // Dhaka Abahani
  abahani: {
    formation: "4-3-3",
    manager: "Diego Cruciani",
    players: [
      { name: "Shahidul Alam", number: 1, position: "GK", role: "GK", rating: 7.7 },
      { name: "Nurul Naium", number: 2, position: "DF", role: "LB", rating: 7.5 },
      { name: "Youkouba", number: 5, position: "DF", role: "CB", rating: 8.1 },
      { name: "Hasan Murad", number: 4, position: "DF", role: "CB", isCaptain: true, rating: 7.8 },
      { name: "Riyadul Rafi", number: 14, position: "DF", role: "RB", rating: 7.4 },
      { name: "Ridoy Hossain", number: 16, position: "MF", role: "CDM", rating: 7.6 },
      { name: "Jonathan Reis", number: 10, position: "MF", role: "CAM", rating: 8.3 },
      { name: "Sheikh Morsalin", number: 19, position: "MF", role: "CM", rating: 8.6, photoUrl: "/players/sheikh_morsalin.jpg" },
      { name: "Foysal Fahim", number: 17, position: "FW", role: "LW", rating: 8.2, photoUrl: "/players/foysal_fahim.jpg" },
      { name: "Cornelius Stewart", number: 9, position: "FW", role: "ST", rating: 8.5, photoUrl: "/players/cornelius_stewart.jpg" },
      { name: "Md Jibon", number: 11, position: "FW", role: "RW", rating: 7.9 },
    ],
    subs: [
      { name: "Naeem Ahmed", number: 25, position: "GK", role: "GK", rating: 7.0 },
      { name: "Al-Amin", number: 15, position: "DF", role: "RB", rating: 7.2 },
      { name: "Maraz Hossain", number: 8, position: "MF", role: "CM", rating: 7.3 },
      { name: "Stojanović", number: 99, position: "FW", role: "ST", rating: 7.6 },
    ],
  },

  // Bangladesh Police FC
  police: {
    formation: "4-2-3-1",
    manager: "Aristică Cioabă",
    players: [
      { name: "Rana Ghosh", number: 1, position: "GK", role: "GK", rating: 7.5 },
      { name: "Monir Alam", number: 3, position: "DF", role: "LB", rating: 7.2 },
      { name: "Shahinur Mondal", number: 4, position: "DF", role: "CB", isCaptain: true, rating: 7.7, photoUrl: "/players/shahinur.jpg" },
      { name: "Joy Kumar", number: 5, position: "DF", role: "CB", rating: 7.4 },
      { name: "M. Shakil", number: 2, position: "DF", role: "RB", rating: 7.1 },
      { name: "Nazir Uddin", number: 8, position: "MF", role: "LDM", rating: 7.6 },
      { name: "Saiful Islam", number: 6, position: "MF", role: "RDM", rating: 7.3 },
      { name: "Mateo Ortiz", number: 10, position: "MF", role: "CAM", rating: 8.2 },
      { name: "Arifur Rahman", number: 7, position: "FW", role: "LW", rating: 7.8 },
      { name: "Emeka Ogbugh", number: 9, position: "FW", role: "ST", rating: 8.6 },
      { name: "Rabiul Hasan", number: 11, position: "FW", role: "RW", rating: 7.7 },
    ],
    subs: [
      { name: "Dinajpur", number: 22, position: "GK", role: "GK", rating: 6.9 },
      { name: "Mahfuz", number: 18, position: "DF", role: "CB", rating: 7.1 },
      { name: "Jahid", number: 14, position: "MF", role: "CM", rating: 7.2 },
    ],
  },

  // Bangladesh National Team
  bangladesh: {
    formation: "4-3-3",
    manager: "Javier Cabrera",
    players: [
      { name: "Mitul Marma", number: 1, position: "GK", role: "GK", rating: 7.8, photoUrl: "/players/mitul_marma.jpg" },
      { name: "Rahmat Mia", number: 3, position: "DF", role: "LB", rating: 7.6, photoUrl: "/players/rahmat_mia.jpg" },
      { name: "Tariq Kazi", number: 4, position: "DF", role: "CB", rating: 8.2, photoUrl: "/players/tariq_kazi.jpg" },
      { name: "Topu Barman", number: 2, position: "DF", role: "CB", isCaptain: true, rating: 8.3, photoUrl: "/players/topu_barman.jpg" },
      { name: "Bishwanath Ghosh", number: 12, position: "DF", role: "RB", rating: 7.9, photoUrl: "/players/bishwanath_ghosh.jpg" },
      { name: "Hamza Choudhury", number: 6, position: "MF", role: "CDM", rating: 8.9, photoUrl: "/players/hamza_choudhury.jpg" },
      { name: "Sohel Rana", number: 8, position: "MF", role: "LCM", rating: 7.9, photoUrl: "/players/sohel_rana.jpg" },
      { name: "Sheikh Morsalin", number: 10, position: "MF", role: "RCM", rating: 8.5, photoUrl: "/players/sheikh_morsalin.jpg" },
      { name: "Foysal Fahim", number: 17, position: "FW", role: "LW", rating: 8.1, photoUrl: "/players/foysal_fahim.jpg" },
      { name: "Rakib Hossain", number: 11, position: "FW", role: "ST", rating: 8.4, photoUrl: "/players/rakib_hossain.jpg" },
      { name: "Jamal Bhuyan", number: 7, position: "FW", role: "RW", rating: 8.0, photoUrl: "/players/jamal_bhuyan.jpg" },
    ],
    subs: [
      { name: "Zico", number: 23, position: "GK", role: "GK", rating: 7.7, photoUrl: "/players/zico.jpg" },
      { name: "Saad Uddin", number: 14, position: "DF", role: "RB", rating: 7.3 },
      { name: "Mojibur Rahman", number: 20, position: "MF", role: "CM", rating: 7.4 },
      { name: "Sumon Reza", number: 9, position: "FW", role: "ST", rating: 7.5 },
    ],
  },
};

/** Normalize string key for looking up known team lineups */
export function getLineupKey(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes("paris") || n.includes("psg")) return "psg";
  if (n.includes("havre")) return "lehavre";
  if (n.includes("real madrid")) return "realmadrid";
  if (n.includes("barcelona") || n.includes("barca")) return "barcelona";
  if (n.includes("manchester city") || n.includes("man city")) return "mancity";
  if (n.includes("arsenal")) return "arsenal";
  if (n.includes("bashundhara") || n.includes("kings")) return "bashundhara";
  if (n.includes("mohammedan")) return "mohammedan";
  if (n.includes("abahani")) return "abahani";
  if (n.includes("police")) return "police";
  if (n.includes("bangladesh national") || n.includes("bangladesh nt")) return "bangladesh";
  return null;
}

/**
 * Get starting 11 players + substitutes dynamically for any team.
 */
export function getTeamStartingXI(
  team: TeamRef,
  existingPlayers?: Player[]
): {
  formation: string;
  manager?: string;
  players: PitchPlayerNode[];
  subs: PitchPlayerNode[];
} {
  const key = getLineupKey(team.name);
  if (key && TEAM_LINEUPS[key]) {
    const data = TEAM_LINEUPS[key];
    return {
      formation: data.formation,
      manager: data.manager,
      players: data.players.map((p, i) => {
        // Find corresponding player from database if available (single source of truth)
        const pLastName = p.name.split(" ").slice(-1)[0].toLowerCase();
        const dbPlayer = existingPlayers?.find((ep) => {
          const epName = ep.name.toLowerCase();
          const pName = p.name.toLowerCase();
          return (
            epName === pName ||
            epName.includes(pLastName) ||
            pName.includes(epName) ||
            (ep.jerseyNumber != null && ep.jerseyNumber === p.number && ep.position === p.position)
          );
        });

        return {
          id: dbPlayer ? dbPlayer.id : `${team.id}-p-${i + 1}`,
          name: dbPlayer ? dbPlayer.name : p.name,
          number: dbPlayer?.jerseyNumber ?? p.number,
          position: (dbPlayer?.position as any) ?? p.position,
          role: p.role,
          isCaptain: p.isCaptain ?? (i === 3),
          rating: dbPlayer?.rating ?? p.rating,
          photoUrl: dbPlayer?.photoUrl || p.photoUrl,
          goals: dbPlayer?.goals ?? p.goals,
          yellowCard: p.yellowCard,
        };
      }),
      subs: data.subs.map((s, i) => {
        const sLastName = s.name.split(" ").slice(-1)[0].toLowerCase();
        const dbPlayer = existingPlayers?.find((ep) => {
          const epName = ep.name.toLowerCase();
          const sName = s.name.toLowerCase();
          return (
            epName === sName ||
            epName.includes(sLastName) ||
            sName.includes(epName) ||
            (ep.jerseyNumber != null && ep.jerseyNumber === s.number && ep.position === s.position)
          );
        });

        return {
          id: dbPlayer ? dbPlayer.id : `${team.id}-sub-${i + 1}`,
          name: dbPlayer ? dbPlayer.name : s.name,
          number: dbPlayer?.jerseyNumber ?? s.number,
          position: (dbPlayer?.position as any) ?? s.position,
          role: s.role,
          rating: dbPlayer?.rating ?? s.rating,
          photoUrl: dbPlayer?.photoUrl || s.photoUrl,
        };
      }),
    };
  }

  // If DB players exist and we have enough
  if (existingPlayers && existingPlayers.length >= 11) {
    const roles = ["GK", "LB", "CB", "CB", "RB", "CM", "CDM", "CAM", "LW", "ST", "RW"];
    return {
      formation: "4-3-3",
      players: existingPlayers.slice(0, 11).map((p, i) => ({
        id: p.id,
        name: p.name.split(" ").slice(-1)[0] || p.name,
        number: p.jerseyNumber ?? i + 1,
        position: (p.position as any) ?? (i === 0 ? "GK" : i < 5 ? "DF" : i < 8 ? "MF" : "FW"),
        role: roles[i] || "MF",
        isCaptain: i === 3,
        rating: Math.round((p.rating || 7.0 + (i % 3) * 0.4) * 10) / 10,
        photoUrl: p.photoUrl,
        goals: p.goals > 0 ? p.goals : undefined,
      })),
      subs: existingPlayers.slice(11, 16).map((p, i) => ({
        id: p.id,
        name: p.name.split(" ").slice(-1)[0] || p.name,
        number: p.jerseyNumber ?? i + 12,
        position: p.position as any,
        role: "SUB",
        rating: p.rating || 6.8,
        photoUrl: p.photoUrl,
      })),
    };
  }

  // Procedural realistic 11 based on team name / country
  const isBangladeshi =
    team.name.includes("Club") ||
    team.name.includes("Dhaka") ||
    team.name.includes("Chittagong") ||
    team.name.includes("Brothers") ||
    team.name.includes("Fortis") ||
    team.name.includes("Rahmatganj") ||
    team.name.includes("Arambagh") ||
    team.name.includes("PWD") ||
    team.name.includes("Wanderers");

  const bdNames = [
    { name: "Anisur", num: 1, pos: "GK", role: "GK", photo: "/players/zico.jpg" },
    { name: "Rahmat", num: 3, pos: "DF", role: "LB", photo: "/players/rahmat_mia.jpg" },
    { name: "Tariq", num: 4, pos: "DF", role: "CB", photo: "/players/tariq_kazi.jpg" },
    { name: "Topu", num: 2, pos: "DF", role: "CB", cap: true, photo: "/players/topu_barman.jpg" },
    { name: "Ghosh", num: 12, pos: "DF", role: "RB", photo: "/players/bishwanath_ghosh.jpg" },
    { name: "Sohel", num: 8, pos: "MF", role: "CM", photo: "/players/sohel_rana.jpg" },
    { name: "Hamza", num: 6, pos: "MF", role: "CDM", photo: "/players/hamza_choudhury.jpg" },
    { name: "Morsalin", num: 10, pos: "MF", role: "CAM", photo: "/players/sheikh_morsalin.jpg" },
    { name: "Fahim", num: 17, pos: "FW", role: "LW", photo: "/players/foysal_fahim.jpg" },
    { name: "Rakib", num: 11, pos: "FW", role: "RW", photo: "/players/rakib_hossain.jpg" },
    { name: "Dorielton", num: 9, pos: "FW", role: "ST", photo: "/players/dorielton_gomes.jpg" },
  ];

  const intlNames = [
    { name: "Courtois", num: 1, pos: "GK", role: "GK", photo: "/players/courtois.jpg" },
    { name: "Mendy", num: 3, pos: "DF", role: "LB", photo: "/players/mendy.jpg" },
    { name: "Rüdiger", num: 4, pos: "DF", role: "CB", photo: "/players/rudiger.jpg" },
    { name: "Militão", num: 2, pos: "DF", role: "CB", cap: true, photo: "/players/militao.jpg" },
    { name: "Carvajal", num: 14, pos: "DF", role: "RB", photo: "/players/carvajal.jpg" },
    { name: "Bellingham", num: 5, pos: "MF", role: "CM", photo: "/players/jude_bellingham.jpg" },
    { name: "Rodri", num: 16, pos: "MF", role: "CDM", photo: "/players/rodri.jpg" },
    { name: "Valverde", num: 8, pos: "MF", role: "CAM", photo: "/players/valverde.jpg" },
    { name: "Vinícius", num: 7, pos: "FW", role: "LW", photo: "/players/vinicius_júnior.jpg" },
    { name: "Mbappé", num: 9, pos: "FW", role: "ST", photo: "/players/kylian_mbappe.jpg" },
    { name: "Rodrygo", num: 11, pos: "FW", role: "RW", photo: "/players/rodrygo.jpg" },
  ];

  const source = isBangladeshi ? bdNames : intlNames;
  return {
    formation: "4-3-3",
    players: source.map((p, i) => ({
      id: `${team.id}-gen-${i + 1}`,
      name: p.name,
      number: p.num,
      position: p.pos as any,
      role: p.role,
      isCaptain: (p as any).cap ?? false,
      rating: 7.4 + (i % 5) * 0.3,
      photoUrl: (p as any).photo,
    })),
    subs: [
      { id: `${team.id}-sub-1`, name: "Sub Keeper", number: 13, position: "GK" as const, role: "GK", rating: 7.0 },
      { id: `${team.id}-sub-2`, name: "Defender", number: 15, position: "DF" as const, role: "CB", rating: 7.2 },
      { id: `${team.id}-sub-3`, name: "Midfielder", number: 18, position: "MF" as const, role: "CM", rating: 7.3 },
      { id: `${team.id}-sub-4`, name: "Striker", number: 21, position: "FW" as const, role: "ST", rating: 7.5 },
    ],
  };
}
