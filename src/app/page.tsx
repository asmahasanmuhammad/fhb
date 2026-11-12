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
import { LegalView } from "@/components/views/legal-view";
import { CookieBanner } from "@/components/layout/cookie-banner";

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
      "upload", "earnings", "admin", "profile", "news-detail", "team-detail",
      "player-detail", "competition-detail", "match-detail",
      "terms", "privacy", "cookies", "contact", "advertise", "press", "careers",
    ];
    if (v && valid.includes(v)) {
      const id = sp.get("id");
      const username = sp.get("username");
      useAppStore.getState().navigate(
        { name: v, id: id ?? undefined, username: username ?? undefined } as never,
        false
      );
    }

    const onPop = (e: PopStateEvent) => {
      if (e.state?.view) {
        useAppStore.getState().navigate(e.state.view, false);
      } else {
        const curSp = new URLSearchParams(window.location.search);
        const curV = curSp.get("view");
        if (curV && valid.includes(curV)) {
          useAppStore.getState().navigate(
            { name: curV, id: curSp.get("id") ?? undefined, username: curSp.get("username") ?? undefined } as never,
            false
          );
        } else {
          useAppStore.getState().navigate({ name: "home" }, false);
        }
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
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
      case "terms":
      case "privacy":
      case "cookies":
      case "contact":
      case "advertise":
      case "press":
      case "careers":
        return <LegalView currentTab={view.name} />;
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
        <div className="sticky top-0 z-[60] w-full border-b border-border bg-background/95 backdrop-blur-md transition-colors duration-200">
          <ScoreTicker />
          <Header />
        </div>
      )}

      <div className="mx-auto flex w-full max-w-[1720px] flex-1">
        {!isImmersive && <LeftRailNav />}
        <main
          id="main"
          className={`min-w-0 flex-1 ${isImmersive ? "" : "pb-16 lg:pb-0"}`}
          aria-live="polite"
        >
          {renderView()}
        </main>
      </div>

      {!isImmersive && <Footer />}
      {!isImmersive && <BottomNav />}
      {!isImmersive && <StickyMobileAd />}
      {!isImmersive && <CookieBanner />}
    </div>
  );
}
