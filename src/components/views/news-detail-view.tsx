"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import type { NewsArticle } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { useAppStore } from "@/store/app-store";
import { CommentSection } from "@/components/football/comment-section";
import { LikeButton } from "@/components/football/like-button";
import { NewsCard } from "@/components/football/news-card";
import { AdSlot } from "@/components/football/ad-slot";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fmtCompact, formatKickoff } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarDays,
  ChevronLeft,
  Clock,
  Eye,
  Link2,
  MessageCircle,
  Newspaper,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   NewsDetailView — editorial article page.
   Narrow 760px measure: category chip, headline, standfirst, byline,
   16:9 cover, long-form body (markdown, drop-cap lead), engagement
   bar, comments, ad and a 2-col related grid.
   ════════════════════════════════════════════════════════════════ */

/** Category chip colours — mirrors the NewsCard chip language. */
const CATEGORY_STYLES: Record<string, string> = {
  BFL: "bg-primary text-primary-foreground",
  NATIONAL: "bg-fhb-red text-white",
  TRANSFER: "bg-fhb-gold text-black",
  INTERNATIONAL: "bg-elevated text-foreground ring-1 ring-inset ring-border",
  OPINION: "bg-secondary text-foreground",
};

/** Long-form typography — condensed crossheads, spaced paragraphs. */
const MD_COMPONENTS: Components = {
  h2: ({ node: _node, ...props }) => (
    <h2 className="label-cond mt-8 border-b border-border pb-2 text-[16px] text-foreground" {...props} />
  ),
  h3: ({ node: _node, ...props }) => (
    <h3 className="label-cond mt-6 text-[14px] text-foreground" {...props} />
  ),
  p: ({ node: _node, ...props }) => <p className="mt-4" {...props} />,
  strong: ({ node: _node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
  ul: ({ node: _node, ...props }) => (
    <ul className="mt-4 list-disc space-y-1.5 pl-5 marker:text-muted-foreground" {...props} />
  ),
  ol: ({ node: _node, ...props }) => (
    <ol className="mt-4 list-decimal space-y-1.5 pl-5 marker:text-muted-foreground" {...props} />
  ),
  blockquote: ({ node: _node, ...props }) => (
    <blockquote className="mt-5 border-l-2 border-primary/60 pl-4 italic text-muted-foreground" {...props} />
  ),
};

/** Lead paragraph — subtle editorial drop-cap. */
const LEAD_COMPONENTS: Components = {
  ...MD_COMPONENTS,
  p: ({ node: _node, ...props }) => (
    <p
      className="first-letter:float-left first-letter:mr-2 first-letter:mt-[5px] first-letter:text-[42px] first-letter:font-bold first-letter:leading-[0.8] first-letter:text-foreground"
      {...props}
    />
  ),
};

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

  // Same-category pad for the related grid (API returns up to 3).
  const { data: feedData } = useQuery<{ articles: NewsArticle[] }>({
    queryKey: ["news", "related", categoryKey],
    enabled: !!a,
    queryFn: async () => {
      const res = await fetch(`/api/news?category=${categoryKey}&limit=6`);
      return res.json().then((j) => j.data);
    },
  });

  if (isLoading || !a) {
    return (
      <div className="mx-auto w-full max-w-[760px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="mt-6 h-6 w-28 rounded-[4px]" />
        <Skeleton className="mt-3 h-10 w-11/12 rounded-md" />
        <Skeleton className="mt-2 h-10 w-3/4 rounded-md" />
        <Skeleton className="mt-6 h-[52px] w-full rounded-md" />
        <Skeleton className="mt-6 aspect-[16/9] w-full rounded-xl" />
        <div className="mt-7 space-y-3" aria-hidden>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full rounded-[4px]" />
          ))}
        </div>
      </div>
    );
  }

  const catLabel = CATEGORY_LABELS[a.category] ?? a.category;
  const catStyle = CATEGORY_STYLES[a.category] ?? CATEGORY_STYLES.INTERNATIONAL;
  const readMins = Math.max(1, Math.ceil(a.content.length / 800));
  const published = formatKickoff(a.createdAt);

  // Related — same category, self excluded, padded to a 2-col grid.
  const related = data?.related ?? [];
  const seen = new Set([a.id, ...related.map((r) => r.id)]);
  const relatedGrid = [...related, ...(feedData?.articles ?? []).filter((x) => !seen.has(x.id))].slice(0, 4);

  // Body — first block rendered separately when it is a plain paragraph
  // so the drop-cap can apply; the rest goes through the full renderer.
  const blocks = a.content.split(/\n{2,}/);
  const leadBlock = blocks[0] ?? "";
  const restBlocks = blocks.slice(1).join("\n\n");
  const leadIsParagraph =
    leadBlock.trim().length > 0 && !/^\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s)/.test(leadBlock);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/?news=${a.id}`);
      toast({ title: "Link copied", description: "Paste it anywhere to share this story." });
    } catch {
      toast({ title: "Copy failed", description: "Copy the address from your browser bar." });
    }
  };

  const scrollToComments = () => {
    document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 pb-16 pt-5 sm:px-6 lg:pt-7">
      {/* Back */}
      <button
        onClick={() => useAppStore.getState().back()}
        className="mb-4 flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      <article>
        {/* Article header */}
        <header>
          <span
            className={`inline-block rounded-[4px] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${catStyle}`}
          >
            {catLabel}
          </span>
          <h1 className="mt-3 text-[26px] font-bold leading-[1.12] tracking-[-0.015em] text-foreground sm:text-[30px]">
            {a.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{a.excerpt}</p>

          {/* Byline */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-3.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar className="h-9 w-9 border border-border/60">
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
            <div className="ml-auto flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" aria-hidden /> {published.date}
              </span>
              <span className="tabular flex items-center gap-1">
                <Eye className="h-3 w-3" aria-hidden /> {fmtCompact(a.views)} reads
              </span>
              <span className="tabular flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden /> {readMins} min read
              </span>
            </div>
          </div>
        </header>

        {/* Cover image */}
        <figure className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-elevated">
          {a.coverUrl ? (
            <Image
              src={a.coverUrl}
              alt={a.title}
              fill
              sizes="(max-width: 1024px) 100vw, 760px"
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <span className="stadium-panel flex h-full w-full items-center justify-center">
              <span className="label-cond text-sm tracking-[0.2em] text-muted-foreground">FHB News</span>
            </span>
          )}
        </figure>

        {/* Article body */}
        {leadIsParagraph ? (
          <>
            <div className="mt-7 text-[14.5px] leading-[1.75] text-foreground/90 [&>*:first-child]:mt-0">
              <Markdown components={LEAD_COMPONENTS}>{leadBlock}</Markdown>
            </div>
            {restBlocks.trim().length > 0 && (
              <div className="text-[14.5px] leading-[1.75] text-foreground/90">
                <Markdown components={MD_COMPONENTS}>{restBlocks}</Markdown>
              </div>
            )}
          </>
        ) : (
          <div className="mt-7 text-[14.5px] leading-[1.75] text-foreground/90 [&>*:first-child]:mt-0">
            <Markdown components={MD_COMPONENTS}>{a.content}</Markdown>
          </div>
        )}

        {/* Engagement bar */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-y border-border py-3">
          <LikeButton targetType="NEWS" targetId={a.id} initialCount={a.likeCount} variant="inline" />
          <button
            onClick={scrollToComments}
            className="flex h-8 items-center gap-1.5 rounded-md px-3 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            <span className="tabular">{fmtCompact(a.commentCount)}</span>
            <span className="hidden sm:inline">Comments</span>
          </button>
          <button
            onClick={share}
            className="ml-auto flex h-8 items-center gap-1.5 rounded-[6px] border border-border bg-card px-3.5 text-[11px] font-bold uppercase tracking-wider text-foreground/80 transition-colors hover:border-white/20 hover:text-foreground"
          >
            <Link2 className="h-3.5 w-3.5" aria-hidden /> Copy Link
          </button>
        </div>

        {/* Comments */}
        <section id="comments" className="mt-8 scroll-mt-24">
          <CommentSection targetType="NEWS" targetId={a.id} />
        </section>
      </article>

      {/* Ad after comments */}
      <div className="reveal mt-8">
        <AdSlot placement="IN_FEED" />
      </div>

      {/* Related stories */}
      {relatedGrid.length > 0 && (
        <section className="reveal mt-8" aria-label="Related stories">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-2.5">
            <Newspaper className="h-3.5 w-3.5 text-primary" aria-hidden />
            <h2 className="label-cond text-[13px] font-bold tracking-[0.08em] text-foreground/90">
              Related Stories
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {relatedGrid.map((r) => (
              <NewsCard key={r.id} article={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
