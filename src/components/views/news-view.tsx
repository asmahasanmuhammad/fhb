"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NewsArticle } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { NewsCard } from "@/components/football/news-card";
import { AdSlot } from "@/components/football/ad-slot";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6">
      <h1 className="mb-5 flex items-center gap-2 font-display text-2xl font-bold tracking-wide sm:text-3xl">
        <Newspaper className="h-6 w-6 text-primary" aria-hidden />
        ফুটবল নিউজ ও ট্রান্সফার
      </h1>

      {/* Search + categories */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="নিউজ খুঁজুন..."
            className="pl-9 text-sm"
            aria-label="নিউজ সার্চ"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="সার্চ মুছুন">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <Button
              key={key}
              variant={category === key ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(key)}
              className="shrink-0 text-xs font-bold"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          এই বিভাগে কোনো নিউজ পাওয়া যায়নি।
        </p>
      ) : (
        <>
          <p className="mb-3 text-xs text-muted-foreground">মোট {bnNumber(articles.length)} টি নিউজ</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <div key={a.id} className="contents">
                <NewsCard article={a} />
                {i === 3 && <div className="sm:col-span-2 lg:col-span-3"><AdSlot placement="IN_FEED" /></div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
