"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppStore, type View } from "@/store/app-store";
import { useLiveScores } from "@/components/providers/live-score-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { TeamRef, Player, NewsArticle } from "@/lib/types";
import { TeamCrest } from "@/components/football/team-badge";
import { fmtNum } from "@/lib/format";
import {
  Home, Zap, Table2, Newspaper, Shield, Users, User, Trophy, Video, Tv,
  MessageSquare, Crown, Upload, Wallet, LayoutDashboard, LogOut, Search,
  Menu, X, ChevronRight, MoreHorizontal, Radio,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   FHB 4.0 — App chrome: brand mark, quick search, header bar,
   desktop left rail nav, mobile sheet menu, mobile bottom nav.
   Flat, dense, institutional — FotMob/Sofascore shell pattern.
   ════════════════════════════════════════════════════════════════ */

/* ── Brand mark — green tile, condensed F, national red dot ── */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <span
      className="relative flex shrink-0 select-none items-center justify-center rounded-[7px] bg-primary"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="font-display font-extrabold leading-none text-primary-foreground"
        style={{ fontSize: Math.round(size * 0.58) }}
      >
        F
      </span>
      <span
        className="absolute rounded-full bg-fhb-red"
        style={{ width: Math.max(4, size * 0.16), height: Math.max(4, size * 0.16), right: size * 0.14, bottom: size * 0.14 }}
      />
    </span>
  );
}

function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={compact ? 28 : 30} />
      <span className="hidden leading-none sm:block">
        <span className="label-cond block text-[15px] font-bold tracking-[0.06em] text-foreground">
          FOOTBALL HUB
        </span>
        <span className="mt-[3px] block text-[8.5px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Bangladesh
        </span>
      </span>
    </span>
  );
}

/* ── Navigation model (single source of truth) ── */
type NavItem = { label: string; icon: React.ElementType; view: View; premium?: boolean };

const NAV_SECTIONS: Array<{ title?: string; items: NavItem[] }> = [
  {
    items: [{ label: "Home", icon: Home, view: { name: "home" } }],
  },
  {
    title: "Match Centre",
    items: [
      { label: "Live Scores", icon: Zap, view: { name: "scores" } },
      { label: "Tables", icon: Table2, view: { name: "standings" } },
      { label: "News", icon: Newspaper, view: { name: "news" } },
    ],
  },
  {
    title: "Discover",
    items: [
      { label: "Teams", icon: Shield, view: { name: "teams" } },
      { label: "Players", icon: Users, view: { name: "players" } },
      { label: "Competitions", icon: Trophy, view: { name: "competitions" } },
    ],
  },
  {
    title: "Watch",
    items: [
      { label: "Shorts", icon: Video, view: { name: "shorts" } },
      { label: "Live TV", icon: Tv, view: { name: "live-tv" } },
    ],
  },
  {
    title: "Community",
    items: [{ label: "Fan Community", icon: MessageSquare, view: { name: "community" } }],
  },
  {
    title: "Creator",
    items: [
      { label: "Upload", icon: Upload, view: { name: "upload" } },
      { label: "Earnings", icon: Wallet, view: { name: "earnings" } },
    ],
  },
  {
    items: [{ label: "Premium", icon: Crown, view: { name: "premium" }, premium: true }],
  },
];

/** Map detail/sub views back to their parent nav item for active states. */
const PARENT_MAP: Record<string, string> = {
  "match-detail": "scores",
  "news-detail": "news",
  "team-detail": "teams",
  "player-detail": "players",
  "competition-detail": "competitions",
};

function useActiveNav() {
  const view = useAppStore((s) => s.view);
  const name = PARENT_MAP[view.name] ?? view.name;
  return (item: NavItem) => item.view.name === name;
}

/* ── Live count badge for Live Scores nav item ── */
function useLiveCount() {
  const live = useLiveScores();
  return live.matches.length;
}

/* ════════════════════════════════════════════════════════════════
   QuickSearch — global fuzzy search across teams / players / news.
   Debounced, keyboard-dismissible, result-grouped.
   ════════════════════════════════════════════════════════════════ */
type SearchResults = { teams: TeamRef[]; players: Player[]; articles: NewsArticle[] };

function QuickSearch({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useAppStore((s) => s.navigate);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResults>({ teams: [], players: [], articles: [] });
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults({ teams: [], players: [], articles: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const [tm, pl, nw] = await Promise.all([
          fetch(`/api/teams?q=${encodeURIComponent(term)}`).then((r) => r.json()),
          fetch(`/api/players?q=${encodeURIComponent(term)}&sort=name`).then((r) => r.json()),
          fetch(`/api/news?limit=40`).then((r) => r.json()),
        ]);
        const termLower = term.toLowerCase();
        const articles = (nw?.data?.articles ?? []) as NewsArticle[];
        setResults({
          teams: (tm?.data?.teams ?? []).slice(0, 4),
          players: (pl?.data?.players ?? []).slice(0, 4),
          articles: articles
            .filter((a) => a.title.toLowerCase().includes(termLower) || a.excerpt.toLowerCase().includes(termLower))
            .slice(0, 4),
        });
      } catch {
        setResults({ teams: [], players: [], articles: [] });
      } finally {
        setLoading(false);
      }
    }, 260);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const go = (view: View) => {
    navigate(view);
    setOpen(false);
    setQ("");
    onNavigate?.();
  };

  const total = results.teams.length + results.players.length + results.articles.length;
  const showPanel = open && q.trim().length >= 2;

  return (
    <div ref={boxRef} className="relative w-full max-w-[420px]">
      <label className="flex h-9 w-full items-center gap-2.5 rounded-[7px] border border-input bg-white/[0.03] px-3 transition-colors focus-within:border-primary/50 focus-within:bg-white/[0.05]">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search teams, players, news…"
          className="h-full w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/70"
          aria-label="Search Football Hub"
        />
        {q && (
          <button
            onClick={() => {
              setQ("");
            }}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] text-muted-foreground hover:bg-white/10 hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        )}
      </label>

      {showPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[80] overflow-hidden rounded-lg border border-border bg-popover shadow-[0_16px_48px_-12px_rgba(0,0,0,0.7)]">
          {loading && (
            <p className="px-4 py-5 text-[12px] text-muted-foreground">Searching…</p>
          )}
          {!loading && total === 0 && (
            <p className="px-4 py-5 text-[12px] text-muted-foreground">
              No results for “{q.trim()}”. Try a team, player or keyword.
            </p>
          )}
          {!loading && total > 0 && (
            <div className="max-h-[min(70vh,480px)] overflow-y-auto fhb-scroll py-1.5">
              {results.teams.length > 0 && (
                <SearchGroup title="Teams">
                  {results.teams.map((t) => (
                    <SearchRow key={t.id} onClick={() => go({ name: "team-detail", id: t.id })}>
                      <TeamCrest team={t} size="xs" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-foreground">{t.name}</span>
                        {t.city && <span className="block truncate text-[11px] text-muted-foreground">{t.city}</span>}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" aria-hidden />
                    </SearchRow>
                  ))}
                </SearchGroup>
              )}
              {results.players.length > 0 && (
                <SearchGroup title="Players">
                  {results.players.map((p) => (
                    <SearchRow key={p.id} onClick={() => go({ name: "player-detail", id: p.id })}>
                      <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] bg-elevated text-[9px] font-bold text-muted-foreground">
                        {p.position}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-foreground">{p.name}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {p.team?.name ?? "Free agent"} · {fmtNum(p.goals)} goals
                        </span>
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" aria-hidden />
                    </SearchRow>
                  ))}
                </SearchGroup>
              )}
              {results.articles.length > 0 && (
                <SearchGroup title="News">
                  {results.articles.map((a) => (
                    <SearchRow key={a.id} onClick={() => go({ name: "news-detail", id: a.id })}>
                      <Newspaper className="h-[18px] w-[18px] shrink-0 text-muted-foreground/70" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-foreground">{a.title}</span>
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" aria-hidden />
                    </SearchRow>
                  ))}
                </SearchGroup>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70">
        {title}
      </p>
      <div>{children}</div>
    </div>
  );
}

function SearchRow({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-white/[0.05]"
    >
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   Account menu — avatar dropdown (signed in) / Sign in CTA.
   ════════════════════════════════════════════════════════════════ */
function AccountControl({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout, navigate } = useAppStore();
  const { toast } = useToast();

  if (!user) {
    return (
      <button
        onClick={() => {
          navigate({ name: "auth" });
          onNavigate?.();
        }}
        className="flex h-9 items-center gap-2 rounded-[7px] bg-primary px-3.5 text-[12.5px] font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97]"
      >
        <User className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-9 items-center gap-2 rounded-[7px] border border-border bg-white/[0.02] pr-2.5 pl-1.5 transition-colors hover:border-white/20"
          aria-label="Account menu"
        >
          <Avatar className="h-6.5 w-6.5 h-[26px] w-[26px]">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            ) : null}
            <AvatarFallback className="bg-primary/15 text-[10px] font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[90px] truncate text-[12.5px] font-medium text-foreground/90 sm:block">
            {user.name.split(" ")[0]}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-foreground">{user.name}</p>
          <p className="truncate text-[11px] font-normal text-muted-foreground">@{user.username}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate({ name: "profile", username: user.username })} className="gap-2.5 text-[13px]">
          <User className="h-4 w-4 text-muted-foreground" aria-hidden /> My Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ name: "upload" })} className="gap-2.5 text-[13px]">
          <Upload className="h-4 w-4 text-muted-foreground" aria-hidden /> Upload Content
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ name: "earnings" })} className="gap-2.5 text-[13px]">
          <Wallet className="h-4 w-4 text-muted-foreground" aria-hidden /> Creator Earnings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ name: "premium" })} className="gap-2.5 text-[13px]">
          <Crown className="h-4 w-4 text-fhb-gold" aria-hidden /> Premium Membership
        </DropdownMenuItem>
        {user.role === "ADMIN" && (
          <DropdownMenuItem onClick={() => navigate({ name: "admin" })} className="gap-2.5 text-[13px]">
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" aria-hidden /> Admin Console
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await logout();
            toast({ title: "Signed out", description: "See you at the next matchday." });
          }}
          className="gap-2.5 text-[13px] text-fhb-red focus:text-fhb-red"
        >
          <LogOut className="h-4 w-4" aria-hidden /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ════════════════════════════════════════════════════════════════
   Header — 56px sticky bar: menu (mobile) · brand · search · actions
   ════════════════════════════════════════════════════════════════ */
export function Header() {
  const navigate = useAppStore((s) => s.navigate);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  return (
    <header className="w-full">
      <div className="flex h-14 items-center gap-3 px-3 sm:px-4 lg:px-5">
        {/* Mobile: hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="tap-target flex h-9 w-9 items-center justify-center rounded-[7px] text-foreground/80 transition-colors hover:bg-white/[0.06] lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-[18px] w-[18px]" aria-hidden />
        </button>

        {/* Brand */}
        <button
          onClick={() => navigate({ name: "home" })}
          className="flex shrink-0 items-center"
          aria-label="Football Hub Bangladesh — home"
        >
          <Wordmark compact />
        </button>

        {/* Search — desktop inline, mobile toggle */}
        <div className="ml-auto hidden min-w-0 flex-1 justify-end md:flex lg:ml-6 lg:justify-start">
          <QuickSearch />
        </div>

        {/* Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-3">
          <button
            onClick={() => setMobileSearch((v) => !v)}
            className="tap-target flex h-9 w-9 items-center justify-center rounded-[7px] text-foreground/80 transition-colors hover:bg-white/[0.06] md:hidden"
            aria-label="Search"
            aria-expanded={mobileSearch}
          >
            <Search className="h-[18px] w-[18px]" aria-hidden />
          </button>

          <button
            onClick={() => navigate({ name: "live-tv" })}
            className="hidden h-9 items-center gap-2 rounded-[7px] border border-border bg-white/[0.02] px-3 text-[12px] font-semibold text-foreground/85 transition-colors hover:border-white/20 sm:flex"
          >
            <Radio className="h-3.5 w-3.5 text-fhb-red" aria-hidden />
            Live TV
          </button>

          <button
            onClick={() => navigate({ name: "premium" })}
            className="hidden h-9 items-center gap-1.5 rounded-[7px] px-2.5 text-[12px] font-semibold text-fhb-gold transition-colors hover:bg-fhb-gold/10 xl:flex"
          >
            <Crown className="h-3.5 w-3.5" aria-hidden />
            Premium
          </button>

          <AccountControl />
        </div>
      </div>

      {/* Mobile search drawer */}
      {mobileSearch && (
        <div className="border-t border-border px-3 py-2.5 md:hidden">
          <QuickSearch onNavigate={() => setMobileSearch(false)} />
        </div>
      )}

      {/* Mobile nav sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[300px] border-r border-border bg-sidebar p-0">
          <SheetHeader className="border-b border-border px-4 pb-4 pt-5">
            <SheetTitle asChild>
              <div className="flex items-center gap-2.5">
                <LogoMark size={30} />
                <span className="leading-none">
                  <span className="label-cond block text-[14px] font-bold tracking-[0.06em] text-foreground">
                    FOOTBALL HUB
                  </span>
                  <span className="mt-[3px] block text-[8px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                    Bangladesh
                  </span>
                </span>
              </div>
            </SheetTitle>
          </SheetHeader>
          <nav aria-label="Site menu" className="fhb-scroll max-h-[calc(100vh-88px)] overflow-y-auto px-3 py-4">
            {NAV_SECTIONS.map((section, si) => (
              <div key={si} className="mb-1">
                {section.title && (
                  <p className="px-2.5 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/85">
                    {section.title}
                  </p>
                )}
                {section.items.map((item) => (
                  <MobileNavItem key={item.label} item={item} onGo={() => setMobileOpen(false)} />
                ))}
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}

function MobileNavItem({ item, onGo }: { item: NavItem; onGo: () => void }) {
  const navigate = useAppStore((s) => s.navigate);
  const isActive = useActiveNav()(item);
  const Icon = item.icon;
  return (
    <button
      onClick={() => {
        navigate(item.view);
        onGo();
      }}
      className={cn(
        "menu-item flex h-10 w-full items-center gap-3 rounded-[7px] px-2.5 text-left transition-colors",
        isActive ? "bg-white/[0.06] text-primary" : "text-foreground/80 hover:bg-white/[0.04]"
      )}
    >
      <Icon className={cn("h-[17px] w-[17px]", item.premium && "text-fhb-gold")} aria-hidden />
      <span className="text-[13.5px] font-medium">{item.label}</span>
      {isActive && <span className="ml-auto h-4 w-[3px] rounded-full bg-primary" aria-hidden />}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   LeftRailNav — desktop persistent navigation (lg+).
   Institutional sidebar, FotMob-style: icon + label, flat active
   state, live-count badge on Live Scores.
   ════════════════════════════════════════════════════════════════ */
export function LeftRailNav() {
  const navigate = useAppStore((s) => s.navigate);
  const isActive = useActiveNav();
  const liveCount = useLiveCount();

  return (
    <aside
      className="sticky top-[92px] hidden h-[calc(100vh-92px)] w-[216px] shrink-0 flex-col border-r border-border pr-0 lg:flex"
      aria-label="Primary navigation"
    >
      <nav className="fhb-scroll flex-1 overflow-y-auto px-3 py-5">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className="mb-1.5">
            {section.title && (
              <p className="px-2.5 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/85">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.view)}
                  className={cn(
                    "group relative flex h-[34px] w-full items-center gap-2.5 rounded-[7px] px-2.5 text-left transition-colors",
                    active
                      ? "bg-white/[0.06] text-primary"
                      : "text-foreground/75 hover:bg-white/[0.04] hover:text-foreground"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r-full bg-primary" aria-hidden />
                  )}
                  <Icon
                    className={cn("h-4 w-4 shrink-0 transition-colors", item.premium && !active && "text-fhb-gold")}
                    aria-hidden
                  />
                  <span className="truncate text-[13px] font-medium">{item.label}</span>
                  {item.view.name === "scores" && liveCount > 0 && (
                    <span className="tabular ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-[4px] bg-fhb-red px-1 text-[10px] font-bold text-white">
                      {fmtNum(liveCount)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Admin — role-gated */}
        <AdminRailItem />
      </nav>
    </aside>
  );
}

function AdminRailItem() {
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  if (user?.role !== "ADMIN") return null;
  return (
    <div className="mt-1 border-t border-border pt-3">
      <button
        onClick={() => navigate({ name: "admin" })}
        className="flex h-[34px] w-full items-center gap-2.5 rounded-[7px] px-2.5 text-left text-foreground/75 transition-colors hover:bg-white/[0.04] hover:text-foreground"
      >
        <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
        <span className="text-[13px] font-medium">Admin Console</span>
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   BottomNav — mobile primary tab bar (lg:hidden).
   Home · Scores · News · Shorts · More
   ════════════════════════════════════════════════════════════════ */
const BOTTOM_ITEMS: Array<{ label: string; icon: React.ElementType; view: View }> = [
  { label: "Home", icon: Home, view: { name: "home" } },
  { label: "Scores", icon: Zap, view: { name: "scores" } },
  { label: "News", icon: Newspaper, view: { name: "news" } },
  { label: "Shorts", icon: Video, view: { name: "shorts" } },
];

export function BottomNav() {
  const view = useAppStore((s) => s.view);
  const navigate = useAppStore((s) => s.navigate);
  const [moreOpen, setMoreOpen] = useState(false);
  const live = useLiveScores();
  const name = PARENT_MAP[view.name] ?? view.name;
  const hasLive = live.matches.length > 0;

  return (
    <>
      <nav
        className="glass fixed inset-x-0 bottom-0 z-[58] flex h-[calc(56px+env(safe-area-inset-bottom))] items-stretch border-t border-border pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Primary"
      >
        {BOTTOM_ITEMS.map((item) => {
          const active = name === item.view.name;
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.view)}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className="relative">
                <Icon className="h-[19px] w-[19px]" aria-hidden />
                {item.view.name === "scores" && hasLive && (
                  <span className="live-dot absolute -right-1.5 -top-0.5 h-[7px] w-[7px] rounded-full bg-fhb-red" aria-hidden />
                )}
              </span>
              <span className={cn("text-[10px] font-semibold", active && "font-bold")}>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
            ["teams", "players", "competitions", "standings", "community", "live-tv", "premium", "profile", "earnings", "upload", "admin", "auth"].includes(name)
              ? "text-primary"
              : "text-muted-foreground"
          )}
          aria-label="More sections"
        >
          <MoreHorizontal className="h-[19px] w-[19px]" aria-hidden />
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </nav>

      {/* More sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[78vh] rounded-t-2xl border-t border-border bg-sidebar p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>All sections</SheetTitle>
          </SheetHeader>
          <div className="fhb-scroll max-h-[70vh] overflow-y-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
            <div className="grid grid-cols-2 gap-1.5">
              {NAV_SECTIONS.flatMap((s) => s.items)
                .filter((i) => !BOTTOM_ITEMS.some((b) => b.view.name === i.view.name))
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        navigate(item.view);
                        setMoreOpen(false);
                      }}
                      className="flex h-11 items-center gap-3 rounded-[8px] border border-border bg-white/[0.02] px-3 text-left transition-colors hover:bg-white/[0.05]"
                    >
                      <Icon className={cn("h-[18px] w-[18px] shrink-0", item.premium ? "text-fhb-gold" : "text-primary")} aria-hidden />
                      <span className="truncate text-[13px] font-medium text-foreground/90">{item.label}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/** Backwards-compatible export (legacy imports). */
export const NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items).map(({ label, view }) => ({ label, view }));
