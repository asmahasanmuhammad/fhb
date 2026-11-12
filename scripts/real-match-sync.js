// scripts/real-match-sync.js
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const TARGET_LEAGUES = [
  { id: "uefa.nations", name: "UEFA Nations League", shortName: "Nations League", country: "Europe", color: "#002F6C", type: "INTERNATIONAL" },
  { id: "concacaf.nations.league", name: "Concacaf Nations League", shortName: "Concacaf NL", country: "Americas", color: "#005596", type: "INTERNATIONAL" },
  { id: "caf.nations_qual", name: "Africa Cup of Nations Qualifying", shortName: "AFCON Qual", country: "Africa", color: "#D97706", type: "INTERNATIONAL" },
  { id: "fifa.friendly", name: "International Friendlies", shortName: "Friendlies", country: "International", color: "#10B981", type: "INTERNATIONAL" },
  { id: "esp.copa_del_rey", name: "Copa del Rey", shortName: "Copa del Rey", country: "Spain", color: "#C026D3", type: "CUP" },
  { id: "eng.1", name: "Premier League", shortName: "EPL", country: "England", color: "#3D195B", type: "LEAGUE" },
  { id: "esp.1", name: "LaLiga EA Sports", shortName: "LaLiga", country: "Spain", color: "#E5322D", type: "LEAGUE" },
  { id: "ita.1", name: "Serie A", shortName: "Serie A", country: "Italy", color: "#0B1560", type: "LEAGUE" },
  { id: "ger.1", name: "Bundesliga", shortName: "Bundesliga", country: "Germany", color: "#D20515", type: "LEAGUE" },
  { id: "fra.1", name: "Ligue 1", shortName: "Ligue 1", country: "France", color: "#091C3E", type: "LEAGUE" },
  { id: "uefa.champions", name: "UEFA Champions League", shortName: "UCL", country: "Europe", color: "#0B1560", type: "INTERNATIONAL" },
  { id: "uefa.europa", name: "UEFA Europa League", shortName: "Europa League", country: "Europe", color: "#F68E1E", type: "INTERNATIONAL" },
  { id: "eng.fa", name: "English FA Cup", shortName: "FA Cup", country: "England", color: "#D20515", type: "CUP" },
  { id: "fifa.world", name: "FIFA World Cup 2026", shortName: "World Cup", country: "World", color: "#4F9D4A", type: "INTERNATIONAL" },
];

function formatDateParam(d) {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function cleanTeamName(name) {
  if (!name) return "";
  return name.replace(/\s+National Football Team$/i, "").trim();
}

async function findOrCreateTeam(teamObj, venueName) {
  const rawName = teamObj.displayName || teamObj.name || "";
  const name = cleanTeamName(rawName);
  const shortName = teamObj.shortDisplayName || cleanTeamName(teamObj.name) || name;
  const initials = (teamObj.abbreviation || name.slice(0, 3)).toUpperCase();
  const color = teamObj.color ? `#${teamObj.color}` : "#10B981";
  const logoUrl = teamObj.logo || null;

  let team = await db.team.findFirst({
    where: {
      OR: [
        { name: name },
        { name: `${name} National Football Team` },
        { shortName: name },
        { shortName: shortName },
      ],
    },
  });

  if (!team) {
    team = await db.team.create({
      data: {
        name,
        shortName,
        initials,
        city: teamObj.location || name,
        stadium: venueName || "Stadium",
        founded: 1900,
        color,
        logoUrl,
      },
    });
  } else if (logoUrl && !team.logoUrl) {
    await db.team.update({
      where: { id: team.id },
      data: { logoUrl },
    });
  }

  return team;
}

async function processEspnEvent(e, compRecord) {
  const compData = e.competitions?.[0];
  if (!compData) return 0;

  const homeComp = compData.competitors?.find((c) => c.homeAway === "home");
  const awayComp = compData.competitors?.find((c) => c.homeAway === "away");
  if (!homeComp || !awayComp) return 0;

  const homeRaw = homeComp.team?.displayName || homeComp.team?.name || "";
  const awayRaw = awayComp.team?.displayName || awayComp.team?.name || "";

  // Skip youth, women, college, club friendly
  const noteStr = (compData.altGameNote || compData.notes?.[0]?.headline || e.season?.slug || "").toLowerCase();
  const combined = `${homeRaw} ${awayRaw} ${noteStr}`.toLowerCase();
  if (
    combined.includes("u-21") || combined.includes("u21") ||
    combined.includes("u-19") || combined.includes("u19") ||
    combined.includes("u-17") || combined.includes("women") ||
    combined.includes("femenil") || combined.includes("college") ||
    combined.includes("ncaa") || combined.includes("club friendly")
  ) {
    return 0;
  }

  const venueName = compData.venue?.fullName || "Stadium";
  const homeTeam = await findOrCreateTeam(homeComp.team, venueName);
  const awayTeam = await findOrCreateTeam(awayComp.team, venueName);

  if (!homeTeam || !awayTeam || homeTeam.id === awayTeam.id) return 0;

  const state = e.status?.type?.state; // "pre" | "in" | "post"
  const status = state === "in" ? "LIVE" : state === "post" ? "FINISHED" : "SCHEDULED";

  const homeScore = status === "SCHEDULED" ? null : (homeComp.score != null ? parseInt(homeComp.score, 10) : 0);
  const awayScore = status === "SCHEDULED" ? null : (awayComp.score != null ? parseInt(awayComp.score, 10) : 0);

  const clockStr = e.status?.displayClock || "";
  let minute = null;
  if (status === "FINISHED") {
    minute = 90;
  } else if (status === "LIVE") {
    const parsed = parseInt(clockStr.replace(/[^0-9]/g, ""), 10);
    minute = !isNaN(parsed) && parsed > 0 ? Math.min(120, parsed) : 45;
  }

  const period = status === "LIVE" ? (minute && minute > 45 ? "2H" : "1H") : status === "FINISHED" ? "FT" : null;
  const kickoffDate = e.date ? new Date(e.date) : new Date();

  // Search window +/- 12 hours
  const dateStart = new Date(kickoffDate.getTime() - 12 * 3600 * 1000);
  const dateEnd = new Date(kickoffDate.getTime() + 12 * 3600 * 1000);

  const existingMatch = await db.match.findFirst({
    where: {
      competitionId: compRecord.id,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      kickoff: { gte: dateStart, lte: dateEnd },
    },
  });

  let matchId;
  if (existingMatch) {
    matchId = existingMatch.id;
    await db.match.update({
      where: { id: existingMatch.id },
      data: {
        status,
        homeScore,
        awayScore,
        minute,
        period,
        kickoff: kickoffDate,
        venue: venueName,
        round: compData.altGameNote || e.season?.slug || existingMatch.round || "Matchday",
      },
    });
  } else {
    const created = await db.match.create({
      data: {
        competitionId: compRecord.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        status,
        homeScore,
        awayScore,
        minute,
        period,
        kickoff: kickoffDate,
        venue: venueName,
        round: compData.altGameNote || e.season?.slug || "Matchday",
        matchday: 1,
      },
    });
    matchId = created.id;
  }

  // Real goal events
  const details = compData.details || [];
  for (const d of details) {
    if (d.type?.text?.includes("Goal") || d.scoringPlay) {
      const minVal = parseInt((d.clock?.displayValue || "0").replace(/[^0-9]/g, ""), 10) || 1;
      const playerName = d.athletesInvolved?.[0]?.displayName || d.text || "Goal";
      const teamSide = d.team?.id === homeComp.team?.id ? "HOME" : "AWAY";

      const existingEv = await db.matchEvent.findFirst({
        where: { matchId, minute: minVal, type: "GOAL" },
      });
      if (!existingEv) {
        await db.matchEvent.create({
          data: {
            matchId,
            minute: minVal,
            type: "GOAL",
            teamSide,
            playerName,
            detail: d.type?.text || "Goal",
          },
        });
      }
    }
  }

  return 1;
}

async function syncAll() {
  console.log(`[real-sync] Starting ESPN major league sync at ${new Date().toISOString()}...`);

  const compRecords = new Map();
  for (const l of TARGET_LEAGUES) {
    let comp = await db.competition.findFirst({
      where: {
        OR: [{ name: l.name }, { shortName: l.shortName }],
      },
    });
    if (!comp) {
      comp = await db.competition.create({
        data: {
          name: l.name,
          shortName: l.shortName,
          country: l.country,
          type: l.type,
          accentColor: l.color,
        },
      });
    }
    compRecords.set(l.id, comp);
  }

  // 14-day calendar window: -3 days to +10 days
  const now = new Date();
  const dateParams = [];
  for (let i = -3; i <= 10; i++) {
    const d = new Date(now.getTime() + i * 864e5);
    dateParams.push(formatDateParam(d));
  }

  let totalMatchesSynced = 0;

  for (const league of TARGET_LEAGUES) {
    const compRecord = compRecords.get(league.id);
    if (!compRecord) continue;

    for (const dParam of dateParams) {
      try {
        const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.id}/scoreboard?dates=${dParam}`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "application/json",
          },
        });
        if (!res.ok) continue;
        const data = await res.json();
        const events = data.events || [];
        for (const e of events) {
          const added = await processEspnEvent(e, compRecord);
          totalMatchesSynced += added;
        }
      } catch (err) {
        // silent
      }
    }
  }

  const liveCount = await db.match.count({ where: { status: "LIVE" } });
  console.log(`[real-sync] Done! Synced ${totalMatchesSynced} items. Currently LIVE: ${liveCount}`);
}

async function main() {
  const isDaemon = process.argv.includes("--daemon");
  await syncAll();

  if (isDaemon) {
    console.log("[real-sync] Running in daemon mode. Syncing every 45 seconds...");
    setInterval(async () => {
      try {
        await syncAll();
      } catch (err) {
        console.error("[real-sync] Sync cycle error:", err);
      }
    }, 45_000);
  } else {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error("[real-sync] Fatal error:", err);
  process.exit(1);
});
