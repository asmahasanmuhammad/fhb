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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/12 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-5 w-1.5 bg-[#ff1e46] rounded-full shrink-0 shadow-[0_0_8px_#ff1e46]" aria-hidden />
            <span className="text-[10.5px] font-black uppercase tracking-widest text-[#ff1e46]">
              FHB NEWSDESK · DHAKA BUREAU
            </span>
          </div>
          <h1 className="font-black text-[28px] sm:text-[36px] text-white leading-tight drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
            Football News & Transfers
          </h1>
          <p className="text-[14px] text-[#cbd5e1] font-medium mt-1">
            Breaking transfer stories, tactical match reports, exclusive interviews & BFL coverage.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news & transfers..."
            className="w-full h-10 rounded border border-white/20 bg-white/10 pl-9 pr-8 text-xs font-semibold text-white placeholder:text-white/40 focus:border-[#ff1e46] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className="reveal mb-6 flex items-center gap-1 border-b border-white/12 overflow-x-auto no-scrollbar pb-1">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={cn(
              "shrink-0 pb-3 pt-1.5 px-4 text-[13px] font-extrabold uppercase tracking-wider border-b-2 transition-all",
              category === key
                ? "border-[#ff1e46] text-white shadow-[0_2px_8px_rgba(255,30,70,0.4)]"
                : "border-transparent text-[#cbd5e1] hover:text-white hover:bg-white/5 rounded-t"
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
          <Skeleton className="h-[380px] lg:col-span-8 bg-white/10 rounded-md" />
          <Skeleton className="h-[380px] lg:col-span-4 bg-white/10 rounded-md" />
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-md border border-white/12 bg-[#090d19] px-6 py-16 text-center shadow-lg">
          <Newspaper className="mx-auto mb-3 h-12 w-12 text-white/30" />
          <p className="font-black text-xl text-white">No stories found</p>
          <p className="mt-1 text-sm text-[#cbd5e1] font-medium">Try searching with different keywords or switch category.</p>
          {(query || category !== "ALL") && (
            <button
              onClick={() => { setQuery(""); setCategory("ALL"); }}
              className="mt-5 rounded bg-[#ff1e46] px-5 py-2.5 text-xs font-black uppercase text-white hover:bg-[#e01438] shadow-[0_0_12px_rgba(255,30,70,0.4)]"
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
            <div className="rounded-md border border-white/12 bg-[#090d19] shadow-xl overflow-hidden">
              <div className="flex items-center gap-2 border-b border-white/12 bg-[#050812] px-4 py-2.5">
                <Flame className="h-4 w-4 text-[#ff1e46]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-white">Most Read</span>
              </div>
              <div className="divide-y divide-white/10">
                {mostRead.map((a, i) => (
                  <button
                    key={a.id}
                    onClick={() => navigate({ name: "news-detail", id: a.id })}
                    className="group flex w-full items-start gap-3.5 px-4 py-3.5 text-left transition-all hover:bg-white/10"
                  >
                    <span className={cn(
                      "tabular font-black text-2xl leading-none w-7",
                      i === 0 ? "text-[#ff1e46] drop-shadow-[0_0_8px_rgba(255,30,70,0.5)]" : "text-white"
                    )}>
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-[13px] font-extrabold leading-snug text-white transition-colors group-hover:text-[#00e5ff]">
                        {a.title}
                      </span>
                      <span className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold text-[#cbd5e1]">
                        <Clock className="h-3 w-3 text-[#ff1e46]" /> {timeAgo(a.createdAt)} · {fmtCompact(a.views)} views
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar ad */}
            <AdSlot placement="SIDEBAR" className="min-h-[250px]" />

            {/* Quick newsletter pill */}
            <div className="rounded-md border border-white/12 bg-[#090d19] p-5 shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ff1e46]">NEWSLETTER</span>
              <h3 className="font-black text-white text-base mt-1">Get match reports delivered to your inbox</h3>
              <p className="text-[#cbd5e1] text-[12px] font-medium mt-1 mb-4">Daily football digest covering BFL & European matches.</p>
              <button
                onClick={() => navigate({ name: "community" })}
                className="w-full flex items-center justify-center gap-1.5 rounded bg-[#ff1e46] py-3 text-xs font-black uppercase text-white hover:bg-[#e01438] transition-all shadow-[0_0_12px_rgba(255,30,70,0.4)]"
              >
                Join Fan Club <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
