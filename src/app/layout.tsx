import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { QueryProvider } from "@/components/providers/query-provider";
import { LiveScoreProvider } from "@/components/providers/live-score-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

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
  declarations: [{ prop: "unicode-range", value: "U+0000-002F, U+003A-FFFF" }],
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://8780-43-251-84-53.ngrok-free.app"),
  title: "FHBD — Live Scores, News & Fan Community",
  description:
    "Live scores, fixtures, league tables, football news, transfer updates, short videos and a fan community — the complete platform for football.",
  keywords: [
    "FHBD",
    "Football Hub Bangladesh",
    "Bangladesh Football",
    "BFL",
    "Bangladesh Football League",
    "Live Scores",
    "Football News",
  ],
  authors: [{ name: "FHBD" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FHBD",
  },
  icons: {
    icon: [
      { url: "/logos/fhbd-badge.png", type: "image/png" },
      { url: "/favicon.png", type: "image/png", sizes: "64x64" },
    ],
    shortcut: "/logos/fhbd-badge.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
      { url: "/logos/fhbd-badge.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "FHBD — Live Scores, News & Fan Community",
    description: "Live scores • News • Shorts • Community — Bangladesh's football hub",
    siteName: "FHBD",
    images: [{ url: "/logos/fhbd-badge.png", width: 935, height: 215, alt: "FHBD Official Logo" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FHBD",
    description: "Live scores • News • Shorts • Community — Bangladesh's football hub",
    images: ["/logos/fhbd-badge.png"],
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${antipasto.variable} ${inter.variable} ${barlowCondensed.variable} subpixel-antialiased bg-background text-foreground transition-colors duration-200`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <QueryProvider>
            <LiveScoreProvider>{children}</LiveScoreProvider>
          </QueryProvider>
          <Toaster />
          <PwaRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
