"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useAppStore } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
import { useReveal } from "@/hooks/use-reveal";
import type { Match, NewsArticle, Standing, Video, TeamRef } from "@/lib/types";
import { MatchCard } from "@/components/football/match-card";
import { StandingsTable } from "@/components/football/standings-table";
import { NewsCard } from "@/components/football/news-card";
import { AdSlot } from "@/components/football/ad-slot";
import { SectionHeader } from "@/components/football/section-header";
import { TeamBadge } from "@/components/football/team-badge";
import { LiveBadge } from "@/components/football/live-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatKickoff, fmtNum, fmtCompact } from "@/lib/format";
import {
  Zap, Newspaper, Video as VideoIcon, Radio, Flame, Play, MapPin,
  CalendarDays, ChevronRight, Trophy, Users, Crown, Goal, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeView() {
  const navigate = useAppStore((s) => s.navigate);
  const live = useLiveScores();
  useReveal();

  const { data: matchesData, isLoading: matchesLoading } = useQuery<{ matches: Match[] }>({
    queryKey: ["matches", "home"],
    queryFn: async () => {
      const res = await fetch("/api/matches?status=ALL&days=45&limit=60");
      return res.json().then((j) => j.data);
    },
  });
  const { data: newsData } = useQuery<{ articles: NewsArticle[] }>({
    queryKey: ["news", "home"],
    queryFn: async () => {
      const res = await fetch("/api/news?limit=7");
      return res.json().then((j) => j.data);
    },
  });
  const { data: standingsData } = useQuery<{ standings: Standing[] }>({
    queryKey: ["standings", "home"],
    queryFn: async () => {
      const res = await fetch("/api/standings");
      return res.json().then((j) => j.data);
    },
  });
  const { data: videosData } = useQuery<{ videos: Video[] }>({
    queryKey: ["videos", "home"],
    queryFn: async () => {
      const res = await fetch("/api/videos");
      return res.json().then((j) => j.data);
    },
  });

  const matches = matchesData?.matches ?? [];
  const liveNow = matches.filter((m) => m.status === "LIVE" || live.matches.some((lm) => lm.id === m.id));
  const upcoming = matches.filter((m) => m.status === "SCHEDULED").slice(0, 4);
  const recent = matches
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => +new Date(b.kickoff) - +new Date(a.kickoff))
    .slice(0, 4);
  const heroMatch = matches.find((m) => m.featured && m.status === "SCHEDULED") ?? upcoming[0] ?? liveNow[0];
  const articles = newsData?.articles ?? [];
  const featured = articles.find((a) => a.featured) ?? articles[0];
  const restNews = articles.filter((a) => a.id !== featured?.id).slice(0, 4);
  const standings = standingsData?.standings ?? [];
  const videos = videosData?.videos ?? [];
  const heroLive = heroMatch ? live.matches.find((m) => m.id === heroMatch.id) : undefined;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-5 sm:px-6 sm:pt-7">
      {/* ═══════════ MATCHDAY HERO — cinematic billboard ═══════════ */}
      <section
        className="noise stadium-panel pitch-pattern reveal relative overflow-hidden rounded-3xl border border-border/70 p-6 sm:p-8 lg:p-10"
        aria-label="Featured section"
      >
        {/* Floodlight glow */}
        <span className="floodlight pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.04fr_0.96fr]">
          {/* Editorial block */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3.5 py-1.5 text-[11px] font-bold text-primary backdrop-blur-sm">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Bangladesh's Football Network
            </span>
            <h1 className="display-hero mt-5 text-[2rem] leading-[1.12] text-foreground sm:text-[2.6rem] lg:text-[3rem]">
              Live scores. News. Shorts.
              <span className="mt-1 block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                All on one platform.
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              From the BPL to the SAFF Championship — every goal, every transfer, every moment. Fan
              Join the community, share your takes and earn as a creator.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => navigate({ name: "scores" })}
                className="sheen group flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-[0_14px_34px_-12px_var(--primary)] transition-transform hover:scale-[1.03] active:scale-95"
              >
                <Zap className="h-4 w-4" aria-hidden />
                View Live Scores
              </button>
              <button
                onClick={() => navigate({ name: "shorts" })}
                className="flex h-12 items-center gap-2 rounded-full border border-border bg-card/70 px-6 text-sm font-bold text-foreground backdrop-blur-sm transition-all hover:border-primary/50 hover:text-primary active:scale-95"
              >
                <VideoIcon className="h-4 w-4" aria-hidden />
                Watch Shorts
              </button>
            </div>

            {/* Stat strip */}
            <dl className="mt-9 grid max-w-lg grid-cols-3 overflow-hidden rounded-2xl border border-border/70 bg-card/40 backdrop-blur-sm">
              {[
                { v: fmtNum(matches.length), l: "Matches Tracked" },
                { v: fmtCompact(articles.reduce((s, a) => s + a.views, 0)), l: "News Reads" },
                { v: fmtCompact(videos.reduce((s, v) => s + v.views, 0)), l: "Shorts Views" },
              ].map((s, i) => (
                <div key={s.l} className={cn("relative px-4 py-4 text-center", i > 0 && "before:absolute before:inset-y-3 before:left-0 before:w-px before:bg-border/80")}>
                  <dd className="tabular font-display text-2xl font-bold leading-none text-foreground sm:text-[1.7rem]">{s.v}</dd>
                  <dt className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{s.l}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Featured match — broadcast card */}
          {heroMatch && (
            <button
              onClick={() => navigate({ name: "match-detail", id: heroMatch.id })}
              className="card-lift edge-lit group relative w-full overflow-hidden rounded-2xl border border-border/80 bg-card/80 text-left backdrop-blur-md"
              aria-label={`Featured match: ${heroMatch.homeTeam.name} vs ${heroMatch.awayTeam.name}`}
            >
              {/* Comp strip */}
              <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-muted/40 px-5 py-3">
                <span className="flex min-w-0 items-center gap-2 text-xs font-bold text-foreground">
                  <span
                    className="h-2 w-2 rounded-[3px]"
                    style={{ backgroundColor: heroMatch.competition.accentColor ?? "var(--primary)" }}
                    aria-hidden
                  />
                  <span className="truncate">{heroMatch.competition.name}</span>
                  {heroMatch.round && (
                    <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                      {heroMatch.round}
                    </span>
                  )}
                </span>
                {heroMatch.status === "LIVE" || heroLive ? (
                  <LiveBadge minute={heroLive?.minute ?? heroMatch.minute} period={heroLive?.period ?? heroMatch.period} size="sm" />
                ) : (
                  <span className="shrink-0 rounded-md border border-primary/35 bg-primary/10 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-widest text-primary">
                    {heroMatch.competition.shortName}
                  </span>
                )}
              </div>

              {/* Teams + score */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-8 sm:gap-5 sm:py-10">
                <div className="flex flex-col items-center gap-3 text-center">
                  <TeamBadge team={heroMatch.homeTeam} size="hero" />
                  <p className="line-clamp-2 text-[13px] font-bold leading-tight sm:text-sm">{heroMatch.homeTeam.name}</p>
                </div>
                <div className="px-1 text-center">
                  {heroMatch.status === "SCHEDULED" ? (
                    <>
                      <p className="tabular font-display text-4xl font-bold leading-none sm:text-5xl">
                        {formatKickoff(heroMatch.kickoff).time}
                      </p>
                      <p className="mt-3 inline-block rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {formatKickoff(heroMatch.kickoff).relative}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="tabular font-display text-5xl font-bold leading-none text-fhb-red sm:text-6xl">
                        {fmtNum(heroLive?.homeScore ?? heroMatch.homeScore ?? 0)}
                        <span className="mx-2 text-muted-foreground/30">-</span>
                        {fmtNum(heroLive?.awayScore ?? heroMatch.awayScore ?? 0)}
                      </p>
                      <p className="mt-3">
                        <LiveBadge minute={heroLive?.minute ?? heroMatch.minute} period={heroLive?.period ?? heroMatch.period} size="sm" />
                      </p>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-center gap-3 text-center">
                  <TeamBadge team={heroMatch.awayTeam} size="hero" />
                  <p className="line-clamp-2 text-[13px] font-bold leading-tight sm:text-sm">{heroMatch.awayTeam.name}</p>
                </div>
              </div>

              {/* Meta footer */}
              <div className="flex items-center justify-between gap-2 border-t border-border/70 bg-muted/30 px-5 py-3 text-[11px] text-muted-foreground">
                <span className="flex min-w-0 items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
                  <span className="truncate">{heroMatch.venue ?? heroMatch.competition.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-primary/80" aria-hidden />
                  {formatKickoff(heroMatch.kickoff).date}
                  <span className="flex items-center gap-0.5 font-bold text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Match Centre <ChevronRight className="h-3 w-3" aria-hidden />
                  </span>
                </span>
              </div>
            </button>
          )}
        </div>
      </section>

      {/* Header banner ad */}
      <div className="reveal mt-6">
        <AdSlot placement="HEADER_BANNER" />
      </div>

      {/* ═══════════ LIVE NOW ═══════════ */}
      {liveNow.length > 0 && (
        <section className="reveal mt-12" aria-label="Live matches">
          <SectionHeader title="Live Now" accent="red" kicker="live now" icon={<Radio className="h-4 w-4" aria-hidden />} actionLabel="All Scores" actionView={{ name: "scores" }} />
          <div className={cn("grid grid-cols-1 gap-4", liveNow.length > 1 && "sm:grid-cols-2")}>
            {liveNow.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ FIXTURES & RESULTS ═══════════ */}
      <section className="reveal mt-12" aria-label="Fixtures & results">
        <SectionHeader title="Match Centre" kicker="fixtures & results" icon={<Zap className="h-4 w-4" aria-hidden />} actionLabel="All Matches" actionView={{ name: "scores" }} />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="edge-lit min-w-0 rounded-2xl border border-border bg-card/50 p-4 sm:p-5">
            <p className="mb-4 flex items-center gap-2.5 border-b border-border/70 pb-4 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              </span>
              Upcoming
            </p>
            <div className="space-y-3.5">
              {matchesLoading
                ? [1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)
                : upcoming.map((m) => <MatchCard key={m.id} match={m} showCompetition />)}
            </div>
          </div>
          <div className="edge-lit min-w-0 rounded-2xl border border-border bg-card/50 p-4 sm:p-5">
            <p className="mb-4 flex items-center gap-2.5 border-b border-border/70 pb-4 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-fhb-gold/12 text-fhb-gold">
                <Trophy className="h-3.5 w-3.5" aria-hidden />
              </span>
              Latest Results
            </p>
            <div className="space-y-3.5">
              {matchesLoading
                ? [1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)
                : recent.map((m) => <MatchCard key={m.id} match={m} showCompetition />)}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ NEWS — editorial magazine grid ═══════════ */}
      <section className="reveal mt-14" aria-label="Latest news">
        <SectionHeader title="Football News & Transfers" kicker="latest stories" icon={<Newspaper className="h-4 w-4" aria-hidden />} actionLabel="All News" actionView={{ name: "news" }} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured && (
            <div className="reveal sm:col-span-2 lg:h-[440px]">
              <NewsCard article={featured} size="lg" className="h-full min-h-[300px]" />
            </div>
          )}
          {restNews[0] && (
            <div className="reveal">
              <NewsCard article={restNews[0]} />
            </div>
          )}
          {restNews.slice(1, 4).map((a) => (
            <div key={a.id} className="reveal">
              <NewsCard article={a} />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ TRENDING SHORTS ═══════════ */}
      <section className="reveal mt-14" aria-label="Trending shorts">
        <SectionHeader title="Trending Shorts" accent="gold" kicker="fan originals" icon={<Flame className="h-4 w-4" aria-hidden />} actionLabel="All Shorts" actionView={{ name: "shorts" }} />
        <div className="no-scrollbar relative -mx-4 overflow-x-auto px-4 pb-1.5 sm:mx-0 sm:px-0">
          <div className="flex gap-4">
            {videos.slice(0, 8).map((v, i) => (
              <button
                key={v.id}
                onClick={() => navigate({ name: "shorts" })}
                className="card-lift group relative h-64 w-40 shrink-0 overflow-hidden rounded-2xl border border-border sm:h-72 sm:w-44"
                aria-label={`Watch shorts: ${v.title}`}
              >
                {v.thumbnailUrl && (
                  <Image
                    src={v.thumbnailUrl}
                    alt={v.title}
                    fill
                    sizes="176px"
                    className="img-zoom object-cover"
                    unoptimized
                  />
                )}
                {/* Rank chip */}
                <span
                  className={cn(
                    "tabular absolute left-2.5 top-2.5 rounded-lg px-2 py-1 font-display text-[11px] font-bold backdrop-blur-md",
                    i === 0 ? "bg-fhb-gold/90 text-black" : "bg-black/60 text-white"
                  )}
                >
                  #{fmtNum(i + 1)}
                </span>
                {/* Play button */}
                <span
                  className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:opacity-100"
                  aria-hidden
                >
                  <Play className="h-5 w-5 fill-white" />
                </span>
                <div className="photo-scrim absolute inset-0" aria-hidden />
                <div className="absolute inset-x-3 bottom-3 text-left">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-white">{v.title}</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-white/70">
                    <Play className="h-2.5 w-2.5 fill-white/70" aria-hidden /> {fmtCompact(v.views)} views
                  </p>
                </div>
              </button>
            ))}
          </div>
          <span className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" aria-hidden />
        </div>
      </section>

      {/* ═══════════ STANDINGS + SIDEBAR ═══════════ */}
      <section className="reveal mt-14 grid gap-6 lg:grid-cols-3" aria-label="League table">
        <div className="lg:col-span-2">
          <SectionHeader title="BPL Points Table" kicker="league table" icon={<Trophy className="h-4 w-4" aria-hidden />} actionLabel="Full Table" actionView={{ name: "standings" }} />
          <StandingsTable standings={standings} compact limit={6} />
        </div>
        <div className="space-y-5">
          <AdSlot placement="SIDEBAR" />
          <TopScorersMini />
        </div>
      </section>

      {/* ═══════════ PREMIUM BANNER — cinematic gold ═══════════ */}
      <section className="reveal mt-14" aria-label="Premium membership">
        <button
          onClick={() => navigate({ name: "premium" })}
          className="noise gold-panel group relative flex w-full flex-col gap-6 overflow-hidden rounded-3xl border border-fhb-gold/25 p-6 text-left sm:flex-row sm:items-center sm:p-8"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-fhb-gold/30 bg-fhb-gold/15 text-fhb-gold">
            <Crown className="h-7 w-7" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-[10px] text-fhb-gold">FHB Premium</p>
            <h3 className="mt-1.5 text-xl font-bold leading-tight text-foreground sm:text-2xl">
              An ad-free experience, <span className="gold-text">exclusive</span> transfer news and HD highlights
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              Starting at just Tk 99/month — with even bigger earning opportunities for creators.
            </p>
          </div>
          <span className="sheen flex h-12 shrink-0 items-center gap-2 self-start rounded-full bg-fhb-gold px-6 text-sm font-bold text-black transition-transform group-hover:scale-[1.04] sm:self-center">
            Upgrade
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </span>
        </button>
      </section>

      {/* ═══════════ COMMUNITY CTA ═══════════ */}
      <section className="reveal mt-6" aria-label="Fan community">
        <button
          onClick={() => navigate({ name: "community" })}
          className="card-lift group relative flex w-full items-center gap-5 overflow-hidden rounded-2xl border border-border bg-card p-5 text-left sm:p-6"
        >
          <span className="flex h-13 w-13 h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Users className="h-6 w-6" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold text-foreground sm:text-lg">Fan Community</span>
            <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">
              community — share your takes and join the discussion, a home for Bangladesh's football fans.
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1.5 group-hover:text-primary" aria-hidden />
        </button>
      </section>

      {/* In-feed ad */}
      <div className="reveal mt-8">
        <AdSlot placement="IN_FEED" />
      </div>
    </div>
  );
}

function TopScorersMini() {
  const { data } = useQuery<{ topScorers: Array<{ id: string; name: string; goals: number; team: TeamRef | null }> }>({
    queryKey: ["topscorers", "home"],
    queryFn: async () => {
      const res = await fetch("/api/standings");
      return res.json().then((j) => j.data);
    },
  });
  const scorers = (data?.topScorers ?? []).slice(0, 5);
  const navigate = useAppStore((s) => s.navigate);
  if (scorers.length === 0) return null;
  return (
    <div className="edge-lit overflow-hidden rounded-2xl border border-border bg-card">
      <p className="flex items-center gap-2.5 border-b border-border bg-muted/40 px-4 py-3.5 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-fhb-gold/15 text-fhb-gold">
          <Goal className="h-3.5 w-3.5" aria-hidden />
        </span>
        Top Scorers
      </p>
      <div className="divide-y divide-border/50">
        {scorers.map((p, i) => (
          <button
            key={p.id}
            onClick={() => navigate({ name: "player-detail", id: p.id })}
            className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
          >
            <span
              className={
                "tabular flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-display text-[11px] font-bold " +
                (i === 0 ? "bg-fhb-gold/20 text-fhb-gold" : i < 3 ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground")
              }
            >
              {fmtNum(i + 1)}
            </span>
            {p.team && <TeamBadge team={p.team} size="xs" />}
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground group-hover:text-primary">{p.name}</span>
            <span className="tabular shrink-0 rounded-md bg-primary/10 px-2 py-0.5 font-display text-sm font-bold text-primary">
              {fmtNum(p.goals)}
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={() => navigate({ name: "standings" })}
        className="flex w-full items-center justify-center gap-1 border-t border-border py-3 text-[11px] font-bold text-primary transition-colors hover:bg-primary/5"
      >
        Full list <ChevronRight className="h-3 w-3" aria-hidden />
      </button>
    </div>
  );
}
