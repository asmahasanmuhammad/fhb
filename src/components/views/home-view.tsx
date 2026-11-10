"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import type { Match, NewsArticle, Standing, Video } from "@/lib/types";
import { MatchRow, MatchHeroCard } from "@/components/football/match-card";
import { StandingsTable } from "@/components/football/standings-table";
import { NewsCard } from "@/components/football/news-card";
import { AdSlot } from "@/components/football/ad-slot";
import { SectionHeader, LeagueGroupHeader } from "@/components/football/section-header";
import { PageLayout, RailCard } from "@/components/layout/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKickoff, fmtCompact, fmtNum } from "@/lib/format";
import { TacticalPitch } from "@/components/football/tactical-pitch";
import { TransferRadar } from "@/components/football/transfer-radar";
import {
  Zap, Newspaper, Video as VideoIcon, Play, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* Group one day's matches by competition (pure helper). */
function groupMatchesByDay(matches: Match[], dayOffset: number) {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const target = base.getTime() + dayOffset * 864e5;
  const dayMatches = matches
    .filter((m) => {
      const d = new Date(m.kickoff);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === target;
    })
    .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff));

  const groups = new Map<string, { competition: Match["competition"]; matches: Match[] }>();
  for (const m of dayMatches) {
    const key = m.competition.id;
    const existing = groups.get(key);
    groups.set(
      key,
      existing
        ? { ...existing, matches: existing.matches.concat(m) }
        : { competition: m.competition, matches: [m] }
    );
  }
  return Array.from(groups.values());
}

/* ── Competition quick-rail chips ── */
function LeagueChipsRail() {
  const navigate = useAppStore((s) => s.navigate);
  const { data } = useQuery<{ competitions: Array<{ id: string; name: string; shortName: string; accentColor?: string | null }> }>({
    queryKey: ["competitions", "chips"],
    queryFn: async () => {
      const res = await fetch("/api/competitions");
      return res.json().then((j) => j.data);
    },
    staleTime: 5 * 60_000,
  });
  const comps = data?.competitions ?? [];
  if (comps.length === 0) return null;
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Competitions">
      {comps.slice(0, 12).map((c) => (
        <button
          key={c.id}
          onClick={() => navigate({ name: "competition-detail", id: c.id })}
          className="group flex h-8 shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-[12px] font-semibold text-foreground/80 transition-colors hover:border-white/20 hover:text-foreground"
        >
          <span
            aria-hidden
            className="h-[8px] w-[8px] rounded-[2px]"
            style={{ backgroundColor: c.accentColor ?? "var(--primary)" }}
          />
          {c.shortName ?? c.name}
        </button>
      ))}
    </div>
  );
}

/* ── Shorts teaser card ── */
function ShortsRailCard({ video }: { video: Video }) {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <button
      onClick={() => navigate({ name: "shorts" })}
      className="group relative flex h-[240px] w-[150px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card text-left"
      aria-label={`Watch short: ${video.title}`}
    >
      <span className="relative block h-[178px] overflow-hidden bg-elevated">
        {video.thumbnailUrl ? (
          <Image src={video.thumbnailUrl} alt="" fill sizes="150px" className="img-zoom object-cover" unoptimized />
        ) : (
          <video
            src={video.videoUrl}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" aria-hidden />
        <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/12 backdrop-blur-sm">
          <Play className="h-3 w-3 fill-white text-white" aria-hidden />
        </span>
        <span className="absolute bottom-2 right-2 rounded-[4px] bg-black/60 px-1.5 py-0.5 text-[9.5px] font-bold text-white backdrop-blur-sm">
          {fmtCompact(video.views)} views
        </span>
      </span>
      <span className="flex min-h-0 flex-1 flex-col gap-0.5 p-2.5">
        <span className="line-clamp-2 text-[11.5px] font-semibold leading-snug text-foreground/90">
          {video.title}
        </span>
        <span className="mt-auto truncate text-[10px] text-muted-foreground">@{video.creator.username}</span>
      </span>
    </button>
  );
}

export function HomeView() {
  const navigate = useAppStore((s) => s.navigate);
  useReveal();

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
      const res = await fetch("/api/news?limit=14");
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
  const isToday = (m: Match) => new Date(m.kickoff).toDateString() === new Date().toDateString();
  const liveNow = matches.filter((m) => m.status === "LIVE");
  // Hero priority: live now → today's featured → today's fixture → next upcoming
  const heroMatch =
    liveNow[0] ??
    matches.find((m) => m.featured && isToday(m) && m.status === "SCHEDULED") ??
    matches.find((m) => isToday(m) && m.status === "SCHEDULED") ??
    matches
      .filter((m) => m.status === "SCHEDULED")
      .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff))[0];

  // Smart default day: today if it has matches, else the nearest day that
  // does (yesterday first, then tomorrow, then ±2 days) — never an empty
  // matchday module on the flagship page.
  const [dayOffset, setDayOffset] = useState<number | null>(null);
  const resolvedOffset =
    dayOffset ??
    [0, -1, 1, -2, 2].find((o) => groupMatchesByDay(matches, o).length > 0) ?? 0;
  const dayGroups = groupMatchesByDay(matches, resolvedOffset);

  const articles = newsData?.articles ?? [];
  const leadStory = articles.find((a) => a.featured) ?? articles[0];
  const secondaryNews = articles.filter((a) => a.id !== leadStory?.id).slice(0, 4);
  // Most-read rail excludes the 5 stories already showcased on the page
  const showcased = new Set([leadStory?.id, ...secondaryNews.map((a) => a.id)]);
  const mostRead = articles
    .filter((a) => !showcased.has(a.id))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
  const standings = standingsData?.standings ?? [];
  const videos = (videosData?.videos ?? []).slice(0, 10);

  /* ── Right rail (xl+) ── */
  const rail = (
    <>
      <RailCard
        title="BFL Table"
        action={
          <button
            onClick={() => navigate({ name: "standings" })}
            className="flex items-center gap-0.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
          >
            Full table <ChevronRight className="h-3 w-3" aria-hidden />
          </button>
        }
      >
        <StandingsTable standings={standings} limit={6} compact />
      </RailCard>

      <AdSlot placement="SIDEBAR" />

      <RailCard title="Most Read">
        <div className="divide-y divide-border/40">
          {mostRead.map((a, i) => (
            <button
              key={a.id}
              onClick={() => navigate({ name: "news-detail", id: a.id })}
              className="row-hover flex w-full items-start gap-3 px-4 py-3 text-left"
            >
              <span className="score-num mt-0.5 w-5 shrink-0 text-[18px] font-bold leading-none text-primary/70">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-foreground/90">
                  {a.title}
                </span>
                <span className="mt-0.5 block text-[10px] text-muted-foreground">
                  {fmtCompact(a.views)} reads
                </span>
              </span>
            </button>
          ))}
        </div>
      </RailCard>
    </>
  );

  return (
    <PageLayout rail={rail}>
      {/* ── Billboard + league quick rail ── */}
      <AdSlot placement="HEADER_BANNER" className="mb-5 hidden sm:flex" />
      <LeagueChipsRail />

      {/* ── Hero band: featured match + lead story ── */}
      <section className="reveal mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12" aria-label="Featured">
        {heroMatch && (
          <div className="lg:col-span-5">
            <MatchHeroCard match={heroMatch} className="min-h-[340px]" />
          </div>
        )}
        {leadStory && (
          <div className="lg:col-span-7">
            <NewsCard article={leadStory} size="lg" className="h-full min-h-[340px]" />
          </div>
        )}
      </section>

      {/* ── Matchday scores ── */}
      <section className="reveal mt-10" aria-label="Matchday scores">
        <SectionHeader
          title="Matchday"
          kicker={liveNow.length > 0 ? `${fmtNum(liveNow.length)} live now` : "live scores"}
          accent={liveNow.length > 0 ? "red" : "primary"}
          icon={<Zap className="h-3.5 w-3.5" aria-hidden />}
          actionLabel="All Matches"
          actionView={{ name: "scores" }}
        />
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {/* Date rail */}
          <div className="no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-border bg-elevated/60 px-3 py-2">
            {[-2, -1, 0, 1, 2].map((offset) => {
              const label =
                offset === 0
                  ? "Today"
                  : new Date(Date.now() + offset * 864e5).toLocaleDateString("en-US", { weekday: "short" });
              const active = resolvedOffset === offset;
              return (
                <button
                  key={offset}
                  onClick={() => setDayOffset(offset)}
                  className={cn(
                    "label-cond shrink-0 rounded-[5px] px-3 py-1 text-[12px] font-bold tracking-[0.06em] transition-colors",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                  )}
                  aria-pressed={active}
                >
                  {label}
                </button>
              );
            })}
            <span className="ml-auto hidden shrink-0 pr-1 text-[11px] text-muted-foreground sm:block">
              {formatKickoff(
                new Date(Date.now() + resolvedOffset * 864e5).toISOString()
              ).date}
            </span>
          </div>

          {matchesLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : dayGroups.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-semibold text-foreground">No matches scheduled</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try another day or browse all fixtures.
              </p>
              <button
                onClick={() => navigate({ name: "scores" })}
                className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-border px-3.5 text-[11px] font-bold uppercase tracking-wider text-foreground/80 transition-colors hover:border-white/25"
              >
                All Fixtures <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {dayGroups.slice(0, 2).map((g) => (
                <div key={g.competition.id}>
                  <LeagueGroupHeader
                    name={g.competition.name}
                    color={g.competition.accentColor}
                    count={g.matches.length}
                    onClick={() => navigate({ name: "competition-detail", id: g.competition.id })}
                  />
                  <div className="divide-y divide-border/30 border-t border-border/30">
                    {g.matches.slice(0, 6).map((m) => (
                      <MatchRow key={m.id} match={m} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Matchday Tactical Board ── */}
      {heroMatch && (
        <section className="reveal mt-10" aria-label="Tactical Board">
          <SectionHeader
            title="Matchday Tactical Board"
            kicker="pitch analysis"
            icon={<Zap className="h-3.5 w-3.5" aria-hidden />}
            actionLabel="Match Centre"
            actionView={{ name: "match-detail", id: heroMatch.id }}
          />
          <TacticalPitch
            homeTeam={heroMatch.homeTeam}
            awayTeam={heroMatch.awayTeam}
            homeFormation="4-3-3"
            awayFormation="4-2-3-1"
          />
        </section>
      )}

      {/* ── In-feed native ad ── */}
      <div className="reveal mt-6">
        <AdSlot placement="IN_FEED" />
      </div>

      {/* ── Top stories ── */}
      <section className="reveal mt-10" aria-label="Top stories">
        <SectionHeader
          title="Top Stories"
          kicker="football news"
          icon={<Newspaper className="h-3.5 w-3.5" aria-hidden />}
          actionLabel="All News"
          actionView={{ name: "news" }}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {secondaryNews.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      </section>

      {/* ── Transfer Radar ── */}
      <section className="reveal mt-10" aria-label="Transfer Radar">
        <TransferRadar />
      </section>

      {/* ── Shorts rail ── */}
      {videos.length > 0 && (
        <section className="reveal mt-10" aria-label="Shorts">
          <SectionHeader
            title="Shorts"
            kicker="fan videos"
            icon={<VideoIcon className="h-3.5 w-3.5" aria-hidden />}
            actionLabel="Watch All"
            actionView={{ name: "shorts" }}
          />
          <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
            {videos.map((v) => (
              <ShortsRailCard key={v.id} video={v} />
            ))}
          </div>
        </section>
      )}

      {/* ── Trending transfers / second ad (mobile sees sidebar ad here) ── */}
      <section className="reveal mt-10 xl:hidden" aria-label="Sidebar promotion">
        <AdSlot placement="SIDEBAR" />
      </section>
    </PageLayout>
  );
}

