"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NewsArticle } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6">
      <PageHeader
        title="ফুটবল নিউজ ও ট্রান্সফার"
        subtitle="বিপিএল, জাতীয় দল ও আন্তর্জাতিক — সব আপডেট এক জায়গায়"
        icon={<Newspaper className="h-5 w-5" aria-hidden />}
      />

      {/* Search + category chips */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="নিউজ খুঁজুন..."
            className="rounded-lg border-border bg-card pl-9 text-sm"
            aria-label="নিউজ সার্চ"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="সার্চ মুছুন"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={cn(
                "shrink-0 rounded-md border px-3 py-2 text-xs font-bold transition-colors",
                category === key
                  ? "border-primary/50 bg-primary text-primary-foreground"
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
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="rounded-lg border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          এই বিভাগে কোনো নিউজ পাওয়া যায়নি।
        </p>
      ) : (
        <>
          <p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-[2px] bg-primary" aria-hidden />
            মোট {bnNumber(articles.length)} টি নিউজ
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <div key={a.id} className="contents">
                <NewsCard article={a} />
                {i === 3 && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <AdSlot placement="IN_FEED" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
