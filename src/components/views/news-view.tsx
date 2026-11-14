"use client";

import { Fragment, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { NewsArticle } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { NewsCard } from "@/components/football/news-card";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader, SectionHeader } from "@/components/football/section-header";
import { PageLayout, RailCard } from "@/components/layout/page-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { fmtLocale } from "@/lib/format";
import { Newspaper, ChevronDown } from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   NewsView — the editorial feed.
   Lead story full-width, 2-col story grid, category chips, offset
   pagination ("Load more"), Most Read rail + sidebar ad.
   ════════════════════════════════════════════════════════════════ */

const PAGE_SIZE = 12;

/** Tab chips — every CATEGORY_LABELS desk with compact display forms. */
const CATEGORY_CHIPS: Array<{ key: string; label: string }> = [
  { key: "ALL", label: "All" },
  ...Object.keys(CATEGORY_LABELS)
    .filter((k) => k !== "ALL")
    .map((k) => ({ key: k, label: k === "BFL" ? "BFL" : CATEGORY_LABELS[k] })),
];

export function NewsView() {
  useReveal();
  const [category, setCategory] = useState("ALL");

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["news", "feed", category],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const res = await fetch(`/api/news?category=${category}&limit=${PAGE_SIZE}&offset=${pageParam}`);
      return res.json().then(
        (j) => j.data as { articles: NewsArticle[]; total: number }
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.articles.length, 0);
      return loaded < lastPage.total && lastPage.articles.length > 0 ? loaded : undefined;
    },
  });

  const articles = data ? data.pages.flatMap((p) => p.articles) : [];
  const total = data ? data.pages[data.pages.length - 1].total : 0;
  const [lead, ...rest] = articles;
  const activeLabel = CATEGORY_CHIPS.find((c) => c.key === category)?.label ?? "All";

  // Most-read rail excludes the lead story (already the page hero)
  const mostRead = articles
    .filter((a) => a.id !== lead?.id)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const rail = (
    <>
      {mostRead.length > 0 && (
        <RailCard title="Most Read">
          <div className="divide-y divide-border/40">
            {mostRead.map((a) => (
              <NewsCard key={a.id} article={a} size="row" />
            ))}
          </div>
        </RailCard>
      )}
      <AdSlot placement="SIDEBAR" />
    </>
  );

  return (
    <PageLayout rail={rail}>
      <PageHeader
        title="Football News"
        kicker="editorial"
        icon={<Newspaper className="h-3.5 w-3.5" aria-hidden />}
        subtitle="Transfers, match reports and analysis from the FHBD desk."
      />

      {/* Category chips */}
      <div
        className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1"
        role="group"
        aria-label="Filter news by category"
      >
        {CATEGORY_CHIPS.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            aria-pressed={category === c.key}
            className={cn(
              "h-9 shrink-0 rounded-full border px-4 text-[13px] sm:text-[13.5px] font-semibold transition-colors",
              category === c.key
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border bg-card text-foreground/80 hover:border-white/20"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div aria-hidden>
          <Skeleton className="h-[340px] w-full rounded-xl sm:h-[380px]" />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[292px] rounded-lg" />
            ))}
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-12 text-center">
          <p className="text-sm font-semibold text-foreground">Nothing here yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            No published stories in {activeLabel} right now — check back soon for updates from
            the FHBD newsdesk.
          </p>
          {category !== "ALL" && (
            <button
              onClick={() => setCategory("ALL")}
              className="mt-4 inline-flex h-8 items-center rounded-[6px] border border-border px-3.5 text-[11px] font-bold uppercase tracking-wider text-foreground/80 transition-colors hover:border-white/25"
            >
              All stories
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Lead story */}
          {lead && (
            <section className="reveal" aria-label="Lead story">
              <NewsCard article={lead} size="lg" />
            </section>
          )}

          {/* Story grid */}
          {rest.length > 0 && (
            <section className="reveal mt-8" aria-label="Latest stories">
              <SectionHeader
                title="Latest Stories"
                kicker={category === "ALL" ? "all categories" : activeLabel.toLowerCase()}
                icon={<Newspaper className="h-3.5 w-3.5" aria-hidden />}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {rest.map((a, i) => (
                  <Fragment key={a.id}>
                    <NewsCard article={a} className={cn(i === rest.length - 1 && rest.length % 2 === 1 && i > 3 && "sm:col-span-2")} />
                    {i === 3 && (
                      <div className="reveal sm:col-span-2">
                        <AdSlot placement="IN_FEED" />
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            </section>
          )}

          {/* Load more */}
          <div className="mt-6 flex flex-col items-center gap-2.5">
            <p className="text-[11px] text-muted-foreground">
              Showing {fmtLocale(articles.length)} of {fmtLocale(total)}{" "}
              {total === 1 ? "story" : "stories"}
            </p>
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="flex h-9 items-center gap-1.5 rounded-[6px] border border-border bg-card px-4 text-[11px] font-bold uppercase tracking-wider text-foreground/80 transition-colors hover:border-white/20 hover:text-foreground active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
              >
                {isFetchingNextPage ? "Loading…" : "Load more stories"}
                {!isFetchingNextPage && <ChevronDown className="h-3.5 w-3.5" aria-hidden />}
              </button>
            )}
          </div>
        </>
      )}
    </PageLayout>
  );
}
