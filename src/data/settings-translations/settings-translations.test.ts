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
