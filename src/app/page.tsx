"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";
import { Header, BottomNav, LeftRailNav } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScoreTicker } from "@/components/layout/ticker";
import { StickyMobileAd } from "@/components/football/ad-slot";
import { HomeView } from "@/components/views/home-view";
import { ScoresView, MatchDetailView } from "@/components/views/scores-view";
import { StandingsView } from "@/components/views/standings-view";
import { NewsView } from "@/components/views/news-view";
import { NewsDetailView } from "@/components/views/news-detail-view";
import { TeamsView, TeamDetailView } from "@/components/views/teams-view";
import { PlayersView, PlayerDetailView } from "@/components/views/players-view";
import { CompetitionsView, CompetitionDetailView } from "@/components/views/competitions-view";
import { ShortsView, UploadView } from "@/components/views/shorts-view";
import { LiveTvView } from "@/components/views/live-tv-view";
import { CommunityView } from "@/components/views/community-view";
import { PremiumView } from "@/components/views/premium-view";
import { AuthView } from "@/components/views/auth-view";
import { ProfileView } from "@/components/views/profile-view";
import { EarningsView } from "@/components/views/earnings-view";
import { AdminView } from "@/components/views/admin-view";

export default function Page() {
  const { view, user, authLoading, refreshUser } = useAppStore();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Deep-link support: /?view=scores, /?view=shorts, /?view=live-tv etc.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const v = sp.get("view");
    const valid = [
      "home", "scores", "live-tv", "standings", "news", "teams",
      "players", "competitions", "shorts", "community", "premium", "auth",
    ];
    if (v && valid.includes(v)) useAppStore.getState().navigate({ name: v } as never);
  }, []);

  const renderView = () => {
    switch (view.name) {
      case "home":
        return <HomeView />;
      case "scores":
        return <ScoresView />;
      case "live-tv":
        return <LiveTvView />;
      case "match-detail":
        return <MatchDetailView matchId={view.id} />;
      case "standings":
        return <StandingsView />;
      case "news":
        return <NewsView />;
      case "news-detail":
        return <NewsDetailView articleId={view.id} />;
      case "teams":
        return <TeamsView />;
      case "team-detail":
        return <TeamDetailView teamId={view.id} />;
      case "players":
        return <PlayersView />;
      case "player-detail":
        return <PlayerDetailView playerId={view.id} />;
      case "competitions":
        return <CompetitionsView />;
      case "competition-detail":
        return <CompetitionDetailView competitionId={view.id} />;
      case "shorts":
        return <ShortsView />;
      case "upload":
        return <UploadView />;
      case "community":
        return <CommunityView />;
      case "premium":
        return <PremiumView />;
      case "auth":
        return <AuthView />;
      case "profile":
        return <ProfileView username={view.username} />;
      case "earnings":
        return <EarningsView />;
      case "admin":
        return <AdminView />;
      default:
        return <HomeView />;
    }
  };

  /** Immersive views drop the side rails / footer / bottom chrome. */
  const isImmersive = view.name === "shorts";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-3 focus:py-1.5 focus:text-sm focus:font-bold focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      {!isImmersive && (
        <div className="sticky top-0 z-[60] w-full border-b border-border bg-[#06080f]/95 backdrop-blur-md">
          <ScoreTicker />
          <Header />
        </div>
      )}

      <div className="mx-auto flex w-full max-w-[1480px] flex-1">
        {!isImmersive && <LeftRailNav />}
        <main
          id="main"
          className={`min-w-0 flex-1 ${isImmersive ? "" : "pb-16 lg:pb-0"}`}
          aria-live="polite"
        >
          {authLoading && !user ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <span className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-primary font-display text-xl font-bold text-primary-foreground">
                  F<span className="text-fhb-red">·</span>
                  <span className="absolute -inset-1.5 animate-ping rounded-[14px] border border-primary/30" aria-hidden />
                </span>
                <p className="animate-pulse text-xs font-medium text-muted-foreground">Loading FHB…</p>
              </div>
            </div>
          ) : (
            renderView()
          )}
        </main>
      </div>

      {!isImmersive && <Footer />}
      {!isImmersive && <BottomNav />}
      {!isImmersive && <StickyMobileAd />}
    </div>
  );
}
