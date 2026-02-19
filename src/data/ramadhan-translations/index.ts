import { RAMADHAN_ID } from "./id";
import { RAMADHAN_EN } from "./en";

export const RAMADHAN_TRANSLATIONS = {
  id: RAMADHAN_ID,
  en: RAMADHAN_EN,
};

// Helper function to get ramadhan translation
export function getRamadhanTranslation(
  locale: string,
  key: keyof typeof RAMADHAN_TRANSLATIONS.id
): string {
  const translations =
    RAMADHAN_TRANSLATIONS[locale as keyof typeof RAMADHAN_TRANSLATIONS] ||
    RAMADHAN_TRANSLATIONS.id;
  return translations[key] as string;
}

// Export types
export type RamadhanTranslationKeys = keyof typeof RAMADHAN_TRANSLATIONS.id;
