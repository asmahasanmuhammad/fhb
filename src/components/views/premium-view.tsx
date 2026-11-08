"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { MembershipPlan } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Crown, Check, Sparkles, ShieldCheck, Zap, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PremiumView() {
  const navigate = useAppStore((s) => s.navigate);
  const user = useAppStore((s) => s.user);
  const refreshUser = useAppStore((s) => s.refreshUser);
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ plans: MembershipPlan[] }>({
    queryKey: ["membership"],
    queryFn: async () => {
      const res = await fetch("/api/membership");
      return res.json().then((j) => j.data);
    },
  });

  const subscribe = useMutation({
    mutationFn: async (planCode: string) => {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data) => {
      refreshUser();
      toast({ title: "🎉 সদস্যতা সফল!", description: data.message });
    },
    onError: (e: Error) => toast({ title: "সদস্যতা ব্যর্থ", description: e.message, variant: "destructive" }),
  });

  const plans = data?.plans ?? [];

  const planMeta: Record<string, { icon: React.ReactNode; desc: string; accent: string }> = {
    FREE: { icon: <Zap className="h-6 w-6" aria-hidden />, desc: "সবার জন্য প্রাথমিক অভিজ্ঞতা", accent: "text-muted-foreground" },
    PRO: { icon: <Crown className="h-6 w-6" aria-hidden />, desc: "সত্যিকারের ফুটবল অনুরাগীদের জন্য", accent: "text-fhb-gold" },
    LEGEND: { icon: <Sparkles className="h-6 w-6" aria-hidden />, desc: "আল্টিমেট ফ্যান এক্সপেরিয়েন্স", accent: "text-fhb-red" },
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-fhb-gold/15 px-3.5 py-1.5 text-[11px] font-bold text-fhb-gold ring-1 ring-fhb-gold/30">
          <Crown className="h-3.5 w-3.5" aria-hidden /> FHB প্রিমিয়াম
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-wide sm:text-4xl">
          ফুটবলের নেশা, <span className="text-gradient-green">আরও গভীরভাবে</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          বিজ্ঞাপনমুক্ত অভিজ্ঞতা, এক্সক্লুসিভ ট্রান্সফার নিউজ, HD হাইলাইটস আর আরও অনেক কিছু — আপনার সাপোর্টই FHB-কে বাংলাদেশ
          ফুটবলের ভয়েস হতে সাহায্য করে।
        </p>
        {user?.isPremium && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary ring-1 ring-primary/30">
            <ShieldCheck className="h-4 w-4" aria-hidden /> আপনি একজন সক্রিয় প্রিমিয়াম সদস্য!
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid items-start gap-5 md:grid-cols-3">
          {plans.map((plan) => {
            const features: string[] = JSON.parse(plan.features || "[]");
            const meta = planMeta[plan.code] ?? planMeta.FREE;
            const isCurrent = user?.isPremium && plan.code !== "FREE";
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-2xl border bg-card p-6 transition-transform",
                  plan.popular && "border-fhb-gold/50 shadow-xl shadow-fhb-gold/10 md:-translate-y-2 md:scale-[1.02]"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-fhb-gold px-3 py-1 text-[10px] font-bold text-black">
                    সবচেয়ে জনপ্রিয়
                  </span>
                )}
                <div className={cn("mb-3", meta.accent)}>{meta.icon}</div>
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{meta.desc}</p>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-bold">{plan.price === 0 ? "ফ্রি" : formatMoney(plan.price)}</span>
                  {plan.price > 0 && <span className="text-xs text-muted-foreground">/{plan.period}</span>}
                </div>

                <ul className="mt-5 space-y-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                      <span className="text-foreground/85">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => {
                    if (!user) {
                      navigate({ name: "auth" });
                      return;
                    }
                    setBusy(plan.code);
                    subscribe.mutate(plan.code);
                  }}
                  disabled={subscribe.isPending && busy === plan.code}
                  variant={plan.popular ? "default" : "outline"}
                  className={cn("mt-6 w-full font-bold", plan.code === "LEGEND" && "bg-fhb-red hover:bg-fhb-red/90")}
                >
                  {subscribe.isPending && busy === plan.code
                    ? "প্রসেসিং..."
                    : plan.price === 0
                      ? "ফ্রি শুরু করুন"
                      : isCurrent
                        ? "চালু আছে"
                        : `${plan.name} নিন`}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment + FAQ */}
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-bold">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden /> পেমেন্ট পদ্ধতি
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            ডেমো মোডে সাবস্ক্রিপশন সঙ্গে সঙ্গেই অ্যাক্টিভ হয়। প্রোডাকশনে bKash, Nagad, Rocket ও কার্ড পেমেন্ট (SSLCommerz)
            ইন্টিগ্রেশনের জন্য প্রস্তুত কাঠামো — <code className="rounded bg-muted px-1.5 py-0.5 text-[10px]">/api/membership</code> এন্ডপয়েন্টে
            গেটওয়ে কলব্যাক যুক্ত করলেই হবে।
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["bKash", "Nagad", "Rocket", "Visa", "Mastercard"].map((p) => (
              <span key={p} className="rounded-lg border bg-muted/50 px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-display text-base font-bold">সাধারণ প্রশ্ন</h3>
          <div className="mt-3 space-y-3">
            {[
              ["প্রিমিয়াম নিলে বিজ্ঞাপন বন্ধ হবে?", "জি! প্রিমিয়াম সদস্যরা সম্পূর্ণ বিজ্ঞাপনমুক্ত অভিজ্ঞতা পান।"],
              ["ক্রিয়েটররা কীভাবে আয় করেন?", "শর্টসের ভিউ থেকে অ্যাড রেভিনিউ শেয়ার + ফ্যান টিপস — সবকিছু আয়ের ড্যাশবোর্ডে ট্র্যাক হয়।"],
              ["যেকোনো সময় বাতিল করা যায়?", "হ্যাঁ, প্রোফাইল থেকে যেকোনো সময় ফ্রি প্ল্যানে ফিরে যেতে পারবেন।"],
            ].map(([q, a]) => (
              <div key={q} className="rounded-xl border bg-background/50 p-3.5">
                <p className="text-xs font-bold">{q}</p>
                <p className="mt-1 text-xs text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
