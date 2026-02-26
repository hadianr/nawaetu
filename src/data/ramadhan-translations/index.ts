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
