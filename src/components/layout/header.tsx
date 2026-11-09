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
  Twitter, Instagram, Zap, Flame, Heart, Tv,
} from "lucide-react";

const NAV_ITEMS: Array<{ label: string; view: View; icon: React.ReactNode }> = [
  { label: "Live Scores", view: { name: "scores" }, icon: <Zap className="h-4 w-4" aria-hidden /> },
  { label: "Live TV", view: { name: "live-tv" }, icon: <Tv className="h-4 w-4" aria-hidden /> },
  { label: "Standings", view: { name: "standings" }, icon: <Trophy className="h-4 w-4" aria-hidden /> },
  { label: "News", view: { name: "news" }, icon: <Newspaper className="h-4 w-4" aria-hidden /> },
  { label: "Teams", view: { name: "teams" }, icon: <Users className="h-4 w-4" aria-hidden /> },
  { label: "Players", view: { name: "players" }, icon: <Flame className="h-4 w-4" aria-hidden /> },
  { label: "Competitions", view: { name: "competitions" }, icon: <Shield className="h-4 w-4" aria-hidden /> },
  { label: "Shorts", view: { name: "shorts" }, icon: <Video className="h-4 w-4" aria-hidden /> },
  { label: "Community", view: { name: "community" }, icon: <Radio className="h-4 w-4" aria-hidden /> },
];

const MOBILE_NAV: Array<{ label: string; view: View; icon: React.ReactNode }> = [
  { label: "Home", view: { name: "home" }, icon: <Trophy className="h-5 w-5" aria-hidden /> },
  { label: "Scores", view: { name: "scores" }, icon: <Zap className="h-5 w-5" aria-hidden /> },
  { label: "Shorts", view: { name: "shorts" }, icon: <Video className="h-5 w-5" aria-hidden /> },
  { label: "News", view: { name: "news" }, icon: <Newspaper className="h-5 w-5" aria-hidden /> },
  { label: "Profile", view: { name: "profile" }, icon: <User2 className="h-5 w-5" aria-hidden /> },
];

/** Premium SVG shield crest — club-grade brand mark. */
export function LogoMark({ size = 9 }: { size?: number }) {
  return (
    <svg
      width={size === 9 ? 36 : 42}
      height={size === 9 ? 40 : 47}
      viewBox="0 0 44 49"
      fill="none"
      aria-hidden
      className="shrink-0 drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
    >
      <defs>
        <linearGradient id="fhb-shield" x1="4" y1="2" x2="40" y2="47" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.38 0.09 160)" />
          <stop offset="0.55" stopColor="oklch(0.31 0.075 162)" />
          <stop offset="1" stopColor="oklch(0.22 0.05 165)" />
        </linearGradient>
        <linearGradient id="fhb-gloss" x1="22" y1="2" x2="22" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(1 0 0 / 0.25)" />
          <stop offset="1" stopColor="oklch(1 0 0 / 0)" />
        </linearGradient>
      </defs>
      {/* Shield */}
      <path
        d="M22 1.5 L41.5 7.5 V23.5 C41.5 35.5 33.5 43.5 22 47.5 C10.5 43.5 2.5 35.5 2.5 23.5 V7.5 Z"
        fill="url(#fhb-shield)"
        stroke="oklch(0.84 0.185 148 / 0.75)"
        strokeWidth="1.6"
      />
      <path
        d="M22 1.5 L41.5 7.5 V23.5 C41.5 35.5 33.5 43.5 22 47.5 C10.5 43.5 2.5 35.5 2.5 23.5 V7.5 Z"
        fill="url(#fhb-gloss)"
      />
      {/* Red band (Bangladesh) */}
      <path d="M2.5 30.5 C8.5 33.2 15 34.6 22 34.6 C29 34.6 35.5 33.2 41.5 30.5 V23.5 C35.5 26.6 29 28.2 22 28.2 C15 28.2 8.5 26.6 2.5 23.5 Z" fill="oklch(0.65 0.24 25)" opacity="0.92" />
      {/* Monogram */}
      <text
        x="22"
        y="21"
        textAnchor="middle"
        fontFamily="Oswald, var(--font-oswald), sans-serif"
        fontWeight="700"
        fontSize="15.5"
        letterSpacing="0.5"
        fill="oklch(0.97 0.02 150)"
      >
        FHB
      </text>
      {/* Star */}
      <path
        d="M22 36.2 l1.3 2.7 3 .4 -2.2 2.1 .5 3 -2.6 -1.4 -2.6 1.4 .5 -3 -2.2 -2.1 3 -.4 Z"
        fill="oklch(0.83 0.125 88)"
      />
    </svg>
  );
}

export function Header() {
  const { view, navigate, user, logout } = useAppStore();
  const live = useLiveScores();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (v: View) => view.name === v.name;
  const liveCount = live.matches.length;

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out", description: "See you again!" });
    navigate({ name: "home" });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "border-border/80 bg-background/85 shadow-[0_10px_36px_-18px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
          : "border-border/40 bg-background/60 backdrop-blur-xl"
      )}
    >
      {/* ── Live score ticker — broadcast lower third ── */}
      {liveCount > 0 && (
        <div className="relative flex h-9 items-center overflow-hidden border-b border-border/50 bg-card/70">
          <span className="z-10 flex h-full shrink-0 items-center gap-1.5 bg-fhb-red px-3.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white [clip-path:polygon(0_0,100%_0,calc(100%-8px)_100%,0_100%)]">
            <span className="live-dot h-1.5 w-1.5 rounded-[2px] bg-white" aria-hidden />
            LIVE {fmtNum(liveCount)}
          </span>
          <div className="relative flex-1 overflow-hidden">
            <div className="marquee-track flex whitespace-nowrap">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex" aria-hidden={dup === 1}>
                  {live.matches.map((m) => (
                    <button
                      key={`${dup}-${m.id}`}
                      onClick={() => navigate({ name: "match-detail", id: m.id })}
                      className="mx-5 flex items-center gap-2 font-display text-[11px] font-semibold tracking-wide text-foreground/85 transition-colors hover:text-primary"
                    >
                      <span>{m.homeTeam.name}</span>
                      <span className="tabular rounded-md bg-fhb-red/15 px-1.5 py-0.5 font-bold text-fhb-red">
                        {fmtNum(m.homeScore)} - {fmtNum(m.awayScore)}
                      </span>
                      <span>{m.awayTeam.name}</span>
                      <span className="text-muted-foreground">
                        ({m.period === "HT" ? "HT" : `${fmtNum(m.minute)}′`})
                      </span>
                      <span className="ml-4 h-1 w-1 rounded-full bg-primary/60" aria-hidden />
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <span
              className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-12 bg-gradient-to-r from-card to-transparent"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-12 bg-gradient-to-l from-card to-transparent"
              aria-hidden
            />
          </div>
        </div>
      )}

      {/* ── Main bar ── */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[68px] sm:px-6">
        {/* Logo + wordmark */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate({ name: "home" });
          }}
          className="group flex shrink-0 items-center gap-3"
          aria-label="Football Hub Bangladesh homepage"
        >
          <span className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
            <LogoMark />
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-[17px] font-bold tracking-[0.06em] text-foreground">
              FOOTBALL HUB <span className="text-primary">BD</span>
            </span>
            <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Bangladesh's Football Network
            </span>
          </span>
        </Link>

        {/* Desktop nav — underline tabs */}
        <nav className="hidden h-full items-center lg:flex" aria-label="Main menu">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.view)}
              className={cn(
                "relative flex h-full items-center px-3 text-[13px] font-semibold transition-colors",
                isActive(item.view)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive(item.view) ? "page" : undefined}
            >
              {item.label}
              {liveCount > 0 && item.view.name === "scores" && (
                <span className="live-dot ml-1.5 h-1.5 w-1.5 rounded-[2px] bg-fhb-red" aria-hidden />
              )}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-2.5 bottom-0 h-[2.5px] rounded-full transition-all duration-300",
                  isActive(item.view) ? "bg-primary opacity-100" : "bg-primary opacity-0"
                )}
              />
            </button>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {liveCount > 0 && (
            <button
              onClick={() => navigate({ name: "scores" })}
              className="hidden items-center gap-1.5 rounded-full border border-fhb-red/45 bg-fhb-red/10 px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-wider text-fhb-red transition-all hover:bg-fhb-red/20 sm:flex"
              aria-label={`${fmtNum(liveCount)} matches live right now — view scores`}
            >
              <span className="live-dot h-1.5 w-1.5 rounded-[2px] bg-fhb-red" aria-hidden />
              LIVE {fmtNum(liveCount)}
            </button>
          )}

          <button
            onClick={() => navigate({ name: "premium" })}
            className="sheen hidden items-center gap-1.5 rounded-full border border-fhb-gold/45 bg-gradient-to-b from-fhb-gold/20 to-fhb-gold/5 px-3.5 py-1.5 text-[11px] font-bold text-fhb-gold transition-all hover:border-fhb-gold/70 hover:from-fhb-gold/30 sm:flex"
          >
            <Crown className="h-3.5 w-3.5" aria-hidden />
            Premium
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-2.5 transition-all hover:border-primary/50 hover:shadow-[0_6px_20px_-8px_rgba(0,0,0,0.6)]"
                  aria-label="Account menu"
                >
                  <Avatar className="h-7 w-7 border border-border/60">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                    <AvatarFallback className="bg-primary/15 text-[11px] font-bold text-primary">{user.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[90px] truncate text-xs font-semibold sm:block">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-xl border-border/80 p-1.5">
                <DropdownMenuLabel className="rounded-lg py-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 font-display text-xs font-bold text-primary">
                      {user.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-col">
                      <span className="block truncate font-semibold text-foreground">{user.name}</span>
                      <span className="block truncate text-[10px]">{user.email}</span>
                    </span>
                  </span>
                  {user.isPremium && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-fhb-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-fhb-gold">
                      <Crown className="h-3 w-3" aria-hidden /> Premium Member
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem onClick={() => navigate({ name: "profile" })} className="gap-2.5 rounded-lg text-xs">
                  <User2 className="h-4 w-4 text-primary" aria-hidden /> My Profile
                </DropdownMenuItem>
                {(user.role === "CREATOR" || user.role === "ADMIN") && (
                  <>
                    <DropdownMenuItem onClick={() => navigate({ name: "upload" })} className="gap-2.5 rounded-lg text-xs">
                      <Upload className="h-4 w-4 text-primary" aria-hidden /> Upload Video
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ name: "earnings" })} className="gap-2.5 rounded-lg text-xs">
                      <Wallet className="h-4 w-4 text-primary" aria-hidden /> Earnings Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                {user.role === "ADMIN" && (
                  <DropdownMenuItem onClick={() => navigate({ name: "admin" })} className="gap-2.5 rounded-lg text-xs">
                    <LayoutDashboard className="h-4 w-4 text-primary" aria-hidden /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate({ name: "premium" })} className="gap-2.5 rounded-lg text-xs">
                  <Crown className="h-4 w-4 text-fhb-gold" aria-hidden /> Premium Membership
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem onClick={handleLogout} className="gap-2.5 rounded-lg text-xs text-fhb-red focus:text-fhb-red">
                  <LogOut className="h-4 w-4" aria-hidden /> Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ name: "auth" })} className="text-xs font-semibold">
                Log In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate({ name: "auth" })}
                className="sheen gap-1 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground shadow-[0_8px_22px_-8px_var(--primary)] hover:bg-primary/90"
              >
                Join <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </>
          )}

          {/* Mobile menu trigger */}
          <button
            className="tap-target flex items-center justify-center rounded-xl border border-border bg-card text-foreground lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile full menu (portal — header backdrop-filter would
          otherwise become the containing block for fixed positioning) ── */}
      {mobileOpen &&
        createPortal(
          <div
            className={cn(
              "fixed inset-x-0 bottom-0 z-40 overflow-y-auto border-t border-border bg-background/98 backdrop-blur-2xl lg:hidden",
              liveCount > 0 ? "top-[100px] sm:top-[104px]" : "top-16 sm:top-[68px]"
            )}
          >
            <div className="px-4 pb-24 pt-5">
              {/* Nav grid */}
              <nav className="grid grid-cols-2 gap-2.5" aria-label="Mobile menu">
                {NAV_ITEMS.map((item, i) => (
                  <button
                    key={item.label}
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => {
                      navigate(item.view);
                      setMobileOpen(false);
                    }}
                    className={cn(
                      "menu-item flex items-center gap-3 rounded-2xl border px-4 py-4 text-sm font-semibold transition-all active:scale-[0.97]",
                      isActive(item.view)
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground"
                    )}
                  >
                    <span className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      isActive(item.view) ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Premium banner */}
              <button
                style={{ animationDelay: "360ms" }}
                onClick={() => {
                  navigate({ name: "premium" });
                  setMobileOpen(false);
                }}
                className="menu-item gold-panel relative mt-4 flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-fhb-gold/30 p-4 text-left"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-fhb-gold/20 text-fhb-gold">
                  <Crown className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-foreground">
                    Premium <span className="text-fhb-gold">PRO</span>
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    Ad-free + exclusive content
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-fhb-gold" aria-hidden />
              </button>

              {/* Ad slot */}
              <div className="menu-item mt-4" style={{ animationDelay: "400ms" }}>
                <AdSlot placement="MOBILE_BANNER" className="h-20" />
              </div>

              {/* Auth cluster */}
              {!user && (
                <div className="menu-item mt-5 grid grid-cols-2 gap-2.5" style={{ animationDelay: "440ms" }}>
                  <Button
                    variant="outline"
                    className="h-12 rounded-xl text-sm font-semibold"
                    onClick={() => {
                      navigate({ name: "auth" });
                      setMobileOpen(false);
                    }}
                  >
                    Log In
                  </Button>
                  <Button
                    className="sheen h-12 rounded-xl bg-primary text-sm font-bold text-primary-foreground"
                    onClick={() => {
                      navigate({ name: "auth" });
                      setMobileOpen(false);
                    }}
                  >
                    Join Free
                  </Button>
                </div>
              )}

              {/* Socials */}
              <div className="menu-item mt-6 flex items-center justify-center gap-2" style={{ animationDelay: "480ms" }}>
                {[
                  { label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
                  { label: "YouTube", icon: <Youtube className="h-4 w-4" /> },
                  { label: "X (Twitter)", icon: <Twitter className="h-4 w-4" /> },
                  { label: "Instagram", icon: <Instagram className="h-4 w-4" /> },
                ].map((s) => (
                  <button
                    key={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                    aria-label={`FHB ${s.label}`}
                  >
                    {s.icon}
                  </button>
                ))}
              </div>
              <p className="menu-item mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground" style={{ animationDelay: "520ms" }}>
                <Heart className="h-3 w-3 text-fhb-red" aria-hidden />
                Made for the football fans of Bangladesh — from Dhaka
              </p>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}

export function BottomNav() {
  const { view, navigate, user } = useAppStore();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid max-w-lg">
        {MOBILE_NAV.map((item) => {
          const active =
            view.name === item.view.name ||
            (item.view.name === "profile" && (view.name === "profile" || view.name === "earnings" || view.name === "admin")) ||
            (item.view.name === "news" && view.name === "news-detail");
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.view)}
              className={cn(
                "tap-target relative flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-semibold transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-5 top-0 h-[2.5px] rounded-full transition-all duration-300",
                  active ? "bg-primary opacity-100" : "opacity-0"
                )}
              />
              <span
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-full transition-all duration-300",
                  active && "bg-primary/15"
                )}
              >
                {item.icon}
              </span>
              {item.label}
              {item.label === "Profile" && user?.isPremium && (
                <span className="absolute right-6 top-2 h-1.5 w-1.5 rounded-full bg-fhb-gold" aria-label="Premium" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
