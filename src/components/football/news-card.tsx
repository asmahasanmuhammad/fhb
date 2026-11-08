"use client";

import Image from "next/image";
import { timeAgo, bnCompact } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/types";
import type { NewsArticle } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { Eye, Heart, MessageCircle } from "lucide-react";

export function NewsCard({
  article,
  size = "md",
  className,
}: {
  article: NewsArticle;
  size?: "md" | "lg" | "compact";
  className?: string;
}) {
  const navigate = useAppStore((s) => s.navigate);
  const category = CATEGORY_LABELS[article.category] ?? article.category;

  if (size === "compact") {
    return (
      <button
        onClick={() => navigate({ name: "news-detail", id: article.id })}
        className={cn(
          "group flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-accent/40",
          className
        )}
      >
        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md border border-border">
          {article.coverUrl && (
            <Image
              src={article.coverUrl}
              alt={article.title}
              fill
              sizes="80px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs font-semibold leading-snug transition-colors group-hover:text-primary sm:text-[13px]">
            {article.title}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="font-semibold text-primary/80">{category}</span>
            <span aria-hidden>·</span>
            <span>{timeAgo(article.createdAt)}</span>
          </p>
        </div>
      </button>
    );
  }

  const large = size === "lg";
  return (
    <button
      onClick={() => navigate({ name: "news-detail", id: article.id })}
      className={cn(
        "card-lift group overflow-hidden rounded-lg border border-border bg-card text-left",
        large ? "relative flex h-full min-h-[280px] flex-col" : "flex flex-col",
        className
      )}
    >
      <div className={cn("relative w-full overflow-hidden", large ? "absolute inset-0" : "aspect-[16/10]")}>
        {article.coverUrl && (
          <Image
            src={article.coverUrl}
            alt={article.title}
            fill
            sizes={large ? "100vw" : "(max-width: 768px) 100vw, 33vw"}
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-[1.04]",
              large && "brightness-[0.55]"
            )}
            unoptimized
          />
        )}
        {/* Category chip */}
        <span className="absolute left-2.5 top-2.5 rounded-sm bg-black/65 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
          {category}
        </span>
        {large && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-16">
            <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-white drop-shadow sm:text-xl">
              {article.title}
            </h3>
            <p className="mb-2 line-clamp-2 text-xs text-white/80 sm:text-sm">{article.excerpt}</p>
            <div className="flex items-center gap-2 text-[10px] text-white/60">
              <span className="font-semibold text-white/85">{article.author.name}</span>
              <span aria-hidden>·</span>
              <span>{timeAgo(article.createdAt)}</span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" aria-hidden /> {bnCompact(article.views)}
              </span>
            </div>
          </div>
        )}
      </div>
      {!large && (
        <div className="flex flex-1 flex-col p-3">
          <h3 className="line-clamp-2 text-[13px] font-bold leading-snug transition-colors group-hover:text-primary sm:text-sm">
            {article.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 flex-1 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
            {article.excerpt}
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[10px] text-muted-foreground">
            <span className="min-w-0 truncate">
              {article.author.name} · {timeAgo(article.createdAt)}
            </span>
            <span className="flex shrink-0 items-center gap-2.5">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" aria-hidden /> {bnCompact(article.views)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" aria-hidden /> {bnCompact(article.likeCount)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" aria-hidden /> {bnCompact(article.commentCount)}
              </span>
            </span>
          </div>
        </div>
      )}
    </button>
  );
}
