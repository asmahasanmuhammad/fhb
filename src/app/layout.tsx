import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/providers/query-provider";
import { LiveScoreProvider } from "@/components/providers/live-score-provider";

/* ═══ Antipasto Pro — Geometric Modern Rounded Sans Serif (Primary Brand Font) ═══ */
const antipasto = localFont({
  src: [
    {
      path: "../fonts/antipasto/AntipastoPro-Extralight_trial.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../fonts/antipasto/AntipastoPro-Light_trial.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/antipasto/AntipastoPro_trial.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/antipasto/AntipastoPro-Medium_trial.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/antipasto/AntipastoPro-DemiBold_trial.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/antipasto/AntipastoPro-Bold_trial.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/antipasto/AntipastoPro-ExtraBold_trial.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-antipasto",
  display: "swap",
});

/* Self-hosted type system — broadcast condensed display + neutral UI sans. */
const inter = localFont({
  src: [
    { path: "../fonts/inter-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/inter-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/inter-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/inter-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/inter-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

const barlowCondensed = localFont({
  src: [
    { path: "../fonts/barlowcondensed-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/barlowcondensed-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/barlowcondensed-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/barlowcondensed-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Football Hub Bangladesh (FHB) — Live Scores, News & Fan Community",
  description:
    "Live scores, fixtures, league tables, football news, transfer updates, short videos and a fan community — the complete platform for football in Bangladesh.",
  keywords: [
    "Football Hub Bangladesh",
    "FHB",
    "Bangladesh Football",
    "BFL",
    "Bangladesh Football League",
    "Live Scores",
    "Football News",
  ],
  authors: [{ name: "Football Hub Bangladesh" }],
  openGraph: {
    title: "Football Hub Bangladesh (FHB)",
    description: "Live scores • News • Shorts • Community — Bangladesh's football hub",
    siteName: "FHB",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#06080F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${antipasto.variable} ${inter.variable} ${barlowCondensed.variable} antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          <LiveScoreProvider>{children}</LiveScoreProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
