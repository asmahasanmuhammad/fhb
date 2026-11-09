"use client";

import { useState } from "react";
import { useAppStore, type View } from "@/store/app-store";
import { LogoMark } from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import {
  Facebook, Youtube, Twitter, Instagram, MapPin, Mail, ShieldCheck, BadgeCheck,
  Send, Smartphone, ChevronRight, Heart,
} from "lucide-react";

export function Footer() {
  const navigate = useAppStore((s) => s.navigate);
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const go = (v: View) => () => navigate(v);

  const explore: Array<{ label: string; view: View }> = [
    { label: "Live Scores", view: { name: "scores" } },
    { label: "Live TV", view: { name: "live-tv" } },
    { label: "League Tables", view: { name: "standings" } },
    { label: "Football News", view: { name: "news" } },
    { label: "Teams", view: { name: "teams" } },
    { label: "Players", view: { name: "players" } },
    { label: "Competitions", view: { name: "competitions" } },
    { label: "Shorts", view: { name: "shorts" } },
    { label: "Community", view: { name: "community" } },
  ];

  const platform: Array<{ label: string; view: View }> = [
    { label: "Premium Membership", view: { name: "premium" } },
    { label: "Creator Earnings", view: { name: "earnings" } },
    { label: "Upload Shorts", view: { name: "upload" } },
    { label: "Sign Up", view: { name: "auth" } },
  ];

  const submitNewsletter = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast({ title: "Enter a valid email", description: "Example: you@example.com" });
      return;
    }
    toast({ title: "Subscribed!", description: "The weekly football digest is on its way." });
    setEmail("");
  };

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-border/70 bg-[oklch(0.098_0.012_168)]">
      {/* Top hairline glow */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
      />
      {/* Ghost watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-6 select-none font-display text-[11rem] font-bold leading-none tracking-tighter text-white/[0.028] sm:text-[16rem]"
      >
        FHB
      </span>

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* ── Brand + mission + newsletter ── */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <LogoMark size={10} />
              <div className="leading-tight">
                <p className="font-display text-base font-bold tracking-[0.06em] text-foreground">
                  FOOTBALL HUB BANGLADESH
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  footballhub.com.bd
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
              Our mission — to grow the game of football in Bangladesh, deliver modern content and
              connect the nation through one powerful platform. A fan and community network built by
              football lovers: from live scores to shorts, everything in one place.
            </p>

            {/* Newsletter */}
            <div className="mt-6 max-w-md">
              <p className="mb-2.5 flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-foreground">
                <Send className="h-3.5 w-3.5 text-primary" aria-hidden />
                Weekly Football Digest
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitNewsletter()}
                  placeholder="Your email address"
                  className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  aria-label="Newsletter email"
                />
                <button
                  onClick={submitNewsletter}
                  className="sheen flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden />
                  Subscribe
                </button>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground/80">
                Weekly league roundups, transfer updates and exclusive analysis.
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
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-card/60 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
                  aria-label={`FHB ${s.label}`}
                >
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* ── Explore ── */}
          <nav className="lg:col-span-2" aria-label="Footer — Explore">
            <p className="eyebrow mb-4 text-[10px] text-muted-foreground">Explore</p>
            <ul className="space-y-2.5">
              {explore.map((l) => (
                <li key={l.label}>
                  <button
                    onClick={go(l.view)}
                    className="group flex items-center gap-1 text-left text-[13px] text-muted-foreground transition-colors hover:text-primary"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Platform ── */}
          <nav className="lg:col-span-2" aria-label="Footer — Platform">
            <p className="eyebrow mb-4 text-[10px] text-muted-foreground">Platform</p>
            <ul className="space-y-2.5">
              {platform.map((l) => (
                <li key={l.label}>
                  <button
                    onClick={go(l.view)}
                    className="group flex items-center gap-1 text-left text-[13px] text-muted-foreground transition-colors hover:text-primary"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Monetization / trust ── */}
          <div className="lg:col-span-3">
            <p className="eyebrow mb-4 text-[10px] text-muted-foreground">Monetization</p>
            <div className="edge-lit rounded-2xl border border-border/70 bg-card/50 p-4">
              <p className="flex items-center gap-2 text-[13px] font-bold text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden /> AdSense & Premium
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Monetization built in through Google AdSense and premium memberships. Creators track their
                earnings from the dashboard.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["bKash", "Nagad", "Rocket", "Visa", "Mastercard"].map((p) => (
                  <span key={p} className="rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-[10px] font-bold text-muted-foreground">
                    {p}
                  </span>
                ))}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
                Secure payment gateway (SSLCommerz) supported
              </p>
            </div>
            <div className="mt-3.5 flex items-center gap-3 rounded-2xl border border-dashed border-border/70 p-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Smartphone className="h-4.5 w-4.5 h-[18px] w-[18px]" aria-hidden />
              </span>
              <p className="text-[11px] leading-snug text-muted-foreground">
                <span className="font-bold text-foreground">FHB app coming soon</span>
                <br />
                iOS & Android — with live alerts
              </p>
            </div>
          </div>
        </div>

        {/* Contact chips */}
        <div className="mt-10 flex flex-wrap gap-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden /> Dhaka, Bangladesh
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5">
            <Mail className="h-3.5 w-3.5 text-primary" aria-hidden /> contact@footballhub.com.bd
          </span>
        </div>

        {/* Bottom bar */}
        <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-[11px] text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Football Hub Bangladesh — All rights reserved</p>
          <p className="flex items-center gap-1.5">
            For the football fans of Bangladesh
            <Heart className="h-3 w-3 fill-fhb-red text-fhb-red" aria-hidden />
            from Dhaka
          </p>
        </div>
      </div>
    </footer>
  );
}
