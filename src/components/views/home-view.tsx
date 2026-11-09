"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useAppStore } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
import { useReveal } from "@/hooks/use-reveal";
import type { Match, NewsArticle, Standing, Video, TeamRef } from "@/lib/types";
import { MatchCard, MatchRow } from "@/components/football/match-card";
import { StandingsTable } from "@/components/football/standings-table";
import { NewsCard } from "@/components/football/news-card";
import { AdSlot } from "@/components/football/ad-slot";
import { SectionHeader } from "@/components/football/section-header";
import { TeamCrest } from "@/components/football/team-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKickoff, fmtNum, fmtCompact, timeAgo } from "@/lib/format";
import {
  Zap, Newspaper, Video as VideoIcon, Flame, Play, ChevronRight,
  Trophy, Users, Crown, Goal, Tv, Clock, CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeView() {
  const navigate = useAppStore((s) => s.navigate);
  const live = useLiveScores();
  useReveal();
  const [dayOffset, setDayOffset] = useState(0); // -1 yesterday, 0 today, 1 tomorrow

  const { data: matchesData, isLoading: matchesLoading } = useQuery<{ matches: Match[] }>({
    queryKey: ["matches", "home"],
    queryFn: async () => {
      const res = await fetch("/api/matches?status=ALL&days=60&limit=120");
      return res.json().then((j) => j.data);
    },
  });
  const { data: newsData } = useQuery<{ articles: NewsArticle[] }>({
    queryKey: ["news", "home"],
    queryFn: async () => {
      const res = await fetch("/api/news?limit=8");
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
  const heroMatch =
    matches.find((m) => m.featured && m.status === "SCHEDULED") ??
    (liveNow.length > 0 ? liveNow[0] : undefined) ??
    upcoming[0];

  // day-filtered match list for the scores strip
  const dayMatches = useMemo(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const target = base.getTime() + dayOffset * 864e5;
    return matches
      .filter((m) => {
        const d = new Date(m.kickoff);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === target;
      })
      .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff))
      .slice(0, 8);
  }, [matches, dayOffset]);

  const articles = newsData?.articles ?? [];
  const leadStory = articles.find((a) => a.featured) ?? articles[0];
  const secondaryNews = articles.filter((a) => a.id !== leadStory?.id).slice(0, 5);
  const mostRead = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);
  const standings = standingsData?.standings ?? [];
  const videos = videosData?.videos ?? [];

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      {/* ═══════════ HERO — featured match + lead story ═══════════ */}
      <section className="grid gap-4 lg:grid-cols-12" aria-label="Featured">
        {heroMatch && (
          <div className="reveal lg:col-span-5">
            <MatchCard match={heroMatch} className="h-full" />
          </div>
        )}
        {leadStory && (
          <div className="reveal lg:col-span-7">
            <NewsCard article={leadStory} size="lg" className="h-full min-h-[320px]" />
          </div>
        )}
      </section>

      {/* ═══════════ MATCHDAY — date rail + dense rows + side rail ═══════════ */}
      <section className="reveal mt-8 grid gap-6 lg:grid-cols-12" aria-label="Matchday scores">
        <div className="lg:col-span-8">
          <SectionHeader
            title="Matchday Scores"
            kicker="live scores"
            accent={liveNow.length > 0 ? "red" : "primary"}
            icon={<Zap className="h-3.5 w-3.5" aria-hidden />}
            actionLabel="All Matches"
            actionView={{ name: "scores" }}
          />
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {/* Date rail */}
            <div className="flex items-center gap-1 border-b border-border bg-muted/30 px-3 py-2">
              {[
                { label: "Yesterday", offset: -1 },
                { label: "Today", offset: 0 },
                { label: "Tomorrow", offset: 1 },
              ].map((d) => (
                <button
                  key={d.label}
                  onClick={() => setDayOffset(d.offset)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[11.5px] font-semibold transition-colors",
                    dayOffset === d.offset
                      ? "bg-elevated text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                  )}
                  aria-pressed={dayOffset === d.offset}
                >
                  {d.label}
                </button>
              ))}
              <span className="ml-auto hidden items-center gap-1.5 text-[10.5px] text-muted-foreground sm:flex">
                {liveNow.length > 0 ? (
                  <>
                    <span className="live-dot h-1.5 w-1.5 rounded-full bg-fhb-red" aria-hidden />
                    {fmtNum(liveNow.length)} live right now
                  </>
                ) : (
                  "All times BST (UTC+6)"
                )}
              </span>
            </div>
            {/* Rows */}
            {matchesLoading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : dayMatches.length > 0 ? (
              <div className="divide-y divide-border/60">
                {dayMatches.map((m) => (
                  <MatchRow key={m.id} match={m} showCompetition />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <p className="text-sm font-semibold text-foreground">No matches scheduled</p>
                <p className="text-xs text-muted-foreground">
                  {dayOffset === -1 ? "Yesterday" : dayOffset === 1 ? "Tomorrow" : "Today"} has no fixtures in the calendar.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Side rail — live now + next up */}
        <div className="space-y-4 lg:col-span-4">
          {liveNow.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-fhb-red/30 bg-card">
              <p className="flex items-center gap-2 border-b border-border bg-fhb-red/[0.07] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-fhb-red">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-fhb-red" aria-hidden />
                Live Now — {fmtNum(liveNow.length)}
              </p>
              <div className="divide-y divide-border/60">
                {liveNow.slice(0, 3).map((m) => (
                  <MatchRow key={m.id} match={m} showCompetition={false} />
                ))}
              </div>
              <button
                onClick={() => navigate({ name: "scores" })}
                className="flex w-full items-center justify-center gap-1 border-t border-border py-2.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/5"
              >
                All live matches <ChevronRight className="h-3 w-3" aria-hidden />
              </button>
            </div>
          )}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <p className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden />
              Next Up
            </p>
            <div className="divide-y divide-border/60">
              {upcoming.slice(0, 4).map((m) => (
                <MatchRow key={m.id} match={m} showCompetition />
              ))}
            </div>
            <button
              onClick={() => navigate({ name: "scores" })}
              className="flex w-full items-center justify-center gap-1 border-t border-border py-2.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/5"
            >
              Full fixture list <ChevronRight className="h-3 w-3" aria-hidden />
            </button>
          </div>
          <AdSlot placement="SIDEBAR" />
        </div>
      </section>

      {/* Header banner ad */}
      <div className="reveal mt-8">
        <AdSlot placement="HEADER_BANNER" />
      </div>

      {/* ═══════════ NEWS — editorial grid + most read ═══════════ */}
      <section className="reveal mt-8" aria-label="Latest news">
        <SectionHeader
          title="Football News & Transfers"
          kicker="latest stories"
          icon={<Newspaper className="h-3.5 w-3.5" aria-hidden />}
          actionLabel="All News"
          actionView={{ name: "news" }}
        />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-2">
            {secondaryNews.slice(0, 4).map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
          {/* Most read rail */}
          <aside className="lg:col-span-4">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <p className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-foreground">
                <Flame className="h-3.5 w-3.5 text-fhb-red" aria-hidden />
                Most Read
              </p>
              <div className="divide-y divide-border/50">
                {mostRead.map((a, i) => (
                  <button
                    key={a.id}
                    onClick={() => navigate({ name: "news-detail", id: a.id })}
                    className="group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <span
                      className={cn(
                        "tabular font-display text-xl font-bold leading-none",
                        i === 0 ? "text-primary" : "text-muted-foreground/60"
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {a.title}
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" aria-hidden /> {timeAgo(a.createdAt)} · {fmtCompact(a.views)} reads
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <AdSlot placement="IN_FEED" />
            </div>
          </aside>
        </div>
      </section>

      {/* ═══════════ STANDINGS + TOP SCORERS ═══════════ */}
      <section className="reveal mt-8 grid gap-6 lg:grid-cols-12" aria-label="League table">
        <div className="lg:col-span-8">
          <SectionHeader
            title="BFL Points Table"
            kicker="bangladesh football league"
            icon={<Trophy className="h-3.5 w-3.5" aria-hidden />}
            actionLabel="Full Table"
            actionView={{ name: "standings" }}
          />
          <StandingsTable standings={standings} compact limit={6} />
        </div>
        <div className="space-y-4 lg:col-span-4">
          <TopScorersMini />
        </div>
      </section>

      {/* ═══════════ TRENDING SHORTS ═══════════ */}
      {videos.length > 0 && (
        <section className="reveal mt-8" aria-label="Trending shorts">
          <SectionHeader
            title="Trending Shorts"
            accent="gold"
            kicker="fan originals"
            icon={<Flame className="h-3.5 w-3.5" aria-hidden />}
            actionLabel="All Shorts"
            actionView={{ name: "shorts" }}
          />
          <div className="no-scrollbar relative -mx-4 overflow-x-auto px-4 pb-1.5 sm:mx-0 sm:px-0">
            <div className="flex gap-3.5">
              {videos.slice(0, 8).map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => navigate({ name: "shorts" })}
                  className="group relative h-60 w-40 shrink-0 overflow-hidden rounded-xl border border-border bg-card sm:h-64 sm:w-44"
                  aria-label={`Watch shorts: ${v.title}`}
                >
                  {v.thumbnailUrl && (
                    <Image
                      src={v.thumbnailUrl}
                      alt={v.title}
                      fill
                      sizes="176px"
                      loading="eager"
                      className="img-zoom object-cover"
                      unoptimized
                    />
                  )}
                  <span
                    className={cn(
                      "tabular absolute left-2.5 top-2.5 rounded-md px-2 py-1 font-display text-[11px] font-bold backdrop-blur-md",
                      i === 0 ? "bg-fhb-gold/90 text-black" : "bg-black/60 text-white"
                    )}
                  >
                    #{i + 1}
                  </span>
                  <span
                    className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:opacity-100"
                    aria-hidden
                  >
                    <Play className="h-5 w-5 fill-white" />
                  </span>
                  <div className="photo-scrim absolute inset-0" aria-hidden />
                  <div className="absolute inset-x-3 bottom-3 text-left">
                    <p className="line-clamp-2 text-xs font-semibold leading-snug text-white">{v.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[10px] text-white/70">
                      <Play className="h-2.5 w-2.5 fill-white/70" aria-hidden /> {fmtCompact(v.views)} views
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <span className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" aria-hidden />
          </div>
        </section>
      )}

      {/* ═══════════ LIVE TV + PREMIUM band ═══════════ */}
      <section className="reveal mt-8 grid gap-4 lg:grid-cols-2" aria-label="Live TV and premium">
        <button
          onClick={() => navigate({ name: "live-tv" })}
          className="stadium-panel pitch-pattern card-lift group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-border p-5 text-left sm:flex-row sm:items-center"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-fhb-red/15 text-fhb-red">
            <Tv className="h-6 w-6" aria-hidden />
          </span>
          <span className="relative min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-foreground sm:text-base">Live TV — 13 channels</span>
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-fhb-red" aria-label="Live" />
            </span>
            <span className="mt-1 block text-[12.5px] leading-relaxed text-muted-foreground">
              BFL nights, European matchdays and 24/7 football channels — multi-server streaming.
            </span>
          </span>
          <span className="flex h-10 shrink-0 items-center gap-2 self-start rounded-lg bg-fhb-red px-4 text-xs font-bold text-white transition-transform group-hover:scale-[1.03] sm:self-center">
            <Play className="h-3.5 w-3.5 fill-white" aria-hidden />
            Watch now
          </span>
        </button>

        <button
          onClick={() => navigate({ name: "premium" })}
          className="gold-panel card-lift group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-fhb-gold/25 p-5 text-left sm:flex-row sm:items-center"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-fhb-gold/25 bg-fhb-gold/15 text-fhb-gold">
            <Crown className="h-6 w-6" aria-hidden />
          </span>
          <span className="relative min-w-0 flex-1">
            <span className="eyebrow text-[10px] text-fhb-gold">FHB Premium</span>
            <span className="mt-0.5 block text-[15px] font-bold leading-snug text-foreground sm:text-base">
              Ad-free football, from <span className="gold-text">Tk 99/month</span>
            </span>
            <span className="mt-1 block text-[12.5px] leading-relaxed text-muted-foreground">
              Exclusive transfer news, HD highlights and bigger creator earnings.
            </span>
          </span>
          <span className="flex h-10 shrink-0 items-center gap-2 self-start rounded-lg bg-fhb-gold px-4 text-xs font-bold text-black transition-transform group-hover:scale-[1.03] sm:self-center">
            Upgrade
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </button>
      </section>

      {/* ═══════════ COMMUNITY CTA ═══════════ */}
      <section className="reveal mt-4" aria-label="Fan community">
        <button
          onClick={() => navigate({ name: "community" })}
          className="card-lift group relative flex w-full items-center gap-4 overflow-hidden rounded-xl border border-border bg-card p-5 text-left"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <Users className="h-6 w-6" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold text-foreground">Join the Fan Community</span>
            <span className="mt-1 block text-[12.5px] leading-relaxed text-muted-foreground">
              Share your takes, react to every matchday and connect with fans across Bangladesh.
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1.5 group-hover:text-primary" aria-hidden />
        </button>
      </section>
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
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <p className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-fhb-gold/15 text-fhb-gold">
          <Goal className="h-3.5 w-3.5" aria-hidden />
        </span>
        Top Scorers
      </p>
      <div className="divide-y divide-border/50">
        {scorers.map((p, i) => (
          <button
            key={p.id}
            onClick={() => navigate({ name: "player-detail", id: p.id })}
            className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
          >
            <span
              className={
                "tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-display text-[11px] font-bold " +
                (i === 0 ? "bg-fhb-gold/20 text-fhb-gold" : i < 3 ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground")
              }
            >
              {i + 1}
            </span>
            {p.team && <TeamCrest team={p.team} size="xs" />}
            <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-foreground group-hover:text-primary">{p.name}</span>
            <span className="tabular shrink-0 rounded-md bg-primary/10 px-2 py-0.5 font-display text-[13px] font-bold text-primary">
              {fmtNum(p.goals)}
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={() => navigate({ name: "standings" })}
        className="flex w-full items-center justify-center gap-1 border-t border-border py-2.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/5"
      >
        Full list <ChevronRight className="h-3 w-3" aria-hidden />
      </button>
    </div>
  );
}
