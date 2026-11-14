"use client";

/**
 * FHB Live Sports TV — Exclusive Sports & Live Matches Hub.
 *
 * Dedicated strictly to SPORTS channels and live match streams:
 * - Server 1: Primary Sports Hub (220+ HD Sports Channels: A Sports, T Sports, Willow, beIN, ESPN, Star Sports, etc.)
 * - Server 2: Live Match Feeds (19+ Match Feeds: Barcelona vs Atletico, Real Madrid vs Valencia, Liverpool, Chelsea, Arsenal, etc.)
 * - Server 3: Regional Sports Network (Star Sports, Ten Cricket, beIN, etc.)
 * - Server 4: IPTV Sports Backup (T Sports FHD, Willow HD, PTV Sports HD, etc.)
 *
 * Features:
 * - HLS.js video engine with multi-quality bitrate switching (1080p, 720p, 540p, 360p, 240p, Auto)
 * - 1-Click "Data Saver" mode: saves 60%+ mobile data by locking lower bitrate & reducing buffer
 * - "🔴 Live Matches Now" showcase: immediate access to live cricket and football matches
 * - Quick channel surfing (Next / Prev / Fullscreen / Mute / Reload)
 * - Sports Categories: All Sports, Live Matches, Cricket, Football, T Sports (BD), Global Networks, Favorites
 * - Real-time channel search
 * - LocalStorage favorites and data-saver preference persistence
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type Hls from "hls.js";
import { useReveal } from "@/hooks/use-reveal";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader, SectionHeader } from "@/components/football/section-header";
import { PageLayout, RailCard } from "@/components/layout/page-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fmtNum } from "@/lib/format";
import curatedChannelsData from "@/data/curated_channels.json";
import server4ChannelsData from "@/data/server4_channels.json";
import { resolveChannelLogo } from "@/lib/tv-logos";
import {
  Tv, Radio, Play, Pause, Server, Link2, ShieldCheck, ChevronRight,
  RefreshCw, AlertTriangle, Heart, Search, SkipBack, SkipForward, Maximize2,
  Volume2, VolumeX, Flame, Check, X, Trophy, Sliders, Zap, Wifi,
  CheckCircle2, Settings, Info, RadioTower, Sparkles
} from "lucide-react";

export type TvChannel = {
  id: string;
  name: string;
  url: string;
  backupUrls?: string[];
  logo: string;
  group: string;
  category: string;
  sportType?: string;
  quality?: string;
};

export type QualityLevel = {
  index: number;
  height: number;
  width: number;
  bitrate: number;
  label: string;
  dataRateDesc: string;
};

// Sports Stream Servers
const SERVERS = [
  { id: 1, name: "Server 1 (Premium Sports HD)", note: "T Sports, Star Sports, Willow, beIN XTRA, TNT Sports", count: "250+" },
  { id: 2, name: "Server 2 (Live Match Feeds)", note: "Barcelona, Real Madrid, Liverpool, Chelsea, Arsenal", count: "19+" },
  { id: 3, name: "Server 3 (Global 1080p Hub)", note: "IPTV-Org Verified: UFC, WWE, DAZN, ACC, Swerve", count: "200+" },
  { id: 4, name: "Server 4 (Cricket & Football)", note: "Cricket Gold, DD Sports HD, Bahrain Sports 1-2, Goal TV", count: "40+" },
];

const SPORTS_CATEGORIES = [
  { key: "all", label: "All Sports", icon: "🏆" },
  { key: "live match", label: "Live Matches", icon: "🔥" },
  { key: "cricket", label: "Cricket", icon: "🏏" },
  { key: "football", label: "Football", icon: "⚽" },
  { key: "t sports (bd)", label: "T Sports (BD)", icon: "🇧🇩" },
  { key: "sports networks", label: "Global Networks", icon: "🌍" },
  { key: "favorites", label: "Favorites", icon: "❤️" },
] as const;

export type DynamicLiveMatch = {
  id: string;
  title: string;
  subtitle: string;
  sport: "Cricket" | "Football" | "Sports";
  icon: string;
  channelUrl: string;
  logo: string;
  badge: string;
  league: string;
  backups: string[];
};

function getInitialLiveMatches(): DynamicLiveMatch[] {
  const matchesMap = new Map<string, DynamicLiveMatch>();
  (server4ChannelsData as TvChannel[]).forEach((c) => {
    const isMatch =
      (c.sportType || "").toLowerCase() === "live match" ||
      c.name.toLowerCase().includes("vs") ||
      c.name.toLowerCase().includes("match");
    if (isMatch) {
      const cleanTitle = c.name.replace(/^[0-9]+\.\s*/, "").trim();
      if (!matchesMap.has(cleanTitle)) {
        const titleLower = cleanTitle.toLowerCase();
        const isCricket =
          titleLower.includes("cricket") ||
          titleLower.includes("bangladesh") ||
          titleLower.includes("sri lanka");
        let league = isCricket ? "International Cricket" : "Live Football";
        if (titleLower.includes("barcelona") || titleLower.includes("madrid") || titleLower.includes("valencia")) {
          league = "La Liga";
        } else if (titleLower.includes("liverpool") || titleLower.includes("chelsea") || titleLower.includes("arsenal")) {
          league = "Premier League";
        }

        matchesMap.set(cleanTitle, {
          id: c.id,
          title: cleanTitle,
          subtitle: isCricket ? "International Cricket • Live Broadcast" : `${league} • Live Broadcast`,
          sport: isCricket ? "Cricket" : "Football",
          icon: isCricket ? "🏏" : "⚽",
          channelUrl: c.url,
          logo: resolveChannelLogo(cleanTitle, c.logo),
          badge: "LIVE NOW",
          league,
          backups: [],
        });
      } else {
        matchesMap.get(cleanTitle)?.backups.push(c.url);
      }
    }
  });
  return Array.from(matchesMap.values());
}

function normalizeChannel(ch: TvChannel): TvChannel {
  if (!ch) return ch;
  return { ...ch, logo: resolveChannelLogo(ch.name, ch.logo) };
}

export function ChannelLogo({
  name,
  logo,
  className,
  fallbackClassName,
}: {
  name: string;
  logo?: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const resolved = useMemo(() => resolveChannelLogo(name, logo), [name, logo]);

  useEffect(() => {
    setHasError(false);
  }, [resolved, name]);

  if (!hasError && resolved) {
    return (
      <img
        src={resolved}
        alt={name}
        loading="lazy"
        className={cn("h-full w-full object-contain transition-all", className)}
        onError={() => setHasError(true)}
      />
    );
  }

  // Graceful, polished fallback badge
  const nLower = (name || "").toLowerCase();
  let bgGradient = "from-primary/20 to-primary/40 text-primary border-primary/30";
  let icon = "🏆";
  if (nLower.includes("cricket") || nLower.includes("willow") || nLower.includes("star sports")) {
    bgGradient = "from-amber-500/20 to-amber-600/40 text-amber-400 border-amber-500/30";
    icon = "🏏";
  } else if (nLower.includes("football") || nLower.includes("fifa") || nLower.includes("barca") || nLower.includes("madrid") || nLower.includes("goal")) {
    bgGradient = "from-emerald-500/20 to-emerald-600/40 text-emerald-400 border-emerald-500/30";
    icon = "⚽";
  } else if (nLower.includes("fight") || nLower.includes("combat") || nLower.includes("ufc") || nLower.includes("wwe") || nLower.includes("dazn")) {
    bgGradient = "from-rose-500/20 to-rose-600/40 text-rose-400 border-rose-500/30";
    icon = "🥊";
  } else if (nLower.includes("tennis")) {
    bgGradient = "from-lime-500/20 to-lime-600/40 text-lime-400 border-lime-500/30";
    icon = "🎾";
  } else if (nLower.includes("racing") || nLower.includes("f1") || nLower.includes("motogp")) {
    bgGradient = "from-orange-500/20 to-orange-600/40 text-orange-400 border-orange-500/30";
    icon = "🏎️";
  }

  const words = name.replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).filter(Boolean);
  const initials = words.length > 1
    ? words.slice(0, 3).map((w) => w[0]).join("").toUpperCase()
    : name.slice(0, 3).toUpperCase();

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-md bg-gradient-to-br border font-bold text-xs select-none shadow-xs px-1",
        bgGradient,
        fallbackClassName
      )}
      title={name}
    >
      <span className="mr-0.5 text-xs">{icon}</span>
      <span className="font-mono tracking-wider text-[11px] font-black">{initials}</span>
    </div>
  );
}

export function LiveTvView() {
  useReveal();

  // Active server and raw sports channels list
  const [activeServerId, setActiveServerId] = useState<number>(1);
  const [channels, setChannels] = useState<TvChannel[]>(
    (curatedChannelsData as TvChannel[]).map(normalizeChannel)
  );
  const [isServerLoading, setIsServerLoading] = useState<boolean>(false);

  // Active playing sports channel (starts on verified T Sports HD)
  const [active, setActive] = useState<TvChannel>(
    normalizeChannel((curatedChannelsData as TvChannel[])[0]) || {
      id: "tsports_hd",
      name: "T Sports HD",
      url: "https://tvsen5.aynaott.com/TnMn5kZz8aLmjklkk/index.m3u8",
      backupUrls: ["https://tvsen5.aynaott.com/TnMn5kZz8aLmjklkk/tracks-v1a1/mono.ts.m3u8"],
      logo: "https://raw.githubusercontent.com/sm-monirulislam/SM-IPTV/main/images/t-sports.png",
      group: "T Sports (BD)",
      category: "Sports",
      sportType: "T Sports (BD)",
      quality: "720p HD",
    }
  );

  const activeRef = useRef<TvChannel>(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const networkRetryCountRef = useRef<number>(0);

  // Filters & Search
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [favorites, setFavorites] = useState<string[]>([]);

  // Video playback state
  const [playing, setPlaying] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Video Quality & Data Saver State
  const [availableLevels, setAvailableLevels] = useState<QualityLevel[]>([]);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(-1); // -1 = Auto
  const [actualLevelIndex, setActualLevelIndex] = useState<number>(-1);
  const [detectedResolution, setDetectedResolution] = useState<{ width: number; height: number; label: string } | null>(null);
  const [isDataSaver, setIsDataSaver] = useState<boolean>(false);
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const isDataSaverRef = useRef<boolean>(false);

  // Dynamic Live Matches State
  const [liveMatches, setLiveMatches] = useState<DynamicLiveMatch[]>(getInitialLiveMatches());
  const [isSyncingMatches, setIsSyncingMatches] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Active");

  // Dynamically sync live matches from remote stream API
  const syncLiveMatches = useCallback(async () => {
    setIsSyncingMatches(true);
    try {
      const res = await fetch("/api/tv/channels?liveMatches=true");
      if (res.ok) {
        const json = await res.json();
        if (json.data?.liveMatches && json.data.liveMatches.length > 0) {
          setLiveMatches(json.data.liveMatches);
          setLastSyncedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        }
      }
    } catch (err) {
      console.warn("Live matches dynamic sync error:", err);
    } finally {
      setIsSyncingMatches(false);
    }
  }, []);

  // Auto-refresh dynamic live matches on mount and every 60 seconds
  useEffect(() => {
    void syncLiveMatches();
    const interval = setInterval(() => {
      void syncLiveMatches();
    }, 60000);
    return () => clearInterval(interval);
  }, [syncLiveMatches]);

  // Custom Stream loader
  const [showCustom, setShowCustom] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>("");
  const [customName, setCustomName] = useState<string>("");

  // Pagination for DOM performance
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 48;

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerSectionRef = useRef<HTMLElement>(null);

  // Load favorites & data saver preference from localStorage
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem("fhb_sports_favorites");
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      }
      const savedDataSaver = localStorage.getItem("fhb_data_saver") === "true";
      setIsDataSaver(savedDataSaver);
      isDataSaverRef.current = savedDataSaver;
    } catch {
      // ignore
    }
  }, []);

  const toggleFavorite = (url: string) => {
    setFavorites((prev) => {
      const next = prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url];
      try {
        localStorage.setItem("fhb_sports_favorites", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Switch server & load channels
  const switchServer = async (serverId: number) => {
    if (serverId === activeServerId) return;
    setActiveServerId(serverId);
    setPage(1);

    if (serverId === 1) {
      setChannels((curatedChannelsData as TvChannel[]).map(normalizeChannel));
    } else if (serverId === 2) {
      setChannels(
        (curatedChannelsData as TvChannel[])
          .filter((c) => c.sportType === "Live Match" || c.name.toLowerCase().includes("vs") || c.name.toLowerCase().includes("match") || c.name.toLowerCase().includes("barca") || c.name.toLowerCase().includes("madrid"))
          .map(normalizeChannel)
      );
    } else if (serverId === 3 || serverId === 4) {
      setChannels((server4ChannelsData as TvChannel[]).map(normalizeChannel));
    }

    setIsServerLoading(true);
    try {
      const res = await fetch(`/api/tv/channels?server=${serverId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data?.channels?.length > 0) {
          const list = (json.data.channels as TvChannel[]).map(normalizeChannel);
          setChannels(list);
          const found = list.find((c: TvChannel) => c.url === active.url);
          if (!found) {
            playChannel(list[0]);
          }
        }
      }
    } catch (e) {
      console.warn("Server switch fetch error:", e);
    } finally {
      setIsServerLoading(false);
    }
  };

  // Filter channels based on Category and Search
  const filteredChannels = useMemo(() => {
    let result = channels;

    if (category === "favorites") {
      result = result.filter((c) => favorites.includes(c.url));
    } else if (category === "live match") {
      result = result.filter(
        (c) =>
          (c.sportType || "").toLowerCase() === "live match" ||
          (c.group || "").toLowerCase().includes("live match") ||
          c.name.toLowerCase().includes("vs") ||
          c.name.toLowerCase().includes("match")
      );
    } else if (category !== "all") {
      result = result.filter((c) => {
        const cat = (c.sportType || c.group || "").toLowerCase();
        return cat.includes(category.toLowerCase());
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.group.toLowerCase().includes(q) ||
          (c.sportType && c.sportType.toLowerCase().includes(q))
      );
    }

    return result;
  }, [channels, category, search, favorites]);

  // Paginated visible channels
  const visibleChannels = useMemo(() => {
    return filteredChannels.slice(0, page * PAGE_SIZE);
  }, [filteredChannels, page]);

  // Clean HLS instance
  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch {
        // ignore
      }
      hlsRef.current = null;
    }
  }, []);

  // Load and play stream with multi-bitrate & Data Saver configuration
  const loadStream = useCallback(
    async (url: string) => {
      const video = videoRef.current;
      if (!video || !url) return;
      destroyHls();
      setError(null);
      setLoading(true);
      setAvailableLevels([]);
      setCurrentLevelIndex(-1);
      setActualLevelIndex(-1);
      setDetectedResolution(null);

      try {
        video.pause();
        video.removeAttribute("src");
        video.load();

        const HlsCtor = (await import("hls.js")).default;

        // In Chrome/Edge/Firefox, Hls.isSupported() MUST be checked first
        if (HlsCtor.isSupported()) {
          const isDataSaverActive = isDataSaverRef.current;

          const hls = new HlsCtor({
            enableWorker: true,
            // Disable lowLatencyMode: fixes random buffering & live-edge stalling!
            lowLatencyMode: false,
            // Solid broadcast buffering: maintains smooth 15-60s ahead
            backBufferLength: isDataSaverActive ? 10 : 90,
            maxBufferLength: isDataSaverActive ? 15 : 60,
            maxMaxBufferLength: isDataSaverActive ? 30 : 120,
            maxBufferSize: 60 * 1000 * 1000,
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 8,
            liveDurationInfinity: true,
            nudgeMaxRetry: 5,
            nudgeOffset: 0.1,
            manifestLoadingTimeOut: 15000,
            manifestLoadingMaxRetry: 4,
            manifestLoadingRetryDelay: 1000,
            levelLoadingTimeOut: 15000,
            levelLoadingMaxRetry: 4,
            fragLoadingTimeOut: 25000,
            fragLoadingMaxRetry: 6,
            fragLoadingRetryDelay: 1000,
            testBandwidth: true,
            abrEwmaDefaultEstimate: 5000000, // Starts at 5Mbps so it picks HD immediately
          });
          hlsRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(video);

          // Manifest parsed: detect multi-bitrate quality levels accurately
          hls.on(HlsCtor.Events.MANIFEST_PARSED, (_event, data) => {
            setLoading(false);
            video.muted = muted;
            void video.play().catch(() => {});

            if (data.levels && data.levels.length > 0) {
              const parsed: QualityLevel[] = data.levels.map((lvl, idx) => {
                let h = lvl.height || 0;
                const bw = lvl.bitrate || 0;
                // If height is not declared in manifest, estimate from bandwidth
                if (h === 0 && bw > 0) {
                  if (bw >= 3500000) h = 1080;
                  else if (bw >= 1800000) h = 720;
                  else if (bw >= 900000) h = 480;
                  else if (bw >= 500000) h = 360;
                }

                let label = h > 0 ? `${h}p` : `Stream ${idx + 1}`;
                if (h >= 1080) label = "1080p FHD";
                else if (h >= 720) label = "720p HD";
                else if (h >= 540) label = "540p SD";
                else if (h >= 480) label = "480p SD";
                else if (h >= 360) label = "360p (Data Saver)";
                else if (h > 0) label = `${h}p`;
                else if (data.levels.length === 1) label = "Source HD";

                const mbPerHour = bw > 0 ? Math.round((bw * 3600) / (8 * 1024 * 1024)) : (h >= 720 ? 950 : 350);
                const dataRateDesc =
                  mbPerHour > 1000
                    ? `~${(mbPerHour / 1024).toFixed(1)} GB/hr`
                    : `~${mbPerHour} MB/hr`;

                return {
                  index: idx,
                  height: h,
                  width: lvl.width || 0,
                  bitrate: bw,
                  label,
                  dataRateDesc,
                };
              });

              setAvailableLevels(parsed);

              // If Data Saver is active, lock to lowest resolution level
              if (isDataSaverRef.current) {
                let minHeightIdx = 0;
                let minHeight = Infinity;
                parsed.forEach((p, i) => {
                  if (p.height > 0 && p.height < minHeight) {
                    minHeight = p.height;
                    minHeightIdx = i;
                  }
                });
                hls.currentLevel = minHeightIdx;
                setCurrentLevelIndex(minHeightIdx);
              } else {
                // Restore preferred quality if stored
                try {
                  const pref = localStorage.getItem("fhb_preferred_quality");
                  if (pref !== null && pref !== undefined && pref !== "-1") {
                    const prefIdx = parseInt(pref, 10);
                    if (!isNaN(prefIdx) && prefIdx < parsed.length) {
                      hls.currentLevel = prefIdx;
                      setCurrentLevelIndex(prefIdx);
                    } else {
                      hls.currentLevel = -1;
                      setCurrentLevelIndex(-1);
                    }
                  } else {
                    hls.currentLevel = -1;
                    setCurrentLevelIndex(-1);
                  }
                } catch {
                  hls.currentLevel = -1;
                  setCurrentLevelIndex(-1);
                }
              }
            } else {
              setAvailableLevels([]);
              setCurrentLevelIndex(-1);
            }
          });

          // Level switched callback
          hls.on(HlsCtor.Events.LEVEL_SWITCHED, (_e, data) => {
            setActualLevelIndex(data.level);
          });

          // Error recovery with auto-retry and backup URL switching
          hls.on(HlsCtor.Events.ERROR, (_e, data) => {
            if (data.fatal) {
              if (data.type === HlsCtor.ErrorTypes.NETWORK_ERROR) {
                if (networkRetryCountRef.current < 3) {
                  networkRetryCountRef.current += 1;
                  setTimeout(() => {
                    if (hlsRef.current) {
                      try {
                        hlsRef.current.startLoad();
                      } catch {}
                    }
                  }, 800);
                } else {
                  // If channel has a backup URL, switch automatically!
                  const cur = activeRef.current;
                  if (cur?.backupUrls && cur.backupUrls.length > 0) {
                    const backup = cur.backupUrls.shift();
                    if (backup) {
                      networkRetryCountRef.current = 0;
                      void loadStream(backup);
                      return;
                    }
                  }
                  setLoading(false);
                  setError("Live broadcast stream is temporarily busy. Click Retry Stream or select another channel.");
                  destroyHls();
                }
              } else if (data.type === HlsCtor.ErrorTypes.MEDIA_ERROR) {
                try {
                  hls.recoverMediaError();
                } catch {
                  destroyHls();
                }
              } else {
                setLoading(false);
                setError("Stream playback paused. Click Retry or switch channel.");
                destroyHls();
              }
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Native Safari iOS/macOS
          video.src = url;
          video.muted = muted;
          void video.play().catch(() => {});
        } else {
          setError("HLS playback is not supported on your browser.");
        }

        const onReady = () => {
          setLoading(false);
          const vH = video.videoHeight;
          const vW = video.videoWidth;
          if (vH > 0) {
            const lbl = vH >= 1080 ? "1080p FHD" : vH >= 720 ? "720p HD" : vH >= 480 ? "480p SD" : `${vH}p`;
            setDetectedResolution({ width: vW, height: vH, label: lbl });
            setAvailableLevels((prev) =>
              prev.map((lvl) => {
                if (lvl.height === 0 || lvl.label.startsWith("Stream") || lvl.label === "Source HD") {
                  return { ...lvl, height: vH, width: vW, label: lbl };
                }
                return lvl;
              })
            );
          }
        };
        video.addEventListener("loadedmetadata", onReady, { once: true });
        video.addEventListener("canplay", onReady, { once: true });
        video.addEventListener("playing", onReady, { once: true });
      } catch (err) {
        console.warn("Playback error:", err);
        setError("Unable to start this stream. Please try another channel.");
        setLoading(false);
      }
    },
    [destroyHls, muted]
  );

  // Play a specific sports channel
  const playChannel = (channel: TvChannel) => {
    networkRetryCountRef.current = 0;
    setActive(channel);
    setPlaying(true);
    setError(null);
    void loadStream(channel.url);
    playerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  // Change video quality level
  const changeQuality = (levelIdx: number) => {
    setCurrentLevelIndex(levelIdx);
    const hls = hlsRef.current;
    if (hls) {
      hls.currentLevel = levelIdx;
      hls.loadLevel = levelIdx;
      hls.nextLevel = levelIdx;
    }
    try {
      localStorage.setItem("fhb_preferred_quality", String(levelIdx));
    } catch {}
    setShowQualityMenu(false);
  };

  // 1-Click Data Saver Toggle
  const toggleDataSaver = () => {
    const next = !isDataSaver;
    setIsDataSaver(next);
    isDataSaverRef.current = next;
    try {
      localStorage.setItem("fhb_data_saver", next ? "true" : "false");
    } catch {}

    const hls = hlsRef.current;
    if (!hls) return;

    if (next) {
      // Data Saver Activated: Restrict buffer size to save network bandwidth
      hls.config.maxBufferLength = 10;
      hls.config.maxMaxBufferLength = 20;
      hls.config.backBufferLength = 5;

      // Automatically select lowest resolution
      if (availableLevels.length > 0) {
        let minHeightIdx = 0;
        let minHeight = Infinity;
        availableLevels.forEach((p, i) => {
          if (p.height > 0 && p.height < minHeight) {
            minHeight = p.height;
            minHeightIdx = i;
          }
        });
        hls.currentLevel = minHeightIdx;
        setCurrentLevelIndex(minHeightIdx);
      }
    } else {
      // Data Saver Deactivated: Restore standard HD buffer sizes & Auto quality
      hls.config.maxBufferLength = 60;
      hls.config.maxMaxBufferLength = 120;
      hls.config.backBufferLength = 90;
      hls.currentLevel = -1; // Auto
      setCurrentLevelIndex(-1);
    }
  };

  // Active quality label for player UI display
  const currentQualityDisplay = useMemo(() => {
    if (detectedResolution) {
      return detectedResolution.label;
    }
    if (currentLevelIndex === -1) {
      if (actualLevelIndex >= 0 && availableLevels[actualLevelIndex]) {
        return `Auto (${availableLevels[actualLevelIndex].label})`;
      }
      return "Auto (HD)";
    }
    if (availableLevels[currentLevelIndex]) {
      return availableLevels[currentLevelIndex].label;
    }
    return active.quality || "HD";
  }, [detectedResolution, currentLevelIndex, actualLevelIndex, availableLevels, active.quality]);

  // Short quality label for mobile screens (1-line fit)
  const compactQualityDisplay = useMemo(() => {
    if (detectedResolution) {
      return detectedResolution.label.replace(/ (HD|FHD|SD)/g, "");
    }
    if (currentLevelIndex === -1) {
      if (actualLevelIndex >= 0 && availableLevels[actualLevelIndex]) {
        return availableLevels[actualLevelIndex].label.replace(/ (HD|FHD|SD)/g, "");
      }
      return "Auto";
    }
    if (availableLevels[currentLevelIndex]) {
      return availableLevels[currentLevelIndex].label.replace(/ (HD|FHD|SD)/g, "");
    }
    return "HD";
  }, [detectedResolution, currentLevelIndex, actualLevelIndex, availableLevels]);

  // Channel surfing
  const currentIndex = useMemo(() => {
    return filteredChannels.findIndex((c) => c.url === active.url);
  }, [filteredChannels, active]);

  const nextChannel = () => {
    if (filteredChannels.length === 0) return;
    const nextIdx = (currentIndex + 1) % filteredChannels.length;
    playChannel(filteredChannels[nextIdx]);
  };

  const prevChannel = () => {
    if (filteredChannels.length === 0) return;
    const prevIdx = (currentIndex - 1 + filteredChannels.length) % filteredChannels.length;
    playChannel(filteredChannels[prevIdx]);
  };

  // Autoplay on mount
  const autoPlayedRef = useRef(false);
  useEffect(() => {
    if (autoPlayedRef.current) return;
    autoPlayedRef.current = true;
    if (active?.url) {
      void loadStream(active.url);
    }
  }, [loadStream, active?.url]);

  useEffect(() => () => destroyHls(), [destroyHls]);

  // Fullscreen trigger
  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (video.requestFullscreen) {
      void video.requestFullscreen();
    }
  };

  // Play custom external stream
  const playCustom = () => {
    const url = customUrl.trim();
    if (!/^https?:\/\/.+/i.test(url)) return;
    const ch: TvChannel = {
      id: "custom_" + Date.now(),
      name: customName.trim() || "Custom Sports Stream",
      url,
      logo: "",
      group: "Live Match",
      category: "Sports",
      sportType: "Live Match",
    };
    setShowCustom(false);
    playChannel(ch);
  };

  // Top Sports channels for quick access rail
  const topSportsList = useMemo(() => {
    return channels.slice(0, 14);
  }, [channels]);

  /* ── Right Rail (Desktop) ── */
  const rail = (
    <>
      {/* Live Match Alert in Rail */}
      <RailCard title="🔴 Ongoing Live Matches">
        <div className="p-3 space-y-2.5">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Direct live feeds for Bangladesh cricket, Barcelona, Real Madrid, Liverpool, Chelsea, and major football tournaments.
          </p>
          <div className="space-y-1.5">
            {liveMatches.slice(0, 3).map((m) => {
              const isCur = m.channelUrl === active.url;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    const matchChannel: TvChannel = {
                      id: m.id,
                      name: m.title,
                      url: m.channelUrl,
                      logo: m.logo,
                      group: "Live Match",
                      category: "Sports",
                      sportType: "Live Match",
                    };
                    playChannel(matchChannel);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md border p-2 text-left transition-colors text-xs",
                    isCur
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border/60 bg-elevated/40 hover:border-primary/40 hover:bg-elevated"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">{m.icon}</span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground text-[11px]">{m.title}</p>
                      <p className="text-[9px] text-muted-foreground">{m.league}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded bg-fhb-red/20 px-1.5 py-0.5 text-[9px] font-bold text-fhb-red animate-pulse">
                    Live
                  </span>
                </button>
              );
            })}
          </div>
          <Button
            size="sm"
            onClick={() => void switchServer(2)}
            className="w-full text-xs font-bold bg-primary text-primary-foreground mt-2"
          >
            <Flame className="h-3.5 w-3.5 mr-1.5 fill-current" /> Open Live Matches Server
          </Button>
        </div>
      </RailCard>

      <AdSlot placement="SIDEBAR" />

      {/* Featured Sports Channels */}
      <RailCard title="⚡ Featured Sports Channels">
        <div className="divide-y divide-border/40">
          {topSportsList.map((ch) => {
            const isCur = ch.url === active.url;
            return (
              <button
                key={ch.id + ch.url}
                onClick={() => playChannel(ch)}
                className={cn(
                  "row-hover flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                  isCur && "bg-primary/10 text-primary"
                )}
                aria-label={`Watch ${ch.name}`}
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-white/5 overflow-hidden p-0.5">
                  <ChannelLogo name={ch.name} logo={ch.logo} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-bold text-foreground">
                    {ch.name}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="live-dot h-1.5 w-1.5 rounded-full bg-fhb-red" />
                    {ch.group || "Sports"}
                  </span>
                </div>
                {isCur && (
                  <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                    Now
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </RailCard>
    </>
  );

  const isFavorite = favorites.includes(active.url);

  return (
    <PageLayout rail={rail} width="wide">
      {/* Header */}
      <PageHeader
        title="Live Sports TV"
        kicker="exclusive sports broadcast hub"
        subtitle="Only live sports channels and ongoing matches — T Sports, Willow TV, A Sports, beIN Sports, Star Sports, and real-time football & cricket games with multi-quality controls."
        icon={<Trophy className="h-3.5 w-3.5 text-primary" aria-hidden />}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-[4px] border border-fhb-red/45 bg-fhb-red/10 px-3 py-1 text-[11px] font-bold text-fhb-red">
            <span className="live-dot h-2 w-2 rounded-full bg-fhb-red animate-pulse" aria-hidden />
            {fmtNum(channels.length)} Sports Channels Live
          </span>
          <span className="rounded-[4px] border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            Server {activeServerId} Active
          </span>
          {isDataSaver && (
            <span className="rounded-[4px] border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <Zap className="h-3 w-3" /> Data Saver ON
            </span>
          )}
        </div>
      </PageHeader>

      {/* ═══ 🔴 Live Matches Now Showcase Bar ═══ */}
      <section className="reveal mb-6" aria-label="Ongoing Live Matches">
        <div className="flex items-center justify-between pb-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fhb-red opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fhb-red" />
            </span>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              🔴 Live Matches Now
            </h2>
            <span className="hidden sm:inline-block rounded-full bg-fhb-red/15 px-2 py-0.5 text-[10px] font-bold text-fhb-red">
              Live Broadcast
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 rounded bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync: {lastSyncedTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void syncLiveMatches()}
              disabled={isSyncingMatches}
              className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              title="Refresh live match feeds from remote stream server"
            >
              <RefreshCw className={cn("h-3 w-3", isSyncingMatches && "animate-spin text-primary")} />
              <span className="hidden sm:inline">{isSyncingMatches ? "Syncing..." : "Sync Feeds"}</span>
            </button>
            <button
              onClick={() => void switchServer(2)}
              className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View All Feeds <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Live Match Cards Carousel / Grid */}
        {liveMatches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center bg-card/60">
            <Trophy className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
            <p className="text-xs font-semibold text-foreground">No live match feeds active right now</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Match event feeds start at kickoff. Enjoy 24/7 sports networks below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {liveMatches.map((m) => {
              const isPlayingThis = active.name.toLowerCase().includes(m.title.toLowerCase().slice(0, 10));
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    const matchChannel: TvChannel = {
                      id: m.id,
                      name: m.title,
                      url: m.channelUrl,
                      logo: m.logo,
                      group: "Live Match",
                      category: "Sports",
                      sportType: "Live Match",
                    };
                    playChannel(matchChannel);
                  }}
                  className={cn(
                    "group relative flex items-center gap-3.5 rounded-xl border p-3 cursor-pointer transition-all overflow-hidden",
                    isPlayingThis
                      ? "border-primary bg-primary/[0.12] shadow-md shadow-primary/10 ring-1 ring-primary/50"
                      : "border-border bg-card hover:border-primary/40 hover:bg-elevated hover:-translate-y-0.5"
                  )}
                >
                  {/* Match Logo / Icon */}
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-white/5 overflow-hidden p-1">
                    <ChannelLogo name={m.title} logo={m.logo} />
                    <span className="absolute bottom-0 right-0 rounded-tl-md bg-fhb-red px-1 text-[8px] font-black text-white">
                      LIVE
                    </span>
                  </div>

                  {/* Match Information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-muted/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        {m.league}
                      </span>
                      {m.backups && m.backups.length > 0 && (
                        <span className="rounded bg-primary/15 px-1 py-0.5 text-[8px] font-bold text-primary">
                          {m.backups.length + 1} Feeds
                        </span>
                      )}
                      <span className="text-[10px]">{m.icon}</span>
                    </div>
                    <h3 className="mt-0.5 truncate text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">
                      {m.title}
                    </h3>
                    <p className="truncate text-[10px] text-muted-foreground">{m.subtitle}</p>
                  </div>

                  {/* Play Action Badge */}
                  <div className="shrink-0 flex items-center">
                    {isPlayingThis ? (
                      <span className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" /> Playing
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg px-2.5 text-[11px] font-bold border-primary/30 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                      >
                        <Play className="h-3 w-3 mr-1 fill-current" /> Watch
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══ Sports Server Selector Bar ═══ */}
      <div className="reveal mb-5">
        <div className="flex items-center justify-between pb-2">
          <span className="kicker flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
            <Server className="h-3.5 w-3.5 text-primary" /> Sports Servers (Select Stream Server)
          </span>
          {isServerLoading && (
            <span className="flex items-center gap-1.5 text-xs text-primary animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin" /> Loading sports feeds...
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SERVERS.map((srv) => {
            const isCur = srv.id === activeServerId;
            return (
              <button
                key={srv.id}
                onClick={() => void switchServer(srv.id)}
                className={cn(
                  "relative flex flex-col items-start rounded-lg border p-2.5 text-left transition-all",
                  isCur
                    ? "border-primary bg-primary/15 shadow-sm shadow-primary/20 ring-1 ring-primary/40"
                    : "border-border bg-card hover:border-primary/40 hover:bg-elevated"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className={cn("text-[12px] font-bold", isCur ? "text-primary" : "text-foreground")}>
                    {srv.name}
                  </span>
                  {isCur && <span className="h-2 w-2 rounded-full bg-primary animate-ping" />}
                </div>
                <span className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">{srv.note}</span>
                <span className="mt-1.5 rounded bg-muted/60 px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                  {srv.count} sports channels
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ Theater Player ═══ */}
      <section ref={playerSectionRef} className="reveal mb-6" aria-label="Live Sports Player">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {/* Video Container */}
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
                if (playing) {
                  setError("Stream is currently buffering. Try Server 2 (Live Matches) or another channel.");
                }
              }}
              aria-label={`Live stream: ${active.name}`}
            />

            {/* Poster / Idle State */}
            {!playing && !error && !loading && (
              <button
                onClick={() => void loadStream(active.url)}
                className="group absolute inset-0 flex flex-col items-center justify-center gap-3.5 bg-black/85 px-6 text-center"
                aria-label={`Play ${active.name}`}
              >
                <div className="h-16 w-36 flex items-center justify-center rounded-xl p-1 bg-white/10 ring-1 ring-white/20 overflow-hidden">
                  <ChannelLogo name={active.name} logo={active.logo} className="h-14 w-auto max-w-full" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                    {active.name}
                    <span className="rounded bg-fhb-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      Live
                    </span>
                  </h3>
                  <p className="mt-1 text-xs text-white/70">Category: {active.group || "Sports"}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform group-hover:scale-110">
                  <Play className="ml-1 h-6 w-6 fill-current" />
                </div>
                <span className="text-[11px] font-medium text-white/60">Click to start live sports stream</span>
              </button>
            )}

            {/* Buffering Indicator */}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-xs">
                <RefreshCw className="h-10 w-10 animate-spin text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white">
                  Connecting to {active.name}...
                </span>
              </div>
            )}

            {/* Stream Error Overlay */}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5 bg-black/90 px-6 text-center">
                <AlertTriangle className="h-10 w-10 text-fhb-red" />
                <p className="max-w-md text-sm font-semibold text-white">{error}</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => void loadStream(active.url)}
                    className="rounded-md bg-primary text-primary-foreground"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry Stream
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={nextChannel}
                    className="rounded-md border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    Next Sports Channel <SkipForward className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => void switchServer(2)}
                    className="rounded-md bg-fhb-red text-white hover:bg-fhb-red/90"
                  >
                    <Flame className="h-3.5 w-3.5 mr-1.5" /> Switch to Live Matches Server
                  </Button>
                </div>
              </div>
            )}

            {/* Live Indicator Overlay */}
            {playing && !loading && (
              <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-md bg-black/70 px-2.5 py-1 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-fhb-red animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">Live Sports</span>
                <span className="text-[10px] text-white/70">Server {activeServerId}</span>
              </div>
            )}

            {/* Current Active Quality Badge Overlay */}
            {playing && !loading && (
              <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-black/70 px-2.5 py-1 backdrop-blur-sm text-[10px] font-bold text-white">
                {isDataSaver ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Zap className="h-3 w-3 fill-current" /> Data Saver
                  </span>
                ) : (
                  <span className="text-white/90 flex items-center gap-1">
                    <Wifi className="h-3 w-3 text-primary" /> {currentQualityDisplay}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick Channel Surfing & Quality Toolbar */}
          <div className="border-t border-border p-3 sm:px-4 sm:py-2.5 bg-card flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-3">
            {/* Channel Info Row */}
            <div className="flex min-w-0 items-center gap-2 sm:gap-3 pb-2.5 border-b border-border/40 lg:border-b-0 lg:pb-0 shrink-0">
              <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-white/5 overflow-hidden p-0.5">
                <ChannelLogo name={active.name} logo={active.logo} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-sm sm:text-base font-bold leading-none text-foreground max-w-[150px] sm:max-w-[220px] lg:max-w-[260px] truncate" title={active.name}>
                    {active.name}
                  </h2>
                  <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary shrink-0">
                    {active.group || "Sports"}
                  </span>
                  {detectedResolution ? (
                    <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 shrink-0 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {detectedResolution.label}
                    </span>
                  ) : active.quality ? (
                    <span className="rounded bg-sky-500/15 border border-sky-500/30 px-1.5 py-0.5 text-[9px] font-bold text-sky-400 shrink-0">
                      {active.quality}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground truncate flex items-center gap-1.5">
                  <span>Server {activeServerId}</span>
                  <span>•</span>
                  <span className="font-semibold text-foreground/80">
                    {detectedResolution ? `${detectedResolution.label} (${detectedResolution.width}x${detectedResolution.height})` : currentQualityDisplay}
                  </span>
                  {isDataSaver && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                        <Zap className="h-2.5 w-2.5 fill-current" /> Data Saver Active
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Controls Toolbar: 1 Line on Mobile & 1 Unified Line with Info on Desktop */}
            <div className="flex items-center justify-between lg:justify-end gap-1 sm:gap-1.5 flex-nowrap overflow-x-auto no-scrollbar shrink-0">
              {/* Left Group: Surfing & Playback */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={prevChannel}
                  className="h-8 w-8 sm:h-8.5 sm:w-8.5 p-0 rounded-md"
                  title="Previous Sports Channel"
                >
                  <SkipBack className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    const v = videoRef.current;
                    if (!v) return;
                    if (v.paused) void v.play();
                    else v.pause();
                    setPlaying(!v.paused);
                  }}
                  className="h-8 w-8 sm:h-8.5 sm:w-8.5 p-0 rounded-md font-semibold text-xs"
                  title={playing ? "Pause Stream" : "Play Stream"}
                >
                  {playing ? (
                    <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  ) : (
                    <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current ml-0.5" />
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={nextChannel}
                  className="h-8 w-8 sm:h-8.5 sm:w-8.5 p-0 rounded-md"
                  title="Next Sports Channel"
                >
                  <SkipForward className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>

              {/* Divider on PC Desktop */}
              <div className="hidden lg:block h-5 w-px bg-border/60 mx-1 shrink-0" />

              {/* Right Group: Quality, Data Saver & Tools */}
              <div className="flex items-center gap-1 shrink-0">
                {/* 1-Click Data Saver Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleDataSaver}
                  className={cn(
                    "h-8 sm:h-8.5 px-2 sm:px-2.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 shrink-0",
                    isDataSaver
                      ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40"
                      : "border-border hover:border-emerald-500/40 text-muted-foreground hover:text-foreground"
                  )}
                  title={isDataSaver ? "Disable Data Saver (ON)" : "Enable Data Saver (Reduces bandwidth & buffering)"}
                >
                  <Zap className={cn("h-3.5 w-3.5", isDataSaver && "fill-emerald-400 text-emerald-400 animate-pulse")} />
                  <span className="hidden sm:inline">{isDataSaver ? "Data Saver: ON" : "Data Saver"}</span>
                </Button>

                {/* Video Quality Menu Dropdown with Radix Portal (Immune to overflow clipping) */}
                <Popover open={showQualityMenu} onOpenChange={setShowQualityMenu}>
                  <PopoverTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "h-8 sm:h-8.5 px-2 rounded-md text-xs font-semibold flex items-center gap-1",
                        showQualityMenu && "border-primary bg-primary/10 text-primary"
                      )}
                      title="Change Video Quality"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span className="text-[11px] sm:text-xs font-semibold">{compactQualityDisplay}</span>
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    side="top"
                    align="end"
                    sideOffset={8}
                    className="w-72 max-w-[calc(100vw-32px)] rounded-xl border border-border bg-popover p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-2 px-1">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sliders className="h-3.5 w-3.5 text-primary" /> Video Quality
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {availableLevels.length > 0 ? `${availableLevels.length} Levels Available` : "Auto Adaptive"}
                      </span>
                    </div>

                    {/* Quality Option List */}
                    <div className="space-y-1">
                      {/* Auto (ABR) */}
                      <button
                        onClick={() => changeQuality(-1)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                          currentLevelIndex === -1
                            ? "bg-primary/15 text-primary font-bold"
                            : "hover:bg-elevated text-foreground"
                        )}
                      >
                        <div>
                          <p className="font-semibold text-xs">Auto (Adaptive)</p>
                          <p className="text-[10px] text-muted-foreground">Optimal quality based on connection speed</p>
                        </div>
                        {currentLevelIndex === -1 && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>

                      {/* Parsed Levels */}
                      {availableLevels.length > 0 ? (
                        availableLevels.map((lvl) => {
                          const isCur = currentLevelIndex === lvl.index;
                          return (
                            <button
                              key={lvl.index}
                              onClick={() => changeQuality(lvl.index)}
                              className={cn(
                                "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                                isCur
                                  ? "bg-primary/15 text-primary font-bold"
                                  : "hover:bg-elevated text-foreground"
                              )}
                            >
                              <div>
                                <span className="font-semibold">{lvl.label}</span>
                                {lvl.dataRateDesc && (
                                  <span className="ml-2 text-[10px] text-muted-foreground">
                                    ({lvl.dataRateDesc})
                                  </span>
                                )}
                              </div>
                              {isCur && <Check className="h-4 w-4 text-primary shrink-0" />}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-2.5 py-2 text-[11px] text-muted-foreground bg-elevated/40 rounded-lg">
                          <p className="font-medium text-foreground">
                            {detectedResolution ? `${detectedResolution.label} (${detectedResolution.width}x${detectedResolution.height})` : "Direct Broadcast Stream"}
                          </p>
                          <p className="mt-0.5 text-[10px]">
                            Stream is streaming at native broadcast quality with automatic adaptive buffering.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Net saving tip */}
                    <div className="mt-2.5 pt-2 border-t border-border/60 px-1 text-[10px] text-muted-foreground flex items-start gap-1.5">
                      <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>Select 360p or enable Data Saver mode to save mobile data.</span>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Favorite */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleFavorite(active.url)}
                  className={cn(
                    "h-8 w-8 sm:h-8.5 sm:w-8.5 p-0 rounded-md",
                    isFavorite && "text-fhb-red border-fhb-red/50 bg-fhb-red/10"
                  )}
                  title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                >
                  <Heart className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
                </Button>

                {/* Reload Stream */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void loadStream(active.url)}
                  className="h-8 w-8 sm:h-8.5 sm:w-8.5 p-0 rounded-md"
                  title="Reload Stream"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>

                {/* Fullscreen */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleFullscreen}
                  className="h-8 w-8 sm:h-8.5 sm:w-8.5 p-0 rounded-md"
                  title="Full Screen"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ In-feed ad ═══ */}
      <div className="reveal mb-8">
        <AdSlot placement="IN_FEED" />
      </div>

      {/* ═══ Sports Channel Guide & Search ═══ */}
      <section className="reveal" aria-label="Sports Channel Guide">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <SectionHeader
            title="Sports Channels & Match Feeds"
            kicker={`${filteredChannels.length} Sports Feeds Available`}
            icon={<Trophy className="h-3.5 w-3.5 text-primary" aria-hidden />}
            className="mb-0"
          />

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search cricket, football or channel..."
              className="h-9 pl-9 pr-8 text-xs bg-card rounded-md"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sports Category Filter Pills */}
        <div className="no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 py-1" role="tablist">
          {SPORTS_CATEGORIES.map((cat) => {
            const isCur = category === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  setCategory(cat.key);
                  setPage(1);
                }}
                role="tab"
                aria-selected={isCur}
                className={cn(
                  "flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold transition-all",
                  isCur
                    ? "border-primary bg-primary/15 text-primary shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:border-white/20 hover:text-foreground"
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                {cat.key === "favorites" && favorites.length > 0 && (
                  <span className="ml-1 rounded-full bg-fhb-red px-1.5 text-[10px] font-bold text-white">
                    {favorites.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sports Channel Grid */}
        {visibleChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-14 text-center">
            <Trophy className="h-10 w-10 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-semibold text-foreground">No sports channels found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try searching with another keyword or switch server.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setCategory("all");
                setSearch("");
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6">
              {visibleChannels.map((ch) => {
                const isCur = ch.url === active.url;
                const isFav = favorites.includes(ch.url);
                return (
                  <div
                    key={ch.id + ch.url}
                    onClick={() => playChannel(ch)}
                    className={cn(
                      "group relative flex flex-col justify-between overflow-hidden rounded-lg border p-3 cursor-pointer transition-all",
                      isCur
                        ? "border-primary bg-primary/[0.08] shadow-md shadow-primary/10 ring-1 ring-primary/40"
                        : "border-border bg-card hover:border-primary/40 hover:bg-elevated hover:-translate-y-0.5"
                    )}
                  >
                    {/* Top Row: Sport Type & Favorite */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                        {ch.group || "Sports"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(ch.url);
                        }}
                        className="text-muted-foreground hover:text-fhb-red transition-colors p-1"
                        title={isFav ? "Remove Favorite" : "Save Favorite"}
                      >
                        <Heart className={cn("h-3.5 w-3.5", isFav && "fill-fhb-red text-fhb-red")} />
                      </button>
                    </div>

                    {/* Logo */}
                    <div className="flex h-14 w-full items-center justify-center p-1 rounded-md bg-white/5 overflow-hidden">
                      <ChannelLogo name={ch.name} logo={ch.logo} className="max-h-12 w-auto" />
                    </div>

                    {/* Channel Name & Playing Indicator */}
                    <div className="mt-2 text-center">
                      <p
                        className={cn(
                          "line-clamp-1 text-xs font-bold transition-colors",
                          isCur ? "text-primary" : "text-foreground group-hover:text-primary"
                        )}
                      >
                        {ch.name}
                      </p>
                      {isCur ? (
                        <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-primary">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" /> Watching
                        </span>
                      ) : ch.quality ? (
                        <span
                          className={cn(
                            "mt-1 text-[9px] font-bold inline-block px-1.5 py-0.2 rounded border",
                            ch.quality.includes("1080p")
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                              : "text-sky-400 bg-sky-500/10 border-sky-500/30"
                          )}
                        >
                          {ch.quality}
                        </span>
                      ) : (
                        <span className="mt-1 text-[10px] text-muted-foreground/80 block truncate">
                          Live Sports
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {visibleChannels.length < filteredChannels.length && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-full px-6 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
                >
                  Load More Sports Channels ({visibleChannels.length} of {filteredChannels.length})
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ═══ Custom Stream Loader ═══ */}
      <section className="reveal mt-10 rounded-lg border border-dashed border-border bg-card p-4 sm:p-5">
        <button
          onClick={() => setShowCustom((v) => !v)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={showCustom}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Link2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">Play Custom Match Stream (.m3u8)</p>
              <p className="text-xs text-muted-foreground">
                Paste any external live match HLS URL to stream directly.
              </p>
            </div>
          </div>
          <ChevronRight
            className={cn("h-4 w-4 text-muted-foreground transition-transform", showCustom && "rotate-90")}
          />
        </button>

        {showCustom && (
          <div className="mt-4 grid gap-2 border-t border-border pt-4 sm:grid-cols-[1fr_180px_auto]">
            <Input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/live/match.m3u8"
              className="h-10 text-xs bg-background"
            />
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Match name (e.g. El Clasico)"
              className="h-10 text-xs bg-background"
            />
            <Button onClick={playCustom} className="h-10 text-xs font-bold px-5">
              <Play className="h-3.5 w-3.5 mr-1.5 fill-current" /> Play
            </Button>
          </div>
        )}
      </section>

      {/* Footer Note */}
      <p className="reveal mt-6 flex items-start gap-2 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
        FHBD Live Football TV brings live matches, tournaments, and championship events from verified broadcast feeds with custom bandwidth and quality controls.
      </p>
    </PageLayout>
  );
}
