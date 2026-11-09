"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Video } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { LikeButton } from "@/components/football/like-button";
import { CommentSection } from "@/components/football/comment-section";
import { bnCompact, timeAgo } from "@/lib/format";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Volume2, VolumeX, MessageCircle, Share2, Music2, Play, Crown, UserPlus, UserCheck,
  ChevronLeft, Upload, Video as VideoIcon, Lightbulb, Check, Flame,
} from "lucide-react";

export function ShortsView() {
  const navigate = useAppStore((s) => s.navigate);
  const user = useAppStore((s) => s.user);
  const { data, isLoading } = useQuery<{ videos: Video[] }>({
    queryKey: ["videos", "feed"],
    queryFn: async () => {
      const res = await fetch("/api/videos");
      return res.json().then((j) => j.data);
    },
  });

  const videos = data?.videos ?? [];

  return (
    <div className="relative flex h-[calc(100dvh-3.5rem)] w-full items-start justify-center overflow-hidden bg-[oklch(0.085 0.01 168)] sm:h-[calc(100dvh-4.25rem)] lg:h-[calc(100dvh-4.25rem)]">
      {/* Ambient glow backdrop (desktop) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 30%, oklch(0.84 0.185 148 / 6%), transparent 70%), radial-gradient(40% 50% at 20% 90%, oklch(0.65 0.24 25 / 5%), transparent 70%)",
        }}
      />

      {/* Phone-frame feed (desktop) / full-bleed (mobile) */}
      <div className="relative mx-auto h-full w-full max-w-md overflow-hidden bg-black lg:my-5 lg:h-[calc(100%-2.5rem)] lg:rounded-[2rem] lg:border lg:border-white/10 lg:shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)]">
        {/* Top overlay bar */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent px-4 pb-6 pt-3.5">
          <button
            onClick={() => navigate({ name: "home" })}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-transform active:scale-90"
            aria-label="ফিরে যান"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <p className="flex items-center gap-2 font-display text-sm font-bold tracking-[0.18em] text-white">
            <Flame className="h-4 w-4 text-fhb-gold" aria-hidden />
            FHB শর্টস
          </p>
          {user?.role === "CREATOR" || user?.role === "ADMIN" ? (
            <button
              onClick={() => navigate({ name: "upload" })}
              className="sheen flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[11px] font-bold text-primary-foreground shadow-[0_8px_20px_-8px_var(--primary)] transition-transform active:scale-95"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden /> আপলোড
            </button>
          ) : (
            <span className="w-9" />
          )}
        </div>

        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <VideoIcon className="h-10 w-10 animate-pulse text-white/40" aria-hidden />
          </div>
        ) : videos.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <VideoIcon className="h-7 w-7 text-white/70" aria-hidden />
            </span>
            <p className="text-sm text-white/70">এখনো কোনো শর্টস নেই। প্রথম ভিডিওটি আপনিই আপলোড করুন!</p>
          </div>
        ) : (
          <div className="shorts-feed no-scrollbar h-full overflow-y-scroll" data-testid="shorts-feed">
            {videos.map((v) => (
              <ShortsItem key={v.id} video={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShortsItem({ video }: { video: Video }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const viewCounted = useRef(false);
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Intersection observer for autoplay
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting && entry.intersectionRatio > 0.6);
      },
      { threshold: [0, 0.6, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
      toast({ title: "লিংক কপি হয়েছে", description: "শর্টসটি শেয়ার করুন।" });
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
    onError: (e: Error) => toast({ title: "ফলো ব্যর্থ", description: e.message, variant: "destructive" }),
  });

  const following = followData?.following ?? false;

  return (
    <div ref={containerRef} className="shorts-item relative flex h-full w-full items-center justify-center" data-video-id={video.id}>
      {/* Video */}
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

      {/* Gradient overlays */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black/92 via-black/45 to-transparent" />

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
        className="absolute right-3 top-20 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-transform active:scale-90"
        aria-label={muted ? "সাউন্ড চালু করুন" : "সাউন্ড বন্ধ করুন"}
      >
        {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
      </button>

      {/* Right action rail */}
      <div className="absolute bottom-28 right-2.5 z-10 flex flex-col items-center gap-4.5 gap-4">
        <LikeButton targetType="VIDEO" targetId={video.id} initialCount={video.likeCount} variant="shorts" />

        <Sheet>
          <SheetTrigger asChild>
            <button className="tap-target flex flex-col items-center gap-1 text-white" aria-label="কমেন্ট দেখুন">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur transition-transform active:scale-90">
                <MessageCircle className="h-5 w-5" aria-hidden />
              </span>
              <span className="tabular font-display text-xs font-semibold drop-shadow">{bnCompact(video.commentCount)}</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[75vh] overflow-y-auto rounded-t-2xl">
            <SheetHeader className="pb-0">
              <SheetTitle className="text-sm">{bnCompact(video.commentCount)} কমেন্ট</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6 pt-2">
              <CommentSection targetType="VIDEO" targetId={video.id} />
            </div>
          </SheetContent>
        </Sheet>

        <button onClick={share} className="tap-target flex flex-col items-center gap-1 text-white" aria-label="শেয়ার করুন">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur transition-transform active:scale-90">
            <Share2 className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-xs font-semibold drop-shadow">শেয়ার</span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 pr-20">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate({ name: "profile", username: video.creator.username })}
            aria-label={`${video.creator.name} এর প্রোফাইল`}
          >
            <Avatar className="h-10 w-10 border-2 border-white/80">
              <AvatarImage src={video.creator.avatarUrl ?? undefined} alt={video.creator.name} />
              <AvatarFallback className="bg-primary text-sm font-bold">{video.creator.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </button>
          <div className="min-w-0">
            <button
              onClick={() => navigate({ name: "profile", username: video.creator.username })}
              className="flex items-center gap-1.5 text-sm font-bold text-white drop-shadow"
            >
              @{video.creator.username}
              {video.creator.isPremium && <Crown className="h-3 w-3 text-fhb-gold" aria-label="প্রিমিয়াম" />}
            </button>
            <p className="text-[10px] text-white/70">
              {bnCompact(video.creator.followerCount ?? 0)} ফলোয়ার · {timeAgo(video.createdAt)}
            </p>
          </div>
          {user && user.id !== video.creator.id && (
            <Button
              size="sm"
              variant={following ? "secondary" : "default"}
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className={cn("ml-2 h-8 gap-1 rounded-full px-4 text-[11px] font-bold", !following && "bg-fhb-red shadow-[0_8px_20px_-8px_var(--fhb-red)] hover:bg-fhb-red/90")}
            >
              {following ? (
                <>
                  <UserCheck className="h-3.5 w-3.5" aria-hidden /> ফলোয়িং
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" aria-hidden /> ফলো
                </>
              )}
            </Button>
          )}
        </div>

        <p className="mt-2.5 line-clamp-2 text-[13px] leading-snug text-white drop-shadow">{video.title}</p>
        {video.tags && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {video.tags.split(",").map((t) => (
              <span key={t} className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                #{t.trim()}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/60">
          <Music2 className="h-3 w-3" aria-hidden />
          <span>মূল সাউন্ড — {video.creator.name}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute inset-x-0 bottom-0 z-20 h-[3px] bg-white/15" aria-hidden>
        <div className="video-progress h-full transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function UploadView() {
  const navigate = useAppStore((s) => s.navigate);
  const user = useAppStore((s) => s.user);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", description: "", videoUrl: "", thumbnailUrl: "", tags: "" });

  useEffect(() => {
    if (user && user.role !== "CREATOR" && user.role !== "ADMIN") {
      toast({
        title: "ক্রিয়েটর অ্যাকাউন্ট প্রয়োজন",
        description: "শর্টস আপলোড করতে ক্রিয়েটর হিসেবে অনুমোদন নিন (ডেমোতে creator@fhb.com.bd ব্যবহার করুন)।",
      });
      navigate({ name: "shorts" });
    }
  }, [user, navigate, toast]);

  const submit = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, monetized: true }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "আপলোড সফল", description: "আপনার শর্টস এখন ফিডে লাইভ।" });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      navigate({ name: "shorts" });
    },
    onError: (e: Error) => toast({ title: "আপলোড ব্যর্থ", description: e.message, variant: "destructive" }),
  });

  const SAMPLE_VIDEOS = ["/videos/bkb1.mp4", "/videos/sintel1.mp4", "/videos/jelly1.mp4", "/videos/flower.mp4", "/videos/friday.mp4", "/videos/bkb2.mp4"];
  const SAMPLE_THUMBS = [
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ce3c35abf03c.jpeg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2c2982ffcc12.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/dd7609d0ae27.jpg",
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/bf8288a20516.jpg",
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-14 pt-6 sm:px-6">
      {/* Studio header */}
      <div className="stadium-panel relative overflow-hidden rounded-3xl border border-border/70 p-6 sm:p-7">
        <span className="floodlight pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Upload className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="eyebrow text-[10px] text-primary">creator studio</p>
            <h1 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">শর্টস আপলোড করুন</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              ডেমো মোড: স্যাম্পল ভিডিও বেছে নিন বা নিজের URL দিন। প্রতিটি ভিডিও মনিটাইজড।
            </p>
          </div>
        </div>
      </div>

      <div className="edge-lit mt-6 space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div>
          <label htmlFor="title" className="mb-2 block text-xs font-bold text-foreground">
            টাইটেল <span className="text-fhb-red">*</span>
          </label>
          <input
            id="title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="যেমন: রাকিবের ফ্রি-কিক ম্যাজিক"
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="desc" className="mb-2 block text-xs font-bold text-foreground">
            বর্ণনা
          </label>
          <textarea
            id="desc"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="ভিডিওর বর্ণনা লিখুন..."
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold text-foreground">
            ভিডিও নির্বাচন <span className="text-fhb-red">*</span>
          </label>
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
            {SAMPLE_VIDEOS.map((url, i) => (
              <button
                key={url}
                onClick={() =>
                  setForm((f) => ({ ...f, videoUrl: url, thumbnailUrl: SAMPLE_THUMBS[i % SAMPLE_THUMBS.length] }))
                }
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-[11px] font-bold transition-all active:scale-95",
                  form.videoUrl === url
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                <VideoIcon className="h-3.5 w-3.5" aria-hidden />
                নমুনা {String(i + 1).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d])}
              </button>
            ))}
          </div>
          <input
            value={form.videoUrl}
            onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
            placeholder="অথবা ভিডিও URL পেস্ট করুন (.mp4)"
            className="mt-2.5 h-10 w-full rounded-xl border border-border bg-background px-4 text-xs outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            aria-label="ভিডিও URL"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tags" className="mb-2 block text-xs font-bold text-foreground">
              ট্যাগ (কমা দিয়ে আলাদা)
            </label>
            <input
              id="tags"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="বিপিএল,গোল,হাইলাইটস"
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="thumb" className="mb-2 block text-xs font-bold text-foreground">
              থাম্বনেইল URL
            </label>
            <input
              id="thumb"
              value={form.thumbnailUrl}
              onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
              placeholder="https://..."
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Live preview */}
        {form.videoUrl && form.title && (
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
            <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
              <Play className="h-3 w-3" aria-hidden /> প্রিভিউ
            </p>
            <div className="flex items-center gap-3.5">
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-black">
                {form.thumbnailUrl && (
                  <img src={form.thumbnailUrl} alt="থাম্বনেইল প্রিভিউ" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{form.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">{form.description || "বর্ণনা নেই"}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => submit.mutate()}
          disabled={!form.title.trim() || !form.videoUrl.trim() || submit.isPending}
          className="sheen flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_14px_34px_-12px_var(--primary)] transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
        >
          <Upload className="h-4 w-4" aria-hidden />
          {submit.isPending ? "আপলোড হচ্ছে..." : "প্রকাশ করুন"}
        </button>
      </div>

      {/* Monetization tips */}
      <div className="gold-panel relative mt-6 overflow-hidden rounded-2xl border border-fhb-gold/25 p-5 sm:p-6">
        <p className="flex items-center gap-2 text-sm font-bold text-fhb-gold">
          <Lightbulb className="h-4 w-4" aria-hidden /> মনিটাইজেশন টিপস
        </p>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
          {[
            "প্রতি ১০০০ ভিউতে গড় ৳১০-৩০ অ্যাড রেভিনিউ (RPM অনুযায়ী)",
            "এক্সক্লুসিভ ম্যাচ হাইলাইটস দিয়ে ফলোয়ার বাড়ান",
            "আয়ের ড্যাশবোর্ড থেকে উত্তোলন করুন (bKash/Nagad)",
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fhb-gold" aria-hidden />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
