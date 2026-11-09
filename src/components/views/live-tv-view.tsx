"use client";

/**
 * FHB Live TV — multi-server HLS streaming hub.
 *
 * Channel grid + player with Server 1/2/3 source switching, exactly like a
 * broadcast-grade streaming portal. Demo streams are legal, publicly
 * available HLS feeds (Red Bull TV, DW, France 24, TRT World, NASA TV and
 * standard test streams). The architecture accepts any m3u8 URL — plug in
 * licensed feeds at deployment.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type Hls from "hls.js";
import { useReveal } from "@/hooks/use-reveal";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader } from "@/components/football/section-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";
import {
  Tv, Radio, Play, Pause, Volume2, VolumeX, Maximize, Server, Link2,
  Signal, ShieldCheck, Users, ChevronRight, RefreshCw, AlertTriangle, X,
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

export function LiveTvView() {
  useReveal();
  const [category, setCategory] = useState<string>("all");
  const [active, setActive] = useState<Channel>(CHANNELS[0]);
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

  const filtered = useMemo(
    () => (category === "all" ? CHANNELS : CHANNELS.filter((c) => c.category === category)),
    [category]
  );

  const src = active.servers[Math.min(serverIdx, active.servers.length - 1)].url;

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

  useEffect(() => () => destroyHls(), [destroyHls]);

  const startPlayback = (ch: Channel, idx = 0) => {
    setActive(ch);
    setServerIdx(idx);
    setPlaying(true);
    setError(null);
    // stream loads via the src-change effect
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (!playing && !hlsRef.current && !video.src) {
      await loadStream(src);
      return;
    }
    if (video.paused) {
      await video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const goFullscreen = () => {
    const el = videoRef.current?.parentElement;
    if (el?.requestFullscreen) void el.requestFullscreen();
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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-6 sm:px-6">
      <PageHeader
        title="Live TV"
        kicker="multi-server streaming"
        subtitle="Sports and football channels streamed from multiple servers — switch sources instantly, never miss kick-off"
        icon={<Tv className="h-5 w-5" aria-hidden />}
      >
        <span className="flex items-center gap-1.5 rounded-full border border-fhb-red/45 bg-fhb-red/10 px-3 py-1.5 text-[10px] font-bold text-fhb-red">
          <span className="live-dot h-1.5 w-1.5 rounded-[2px] bg-fhb-red" aria-hidden />
          {fmtNum(CHANNELS.length)} channels online
        </span>
      </PageHeader>

      {/* Billboard ad */}
      <div className="reveal mt-6">
        <AdSlot placement="HEADER_BANNER" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* ═══ Player ═══ */}
        <section className="min-w-0 lg:col-span-2" aria-label="Live stream player">
          <div className="edge-lit overflow-hidden rounded-2xl border border-border bg-card">
            {/* Video area */}
            <div className="relative aspect-video w-full bg-black">
              <video
                ref={videoRef}
                className="h-full w-full max-w-full object-contain"
                playsInline
                controls={false}
                onError={() => {
                  if (playing) setError("This stream is currently unavailable. Try another server or channel.");
                }}
                aria-label={`Live stream: ${active.name}`}
              />
              {/* Idle state */}
              {!playing && !error && (
                <button
                  onClick={() => void loadStream(src)}
                  className="group absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-black/60 via-black/40 to-black/70"
                  aria-label={`Play ${active.name}`}
                >
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/25 bg-black/50 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                    <Play className="ml-1 h-9 w-9 fill-white text-white" />
                  </span>
                  <span className="text-center">
                    <span className="block font-display text-lg font-bold tracking-wide text-white">
                      {active.name}
                    </span>
                    <span className="mt-1 block text-xs text-white/70">
                      {active.nowPlaying} · tap to start the stream
                    </span>
                  </span>
                </button>
              )}
              {/* Loading */}
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <RefreshCw className="h-10 w-10 animate-spin text-white/85" aria-hidden />
                </span>
              )}
              {/* Error */}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center">
                  <AlertTriangle className="h-10 w-10 text-fhb-gold" aria-hidden />
                  <p className="max-w-sm text-sm font-semibold text-white">{error}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => void loadStream(src)} className="rounded-full bg-primary text-primary-foreground">
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Retry
                    </Button>
                    {active.servers.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setServerIdx((i) => (i + 1) % active.servers.length);
                        }}
                        className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                      >
                        Try next server
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {/* Top overlay: channel chip */}
              {playing && (
                <span className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 backdrop-blur-md">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-md font-display text-[10px] font-bold text-white"
                    style={{ backgroundColor: active.color }}
                    aria-hidden
                  >
                    {active.monogram}
                  </span>
                  <span className="text-xs font-bold text-white">{active.name}</span>
                  <span className="flex items-center gap-1 rounded-sm bg-fhb-red px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                    <span className="live-dot h-1 w-1 rounded-full bg-white" aria-hidden /> Live
                  </span>
                </span>
              )}
              {/* Controls */}
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/85 to-transparent px-3 pb-3 pt-8">
                <button
                  onClick={() => void togglePlay()}
                  className="tap-target flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/30"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause className="h-[18px] w-[18px]" aria-hidden /> : <Play className="ml-0.5 h-[18px] w-[18px] fill-white" aria-hidden />}
                </button>
                <button
                  onClick={toggleMute}
                  className="tap-target flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/30"
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <VolumeX className="h-[18px] w-[18px]" aria-hidden /> : <Volume2 className="h-[18px] w-[18px]" aria-hidden />}
                </button>
                <div className="ml-1 min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-white/90">{active.nowPlaying}</p>
                  <p className="truncate text-[10px] text-white/60">
                    {active.servers[Math.min(serverIdx, active.servers.length - 1)].label} · HD 1080p
                    {active.demo ? " · demo feed" : " · free-to-air"}
                  </p>
                </div>
                <button
                  onClick={goFullscreen}
                  className="tap-target flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/30"
                  aria-label="Fullscreen"
                >
                  <Maximize className="h-[18px] w-[18px]" aria-hidden />
                </button>
              </div>
            </div>

            {/* Info bar + servers */}
            <div className="border-t border-border bg-muted/30 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                    {active.name}
                    <span className="rounded-md bg-primary/12 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary">
                      {active.category === "bangladesh" ? "Bangladesh" : active.category}
                    </span>
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{active.tagline}</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary/80" aria-hidden />
                    {fmtNum(active.viewers)} watching
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Signal className="h-3.5 w-3.5 text-primary/80" aria-hidden /> HD
                  </span>
                </div>
              </div>

              {/* EPG */}
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card px-3.5 py-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-fhb-red">Now playing</p>
                  <p className="mt-1 text-[13px] font-semibold text-foreground">{active.nowPlaying}</p>
                </div>
                <div className="rounded-xl border border-border bg-card px-3.5 py-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Up next</p>
                  <p className="mt-1 text-[13px] font-semibold text-foreground/80">{active.next}</p>
                </div>
              </div>

              {/* Server switcher */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
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
                      "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition-all active:scale-95",
                      i === serverIdx
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                    aria-pressed={i === serverIdx}
                  >
                    {s.label}
                    {s.note && <span className="text-[9px] font-medium opacity-70">· {s.note}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom stream box */}
          <div className="edge-lit mt-5 rounded-2xl border border-dashed border-border bg-card/60 p-4 sm:p-5">
            <button
              onClick={() => setShowCustom((v) => !v)}
              className="flex w-full items-center gap-3 text-left"
              aria-expanded={showCustom}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <Link2 className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-foreground">Play any stream URL</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Connect external servers or licensed feeds — paste any .m3u8 link
                </span>
              </span>
              <ChevronRight className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", showCustom && "rotate-90")} aria-hidden />
            </button>
            {showCustom && (
              <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_180px_auto]">
                <Input
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://your-server.com/stream/index.m3u8"
                  className="h-11 rounded-xl bg-card text-sm"
                  aria-label="Stream URL"
                />
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Channel name (optional)"
                  className="h-11 rounded-xl bg-card text-sm"
                  aria-label="Channel name"
                />
                <Button onClick={playCustom} className="h-11 rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground">
                  <Play className="mr-1.5 h-3.5 w-3.5 fill-current" aria-hidden /> Play
                </Button>
              </div>
            )}
          </div>

          {/* Legal note */}
          <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
            Demo preview: channels marked &ldquo;demo feed&rdquo; play public sample streams. At
            deployment, licensed broadcast URLs can be plugged into each server slot — the player,
            server switching and multi-bitrate HLS engine are production-ready.
          </p>
        </section>

        {/* ═══ Channel grid sidebar ═══ */}
        <aside className="min-w-0" aria-label="Channel list">
          <div className="sticky top-24 space-y-4">
            <AdSlot placement="SIDEBAR" className="w-full" />
            <div className="edge-lit overflow-hidden rounded-2xl border border-border bg-card">
              <p className="flex items-center gap-2.5 border-b border-border bg-muted/40 px-4 py-3.5 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-fhb-red/12 text-fhb-red">
                  <Radio className="h-3.5 w-3.5" aria-hidden />
                </span>
                Channel Guide
              </p>
              {/* Category chips */}
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-border px-3 py-2.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all active:scale-95",
                      category === c.key
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="max-h-[560px] divide-y divide-border/50 overflow-y-auto">
                {filtered.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => startPlayback(ch, 0)}
                    className={cn(
                      "group flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-accent/50",
                      active.id === ch.id && "bg-primary/10"
                    )}
                    aria-current={active.id === ch.id ? "true" : undefined}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-xs font-bold text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.25),inset_0_-2px_4px_rgba(0,0,0,0.3)]"
                      style={{ backgroundColor: ch.color }}
                      aria-hidden
                    >
                      {ch.monogram}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-bold text-foreground group-hover:text-primary">
                          {ch.name}
                        </span>
                        <span className="live-dot h-1.5 w-1.5 shrink-0 rounded-[2px] bg-fhb-red" aria-label="Live" />
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{ch.nowPlaying}</span>
                    </span>
                    <Play className="h-4 w-4 shrink-0 fill-muted-foreground/40 text-muted-foreground/40 transition-colors group-hover:fill-primary group-hover:text-primary" aria-hidden />
                  </button>
                ))}
              </div>
            </div>
            {/* Rectangle ad */}
            <AdSlot placement="MOBILE_BANNER" className="w-full" />
          </div>
        </aside>
      </div>

      {/* Bottom in-feed ad */}
      <div className="reveal mt-10">
        <AdSlot placement="IN_FEED" />
      </div>
    </div>
  );
}
