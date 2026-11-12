"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import type { NewsArticle, Comment } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { useAppStore } from "@/store/app-store";
import { AdSlot } from "@/components/football/ad-slot";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fmtCompact, formatKickoff, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock,
  Crown,
  Eye,
  Facebook,
  Heart,
  Link2,
  MessageCircle,
  Newspaper,
  Send,
  Share2,
  ThumbsUp,
  Twitter,
  UserPlus,
  LogIn,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   NewsDetailView — editorial article page (FHB v5 enhanced)
   Reading progress bar, animated hero, author card, social share,
   enhanced comments with per-comment likes, related article cards.
   ════════════════════════════════════════════════════════════════ */

/** Category chip colours — mirrors the NewsCard chip language. */
const CATEGORY_STYLES: Record<string, { chip: string; glow: string }> = {
  BFL: { chip: "bg-primary text-primary-foreground", glow: "shadow-[0_0_12px_rgba(var(--primary-rgb),0.4)]" },
  NATIONAL: { chip: "bg-[#ff1e46] text-white", glow: "shadow-[0_0_12px_rgba(255,30,70,0.4)]" },
  TRANSFER: { chip: "bg-fhb-gold text-black", glow: "shadow-[0_0_12px_rgba(255,196,0,0.3)]" },
  INTERNATIONAL: { chip: "bg-elevated text-foreground ring-1 ring-inset ring-border", glow: "" },
  OPINION: { chip: "bg-secondary text-foreground", glow: "" },
};

/** Long-form typography — condensed crossheads, spaced paragraphs. */
const MD_COMPONENTS: Components = {
  h2: ({ node: _n, ...p }) => (
    <h2
      className="label-cond mt-10 border-b border-border pb-2.5 text-[17px] font-bold text-foreground"
      {...p}
    />
  ),
  h3: ({ node: _n, ...p }) => (
    <h3 className="label-cond mt-7 text-[15px] font-bold text-foreground" {...p} />
  ),
  p: ({ node: _n, ...p }) => <p className="mt-5" {...p} />,
  strong: ({ node: _n, ...p }) => (
    <strong className="font-semibold text-foreground" {...p} />
  ),
  ul: ({ node: _n, ...p }) => (
    <ul
      className="mt-5 list-disc space-y-2 pl-6 marker:text-muted-foreground"
      {...p}
    />
  ),
  ol: ({ node: _n, ...p }) => (
    <ol
      className="mt-5 list-decimal space-y-2 pl-6 marker:text-muted-foreground"
      {...p}
    />
  ),
  blockquote: ({ node: _n, ...p }) => (
    <blockquote
      className="mt-6 border-l-[3px] border-[#ff1e46]/70 pl-5 italic text-muted-foreground/90 text-[15px] leading-relaxed"
      {...p}
    />
  ),
  a: ({ node: _n, ...p }) => (
    <a
      className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...p}
    />
  ),
};

/** Lead paragraph — editorial drop-cap. */
const LEAD_COMPONENTS: Components = {
  ...MD_COMPONENTS,
  p: ({ node: _n, ...p }) => (
    <p
      className="first-letter:float-left first-letter:mr-2 first-letter:mt-[4px] first-letter:text-[46px] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-foreground"
      {...p}
    />
  ),
};

/* ─── Reading Progress Bar ──────────────────────────────────────── */
function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop || document.body.scrollTop;
      const total = doc.scrollHeight - doc.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-[9999] h-[3px] bg-transparent"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <motion.div
        className="h-full origin-left bg-[#ff1e46]"
        style={{ scaleX: progress / 100 }}
        transition={{ duration: 0.05, ease: "linear" }}
      />
    </div>
  );
}

/* ─── Social Share Button Cluster ───────────────────────────────── */
function ShareCluster({ articleId, title }: { articleId: string; title: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/?news=${articleId}`
    : `/?news=${articleId}`;

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user dismissed
      }
    } else {
      await copyLink();
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link copied", description: "Paste it anywhere to share." });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({ title: "Copy failed", description: "Copy the URL from your browser bar." });
    }
  };

  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const twUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

  const socials = [
    { label: "Facebook", href: fbUrl, icon: Facebook, color: "hover:bg-blue-600/15 hover:border-blue-500/40 hover:text-blue-400" },
    { label: "Twitter / X", href: twUrl, icon: Twitter, color: "hover:bg-sky-500/15 hover:border-sky-400/40 hover:text-sky-400" },
    {
      label: "WhatsApp",
      href: waUrl,
      icon: ({ className }: { className?: string }) => (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 2.163c-5.425 0-9.837 4.413-9.837 9.837 0 1.733.453 3.359 1.243 4.773L2.1 21.9l5.244-1.374a9.797 9.797 0 004.656 1.174c5.424 0 9.837-4.413 9.837-9.837 0-5.425-4.413-9.837-9.837-9.837z" />
        </svg>
      ),
      color: "hover:bg-green-600/15 hover:border-green-500/40 hover:text-green-400",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Native share / copy */}
      <button
        onClick={handleNativeShare}
        className="flex h-8 items-center gap-1.5 rounded-[6px] border border-border bg-card px-3 text-[11px] font-bold uppercase tracking-wider text-foreground/80 transition-all hover:border-white/20 hover:text-foreground"
      >
        <Share2 className="h-3.5 w-3.5" aria-hidden />
        Share
      </button>

      {/* Social icons */}
      {socials.map(({ label, href, icon: Icon, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all",
            color
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </a>
      ))}

      {/* Copy link */}
      <button
        onClick={copyLink}
        aria-label="Copy link"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all",
          copied
            ? "border-green-500/40 bg-green-600/15 text-green-400"
            : "hover:border-white/20 hover:text-foreground"
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

/* ─── Animated Heart Like Button ────────────────────────────────── */
function ArticleLikeButton({
  targetId,
  initialCount,
}: {
  targetId: string;
  initialCount: number;
}) {
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [burst, setBurst] = useState(false);

  const toggle = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "NEWS", targetId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onMutate: () => {
      const wasLiked = liked;
      setLiked((l) => !l);
      setCount((c) => (wasLiked ? c - 1 : c + 1));
      if (!liked) setBurst(true);
      setTimeout(() => setBurst(false), 700);
    },
    onError: () => {
      setLiked(liked);
      setCount(initialCount);
    },
    onSuccess: (data) => setLiked(data.liked),
  });

  const handleClick = () => {
    if (!user) { navigate({ name: "auth" }); return; }
    toggle.mutate();
  };

  return (
    <button
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      className="group relative flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-[13px] font-semibold transition-all hover:border-[#ff1e46]/40"
    >
      {/* Burst rings */}
      <AnimatePresence>
        {burst && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0.5, opacity: 0.9 }}
                animate={{
                  scale: 1.8 + i * 0.15,
                  opacity: 0,
                  x: Math.cos((i / 6) * Math.PI * 2) * 18,
                  y: Math.sin((i / 6) * Math.PI * 2) * 18,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff1e46]"
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <motion.span
        animate={liked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
        transition={{ duration: 0.35, ease: "backOut" }}
        className="relative z-10 flex"
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-all duration-200",
            liked ? "fill-[#ff1e46] text-[#ff1e46]" : "text-muted-foreground group-hover:text-[#ff1e46]"
          )}
          aria-hidden
        />
      </motion.span>
      <span
        className={cn(
          "tabular relative z-10 transition-colors",
          liked ? "text-[#ff1e46]" : "text-muted-foreground"
        )}
      >
        {fmtCompact(count)}
      </span>
    </button>
  );
}

/* ─── Comment Like Button (inline, minimal) ──────────────────────── */
function CommentLikeBtn({ commentId, initial }: { commentId: string; initial: number }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initial);
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);

  const toggle = () => {
    if (!user) { navigate({ name: "auth" }); return; }
    setLiked((l) => {
      const next = !l;
      setCount((c) => (next ? c + 1 : c - 1));
      return next;
    });
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={liked}
      aria-label={liked ? "Unlike comment" : "Like comment"}
      className="flex items-center gap-1 text-[10.5px] text-muted-foreground transition-colors hover:text-[#ff1e46]"
    >
      <ThumbsUp
        className={cn("h-3 w-3 transition-colors", liked && "fill-[#ff1e46] text-[#ff1e46]")}
        aria-hidden
      />
      {count > 0 && <span className="tabular">{count}</span>}
    </button>
  );
}

/* ─── Enhanced Comment Section ───────────────────────────────────── */
const MAX_CHARS = 500;

function EnhancedCommentSection({
  targetType,
  targetId,
}: {
  targetType: "NEWS" | "VIDEO" | "POST";
  targetId: string;
}) {
  const { toast } = useToast();
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data, isLoading } = useQuery<{ comments: Comment[] }>({
    queryKey: ["comments", targetType, targetId],
    queryFn: async () => {
      const res = await fetch(`/api/comments?targetType=${targetType}&targetId=${targetId}`);
      return res.json().then((j) => j.data);
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, content }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      setContent("");
      setReplyTo(null);
      qc.invalidateQueries({ queryKey: ["comments", targetType, targetId] });
    },
    onError: (e: Error) =>
      toast({ title: "Comment failed", description: e.message, variant: "destructive" }),
  });

  const remaining = MAX_CHARS - content.length;
  const comments = data?.comments ?? [];

  return (
    <section aria-label="Comments" className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
        <MessageCircle className="h-4 w-4 text-[#ff1e46]" aria-hidden />
        <h3 className="label-cond text-[15px] font-bold text-foreground">Comments</h3>
        <span className="tabular rounded-[4px] bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
          {comments.length.toLocaleString("en-US")}
        </span>
      </div>

      {/* Compose box */}
      {user ? (
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 shrink-0 border border-border/60">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
              {user.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2.5">
            {replyTo && (
              <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-1.5 text-[11px] text-muted-foreground">
                <span>Replying to</span>
                <span className="font-semibold text-foreground">{replyTo}</span>
                <button
                  onClick={() => setReplyTo(null)}
                  className="ml-auto text-muted-foreground hover:text-foreground"
                  aria-label="Cancel reply"
                >
                  ×
                </button>
              </div>
            )}
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Share your thoughts on this story…"
              rows={3}
              className="resize-none bg-background/70 text-[13.5px] leading-relaxed placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-[#ff1e46]/50"
              aria-label="Write a comment"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "tabular text-[10px] font-medium transition-colors",
                    remaining <= 50 ? "text-[#ff1e46]" : "text-muted-foreground"
                  )}
                >
                  {remaining}/{MAX_CHARS}
                </span>
                {/* char-bar */}
                <span className="h-1 w-16 overflow-hidden rounded-full bg-border">
                  <span
                    className={cn(
                      "block h-full transition-all duration-200",
                      remaining <= 50 ? "bg-[#ff1e46]" : "bg-primary"
                    )}
                    style={{ width: `${((MAX_CHARS - remaining) / MAX_CHARS) * 100}%` }}
                  />
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => submit.mutate()}
                disabled={!content.trim() || submit.isPending}
                className="gap-1.5 text-[12px]"
              >
                <Send className="h-3.5 w-3.5" aria-hidden />
                {submit.isPending ? "Posting…" : "Post"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate({ name: "auth" })}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/20 p-4 text-[13px] text-muted-foreground transition-all hover:border-[#ff1e46]/30 hover:bg-[#ff1e46]/5 hover:text-foreground"
        >
          <LogIn className="h-4 w-4" aria-hidden />
          Log in to join the conversation
        </button>
      )}

      {/* Comment list */}
      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
        ) : comments.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted-foreground">
            No comments yet — be the first to share your take.
          </p>
        ) : (
          comments.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.25 }}
              className="group flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-[#ff1e46]/20 hover:bg-card"
            >
              <Avatar className="h-8 w-8 shrink-0 border border-border/50">
                <AvatarImage src={c.user.avatarUrl ?? undefined} alt={c.user.name} />
                <AvatarFallback className="bg-primary/15 text-[10px] font-bold text-primary">
                  {c.user.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => navigate({ name: "profile", username: c.user.username })}
                    className="text-[12.5px] font-bold transition-colors hover:text-primary"
                  >
                    {c.user.name}
                  </button>
                  {c.user.isPremium && (
                    <span className="flex items-center gap-0.5 rounded-sm bg-fhb-gold/15 px-1 py-0.5 text-[9px] font-bold text-fhb-gold">
                      <Crown className="h-2.5 w-2.5" aria-hidden /> PRO
                    </span>
                  )}
                  {c.user.role === "ADMIN" && (
                    <span className="rounded-sm bg-[#ff1e46]/15 px-1 py-0.5 text-[9px] font-bold text-[#ff1e46]">
                      STAFF
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="whitespace-pre-line break-words text-[13px] leading-relaxed text-foreground/85">
                  {c.content}
                </p>
                <div className="mt-2 flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <CommentLikeBtn commentId={c.id} initial={c.likeCount} />
                  <button
                    onClick={() => {
                      setReplyTo(c.user.name);
                      textareaRef.current?.focus();
                    }}
                    className="text-[10.5px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}

/* ─── Author Bio Card ────────────────────────────────────────────── */
function AuthorCard({ author }: { author: NewsArticle["author"] }) {
  const navigate = useAppStore((s) => s.navigate);
  const [following, setFollowing] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-10 rounded-2xl border border-border bg-card/50 p-5"
    >
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        About the Author
      </p>
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate({ name: "profile", username: author.username })}
          className="shrink-0"
        >
          <Avatar className="h-14 w-14 border-2 border-border/60 transition-all hover:border-primary/50">
            <AvatarImage src={author.avatarUrl ?? undefined} alt={author.name} />
            <AvatarFallback className="bg-primary/15 text-base font-bold text-primary">
              {author.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <button
                onClick={() => navigate({ name: "profile", username: author.username })}
                className="block text-[15px] font-bold text-foreground transition-colors hover:text-primary"
              >
                {author.name}
              </button>
              <p className="text-[11px] text-muted-foreground">@{author.username}</p>
            </div>
            <button
              onClick={() => setFollowing((f) => !f)}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-[11px] font-bold transition-all",
                following
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground/80 hover:border-primary/40 hover:text-primary"
              )}
            >
              <UserPlus className="h-3 w-3" aria-hidden />
              {following ? "Following" : "Follow"}
            </button>
          </div>
          {author.bio && (
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
              {author.bio}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Related Article Card (card-based) ─────────────────────────── */
function RelatedCard({ article }: { article: NewsArticle }) {
  const navigate = useAppStore((s) => s.navigate);

  return (
    <motion.button
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate({ name: "news-detail", id: article.id })}
      aria-label={`Read: ${article.title}`}
      className="group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:border-[#ff1e46]/30 hover:shadow-[0_4px_24px_rgba(255,30,70,0.08)]"
    >
      {/* Thumbnail */}
      <span className="relative block aspect-[16/9] overflow-hidden bg-elevated">
        {article.coverUrl ? (
          <Image
            src={article.coverUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 360px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <span className="label-cond text-[11px] font-bold tracking-[0.2em] text-muted-foreground/25">
              FHB
            </span>
          </span>
        )}
        {/* Category chip overlay */}
        <span className="absolute left-3 top-3 rounded-[4px] bg-black/60 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm">
          {CATEGORY_LABELS[article.category] ?? article.category}
        </span>
      </span>

      {/* Content */}
      <span className="flex flex-1 flex-col gap-2 p-4">
        <span className="line-clamp-2 text-[14px] font-semibold leading-snug tracking-[-0.005em] text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </span>
        <span className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
          {article.excerpt}
        </span>
        <span className="mt-auto flex items-center justify-between pt-1.5 text-[10.5px] text-muted-foreground">
          <span className="font-medium text-foreground/60">{article.author.name}</span>
          <span className="flex items-center gap-2.5">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" aria-hidden />
              {fmtCompact(article.views)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              {Math.max(1, Math.ceil(article.content.length / 800))}m
            </span>
          </span>
        </span>
      </span>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main NewsDetailView Component
   ═══════════════════════════════════════════════════════════════════ */
export function NewsDetailView({ articleId }: { articleId: string }) {
  const { toast } = useToast();
  useReveal();

  const { data, isLoading } = useQuery<{ article: NewsArticle; related: NewsArticle[] }>({
    queryKey: ["news", "detail", articleId],
    queryFn: async () => {
      const res = await fetch(`/api/news/${articleId}`);
      return res.json().then((j) => j.data);
    },
  });

  const a = data?.article;
  const categoryKey = a?.category ?? "BFL";

  // Same-category padding for related grid (API returns up to 3)
  const { data: feedData } = useQuery<{ articles: NewsArticle[] }>({
    queryKey: ["news", "related", categoryKey],
    enabled: !!a,
    queryFn: async () => {
      const res = await fetch(`/api/news?category=${categoryKey}&limit=6`);
      return res.json().then((j) => j.data);
    },
  });

  const scrollToComments = useCallback(() => {
    document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /* ── Skeleton ── */
  if (isLoading || !a) {
    return (
      <>
        <ReadingProgressBar />
        <div className="mx-auto w-full max-w-[840px] px-4 pb-16 pt-5 sm:px-6 lg:pt-8">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="mt-6 h-7 w-28 rounded-[6px]" />
          <Skeleton className="mt-4 h-11 w-11/12 rounded-md" />
          <Skeleton className="mt-2 h-11 w-3/4 rounded-md" />
          <Skeleton className="mt-5 h-[56px] w-full rounded-xl" />
          <Skeleton className="mt-6 aspect-[16/9] w-full rounded-2xl" />
          <div className="mt-8 space-y-3.5" aria-hidden>
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className={cn("h-4 rounded-[4px]", i % 3 === 2 ? "w-5/6" : "w-full")} />
            ))}
          </div>
        </div>
      </>
    );
  }

  /* ── Computed values ── */
  const catStyle = CATEGORY_STYLES[a.category] ?? CATEGORY_STYLES.INTERNATIONAL;
  const catLabel = CATEGORY_LABELS[a.category] ?? a.category;
  const readMins = Math.max(1, Math.ceil(a.content.length / 800));
  const published = formatKickoff(a.createdAt);

  // Related grid (self-excluded, deduplicated, max 4)
  const related = data?.related ?? [];
  const seen = new Set([a.id, ...related.map((r) => r.id)]);
  const relatedGrid = [
    ...related,
    ...(feedData?.articles ?? []).filter((x) => !seen.has(x.id)),
  ].slice(0, 4);

  // Body split — drop-cap on lead prose paragraph
  const blocks = a.content.split(/\n{2,}/);
  const leadBlock = blocks[0] ?? "";
  const restBlocks = blocks.slice(1).join("\n\n");
  const leadIsParagraph =
    leadBlock.trim().length > 0 &&
    !/^\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s)/.test(leadBlock);

  return (
    <>
      <ReadingProgressBar />

      <div className="mx-auto w-full max-w-[840px] px-4 pb-20 pt-5 sm:px-6 lg:pt-8">
        {/* Back button */}
        <button
          onClick={() => useAppStore.getState().back()}
          className="mb-5 flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back
        </button>

        <article>
          {/* ── Article header ── */}
          <header>
            {/* Category chip */}
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "inline-block rounded-[5px] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.09em]",
                catStyle.chip,
                catStyle.glow
              )}
            >
              {catLabel}
            </motion.span>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="mt-4 text-[27px] font-bold leading-[1.1] tracking-[-0.018em] text-foreground sm:text-[33px] lg:text-[36px]"
            >
              {a.title}
            </motion.h1>

            {/* Standfirst */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-3.5 text-[15.5px] leading-relaxed text-muted-foreground"
            >
              {a.excerpt}
            </motion.p>

            {/* Byline strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5 border-y border-border py-4"
            >
              {/* Author */}
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-10 w-10 border border-border/60">
                  <AvatarImage src={a.author.avatarUrl ?? undefined} alt={a.author.name} />
                  <AvatarFallback className="bg-primary/15 text-[11px] font-bold text-primary">
                    {a.author.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-foreground">{a.author.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">@{a.author.username}</p>
                </div>
              </div>

              {/* Meta chips */}
              <div className="ml-auto flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3" aria-hidden />
                  {published.date}
                </span>
                <span className="tabular flex items-center gap-1.5">
                  <Eye className="h-3 w-3" aria-hidden />
                  {fmtCompact(a.views)} reads
                </span>
                <span className="tabular flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3" aria-hidden />
                  {readMins} min read
                </span>
              </div>
            </motion.div>
          </header>

          {/* ── Cover image ── */}
          <motion.figure
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-elevated"
          >
            {a.coverUrl ? (
              <Image
                src={a.coverUrl}
                alt={a.title}
                fill
                sizes="(max-width: 1024px) 100vw, 840px"
                className="object-cover"
                priority
                unoptimized
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                <span className="label-cond text-sm tracking-[0.2em] text-muted-foreground/40">
                  FHB News
                </span>
              </span>
            )}
            {/* Subtle bottom gradient for atmosphere */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
          </motion.figure>

          {/* ── Article body ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-8"
          >
            {leadIsParagraph ? (
              <>
                <div className="text-[16px] sm:text-[17.5px] leading-[1.85] text-foreground/90 [&>*:first-child]:mt-0">
                  <Markdown components={LEAD_COMPONENTS}>{leadBlock}</Markdown>
                </div>
                {restBlocks.trim().length > 0 && (
                  <div className="text-[16px] sm:text-[17.5px] leading-[1.85] text-foreground/90">
                    <Markdown components={MD_COMPONENTS}>{restBlocks}</Markdown>
                  </div>
                )}
              </>
            ) : (
              <div className="text-[16px] sm:text-[17.5px] leading-[1.85] text-foreground/90 [&>*:first-child]:mt-0">
                <Markdown components={MD_COMPONENTS}>{a.content}</Markdown>
              </div>
            )}
          </motion.div>

          {/* ── Engagement bar ── */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4">
            {/* Like + comments */}
            <div className="flex items-center gap-2">
              <ArticleLikeButton targetId={a.id} initialCount={a.likeCount} />
              <button
                onClick={scrollToComments}
                className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-[13px] font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                <span className="tabular">{fmtCompact(a.commentCount)}</span>
                <span className="hidden sm:inline text-[12px]">Comments</span>
              </button>
            </div>

            {/* Share cluster */}
            <ShareCluster articleId={a.id} title={a.title} />
          </div>

          {/* ── Author bio card ── */}
          <AuthorCard author={a.author} />

          {/* ── Comments ── */}
          <section id="comments" className="mt-10 scroll-mt-24">
            <EnhancedCommentSection targetType="NEWS" targetId={a.id} />
          </section>
        </article>

        {/* ── Ad slot ── */}
        <div className="reveal mt-10">
          <AdSlot placement="IN_FEED" />
        </div>

        {/* ── Related stories ── */}
        {relatedGrid.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45 }}
            className="mt-12"
            aria-label="Related stories"
          >
            {/* Section header */}
            <div className="mb-5 flex items-center gap-2.5 border-b border-border pb-3">
              <Newspaper className="h-4 w-4 text-[#ff1e46]" aria-hidden />
              <h2 className="label-cond text-[14px] font-bold tracking-[0.07em] text-foreground/90">
                Related Stories
              </h2>
              <span className="ml-auto text-[11px] text-muted-foreground">
                {catLabel}
              </span>
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {relatedGrid.map((r, idx) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.3 }}
                >
                  <RelatedCard article={r} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </>
  );
}
