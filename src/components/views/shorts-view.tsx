"use client";

/**
 * FHB v5 — Shorts: immersive TikTok/Instagram-Reels-style vertical feed + creator upload studio.
 *
 * Feed: full-viewport scroll-snap 9:16 stage ("desktop theater" — a centered 420px column
 * with side chevrons on large screens). IntersectionObserver drives autoplay / view-counting.
 * Right action rail: Framer Motion heart bounce on like, comment sheet, share.
 * Top progress bar: thin red line. Volume toggle top-right. Keyboard ArrowUp/Down navigation.
 * Beautiful skeleton loading state. Illustrated empty state.
 * Upload: creator-studio form (drop-zone, sample library, hosted-URL contract) with review
 * card, monetization toggle and POST /api/videos JSON contract.
 */

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Video } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdSlot } from "@/components/football/ad-slot";
import { LikeButton } from "@/components/football/like-button";
import { CommentSection } from "@/components/football/comment-section";
import { VideoPreroll } from "@/components/football/video-preroll";
import { PageHeader } from "@/components/football/section-header";
import { RailCard } from "@/components/layout/page-layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { fmtCompact, timeAgo } from "@/lib/format";
import {
  Check, ChevronDown, ChevronRight, ChevronUp, Clapperboard, Crown, Eye, FileVideo,
  Heart, Info, Lightbulb, MessageCircle, Pause, Play, Share2, Upload, UserCheck,
  UserPlus, Video as VideoIcon, Volume2, VolumeX, X, Trash2,
} from "lucide-react";

/* ── Demo sample library — bundled vertical clips for the creator studio ── */
const SAMPLE_VIDEOS = [
  "/videos/bkb1.mp4",
  "/videos/sintel1.mp4",
  "/videos/jelly1.mp4",
  "/videos/flower.mp4",
  "/videos/friday.mp4",
  "/videos/bkb2.mp4",
];
const SAMPLE_THUMBS = [
  "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ce3c35abf03c.jpeg",
  "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2c2982ffcc12.jpg",
  "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/dd7609d0ae27.jpg",
  "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/bf8288a20516.jpg",
];

/* ══════════════════════════════════════════════════════════════════════════
   ShortsView — immersive feed
══════════════════════════════════════════════════════════════════════════ */

export function ShortsView() {
  useReveal();
  const back = useAppStore((s) => s.back);
  const navigate = useAppStore((s) => s.navigate);
  const user = useAppStore((s) => s.user);
  const feedRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ videos: Video[] }>({
    queryKey: ["videos", "feed"],
    queryFn: async () => {
      const res = await fetch("/api/videos");
      return res.json().then((j) => j.data);
    },
  });

  const videos = data?.videos ?? [];
  const canUpload = user?.role === "CREATOR" || user?.role === "ADMIN";
  const showInFeedAds = !user?.isPremium;
  const activeIndex = Math.max(0, videos.findIndex((v) => v.id === activeId));

  /* Smooth-scroll feed to a video by id — robust with interleaved ad items */
  const scrollToVideo = useCallback((id: string) => {
    feedRef.current
      ?.querySelector(`[data-video-id="${id}"]`)
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const goIndex = useCallback(
    (index: number) => {
      const clamped = Math.min(Math.max(index, 0), videos.length - 1);
      const target = videos[clamped];
      if (target) scrollToVideo(target.id);
    },
    [videos, scrollToVideo]
  );

  /* Keyboard navigation — ArrowUp / ArrowDown between shorts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      goIndex(activeIndex + (e.key === "ArrowDown" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, goIndex]);

  return (
    <div className="relative flex h-[calc(100dvh-56px)] w-full items-stretch justify-center gap-4 overflow-hidden bg-[oklch(0.105_0.004_264)] lg:py-5 lg:gap-4">
      {/* ── Feed stage ── */}
      <div
        className="relative h-full w-full max-w-[420px] shrink-0 overflow-hidden bg-black lg:rounded-xl lg:border lg:border-border"
        role="region"
        aria-label="Shorts feed"
      >
        {/* Top chrome — close, brand, counter, upload */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent px-3 pb-10 pt-3 sm:px-4">
          <button
            onClick={back}
            className="tap-target pointer-events-auto flex h-9 w-9 items-center justify-center rounded-[7px] border border-white/15 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/75 active:scale-95"
            aria-label="Close shorts and go back"
          >
            <X className="h-[18px] w-[18px]" aria-hidden />
          </button>

          <p className="label-cond flex items-center gap-2 text-[13px] font-bold tracking-[0.14em] text-white drop-shadow-md">
            <Clapperboard className="h-4 w-4 text-primary" aria-hidden />
            Shorts
            <span className="tabular rounded-[4px] bg-white/12 px-1.5 py-0.5 text-[10px] font-bold tracking-normal text-white/85">
              {Math.min(activeIndex + 1, Math.max(videos.length, 1))}/{Math.max(videos.length, 1)}
            </span>
          </p>

          {canUpload ? (
            <button
              onClick={() => navigate({ name: "upload" })}
              className="pointer-events-auto flex h-9 items-center gap-1.5 rounded-[6px] bg-primary px-3 text-[10.5px] font-bold uppercase tracking-wider text-primary-foreground transition-transform hover:brightness-110 active:scale-95"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden /> Upload
            </button>
          ) : (
            <span className="h-9 w-9" aria-hidden />
          )}
        </div>

        {/* ── States: loading / empty / feed ── */}
        {isLoading ? (
          <ShortsSkeleton />
        ) : videos.length === 0 ? (
          <ShortsEmptyState canUpload={canUpload} onUpload={() => navigate({ name: "upload" })} />
        ) : (
          <div
            ref={feedRef}
            className="shorts-feed no-scrollbar h-full overflow-y-scroll"
            data-testid="shorts-feed"
          >
            {videos.map((v, i) => (
              <Fragment key={v.id}>
                <ShortsItem video={v} onActive={setActiveId} />
                {showInFeedAds && (i + 1) % 4 === 0 && i < videos.length - 1 && (
                  <div
                    className="shorts-item flex h-full w-full items-center justify-center lg:hidden"
                    aria-label="Advertisement"
                  >
                    <div className="w-full max-w-sm px-4">
                      <AdSlot placement="MOBILE_BANNER" />
                    </div>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}

        {/* Video pre-roll ad — once per session, skippable */}
        {videos.length > 0 && <VideoPreroll />}
      </div>

      {/* ── Desktop theater: side navigation rail ── */}
      <div className="hidden shrink-0 flex-col items-center justify-center gap-2.5 lg:flex">
        <button
          onClick={() => goIndex(activeIndex - 1)}
          disabled={activeIndex <= 0}
          className="tap-target flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-white/25 hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          aria-label="Previous short"
        >
          <ChevronUp className="h-5 w-5" aria-hidden />
        </button>
        <button
          onClick={() => goIndex(activeIndex + 1)}
          disabled={activeIndex >= videos.length - 1}
          className="tap-target flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-white/25 hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          aria-label="Next short"
        >
          <ChevronDown className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ShortsSkeleton — full-bleed skeleton that mirrors the video layout
══════════════════════════════════════════════════════════════════════════ */

function ShortsSkeleton() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background" aria-busy aria-label="Loading shorts">
      {/* Fake video area */}
      <Skeleton className="flex-1 rounded-none" />

      {/* Right action rail skeleton */}
      <div className="absolute bottom-24 right-3.5 flex flex-col items-center gap-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <Skeleton className="h-11 w-11 rounded-full" />
            <Skeleton className="h-3 w-7 rounded" />
          </div>
        ))}
      </div>

      {/* Bottom creator overlay skeleton */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 pb-6 pr-[76px]">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-2.5 w-20 rounded" />
          </div>
          <Skeleton className="ml-auto h-7 w-20 rounded-[6px]" />
        </div>
        <div className="mt-3 space-y-2">
          <Skeleton className="h-3 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
        <div className="mt-2.5 flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-[4px]" />
          <Skeleton className="h-5 w-10 rounded-[4px]" />
        </div>
      </div>

      {/* Progress bar skeleton */}
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10" aria-hidden>
        <div className="h-full w-1/3 animate-pulse rounded-r-full bg-primary/60" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ShortsEmptyState — illustrated empty state
══════════════════════════════════════════════════════════════════════════ */

function ShortsEmptyState({
  canUpload,
  onUpload,
}: {
  canUpload: boolean;
  onUpload: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-10 text-center">
      {/* Illustrated icon */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative flex h-20 w-20 items-center justify-center"
      >
        <span className="absolute inset-0 rounded-2xl border border-white/10 bg-white/[0.04]" aria-hidden />
        <span className="absolute inset-2 rounded-xl border border-primary/20 bg-primary/[0.08]" aria-hidden />
        <VideoIcon className="relative h-8 w-8 text-primary/80" aria-hidden />
      </motion.div>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="space-y-2"
      >
        <p className="label-cond text-[16px] font-bold text-white">No shorts yet</p>
        <p className="max-w-[260px] text-[12.5px] leading-relaxed text-white/55">
          The feed is warming up. Creator uploads appear here the moment they publish.
        </p>
      </motion.div>

      {canUpload && (
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.22 }}
          onClick={onUpload}
          className="label-cond mt-1 flex h-10 items-center gap-2 rounded-[8px] bg-primary px-5 text-[11.5px] font-bold text-primary-foreground transition-transform hover:brightness-110 active:scale-95"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden /> Upload the first short
        </motion.button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ShortsItem — single full-screen feed item
══════════════════════════════════════════════════════════════════════════ */

function ShortsItem({ video, onActive }: { video: Video; onActive?: (id: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showPauseIndicator, setShowPauseIndicator] = useState(false);
  const viewCounted = useRef(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /* ── Intersection observer: autoplay + active tracking ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVis = entry.isIntersecting && entry.intersectionRatio > 0.6;
        setVisible(isVis);
        if (isVis) onActive?.(video.id);
      },
      { threshold: [0, 0.6, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [video.id, onActive]);

  /* ── Autoplay / pause based on visibility + user toggle ── */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (visible && !paused) {
      v.play().catch(() => {});
      if (!viewCounted.current) {
        viewCounted.current = true;
        fetch(`/api/videos/${video.id}/view`, { method: "POST" }).catch(() => {});
      }
    } else {
      v.pause();
    }
  }, [visible, paused, video.id]);

  /* ── Progress bar ── */
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.duration) setProgress((v.currentTime / v.duration) * 100);
  };

  /* ── Stage tap: unmute first, then toggle play/pause ── */
  const onStageTap = () => {
    if (muted) {
      setMuted(false);
      return;
    }
    const next = !paused;
    setPaused(next);
    if (next) {
      // Show pause overlay briefly then fade
      setShowPauseIndicator(true);
    } else {
      setShowPauseIndicator(false);
    }
  };

  // Auto-hide pause indicator after 1.2s when paused
  useEffect(() => {
    if (paused && visible) {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      setShowPauseIndicator(true);
    } else {
      setShowPauseIndicator(false);
    }
    return () => { if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current); };
  }, [paused, visible]);

  /* ── Share ── */
  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/?shorts=1&v=${video.id}`);
      toast({ title: "Link copied", description: "Share this short with your crew." });
    } catch {
      /* clipboard unavailable */
    }
  };

  /* ── Follow query + mutation ── */
  const creatorId = video.creator?.id;
  const { data: followData } = useQuery<{ following: boolean }>({
    queryKey: ["follow", creatorId, user?.id],
    queryFn: async () => {
      if (!creatorId) return { following: false };
      const res = await fetch(`/api/follow?followingId=${creatorId}`);
      return res.json().then((j) => j.data);
    },
    enabled: !!user && !!creatorId && user.id !== creatorId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!creatorId) return;
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: creatorId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      if (creatorId) {
        queryClient.invalidateQueries({ queryKey: ["follow", creatorId] });
      }
    },
    onError: (e: Error) =>
      toast({ title: "Follow failed", description: e.message, variant: "destructive" }),
  });

  const isAdmin = user?.role === "ADMIN";
  const isCreator = user?.id === creatorId;
  const canDeleteVideo = isAdmin || isCreator;

  const deleteVideo = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/videos?id=${video.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast({
        title: "Short deleted",
        description: res?.data?.message ?? "The video short has been removed.",
      });
    },
    onError: (e: Error) =>
      toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  const following = followData?.following ?? false;

  return (
    <div ref={containerRef} data-video-id={video.id} className="shorts-item relative h-full w-full">
      {/* ── Full-bleed video ── */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="absolute inset-0 h-full w-full object-cover"
        loop
        muted={muted}
        playsInline
        preload="metadata"
        poster={video.thumbnailUrl ?? undefined}
        onTimeUpdate={onTimeUpdate}
        onClick={onStageTap}
        aria-label={video.title}
      />

      {/* ── Gradient scrims for text legibility ── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 via-black/20 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
        aria-hidden
      />

      {/* ── Pause / Play indicator (animated) ── */}
      <AnimatePresence>
        {showPauseIndicator && visible && (
          <motion.div
            key="pause-indicator"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            aria-hidden
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-black/55 backdrop-blur-sm">
              {paused ? (
                <Play className="ml-1 h-9 w-9 fill-white/90 text-white/90" />
              ) : (
                <Pause className="h-9 w-9 fill-white/90 text-white/90" />
              )}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mute indicator overlay (shown when muted) ── */}
      <AnimatePresence>
        {muted && visible && (
          <motion.div
            key="mute-hint"
            className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            aria-hidden
          >
            <span className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-[12px] font-semibold text-white/90 backdrop-blur-sm">
              <VolumeX className="h-4 w-4 text-primary" />
              Tap to unmute
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Progress bar — top of video ── */}
      <div className="absolute inset-x-0 top-0 z-30 h-[3px] bg-white/10" aria-hidden>
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Volume toggle — top-right (below the top chrome bar) ── */}
      <button
        onClick={() => setMuted((m) => !m)}
        className="absolute right-3 top-[58px] z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/75 active:scale-95"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? (
          <VolumeX className="h-4 w-4" aria-hidden />
        ) : (
          <Volume2 className="h-4 w-4" aria-hidden />
        )}
      </button>

      {/* ── Right action panel ── */}
      <div className="absolute bottom-6 right-3.5 z-10 flex flex-col items-center gap-4">
        {/* Like button */}
        <LikeButton
          targetType="VIDEO"
          targetId={video.id}
          initialCount={video.likeCount ?? 0}
          variant="shorts"
        />

        {/* Comments */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="tap-target flex flex-col items-center gap-1 text-white"
              aria-label={`View ${fmtCompact(video.commentCount ?? 0)} comments`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-colors hover:bg-black/70 active:scale-90">
                <MessageCircle className="h-5 w-5" aria-hidden />
              </span>
              <span className="tabular font-display text-xs font-semibold drop-shadow">
                {fmtCompact(video.commentCount ?? 0)}
              </span>
            </button>
          </SheetTrigger>
          <SheetContent
            side={isMobile ? "bottom" : "right"}
            className={cn(
              "overflow-y-auto p-0",
              isMobile ? "max-h-[75vh] rounded-t-xl" : "sm:max-w-md"
            )}
          >
            <SheetHeader className="border-b border-border px-4 py-4">
              <SheetTitle className="text-sm">{fmtCompact(video.commentCount ?? 0)} Comments</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6 pt-3">
              <CommentSection targetType="VIDEO" targetId={video.id} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Share */}
        <button
          onClick={share}
          className="tap-target flex flex-col items-center gap-1 text-white"
          aria-label="Share this short"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-colors hover:bg-black/70 active:scale-90">
            <Share2 className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-xs font-semibold drop-shadow">Share</span>
        </button>

        {/* Views */}
        <span
          className="tap-target flex flex-col items-center gap-1 text-white"
          title={`${(video.views ?? 0).toLocaleString("en-US")} views`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
            <Eye className="h-5 w-5" aria-hidden />
          </span>
          <span className="tabular font-display text-xs font-semibold drop-shadow">
            {fmtCompact(video.views ?? 0)}
          </span>
        </span>

        {/* Delete (Admin or Creator) */}
        {canDeleteVideo && (
          <button
            onClick={() => {
              if (confirm(isAdmin && !isCreator ? "Delete this short video as Admin?" : "Delete your short video?")) {
                deleteVideo.mutate();
              }
            }}
            disabled={deleteVideo.isPending}
            className="tap-target flex flex-col items-center gap-1 text-white hover:text-red-400 transition-colors"
            aria-label="Delete short"
            title={isAdmin && !isCreator ? "Delete short (Admin)" : "Delete short"}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-colors hover:bg-red-500/30 active:scale-90">
              <Trash2 className="h-5 w-5 text-red-400" aria-hidden />
            </span>
            <span className="font-display text-[10px] font-semibold drop-shadow text-red-400">
              {isAdmin && !isCreator ? "Remove" : "Delete"}
            </span>
          </button>
        )}
      </div>

      {/* ── Bottom creator + caption overlay ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 pb-5 pr-[76px]">
        {/* Creator row */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => video.creator?.username && navigate({ name: "profile", username: video.creator.username })}
            className="pointer-events-auto shrink-0"
            aria-label={`${video.creator?.name ?? "Creator"}'s profile`}
          >
            <Avatar className="h-10 w-10 border-2 border-white/80 shadow-lg">
              <AvatarImage src={video.creator?.avatarUrl ?? undefined} alt={video.creator?.name ?? "Creator"} />
              <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                {(video.creator?.name ?? "FB").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </button>

          <div className="min-w-0 flex-1">
            <button
              onClick={() => video.creator?.username && navigate({ name: "profile", username: video.creator.username })}
              className="pointer-events-auto flex items-center gap-1.5 text-sm font-bold text-white drop-shadow"
            >
              @{video.creator?.username ?? "creator"}
              {video.creator?.isPremium && (
                <Crown className="h-3 w-3 text-fhb-gold" aria-label="Premium creator" />
              )}
            </button>
            <p className="tabular text-[10.5px] text-white/65 drop-shadow">
              {fmtCompact(video.creator?.followerCount ?? 0)} followers · {timeAgo(video.createdAt)}
            </p>
          </div>

          {user && creatorId && user.id !== creatorId && (
            <Button
              size="sm"
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className={cn(
                "label-cond pointer-events-auto ml-auto h-8 shrink-0 rounded-[6px] px-4 text-[11px] font-bold shadow-lg",
                following
                  ? "border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                  : "bg-primary text-primary-foreground hover:brightness-110"
              )}
            >
              {following ? (
                <>
                  <UserCheck className="h-3.5 w-3.5" aria-hidden /> Following
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" aria-hidden /> Follow
                </>
              )}
            </Button>
          )}
        </div>

        {/* Title + category chip */}
        <div className="mt-3">
          {/* Category chip */}
          {video.tags && (
            <div className="mb-1.5 flex flex-wrap gap-1">
              {video.tags
                .split(",")
                .filter((t) => t.trim())
                .slice(0, 2)
                .map((t) => (
                  <span
                    key={t}
                    className="rounded-[4px] bg-primary/25 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-primary"
                  >
                    #{t.trim()}
                  </span>
                ))}
            </div>
          )}

          {/* Video title with expand/collapse */}
          {video.title.length > 60 ? (
            <p className="pointer-events-none text-[13px] font-medium leading-snug text-white drop-shadow-md">
              <span className={cn(!expanded && "line-clamp-2")}>{video.title}</span>{" "}
              <button
                onClick={() => setExpanded((e) => !e)}
                className="pointer-events-auto text-[11.5px] font-bold text-white/70 underline-offset-2 hover:text-white hover:underline"
              >
                {expanded ? "less" : "more"}
              </button>
            </p>
          ) : (
            <p className="pointer-events-none line-clamp-2 text-[13px] font-medium leading-snug text-white drop-shadow-md">
              {video.title}
            </p>
          )}

          {/* Remaining tags */}
          {video.tags && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {video.tags
                .split(",")
                .filter((t) => t.trim())
                .slice(2)
                .map((t) => (
                  <span
                    key={t}
                    className="rounded-[4px] bg-white/12 px-1.5 py-0.5 text-[10px] font-semibold text-white/70"
                  >
                    #{t.trim()}
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   UploadView — creator studio form
══════════════════════════════════════════════════════════════════════════ */

export function UploadView() {
  useReveal();
  const navigate = useAppStore((s) => s.navigate);
  const user = useAppStore((s) => s.user);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    tags: "",
  });
  const [monetized, setMonetized] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoUrlRef = useRef<HTMLInputElement>(null);
  const localUrlRef = useRef<string | null>(null);

  const isCreator = user?.role === "CREATOR" || user?.role === "ADMIN";

  /* Revoke the local blob preview when leaving the studio */
  useEffect(
    () => () => {
      if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
    },
    []
  );

  const submit = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, monetized }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "Upload successful", description: "Your short is now live in the feed." });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      navigate({ name: "shorts" });
    },
    onError: (e: Error) =>
      toast({ title: "Upload failed", description: e.message, variant: "destructive" }),
  });

  const isLocalPreview = form.videoUrl.startsWith("blob:");
  const canPublish =
    form.title.trim().length >= 3 &&
    form.videoUrl.trim().length >= 3 &&
    !isLocalPreview;

  /* Attach a dropped/browsed local file as a preview-only blob URL */
  const attachLocalFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast({ title: "Unsupported file", description: "Pick an MP4, WebM or HLS video file." });
      return;
    }
    if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
    const url = URL.createObjectURL(file);
    localUrlRef.current = url;
    setForm((f) => ({ ...f, videoUrl: url }));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    attachLocalFile(e.dataTransfer.files?.[0]);
  };

  /* ── Gate: sign-in required ── */
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[760px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7">
        <PageHeader
          back
          kicker="creator studio"
          title="Upload Content"
          icon={<Upload className="h-3.5 w-3.5" aria-hidden />}
        />
        <div className="reveal rounded-lg border border-border bg-card px-6 py-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-primary/12 text-primary">
            <Upload className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="mt-4 text-[17px] font-bold text-foreground">Sign in to upload</h2>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            Creator accounts publish vertical video to the FHB shorts feed. Sign in to continue
            to the studio.
          </p>
          <button
            onClick={() => navigate({ name: "auth" })}
            className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-[6px] bg-primary px-5 text-[11.5px] font-bold uppercase tracking-wider text-primary-foreground transition-transform hover:brightness-110 active:scale-95"
          >
            Sign in <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  /* ── Gate: creator role required ── */
  if (!isCreator) {
    return (
      <div className="mx-auto w-full max-w-[760px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7">
        <PageHeader
          back
          kicker="creator studio"
          title="Upload Content"
          icon={<Upload className="h-3.5 w-3.5" aria-hidden />}
        />
        <div className="reveal rounded-lg border border-border bg-card px-6 py-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-elevated text-muted-foreground">
            <FileVideo className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="mt-4 text-[17px] font-bold text-foreground">Creator account required</h2>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
            Only approved creators and admins can publish shorts. In the demo, sign in with{" "}
            <span className="font-semibold text-foreground">creator@fhb.com.bd</span> to open
            the studio.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => useAppStore.getState().back()}
              className="inline-flex h-9 items-center rounded-[6px] border border-border bg-card px-5 text-[11.5px] font-bold uppercase tracking-wider text-foreground/80 transition-colors hover:border-white/20"
            >
              Go back
            </button>
            <button
              onClick={() => navigate({ name: "shorts" })}
              className="inline-flex h-9 items-center rounded-[6px] bg-primary px-5 text-[11.5px] font-bold uppercase tracking-wider text-primary-foreground transition-transform hover:brightness-110 active:scale-95"
            >
              Watch shorts
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Studio form ── */
  return (
    <div className="mx-auto w-full max-w-[760px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7">
      <PageHeader
        back
        kicker="creator studio"
        title="Upload Content"
        subtitle="Publish vertical video to the FHB shorts feed — uploads go live instantly."
        icon={<Upload className="h-3.5 w-3.5" aria-hidden />}
      />

      <section className="reveal overflow-hidden rounded-lg border border-border bg-card" aria-label="Upload short">
        {/* ── Step 1: Video source ── */}
        <header className="border-b border-border px-5 py-4">
          <p className="kicker flex items-center gap-1.5 text-primary">
            <FileVideo className="h-3.5 w-3.5" aria-hidden /> Step 1 · Source
          </p>
          <h2 className="label-cond mt-1 text-[15px] font-bold text-foreground">Video source</h2>
        </header>

        <div className="space-y-5 px-5 py-5">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={cn(
              "flex flex-col items-center justify-center gap-3.5 rounded-lg border border-dashed px-6 py-9 text-center transition-colors",
              dragActive
                ? "border-primary/70 bg-primary/[0.06]"
                : "border-border bg-background/50 hover:border-primary/40"
            )}
            role="region"
            aria-label="Video drop zone"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/12 text-primary">
              <FileVideo className="h-6 w-6" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-bold text-foreground">Drag &amp; drop your video</span>
              <span className="mt-1 block max-w-sm text-[11.5px] leading-relaxed text-muted-foreground">
                Local files preview instantly — publishing needs a hosted MP4 or HLS (.m3u8) URL.
              </span>
            </span>
            <span className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="label-cond flex h-9 items-center gap-1.5 rounded-[6px] border border-primary/40 bg-primary/10 px-4 text-[11.5px] font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden /> Browse file
              </button>
              <button
                type="button"
                onClick={() => videoUrlRef.current?.focus()}
                className="label-cond flex h-9 items-center gap-1.5 rounded-[6px] border border-border bg-card px-4 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <VideoIcon className="h-3.5 w-3.5" aria-hidden /> Paste URL
              </button>
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => { attachLocalFile(e.target.files?.[0]); e.target.value = ""; }}
              aria-hidden
              tabIndex={-1}
            />
          </div>

          {isLocalPreview && (
            <p className="flex items-start gap-2 rounded-md border border-fhb-gold/25 bg-fhb-gold/[0.06] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fhb-gold" aria-hidden />
              Local file attached for preview only. To publish, pick a sample below or paste a
              hosted video URL.
            </p>
          )}

          {/* Sample library */}
          <div>
            <p className="mb-2 text-xs font-bold text-foreground">Sample videos</p>
            <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
              {SAMPLE_VIDEOS.map((url, i) => (
                <button
                  key={url}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      videoUrl: url,
                      thumbnailUrl: SAMPLE_THUMBS[i % SAMPLE_THUMBS.length],
                    }))
                  }
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-[6px] border px-3.5 py-2.5 text-[11px] font-bold transition-colors",
                    form.videoUrl === url
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                  aria-pressed={form.videoUrl === url}
                >
                  <VideoIcon className="h-3.5 w-3.5" aria-hidden />
                  Sample {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="videoUrl" className="mb-2 block text-xs font-bold text-foreground">
              Video URL <span className="text-primary">*</span>
            </label>
            <Input
              id="videoUrl"
              ref={videoUrlRef}
              value={form.videoUrl}
              onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
              placeholder="https://cdn.example.com/highlight.mp4"
              className="h-11 rounded-lg bg-background"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Direct .mp4 file or .m3u8 HLS playlist. Vertical 9:16 works best in the feed.
            </p>
          </div>

          <div>
            <label htmlFor="thumb" className="mb-2 block text-xs font-bold text-foreground">
              Thumbnail URL
            </label>
            <Input
              id="thumb"
              value={form.thumbnailUrl}
              onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
              placeholder="https://..."
              className="h-11 rounded-lg bg-background"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Optional — the first frame is used when no thumbnail is set.
            </p>
          </div>
        </div>

        {/* ── Step 2: Details ── */}
        <div className="border-t border-border px-5 py-5">
          <p className="kicker flex items-center gap-1.5 text-primary">
            <Clapperboard className="h-3.5 w-3.5" aria-hidden /> Step 2 · Details
          </p>
          <div className="mt-4 space-y-5">
            <div>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <label htmlFor="title" className="text-xs font-bold text-foreground">
                  Title <span className="text-primary">*</span>
                </label>
                <span className="tabular text-[10px] text-muted-foreground">
                  {form.title.length}/120
                </span>
              </div>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Rakib's free-kick magic"
                maxLength={120}
                className="h-11 rounded-lg bg-background"
              />
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <label htmlFor="desc" className="text-xs font-bold text-foreground">
                  Description
                </label>
                <span className="tabular text-[10px] text-muted-foreground">
                  {form.description.length}/500
                </span>
              </div>
              <Textarea
                id="desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Add context — match, players, competition..."
                rows={3}
                maxLength={500}
                className="min-h-[88px] resize-none rounded-lg bg-background"
              />
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <label htmlFor="tags" className="text-xs font-bold text-foreground">
                  Tags
                </label>
                <span className="tabular text-[10px] text-muted-foreground">
                  {form.tags.length}/120
                </span>
              </div>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="BFL,goals,highlights"
                maxLength={120}
                className="h-11 rounded-lg bg-background"
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Comma separated — tags power search and related shorts.
              </p>
            </div>
          </div>
        </div>

        {/* ── Step 3: Review & publish ── */}
        <div className="border-t border-border px-5 py-5">
          <p className="kicker flex items-center gap-1.5 text-primary">
            <Play className="h-3.5 w-3.5 fill-current" aria-hidden /> Step 3 · Publish
          </p>

          <div className="mt-4 space-y-5">
            {form.videoUrl ? (
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="w-40 shrink-0 self-start overflow-hidden rounded-lg border border-border bg-black sm:w-44">
                  <video
                    src={form.videoUrl}
                    poster={form.thumbnailUrl || undefined}
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    className="aspect-[9/16] w-full object-cover"
                    aria-label="Video preview"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-bold text-foreground">
                    {form.title || "Untitled short"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {form.description || "No description yet."}
                  </p>
                  {form.tags && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {form.tags
                        .split(",")
                        .filter((t) => t.trim())
                        .map((t) => (
                          <span
                            key={t}
                            className="rounded-[4px] border border-border bg-elevated px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                          >
                            #{t.trim()}
                          </span>
                        ))}
                    </div>
                  )}
                  <div className="mt-3.5 flex items-center gap-2.5">
                    <Avatar className="h-7 w-7 border">
                      <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                      <AvatarFallback className="bg-primary/15 text-[10px] font-bold text-primary">
                        {user.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="truncate text-[11px] text-muted-foreground">
                      Publishing as{" "}
                      <span className="font-semibold text-foreground">@{user.username}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-background/50 px-4 py-3.5">
                <Info className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <p className="text-xs text-muted-foreground">
                  Drop a file, pick a sample video or paste a URL above to preview your short.
                </p>
              </div>
            )}

            {/* Monetization toggle */}
            <div className="flex items-center justify-between gap-4 rounded-lg border border-fhb-gold/25 bg-fhb-gold/[0.05] px-4 py-3.5">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-bold text-fhb-gold">
                  <Crown className="h-3.5 w-3.5" aria-hidden /> Monetization
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Serve pre-roll and in-feed ads on this short and earn per 1,000 views.
                </p>
              </div>
              <Switch
                checked={monetized}
                onCheckedChange={setMonetized}
                aria-label="Monetize this short"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-muted-foreground">
                Uploads appear in the shorts feed immediately.
              </p>
              <div className="flex gap-2.5">
                <Button
                  variant="outline"
                  className="h-11 rounded-lg px-5"
                  onClick={() => navigate({ name: "shorts" })}
                >
                  Cancel
                </Button>
                <Button
                  className="h-11 rounded-lg px-7"
                  onClick={() => submit.mutate()}
                  disabled={!canPublish || submit.isPending}
                >
                  <Upload className="h-4 w-4" aria-hidden />
                  {submit.isPending ? "Uploading…" : "Publish short"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tips + earnings rail ── */}
      <div className="reveal mt-6">
        <RailCard title="Upload tips">
          <ul className="divide-y divide-border/40 px-5">
            {[
              "Vertical 9:16 recommended — landscape video is letterboxed in the feed.",
              "Titles between 3 and 120 characters; keep the hook in the first two words.",
              "Tags power search — add the competition, club and player names.",
              "Monetized shorts serve pre-roll ads once per viewer session.",
            ].map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2.5 py-2.5 text-xs leading-relaxed text-muted-foreground"
              >
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                {tip}
              </li>
            ))}
          </ul>
        </RailCard>
      </div>

      <div className="reveal mt-6">
        <RailCard title="Creator earnings">
          <div className="flex items-start gap-3 px-5 py-4">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-fhb-gold" aria-hidden />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Average Tk 10–30 ad revenue per 1,000 views. Withdraw anytime from the{" "}
              <button
                onClick={() => navigate({ name: "earnings" })}
                className="link-sweep font-semibold text-primary"
              >
                earnings dashboard
              </button>{" "}
              via bKash or Nagad.
            </p>
          </div>
        </RailCard>
      </div>

      <div className="reveal mt-6">
        <AdSlot placement="IN_FEED" />
      </div>
    </div>
  );
}
