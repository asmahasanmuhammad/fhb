"use client";

import { useAppStore, type View } from "@/store/app-store";

export function Footer() {
  const navigate = useAppStore((s) => s.navigate);
  const go = (v: View) => () => navigate(v);

  const links: Array<{ label: string; view?: View; href?: string }> = [
    { label: "লাইভ স্কোর", view: { name: "scores" } },
    { label: "লিগ টেবিল", view: { name: "standings" } },
    { label: "ফুটবল নিউজ", view: { name: "news" } },
    { label: "দলসমূহ", view: { name: "teams" } },
    { label: "খেলোয়াড়", view: { name: "players" } },
    { label: "টুর্নামেন্ট", view: { name: "competitions" } },
    { label: "শর্টস", view: { name: "shorts" } },
    { label: "কমিউনিটি", view: { name: "community" } },
    { label: "প্রিমিয়াম", view: { name: "premium" } },
  ];

  return (
    <footer className="mt-16 border-t border-border/60 bg-gradient-to-b from-background to-card/50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand + mission */}
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 font-display text-sm font-bold text-primary-foreground">
                F<span className="text-fhb-red">H</span>
              </span>
              <div className="leading-tight">
                <p className="font-display text-sm font-bold tracking-wider">FOOTBALL HUB BANGLADESH</p>
                <p className="text-[10px] text-muted-foreground">footballhub.com.bd</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              আমাদের মিশন — বাংলাদেশে ফুটবলকে জনপ্রিয় করা, সময়োপযোগী কনটেন্ট ছড়িয়ে দেওয়া এবং দেশের ফুটবলপ্রেমীদের নিয়ে গড়ে তোলা
              একটি শক্তিশালী ফ্যান ও কমিউনিটি নেটওয়ার্ক। লাইভ স্কোর থেকে শর্টস — সবকিছু একই প্ল্যাটফর্মে।
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="ফুটার লিংক">
            <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">এক্সপ্লোর</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {links.map((l) => (
                <button key={l.label} onClick={go(l.view!)} className="text-left text-xs text-foreground/80 transition-colors hover:text-primary">
                  {l.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Info */}
          <div>
            <p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">তথ্য</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>📧 contact@footballhub.com.bd</p>
              <p>📍 ঢাকা, বাংলাদেশ</p>
              <p className="pt-2">
                এই প্ল্যাটফর্মে Google AdSense ও প্রিমিয়াম সদস্যতার মাধ্যমে মনিটাইজেশন সংহত আছে। কনটেন্ট ক্রিয়েটররা আয়ের
                ড্যাশবোর্ড থেকে উপার্জন ট্র্যাক করতে পারেন।
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-5 text-[11px] text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Football Hub Bangladesh — সর্বস্বত্ব সংরক্ষিত</p>
          <p>
            বাংলাদেশের ফুটবলপ্রেমীদের জন্য <span className="text-primary">❤</span> দিয়ে তৈরি
          </p>
        </div>
      </div>
    </footer>
  );
}
