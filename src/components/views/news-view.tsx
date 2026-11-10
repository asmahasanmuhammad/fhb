"use client";

import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NewsArticle } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { useReveal } from "@/hooks/use-reveal";
import { useAppStore } from "@/store/app-store";
import { NewsCard } from "@/components/football/news-card";
import { AdSlot } from "@/components/football/ad-slot";
import { TransferRadar } from "@/components/football/transfer-radar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Newspaper, Search, X, Flame, Clock, ArrowRight } from "lucide-react";
import { fmtLocale, fmtCompact, timeAgo } from "@/lib/format";

export function NewsView() {
  const [category, setCategory] = useState("ALL");
  const [query, setQuery] = useState("");
  const navigate = useAppStore((s) => s.navigate);
  const language = useAppStore((s) => s.language);
  useReveal();

  const { data, isLoading } = useQuery<{ articles: NewsArticle[]; total: number }>({
    queryKey: ["news", category],
    queryFn: async () => {
      const res = await fetch(`/api/news?category=${category}&limit=30`);
      return res.json().then((j) => j.data);
    },
  });

  const articles = (data?.articles ?? []).filter((a) =>
    query.trim() ? (a.title + a.excerpt).toLowerCase().includes(query.toLowerCase()) : true
  );
  const [lead, ...rest] = articles;

  const mostRead = [...articles]
    .filter((a) => a.id !== lead?.id)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const activeLabel = CATEGORY_LABELS[category] ?? "All";

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-14 pt-5 sm:px-6 sm:pt-6">
      {/* ── Editorial Header ── */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.07] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-5 w-1 bg-red-600 shrink-0" aria-hidden />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
              FHB NEWSDESK · DHAKA BUREAU
            </span>
          </div>
          <h1 className="font-black text-[26px] sm:text-[34px] text-white leading-tight">
            {language === "bn" ? "ফুটবল সংবাদ ও দলবদল" : "Football News & Transfers"}
          </h1>
          <p className="text-[12.5px] text-white/40 mt-1">
            Breaking transfer stories, tactical match reports, exclusive interviews & BFL coverage.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news & transfers..."
            className="w-full h-10 border border-white/[0.1] bg-white/[0.04] pl-9 pr-8 text-xs text-white placeholder:text-white/30 focus:border-red-500/60 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className="reveal mb-6 flex items-center gap-0 border-b border-white/[0.07] overflow-x-auto no-scrollbar">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={cn(
              "shrink-0 pb-3 pt-1 px-4 text-[12px] font-bold uppercase tracking-wider border-b-2 transition-colors",
              category === key
                ? "border-red-500 text-white"
                : "border-transparent text-white/40 hover:text-white/80"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Transfer Radar for transfers category */}
      {(category === "TRANSFERS" || category === "ALL") && (
        <div className="reveal mb-8">
          <TransferRadar />
        </div>
      )}

      {/* Leaderboard ad */}
      <div className="reveal mb-8">
        <AdSlot placement="HEADER_BANNER" className="h-[90px]" />
      </div>

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-12">
          <Skeleton className="h-[380px] lg:col-span-8 bg-white/[0.04]" />
          <Skeleton className="h-[380px] lg:col-span-4 bg-white/[0.04]" />
        </div>
      ) : articles.length === 0 ? (
        <div className="border border-white/[0.07] bg-[#0d0d10] px-6 py-16 text-center">
          <Newspaper className="mx-auto mb-3 h-10 w-10 text-white/20" />
          <p className="font-black text-lg text-white">No stories found</p>
          <p className="mt-1 text-xs text-white/40">Try searching with different keywords or switch category.</p>
          {(query || category !== "ALL") && (
            <button
              onClick={() => { setQuery(""); setCategory("ALL"); }}
              className="mt-4 bg-red-600 px-4 py-2 text-xs font-black uppercase text-white"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main news stream */}
          <div className="lg:col-span-8 space-y-6">
            {lead && (
              <NewsCard article={lead} size="lg" className="h-[360px] sm:h-[400px]" />
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {rest.map((a, idx) => (
                <Fragment key={a.id}>
                  <NewsCard article={a} />
                  {idx === 3 && (
                    <div className="col-span-full">
                      <AdSlot placement="IN_FEED" />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Most read */}
            <div className="border border-white/[0.07] bg-[#0d0d10] overflow-hidden">
              <div className="flex items-center gap-2 border-b border-white/[0.07] bg-[#060608] px-4 py-2.5">
                <Flame className="h-3.5 w-3.5 text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Most Read</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {mostRead.map((a, i) => (
                  <button
                    key={a.id}
                    onClick={() => navigate({ name: "news-detail", id: a.id })}
                    className="group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <span className={cn(
                      "tabular font-black text-xl leading-none w-6",
                      i === 0 ? "text-red-500" : "text-white/20"
                    )}>
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-[12.5px] font-bold text-white/80 transition-colors group-hover:text-white">
                        {a.title}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[10px] text-white/30">
                        <Clock className="h-2.5 w-2.5" /> {timeAgo(a.createdAt)} · {fmtCompact(a.views)} views
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar ad */}
            <AdSlot placement="SIDEBAR" className="min-h-[250px]" />

            {/* Quick newsletter pill */}
            <div className="border border-white/[0.07] bg-[#0d0d10] p-5">
              <span className="text-[9px] font-black uppercase tracking-widest text-red-500">NEWSLETTER</span>
              <h3 className="font-black text-white text-sm mt-1">Get match reports delivered to your inbox</h3>
              <p className="text-white/40 text-[11px] mt-1 mb-3">Daily football digest covering BFL & European matches.</p>
              <button
                onClick={() => navigate({ name: "community" })}
                className="w-full flex items-center justify-center gap-1 bg-red-600 py-2.5 text-xs font-black uppercase text-white hover:bg-red-500 transition-colors"
              >
                Join Fan Club <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
