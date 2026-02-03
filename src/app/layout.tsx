import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Amiri, Lateef } from "next/font/google";

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

const lateef = Lateef({
  variable: "--font-lateef",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
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

// ... (Metadata export remains)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} ${lateef.variable} antialiased`}
        suppressHydrationWarning
      >
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
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
