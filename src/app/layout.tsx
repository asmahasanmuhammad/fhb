import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/providers/query-provider";
import { LiveScoreProvider } from "@/components/providers/live-score-provider";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Football Hub Bangladesh (FHB) — The Digital Home of Bangladeshi Football",
  description:
    "Live scores, fixtures, league tables, football news, transfer updates, short videos and a fan community — the complete platform for football in Bangladesh.",
  keywords: [
    "Football Hub Bangladesh",
    "FHB",
    "Bangladesh Football",
    "BPL",
    "Bangladesh Premier League",
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${oswald.variable} antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          <LiveScoreProvider>{children}</LiveScoreProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
