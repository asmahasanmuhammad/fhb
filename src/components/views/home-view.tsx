"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useAppStore } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
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
import { formatKickoff, toBn, bnCompact } from "@/lib/format";
import { Zap, Trophy, Newspaper, Video as VideoIcon, ChevronRight, Radio, Flame, Play } from "lucide-react";

export function HomeView() {
  const navigate = useAppStore((s) => s.navigate);
  const live = useLiveScores();

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
  const restNews = articles.filter((a) => a.id !== featured?.id).slice(0, 6);
  const standings = standingsData?.standings ?? [];
  const videos = videosData?.videos ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
      {/* ================= HERO ================= */}
      <section className="hero-glow relative overflow-hidden rounded-2xl border bg-card p-5 sm:p-8" aria-label="ফিচার্ড সেকশন">
        <div className="grid items-center gap-6 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary ring-1 ring-primary/30">
              🇧🇩 বাংলাদেশের ফুটবলের ডিজিটাল ঠিকানা
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-wide sm:text-4xl">
              লাইভ স্কোর • নিউজ • শর্টস — <span className="text-gradient-green">সব এক প্ল্যাটফর্মে</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
              বিপিএল থেকে সাফ চ্যাম্পিয়নশিপ — প্রতিটি গোল, প্রতিটি ট্রান্সফার, প্রতিটি মুহূর্ত। ফ্যান কমিউনিটিতে যোগ দিন, নিজের
              মতামত শেয়ার করুন, ক্রিয়েটর হয়ে আয় করুন।
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button onClick={() => navigate({ name: "scores" })} className="gap-1.5 font-bold">
                <Zap className="h-4 w-4" aria-hidden /> লাইভ স্কোর দেখুন
              </Button>
              <Button variant="outline" onClick={() => navigate({ name: "shorts" })} className="gap-1.5">
                <VideoIcon className="h-4 w-4" aria-hidden /> শর্টস দেখুন
              </Button>
            </div>
            {/* quick stats */}
            <div className="mt-6 grid grid-cols-3 gap-2 sm:max-w-md">
              {[
                [toBn(matches.length), "ম্যাচ ট্র্যাকিং"],
                [bnCompact(articles.reduce((s, a) => s + a.views, 0)), "নিউজ রিডস"],
                [bnCompact(videos.reduce((s, v) => s + v.views, 0)), "শর্টস ভিউজ"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-xl border bg-background/60 p-2.5 text-center">
                  <p className="font-display text-xl font-bold text-primary">{v}</p>
                  <p className="text-[10px] text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Featured match card */}
          {heroMatch && (
            <button
              onClick={() => navigate({ name: "match-detail", id: heroMatch.id })}
              className="card-lift group relative overflow-hidden rounded-xl border bg-background/70 p-5 text-left"
              aria-label={`ফিচার্ড ম্যাচ: ${heroMatch.homeTeam.name} বনাম ${heroMatch.awayTeam.name}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold text-fhb-gold">⭐ আসন্ন বড় ম্যাচ</span>
                {heroMatch.status === "LIVE" ? (
                  <LiveBadge minute={heroMatch.minute} period={heroMatch.period} />
                ) : (
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 font-display text-[10px] font-bold text-primary">
                    {heroMatch.competition.name}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-1 flex-col items-center gap-2.5">
                  <TeamBadge team={heroMatch.homeTeam} size="xl" />
                  <p className="line-clamp-2 text-center text-xs font-bold sm:text-sm">{heroMatch.homeTeam.name}</p>
                </div>
                <div className="shrink-0 text-center">
                  {heroMatch.status === "SCHEDULED" ? (
                    <>
                      <p className="font-display text-3xl font-bold">{formatKickoff(heroMatch.kickoff).time}</p>
                      <p className="mt-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {formatKickoff(heroMatch.kickoff).relative}
                      </p>
                    </>
                  ) : (
                    <p className="font-display text-4xl font-bold text-primary">
                      {toBn(heroMatch.homeScore ?? 0)}<span className="mx-1.5 text-muted-foreground/40">-</span>{toBn(heroMatch.awayScore ?? 0)}
                    </p>
                  )}
                </div>
                <div className="flex flex-1 flex-col items-center gap-2.5">
                  <TeamBadge team={heroMatch.awayTeam} size="xl" />
                  <p className="line-clamp-2 text-center text-xs font-bold sm:text-sm">{heroMatch.awayTeam.name}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-[11px] text-muted-foreground">
                <span className="truncate">{heroMatch.venue ?? heroMatch.competition.name}</span>
                <span className="flex shrink-0 items-center gap-1 font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  ম্যাচ সেন্টার <ChevronRight className="h-3 w-3" aria-hidden />
                </span>
              </div>
            </button>
          )}
        </div>
      </section>

      {/* Header banner ad */}
      <div className="mt-6">
        <AdSlot placement="HEADER_BANNER" />
      </div>

      {/* ================= LIVE NOW ================= */}
      {liveNow.length > 0 && (
        <section className="mt-8" aria-label="লাইভ ম্যাচ">
          <SectionHeader title="🔴 এখন লাইভ" icon={<Radio className="h-5 w-5" aria-hidden />} actionLabel="সব স্কোর" actionView={{ name: "scores" }} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {liveNow.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {/* ================= FIXTURES & RESULTS ================= */}
      <section className="mt-8" aria-label="ফিক্সচার ও ফলাফল">
        <SectionHeader title="ফিক্সচার ও সর্বশেষ ফলাফল" icon={<Zap className="h-5 w-5" aria-hidden />} actionLabel="সব ম্যাচ" actionView={{ name: "scores" }} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="min-w-0">
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">আসছে</p>
            <div className="space-y-3">
              {matchesLoading
                ? [1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)
                : upcoming.map((m) => <MatchCard key={m.id} match={m} showCompetition />)}
            </div>
          </div>
          <div className="min-w-0">
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">সর্বশেষ ফলাফল</p>
            <div className="space-y-3">
              {matchesLoading
                ? [1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)
                : recent.map((m) => <MatchCard key={m.id} match={m} showCompetition />)}
            </div>
          </div>
        </div>
      </section>

      {/* ================= NEWS ================= */}
      <section className="mt-10" aria-label="সর্বশেষ নিউজ">
        <SectionHeader title="ফুটবল নিউজ ও ট্রান্সফার" icon={<Newspaper className="h-5 w-5" aria-hidden />} actionLabel="সব নিউজ" actionView={{ name: "news" }} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {featured && (
            <div className="lg:col-span-1">
              <NewsCard article={featured} size="lg" />
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
            {restNews.slice(0, 4).map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= SHORTS PREVIEW ================= */}
      <section className="mt-10" aria-label="ট্রেন্ডিং শর্টস">
        <SectionHeader title="🔥 ট্রেন্ডিং শর্টস" icon={<Flame className="h-5 w-5" aria-hidden />} actionLabel="সব শর্টস" actionView={{ name: "shorts" }} />
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {videos.slice(0, 6).map((v) => (
            <button
              key={v.id}
              onClick={() => navigate({ name: "shorts" })}
              className="card-lift group relative h-56 w-32 shrink-0 overflow-hidden rounded-xl border sm:h-64 sm:w-40"
              aria-label={`শর্টস দেখুন: ${v.title}`}
            >
              {v.thumbnailUrl && (
                <Image src={v.thumbnailUrl} alt={v.title} fill sizes="160px" className="object-cover transition-transform group-hover:scale-105" unoptimized />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />
              <div className="absolute inset-x-2 bottom-2 text-left">
                <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-white">{v.title}</p>
                <p className="mt-1 flex items-center gap-1 text-[9px] text-white/70">
                  <Play className="h-2.5 w-2.5 fill-white" aria-hidden /> {bnCompact(v.views)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ================= STANDINGS + SIDE AD ================= */}
      <section className="mt-10 grid gap-6 lg:grid-cols-3" aria-label="লিগ টেবিল">
        <div className="lg:col-span-2">
          <SectionHeader title="বিপিএল পয়েন্ট টেবিল" icon={<Trophy className="h-5 w-5" aria-hidden />} actionLabel="সম্পূর্ণ টেবিল" actionView={{ name: "standings" }} />
          <StandingsTable standings={standings} compact />
        </div>
        <div className="space-y-4">
          <AdSlot placement="SIDEBAR" />
          {/* top scorers mini */}
          <TopScorersMini />
        </div>
      </section>

      {/* In-feed ad */}
      <div className="mt-8">
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
    <div className="rounded-xl border bg-card p-4">
      <p className="mb-3 font-display text-sm font-bold tracking-wide">⚽ সেরা গোলদাতা</p>
      <div className="space-y-2.5">
        {scorers.map((p, i) => (
          <button
            key={p.id}
            onClick={() => navigate({ name: "player-detail", id: p.id })}
            className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-accent/50"
          >
            <span className="w-5 text-center font-display text-xs font-bold text-muted-foreground">{toBn(i + 1)}</span>
            {p.team && <TeamBadge team={p.team} size="xs" />}
            <span className="min-w-0 flex-1 truncate text-xs font-semibold">{p.name}</span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-display text-xs font-bold text-primary">{toBn(p.goals)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
