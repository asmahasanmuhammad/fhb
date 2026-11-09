"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post, SafeUser } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { LikeButton } from "@/components/football/like-button";
import { CommentSection } from "@/components/football/comment-section";
import { AdSlot } from "@/components/football/ad-slot";
import { timeAgo, fmtCompact, fmtNum } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/football/section-header";
import {
  Radio, MessageCircle, Crown, UserPlus, UserCheck, Sparkles, LogIn, Megaphone,
  Hash, ShieldCheck, PenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   CommunityView — fan social feed
   Composer + post feed (8-col) with trending tags, guidelines and
   creators rail (4-col). Reddit/OneFootball community tone.
   ════════════════════════════════════════════════════════════════ */

const COMPOSER_TAGS = ["Abahani", "Mohammedan", "Bashundhara", "National Team"];
const GUIDELINES = [
  { title: "Keep it about football", body: "Matchday banter and rivalry are welcome — personal attacks are not." },
  { title: "No spam or promotion", body: "Unrelated links and advertising are removed by the moderation desk." },
  { title: "Flag, don't fight", body: "Report posts that break the rules and moderators will review them." },
];

export function CommunityView() {
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const { toast } = useToast();
  useReveal();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [matchTag, setMatchTag] = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ posts: Post[]; suggested: SafeUser[] }>({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts");
      return res.json().then((j) => j.data);
    },
  });

  const createPost = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, matchTag }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      setContent("");
      setMatchTag(null);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({ title: "Posted", description: "Your take is now live in the community." });
    },
    onError: (e: Error) => toast({ title: "Post failed", description: e.message, variant: "destructive" }),
  });

  const posts = data?.posts ?? [];
  const suggested = data?.suggested ?? [];

  /** Trending tags — real counts from the feed, seeded with the composer staples. */
  const trending = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of posts) {
      if (p.matchTag) counts.set(p.matchTag, (counts.get(p.matchTag) ?? 0) + 1);
    }
    const rows = COMPOSER_TAGS.map((t) => ({ tag: t, count: counts.get(t) ?? 0 }));
    for (const [tag, count] of counts) {
      if (!COMPOSER_TAGS.includes(tag)) rows.push({ tag, count });
    }
    return rows.sort((a, b) => b.count - a.count).slice(0, 6);
  }, [posts]);

  const visiblePosts = activeTag ? posts.filter((p) => p.matchTag === activeTag) : posts;

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      <PageHeader
        title="Fan Community"
        kicker="fan zone"
        subtitle="Matchday takes, hot posts and fan talk"
        icon={<Radio className="h-5 w-5" aria-hidden />}
      >
        <span className="tabular hidden shrink-0 items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1.5 text-[10.5px] font-bold text-muted-foreground sm:flex">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          {fmtNum(posts.length)} {posts.length === 1 ? "post" : "posts"}
        </span>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ── Post feed ─────────────────────────────────────────── */}
        <div className="min-w-0 space-y-4 lg:col-span-8">
          {/* Composer / login prompt */}
          {user ? (
            <div className="reveal edge-lit rounded-xl border border-border bg-card p-4 sm:p-5">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 shrink-0 border">
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                  <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">
                    {user.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`${user.name}, what is your take on today's football?`}
                    rows={3}
                    maxLength={600}
                    className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    aria-label="Write a post"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {COMPOSER_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setMatchTag((t) => (t === tag ? null : tag))}
                          className={cn(
                            "rounded-md border px-2.5 py-1 text-[10.5px] font-bold transition-colors",
                            matchTag === tag
                              ? "border-primary/50 bg-primary/15 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/35 hover:text-foreground"
                          )}
                          aria-pressed={matchTag === tag}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tabular text-[10.5px] text-muted-foreground">{fmtNum(content.length)}/600</span>
                      <Button
                        size="sm"
                        onClick={() => createPost.mutate()}
                        disabled={!content.trim() || createPost.isPending}
                        className="sheen gap-1.5 bg-primary px-5 font-bold"
                      >
                        <PenLine className="h-3.5 w-3.5" aria-hidden />
                        {createPost.isPending ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="reveal flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-primary/35 bg-primary/[0.05] p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <LogIn className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">Join the conversation</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Log in to post your take, like matchday reactions and reply to other fans.
                </p>
              </div>
              <Button onClick={() => navigate({ name: "auth" })} className="sheen shrink-0 gap-1.5 bg-primary font-bold">
                <LogIn className="h-4 w-4" aria-hidden /> Log In
              </Button>
            </div>
          )}

          {/* Active tag filter notice */}
          {activeTag && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/[0.07] px-4 py-2.5">
              <p className="flex min-w-0 items-center gap-2 text-xs font-bold text-primary">
                <Hash className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">
                  Showing {fmtNum(visiblePosts.length)} {visiblePosts.length === 1 ? "post" : "posts"} tagged #{activeTag}
                </span>
              </p>
              <button
                onClick={() => setActiveTag(null)}
                className="shrink-0 text-[11px] font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Posts */}
          {isLoading ? (
            <div className="space-y-4" aria-hidden>
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-32 rounded-md" />
                      <Skeleton className="h-3 w-24 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="mt-4 h-3.5 w-full rounded-md" />
                  <Skeleton className="mt-2 h-3.5 w-2/3 rounded-md" />
                  <Skeleton className="mt-4 h-8 w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : visiblePosts.length === 0 ? (
            <div className="reveal flex flex-col items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <MessageCircle className="h-5 w-5" aria-hidden />
              </span>
              <p className="text-sm font-semibold text-foreground">
                {activeTag ? `No posts tagged #${activeTag} yet` : "No posts yet"}
              </p>
              <p className="max-w-[36ch] text-xs leading-relaxed text-muted-foreground">
                {activeTag
                  ? "Be the first to start this tag — drop your take in the composer above."
                  : "The stands are quiet. Kick off the first matchday discussion."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visiblePosts.map((post, i) => (
                <div key={post.id} className="space-y-4">
                  <article className="reveal card-lift overflow-hidden rounded-xl border border-border bg-card">
                    <div className="p-4 sm:p-5">
                      {/* Author row */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate({ name: "profile", username: post.author.username })}
                          aria-label={`${post.author.name} profile`}
                          className="shrink-0"
                        >
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={post.author.avatarUrl ?? undefined} alt={post.author.name} />
                            <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">
                              {post.author.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm font-bold">
                            <button
                              onClick={() => navigate({ name: "profile", username: post.author.username })}
                              className="truncate transition-colors hover:text-primary"
                            >
                              {post.author.name}
                            </button>
                            {post.author.isPremium && (
                              <Crown className="h-3.5 w-3.5 shrink-0 text-fhb-gold" aria-label="Premium member" />
                            )}
                            {post.author.role === "CREATOR" && (
                              <span className="rounded bg-fhb-red/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-fhb-red">
                                Creator
                              </span>
                            )}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            @{post.author.username}
                            <span className="mx-1.5" aria-hidden>
                              ·
                            </span>
                            {timeAgo(post.createdAt)}
                          </p>
                        </div>
                        {post.matchTag && (
                          <span className="hidden shrink-0 rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-[10.5px] font-bold text-primary sm:inline-block">
                            #{post.matchTag}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <p className="mt-3.5 whitespace-pre-line break-words text-sm leading-relaxed text-foreground/90">
                        {post.content}
                      </p>
                      {post.matchTag && (
                        <span className="mt-3 inline-block rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-[10.5px] font-bold text-primary sm:hidden">
                          #{post.matchTag}
                        </span>
                      )}
                    </div>

                    {/* Engagement row */}
                    <div className="flex items-center gap-1.5 border-t border-border/60 px-3 py-2">
                      <LikeButton targetType="POST" targetId={post.id} initialCount={post.likeCount} variant="inline" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenComments(openComments === post.id ? null : post.id)}
                        aria-expanded={openComments === post.id}
                        className={cn("gap-1.5", openComments === post.id && "text-primary")}
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden />
                        <span className="tabular">{fmtCompact(post.commentCount)}</span>
                        <span className="hidden sm:inline">{post.commentCount === 1 ? "comment" : "comments"}</span>
                      </Button>
                    </div>

                    {openComments === post.id && (
                      <div className="border-t border-border/60 bg-background/40 p-4 sm:p-5">
                        <CommentSection targetType="POST" targetId={post.id} />
                      </div>
                    )}
                  </article>

                  {/* Mobile banner woven between posts (desktop keeps the rail ad) */}
                  {((i + 1) % 3 === 0 && i !== visiblePosts.length - 1) && (
                    <div className="lg:hidden">
                      <AdSlot placement="MOBILE_BANNER" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Side rail ─────────────────────────────────────────── */}
        <aside className="min-w-0 space-y-4 lg:col-span-4" aria-label="Community side rail">
          {/* Creators to follow */}
          {suggested.length > 0 && (
            <div className="reveal overflow-hidden rounded-xl border border-border bg-card">
              <p className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-fhb-gold" aria-hidden />
                Creators to follow
              </p>
              <div className="divide-y divide-border/60">
                {suggested.map((s) => (
                  <SuggestedCreator key={s.id} creator={s} />
                ))}
              </div>
            </div>
          )}

          {/* Trending hashtags */}
          <div className="reveal overflow-hidden rounded-xl border border-border bg-card">
            <p className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-foreground">
              <Hash className="h-3.5 w-3.5 text-primary" aria-hidden />
              Trending hashtags
            </p>
            <div className="divide-y divide-border/60">
              {trending.map((t) => (
                <button
                  key={t.tag}
                  onClick={() => setActiveTag((cur) => (cur === t.tag ? null : t.tag))}
                  aria-pressed={activeTag === t.tag}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03]",
                    activeTag === t.tag && "bg-primary/[0.07]"
                  )}
                >
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-xs font-bold",
                      activeTag === t.tag ? "text-primary" : "text-foreground/90"
                    )}
                  >
                    #{t.tag}
                  </span>
                  <span className="tabular shrink-0 text-[10.5px] font-semibold text-muted-foreground">
                    {fmtNum(t.count)} {t.count === 1 ? "post" : "posts"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* In-feed ad in the rail */}
          <div className="reveal">
            <AdSlot placement="IN_FEED" />
          </div>

          {/* Community guidelines */}
          <div className="reveal edge-lit rounded-xl border border-border bg-card p-5">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              Community guidelines
            </p>
            <ul className="mt-3.5 space-y-3">
              {GUIDELINES.map((g) => (
                <li key={g.title}>
                  <p className="text-xs font-bold text-foreground/90">{g.title}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">{g.body}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Become a creator */}
          <div className="reveal gold-panel rounded-xl border border-fhb-gold/25 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-fhb-gold">
              <Megaphone className="h-4 w-4" aria-hidden /> Become a creator
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
              Upload shorts, grow your following and earn from views. The creator role is granted from the admin panel in
              this demo.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SuggestedCreator({ creator }: { creator: SafeUser }) {
  const { user } = useAppStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useAppStore((s) => s.navigate);

  const { data } = useQuery<{ following: boolean }>({
    queryKey: ["follow", creator.id, user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/follow?followingId=${creator.id}`);
      return res.json().then((j) => j.data);
    },
    enabled: !!user && user.id !== creator.id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: creator.id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["follow", creator.id] }),
    onError: (e: Error) => toast({ title: "Follow failed", description: e.message, variant: "destructive" }),
  });

  const following = data?.following ?? false;

  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]">
      <button onClick={() => navigate({ name: "profile", username: creator.username })} aria-label={`${creator.name} profile`}>
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={creator.avatarUrl ?? undefined} alt={creator.name} />
          <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">{creator.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </button>
      <div className="min-w-0 flex-1">
        <button
          onClick={() => navigate({ name: "profile", username: creator.username })}
          className="block max-w-full truncate text-xs font-bold text-foreground transition-colors hover:text-primary"
        >
          {creator.name}
        </button>
        <p className="tabular truncate text-[10.5px] text-muted-foreground">
          {fmtCompact(creator.followerCount ?? 0)} followers
        </p>
      </div>
      {user && user.id !== creator.id && (
        <Button
          size="sm"
          variant={following ? "secondary" : "outline"}
          onClick={() => followMutation.mutate()}
          disabled={followMutation.isPending}
          className="h-8 gap-1.5 px-3 text-[11px] font-bold"
        >
          {following ? <UserCheck className="h-3 w-3" aria-hidden /> : <UserPlus className="h-3 w-3" aria-hidden />}
          {following ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
}
