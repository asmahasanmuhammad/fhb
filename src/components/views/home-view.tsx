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
import {
  Zap, Newspaper, Video as VideoIcon, Radio, Flame, Play, MapPin,
  CalendarDays, ChevronRight, Trophy, Users, Crown, Goal,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const restNews = articles.filter((a) => a.id !== featured?.id).slice(0, 4);
  const standings = standingsData?.standings ?? [];
  const videos = videosData?.videos ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-5 sm:px-6 sm:pt-6">
      {/* ================= HERO ================= */}
      <section
        className="pitch-pattern relative overflow-hidden rounded-xl border border-border bg-card p-5 sm:p-7 lg:p-8"
        aria-label="ফিচার্ড সেকশন"
      >
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Editorial block */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
              <span className="h-1.5 w-1.5 rounded-[2px] bg-primary" aria-hidden />
              বাংলাদেশের ফুটবল নেটওয়ার্ক
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-[1.15] tracking-wide sm:text-4xl lg:text-[2.75rem]">
              লাইভ স্কোর। নিউজ। শর্টস।
              <span className="block text-primary">সব এক প্ল্যাটফর্মে।</span>
            </h1>
            <p className="mt-3.5 max-w-lg text-sm leading-relaxed text-muted-foreground">
              বিপিএল থেকে সাফ চ্যাম্পিয়নশিপ — প্রতিটি গোল, প্রতিটি ট্রান্সফার, প্রতিটি মুহূর্ত। ফ্যান কমিউনিটিতে
              যোগ দিন, নিজের মতামত শেয়ার করুন, ক্রিয়েটর হয়ে আয় করুন।
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button onClick={() => navigate({ name: "scores" })} className="gap-1.5 bg-primary font-bold">
                <Zap className="h-4 w-4" aria-hidden /> লাইভ স্কোর দেখুন
              </Button>
              <Button variant="outline" onClick={() => navigate({ name: "shorts" })} className="gap-1.5 border-border">
                <VideoIcon className="h-4 w-4" aria-hidden /> শর্টস দেখুন
              </Button>
            </div>

            {/* Stat strip */}
            <dl className="mt-7 grid max-w-lg grid-cols-3 overflow-hidden rounded-lg border border-border bg-background/50">
              {[
                [toBn(matches.length), "ম্যাচ ট্র্যাকিং"],
                [bnCompact(articles.reduce((s, a) => s + a.views, 0)), "নিউজ রিডস"],
                [bnCompact(videos.reduce((s, v) => s + v.views, 0)), "শর্টস ভিউজ"],
              ].map(([v, l], i) => (
                <div key={l} className={i > 0 ? "border-l border-border" : ""}>
                  <div className="px-3 py-3 text-center sm:px-4">
                    <dd className="tabular font-display text-xl font-bold text-foreground sm:text-2xl">{v}</dd>
                    <dt className="mt-0.5 text-[10px] font-medium text-muted-foreground">{l}</dt>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* Featured match — broadcast card */}
          {heroMatch && (
            <button
              onClick={() => navigate({ name: "match-detail", id: heroMatch.id })}
              className="card-lift group relative w-full overflow-hidden rounded-lg border border-border bg-background/80 text-left"
              aria-label={`ফিচার্ড ম্যাচ: ${heroMatch.homeTeam.name} বনাম ${heroMatch.awayTeam.name}`}
            >
              {/* Comp strip */}
              <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
                <span className="flex min-w-0 items-center gap-2 text-[11px] font-bold text-foreground">
                  <span
                    className="h-2 w-2 rounded-[2px]"
                    style={{ backgroundColor: heroMatch.competition.accentColor ?? "var(--primary)" }}
                    aria-hidden
                  />
                  <span className="truncate">{heroMatch.competition.name}</span>
                  {heroMatch.round && (
                    <span className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      {heroMatch.round}
                    </span>
                  )}
                </span>
                {heroMatch.status === "LIVE" ? (
                  <LiveBadge minute={heroMatch.minute} period={heroMatch.period} size="sm" />
                ) : (
                  <span className="shrink-0 rounded-sm border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-primary">
                    {heroMatch.competition.shortName}
                  </span>
                )}
              </div>

              {/* Teams + score */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-6 sm:gap-4 sm:py-7">
                <div className="flex flex-col items-center gap-2.5 text-center">
                  <TeamBadge team={heroMatch.homeTeam} size="lg" />
                  <p className="line-clamp-2 text-xs font-bold leading-tight sm:text-sm">{heroMatch.homeTeam.name}</p>
                </div>
                <div className="px-1 text-center">
                  {heroMatch.status === "SCHEDULED" ? (
                    <>
                      <p className="tabular font-display text-3xl font-bold leading-none sm:text-4xl">
                        {formatKickoff(heroMatch.kickoff).time}
                      </p>
                      <p className="mt-2 inline-block rounded-sm bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {formatKickoff(heroMatch.kickoff).relative}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="tabular font-display text-4xl font-bold leading-none text-fhb-red sm:text-5xl">
                        {toBn(heroMatch.homeScore ?? 0)}
                        <span className="mx-1.5 text-muted-foreground/40">-</span>
                        {toBn(heroMatch.awayScore ?? 0)}
                      </p>
                      <p className="mt-2.5">
                        <LiveBadge minute={heroMatch.minute} period={heroMatch.period} size="sm" />
                      </p>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2.5 text-center">
                  <TeamBadge team={heroMatch.awayTeam} size="lg" />
                  <p className="line-clamp-2 text-xs font-bold leading-tight sm:text-sm">{heroMatch.awayTeam.name}</p>
                </div>
              </div>

              {/* Meta footer */}
              <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
                <span className="flex min-w-0 items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
                  <span className="truncate">{heroMatch.venue ?? heroMatch.competition.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-primary/70" aria-hidden />
                  {formatKickoff(heroMatch.kickoff).date}
                  <span className="flex items-center gap-0.5 font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    ম্যাচ সেন্টার <ChevronRight className="h-3 w-3" aria-hidden />
                  </span>
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
        <section className="mt-10" aria-label="লাইভ ম্যাচ">
          <SectionHeader title="এখন লাইভ" accent="red" kicker="live" icon={<Radio className="h-4 w-4" aria-hidden />} actionLabel="সব স্কোর" actionView={{ name: "scores" }} />
          <div className={cn("grid grid-cols-1 gap-3", liveNow.length > 1 && "sm:grid-cols-2")}>
            {liveNow.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {/* ================= FIXTURES & RESULTS ================= */}
      <section className="mt-10" aria-label="ফিক্সচার ও ফলাফল">
        <SectionHeader title="ম্যাচ সেন্টার" kicker="fixtures" icon={<Zap className="h-4 w-4" aria-hidden />} actionLabel="সব ম্যাচ" actionView={{ name: "scores" }} />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="min-w-0 rounded-lg border border-border bg-card/50 p-3.5 sm:p-4">
            <p className="mb-3 flex items-center gap-2 border-b border-border pb-3 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-primary" aria-hidden /> আসছে
            </p>
            <div className="space-y-3">
              {matchesLoading
                ? [1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)
                : upcoming.map((m) => <MatchCard key={m.id} match={m} showCompetition />)}
            </div>
          </div>
          <div className="min-w-0 rounded-lg border border-border bg-card/50 p-3.5 sm:p-4">
            <p className="mb-3 flex items-center gap-2 border-b border-border pb-3 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Trophy className="h-4 w-4 text-primary" aria-hidden /> সর্বশেষ ফলাফল
            </p>
            <div className="space-y-3">
              {matchesLoading
                ? [1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)
                : recent.map((m) => <MatchCard key={m.id} match={m} showCompetition />)}
            </div>
          </div>
        </div>
      </section>

      {/* ================= NEWS ================= */}
      <section className="mt-12" aria-label="সর্বশেষ নিউজ">
        <SectionHeader title="ফুটবল নিউজ ও ট্রান্সফার" kicker="news" icon={<Newspaper className="h-4 w-4" aria-hidden />} actionLabel="সব নিউজ" actionView={{ name: "news" }} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {featured && (
            <div className="lg:col-span-2 lg:h-[420px]">
              <NewsCard article={featured} size="lg" className="h-full min-h-[280px]" />
            </div>
          )}
          {restNews[0] && <NewsCard article={restNews[0]} />}
          {restNews.slice(1, 4).map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      </section>

      {/* ================= SHORTS RAIL ================= */}
      <section className="mt-12" aria-label="ট্রেন্ডিং শর্টস">
        <SectionHeader title="ট্রেন্ডিং শর্টস" accent="gold" kicker="shorts" icon={<Flame className="h-4 w-4" aria-hidden />} actionLabel="সব শর্টস" actionView={{ name: "shorts" }} />
        <div className="no-scrollbar relative -mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <div className="flex gap-3">
            {videos.slice(0, 8).map((v, i) => (
              <button
                key={v.id}
                onClick={() => navigate({ name: "shorts" })}
                className="card-lift group relative h-56 w-32 shrink-0 overflow-hidden rounded-lg border border-border sm:h-64 sm:w-40"
                aria-label={`শর্টস দেখুন: ${v.title}`}
              >
                {v.thumbnailUrl && (
                  <Image
                    src={v.thumbnailUrl}
                    alt={v.title}
                    fill
                    sizes="160px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                )}
                <span className="tabular absolute left-2 top-2 rounded-sm bg-black/65 px-1.5 py-0.5 font-display text-[10px] font-bold text-white backdrop-blur-sm">
                  #{toBn(i + 1)}
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                <div className="absolute inset-x-2.5 bottom-2.5 text-left">
                  <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-white">{v.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-[9px] text-white/70">
                    <Play className="h-2.5 w-2.5 fill-white" aria-hidden /> {bnCompact(v.views)} ভিউ
                  </p>
                </div>
              </button>
            ))}
          </div>
          <span className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" aria-hidden />
        </div>
      </section>

      {/* ================= STANDINGS + SIDEBAR ================= */}
      <section className="mt-12 grid gap-6 lg:grid-cols-3" aria-label="লিগ টেবিল">
        <div className="lg:col-span-2">
          <SectionHeader title="বিপিএল পয়েন্ট টেবিল" kicker="table" icon={<Trophy className="h-4 w-4" aria-hidden />} actionLabel="সম্পূর্ণ টেবিল" actionView={{ name: "standings" }} />
          <StandingsTable standings={standings} compact limit={6} />
        </div>
        <div className="space-y-5">
          <AdSlot placement="SIDEBAR" />
          <TopScorersMini />
        </div>
      </section>

      {/* ================= COMMUNITY + PREMIUM CTA ================= */}
      <section className="mt-12 grid gap-4 sm:grid-cols-2" aria-label="প্ল্যাটফর্ম সুবিধা">
        <button
          onClick={() => navigate({ name: "community" })}
          className="card-lift group flex items-center gap-4 rounded-lg border border-border bg-card p-5 text-left"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-6 w-6" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-base font-bold text-foreground">ফ্যান কমিউনিটি</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              মতামত শেয়ার করুন, আলোচনায় জয়েন করুন — বাংলাদেশের ফুটবলপ্রেমীদের নিজের জায়গা।
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
        </button>
        <button
          onClick={() => navigate({ name: "premium" })}
          className="card-lift group flex items-center gap-4 rounded-lg border border-fhb-gold/30 bg-fhb-gold/5 p-5 text-left"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-fhb-gold/15 text-fhb-gold">
            <Crown className="h-6 w-6" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-base font-bold text-foreground">
              প্রিমিয়াম <span className="text-fhb-gold">PRO</span>
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              বিজ্ঞাপনমুক্ত অভিজ্ঞতা, এক্সক্লুসিভ ট্রান্সফার নিউজ ও HD হাইলাইটস।
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-fhb-gold" aria-hidden />
        </button>
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
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <p className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3 font-display text-xs font-bold uppercase tracking-widest text-foreground">
        <Goal className="h-4 w-4 text-primary" aria-hidden /> সেরা গোলদাতা
      </p>
      <div className="divide-y divide-border/60">
        {scorers.map((p, i) => (
          <button
            key={p.id}
            onClick={() => navigate({ name: "player-detail", id: p.id })}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-accent/40"
          >
            <span
              className={
                "tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-display text-[11px] font-bold " +
                (i === 0 ? "bg-fhb-gold/20 text-fhb-gold" : i < 3 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")
              }
            >
              {toBn(i + 1)}
            </span>
            {p.team && <TeamBadge team={p.team} size="xs" />}
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">{p.name}</span>
            <span className="tabular shrink-0 rounded-sm bg-primary/10 px-1.5 py-0.5 font-display text-xs font-bold text-primary">
              {toBn(p.goals)}
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={() => navigate({ name: "standings" })}
        className="flex w-full items-center justify-center gap-1 border-t border-border py-2.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/5"
      >
        সম্পূর্ণ তালিকা <ChevronRight className="h-3 w-3" aria-hidden />
      </button>
    </div>
  );
}
