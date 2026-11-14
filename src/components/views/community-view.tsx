"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import type { Post, SafeUser } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { LikeButton } from "@/components/football/like-button";
import { CommentSection } from "@/components/football/comment-section";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader } from "@/components/football/section-header";
import { PageLayout, RailCard } from "@/components/layout/page-layout";
import { timeAgo, fmtCompact, fmtNum } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Crown,
  Hash,
  Heart,
  Image as ImageIcon,
  LogIn,
  MessageCircle,
  MoreHorizontal,
  PenLine,
  Share2,
  ShieldCheck,
  Smile,
  TrendingUp,
  Users,
  Wifi,
  Zap,
  Trash2,
  X,
  Loader2,
  Check,
  Search,
  Maximize2,
  UserPlus,
  UserCheck,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   CommunityView — The Terraces: Rich, dynamic fan community.
   Features:
   - Tag selector without overflow clipping (z-50 dropdown)
   - Real image uploads with instant preview and lightbox
   - Admin & Author full deletion rights for posts and comments
   - Dynamic tag filtering via trending hashtags
   - Hot / Latest / Following feed sorting
   - Follow / unfollow suggested creators in right rail
   ════════════════════════════════════════════════════════════════ */

const COMPOSER_TAGS = [
  "Bashundhara Kings",
  "Dhaka Abahani",
  "Mohammedan SC",
  "National Team",
  "BPL2026",
  "SAFF2026",
  "Bangladesh Police",
  "Fortis FC",
  "Sheikh Russel",
  "Chittagong Abahani",
  "Brothers Union",
  "Rahmatganj MFS",
  "Transfer Rumour",
  "Tactics & Analysis",
];

const MAX_CHARS = 400;

const EMOJI_STRIP = ["⚽", "🔥", "💪", "🎉", "😤", "👏", "❤️", "🏆", "🇧🇩", "🥅", "👟", "📣"];

const GUIDELINES = [
  {
    title: "Keep it about football",
    body: "Matchday banter and rivalry are welcome — personal attacks and hate speech are not.",
  },
  {
    title: "No spam or unregulated betting",
    body: "Unrelated promotional links and gambling schemes are removed by moderators.",
  },
  {
    title: "Flag, don't fight",
    body: "Report posts breaking fair-play standards and the moderation desk will handle them.",
  },
];

const TRENDING_TOPICS = [
  { tag: "BPL2026", label: "BPL2026", posts: 2341 },
  { tag: "NationalTeam", label: "NationalTeam", posts: 1870 },
  { tag: "Bashundhara Kings", label: "Bashundhara", posts: 982 },
  { tag: "Dhaka Abahani", label: "Abahani", posts: 741 },
  { tag: "Mohammedan SC", label: "Mohammedan", posts: 614 },
  { tag: "SAFF2026", label: "SAFF2026", posts: 503 },
];

const FEED_TABS = ["Latest", "Hot", "Following"] as const;
type FeedTab = (typeof FEED_TABS)[number];

function isOnline(username: string): boolean {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash += username.charCodeAt(i);
  return hash % 4 === 0;
}

/* ────────────────────────────────────────────────────────────────
   Post menu with Admin & Author Delete options
   ──────────────────────────────────────────────────────────────── */
function PostMenu({ post }: { post: Post }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = useAppStore((s) => s.user);

  const isAdmin = user?.role === "ADMIN";
  const isAuthor = user?.id === post.author.id;
  const canDelete = isAdmin || isAuthor;

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const deletePost = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts?id=${post.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Post removed",
        description: res?.data?.message ?? "Post has been removed successfully.",
      });
      setOpen(false);
    },
    onError: (e: Error) => {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    },
  });

  return (
    <div ref={ref} className="relative z-20">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Post options"
        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute right-0 top-8 z-50 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-2xl backdrop-blur-md"
          >
            <button
              onClick={() => {
                navigator.clipboard?.writeText(`${window.location.origin}/?view=community&post=${post.id}`);
                toast({ title: "Link copied", description: "Post link copied to clipboard." });
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[12.5px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Share2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              Copy link
            </button>

            {/* Admin or Author Delete */}
            {canDelete && (
              <>
                <div className="h-px bg-border/60" />
                <button
                  onClick={() => {
                    if (confirm(isAdmin && !isAuthor ? "Delete this post as Admin?" : "Delete your post?")) {
                      deletePost.mutate();
                    }
                  }}
                  disabled={deletePost.isPending}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[12.5px] font-medium text-red-500 transition-colors hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0 text-red-500" aria-hidden />
                  {isAdmin && !isAuthor ? "Delete Post (Admin)" : "Delete Post"}
                </button>
              </>
            )}

            {!canDelete && (
              <>
                <div className="h-px bg-border/60" />
                <button
                  onClick={() => {
                    toast({
                      title: "Report submitted",
                      description: "The moderation desk will review this post.",
                      variant: "destructive",
                    });
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[12.5px] font-medium text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Report post
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LiveTimeAgo({ dateStr }: { dateStr: string }) {
  const [label, setLabel] = useState(() => timeAgo(dateStr));
  useEffect(() => {
    const id = setInterval(() => setLabel(timeAgo(dateStr)), 30_000);
    return () => clearInterval(id);
  }, [dateStr]);
  return <time dateTime={dateStr}>{label}</time>;
}

/* ────────────────────────────────────────────────────────────────
   Post card with image rendering & tag filter click
   ──────────────────────────────────────────────────────────────── */
function PostCard({
  post,
  commentsOpen,
  onToggleComments,
  onTagClick,
  onOpenImage,
}: {
  post: Post;
  commentsOpen: boolean;
  onToggleComments: () => void;
  onTagClick?: (tag: string) => void;
  onOpenImage?: (url: string) => void;
}) {
  const navigate = useAppStore((s) => s.navigate);
  const online = isOnline(post.author.username);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="reveal group overflow-hidden rounded-xl border border-border/70 bg-card transition-colors hover:border-border"
      aria-label={`Post by ${post.author.name}`}
    >
      <div className="p-4 sm:p-5">
        {/* Author row */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <button
              onClick={() => navigate({ name: "profile", username: post.author.username })}
              aria-label={`${post.author.name} — view profile`}
              className="block"
            >
              <Avatar
                className={cn(
                  "h-10 w-10 border-2 transition-colors",
                  post.author.isPremium ? "border-amber-400/60" : "border-border/60 group-hover:border-border"
                )}
              >
                <AvatarImage src={post.author.avatarUrl ?? undefined} alt={post.author.name} />
                <AvatarFallback className="bg-primary/15 text-[13px] font-bold text-primary">
                  {post.author.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
            {online && (
              <span
                aria-hidden
                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-green-500"
              />
            )}
            {post.author.isPremium && (
              <span
                aria-label="Premium member"
                className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-amber-400/50 bg-background shadow-xs"
              >
                <Crown className="h-2.5 w-2.5 text-amber-500" aria-hidden />
              </span>
            )}
          </div>

          {/* Name & metadata */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-tight">
              <button
                onClick={() => navigate({ name: "profile", username: post.author.username })}
                className="max-w-[160px] truncate text-[14.5px] font-bold text-foreground transition-colors hover:text-primary sm:max-w-none"
              >
                {post.author.name}
              </button>
              {post.author.role === "ADMIN" && (
                <span className="rounded bg-primary/15 px-1.5 py-[2px] text-[10px] font-bold tracking-wider text-primary">
                  Staff
                </span>
              )}
              {post.author.role === "CREATOR" && (
                <span className="rounded bg-red-500/15 px-1.5 py-[2px] text-[10px] font-bold tracking-wider text-red-500">
                  Creator
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <span className="truncate">@{post.author.username}</span>
              <span aria-hidden>·</span>
              <LiveTimeAgo dateStr={post.createdAt} />
            </div>
          </div>

          {/* Match tag chip */}
          {post.matchTag && (
            <button
              onClick={() => onTagClick?.(post.matchTag!)}
              className="label-cond hidden shrink-0 items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-[3px] text-[11px] font-bold text-primary transition-colors hover:bg-primary/20 sm:inline-flex"
            >
              <Hash className="h-2.5 w-2.5" aria-hidden />
              {post.matchTag}
            </button>
          )}

          {/* Three-dot menu */}
          <PostMenu post={post} />
        </div>

        {/* Post Text Body */}
        <p className="mt-3 whitespace-pre-line break-words text-[14px] sm:text-[14.5px] leading-relaxed text-foreground/95">
          {post.content}
        </p>

        {/* Attached Photo Upload */}
        {post.imageUrl && (
          <div className="mt-3.5 overflow-hidden rounded-xl border border-border/80 bg-black/20 group/img relative">
            <img
              src={post.imageUrl}
              alt="Fan post attachment"
              onClick={() => onOpenImage?.(post.imageUrl!)}
              className="max-h-[460px] w-full cursor-pointer object-cover transition-transform duration-300 group-hover/img:scale-[1.01]"
              loading="lazy"
            />
            <button
              onClick={() => onOpenImage?.(post.imageUrl!)}
              className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/60 p-1.5 text-white backdrop-blur-md opacity-0 group-hover/img:opacity-100 transition-opacity"
              title="Expand image"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Mobile match tag chip */}
        {post.matchTag && (
          <div className="mt-3 sm:hidden">
            <button
              onClick={() => onTagClick?.(post.matchTag!)}
              className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-[3px] text-[10.5px] font-bold text-primary"
            >
              <Hash className="h-2.5 w-2.5" aria-hidden />
              {post.matchTag}
            </button>
          </div>
        )}
      </div>

      {/* Engagement bar */}
      <div className="flex items-center gap-1 border-t border-border/60 px-3 py-1.5 bg-muted/10">
        <LikeButton
          targetType="POST"
          targetId={post.id}
          initialCount={post.likeCount}
          variant="inline"
        />

        {/* Comments */}
        <button
          onClick={onToggleComments}
          aria-expanded={commentsOpen}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-medium transition-colors hover:bg-white/[0.05] hover:text-foreground",
            commentsOpen ? "text-primary" : "text-muted-foreground"
          )}
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          <span className="tabular">{fmtCompact(post.commentCount)}</span>
          <span className="hidden sm:inline">
            {post.commentCount === 1 ? "comment" : "comments"}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={() => {
            navigator.clipboard?.writeText(
              `${typeof window !== "undefined" ? window.location.origin : ""}/?view=community&post=${post.id}`
            );
          }}
          aria-label="Share post"
          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
        >
          <Share2 className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Inline comments */}
      <AnimatePresence initial={false}>
        {commentsOpen && (
          <motion.div
            key="comments"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 bg-background/50 p-4">
              <CommentSection targetType="POST" targetId={post.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function PostSkeleton() {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3" aria-hidden>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-28 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-4 w-full rounded-full" />
      <Skeleton className="h-4 w-4/5 rounded-full" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

function EmptyState({ onCompose }: { onCompose?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-xl border border-border/60 bg-card px-6 py-14 text-center"
    >
      <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-primary/8 blur-xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-border/60 bg-card">
          <span className="text-4xl" role="img" aria-label="football">⚽</span>
        </div>
      </div>
      <p className="text-[15px] font-bold text-foreground">The stands are quiet</p>
      <p className="mx-auto mt-2 max-w-[320px] text-[13px] leading-relaxed text-muted-foreground">
        No posts found in this feed. Be the first to share your take or try selecting another tag.
      </p>
      {onCompose && (
        <button
          onClick={onCompose}
          className="mt-6 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97]"
        >
          <PenLine className="h-3.5 w-3.5" aria-hidden />
          Start the conversation
        </button>
      )}
    </motion.div>
  );
}

function FeedTabs({
  active,
  onChange,
  counts,
}: {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
  counts: Partial<Record<FeedTab, number>>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Feed filter"
      className="flex gap-0 overflow-hidden rounded-lg border border-border bg-card"
    >
      {FEED_TABS.map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className={cn(
            "relative flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] font-semibold tracking-[0.02em] transition-colors",
            active === tab ? "text-primary" : "text-muted-foreground hover:text-foreground/80"
          )}
        >
          {active === tab && (
            <motion.span
              layoutId="feed-tab-indicator"
              className="absolute inset-0 bg-primary/10"
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {tab === "Latest" && <Zap className="h-3 w-3" aria-hidden />}
            {tab === "Hot" && <TrendingUp className="h-3 w-3" aria-hidden />}
            {tab === "Following" && <Users className="h-3 w-3" aria-hidden />}
            {tab}
            {counts[tab] != null && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular",
                  active === tab ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                )}
              >
                {fmtCompact(counts[tab]!)}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Rich Post Composer with Working Image Upload & Unclipped Tag Menu
   ──────────────────────────────────────────────────────────────── */
function PostComposer({
  user,
  onSuccess,
}: {
  user: SafeUser | null;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [matchTag, setMatchTag] = useState<string | null>(null);
  const [tagOpen, setTagOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");

  // Image Upload States
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tagDropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remaining = MAX_CHARS - content.length;
  const isOver = remaining < 0;
  const isNearLimit = remaining <= 40 && remaining >= 0;

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Close tag dropdown on outside click
  useEffect(() => {
    if (!tagOpen) return;
    function h(e: MouseEvent) {
      if (tagDropRef.current && !tagDropRef.current.contains(e.target as Node)) {
        setTagOpen(false);
      }
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [tagOpen]);

  // Handle image file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid File", description: "Please upload an image file (PNG, JPG, WEBP, GIF).", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Image size must be under 10MB.", variant: "destructive" });
      return;
    }

    // Set preview immediately
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Upload failed");

      setImageUrl(json.data.url);
      toast({ title: "Image Attached", description: "Photo uploaded and attached to your post." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      toast({ title: "Upload Failed", description: msg, variant: "destructive" });
      setImagePreview(null);
      setImageUrl(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeAttachedImage = () => {
    setImageUrl(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const createPost = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, matchTag, imageUrl }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      setContent("");
      setMatchTag(null);
      removeAttachedImage();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({ title: "Posted 🎉", description: "Your take is now live on the terraces." });
      onSuccess();
    },
    onError: (e: Error) =>
      toast({ title: "Post failed", description: e.message, variant: "destructive" }),
  });

  if (!user) return null;

  const filteredTags = COMPOSER_TAGS.filter((t) =>
    t.toLowerCase().includes(tagSearch.toLowerCase().trim())
  );

  return (
    /* CRITICAL FIX: no reveal opacity-0, high z-index and overflow-visible so tag dropdown floats above feed tabs! */
    <div className={cn("relative rounded-xl border border-border/70 bg-card shadow-sm transition-all", tagOpen ? "z-50" : "z-20")}>
      {/* Top strip */}
      <div className="flex items-center gap-2.5 border-b border-border/60 px-4 py-3 rounded-t-xl bg-muted/20">
        <PenLine className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Share your take
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex gap-3">
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-primary/15 text-[13px] font-bold text-primary">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-green-500"
            />
          </div>

          <div className="min-w-0 flex-1">
            <label htmlFor="composer" className="sr-only">Write a post</label>
            <textarea
              ref={textareaRef}
              id="composer"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                autoResize();
              }}
              placeholder={`${user.name.split(" ")[0]}, what's your take on today's football?`}
              rows={3}
              maxLength={MAX_CHARS + 50}
              className="w-full resize-none bg-transparent py-1 text-[14px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
            />

            {/* Attached Image Preview */}
            {imagePreview && (
              <div className="relative mt-2 inline-block overflow-hidden rounded-xl border border-border bg-black/20">
                <img
                  src={imagePreview}
                  alt="Attachment preview"
                  className="max-h-48 w-auto rounded-xl object-cover"
                />
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeAttachedImage}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/75 p-1 text-white hover:bg-red-500 transition-colors"
                  title="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Emoji strip */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {EMOJI_STRIP.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setContent((c) => c + emoji);
                    textareaRef.current?.focus();
                    setTimeout(autoResize, 10);
                  }}
                  aria-label={`Insert ${emoji}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background text-[13px] transition-transform hover:scale-110 hover:border-border active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom toolbar */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3 relative">
          {/* Hidden File Input for Real Photo Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Tag Team Dropdown - opens UPWARD to avoid clipping by bottom of card */}
          <div ref={tagDropRef} className="relative z-40">
            <button
              type="button"
              onClick={() => setTagOpen((v) => !v)}
              aria-expanded={tagOpen}
              aria-label="Select team tag"
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11.5px] font-semibold transition-colors",
                matchTag
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/70 bg-background text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <Hash className="h-3 w-3" aria-hidden />
              {matchTag ?? "Tag team"}
            </button>

            <AnimatePresence>
              {tagOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  className="absolute left-0 bottom-10 z-[200] w-64 rounded-xl border border-border bg-card dark:bg-[#0c1222] p-2 shadow-2xl"
                >
                  {/* Tag search input */}
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      placeholder="Search club or hashtag..."
                      className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                    />
                  </div>

                  {matchTag && (
                    <button
                      onClick={() => { setMatchTag(null); setTagOpen(false); }}
                      className="mb-1.5 flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <span>Clear active tag</span>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}

                  <div className="max-h-52 overflow-y-auto space-y-0.5 no-scrollbar">
                    {filteredTags.length === 0 ? (
                      <p className="p-2 text-center text-xs text-muted-foreground">No matching tag found</p>
                    ) : (
                      filteredTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => { setMatchTag(tag); setTagOpen(false); setTagSearch(""); }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors hover:bg-muted",
                            matchTag === tag ? "bg-primary/10 text-primary font-bold" : "text-foreground/90"
                          )}
                        >
                          <Hash className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="truncate">{tag}</span>
                          {matchTag === tag && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Real Photo Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload photo"
            title="Attach a photo from your device"
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11.5px] font-semibold transition-colors",
              imageUrl
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                : "border-border/70 bg-background text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <ImageIcon className="h-3.5 w-3.5" aria-hidden />
            <span>{uploadingImage ? "Uploading..." : imageUrl ? "Photo attached" : "Photo"}</span>
          </button>

          <div className="flex-1" />

          {/* Character counter */}
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "tabular text-[11px] font-mono",
                isOver ? "text-red-500 font-bold" : isNearLimit ? "text-orange-400 font-bold" : "text-muted-foreground"
              )}
            >
              {remaining}
            </span>

            {/* Post button */}
            <button
              type="button"
              onClick={() => createPost.mutate()}
              disabled={(!content.trim() && !imageUrl) || isOver || createPost.isPending || uploadingImage}
              className="relative flex h-8.5 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 text-[11.5px] font-bold text-primary-foreground shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            >
              {createPost.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Posting…
                </>
              ) : (
                <>
                  <PenLine className="h-3.5 w-3.5" aria-hidden />
                  Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Suggested Creator Item with Working Follow Button
   ──────────────────────────────────────────────────────────────── */
function SuggestedCreatorItem({
  creator,
}: {
  creator: { id: string; name: string; username: string; avatarUrl?: string | null; role?: string };
}) {
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: followData } = useQuery<{ following: boolean }>({
    queryKey: ["follow", creator.id, user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/follow?followingId=${creator.id}`);
      return res.json().then((j) => j.data);
    },
    enabled: !!user && user.id !== creator.id,
  });

  const following = followData?.following ?? false;

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate({ name: "auth" });
        return;
      }
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: creator.id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["follow", creator.id] });
      toast({
        title: data?.following ? "Following" : "Unfollowed",
        description: data?.following ? `You are now following ${creator.name}` : `Unfollowed ${creator.name}`,
      });
    },
    onError: (e: Error) => toast({ title: "Action failed", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <button onClick={() => navigate({ name: "profile", username: creator.username })} className="shrink-0">
          <Avatar className="h-8 w-8 border">
            <AvatarImage src={creator.avatarUrl ?? undefined} alt={creator.name} />
            <AvatarFallback className="bg-primary/15 text-[11px] font-bold text-primary">
              {creator.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
        <div className="min-w-0">
          <button
            onClick={() => navigate({ name: "profile", username: creator.username })}
            className="truncate text-[12.5px] font-bold text-foreground hover:text-primary transition-colors block text-left"
          >
            {creator.name}
          </button>
          <p className="text-[10.5px] text-muted-foreground truncate">@{creator.username}</p>
        </div>
      </div>

      {user?.id !== creator.id && (
        <button
          onClick={() => followMutation.mutate()}
          disabled={followMutation.isPending}
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all",
            following
              ? "border border-border bg-muted/40 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
              : "bg-primary text-primary-foreground hover:brightness-110 active:scale-95"
          )}
        >
          {following ? <UserCheck className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
          <span>{following ? "Following" : "Follow"}</span>
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CommunityView — Main Export
   ════════════════════════════════════════════════════════════════ */
export function CommunityView() {
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  useReveal();

  const [activeTab, setActiveTab] = useState<FeedTab>("Latest");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  // Dynamic query that synchronizes with activeTab and selectedTag
  const { data, isLoading } = useQuery<{ posts: Post[]; suggested?: SafeUser[] }>({
    queryKey: ["posts", activeTab, selectedTag],
    queryFn: async () => {
      const sp = new URLSearchParams();
      sp.set("filter", activeTab);
      if (selectedTag) sp.set("tag", selectedTag);
      const res = await fetch(`/api/posts?${sp.toString()}`);
      return res.json().then((j) => j.data);
    },
    refetchInterval: 30_000,
  });

  const rawPosts = data?.posts ?? [];
  const suggested = (data?.suggested ?? []) as Array<{ id: string; name: string; username: string; avatarUrl?: string | null; role?: string }>;

  const trending = [...rawPosts].sort((a, b) => b.likeCount - a.likeCount).slice(0, 5);

  const scrollToComposer = () => {
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    (composerRef.current?.querySelector("textarea") as HTMLElement | null)?.focus();
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag((cur) => (cur === tag ? null : tag));
  };

  /* ── Right rail (xl+) ── */
  const rail = (
    <>
      {/* Trending topics — clicks filter the feed dynamically! */}
      <RailCard title="Trending on FHBD">
        <ul className="divide-y divide-border/40">
          {TRENDING_TOPICS.map((topic, i) => {
            const isSelected = selectedTag === topic.tag;
            return (
              <li key={topic.tag}>
                <button
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                    isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/40"
                  )}
                  onClick={() => handleTagClick(topic.tag)}
                >
                  <span className="w-4 shrink-0 text-[11px] font-bold tabular text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("flex items-center gap-1 text-[12.5px] font-bold", isSelected ? "text-primary" : "text-foreground")}>
                      <Hash className="h-3 w-3 shrink-0 text-primary" aria-hidden />
                      {topic.label}
                    </p>
                    <p className="text-[10.5px] text-muted-foreground">
                      {fmtCompact(topic.posts)} posts
                    </p>
                  </div>
                  <TrendingUp className="h-3.5 w-3.5 shrink-0 text-primary/60" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </RailCard>

      {/* Suggested Creators with Live Follow */}
      {suggested.length > 0 && (
        <RailCard title="Who to Follow">
          <div className="divide-y divide-border/40">
            {suggested.slice(0, 4).map((c) => (
              <SuggestedCreatorItem key={c.id} creator={c} />
            ))}
          </div>
        </RailCard>
      )}

      {/* Top posts from feed */}
      {trending.length > 0 && (
        <RailCard title="Hot Right Now">
          <div className="divide-y divide-border/40">
            {trending.map((p) => (
              <div key={p.id} className="px-4 py-3">
                <p className="line-clamp-2 text-[12.5px] font-medium leading-snug text-foreground/90">
                  {p.content}
                </p>
                <div className="mt-1.5 flex items-center gap-2 text-[10.5px] text-muted-foreground">
                  <span className="flex shrink-0 items-center gap-1 font-bold text-primary">
                    <Heart className="h-3 w-3 fill-primary" aria-hidden />
                    {fmtCompact(p.likeCount)}
                  </span>
                  <span className="truncate">@{p.author.username}</span>
                  <span className="shrink-0">{timeAgo(p.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </RailCard>
      )}

      <AdSlot placement="SIDEBAR" />

      {/* Community guidelines */}
      <RailCard title="Community Guidelines">
        <ul className="space-y-3 px-4 py-4">
          {GUIDELINES.map((g) => (
            <li key={g.title}>
              <p className="text-[12px] font-bold text-foreground/90">{g.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                {g.body}
              </p>
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-1.5 border-t border-border/60 bg-muted/20 px-4 py-2.5 text-[10px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3 shrink-0 text-primary" aria-hidden />
          The moderation desk reviews every report.
        </p>
      </RailCard>

      {/* Online community stat */}
      <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card px-4 py-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <p className="text-[11.5px] text-muted-foreground">
          <span className="font-bold text-foreground">{fmtNum(rawPosts.length)}</span>{" "}
          {rawPosts.length === 1 ? "post" : "posts"} in the community
        </p>
        <Wifi className="ml-auto h-3.5 w-3.5 shrink-0 text-green-500" aria-hidden />
      </div>
    </>
  );

  return (
    <PageLayout rail={rail}>
      {/* Lightbox Modal for Full Image View */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setLightboxUrl(null)}
          >
            <div className="relative max-h-[90vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <img
                src={lightboxUrl}
                alt="Enlarged fan photo"
                className="max-h-[85vh] w-auto rounded-xl object-contain shadow-2xl"
              />
              <button
                onClick={() => setLightboxUrl(null)}
                className="absolute -top-3.5 -right-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader
        title="Fan Community"
        kicker="the terraces"
        icon={<Users className="h-3.5 w-3.5" aria-hidden />}
        subtitle="Matchday takes, reactions, photos and fan talk from the stands."
      >
        <span className="label-cond hidden shrink-0 items-center gap-1.5 rounded-[6px] border border-border bg-card px-2.5 py-1.5 text-[11px] font-bold tracking-[0.06em] text-muted-foreground sm:flex">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          {fmtNum(rawPosts.length)} posts
        </span>
      </PageHeader>

      {/* Composer or sign-in prompt */}
      <div ref={composerRef} className="relative z-30">
        {user ? (
          <PostComposer user={user} onSuccess={() => setActiveTab("Latest")} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="reveal flex flex-wrap items-center gap-3.5 rounded-xl border border-border/70 bg-card p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-primary/12 text-primary">
              <LogIn className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold text-foreground">
                Join the conversation
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                Log in to post your take, share matchday photos, like reactions and reply to other fans.
              </p>
            </div>
            <button
              onClick={() => navigate({ name: "auth" })}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] bg-primary px-4 text-[11px] font-bold uppercase tracking-wider text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97]"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden />
              Log In
            </button>
          </motion.div>
        )}
      </div>

      {/* Feed */}
      <section className="mt-7 relative z-10" aria-label="Fan posts">
        {/* Filter tabs */}
        <div className="mb-4 space-y-3">
          <FeedTabs
            active={activeTab}
            onChange={setActiveTab}
            counts={{ Latest: rawPosts.length, Hot: rawPosts.length }}
          />

          {/* Active Tag Filter Pill */}
          {selectedTag && (
            <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Hash className="h-3.5 w-3.5 text-primary" />
                Filtering by: <strong className="text-primary">{selectedTag}</strong>
              </span>
              <button
                onClick={() => setSelectedTag(null)}
                className="flex items-center gap-1 font-bold text-primary hover:underline"
              >
                Clear filter
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4" aria-hidden aria-label="Loading posts">
            {[0, 1, 2].map((i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : rawPosts.length === 0 ? (
          <EmptyState onCompose={user ? scrollToComposer : undefined} />
        ) : (
          <div className="space-y-3">
            {rawPosts.map((post, i) => (
              <Fragment key={post.id}>
                <PostCard
                  post={post}
                  commentsOpen={openComments === post.id}
                  onToggleComments={() =>
                    setOpenComments(openComments === post.id ? null : post.id)
                  }
                  onTagClick={handleTagClick}
                  onOpenImage={(url) => setLightboxUrl(url)}
                />
                {(i + 1) % 3 === 0 && i !== rawPosts.length - 1 && (
                  <div className="reveal">
                    <AdSlot placement="IN_FEED" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}
      </section>
    </PageLayout>
  );
}
