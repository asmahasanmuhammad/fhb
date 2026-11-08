"use client";

import { useAppStore, type View } from "@/store/app-store";
import { LogoMark } from "@/components/layout/header";
import { Facebook, Youtube, Twitter, Instagram, MapPin, Mail, ShieldCheck, BadgeCheck } from "lucide-react";

export function Footer() {
  const navigate = useAppStore((s) => s.navigate);
  const go = (v: View) => () => navigate(v);

  const explore: Array<{ label: string; view: View }> = [
    { label: "লাইভ স্কোর", view: { name: "scores" } },
    { label: "লিগ টেবিল", view: { name: "standings" } },
    { label: "ফুটবল নিউজ", view: { name: "news" } },
    { label: "দলসমূহ", view: { name: "teams" } },
    { label: "খেলোয়াড়", view: { name: "players" } },
    { label: "টুর্নামেন্ট", view: { name: "competitions" } },
    { label: "শর্টস", view: { name: "shorts" } },
    { label: "কমিউনিটি", view: { name: "community" } },
  ];

  const platform: Array<{ label: string; view: View }> = [
    { label: "প্রিমিয়াম সদস্যতা", view: { name: "premium" } },
    { label: "ক্রিয়েটর আয়ের ড্যাশবোর্ড", view: { name: "earnings" } },
    { label: "শর্টস আপলোড", view: { name: "upload" } },
    { label: "রেজিস্ট্রেশন", view: { name: "auth" } },
  ];

  return (
    <footer className="mt-16 border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand + mission */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <div className="leading-tight">
                <p className="font-display text-sm font-bold tracking-[0.08em] text-foreground">
                  FOOTBALL HUB BANGLADESH
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">footballhub.com.bd</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted-foreground">
              আমাদের মিশন — বাংলাদেশে ফুটবলকে জনপ্রিয় করা, সময়োপযুগী কনটেন্ট ছড়িয়ে দেওয়া এবং দেশের
              ফুটবলপ্রেমীদের নিয়ে গড়ে তোলা একটি শক্তিশালী ফ্যান ও কমিউনিটি নেটওয়ার্ক। লাইভ স্কোর থেকে শর্টস —
              সবকিছু একই প্ল্যাটফর্মে।
            </p>
            <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden /> ঢাকা, বাংলাদেশ
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" aria-hidden /> contact@footballhub.com.bd
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1">
              {[
                { label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
                { label: "YouTube", icon: <Youtube className="h-4 w-4" /> },
                { label: "X (Twitter)", icon: <Twitter className="h-4 w-4" /> },
                { label: "Instagram", icon: <Instagram className="h-4 w-4" /> },
              ].map((s) => (
                <button
                  key={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  aria-label={`FHB ${s.label}`}
                >
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Explore */}
          <nav className="md:col-span-2" aria-label="ফুটার — এক্সপ্লোর">
            <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-foreground">এক্সপ্লোর</p>
            <ul className="space-y-2">
              {explore.map((l) => (
                <li key={l.label}>
                  <button onClick={go(l.view)} className="text-left text-xs text-muted-foreground transition-colors hover:text-primary">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Platform */}
          <nav className="md:col-span-2" aria-label="ফুটার — প্ল্যাটফর্ম">
            <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-foreground">প্ল্যাটফর্ম</p>
            <ul className="space-y-2">
              {platform.map((l) => (
                <li key={l.label}>
                  <button onClick={go(l.view)} className="text-left text-xs text-muted-foreground transition-colors hover:text-primary">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Monetization / trust */}
          <div className="md:col-span-3">
            <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-foreground">মনিটাইজেশন</p>
            <div className="rounded-lg border border-border bg-background/60 p-4">
              <p className="flex items-center gap-2 text-xs font-bold text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden /> Google AdSense ও প্রিমিয়াম
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                এই প্ল্যাটফর্মে Google AdSense ও প্রিমিয়াম সদস্যতার মাধ্যমে মনিটাইজেশন সংহত আছে। কনটেন্ট
                ক্রিয়েটররা আয়ের ড্যাশবোর্ড থেকে উপার্জন ট্র্যাক করতে পারেন।
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["bKash", "Nagad", "Rocket", "Visa", "Mastercard"].map((p) => (
                  <span key={p} className="rounded-sm border border-border bg-muted/50 px-2 py-1 text-[10px] font-bold text-muted-foreground">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
              নিরাপদ পেমেন্ট গেটওয়ে (SSLCommerz) সাপোর্টেড
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-5 text-[11px] text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Football Hub Bangladesh — সর্বস্বত্ব সংরক্ষিত</p>
          <p className="flex items-center gap-1.5">
            বাংলাদেশের ফুটবলপ্রেমীদের জন্য
            <span className="h-1 w-1 rounded-full bg-fhb-red" aria-hidden />
            ঢাকা থেকে
          </p>
        </div>
      </div>
    </footer>
  );
}
