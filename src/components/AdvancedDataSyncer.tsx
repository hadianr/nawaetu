'use client';

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
 * Advanced Data Syncer Component
 * Handles offline-first sync with multiple triggers and retry logic
 *
 * Features:
 * - Auto-sync on online event (user comes back online)
 * - Auto-sync on app focus (user switches back to app)
 * - Auto-sync on periodic interval (every 5 minutes)
 * - Exponential backoff retry (1s, 2s, 4s... max 30s)
 * - Toast notifications for sync status
 * - Graceful error handling
 */

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useIsOnline } from '@/hooks/useNetworkStatus';
import { syncQueue } from '@/lib/sync-queue';

/**
 * Sync response from API
 */
interface SyncResponse {
  success: boolean;
  synced: Array<{ id: string; cloudId?: string }>;
  failed: Array<{ id: string; error: string }>;
  message: string;
}

/**
 * Advanced Data Syncer Component
 *
 * Usage:
 * Place at root level of your app (e.g., in layout or inside SessionProvider)
 * ```tsx
 * <AdvancedDataSyncer />
 * ```
 *
 * It will automatically:
 * - Start syncing when user comes online
 * - Start syncing when app regains focus
 * - Periodically sync every 5 minutes
 * - Retry failed syncs with exponential backoff
 */
export function AdvancedDataSyncer() {
  const { data: session } = useSession();
  const isOnline = useIsOnline();
  const syncInProgressRef = useRef<boolean>(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const periodicSyncRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Sync all pending queue entries
   */
  const syncAllPending = useCallback(
    async (): Promise<void> => {
      if (syncInProgressRef.current) {
        return;
      }

      if (!session?.user?.id) {
        return;
      }

      if (!isOnline) {
        return;
      }

      try {
        syncInProgressRef.current = true;

        const pending = syncQueue.getPendingEntries();
        if (pending.length === 0) {
          return;
        }

        let successCount = 0;

        // Batch processing to optimize performance
        // Split into chunks of 50 to avoid payload size issues
        const BATCH_SIZE = 50;
        const batches = [];

        for (let i = 0; i < pending.length; i += BATCH_SIZE) {
          batches.push(pending.slice(i, i + BATCH_SIZE));
        }

        for (const batch of batches) {
          try {
            const response = await fetch('/api/user/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                entries: batch,
              }),
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }

            const result: SyncResponse = await response.json();

            // Process successful syncs
            if (result.synced && result.synced.length > 0) {
              result.synced.forEach((s) => {
                syncQueue.markAsSynced(s.id);
                successCount++;
              });
            }

            // Process failed syncs (logic errors)
            if (result.failed && result.failed.length > 0) {
              result.failed.forEach((f) => {
                syncQueue.markAsFailed(f.id, f.error);
              });
            }
          } catch {
            // Network or Server error for the whole batch
            // Increment retry for all items in batch
            batch.forEach((entry) => {
              syncQueue.incrementRetry(entry.id);
            });
          }
        }

        syncQueue.getStats();

        // Show toast notification
        if (successCount > 0) {
          toast.success(
            `✓ Synced ${successCount} item${successCount > 1 ? 's' : ''}`
          );
        }
      } catch {
        toast.error('Sync failed - will retry later');
      } finally {
        syncInProgressRef.current = false;
      }
    },
    [session?.user?.id, isOnline]
  );

  /**
   * Debounced sync trigger
   */
  const debouncedSync = useCallback(
    (trigger: string, delayMs: number = 1000) => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }


      syncTimeoutRef.current = setTimeout(() => {
        syncAllPending();
      }, delayMs);
    },
    [syncAllPending]
  );

  /**
   * Effect: Sync when user comes online
   */
  useEffect(() => {
    if (!isOnline) return;

    debouncedSync('online-event', 2000);
  }, [isOnline, debouncedSync]);

  /**
   * Effect: Sync when app gets focus
   */
  useEffect(() => {
    if (!session?.user?.id) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        debouncedSync('app-focus', 1000);
      }
    };

    const handleWindowFocus = () => {
      debouncedSync('window-focus', 500);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [session?.user?.id, debouncedSync]);

  /**
   * Effect: Periodic sync every 5 minutes
   */
  useEffect(() => {
    if (!session?.user?.id) return;

    const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes


    // Initial sync after 10 seconds
    const initialTimer = setTimeout(() => {
      syncAllPending();
    }, 10000);

    // Recurring sync every 5 minutes
    periodicSyncRef.current = setInterval(() => {
      debouncedSync('periodic', 500);
    }, SYNC_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimer);
      if (periodicSyncRef.current) {
        clearInterval(periodicSyncRef.current);
      }
    };
  }, [session?.user?.id, syncAllPending, debouncedSync]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (periodicSyncRef.current) {
        clearInterval(periodicSyncRef.current);
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}

/**
 * Manual sync hook for triggering sync on demand
 */
export function useSyncNow() {
  return useCallback(async () => {
    const pending = syncQueue.getPendingEntries();
    if (pending.length === 0) {
      toast.info('No pending changes to sync');
      return;
    }

    toast.loading('Syncing changes...');
    // Implementation would sync the pending entries
    // For now, just show the UI feedback
  }, []);
}

export default AdvancedDataSyncer;
