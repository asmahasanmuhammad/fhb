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
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Eye, Share2 } from "lucide-react";
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
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  const a = data.article;
  const related = data.related ?? [];

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/?news=${a.id}`);
      toast({ title: "লিংক কপি হয়েছে!", description: "বন্ধুদের সাথে শেয়ার করুন 📢" });
    } catch {
      toast({ title: "শেয়ার ব্যর্থ", description: "ম্যানুয়ালি কপি করুন" });
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-4 sm:px-6">
      <button onClick={back} className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary">
        ← ফিরে যান
      </button>

      <article>
        <Badge className="mb-3 bg-fhb-red text-[10px] font-bold text-white hover:bg-fhb-red">
          {CATEGORY_LABELS[a.category] ?? a.category}
        </Badge>
        <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">{a.title}</h1>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y py-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={a.author.avatarUrl ?? undefined} alt={a.author.name} />
              <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">{a.author.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-bold">{a.author.name}</p>
              <p className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" aria-hidden /> {timeAgo(a.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" aria-hidden /> {bnCompact(a.views)} পড়া হয়েছে
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={share}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden /> শেয়ার
          </button>
        </div>

        {a.coverUrl && (
          <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-xl border">
            <Image src={a.coverUrl} alt={a.title} fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" priority unoptimized />
          </div>
        )}

        <p className="mt-5 border-l-4 border-primary/60 pl-3 text-sm font-medium leading-relaxed text-foreground/90">{a.excerpt}</p>

        <div className="prose-fhb mt-6 space-y-4 text-[15px] leading-[1.9] text-foreground/90">
          <Markdown
            components={{
              h2: (props) => <h2 className="mt-7 font-display text-lg font-bold tracking-wide text-foreground sm:text-xl" {...props} />,
              h3: (props) => <h3 className="mt-5 font-display text-base font-bold text-foreground" {...props} />,
              p: (props) => <p className="text-justify sm:text-left" {...props} />,
              strong: (props) => <strong className="font-bold text-foreground" {...props} />,
              ul: (props) => <ul className="list-inside list-disc space-y-1.5 pl-1" {...props} />,
              ol: (props) => <ol className="list-inside list-decimal space-y-1.5 pl-1" {...props} />,
              blockquote: (props) => (
                <blockquote className="rounded-r-xl border-l-4 border-primary bg-primary/5 px-4 py-3 text-sm italic text-foreground/80" {...props} />
              ),
            }}
          >
            {a.content}
          </Markdown>
        </div>

        {/* Engagement */}
        <div className="mt-7 flex items-center gap-2.5 border-t pt-5">
          <LikeButton targetType="NEWS" targetId={a.id} initialCount={a.likeCount} />
          <span className="text-xs text-muted-foreground">
            {bnCompact(a.commentCount)} কমেন্ট
          </span>
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
            <h2 className="mb-4 font-display text-lg font-bold tracking-wide">আরও পড়ুন</h2>
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
