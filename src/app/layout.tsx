import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "Nawaetu - Teman Ibadahmu",
  description: "Teman digital Muslim modern untuk menata niat dan menjaga istiqomah.",
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

import NotificationWatcher from "@/components/NotificationWatcher";
import PatternOverlay from "@/components/PatternOverlay";
import { PremiumProvider } from "@/context/PremiumContext";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""} />
        <ThemeProvider>
          <PremiumProvider>
            <PatternOverlay />
            <NotificationWatcher />
            {children}
            <Suspense fallback={null}>
              <BottomNav />
            </Suspense>
          </PremiumProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
