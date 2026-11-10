"use client";

import { useState } from "react";
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
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center bg-elevated"
        >
          <span className="label-cond select-none text-[11px] font-bold tracking-[0.22em] text-muted-foreground/25">
            FHB
          </span>
        </span>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading="eager"
        onLoad={() => setLoaded(true)}
        className={cn("object-cover transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0", className)}
      />
    </>
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
            sizes="(max-width: 1024px) 100vw, 720px"
            className="img-zoom"
            priority
          />
        ) : (
          <span className="stadium-panel absolute inset-0" aria-hidden />
        )}
        <span className="photo-scrim absolute inset-0" aria-hidden />
        <span className="relative z-10 flex flex-col gap-2.5 p-5 sm:p-6">
          <span className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-[4px] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em]", catStyle)}>
              {catLabel}
            </span>
          </span>
          <h3 className="max-w-2xl text-[22px] font-bold leading-[1.15] tracking-[-0.015em] text-white sm:text-[28px]">
            {article.title}
          </h3>
          <p className="line-clamp-2 max-w-2xl text-[13px] leading-relaxed text-white/70">{article.excerpt}</p>
          <span className="mt-1 flex items-center gap-3 text-[11px] font-medium text-white/55">
            <span className="font-semibold text-white/85">{article.author.name}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden /> {timeAgo(article.createdAt)}
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
        className={cn("row-hover group flex w-full items-start gap-3.5 px-4 py-3 text-left", className)}
        aria-label={`Read: ${article.title}`}
      >
        <span className="relative h-16 w-[96px] shrink-0 overflow-hidden rounded-[6px] bg-elevated">
          {article.coverUrl && <FadeImg src={article.coverUrl} alt="" sizes="96px" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-1.5 flex items-center gap-1.5">
            <span className={cn("h-[7px] w-[7px] rounded-[2px]", catDot)} aria-hidden />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {catLabel}
            </span>
          </span>
          <span title={article.title} className="line-clamp-2 text-[13px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {article.title}
          </span>
          <span className="mt-1 flex items-center gap-2 text-[10.5px] text-muted-foreground">
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
        "card-lift group flex w-full flex-col overflow-hidden rounded-lg border border-border bg-card text-left",
        className
      )}
      aria-label={`Read: ${article.title}`}
    >
      <span className="relative block aspect-[16/9] overflow-hidden bg-elevated">
        {article.coverUrl ? (
          <FadeImg
            src={article.coverUrl}
            alt=""
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="img-zoom"
          />
        ) : (
          <span className="stadium-panel absolute inset-0" aria-hidden />
        )}
        <span
          className={cn(
            "label-cond absolute left-3 top-3 rounded-[4px] px-2 py-1 text-[9.5px] font-bold tracking-[0.08em] backdrop-blur-sm",
            catStyle
          )}
        >
          {catLabel}
        </span>
      </span>
      <span className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-3 text-[15px] font-semibold leading-[1.25] tracking-[-0.005em] text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">{article.excerpt}</p>
        <span className="mt-auto flex items-center gap-2 pt-1 text-[10.5px] text-muted-foreground">
          <span className="font-semibold text-foreground/60">{article.author.name}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden /> {timeAgo(article.createdAt)}
          </span>
        </span>
      </span>
    </button>
  );
}
