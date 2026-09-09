import { describe, expect, it } from 'vitest';

import { isValidStorageKey, STORAGE_KEYS } from './storage-keys';

describe('storage keys', () => {
  it('accepts registered keys and rejects unknown keys', () => {
    expect(isValidStorageKey(STORAGE_KEYS.USER_NAME)).toBe(true);
    expect(isValidStorageKey('unknown-key')).toBe(false);
  });
});
