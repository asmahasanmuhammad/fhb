"use client";

import Image from "next/image";
import { timeAgo, fmtCompact } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/types";
import type { NewsArticle } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { Eye, Clock } from "lucide-react";

/**
 * Editorial news cards — photo-forward magazine layouts.
 * - lg: lead-story overlay card (hero image, scrim, white headline)
 * - md: standard photo card with meta footer
 * - compact: thumbnail row item
 */
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
  const go = () => navigate({ name: "news-detail", id: article.id });

  if (size === "compact") {
    return (
      <button
        onClick={go}
        className={cn(
          "group flex w-full items-center gap-3.5 rounded-lg p-2.5 text-left transition-colors hover:bg-white/[0.03]",
          className
        )}
      >
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md">
          {article.coverUrl ? (
            <Image
              src={article.coverUrl}
              alt={article.title}
              fill
              sizes="96px"
              className="img-zoom object-cover"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-muted font-display text-[10px] font-bold text-muted-foreground">
              FHB
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.06em] text-primary">
            {category}
          </p>
          <p className="line-clamp-2 text-[13px] font-semibold leading-snug transition-colors group-hover:text-primary">
            {article.title}
          </p>
          <p className="mt-1 text-[10.5px] text-muted-foreground">{timeAgo(article.createdAt)}</p>
        </div>
      </button>
    );
  }

  const large = size === "lg";
  return (
    <button
      onClick={go}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-primary/25",
        large ? "flex h-full min-h-[340px] flex-col" : "flex flex-col",
        className
      )}
    >
      <div className={cn("relative w-full overflow-hidden", large ? "absolute inset-0" : "aspect-[16/10]")}>
        {article.coverUrl ? (
          <Image
            src={article.coverUrl}
            alt={article.title}
            fill
            sizes={large ? "100vw" : "(max-width: 768px) 100vw, 33vw"}
            className={cn("img-zoom object-cover", large && "brightness-[0.72]")}
            unoptimized
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-muted font-display text-sm font-bold text-muted-foreground">
            FHB NEWS
          </span>
        )}
        {large && <span className="photo-scrim absolute inset-0" aria-hidden />}

        {/* Category chip */}
        <span
          className={cn(
            "absolute left-3 top-3 rounded px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.08em] backdrop-blur-md",
            large ? "bg-black/55 text-white" : "bg-black/55 text-white"
          )}
        >
          {category}
        </span>

        {large ? (
          <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">
            <h3 className="mb-2 line-clamp-2 font-display text-xl font-bold leading-snug text-white drop-shadow-md sm:text-[1.6rem] sm:leading-[1.2]">
              {article.title}
            </h3>
            <p className="mb-3 line-clamp-2 max-w-2xl text-[13px] leading-relaxed text-white/75 sm:text-sm">
              {article.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/65">
              <span className="flex items-center gap-1.5 font-semibold text-white/90">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-[9px] font-bold">
                  {article.author.name.slice(0, 1)}
                </span>
                {article.author.name}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden /> {timeAgo(article.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" aria-hidden /> {fmtCompact(article.views)}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {!large && (
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-[14.5px] font-bold leading-snug transition-colors group-hover:text-primary">
            {article.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
          <div className="mt-3.5 flex items-center justify-between border-t border-border/60 pt-3 text-[10.5px] text-muted-foreground">
            <span className="min-w-0 truncate font-medium">
              {article.author.name} · {timeAgo(article.createdAt)}
            </span>
            <span className="flex shrink-0 items-center gap-2.5">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" aria-hidden /> {fmtCompact(article.views)}
              </span>
            </span>
          </div>
        </div>
      )}
    </button>
  );
}
