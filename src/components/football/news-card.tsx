"use client";

import Image from "next/image";
import { timeAgo, fmtCompact } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/types";
import type { NewsArticle } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { Eye, Clock, ChevronRight } from "lucide-react";

/**
 * FHB 3.0 — The Athletic / Sky Sports editorial cards.
 * Clean carbon surfaces, photo-forward, tight editorial typography.
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

  /* ── Compact thumbnail row ── */
  if (size === "compact") {
    return (
      <button
        onClick={go}
        className={cn(
          "group flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-white/[0.03]",
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative h-[60px] w-[90px] shrink-0 overflow-hidden bg-[#161619]">
          {article.coverUrl ? (
            <Image
              src={article.coverUrl}
              alt={article.title}
              fill
              sizes="90px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[9px] font-black uppercase tracking-widest text-white/20">
              FHB
            </span>
          )}
          {/* Category chip on image */}
          <span className="absolute left-0 top-0 px-1.5 py-0.5 bg-red-600 text-[7.5px] font-black uppercase tracking-widest text-white">
            {category.slice(0, 4)}
          </span>
        </div>
        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[12.5px] font-bold leading-snug text-white/80 transition-colors group-hover:text-white">
            {article.title}
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-white/30">
            <Clock className="h-2.5 w-2.5" /> {timeAgo(article.createdAt)}
            <span className="text-white/15">·</span>
            {fmtCompact(article.views)}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-white/15 transition-colors group-hover:text-white/40" />
      </button>
    );
  }

  /* ── Large hero overlay card ── */
  if (size === "lg") {
    return (
      <button
        onClick={go}
        className={cn(
          "group relative flex h-full w-full min-h-[300px] overflow-hidden border border-white/[0.07] text-left",
          className
        )}
        aria-label={article.title}
      >
        {/* Full bleed photo */}
        {article.coverUrl ? (
          <Image
            src={article.coverUrl}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover brightness-[0.65] transition-transform duration-700 group-hover:scale-[1.03]"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 carbon-panel" />
        )}
        <div className="photo-scrim absolute inset-0" />

        {/* Category badge */}
        <span className="absolute left-4 top-4 z-10 px-2 py-1 text-[9px] font-black uppercase tracking-widest bg-red-600 text-white">
          {category}
        </span>

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
          <h3 className="mb-2 font-black text-white leading-tight text-[20px] sm:text-[24px] drop-shadow-lg line-clamp-3">
            {article.title}
          </h3>
          <p className="mb-3 line-clamp-2 text-[12.5px] text-white/65 leading-relaxed hidden sm:block">
            {article.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-white/45">
            <span className="font-bold text-white/70">{article.author.name}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(article.createdAt)}</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {fmtCompact(article.views)}</span>
          </div>
        </div>
      </button>
    );
  }

  /* ── Standard card ── */
  return (
    <button
      onClick={go}
      className={cn(
        "group flex flex-col w-full overflow-hidden border border-white/[0.07] bg-[#0d0d10] text-left transition-colors hover:border-white/[0.14]",
        className
      )}
    >
      {/* Photo */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#161619]">
        {article.coverUrl ? (
          <Image
            src={article.coverUrl}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-600 group-hover:scale-[1.04]"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center carbon-panel">
            <span className="text-[11px] font-black uppercase tracking-widest text-white/15">FHB NEWS</span>
          </div>
        )}
        {/* Category tag */}
        <span className="absolute left-0 bottom-0 px-2 py-1 bg-red-600 text-[8.5px] font-black uppercase tracking-widest text-white">
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Red accent left border on title */}
        <h3 className="mb-2 pl-2.5 border-l-2 border-red-600/70 text-[14px] font-black leading-snug text-white/85 transition-colors group-hover:text-white line-clamp-2">
          {article.title}
        </h3>
        <p className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-3 text-[10.5px] text-white/30">
          <span className="truncate font-medium">{article.author.name} · {timeAgo(article.createdAt)}</span>
          <span className="shrink-0 flex items-center gap-1 ml-2">
            <Eye className="h-3 w-3" /> {fmtCompact(article.views)}
          </span>
        </p>
      </div>
    </button>
  );
}
