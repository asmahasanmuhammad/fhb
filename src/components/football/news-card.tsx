"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAppStore } from "@/store/app-store";
import type { NewsArticle } from "@/lib/types";
import { timeAgo, fmtCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

const CATEGORY_STYLES: Record<string, string> = {
  BFL: "bg-primary text-primary-foreground",
  NATIONAL: "bg-fhb-red text-white",
  TRANSFER: "bg-fhb-gold text-black",
  INTERNATIONAL: "bg-elevated text-foreground ring-1 ring-inset ring-border",
  OPINION: "bg-secondary text-foreground",
};

const CATEGORY_DOTS: Record<string, string> = {
  BFL: "bg-primary",
  NATIONAL: "bg-fhb-red",
  TRANSFER: "bg-fhb-gold",
  INTERNATIONAL: "bg-muted-foreground",
  OPINION: "bg-muted-foreground",
};

/** Short chip labels — never overflow card widths. */
const SHORT_LABELS: Record<string, string> = {
  ALL: "All",
  BFL: "BFL",
  NATIONAL: "National Team",
  TRANSFER: "Transfers",
  INTERNATIONAL: "International",
  OPINION: "Opinion",
};

/**
 * FadeImg — image with a branded flat placeholder while loading, so
 * cards never render as black voids on slow connections.
 */
function FadeImg({
  src,
  alt,
  sizes,
  className,
  priority = false,
  quality = 90,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  quality?: number;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      priority={priority}
      loading="eager"
      className={cn("object-cover", className)}
    />
  );
}

/**
 * FHB 4.0 — Editorial news cards.
 * OneFootball-style: strong sans headlines (Inter, not condensed),
 * clean category chips, quiet meta. Variants:
 *   "lg"  — lead story (photo + scrim + overlay headline)
 *   "md"  — standard grid card (photo top)
 *   "row" — compact list row with thumb (rails, most-read)
 */
export function NewsCard({
  article,
  size = "md",
  className,
}: {
  article: NewsArticle;
  size?: "md" | "lg" | "row";
  className?: string;
}) {
  const navigate = useAppStore((s) => s.navigate);
  const open = () => navigate({ name: "news-detail", id: article.id });
  const catLabel = SHORT_LABELS[article.category] ?? article.category;
  const catStyle = CATEGORY_STYLES[article.category] ?? CATEGORY_STYLES.INTERNATIONAL;
  const catDot = CATEGORY_DOTS[article.category] ?? "bg-muted-foreground";

  /* ── Lead story — full-bleed photo, scrim, overlay headline ── */
  if (size === "lg") {
    return (
      <button
        onClick={open}
        className={cn(
          "group relative flex min-h-[300px] w-full flex-col justify-end overflow-hidden rounded-xl border border-border text-left sm:min-h-[380px]",
          className
        )}
        aria-label={`Read: ${article.title}`}
      >
        {article.coverUrl ? (
          <FadeImg
            src={article.coverUrl}
            alt=""
            sizes="(max-width: 1024px) 100vw, 1200px"
            quality={92}
            className="img-zoom"
            priority
          />
        ) : (
          <span className="stadium-panel absolute inset-0" aria-hidden />
        )}
        <span className="photo-scrim absolute inset-0" aria-hidden />
        <span className="relative z-10 flex flex-col gap-3 p-5 sm:p-7">
          <span className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-[5px] px-2.5 py-1 text-[11.5px] sm:text-[12px] font-bold uppercase tracking-[0.08em]", catStyle)}>
              {catLabel}
            </span>
          </span>
          <h3 className="max-w-2xl text-[24px] font-extrabold leading-[1.2] tracking-[-0.015em] text-white sm:text-[30px] lg:text-[34px]">
            {article.title}
          </h3>
          <p className="line-clamp-2 max-w-2xl text-[14.5px] sm:text-[16px] leading-relaxed text-white/80">{article.excerpt}</p>
          <span className="mt-1 flex items-center gap-3 text-[12px] sm:text-[13px] font-medium text-white/70">
            <span className="font-semibold text-white/95">{article.author.name}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden /> {timeAgo(article.createdAt)}
            </span>
            <span>{fmtCompact(article.views)} reads</span>
          </span>
        </span>
      </button>
    );
  }

  /* ── Row — compact horizontal card for rails & lists ── */
  if (size === "row") {
    return (
      <button
        onClick={open}
        className={cn("row-hover group flex w-full items-start gap-3.5 px-4 py-3.5 text-left", className)}
        aria-label={`Read: ${article.title}`}
      >
        <span className="relative h-18 w-[104px] shrink-0 overflow-hidden rounded-[8px] bg-elevated">
          {article.coverUrl && <FadeImg src={article.coverUrl} alt="" sizes="208px" quality={90} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-1 flex items-center gap-1.5">
            <span className={cn("h-[8px] w-[8px] rounded-[2px]", catDot)} aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              {catLabel}
            </span>
          </span>
          <span title={article.title} className="line-clamp-2 text-[14.5px] sm:text-[15.5px] font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            {article.title}
          </span>
          <span className="mt-1.5 flex items-center gap-2 text-[12px] text-muted-foreground">
            {timeAgo(article.createdAt)}
            <span aria-hidden>·</span>
            <span>{fmtCompact(article.views)} reads</span>
          </span>
        </span>
      </button>
    );
  }

  /* ── Standard grid card ── */
  return (
    <button
      onClick={open}
      className={cn(
        "card-lift group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all duration-200",
        className
      )}
      aria-label={`Read: ${article.title}`}
    >
      <span className="relative block aspect-[16/9] overflow-hidden bg-elevated">
        {article.coverUrl ? (
          <FadeImg
            src={article.coverUrl}
            alt=""
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 720px"
            quality={90}
            className="img-zoom"
          />
        ) : (
          <span className="stadium-panel absolute inset-0" aria-hidden />
        )}
        <span
          className={cn(
            "label-cond absolute left-3 top-3 rounded-[5px] px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] backdrop-blur-sm shadow-md",
            catStyle
          )}
        >
          {catLabel}
        </span>
      </span>
      <span className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
        <h3 className="line-clamp-3 text-[16.5px] sm:text-[18px] font-bold leading-[1.3] tracking-[-0.01em] text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-[13.5px] sm:text-[14.5px] leading-relaxed text-muted-foreground">{article.excerpt}</p>
        <span className="mt-auto flex items-center gap-2 pt-2 text-[12px] text-muted-foreground">
          <span className="font-semibold text-foreground/80">{article.author.name}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden /> {timeAgo(article.createdAt)}
          </span>
        </span>
      </span>
    </button>
  );
}
