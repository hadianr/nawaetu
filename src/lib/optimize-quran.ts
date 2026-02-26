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

/**
 * Quran Performance Optimization Utilities
 * - Request deduplication via React cache()
 * - Prefetching popular surahs
 * - Timeout/fallback handling
 * - Adaptive loading based on locale
 */

import { prefetchPopularSurahs } from "./kemenag-api";

// Initialize optimizations on client startup
export function initializeQuranOptimizations(locale: string = "id"): void {
  if (typeof window === "undefined") return;

  // Prefetch popular surahs during idle time (non-blocking)
  prefetchPopularSurahs(locale);

  // Monitor API performance and log metrics (optional)
  if (process.env.NODE_ENV === "development") {
  }
}

// Debounced prefetch when user changes locale
let prefetchTimeout: NodeJS.Timeout;
export function debouncedPrefetchOnLocaleChange(locale: string): void {
  clearTimeout(prefetchTimeout);
  prefetchTimeout = setTimeout(() => {
    prefetchPopularSurahs(locale);
  }, 500); // Wait 500ms after locale change before prefetching
}

// Utility to measure fetch performance
export async function measureFetchTime<T>(
  fn: () => Promise<T>,
  label: string = "Fetch"
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    if (process.env.NODE_ENV === "development") {
    }
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    throw error;
  }
}

// Utility to check if network is slow
export function isSlowNetwork(): boolean {
  if (typeof navigator === "undefined") return false;
  
  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
  
  if (!connection) return false;
  
  // Consider 3G or slower as slow network
  return connection.effectiveType === "3g" || connection.effectiveType === "4g";
}

// Utility for adaptive resource loading
export function getAdaptiveSettings() {
  const isSlowNet = isSlowNetwork();
  
  return {
    perPage: isSlowNet ? 10 : 20, // Fewer verses on slow network
    timeout: isSlowNet ? 12000 : 8000, // Longer timeout on slow network
    prefetchEnabled: !isSlowNet, // Skip prefetch on slow networks
  };
}
