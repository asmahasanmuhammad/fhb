import type { Metadata, Viewport } from "next";
import { Inter, Archivo, Barlow_Condensed, Hind_Siliguri } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/providers/query-provider";
import { LiveScoreProvider } from "@/components/providers/live-score-provider";

/* ═══ Antipasto Pro — Geometric Modern Rounded Sans Serif ═══ */
const antipasto = localFont({
  src: [
    {
      path: "../../public/fonts/antipasto/AntipastoPro-Extralight_trial.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/antipasto/AntipastoPro-Light_trial.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/antipasto/AntipastoPro_trial.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/antipasto/AntipastoPro-Medium_trial.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/antipasto/AntipastoPro-DemiBold_trial.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/antipasto/AntipastoPro-Bold_trial.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/antipasto/AntipastoPro-ExtraBold_trial.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-antipasto",
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const archivo = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-bangla",
  subsets: ["bengali"],
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
  themeColor: "#101214",
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
        className={`${antipasto.variable} ${inter.variable} ${archivo.variable} ${barlowCondensed.variable} ${hindSiliguri.variable} antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          <LiveScoreProvider>{children}</LiveScoreProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
