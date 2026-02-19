"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { SETTINGS_TRANSLATIONS } from "@/data/settings-translations";
import { RAMADHAN_TRANSLATIONS } from "@/data/ramadhan-translations";
import { getStorageService } from "@/core/infrastructure/storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";

const DEFAULT_LOCALE = "id";

// Merge all translation objects
const MERGED_TRANSLATIONS = {
  id: { ...SETTINGS_TRANSLATIONS.id, ...RAMADHAN_TRANSLATIONS.id },
  en: { ...SETTINGS_TRANSLATIONS.en, ...RAMADHAN_TRANSLATIONS.en },
} as const;

interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: typeof MERGED_TRANSLATIONS[keyof typeof MERGED_TRANSLATIONS];
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [isLoading, setIsLoading] = useState(true);

  // Get translations for current locale with fallback
  const t = MERGED_TRANSLATIONS[locale as keyof typeof MERGED_TRANSLATIONS] || MERGED_TRANSLATIONS[DEFAULT_LOCALE];

  // Initialize from localStorage on client mount
  useEffect(() => {
    try {
      const storage = getStorageService();
      const savedLocale = (storage.getOptional(STORAGE_KEYS.SETTINGS_LOCALE) as string) || DEFAULT_LOCALE;
      setLocaleState(savedLocale);
    } catch (error) {
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
    }
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, isLoading }}>
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
