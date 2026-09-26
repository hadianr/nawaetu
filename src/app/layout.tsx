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
import { APP_CONFIG } from "@/config/app-config";
import { Suspense } from "react";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const siteDescription = "Aplikasi Muslim Nawaetu untuk ibadah harian: Al-Qur'an, jadwal sholat, kiblat, dzikir, hadits dan doa bersumber, Sirah, kalender Hijriah, Ramadhan, jurnal niat, misi, dan Tanya Nawaetu.";
const appFeatureDescription = "Aplikasi Muslim Nawaetu mencakup Al-Qur'an dengan terjemahan, audio, tajwid, tafsir, pencarian, dan penanda bacaan; jadwal sholat dan pengingat; kompas kiblat; dzikir dengan target dan riwayat; hadits dengan perawi, referensi, dan keterangan kualitas; doa bersumber; Sirah Nabawiyah per bab dan kuis; kalender Hijriah dan hari puasa sunnah; panduan Ramadhan, puasa, qadha, khatam Al-Qur'an, Tarawih, makanan sunnah, dan zakat fitrah; jurnal niat dan refleksi; misi, streak, statistik; serta Tanya Nawaetu.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "Nawaetu | Aplikasi Muslim Ibadah dengan Niat dan Ilmu",
  description: siteDescription,
  authors: [{ name: "Nawaetu Team" }],
  creator: "Hadian R",
  publisher: "Nawaetu",
  metadataBase: new URL("https://nawaetu.com"),
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
    title: "Nawaetu | Aplikasi Muslim Ibadah dengan Niat dan Ilmu",
    description: siteDescription,
    url: "https://nawaetu.com",
    siteName: "Nawaetu",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nawaetu — aplikasi Muslim untuk ibadah harian",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nawaetu | Aplikasi Muslim Ibadah dengan Niat dan Ilmu",
    description: siteDescription,
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
    "description": appFeatureDescription,
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
import { LocaleProvider } from "@/context/LocaleContext";
import { PrayerTimesProvider } from "@/context/PrayerTimesContext";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import DeferredLayoutComponents from "@/components/DeferredLayoutComponents";
import ClientEntryGate from "@/components/ClientEntryGate";
import ChunkErrorHandler from "@/components/ChunkErrorHandler";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Resource Hints - Preconnect to critical origins */}
        {/* DNS Prefetch for analytics/monitoring (non-critical) */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://analytics.google.com" />
        <link rel="dns-prefetch" href="https://api.aladhan.com" />

        {/* iOS PWA Support */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Nawaetu" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

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
                <ClientEntryGate>
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
