# FHB 2.0 — "Broadcast Editorial" Design System Spec

**Context**: Football Hub Bangladesh (FHB) — a football platform demo for a client. The client complained the old design looked "AI-generated/kids-made". We rebuilt the design system to professional agency grade (reference: OneFootball / FotMob / ESPN / DAZN).

**Your job**: Rebuild your assigned view files to this spec. Do NOT redesign the shared components — compose them.

---

## 1. Design tokens (already in globals.css — use, don't reinvent)

- Background: `bg-background` (charcoal), cards: `bg-card`, elevated: `bg-elevated`
- Primary green: `text-primary`, `bg-primary` (calm pitch green, `oklch(0.735 0.155 152)`)
- LIVE red: `text-fhb-red` — **ONLY for live state** (never decoration)
- Gold: `text-fhb-gold` — **ONLY for premium/monetization** contexts
- NO other accent colors. NO blue/purple/indigo. NO colored glow shadows.
- Borders: `border-border` (hairline white/8.5%)
- Radius: `rounded-lg` (8px) for small, `rounded-xl` (12px) for cards/panels. **NEVER `rounded-2xl`/`rounded-3xl`** (the old "bubble" look).

## 2. Typography

- Body/UI: Inter (`--font-body`, default)
- Display/headlines: `<h1|h2|h3>` + `.font-display` class → Archivo (sporty grotesque)
- Headline pattern: `font-display font-bold tracking-[-0.01em]` — sentence case preferred, uppercase ONLY for micro-labels
- Micro-labels: `.eyebrow` class (11px, 650 weight, uppercase, 0.12em tracking)
- All numbers that matter (scores, tables, stats): add `.tabular` class
- H1 pages: `text-[1.7rem] sm:text-3xl`; H2 sections: `text-[1.35rem] sm:text-[1.55rem]` (via SectionHeader)
- Body text 13-14px, muted text `text-muted-foreground` (NEVER below 10px)

## 3. Layout rules

- Page container: `mx-auto w-full max-w-[1320px] px-4 sm:px-6` — wrap your view in this
- Section rhythm: `mt-8` between sections (consistent!). First section: `pt-5 sm:pt-6`
- Lists = hairline-separated rows (`divide-y divide-border/60`), NOT floating cards
- Cards (`rounded-xl border border-border bg-card`) only for featured content, sidebars, stat panels
- Grid: 12-col on lg (`lg:grid-cols-12`), content 8-col + rail 4-col is the standard pattern
- Max content width for text columns ~65ch
- Use `edge-lit` class on cards/panels for the top hairline highlight
- Spacing scale: stick to 1/1.5/2/3/4/6/8 (Tailwind units ×4)

## 4. Motion & interaction

- Hover: quiet. Rows: `hover:bg-white/[0.03]`. Cards: `card-lift` (subtle border color change, NO translateY bounce)
- Images: `img-zoom` inside `group` (1.045 scale)
- Primary CTA buttons may use `sheen`
- Reveal: wrap sections in `className="reveal"` and call `useReveal()` once at view top
- LIVE indicators: `.live-dot` (pulsing red dot) + `text-fhb-red`
- No bounce, no spin, no parallax. Professional broadcast = restraint.

## 5. Shared components (compose these — read the files for exact props)

All in `src/components/football/`:

- **`TeamCrest`** (`team-badge.tsx`): `<TeamCrest team={teamRef} size="xs|sm|md|lg|xl|hero|match" />` — real club crest PNG with fallback monogram. `TeamBadge` is an alias. Use `sm` in rows, `match` in heroes.
- **`MatchRow`** (`match-card.tsx`): dense FotMob-style row. Props: `match, showCompetition, onClick, className`. Use inside `divide-y` containers. Shows live minute, scores, aggregated scorers automatically.
- **`MatchCard`** (same file): hero/featured broadcast card with big crests + CTA footer.
- **`NewsCard`** (`news-card.tsx`): `size="lg|md|compact"`.
- **`SectionHeader`** (`section-header.tsx`): `<SectionHeader title kicker accent? icon? actionLabel actionView />` — kicker = tiny uppercase label; accent "primary"|"red"|"gold".
- **`PageHeader`** (same file): for top of each page — title/subtitle/kicker/back button/actions slot.
- **`StandingsTable`** (`standings-table.tsx`): `standings, compact?, showForm?, limit?`.
- **`AdSlot`** (`ad-slot.tsx`): `<AdSlot placement="HEADER_BANNER|SIDEBAR|IN_FEED|MOBILE_BANNER" />` — place per your view's ad plan (below). Premium users see nothing (handled internally).
- **`LiveBadge`**, **`FormDots`** (`live-badge.tsx`).
- `CommentSection` (comment-section.tsx), `LikeButton` (like-button.tsx) — for social views.
- UI kit: `src/components/ui/*` (shadcn — Button, Tabs, Dialog, Input, Skeleton, etc.)

## 6. Ad placements per view (keep ALL of these)

- Home: HEADER_BANNER, SIDEBAR, IN_FEED (already placed — don't touch home)
- Scores: IN_FEED after the match list
- News: IN_FEED in the feed; SIDEBAR in the rail
- News detail: SIDEBAR in the related rail
- Standings/Teams/Players/Competitions: SIDEBAR or IN_FEED (one each)
- Shorts: MOBILE_BANNER between feed items (every 4th), none on desktop rail
- Community: IN_FEED in the post feed
- Premium: NO ads (it sells ad-free)
- Live TV: SIDEBAR under the channel rail

## 7. Data layer

- React Query for all fetches. `fetch("/api/...")` relative paths only.
- Types: `src/lib/types.ts` (Match now includes `events?: MatchEvent[]` — goals with `playerName`, `minute`, `teamSide`)
- Team refs now include `logoUrl` — always render crests via TeamCrest
- Format helpers: `src/lib/format.ts` — `fmtNum, fmtCompact, fmtLocale, timeAgo, formatKickoff, formatMoney`
- Navigation: `const navigate = useAppStore((s) => s.navigate)` — SPA views, e.g. `navigate({ name: "match-detail", id })`. View names in `src/store/app-store.ts`.
- Loading: `Skeleton` blocks with matching layout (never spinners for full pages)
- Empty states: friendly, small icon + text, never blank voids

## 8. Quality bar — the "agency feel" checklist

- [ ] Information-dense (like FotMob) — no giant empty areas, no filler
- [ ] Real data everywhere (crests, photos, numbers) — never placeholder text
- [ ] Consistent 12-col editorial layouts with side rails
- [ ] Hairline dividers, restrained color, tabular numerals
- [ ] Full English, professional sports-media tone (ESPN/OneFootball copy style)
- [ ] Responsive: mobile single column, `lg` gets the full grid; mobile bottom nav exists
- [ ] Accessible: semantic sections, aria-labels on icon buttons, alt text
- [ ] NO Bengali text anywhere. NO emoji in UI labels.

## 9. Anti-patterns (instant rejection)

- `rounded-2xl`/`rounded-3xl` bubbles, glassmorphism everywhere
- Colored box-shadows / neon glows
- Gradient text except `.gold-text` in premium contexts
- More than 2 accent colors per section
- Marketing fluff ("Experience the magic of football!") — write like a sports desk
- Fake stats bars, decorative progress bars
- Huge empty gaps or skeleton-only sections
