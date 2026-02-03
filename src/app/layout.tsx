import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

// Inline critical CSS to reduce initial CSS payload
const criticalCSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif; background: #0a0a0a; color: #fff; }
  main, nav, [role="main"] { display: block; width: 100%; }
  img { max-width: 100%; height: auto; display: block; }
`;

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
    default: "Nawaetu - Aplikasi Muslim: Jadwal Sholat, Al Quran & Kiblat",
    template: "%s | Nawaetu"
  },
  description: "Aplikasi Muslim lengkap dengan Jadwal Sholat akurat, Al Quran Online, Arah Kiblat, dan AI Ustadz. Teman ibadah modern untuk menjaga istiqomah.",
  keywords: ["Jadwal Sholat", "Arah Kiblat", "Al Quran Online", "Aplikasi Muslim", "Waktu Sholat", "Quran Digital", "Nawaetu"],
  authors: [{ name: "Nawaetu Team" }],
  creator: "Hadian R",
  publisher: "Nawaetu",
  metadataBase: new URL("https://nawaetu.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nawaetu - Teman Ibadahmu",
    description: "Jadwal Sholat, Al Quran, dan Kiblat Akurat dalam satu aplikasi.",
    url: "https://nawaetu.com",
    siteName: "Nawaetu",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nawaetu - Aplikasi Muslim Lengkap",
    description: "Jadwal Sholat & Al Quran Digital Terbaik.",
    creator: "@nawaetuapp", // Placeholder
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
import { WebVitals } from "@/components/WebVitals";
import AnalyticsLoader from "@/components/AnalyticsLoader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head />
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
        <ThemeProvider>
          <InfaqProvider>
            <PatternOverlay />
            <NotificationWatcher />
            <AppOverlays />
            {children}
            <Suspense fallback={null}>
              <BottomNav />
            </Suspense>
          </InfaqProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
