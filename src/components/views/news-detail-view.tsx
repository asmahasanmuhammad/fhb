"use client";

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
import { timeAgo, bnCompact } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { CalendarDays, Eye, Share2, ArrowLeft, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function NewsDetailView({ articleId }: { articleId: string }) {
  const back = useAppStore((s) => s.back);
  const { toast } = useToast();

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
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  const a = data.article;
  const related = data.related ?? [];
  const category = CATEGORY_LABELS[a.category] ?? a.category;

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/?news=${a.id}`);
      toast({ title: "লিংক কপি হয়েছে", description: "বন্ধুদের সাথে শেয়ার করুন।" });
    } catch {
      toast({ title: "শেয়ার ব্যর্থ", description: "ম্যানুয়ালি কপি করুন" });
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-5 sm:px-6">
      <button
        onClick={back}
        className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        aria-label="ফিরে যান"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </button>

      <article>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-fhb-red/15 px-2.5 py-1 text-[11px] font-bold text-fhb-red">
          <span className="h-1.5 w-1.5 rounded-[2px] bg-fhb-red" aria-hidden />
          {category}
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold leading-[1.25] tracking-wide sm:text-[2rem]">
          {a.title}
        </h1>

        {/* Byline panel */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={a.author.avatarUrl ?? undefined} alt={a.author.name} />
              <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
                {a.author.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-bold text-foreground">{a.author.name}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" aria-hidden /> {timeAgo(a.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" aria-hidden /> {bnCompact(a.views)} পড়া হয়েছে
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden /> ~{Math.max(1, Math.ceil(a.content.length / 800))} মিনিট
                </span>
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={share}
            className="gap-1.5 rounded-md"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden /> শেয়ার
          </Button>
        </div>

        {a.coverUrl && (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-lg border border-border">
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
        <p className="mt-6 border-l-[3px] border-primary pl-4 text-base font-medium leading-relaxed text-foreground/90">
          {a.excerpt}
        </p>

        {/* Body */}
        <div className="prose-fhb mt-6 space-y-4 text-[15px] leading-[1.9] text-foreground/90">
          <Markdown
            components={{
              h2: (props) => <h2 className="mt-7 font-display text-lg font-bold tracking-wide text-foreground sm:text-xl" {...props} />,
              h3: (props) => <h3 className="mt-5 font-display text-base font-bold text-foreground" {...props} />,
              p: (props) => <p className="sm:text-left" {...props} />,
              strong: (props) => <strong className="font-bold text-foreground" {...props} />,
              ul: (props) => <ul className="list-inside list-disc space-y-1.5 pl-1" {...props} />,
              ol: (props) => <ol className="list-inside list-decimal space-y-1.5 pl-1" {...props} />,
              blockquote: (props) => (
                <blockquote className="rounded-r-lg border-l-[3px] border-primary bg-primary/5 px-4 py-3 text-sm italic text-foreground/80" {...props} />
              ),
            }}
          >
            {a.content}
          </Markdown>
        </div>

        {/* Engagement */}
        <div className="mt-8 flex items-center gap-3 border-t border-border pt-5">
          <LikeButton targetType="NEWS" targetId={a.id} initialCount={a.likeCount} />
          <span className="tabular text-xs text-muted-foreground">{bnCompact(a.commentCount)} কমেন্ট</span>
        </div>

        <div className="mt-6">
          <AdSlot placement="IN_FEED" />
        </div>

        {/* Comments */}
        <div className="mt-8">
          <CommentSection targetType="NEWS" targetId={a.id} />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-10" aria-label="সম্পর্কিত নিউজ">
            <h2 className="mb-4 flex items-center gap-2.5 border-l-[3px] border-primary pl-3 font-display text-sm font-bold tracking-wide text-foreground">
              আরও পড়ুন
            </h2>
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
