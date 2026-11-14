"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { useReveal } from "@/hooks/use-reveal";
import { PageHeader } from "@/components/football/section-header";
import { PageLayout, RailCard } from "@/components/layout/page-layout";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Lock,
  Cookie,
  Mail,
  Megaphone,
  Newspaper,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  Scale,
  Building2,
  ExternalLink,
  Printer,
  Copy,
  Check,
  Send,
  MapPin,
  Clock,
  Download,
  Info,
  ChevronRight,
  Sparkles,
  Users,
  Eye,
  Globe,
  Radio,
} from "lucide-react";

export type LegalTab =
  | "terms"
  | "privacy"
  | "cookies"
  | "contact"
  | "advertise"
  | "press"
  | "careers";

const TABS: Array<{ id: LegalTab; label: string; icon: React.ElementType }> = [
  { id: "terms", label: "Terms of Service", icon: Scale },
  { id: "privacy", label: "Privacy Policy", icon: Lock },
  { id: "cookies", label: "Cookie Policy", icon: Cookie },
  { id: "contact", label: "Contact Us", icon: Mail },
  { id: "advertise", label: "Advertise", icon: Megaphone },
  { id: "press", label: "Press & Media", icon: Newspaper },
  { id: "careers", label: "Careers", icon: Briefcase },
];

export function LegalView({ currentTab = "terms" }: { currentTab?: LegalTab }) {
  useReveal();
  const { navigate } = useAppStore();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Cookie manager state
  const [cookiePrefs, setCookiePrefs] = useState({
    necessary: true,
    analytics: true,
    preferences: true,
    marketing: false,
  });

  // Load cookie preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fhb_cookie_preferences");
      if (saved) {
        const parsed = JSON.parse(saved);
        setCookiePrefs((prev) => ({ ...prev, ...parsed, necessary: true }));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveCookiePrefs = () => {
    try {
      localStorage.setItem("fhb_cookie_preferences", JSON.stringify(cookiePrefs));
      localStorage.setItem("fhb_cookie_consent", "custom");
      toast({
        title: "Cookie Preferences Saved",
        description: "Your privacy preferences have been updated successfully.",
      });
    } catch {
      toast({ title: "Preferences saved" });
    }
  };

  const handleAcceptAllCookies = () => {
    const all = { necessary: true, analytics: true, preferences: true, marketing: true };
    setCookiePrefs(all);
    try {
      localStorage.setItem("fhb_cookie_preferences", JSON.stringify(all));
      localStorage.setItem("fhb_cookie_consent", "all");
    } catch {}
    toast({
      title: "All Cookies Accepted",
      description: "You have enabled all functional, analytics and marketing cookies.",
    });
  };

  const handleRejectOptionalCookies = () => {
    const minimal = { necessary: true, analytics: false, preferences: false, marketing: false };
    setCookiePrefs(minimal);
    try {
      localStorage.setItem("fhb_cookie_preferences", JSON.stringify(minimal));
      localStorage.setItem("fhb_cookie_consent", "minimal");
    } catch {}
    toast({
      title: "Optional Cookies Declined",
      description: "Only strictly necessary cookies required for site operation are active.",
    });
  };

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    topic: "general",
    subject: "",
    message: "",
  });
  const [submittingContact, setSubmittingContact] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, email address, and inquiry message.",
      });
      return;
    }
    setSubmittingContact(true);
    setTimeout(() => {
      setSubmittingContact(false);
      setContactForm({ name: "", email: "", topic: "general", subject: "", message: "" });
      toast({
        title: "Inquiry Sent Successfully",
        description: "Thank you for reaching out to FHBD. Our team will get back to you within 24–48 hours.",
      });
    }, 900);
  };

  const copyPageUrl = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link Copied", description: "Document URL copied to clipboard." });
    } catch {}
  };

  const printDocument = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <PageLayout
      rail={
        <div className="space-y-5">
          {/* Quick Legal Hub Navigation */}
          <RailCard title="Institutional Hub">
            <div className="p-3 space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => navigate({ name: tab.id })}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </span>
                    <ChevronRight className={cn("h-3.5 w-3.5", isActive ? "opacity-100" : "opacity-40")} />
                  </button>
                );
              })}
            </div>
          </RailCard>

          {/* Quick Contact & Details */}
          <RailCard title="Official Entity Details">
            <div className="p-4 space-y-3.5 text-[12px] text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <Building2 className="h-4 w-4 shrink-0 text-foreground/70 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">FHBD Ltd.</p>
                  <p className="text-[11px]">Incorporated in Dhaka, Bangladesh</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-foreground/70 mt-0.5" />
                <p>Level 8, Plot 14, Road 11, Banani C/A, Dhaka 1213, Bangladesh</p>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-foreground/70" />
                <a
                  href="mailto:legal@footballhub.com.bd"
                  className="text-primary hover:underline"
                >
                  legal@footballhub.com.bd
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-foreground/70" />
                <p>Sat – Thu: 09:00 AM – 08:00 PM BST</p>
              </div>
            </div>
          </RailCard>

          {/* Quick Actions */}
          <RailCard title="Document Tools">
            <div className="p-3 space-y-2">
              <button
                onClick={printDocument}
                className="flex w-full items-center gap-2.5 rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                Print or Save as PDF
              </button>
              <button
                onClick={copyPageUrl}
                className="flex w-full items-center gap-2.5 rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-muted"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                {copied ? "Link Copied!" : "Copy Page Link"}
              </button>
            </div>
          </RailCard>
        </div>
      }
    >
      {/* Top Breadcrumb & Header */}
      <PageHeader
        back
        kicker="Governance & Institutional"
        title={
          currentTab === "terms"
            ? "Terms of Service"
            : currentTab === "privacy"
            ? "Privacy Policy"
            : currentTab === "cookies"
            ? "Cookie Policy & Preferences"
            : currentTab === "contact"
            ? "Contact & Support"
            : currentTab === "advertise"
            ? "Advertise with FHBD"
            : currentTab === "press"
            ? "Press Room & Media Kit"
            : "Careers at FHBD"
        }
        subtitle={
          currentTab === "terms"
            ? "Last revised: November 12, 2026 · Version 4.2 · Applies to all FHBD platforms, APIs, and digital broadcasts"
            : currentTab === "privacy"
            ? "Effective date: November 12, 2026 · How FHBD safeguards, processes, and respects fan & creator data"
            : currentTab === "cookies"
            ? "Transparency regarding how we use cookies, tracking pixels, and local storage on FHBD"
            : currentTab === "contact"
            ? "Get in touch with our editorial desk, partnership team, and technical support"
            : currentTab === "advertise"
            ? "Reach millions of passionate football fans across Bangladesh and South Asia"
            : currentTab === "press"
            ? "Official announcements, media assets, and editorial guidelines"
            : "Join our squad in Dhaka building the modern digital home of Bangladeshi football"
        }
        icon={<Scale className="h-4 w-4" />}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={printDocument}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground hover:text-foreground"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
          <button
            onClick={copyPageUrl}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Share"}
          </button>
        </div>
      </PageHeader>

      {/* Tab bar for mobile & desktop navigation */}
      <div className="mb-8 flex overflow-x-auto no-scrollbar gap-1.5 border-b border-border pb-2.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate({ name: tab.id })}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: TERMS OF SERVICE */}
      {currentTab === "terms" && (
        <div className="space-y-8 text-foreground">
          {/* Institutional Alert */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[14px] font-bold text-foreground">
                  Official Terms of Service Summary
                </h4>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                  By accessing or using FHBD, including our web portal,
                  mobile progressive web application, live score services, video shorts platform,
                  and digital TV streaming, you acknowledge that you have read, understood, and agreed
                  to be bound by these Terms of Service and our Privacy Policy.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <section className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                1
              </span>
              <h3 className="text-lg font-bold tracking-tight">Acceptance of Terms & Eligibility</h3>
            </div>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              These Terms of Service constitute a legally binding agreement between you (the &ldquo;User&rdquo;)
              and FHBD Ltd. (&ldquo;FHBD&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;),
              governing your access to and use of footballhub.com.bd and all associated digital products.
            </p>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              You must be at least 13 years of age to register an account or interact with the FHBD fan community.
              If you are under 18 years old, you represent that you have received parental or legal guardian consent
              to use our services and participate in any creator earnings or subscription programs.
            </p>
          </section>

          {/* Section 2 */}
          <section className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                2
              </span>
              <h3 className="text-lg font-bold tracking-tight">User Accounts & Authentication</h3>
            </div>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              When registering an account with FHBD, you agree to provide truthful, accurate, and current information.
              You are entirely responsible for safeguarding your password and account credentials.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-muted-foreground">
              <li>You may not share or transfer your account credentials to any third party.</li>
              <li>You must notify us immediately at <span className="text-foreground font-mono">support@footballhub.com.bd</span> if you suspect unauthorized access.</li>
              <li>FHBD reserves the right to reclaim or suspend usernames that infringe on trademarks, club identifiers, or impersonate verified players or journalists.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                3
              </span>
              <h3 className="text-lg font-bold tracking-tight">Fan Community Standards & Fair Play</h3>
            </div>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              FHBD thrives on passionate, constructive football discourse covering the
              Bangladesh Premier League (BFL), national teams, European leagues, and grassroots tournaments.
              We maintain a strict zero-tolerance policy against:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-lg border border-border/80 bg-muted/30 p-3.5">
                <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                  Hate Speech & Abuse
                </p>
                <p className="mt-1 text-[11.5px] text-muted-foreground">
                  Abusive slurs, personal threats, or harassment aimed at players, referees, clubs, or fellow supporters.
                </p>
              </div>
              <div className="rounded-lg border border-border/80 bg-muted/30 p-3.5">
                <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                  Illegal Betting & Match-Fixing
                </p>
                <p className="mt-1 text-[11.5px] text-muted-foreground">
                  Promoting unregulated gambling syndicates, scam tipping groups, or match-fixing conspiracies.
                </p>
              </div>
              <div className="rounded-lg border border-border/80 bg-muted/30 p-3.5">
                <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                  Piracy & Unauthorized Feeds
                </p>
                <p className="mt-1 text-[11.5px] text-muted-foreground">
                  Distributing illegal streaming links or pirated match broadcasts outside authorized channels.
                </p>
              </div>
              <div className="rounded-lg border border-border/80 bg-muted/30 p-3.5">
                <p className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                  Spam & Artificial Engagement
                </p>
                <p className="mt-1 text-[11.5px] text-muted-foreground">
                  Automated bots, fake account swarms, or manipulative view/like generation scripts.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                4
              </span>
              <h3 className="text-lg font-bold tracking-tight">Creator Earnings & Monetization</h3>
            </div>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              Qualified creators who upload original shorts, analysis videos, and tactical reels may earn revenue
              share according to FHBD&apos;s verified creator program.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-muted-foreground">
              <li>Revenue calculations are based on valid view metrics and advertising RPMs settled monthly.</li>
              <li>Payouts are disbursed via verified bKash, Nagad, or Bangladeshi bank accounts with minimum withdrawal thresholds of ৳500.</li>
              <li>FHBD reserves the right to withhold earnings derived from automated bot views, stolen broadcast clips, or copyright strikes.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                5
              </span>
              <h3 className="text-lg font-bold tracking-tight">Premium Subscriptions & Billing</h3>
            </div>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              FHBD Pro and FHBD Legend subscription tiers provide ad-free browsing, full-HD digital streams, and exclusive
              scouting reports. Subscriptions are billed in Bangladeshi Taka (BDT) via official payment gateways.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-muted-foreground">
              <li>Subscriptions renew automatically unless canceled prior to the next billing date.</li>
              <li>Refund requests submitted within 48 hours of accidental renewal may be reviewed on a case-by-case basis.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                6
              </span>
              <h3 className="text-lg font-bold tracking-tight">Governing Law & Legal Jurisdiction</h3>
            </div>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              These Terms shall be governed by, construed, and enforced in accordance with the laws of the
              People&apos;s Republic of Bangladesh. Any dispute arising out of or related to these terms shall be subject
              to the exclusive jurisdiction of the competent courts in Dhaka, Bangladesh.
            </p>
          </section>
        </div>
      )}

      {/* TAB CONTENT: PRIVACY POLICY */}
      {currentTab === "privacy" && (
        <div className="space-y-8 text-foreground">
          {/* Privacy Commitment Alert */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[14px] font-bold text-foreground">
                  Our Privacy Promise to Bangladeshi Football Fans
                </h4>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                  FHBD is committed to safeguarding your personal data. We adhere to
                  international privacy standards and relevant data protection laws of Bangladesh. We never
                  sell your personal information or contact details to third-party data brokers.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <section className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                1
              </span>
              <h3 className="text-lg font-bold tracking-tight">Information We Collect</h3>
            </div>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              To deliver live match fixtures, push alerts, video feeds, and personalized club news, we collect:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="rounded-lg border border-border p-3.5 bg-muted/20">
                <p className="text-xs font-bold text-foreground mb-1">Account Credentials</p>
                <p className="text-[11.5px] text-muted-foreground">
                  Name, email address, password hashes, profile avatar, and username chosen during sign-up.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3.5 bg-muted/20">
                <p className="text-xs font-bold text-foreground mb-1">Football Preferences</p>
                <p className="text-[11.5px] text-muted-foreground">
                  Favorited clubs (e.g. Abahani, Bashundhara Kings, Mohammedan), followed players, and match notifications.
                </p>
              </div>
              <div className="rounded-lg border border-border p-3.5 bg-muted/20">
                <p className="text-xs font-bold text-foreground mb-1">Creator Payout Details</p>
                <p className="text-[11.5px] text-muted-foreground">
                  Registered bKash, Nagad wallet numbers or bank account titles for verified creator disbursement.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                2
              </span>
              <h3 className="text-lg font-bold tracking-tight">How We Use Your Data</h3>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-[13px] text-muted-foreground">
              <li><strong className="text-foreground">Core Services:</strong> Providing real-time live score updates, league tables, video playback, and push notifications for goals and cards.</li>
              <li><strong className="text-foreground">Personalization:</strong> Prioritizing fixtures and news articles related to your chosen clubs and competitions.</li>
              <li><strong className="text-foreground">Monetization & Accounting:</strong> Auditing view metrics, calculating creator RPM, and processing payouts.</li>
              <li><strong className="text-foreground">Security & Fraud Prevention:</strong> Detecting malicious bot activity, unauthorized login attempts, and abusive community content.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                3
              </span>
              <h3 className="text-lg font-bold tracking-tight">Your Privacy Rights & Data Control</h3>
            </div>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              Under our data protection policy, every registered user has full control over their digital footprint:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg border border-border p-3.5 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-foreground">Right to Access & Export</p>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">
                    Download an archive of your profile, comment history, and shorts interactions.
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-border p-3.5 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-foreground">Right to Erasure (Be Forgotten)</p>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">
                    Request permanent deletion of your account and personal identifiers from our databases.
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() =>
                  toast({
                    title: "Privacy Request Submitted",
                    description: "Our Data Protection Officer will email instructions to your registered account within 48 hours.",
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80"
              >
                <Download className="h-3.5 w-3.5" />
                Request Personal Data Export
              </button>
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                4
              </span>
              <h3 className="text-lg font-bold tracking-tight">Data Protection Officer (DPO) Contact</h3>
            </div>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              For any questions, requests, or grievances regarding your personal information, please write directly to:
            </p>
            <div className="rounded-lg bg-muted/40 p-3.5 border border-border text-[12.5px] text-muted-foreground">
              <p className="font-semibold text-foreground">Data Privacy Desk — FHBD</p>
              <p>Email: <a href="mailto:privacy@footballhub.com.bd" className="text-primary hover:underline">privacy@footballhub.com.bd</a></p>
              <p>Address: Level 8, Plot 14, Road 11, Banani C/A, Dhaka 1213, Bangladesh</p>
            </div>
          </section>
        </div>
      )}

      {/* TAB CONTENT: COOKIES POLICY & CONSENT MANAGER */}
      {currentTab === "cookies" && (
        <div className="space-y-8 text-foreground">
          {/* Interactive Cookie Consent Manager */}
          <div className="rounded-xl border-2 border-primary/30 bg-card p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold tracking-tight">Cookie Consent Manager</h3>
                </div>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  Customize which cookies and local storage tokens FHBD may activate on your browser.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleRejectOptionalCookies}
                  className="rounded-lg border border-border bg-muted/50 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Decline Optional
                </button>
                <button
                  onClick={handleAcceptAllCookies}
                  className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:brightness-110"
                >
                  Accept All
                </button>
              </div>
            </div>

            {/* 4 Cookie Categories */}
            <div className="divide-y divide-border pt-2">
              {/* Essential */}
              <div className="py-4 flex items-start justify-between gap-4">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[13.5px] font-bold text-foreground">Strictly Necessary Cookies</p>
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                      Always Active
                    </Badge>
                  </div>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    Required for core website functionality, secure login authentication (<code className="text-xs">fhb_session</code>),
                    CSRF protection, and dark/light display preferences. These cannot be disabled.
                  </p>
                </div>
                <Switch checked disabled className="data-[state=checked]:bg-emerald-600" />
              </div>

              {/* Analytics */}
              <div className="py-4 flex items-start justify-between gap-4">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[13.5px] font-bold text-foreground">Performance & Match Center Analytics</p>
                    <Badge variant="outline" className="text-[10px]">
                      Optional
                    </Badge>
                  </div>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    Helps us understand reader traffic, measure live score latency, identify video streaming buffer rates,
                    and continuously optimize our server response times across Bangladesh.
                  </p>
                </div>
                <Switch
                  checked={cookiePrefs.analytics}
                  onCheckedChange={(checked) => setCookiePrefs((p) => ({ ...p, analytics: checked }))}
                />
              </div>

              {/* Functional */}
              <div className="py-4 flex items-start justify-between gap-4">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[13.5px] font-bold text-foreground">Functional & Club Preferences</p>
                    <Badge variant="outline" className="text-[10px]">
                      Optional
                    </Badge>
                  </div>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    Remembers your favorite club crests, pinned league table selections, audio mute state in video shorts,
                    and customized match alert notifications.
                  </p>
                </div>
                <Switch
                  checked={cookiePrefs.preferences}
                  onCheckedChange={(checked) => setCookiePrefs((p) => ({ ...p, preferences: checked }))}
                />
              </div>

              {/* Marketing */}
              <div className="py-4 flex items-start justify-between gap-4">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[13.5px] font-bold text-foreground">Official Partner & Sponsorship Cookies</p>
                    <Badge variant="outline" className="text-[10px]">
                      Optional
                    </Badge>
                  </div>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    Limits ad repetition, validates campaign interactions with our official sponsors (e.g. bKash, Daraz, Grameenphone),
                    and prevents click fraud. Premium members automatically bypass all ad cookies.
                  </p>
                </div>
                <Switch
                  checked={cookiePrefs.marketing}
                  onCheckedChange={(checked) => setCookiePrefs((p) => ({ ...p, marketing: checked }))}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={handleSaveCookiePrefs}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 active:scale-95 transition-all shadow-sm"
              >
                <Sliders className="h-3.5 w-3.5" />
                Save My Preferences
              </button>
            </div>
          </div>

          {/* Cookie Audit Table */}
          <section className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-4">
            <h3 className="text-lg font-bold tracking-tight">Active Cookies & Storage Matrix</h3>
            <p className="text-[13px] text-muted-foreground">
              The table below summarizes the key cookies and local storage tokens deployed on FHBD:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-semibold text-foreground">
                    <th className="p-3">Token Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-muted-foreground">
                  <tr>
                    <td className="p-3 font-mono font-medium text-foreground">fhb_session</td>
                    <td className="p-3">Strictly Necessary</td>
                    <td className="p-3">30 Days</td>
                    <td className="p-3">Stores encrypted session token for signed-in fan accounts.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-foreground">theme</td>
                    <td className="p-3">Strictly Necessary</td>
                    <td className="p-3">Persistent</td>
                    <td className="p-3">Preserves your Dark / Light / Auto mode UI theme preference.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-foreground">sidebar_state</td>
                    <td className="p-3">Strictly Necessary</td>
                    <td className="p-3">7 Days</td>
                    <td className="p-3">Maintains desktop navigation rail expanded/collapsed state.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-foreground">fhb_cookie_preferences</td>
                    <td className="p-3">Strictly Necessary</td>
                    <td className="p-3">1 Year</td>
                    <td className="p-3">Records your cookie choices and GDPR/Bangladesh consent status.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-foreground">_fhb_analytics</td>
                    <td className="p-3">Performance</td>
                    <td className="p-3">90 Days</td>
                    <td className="p-3">Aggregated anonymous match center visit duration and live stream load times.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Browser controls */}
          <section className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-3.5">
            <h3 className="text-lg font-bold tracking-tight">Managing Cookies in Your Browser</h3>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              You can also configure your web browser to block or clear cookies at any time. Consult your browser&apos;s
              official documentation:
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {[
                { name: "Google Chrome", url: "https://support.google.com/chrome/answer/95647" },
                { name: "Mozilla Firefox", url: "https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" },
                { name: "Apple Safari", url: "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" },
                { name: "Microsoft Edge", url: "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" },
              ].map((b) => (
                <a
                  key={b.name}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  {b.name}
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB CONTENT: CONTACT US */}
      {currentTab === "contact" && (
        <div className="space-y-8 text-foreground">
          {/* Contact Direct Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-5 space-y-2">
              <Mail className="h-5 w-5 text-primary" />
              <h4 className="font-bold text-sm text-foreground">General Support</h4>
              <p className="text-xs text-muted-foreground">For account queries, bug reports, and feedback.</p>
              <a href="mailto:contact@footballhub.com.bd" className="text-xs font-semibold text-primary hover:underline block pt-1">
                contact@footballhub.com.bd
              </a>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 space-y-2">
              <Megaphone className="h-5 w-5 text-primary" />
              <h4 className="font-bold text-sm text-foreground">Advertising & Sponsorship</h4>
              <p className="text-xs text-muted-foreground">For commercial campaigns and brand integrations.</p>
              <a href="mailto:ads@footballhub.com.bd" className="text-xs font-semibold text-primary hover:underline block pt-1">
                ads@footballhub.com.bd
              </a>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 space-y-2">
              <Newspaper className="h-5 w-5 text-primary" />
              <h4 className="font-bold text-sm text-foreground">Editorial & Press Desk</h4>
              <p className="text-xs text-muted-foreground">For press releases, media kits, and interviews.</p>
              <a href="mailto:press@footballhub.com.bd" className="text-xs font-semibold text-primary hover:underline block pt-1">
                press@footballhub.com.bd
              </a>
            </div>
          </div>

          {/* Interactive Form */}
          <div className="rounded-xl border border-border bg-card p-6 sm:p-7">
            <h3 className="text-lg font-bold tracking-tight mb-1">Send Us a Direct Message</h3>
            <p className="text-xs text-muted-foreground mb-6">
              Our team operates out of Dhaka and responds to inquiries within 24 to 48 business hours.
            </p>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Tariqul Islam"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="e.g. name@example.com"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Inquiry Department</label>
                  <select
                    value={contactForm.topic}
                    onChange={(e) => setContactForm({ ...contactForm, topic: e.target.value })}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="general">General Support / Feedback</option>
                    <option value="advertising">Advertising & Brand Partnership</option>
                    <option value="editorial">Editorial / Story Submission</option>
                    <option value="creator">Creator Monetization / Payout Query</option>
                    <option value="legal">Legal / Privacy / Copyright DMCA</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="Brief subject of your message"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Message *</label>
                <textarea
                  rows={5}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Provide details about your query..."
                  className="w-full rounded-lg border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingContact}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {submittingContact ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ADVERTISE */}
      {currentTab === "advertise" && (
        <div className="space-y-8 text-foreground">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-primary font-mono">2.8M+</p>
              <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">
                Monthly Active Fans
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">14.5M+</p>
              <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">
                Monthly Page Views
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">74%</p>
              <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">
                Aged 18–34 Demographic
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-500 font-mono">#1</p>
              <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">
                Football Portal in BD
              </p>
            </div>
          </div>

          {/* Ad Products */}
          <div className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-5">
            <h3 className="text-lg font-bold tracking-tight">High-Impact Advertising Formats</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-1.5">
                <p className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Radio className="h-4 w-4 text-primary" />
                  Live Score Ticker Sponsor
                </p>
                <p className="text-xs text-muted-foreground">
                  Prime logo placement and branded micro-copy right on the omnipresent sticky score ticker seen on every page.
                </p>
              </div>
              <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-1.5">
                <p className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-primary" />
                  High-Visibility Display Banners
                </p>
                <p className="text-xs text-muted-foreground">
                  IAB standard leaderboard (970x90, 728x90) and sticky mobile anchors delivering 100% viewability on smartphones.
                </p>
              </div>
              <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-1.5">
                <p className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Match Highlights Video Pre-Roll
                </p>
                <p className="text-xs text-muted-foreground">
                  Unskippable 6s or 15s pre-roll video ads before BFL highlights and match clips with interactive click-through cards.
                </p>
              </div>
              <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-1.5">
                <p className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Sponsored Fan Community Activations
                </p>
                <p className="text-xs text-muted-foreground">
                  Branded fan polls, match prediction challenges, and custom tournament hubs for major football cups.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3 items-center">
              <button
                onClick={() => navigate({ name: "contact" })}
                className="rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110"
              >
                Request 2026 Rate Card & Media Kit
              </button>
              <a
                href="mailto:ads@footballhub.com.bd"
                className="text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                Or email directly: <span className="text-primary font-mono">ads@footballhub.com.bd</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRESS */}
      {currentTab === "press" && (
        <div className="space-y-8 text-foreground">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-4">
            <h3 className="text-lg font-bold tracking-tight">Press Releases & Milestones</h3>
            <div className="divide-y divide-border">
              <div className="py-4 space-y-1">
                <p className="text-xs font-mono text-muted-foreground">October 28, 2026 · Dhaka</p>
                <h4 className="text-sm font-bold text-foreground">
                  FHBD Unveils FHBD 4.0 Architecture with Sub-Second Live BFL Scores
                </h4>
                <p className="text-xs text-muted-foreground">
                  FHBD announced its upgraded real-time sports telemetry platform, reducing live score latency to under 300ms across Bangladesh.
                </p>
              </div>
              <div className="py-4 space-y-1">
                <p className="text-xs font-mono text-muted-foreground">August 15, 2026 · Dhaka</p>
                <h4 className="text-sm font-bold text-foreground">
                  FHBD Launches Creator Monetization Program for Bangladeshi Sports Journalists & Video Creators
                </h4>
                <p className="text-xs text-muted-foreground">
                  Over 150 local football analysts onboarded to create original tactical reels with instant bKash revenue payouts.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-3">
            <h3 className="text-lg font-bold tracking-tight">Official Brand Assets</h3>
            <p className="text-xs text-muted-foreground">
              Download official vector SVG logos, wordmarks, and color palette specifications for press publication.
            </p>
            <div className="pt-1 flex gap-3">
              <a
                href="/logos/fhb-white.svg"
                download="fhb-logo-pack.svg"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <Download className="h-3.5 w-3.5" />
                Download Vector Logo (.SVG)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CAREERS */}
      {currentTab === "careers" && (
        <div className="space-y-8 text-foreground">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-7 space-y-3">
            <h3 className="text-lg font-bold tracking-tight">Join the Pitch at FHBD</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              We are a passionate squad of engineers, football purists, and multimedia storytellers in Dhaka building
              the definitive digital stadium for Bangladeshi football. We offer competitive BDT compensation,
              comprehensive health coverage, match day passes, and flexible hybrid remote options.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-foreground">Current Open Positions</h3>
            {[
              {
                title: "Senior Full Stack Engineer (Next.js / TypeScript / WebSockets)",
                dept: "Engineering",
                loc: "Dhaka, Bangladesh (Hybrid)",
                type: "Full-Time",
              },
              {
                title: "Lead Football Editor (Bangladesh Premier League Desk)",
                dept: "Editorial",
                loc: "Dhaka (On-site / Stadium matches)",
                type: "Full-Time",
              },
              {
                title: "Shorts & Video Highlights Producer",
                dept: "Creative & Media",
                loc: "Dhaka (Hybrid)",
                type: "Full-Time",
              },
              {
                title: "Community & Social Growth Specialist",
                dept: "Marketing",
                loc: "Remote (Bangladesh)",
                type: "Full-Time",
              },
            ].map((job) => (
              <div
                key={job.title}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">{job.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">{job.dept}</span>
                    <span>·</span>
                    <span>{job.loc}</span>
                    <span>·</span>
                    <Badge variant="outline" className="text-[10px] py-0">{job.type}</Badge>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigate({ name: "contact" });
                    toast({
                      title: "Application",
                      description: `Selected "${job.title}". Please send your CV via our contact desk.`,
                    });
                  }}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 shrink-0"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
