/**
 * Hook to detect online/offline network status
 * 
 * Best Practices:
 * - Detects navigator.onLine status
 * - Listens to online/offline events
 * - Triggers callback when status changes
 * - Cleanup on unmount
 * - Works with disabled JavaScript gracefully
 */

import { useState, useEffect, useCallback } from 'react';

interface NetworkStatusOptions {
  /**
   * Callback when network status changes
   */
  onStatusChange?: (isOnline: boolean) => void;
  
  /**
   * Poll interval in ms to double-check status (optional)
   * Useful for detecting connection loss not caught by events
   */
  pollInterval?: number;
}

interface NetworkStatus {
  /**
   * Current online status
   */
  isOnline: boolean;
  
  /**
   * True if we're initializing status on mount
   */
  isLoading: boolean;
  
  /**
   * Timestamp of last status change
   */
  lastStatusChangeAt?: number;
}

/**
 * Hook to track network connectivity status
 * 
 * Usage:
 * ```tsx
 * const { isOnline, isLoading } = useNetworkStatus({
 *   onStatusChange: (online) => {
 *     if (online) {
 *     }
 *   }
 * });
 * ```
 */
export function useNetworkStatus(
  options: NetworkStatusOptions = {}
): NetworkStatus {
  const { onStatusChange, pollInterval = 30000 } = options;
  
  // Initialize with current navigator.onLine status
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline:
      typeof window !== 'undefined' && typeof navigator !== 'undefined'
        ? navigator.onLine
        : true, // Assume online on server
    isLoading: true,
    lastStatusChangeAt: undefined,
  });

  /**
   * Handler for online/offline events
   */
  const handleOnline = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      isOnline: true,
      lastStatusChangeAt: Date.now(),
      isLoading: false,
    }));
    onStatusChange?.(true);
  }, [onStatusChange]);

  const handleOffline = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      isOnline: false,
      lastStatusChangeAt: Date.now(),
      isLoading: false,
    }));
    onStatusChange?.(false);
  }, [onStatusChange]);

  /**
   * Handler for visibility change
   * When app comes to foreground, verify network status
   */
  const handleVisibilityChange = useCallback(() => {
    if (!document.hidden) {
      
      const isCurrentlyOnline = navigator.onLine;
      setStatus(prev => {
        if (prev.isOnline !== isCurrentlyOnline) {
          const callback = isCurrentlyOnline ? onStatusChange : onStatusChange;
          callback?.(isCurrentlyOnline);
          return {
            ...prev,
            isOnline: isCurrentlyOnline,
            lastStatusChangeAt: Date.now(),
          };
        }
        return prev;
      });
    }
  }, [onStatusChange]);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Mark as loaded after first effect
    setStatus(prev => ({
      ...prev,
      isLoading: false,
    }));

    // Listen to online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Optional: Poll periodically to detect connection loss
    // (useful for detecting when WiFi drops but events don't fire)
    let pollTimeout: NodeJS.Timeout | undefined;
    
    if (pollInterval > 0) {
      const poll = () => {
        const isCurrentlyOnline = navigator.onLine;
        setStatus(prev => {
          if (prev.isOnline !== isCurrentlyOnline) {
            onStatusChange?.(isCurrentlyOnline);
            return {
              ...prev,
              isOnline: isCurrentlyOnline,
              lastStatusChangeAt: Date.now(),
            };
          }
          return prev;
        });
        
        pollTimeout = setTimeout(poll, pollInterval);
      };
      
      pollTimeout = setTimeout(poll, pollInterval);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (pollTimeout) {
        clearTimeout(pollTimeout);
      }
    };
  }, [handleOnline, handleOffline, handleVisibilityChange, pollInterval, onStatusChange]);

  return status;
}

/**
 * Simpler version that only returns boolean
 * For cases where you just need to know if online/offline
 */
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' && typeof navigator !== 'undefined'
      ? navigator.onLine
      : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
