import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Oswald } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/providers/query-provider";
import { LiveScoreProvider } from "@/components/providers/live-score-provider";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Football Hub Bangladesh (FHB) — বাংলাদেশের ফুটবলের ডিজিটাল ঠিকানা",
  description:
    "লাইভ স্কোর, ফিক্সচার, লিগ টেবিল, ফুটবল নিউজ, ট্রান্সফার আপডেট, শর্ট ভিডিও ও ফ্যান কমিউনিটি — বাংলাদেশের ফুটবলের সম্পূর্ণ প্ল্যাটফর্ম।",
  keywords: [
    "Football Hub Bangladesh",
    "FHB",
    "বাংলাদেশ ফুটবল",
    "BPL",
    "বাংলাদেশ প্রিমিয়ার লিগ",
    "লাইভ স্কোর",
    "ফুটবল নিউজ",
  ],
  authors: [{ name: "Football Hub Bangladesh" }],
  openGraph: {
    title: "Football Hub Bangladesh (FHB)",
    description: "লাইভ স্কোর • নিউজ • শর্টস • কমিউনিটি — বাংলাদেশের ফুটবল হাব",
    siteName: "FHB",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D1412",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="dark" suppressHydrationWarning>
      <body
        className={`${hindSiliguri.variable} ${oswald.variable} antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          <LiveScoreProvider>{children}</LiveScoreProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
