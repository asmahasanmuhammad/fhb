"use client";

import { useState, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
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
  Zap, Newspaper, Video as VideoIcon, Play, ChevronRight, Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────────
   Animation variant presets
───────────────────────────────────────────────────────────────────────────── */
const fadeUp: any = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const staggerContainer: any = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.085, delayChildren: 0.05 } },
};

const cardItem: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: "easeOut" } },
};

const scaleIn: any = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Helper: group one day's matches by competition
───────────────────────────────────────────────────────────────────────────── */
function getUtcDateForOffset(offset: number) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offset));
}

function groupMatchesByDay(matches: Match[], dayOffset: number) {
  const targetDateStr = getUtcDateForOffset(dayOffset).toISOString().slice(0, 10);
  const dayMatches = matches
    .filter((m) => new Date(m.kickoff).toISOString().slice(0, 10) === targetDateStr)
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

/* ─────────────────────────────────────────────────────────────────────────────
   LeagueChipsRail — competition quick-select chips
───────────────────────────────────────────────────────────────────────────── */
function LeagueChipsRail() {
  const navigate = useAppStore((s) => s.navigate);
  const { data } = useQuery<{ competitions: Array<{ id: string; name: string; shortName: string; accentColor?: string | null; logoUrl?: string | null }> }>({
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      aria-label="Competitions"
    >
      {comps.slice(0, 12).map((c) => (
        <motion.button
          key={c.id}
          variants={cardItem}
          onClick={() => navigate({ name: "competition-detail", id: c.id })}
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="group flex h-9 shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 text-[13px] sm:text-[13.5px] font-semibold text-foreground/80 transition-colors hover:border-white/20 hover:text-foreground cursor-pointer"
        >
          {c.logoUrl ? (
            <img src={c.logoUrl} alt="" className="h-4.5 w-4.5 object-contain" />
          ) : (
            <span
              aria-hidden
              className="h-[9px] w-[9px] rounded-[2px]"
              style={{ backgroundColor: c.accentColor ?? "var(--primary)" }}
            />
          )}
          {c.shortName ?? c.name}
        </motion.button>
      ))}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ShortsRailCard — individual short video card
───────────────────────────────────────────────────────────────────────────── */
function ShortsRailCard({ video }: { video: Video; index?: number }) {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <motion.button
      onClick={() => navigate({ name: "shorts" })}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.97 }}
      className="group relative flex h-[255px] w-[156px] shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-lg shadow-black/30"
      aria-label={`Watch short: ${video.title}`}
    >
      <span className="relative block h-[185px] overflow-hidden bg-elevated">
        {video.thumbnailUrl ? (
          <Image src={video.thumbnailUrl} alt="" fill sizes="160px" className="img-zoom object-cover" unoptimized />
        ) : (
          <video
            src={video.videoUrl}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" aria-hidden />
        {/* Play button */}
        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          <Play className="h-4 w-4 fill-white text-white" aria-hidden />
        </span>
        <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
          <Play className="h-3 w-3 fill-white text-white" aria-hidden />
        </span>
        <span className="absolute bottom-2 right-2 rounded-[4px] bg-black/60 px-1.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
          {fmtCompact(video.views)} views
        </span>
      </span>
      <span className="flex min-h-0 flex-1 flex-col gap-0.5 p-2.5">
        <span className="line-clamp-2 text-[13px] sm:text-[13.5px] font-semibold leading-snug text-foreground/90">
          {video.title}
        </span>
        <span className="mt-auto truncate text-[11.5px] text-muted-foreground">@{video.creator.username}</span>
      </span>
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LiveBanner — pulsing LIVE section header
───────────────────────────────────────────────────────────────────────────── */
function LiveBanner({ count, onNavigate }: { count: number; onNavigate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{
        opacity: 1,
        y: 0,
        borderColor: ["rgba(255,30,70,0.3)", "rgba(255,30,70,0.8)", "rgba(255,30,70,0.3)"],
      }}
      transition={{
        opacity: { duration: 0.4 },
        y: { duration: 0.4 },
        borderColor: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
      }}
      className="mb-4 flex items-center gap-3 overflow-hidden rounded-xl border bg-[#ff1e46]/[0.06] px-4 py-3"
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-[#ff1e46]"
          animate={{ scale: [1, 1.9], opacity: [0.75, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
        />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#ff1e46]" />
      </span>

      <span className="label-cond text-[13.5px] font-black uppercase tracking-widest text-[#ff1e46]">
        Live Now
      </span>
      <span className="text-[13.5px] font-semibold text-foreground/80">
        {fmtNum(count)} {count === 1 ? "match" : "matches"} in progress
      </span>

      <motion.button
        onClick={onNavigate}
        whileHover={{ x: 2 }}
        className="ml-auto flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-wider text-[#ff1e46] transition-opacity hover:opacity-80"
      >
        <Radio className="h-3.5 w-3.5" aria-hidden />
        Watch Live
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
      </motion.button>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TacticalReveal — scroll-triggered wrapper for TacticalPitch
───────────────────────────────────────────────────────────────────────────── */
function TacticalReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HomeView — main page component
───────────────────────────────────────────────────────────────────────────── */
export function HomeView() {
  const navigate = useAppStore((s) => s.navigate);
  useReveal();

  const live = useLiveScores();

  /* ── Data fetching ── */
  const { data: matchesData, isLoading: matchesLoading } = useQuery<{ matches: Match[] }>({
    queryKey: ["matches", "home"],
    queryFn: async () => {
      const res = await fetch("/api/matches?status=ALL&days=60&limit=500");
      return res.json().then((j) => j.data);
    },
    refetchInterval: 4000,
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

  /* ── Derived state ── */
  const rawMatches = matchesData?.matches ?? [];
  const matches = useMemo(() => {
    return rawMatches.map((m) => {
      const lm = live.matches.find((x) => x.id === m.id);
      return lm
        ? {
            ...m,
            status: "LIVE" as const,
            minute: lm.minute,
            period: lm.period,
            homeScore: lm.homeScore,
            awayScore: lm.awayScore,
          }
        : m;
    });
  }, [rawMatches, live.matches]);

  const isMatchToday = (m: Match) => {
    const todayStr = getUtcDateForOffset(0).toISOString().slice(0, 10);
    return new Date(m.kickoff).toISOString().slice(0, 10) === todayStr;
  };
  const liveNow = matches.filter((m) => m.status === "LIVE");
  const heroMatch =
    liveNow[0] ??
    matches.find((m) => m.featured && isMatchToday(m) && m.status === "SCHEDULED") ??
    matches.find((m) => isMatchToday(m) && m.status === "SCHEDULED") ??
    matches.find((m) => isMatchToday(m)) ??
    matches[0];

  const [dayOffset, setDayOffset] = useState<number | null>(null);
  const resolvedOffset =
    dayOffset ??
    [0, -1, 1, -2, 2].find((o) => groupMatchesByDay(matches, o).length > 0) ?? 0;
  const dayGroups = groupMatchesByDay(matches, resolvedOffset);

  const articles = newsData?.articles ?? [];
  const leadStory = articles.find((a) => a.featured) ?? articles[0];
  const secondaryNews = articles.filter((a) => a.id !== leadStory?.id).slice(0, 4);
  const showcased = new Set([leadStory?.id, ...secondaryNews.map((a) => a.id)]);
  const mostRead = articles
    .filter((a) => !showcased.has(a.id))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
  const standings = standingsData?.standings ?? [];
  const videos = (videosData?.videos ?? []).slice(0, 10);

  /* ── Right rail ── */
  const rail = (
    <>
      <RailCard
        title="BFL Table"
        action={
          <button
            onClick={() => navigate({ name: "standings" })}
            className="flex items-center gap-1 text-[11.5px] sm:text-[12px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
          >
            Full table <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        }
      >
        <StandingsTable standings={standings} limit={6} compact />
      </RailCard>

      <AdSlot placement="SIDEBAR" />

      <RailCard title="Most Read">
        <div className="divide-y divide-border/40">
          {mostRead.map((a, i) => (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
              onClick={() => navigate({ name: "news-detail", id: a.id })}
              className="row-hover flex w-full items-start gap-3 px-4 py-3 text-left"
            >
              <span className="score-num mt-0.5 w-5 shrink-0 text-[19px] sm:text-[20px] font-bold leading-none text-primary/70">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-[14px] sm:text-[14.5px] font-bold leading-snug text-foreground/90">
                  {a.title}
                </span>
                <span className="mt-1 block text-[11.5px] sm:text-[12px] text-muted-foreground">
                  {fmtCompact(a.views)} reads
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      </RailCard>
    </>
  );

  /* ── Render ── */
  return (
    <PageLayout rail={rail}>
      {/* ── Billboard ad ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AdSlot placement="HEADER_BANNER" className="mb-5" />
      </motion.div>

      {/* ── League chips ── */}
      <LeagueChipsRail />

      {/* ── LIVE matches banner (AnimatePresence so it slides in/out cleanly) ── */}
      <AnimatePresence>
        {liveNow.length > 0 && (
          <LiveBanner count={liveNow.length} onNavigate={() => navigate({ name: "scores" })} />
        )}
      </AnimatePresence>

      {/* ── Hero band: gradient mesh backdrop + match card + lead story ── */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="relative mt-4"
        aria-label="Featured"
      >
        {/* Ambient glow backdrop */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-2xl"
          aria-hidden
        >
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#ff1e46]/10 blur-[80px]" />
          <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-[#1a4fff]/10 blur-[70px]" />
        </div>

        <div className="stadium-panel grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Hero match card — with radial glow when live */}
          {heroMatch && (
            <motion.div
              className="relative lg:col-span-5"
              variants={scaleIn}
            >
              {heroMatch.status === "LIVE" && (
                <motion.div
                  className="pointer-events-none absolute inset-0 -z-10 rounded-xl"
                  animate={{
                    opacity: [0.4, 0.75, 0.4],
                  }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    background:
                      "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(255,30,70,0.22) 0%, transparent 70%)",
                  }}
                  aria-hidden
                />
              )}
              <MatchHeroCard match={heroMatch} className="min-h-[340px]" />
            </motion.div>
          )}
          {leadStory && (
            <motion.div className="lg:col-span-7" variants={fadeUp}>
              <NewsCard article={leadStory} size="lg" className="h-full min-h-[340px]" />
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* ── Matchday scores ── */}
      <motion.section
        className="mt-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeUp}
        aria-label="Matchday scores"
      >
        <SectionHeader
          title="Matchday"
          kicker={liveNow.length > 0 ? `${fmtNum(liveNow.length)} live now` : "live scores"}
          accent={liveNow.length > 0 ? "red" : "primary"}
          icon={<Zap className="h-3.5 w-3.5" aria-hidden />}
          actionLabel="All Matches"
          actionView={{ name: "scores" }}
        />
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm shadow-black/20">
          {/* ── Animated date rail ── */}
          <div className="no-scrollbar relative flex items-center gap-1.5 overflow-x-auto border-b border-border bg-elevated/60 px-3.5 py-2.5">
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
                    "label-cond relative shrink-0 rounded-[6px] px-3.5 py-1.5 text-[13px] sm:text-[14px] font-bold tracking-[0.06em] transition-colors",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                  )}
                  aria-pressed={active}
                >
                  {/* Animated active indicator using layoutId */}
                  {active && (
                    <motion.span
                      layoutId="date-tab-indicator"
                      className="absolute inset-0 rounded-[6px] bg-primary/15"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      aria-hidden
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
            <span className="ml-auto hidden shrink-0 pr-1 text-[12.5px] font-semibold text-muted-foreground sm:block">
              {formatKickoff(getUtcDateForOffset(resolvedOffset).toISOString()).date}
            </span>
          </div>

          {/* ── Match rows ── */}
          <AnimatePresence mode="wait">
            {matchesLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2 p-4"
              >
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </motion.div>
            ) : dayGroups.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 py-10 text-center"
              >
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
              </motion.div>
            ) : (
              <motion.div
                key={`day-${resolvedOffset}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="divide-y divide-border/40"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ── Matchday Tactical Board (scroll-reveal) ── */}
      {heroMatch && (
        <section className="mt-10" aria-label="Tactical Board">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
          >
            <SectionHeader
              title="Matchday Tactical Board"
              kicker="pitch analysis"
              icon={<Zap className="h-3.5 w-3.5" aria-hidden />}
              actionLabel="Match Centre"
              actionView={{ name: "match-detail", id: heroMatch.id }}
            />
          </motion.div>
          <TacticalReveal>
            <TacticalPitch
              matchId={heroMatch.id}
              homeTeam={heroMatch.homeTeam}
              awayTeam={heroMatch.awayTeam}
              homeFormation="4-3-3"
              awayFormation="4-2-3-1"
            />
          </TacticalReveal>
        </section>
      )}

      {/* ── In-feed native ad ── */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
      >
        <AdSlot placement="IN_FEED" />
      </motion.div>

      {/* ── Top Stories ── */}
      <motion.section
        className="mt-10"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        aria-label="Top stories"
      >
        <SectionHeader
          title="Top Stories"
          kicker="football news"
          icon={<Newspaper className="h-3.5 w-3.5" aria-hidden />}
          actionLabel="All News"
          actionView={{ name: "news" }}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {secondaryNews.map((a) => (
            <div key={a.id}>
              <NewsCard article={a} />
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Transfer Radar ── */}
      <motion.section
        className="mt-10"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        aria-label="Transfer Radar"
      >
        <TransferRadar />
      </motion.section>

      {/* ── Shorts rail — horizontal momentum scroll ── */}
      {videos.length > 0 && (
        <motion.section
          className="mt-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          aria-label="Shorts"
        >
          <SectionHeader
            title="Shorts"
            kicker="fan videos"
            icon={<VideoIcon className="h-3.5 w-3.5" aria-hidden />}
            actionLabel="Watch All"
            actionView={{ name: "shorts" }}
          />
          {/* Momentum-feel scroll rail: CSS scroll-snap + overscroll-behavior */}
          <div
            className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          >
            {videos.map((v, i) => (
              <div key={v.id} style={{ scrollSnapAlign: "start" }}>
                <ShortsRailCard video={v} index={i} />
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Sidebar ad (mobile fallback) ── */}
      <motion.section
        className="mt-10 xl:hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        aria-label="Sidebar promotion"
      >
        <AdSlot placement="SIDEBAR" />
      </motion.section>
    </PageLayout>
  );
}
