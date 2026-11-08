"use client";

import { useState } from "react";
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
import { toBn } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Trophy, Calendar, Newspaper, Users, Video, Shield, LayoutDashboard, LogOut, User2,
  Crown, Upload, Wallet, Menu, X, Radio, ChevronRight, Flame, Zap,
} from "lucide-react";

const NAV_ITEMS: Array<{ label: string; view: View; icon: React.ReactNode }> = [
  { label: "লাইভ স্কোর", view: { name: "scores" }, icon: <Zap className="h-4 w-4" aria-hidden /> },
  { label: "টেবিল", view: { name: "standings" }, icon: <Trophy className="h-4 w-4" aria-hidden /> },
  { label: "নিউজ", view: { name: "news" }, icon: <Newspaper className="h-4 w-4" aria-hidden /> },
  { label: "দল", view: { name: "teams" }, icon: <Users className="h-4 w-4" aria-hidden /> },
  { label: "খেলোয়াড়", view: { name: "players" }, icon: <Flame className="h-4 w-4" aria-hidden /> },
  { label: "টুর্নামেন্ট", view: { name: "competitions" }, icon: <Shield className="h-4 w-4" aria-hidden /> },
  { label: "শর্টস", view: { name: "shorts" }, icon: <Video className="h-4 w-4" aria-hidden /> },
  { label: "কমিউনিটি", view: { name: "community" }, icon: <Radio className="h-4 w-4" aria-hidden /> },
];

const MOBILE_NAV: Array<{ label: string; view: View; icon: React.ReactNode }> = [
  { label: "হোম", view: { name: "home" }, icon: <Trophy className="h-5 w-5" aria-hidden /> },
  { label: "স্কোর", view: { name: "scores" }, icon: <Zap className="h-5 w-5" aria-hidden /> },
  { label: "শর্টস", view: { name: "shorts" }, icon: <Video className="h-5 w-5" aria-hidden /> },
  { label: "নিউজ", view: { name: "news" }, icon: <Newspaper className="h-5 w-5" aria-hidden /> },
  { label: "প্রোফাইল", view: { name: "profile" }, icon: <User2 className="h-5 w-5" aria-hidden /> },
];

export function Header() {
  const { view, navigate, user, logout } = useAppStore();
  const live = useLiveScores();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (v: View) => view.name === v.name;

  const handleLogout = async () => {
    await logout();
    toast({ title: "লগআউট সফল", description: "আবার দেখা হবে!" });
    navigate({ name: "home" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
      {/* Live ticker strip */}
      {live.matches.length > 0 && (
        <div className="relative flex h-8 items-center overflow-hidden border-b border-fhb-red/25 bg-fhb-red/10">
          <span className="z-10 flex h-full shrink-0 items-center gap-1.5 bg-fhb-red px-2.5 font-display text-[10px] font-bold uppercase tracking-widest text-white">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
            লাইভ
          </span>
          <div className="marquee-track flex whitespace-nowrap">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex" aria-hidden={dup === 1}>
                {live.matches.map((m) => (
                  <button
                    key={`${dup}-${m.id}`}
                    onClick={() => navigate({ name: "match-detail", id: m.id })}
                    className="mx-4 flex items-center gap-2 font-display text-[11px] font-semibold tracking-wide text-foreground/90 hover:text-fhb-red"
                  >
                    <span>{m.homeTeam.name}</span>
                    <span className="rounded bg-fhb-red/20 px-1.5 text-fhb-red">
                      {toBn(m.homeScore)} - {toBn(m.awayScore)}
                    </span>
                    <span>{m.awayTeam.name}</span>
                    <span className="text-muted-foreground">({m.period === "HT" ? "HT" : `${toBn(m.minute)}′`})</span>
                    <span className="text-muted-foreground/50">•</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate({ name: "home" });
          }}
          className="flex shrink-0 items-center gap-2"
          aria-label="Football Hub Bangladesh হোমপেজ"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 font-display text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 sm:h-10 sm:w-10">
            F<span className="text-fhb-red">H</span>
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-base font-bold tracking-wider">
              FOOTBALL HUB <span className="text-fhb-red">BD</span>
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">ফুটবলের ডিজিটাল ঠিকানা</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="প্রধান মেনু">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.view)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors",
                isActive(item.view) ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border bg-card p-1 pr-2.5 transition-colors hover:border-primary/50" aria-label="অ্যাকাউন্ট মেনু">
                  <Avatar className="h-7 w-7 border">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                    <AvatarFallback className="bg-primary/15 text-[11px] font-bold text-primary">{user.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[90px] truncate text-xs font-semibold sm:block">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {user.email}
                  {user.isPremium && (
                    <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-fhb-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-fhb-gold">
                      <Crown className="h-3 w-3" aria-hidden /> প্রিমিয়াম
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ name: "profile" })} className="gap-2 text-xs">
                  <User2 className="h-4 w-4" aria-hidden /> আমার প্রোফাইল
                </DropdownMenuItem>
                {(user.role === "CREATOR" || user.role === "ADMIN") && (
                  <>
                    <DropdownMenuItem onClick={() => navigate({ name: "upload" })} className="gap-2 text-xs">
                      <Upload className="h-4 w-4" aria-hidden /> ভিডিও আপলোড
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ name: "earnings" })} className="gap-2 text-xs">
                      <Wallet className="h-4 w-4" aria-hidden /> আয়ের ড্যাশবোর্ড
                    </DropdownMenuItem>
                  </>
                )}
                {user.role === "ADMIN" && (
                  <DropdownMenuItem onClick={() => navigate({ name: "admin" })} className="gap-2 text-xs">
                    <LayoutDashboard className="h-4 w-4" aria-hidden /> অ্যাডমিন প্যানেল
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate({ name: "premium" })} className="gap-2 text-xs">
                  <Crown className="h-4 w-4 text-fhb-gold" aria-hidden /> প্রিমিয়াম সদস্যতা
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2 text-xs text-fhb-red">
                  <LogOut className="h-4 w-4" aria-hidden /> লগআউট
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ name: "auth" })} className="text-xs">
                লগইন
              </Button>
              <Button size="sm" onClick={() => navigate({ name: "auth" })} className="gap-1 bg-primary text-xs font-bold">
                যোগ দিন <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </>
          )}

          {/* Mobile menu trigger */}
          <button
            className="tap-target flex items-center justify-center rounded-lg text-foreground lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown nav */}
      {mobileOpen && (
        <nav className="border-t bg-background px-4 py-3 lg:hidden" aria-label="মোবাইল মেনু">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.view);
                  setMobileOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors",
                  isActive(item.view) ? "border-primary/50 bg-primary/15 text-primary" : "border-border bg-card text-foreground hover:bg-accent"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                navigate({ name: "premium" });
                setMobileOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-fhb-gold/40 bg-fhb-gold/10 px-3 py-2.5 text-xs font-semibold text-fhb-gold"
            >
              <Crown className="h-4 w-4" aria-hidden /> প্রিমিয়াম
            </button>
          </div>
          <div className="mt-3">
            <AdSlot placement="MOBILE_BANNER" className="h-16" />
          </div>
        </nav>
      )}
    </header>
  );
}

export function BottomNav() {
  const { view, navigate, user } = useAppStore();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      aria-label="মোবাইল নেভিগেশন"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
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
                "tap-target flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-semibold transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className={cn("relative", active && "drop-shadow-[0_0_6px_var(--primary)]")}>{item.icon}</span>
              {item.label}
              {item.label === "প্রোফাইল" && user?.isPremium && (
                <span className="absolute right-3 top-1 h-1.5 w-1.5 rounded-full bg-fhb-gold" aria-label="প্রিমিয়াম" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
