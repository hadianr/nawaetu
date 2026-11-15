"use client";

/**
 * Nawaetu - reading language for sirah and history content, separate from the app language
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useCallback, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";

export type SirahContentLang = "id" | "en";

export const SIRAH_CONTENT_LANG_KEY = "nawaetu_sirah_content_lang";
const CHANGE_EVENT = "nawaetu:sirah-content-lang";
// Fallback when storage is blocked, so the toggle still works for this visit.
let memory: SirahContentLang | null = null;

function read(): SirahContentLang | null {
    try {
        const v = localStorage.getItem(SIRAH_CONTENT_LANG_KEY);
        return v === "id" || v === "en" ? v : null;
    } catch {
        return memory;
    }
}

function subscribe(onChange: () => void) {
    window.addEventListener("storage", onChange);
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(CHANGE_EVENT, onChange);
    };
}

// Pages that exist in both languages: /sirah/concise/... and /sirah/history/... in Indonesian, the same under /en.
const BILINGUAL_ROUTE = /^\/(en\/)?sirah\/(concise|history)(\/|$)/;

/** The language a bilingual sirah URL is in, or null for pages that aren't split by language (e.g. the hub). */
export function sirahRouteLang(pathname: string | null): SirahContentLang | null {
    const m = pathname?.match(BILINGUAL_ROUTE);
    if (!m) return null;
    return m[1] ? "en" : "id";
}

/** The same page in the other language, or null when the page has no language pair. */
export function sirahCounterpartHref(pathname: string | null, lang: SirahContentLang): string | null {
    if (!pathname || !sirahRouteLang(pathname)) return null;
    const base = pathname.replace(/^\/en(?=\/)/, "");
    return lang === "en" ? `/en${base}` : base;
}

/** Path prefix for links between sirah pages, so a reader on an English page stays in English. */
export function sirahPathPrefix(lang: SirahContentLang | null): string {
    return lang === "en" ? "/en" : "";
}

export function useSirahPathPrefix(): string {
    return sirahPathPrefix(sirahRouteLang(usePathname()));
}

/**
 * The language of sirah/history text. On a bilingual page the URL decides, so a shared or crawled link always
 * shows the same text; elsewhere it is the reader's choice, defaulting to the app language until they pick one.
 */
export function useSirahContentLang(): [SirahContentLang, (lang: SirahContentLang) => void] {
    const { locale } = useLocale();
    const routeLang = sirahRouteLang(usePathname());
    const stored = useSyncExternalStore(subscribe, read, () => null);
    const lang = routeLang ?? stored ?? (locale === "en" ? "en" : "id");

    const setLang = useCallback((next: SirahContentLang) => {
        memory = next;
        try {
            localStorage.setItem(SIRAH_CONTENT_LANG_KEY, next);
        } catch { /* storage blocked: memory keeps it for this visit */ }
        window.dispatchEvent(new Event(CHANGE_EVENT));
    }, []);

    return [lang, setLang];
}
