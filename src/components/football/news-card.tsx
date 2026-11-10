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
          "group flex w-full items-center gap-3 p-3 text-left transition-all hover:bg-white/10 rounded border border-transparent hover:border-white/10",
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative h-[64px] w-[96px] shrink-0 overflow-hidden rounded bg-[#10172a]">
          {article.coverUrl ? (
            <Image
              src={article.coverUrl}
              alt={article.title}
              fill
              sizes="96px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[10px] font-black uppercase tracking-widest text-white/40">
              FHB
            </span>
          )}
          {/* Category chip on image */}
          <span className="absolute left-0 top-0 px-2 py-0.5 bg-[#ff1e46] text-[8px] font-black uppercase tracking-widest text-white shadow-sm">
            {category.slice(0, 5)}
          </span>
        </div>
        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[13px] font-extrabold leading-snug text-white transition-colors group-hover:text-[#00e5ff]">
            {article.title}
          </p>
          <p className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold text-[#cbd5e1]">
            <Clock className="h-3 w-3 text-[#ff1e46]" /> {timeAgo(article.createdAt)}
            <span className="text-white/30">·</span>
            <Eye className="h-3 w-3 text-[#00e5ff]" /> {fmtCompact(article.views)}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-white/40 transition-colors group-hover:text-white" />
      </button>
    );
  }

  /* ── Large hero overlay card ── */
  if (size === "lg") {
    return (
      <button
        onClick={go}
        className={cn(
          "group relative flex h-full w-full min-h-[340px] overflow-hidden rounded-md border border-white/15 text-left shadow-2xl",
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
            className="object-cover brightness-[0.7] transition-transform duration-700 group-hover:scale-[1.03]"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 carbon-panel" />
        )}
        <div className="photo-scrim absolute inset-0" />

        {/* Category badge */}
        <span className="absolute left-4 top-4 z-10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-[#ff1e46] text-white shadow-[0_0_10px_rgba(255,30,70,0.5)]">
          {category}
        </span>

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <h3 className="mb-2 font-black text-white leading-tight text-[22px] sm:text-[26px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-3">
            {article.title}
          </h3>
          <p className="mb-3 line-clamp-2 text-[13.5px] font-medium text-[#f1f5f9] leading-relaxed hidden sm:block">
            {article.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold text-white">
            <span className="text-[#00e5ff]">{article.author.name}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[#ff1e46]" /> {timeAgo(article.createdAt)}</span>
            <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-[#00e5ff]" /> {fmtCompact(article.views)} views</span>
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
        "group flex flex-col w-full overflow-hidden rounded-md border border-white/12 bg-[#0b101e] text-left transition-all hover:border-white/30 hover:bg-[#10172a] shadow-md",
        className
      )}
    >
      {/* Photo */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#10172a]">
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
            <span className="text-[11px] font-black uppercase tracking-widest text-white/30">FHB NEWS</span>
          </div>
        )}
        {/* Category tag */}
        <span className="absolute left-0 bottom-0 px-2.5 py-1 bg-[#ff1e46] text-[9px] font-black uppercase tracking-widest text-white shadow-sm">
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Red accent left border on title */}
        <h3 className="mb-2 pl-3 border-l-3 border-[#ff1e46] text-[15px] font-extrabold leading-snug text-white transition-colors group-hover:text-[#00e5ff] line-clamp-2">
          {article.title}
        </h3>
        <p className="mt-auto flex items-center justify-between border-t border-white/10 pt-3 text-[11px] font-semibold text-[#cbd5e1]">
          <span className="truncate">{article.author.name} · {timeAgo(article.createdAt)}</span>
          <span className="shrink-0 flex items-center gap-1.5 ml-2 text-white">
            <Eye className="h-3.5 w-3.5 text-[#00e5ff]" /> {fmtCompact(article.views)}
          </span>
        </p>
      </div>
    </button>
  );
}
