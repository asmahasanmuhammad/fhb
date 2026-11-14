"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { ThemeToggle, ThemeSegmentControl } from "@/components/layout/theme-toggle";
import {
  Home, Zap, Table2, Newspaper, Shield, Users, User, Trophy, Video, Tv,
  MessageSquare, Crown, Upload, Wallet, LayoutDashboard, LogOut, Search,
  Menu, X, ChevronRight, MoreHorizontal, Radio, Bell,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   FHB 5.0 — App chrome: brand mark, quick search, header bar,
   desktop left rail nav, mobile sheet menu, mobile bottom nav.
   Flat, dense, institutional — FotMob/Sofascore shell pattern.
   ════════════════════════════════════════════════════════════════ */

/* ── useScrolled — tracks whether page has scrolled >10px ── */
function useScrolled(threshold = 10): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

/* ── useClock — live date + time string updated every second ── */
function useClock(): string {
  const [display, setDisplay] = useState("");
  useEffect(() => {
    const fmt = () => {
      const now = new Date();
      return now.toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short",
      }) + " · " + now.toLocaleTimeString("en-GB", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
      });
    };
    setDisplay(fmt());
    const id = setInterval(() => setDisplay(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return display;
}

/* ── Brand mark — FHBD Bold Red Slab with White Speed Letters ── */
/* hasLive triggers a subtle glow-pulse CSS animation   */
export function LogoMark({
  size = 40,
  hasLive = false,
  className,
}: {
  size?: number;
  hasLive?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "group relative inline-flex shrink-0 select-none items-center justify-center transition-all duration-200 hover:brightness-110 active:scale-95",
        hasLive && "ring-2 ring-fhb-red/40 rounded-[7px]",
        className
      )}
      style={{ height: size }}
      aria-label="FHBD"
    >
      <img
        src="/logos/fhbd-badge.png"
        alt="FHBD"
        className="h-full w-auto object-contain rounded-[7px] shadow-md shadow-black/25 transition-transform duration-200 group-hover:scale-[1.03]"
      />
      {hasLive && (
        <span
          className="absolute -top-1 -right-1 flex h-2.5 w-2.5"
          title="Matches live right now"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-90" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white ring-2 ring-[#e30206]" />
        </span>
      )}
    </span>
  );
}

function Wordmark({ compact = false, hasLive = false }: { compact?: boolean; hasLive?: boolean }) {
  return <LogoMark size={compact ? 36 : 40} hasLive={hasLive} />;
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
   Debounced, keyboard-navigable, result-grouped, animated panel.
   ════════════════════════════════════════════════════════════════ */
type SearchResults = { teams: TeamRef[]; players: Player[]; articles: NewsArticle[] };

/** Flatten all navigable results into a single ordered list for keyboard nav. */
type FlatResult =
  | { kind: "team"; item: TeamRef }
  | { kind: "player"; item: Player }
  | { kind: "article"; item: NewsArticle };

function flattenResults(r: SearchResults): FlatResult[] {
  return [
    ...r.teams.map((item): FlatResult => ({ kind: "team", item })),
    ...r.players.map((item): FlatResult => ({ kind: "player", item })),
    ...r.articles.map((item): FlatResult => ({ kind: "article", item })),
  ];
}

/* Animated loading dots */
function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-[3px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-[5px] w-[5px] rounded-full bg-muted-foreground/60"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

function QuickSearch({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useAppStore((s) => s.navigate);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResults>({ teams: [], players: [], articles: [] });
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Data fetching ── */
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults({ teams: [], players: [], articles: [] });
      setLoading(false);
      setCursor(-1);
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
        setCursor(-1);
      }
    }, 260);
    return () => clearTimeout(t);
  }, [q]);

  /* ── Click-outside & Escape ── */
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const go = useCallback((view: View) => {
    navigate(view);
    setOpen(false);
    setQ("");
    setCursor(-1);
    onNavigate?.();
  }, [navigate, onNavigate]);

  const flat = useMemo(() => flattenResults(results), [results]);
  const total = flat.length;
  const showPanel = open && q.trim().length >= 2;

  /* ── Keyboard navigation ── */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showPanel) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, total - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, -1));
    } else if (e.key === "Enter" && cursor >= 0 && cursor < total) {
      e.preventDefault();
      const sel = flat[cursor];
      if (!sel) return;
      if (sel.kind === "team") go({ name: "team-detail", id: sel.item.id });
      else if (sel.kind === "player") go({ name: "player-detail", id: sel.item.id });
      else go({ name: "news-detail", id: sel.item.id });
    }
  }, [showPanel, total, cursor, flat, go]);

  /* ── Result index tracker for keyboard highlight ── */
  let globalIdx = -1;
  const nextIdx = () => {
    globalIdx++;
    return globalIdx;
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-[420px]">
      <label className="flex h-10 w-full items-center gap-2.5 rounded-[8px] border border-input bg-muted/40 dark:bg-white/[0.04] px-3.5 transition-colors focus-within:border-primary/50 focus-within:bg-card">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search teams, players, news…"
          className="h-full w-full bg-transparent text-[14.5px] text-foreground outline-none placeholder:text-muted-foreground/75"
          aria-label="Search Football Hub"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          role="combobox"
        />
        {q && (
          <button
            onClick={() => { setQ(""); setCursor(-1); }}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] text-muted-foreground hover:bg-white/10 hover:text-foreground"
            aria-label="Clear search"
            tabIndex={-1}
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        )}
      </label>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            key="search-panel"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-[80] overflow-hidden rounded-lg border border-border bg-popover shadow-[0_16px_48px_-12px_rgba(0,0,0,0.7)]"
            role="listbox"
          >
            {loading && (
              <p className="flex items-center gap-2 px-4 py-5 text-[12px] text-muted-foreground">
                Searching <LoadingDots />
              </p>
            )}
            {!loading && total === 0 && (
              <p className="px-4 py-5 text-[12px] text-muted-foreground">
                No results for &ldquo;{q.trim()}&rdquo;. Try a team, player or keyword.
              </p>
            )}
            {!loading && total > 0 && (
              <div className="max-h-[min(70vh,480px)] overflow-y-auto fhb-scroll py-1.5">
                {results.teams.length > 0 && (
                  <SearchGroup title="Teams">
                    {results.teams.map((t) => {
                      const idx = nextIdx();
                      return (
                        <SearchRow
                          key={t.id}
                          onClick={() => go({ name: "team-detail", id: t.id })}
                          isHighlighted={cursor === idx}
                        >
                          <TeamCrest team={t} size="xs" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium text-foreground">{t.name}</span>
                            {t.city && <span className="block truncate text-[11px] text-muted-foreground">{t.city}</span>}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" aria-hidden />
                        </SearchRow>
                      );
                    })}
                  </SearchGroup>
                )}
                {results.players.length > 0 && (
                  <SearchGroup title="Players">
                    {results.players.map((p) => {
                      const idx = nextIdx();
                      return (
                        <SearchRow
                          key={p.id}
                          onClick={() => go({ name: "player-detail", id: p.id })}
                          isHighlighted={cursor === idx}
                        >
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
                      );
                    })}
                  </SearchGroup>
                )}
                {results.articles.length > 0 && (
                  <SearchGroup title="News">
                    {results.articles.map((a) => {
                      const idx = nextIdx();
                      return (
                        <SearchRow
                          key={a.id}
                          onClick={() => go({ name: "news-detail", id: a.id })}
                          isHighlighted={cursor === idx}
                        >
                          <Newspaper className="h-[18px] w-[18px] shrink-0 text-muted-foreground/70" aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium text-foreground">{a.title}</span>
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" aria-hidden />
                        </SearchRow>
                      );
                    })}
                  </SearchGroup>
                )}

                {/* Command palette hint */}
                <div className="flex items-center justify-end border-t border-border/50 px-4 py-2">
                  <span className="text-[10.5px] text-muted-foreground/60">
                    Press{" "}
                    <kbd className="inline-flex h-4 items-center rounded border border-border px-1 font-mono text-[9px] text-muted-foreground">
                      ↵
                    </kbd>{" "}
                    to navigate
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70">
        {title}
      </p>
      <div role="group" aria-label={title}>{children}</div>
    </div>
  );
}

function SearchRow({
  children,
  onClick,
  isHighlighted = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isHighlighted?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isHighlighted) ref.current?.scrollIntoView({ block: "nearest" });
  }, [isHighlighted]);
  return (
    <button
      ref={ref}
      onClick={onClick}
      role="option"
      aria-selected={isHighlighted}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors",
        isHighlighted ? "bg-white/[0.08]" : "hover:bg-white/[0.05]"
      )}
    >
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   Notifications Bell — desktop-only, unread dot badge (UI only).
   ════════════════════════════════════════════════════════════════ */
function NotificationsBell() {
  /* hasUnread is a static stub — not wired to an API */
  const hasUnread = true;
  return (
    <button
      className="relative hidden h-9 w-9 items-center justify-center rounded-[7px] text-foreground/75 transition-colors hover:bg-white/[0.06] hover:text-foreground sm:flex"
      aria-label={hasUnread ? "Notifications — unread items" : "Notifications"}
    >
      <Bell className="h-[17px] w-[17px]" aria-hidden />
      {hasUnread && (
        <span
          className="absolute right-[9px] top-[9px] h-[7px] w-[7px] rounded-full bg-fhb-red ring-[1.5px] ring-background"
          aria-hidden
        />
      )}
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
          className="flex h-9 items-center gap-2 rounded-[7px] border border-border bg-card pr-2.5 pl-1.5 transition-colors hover:border-primary/40 hover:bg-muted"
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
   useScrolled adds shadow on scroll ≥ 10px.
   ════════════════════════════════════════════════════════════════ */
export function Header() {
  const navigate = useAppStore((s) => s.navigate);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const live = useLiveScores();
  const hasLive = live.matches.length > 0;
  const scrolled = useScrolled(10);

  return (
    <header
      className={cn(
        "w-full transition-shadow duration-200",
        scrolled && "shadow-lg shadow-black/40"
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1720px] items-center gap-3 px-3 sm:px-4 lg:px-6">
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
          aria-label="FHBD — home"
        >
          <Wordmark compact hasLive={hasLive} />
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
            className="hidden h-10 items-center gap-2 rounded-[8px] border border-border bg-card px-3.5 text-[13.5px] font-bold text-foreground/90 transition-colors hover:border-primary/40 hover:bg-muted sm:flex"
          >
            <Radio className="h-4 w-4 text-fhb-red" aria-hidden />
            Live TV
          </button>

          {/* Notifications bell — desktop only, between Live TV and Account */}
          <NotificationsBell />

          <button
            onClick={() => navigate({ name: "premium" })}
            className="hidden h-10 items-center gap-2 rounded-[8px] px-3 text-[13.5px] font-bold text-fhb-gold transition-colors hover:bg-fhb-gold/10 xl:flex"
          >
            <Crown className="h-4 w-4" aria-hidden />
            Premium
          </button>

          {/* Theme switcher toggle (Dark / Light) */}
          <ThemeToggle />

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
        <SheetContent side="left" className="flex w-[300px] flex-col border-r border-border bg-sidebar p-0">
          <SheetHeader className="border-b border-border px-4 pb-4 pt-5">
            <SheetTitle asChild>
              <div className="flex items-center gap-2.5">
                <LogoMark size={28} hasLive={hasLive} />
                <span className="leading-none">
                  <span className="font-display block text-[16px] font-extrabold tracking-[0.06em] text-foreground">
                    FHBD
                  </span>
                  <span className="mt-[2.5px] flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                    <span className="inline-block h-1 w-1 rounded-full bg-fhb-red" />
                    Football
                  </span>
                </span>
              </div>
            </SheetTitle>
          </SheetHeader>

          <nav aria-label="Site menu" className="fhb-scroll flex-1 overflow-y-auto px-3 py-4">
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

          {/* Mobile sheet footer — date + time */}
          <MobileSheetFooter />
        </SheetContent>
      </Sheet>
    </header>
  );
}

/* ── Mobile sheet footer with live date/time & theme switcher ── */
function MobileSheetFooter() {
  const clock = useClock();
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">Theme</span>
        <ThemeSegmentControl className="w-44" />
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground/60">
        <span className="tabular-nums" aria-live="polite" aria-atomic>
          {clock}
        </span>
        <span className="font-semibold">FHBD</span>
      </div>
    </div>
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
        "menu-item flex h-11 w-full items-center gap-3.5 rounded-[8px] px-3 text-left transition-colors",
        isActive ? "bg-primary/10 dark:bg-white/[0.08] text-primary font-bold" : "text-foreground/80 hover:bg-muted dark:hover:bg-white/[0.04]"
      )}
    >
      <Icon className={cn("h-[19px] w-[19px]", item.premium && "text-fhb-gold")} aria-hidden />
      <span className="text-[15px] font-semibold">{item.label}</span>
      {isActive && <span className="ml-auto h-4 w-[3px] rounded-full bg-primary" aria-hidden />}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   LeftRailNav — desktop persistent navigation (lg+).
   Institutional sidebar, FotMob-style: icon + label, flat active
   state, live-count badge on Live Scores.
   Framer Motion layoutId="nav-bg" for smooth active indicator.
   ════════════════════════════════════════════════════════════════ */
export function LeftRailNav() {
  const navigate = useAppStore((s) => s.navigate);
  const isActive = useActiveNav();
  const liveCount = useLiveCount();

  return (
    <aside
      className="sticky top-[92px] hidden h-[calc(100vh-92px)] w-[232px] shrink-0 flex-col border-r border-border pr-0 lg:flex"
      aria-label="Primary navigation"
    >
      <nav className="fhb-scroll flex-1 overflow-y-auto px-3.5 py-5">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className="mb-2">
            {section.title && (
              <p className="px-3 pb-1.5 pt-4 text-[11.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground/85">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <RailNavItem
                  key={item.label}
                  item={item}
                  active={active}
                  Icon={Icon}
                  liveCount={liveCount}
                  onClick={() => navigate(item.view)}
                />
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

/* Individual left-rail item with Framer Motion hover + active bg animations */
function RailNavItem({
  item,
  active,
  Icon,
  liveCount,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  Icon: React.ElementType;
  liveCount: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative flex h-[38px] w-full items-center gap-3 rounded-[8px] px-3 text-left transition-colors",
        active ? "text-primary font-bold" : "text-foreground/80 hover:text-foreground font-medium"
      )}
      aria-current={active ? "page" : undefined}
    >
      {/* Animated background fill — shared layoutId for smooth morphing */}
      <AnimatePresence>
        {(active || hovered) && (
          <motion.span
            layoutId="nav-bg"
            key={active ? "active-bg" : "hover-bg"}
            className={cn(
              "absolute inset-0 rounded-[8px]",
              active ? "bg-primary/10 dark:bg-white/[0.08]" : "bg-muted/70 dark:bg-white/[0.04]"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Active left accent bar */}
      <AnimatePresence>
        {active && (
          <motion.span
            key="accent"
            className="absolute left-0 top-1/2 h-[20px] w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <Icon
        className={cn(
          "relative h-[18px] w-[18px] shrink-0 transition-colors",
          item.premium && !active && "text-fhb-gold"
        )}
        aria-hidden
      />
      <span className="relative truncate text-[14.5px]">{item.label}</span>
      {item.view.name === "scores" && liveCount > 0 && (
        <span className="tabular relative ml-auto flex h-[20px] min-w-[20px] items-center justify-center rounded-[5px] bg-fhb-red px-1.5 text-[11px] font-bold text-white">
          {fmtNum(liveCount)}
        </span>
      )}
    </button>
  );
}

function AdminRailItem() {
  const user = useAppStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const [hovered, setHovered] = useState(false);
  if (user?.role !== "ADMIN") return null;
  return (
    <div className="mt-2 border-t border-border pt-3">
      <button
        onClick={() => navigate({ name: "admin" })}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex h-[38px] w-full items-center gap-3 rounded-[8px] px-3 text-left text-foreground/80 hover:text-foreground font-medium transition-colors"
      >
        <AnimatePresence>
          {hovered && (
            <motion.span
              className="absolute inset-0 rounded-[8px] bg-muted/70 dark:bg-white/[0.04]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </AnimatePresence>
        <LayoutDashboard className="relative h-[18px] w-[18px] shrink-0" aria-hidden />
        <span className="relative text-[14.5px]">Admin Console</span>
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
        className="fixed inset-x-0 bottom-0 z-[58] flex h-[calc(62px+env(safe-area-inset-bottom))] items-stretch border-t border-border bg-background/95 dark:bg-[#06080f]/95 backdrop-blur-xl shadow-2xl pb-[env(safe-area-inset-bottom)] lg:hidden"
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
                <Icon className="h-[21px] w-[21px]" aria-hidden />
                {item.view.name === "scores" && hasLive && (
                  <span className="live-dot absolute -right-1.5 -top-0.5 h-[8px] w-[8px] rounded-full bg-fhb-red" aria-hidden />
                )}
              </span>
              <span className={cn("text-[11.5px] font-semibold", active && "font-bold")}>{item.label}</span>
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
          <MoreHorizontal className="h-[21px] w-[21px]" aria-hidden />
          <span className="text-[11.5px] font-semibold">More</span>
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
