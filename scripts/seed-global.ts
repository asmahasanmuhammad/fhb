// ═══════════════════════════════════════════════════════════════════════════
// FHB Global Data Seed — November 2026
// Wipes football data (teams/players/matches/standings/competitions) and
// re-seeds with the real 2026-27 season snapshot: BFL + Big-5 European
// leagues + UCL + World Cup 2026 + SAFF + Federation Cup, ~115 teams,
// ~180 players, ~120 matches, full standings and 26 new English articles.
// Social demo data (users, ads, videos, posts, comments) is preserved.
// ═══════════════════════════════════════════════════════════════════════════

import { db } from "../src/lib/db";
import { EUROPEAN_LEAGUES, seededForm } from "./global-data/european-leagues";
import { BFL_DEF, NATIONAL_TEAMS, FED_CUP_DEF, SAFF_DEF, UCL_DEF, WC_DEF } from "./global-data/bfl";
import { PLAYERS, SAFF_PLAYERS, WC_PLAYERS } from "./global-data/players";
import { MATCHES, LIVE_EVENTS } from "./global-data/matches";
import { NEWS_ARTICLES } from "./global-data/news-articles";

const DAY = 86400000;

function kickoffAt(daysOffset: number, hourUTC: number): Date {
  const d = new Date(Date.now() + daysOffset * DAY);
  d.setUTCHours(Math.floor(hourUTC), Math.round((hourUTC % 1) * 60), 0, 0);
  return d;
}

async function main() {
  console.log("⏳ Wiping existing football data…");
  await db.matchEvent.deleteMany({});
  await db.match.deleteMany({});
  await db.standing.deleteMany({});
  await db.player.deleteMany({});
  await db.team.deleteMany({});
  await db.competition.deleteMany({});

  // ── Competitions ────────────────────────────────────────────────────────
  console.log("🏆 Creating competitions…");
  const compDefs = [
    BFL_DEF, FED_CUP_DEF, SAFF_DEF, UCL_DEF, WC_DEF,
    ...EUROPEAN_LEAGUES.map((l) => ({ ...l, description: l.description })),
  ] as const;

  const compByKey = new Map<string, string>();
  for (const def of compDefs) {
    const c = await db.competition.create({
      data: {
        name: def.name,
        shortName: def.shortName,
        type: def.type,
        season: def.season,
        country: def.country,
        accentColor: def.accentColor,
        description: def.description,
      },
    });
    compByKey.set(def.key, c.id);
  }

  // ── Teams ───────────────────────────────────────────────────────────────
  console.log("🛡️  Creating teams…");
  const teamIdByInitials = new Map<string, string>();
  const teamMeta = new Map<string, { name: string; leagueKey: string; country: string }>();

  const addLeagueTeams = (league: (typeof EUROPEAN_LEAGUES)[number]) => {
    league.teams.forEach(([name, shortName, initials, city, stadium, founded, color, color2]) => {
      teamMeta.set(initials, { name, leagueKey: league.key, country: league.country });
    });
  };
  EUROPEAN_LEAGUES.forEach(addLeagueTeams);
  BFL_DEF.teams.forEach(([name, , initials]) =>
    teamMeta.set(initials, { name, leagueKey: "BFL", country: "Bangladesh" })
  );
  NATIONAL_TEAMS.forEach(([name, , initials]) =>
    teamMeta.set(initials, { name, leagueKey: "NATIONAL", country: name.includes("Bangladesh") ? "Bangladesh" : name.split(" ")[0] })
  );

  const allTeamTuples = [
    ...EUROPEAN_LEAGUES.flatMap((l) => l.teams.map((t) => ({ t, desc: undefined as string | undefined }))),
    ...BFL_DEF.teams.map((t) => ({
      t,
      desc: `${t[1]} — ${t[3]}-based professional club competing in the Bangladesh Football League, playing home matches at ${t[4]}.`,
    })),
    ...NATIONAL_TEAMS.map((t) => ({
      t,
      desc: `The ${t[1]} national football team — the pride of a nation, playing home fixtures at ${t[4]}.`,
    })),
  ];

  for (const { t, desc } of allTeamTuples) {
    const [name, shortName, initials, city, stadium, founded, color, color2] = t;
    const team = await db.team.create({
      data: { name, shortName, initials, city, stadium, founded, color, color2, description: desc ?? null },
    });
    teamIdByInitials.set(initials, team.id);
  }

  // ── Standings ───────────────────────────────────────────────────────────
  console.log("📊 Creating standings…");
  const standingsRows = [
    ...EUROPEAN_LEAGUES.map((l) => ({ key: l.key, rows: l.standings })),
    { key: "BFL", rows: BFL_DEF.standings },
  ];
  for (const { key, rows } of standingsRows) {
    const competitionId = compByKey.get(key)!;
    for (const [pos, name, P, W, D, L, GF, GA] of rows) {
      const teamId = [...teamIdByInitials.entries()].find(
        ([ini]) => teamMeta.get(ini)?.name === name
      )?.[1];
      if (!teamId) {
        console.warn(`  ! no team for standing: ${name}`);
        continue;
      }
      const points = W * 3 + D;
      await db.standing.create({
        data: {
          competitionId,
          teamId,
          position: pos,
          played: P,
          won: W,
          drawn: D,
          lost: L,
          goalsFor: GF,
          goalsAgainst: GA,
          points,
          form: seededForm(String(name), points, P),
        },
      });
    }
  }

  // ── Players ─────────────────────────────────────────────────────────────
  console.log("⚽ Creating players…");
  const allPlayers = [
    ...PLAYERS,
    ...SAFF_PLAYERS,
    ...WC_PLAYERS.filter((p) => !PLAYERS.some((q) => q[0] === p[0] && q[1] !== p[1])),
  ];
  let created = 0;
  for (const [name, ini, position, nationality, jersey, birthYear, height, goals, assists, apps, rating, isNat] of allPlayers) {
    const teamId = teamIdByInitials.get(ini);
    if (!teamId) {
      console.warn(`  ! no team for player: ${name} (${ini})`);
      continue;
    }
    await db.player.create({
      data: {
        name,
        teamId,
        position,
        nationality,
        jerseyNumber: jersey,
        birthYear,
        heightCm: height,
        goals,
        assists,
        appearances: apps,
        cleanSheets: position === "GK" ? Math.max(1, Math.round(apps * 0.4)) : 0,
        rating,
        isNationalTeam: !!isNat,
        bio: `${name} is a ${position === "GK" ? "goalkeeper" : position === "DF" ? "defender" : position === "MF" ? "midfielder" : "forward"} for ${teamMeta.get(ini)!.name}, registered with the ${nationality} football association.`,
      },
    });
    created++;
  }
  console.log(`   ${created} players created`);

  // ── Matches + events ────────────────────────────────────────────────────
  console.log("📅 Creating matches…");
  const playersByTeam = new Map<string, Array<{ name: string; goals: number; position: string }>>();
  const teamPlayers = await db.player.findMany({ select: { name: true, goals: true, position: true, teamId: true } });
  for (const p of teamPlayers) {
    if (!playersByTeam.has(p.teamId)) playersByTeam.set(p.teamId, []);
    playersByTeam.get(p.teamId)!.push(p);
  }
  const scorerPool = (teamId: string) =>
    (playersByTeam.get(teamId) ?? [])
      .filter((p) => p.position !== "GK")
      .sort((a, b) => b.goals - a.goals);

  const matchIdByKey = new Map<string, string>();
  let goalEvents = 0;

  for (const [comp, hIni, aIni, hs, as, status, daysOff, hourUTC, minute, period, venue, matchday, round, featured] of MATCHES) {
    const competitionId = compByKey.get(comp)!;
    const homeTeamId = teamIdByInitials.get(hIni)!;
    const awayTeamId = teamIdByInitials.get(aIni)!;
    const kickoff = kickoffAt(daysOff, hourUTC);
    const m = await db.match.create({
      data: {
        competitionId,
        homeTeamId,
        awayTeamId,
        homeScore: hs,
        awayScore: as,
        status,
        minute: status === "SCHEDULED" ? null : minute,
        period: status === "SCHEDULED" ? null : period,
        kickoff,
        venue,
        matchday,
        round,
        featured: !!featured,
      },
    });
    matchIdByKey.set(`${comp}:${hIni}:${aIni}`, m.id);

    if (status === "FINISHED") {
      // HT / FT markers
      const ftMin = comp === "WC26" ? 120 : 90;
      await db.matchEvent.create({ data: { matchId: m.id, minute: 45, type: "HT", detail: "Half-Time" } });
      await db.matchEvent.create({ data: { matchId: m.id, minute: ftMin, type: "FT", detail: comp === "WC26" ? "Full-Time (a.e.t.)" : "Full-Time" } });

      if ((hs ?? 0) + (as ?? 0) > 0 && comp !== "WC26") {
        // Deterministic, strength-weighted scorers for both sides
        const homePool = scorerPool(homeTeamId);
        const awayPool = scorerPool(awayTeamId);
        const spread = (n: number) =>
          Array.from({ length: n }, (_, i) => 8 + Math.round(((i + 1) / (n + 1)) * 76));
        const homeGoals = spread(hs ?? 0);
        const awayGoals = spread(as ?? 0);
        for (let i = 0; i < homeGoals.length; i++) {
          const scorer = homePool.length ? homePool[i % homePool.length].name : null;
          await db.matchEvent.create({ data: { matchId: m.id, minute: homeGoals[i], type: "GOAL", teamId: homeTeamId, teamSide: "home", playerName: scorer, detail: "Goal" } });
          goalEvents++;
        }
        for (let i = 0; i < awayGoals.length; i++) {
          const scorer = awayPool.length ? awayPool[i % awayPool.length].name : null;
          await db.matchEvent.create({ data: { matchId: m.id, minute: awayGoals[i], type: "GOAL", teamId: awayTeamId, teamSide: "away", playerName: scorer, detail: "Goal" } });
          goalEvents++;
        }
      }
      if (comp === "WC26") {
        // Real final: Spain 1-0 Argentina (a.e.t.) — scorer detail generic
        await db.matchEvent.create({
          data: { matchId: m.id, minute: 104, type: "GOAL", teamId: homeTeamId, teamSide: "home", playerName: null, detail: "Goal — extra time" },
        });
      }
    }
  }

  // Live events (pre-match history for the LIVE fixtures)
  for (const ev of LIVE_EVENTS) {
    const matchId = matchIdByKey.get(ev.matchKey);
    if (!matchId) {
      console.warn(`  ! no match for live event: ${ev.matchKey}`);
      continue;
    }
    const [, h, a] = ev.matchKey.split(":");
    await db.matchEvent.create({
      data: {
        matchId,
        minute: ev.minute,
        type: ev.type,
        teamId: ev.side === "home" ? teamIdByInitials.get(h)! : teamIdByInitials.get(a)!,
        teamSide: ev.side,
        playerName: ev.player,
        detail: ev.detail,
      },
    });
    goalEvents++;
  }

  // ── Migrate old news (BPL → BFL) ────────────────────────────────────────
  console.log("📰 Migrating existing news to BFL branding…");
  await db.newsArticle.updateMany({ where: { category: "BPL" }, data: { category: "BFL" } });
  const oldArticles = await db.newsArticle.findMany({ select: { id: true, title: true, excerpt: true, content: true } });
  for (const a of oldArticles) {
    const swap = (s: string) => s.replace(/Bangladesh Premier League/g, "Bangladesh Football League").replace(/\bBPL\b/g, "BFL");
    const t = swap(a.title);
    const e = swap(a.excerpt);
    const c = swap(a.content);
    if (t !== a.title || e !== a.excerpt || c !== a.content) {
      await db.newsArticle.update({ where: { id: a.id }, data: { title: t, excerpt: e, content: c } });
    }
  }
  await db.newsArticle.updateMany({ data: { featured: false } });

  // ── New articles ────────────────────────────────────────────────────────
  console.log("📰 Publishing new articles…");
  const users = await db.user.findMany({ select: { id: true, username: true } });
  const authorId = new Map(users.map((u) => [u.username, u.id]));
  const fallbackAuthor = authorId.get("rashed_editor") ?? users[0].id;

  // Idempotency: clear any previous run of these articles first
  await db.newsArticle.deleteMany({
    where: { slug: { in: NEWS_ARTICLES.map((a) => a[1]) } },
  });

  for (const [title, slug, category, coverUrl, author, featured, views, daysAgo, excerpt, content] of NEWS_ARTICLES) {
    await db.newsArticle.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        category,
        coverUrl,
        authorId: authorId.get(author) ?? fallbackAuthor,
        status: "PUBLISHED",
        featured,
        views,
        likeCount: Math.round(views * 0.03),
        commentCount: Math.round(views * 0.004),
        createdAt: new Date(Date.now() - daysAgo * DAY),
      },
    });
  }

  // ── Final counts ────────────────────────────────────────────────────────
  const [teams, players, comps, matches, standings, events, news, liveMatches] = await Promise.all([
    db.team.count(),
    db.player.count(),
    db.competition.count(),
    db.match.count(),
    db.standing.count(),
    db.matchEvent.count(),
    db.newsArticle.count(),
    db.match.count({ where: { status: "LIVE" } }),
  ]);
  console.log("\n✅ Seed complete!");
  console.log(`   Competitions: ${comps} | Teams: ${teams} | Players: ${players}`);
  console.log(`   Matches: ${matches} (LIVE: ${liveMatches}) | Standings rows: ${standings} | Events: ${events}`);
  console.log(`   News articles: ${news}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
