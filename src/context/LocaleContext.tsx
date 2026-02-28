"use client";

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

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { SETTINGS_TRANSLATIONS } from "@/data/translations";
import { RAMADHAN_TRANSLATIONS } from "@/data/ramadhan-translations";
import { STATS_TRANSLATIONS } from "@/data/stats-translations";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const DEFAULT_LOCALE = "id";

// Helper to merge all translation objects
function getMergedTranslations() {
  return {
    id: { ...SETTINGS_TRANSLATIONS.id, ...RAMADHAN_TRANSLATIONS.id, ...STATS_TRANSLATIONS.id },
    en: { ...SETTINGS_TRANSLATIONS.en, ...RAMADHAN_TRANSLATIONS.en, ...STATS_TRANSLATIONS.en },
  };
}

const ALL_TRANSLATIONS = getMergedTranslations();

interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: any; // Type it correctly if possible, or use any for flexibility
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [isLoading, setIsLoading] = useState(true);

  // Get translations for current locale with fallback
  // Also resolving activeLocale prevents UI locale mismatches
  const activeLocale = (ALL_TRANSLATIONS as any)[locale] ? locale : DEFAULT_LOCALE;
  const t = (ALL_TRANSLATIONS as any)[activeLocale];

  // Initialize from localStorage on client mount
  useEffect(() => {
    try {
      const storage = getStorageService();
      let savedLocale = storage.getOptional(STORAGE_KEYS.SETTINGS_LOCALE) as string;

      if (!savedLocale) {
        // Smart Default: If no locale saved, detect browser language
        const browserLang = navigator.language.toLowerCase();
        // If not ID, default to EN for global judges
        savedLocale = browserLang.startsWith("id") ? "id" : "en";
        // Also save it so it persists and server components can use it
        storage.set(STORAGE_KEYS.SETTINGS_LOCALE, savedLocale);
        document.cookie = `settings_locale=${savedLocale}; path=/; max-age=31536000`;
      }

      setLocaleState(savedLocale);
    } catch (error) {
      Sentry.captureException(error);
      setLocaleState(DEFAULT_LOCALE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for localStorage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.SETTINGS_LOCALE && e.newValue) {
        setLocaleState(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Safe setLocale that updates both state and storage
  const setLocale = (newLocale: string) => {
    try {
      const storage = getStorageService();
      setLocaleState(newLocale);
      storage.set(STORAGE_KEYS.SETTINGS_LOCALE, newLocale);

      // Also update cookie for server-side rendering
      document.cookie = `settings_locale=${newLocale}; path=/; max-age=31536000`;

      // Dispatch custom event for any component that needs to react
      window.dispatchEvent(
        new CustomEvent("locale-changed", { detail: { locale: newLocale } })
      );
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return (
    <LocaleContext.Provider value={{ locale: activeLocale, setLocale, t, isLoading }}>
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * Hook to use locale context
 * Must be used within LocaleProvider
 */
export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

/**
 * Hook to only get translations (for when you don't need to change locale)
 */
export function useTranslations() {
  const { t } = useLocale();
  return t;
}
