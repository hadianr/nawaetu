import { getStorageService } from '@/core/infrastructure/storage';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';
import { DateUtils } from '@/lib/utils/date';

/**
 * Activity Data Interface
 */
export interface ActivityData {
  date: string;
  quranAyat: number;
  tasbihCount: number;
  prayersLogged: string[];
}

/**
 * Activity Repository Interface
 * Abstraksi untuk activity data access
 */
export interface ActivityRepository {
  getActivity(): ActivityData;
  saveActivity(data: ActivityData): void;
  trackQuran(count: number): void;
  trackTasbih(count: number): void;
  logPrayer(name: string): void;
  isPrayerLogged(name: string): boolean;
  resetDaily(): void;
}

/**
 * LocalStorage Implementation of Activity Repository
 * Nanti bisa diganti dengan APIActivityRepository untuk sync ke backend
 */
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
    // Use cache if valid for today
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

/**
 * Singleton instance
 * Ensures only one repository instance exists
 */
let repositoryInstance: ActivityRepository | null = null;

export function getActivityRepository(): ActivityRepository {
  if (!repositoryInstance) {
    repositoryInstance = new LocalActivityRepository();
  }
  return repositoryInstance;
}

/**
 * Reset repository instance (useful for testing)
 */
export function resetActivityRepository(): void {
  repositoryInstance = null;
}
