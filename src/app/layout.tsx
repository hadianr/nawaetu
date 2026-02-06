import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

// Optimize font loading with fallback and preload
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only preload primary font
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
  adjustFontFallback: true,
});

import { Amiri, Lateef } from "next/font/google";

// Arabic fonts - only load when needed
const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  fallback: ['serif'],
  adjustFontFallback: true,
});

const lateef = Lateef({
  variable: "--font-lateef",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  fallback: ['serif'],
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: {
    default: "Nawaetu - #NiatAjaDulu | Habit Tracker Ibadah dengan Gamifikasi",
    template: "%s | Nawaetu"
  },
  description: "Nawaetu - Build ibadah habits dengan gamifikasi seru: Daily Missions, Streak System, XP & Leveling. Lengkap dengan Asisten Muslim AI, Jadwal Sholat, Al Quran, dan Kiblat. #NiatAjaDulu",
  keywords: ["Nawaetu", "NiatAjaDulu", "Gamifikasi Ibadah", "Habit Tracker", "Daily Missions", "Streak System", "Jadwal Sholat", "Al Quran", "Asisten Muslim AI"],
  authors: [{ name: "Nawaetu Team" }],
  creator: "Hadian R",
  publisher: "Nawaetu",
  metadataBase: new URL("https://nawaetu.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nawaetu - #NiatAjaDulu",
    description: "Build ibadah habits dengan gamifikasi: Daily Missions, Streak, XP. Luruskan niat, konsisten beramal.",
    url: "https://nawaetu.com",
    siteName: "Nawaetu",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nawaetu - #NiatAjaDulu",
    description: "Habit tracker ibadah dengan gamifikasi! Daily Missions, Streak System, Al Quran, & Jadwal Sholat.",
    creator: "@nawaetuapp",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nawaetu",
  },
  formatDetection: {
    telephone: false,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Nawaetu",
  "applicationCategory": "LifestyleApplication",
  "operatingSystem": "Web, Android, iOS",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "IDR"
  },
  "description": "Aplikasi Muslim lengkap untuk jadwal sholat, arah kiblat, dan membaca Al Quran online.",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1024"
  }
};

import NotificationWatcher from "@/components/NotificationWatcher";
import PatternOverlay from "@/components/PatternOverlay";
import AppOverlays from "@/components/AppOverlays";
import { InfaqProvider } from "@/context/InfaqContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { WebVitals } from "@/components/WebVitals";
import FCMHandler from "@/components/FCMHandler";
import AnalyticsLoader from "@/components/AnalyticsLoader";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Resource Hints - Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch for analytics/monitoring (non-critical) */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://api.aladhan.com" />

        {/* Defer script execution for faster LCP */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Mark when first byte is received - helps trace LCP
              window.__pageLoadStart = performance.now();
            `
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} ${lateef.variable} antialiased`}
        suppressHydrationWarning
      >
        <WebVitals />
        <AnalyticsLoader />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LocaleProvider>
          <ThemeProvider>
            <InfaqProvider>
              <PatternOverlay />
              <NotificationWatcher />
              <AppOverlays />
              <FCMHandler />
              {children}

              <Suspense fallback={null}>
                <BottomNav />
              </Suspense>
            </InfaqProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
