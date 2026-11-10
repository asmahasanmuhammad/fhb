"use client";

/**
 * FHB 4.0 — Shorts: immersive vertical feed + creator upload studio.
 *
 * Feed: full-viewport scroll-snap 9:16 stage ("desktop theater" — a
 * centered 420px column with side chevrons on large screens).
 * IntersectionObserver drives autoplay/view-counting, the right action
 * rail handles like / comments / share / views, and the session video
 * pre-roll plays once before the first short. Keyboard: ArrowUp /
 * ArrowDown jump between shorts.
 * Upload: creator-studio form (drop-zone preview, sample library,
 * hosted-URL contract) with review card, monetization toggle and the
 * same POST /api/videos JSON contract.
 */

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
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
  Info, Lightbulb, MessageCircle, Play, Share2, Upload, UserCheck, UserPlus,
  Video as VideoIcon, Volume2, VolumeX, X,
} from "lucide-react";

/** Demo sample library — bundled vertical clips for the creator studio. */
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

/* ════════════════════════ Shorts feed ════════════════════════ */

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
  const activeVideo = activeId ? videos.find((v) => v.id === activeId) : undefined;
  const activeIndex = Math.max(0, videos.findIndex((v) => v.id === activeId));

  /** Smooth-scroll the feed to a video by id (robust with interleaved ad items). */
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

  // Keyboard navigation — ArrowUp / ArrowDown between shorts
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
      {/* ── Feed stage: full-bleed mobile, centered rounded card on desktop ── */}
      <div
        className="relative h-full w-full max-w-[420px] shrink-0 overflow-hidden bg-black lg:rounded-xl lg:border lg:border-border"
        role="region"
        aria-label="Shorts feed"
      >
        {/* Top chrome — close, brand, creator upload */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-b from-black/75 via-black/35 to-transparent px-3 pb-9 pt-3 sm:px-4">
          <button
            onClick={back}
            className="tap-target pointer-events-auto flex h-9 w-9 items-center justify-center rounded-[7px] border border-white/15 bg-black/50 text-white transition-colors hover:bg-black/75 active:scale-95"
            aria-label="Close shorts and go back"
          >
            <X className="h-[18px] w-[18px]" aria-hidden />
          </button>
          <p className="label-cond flex items-center gap-2.5 text-[13px] font-bold tracking-[0.14em] text-white">
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

        {isLoading ? (
          <div className="flex h-full flex-col justify-center gap-4 px-6 pt-14">
            <span className="sr-only">Loading shorts</span>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className={cn("h-3 rounded", i === 1 ? "w-1/2" : "w-3/4")} />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-white/15 bg-white/[0.05]">
              <VideoIcon className="h-6 w-6 text-white/60" aria-hidden />
            </span>
            <p className="label-cond text-[15px] font-bold text-white">No shorts yet</p>
            <p className="max-w-[260px] text-[12.5px] leading-relaxed text-white/60">
              The feed is warming up. Creator uploads appear here the moment they publish.
            </p>
            {canUpload && (
              <button
                onClick={() => navigate({ name: "upload" })}
                className="label-cond mt-1.5 flex h-9 items-center gap-1.5 rounded-[6px] bg-primary px-4 text-[11.5px] font-bold text-primary-foreground transition-transform hover:brightness-110 active:scale-95"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden /> Upload the first short
              </button>
            )}
          </div>
        ) : (
          <div ref={feedRef} className="shorts-feed no-scrollbar h-full overflow-y-scroll" data-testid="shorts-feed">
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

      {/* ── Desktop theater: side control rail (TikTok-style, right of stage) ── */}
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

/* ─────────────────── Single feed item ─────────────────── */

function ShortsItem({ video, onActive }: { video: Video; onActive?: (id: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const viewCounted = useRef(false);
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Intersection observer for autoplay + active tracking
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

  // Tap: first tap on a muted short unmutes, further taps toggle playback
  const onStageTap = () => {
    if (muted) {
      setMuted(false);
      return;
    }
    setPaused((p) => !p);
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.duration) setProgress((v.currentTime / v.duration) * 100);
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/?shorts=1&v=${video.id}`);
      toast({ title: "Link copied", description: "Share this short." });
    } catch {
      /* clipboard unavailable */
    }
  };

  // follow state
  const { data: followData } = useQuery<{ following: boolean }>({
    queryKey: ["follow", video.creator.id, user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/follow?followingId=${video.creator.id}`);
      return res.json().then((j) => j.data);
    },
    enabled: !!user && user.id !== video.creator.id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: video.creator.id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow", video.creator.id] });
    },
    onError: (e: Error) => toast({ title: "Follow failed", description: e.message, variant: "destructive" }),
  });

  const following = followData?.following ?? false;

  return (
    <div ref={containerRef} data-video-id={video.id} className="shorts-item relative h-full w-full">
      {/* Video — playback logic preserved */}
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

      {/* Functional media scrims — text legibility only */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/85 via-black/35 to-transparent" aria-hidden />

      {/* Pause indicator */}
      {paused && visible && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-black/55">
            <Play className="ml-1 h-8 w-8 fill-white/90 text-white/90" />
          </span>
        </div>
      )}

      {/* Mute toggle — sits under the top chrome bar */}
      <button
        onClick={() => setMuted((m) => !m)}
        className="absolute right-3 top-[58px] z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/75 active:scale-95"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
      </button>

      {/* Right action rail — like / comments / share / views */}
      <div className="absolute bottom-6 right-3.5 z-10 flex flex-col items-center gap-3.5">
        <LikeButton targetType="VIDEO" targetId={video.id} initialCount={video.likeCount} variant="shorts" />

        <Sheet>
          <SheetTrigger asChild>
            <button className="tap-target flex flex-col items-center gap-1 text-white" aria-label="View comments">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 transition-colors hover:bg-black/75 active:scale-90">
                <MessageCircle className="h-5 w-5" aria-hidden />
              </span>
              <span className="tabular font-display text-xs font-semibold">{fmtCompact(video.commentCount)}</span>
            </button>
          </SheetTrigger>
          <SheetContent
            side={isMobile ? "bottom" : "right"}
            className={cn("overflow-y-auto p-0", isMobile ? "max-h-[75vh] rounded-t-lg" : "sm:max-w-md")}
          >
            <SheetHeader className="border-b border-border px-4 py-4">
              <SheetTitle className="text-sm">{fmtCompact(video.commentCount)} Comments</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6 pt-3">
              <CommentSection targetType="VIDEO" targetId={video.id} />
            </div>
          </SheetContent>
        </Sheet>

        <button onClick={share} className="tap-target flex flex-col items-center gap-1 text-white" aria-label="Share">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 transition-colors hover:bg-black/75 active:scale-90">
            <Share2 className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-xs font-semibold">Share</span>
        </button>

        <span className="tap-target flex flex-col items-center gap-1 text-white" title={`${video.views.toLocaleString("en-US")} views`}>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50">
            <Eye className="h-5 w-5" aria-hidden />
          </span>
          <span className="tabular font-display text-xs font-semibold">{fmtCompact(video.views)}</span>
        </span>
      </div>

      {/* Bottom creator + caption overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 pb-5 pr-[76px]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ name: "profile", username: video.creator.username })}
            className="pointer-events-auto"
            aria-label={`${video.creator.name}'s profile`}
          >
            <Avatar className="h-10 w-10 border-2 border-white/75">
              <AvatarImage src={video.creator.avatarUrl ?? undefined} alt={video.creator.name} />
              <AvatarFallback className="bg-primary text-sm font-bold">{video.creator.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </button>
          <div className="min-w-0">
            <button
              onClick={() => navigate({ name: "profile", username: video.creator.username })}
              className="pointer-events-auto flex items-center gap-1.5 text-sm font-bold text-white"
            >
              @{video.creator.username}
              {video.creator.isPremium && <Crown className="h-3 w-3 text-fhb-gold" aria-label="Premium creator" />}
            </button>
            <p className="tabular text-[10.5px] text-white/70">
              {fmtCompact(video.creator.followerCount ?? 0)} followers · {timeAgo(video.createdAt)}
            </p>
          </div>
          {user && user.id !== video.creator.id && (
            <Button
              size="sm"
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className={cn(
                "label-cond pointer-events-auto ml-auto h-8 shrink-0 rounded-[6px] px-4 text-[11px] font-bold",
                following
                  ? "border border-white/25 bg-white/10 text-white hover:bg-white/20"
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

        {video.title.length > 60 ? (
          <p className="pointer-events-none mt-3 text-[13px] font-medium leading-snug text-white">
            <span className={cn(!expanded && "line-clamp-2")}>{video.title}</span>{" "}
            <button
              onClick={() => setExpanded((e) => !e)}
              className="pointer-events-auto text-[11.5px] font-bold text-white/70 underline-offset-2 hover:text-white hover:underline"
            >
              {expanded ? "less" : "more"}
            </button>
          </p>
        ) : (
          <p className="pointer-events-none mt-3 line-clamp-2 text-[13px] font-medium leading-snug text-white">{video.title}</p>
        )}

        {video.tags && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {video.tags.split(",").filter((t) => t.trim()).map((t) => (
              <span
                key={t}
                className="rounded-[4px] bg-white/12 px-2 py-0.5 text-[10px] font-semibold text-white"
              >
                #{t.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute inset-x-0 bottom-0 z-20 h-[3px] bg-white/15" aria-hidden>
        <div className="video-progress h-full transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

/* ════════════════════════ Creator studio upload ════════════════════════ */

export function UploadView() {
  useReveal();
  const navigate = useAppStore((s) => s.navigate);
  const user = useAppStore((s) => s.user);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", description: "", videoUrl: "", thumbnailUrl: "", tags: "" });
  const [monetized, setMonetized] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoUrlRef = useRef<HTMLInputElement>(null);
  const localUrlRef = useRef<string | null>(null);

  const isCreator = user?.role === "CREATOR" || user?.role === "ADMIN";

  // Revoke the local blob preview when leaving the studio
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
      toast({ title: "Upload successful", description: "Your shorts are now live in the feed." });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      navigate({ name: "shorts" });
    },
    onError: (e: Error) => toast({ title: "Upload failed", description: e.message, variant: "destructive" }),
  });

  const isLocalPreview = form.videoUrl.startsWith("blob:");
  const canPublish = form.title.trim().length >= 3 && form.videoUrl.trim().length >= 3 && !isLocalPreview;

  /** Attach a dropped/browsed local file as a preview-only blob URL. */
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

  /* ── Gate panels — sign-in / creator-role requirements ── */
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
            Creator accounts publish vertical video to the FHB shorts feed. Sign in to continue to the studio.
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
            <span className="font-semibold text-foreground">creator@fhb.com.bd</span> to open the studio.
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
        {/* ── Video source ── */}
        <header className="border-b border-border px-5 py-4">
          <p className="kicker flex items-center gap-1.5 text-primary">
            <FileVideo className="h-3.5 w-3.5" aria-hidden /> Step 1 · Source
          </p>
          <h2 className="label-cond mt-1 text-[15px] font-bold text-foreground">Video source</h2>
        </header>

        <div className="space-y-5 px-5 py-5">
          {/* Drop zone — flat dashed border */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
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
              onChange={(e) => {
                attachLocalFile(e.target.files?.[0]);
                e.target.value = "";
              }}
              aria-hidden
              tabIndex={-1}
            />
          </div>

          {isLocalPreview && (
            <p className="flex items-start gap-2 rounded-md border border-fhb-gold/25 bg-fhb-gold/[0.06] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fhb-gold" aria-hidden />
              Local file attached for preview only. To publish, pick a sample below or paste a hosted video URL.
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
                    setForm((f) => ({ ...f, videoUrl: url, thumbnailUrl: SAMPLE_THUMBS[i % SAMPLE_THUMBS.length] }))
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

        {/* ── Details ── */}
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
                <span className="tabular text-[10px] text-muted-foreground">{form.title.length}/120</span>
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
                <span className="tabular text-[10px] text-muted-foreground">{form.description.length}/500</span>
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
                <span className="tabular text-[10px] text-muted-foreground">{form.tags.length}/120</span>
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

        {/* ── Review & publish ── */}
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
                  <p className="line-clamp-2 text-sm font-bold text-foreground">{form.title || "Untitled short"}</p>
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
                      Publishing as <span className="font-semibold text-foreground">@{user.username}</span>
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
              <Switch checked={monetized} onCheckedChange={setMonetized} aria-label="Monetize this short" />
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-muted-foreground">Uploads appear in the shorts feed immediately.</p>
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
                  {submit.isPending ? "Uploading..." : "Publish short"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tips + ad ── */}
      <div className="reveal mt-6">
        <RailCard title="Upload tips">
          <ul className="divide-y divide-border/40 px-5">
            {[
              "Vertical 9:16 recommended — landscape video is letterboxed in the feed.",
              "Titles between 3 and 120 characters; keep the hook in the first two words.",
              "Tags power search — add the competition, club and player names.",
              "Monetized shorts serve pre-roll ads once per viewer session.",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
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
