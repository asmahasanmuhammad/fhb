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
    playerPhoto: "/players/sheikh_morsalin.jpg",
    fromTeam: "Bashundhara Kings",
    toTeam: "Royal Antwerp (Belgium)",
    feeBDT: "BDT 12.5 Cr",
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
    playerPhoto: "/players/jamal_bhuyan.jpg",
    fromTeam: "Club Sol de Mayo",
    toTeam: "Abahani Limited Dhaka",
    feeBDT: "Free Transfer",
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
    playerPhoto: "/players/hamza_choudhury.jpg",
    fromTeam: "Leicester City (EPL)",
    toTeam: "Bangladesh National Team",
    feeBDT: "FIFA Clearance",
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
    playerPhoto: "/players/tariq_kazi.jpg",
    fromTeam: "Bashundhara Kings",
    toTeam: "Tampines Rovers (Singapore)",
    feeBDT: "BDT 4.8 Cr",
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
    playerPhoto: "/players/dorielton_gomes.jpg",
    fromTeam: "Bashundhara Kings",
    toTeam: "Persib Bandung (Indonesia)",
    feeBDT: "BDT 8.2 Cr",
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
    playerPhoto: "/players/cornelius_stewart.jpg",
    fromTeam: "Abahani Limited Dhaka",
    toTeam: "Mohammedan SC",
    feeBDT: "BDT 5.5 Cr",
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
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>FHB Transfer Desk &amp; Reliability Meter</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
              Domestic &amp; Global Transfer Radar
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1 max-w-2xl leading-relaxed">
              5-Tier source reliability calibration covering Bangladesh Premier League (BPL), diaspora stars, and international verified valuations.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-muted/60 border border-border text-xs font-bold w-fit">
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
                  "px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer text-xs font-black tracking-wider",
                  statusFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-md font-black shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/80"
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
              className="rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-accent/40 p-5 shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Player & Status */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.playerPhoto}
                      alt={item.playerName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-border p-0.5 bg-muted shadow-sm"
                    />
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-foreground uppercase tracking-tight">
                        {item.playerName}
                      </h3>
                      <p className="text-[11.5px] text-muted-foreground font-semibold">
                        Contract: <strong className="text-foreground font-bold">{item.contractUntil}</strong>
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      isConfirmed
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                        : isAdvanced
                        ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                    )}
                  >
                    {item.status.replace("_", " ")}
                  </span>
                </div>

                {/* Club to Club Badge Flow */}
                <div className="rounded-xl bg-muted/40 p-3.5 border border-border mb-3.5 flex items-center justify-between gap-3">
                  <div className="flex-1 text-left min-w-0" title={item.fromTeam}>
                    <span className="text-[10px] uppercase font-black text-muted-foreground/80 block">FROM</span>
                    <span className="text-xs sm:text-sm font-black text-foreground leading-snug line-clamp-2 block">{item.fromTeam}</span>
                  </div>

                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-card text-primary border border-border shadow-sm">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  <div className="flex-1 text-right min-w-0" title={item.toTeam}>
                    <span className="text-[10px] uppercase font-black text-muted-foreground/80 block">TO</span>
                    <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 leading-snug line-clamp-2 block">{item.toTeam}</span>
                  </div>
                </div>

                {/* Transfer Financial Valuation */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-muted/40 p-2.5 rounded-xl border border-border">
                    <span className="text-[10px] font-black uppercase text-muted-foreground/80 block">Fee (BDT)</span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">{item.feeBDT}</span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded-xl border border-border">
                    <span className="text-[10px] font-black uppercase text-muted-foreground/80 block">Fee (EUR)</span>
                    <span className="font-mono font-black text-foreground text-sm sm:text-base">{item.feeEUR}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-4">{item.summary}</p>
              </div>

              {/* Source Reliability Meter (5-Tier) */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-muted-foreground/80 block mb-0.5">
                    Source Reliability ({item.tier === 1 ? "Tier 1: Confirmed" : item.tier === 2 ? "Tier 2: High" : "Tier 3: Moderate"})
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          star <= (6 - item.tier) ? "bg-amber-400 shadow-sm" : "bg-muted-foreground/30"
                        )}
                      />
                    ))}
                    <span className="ml-1.5 text-[11px] font-mono font-bold text-slate-300">{item.source}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-black text-slate-400 block">Probability</span>
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
