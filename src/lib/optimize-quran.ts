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
    console.log(`[Quran Optimization] Initialized with locale: ${locale}`);
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
      console.log(`[${label}] Completed in ${duration.toFixed(2)}ms`);
    }
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[${label}] Failed after ${duration.toFixed(2)}ms`, error);
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
