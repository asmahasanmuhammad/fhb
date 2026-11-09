"use client";

import React, { useState } from "react";
import { TrendingUp, ShieldCheck, CheckCircle2, ArrowRight, Sparkles, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TransferDeal {
  id: string;
  playerName: string;
  playerPhoto: string;
  fromTeam: string;
  fromTeamLogo?: string;
  toTeam: string;
  toTeamLogo?: string;
  feeBDT: string;
  feeEUR: string;
  status: "confirmed" | "advanced_talks" | "rumor";
  tier: 1 | 2 | 3 | 4 | 5;
  source: string;
  probability: number;
  contractUntil: string;
  summary: string;
}

const TRANSFER_DEALS: TransferDeal[] = [
  {
    id: "tr1",
    playerName: "Sheikh Morsalin",
    playerPhoto: "https://images.unsplash.com/photo-1570498839593-e565b3d7f672?w=150&h=150&fit=crop&crop=face",
    fromTeam: "Bashundhara Kings",
    toTeam: "Royal Antwerp (Belgium)",
    feeBDT: "৳১২.৫ কোটি",
    feeEUR: "€1.10M",
    status: "advanced_talks",
    tier: 1,
    source: "Fabrizio Romano & FHB Bureau",
    probability: 92,
    contractUntil: "June 2028",
    summary: "European scouting breakthrough: Belgium Pro League side Antwerp has initiated direct contract negotiations with Kings.",
  },
  {
    id: "tr2",
    playerName: "Jamal Bhuyan",
    playerPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    fromTeam: "Club Sol de Mayo",
    toTeam: "Abahani Limited Dhaka",
    feeBDT: "ফ্রি ট্রান্সফার",
    feeEUR: "Free Agent",
    status: "confirmed",
    tier: 1,
    source: "Official Club Confirmation",
    probability: 100,
    contractUntil: "June 2026",
    summary: "Captain returns to Dhaka: Jamal Bhuyan inks official marquee midfielder deal with Abahani Dhaka.",
  },
  {
    id: "tr3",
    playerName: "Hamza Choudhury",
    playerPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    fromTeam: "Leicester City (EPL)",
    toTeam: "Bangladesh National Team",
    feeBDT: "ঐতিহাসিক ছাড়পত্র",
    feeEUR: "FIFA Dual Passport",
    status: "confirmed",
    tier: 1,
    source: "BFF & FIFA Players Status Committee",
    probability: 100,
    contractUntil: "Permanent Allegiance",
    summary: "FIFA clears Leicester star Hamza Choudhury to represent the Bengal Tigers in the upcoming AFC Asian Cup Qualifiers.",
  },
  {
    id: "tr4",
    playerName: "Tariq Kazi",
    playerPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    fromTeam: "Bashundhara Kings",
    toTeam: "Tampines Rovers (Singapore)",
    feeBDT: "৳৪.৮ কোটি",
    feeEUR: "€420K",
    status: "advanced_talks",
    tier: 2,
    source: "Singapore Straits Sports",
    probability: 80,
    contractUntil: "Dec 2027",
    summary: "Singapore Premier League giants close in on commanding Bangladesh national team centre-back Tariq Kazi.",
  },
  {
    id: "tr5",
    playerName: "Dorielton Gomes",
    playerPhoto: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face",
    fromTeam: "Bashundhara Kings",
    toTeam: "Persib Bandung (Indonesia)",
    feeBDT: "৳৮.২ কোটি",
    feeEUR: "€720K",
    status: "rumor",
    tier: 3,
    source: "IndoFootball Radar",
    probability: 58,
    contractUntil: "May 2026",
    summary: "Prolific BPL Brazilian talisman linked with Liga 1 Indonesia switch during the winter window.",
  },
  {
    id: "tr6",
    playerName: "Cornelius Stewart",
    playerPhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    fromTeam: "Abahani Limited Dhaka",
    toTeam: "Mohammedan SC",
    feeBDT: "৳৫.৫ কোটি",
    feeEUR: "€480K",
    status: "advanced_talks",
    tier: 2,
    source: "Dhaka Tribune Sports Bureau",
    probability: 85,
    contractUntil: "June 2026",
    summary: "Classic Dhaka Derby transfer drama: Mohammedan SC opens formal bid for Caribbean danger-man Cornelius Stewart.",
  },
];

export function TransferRadar() {
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "advanced_talks" | "rumor">("all");

  const filtered = TRANSFER_DEALS.filter((d) => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Transfer Radar Header */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c1220] p-5 sm:p-7 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-500 text-xs font-black uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>FHB Transfer Desk & Reliability Meter</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Domestic & Global Transfer Radar
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              5-Tier source reliability calibration covering Bangladesh Premier League (BPL), diaspora stars, and international verified valuations.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/[0.08] text-xs font-bold self-start md:self-auto overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "All Deals" },
              { id: "confirmed", label: "Confirmed" },
              { id: "advanced_talks", label: "Advanced Talks" },
              { id: "rumor", label: "Rumors" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                className={cn(
                  "px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer text-xs font-bold tracking-wider",
                  statusFilter === tab.id
                    ? "bg-emerald-600 text-white shadow-md font-black"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transfer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filtered.map((item) => {
          const isConfirmed = item.status === "confirmed";
          const isAdvanced = item.status === "advanced_talks";

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-white/[0.08] bg-[#0c1220] hover:border-white/[0.18] p-5 shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Player & Status */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.playerPhoto}
                      alt={item.playerName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/[0.08] p-0.5 bg-slate-900 shadow-md"
                    />
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-white uppercase tracking-tight">
                        {item.playerName}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Contract: <strong className="text-slate-200">{item.contractUntil}</strong>
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      isConfirmed
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                        : isAdvanced
                        ? "bg-blue-950 text-blue-400 border border-blue-500/40"
                        : "bg-amber-950 text-amber-400 border border-amber-500/40"
                    )}
                  >
                    {item.status.replace("_", " ")}
                  </span>
                </div>

                {/* Club to Club Badge Flow */}
                <div className="rounded-xl bg-[#070b14] p-3.5 border border-white/[0.06] mb-3.5 flex items-center justify-between gap-3">
                  <div className="flex-1 text-left min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">FROM</span>
                    <span className="text-xs sm:text-sm font-black text-white truncate block">{item.fromTeam}</span>
                  </div>

                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-emerald-400 border border-white/[0.08]">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  <div className="flex-1 text-right min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">TO</span>
                    <span className="text-xs sm:text-sm font-black text-emerald-400 truncate block">{item.toTeam}</span>
                  </div>
                </div>

                {/* Transfer Financial Valuation */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Fee (BDT)</span>
                    <span className="font-mono font-black text-emerald-400 text-sm sm:text-base">{item.feeBDT}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Fee (EUR)</span>
                    <span className="font-mono font-black text-white text-sm sm:text-base">{item.feeEUR}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">{item.summary}</p>
              </div>

              {/* Source Reliability Meter (5-Tier) */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                    Source Reliability ({item.tier === 1 ? "Tier 1: Confirmed" : item.tier === 2 ? "Tier 2: High" : "Tier 3: Moderate"})
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          star <= (6 - item.tier) ? "bg-amber-400 shadow-sm" : "bg-slate-800"
                        )}
                      />
                    ))}
                    <span className="ml-1.5 text-[11px] font-mono font-bold text-slate-300">{item.source}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Probability</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">{item.probability}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
