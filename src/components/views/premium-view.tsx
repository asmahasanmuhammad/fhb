"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { MembershipPlan } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/football/section-header";
import { Crown, Check, ShieldCheck, Zap, Sparkles, CreditCard, HelpCircle, BadgeCheck } from "lucide-react";
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
      toast({ title: "সদস্যতা সফল", description: data.message });
    },
    onError: (e: Error) => toast({ title: "সদস্যতা ব্যর্থ", description: e.message, variant: "destructive" }),
  });

  const plans = data?.plans ?? [];

  const planMeta: Record<string, { icon: React.ReactNode; desc: string; accent: string }> = {
    FREE: { icon: <Zap className="h-5 w-5" aria-hidden />, desc: "সবার জন্য প্রাথমিক অভিজ্ঞতা", accent: "text-muted-foreground" },
    PRO: { icon: <Crown className="h-5 w-5" aria-hidden />, desc: "সত্যিকারের ফুটবল অনুরাগীদের জন্য", accent: "text-fhb-gold" },
    LEGEND: { icon: <Sparkles className="h-5 w-5" aria-hidden />, desc: "আল্টিমেট ফ্যান এক্সপেরিয়েন্স", accent: "text-fhb-red" },
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6">
      <PageHeader
        title="FHB প্রিমিয়াম"
        subtitle="ফুটবলের নেশা, আরও গভীরভাবে — বিজ্ঞাপনমুক্ত অভিজ্ঞতা ও এক্সক্লুসিভ কনটেন্ট"
        icon={<Crown className="h-5 w-5" aria-hidden />}
      >
        {user?.isPremium && (
          <span className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
            <ShieldCheck className="h-4 w-4" aria-hidden /> সক্রিয় প্রিমিয়াম সদস্য
          </span>
        )}
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96 rounded-xl" />
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
                  "relative overflow-hidden rounded-xl border bg-card p-6 transition-transform",
                  plan.popular
                    ? "border-fhb-gold/50 shadow-[0_18px_45px_-20px_rgba(0,0,0,0.55)] md:-translate-y-2"
                    : "border-border"
                )}
              >
                {plan.popular && (
                  <span className="absolute inset-x-0 top-0 h-[3px] bg-fhb-gold" aria-hidden />
                )}
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-lg",
                      plan.popular ? "bg-fhb-gold/15" : "bg-muted"
                    )}
                  >
                    <span className={meta.accent}>{meta.icon}</span>
                  </span>
                  {plan.popular && (
                    <span className="rounded-sm bg-fhb-gold/15 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-fhb-gold">
                      সবচেয়ে জনপ্রিয়
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{meta.desc}</p>
                <div className="mt-5 flex items-baseline gap-1.5 border-b border-border pb-5">
                  <span className="tabular font-display text-4xl font-bold text-foreground">
                    {plan.price === 0 ? "ফ্রি" : formatMoney(plan.price)}
                  </span>
                  {plan.price > 0 && <span className="text-xs text-muted-foreground">/{plan.period}</span>}
                </div>

                <ul className="mt-5 space-y-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs">
                      <span
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          plan.popular ? "bg-fhb-gold/20 text-fhb-gold" : "bg-primary/15 text-primary"
                        )}
                      >
                        <Check className="h-2.5 w-2.5" aria-hidden />
                      </span>
                      <span className="leading-relaxed text-foreground/85">{f}</span>
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
                  className={cn(
                    "mt-6 w-full rounded-md font-bold",
                    plan.popular && "bg-fhb-gold text-black hover:bg-fhb-gold/90",
                    plan.code === "LEGEND" && !plan.popular && "border-fhb-red/40 text-fhb-red hover:bg-fhb-red/10 hover:text-fhb-red"
                  )}
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
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
            <CreditCard className="h-5 w-5 text-primary" aria-hidden /> পেমেন্ট পদ্ধতি
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            ডেমো মোডে সাবস্ক্রিপশন সঙ্গে সঙ্গেই অ্যাক্টিভ হয়। প্রোডাকশনে bKash, Nagad, Rocket ও কার্ড পেমেন্ট
            (SSLCommerz) ইন্টিগ্রেশনের জন্য প্রস্তুত কাঠামো —{" "}
            <code className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px]">/api/membership</code> এন্ডপয়েন্টে
            গেটওয়ে কলব্যাক যুক্ত করলেই হবে।
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["bKash", "Nagad", "Rocket", "Visa", "Mastercard"].map((p) => (
              <span key={p} className="rounded-md border border-border bg-muted/50 px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
                {p}
              </span>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
            SSLCommerz নিরাপদ পেমেন্ট গেটওয়ে সাপোর্টেড
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
            <HelpCircle className="h-5 w-5 text-primary" aria-hidden /> সাধারণ প্রশ্ন
          </h3>
          <div className="mt-4 space-y-3">
            {[
              ["প্রিমিয়াম নিলে বিজ্ঞাপন বন্ধ হবে?", "জি! প্রিমিয়াম সদস্যরা সম্পূর্ণ বিজ্ঞাপনমুক্ত অভিজ্ঞতা পান।"],
              ["ক্রিয়েটররা কীভাবে আয় করেন?", "শর্টসের ভিউ থেকে অ্যাড রেভিনিউ শেয়ার + ফ্যান টিপস — সবকিছু আয়ের ড্যাশবোর্ডে ট্র্যাক হয়।"],
              ["যেকোনো সময় বাতিল করা যায়?", "হ্যাঁ, প্রোফাইল থেকে যেকোনো সময় ফ্রি প্ল্যানে ফিরে যেতে পারবেন।"],
            ].map(([q, a]) => (
              <div key={q} className="rounded-lg border border-border bg-background/50 p-3.5">
                <p className="text-xs font-bold text-foreground">{q}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
