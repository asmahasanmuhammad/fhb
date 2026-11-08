/**
 * FHB Live Score Service — socket.io real-time match simulation
 * Port 3003. Reads/writes the shared SQLite database (WAL mode).
 *
 * - Simulates minute progression for LIVE matches
 * - Generates random events (goals, cards) using real squad names
 * - Persists score/event changes to DB
 * - Broadcasts `live:update` to all connected clients
 * - Picks up matches set to LIVE by the admin dashboard
 */
import { createServer } from "http";
import { Server } from "socket.io";
import { Database } from "bun:sqlite";

const DB_PATH = "/home/z/my-project/db/custom.db";
const PORT = 3003;
const TICK_MS = 8000; // simulation tick
const DISCOVER_MS = 15000; // DB re-scan interval

const db = new Database(DB_PATH, { create: true });
db.exec("PRAGMA journal_mode=WAL;");
db.exec("PRAGMA busy_timeout=5000;");

type SimMatch = {
  id: string;
  minute: number;
  period: "1H" | "HT" | "2H" | "FT";
  homeScore: number;
  awayScore: number;
  homeTeam: { id: string; name: string; initials: string; color: string };
  awayTeam: { id: string; name: string; initials: string; color: string };
  players: Array<{ teamSide: "home" | "away"; name: string }>;
  updatedAt: number;
};

const simulations = new Map<string, SimMatch>();
const recentEvents: Array<{ id: string; text: string; ts: number }> = [];

function rowToTeam(row: any, side: "home" | "away") {
  if (!row) return { id: "", name: "—", initials: "—", color: "#10B981" };
  return {
    id: side === "home" ? row.homeTeamId : row.awayTeamId,
    name: side === "home" ? row.homeName : row.awayName,
    initials: side === "home" ? row.homeInitials : row.awayInitials,
    color: side === "home" ? row.homeColor : row.awayColor,
  };
}

function loadLiveMatchesFromDb() {
  const rows = db
    .query(
      `SELECT m.id, m.homeScore, m.awayScore, m.minute, m.period,
              m.homeTeamId, m.awayTeamId,
              h.name AS homeName, h.initials AS homeInitials, h.color AS homeColor,
              a.name AS awayName, a.initials AS awayInitials, a.color AS awayColor
       FROM Match m
       JOIN Team h ON h.id = m.homeTeamId
       JOIN Team a ON a.id = m.awayTeamId
       WHERE m.status = 'LIVE'`
    )
    .all() as any[];

  const seen = new Set<string>();
  for (const row of rows) {
    seen.add(row.id);
    if (!simulations.has(row.id)) {
      const players = db
        .query(
          `SELECT p.name, p.teamId, p.position FROM Player p WHERE p.teamId IN (?, ?) AND p.position != 'GK'`
        )
        .all(row.homeTeamId, row.awayTeamId) as any[];
      const sim: SimMatch = {
        id: row.id,
        minute: row.minute ?? 1,
        period: (row.period as SimMatch["period"]) || "1H",
        homeScore: row.homeScore ?? 0,
        awayScore: row.awayScore ?? 0,
        homeTeam: rowToTeam(row, "home"),
        awayTeam: rowToTeam(row, "away"),
        players: players.map((p) => ({
          teamSide: p.teamId === row.homeTeamId ? ("home" as const) : ("away" as const),
          name: p.name,
        })),
        updatedAt: Date.now(),
      };
      simulations.set(row.id, sim);
      console.log(`[live] Now simulating: ${sim.homeTeam.name} ${sim.homeScore}-${sim.awayScore} ${sim.awayTeam.name} (${sim.minute}')`);
    }
  }
  // drop simulations for matches no longer LIVE in DB
  for (const id of [...simulations.keys()]) {
    if (!seen.has(id)) simulations.delete(id);
  }
}

function persistScore(sim: SimMatch) {
  try {
    db.query(`UPDATE Match SET homeScore = ?, awayScore = ?, minute = ?, period = ? WHERE id = ?`).run(
      sim.homeScore,
      sim.awayScore,
      sim.minute,
      sim.period,
      sim.id
    );
  } catch (e) {
    console.error("[live] persistScore error:", e);
  }
}

function insertEvent(sim: SimMatch, minute: number, type: string, teamSide: string, teamId: string, playerName: string | null, detail: string) {
  try {
    db.query(
      `INSERT INTO MatchEvent (id, matchId, minute, type, teamId, teamSide, playerName, detail, createdAt)
       VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).run(sim.id, minute, type, teamId, teamSide, playerName, detail);
  } catch (e) {
    console.error("[live] insertEvent error:", e);
  }
}

function finishMatch(sim: SimMatch) {
  sim.period = "FT";
  sim.minute = 90;
  try {
    db.query(`UPDATE Match SET status = 'FINISHED', period = 'FT', minute = 90, homeScore = ?, awayScore = ? WHERE id = ?`).run(
      sim.homeScore,
      sim.awayScore,
      sim.id
    );
    insertEvent(sim, 90, "FT", "", "", null, "ফুল-টাইম");
  } catch (e) {
    console.error("[live] finishMatch error:", e);
  }
  pushEvent(sim, `⚽ ফুল-টাইম: ${sim.homeTeam.name} ${sim.homeScore} - ${sim.awayScore} ${sim.awayTeam.name}`);
  simulations.delete(sim.id);
  // requeue: for demo continuity, admin can re-set LIVE from dashboard
  console.log(`[live] Finished: ${sim.homeTeam.name} ${sim.homeScore}-${sim.awayScore} ${sim.awayTeam.name}`);
}

function pickScorer(sim: SimMatch, side: "home" | "away"): string {
  const pool = sim.players.filter((p) => p.teamSide === side);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)].name : "—";
}

function pushEvent(sim: SimMatch, text: string) {
  recentEvents.unshift({ id: `${sim.id}-${Date.now()}`, text, ts: Date.now() });
  if (recentEvents.length > 30) recentEvents.pop();
}

function broadcastState() {
  const payload = {
    matches: [...simulations.values()].map((s) => ({
      id: s.id,
      minute: s.minute,
      period: s.period,
      homeScore: s.homeScore,
      awayScore: s.awayScore,
      homeTeam: s.homeTeam,
      awayTeam: s.awayTeam,
      status: "LIVE" as const,
    })),
    events: recentEvents.slice(0, 12),
    serverTime: Date.now(),
  };
  io.emit("live:update", payload);
}

function tick() {
  let changed = false;
  for (const sim of [...simulations.values()]) {
    if (sim.period === "FT") continue;
    // advance clock (1 tick ≈ 1-2 minutes)
    sim.minute = Math.min(90, sim.minute + (Math.random() > 0.4 ? 2 : 1));
    changed = true;

    if (sim.minute >= 45 && sim.period === "1H") {
      sim.period = "HT";
      pushEvent(sim, `⏸️ হাফ-টাইম: ${sim.homeTeam.name} ${sim.homeScore} - ${sim.awayScore} ${sim.awayTeam.name}`);
      insertEvent(sim, 45, "HT", "", "", null, "হাফ-টাইম");
      persistScore(sim);
      continue;
    }
    if (sim.period === "HT") {
      // resume second half
      sim.period = "2H";
      sim.minute = 46;
      persistScore(sim);
      continue;
    }
    if (sim.minute >= 90) {
      finishMatch(sim);
      continue;
    }

    // random events
    const r = Math.random();
    if (r < 0.08) {
      // GOAL!
      const side: "home" | "away" = Math.random() < 0.53 ? "home" : "away";
      const team = side === "home" ? sim.homeTeam : sim.awayTeam;
      if (side === "home") sim.homeScore++;
      else sim.awayScore++;
      const scorer = pickScorer(sim, side);
      insertEvent(sim, sim.minute, "GOAL", side, team.id, scorer, "গোল");
      pushEvent(sim, `⚽ গোল! ${scorer} (${team.name}) — ${sim.homeTeam.initials} ${sim.homeScore}-${sim.awayScore} ${sim.awayTeam.initials}`);
      persistScore(sim);
    } else if (r < 0.14) {
      const side: "home" | "away" = Math.random() < 0.5 ? "home" : "away";
      const team = side === "home" ? sim.homeTeam : sim.awayTeam;
      const player = pickScorer(sim, side);
      insertEvent(sim, sim.minute, "YELLOW", side, team.id, player, "হলুদ কার্ড");
    } else if (r < 0.15) {
      persistScore(sim);
    }
  }
  if (changed) broadcastState();
}

// ---- Socket.io setup ----
const httpServer = createServer();
const io = new Server(httpServer, {
  path: "/",
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.on("connection", (socket) => {
  console.log(`[ws] Client connected (${socket.id}) — ${io.engine.clientsCount} online`);
  socket.emit("live:update", {
    matches: [...simulations.values()].map((s) => ({
      id: s.id,
      minute: s.minute,
      period: s.period,
      homeScore: s.homeScore,
      awayScore: s.awayScore,
      homeTeam: s.homeTeam,
      awayTeam: s.awayTeam,
      status: "LIVE",
    })),
    events: recentEvents.slice(0, 12),
    serverTime: Date.now(),
  });
  socket.on("disconnect", () => {
    console.log(`[ws] Client disconnected (${socket.id})`);
  });
});

// ---- Main loop ----
loadLiveMatchesFromDb();
setInterval(loadLiveMatchesFromDb, DISCOVER_MS);
setInterval(tick, TICK_MS);

httpServer.listen(PORT, () => {
  console.log(`🏟️  FHB Live Score Service running on port ${PORT}`);
  console.log(`   DB: ${DB_PATH} | live matches: ${simulations.size}`);
});

process.on("SIGTERM", () => {
  httpServer.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  httpServer.close(() => process.exit(0));
});
