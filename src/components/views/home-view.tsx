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
import { TeamCrest } from "@/components/football/team-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKickoff, fmtNum, fmtCompact, timeAgo } from "@/lib/format";
import { TacticalPitch } from "@/components/football/tactical-pitch";
import {
  Zap, Newspaper, Video as VideoIcon, Flame, Play, ChevronRight,
  Trophy, Users, Crown, Goal, Tv, Clock, CalendarDays, ArrowRight,
  TrendingUp, Globe, Radio, Wifi, Star, ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Section header — The Athletic / Sky Sports style */
function SectionLabel({
  label, accent = "red", action, onAction, className,
}: {
  label: string; accent?: "red" | "gold" | "blue" | "green";
  action?: string; onAction?: () => void; className?: string;
}) {
  const colors = {
    red: "bg-[#ff1e46] shadow-[0_0_8px_#ff1e46]",
    gold: "bg-amber-400 shadow-[0_0_8px_#fbbf24]",
    blue: "bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]",
    green: "bg-[#00e676] shadow-[0_0_8px_#00e676]",
  };
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div className="flex items-center gap-3">
        <div className={cn("h-5 w-1.5 rounded-full shrink-0", colors[accent])} aria-hidden />
        <h2 className="text-[16px] font-black uppercase tracking-[0.06em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {label}
        </h2>
      </div>
      {action && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wider text-white transition-all hover:text-[#00e5ff]"
        >
          {action} <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function HomeView() {
  const navigate = useAppStore((s) => s.navigate);
  const language = useAppStore((s) => s.language);
  const live = useLiveScores();
  useReveal();
  const [dayOffset, setDayOffset] = useState(0);
  const [newsTab, setNewsTab] = useState<"all" | "bd" | "world" | "transfers">("all");

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
      const res = await fetch("/api/news?limit=12");
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
  const upcoming = matches.filter((m) => m.status === "SCHEDULED").slice(0, 6);
  const recent = matches
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => +new Date(b.kickoff) - +new Date(a.kickoff))
    .slice(0, 6);
  const heroMatch =
    matches.find((m) => m.featured && m.status === "SCHEDULED") ??
    (liveNow.length > 0 ? liveNow[0] : undefined) ??
    upcoming[0];

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
      .slice(0, 10);
  }, [matches, dayOffset]);

  const articles = newsData?.articles ?? [];
  const leadStory = articles.find((a) => a.featured) ?? articles[0];
  const secondaryNews = articles.filter((a) => a.id !== leadStory?.id).slice(0, 6);
  const mostRead = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);
  const standings = standingsData?.standings ?? [];
  const videos = videosData?.videos ?? [];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">

      {/* ══════════ HERO SECTION — Full editorial lead ══════════ */}
      <section className="reveal mb-8" aria-label="Featured">
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Lead Story — Full image hero */}
          {leadStory && (
            <button
              onClick={() => navigate({ name: "news-detail", id: leadStory.id })}
              className="group relative lg:col-span-7 overflow-hidden rounded-md border border-white/15 bg-[#090d19] min-h-[360px] text-left shadow-2xl transition-all hover:border-white/35"
              aria-label={leadStory.title}
            >
              {leadStory.coverUrl ? (
                <Image
                  src={leadStory.coverUrl}
                  alt={leadStory.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover brightness-[0.7] transition-transform duration-700 group-hover:scale-[1.03]"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 carbon-panel" />
              )}
              <div className="photo-scrim absolute inset-0" />
              {/* Category badge */}
              <span className="absolute left-4 top-4 z-10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white bg-[#ff1e46] rounded-sm shadow-[0_0_10px_rgba(255,30,70,0.5)]">
                {leadStory.category}
              </span>
              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
                <h2 className="mb-2.5 font-black text-white leading-tight text-[24px] sm:text-[30px] lg:text-[28px] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] line-clamp-3">
                  {leadStory.title}
                </h2>
                <p className="mb-4 line-clamp-2 text-[14px] text-[#f1f5f9] font-medium leading-relaxed hidden sm:block">
                  {leadStory.excerpt}
                </p>
                <div className="flex items-center gap-3.5 text-[12px] text-white font-bold">
                  <span className="text-[#00e5ff]">{leadStory.author.name}</span>
                  <span className="text-white/40">·</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[#ff1e46]" /> {timeAgo(leadStory.createdAt)}</span>
                  <span className="text-white/40">·</span>
                  <span>{fmtCompact(leadStory.views)} views</span>
                </div>
              </div>
            </button>
          )}

          {/* Right column — featured match + 2 secondary news */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            {heroMatch && <MatchCard match={heroMatch} className="flex-shrink-0" />}
            {secondaryNews.slice(0, 2).map((a) => (
              <NewsCard key={a.id} article={a} size="compact" className="border border-white/12 bg-[#090d19] shadow-md" />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ LEADERBOARD AD ══════════ */}
      <div className="reveal mb-8">
        <AdSlot placement="HEADER_BANNER" className="h-[90px]" />
      </div>

      {/* ══════════ LIVE SCORES + FIXTURES ══════════ */}
      <section className="reveal mb-8 grid gap-5 lg:grid-cols-12" aria-label="Scores and Fixtures">
        {/* Main Scores Column */}
        <div className="lg:col-span-8">
          <SectionLabel
            label="Scores & Fixtures"
            accent="red"
            action="All Matches"
            onAction={() => navigate({ name: "scores" })}
          />

          <div className="rounded-md border border-white/12 bg-[#090d19] shadow-xl overflow-hidden">
            {/* Date pill rail */}
            <div className="flex items-center gap-0 border-b border-white/12 bg-[#050812] px-0">
              {[
                { label: "Yesterday", offset: -1 },
                { label: "Today", offset: 0 },
                { label: "Tomorrow", offset: 1 },
              ].map((d) => (
                <button
                  key={d.label}
                  onClick={() => setDayOffset(d.offset)}
                  className={cn(
                    "flex-1 py-3 text-[12px] font-black uppercase tracking-wider transition-all",
                    dayOffset === d.offset
                      ? "bg-[#ff1e46] text-white shadow-[0_0_12px_rgba(255,30,70,0.5)]"
                      : "text-white font-extrabold hover:text-white hover:bg-white/10"
                  )}
                >
                  {d.label}
                </button>
              ))}
              {liveNow.length > 0 && (
                <div className="flex shrink-0 items-center gap-1.5 px-4 text-[11px] font-black text-white bg-red-600/30 uppercase tracking-widest">
                  <span className="live-dot h-2 w-2 rounded-full bg-[#ff1e46]" />
                  {fmtNum(liveNow.length)} LIVE
                </div>
              )}
            </div>

            {/* Match rows */}
            {matchesLoading ? (
              <div className="space-y-px">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-none bg-white/[0.03]" />
                ))}
              </div>
            ) : dayMatches.length > 0 ? (
              <div className="divide-y divide-white/10">
                {dayMatches.map((m) => <MatchRow key={m.id} match={m} showCompetition />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <CalendarDays className="h-9 w-9 text-white/30" />
                <p className="text-[14px] font-extrabold text-white">No matches scheduled</p>
                <p className="text-[12px] text-[#cbd5e1] font-medium">
                  {dayOffset === -1 ? "Yesterday" : dayOffset === 1 ? "Tomorrow" : "Today"} has no fixtures.
                </p>
              </div>
            )}

            <button
              onClick={() => navigate({ name: "scores" })}
              className="flex w-full items-center justify-center gap-1.5 border-t border-white/10 py-3 text-[12px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:text-[#00e5ff]"
            >
              View all fixtures <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5 lg:col-span-4">
          {/* Live now */}
          {liveNow.length > 0 && (
            <div className="rounded-md border border-[#ff1e46]/40 bg-[#0c1224] shadow-xl overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[#ff1e46]/30 bg-[#ff1e46]/20 px-4 py-2.5">
                <span className="live-dot h-2 w-2 rounded-full bg-[#ff1e46]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-white">
                  Live Now · {fmtNum(liveNow.length)} Match{liveNow.length !== 1 ? "es" : ""}
                </span>
              </div>
              <div className="divide-y divide-white/10">
                {liveNow.slice(0, 4).map((m) => <MatchRow key={m.id} match={m} showCompetition={false} />)}
              </div>
              <button
                onClick={() => navigate({ name: "scores" })}
                className="flex w-full items-center justify-center gap-1 border-t border-white/10 py-2.5 text-[11px] font-black uppercase tracking-widest text-white bg-red-600/20 transition-colors hover:bg-red-600/40"
              >
                All live <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Next Up */}
          <div className="rounded-md border border-white/12 bg-[#090d19] shadow-xl overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/12 bg-[#050812] px-4 py-2.5">
              <CalendarDays className="h-4 w-4 text-[#ff1e46]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-white">Next Up</span>
            </div>
            <div className="divide-y divide-white/10">
              {upcoming.slice(0, 5).map((m) => <MatchRow key={m.id} match={m} showCompetition />)}
            </div>
            <button
              onClick={() => navigate({ name: "scores" })}
              className="flex w-full items-center justify-center gap-1 border-t border-white/10 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:text-[#00e5ff]"
            >
              Full fixture list <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Sidebar Ad */}
          <AdSlot placement="SIDEBAR" className="min-h-[200px]" />
        </div>
      </section>

      {/* ══════════ NEWS GRID — The Athletic style ══════════ */}
      <section className="reveal mb-8" aria-label="Football News">
        <SectionLabel
          label="Football News"
          accent="red"
          action="All News"
          onAction={() => navigate({ name: "news" })}
        />

        {/* Category filter tabs */}
        <div className="mb-5 flex items-center gap-0 border-b border-white/12 overflow-x-auto no-scrollbar">
          {[
            { key: "all", label: "All News" },
            { key: "bd", label: "Bangladesh Football" },
            { key: "world", label: "World Football" },
            { key: "transfers", label: "Transfer Radar" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setNewsTab(tab.key as typeof newsTab)}
              className={cn(
                "shrink-0 pb-3 pt-1.5 px-5 text-[12.5px] font-extrabold uppercase tracking-wider border-b-2 transition-all",
                newsTab === tab.key
                  ? "border-[#ff1e46] text-white shadow-[0_2px_8px_rgba(255,30,70,0.5)]"
                  : "border-transparent text-[#cbd5e1] hover:text-white hover:bg-white/10"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          {/* Main news column */}
          <div className="lg:col-span-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {secondaryNews.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>

          {/* Most Read rail */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-md border border-white/12 bg-[#090d19] shadow-xl overflow-hidden">
              <div className="flex items-center gap-2 border-b border-white/12 bg-[#050812] px-4 py-2.5">
                <Flame className="h-4 w-4 text-[#ff1e46]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-white">Most Read</span>
              </div>
              <div className="divide-y divide-white/10">
                {mostRead.map((a, i) => (
                  <button
                    key={a.id}
                    onClick={() => navigate({ name: "news-detail", id: a.id })}
                    className="group flex w-full items-start gap-3.5 px-4 py-3.5 text-left transition-all hover:bg-white/10"
                  >
                    <span className={cn(
                      "tabular w-7 shrink-0 font-black text-[22px] leading-none",
                      i === 0 ? "text-[#ff1e46] drop-shadow-[0_0_8px_rgba(255,30,70,0.5)]" : "text-white"
                    )}>
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-[13px] font-extrabold leading-snug text-white transition-colors group-hover:text-[#00e5ff]">
                        {a.title}
                      </span>
                      <span className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold text-[#cbd5e1]">
                        <Clock className="h-3 w-3 text-[#ff1e46]" /> {timeAgo(a.createdAt)}
                        <span>·</span>
                        {fmtCompact(a.views)} reads
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* In-feed ad */}
            <AdSlot placement="IN_FEED" />
          </aside>
        </div>
      </section>

      {/* ══════════ LEAGUE TABLE + TOP SCORERS ══════════ */}
      <section className="reveal mb-8 grid gap-5 lg:grid-cols-12" aria-label="League Standings">
        <div className="lg:col-span-8">
          <SectionLabel
            label="BFL Points Table"
            accent="green"
            action="Full Table"
            onAction={() => navigate({ name: "standings" })}
          />
          <StandingsTable standings={standings} compact limit={8} />
        </div>
        <div className="lg:col-span-4 space-y-5">
          <TopScorersMini />
          <AdSlot placement="IN_FEED" />
        </div>
      </section>

      {/* ══════════ TACTICAL PITCH ══════════ */}
      {heroMatch && (
        <section className="reveal mb-8" aria-label="Tactical Analysis">
          <SectionLabel
            label="Matchday Tactical Analysis"
            accent="blue"
            action="Match Centre"
            onAction={() => navigate({ name: "match-detail", id: heroMatch.id })}
          />
          <TacticalPitch
            homeTeam={heroMatch.homeTeam}
            awayTeam={heroMatch.awayTeam}
            homeFormation="4-3-3"
            awayFormation="4-2-3-1"
          />
        </section>
      )}

      {/* ══════════ TRENDING SHORTS ══════════ */}
      {videos.length > 0 && (
        <section className="reveal mb-8" aria-label="Trending shorts">
          <SectionLabel
            label="Trending Shorts"
            accent="gold"
            action="All Shorts"
            onAction={() => navigate({ name: "shorts" })}
          />
          <div className="no-scrollbar relative -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            <div className="flex gap-3">
              {videos.slice(0, 10).map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => navigate({ name: "shorts" })}
                  className="group relative h-[220px] w-[130px] shrink-0 overflow-hidden border border-white/[0.07] bg-[#0d0d10] sm:h-[240px] sm:w-[145px]"
                  aria-label={`Watch: ${v.title}`}
                >
                  {v.thumbnailUrl && (
                    <Image
                      src={v.thumbnailUrl}
                      alt={v.title}
                      fill
                      sizes="145px"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      unoptimized
                    />
                  )}
                  {/* Rank badge */}
                  <span className={cn(
                    "absolute left-2 top-2 px-1.5 py-0.5 font-black text-[10px]",
                    i === 0 ? "bg-amber-500 text-black" : "bg-black/70 text-white/90 backdrop-blur-sm"
                  )}>
                    #{i + 1}
                  </span>
                  {/* Play button */}
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="flex h-11 w-11 items-center justify-center bg-red-600/90 backdrop-blur-sm">
                      <Play className="h-5 w-5 fill-white text-white" />
                    </span>
                  </span>
                  <div className="photo-scrim absolute inset-0" />
                  <div className="absolute inset-x-2 bottom-2.5 text-left">
                    <p className="line-clamp-2 text-[11px] font-bold leading-snug text-white">{v.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-[9.5px] text-white/50">
                      <Play className="h-2.5 w-2.5 fill-white/50" /> {fmtCompact(v.views)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════ LIVE TV + PREMIUM BAND ══════════ */}
      <section className="reveal mb-6 grid gap-3 lg:grid-cols-2" aria-label="Live TV and Premium">
        {/* Live TV card */}
        <button
          onClick={() => navigate({ name: "live-tv" })}
          className="carbon-panel pitch-pattern group relative flex gap-5 overflow-hidden border border-white/[0.07] p-5 text-left transition-all hover:border-red-500/30 sm:items-center"
        >
          {/* Background TV glow */}
          <div className="absolute inset-0 stadium-glow-red pointer-events-none" />
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center bg-red-600/15 text-red-400">
            <Tv className="h-6 w-6" />
          </span>
          <span className="relative min-w-0 flex-1">
            <span className="mb-1 flex items-center gap-2">
              <span className="text-[15px] font-black text-white">Live TV — 13 Channels</span>
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
            </span>
            <span className="block text-[12.5px] text-white/45 leading-relaxed">
              BFL nights, European matchdays and 24/7 football — multi-server streaming.
            </span>
          </span>
          <span className="relative flex h-10 shrink-0 items-center gap-2 bg-red-600 px-4 text-[11px] font-black text-white transition-transform group-hover:scale-[1.03] self-start sm:self-center sheen">
            <Play className="h-3.5 w-3.5 fill-white" /> Watch Live
          </span>
        </button>

        {/* Premium card */}
        <button
          onClick={() => navigate({ name: "premium" })}
          className="gold-panel group relative flex gap-5 overflow-hidden border border-amber-500/20 p-5 text-left transition-all hover:border-amber-500/40 sm:items-center"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-amber-500/20 bg-amber-500/10 text-amber-400">
            <Crown className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="eyebrow text-[9px] text-amber-500 mb-1 block">FHB Premium</span>
            <span className="block text-[15px] font-black text-white mb-1">
              Ad-free football from <span className="gold-text">Tk 99/month</span>
            </span>
            <span className="block text-[12.5px] text-white/45">
              Exclusive transfers, HD highlights, bigger creator earnings.
            </span>
          </span>
          <span className="flex h-10 shrink-0 items-center gap-2 bg-amber-500 px-4 text-[11px] font-black text-black transition-transform group-hover:scale-[1.03] self-start sm:self-center">
            Upgrade <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </button>
      </section>

      {/* ══════════ COMMUNITY CTA ══════════ */}
      <section className="reveal mb-6" aria-label="Community">
        <button
          onClick={() => navigate({ name: "community" })}
          className="group relative flex w-full items-center gap-5 border border-white/[0.07] bg-[#0d0d10] p-5 text-left transition-colors hover:border-white/15 hover:bg-white/[0.02]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-blue-600/10 text-blue-400">
            <Users className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-black text-white">Join the Fan Community</span>
            <span className="mt-1 block text-[12.5px] text-white/45">
              Share your takes, react to every matchday and connect with fans across Bangladesh.
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-white/60" />
        </button>
      </section>

      {/* Sticky footer ad on mobile */}
      <AdSlot placement="STICKY_FOOTER" />
    </div>
  );
}

function TopScorersMini() {
  const { data } = useQuery<{ topScorers: Array<{ id: string; name: string; goals: number; photoUrl?: string | null; team: TeamRef | null }> }>({
    queryKey: ["topscorers", "home"],
    queryFn: async () => {
      const res = await fetch("/api/standings");
      return res.json().then((j) => j.data);
    },
  });
  const scorers = (data?.topScorers ?? []).slice(0, 6);
  const navigate = useAppStore((s) => s.navigate);
  if (scorers.length === 0) return null;

  return (
    <div className="rounded-md border border-white/12 bg-[#090d19] shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/12 bg-[#050812] px-4 py-2.5">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-400/20 text-amber-300">
          <Goal className="h-3.5 w-3.5 text-amber-300" />
        </span>
        <span className="text-[11px] font-black uppercase tracking-widest text-white">Top Scorers</span>
      </div>
      <div className="divide-y divide-white/10">
        {scorers.map((p, i) => (
          <button
            key={p.id}
            onClick={() => navigate({ name: "player-detail", id: p.id })}
            className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-white/10 cursor-pointer"
          >
            <span className={cn(
              "tabular flex h-6 w-6 shrink-0 items-center justify-center rounded font-black text-[12px]",
              i === 0 ? "bg-amber-400 text-black shadow-sm" : i < 3 ? "bg-[#ff1e46] text-white shadow-sm" : "bg-white/10 text-white"
            )}>
              {i + 1}
            </span>
            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/20 bg-slate-800">
              {p.photoUrl ? (
                <img src={p.photoUrl} alt={p.name} className="h-full w-full object-cover object-top" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[9px] font-black text-white">
                  {p.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            {p.team && <TeamCrest team={p.team} size="xs" />}
            <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-white transition-colors group-hover:text-[#00e5ff]">
              {p.name}
            </span>
            <span className="tabular shrink-0 font-black text-[15px] text-white px-2 py-0.5 rounded bg-white/10">
              {fmtNum(p.goals)}
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={() => navigate({ name: "standings" })}
        className="flex w-full items-center justify-center gap-1.5 border-t border-white/10 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:text-[#00e5ff]"
      >
        Full list <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
