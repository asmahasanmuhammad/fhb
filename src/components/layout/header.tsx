"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAppStore, type View } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
import { AdSlot } from "@/components/football/ad-slot";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { fmtNum } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Trophy, Calendar, Newspaper, Users, Video, Shield, LayoutDashboard, LogOut, User2,
  Crown, Upload, Wallet, Menu, X, ChevronRight, Radio, Facebook, Youtube,
  Twitter, Instagram, Zap, Flame, Tv, Search, Bell, TrendingUp, Globe,
  ChevronDown, Wifi,
} from "lucide-react";

const NAV_ITEMS: Array<{ label: string; labelBn: string; view: View; badge?: string }> = [
  { label: "Live Scores", labelBn: "লাইভ স্কোর", view: { name: "scores" }, badge: "LIVE" },
  { label: "Live TV", labelBn: "লাইভ টিভি", view: { name: "live-tv" }, badge: "NEW" },
  { label: "Tables", labelBn: "পয়েন্ট টেবিল", view: { name: "standings" } },
  { label: "News", labelBn: "সংবাদ", view: { name: "news" } },
  { label: "Teams", labelBn: "দলসমূহ", view: { name: "teams" } },
  { label: "Players", labelBn: "খেলোয়াড়", view: { name: "players" } },
  { label: "Competitions", labelBn: "লিগ", view: { name: "competitions" } },
  { label: "Shorts", labelBn: "শর্টস", view: { name: "shorts" } },
  { label: "Community", labelBn: "কমিউনিটি", view: { name: "community" } },
];

const LEAGUE_RAIL: Array<{ label: string; abbr: string; view: View; color: string; flag?: string }> = [
  { label: "BFL", abbr: "BFL", view: { name: "competitions" }, color: "#006A4E", flag: "🇧🇩" },
  { label: "Premier League", abbr: "EPL", view: { name: "competitions" }, color: "#3D195B" },
  { label: "Champions League", abbr: "UCL", view: { name: "competitions" }, color: "#0B1F3F" },
  { label: "La Liga", abbr: "LaLiga", view: { name: "competitions" }, color: "#E5322D" },
  { label: "Serie A", abbr: "SerieA", view: { name: "competitions" }, color: "#0A2240" },
  { label: "Bundesliga", abbr: "BL", view: { name: "competitions" }, color: "#D20515" },
  { label: "Ligue 1", abbr: "L1", view: { name: "competitions" }, color: "#DBE00A" },
  { label: "SAFF", abbr: "SAFF", view: { name: "competitions" }, color: "#005AAB" },
  { label: "World Cup 2026", abbr: "WC26", view: { name: "competitions" }, color: "#7A1F3D" },
];

const MOBILE_NAV: Array<{ label: string; view: View; icon: React.ReactNode }> = [
  { label: "Home", view: { name: "home" }, icon: <Trophy className="h-5 w-5" aria-hidden /> },
  { label: "Scores", view: { name: "scores" }, icon: <Zap className="h-5 w-5" aria-hidden /> },
  { label: "Shorts", view: { name: "shorts" }, icon: <Video className="h-5 w-5" aria-hidden /> },
  { label: "News", view: { name: "news" }, icon: <Newspaper className="h-5 w-5" aria-hidden /> },
  { label: "Profile", view: { name: "profile" }, icon: <User2 className="h-5 w-5" aria-hidden /> },
];

/** Sky Sports–grade shield crest */
export function LogoMark({ size = 9 }: { size?: number }) {
  const w = size === 9 ? 32 : 38;
  const h = size === 9 ? 36 : 42;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 44 49"
      fill="none"
      aria-hidden
      className="shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
    >
      <defs>
        <linearGradient id="fhb-sh" x1="4" y1="2" x2="40" y2="47" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a1a1e" />
          <stop offset="0.6" stopColor="#141418" />
          <stop offset="1" stopColor="#0d0d10" />
        </linearGradient>
        <linearGradient id="fhb-g2" x1="22" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(255,255,255,0.18)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Shield base */}
      <path
        d="M22 1.5 L41.5 7.5 V23.5 C41.5 35.5 33.5 43.5 22 47.5 C10.5 43.5 2.5 35.5 2.5 23.5 V7.5 Z"
        fill="url(#fhb-sh)"
        stroke="oklch(0.6 0.235 25 / 0.8)"
        strokeWidth="1.5"
      />
      <path
        d="M22 1.5 L41.5 7.5 V23.5 C41.5 35.5 33.5 43.5 22 47.5 C10.5 43.5 2.5 35.5 2.5 23.5 V7.5 Z"
        fill="url(#fhb-g2)"
      />
      {/* Red stripe */}
      <path
        d="M2.5 30 C8.5 32.8 15 34.2 22 34.2 C29 34.2 35.5 32.8 41.5 30 V24 C35.5 26.8 29 28.2 22 28.2 C15 28.2 8.5 26.8 2.5 24 Z"
        fill="oklch(0.6 0.235 25)"
        opacity="0.95"
      />
      {/* FHB Text */}
      <text
        x="22" y="20"
        textAnchor="middle"
        fontFamily="Arial Black, sans-serif"
        fontWeight="900"
        fontSize="13"
        letterSpacing="0.8"
        fill="white"
      >
        FHB
      </text>
      {/* Star */}
      <path
        d="M22 36 l1 2.5 2.7 .4 -1.95 1.9 .46 2.7 -2.21 -1.16 -2.21 1.16 .46 -2.7 -1.95 -1.9 2.7 -.4 Z"
        fill="oklch(0.8 0.14 86)"
      />
    </svg>
  );
}

export function Header() {
  const { view, navigate, user, logout, language, setLanguage } = useAppStore();
  const live = useLiveScores();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bstTime, setBstTime] = useState("");
  const [bstDate, setBstDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setBstTime(
        now.toLocaleTimeString("en-GB", {
          timeZone: "Asia/Dhaka",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      setBstDate(
        now.toLocaleDateString("en-GB", {
          timeZone: "Asia/Dhaka",
          weekday: "short",
          day: "numeric",
          month: "short",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (v: View) => view.name === v.name;
  const liveCount = live.matches.length;

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out", description: "See you next match!" });
    navigate({ name: "home" });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "shadow-[0_4px_30px_rgba(0,0,0,0.95)]"
          : ""
      )}
    >
      {/* ── Top utility bar: International broadcast strip ── */}
      <div className="bg-[#04060b] border-b border-white/10 px-4 sm:px-6 py-1.5 text-[11px]">
        <div className="mx-auto max-w-[1440px] flex items-center justify-between gap-4">
          {/* Left: BST Clock + FIFA Rank */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 font-mono text-emerald-300 font-extrabold tracking-tight">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#00e676]" />
              </span>
              <span className="text-emerald-300 drop-shadow-[0_0_6px_rgba(0,230,118,0.4)]">{bstTime || "00:00:00"}</span>
              <span className="text-white/40 hidden sm:inline">|</span>
              <span className="text-white font-semibold hidden sm:inline">{bstDate}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-px h-3.5 bg-white/20" />
              <span className="text-[10px] uppercase font-black tracking-widest text-[#94a3b8]">FIFA BD</span>
              <span className="font-mono font-black text-white px-1.5 py-0.5 rounded bg-white/10">#183</span>
              <span className="text-emerald-400 font-black text-[10px] drop-shadow-[0_0_6px_rgba(0,230,118,0.5)]">▲2</span>
            </div>
          </div>

          {/* Center: Breaking News Ticker */}
          {liveCount === 0 && (
            <div className="hidden lg:flex items-center gap-2 flex-1 justify-center max-w-lg">
              <span className="shrink-0 px-2 py-0.5 bg-[#ff1e46] text-[9.5px] font-black uppercase tracking-widest text-white rounded shadow-[0_0_10px_rgba(255,30,70,0.5)]">
                LIVE DESK
              </span>
              <span className="text-white font-bold text-[11px] truncate">
                Bangladesh Premier League • Matchday 15 Broadcast Live
              </span>
            </div>
          )}

          {/* Right: Radio + Language */}
          <div className="flex items-center gap-2.5">
            {/* FHB Radio */}
            <div className="hidden md:flex items-center gap-2 px-3 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-white cursor-pointer hover:bg-red-950/80 transition-all shadow-[0_0_10px_rgba(255,30,70,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_#ff1e46]" />
              </span>
              <span className="font-black text-[10px] tracking-widest uppercase text-white">FHB Radio</span>
              <div className="flex items-end gap-[2px] h-3.5 ml-0.5">
                <span className="w-[2px] bg-red-400 rounded-full soundwave-bar-1" style={{ minHeight: "3px" }} />
                <span className="w-[2px] bg-red-400 rounded-full soundwave-bar-2" style={{ minHeight: "3px" }} />
                <span className="w-[2px] bg-red-400 rounded-full soundwave-bar-3" style={{ minHeight: "3px" }} />
                <span className="w-[2px] bg-red-400 rounded-full soundwave-bar-4" style={{ minHeight: "3px" }} />
                <span className="w-[2px] bg-red-400 rounded-full soundwave-bar-5" style={{ minHeight: "3px" }} />
              </div>
            </div>

            {/* Edition / Language Toggle */}
            <button
              onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-black text-white transition-all cursor-pointer shadow-sm"
            >
              {language === "bn" ? "🇧🇩 বাংলা" : "🇬🇧 English"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Live score ticker ── */}
      {liveCount > 0 && (
        <div className="relative flex h-[34px] items-center overflow-hidden border-b border-white/15 bg-[#090d19]">
          {/* LIVE badge — angled cut */}
          <span className="z-10 flex h-full shrink-0 items-center gap-1.5 bg-[#ff1e46] px-3.5 pr-5 text-[10px] font-black uppercase tracking-[0.15em] text-white [clip-path:polygon(0_0,100%_0,calc(100%-8px)_100%,0_100%)] shadow-[0_0_15px_rgba(255,30,70,0.5)]">
            <span className="live-dot h-2 w-2 rounded-full bg-white shadow-[0_0_6px_#ffffff]" aria-hidden />
            LIVE {fmtNum(liveCount)}
          </span>
          <div className="relative flex-1 overflow-hidden">
            <div className="marquee-track flex whitespace-nowrap">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex" aria-hidden={dup === 1}>
                  {[0, 1, 2].map((rep) =>
                    live.matches.map((m) => (
                      <button
                        key={`${dup}-${rep}-${m.id}`}
                        onClick={() => navigate({ name: "match-detail", id: m.id })}
                        className="mx-5 flex items-center gap-2 text-[11px] font-bold tracking-wide text-white transition-all hover:text-[#00e5ff]"
                      >
                        <span className="text-white font-extrabold">{m.homeTeam.name}</span>
                        <span className="tabular font-mono font-black text-white px-2 py-0.5 bg-[#ff1e46]/30 border border-[#ff1e46]/60 rounded text-[12px] shadow-[0_0_8px_rgba(255,30,70,0.3)]">
                          {fmtNum(m.homeScore)} – {fmtNum(m.awayScore)}
                        </span>
                        <span className="text-white font-extrabold">{m.awayTeam.name}</span>
                        <span className="text-emerald-400 text-[10px] font-black px-1 rounded bg-emerald-950/50">
                          {m.period === "HT" ? "HT" : `${fmtNum(m.minute)}'`}
                        </span>
                        <span className="text-white/30 ml-2 font-light">|</span>
                      </button>
                    ))
                  )}
                </div>
              ))}
            </div>
            <span className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-8 bg-gradient-to-r from-[#090d19] to-transparent" aria-hidden />
            <span className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-8 bg-gradient-to-l from-[#090d19] to-transparent" aria-hidden />
          </div>
        </div>
      )}

      {/* ── Main brand bar ── */}
      <div
        className={cn(
          "w-full border-b border-white/12 transition-all duration-200",
          scrolled ? "bg-[#06080f]/95 backdrop-blur-2xl" : "bg-[#06080f]"
        )}
      >
        <div className="mx-auto flex h-[62px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6">
          {/* Logo + wordmark */}
          <Link
            href="/"
            onClick={(e) => { e.preventDefault(); navigate({ name: "home" }); }}
            className="group flex shrink-0 items-center gap-3"
            aria-label="Football Hub Bangladesh homepage"
          >
            <span className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
              <LogoMark />
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-black text-[19px] tracking-tight text-white leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                FOOTBALL HUB
              </span>
              <span className="text-[10.5px] font-black tracking-[0.14em] uppercase text-[#ff1e46] mt-0.5 drop-shadow-[0_0_8px_rgba(255,30,70,0.4)]">
                BANGLADESH · BFL BROADCAST
              </span>
            </span>
          </Link>

          {/* Desktop nav — Sky Sports & Antipasto Pro style */}
          <nav className="hidden h-full items-center gap-1 lg:flex" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.view);
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.view)}
                  className={cn(
                    "relative flex h-[62px] items-center px-3.5 text-[13px] font-extrabold tracking-wide transition-all xl:px-4",
                    active ? "text-white" : "text-[#e2e8f0] hover:text-white"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {language === "bn" ? item.labelBn : item.label}
                  {item.badge && item.badge === "LIVE" && liveCount > 0 && (
                    <span className="ml-1.5 live-dot inline-block h-2 w-2 rounded-full bg-[#ff1e46] shadow-[0_0_6px_#ff1e46]" aria-hidden />
                  )}
                  {item.badge && item.badge === "NEW" && (
                    <span className="ml-1.5 inline-block px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                      LIVE TV
                    </span>
                  )}
                  {/* Active underline — solid glowing red bar */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-2 bottom-0 h-[3px] transition-all duration-200",
                      active ? "bg-[#ff1e46] opacity-100 shadow-[0_0_10px_#ff1e46]" : "opacity-0"
                    )}
                  />
                </button>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => navigate({ name: "teams" })}
              className="tap-target hidden h-9 w-9 items-center justify-center rounded border border-white/10 bg-white/5 text-white transition-all hover:bg-white/15 hover:border-white/30 md:flex"
              aria-label="Search"
            >
              <Search className="h-4.5 w-4.5" aria-hidden />
            </button>

            {/* LIVE counter pill */}
            {liveCount > 0 && (
              <button
                onClick={() => navigate({ name: "scores" })}
                className="hidden items-center gap-1.5 rounded border border-[#ff1e46]/60 bg-[#ff1e46]/20 px-3 py-1.5 text-[10.5px] font-black uppercase tracking-widest text-white shadow-[0_0_12px_rgba(255,30,70,0.35)] transition-all hover:bg-[#ff1e46]/35 sm:flex"
              >
                <span className="live-dot h-2 w-2 rounded-full bg-white shadow-[0_0_6px_#ffffff]" aria-hidden />
                LIVE {fmtNum(liveCount)}
              </button>
            )}

            {/* Premium */}
            <button
              onClick={() => navigate({ name: "premium" })}
              className="hidden items-center gap-1.5 rounded border border-amber-400/50 bg-amber-400/15 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wide text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.25)] transition-all hover:border-amber-400 hover:bg-amber-400/25 hover:text-white sm:flex"
            >
              <Crown className="h-3.5 w-3.5 text-amber-300" aria-hidden />
              VIP PASS
            </button>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 rounded border border-white/15 bg-white/10 p-1 pr-3 transition-all hover:border-white/30 hover:bg-white/20"
                    aria-label="Account menu"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                      <AvatarFallback className="bg-red-600/30 text-[11px] font-black text-white">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-[90px] truncate text-xs font-bold text-white sm:block">{user.name}</span>
                    <ChevronDown className="h-3 w-3 text-white" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 rounded border border-white/20 bg-[#0d1324] p-1.5 shadow-2xl">
                  <DropdownMenuLabel className="rounded py-2.5 text-xs text-white/80">
                    <span className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded bg-red-600 font-black text-sm text-white">
                        {user.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-col">
                        <span className="block truncate font-bold text-white">{user.name}</span>
                        <span className="block truncate text-[10px] text-white/70">{user.email}</span>
                      </span>
                    </span>
                    {user.isPremium && (
                      <span className="mt-2 inline-flex items-center gap-1 rounded bg-amber-400/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-300">
                        <Crown className="h-3 w-3" aria-hidden /> Premium
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-white/10" />
                  <DropdownMenuItem onClick={() => navigate({ name: "profile" })} className="gap-2.5 rounded text-xs text-white font-semibold focus:bg-white/10 focus:text-white">
                    <User2 className="h-4 w-4 text-red-400" aria-hidden /> My Profile
                  </DropdownMenuItem>
                  {(user.role === "CREATOR" || user.role === "ADMIN") && (
                    <>
                      <DropdownMenuItem onClick={() => navigate({ name: "upload" })} className="gap-2.5 rounded text-xs text-white font-semibold focus:bg-white/10 focus:text-white">
                        <Upload className="h-4 w-4 text-red-400" aria-hidden /> Upload Video
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate({ name: "earnings" })} className="gap-2.5 rounded text-xs text-white font-semibold focus:bg-white/10 focus:text-white">
                        <Wallet className="h-4 w-4 text-red-400" aria-hidden /> Earnings Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem onClick={() => navigate({ name: "admin" })} className="gap-2.5 rounded text-xs text-white font-semibold focus:bg-white/10 focus:text-white">
                      <LayoutDashboard className="h-4 w-4 text-red-400" aria-hidden /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate({ name: "premium" })} className="gap-2.5 rounded text-xs text-white font-semibold focus:bg-white/10 focus:text-white">
                    <Crown className="h-4 w-4 text-amber-400" aria-hidden /> Premium Membership
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-white/10" />
                  <DropdownMenuItem onClick={handleLogout} className="gap-2.5 rounded text-xs text-red-400 font-bold focus:bg-red-600/20 focus:text-red-400">
                    <LogOut className="h-4 w-4" aria-hidden /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <button
                  onClick={() => navigate({ name: "auth" })}
                  className="hidden h-9 items-center px-4 text-[12px] font-extrabold text-white transition-colors hover:text-[#ff1e46] lg:flex"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate({ name: "auth" })}
                  className="flex h-9 items-center rounded bg-[#ff1e46] px-4 text-[12px] font-black text-white transition-all hover:bg-[#e01438] shadow-[0_0_15px_rgba(255,30,70,0.4)] sheen"
                >
                  Join Free
                </button>
              </>
            )}

            {/* Mobile menu */}
            <button
              className="tap-target flex h-9 w-9 items-center justify-center rounded border border-white/20 bg-white/10 text-white lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── League quick-rail ── */}
      <div className="hidden border-b border-white/12 bg-[#0a0e1c] lg:block">
        <div className="no-scrollbar mx-auto flex max-w-[1440px] items-center gap-0 overflow-x-auto px-4 sm:px-6">
          {LEAGUE_RAIL.map((l) => (
            <button
              key={l.label}
              onClick={() => navigate(l.view)}
              className="group flex shrink-0 items-center gap-2 border-r border-white/10 px-3.5 py-2 text-[12px] font-extrabold text-white transition-all hover:bg-white/10 hover:text-[#00e5ff] first:pl-0"
            >
              {l.flag && <span className="text-[12px]">{l.flag}</span>}
              <span
                className="h-[7px] w-[7px] rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: l.color }}
                aria-hidden
              />
              {l.label}
            </button>
          ))}
          {/* Live Matches Indicator on Rail */}
          {liveCount > 0 && (
            <button
              onClick={() => navigate({ name: "scores" })}
              className="ml-auto flex shrink-0 items-center gap-1.5 px-3 py-2 text-[11px] font-black text-white uppercase tracking-wider bg-red-600/30 rounded"
            >
              <span className="live-dot h-2 w-2 rounded-full bg-[#ff1e46]" />
              {fmtNum(liveCount)} Live Now
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile menu portal ── */}
      {mobileOpen && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto border-t border-white/[0.08] bg-[#0d0d10]/98 backdrop-blur-2xl lg:hidden"
            style={{ top: liveCount > 0 ? "112px" : "82px" }}
          >
            <div className="px-4 pb-28 pt-4">
              {/* Nav grid */}
              <nav className="grid grid-cols-2 gap-2" aria-label="Mobile navigation">
                {NAV_ITEMS.map((item, i) => (
                  <button
                    key={item.label}
                    style={{ animationDelay: `${i * 30}ms` }}
                    onClick={() => { navigate(item.view); setMobileOpen(false); }}
                    className={cn(
                      "menu-item flex items-center gap-3 border px-4 py-3.5 text-sm font-bold transition-all active:scale-[0.97]",
                      isActive(item.view)
                        ? "border-red-600/50 bg-red-600/10 text-white"
                        : "border-white/[0.08] bg-white/[0.03] text-white/60"
                    )}
                  >
                    {language === "bn" ? item.labelBn : item.label}
                    {item.badge === "LIVE" && liveCount > 0 && (
                      <span className="ml-auto live-dot h-1.5 w-1.5 rounded-full bg-red-500" />
                    )}
                  </button>
                ))}
              </nav>

              {/* Premium CTA */}
              <button
                style={{ animationDelay: "300ms" }}
                onClick={() => { navigate({ name: "premium" }); setMobileOpen(false); }}
                className="menu-item gold-panel relative mt-3 flex w-full items-center gap-4 overflow-hidden border border-amber-500/25 p-4 text-left"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-amber-500/15 text-amber-400">
                  <Crown className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-black text-white">
                    Premium <span className="text-amber-400">PRO</span>
                  </span>
                  <span className="mt-0.5 block text-[11px] text-white/40">
                    Ad-free · Exclusive content
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-amber-400" />
              </button>

              {/* Mobile Ad */}
              <div className="menu-item mt-3" style={{ animationDelay: "360ms" }}>
                <AdSlot placement="MOBILE_BANNER" className="h-20" />
              </div>

              {/* Auth buttons */}
              {!user && (
                <div className="menu-item mt-4 grid grid-cols-2 gap-2.5" style={{ animationDelay: "420ms" }}>
                  <button
                    onClick={() => { navigate({ name: "auth" }); setMobileOpen(false); }}
                    className="h-12 border border-white/15 bg-white/[0.05] text-sm font-bold text-white/70 transition-colors hover:bg-white/[0.1]"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { navigate({ name: "auth" }); setMobileOpen(false); }}
                    className="h-12 bg-red-600 text-sm font-black text-white transition-colors hover:bg-red-500"
                  >
                    Join Free
                  </button>
                </div>
              )}

              {/* Social */}
              <div className="menu-item mt-5 flex items-center gap-2" style={{ animationDelay: "480ms" }}>
                {[
                  { label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
                  { label: "YouTube", icon: <Youtube className="h-4 w-4" /> },
                  { label: "X", icon: <Twitter className="h-4 w-4" /> },
                  { label: "Instagram", icon: <Instagram className="h-4 w-4" /> },
                ].map((s) => (
                  <button
                    key={s.label}
                    className="flex h-10 w-10 items-center justify-center border border-white/[0.08] bg-white/[0.04] text-white/40 transition-colors hover:border-red-500/40 hover:text-red-400"
                    aria-label={`FHB on ${s.label}`}
                  >
                    {s.icon}
                  </button>
                ))}
              </div>
              <p className="menu-item mt-4 text-center text-[10.5px] text-white/25" style={{ animationDelay: "520ms" }}>
                © {new Date().getFullYear()} Football Hub Bangladesh · footballhub.com.bd
              </p>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}

export function BottomNav() {
  const { view, navigate } = useAppStore();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.07] bg-[#0d0d10]/96 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {MOBILE_NAV.map((item) => {
          const active =
            view.name === item.view.name ||
            (item.view.name === "profile" && ["profile", "earnings", "admin"].includes(view.name)) ||
            (item.view.name === "news" && view.name === "news-detail");
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.view)}
              className={cn(
                "tap-target relative flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-bold transition-colors",
                active ? "text-red-400" : "text-white/35 hover:text-white/70"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-4 top-0 h-[2px] transition-all duration-200",
                  active ? "bg-red-500 opacity-100" : "opacity-0"
                )}
              />
              <span className={cn(
                "flex h-7 w-11 items-center justify-center transition-all duration-200",
                active && "bg-red-600/15 rounded"
              )}>
                {item.icon}
              </span>
              <span className="tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
