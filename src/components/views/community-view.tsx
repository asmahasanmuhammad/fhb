"use client";

import { Fragment, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Post } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { LikeButton } from "@/components/football/like-button";
import { CommentSection } from "@/components/football/comment-section";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader, SectionHeader } from "@/components/football/section-header";
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
  LogIn,
  MessageCircle,
  PenLine,
  ShieldCheck,
  Users,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   CommunityView — the terraces.
   Composer (or sign-in prompt) + post feed with inline comments,
   IN_FEED ad every ~3 posts. Rail: trending posts, sidebar ad and
   the community guidelines mini card.
   ════════════════════════════════════════════════════════════════ */

const COMPOSER_TAGS = ["Abahani", "Mohammedan", "Bashundhara", "National Team"];

const GUIDELINES = [
  { title: "Keep it about football", body: "Matchday banter and rivalry are welcome — personal attacks are not." },
  { title: "No spam or promotion", body: "Unrelated links and advertising are removed by the moderation desk." },
  { title: "Flag, don't fight", body: "Report posts that break the rules and moderators will review them." },
];

/* ────────────────────────────────────────────────────────────────
   Post card — author row, body, like/comment footer, expandable
   comment section (same LikeButton + CommentSection contracts).
   ──────────────────────────────────────────────────────────────── */
function PostCard({
  post,
  commentsOpen,
  onToggleComments,
}: {
  post: Post;
  commentsOpen: boolean;
  onToggleComments: () => void;
}) {
  const navigate = useAppStore((s) => s.navigate);

  return (
    <article
      className="reveal overflow-hidden rounded-lg border border-border bg-card"
      aria-label={`Post by ${post.author.name}`}
    >
      <div className="p-4">
        {/* Author row */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate({ name: "profile", username: post.author.username })}
            aria-label={`${post.author.name} — view profile`}
            className="shrink-0"
          >
            <Avatar className="h-10 w-10 border border-border/60">
              <AvatarImage src={post.author.avatarUrl ?? undefined} alt={post.author.name} />
              <AvatarFallback className="bg-primary/15 text-[13px] font-bold text-primary">
                {post.author.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </button>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-tight">
              <button
                onClick={() => navigate({ name: "profile", username: post.author.username })}
                className="truncate text-[13.5px] font-bold text-foreground transition-colors hover:text-primary"
              >
                {post.author.name}
              </button>
              {post.author.isPremium && (
                <Crown className="h-3.5 w-3.5 shrink-0 text-fhb-gold" aria-label="Premium member" />
              )}
              {post.author.role === "CREATOR" && (
                <span className="label-cond rounded-[4px] bg-fhb-red/15 px-1.5 py-[2px] text-[9px] font-bold tracking-[0.06em] text-fhb-red">
                  Creator
                </span>
              )}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              @{post.author.username}
              <span className="mx-1.5" aria-hidden>
                ·
              </span>
              {timeAgo(post.createdAt)}
            </p>
          </div>
          {post.matchTag && (
            <span className="label-cond hidden shrink-0 items-center gap-1 rounded-[4px] border border-primary/25 bg-primary/10 px-2 py-[3px] text-[10px] font-bold tracking-[0.04em] text-primary sm:inline-flex">
              <Hash className="h-3 w-3" aria-hidden /> {post.matchTag}
            </span>
          )}
        </div>

        {/* Body */}
        <p className="mt-3 whitespace-pre-line break-words text-[13.5px] leading-relaxed text-foreground/90">
          {post.content}
        </p>
        {post.matchTag && (
          <span className="mt-3 inline-flex items-center gap-1 rounded-[4px] border border-primary/25 bg-primary/10 px-2 py-[3px] text-[10.5px] font-bold text-primary sm:hidden">
            <Hash className="h-3 w-3" aria-hidden /> {post.matchTag}
          </span>
        )}
      </div>

      {/* Engagement row */}
      <div className="flex items-center gap-1 border-t border-border px-2 py-1.5">
        <LikeButton targetType="POST" targetId={post.id} initialCount={post.likeCount} variant="inline" />
        <button
          onClick={onToggleComments}
          aria-expanded={commentsOpen}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] font-medium transition-colors hover:text-foreground",
            commentsOpen ? "text-primary" : "text-muted-foreground"
          )}
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          <span className="tabular">{fmtCompact(post.commentCount)}</span>
          <span className="hidden sm:inline">{post.commentCount === 1 ? "comment" : "comments"}</span>
        </button>
      </div>

      {/* Comments */}
      {commentsOpen && (
        <div className="border-t border-border bg-background/40 p-4">
          <CommentSection targetType="POST" targetId={post.id} />
        </div>
      )}
    </article>
  );
}

export function CommunityView() {
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const { toast } = useToast();
  useReveal();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [matchTag, setMatchTag] = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ posts: Post[] }>({
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
      toast({ title: "Posted", description: "Your take is now live on the terraces." });
    },
    onError: (e: Error) => toast({ title: "Post failed", description: e.message, variant: "destructive" }),
  });

  const posts = data?.posts ?? [];
  const trending = [...posts].sort((a, b) => b.likeCount - a.likeCount).slice(0, 5);

  /* ── Right rail (xl+) ── */
  const rail = (
    <>
      {trending.length > 0 && (
        <RailCard title="Trending on FHB">
          <div className="divide-y divide-border/40">
            {trending.map((p) => (
              <div key={p.id} className="px-4 py-3">
                <p className="line-clamp-2 text-[12.5px] font-medium leading-snug text-foreground/90">
                  {p.content}
                </p>
                <p className="mt-1.5 flex items-center gap-2 text-[10.5px] text-muted-foreground">
                  <span className="flex shrink-0 items-center gap-1 font-bold text-primary">
                    <Heart className="h-3 w-3 fill-primary" aria-hidden /> {fmtCompact(p.likeCount)}
                  </span>
                  <span className="truncate">@{p.author.username}</span>
                  <span className="shrink-0">{timeAgo(p.createdAt)}</span>
                </p>
              </div>
            ))}
          </div>
        </RailCard>
      )}

      <AdSlot placement="SIDEBAR" />

      <RailCard title="Community Guidelines">
        <ul className="space-y-3 px-4 py-4">
          {GUIDELINES.map((g) => (
            <li key={g.title}>
              <p className="text-[12px] font-bold text-foreground/90">{g.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{g.body}</p>
            </li>
          ))}
        </ul>
        <p className="flex items-center gap-1.5 border-t border-border bg-elevated/40 px-4 py-2.5 text-[10px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3 shrink-0 text-primary" aria-hidden />
          The moderation desk reviews every report.
        </p>
      </RailCard>
    </>
  );

  return (
    <PageLayout rail={rail}>
      <PageHeader
        title="Fan Community"
        kicker="the terraces"
        icon={<Users className="h-3.5 w-3.5" aria-hidden />}
        subtitle="Matchday takes, reactions and fan talk from the stands."
      >
        <span className="label-cond hidden shrink-0 items-center gap-1.5 rounded-[6px] border border-border bg-card px-2.5 py-1.5 text-[11px] font-bold tracking-[0.06em] text-muted-foreground sm:flex">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          {fmtNum(posts.length)} posts
        </span>
      </PageHeader>

      {/* Composer / sign-in prompt */}
      {user ? (
        <div className="reveal rounded-lg border border-border bg-card p-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 shrink-0 border border-border/60">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-primary/15 text-[13px] font-bold text-primary">
                {user.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <label htmlFor="composer" className="sr-only">
                Write a post
              </label>
              <textarea
                id="composer"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`${user.name}, what is your take on today's football?`}
                rows={3}
                maxLength={600}
                className="w-full resize-none rounded-[6px] border border-border bg-background p-3 text-[13.5px] leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {COMPOSER_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setMatchTag((t) => (t === tag ? null : tag))}
                      aria-pressed={matchTag === tag}
                      className={cn(
                        "h-7 shrink-0 rounded-full border px-3 text-[11px] font-semibold transition-colors",
                        matchTag === tag
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border bg-card text-foreground/75 hover:border-white/20"
                      )}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular shrink-0 text-[10.5px] text-muted-foreground">
                    {fmtNum(content.length)}/600
                  </span>
                  <button
                    onClick={() => createPost.mutate()}
                    disabled={!content.trim() || createPost.isPending}
                    className="flex h-9 shrink-0 items-center gap-1.5 rounded-[6px] bg-primary px-5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
                  >
                    <PenLine className="h-3.5 w-3.5" aria-hidden />
                    {createPost.isPending ? "Posting…" : "Post"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="reveal flex flex-wrap items-center gap-3.5 rounded-lg border border-border bg-card p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-primary/12 text-primary">
            <LogIn className="h-4.5 w-4.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-bold text-foreground">Join the conversation</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
              Log in to post your take, like matchday reactions and reply to other fans.
            </p>
          </div>
          <button
            onClick={() => navigate({ name: "auth" })}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-[6px] bg-primary px-4 text-[11px] font-bold uppercase tracking-wider text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97]"
          >
            <LogIn className="h-3.5 w-3.5" aria-hidden /> Log In
          </button>
        </div>
      )}

      {/* Feed */}
      <section className="mt-8" aria-label="Fan posts">
        <SectionHeader
          title="Latest Posts"
          kicker="the feed"
          icon={<MessageCircle className="h-3.5 w-3.5" aria-hidden />}
        />

        {isLoading ? (
          <div className="space-y-4" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-32 rounded-[4px]" />
                    <Skeleton className="h-3 w-24 rounded-[4px]" />
                  </div>
                </div>
                <Skeleton className="mt-3.5 h-3.5 w-full rounded-[4px]" />
                <Skeleton className="mt-2 h-3.5 w-2/3 rounded-[4px]" />
                <Skeleton className="mt-4 h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card px-4 py-12 text-center">
            <p className="text-sm font-semibold text-foreground">The stands are quiet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No posts yet — kick off the first matchday discussion from the composer above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <Fragment key={post.id}>
                <PostCard
                  post={post}
                  commentsOpen={openComments === post.id}
                  onToggleComments={() => setOpenComments(openComments === post.id ? null : post.id)}
                />
                {(i + 1) % 3 === 0 && i !== posts.length - 1 && (
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
