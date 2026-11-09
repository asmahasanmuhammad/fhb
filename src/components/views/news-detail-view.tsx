"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Markdown from "react-markdown";
import Image from "next/image";
import type { NewsArticle } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { CommentSection } from "@/components/football/comment-section";
import { LikeButton } from "@/components/football/like-button";
import { NewsCard } from "@/components/football/news-card";
import { AdSlot } from "@/components/football/ad-slot";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { fmtCompact, formatKickoff } from "@/lib/format";
import { CalendarDays, Eye, Share2, ArrowLeft, Clock, ChevronRight, Newspaper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function NewsDetailView({ articleId }: { articleId: string }) {
  const back = useAppStore((s) => s.back);
  const navigate = useAppStore((s) => s.navigate);
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  useReveal();

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { data, isLoading } = useQuery<{ article: NewsArticle; related: NewsArticle[] }>({
    queryKey: ["news", articleId],
    queryFn: async () => {
      const res = await fetch(`/api/news/${articleId}`);
      return res.json().then((j) => j.data);
    },
  });

  // Right-rail mix — latest from the shared /api/news feed (pads the related list)
  const { data: feedData } = useQuery<{ articles: NewsArticle[] }>({
    queryKey: ["news", "rail-feed"],
    queryFn: async () => {
      const res = await fetch("/api/news?limit=10");
      return res.json().then((j) => j.data);
    },
  });

  if (isLoading || !data?.article) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center gap-2.5" aria-hidden>
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="mt-4 aspect-[16/9] w-full rounded-xl" />
        <div className="mx-auto mt-6 max-w-[720px] space-y-3">
          <Skeleton className="h-9 w-11/12" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  const a = data.article;
  const related = data.related ?? [];
  const category = CATEGORY_LABELS[a.category] ?? a.category;
  const readMins = Math.max(1, Math.ceil(a.content.length / 800));
  const published = formatKickoff(a.createdAt);

  // "More from FHB" — same-category related first, padded with the latest feed
  const seen = new Set([a.id, ...related.map((r) => r.id)]);
  const rail = [...related, ...(feedData?.articles ?? []).filter((x) => !seen.has(x.id))].slice(0, 6);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/?news=${a.id}`);
      toast({ title: "Link copied", description: "Share it with your friends." });
    } catch {
      toast({ title: "Share failed", description: "Copy manually" });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      {/* Reading progress */}
      <div className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent" aria-hidden>
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="reveal mb-4 flex items-center gap-2">
        <button
          onClick={back}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </button>
        <button
          onClick={() => navigate({ name: "news" })}
          className="text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          News
        </button>
        <ChevronRight className="h-3 w-3 text-muted-foreground/50" aria-hidden />
        <span className="text-xs font-semibold text-foreground">{category}</span>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <figure className="reveal relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/80">
        {a.coverUrl ? (
          <Image
            src={a.coverUrl}
            alt={a.title}
            fill
            sizes="(max-width: 1320px) 100vw, 1320px"
            className="object-cover"
            priority
            unoptimized
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-muted font-display text-sm font-bold text-muted-foreground">
            FHB NEWS
          </span>
        )}
        <span className="absolute left-3 top-3 rounded bg-black/55 px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-md">
          {category}
        </span>
      </figure>

      {/* ── Article + right rail ───────────────────────────────── */}
      <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:gap-6">
        <article className="lg:col-span-8">
          <div className="mx-auto w-full max-w-[720px]">
            <header>
              <h1 className="display-hero text-[1.8rem] text-foreground sm:text-[2.35rem]">
                {a.title}
              </h1>
              <p className="mt-4 border-l-2 border-primary pl-4 text-[15px] leading-7 text-muted-foreground">
                {a.excerpt}
              </p>

              {/* Byline row */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border/60">
                    <AvatarImage src={a.author.avatarUrl ?? undefined} alt={a.author.name} />
                    <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
                      {a.author.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-[13px] font-bold text-foreground">{a.author.name}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="font-medium">@{a.author.username}</span>
                      <span aria-hidden className="text-muted-foreground/40">·</span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" aria-hidden /> {published.date}
                      </span>
                      <span aria-hidden className="text-muted-foreground/40">·</span>
                      <span className="tabular flex items-center gap-1">
                        <Eye className="h-3 w-3" aria-hidden /> {fmtCompact(a.views)} reads
                      </span>
                      <span aria-hidden className="text-muted-foreground/40">·</span>
                      <span className="tabular flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden /> {readMins} min read
                      </span>
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={share} className="gap-1.5">
                  <Share2 className="h-3.5 w-3.5" aria-hidden /> Share
                </Button>
              </div>
            </header>

            {/* Body */}
            <div className="mt-7 text-[15px] leading-7 text-foreground/90">
              <Markdown
                components={{
                  h2: (props) => (
                    <h2 className="font-display mt-8 text-xl font-bold tracking-[-0.01em] text-foreground first:mt-0" {...props} />
                  ),
                  h3: (props) => (
                    <h3 className="font-display mt-6 text-base font-bold text-foreground first:mt-0" {...props} />
                  ),
                  p: (props) => <p className="mt-4 first:mt-0" {...props} />,
                  strong: (props) => <strong className="font-bold text-foreground" {...props} />,
                  ul: (props) => <ul className="mt-4 list-disc space-y-1.5 pl-5 first:mt-0" {...props} />,
                  ol: (props) => <ol className="mt-4 list-decimal space-y-1.5 pl-5 first:mt-0" {...props} />,
                  blockquote: (props) => (
                    <blockquote className="mt-4 rounded-r-lg border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm italic text-foreground/80 first:mt-0" {...props} />
                  ),
                }}
              >
                {a.content}
              </Markdown>
            </div>

            {/* Engagement panel */}
            <div className="edge-lit mt-9 overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/30 px-5 py-3.5">
                <LikeButton targetType="NEWS" targetId={a.id} initialCount={a.likeCount} />
                <span className="tabular text-xs font-semibold text-muted-foreground">
                  {fmtCompact(a.commentCount)} comments
                </span>
              </div>
              <div className="px-5 py-5">
                <CommentSection targetType="NEWS" targetId={a.id} />
              </div>
            </div>
          </div>
        </article>

        {/* ── Right rail — ad + more from FHB ───────────────────── */}
        <aside className="lg:col-span-4" aria-label="More from FHB">
          <div className="space-y-4 lg:sticky lg:top-[76px]">
            <AdSlot placement="SIDEBAR" />
            {rail.length > 0 && (
              <div className="edge-lit overflow-hidden rounded-xl border border-border bg-card">
                <p className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-foreground">
                  <Newspaper className="h-3.5 w-3.5 text-primary" aria-hidden />
                  More from FHB
                </p>
                <div className="divide-y divide-border/60">
                  {rail.map((r) => (
                    <NewsCard key={r.id} article={r} size="compact" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
