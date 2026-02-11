import type { Metadata, Viewport } from "next";
import { APP_CONFIG } from "@/config/app-config";
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
    default: "Nawaetu - Aplikasi Muslim Lengkap | Jadwal Sholat, Al Quran, Kiblat, Tasbih Digital",
    template: "%s | Nawaetu - Aplikasi Muslim #NiatAjaDulu"
  },
  description: "Nawaetu - Aplikasi Muslim lengkap dengan Habit Tracker Ibadah, Jadwal Sholat Akurat, Al Quran Online & Terjemahan, Arah Kiblat, Tasbih Digital, dan Asisten AI. Gamifikasi seru: Daily Missions, Streak System, XP & Leveling. Gratis! #NiatAjaDulu",
  keywords: [
    // Brand
    "Nawaetu", "NiatAjaDulu", "#NiatAjaDulu",
    // Primary Keywords (Indonesian)
    "aplikasi muslim", "aplikasi muslim terbaik", "aplikasi muslim lengkap",
    "aplikasi ibadah", "aplikasi sholat", "aplikasi al quran",
    // Features
    "jadwal sholat", "jadwal sholat akurat", "waktu sholat", "adzan otomatis",
    "al quran online", "baca quran online", "quran digital", "quran terjemahan",
    "arah kiblat", "kiblat online", "compass kiblat", "qibla direction",
    "tasbih digital", "dzikir counter", "tasbih online",
    // Gamification
    "habit tracker ibadah", "gamifikasi ibadah", "daily missions islam",
    "streak ibadah", "motivasi ibadah", "konsisten ibadah",
    // AI
    "asisten muslim ai", "chatbot islam", "tanya ustadz online",
    // General
    "aplikasi ramadan", "aplikasi puasa", "panduan muslim"
  ],
  authors: [{ name: "Nawaetu Team" }],
  creator: "Hadian R",
  publisher: "Nawaetu",
  metadataBase: new URL("https://nawaetu.com"),
  alternates: {
    canonical: "/",
  },
  // Favicon configuration
  icons: {
    icon: [
      { url: "/icon.png", sizes: "any" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Nawaetu - Aplikasi Muslim Lengkap #NiatAjaDulu",
    description: "Aplikasi Muslim lengkap: Jadwal Sholat Akurat, Al Quran Online, Arah Kiblat, Tasbih Digital, Habit Tracker Ibadah dengan Gamifikasi. Gratis!",
    url: "https://nawaetu.com",
    siteName: "Nawaetu",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nawaetu - Habit Tracker Ibadah dengan Gamifikasi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nawaetu - Aplikasi Muslim Lengkap #NiatAjaDulu",
    description: "Jadwal Sholat, Al Quran, Kiblat, Tasbih Digital, Habit Tracker Ibadah. Gamifikasi seru: Daily Missions, Streak, XP. Gratis!",
    creator: "@nawaetuapp",
    images: ["/og-image.png"],
  },
  manifest: `/manifest.webmanifest?v=${APP_CONFIG.version}`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nawaetu",
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Comprehensive Structured Data for SEO
const jsonLdSchemas = [
  // 1. SoftwareApplication Schema
  {
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
    "description": "Aplikasi Muslim lengkap dengan Jadwal Sholat, Al Quran Online, Arah Kiblat, Tasbih Digital, dan Habit Tracker Ibadah dengan gamifikasi.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1024"
    },
    "screenshot": "https://nawaetu.com/icon-512x512.png",
    "softwareVersion": APP_CONFIG.version,
    "author": {
      "@type": "Organization",
      "name": "Nawaetu Team"
    }
  },
  // 2. Organization Schema
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Nawaetu",
    "url": "https://nawaetu.com",
    "logo": "https://nawaetu.com/icon-512x512.png",
    "description": "Platform aplikasi Muslim lengkap untuk membantu umat Islam dalam beribadah sehari-hari.",
    "sameAs": [
      "https://twitter.com/nawaetuapp",
      "https://instagram.com/nawaetuapp"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "availableLanguage": ["Indonesian", "English"]
    }
  },
  // 3. WebSite Schema with Search Action
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Nawaetu",
    "url": "https://nawaetu.com",
    "description": "Aplikasi Muslim lengkap: Jadwal Sholat, Al Quran, Kiblat, Tasbih Digital, Habit Tracker Ibadah.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://nawaetu.com/quran?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "id-ID"
  }
];

import NotificationWatcher from "@/components/NotificationWatcher";
import PatternOverlay from "@/components/PatternOverlay";
import AppOverlays from "@/components/AppOverlays";
import { InfaqProvider } from "@/context/InfaqContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { WebVitals } from "@/components/WebVitals";
import FCMHandler from "@/components/FCMHandler";
import AnalyticsLoader from "@/components/AnalyticsLoader";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import DataSyncer from "@/components/DataSyncer";



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

        {/* iOS PWA Support */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Nawaetu" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

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
        {/* Structured Data - Multiple Schemas */}
        {jsonLdSchemas.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <LocaleProvider>
          <ThemeProvider>
            <AuthSessionProvider>
              <InfaqProvider>
                <DataSyncer />
                <PatternOverlay />
                <NotificationWatcher />
                <AppOverlays />
                <FCMHandler />
                {children}

                <Suspense fallback={null}>
                  <BottomNav />
                </Suspense>
              </InfaqProvider>
            </AuthSessionProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
