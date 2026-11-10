"use client";

import { useState } from "react";
import { useAppStore, type View } from "@/store/app-store";
import { LogoMark } from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import { Facebook, Youtube, Twitter, Instagram, Send, Globe, Rss, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

const FOOTER_LINKS: Record<string, Array<{ label: string; view: View }>> = {
  Football: [
    { label: "Live Scores", view: { name: "scores" } },
    { label: "Live TV", view: { name: "live-tv" } },
    { label: "League Tables", view: { name: "standings" } },
    { label: "Fixtures & Results", view: { name: "scores" } },
    { label: "Competitions", view: { name: "competitions" } },
  ],
  "News & Teams": [
    { label: "Football News", view: { name: "news" } },
    { label: "Transfer Centre", view: { name: "news" } },
    { label: "Teams", view: { name: "teams" } },
    { label: "Players", view: { name: "players" } },
  ],
  Platform: [
    { label: "FHB Shorts", view: { name: "shorts" } },
    { label: "Fan Community", view: { name: "community" } },
    { label: "Premium Membership", view: { name: "premium" } },
    { label: "Creator Earnings", view: { name: "earnings" } },
    { label: "Upload Content", view: { name: "upload" } },
  ],
};

const SOCIAL = [
  { label: "Facebook", icon: <Facebook className="h-4 w-4" />, href: "#", color: "#1877F2" },
  { label: "YouTube", icon: <Youtube className="h-4 w-4" />, href: "#", color: "#FF0000" },
  { label: "X (Twitter)", icon: <Twitter className="h-4 w-4" />, href: "#", color: "#1D9BF0" },
  { label: "Instagram", icon: <Instagram className="h-4 w-4" />, href: "#", color: "#E1306C" },
];

const LEAGUES = ["Bangladesh Football League", "Premier League", "Champions League", "La Liga", "Serie A", "Bundesliga", "SAFF Championship"];

export function Footer() {
  const navigate = useAppStore((s) => s.navigate);
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const go = (v: View) => () => navigate(v);

  const submitNewsletter = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast({ title: "Enter a valid email address" });
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    toast({ title: "Subscribed! ✓", description: "Weekly digest every Friday — from Dhaka." });
    setEmail("");
    setSubmitting(false);
  };

  return (
    <footer className="relative mt-16 bg-[#04060b] border-t border-white/12">
      {/* Top accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#ff1e46] to-transparent opacity-90 shadow-[0_0_12px_#ff1e46]" />

      {/* Newsletter strip */}
      <div className="border-b border-white/10 bg-[#080d1a] py-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex items-center gap-3.5 shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded bg-[#ff1e46]/20 border border-[#ff1e46]/40 text-white shadow-[0_0_12px_rgba(255,30,70,0.3)]">
                <Rss className="h-5 w-5 text-[#ff1e46]" aria-hidden />
              </div>
              <div>
                <p className="text-[15px] font-black text-white tracking-tight">Weekly Football Digest</p>
                <p className="text-[12px] text-[#cbd5e1] font-medium">BFL, transfers, European analysis & live broadcast schedules — every Friday</p>
              </div>
            </div>
            <div className="flex flex-1 gap-2 sm:max-w-md sm:ml-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitNewsletter()}
                placeholder="your@email.com"
                className="h-10 min-w-0 flex-1 rounded border border-white/20 bg-white/10 px-3.5 text-sm text-white placeholder:text-white/40 focus:border-[#ff1e46] focus:outline-none focus:ring-1 focus:ring-[#ff1e46]"
                aria-label="Newsletter email"
              />
              <button
                onClick={submitNewsletter}
                disabled={submitting}
                className="flex h-10 shrink-0 items-center gap-1.5 rounded bg-[#ff1e46] px-5 text-xs font-black text-white transition-all hover:bg-[#e01438] disabled:opacity-50 shadow-[0_0_12px_rgba(255,30,70,0.4)] sheen"
              >
                <Send className="h-3.5 w-3.5" aria-hidden />
                {submitting ? "Sending…" : "Subscribe"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-[1440px] px-4 pb-8 pt-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-12">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <LogoMark size={10} />
              <div className="leading-tight">
                <p className="text-[17px] font-black text-white tracking-tight">FOOTBALL HUB</p>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#ff1e46]">BANGLADESH</p>
              </div>
            </div>

            <p className="text-[13.5px] leading-relaxed text-[#cbd5e1] mb-6 max-w-sm font-medium">
              The digital home of Bangladeshi football — real-time live scores, league tables, exclusive news, transfer radar,
              tactical pitch analysis, and fan community in one international broadcast platform.
            </p>

            {/* Contact */}
            <div className="space-y-2.5 mb-6">
              <div className="flex items-center gap-2 text-[12px] text-white font-medium">
                <MapPin className="h-3.5 w-3.5 text-[#ff1e46] shrink-0" />
                Motijheel C/A, Dhaka-1000, Bangladesh
              </div>
              <div className="flex items-center gap-2 text-[12px] text-white font-medium">
                <Mail className="h-3.5 w-3.5 text-[#ff1e46] shrink-0" />
                contact@footballhub.com.bd
              </div>
              <div className="flex items-center gap-2 text-[12px] text-white font-medium">
                <Globe className="h-3.5 w-3.5 text-[#ff1e46] shrink-0" />
                🇧🇩 বাংলা · 🇬🇧 English Edition Available
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-2.5">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="flex h-9 w-9 items-center justify-center rounded border border-white/20 bg-white/5 text-white transition-all hover:border-[#ff1e46] hover:bg-[#ff1e46]/20 hover:text-white"
                  aria-label={`FHB on ${s.label}`}
                  rel="noopener noreferrer"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title} className="lg:col-span-2">
              <p className="mb-4 text-[11px] font-black uppercase tracking-[0.14em] text-white border-l-2 border-[#ff1e46] pl-2.5">
                {title}
              </p>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={go(l.view)}
                      className="text-left text-[13px] text-[#cbd5e1] font-semibold transition-colors hover:text-white hover:translate-x-0.5 group flex items-center gap-1"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Leagues column */}
          <div className="col-span-2 lg:col-span-2">
            <p className="mb-4 text-[11px] font-black uppercase tracking-[0.14em] text-white border-l-2 border-[#ff1e46] pl-2.5">
              Leagues & Cups
            </p>
            <ul className="space-y-2.5">
              {LEAGUES.map((l) => (
                <li key={l}>
                  <button
                    onClick={() => navigate({ name: "competitions" })}
                    className="text-left text-[13px] text-[#cbd5e1] font-semibold transition-colors hover:text-white hover:translate-x-0.5"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[12px] text-[#94a3b8] sm:flex-row font-medium">
          <p>© {new Date().getFullYear()} Football Hub Bangladesh. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-white">
            <span className="cursor-pointer transition-colors hover:text-[#00e5ff]">Terms of Service</span>
            <span className="cursor-pointer transition-colors hover:text-[#00e5ff]">Privacy Policy</span>
            <span className="cursor-pointer transition-colors hover:text-[#00e5ff]">Cookie Settings</span>
            <span className="cursor-pointer transition-colors hover:text-[#00e5ff]">Advertise with us</span>
            <span className="cursor-pointer transition-colors hover:text-[#00e5ff]">Press & Media</span>
          </div>
        </div>

        {/* Regional bureaux */}
        <p className="mt-3 text-center text-[11px] text-[#94a3b8] font-medium">
          Regional Bureaux: Motijheel (Dhaka) · Chittagong · Sylhet · Rajshahi · London (UK Broadcast Desk)
        </p>
      </div>
    </footer>
  );
}
