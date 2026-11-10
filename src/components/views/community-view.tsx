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
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      <PageHeader
        title="Fan Community"
        kicker="the terrace · matchday banter & takes"
        subtitle="Matchday reactions, tactical opinions and live discussions with football fans across Bangladesh"
        icon={<Radio className="h-5 w-5" aria-hidden />}
      >
        <span className="tabular hidden shrink-0 items-center gap-1.5 border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[10.5px] font-black uppercase text-white/50 sm:flex">
          <MessageCircle className="h-3.5 w-3.5 text-red-500" aria-hidden />
          {fmtNum(posts.length)} {posts.length === 1 ? "take" : "takes"}
        </span>
      </PageHeader>

      {/* Leaderboard ad */}
      <div className="reveal mb-6">
        <AdSlot placement="HEADER_BANNER" className="h-[90px]" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ── Post feed ─────────────────────────────────────────── */}
        <div className="min-w-0 space-y-4 lg:col-span-8">
          {/* Composer / login prompt */}
          {user ? (
            <div className="reveal rounded-xl border border-white/15 bg-[#0b101d] p-4 sm:p-5 shadow-lg">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 shrink-0 border border-white/20">
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                  <AvatarFallback className="bg-red-600/30 text-sm font-black text-red-400">
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
                    className="w-full resize-none rounded-lg border border-white/20 bg-[#06080f] p-3 text-sm font-medium text-white leading-relaxed outline-none transition-colors placeholder:text-slate-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/50"
                    aria-label="Write a post"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {COMPOSER_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setMatchTag((t) => (t === tag ? null : tag))}
                          className={cn(
                            "rounded-md border px-2.5 py-1 text-[11px] font-black transition-colors",
                            matchTag === tag
                              ? "border-red-500 bg-red-600/25 text-red-300 shadow-sm"
                              : "border-white/15 bg-white/5 text-slate-300 hover:border-red-500/50 hover:text-white"
                          )}
                          aria-pressed={matchTag === tag}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tabular text-[11px] font-semibold text-slate-400">{fmtNum(content.length)}/600</span>
                      <Button
                        size="sm"
                        onClick={() => createPost.mutate()}
                        disabled={!content.trim() || createPost.isPending}
                        className="sheen gap-1.5 bg-red-600 hover:bg-red-500 text-white px-5 font-black shadow-md shadow-red-600/30"
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
            <div className="reveal flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-red-500/40 bg-[#0b101d] p-5 shadow-lg">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
                <LogIn className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-white">Join the conversation</p>
                <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-300">
                  Log in to post your take, like matchday reactions and reply to other fans.
                </p>
              </div>
              <Button onClick={() => navigate({ name: "auth" })} className="sheen shrink-0 gap-1.5 bg-red-600 hover:bg-red-500 text-white font-black shadow-md shadow-red-600/30">
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
                  <article className="reveal overflow-hidden rounded-xl border border-white/15 bg-[#0b101d] shadow-lg">
                    <div className="p-4 sm:p-5">
                      {/* Author row */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate({ name: "profile", username: post.author.username })}
                          aria-label={`${post.author.name} profile`}
                          className="shrink-0"
                        >
                          <Avatar className="h-10 w-10 border border-white/20">
                            <AvatarImage src={post.author.avatarUrl ?? undefined} alt={post.author.name} />
                            <AvatarFallback className="bg-red-600/30 text-sm font-black text-red-400">
                              {post.author.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm font-black text-white">
                            <button
                              onClick={() => navigate({ name: "profile", username: post.author.username })}
                              className="truncate transition-colors hover:text-red-400"
                            >
                              {post.author.name}
                            </button>
                            {post.author.isPremium && (
                              <Crown className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-label="Premium member" />
                            )}
                            {post.author.role === "CREATOR" && (
                              <span className="rounded bg-red-600/25 border border-red-500/40 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.06em] text-red-300">
                                Creator
                              </span>
                            )}
                          </p>
                          <p className="truncate text-[11px] font-semibold text-slate-400">
                            @{post.author.username}
                            <span className="mx-1.5" aria-hidden>
                              ·
                            </span>
                            {timeAgo(post.createdAt)}
                          </p>
                        </div>
                        {post.matchTag && (
                          <span className="hidden shrink-0 rounded-md border border-red-500/40 bg-red-600/20 px-2 py-1 text-[11px] font-black text-red-300 sm:inline-block">
                            #{post.matchTag}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <p className="mt-3.5 whitespace-pre-line break-words text-[14px] font-medium leading-relaxed text-white">
                        {post.content}
                      </p>
                      {post.matchTag && (
                        <span className="mt-3 inline-block rounded-md border border-red-500/40 bg-red-600/20 px-2 py-1 text-[10.5px] font-black text-red-300 sm:hidden">
                          #{post.matchTag}
                        </span>
                      )}
                    </div>

                    {/* Engagement row */}
                    <div className="flex items-center gap-1.5 border-t border-white/10 bg-[#06080f] px-3 py-2">
                      <LikeButton targetType="POST" targetId={post.id} initialCount={post.likeCount} variant="inline" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenComments(openComments === post.id ? null : post.id)}
                        aria-expanded={openComments === post.id}
                        className={cn("gap-1.5 text-slate-300 hover:text-white hover:bg-white/5", openComments === post.id && "text-red-400 bg-red-600/10")}
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden />
                        <span className="tabular font-black">{fmtCompact(post.commentCount)}</span>
                        <span className="hidden sm:inline font-bold">{post.commentCount === 1 ? "comment" : "comments"}</span>
                      </Button>
                    </div>

                    {openComments === post.id && (
                      <div className="border-t border-white/10 bg-[#080c16] p-4 sm:p-5">
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
            <div className="reveal overflow-hidden rounded-xl border border-white/15 bg-[#0b101d] shadow-lg">
              <p className="flex items-center gap-2 border-b border-white/15 bg-[#06080f] px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-white">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden />
                Creators to follow
              </p>
              <div className="divide-y divide-white/10">
                {suggested.map((s) => (
                  <SuggestedCreator key={s.id} creator={s} />
                ))}
              </div>
            </div>
          )}

          {/* Trending hashtags */}
          <div className="reveal overflow-hidden rounded-xl border border-white/15 bg-[#0b101d] shadow-lg">
            <p className="flex items-center gap-2 border-b border-white/15 bg-[#06080f] px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-white">
              <Hash className="h-3.5 w-3.5 text-red-500" aria-hidden />
              Trending hashtags
            </p>
            <div className="divide-y divide-white/10">
              {trending.map((t) => (
                <button
                  key={t.tag}
                  onClick={() => setActiveTag((cur) => (cur === t.tag ? null : t.tag))}
                  aria-pressed={activeTag === t.tag}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.05]",
                    activeTag === t.tag && "bg-red-600/15"
                  )}
                >
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-xs font-black",
                      activeTag === t.tag ? "text-red-400" : "text-white"
                    )}
                  >
                    #{t.tag}
                  </span>
                  <span className="tabular shrink-0 text-[10.5px] font-semibold text-slate-400">
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
          <div className="reveal rounded-xl border border-white/15 bg-[#0b101d] p-5 shadow-lg">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden />
              Community guidelines
            </p>
            <ul className="mt-3.5 space-y-3">
              {GUIDELINES.map((g) => (
                <li key={g.title}>
                  <p className="text-xs font-black text-white">{g.title}</p>
                  <p className="mt-0.5 text-[11.5px] font-medium leading-relaxed text-slate-300">{g.body}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Become a creator */}
          <div className="reveal rounded-xl border border-amber-500/30 bg-[#0b101d] p-5 shadow-lg">
            <p className="flex items-center gap-2 text-sm font-black text-amber-400">
              <Megaphone className="h-4 w-4" aria-hidden /> Become a creator
            </p>
            <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-slate-300">
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
    <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.05]">
      <button onClick={() => navigate({ name: "profile", username: creator.username })} aria-label={`${creator.name} profile`}>
        <Avatar className="h-10 w-10 border border-white/15">
          <AvatarImage src={creator.avatarUrl ?? undefined} alt={creator.name} />
          <AvatarFallback className="bg-red-600/30 text-sm font-black text-red-400">{creator.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </button>
      <div className="min-w-0 flex-1">
        <button
          onClick={() => navigate({ name: "profile", username: creator.username })}
          className="block max-w-full truncate text-xs font-black text-white transition-colors hover:text-red-400"
        >
          {creator.name}
        </button>
        <p className="tabular truncate text-[11px] font-semibold text-slate-400">
          {fmtCompact(creator.followerCount ?? 0)} followers
        </p>
      </div>
      {user && user.id !== creator.id && (
        <Button
          size="sm"
          variant={following ? "secondary" : "outline"}
          onClick={() => followMutation.mutate()}
          disabled={followMutation.isPending}
          className={cn(
            "h-8 gap-1.5 px-3 text-[11px] font-black rounded",
            following ? "bg-white/10 text-white border-white/20" : "bg-red-600 text-white border-transparent hover:bg-red-500"
          )}
        >
          {following ? <UserCheck className="h-3 w-3" aria-hidden /> : <UserPlus className="h-3 w-3" aria-hidden />}
          {following ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
}
