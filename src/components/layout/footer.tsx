"use client";

import { useState } from "react";
import { useAppStore, type View } from "@/store/app-store";
import { LogoMark } from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Facebook, Youtube, Twitter, Instagram, Send } from "lucide-react";

/**
 * FHB 4.0 — Institutional footer.
 * Dark slab, 5-zone grid (brand + 3 link columns + contact),
 * slim legal bar. Flat, precise, no decoration.
 */

function FooterColumn({ title, links }: { title: string; links: Array<{ label: string; view: View }> }) {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <nav aria-label={`Footer — ${title}`}>
      <p className="mb-3.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-foreground/60">
        {title}
      </p>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <button
              onClick={() => navigate(l.view)}
              className="link-sweep text-left text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const columns: Array<{ title: string; links: Array<{ label: string; view: View }> }> = [
    {
      title: "Match Centre",
      links: [
        { label: "Live Scores", view: { name: "scores" } },
        { label: "League Tables", view: { name: "standings" } },
        { label: "Fixtures & Results", view: { name: "scores" } },
        { label: "Competitions", view: { name: "competitions" } },
        { label: "Live TV", view: { name: "live-tv" } },
      ],
    },
    {
      title: "News & Clubs",
      links: [
        { label: "Football News", view: { name: "news" } },
        { label: "Teams", view: { name: "teams" } },
        { label: "Players", view: { name: "players" } },
        { label: "Shorts", view: { name: "shorts" } },
      ],
    },
    {
      title: "Platform",
      links: [
        { label: "Fan Community", view: { name: "community" } },
        { label: "Premium Membership", view: { name: "premium" } },
        { label: "Creator Earnings", view: { name: "earnings" } },
        { label: "Upload Content", view: { name: "upload" } },
      ],
    },
  ];

  const submitNewsletter = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast({ title: "Enter a valid email", description: "Example: you@example.com" });
      return;
    }
    toast({ title: "Subscribed!", description: "The FHB weekly football digest is on its way." });
    setEmail("");
  };

  return (
    <footer className="mt-14 border-t border-border bg-[oklch(0.108_0.004_264)]">
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-10 pt-12 sm:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          {/* Brand zone */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <LogoMark size={30} />
              <span className="leading-none">
                <span className="label-cond block text-[14px] font-bold tracking-[0.06em] text-foreground">
                  FOOTBALL HUB
                </span>
                <span className="mt-[3px] block text-[8.5px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                  Bangladesh
                </span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-[12.5px] leading-relaxed text-muted-foreground">
              The digital home of Bangladeshi football. Live scores, league tables, news,
              transfers, shorts and a fan community — from the BFL to the Champions League.
            </p>

            <div className="mt-6 max-w-sm">
              <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-foreground/60">
                Weekly Football Digest
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitNewsletter()}
                  placeholder="Your email address"
                  className="h-9 min-w-0 flex-1 rounded-[7px] border border-input bg-white/[0.03] px-3 text-[12.5px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50"
                  aria-label="Newsletter email"
                />
                <button
                  onClick={submitNewsletter}
                  className="flex h-9 shrink-0 items-center gap-1.5 rounded-[7px] bg-primary px-3.5 text-[11.5px] font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97]"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden />
                  Subscribe
                </button>
              </div>
              <p className="mt-2 text-[10.5px] text-muted-foreground/70">
                League roundups, transfer updates and exclusive analysis — every Friday.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {[
                { label: "Facebook", icon: Facebook },
                { label: "YouTube", icon: Youtube },
                { label: "X (Twitter)", icon: Twitter },
                { label: "Instagram", icon: Instagram },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-border text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
                    aria-label={`FHB on ${s.label}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <FooterColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </div>

        {/* Official Partners & Sponsors Strip */}
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/75 mb-3 text-center">
            Official Broadcast & Digital Media Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-2">
            {[
              { name: "bKash", src: "/brands/bkash.png", h: "h-6" },
              { name: "Daraz", src: "/brands/daraz.png", h: "h-5" },
              { name: "Grameenphone", src: "/brands/grameenphone.svg", h: "h-6" },
              { name: "Robi", src: "/brands/robi.svg", h: "h-6" },
              { name: "City Bank", src: "/brands/citybank.png", h: "h-5" },
              { name: "Walton", src: "/brands/walton.png", h: "h-5" },
              { name: "Pathao", src: "/brands/pathao.png", h: "h-5" },
              { name: "Samsung", src: "/brands/samsung.png", h: "h-4" },
              { name: "Pran", src: "/brands/pran.png", h: "h-5" },
              { name: "Bata", src: "/brands/bata.png", h: "h-4" },
            ].map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-center rounded bg-white px-2.5 py-1 shadow-sm transition-transform hover:scale-105"
                title={p.name}
              >
                <img src={p.src} alt={p.name} className={cn("object-contain", p.h)} />
              </div>
            ))}
          </div>
        </div>

        {/* Contact strip */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-5 text-[11.5px] text-muted-foreground">
          <span>contact@footballhub.com.bd</span>
          <span className="text-muted-foreground/40" aria-hidden>·</span>
          <span>Advertise with us</span>
          <span className="text-muted-foreground/40" aria-hidden>·</span>
          <span>Press</span>
          <span className="text-muted-foreground/40" aria-hidden>·</span>
          <span>Careers</span>
          <span className="ml-auto hidden text-muted-foreground/60 sm:block">Dhaka, Bangladesh</span>
        </div>

        {/* Legal bar */}
        <div className="mt-5 flex flex-col items-center justify-between gap-2.5 border-t border-border pt-6 text-[11px] text-muted-foreground/70 sm:flex-row">
          <p>© {new Date().getFullYear()} Football Hub Bangladesh. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="link-sweep cursor-pointer transition-colors hover:text-foreground">Terms of Service</span>
            <span className="link-sweep cursor-pointer transition-colors hover:text-foreground">Privacy Policy</span>
            <span className="link-sweep cursor-pointer transition-colors hover:text-foreground">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
