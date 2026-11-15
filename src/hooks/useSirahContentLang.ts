"use client";

/**
 * Nawaetu - reading language for sirah and history content, separate from the app language
 * Copyright (C) 2026 Hadian Rahmat
 */

import { useCallback, useSyncExternalStore } from "react";
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

/** The language the reader chose for sirah/history text; defaults to the app language until they pick one. */
export function useSirahContentLang(): [SirahContentLang, (lang: SirahContentLang) => void] {
    const { locale } = useLocale();
    const stored = useSyncExternalStore(subscribe, read, () => null);
    const lang = stored ?? (locale === "en" ? "en" : "id");

    const setLang = useCallback((next: SirahContentLang) => {
        memory = next;
        try {
            localStorage.setItem(SIRAH_CONTENT_LANG_KEY, next);
        } catch { /* storage blocked: memory keeps it for this visit */ }
        window.dispatchEvent(new Event(CHANGE_EVENT));
    }, []);

    return [lang, setLang];
}
