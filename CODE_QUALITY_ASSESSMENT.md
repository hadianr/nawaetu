# 📊 Nawaetu Code Quality Assessment & Refactoring Plan

**Date:** February 5, 2026  
**Version:** v1.1.0  
**Assessment Type:** Comprehensive Architecture & Best Practices Review

---

## 🎯 Executive Summary

### Overall Rating: **7.5/10** (Good, with room for improvement)

**Strengths:**
- ✅ Clean TypeScript with strict types
- ✅ Good component modularity
- ✅ Performance optimization mindset
- ✅ Context API well implemented
- ✅ Proper error handling patterns

**Critical Issues Found:**
- ❌ **Storage Layer Abstraction Missing** - localStorage calls scattered everywhere
- ❌ **DRY Violations** - Date formatting, storage patterns repeated
- ❌ **No Repository Pattern** - Data access not centralized
- ❌ **Tight Coupling** - Components directly access storage
- ❌ **Limited Error Recovery** - Storage failures not handled consistently

---

## 📋 Detailed Analysis

### 1. ❌ SOLID Principles Violations

#### **Single Responsibility Principle (SRP)** - ⚠️ Partial Compliance

**Issues:**
```typescript
// src/lib/activity-tracker.ts
// This file does TOO MUCH:
// - Data structure definition
// - Storage operations
// - Business logic
// - React hooks
// - Validation logic

export function getActivityData(): ActivityData { /* ... */ }
export function saveActivityData(data: ActivityData): void { /* ... */ }
export function trackQuranRead(ayatCount: number): void { /* ... */ }
export function getMissionProgress(missionId: string): { /* ... */ } { /* ... */ }
export function useUserActivity() { /* ... */ }  // React hook in same file!
```

**Problem:** Multiple responsibilities mixed together.

**Solution:** Separate into layers:
```
activity-tracker/
├── types.ts           # Data structures only
├── repository.ts      # Data access layer
├── service.ts         # Business logic
└── hooks.ts           # React hooks
```

#### **Open/Closed Principle (OCP)** - ❌ Not Implemented

**Issue: Storage Implementation Hardcoded**
```typescript
// Every file directly uses localStorage
localStorage.getItem(STORAGE_KEY);
localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
```

**Problem:** Cannot switch storage providers (IndexedDB, SessionStorage, API) without modifying all files.

**Solution: Storage Adapter Pattern**
```typescript
// src/lib/storage/adapter.ts
interface StorageAdapter {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
}

class LocalStorageAdapter implements StorageAdapter {
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }
  
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
      // Implement quota exceeded handling
    }
  }
  
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}

class IndexedDBAdapter implements StorageAdapter {
  // Future implementation for larger data
}

// Export singleton
export const storage: StorageAdapter = new LocalStorageAdapter();
```

#### **Liskov Substitution Principle (LSP)** - ✅ Good

Interfaces are properly defined and could be substituted.

#### **Interface Segregation Principle (ISP)** - ✅ Good

Interfaces are specific and not bloated.

#### **Dependency Inversion Principle (DIP)** - ❌ Violated

**Issue: High-level modules depend on low-level details**
```typescript
// Components directly depend on localStorage
export function trackQuranRead(ayatCount: number): void {
    const data = getActivityData();
    data.quranAyat += ayatCount;
    // Directly saves to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
```

**Solution: Depend on abstractions**
```typescript
// Inject storage dependency
export class ActivityService {
  constructor(private storage: StorageAdapter) {}
  
  trackQuranRead(ayatCount: number): void {
    const data = this.storage.getItem<ActivityData>(STORAGE_KEY);
    // Business logic...
    this.storage.setItem(STORAGE_KEY, updated);
  }
}
```

---

### 2. ❌ DRY Violations (Don't Repeat Yourself)

#### **Critical Duplications Found:**

**A. Date Formatting - Repeated 15+ times**
```typescript
// Found in:
// - activity-tracker.ts
// - analytics-utils.ts
// - streak-utils.ts
// - usePrayerTimes.ts
// - TasbihCounter.tsx

// VIOLATION:
function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}
```

**Solution: Centralized Date Utility**
```typescript
// src/lib/utils/date.ts
export class DateUtils {
  static today(): string {
    return new Date().toISOString().split('T')[0];
  }
  
  static yesterday(): string {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }
  
  static daysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }
  
  static daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
```

**B. localStorage Patterns - Repeated 50+ times**
```typescript
// VIOLATION: Same pattern everywhere
const saved = localStorage.getItem(STORAGE_KEY);
if (!saved) return DEFAULT_VALUE;
try {
    return JSON.parse(saved);
} catch {
    return DEFAULT_VALUE;
}

// And for saving:
localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
```

**Solution: Storage Service**
```typescript
// src/lib/storage/service.ts
export class StorageService {
  constructor(private adapter: StorageAdapter) {}
  
  get<T>(key: string, defaultValue: T): T {
    const value = this.adapter.getItem<T>(key);
    return value ?? defaultValue;
  }
  
  set<T>(key: string, value: T): void {
    this.adapter.setItem(key, value);
  }
  
  remove(key: string): void {
    this.adapter.removeItem(key);
  }
}
```

**C. Activity Tracking - Duplicated Logic**
```typescript
// VIOLATION: Pattern repeated in:
// - activity-tracker.ts: trackQuranRead()
// - activity-tracker.ts: trackTasbih()
// - activity-tracker.ts: logPrayer()

export function trackQuranRead(ayatCount: number): void {
    const data = getActivityData();
    data.quranAyat += ayatCount;
    data.date = getTodayString();
    saveActivityData(data);
}

export function trackTasbih(count: number): void {
    const data = getActivityData();
    data.tasbihCount += count;
    data.date = getTodayString();
    saveActivityData(data);
}
```

**Solution: Generic Tracker**
```typescript
class ActivityTracker {
  private updateActivity<K extends keyof ActivityData>(
    field: K,
    updater: (current: ActivityData[K]) => ActivityData[K]
  ): void {
    const data = this.getActivity();
    data[field] = updater(data[field]);
    data.date = DateUtils.today();
    this.saveActivity(data);
  }
  
  trackQuranRead(count: number): void {
    this.updateActivity('quranAyat', (current) => current + count);
  }
  
  trackTasbih(count: number): void {
    this.updateActivity('tasbihCount', (current) => current + count);
  }
}
```

---

### 3. ⚠️ Design Patterns - Partially Implemented

#### **✅ Patterns Currently Used:**
1. **Context Pattern** (ThemeContext, LocaleContext, InfaqContext) - Good!
2. **Custom Hooks Pattern** (usePrayerTimes, useAdhanNotifications) - Excellent!
3. **Observer Pattern** (window.dispatchEvent for cross-component communication) - Good use case!

#### **❌ Missing Critical Patterns:**

**A. Repository Pattern - NOT IMPLEMENTED**
```typescript
// Problem: Data access scattered everywhere
// Each file directly accesses localStorage

// Solution: Repository Pattern
// src/lib/repositories/activity.repository.ts
export interface ActivityRepository {
  getActivity(): ActivityData;
  saveActivity(data: ActivityData): void;
  trackQuran(count: number): void;
  trackTasbih(count: number): void;
  logPrayer(name: string): void;
}

export class LocalStorageActivityRepository implements ActivityRepository {
  constructor(
    private storage: StorageService,
    private storageKey: string = 'activity_tracker'
  ) {}
  
  getActivity(): ActivityData {
    return this.storage.get(this.storageKey, this.getDefaultActivity());
  }
  
  private getDefaultActivity(): ActivityData {
    return {
      date: DateUtils.today(),
      quranAyat: 0,
      tasbihCount: 0,
      prayersLogged: []
    };
  }
  
  // ... other methods
}
```

**B. Factory Pattern - MISSING**
```typescript
// Useful for creating different storage implementations

// src/lib/storage/factory.ts
export class StorageFactory {
  static create(type: 'localStorage' | 'indexedDB' | 'api'): StorageAdapter {
    switch (type) {
      case 'localStorage':
        return new LocalStorageAdapter();
      case 'indexedDB':
        return new IndexedDBAdapter();
      case 'api':
        return new APIStorageAdapter();
      default:
        throw new Error(`Unknown storage type: ${type}`);
    }
  }
}
```

**C. Strategy Pattern - MISSING**
```typescript
// For different AI providers (Gemini, Groq, OpenRouter)

// src/lib/llm-providers/strategy.ts
interface LLMStrategy {
  ask(prompt: string, context: any): Promise<string>;
}

class GeminiStrategy implements LLMStrategy {
  async ask(prompt: string, context: any): Promise<string> {
    // Gemini implementation
  }
}

class GroqStrategy implements LLMStrategy {
  async ask(prompt: string, context: any): Promise<string> {
    // Groq implementation
  }
}

export class LLMService {
  constructor(private strategy: LLMStrategy) {}
  
  setStrategy(strategy: LLMStrategy): void {
    this.strategy = strategy;
  }
  
  async ask(prompt: string, context: any): Promise<string> {
    return this.strategy.ask(prompt, context);
  }
}
```

**D. Singleton Pattern - NEEDED**
```typescript
// For storage service instances

export class StorageManager {
  private static instance: StorageManager;
  private storage: StorageService;
  
  private constructor() {
    const adapter = StorageFactory.create('localStorage');
    this.storage = new StorageService(adapter);
  }
  
  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }
  
  getStorage(): StorageService {
    return this.storage;
  }
}

// Usage:
const storage = StorageManager.getInstance().getStorage();
```

---

### 4. ❌ Tight Coupling Issues

#### **Problem: Components Tightly Coupled to Storage**
```typescript
// src/app/misi/page.tsx
const savedCompleted = localStorage.getItem("completed_missions");
// Component knows about storage implementation!

// src/components/TasbihCounter.tsx
localStorage.setItem("tasbih_streak", streak.toString());
// Component knows storage keys!
```

**Solution: Loose Coupling with Dependency Injection**
```typescript
// src/services/mission.service.ts
export class MissionService {
  constructor(private repository: MissionRepository) {}
  
  getCompletedMissions(): string[] {
    return this.repository.getCompleted();
  }
  
  completeMission(id: string): void {
    this.repository.markComplete(id);
  }
}

// In component:
const missionService = useMissionService(); // Hook provides service
const completed = missionService.getCompletedMissions();
```

---

### 5. ⚠️ Error Handling - Inconsistent

#### **Issues:**

**A. Silent Failures**
```typescript
// Multiple places with try-catch that silently fail:
try {
    const data = JSON.parse(saved);
    return data;
} catch {
    return DEFAULT_VALUE; // No logging, no user feedback
}
```

**B. No Quota Handling**
```typescript
// localStorage can fail when quota exceeded
localStorage.setItem(key, value); // No error handling!
```

**Solution: Robust Error Handling**
```typescript
export class StorageService {
  set<T>(key: string, value: T): Result<void, StorageError> {
    try {
      this.adapter.setItem(key, value);
      return { success: true, data: undefined };
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        return { 
          success: false, 
          error: new StorageQuotaExceededError('Storage quota exceeded')
        };
      }
      return { 
        success: false, 
        error: new StorageError('Failed to save data')
      };
    }
  }
}

// Usage:
const result = storage.set('key', data);
if (!result.success) {
  if (result.error instanceof StorageQuotaExceededError) {
    // Show UI to clear data
    showQuotaExceededDialog();
  }
}
```

---

## 🔧 Refactoring Priority Matrix

### Priority 1: Critical (Do First) 🔴

1. **Create Storage Abstraction Layer**
   - Impact: High
   - Effort: Medium
   - Benefits: Testability, flexibility, error handling

2. **Centralize Date Utilities**
   - Impact: High
   - Effort: Low
   - Benefits: DRY, consistency

3. **Implement Repository Pattern**
   - Impact: High
   - Effort: High
   - Benefits: Separation of concerns, testability

### Priority 2: Important (Do Soon) 🟡

4. **Add Error Recovery Mechanisms**
   - Impact: Medium
   - Effort: Medium
   - Benefits: Better UX, data safety

5. **Extract Repeated Logic into Services**
   - Impact: Medium
   - Effort: Medium
   - Benefits: Maintainability

6. **Implement Strategy Pattern for LLM**
   - Impact: Medium
   - Effort: Low
   - Benefits: Easy provider switching

### Priority 3: Nice to Have (Future) 🟢

7. **Add Unit Tests**
   - Impact: High (long-term)
   - Effort: High
   - Benefits: Confidence, refactoring safety

8. **Type-safe Storage Keys**
   - Impact: Low
   - Effort: Low
   - Benefits: Compile-time safety

9. **Implement Caching Layer**
   - Impact: Low
   - Effort: Medium
   - Benefits: Performance

---

## 📁 Proposed New Architecture

### Current Structure:
```
src/
├── lib/
│   ├── activity-tracker.ts      (mixed responsibilities)
│   ├── analytics-utils.ts       (mixed responsibilities)
│   ├── streak-utils.ts          (mixed responsibilities)
│   └── ...
```

### Proposed Structure:
```
src/
├── core/
│   ├── domain/                   # Business logic & entities
│   │   ├── activity/
│   │   │   ├── types.ts
│   │   │   ├── service.ts       # Pure business logic
│   │   │   └── validators.ts
│   │   ├── streak/
│   │   │   ├── types.ts
│   │   │   └── service.ts
│   │   └── mission/
│   │       ├── types.ts
│   │       └── service.ts
│   │
│   ├── infrastructure/           # External dependencies
│   │   ├── storage/
│   │   │   ├── adapter.ts       # Interface
│   │   │   ├── local-storage.adapter.ts
│   │   │   ├── indexed-db.adapter.ts
│   │   │   ├── service.ts       # Storage service
│   │   │   └── factory.ts
│   │   ├── api/
│   │   │   ├── quran.api.ts
│   │   │   ├── prayer.api.ts
│   │   │   └── llm.api.ts
│   │   └── analytics/
│   │       └── tracker.ts
│   │
│   └── repositories/             # Data access layer
│       ├── activity.repository.ts
│       ├── streak.repository.ts
│       ├── mission.repository.ts
│       ├── bookmark.repository.ts
│       └── user.repository.ts
│
├── hooks/                        # React hooks
│   ├── useActivity.ts
│   ├── useStreak.ts
│   ├── useMissions.ts
│   └── ...
│
├── lib/                          # Shared utilities
│   ├── utils/
│   │   ├── date.ts
│   │   ├── format.ts
│   │   └── validation.ts
│   └── constants/
│       ├── storage-keys.ts
│       └── config.ts
│
└── components/                   # UI components (unchanged)
```

---

## 🎯 Implementation Roadmap

### Week 1: Foundation
- [ ] Create storage abstraction layer
- [ ] Centralize date utilities
- [ ] Extract storage keys to constants
- [ ] Add error handling utilities

### Week 2: Repositories
- [ ] Implement ActivityRepository
- [ ] Implement StreakRepository
- [ ] Implement MissionRepository
- [ ] Implement BookmarkRepository

### Week 3: Services
- [ ] Create domain services
- [ ] Refactor business logic from components
- [ ] Implement dependency injection

### Week 4: Testing & Documentation
- [ ] Add unit tests for services
- [ ] Add integration tests
- [ ] Update documentation
- [ ] Performance testing

---

## 📊 Current vs Proposed Metrics

| Metric | Current | Proposed | Improvement |
|--------|---------|----------|-------------|
| localStorage calls | 50+ scattered | 0 (abstracted) | 100% |
| Date formatting code | 15+ duplicates | 1 utility | 93% reduction |
| Storage error handling | 20% | 100% | 5x better |
| Testability | Low | High | N/A |
| Code maintainability | 6/10 | 9/10 | 50% better |
| Coupling | High | Low | N/A |

---

## ⚠️ Breaking Changes to Consider

### Phase 1: Non-breaking (Parallel Implementation)
1. Add new architecture alongside existing code
2. Gradually migrate features one by one
3. Keep old code working during migration

### Phase 2: Deprecation
1. Mark old functions as @deprecated
2. Add migration guide
3. Keep backward compatibility

### Phase 3: Removal
1. Remove old code after migration complete
2. Clean up unused imports
3. Update all documentation

---

## 🎓 Learning Resources for Team

### SOLID Principles
- [Uncle Bob's SOLID Principles](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html)
- [SOLID in TypeScript](https://khalilstemmler.com/articles/solid-principles/solid-typescript/)

### Design Patterns
- [Refactoring Guru - Design Patterns](https://refactoring.guru/design-patterns)
- [TypeScript Design Patterns](https://www.patterns.dev/posts/classic-design-patterns)

### Clean Architecture
- [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design Basics](https://martinfowler.com/bliki/DomainDrivenDesign.html)

---

## 📝 Conclusion

**Current State:** The codebase is **functional and well-organized** but has **architectural debt** that will impact long-term maintenance and scaling.

**Recommended Action:** 
1. Start refactoring incrementally (Priority 1 items first)
2. Don't pause feature development completely
3. Allocate 30% of sprint time to refactoring
4. Set measurable goals (e.g., "Reduce localStorage direct calls by 50% this sprint")

**Timeline Estimate:** 
- Full refactoring: 4-6 weeks
- Priority 1 items: 2 weeks
- Significant improvement visible: 1 week

**ROI:** High - Better testability, easier onboarding, fewer bugs, faster feature development

---

*This assessment was generated on February 5, 2026 for Nawaetu v1.1.0*
