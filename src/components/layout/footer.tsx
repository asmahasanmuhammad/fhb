"use client";

import { useState } from "react";
import { useAppStore, type View } from "@/store/app-store";
import { LogoMark } from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import { Facebook, Youtube, Twitter, Instagram, Send, Globe } from "lucide-react";

export function Footer() {
  const navigate = useAppStore((s) => s.navigate);
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const go = (v: View) => () => navigate(v);

  const football: Array<{ label: string; view: View }> = [
    { label: "Live Scores", view: { name: "scores" } },
    { label: "Live TV", view: { name: "live-tv" } },
    { label: "League Tables", view: { name: "standings" } },
    { label: "Fixtures & Results", view: { name: "scores" } },
    { label: "Competitions", view: { name: "competitions" } },
  ];

  const news: Array<{ label: string; view: View }> = [
    { label: "Football News", view: { name: "news" } },
    { label: "Transfer Centre", view: { name: "news" } },
    { label: "Teams", view: { name: "teams" } },
    { label: "Players", view: { name: "players" } },
  ];

  const platform: Array<{ label: string; view: View }> = [
    { label: "Shorts", view: { name: "shorts" } },
    { label: "Fan Community", view: { name: "community" } },
    { label: "Premium Membership", view: { name: "premium" } },
    { label: "Creator Earnings", view: { name: "earnings" } },
    { label: "Upload Content", view: { name: "upload" } },
  ];

  const submitNewsletter = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast({ title: "Enter a valid email", description: "Example: you@example.com" });
      return;
    }
    toast({ title: "Subscribed!", description: "The weekly football digest is on its way." });
    setEmail("");
  };

  const LinkColumn = ({ title, links }: { title: string; links: Array<{ label: string; view: View }> }) => (
    <nav aria-label={`Footer — ${title}`}>
      <p className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-foreground/90">{title}</p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <button
              onClick={go(l.view)}
              className="text-left text-[13px] text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <footer className="relative mt-14 border-t border-border/70 bg-[oklch(0.115_0.005_255)]">
      <div className="mx-auto max-w-[1320px] px-4 pb-8 pt-12 sm:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-12">
          {/* ── Brand + mission + newsletter ── */}
          <div className="col-span-2 lg:col-span-5">
            <div className="flex items-center gap-3">
              <LogoMark size={10} />
              <div className="leading-tight">
                <p className="font-display text-[15px] font-bold tracking-[0.04em] text-foreground">
                  FOOTBALL HUB BANGLADESH
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  footballhub.com.bd
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
              The digital home of Bangladeshi football — live scores, league tables, news, transfers,
              shorts and a fan community in one place. From the BFL to the Champions League,
              we cover every match that matters.
            </p>

            <div className="mt-6 max-w-md">
              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-foreground/90">
                Weekly Football Digest
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitNewsletter()}
                  placeholder="Your email address"
                  className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  aria-label="Newsletter email"
                />
                <button
                  onClick={submitNewsletter}
                  className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden />
                  Subscribe
                </button>
              </div>
              <p className="mt-2 text-[10.5px] text-muted-foreground/80">
                League roundups, transfer updates and exclusive analysis — every Friday.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {[
                { label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
                { label: "YouTube", icon: <Youtube className="h-4 w-4" /> },
                { label: "X (Twitter)", icon: <Twitter className="h-4 w-4" /> },
                { label: "Instagram", icon: <Instagram className="h-4 w-4" /> },
              ].map((s) => (
                <button
                  key={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-card/60 text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
                  aria-label={`FHB ${s.label}`}
                >
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <LinkColumn title="Football" links={football} />
          </div>
          <div className="lg:col-span-2">
            <LinkColumn title="News & Teams" links={news} />
          </div>
          <div className="col-span-2 lg:col-span-3">
            <LinkColumn title="Platform" links={platform} />
            <div className="mt-5 space-y-2 border-t border-border/50 pt-4">
              <p className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
                <Globe className="h-3.5 w-3.5 text-primary/70" aria-hidden />
                English (Bangla coming soon)
              </p>
              <p className="text-[11.5px] text-muted-foreground">
                Advertise with us · Press · Careers
              </p>
              <p className="text-[11.5px] text-muted-foreground">
                contact@footballhub.com.bd
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-6 text-[11px] text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Football Hub Bangladesh. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="transition-colors hover:text-primary">Terms of Service</span>
            <span className="transition-colors hover:text-primary">Privacy Policy</span>
            <span className="transition-colors hover:text-primary">Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
