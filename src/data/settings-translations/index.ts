import { SETTINGS_ID } from "./id";
import { SETTINGS_EN } from "./en";

export const SETTINGS_TRANSLATIONS = {
  id: SETTINGS_ID,
  en: SETTINGS_EN,
};

// Helper function to get translation
export function getSettingsTranslation(
  locale: string,
  key: keyof typeof SETTINGS_TRANSLATIONS.id
): string {
  const translations =
    SETTINGS_TRANSLATIONS[locale as keyof typeof SETTINGS_TRANSLATIONS] ||
    SETTINGS_TRANSLATIONS.id;
  return translations[key] as string;
}
