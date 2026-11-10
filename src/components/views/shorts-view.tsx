"use client";

/**
 * FHB Shorts — TikTok-class vertical feed + creator studio upload.
 *
 * Feed: full-height scroll-snap 9:16 player, floating action rail,
 * creator overlay, in-feed mobile banner ads (every 4 videos) and the
 * session video pre-roll. Desktop adds an "up next" queue rail.
 * Upload: creator-studio card form (details / source / review & publish)
 * with a live preview and monetization toggle.
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { fmtCompact, timeAgo } from "@/lib/format";
import {
  AudioLines, Check, ChevronLeft, Clapperboard, Crown, Info, Lightbulb,
  MessageCircle, Music2, Play, Share2, Upload, UserCheck, UserPlus,
  Video as VideoIcon, Volume2, VolumeX, Coins, Heart,
} from "lucide-react";

/* ════════════════════════ Shorts feed ════════════════════════ */

export function ShortsView() {
  useReveal();
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

  const scrollToVideo = useCallback((id: string) => {
    feedRef.current
      ?.querySelector(`[data-video-id="${id}"]`)
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="relative flex h-[calc(100dvh-3.5rem)] w-full justify-center overflow-hidden bg-[#0a0a0c] sm:h-[calc(100dvh-60px)]">
      {/* Ambient stage backdrop — desktop only */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            "radial-gradient(46% 54% at 50% 28%, oklch(0.735 0.155 152 / 7%), transparent 70%), radial-gradient(38% 44% at 16% 88%, oklch(0.735 0.155 152 / 4%), transparent 72%)",
        }}
      />

      <div className="relative flex h-full w-full items-stretch justify-center gap-6 lg:py-5 xl:gap-8">
        {/* ── Feed frame: full-bleed mobile, floating 9:16 card on desktop ── */}
        <div
          className="relative h-full w-full overflow-hidden bg-black sm:max-w-[430px] sm:rounded-xl sm:border sm:border-white/10 sm:shadow-[0_36px_90px_-30px_rgba(0,0,0,0.9)] lg:aspect-[9/16] lg:w-auto lg:max-w-none"
          role="region"
          aria-label="Shorts feed"
        >
          {/* Top overlay bar */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/75 via-black/35 to-transparent px-3 pb-9 pt-3.5 sm:px-4">
            <button
              onClick={() => navigate({ name: "home" })}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/70 active:scale-95 sm:hidden"
              aria-label="Back to home"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <p className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 font-display text-[13px] font-bold uppercase tracking-[0.18em] text-white">
              <Clapperboard className="h-4 w-4 text-primary" aria-hidden />
              FHB Shorts
            </p>
            {canUpload ? (
              <button
                onClick={() => navigate({ name: "upload" })}
                className="sheen pointer-events-auto flex h-8 items-center gap-1.5 rounded-full bg-primary px-3.5 text-[11px] font-bold text-primary-foreground transition-transform active:scale-95"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden /> Upload
              </button>
            ) : (
              <span className="h-9 w-9 sm:hidden" aria-hidden />
            )}
          </div>

          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 px-8">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                <VideoIcon className="h-6 w-6 animate-pulse text-white/40" aria-hidden />
              </span>
              <div className="w-full max-w-[240px] space-y-2.5" aria-hidden>
                <div className="h-3 w-3/4 rounded bg-white/[0.08]" />
                <div className="h-3 w-1/2 rounded bg-white/[0.05]" />
              </div>
            </div>
          ) : videos.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                <VideoIcon className="h-6 w-6 text-white/60" aria-hidden />
              </span>
              <p className="font-display text-sm font-bold text-white">No shorts yet</p>
              <p className="text-[13px] leading-relaxed text-white/60">
                Be the first creator to publish a short.
              </p>
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

        {/* ── Desktop queue rail ── */}
        {videos.length > 0 && (
          <aside className="hidden w-[300px] shrink-0 flex-col lg:flex xl:w-[320px]" aria-label="Shorts queue">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/15 bg-[#0b101d] shadow-xl">
              <div className="border-b border-white/15 bg-[#06080f] px-4 py-3.5">
                <p className="eyebrow flex items-center gap-1.5 text-red-400 font-black">
                  <AudioLines className="h-3.5 w-3.5" aria-hidden /> NOW PLAYING
                </p>
                <p className="mt-1.5 line-clamp-1 text-sm font-black text-white">
                  {activeVideo?.title ?? videos[0].title}
                </p>
                <p className="tabular mt-0.5 truncate text-[11px] font-semibold text-slate-300">
                  @{activeVideo?.creator.username ?? videos[0].creator.username} ·{" "}
                  {fmtCompact(activeVideo?.views ?? videos[0].views)} views
                </p>
              </div>
              <p className="border-b border-white/15 bg-white/[0.03] px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-300">
                Up next
              </p>
              <div className="fhb-scroll min-h-0 flex-1 divide-y divide-white/10 overflow-y-auto">
                {videos.map((v) => {
                  const isActive = v.id === activeId;
                  return (
                    <button
                      key={v.id}
                      onClick={() => scrollToVideo(v.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                        isActive ? "bg-red-600/20" : "hover:bg-white/[0.05]"
                      )}
                      aria-current={isActive ? "true" : undefined}
                      aria-label={`Play ${v.title}`}
                    >
                      <span className="relative h-16 w-10 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-[#06080f]">
                        {v.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={v.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center">
                            <VideoIcon className="h-4 w-4 text-slate-400" aria-hidden />
                          </span>
                        )}
                        {isActive && <span className="absolute inset-0 border-2 border-red-500" aria-hidden />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "line-clamp-2 block text-xs font-black leading-snug",
                            isActive ? "text-red-400" : "text-white"
                          )}
                        >
                          {v.title}
                        </span>
                        <span className="tabular mt-1 block truncate text-[10.5px] font-semibold text-slate-300">
                          @{v.creator.username} · {fmtCompact(v.views)} views · {timeAgo(v.createdAt)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}
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

  const togglePlay = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.duration) setProgress((v.currentTime / v.duration) * 100);
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/?shorts=1&v=${video.id}`);
      toast({ title: "Link copied", description: "Share this short." });
    } catch {
      /* noop */
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
      {/* Video — playback logic untouched */}
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
        onClick={togglePlay}
        aria-label={video.title}
      />

      {/* Cinematic scrims */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/55 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/90 via-black/40 to-transparent" aria-hidden />

      {/* Pause indicator */}
      {paused && visible && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="flex h-20 w-20 animate-in zoom-in-95 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur">
            <Play className="h-9 w-9 fill-white/90 text-white/90" />
          </span>
        </div>
      )}

      {/* Mute toggle */}
      <button
        onClick={() => setMuted((m) => !m)}
        className="absolute right-3 top-[76px] z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/70 active:scale-95"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
      </button>

      {/* Right action rail */}
      <div className="absolute bottom-[88px] right-2.5 z-10 flex flex-col items-center gap-4 lg:bottom-6">
        <LikeButton targetType="VIDEO" targetId={video.id} initialCount={video.likeCount} variant="shorts" />

        {/* Fan Tipping Button */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="tap-target flex flex-col items-center gap-1 text-white cursor-pointer" aria-label="Tip creator">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-600/80 hover:bg-rose-600 backdrop-blur transition-all active:scale-90 shadow-lg shadow-rose-950/60">
                <Coins className="h-5 w-5 text-amber-300" aria-hidden />
              </span>
              <span className="font-display text-[10.5px] font-bold text-amber-300 drop-shadow">Tip</span>
            </button>
          </SheetTrigger>
          <SheetContent
            side={isMobile ? "bottom" : "right"}
            className={cn("overflow-y-auto p-0", isMobile ? "max-h-[80vh] rounded-t-2xl" : "sm:max-w-md")}
          >
            <SheetHeader className="border-b border-border px-5 py-4 bg-gradient-to-r from-rose-950/30 to-card">
              <SheetTitle className="text-sm flex items-center gap-2">
                <span className="text-base">🎁</span>
                <span>Send Fan Tip to @{video.creator.username}</span>
              </SheetTitle>
            </SheetHeader>
            <div className="p-5 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Support your favorite football creator or star player directly via instant bKash or Nagad micro-donation.
              </p>
              
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { bdt: 20, label: "৳২০ (Cheers)" },
                  { bdt: 50, label: "৳৫০ (Goal Tip)" },
                  { bdt: 100, label: "৳১০০ (Match MVP)" },
                  { bdt: 500, label: "৳৫০০ (Super Fan)" },
                ].map((tier) => (
                  <button
                    key={tier.bdt}
                    onClick={() => {
                      toast({
                        title: `Tip sent! ${tier.label}`,
                        description: `৳${tier.bdt} successfully tipped to @${video.creator.username} via bKash. Thank you for supporting Bangladeshi football creators!`,
                      });
                    }}
                    className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group cursor-pointer"
                  >
                    <span className="font-mono font-black text-primary text-sm block group-hover:scale-105 transition-transform">
                      {tier.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">Instant bKash / Nagad</span>
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
                <span className="text-sm">🛡️</span>
                <span>Creators receive 90% of tips directly into their FinTech withdrawal balance.</span>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <button className="tap-target flex flex-col items-center gap-1 text-white" aria-label="View comments">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur transition-all hover:bg-black/70 active:scale-90">
                <MessageCircle className="h-5 w-5" aria-hidden />
              </span>
              <span className="tabular font-display text-xs font-semibold drop-shadow">{fmtCompact(video.commentCount)}</span>
            </button>
          </SheetTrigger>
          <SheetContent
            side={isMobile ? "bottom" : "right"}
            className={cn("overflow-y-auto p-0", isMobile ? "max-h-[75vh] rounded-t-xl" : "sm:max-w-md")}
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
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur transition-all hover:bg-black/70 active:scale-90">
            <Share2 className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-xs font-semibold drop-shadow">Share</span>
        </button>
      </div>

      {/* Bottom creator + caption overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 pr-20 pb-[76px] lg:pb-4">
        <div className="flex items-center gap-2.5">
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
              className="pointer-events-auto flex items-center gap-1.5 text-sm font-bold text-white drop-shadow"
            >
              @{video.creator.username}
              {video.creator.isPremium && <Crown className="h-3 w-3 text-fhb-gold" aria-label="Premium creator" />}
            </button>
            <p className="tabular text-[10px] text-white/70">
              {fmtCompact(video.creator.followerCount ?? 0)} followers · {timeAgo(video.createdAt)}
            </p>
          </div>
          {user && user.id !== video.creator.id && (
            <Button
              size="sm"
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className={cn(
                "pointer-events-auto ml-auto h-8 shrink-0 rounded-full px-4 text-[11px] font-bold",
                following
                  ? "border border-white/20 bg-white/10 text-white hover:bg-white/20"
                  : "sheen bg-primary text-primary-foreground hover:bg-primary/90"
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

        <p className="mt-3 line-clamp-2 text-[13px] leading-snug text-white drop-shadow">{video.title}</p>

        {video.tags && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {video.tags.split(",").map((t) => (
              <span
                key={t}
                className="rounded-md bg-white/12 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur"
              >
                #{t.trim()}
              </span>
            ))}
          </div>
        )}

        <p className="mt-2 flex items-center gap-1.5 text-[10px] text-white/60">
          <Music2 className="h-3 w-3" aria-hidden />
          Original sound — {video.creator.name}
        </p>
      </div>

      {/* Progress bar — sits above the mobile tab bar */}
      <div className="absolute inset-x-0 bottom-14 z-20 h-[3px] bg-white/15 lg:bottom-0" aria-hidden>
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

  useEffect(() => {
    if (user && user.role !== "CREATOR" && user.role !== "ADMIN") {
      toast({
        title: "Creator account required",
        description: "Get approved as a creator to upload shorts (use creator@fhb.com.bd in the demo).",
      });
      navigate({ name: "shorts" });
    }
  }, [user, navigate, toast]);

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

  const SAMPLE_VIDEOS = ["/videos/bkb1.mp4", "/videos/sintel1.mp4", "/videos/jelly1.mp4", "/videos/flower.mp4", "/videos/friday.mp4", "/videos/bkb2.mp4"];
  const SAMPLE_THUMBS = [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ce3c35abf03c.jpeg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2c2982ffcc12.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/dd7609d0ae27.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/bf8288a20516.jpg",
  ];

  const canPublish = form.title.trim().length >= 3 && form.videoUrl.trim().length >= 3;

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      <PageHeader
        back
        kicker="creator studio"
        title="Upload a Short"
        subtitle="Publish vertical video to the FHB shorts feed — uploads go live instantly."
        icon={<Upload className="h-3.5 w-3.5" aria-hidden />}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* ── Form column ── */}
        <div className="min-w-0 space-y-6 lg:col-span-8">
          {/* Details */}
          <section className="edge-lit reveal rounded-xl border border-border bg-card" aria-label="Video details">
            <header className="border-b border-border px-5 py-4 sm:px-6">
              <h2 className="font-display text-base font-bold tracking-[-0.01em] text-foreground">Details</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">How your short appears in the feed.</p>
            </header>
            <div className="space-y-5 px-5 py-5 sm:px-6">
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
          </section>

          {/* Video source */}
          <section className="edge-lit reveal rounded-xl border border-border bg-card" aria-label="Video source">
            <header className="border-b border-border px-5 py-4 sm:px-6">
              <h2 className="font-display text-base font-bold tracking-[-0.01em] text-foreground">Video source</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Demo mode: pick a bundled sample or paste any MP4 / HLS URL.
              </p>
            </header>
            <div className="space-y-5 px-5 py-5 sm:px-6">
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
                        "flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2.5 text-[11px] font-bold transition-colors",
                        form.videoUrl === url
                          ? "border-primary/60 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
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
          </section>

          {/* Review & publish */}
          <section className="edge-lit reveal rounded-xl border border-border bg-card" aria-label="Review and publish">
            <header className="border-b border-border px-5 py-4 sm:px-6">
              <h2 className="font-display text-base font-bold tracking-[-0.01em] text-foreground">Review & publish</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Check the preview card before going live.</p>
            </header>
            <div className="space-y-5 px-5 py-5 sm:px-6">
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
                              className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                            >
                              #{t.trim()}
                            </span>
                          ))}
                      </div>
                    )}
                    <div className="mt-3.5 flex items-center gap-2.5">
                      <Avatar className="h-7 w-7 border">
                        <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.name ?? "You"} />
                        <AvatarFallback className="bg-primary/15 text-[10px] font-bold text-primary">
                          {(user?.name ?? "Y").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="truncate text-[11px] text-muted-foreground">
                        Publishing as <span className="font-semibold text-foreground">@{user?.username}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-background/50 px-4 py-3.5">
                  <Info className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <p className="text-xs text-muted-foreground">
                    Pick a sample video or paste a URL above to preview your short.
                  </p>
                </div>
              )}

              {/* Monetization toggle */}
              <div className="flex items-center justify-between gap-4 rounded-lg border border-fhb-gold/25 bg-fhb-gold/[0.06] px-4 py-3.5">
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
                    className="sheen h-11 rounded-lg px-7"
                    onClick={() => submit.mutate()}
                    disabled={!canPublish || submit.isPending}
                  >
                    <Upload className="h-4 w-4" aria-hidden />
                    {submit.isPending ? "Uploading..." : "Publish short"}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── Side rail ── */}
        <aside className="min-w-0 lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-[76px]">
            {/* Requirements checklist */}
            <section className="edge-lit reveal rounded-xl border border-border bg-card" aria-label="Upload requirements">
              <header className="border-b border-border px-5 py-4">
                <p className="eyebrow flex items-center gap-1.5 text-primary">
                  <Info className="h-3.5 w-3.5" aria-hidden /> Requirements
                </p>
                <h2 className="mt-1 font-display text-base font-bold text-foreground">Upload checklist</h2>
              </header>
              <ul className="divide-y divide-border/60 px-5">
                {[
                  "Video URL required — direct MP4 or HLS (.m3u8)",
                  "Title between 3 and 120 characters",
                  "Description up to 500 characters",
                  "Tags: comma separated, up to 120 characters",
                  "Vertical 9:16 recommended — landscape is letterboxed",
                ].map((r) => (
                  <li key={r} className="flex items-start gap-2.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                    {r}
                  </li>
                ))}
              </ul>
            </section>

            {/* Monetization tips */}
            <section className="gold-panel reveal rounded-xl border border-fhb-gold/25 p-5" aria-label="Monetization tips">
              <p className="flex items-center gap-2 text-sm font-bold text-fhb-gold">
                <Lightbulb className="h-4 w-4" aria-hidden /> Monetization tips
              </p>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
                {[
                  "Average Tk 10–30 ad revenue per 1,000 views (depending on RPM)",
                  "Grow your following with exclusive match highlights",
                  "Withdraw from your earnings dashboard (bKash/Nagad)",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fhb-gold" aria-hidden />
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
