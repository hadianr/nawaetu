# 🚀 Refactoring Implementation Plan - Step by Step

**Target:** Implement best practices tanpa breaking existing functionality  
**Strategy:** Incremental refactoring dengan backward compatibility  
**Timeline:** 2 minggu (Priority 1 items)

---

## Phase 1: Foundation Layer (Week 1, Days 1-3)

### Step 1.1: Create Storage Abstraction

**File:** `src/core/infrastructure/storage/adapter.ts`
```typescript
/**
 * Storage Adapter Interface
 * Abstraction untuk berbagai storage implementations
 */
export interface StorageAdapter {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}

export class StorageError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export class StorageQuotaExceededError extends StorageError {
  constructor(message: string = 'Storage quota exceeded') {
    super(message, 'QUOTA_EXCEEDED');
    this.name = 'StorageQuotaExceededError';
  }
}
```

**File:** `src/core/infrastructure/storage/local-storage.adapter.ts`
```typescript
import { StorageAdapter, StorageError, StorageQuotaExceededError } from './adapter';

export class LocalStorageAdapter implements StorageAdapter {
  getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`[Storage] Failed to get item: ${key}`, error);
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') {
      console.warn('[Storage] Skipping setItem (SSR)');
      return;
    }
    
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        throw new StorageQuotaExceededError(
          `Failed to store ${key}: Storage quota exceeded`
        );
      }
      throw new StorageError(`Failed to store ${key}: ${error}`);
    }
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[Storage] Failed to remove item: ${key}`, error);
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('[Storage] Failed to clear storage', error);
    }
  }
}
```

**File:** `src/core/infrastructure/storage/service.ts`
```typescript
import { StorageAdapter } from './adapter';

export class StorageService {
  constructor(private adapter: StorageAdapter) {}

  /**
   * Get item with default value fallback
   */
  get<T>(key: string, defaultValue: T): T {
    const value = this.adapter.getItem<T>(key);
    return value ?? defaultValue;
  }

  /**
   * Get item that might not exist
   */
  getOptional<T>(key: string): T | null {
    return this.adapter.getItem<T>(key);
  }

  /**
   * Set item
   */
  set<T>(key: string, value: T): void {
    this.adapter.setItem(key, value);
  }

  /**
   * Remove item
   */
  remove(key: string): void {
    this.adapter.removeItem(key);
  }

  /**
   * Clear all storage
   */
  clear(): void {
    this.adapter.clear();
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.adapter.getItem(key) !== null;
  }
}
```

**File:** `src/core/infrastructure/storage/factory.ts`
```typescript
import { StorageAdapter } from './adapter';
import { LocalStorageAdapter } from './local-storage.adapter';

export type StorageType = 'localStorage' | 'sessionStorage' | 'memory';

export class StorageFactory {
  static create(type: StorageType = 'localStorage'): StorageAdapter {
    switch (type) {
      case 'localStorage':
        return new LocalStorageAdapter();
      case 'sessionStorage':
        // Future: SessionStorageAdapter
        return new LocalStorageAdapter();
      case 'memory':
        // Future: MemoryStorageAdapter for testing
        return new LocalStorageAdapter();
      default:
        throw new Error(`Unknown storage type: ${type}`);
    }
  }
}
```

**File:** `src/core/infrastructure/storage/index.ts`
```typescript
import { StorageService } from './service';
import { StorageFactory } from './factory';

// Create singleton instance
let storageService: StorageService | null = null;

export function getStorageService(): StorageService {
  if (!storageService) {
    const adapter = StorageFactory.create('localStorage');
    storageService = new StorageService(adapter);
  }
  return storageService;
}

// Re-export types and classes
export * from './adapter';
export * from './service';
export * from './factory';
export { LocalStorageAdapter } from './local-storage.adapter';
```

### Step 1.2: Create Date Utilities

**File:** `src/lib/utils/date.ts`
```typescript
/**
 * Centralized date utilities
 * Eliminates 15+ duplicate implementations
 */
export class DateUtils {
  /**
   * Get today's date in YYYY-MM-DD format
   */
  static today(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get yesterday's date
   */
  static yesterday(): string {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get date N days ago
   */
  static daysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get date N days from now
   */
  static daysFromNow(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Calculate days between two dates
   */
  static daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if date1 is after date2
   */
  static isAfter(date1: string, date2: string): boolean {
    return new Date(date1) > new Date(date2);
  }

  /**
   * Check if date1 is before date2
   */
  static isBefore(date1: string, date2: string): boolean {
    return new Date(date1) < new Date(date2);
  }

  /**
   * Check if two dates are the same day
   */
  static isSameDay(date1: string, date2: string): boolean {
    return date1 === date2;
  }

  /**
   * Format date for display
   */
  static format(date: string, locale: string = 'id-ID'): string {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
```

### Step 1.3: Create Storage Keys Constants

**File:** `src/lib/constants/storage-keys.ts`
```typescript
/**
 * Centralized storage keys
 * Type-safe and prevents typos
 */
export const STORAGE_KEYS = {
  // User data
  USER_NAME: 'user_name',
  USER_TITLE: 'user_title',
  USER_GENDER: 'user_gender',
  USER_AVATAR: 'user_avatar',
  USER_ARCHETYPE: 'user_archetype',
  
  // Activity tracking
  ACTIVITY_TRACKER: 'activity_tracker',
  DAILY_ACTIVITY_HISTORY: 'daily_activity_history',
  
  // Streak & gamification
  USER_STREAK: 'user_streak',
  USER_LEVEL: 'user_level',
  USER_XP: 'user_xp',
  
  // Missions
  COMPLETED_MISSIONS: 'completed_missions',
  
  // Quran
  QURAN_LAST_READ: 'quran_last_read',
  QURAN_BOOKMARKS: 'nawaetu_bookmarks',
  
  // Settings
  SETTINGS_LOCALE: 'settings_locale',
  SETTINGS_THEME: 'app_theme',
  SETTINGS_RECITER: 'settings_reciter',
  SETTINGS_MUADZIN: 'settings_muadzin',
  SETTINGS_CALCULATION_METHOD: 'settings_calculation_method',
  
  // Prayer
  PRAYER_DATA: 'prayer_data',
  USER_LOCATION: 'user_location',
  ADHAN_PREFERENCES: 'adhan_preferences',
  
  // AI Chat
  AI_CHAT_HISTORY: 'ai_chat_history_v2',
  AI_USAGE: 'ai_usage_v1',
  
  // Tasbih
  TASBIH_COUNT: 'tasbih_count',
  TASBIH_TARGET: 'tasbih_target',
  TASBIH_ACTIVE_PRESET: 'tasbih_active_preset',
  TASBIH_STREAK: 'tasbih_streak',
  TASBIH_LAST_DATE: 'tasbih_last_date',
  TASBIH_DAILY_COUNT: 'tasbih_daily_count',
  
  // UI State
  PWA_PROMPT_DISMISSED: 'pwa_prompt_dismissed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const;

// Type-safe key access
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
```

---

## Phase 2: Repository Pattern (Week 1, Days 4-7)

### Step 2.1: Activity Repository

**File:** `src/core/repositories/activity.repository.ts`
```typescript
import { getStorageService } from '@/core/infrastructure/storage';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';
import { DateUtils } from '@/lib/utils/date';

export interface ActivityData {
  date: string;
  quranAyat: number;
  tasbihCount: number;
  prayersLogged: string[];
}

export interface ActivityRepository {
  getActivity(): ActivityData;
  saveActivity(data: ActivityData): void;
  trackQuran(count: number): void;
  trackTasbih(count: number): void;
  logPrayer(name: string): void;
  isPrayerLogged(name: string): boolean;
  resetDaily(): void;
}

export class LocalActivityRepository implements ActivityRepository {
  private storage = getStorageService();
  private cache: ActivityData | null = null;

  private getDefaultActivity(): ActivityData {
    return {
      date: DateUtils.today(),
      quranAyat: 0,
      tasbihCount: 0,
      prayersLogged: []
    };
  }

  getActivity(): ActivityData {
    // Use cache if valid
    if (this.cache && this.cache.date === DateUtils.today()) {
      return this.cache;
    }

    const data = this.storage.get<ActivityData>(
      STORAGE_KEYS.ACTIVITY_TRACKER,
      this.getDefaultActivity()
    );

    // Reset if different day
    if (data.date !== DateUtils.today()) {
      const fresh = this.getDefaultActivity();
      this.saveActivity(fresh);
      return fresh;
    }

    this.cache = data;
    return data;
  }

  saveActivity(data: ActivityData): void {
    data.date = DateUtils.today();
    this.storage.set(STORAGE_KEYS.ACTIVITY_TRACKER, data);
    this.cache = data;
    
    // Notify listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('activity_updated', { detail: data }));
    }
  }

  trackQuran(count: number): void {
    const data = this.getActivity();
    data.quranAyat += count;
    this.saveActivity(data);
  }

  trackTasbih(count: number): void {
    const data = this.getActivity();
    data.tasbihCount += count;
    this.saveActivity(data);
  }

  logPrayer(name: string): void {
    const data = this.getActivity();
    if (!data.prayersLogged.includes(name)) {
      data.prayersLogged.push(name);
      this.saveActivity(data);
    }
  }

  isPrayerLogged(name: string): boolean {
    const data = this.getActivity();
    return data.prayersLogged.includes(name);
  }

  resetDaily(): void {
    this.saveActivity(this.getDefaultActivity());
  }
}

// Singleton instance
let repositoryInstance: ActivityRepository | null = null;

export function getActivityRepository(): ActivityRepository {
  if (!repositoryInstance) {
    repositoryInstance = new LocalActivityRepository();
  }
  return repositoryInstance;
}
```

### Step 2.2: Create React Hook

**File:** `src/hooks/useActivity.ts`
```typescript
import { useState, useEffect } from 'react';
import { getActivityRepository, ActivityData } from '@/core/repositories/activity.repository';

export function useActivity() {
  const repository = getActivityRepository();
  const [activity, setActivity] = useState<ActivityData>(repository.getActivity());

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<ActivityData>;
      setActivity(customEvent.detail || repository.getActivity());
    };

    window.addEventListener('activity_updated', handleUpdate);
    
    return () => {
      window.removeEventListener('activity_updated', handleUpdate);
    };
  }, [repository]);

  return {
    activity,
    trackQuran: (count: number) => repository.trackQuran(count),
    trackTasbih: (count: number) => repository.trackTasbih(count),
    logPrayer: (name: string) => repository.logPrayer(name),
    isPrayerLogged: (name: string) => repository.isPrayerLogged(name),
  };
}
```

---

## Phase 3: Migration Strategy (Week 2)

### Step 3.1: Backward Compatibility Layer

**File:** `src/lib/activity-tracker.ts` (Updated)
```typescript
// DEPRECATED: Use useActivity hook or ActivityRepository directly
// This file maintains backward compatibility during migration

import { getActivityRepository } from '@/core/repositories/activity.repository';

const repository = getActivityRepository();

/**
 * @deprecated Use getActivityRepository().getActivity() instead
 */
export function getActivityData() {
  console.warn('[Deprecated] Use getActivityRepository().getActivity()');
  return repository.getActivity();
}

/**
 * @deprecated Use getActivityRepository().trackQuran() instead
 */
export function trackQuranRead(ayatCount: number): void {
  console.warn('[Deprecated] Use getActivityRepository().trackQuran()');
  repository.trackQuran(ayatCount);
}

/**
 * @deprecated Use getActivityRepository().trackTasbih() instead
 */
export function trackTasbih(count: number): void {
  console.warn('[Deprecated] Use getActivityRepository().trackTasbih()');
  repository.trackTasbih(count);
}

// Export types for backward compatibility
export type { ActivityData } from '@/core/repositories/activity.repository';
```

### Step 3.2: Migration Checklist

**Component Migration Example:**
```typescript
// BEFORE:
import { trackQuranRead } from '@/lib/activity-tracker';

function MyComponent() {
  const handleRead = () => {
    trackQuranRead(10);
  };
}

// AFTER:
import { useActivity } from '@/hooks/useActivity';

function MyComponent() {
  const { trackQuran } = useActivity();
  
  const handleRead = () => {
    trackQuran(10);
  };
}
```

---

## 📊 Progress Tracking

### Week 1 Checklist
- [ ] Day 1: Create storage adapter interface
- [ ] Day 1: Implement LocalStorageAdapter
- [ ] Day 2: Create StorageService
- [ ] Day 2: Centralize date utilities
- [ ] Day 3: Extract storage keys constants
- [ ] Day 4: Implement ActivityRepository
- [ ] Day 5: Create useActivity hook
- [ ] Day 6-7: Test and add error handling

### Week 2 Checklist  
- [ ] Day 1-2: Implement StreakRepository
- [ ] Day 3-4: Implement MissionRepository
- [ ] Day 5: Add backward compatibility layer
- [ ] Day 6-7: Migrate 3-5 components as proof of concept

---

## 🎯 Success Metrics

Track these metrics weekly:

1. **Direct localStorage calls:**
   - Week 0: 50+
   - Target Week 1: 35
   - Target Week 2: 15

2. **Code duplication:**
   - Week 0: 15+ date format duplicates
   - Target Week 1: 0 (all use DateUtils)

3. **Test coverage:**
   - Week 0: 0%
   - Target Week 1: 40% (repositories)
   - Target Week 2: 60%

4. **Error handling:**
   - Week 0: 20% covered
   - Target Week 1: 80% (storage layer)
   - Target Week 2: 95%

---

## 🚨 Risk Mitigation

### Risk 1: Breaking Existing Features
**Mitigation:**
- Keep old code working with backward compatibility
- Migrate incrementally, one feature at a time
- Test thoroughly before removing old code

### Risk 2: Performance Regression
**Mitigation:**
- Benchmark before and after
- Use caching where appropriate
- Profile with React DevTools

### Risk 3: Team Learning Curve
**Mitigation:**
- Document patterns clearly
- Pair programming sessions
- Code review every migration

---

*Next: Begin implementation with storage abstraction layer*
