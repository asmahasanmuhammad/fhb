"use client";

/**
 * FHB Live TV — multi-server HLS streaming hub.
 *
 * Theater layout: native-controls HLS player (hls.js with native HLS
 * fallback on Safari/iOS), channel info strip with EPG + server
 * switching, category-filtered channel grid, custom stream loader and
 * a broadcast rail (Up-next schedule, sidebar ad, Watch on TV).
 * Demo streams are legal, publicly available HLS feeds (Red Bull TV,
 * DW, France 24, Al Jazeera, TRT World, NASA TV and standard test
 * streams). The architecture accepts any m3u8 URL — plug in licensed
 * feeds at deployment.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type Hls from "hls.js";
import { useReveal } from "@/hooks/use-reveal";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader, SectionHeader } from "@/components/football/section-header";
import { PageLayout, RailCard } from "@/components/layout/page-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fmtCompact, fmtLocale, fmtNum } from "@/lib/format";
import {
  Tv, Radio, Play, Server, Link2, ShieldCheck, Users, ChevronRight,
  RefreshCw, AlertTriangle,
} from "lucide-react";

type Server = { label: string; url: string; note?: string };

type Channel = {
  id: string;
  name: string;
  monogram: string;
  color: string;
  category: "sports" | "football" | "news" | "bangladesh";
  tagline: string;
  nowPlaying: string;
  next: string;
  viewers: number;
  demo: boolean;
  servers: Server[];
};

const DEMO_TAG = {
  redbull: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master_928.m3u8",
  bunny: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  tos: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
  sintel: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
  bipbop: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
  dw: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8",
  f24: "https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8",
  aje: "https://live-hls-web-aje.getaj.net/AJE/index.m3u8",
  trt: "https://tv-trtworld.live.trt.com.tr/master_720.m3u8",
  nasa: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8",
};

const CHANNELS: Channel[] = [
  {
    id: "tsports",
    name: "T Sports HD",
    monogram: "TS",
    color: "#E2106E",
    category: "bangladesh",
    tagline: "Bangladesh's first sports channel",
    nowPlaying: "Live BFL: Dhaka Derby — Mohammedan vs Abahani",
    next: "Federation Cup Semi-Final Preview",
    viewers: 218430,
    demo: true,
    servers: [
      { label: "Server 1", url: DEMO_TAG.bunny, note: "Primary · auto" },
      { label: "Server 2", url: DEMO_TAG.tos },
      { label: "Server 3", url: DEMO_TAG.sintel },
    ],
  },
  {
    id: "gtv",
    name: "Gtv Sports",
    monogram: "GT",
    color: "#0E6E45",
    category: "bangladesh",
    tagline: "Home of the national team",
    nowPlaying: "SAFF Championship Magazine Show",
    next: "Bangladesh vs India — Semi-Final Build-up",
    viewers: 164210,
    demo: true,
    servers: [
      { label: "Server 1", url: DEMO_TAG.tos, note: "Primary · auto" },
      { label: "Server 2", url: DEMO_TAG.bunny },
      { label: "Server 3", url: DEMO_TAG.bipbop },
    ],
  },
  {
    id: "btsports",
    name: "BTV World",
    monogram: "BT",
    color: "#B01B2E",
    category: "bangladesh",
    tagline: "National broadcaster",
    nowPlaying: "Sports Bulletin — BFL Round 9",
    next: "Documentary: Road to the World Cup",
    viewers: 87650,
    demo: true,
    servers: [
      { label: "Server 1", url: DEMO_TAG.sintel },
      { label: "Server 2", url: DEMO_TAG.bunny },
    ],
  },
  {
    id: "redbull",
    name: "Red Bull TV",
    monogram: "RB",
    color: "#1A1A2E",
    category: "sports",
    tagline: "Action sports & football originals",
    nowPlaying: "FC Bayern Documentary Series",
    next: "Urban Freestyle Finals — Live",
    viewers: 94210,
    demo: false,
    servers: [
      { label: "Server 1", url: DEMO_TAG.redbull, note: "Free-to-air" },
      { label: "Server 2", url: DEMO_TAG.bunny },
    ],
  },
  {
    id: "eplarena",
    name: "Premier Arena HD",
    monogram: "PA",
    color: "#3D195B",
    category: "football",
    tagline: "English football, around the clock",
    nowPlaying: "Matchday Live: Arsenal vs Chelsea Build-up",
    next: "Classic Match: Der Klassiker 2013",
    viewers: 141980,
    demo: true,
    servers: [
      { label: "Server 1", url: DEMO_TAG.bunny, note: "Primary · auto" },
      { label: "Server 2", url: DEMO_TAG.sintel },
      { label: "Server 3", url: DEMO_TAG.tos },
    ],
  },
  {
    id: "laliga",
    name: "LaLiga Xtra",
    monogram: "LX",
    color: "#E5322D",
    category: "football",
    tagline: "Spanish football highlights channel",
    nowPlaying: "El Clásico Rewind: Real Madrid 2-1 Barcelona",
    next: "LaLiga Weekly — Matchday 13 Preview",
    viewers: 120430,
    demo: true,
    servers: [
      { label: "Server 1", url: DEMO_TAG.tos },
      { label: "Server 2", url: DEMO_TAG.bunny },
      { label: "Server 3", url: DEMO_TAG.bipbop },
    ],
  },
  {
    id: "seriehub",
    name: "Calcio Hub",
    monogram: "CH",
    color: "#0B1560",
    category: "football",
    tagline: "Serie A & the Italian game",
    nowPlaying: "Lazio's Unbeaten Run — Analysis Special",
    next: "Derby della Capitale Countdown",
    viewers: 74320,
    demo: true,
    servers: [
      { label: "Server 1", url: DEMO_TAG.sintel },
      { label: "Server 2", url: DEMO_TAG.tos },
    ],
  },
  {
    id: "ucltv",
    name: "UCL Tonight",
    monogram: "UC",
    color: "#0A1172",
    category: "football",
    tagline: "Champions League nights",
    nowPlaying: "Matchday 5 Draw Analysis",
    next: "Classic Final: Real Madrid vs Bayern",
    viewers: 98450,
    demo: true,
    servers: [
      { label: "Server 1", url: DEMO_TAG.bipbop },
      { label: "Server 2", url: DEMO_TAG.bunny },
    ],
  },
  {
    id: "dw",
    name: "DW English",
    monogram: "DW",
    color: "#0B3B75",
    category: "news",
    tagline: "German international broadcaster",
    nowPlaying: "The Day — News & Analysis",
    next: "Kick off! — Bundesliga Report",
    viewers: 45320,
    demo: false,
    servers: [{ label: "Server 1", url: DEMO_TAG.dw, note: "Free-to-air" }],
  },
  {
    id: "f24",
    name: "France 24 English",
    monogram: "F24",
    color: "#123A6D",
    category: "news",
    tagline: "International news, live from Paris",
    nowPlaying: "Live News Bulletin",
    next: "Sports Week",
    viewers: 38210,
    demo: false,
    servers: [{ label: "Server 1", url: DEMO_TAG.f24, note: "Free-to-air" }],
  },
  {
    id: "aje",
    name: "Al Jazeera English",
    monogram: "AJ",
    color: "#FAA61A",
    category: "news",
    tagline: "Global news & current affairs",
    nowPlaying: "Newshour — Live from Doha",
    next: "Inside Story: Asian Football Rising",
    viewers: 51940,
    demo: false,
    servers: [{ label: "Server 1", url: DEMO_TAG.aje, note: "Free-to-air" }],
  },
  {
    id: "trtw",
    name: "TRT World",
    monogram: "TR",
    color: "#0A1E3C",
    category: "news",
    tagline: "News from Istanbul",
    nowPlaying: "Across the Globe — Live",
    next: "SportsNation",
    viewers: 29870,
    demo: false,
    servers: [{ label: "Server 1", url: DEMO_TAG.trt, note: "Free-to-air" }],
  },
  {
    id: "nasa",
    name: "NASA TV",
    monogram: "NA",
    color: "#1B2A49",
    category: "sports",
    tagline: "Science & exploration, live",
    nowPlaying: "International Space Station Live",
    next: "Mission Update",
    viewers: 18450,
    demo: false,
    servers: [{ label: "Server 1", url: DEMO_TAG.nasa, note: "Free-to-air" }],
  },
];

const CATEGORIES = [
  { key: "all", label: "All Channels" },
  { key: "bangladesh", label: "Bangladesh" },
  { key: "football", label: "Football" },
  { key: "sports", label: "Sports" },
  { key: "news", label: "News" },
] as const;

const CATEGORY_LABEL: Record<Channel["category"], string> = {
  sports: "Sports",
  football: "Football",
  news: "News",
  bangladesh: "Bangladesh",
};

export function LiveTvView() {
  useReveal();
  const [category, setCategory] = useState<string>("all");
  // Autoplay lands on the first channel with a real, licensed stream so the
  // player never opens on a cartoon demo feed. T Sports stays first in the grid.
  const [active, setActive] = useState<Channel>(CHANNELS.find((c) => !c.demo) ?? CHANNELS[0]);
  const [serverIdx, setServerIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [customName, setCustomName] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerSectionRef = useRef<HTMLElement>(null);

  const filtered = useMemo(
    () => (category === "all" ? CHANNELS : CHANNELS.filter((c) => c.category === category)),
    [category]
  );

  const src = active.servers[Math.min(serverIdx, active.servers.length - 1)].url;
  const currentServer = active.servers[Math.min(serverIdx, active.servers.length - 1)];
  const totalServers = useMemo(() => CHANNELS.reduce((n, c) => n + c.servers.length, 0), []);
  const freeToAir = useMemo(() => CHANNELS.filter((c) => !c.demo).length, []);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const loadStream = useCallback(
    async (url: string) => {
      const video = videoRef.current;
      if (!video) return;
      destroyHls();
      setError(null);
      setLoading(true);
      try {
        if (video.canPlayType("application/vnd.apple.mpegurl") && url.includes(".m3u8") && !url.includes("test-streams")) {
          // Native HLS (Safari / iOS)
          video.src = url;
        } else {
          const HlsCtor = (await import("hls.js")).default;
          if (HlsCtor.isSupported()) {
            const hls = new HlsCtor({ enableWorker: true, lowLatencyMode: false, backBufferLength: 90 });
            hlsRef.current = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(HlsCtor.Events.ERROR, (_e, data) => {
              if (data.fatal) {
                setLoading(false);
                setError("This stream is currently unavailable. Try another server or channel.");
                destroyHls();
              }
            });
          } else {
            video.src = url;
          }
        }
        video.muted = muted;
        await video.play().catch(() => {
          /* autoplay may need a manual click */
        });
        setPlaying(!video.paused);
      } finally {
        setLoading(false);
      }
    },
    [destroyHls, muted]
  );

  // Load stream when channel or server changes (only if user has started playback)
  useEffect(() => {
    if (playing || error) void loadStream(src);
  }, [src]);

  // Attempt muted autoplay once on mount — if the browser blocks it the
  // poster state stays up and the user can tap play.
  const autoTriedRef = useRef(false);
  useEffect(() => {
    if (autoTriedRef.current) return;
    autoTriedRef.current = true;
    void loadStream(src);
  }, [loadStream, src]);

  useEffect(() => () => destroyHls(), [destroyHls]);

  const startPlayback = (ch: Channel, idx = 0) => {
    setActive(ch);
    setServerIdx(idx);
    setPlaying(true);
    setError(null);
    // stream loads via the src-change effect
  };

  const watchChannel = (ch: Channel, idx = 0) => {
    startPlayback(ch, idx);
    playerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const playCustom = () => {
    const url = customUrl.trim();
    if (!/^https?:\/\/.+/i.test(url)) return;
    const ch: Channel = {
      id: "custom",
      name: customName.trim() || "Custom Stream",
      monogram: "CS",
      color: "#006A4E",
      category: "sports",
      tagline: "User-provided source",
      nowPlaying: "External stream",
      next: "—",
      viewers: 1,
      demo: false,
      servers: [{ label: "Custom", url, note: "User source" }],
    };
    setShowCustom(false);
    startPlayback(ch, 0);
  };

  /* ── Right rail (xl+) ── */
  const rail = (
    <>
      <RailCard title="Up next">
        <div className="divide-y divide-border/40">
          {CHANNELS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => watchChannel(ch, 0)}
              className="row-hover flex w-full items-start gap-3 px-4 py-3 text-left"
              aria-label={`Watch ${ch.name}`}
            >
              <span
                aria-hidden
                className="mt-1 h-[10px] w-[10px] shrink-0 rounded-[3px]"
                style={{ backgroundColor: ch.color }}
              />
              <span className="min-w-0 flex-1">
                <span className="label-cond block truncate text-[12px] font-bold tracking-[0.06em] text-foreground/90">
                  {ch.name}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-muted-foreground">
                  {ch.next}
                </span>
              </span>
            </button>
          ))}
        </div>
      </RailCard>

      <AdSlot placement="SIDEBAR" />

      <RailCard title="Watch on TV">
        <div className="px-5 py-4">
          <ol className="space-y-3">
            {[
              {
                title: "Use fullscreen",
                body: "Expand the player with the fullscreen control for the big-screen view.",
              },
              {
                title: "Smart TV browser",
                body: "Open the site on your TV browser and sign in with the same account.",
              },
              {
                title: "Switch servers",
                body: "Streams are HLS multi-bitrate — if one source buffers, jump to another instantly.",
              },
            ].map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="tabular flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/12 text-[11px] font-bold text-primary">
                  {i + 1}
                </span>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">{step.title}.</span> {step.body}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-4 grid grid-cols-3 divide-x divide-border/50 rounded-md border border-border bg-elevated/50">
            <div className="px-2 py-3 text-center">
              <p className="score-num text-lg text-foreground">{CHANNELS.length}</p>
              <p className="kicker mt-1 text-[9px] text-muted-foreground">Channels</p>
            </div>
            <div className="px-2 py-3 text-center">
              <p className="score-num text-lg text-foreground">{totalServers}</p>
              <p className="kicker mt-1 text-[9px] text-muted-foreground">Sources</p>
            </div>
            <div className="px-2 py-3 text-center">
              <p className="score-num text-lg text-foreground">{freeToAir}</p>
              <p className="kicker mt-1 text-[9px] text-muted-foreground">Free-to-air</p>
            </div>
          </div>
        </div>
      </RailCard>
    </>
  );

  return (
    <PageLayout rail={rail} width="wide">
      <PageHeader
        title="Live TV"
        kicker="watch live"
        subtitle="Sports and football channels streamed from multiple servers — switch sources instantly, never miss kick-off."
        icon={<Tv className="h-3.5 w-3.5" aria-hidden />}
      >
        <span className="flex items-center gap-1.5 rounded-[4px] border border-fhb-red/45 bg-fhb-red/10 px-3 py-1.5 text-[11px] font-bold text-fhb-red">
          <span className="live-dot h-1.5 w-1.5 rounded-[2px] bg-fhb-red" aria-hidden />
          {fmtNum(CHANNELS.length)} channels online
        </span>
      </PageHeader>

      {/* ═══ Theater player ═══ */}
      <section ref={playerSectionRef} className="reveal" aria-label="Live stream player">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* ── Video area — native controls ── */}
          <div className="relative aspect-video w-full overflow-hidden bg-black">
            <video
              ref={videoRef}
              className="h-full w-full object-contain"
              controls
              playsInline
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onVolumeChange={() => setMuted(!!videoRef.current?.muted)}
              onError={() => {
                if (playing) setError("This stream is currently unavailable. Try another server or channel.");
              }}
              aria-label={`Live stream: ${active.name}`}
            />

            {/* Idle state — flat poster */}
            {!playing && !error && !loading && (
              <button
                onClick={() => void loadStream(src)}
                className="group absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black px-6 text-center"
                aria-label={`Play ${active.name}`}
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-[10px] font-display text-lg font-bold tracking-wide text-white ring-1 ring-inset ring-white/20"
                  style={{ backgroundColor: active.color }}
                >
                  {active.monogram}
                </span>
                <span>
                  <span className="label-cond flex items-center justify-center gap-2.5 text-lg font-bold tracking-[0.05em] text-white sm:text-xl">
                    {active.name}
                    <span className="flex items-center gap-1.5 rounded-[4px] bg-fhb-red px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-white">
                      <span className="live-dot h-1.5 w-1.5 rounded-full bg-white" aria-hidden /> Live
                    </span>
                  </span>
                  <span className="mt-1.5 block text-xs text-white/70 sm:text-[13px]">{active.nowPlaying}</span>
                </span>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105 group-active:scale-95">
                  <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden />
                </span>
                <span className="text-[11px] font-medium text-white/55">Tap to start the stream</span>
              </button>
            )}

            {/* Buffering / connecting */}
            {loading && (
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55">
                <RefreshCw className="h-9 w-9 animate-spin text-white/85" aria-hidden />
                <span className="label-cond text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                  Connecting to {currentServer.label}
                </span>
                <span className="sr-only">Stream loading</span>
              </span>
            )}

            {/* Error — retry / next server */}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 px-6 text-center">
                <AlertTriangle className="h-9 w-9 text-white/80" aria-hidden />
                <p className="max-w-sm text-sm font-semibold text-white">{error}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => void loadStream(src)} className="rounded-[6px] bg-primary text-primary-foreground">
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Retry
                  </Button>
                  {active.servers.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setServerIdx((i) => (i + 1) % active.servers.length);
                      }}
                      className="rounded-[6px] border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    >
                      Try next server
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* LIVE chip while playing */}
            {playing && !loading && (
              <span className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-[4px] bg-black/60 px-2 py-1">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-fhb-red" aria-hidden />
                <span className="label-cond text-[10px] font-bold uppercase tracking-[0.14em] text-white">Live</span>
                <span className="text-[10px] font-medium text-white/60">{currentServer.label}</span>
              </span>
            )}
          </div>

          {/* ── Channel info strip ── */}
          <div className="border-t border-border p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3.5">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] font-display text-sm font-bold text-white ring-1 ring-inset ring-white/15"
                  style={{ backgroundColor: active.color }}
                  aria-hidden
                >
                  {active.monogram}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="label-cond text-[18px] font-bold leading-none tracking-[0.04em] text-foreground">
                      {active.name}
                    </h2>
                    <span className="flex items-center gap-1.5 rounded-[4px] border border-fhb-red/35 bg-fhb-red/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-fhb-red">
                      <span className="live-dot h-1.5 w-1.5 rounded-full bg-fhb-red" aria-hidden /> Live
                    </span>
                    <span className="rounded-[4px] border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                      {CATEGORY_LABEL[active.category]}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{active.tagline}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="tabular flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary/80" aria-hidden />
                  {active.demo ? (
                    <span className="font-semibold text-muted-foreground">Demo preview feed</span>
                  ) : (
                    `${fmtLocale(active.viewers)} watching`
                  )}
                </span>
                <span className="label-cond hidden font-semibold tracking-[0.08em] sm:flex">HD</span>
              </div>
            </div>

            {/* EPG */}
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-elevated/50 px-3.5 py-2.5">
                <p className="kicker text-fhb-red">Now playing</p>
                <p className="mt-1 text-[13px] font-semibold leading-snug text-foreground">{active.nowPlaying}</p>
              </div>
              <div className="rounded-md border border-border bg-elevated/50 px-3.5 py-2.5">
                <p className="kicker text-muted-foreground">Up next</p>
                <p className="mt-1 text-[13px] font-semibold leading-snug text-foreground/75">{active.next}</p>
              </div>
            </div>

            {/* Server switcher */}
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="kicker flex items-center gap-1.5 text-muted-foreground">
                  <Server className="h-3.5 w-3.5 text-primary/80" aria-hidden /> Servers
                </span>
                {active.servers.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => {
                      setServerIdx(i);
                      setPlaying(true);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-[4px] border px-3.5 py-1.5 text-[11px] font-bold transition-colors",
                      i === serverIdx
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                    aria-pressed={i === serverIdx}
                  >
                    {s.label}
                    {s.note && <span className="text-[10px] font-medium opacity-70">· {s.note}</span>}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Stream stutters? Switch to another server — playback resumes from the live edge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── In-feed ad between player and guide ── */}
      <div className="reveal mt-6">
        <AdSlot placement="IN_FEED" />
      </div>

      {/* ═══ Channel guide ═══ */}
      <section className="reveal mt-10" aria-label="Channel guide">
        <SectionHeader
          title="Channel Guide"
          kicker={`${filtered.length} of ${CHANNELS.length} channels`}
          icon={<Radio className="h-3.5 w-3.5" aria-hidden />}
        />
        <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1" role="tablist" aria-label="Channel categories">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              role="tab"
              aria-selected={category === c.key}
              className={cn(
                "flex h-8 shrink-0 items-center rounded-full border px-3.5 text-[12px] font-semibold transition-colors",
                category === c.key
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground/75 hover:border-white/20"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {filtered.map((ch) => {
            const isActive = ch.id === active.id;
            return (
              <button
                key={ch.id}
                onClick={() => watchChannel(ch, 0)}
                className={cn(
                  "card-lift overflow-hidden rounded-lg border text-left",
                  isActive ? "border-primary/50 bg-primary/[0.04]" : "border-border bg-card"
                )}
                aria-current={isActive ? "true" : undefined}
                aria-label={`Watch ${ch.name}`}
              >
                {/* Flat thumbnail tile — brand monogram on elevated surface */}
                <span className="relative flex h-[76px] items-center justify-center border-b border-border/50 bg-elevated">
                  <span
                    aria-hidden
                    className="flex h-11 w-11 items-center justify-center rounded-[8px] font-display text-[14px] font-bold uppercase tracking-tight text-white ring-1 ring-inset ring-white/20"
                    style={{ backgroundColor: ch.color }}
                  >
                    {ch.monogram}
                  </span>
                  <span className="live-dot absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-fhb-red" aria-label="Live" />
                  <span className="tabular absolute bottom-1.5 left-2 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                    <Users className="h-3 w-3" aria-hidden />
                    {fmtCompact(ch.viewers)}
                  </span>
                  {ch.servers.length > 1 && (
                    <span className="tabular absolute bottom-1.5 right-2 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                      <Server className="h-3 w-3" aria-hidden />
                      {ch.servers.length}
                    </span>
                  )}
                </span>
                <span className="block px-3 py-2.5">
                  <span className={cn("block truncate text-[13px] font-bold", isActive ? "text-primary" : "text-foreground")}>
                    {ch.name}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-[4px] bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                      {CATEGORY_LABEL[ch.category]}
                    </span>
                    {isActive && (
                      <span className="rounded-[4px] bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-primary">
                        Watching
                      </span>
                    )}
                  </span>
                  <span className="mt-1.5 line-clamp-1 block text-[10.5px] text-muted-foreground/85">{ch.nowPlaying}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Custom stream loader ── */}
      <section className="reveal mt-10 rounded-lg border border-dashed border-border bg-card" aria-label="Custom stream">
        <button
          onClick={() => setShowCustom((v) => !v)}
          className="flex w-full items-center gap-3.5 px-4 py-4 text-left sm:px-5"
          aria-expanded={showCustom}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
            <Link2 className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-foreground">Play any stream URL</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Connect external servers or licensed feeds — paste any .m3u8 link
            </span>
          </span>
          <ChevronRight
            className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", showCustom && "rotate-90")}
            aria-hidden
          />
        </button>
        {showCustom && (
          <div className="grid gap-2 border-t border-border px-4 py-4 sm:grid-cols-[1fr_170px_auto] sm:px-5">
            <Input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://your-server.com/stream/index.m3u8"
              className="h-11 rounded-lg bg-background"
              aria-label="Stream URL"
            />
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Channel name (optional)"
              className="h-11 rounded-lg bg-background"
              aria-label="Channel name"
            />
            <Button onClick={playCustom} className="h-11 rounded-lg px-5 text-xs font-bold">
              <Play className="h-3.5 w-3.5 fill-current" aria-hidden /> Play
            </Button>
          </div>
        )}
      </section>

      {/* Legal note */}
      <p className="reveal mt-6 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
        Demo preview — channels marked “demo feed” play public sample streams. At deployment, licensed broadcast
        URLs can be plugged into each server slot — the player, server switching and multi-bitrate HLS engine are
        production-ready.
      </p>
    </PageLayout>
  );
}
