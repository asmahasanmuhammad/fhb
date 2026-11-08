"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Video, SafeUser } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { LikeButton } from "@/components/football/like-button";
import { CommentSection } from "@/components/football/comment-section";
import { bnCompact, timeAgo } from "@/lib/format";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX, MessageCircle, Share2, Music2, Play, Crown, UserPlus, UserCheck, ChevronLeft } from "lucide-react";

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
    <div className="relative mx-auto h-[calc(100dvh-3.5rem)] w-full max-w-md overflow-hidden bg-black sm:h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-4rem)]">
      {/* Header overlay */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4 py-3">
        <button
          onClick={() => navigate({ name: "home" })}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
          aria-label="ফিরে যান"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <p className="font-display text-sm font-bold tracking-widest text-white">FHB শর্টস</p>
        {(user?.role === "CREATOR" || user?.role === "ADMIN") && (
          <button
            onClick={() => navigate({ name: "upload" })}
            className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground"
          >
            + আপলোড
          </button>
        )}
        <span className="w-8" />
      </div>

      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <p className="animate-pulse text-sm text-white/60">শর্টস লোড হচ্ছে...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="text-4xl">🎬</p>
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
      toast({ title: "লিংক কপি হয়েছে!", description: "শর্টসটি শেয়ার করুন 🎉" });
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {/* Pause indicator */}
      {paused && visible && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <Play className="h-16 w-16 fill-white/80 text-white/80 drop-shadow-2xl" />
        </div>
      )}

      {/* Mute toggle */}
      <button
        onClick={() => setMuted((m) => !m)}
        className="absolute right-3 top-16 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur"
        aria-label={muted ? "সাউন্ড চালু করুন" : "সাউন্ড বন্ধ করুন"}
      >
        {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
      </button>

      {/* Right action rail */}
      <div className="absolute bottom-24 right-2.5 z-10 flex flex-col items-center gap-5">
        <LikeButton targetType="VIDEO" targetId={video.id} initialCount={video.likeCount} variant="shorts" />

        <Sheet>
          <SheetTrigger asChild>
            <button className="tap-target flex flex-col items-center gap-1 text-white" aria-label="কমেন্ট দেখুন">
              <MessageCircle className="h-8 w-8 fill-black/30 drop-shadow-lg" aria-hidden />
              <span className="font-display text-xs font-semibold drop-shadow">{bnCompact(video.commentCount)}</span>
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
          <Share2 className="h-8 w-8 fill-black/30 drop-shadow-lg" aria-hidden />
          <span className="font-display text-xs font-semibold drop-shadow">শেয়ার</span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 pr-20">
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate({ name: "profile", username: video.creator.username })} aria-label={`${video.creator.name} এর প্রোফাইল`}>
            <Avatar className="h-10 w-10 border-2 border-white/70">
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
            <p className="text-[10px] text-white/70">{bnCompact(video.creator.followerCount ?? 0)} ফলোয়ার • {timeAgo(video.createdAt)}</p>
          </div>
          {user && user.id !== video.creator.id && (
            <Button
              size="sm"
              variant={following ? "secondary" : "default"}
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className={cn("ml-2 h-8 gap-1 rounded-full px-4 text-[11px] font-bold", !following && "bg-fhb-red hover:bg-fhb-red/90")}
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
              <span key={t} className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
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
      <div className="absolute inset-x-0 bottom-0 z-20 h-0.5 bg-white/15" aria-hidden>
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
      toast({ title: "আপলোড সফল! 🎉", description: "আপনার শর্টস এখন ফিডে লাইভ।" });
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
    <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-6 sm:px-6">
      <h1 className="mb-1 font-display text-2xl font-bold tracking-wide">শর্টস আপলোড করুন</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        ডেমো মোড: স্যাম্পল ভিডিও লিংক বেছে নিন বা নিজের URL দিন। প্রতিটি ভিডিও মনিটাইজড হিসেবে প্রকাশিত হবে।
      </p>

      <div className="space-y-4 rounded-2xl border bg-card p-5">
        <div>
          <label htmlFor="title" className="mb-1.5 block text-xs font-bold">
            টাইটেল *
          </label>
          <input
            id="title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="যেমন: রাকিবের ফ্রি-কিক ম্যাজিক 🔥"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="desc" className="mb-1.5 block text-xs font-bold">
            বর্ণনা
          </label>
          <textarea
            id="desc"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="ভিডিওর বর্ণনা লিখুন..."
            rows={3}
            className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold">ভিডিও নির্বাচন *</label>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {SAMPLE_VIDEOS.map((url) => (
              <button
                key={url}
                onClick={() => setForm((f) => ({ ...f, videoUrl: url, thumbnailUrl: SAMPLE_THUMBS[SAMPLE_VIDEOS.indexOf(url) % SAMPLE_THUMBS.length] }))}
                className={cn(
                  "shrink-0 rounded-lg border-2 px-3 py-2 text-[11px] font-semibold transition-colors",
                  form.videoUrl === url ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                🎬 স্যাম্পল {SAMPLE_VIDEOS.indexOf(url) + 1}
              </button>
            ))}
          </div>
          <input
            value={form.videoUrl}
            onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
            placeholder="অথবা ভিডিও URL পেস্ট করুন (.mp4)"
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2.5 text-xs outline-none focus:border-primary"
            aria-label="ভিডিও URL"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tags" className="mb-1.5 block text-xs font-bold">
              ট্যাগ (কমা দিয়ে আলাদা)
            </label>
            <input
              id="tags"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="বিপিএল,গোল,হাইলাইটস"
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="thumb" className="mb-1.5 block text-xs font-bold">
              থাম্বনেইল URL
            </label>
            <input
              id="thumb"
              value={form.thumbnailUrl}
              onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
              placeholder="https://..."
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <Button onClick={() => submit.mutate()} disabled={!form.title.trim() || !form.videoUrl.trim() || submit.isPending} className="w-full font-bold">
          {submit.isPending ? "আপলোড হচ্ছে..." : "🚀 প্রকাশ করুন"}
        </Button>
      </div>

      <div className="mt-6 rounded-2xl border border-fhb-gold/30 bg-fhb-gold/5 p-5">
        <p className="text-sm font-bold text-fhb-gold">💡 মনিটাইজেশন টিপস</p>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li>• প্রতি ১০০০ ভিউতে গড় ৳১০-৩০ অ্যাড রেভিনিউ (RPM অনুযায়ী)</li>
          <li>• এক্সক্লুসিভ ম্যাচ হাইলাইটস দিয়ে ফলোয়ার বাড়ান</li>
          <li>• আয়ের ড্যাশবোর্ড থেকে উত্তোলন করুন (bKash/Nagad)</li>
        </ul>
      </div>
    </div>
  );
}
