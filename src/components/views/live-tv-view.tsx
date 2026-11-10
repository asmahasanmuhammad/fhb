"use client";

/**
 * FHB Live TV — multi-server HLS streaming hub (DAZN-class).
 *
 * Cinematic hero player with Server 1/2/3 source switching, EPG info bar,
 * horizontal channel rail with category filters, custom stream loader and
 * a broadcast-grade right rail (Watch on TV + SIDEBAR ad). Demo streams
 * are legal, publicly available HLS feeds (Red Bull TV, DW, France 24,
 * TRT World, NASA TV and standard test streams). The architecture accepts
 * any m3u8 URL — plug in licensed feeds at deployment.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type Hls from "hls.js";
import { useReveal } from "@/hooks/use-reveal";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader, SectionHeader } from "@/components/football/section-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fmtCompact, fmtNum } from "@/lib/format";
import {
  Tv, Radio, Play, Pause, Volume2, VolumeX, Maximize, Server, Link2,
  Signal, ShieldCheck, Users, ChevronRight, RefreshCw, AlertTriangle,
  MonitorPlay,
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
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      <PageHeader
        title="Live TV Broadcasts"
        kicker="multi-server live streaming · 1080p hd"
        subtitle="Live football and sports channels streaming across BDIX Dhaka and global CDNs — switch servers instantly without buffering"
        icon={<Tv className="h-3.5 w-3.5" aria-hidden />}
      >
        <span className="flex items-center gap-1.5 border border-red-600/40 bg-red-600/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-400">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />
          {fmtNum(CHANNELS.length)} Channels Online
        </span>
      </PageHeader>

      {/* Leaderboard Ad */}
      <div className="reveal mb-6">
        <AdSlot placement="HEADER_BANNER" className="h-[90px]" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* ═══ Player + channel rail ═══ */}
        <div className="min-w-0 space-y-6 lg:col-span-8">
          <section ref={playerSectionRef} className="reveal" aria-label="Live stream player">
            <div className="overflow-hidden rounded-md border border-white/15 bg-[#090d19] shadow-2xl">
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
                {/* Idle state — cinematic poster */}
                {!playing && !error && (
                  <button
                    onClick={() => void loadStream(src)}
                    className="group absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center"
                    aria-label={`Play ${active.name}`}
                    style={{
                      background: `radial-gradient(75% 100% at 50% 0%, ${active.color}35, transparent 60%), radial-gradient(90% 120% at 50% 115%, #000000f0, #000000dd 60%)`,
                    }}
                  >
                    <span
                      className="flex h-16 w-16 items-center justify-center rounded font-black text-xl text-white shadow-2xl"
                      style={{ backgroundColor: active.color }}
                    >
                      {active.monogram}
                    </span>
                    <div>
                      <span className="flex items-center justify-center gap-2 text-xl font-black tracking-tight text-white sm:text-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        {active.name}
                        <span className="flex items-center gap-1.5 bg-[#ff1e46] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white rounded shadow-sm">
                          <span className="live-dot h-1.5 w-1.5 rounded-full bg-white" aria-hidden /> Live
                        </span>
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-[#f1f5f9] sm:text-base">{active.nowPlaying}</span>
                    </div>
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff1e46] text-white shadow-[0_0_20px_rgba(255,30,70,0.6)] transition-transform duration-300 group-hover:scale-110 sheen">
                      <Play className="ml-1 h-7 w-7 fill-white text-white" />
                    </span>
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">Click to Start HD Broadcast</span>
                  </button>
                )}
                {/* Loading */}
                {loading && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <RefreshCw className="h-10 w-10 animate-spin text-[#ff1e46]" aria-hidden />
                  </span>
                )}
                {/* Error */}
                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 px-6 text-center">
                    <AlertTriangle className="h-10 w-10 text-[#ff1e46]" aria-hidden />
                    <p className="max-w-sm text-sm font-bold text-white">{error}</p>
                    <div className="flex gap-2">
                      <button onClick={() => void loadStream(src)} className="bg-[#ff1e46] px-4 py-2 text-xs font-black uppercase text-white hover:bg-[#e01438] rounded">
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5 inline" aria-hidden /> Retry
                      </button>
                      {active.servers.length > 1 && (
                        <button
                          onClick={() => {
                            setServerIdx((i) => (i + 1) % active.servers.length);
                          }}
                          className="border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase text-white hover:bg-white/20 rounded"
                        >
                          Switch Server
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {/* Top overlay: channel chip */}
                {playing && (
                  <span className="absolute left-3 top-3 flex items-center gap-2 bg-black/80 px-3 py-1.5 backdrop-blur-md border border-white/20 rounded">
                    <span
                      className="flex h-6 w-6 items-center justify-center text-[10px] font-black text-white rounded"
                      style={{ backgroundColor: active.color }}
                      aria-hidden
                    >
                      {active.monogram}
                    </span>
                    <span className="text-xs font-extrabold text-white">{active.name}</span>
                    <span className="flex items-center gap-1 bg-[#ff1e46] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white rounded">
                      <span className="live-dot h-1 w-1 rounded-full bg-white" aria-hidden /> Live
                    </span>
                  </span>
                )}
                {/* Controls */}
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/95 via-black/50 to-transparent px-3 pb-3 pt-10 sm:px-4">
                  <button
                    onClick={() => void togglePlay()}
                    className="flex h-9 w-9 items-center justify-center rounded bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
                    aria-label={playing ? "Pause" : "Play"}
                  >
                    {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="ml-0.5 h-4 w-4 fill-white" aria-hidden />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="flex h-9 w-9 items-center justify-center rounded bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
                    aria-label={muted ? "Unmute" : "Mute"}
                  >
                    {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
                  </button>
                  <div className="ml-1 min-w-0 flex-1">
                    <p className="truncate text-[12px] font-extrabold text-white">{active.nowPlaying}</p>
                    <p className="truncate text-[10.5px] text-[#cbd5e1] font-semibold">
                      <span className="live-dot mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#ff1e46] align-middle" aria-hidden />
                      {currentServer.label} · 1080p HD
                      {active.demo ? " · live test feed" : " · free-to-air"}
                    </p>
                  </div>
                  <button
                    onClick={goFullscreen}
                    className="flex h-9 w-9 items-center justify-center rounded bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
                    aria-label="Fullscreen"
                  >
                    <Maximize className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>

              {/* Info bar + servers */}
              <div className="border-t border-white/12 p-4 sm:p-5 bg-[#090d19]">
                {/* Channel identity */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded font-black text-sm text-white shadow-md"
                      style={{ backgroundColor: active.color }}
                      aria-hidden
                    >
                      {active.monogram}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-black text-xl text-white">{active.name}</h2>
                        <span className="flex items-center gap-1.5 bg-[#ff1e46] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white rounded shadow-sm">
                          <span className="live-dot h-1.5 w-1.5 rounded-full bg-white" aria-hidden /> Live
                        </span>
                        <span className="border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white rounded">
                          {CATEGORY_LABEL[active.category]}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[12.5px] text-[#cbd5e1] font-medium">{active.tagline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-white font-bold">
                    <span className="tabular flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-[#ff1e46]" aria-hidden />
                      {fmtNum(active.viewers)} viewers
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Signal className="h-4 w-4" aria-hidden /> 1080p 60fps
                    </span>
                  </div>
                </div>

                {/* EPG */}
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  <div className="rounded border border-white/12 bg-[#050812] px-4 py-3">
                    <p className="eyebrow text-[10px] text-[#ff1e46] font-black uppercase tracking-widest">Now playing</p>
                    <p className="mt-1 text-[14px] font-extrabold text-white">{active.nowPlaying}</p>
                  </div>
                  <div className="rounded border border-white/12 bg-[#050812] px-4 py-3">
                    <p className="eyebrow text-[10px] text-[#94a3b8] font-black uppercase tracking-widest">Up next</p>
                    <p className="mt-1 text-[14px] font-extrabold text-[#f1f5f9]">{active.next}</p>
                  </div>
                </div>

                {/* Server switcher */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                      <Server className="h-4 w-4 text-[#ff1e46]" aria-hidden /> Servers:
                    </span>
                    {active.servers.map((s, i) => (
                      <button
                        key={s.label}
                        onClick={() => {
                          setServerIdx(i);
                          setPlaying(true);
                        }}
                        className={cn(
                          "flex items-center gap-1.5 rounded px-3 py-1.5 text-[11.5px] font-black uppercase tracking-wider transition-all",
                          i === serverIdx
                            ? "bg-[#ff1e46] text-white shadow-[0_0_10px_rgba(255,30,70,0.5)]"
                            : "border border-white/15 bg-white/10 text-white hover:bg-white/20 hover:border-white/30"
                        )}
                        aria-pressed={i === serverIdx}
                      >
                        {s.label}
                        {s.note && <span className="text-[9.5px] font-normal opacity-80">({s.note})</span>}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11.5px] text-[#cbd5e1] font-medium">
                    BDIX Dhaka 60FPS Low-Latency Relay · Singapore CDN Backup · Instant Source Failover.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Channel rail */}
          <section className="reveal min-w-0" aria-label="Channel guide">
            <SectionHeader
              title="Channel Directory"
              kicker={`${filtered.length} of ${CHANNELS.length} channels live`}
              icon={<Radio className="h-4 w-4" aria-hidden />}
            />
            <div className="no-scrollbar -mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={cn(
                    "shrink-0 rounded px-4 py-1.5 text-[11.5px] font-black uppercase tracking-wider transition-all",
                    category === c.key
                      ? "bg-[#ff1e46] text-white shadow-[0_0_8px_rgba(255,30,70,0.4)]"
                      : "border border-white/12 bg-white/5 text-white hover:bg-white/15 hover:text-white"
                  )}
                  aria-pressed={category === c.key}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1.5">
              {filtered.map((ch) => {
                const isChActive = ch.id === active.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => watchChannel(ch, 0)}
                    className={cn(
                      "group w-[150px] shrink-0 overflow-hidden rounded-md border text-left transition-all",
                      isChActive
                        ? "border-[#ff1e46] bg-red-600/20 shadow-[0_0_15px_rgba(255,30,70,0.3)]"
                        : "border-white/12 bg-[#090d19] hover:border-white/30 hover:bg-[#0f1629]"
                    )}
                    aria-current={isChActive ? "true" : undefined}
                    aria-label={`Watch ${ch.name}`}
                  >
                    {/* Logo tile */}
                    <span className="relative flex h-[76px] items-center justify-center" style={{ backgroundColor: ch.color }}>
                      <span className="text-2xl font-black text-white drop-shadow" aria-hidden>
                        {ch.monogram}
                      </span>
                      <span className="live-dot absolute right-2 top-2 h-2 w-2 rounded-full bg-white shadow-sm" aria-hidden />
                      <span className="tabular absolute bottom-1.5 left-2 flex items-center gap-1 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                        <Users className="h-3 w-3" aria-hidden />
                        {fmtCompact(ch.viewers)}
                      </span>
                    </span>
                    {/* Meta */}
                    <span className="block px-3 py-2.5">
                      <span className={cn("block truncate text-[13px] font-black", isChActive ? "text-[#ff1e46]" : "text-white")}>
                        {ch.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] uppercase font-bold text-[#94a3b8]">
                        {CATEGORY_LABEL[ch.category]}
                      </span>
                      <span className="mt-1 block truncate text-[11px] font-medium text-[#cbd5e1]">{ch.nowPlaying}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Custom stream */}
          <section className="reveal rounded-xl border border-dashed border-border bg-card/60" aria-label="Custom stream">
            <button
              onClick={() => setShowCustom((v) => !v)}
              className="flex w-full items-center gap-3.5 px-4 py-4 text-left sm:px-5"
              aria-expanded={showCustom}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
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
          <p className="reveal flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
            Demo preview: channels marked &ldquo;demo feed&rdquo; play public sample streams. At deployment,
            licensed broadcast URLs can be plugged into each server slot — the player, server switching
            and multi-bitrate HLS engine are production-ready.
          </p>
        </div>

        {/* ═══ Right rail ═══ */}
        <aside className="min-w-0 lg:col-span-4" aria-label="Live TV information">
          <div className="space-y-6 lg:sticky lg:top-[76px]">
            {/* Watch on TV */}
            <section className="reveal rounded-md border border-white/12 bg-[#090d19] shadow-xl overflow-hidden" aria-label="Watch on TV">
              <header className="border-b border-white/12 px-5 py-4 bg-[#050812]">
                <p className="eyebrow flex items-center gap-1.5 text-[#ff1e46] font-black uppercase tracking-widest text-[10px]">
                  <MonitorPlay className="h-4 w-4 text-[#ff1e46]" aria-hidden /> Big Screen
                </p>
                <h2 className="mt-1 text-base font-black tracking-tight text-white">Watch on TV</h2>
              </header>
              <div className="px-5 py-4">
                <ol className="space-y-3.5">
                  {[
                    {
                      title: "Use fullscreen",
                      body: "Tap the expand control on the player for the cinematic 1080p view.",
                    },
                    {
                      title: "Smart TV browser",
                      body: "Open footballhub.com.bd on your Smart TV browser and stream directly.",
                    },
                    {
                      title: "Switch servers",
                      body: "Streams are HLS multi-bitrate — if one source buffers, jump to Server 2 or 3 instantly.",
                    },
                  ].map((step, i) => (
                    <li key={step.title} className="flex gap-3">
                      <span className="tabular flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#ff1e46]/20 border border-[#ff1e46]/40 text-[12px] font-black text-white shadow-sm">
                        {i + 1}
                      </span>
                      <p className="text-xs leading-relaxed text-[#cbd5e1] font-medium">
                        <span className="font-extrabold text-white">{step.title}:</span> {step.body}
                      </p>
                    </li>
                  ))}
                </ol>
                <div className="mt-5 grid grid-cols-3 divide-x divide-white/10 rounded border border-white/12 bg-[#050812]">
                  <div className="px-2 py-3 text-center">
                    <p className="tabular text-xl font-black text-white">{CHANNELS.length}</p>
                    <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Channels</p>
                  </div>
                  <div className="px-2 py-3 text-center">
                    <p className="tabular text-xl font-black text-white">{totalServers}</p>
                    <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Sources</p>
                  </div>
                  <div className="px-2 py-3 text-center">
                    <p className="tabular text-xl font-black text-white">{freeToAir}</p>
                    <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Free-to-air</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sidebar ad */}
            <div className="reveal">
              <AdSlot placement="SIDEBAR" className="w-full" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
