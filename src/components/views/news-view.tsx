"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NewsArticle } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { NewsCard } from "@/components/football/news-card";
import { AdSlot } from "@/components/football/ad-slot";
import { PageHeader } from "@/components/football/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Newspaper, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { bnNumber } from "@/lib/format";

export function NewsView() {
  const [category, setCategory] = useState("ALL");
  const [query, setQuery] = useState("");
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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-6 sm:px-6">
      <PageHeader
        title="ফুটবল নিউজ ও ট্রান্সফার"
        kicker="newsroom"
        subtitle="বিপিএল, জাতীয় দল ও আন্তর্জাতিক — সব আপডেট এক জায়গায়"
        icon={<Newspaper className="h-5 w-5" aria-hidden />}
      />

      {/* Search + category chips */}
      <div className="mb-7 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-80">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="নিউজ খুঁজুন..."
            className="h-11 rounded-full border-border bg-card pl-11 pr-10 text-sm"
            aria-label="নিউজ সার্চ"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="সার্চ মুছুন"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-all active:scale-95",
                category === key
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_8px_20px_-10px_var(--primary)]"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="edge-lit rounded-2xl border border-border bg-card p-14 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Newspaper className="h-6 w-6" aria-hidden />
          </span>
          <p className="text-sm text-muted-foreground">এই বিভাগে কোনো নিউজ পাওয়া যায়নি।</p>
        </div>
      ) : (
        <>
          <p className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-[3px] bg-primary" aria-hidden />
            মোট {bnNumber(articles.length)} টি নিউজ
          </p>

          {/* Lead story + grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lead && (
              <div className="reveal sm:col-span-2 lg:h-[420px]">
                <NewsCard article={lead} size="lg" className="h-full min-h-[300px]" />
              </div>
            )}
            {rest.slice(0, 1).map((a) => (
              <div key={a.id} className="reveal">
                <NewsCard article={a} />
              </div>
            ))}

            {/* In-feed ad after first row */}
            <div className="reveal sm:col-span-2 lg:col-span-3">
              <AdSlot placement="IN_FEED" />
            </div>

            {rest.slice(1).map((a) => (
              <div key={a.id} className="reveal">
                <NewsCard article={a} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
