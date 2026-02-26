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

import { describe, it, expect } from 'vitest';
import { SETTINGS_TRANSLATIONS, getSettingsTranslation } from './index';

describe('Settings Translations', () => {
  it('should have id and en keys', () => {
    expect(SETTINGS_TRANSLATIONS).toHaveProperty('id');
    expect(SETTINGS_TRANSLATIONS).toHaveProperty('en');
  });

  it('should have matching keys in id and en', () => {
    const idKeys = Object.keys(SETTINGS_TRANSLATIONS.id).sort();
    const enKeys = Object.keys(SETTINGS_TRANSLATIONS.en).sort();
    expect(idKeys).toEqual(enKeys);
  });

  it('should retrieve translation correctly', () => {
    const titleId = getSettingsTranslation('id', 'title');
    expect(titleId).toBe('Pengaturan');

    const titleEn = getSettingsTranslation('en', 'title');
    expect(titleEn).toBe('Settings');
  });

  it('should fallback to id if locale is not found', () => {
    const titleUnknown = getSettingsTranslation('fr', 'title');
    expect(titleUnknown).toBe('Pengaturan');
  });
});
