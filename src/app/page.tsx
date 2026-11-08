"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";
import { Header, BottomNav } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HomeView } from "@/components/views/home-view";
import { ScoresView, MatchDetailView } from "@/components/views/scores-view";
import { StandingsView } from "@/components/views/standings-view";
import { NewsView } from "@/components/views/news-view";
import { NewsDetailView } from "@/components/views/news-detail-view";
import { TeamsView, TeamDetailView } from "@/components/views/teams-view";
import { PlayersView, PlayerDetailView } from "@/components/views/players-view";
import { CompetitionsView, CompetitionDetailView } from "@/components/views/competitions-view";
import { ShortsView, UploadView } from "@/components/views/shorts-view";
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

  // Deep-link support: /?view=shorts etc.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const v = sp.get("view");
    if (v === "shorts") useAppStore.getState().navigate({ name: "shorts" });
  }, []);

  const renderView = () => {
    switch (view.name) {
      case "home":
        return <HomeView />;
      case "scores":
        return <ScoresView />;
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

  const isFullscreenView = view.name === "shorts";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-3 focus:py-1.5 focus:text-sm focus:font-bold focus:text-primary-foreground"
      >
        মূল কনটেন্টে যান
      </a>

      <Header />

      <main id="main" className={`flex-1 ${isFullscreenView ? "" : "pb-16 lg:pb-0"}`} aria-live="polite">
        {authLoading && !user ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 font-display text-xl font-bold text-primary-foreground shadow-xl">
                F<span className="text-fhb-red">H</span>
                <span className="absolute -inset-1.5 animate-ping rounded-2xl border-2 border-primary/30" aria-hidden />
              </span>
              <p className="animate-pulse text-xs text-muted-foreground">FHB লোড হচ্ছে...</p>
            </div>
          </div>
        ) : (
          renderView()
        )}
      </main>

      {!isFullscreenView && <Footer />}
      <BottomNav />
    </div>
  );
}
