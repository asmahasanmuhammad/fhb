/**
 * FHB Live Score Service — Socket.io + HTTP Real-time Broadcast
 * Port 3003. Reads from the shared SQLite database (populated by real sync engine).
 * Strictly mirrors real match data — NO FAKE SIMULATION, NO RANDOM GOALS.
 */
import { createServer } from "http";
import { Server } from "socket.io";
import { Database } from "bun:sqlite";
import path from "path";

const DB_PATH = path.resolve(__dirname, "../../db/custom.db");
const PORT = 3003;
const DISCOVER_MS = 5000; // DB re-scan interval

console.log(`[live] Connecting to SQLite DB at: ${DB_PATH}`);
const db = new Database(DB_PATH, { create: true });
db.exec("PRAGMA journal_mode=WAL;");
db.exec("PRAGMA busy_timeout=5000;");

type LiveMatchData = {
  id: string;
  minute: number | null;
  period: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { id: string; name: string; initials: string; color: string; logoUrl?: string };
  awayTeam: { id: string; name: string; initials: string; color: string; logoUrl?: string };
  competition?: { id: string; name: string; shortName: string; accentColor?: string };
  status: "LIVE";
};

let currentLiveMatches: LiveMatchData[] = [];
let recentEvents: Array<{ id: string; text: string; ts: number; minute?: number; type?: string }> = [];

function loadFromDb() {
  try {
    const rows = db
      .query(
        `SELECT m.id, m.homeScore, m.awayScore, m.minute, m.period,
                m.homeTeamId, m.awayTeamId,
                h.name AS homeName, h.initials AS homeInitials, h.color AS homeColor, h.logoUrl AS homeLogo,
                a.name AS awayName, a.initials AS awayInitials, a.color AS awayColor, a.logoUrl AS awayLogo,
                c.id AS compId, c.name AS compName, c.shortName AS compShortName, c.accentColor AS compColor
         FROM Match m
         JOIN Team h ON h.id = m.homeTeamId
         JOIN Team a ON a.id = m.awayTeamId
         JOIN Competition c ON c.id = m.competitionId
         WHERE m.status = 'LIVE'
         ORDER BY m.kickoff ASC`
      )
      .all() as any[];

    currentLiveMatches = rows.map((r) => ({
      id: r.id,
      minute: r.minute,
      period: r.period,
      homeScore: r.homeScore,
      awayScore: r.awayScore,
      homeTeam: {
        id: r.homeTeamId,
        name: r.homeName,
        initials: r.homeInitials,
        color: r.homeColor || "#10B981",
        logoUrl: r.homeLogo || undefined,
      },
      awayTeam: {
        id: r.awayTeamId,
        name: r.awayName,
        initials: r.awayInitials,
        color: r.awayColor || "#3B82F6",
        logoUrl: r.awayLogo || undefined,
      },
      competition: {
        id: r.compId,
        name: r.compName,
        shortName: r.compShortName,
        accentColor: r.compColor,
      },
      status: "LIVE" as const,
    }));

    // Read real recent events only for matches that are currently LIVE
    if (currentLiveMatches.length === 0) {
      recentEvents = [];
    } else {
      const eventRows = db
        .query(
          `SELECT e.id, e.minute, e.type, e.playerName, e.detail, e.createdAt
           FROM MatchEvent e
           JOIN Match m ON m.id = e.matchId
           WHERE m.status = 'LIVE'
           ORDER BY e.createdAt DESC
           LIMIT 15`
        )
        .all() as any[];

      recentEvents = eventRows.map((e) => ({
        id: e.id,
        text: `${e.type === "GOAL" ? "⚽ GOAL" : e.type === "YELLOW" ? "🟨 Yellow Card" : e.type} (${e.minute}') ${e.playerName ? `: ${e.playerName}` : ""}`,
        minute: e.minute,
        type: e.type,
        ts: new Date(e.createdAt).getTime(),
      }));
    }
  } catch (e) {
    console.error("[live] loadFromDb error:", e);
  }
}

function getLivePayload() {
  return {
    matches: currentLiveMatches,
    events: recentEvents,
    serverTime: Date.now(),
  };
}

function broadcastState() {
  io.emit("live:update", getLivePayload());
}

// HTTP Server
const httpServer = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === "/api/live" || req.url === "/live" || req.url?.startsWith("/?XTransformPort=3003")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: getLivePayload() }));
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok", service: "FHB Real-time Live Score Engine", port: PORT, liveCount: currentLiveMatches.length }));
});

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.on("connection", (socket) => {
  socket.emit("live:update", getLivePayload());
});

// Periodic real DB sync scan and broadcast
loadFromDb();
setInterval(() => {
  loadFromDb();
  broadcastState();
}, DISCOVER_MS);

httpServer.on("error", (err: any) => {
  console.error("[live] Server error:", err?.message || err);
});

process.on("uncaughtException", (err) => {
  console.error("[live] Uncaught exception:", err?.message || err);
});

process.on("unhandledRejection", (reason) => {
  console.error("[live] Unhandled rejection:", reason);
});

httpServer.listen(PORT, () => {
  console.log(`🏟️  FHB Real Live Score Service running on port ${PORT}`);
  console.log(`   Connected to SQLite at: ${DB_PATH}`);
  console.log(`   Strict real-data mode: No fake simulations`);
});
