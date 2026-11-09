"use client";

import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NewsArticle } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { useAppStore } from "@/store/app-store";
import { NewsCard } from "@/components/football/news-card";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader, SectionHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Newspaper, Search, X, TrendingUp, Clock } from "lucide-react";
import { fmtLocale, fmtCompact, timeAgo } from "@/lib/format";

export function NewsView() {
  const [category, setCategory] = useState("ALL");
  const [query, setQuery] = useState("");
  const navigate = useAppStore((s) => s.navigate);
  useReveal();

  const { data, isLoading } = useQuery<{ articles: NewsArticle[]; total: number }>({
    queryKey: ["news", category],
    queryFn: async () => {
      const res = await fetch(`/api/news?category=${category}&limit=24`);
      return res.json().then((j) => j.data);
    },
  });

  const articles = (data?.articles ?? []).filter((a) =>
    query.trim() ? (a.title + a.excerpt).toLowerCase().includes(query.toLowerCase()) : true
  );
  const [lead, ...rest] = articles;

  // Most-read rail — views-ranked, lead story excluded to avoid duplication
  const mostRead = [...articles]
    .filter((a) => a.id !== lead?.id)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
  const activeLabel = CATEGORY_LABELS[category] ?? "All";

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      <PageHeader
        title="Football News"
        kicker="newsroom"
        subtitle="Transfers, analysis and match reports"
        icon={<Newspaper aria-hidden />}
      />

      {/* ── Category rail + search ─────────────────────────────── */}
      <div className="reveal mb-6 flex flex-col gap-3 border-b border-border/70 pb-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1"
          role="group"
          aria-label="Filter news by category"
        >
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              aria-pressed={category === key}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                category === key
                  ? "border-border bg-elevated text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative w-full shrink-0 lg:w-60 xl:w-64">
          <Search
            className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories"
            aria-label="Search news"
            className="rounded-lg border-border bg-card pl-9 pr-8 text-xs"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        /* ── Skeletons mirroring the editorial layout ── */
        <div aria-hidden>
          <div className="grid gap-6 lg:grid-cols-12">
            <Skeleton className="h-[380px] rounded-xl lg:col-span-7" />
            <div className="space-y-4 lg:col-span-5">
              <Skeleton className="h-[288px] rounded-xl" />
              <Skeleton className="h-[104px] rounded-xl" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[292px] rounded-xl" />
            ))}
          </div>
        </div>
      ) : articles.length === 0 ? (
        /* ── Empty state ── */
        <div className="reveal edge-lit rounded-xl border border-border bg-card px-6 py-14 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Newspaper className="h-5 w-5" aria-hidden />
          </span>
          <p className="font-display text-base font-bold text-foreground">
            {query.trim() ? "No matching stories" : "Nothing here yet"}
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            {query.trim()
              ? `We could not find anything matching "${query.trim()}" in ${activeLabel}. Try a broader search or another category.`
              : `No published stories in ${activeLabel} right now. Check back soon for updates from the FHB newsdesk.`}
          </p>
          {(query.trim() || category !== "ALL") && (
            <button
              onClick={() => {
                setQuery("");
                setCategory("ALL");
              }}
              className="mt-5 rounded-lg border border-border bg-elevated px-4 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ── Meta line ── */}
          <p className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-[3px] bg-primary" aria-hidden />
            {fmtLocale(articles.length)} {articles.length === 1 ? "story" : "stories"}
            {category !== "ALL" ? ` in ${activeLabel}` : ""}
            {query.trim() ? ` matching "${query.trim()}"` : ""}
          </p>

          {/* ── Lead story + most-read rail ─────────────────────── */}
          <section className="grid gap-6 lg:grid-cols-12" aria-label="Top story">
            {lead && (
              <div className="reveal lg:col-span-7">
                <NewsCard article={lead} size="lg" className="h-full min-h-[360px]" />
              </div>
            )}
            <aside className="reveal space-y-4 lg:col-span-5" aria-label="Most read">
              {mostRead.length > 0 && (
                <div className="edge-lit overflow-hidden rounded-xl border border-border bg-card">
                  <p className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" aria-hidden />
                    Most Read
                  </p>
                  <div className="divide-y divide-border/60">
                    {mostRead.map((a, i) => (
                      <button
                        key={a.id}
                        onClick={() => navigate({ name: "news-detail", id: a.id })}
                        className="group flex w-full items-start gap-3.5 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
                      >
                        <span
                          className={cn(
                            "tabular font-display text-xl font-bold leading-none",
                            i === 0 ? "text-primary" : "text-muted-foreground/60"
                          )}
                        >
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                            {a.title}
                          </span>
                          <span className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-2.5 w-2.5" aria-hidden /> {timeAgo(a.createdAt)} ·{" "}
                            {fmtCompact(a.views)} reads
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <AdSlot placement="SIDEBAR" />
            </aside>
          </section>

          {/* ── Latest grid ─────────────────────────────────────── */}
          {rest.length > 0 && (
            <section className="reveal mt-8" aria-label="Latest stories">
              <SectionHeader
                title="Latest Stories"
                kicker={category === "ALL" ? "all categories" : activeLabel.toLowerCase()}
                icon={<Newspaper aria-hidden />}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((a, i) => (
                  <Fragment key={a.id}>
                    <NewsCard article={a} />
                    {i === 5 && (
                      <div className="sm:col-span-2 lg:col-span-3">
                        <AdSlot placement="IN_FEED" />
                      </div>
                    )}
                  </Fragment>
                ))}
                {rest.length < 6 && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <AdSlot placement="IN_FEED" />
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
