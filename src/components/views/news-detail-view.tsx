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
import { useAppStore } from "@/store/app-store";
import { timeAgo, fmtCompact } from "@/lib/format";
import { CalendarDays, Eye, Share2, ArrowLeft, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function NewsDetailView({ articleId }: { articleId: string }) {
  const back = useAppStore((s) => s.back);
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);

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

  if (isLoading || !data?.article) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 pt-6">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  const a = data.article;
  const related = data.related ?? [];
  const category = CATEGORY_LABELS[a.category] ?? a.category;

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/?news=${a.id}`);
      toast({ title: "Link copied", description: "Share it with your friends." });
    } catch {
      toast({ title: "Share failed", description: "Copy manually" });
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-14 pt-5 sm:px-6">
      {/* Reading progress */}
      <div className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent" aria-hidden>
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <button
        onClick={back}
        className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </button>

      <article>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-fhb-red/15 px-3 py-1 text-[11px] font-bold text-fhb-red">
          <span className="h-1.5 w-1.5 rounded-[2px] bg-fhb-red" aria-hidden />
          {category}
        </span>
        <h1 className="display-hero mt-4 text-[1.65rem] text-foreground sm:text-[2.15rem]">
          {a.title}
        </h1>

        {/* Byline panel */}
        <div className="edge-lit mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border/60">
              <AvatarImage src={a.author.avatarUrl ?? undefined} alt={a.author.name} />
              <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
                {a.author.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[13px] font-bold text-foreground">{a.author.name}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" aria-hidden /> {timeAgo(a.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" aria-hidden /> {fmtCompact(a.views)} reads
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden /> ~{Math.max(1, Math.ceil(a.content.length / 800))} min read
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={share}
            className="flex h-9 items-center gap-1.5 rounded-full border border-border px-4 text-xs font-bold text-muted-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden /> Share
          </button>
        </div>

        {a.coverUrl && (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl border border-border/80">
            <Image
              src={a.coverUrl}
              alt={a.title}
              fill
              sizes="(max-width:768px) 100vw, 768px"
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        )}

        {/* Lead */}
        <p className="mt-7 border-l-[3px] border-primary pl-5 text-base font-medium leading-relaxed text-foreground/90">
          {a.excerpt}
        </p>

        {/* Body */}
        <div className="prose-fhb mt-6 space-y-4 text-[15px] leading-[1.9] text-foreground/90">
          <Markdown
            components={{
              h2: (props) => <h2 className="font-display-bn mt-8 text-lg font-bold text-foreground sm:text-xl" {...props} />,
              h3: (props) => <h3 className="font-display-bn mt-6 text-base font-bold text-foreground" {...props} />,
              p: (props) => <p className="sm:text-left" {...props} />,
              strong: (props) => <strong className="font-bold text-foreground" {...props} />,
              ul: (props) => <ul className="list-inside list-disc space-y-1.5 pl-1" {...props} />,
              ol: (props) => <ol className="list-inside list-decimal space-y-1.5 pl-1" {...props} />,
              blockquote: (props) => (
                <blockquote className="rounded-r-xl border-l-[3px] border-primary bg-primary/5 px-4 py-3 text-sm italic text-foreground/80" {...props} />
              ),
            }}
          >
            {a.content}
          </Markdown>
        </div>

        {/* Engagement */}
        <div className="mt-9 flex items-center gap-3.5 border-t border-border pt-6">
          <LikeButton targetType="NEWS" targetId={a.id} initialCount={a.likeCount} />
          <span className="tabular text-xs text-muted-foreground">{fmtCompact(a.commentCount)} comments</span>
        </div>

        <div className="mt-7">
          <AdSlot placement="IN_FEED" />
        </div>

        {/* Comments */}
        <div className="mt-9">
          <CommentSection targetType="NEWS" targetId={a.id} />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-12" aria-label="Related news">
            <div className="mb-5 flex items-center gap-3">
              <h2 className="font-display-bn text-lg font-bold text-foreground">Read More</h2>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <NewsCard key={r.id} article={r} />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
