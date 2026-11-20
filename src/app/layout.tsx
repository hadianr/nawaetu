/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import type { Metadata, Viewport } from "next";
import { Amiri, Lora, Plus_Jakarta_Sans } from "next/font/google";
import { APP_CONFIG } from "@/config/app-config";
import { Suspense } from "react";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const siteDescription = "Al-Qur'an, jadwal sholat, kiblat, dzikir, hadits dan doa bersumber, Sirah, kalender Hijriah, Ramadhan, jurnal niat, misi harian, dan Tanya Nawaetu. Habit tracker ibadah dengan gamifikasi.";
const appFeatureDescription = "Aplikasi Muslim Nawaetu mencakup Al-Qur'an dengan terjemahan, audio, tajwid, tafsir, pencarian, dan penanda bacaan; jadwal sholat dan pengingat; kompas kiblat; dzikir dengan target dan riwayat; hadits dengan perawi, referensi, dan keterangan kualitas; doa bersumber; Sirah Nabawiyah per bab dan kuis; kalender Hijriah dan hari puasa sunnah; panduan Ramadhan, puasa, qadha, khatam Al-Qur'an, Tarawih, makanan sunnah, dan zakat fitrah; jurnal niat dan refleksi; misi, streak, statistik; serta Tanya Nawaetu.";

// The two-font system: Plus Jakarta Sans for UI and body, Lora for display.
// Amiri covers Arabic script only. Theme tokens read these variables.
const uiFont = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-face-ui", display: "swap" });
const displayFont = Lora({ subsets: ["latin", "latin-ext"], style: ["normal", "italic"], variable: "--font-face-display", display: "swap", preload: false });
const arabicFont = Amiri({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-face-arabic", display: "swap", preload: false });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Matches the canvas of the light default and the dark Emerald theme.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F3" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1311" },
  ],
};

export const metadata: Metadata = {
  title: "Aplikasi Muslim untuk Ibadah Harian | Nawaetu",
  description: siteDescription,
  authors: [{ name: "Nawaetu Team" }],
  creator: "Hadian R",
  publisher: "Nawaetu",
  metadataBase: new URL("https://nawaetu.com"),
  // Favicon configuration
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Aplikasi Muslim untuk Ibadah Harian | Nawaetu",
    description: siteDescription,
    url: "https://nawaetu.com",
    siteName: "Nawaetu",
    locale: "id_ID",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aplikasi Muslim untuk Ibadah Harian | Nawaetu",
    description: siteDescription,
    creator: "@nawaetuapp",
    images: [OG_IMAGE],
  },
  manifest: `/manifest.webmanifest?v=${APP_CONFIG.version}`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
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
    "description": appFeatureDescription,
    "screenshot": "https://nawaetu.com/og-image.png",
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
    "description": "Aplikasi Muslim untuk menghubungkan niat, panduan bersumber, dan amalan sehari-hari.",
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
    "description": appFeatureDescription,
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

import { InfaqProvider } from "@/context/InfaqContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { prePaintThemeScript } from "@/context/themes";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { OG_IMAGE } from "@/lib/seo";
import { LocaleProvider } from "@/context/LocaleContext";
import { PrayerTimesProvider } from "@/context/PrayerTimesContext";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import DeferredLayoutComponents from "@/components/DeferredLayoutComponents";
import ClientEntryGate from "@/components/ClientEntryGate";
import HomeSeoIntro from "@/components/home/HomeSeoIntro";
import ChunkErrorHandler from "@/components/ChunkErrorHandler";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${uiFont.variable} ${displayFont.variable} ${arabicFont.variable}`} suppressHydrationWarning>
      <head>
        {/* Applies the saved theme before first paint so no other theme flashes. */}
        <script dangerouslySetInnerHTML={{ __html: prePaintThemeScript(STORAGE_KEYS.SETTINGS_THEME, STORAGE_KEYS.ONBOARDING_COMPLETED) }} />
        {/* Resource Hints - Preconnect to critical origins */}
        {/* DNS Prefetch for analytics/monitoring (non-critical) */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://analytics.google.com" />
        <link rel="dns-prefetch" href="https://api.aladhan.com" />

        {/* iOS PWA Support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nawaetu" />

      </head>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <ChunkErrorHandler />
        {/* Structured Data - Multiple Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
        />
        <LocaleProvider>
          <ThemeProvider>
            <AuthSessionProvider>
              <PrayerTimesProvider>
                <ClientEntryGate homeIntro={<HomeSeoIntro />}>
                  <InfaqProvider>
                    <DeferredLayoutComponents />
                    {children}

                    <Suspense fallback={null}>
                      <BottomNav />
                    </Suspense>
                  </InfaqProvider>
                </ClientEntryGate>
              </PrayerTimesProvider>
            </AuthSessionProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
