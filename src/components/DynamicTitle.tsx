"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/context/LocaleContext";

export default function DynamicTitle() {
    const pathname = usePathname();
    const t = useTranslations();

    useEffect(() => {
        if (!t) return;

        // Default title
        let pageTitle = `Nawaetu - ${t.aboutAppName || "Islamic App"} ${t.aboutTagline || "#NiatAjaDulu"}`;

        // Map pathnames to translations
        if (pathname === "/") {
            pageTitle = `Nawaetu - ${t.navHome || "Home"}`;
        } else if (pathname === "/quran") {
            pageTitle = `${t.navQuran || "Quran"} - Nawaetu`;
        } else if (pathname === "/tasbih") {
            pageTitle = `${t.tasbihTitle || "Tasbih"} - Nawaetu`;
        } else if (pathname === "/settings") {
            pageTitle = `${t.navSettings || "Settings"} - Nawaetu`;
        } else if (pathname === "/stats") {
            pageTitle = `${t.statsPageTitle || "Stats"} - Nawaetu`;
        } else if (pathname === "/about") {
            pageTitle = `${t.aboutWhatIsTitle ? t.aboutWhatIsTitle.split("?")[0] : "About"} - Nawaetu`;
        } else if (pathname === "/qibla") {
            pageTitle = `${t.navQibla || "Qibla"} - Nawaetu`;
        }

        // Next.js might reset title on soft nav, so we set it
        // slightly after rendering or use basic mutation
        document.title = pageTitle;

        // For iOS PWA
        const appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
        if (appleTitleMeta) {
            appleTitleMeta.setAttribute("content", "Nawaetu");
        }
    }, [pathname, t]);

    return null;
}
